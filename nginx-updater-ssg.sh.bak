#!/usr/bin/env bash
# nginx-updater-ssg.sh — safely update nginx default server with /jekyll, /hugo, /eleventy, /astro
# Run on EC2 (via SSH or SSM). Requires sudo/root. Returns to prompt.

set -euo pipefixe
# Fix a typo if pipefixe is not recognized; fallback:
set +e
set -euo pipefail

need_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Re-executing with sudo..."
    exec sudo -E bash "$0" "$@"
  fi
}
need_root "$@"

CONF_DIR="/etc/nginx/conf.d"
CONF_FILE="${CONF_DIR}/default.conf"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="${CONF_FILE}.bak-${STAMP}"
NEW="${CONF_FILE}.new"

[ -d "$CONF_DIR" ] || { echo "Missing ${CONF_DIR}"; exit 1; }

if [ -f "$CONF_FILE" ]; then
  cp -a "$CONF_FILE" "$BACKUP"
  echo "Backup: $BACKUP"
fi

cat > "$NEW" <<'CONF'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Root site from ./app
  location / {
    try_files $uri $uri/ =404;
  }

  # Explicit SSG subpaths
  location ^~ /jekyll/ {
    try_files $uri $uri/ =404;
  }
  location ^~ /hugo/ {
    try_files $uri $uri/ =404;
  }
  location ^~ /eleventy/ {
    try_files $uri $uri/ =404;
  }
  location ^~ /astro/ {
    try_files $uri $uri/ =404;
  }

  # If you already have 99-no-cache.conf, keep it included separately.
  # include /etc/nginx/conf.d/99-no-cache.conf;
}
CONF

mv -f "$NEW" "$CONF_FILE"

echo "Validating nginx config..."
if nginx -t; then
  echo "Reloading nginx..."
  systemctl reload nginx || nginx -s reload || true
  echo "✅ nginx updated and reloaded."
else
  echo "❌ nginx -t failed; restoring backup..."
  [ -f "$BACKUP" ] && mv -f "$BACKUP" "$CONF_FILE"
  nginx -t || true
  exit 1
fi

echo "Done."
