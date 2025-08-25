#!/usr/bin/env bash
set -Eeuo pipefail

# Inputs via environment:
#  AWS_REGION, REMOTE_DIR, ARTIFACT_URL, INSTANCE_ID
: "${AWS_REGION:?}"; : "${REMOTE_DIR:?}"; : "${ARTIFACT_URL:?}"; : "${INSTANCE_ID:?}"

echo "=== deploy-remote.sh starting @ $(date -u) ==="
echo "Region=$AWS_REGION"
echo "RemoteDir=$REMOTE_DIR"
echo "InstanceId=$INSTANCE_ID"

# Build the remote script file
cat > run.sh <<'EOS_REMOTE'
set -Eeuo pipefail
LOG="/tmp/ssg-deploy.log"
exec > >(tee -a "$LOG") 2>&1
echo "=== ssg-examples authoritative nginx deploy ==="; date -u

PRESIGNED="__PRESIGNED__"
REMOTE_DIR="__REMOTE_DIR__"

# 1) Free port 80
if systemctl is-active --quiet httpd; then
  echo "Stopping httpd…"; sudo systemctl stop httpd || true
fi
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"
  [ -n "$CIDS" ] && { echo "Stopping containers on :80: $CIDS"; sudo docker stop $CIDS || true; }
fi

# 2) Install nginx
if ! command -v nginx >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then sudo yum -y install nginx >/dev/null
  elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install nginx >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y nginx >/dev/null
  fi
fi
sudo mkdir -p "$REMOTE_DIR" /etc/nginx/conf.d

# 3) Nginx default site
cat >/tmp/ssg-examples.conf <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root __REMOTE_DIR__;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
NGINX
sudo mv /tmp/ssg-examples.conf /etc/nginx/conf.d/ssg-examples.conf
[ -f /etc/nginx/conf.d/default.conf ] && sudo rm -f /etc/nginx/conf.d/default.conf || true
sudo sed -i "s|__REMOTE_DIR__|$REMOTE_DIR|g" /etc/nginx/conf.d/ssg-examples.conf

# 4) Get and unpack artifact
for pkg in curl tar rsync; do
  if ! command -v "$pkg" >/dev/null 2>&1; then
    if command -v yum >/dev/null 2>&1; then sudo yum -y install "$pkg" >/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install "$pkg" >/dev/null || true
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y "$pkg" >/dev/null || true
    fi
  fi
done

TMP="/tmp/site.tgz"; curl -fsSL "$PRESIGNED" -o "$TMP"
STAGE="$(mktemp -d)"; tar -xzf "$TMP" -C "$STAGE"
if command -v rsync >/dev/null 2>&1; then
  sudo rsync -a --delete "$STAGE"/ "$REMOTE_DIR"/
else
  sudo rm -rf "$REMOTE_DIR"/*; sudo cp -a "$STAGE"/. "$REMOTE_DIR"/
fi

# 5) Permissions + restart
if id nginx >/dev/null 2>&1; then sudo chown -R nginx:nginx "$REMOTE_DIR" || true; fi
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

# 6) Proof
echo "--- Deployed to $REMOTE_DIR ---"
ls -l "$REMOTE_DIR" | head -n 20 || true
[ -f "$REMOTE_DIR/index.html" ] && { echo "index.html head:"; head -n 10 "$REMOTE_DIR/index.html" || true; }
echo "--- curl localhost ---"
curl -fsS -H 'Cache-Control: no-cache' http://127.0.0.1/ | head -n 20 || true

sudo rm -rf "$STAGE" "$TMP"
echo "Done."
EOS_REMOTE

# Fill placeholders
safe_url=$(printf '%s' "$ARTIFACT_URL" | sed -e 's/[\/&]/\\&/g')
sed -i "s|__PRESIGNED__|$safe_url|g" run.sh
sed -i "s|__REMOTE_DIR__|$REMOTE_DIR|g" run.sh

# Base64 the script (portable)
if base64 --version >/dev/null 2>&1; then
  B64=$(base64 -w 0 < run.sh 2>/dev/null || base64 < run.sh)
else
  B64=$(python3 - <<'PY'
import base64,sys
sys.stdout.write(base64.b64encode(open("run.sh","rb").read()).decode())
PY
)
fi

# Send via SSM
CMD_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "$INSTANCE_ID" \
  --parameters commands="echo $B64 | base64 -d | sudo bash -s",executionTimeout="900",workingDirectory="/home/ec2-user" \
  --query "Command.CommandId" --output text)
echo "SSM CommandId: $CMD_ID"

# Poll
for i in $(seq 1 40); do
  STATUS="$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query Status --output text || true)"
  echo "SSM status: $STATUS"
  case "$STATUS" in
    Success)
      echo "=== STDOUT (success) ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      exit 0 ;;
    Failed|Cancelled|TimedOut)
      echo "=== STDOUT ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      echo "=== STDERR ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text || true
      exit 1 ;;
    *) sleep 5 ;;
  esac
done

echo "SSM command did not finish in time"; exit 1
