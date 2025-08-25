#!/usr/bin/env bash
# Runs on the EC2 via SSM. Expects env: AWS_REGION, INSTANCE_ID, ARTIFACT_URL, REMOTE_ROOT
set -Eeuo pipefail
: "${AWS_REGION:?}"; : "${INSTANCE_ID:?}"; : "${ARTIFACT_URL:?}"
REMOTE_ROOT="${REMOTE_ROOT:-/usr/share/nginx/html}"

echo "=== remote deploy start ==="
echo "Region=$AWS_REGION"
echo "Instance=$INSTANCE_ID"
echo "RemoteRoot=$REMOTE_ROOT"

cat > run.sh <<'EOS'
set -Eeuo pipefail
REMOTE_ROOT="__REMOTE_ROOT__"
ARTIFACT_URL="__ARTIFACT_URL__"

# Ensure tools
for p in curl tar; do
  command -v "$p" >/dev/null 2>&1 || {
    if command -v yum >/dev/null 2>&1; then sudo yum -y install "$p" >/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install "$p" >/dev/null || true
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y "$p" >/dev/null || true
    fi
  }
done

# Free :80 best-effort
systemctl is-active --quiet httpd && sudo systemctl stop httpd || true
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"; [ -n "$CIDS" ] && sudo docker stop $CIDS || true
fi

# Single default vhost (avoid duplicate default_server)
sudo mkdir -p /etc/nginx/conf.d "$REMOTE_ROOT"
sudo tee /etc/nginx/conf.d/default.conf >/dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root $REMOTE_ROOT;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
}
NGINX

# Get artifact and deploy
TMP="/tmp/site.tgz"
curl -fsSL "$ARTIFACT_URL" -o "$TMP"
sudo rm -rf "$REMOTE_ROOT"/*
sudo tar -xzf "$TMP" -C "$REMOTE_ROOT"

# Permissions
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "$REMOTE_ROOT" || true
sudo find "$REMOTE_ROOT" -type d -exec chmod 755 {} \; || true
sudo find "$REMOTE_ROOT" -type f -exec chmod 644 {} \; || true

# Reload nginx
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

# --- Proof (SIGPIPE-safe) ---
set +o pipefail  # don't fail if a reader (like awk NR<=20) stops early
safe_head() { awk 'NR<=20'; }

echo "--- LIST $REMOTE_ROOT ---"
ls -la "$REMOTE_ROOT" | safe_head || true

echo "--- CURL localhost ---"
curl -fsS -H "Cache-Control: no-cache" http://127.0.0.1/ | safe_head || true

echo "=== remote deploy done ==="
EOS

# Fill placeholders
safe_url=$(printf '%s' "$ARTIFACT_URL" | sed -e 's/[\/&]/\\&/g')
sed -i "s|__ARTIFACT_URL__|$safe_url|g" run.sh
sed -i "s|__REMOTE_ROOT__|$REMOTE_ROOT|g" run.sh

# Send via SSM
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
echo "SSM CommandId: $CMD_ID"

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
