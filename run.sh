#!/usr/bin/env bash
set -euo pipefail
trap '' PIPE

ART_URL="${1:-${ART_URL:-}}"
[ -n "$ART_URL" ] || { echo "❌ Missing artifact URL"; exit 2; }

WORK="$(mktemp -d /tmp/site_deploy.XXXXXX)"
ARCHIVE="$WORK/site.tgz"
STAGE="$WORK/stage"
mkdir -p "$STAGE"

DOCROOT="/usr/share/nginx/html"

echo "[1/6] Download"
curl -fsSL --retry 3 --retry-delay 2 -o "$ARCHIVE" "$ART_URL"

echo "[2/6] Validate & unpack"
tar -tzf "$ARCHIVE" >/dev/null 2>&1 || { echo "❌ Bad .tgz"; exit 3; }
tar -xzf "$ARCHIVE" -C "$STAGE"

APP_SRC=""
if [ -d "$STAGE/app" ]; then
  APP_SRC="$STAGE/app"
elif [ -f "$STAGE/index.html" ]; then
  APP_SRC="$STAGE"
else
  echo "❌ No app/ or index.html found in archive"; exit 4
fi

echo "[3/6] Ensure nginx installed"
if ! command -v nginx >/dev/null 2>&1; then
  if command -v dnf >/dev/null 2>&1; then dnf -y install nginx; else yum -y install nginx; fi
fi
mkdir -p /etc/nginx/conf.d

echo "[4/6] Deploy site -> $DOCROOT"
mkdir -p "$DOCROOT"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$APP_SRC"/ "$DOCROOT"/
else
  find "$DOCROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "$APP_SRC"/. "$DOCROOT"/
fi
chmod -R a+rX "$DOCROOT"

echo "[5/6] Apply nginx/*.conf if present (with backups), then validate"
APPLIED=0
if [ -d "$STAGE/nginx" ]; then
  shopt -s nullglob
  for f in "$STAGE/nginx"/*.conf; do
    base="$(basename "$f")"
    dest="/etc/nginx/conf.d/$base"
    [ -f "$dest" ] && cp -f "$dest" "$dest.bak.$(date +%Y%m%d%H%M%S)" || true
    cp -f "$f" "$dest"
    APPLIED=1
  done
  shopt -u nullglob
fi
[ "$APPLIED" -eq 1 ] && nginx -t || true

echo "[6/6] Restart nginx & verify"
if command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload || true
  systemctl enable nginx || true
  systemctl restart nginx
else
  service nginx restart || service nginx start
fi
curl -fsS --max-time 8 http://127.0.0.1/ >/dev/null || { echo "❌ nginx did not serve index"; exit 8; }
echo "✅ Deployed. (nginx confs applied: $APPLIED)"
