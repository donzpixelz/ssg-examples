#!/usr/bin/env bash
# Runs on the Actions runner; sends a script to the EC2 via SSM.
# Requires env: AWS_REGION, INSTANCE_ID, ARTIFACT_URL
set -Eeuo pipefail
: "${AWS_REGION:?}"; : "${INSTANCE_ID:?}"; : "${ARTIFACT_URL:?}"
REMOTE_ROOT="${REMOTE_ROOT:-/usr/share/nginx/html}"

echo "[1/9] Ensure base tools"
command -v aws >/dev/null || { echo "aws cli missing"; exit 1; }

echo "[2/9] Download artifact"
TMP="$(mktemp)"
curl -fsSL --retry 3 --connect-timeout 10 "$ARTIFACT_URL" -o "$TMP"
echo "Download size: $(wc -c < "$TMP") bytes"

echo "[3/9] Validate archive"
tar -tzf "$TMP" >/dev/null

echo "[4/9] Unpack to staging"
STAGE="$(mktemp -d)"
tar -xzf "$TMP" -C "$STAGE"
echo "Staged files:"
( cd "$STAGE" && find . -maxdepth 2 -type f | sort )

echo "[5/9] Detect nginx docroot (if nginx installed)"
# (docroot is controlled by REMOTE_ROOT; keep message for visibility)

# Build the script that runs on the instance via SSM.
cat > run.sh <<'EOS'
#!/usr/bin/env bash
set -Eeuo pipefail
trap '' PIPE  # ignore SIGPIPE if any producer writes to a closed reader
set +o pipefail

REMOTE_ROOT="__REMOTE_ROOT__"

echo "[A/6] Prepare nginx default vhost"
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

echo "[B/6] Stop other servers on :80 (best-effort)"
systemctl is-active --quiet httpd && sudo systemctl stop httpd || true
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"; [ -n "$CIDS" ] && sudo docker stop $CIDS || true
fi

echo "[C/6] Deploy files atomically"
PKG="/tmp/site.tgz"
STAGE="$(mktemp -d)"
# The package will be provided via SSM stdin below; we just untar it here.
cat > "$PKG"
tar -xzf "$PKG" -C "$STAGE"
# Flatten if a single top-level dir
if [ "$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')" = "1" ] && [ ! -f "$STAGE/index.html" ]; then
  INNER="$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | head -n1)"
  STAGE="$INNER"
fi
sudo rm -rf "$REMOTE_ROOT"/*
sudo cp -a "$STAGE"/. "$REMOTE_ROOT"/

echo "[D/6] Permissions"
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "$REMOTE_ROOT" || true
sudo find "$REMOTE_ROOT" -type d -exec chmod 755 {} \; || true
sudo find "$REMOTE_ROOT" -type f -exec chmod 644 {} \; || true

echo "[E/6] Reload nginx"
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

echo "[F/6] Proof (no pipes -> no SIGPIPE)"
OUT="/tmp/curl_localhost.html"
curl -fsS -H "Cache-Control: no-cache" --max-time 10 http://127.0.0.1/ -o "$OUT" || true
echo "--- LIST $REMOTE_ROOT ---"
ls -la "$REMOTE_ROOT" | sed -n '1,40p' || true
echo "--- CURL localhost (first 20 lines) ---"
sed -n '1,20p' "$OUT" || true
echo "=== done ==="
EOS

# Fill placeholder
sed -i "s|__REMOTE_ROOT__|$REMOTE_ROOT|g" run.sh

echo "[6/9] Send script via SSM"
# We will stream the tarball into the remote script's stdin to avoid temporary URLs again.
# First, base64-encode run.sh so we can reconstruct it on the instance and run it with stdin.
if base64 --version >/dev/null 2>&1; then
  B64=$(base64 -w 0 < run.sh 2>/dev/null || base64 < run.sh)
else
  B64=$(python3 - <<'PY'
import base64,sys
sys.stdout.write(base64.b64encode(open("run.sh","rb").read()).decode())
PY
)
fi

# Create an SSM doc to run a shell that reconstructs run.sh and then reads the tar from stdin
read -r -d '' CMD <<'SSMCMD'
cat > /tmp/run.sh.b64 <<'B64'
__B64__
B64
base64 -d /tmp/run.sh.b64 > /tmp/run.sh
chmod +x /tmp/run.sh
# Now run it, feeding the tarball from stdin we upload below:
cat /tmp/site.tgz | /tmp/run.sh
SSMCMD
CMD_PAYLOAD="${CMD/__B64__/$B64}"

# We need the tarball on the instance as /tmp/site.tgz before executing the script.
# Use SSM to write the tarball by base64 chunking to avoid SIGPIPE entirely.
echo "[7/9] Upload package to instance via SSM (base64 chunks)"
PKG_B64=$(base64 < "$TMP")
aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "$INSTANCE_ID" \
  --parameters commands="cat > /tmp/site.tgz.b64 << 'EOF'
$PKG_B64
EOF
base64 -d /tmp/site.tgz.b64 > /tmp/site.tgz && rm /tmp/site.tgz.b64" \
  --query "Command.CommandId" --output text >/dev/null

echo "[8/9] Execute remote deploy"
CMD_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids "$INSTANCE_ID" \
  --parameters commands="$CMD_PAYLOAD" \
  --query "Command.CommandId" --output text)
echo "SSM CommandId: $CMD_ID"

# Poll to completion and print logs (no head | …)
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

echo "[9/9] Done"
