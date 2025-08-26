#!/usr/bin/env bash
# EC2 run.sh — force docroot, robust deploy, hard verify (no SIGPIPE surprises)

set -euo pipefail
trap '' PIPE

DOCROOT="/usr/share/nginx/html"
CONF="/etc/nginx/conf.d/ssg-examples.conf"

ART_URL="${1:-${ART_URL:-}}"
[ -n "$ART_URL" ] || { echo "❌ Missing artifact URL (arg1 or ART_URL env)."; exit 2; }

# Workspace
WORK="$(mktemp -d /tmp/site_deploy.XXXXXX)"
ARCHIVE="$WORK/site.tgz"
STAGE="$WORK/stage"
mkdir -p "$STAGE"

echo "[1/9] Download"
curl -fsSL --retry 3 --retry-delay 2 -o "$ARCHIVE" "$ART_URL"
echo "Size: $(wc -c <"$ARCHIVE" | tr -d '[:space:]') bytes"

echo "[2/9] Validate"
tar -tzf "$ARCHIVE" >/dev/null 2>&1 || { echo "❌ Bad .tgz"; exit 3; }

echo "[3/9] Unpack"
tar -xzf "$ARCHIVE" -C "$STAGE"
ROOT_CANDIDATE=""
for d in "$STAGE" "$STAGE"/*; do
  [ -f "$d/index.html" ] && { ROOT_CANDIDATE="$d"; break; }
done
[ -n "$ROOT_CANDIDATE" ] || { echo "❌ index.html not found"; exit 4; }
echo "Stage root: $ROOT_CANDIDATE"

echo "[4/9] Install nginx if needed"
if ! command -v nginx >/dev/null 2>&1; then
  if command -v dnf >/dev/null 2>&1; then dnf -y install nginx; else yum -y install nginx; fi
fi
mkdir -p /etc/nginx/conf.d

echo "[5/9] Pin server config to $DOCROOT"
# Disable default if present (avoid multiple default_server collisions)
if [ -f /etc/nginx/conf.d/default.conf ]; then mv -f /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak || true; fi

# Write our config (single-quoted heredoc so $uri stays literal)
cat >"$CONF" <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # $uri below is literal.
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
        # Cache-busting for dev:
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        expires -1;
    }
}
NGINX

# If DOCROOT differs (it doesn't by default), update it
if [ "$DOCROOT" != "/usr/share/nginx/html" ]; then
  awk -v docroot="$DOCROOT" '
    BEGIN{done=0}
    /^[[:space:]]*root[[:space:]]+/ && done==0 { print "    root " docroot ";"; done=1; next }
    { print }
  ' "$CONF" >"$CONF.tmp" && mv -f "$CONF.tmp" "$CONF"
fi

echo "[6/9] Test nginx config"
nginx -t

echo "[7/9] Deploy files to $DOCROOT"
mkdir -p "$DOCROOT"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$ROOT_CANDIDATE"/ "$DOCROOT"/
else
  find "$DOCROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "$ROOT_CANDIDATE"/. "$DOCROOT"/
fi
chmod -R a+rX "$DOCROOT"

echo "[8/9] Restart nginx"
if command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload || true
  systemctl enable nginx || true
  systemctl restart nginx
else
  service nginx restart || service nginx start
fi

echo "[9/9] Verify"
# Compare staged vs live index.html checksums
LIVE="$DOCROOT/index.html"
STAGEF="$ROOT_CANDIDATE/index.html"
if command -v sha256sum >/dev/null 2>&1; then
  SH1="$(sha256sum "$STAGEF" | awk '{print $1}')"
  SH2="$(sha256sum "$LIVE"   | awk '{print $1}')"
else
  SH1="$(/usr/bin/sha256sum "$STAGEF" 2>/dev/null | awk '{print $1}')"
  SH2="$(/usr/bin/sha256sum "$LIVE"   2>/dev/null | awk '{print $1}')"
fi
echo "SHA stage: $SH1"
echo "SHA live : $SH2"
if [ -n "$SH1" ] && [ -n "$SH2" ] && [ "$SH1" != "$SH2" ]; then
  echo "❌ Live index.html does not match staged copy."; exit 7
fi

# Sanity-fetch from localhost
curl -fsS --max-time 5 http://127.0.0.1/ >/dev/null || { echo "❌ curl localhost failed"; exit 8; }

echo "✅ Deployed to $DOCROOT and verified."
