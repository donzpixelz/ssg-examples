#!/usr/bin/env bash
set -euo pipefail

# ---- Config ----
PROJECT="ssg-examples"
KEY_PATH="$HOME/.ssh/ssg-examples-key.pem"   # private key you created in us-east-2
HOST_USER="ec2-user"                         # change to 'ubuntu' if your AMI uses that
WEB_ROOT="/opt/${PROJECT}/app"
CONF_DIR="/opt/${PROJECT}/nginx"
CONTAINER="${PROJECT}"

# ---- 1) Commit & push project changes (content + nginx + workflows) ----
echo "📦 Committing code changes..."
git add app/** nginx/*.conf .github/workflows/*.yml || true
git commit -m "Deploy: update site content & confs" || echo "No changes to commit"
git push origin main

# ---- 2) Get public host from Terraform outputs ----
echo "🔎 Reading Terraform outputs..."
pushd terraform >/dev/null
HOST="$(terraform output -raw public_dns 2>/dev/null || terraform output -raw public_ip)"
popd >/dev/null
if [[ -z "${HOST}" ]]; then
  echo "❌ Could not read 'public_dns' or 'public_ip' from terraform outputs."
  exit 1
fi
echo "✅ Target host: ${HOST}"

# ---- 3) Prepare server: ensure Docker + create dirs ----
echo "🧰 Preparing server (Docker + directories)..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$HOST_USER@$HOST" bash -s <<'EOSSH'
set -euxo pipefail
WEB_ROOT="/opt/ssg-examples/app"
CONF_DIR="/opt/ssg-examples/nginx"

# ensure docker
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
sudo systemctl start docker || sudo service docker start || true

sudo mkdir -p "$WEB_ROOT" "$CONF_DIR"
sudo chown -R "$USER:$USER" /opt/ssg-examples
EOSSH

# ---- 4) Upload nginx configs ----
echo "📤 Uploading nginx configs..."
scp -o StrictHostKeyChecking=no -i "$KEY_PATH" nginx/99-no-cache.conf "$HOST_USER@$HOST:$CONF_DIR/99-no-cache.conf"
scp -o StrictHostKeyChecking=no -i "$KEY_PATH" nginx/default.conf      "$HOST_USER@$HOST:$CONF_DIR/default.conf"

# ---- 5) Upload app content (flatten into WEB_ROOT) ----
echo "📤 Uploading app/ content..."
# If app/ is empty, scp -r app/* fails; '|| true' avoids breaking the script.
scp -o StrictHostKeyChecking=no -i "$KEY_PATH" -r app/* "$HOST_USER@$HOST:$WEB_ROOT/" || true

# ---- 6) Recreate Nginx container with both conf mounts ----
echo "🔄 Recreating nginx container..."
ssh -o StrictHostKeyChecking=no -i "$KEY_PATH" "$HOST_USER@$HOST" bash -s <<'EOSSH'
set -euxo pipefail
WEB_ROOT="/opt/ssg-examples/app"
CONF_DIR="/opt/ssg-examples/nginx"
CONTAINER="ssg-examples"

sudo docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
sudo docker run -d --name "$CONTAINER" \
  -p 80:80 \
  -v "$WEB_ROOT":/usr/share/nginx/html:ro \
  -v "$CONF_DIR/99-no-cache.conf":/etc/nginx/conf.d/99-no-cache.conf:ro \
  -v "$CONF_DIR/default.conf":/etc/nginx/conf.d/default.conf:ro \
  --restart unless-stopped \
  nginx:alpine

# quick sanity check
sleep 2
sudo docker exec "$CONTAINER" nginx -t
EOSSH

echo "✅ Deploy complete! Visit: http://${HOST}/"
