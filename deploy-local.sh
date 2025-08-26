#!/usr/bin/env bash
# Local → EC2 deploy via SSH that:
#  • pushes repo first (respects .gitignore),
#  • deploys app/ to /usr/share/nginx/html with --delete,
#  • deploys nginx/ files to /etc/nginx/conf.d (from repo, not hardcoded),
#  • preserves /jekyll,/hugo,/eleventy,/astro remotely unless you have *built outputs* locally,
#  • tests & reloads nginx,
#  • never makes tarballs, never edits nginx here.

set -Eeuo pipefail

# Reused from your prior script:
SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"

APP_DIR="./app"
NGINX_DIR="./nginx"
DOCROOT="/usr/share/nginx/html"
CONF_DIR="/etc/nginx/conf.d"

MSG="${1:-site: local SSH deploy}"

# 0) Keep GitHub in sync (Git inherently respects .gitignore)
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
git add -A || true
if ! git diff --cached --quiet; then
  git commit -m "$MSG" || true
fi
git push origin "$BRANCH" || true

# 1) Preflight
[ -d "$APP_DIR" ]   || { echo "❌ $APP_DIR not found"; exit 1; }
[ -f "$SSH_KEY" ]   || { echo "❌ SSH key not found: $SSH_KEY"; exit 1; }
[ -n "$EC2_IP" ]    || { echo "❌ EC2_IP is empty"; exit 1; }

# 2) Figure out which subsites you have *built output* for locally
#    (“built” = an index.html present in the subfolder)
SUBSITES=(jekyll hugo eleventy astro)
EXCLUDES=()      # subsites we will preserve on server
INCLUDE_BUILT=() # subsites we will fully sync (with --delete)
for s in "${SUBSITES[@]}"; do
  if [ -f "$APP_DIR/$s/index.html" ]; then
    INCLUDE_BUILT+=("$s")
  else
    EXCLUDES+=(--exclude "$s/**")
  fi
done

# 3) Ensure server has rsync & target dirs (no nginx changes here)
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail
if ! command -v rsync >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then sudo yum install -y -q rsync >/dev/null
  elif command -v dnf >/dev/null 2>&1; then sudo dnf install -y -q rsync >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y rsync >/dev/null
  fi
fi
sudo mkdir -p /usr/share/nginx/html
sudo mkdir -p /etc/nginx/conf.d
SSH

# 4) Rsync APP (full delete) – but preserve subsites without local built output
#    Also honor .gitignore: use rsync filter file from repo root.
RSYNC_SSH=( -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --rsync-path="sudo rsync" )
APP_FILTER=( --filter=':- .gitignore' )
rsync -az --delete "${APP_FILTER[@]}" "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" "$APP_DIR"/ ec2-user@"$EC2_IP":"$DOCROOT"/

# 5) For subsites you DO have built output for, force exact sync (with --delete)
for s in "${INCLUDE_BUILT[@]}"; do
  rsync -az --delete "${RSYNC_SSH[@]}" "$APP_DIR/$s"/ ec2-user@"$EC2_IP":"$DOCROOT/$s"/
done

# 6) Rsync nginx/ from repo to server conf dir (apply what’s in the repo, nothing more)
if [ -d "$NGINX_DIR" ]; then
  rsync -az "${RSYNC_SSH[@]}" "$NGINX_DIR"/ ec2-user@"$EC2_IP":"$CONF_DIR"/
fi

# 7) Test & reload nginx (no config edits here)
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl reload nginx || sudo nginx -s reload || true
fi
# quick listing for sanity (no SIGPIPE)
sudo ls -la /usr/share/nginx/html | sed -n '1,80p' || true
SSH

echo "✅ Local SSH deploy complete → http://$EC2_IP/?buster=$(date +%s)"
