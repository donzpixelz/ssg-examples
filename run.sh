#!/usr/bin/env bash
# File: run.sh — robust deploy for Amazon Linux 2
# - No fragile pipelines (no early-terminating pipes)
# - Ignore SIGPIPE so SSM collectors can’t kill the process with exit 141
# - Keep stdout/stderr normal (no /var/log redirection)

set -euo pipefail
trap '' PIPE

# [0/9] Inputs & temp workspace
ART_URL="${1:-${ART_URL:-}}"
[ -n "$ART_URL" ] || { echo "❌ Missing artifact URL (arg1 or ART_URL env)."; exit 2; }

WORK="$(mktemp -d /tmp/site_deploy.XXXXXX)"
ARCHIVE="$WORK/site.tgz"
STAGE="$WORK/stage"
mkdir -p "$STAGE"

echo "[1/9] Workspace: $WORK"

# [2/9] Download artifact
echo "[2/9] Download artifact"
curl -fsSL --retry 3 --retry-delay 2 -o "$ARCHIVE" "$ART_URL"
BYTES="$(wc -c <"$ARCHIVE" 2>/dev/null | tr -d '[:space:]' || echo 0)"
echo "Download size: ${BYTES} bytes"

# [3/9] Validate archive
echo "[3/9] Validate archive"
if ! tar -tzf "$ARCHIVE" >/dev/null 2>&1; then
  echo "❌ Archive is not a valid .tgz"
  exit 3
fi

# [4/9] Unpack to staging
echo "[4/9] Unpack to staging"
tar -xzf "$ARCHIVE" -C "$STAGE"

echo "Staged files:"
# POSIX-safe listing (no GNU -printf)
for f in $(find "$STAGE" -type f 2>/dev/null); do
  echo "./${f#"$STAGE"/}"
done

# Choose content root (dir that contains index.html)
ROOT_CANDIDATE=""
for d in "$STAGE" "$STAGE"/*; do
  if [ -f "$d/index.html" ]; then ROOT_CANDIDATE="$d"; break; fi
done
if [ -z "$ROOT_CANDIDATE" ]; then
  echo "❌ index.html not found in staged content"
  exit 4
fi

# [5/9] Detect/install nginx & docroot
echo "[5/9] Detect nginx docroot (if nginx installed)"
DOCROOT_DEFAULT="/usr/share/nginx/html"
DOCROOT="$DOCROOT_DEFAULT"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx not found — installing..."
  if command -v dnf >/dev/null 2>&1; then
    dnf -y install nginx
  else
    yum -y install nginx
  fi
fi

mkdir -p /etc/nginx/conf.d

# Dump config then parse root from file (no piping to avoid SIGPIPE)
NGDUMP="$WORK/nginx_dump.txt"
if nginx -t >/dev/null 2>&1; then
  nginx -T >"$NGDUMP" 2>&1 || true
  FOUND_ROOT="$(awk '
    BEGIN{inserver=0;}
    /^[[:space:]]*server[[:space:]]*\{/ {inserver=1}
    inserver && /^[[:space:]]*root[[:space:]]+[[:graph:]]+[[:space:]]*;/ {
      line=$0
      gsub(/^[[:space:]]+/, "", line)
      gsub(/;[[:space:]]*$/, "", line)
      n=split(line, a, /[[:space:]]+/)
      if (n>=2) { print a[2]; exit }
    }
    /^\}/ { if (inserver) inserver=0 }
  ' "$NGDUMP" 2>/dev/null || true)"
  [ -n "${FOUND_ROOT:-}" ] && DOCROOT="$FOUND_ROOT"
fi

[ -d "$DOCROOT" ] || DOCROOT="$DOCROOT_DEFAULT"
mkdir -p "$DOCROOT"
echo "Using docroot: $DOCROOT"

# [6/9] Ensure nginx server config (safe $uri)
echo "[6/9] Ensure nginx server config"
CONF="/etc/nginx/conf.d/ssg-examples.conf"
if [ ! -f "$CONF" ]; then
  # SINGLE-QUOTED heredoc so $uri stays literal
  cat >"$CONF" <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # $uri below is literal.
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
fi

# Update root if docroot differs
if [ "$DOCROOT" != "/usr/share/nginx/html" ]; then
  TMPCONF="$WORK/ssg-examples.conf.tmp"
  awk -v docroot="$DOCROOT" '
    BEGIN{done=0}
    /^[[:space:]]*root[[:space:]]+/ && done==0 { print "    root " docroot ";"; done=1; next }
    { print }
  ' "$CONF" >"$TMPCONF"
  mv -f "$TMPCONF" "$CONF"
fi

nginx -t

# [7/9] Deploy staged files
echo "[7/9] Deploy files to ${DOCROOT}"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$ROOT_CANDIDATE"/ "$DOCROOT"/
else
  # Remove existing contents (keep dir), then copy
  find "$DOCROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
  cp -a "$ROOT_CANDIDATE"/. "$DOCROOT"/
fi

# [8/9] Restart nginx
echo "[8/9] Restart nginx"
if command -v systemctl >/dev/null 2>&1; then
  systemctl daemon-reload || true
  systemctl enable nginx || true
  systemctl restart nginx
else
  service nginx restart || service nginx start
fi

# [9/9] Snapshot
echo "[9/9] index.html snapshot"
if [ -f "$DOCROOT/index.html" ]; then
  printf "Path: %s/index.html\n" "$DOCROOT"
  awk 'NF{print} NR>=10{exit}' "$DOCROOT/index.html" 2>/dev/null || true
else
  echo "⚠️  No index.html at $DOCROOT"
fi

echo "✅ Done."
