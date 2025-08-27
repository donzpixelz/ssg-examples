#!/usr/bin/env bash
# Local → GitHub → EC2 (SSH) full deploy, kept simple.
# 1) Push the WHOLE project TO your GitHub repo (Git honors .gitignore)
# 2) FROM LOCAL: mirror entire project → /opt/ssg-examples/repo (respects .gitignore; excludes .git)
#                sync app/   → /usr/share/nginx/html
#                sync nginx/ → /etc/nginx/conf.d
# 3) Clean refresh on the instance: stop Docker on :80/:443, stop Apache, test & restart Nginx
# No tarballs/S3. No embedded nginx logic — nginx config comes from ./nginx.

set -Eeuo pipefail

# Preserved from your previous script:
SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"

# Paths
PROJECT_ROOT="$(pwd)"
REMOTE_REPO="/opt/ssg-examples/repo"
DOCROOT="/usr/share/nginx/html"
CONF_DIR="/etc/nginx/conf.d"

APP_DIR="$PROJECT_ROOT/app"
NGINX_DIR="$PROJECT_ROOT/nginx"

# Commit message; keep [skip ci] if you do NOT want Actions to run
MSG="${1:-site: local SSH full deploy [skip ci]}"

# --- 1) Push whole project TO GitHub (Git respects .gitignore) ---
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
git add -A || true
if ! git diff --cached --quiet; then
  git commit -m "$MSG" || true
fi
git push origin "$BRANCH" || true

# --- 2) FROM LOCAL → instance via SSH/rsync (respect .gitignore everywhere) ---
[ -f "$SSH_KEY" ] || { echo "❌ SSH key not found: $SSH_KEY"; exit 1; }
[ -n "$EC2_IP" ]  || { echo "❌ EC2_IP is empty"; exit 1; }

# Preflight on instance (no nginx edits)
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

# (a) Mirror the whole project (keeps a full copy on the box for reference/tools)
rsync -az --delete "${FILTER[@]}" "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" "$PROJECT_ROOT"/ ec2-user@"$EC2_IP":"$REMOTE_REPO"/

# (b) Runtime files: app/ → docroot (respects .gitignore; --delete keeps it clean)
if [ -d "$APP_DIR" ]; then
  rsync -az --delete "${FILTER[@]}" "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" "$APP_DIR"/ ec2-user@"$EC2_IP":"$DOCROOT"/
fi

# (c) Server config: nginx/ → conf.d (no logic here; your repo content is applied as-is)
if [ -d "$NGINX_DIR" ]; then
  rsync -az --delete "${EXCLUDES[@]}" "${RSYNC_SSH[@]}" "$NGINX_DIR"/ ec2-user@"$EC2_IP":"$CONF_DIR"/
fi

# --- 3) Clean refresh on the instance (free ports, then restart nginx) ---
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'bash -se' <<'SSH'
set -Eeuo pipefail

# Free :80/:443 from Docker containers
if command -v docker >/dev/null 2>&1; then
  CIDS="$(sudo docker ps --format "{{.ID}} {{.Ports}}" | awk "/:80->|:443->/ {print \$1}" | xargs -r echo)"
  if [ -n "$CIDS" ]; then
    sudo docker stop $CIDS >/dev/null 2>&1 || true
  fi
fi

# Stop Apache if running
systemctl is-active --quiet httpd && sudo systemctl stop httpd || true

# Test & restart nginx
BIN="/usr/sbin/nginx"; command -v "$BIN" >/dev/null 2>&1 || BIN="$(command -v nginx || true)"
if [ -n "$BIN" ]; then
  sudo "$BIN" -t
  sudo systemctl enable nginx >/dev/null 2>&1 || true
  sudo systemctl restart nginx || sudo "$BIN" -s reload || true
fi

# Quick checks (no SIGPIPE)
for p in / /jekyll/ /hugo/ /eleventy/ /astro/; do
  code="$(curl -s -o /dev/null -w "%{http_code}" -H "Cache-Control: no-cache" "http://127.0.0.1$p" || echo ERR)"
  echo "GET $p -> $code"
done
SSH

echo "✅ Local push → GitHub AND local → server sync + clean restart complete → http://$EC2_IP/?buster=$(date +%s)"
