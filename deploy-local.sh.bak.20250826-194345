#!/bin/bash
# Deploy ./app to EC2:/usr/share/nginx/html via SSH (safe; idempotent)
set -e

SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"
REMOTE_ROOT="/usr/share/nginx/html"
REMOTE_TGZ="/home/ec2-user/site.tgz"

[ -f ./app/index.html ] || { echo "❌ ./app/index.html not found"; exit 1; }

echo "📦 Packaging ./app → site.tgz"
tar -C ./app -czf site.tgz .

echo "🔐 Uploading to EC2 (home folder)…"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no site.tgz ec2-user@"$EC2_IP":"$(basename "$REMOTE_TGZ")"

echo "🚀 Installing/starting Nginx (if needed) and deploying…"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -e
ROOT="/usr/share/nginx/html"
PKG="/home/ec2-user/site.tgz"

# Ensure nginx installed (Amazon Linux 2 path included)
if ! sudo /usr/sbin/nginx -v >/dev/null 2>&1 && ! sudo nginx -v >/dev/null 2>&1; then
  . /etc/os-release 2>/dev/null || true
  if [ "${ID:-}" = "amzn" ] && [ "${VERSION_ID:-}" = "2" ]; then
    command -v amazon-linux-extras >/dev/null 2>&1 && sudo amazon-linux-extras enable nginx1 >/dev/null 2>&1 || true
    sudo yum clean metadata -y >/dev/null 2>&1 || true
    sudo yum install -y nginx >/dev/null
  else
    if command -v dnf >/dev/null 2>&1; then sudo dnf install -y nginx >/dev/null
    elif command -v yum >/dev/null 2>&1; then sudo yum install -y nginx >/dev/null
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y nginx >/dev/null
    fi
  fi
fi

# Single, clean default vhost
sudo mkdir -p /etc/nginx/conf.d "$ROOT"
sudo tee /etc/nginx/conf.d/default.conf >/dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root $ROOT;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
}
NGINX

# Free :80 best-effort
systemctl is-active --quiet httpd && sudo systemctl stop httpd || true
if command -v docker >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --filter 'publish=80' -q || true)"; [ -n "$CIDS" ] && sudo docker stop $CIDS || true
fi

# Deploy
sudo rm -rf "$ROOT"/*
sudo tar -xzf "$PKG" -C "$ROOT"
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "$ROOT" || true
sudo find "$ROOT" -type d -exec chmod 755 {} \; || true
sudo find "$ROOT" -type f -exec chmod 644 {} \; || true

# Start/restart nginx
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx

# Proof (no pipes that can SIGPIPE)
echo "--- LIST $ROOT ---"; ls -la "$ROOT" | sed -n '1,40p' || true
OUT="/tmp/curl_localhost.html"
curl -fsS -H "Cache-Control: no-cache" http://127.0.0.1/ -o "$OUT" || true
echo "--- CURL localhost (first 20 lines) ---"; sed -n '1,20p' "$OUT" || true
SSH

echo "✅ Done. Open:  http://$EC2_IP/?buster=$(date +%s)"
