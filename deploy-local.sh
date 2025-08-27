#!/usr/bin/env bash
# Local → GitHub → EC2 (SSH) deploy — minimal & safe.
# - Push ENTIRE project to GitHub (Git honors .gitignore)
# - Mirror ENTIRE project → /opt/ssg-examples/repo (reference copy)
# - Sync app/ → /usr/share/nginx/html
# - Sync nginx/ → /etc/nginx/conf.d (AS-IS; NO generated config)
# - Safe nginx apply: remote backup -> sync -> nginx -t -> rollback if test fails -> reload
# - No local backups. No S3/SSM.

set -Eeuo pipefail

# Filled by installer:
SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REMOTE_REPO="/opt/ssg-examples/repo"
DOCROOT="/usr/share/nginx/html"
CONF_DIR="/etc/nginx/conf.d"
APP_DIR="$PROJECT_ROOT/app"
NGINX_DIR="$PROJECT_ROOT/nginx"

# Message: keep [skip ci] to avoid triggering Actions, remove it if you WANT Actions to run.
MSG="${1:-site: local SSH deploy [skip ci]}"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"

# ---- 1) Push whole project TO GitHub (respects .gitignore) ----
git add -A || true
if ! git diff --cached --quiet; then
  git commit -m "$MSG" || true
fi
git push origin "$BRANCH" || true

# ---- 2) Ensure remote tools & dirs ----
[ -f "$SSH_KEY" ] || { echo "❌ SSH key not found: $SSH_KEY"; exit 1; }
[ -n "$EC2_IP" ]  || { echo "❌ EC2_IP is empty"; exit 1; }

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail
if ! command -v rsync >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then sudo yum install -y -q rsync >/dev/null
  elif command -v dnf >/dev/null 2>&1; then sudo dnf install -y -q rsync >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y -q rsync >/dev/null
  fi
fi
sudo mkdir -p /opt/ssg-examples/repo /usr/share/nginx/html /etc/nginx/conf.d
SSH

RSYNC_SSH=( -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --rsync-path="sudo rsync" )
FILTER=( --filter=':- .gitignore' )
EXCLUDES=( --exclude ".git/" --exclude ".git/**" --exclude ".DS_Store" )

# ---- 3) Mirror ENTIRE project → reference dir ----
rsync -az --delete "${FILTER[@]}" "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" \
  "$PROJECT_ROOT"/ ec2-user@"$EC2_IP":"$REMOTE_REPO"/

# ---- 4) Sync app/ → docroot ----
if [ -d "$APP_DIR" ]; then
  rsync -az --delete "${FILTER[@]}" "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" \
    "$APP_DIR"/ ec2-user@"$EC2_IP":"$DOCROOT"/
fi

# ---- 5) Safe sync nginx/ → conf.d ----
if [ -d "$NGINX_DIR" ]; then
  # (a) Remote backup BEFORE sync
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail
CONF_DIR="/etc/nginx/conf.d"
TS="$(date +%Y%m%d-%H%M%S)"
BAK_DIR="/etc/nginx/conf.d.bak-${TS}"
sudo mkdir -p "$BAK_DIR"
sudo rsync -a --delete "$CONF_DIR"/ "$BAK_DIR"/
echo "$BAK_DIR" | sudo tee /tmp/last_conf_backup >/dev/null
SSH

  # (b) Ship YOUR nginx/ AS-IS (no generation here)
  rsync -az --delete "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" \
    "$NGINX_DIR"/ ec2-user@"$EC2_IP":"$CONF_DIR"/

  # (c) Test & reload; rollback if test fails
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail
CONF_DIR="/etc/nginx/conf.d"
BIN="/usr/sbin/nginx"; command -v "$BIN" >/dev/null 2>&1 || BIN="$(command -v nginx || true)"
BAK_DIR="$(sudo cat /tmp/last_conf_backup 2>/dev/null || true)"
if [ -z "$BIN" ]; then echo "❌ nginx not found on remote"; exit 1; fi

if ! sudo "$BIN" -t; then
  echo "⚠️  nginx -t failed — rolling back conf.d"
  if [ -n "$BAK_DIR" ] && [ -d "$BAK_DIR" ]; then
    sudo rsync -a --delete "$BAK_DIR"/ "$CONF_DIR"/
    sudo "$BIN" -t || true
  fi
  exit 1
fi

sudo systemctl reload nginx || sudo "$BIN" -s reload || true
echo "nginx reloaded (config OK)"
SSH
fi

# ---- 6) Minimal visibility (avoid SIGPIPE) ----
echo "--- DOCROOT (first 40) ---"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" \
  'sudo ls -la /usr/share/nginx/html | sed -n "1,40p" || true'

echo "✅ Done → http://$EC2_IP/?buster=$(date +%s)"
