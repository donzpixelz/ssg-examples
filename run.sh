#!/usr/bin/env bash
# File: run.sh — deterministic deploy to /usr/share/nginx/html (no fragile pipes)

set -euo pipefail
trap '' PIPE

DOCROOT="/usr/share/nginx/html"
CONF="/etc/nginx/conf.d/ssg-examples.conf"
ART_URL="${1:-${ART_URL:-}}"
[ -n "$ART_URL" ] || { echo "❌ Missing artifact URL."; exit 2; }

WORK="$(mktemp -d /tmp/site_deploy.XXXXXX)"
ARCHIVE="$WORK/app.tgz"
STAGE="$WORK/stage"
mkdir -p "$STAGE"

echo "[1/7] Download"
curl -fsSL --retry 3 --retry-delay 2 -o "$ARCHIVE" "$ART_URL"
echo "Size: $(wc -c <"$ARCHIVE" | tr -d '[:space:]') bytes"

echo "[2/7] Validate & unpack"
tar -tzf "$ARCHIVE" >/dev/null 2>&1 || { echo "❌ Bad .tgz"; exit 3; }
tar -xzf "$ARCHIVE" -C "$STAGE"

# Choose content root (dir that contains index.html)
ROOT_CANDIDATE=""
for d in "$STAGE" "$STAGE"/*; do
  [ -f "$d/index.html" ] && { ROOT_CANDIDATE="$d"; break; }
done
[ -n "$ROOT_CANDIDATE" ] || { echo "❌ index.html not found"; exit 4; }

echo "[3/7] Ensure nginx + pin config"
if ! command -v nginx >/dev/null 2>&1; then
  if command -v dnf >/dev/null 2>&1; then dnf -y install nginx; else yum -y install nginx; fi
fi
mkdir -p /etc/nginx/conf.d
# Disable default to avoid duplicate default_server
[ -f /etc/nginx/conf.d/default.conf ] && mv -f /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak || true
# SINGLE-QUOTED heredoc keeps $uri literal
cat >"$CONF" <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        expires -1;
    }
}
NGINX
nginx -t

echo "[4/7] Deploy to $DOCROOT"
mkdir -p "$DOCROOT"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$ROOT_CANDIDATE"/ "$DOCROOT"/
else
  find "$DOCROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "$ROOT_CANDIDATE"/. "$DOCROOT"/
fi
chmod -R a+rX "$DOCROOT"

echo "[5/7] Restart nginx"
if command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload || true
  systemctl enable nginx || true
  systemctl restart nginx
else
  service nginx restart || service nginx start
fi

echo "[6/7] Verify curl localhost"
curl -fsS --max-time 5 http://127.0.0.1/ >/dev/null || { echo "❌ nginx did not serve index"; exit 8; }

echo "[7/7] Done"
echo "✅ Deployed to $DOCROOT"
