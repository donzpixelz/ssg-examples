#!/usr/bin/env bash
# Runs on the Actions runner; sends a small script to the EC2 via SSM where it
# downloads the artifact from ARTIFACT_URL and deploys to REMOTE_ROOT.
set -Eeuo pipefail
: "${AWS_REGION:?}"; : "${INSTANCE_ID:?}"; : "${ARTIFACT_URL:?}"
REMOTE_ROOT="${REMOTE_ROOT:-/usr/share/nginx/html}"

echo "[1/6] Prepare remote script"
cat > run.sh <<'EOS'
#!/usr/bin/env bash
set -Eeuo pipefail
trap '' PIPE
set +o pipefail

REMOTE_ROOT="__REMOTE_ROOT__"
ARTIFACT_URL="__ARTIFACT_URL__"

echo "[A/5] Ensure tools"
for p in curl tar; do
  command -v "$p" >/dev/null 2>&1 || {
    if command -v yum >/dev/null 2>&1; then sudo yum -y install "$p" >/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install "$p" >/dev/null || true
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y "$p" >/dev/null || true
    fi
  }
done

echo "[B/5] Single default vhost -> $REMOTE_ROOT"
sudo mkdir -p /etc/nginx/conf.d "$REMOTE_ROOT"
sudo tee /etc/nginx/conf.d/default.conf >/dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root $REMOTE_ROOT;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
}
NGINX

echo "[C/5] Stop other servers on :80 (best-effort)"
systemctl is-active --quiet httpd && sudo systemctl stop httpd || true
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"; [ -n "$CIDS" ] && sudo docker stop $CIDS || true
fi

echo "[D/5] Download & deploy artifact"
TMP="/tmp/site.tgz"
curl -fsSL --retry 3 --connect-timeout 10 "$ARTIFACT_URL" -o "$TMP"
STAGE="$(mktemp -d)"
tar -xzf "$TMP" -C "$STAGE"
# Flatten if needed
if [ "$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')" = "1" ] && [ ! -f "$STAGE/index.html" ]; then
  INNER="$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | head -n1)"
  STAGE="$INNER"
fi
sudo rm -rf "$REMOTE_ROOT"/*
sudo cp -a "$STAGE"/. "$REMOTE_ROOT"/
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "$REMOTE_ROOT" || true
sudo find "$REMOTE_ROOT" -type d -exec chmod 755 {} \; || true
sudo find "$REMOTE_ROOT" -type f -exec chmod 644 {} \; || true

echo "[E/5] Reload nginx + proof (SIGPIPE-safe)"
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx
OUT="/tmp/curl_localhost.html"
curl -fsS -H "Cache-Control: no-cache" --max-time 10 http://127.0.0.1/ -o "$OUT" || true
echo "--- LIST $REMOTE_ROOT ---"; ls -la "$REMOTE_ROOT" | sed -n '1,40p' || true
echo "--- CURL localhost (first 20 lines) ---"; sed -n '1,20p' "$OUT" || true
echo "=== done ==="
EOS

# Fill placeholders safely
safe_url=$(printf '%s' "$ARTIFACT_URL" | sed -e 's/[\/&]/\\&/g')
sed -i "s|__ARTIFACT_URL__|$safe_url|g" run.sh
sed -i "s|__REMOTE_ROOT__|$REMOTE_ROOT|g" run.sh

echo "[2/6] Base64 the remote script"
if base64 --version >/dev/null 2>&1; then
  B64=$(base64 -w 0 < run.sh 2>/dev/null || base64 < run.sh)
else
  B64=$(python3 - <<'PY'
import base64,sys
sys.stdout.write(base64.b64encode(open("run.sh","rb").read()).decode())
PY
)
fi

echo "[3/6] Send via SSM (small payload)"
CMD_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "$INSTANCE_ID" \
  --parameters commands="echo $B64 | base64 -d | sudo bash -s",executionTimeout="900",workingDirectory="/home/ec2-user" \
  --query "Command.CommandId" --output text)
echo "SSM CommandId: $CMD_ID"

echo "[4/6] Poll to completion"
for i in $(seq 1 40); do
  STATUS="$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query Status --output text || true)"
  echo "SSM status: $STATUS"
  case "$STATUS" in
    Success)
      echo "=== STDOUT (success) ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      break ;;
    Failed|Cancelled|TimedOut)
      echo "=== STDOUT ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      echo "=== STDERR ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text || true
      exit 1 ;;
    *) sleep 5 ;;
  esac
done

echo "[5/6] Done"
echo "[6/6] Helpful: artifact url length $(( ${#ARTIFACT_URL} ))"
