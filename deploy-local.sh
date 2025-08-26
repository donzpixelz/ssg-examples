#!/bin/bash
# Deploy ./app to EC2:/usr/share/nginx/html via SSH (no writes to /tmp from scp)
set -euo pipefail

SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"
REMOTE_ROOT="/usr/share/nginx/html"
REMOTE_HOME_TGZ="site.tgz"          # goes to ~ec2-user/site.tgz
REMOTE_TGZ="/home/ec2-user/site.tgz" # absolute path

echo "📦 Packaging ./app → site.tgz"
tar -C ./app -czf site.tgz .

echo "🔐 Uploading to EC2 (home folder)…"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no site.tgz ec2-user@"$EC2_IP":"$REMOTE_HOME_TGZ"

echo "🚀 Deploying on server…"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" "bash -se" <<SSH
set -e
ROOT="$REMOTE_ROOT"
PKG="$REMOTE_TGZ"

# ensure nginx is up
if ! command -v nginx >/dev/null 2>&1; then
  echo "❌ nginx not installed"; exit 1
fi

# single default vhost (idempotent)
sudo mkdir -p /etc/nginx/conf.d "\$ROOT"
sudo tee /etc/nginx/conf.d/default.conf >/dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root \$ROOT;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
}
NGINX

# unpack
sudo rm -rf "\$ROOT"/*
sudo tar -xzf "\$PKG" -C "\$ROOT"
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "\$ROOT" || true
sudo find "\$ROOT" -type d -exec chmod 755 {} \; || true
sudo find "\$ROOT" -type f -exec chmod 644 {} \; || true

sudo nginx -t
sudo systemctl restart nginx

echo "---- FILES ----"
ls -la "\$ROOT" | head -n 20
echo "---- CURL localhost ----"
curl -fsS http://127.0.0.1/ | head -n 20 || true
SSH

echo "✅ Done. Open:  http://$EC2_IP/?buster=\$(date +%s)"
