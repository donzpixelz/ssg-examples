#!/usr/bin/env bash
set -Eeuo pipefail
# Inputs via env: AWS_REGION, REMOTE_DIR, ARTIFACT_URL, INSTANCE_ID, MARKER
: "${AWS_REGION:?}"; : "${REMOTE_DIR:?}"; : "${ARTIFACT_URL:?}"; : "${INSTANCE_ID:?}"; : "${MARKER:?}"

echo "=== diag-remote.sh @ $(date -u) ==="
echo "Region=$AWS_REGION"
echo "RemoteDir=$REMOTE_DIR"
echo "InstanceId=$INSTANCE_ID"
echo "Marker=$MARKER"

# Build remote script
cat > run.sh <<'EOS_REMOTE'
set -Eeuo pipefail
LOG="/tmp/ssg-diag.log"
exec > >(tee -a "$LOG") 2>&1
echo "=== FORCE REDEPLOY + DIAG @ $(date -u) ==="
PRESIGNED="__PRESIGNED__"
REMOTE_DIR="__REMOTE_DIR__"
MARKER="__MARKER__"

# 0) Free port 80 from other servers (best-effort)
if systemctl is-active --quiet httpd; then
  echo "[diag] stopping httpd"; sudo systemctl stop httpd || true
fi
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"
  [ -n "$CIDS" ] && { echo "[diag] stopping docker on :80: $CIDS"; sudo docker stop $CIDS || true; }
fi

# 1) Ensure nginx
if ! command -v nginx >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then sudo yum -y install nginx >/dev/null
  elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install nginx >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y nginx >/dev/null
  fi
fi
sudo mkdir -p "$REMOTE_DIR" /etc/nginx/conf.d

# 2) Write authoritative default server
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

# 3) Tools for fetch/sync
for pkg in curl tar rsync sha256sum; do
  if ! command -v "$pkg" >/dev/null 2>&1; then
    if command -v yum >/dev/null 2>&1; then sudo yum -y install "$pkg" >/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install "$pkg" >/dev/null || true
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y "$pkg" >/dev/null || true
    fi
  fi
done

# 4) Download artifact and sync
TMP="/tmp/site.tgz"; echo "[diag] fetching artifact: $PRESIGNED"
curl -fsSL "$PRESIGNED" -o "$TMP"
STAGE="$(mktemp -d)"; tar -xzf "$TMP" -C "$STAGE"

# Force distinct marker at top of index.html (so curl shows it)
if [ -f "$STAGE/index.html" ]; then
  printf "<!-- %s -->\n" "$MARKER" | cat - "$STAGE/index.html" > "$STAGE/.ix.tmp" && mv "$STAGE/.ix.tmp" "$STAGE/index.html"
fi

# Sync into REMOTE_DIR
if command -v rsync >/dev/null 2>&1; then
  sudo rsync -a --delete "$STAGE"/ "$REMOTE_DIR"/
else
  sudo rm -rf "$REMOTE_DIR"/*; sudo cp -a "$STAGE"/. "$REMOTE_DIR"/
fi
if id nginx >/dev/null 2>&1; then sudo chown -R nginx:nginx "$REMOTE_DIR" || true; fi

# 5) Validate & restart Nginx
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

# 6) DIAGNOSTICS
echo "----- NGINX -T (active config) -----"
sudo nginx -T 2>&1 | sed -n '1,200p'
echo "----- effective server roots (grep 'root ') -----"
sudo nginx -T 2>&1 | sed -n '1,400p' | awk '/server\s*{/,/}/' | grep -E "root\s" || true

echo "----- ls of REMOTE_DIR -----"
ls -la "$REMOTE_DIR" | sed -n '1,120p'

echo "----- index.html HEAD (REMOTE_DIR) -----"
[ -f "$REMOTE_DIR/index.html" ] && head -n 12 "$REMOTE_DIR/index.html" || echo "(missing index.html)"

echo "----- curl localhost (what Nginx serves) -----"
curl -fsS -H 'Cache-Control: no-cache' -i http://127.0.0.1/ | sed -n '1,40p'

echo "----- SHA256 compare (file vs served body) -----"
if [ -f "$REMOTE_DIR/index.html" ]; then
  FILE_HASH="$(sha256sum "$REMOTE_DIR/index.html" 2>/dev/null | awk "{print \$1}")"
  BODY_HASH="$(curl -fsS http://127.0.0.1/ | sha256sum 2>/dev/null | awk "{print \$1}")"
  echo "FILE_HASH=$FILE_HASH"
  echo "BODY_HASH=$BODY_HASH"
fi

# 7) Cleanup
sudo rm -rf "$STAGE" "$TMP"
echo "=== Done diag ==="
EOS_REMOTE

# Fill placeholders
safe_url=$(printf '%s' "$ARTIFACT_URL" | sed -e 's/[\/&]/\\&/g')
sed -i "s|__PRESIGNED__|$safe_url|g" run.sh
sed -i "s|__REMOTE_DIR__|$REMOTE_DIR|g" run.sh
sed -i "s|__MARKER__|$MARKER|g" run.sh

# Base64 and send to SSM
if base64 --version >/dev/null 2>&1; then
  B64=$(base64 -w 0 < run.sh 2>/dev/null || base64 < run.sh)
else
  B64=$(python3 - <<'PY'
import base64,sys
sys.stdout.write(base64.b64encode(open("run.sh","rb").read()).decode())
PY
)
fi
CMD_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "$INSTANCE_ID" \
  --parameters commands="echo $B64 | base64 -d | sudo bash -s",executionTimeout="900",workingDirectory="/home/ec2-user" \
  --query "Command.CommandId" --output text)
echo "[diag] SSM CommandId: $CMD_ID"

# Poll
for i in $(seq 1 40); do
  STATUS="$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query Status --output text || true)"
  echo "[diag] SSM status: $STATUS"
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
