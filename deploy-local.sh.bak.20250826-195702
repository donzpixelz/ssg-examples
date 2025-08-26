#!/usr/bin/env bash
# Fast local → EC2 deploy over SSH (no GitHub Actions), plus git add/commit/push first.
# - Does NOT touch Nginx configs.
# - "Full" deploy with smart preservation:
#     * Root is synced with --delete, BUT
#     * Subsites (/jekyll,/hugo,/eleventy,/astro) are PRESERVED on the server if you DON'T have them locally.
#     * If you DO have a subsite locally (non-empty), it is fully synced (with --delete) to the server.
# - Usage:
#     ./deploy-local.sh "commit message"
#     ./deploy-local.sh --full "commit message"    # cleaner root sync, still preserves subsites you don't have

set -Eeuo pipefail

# ==== EDITABLE (already filled from your last script; adjust if needed) ====
SSH_KEY="/Users/donwilson/.ssh/ssg-examples-key.pem"
EC2_IP="18.220.33.0"
# ==========================================================================

APP_DIR="./app"
DOCROOT="/usr/share/nginx/html"

# Parse flags/message
FULL=0
MSG=""
for arg in "$@"; do
  case "$arg" in
    --full) FULL=1 ;;
    *) MSG="$arg" ;;
  esac
done
: "${MSG:=site: local fast deploy}"

# 0) Git add/commit/push (quick, non-blocking if nothing changed)
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
git add -A || true
if ! git diff --cached --quiet; then
  git commit -m "$MSG" || true
fi
git push origin "$BRANCH" || true

# 1) Sanity
[ -d "$APP_DIR" ] || { echo "❌ $APP_DIR not found"; exit 1; }
[ -f "$APP_DIR/index.html" ] || { echo "❌ $APP_DIR/index.html not found"; exit 1; }
[ -f "$SSH_KEY" ] || { echo "❌ SSH key not found: $SSH_KEY"; exit 1; }
[ -n "$EC2_IP" ] || { echo "❌ EC2_IP is empty"; exit 1; }

# 2) Prepare package and determine which subsites you have locally
SUBSITES=("jekyll" "hugo" "eleventy" "astro")
HAVE_LOCAL=""   # subsites present & non-empty locally → will be updated
KEEP_REMOTE=""  # subsites NOT present locally → will be preserved on server

PKG_DIR="$(mktemp -d)"
trap 'rm -rf "$PKG_DIR"' EXIT
mkdir -p "$PKG_DIR/u"

# Copy app into package
rsync -a "$APP_DIR"/ "$PKG_DIR/u"/

# Decide per-subsite
for s in "${SUBSITES[@]}"; do
  if [ -d "$APP_DIR/$s" ] && [ -n "$(ls -A "$APP_DIR/$s" 2>/dev/null || true)" ]; then
    # we have local content → include and later sync with --delete
    HAVE_LOCAL+=" $s"
  else
    # no local content → remove from package so we don't wipe server
    rm -rf "$PKG_DIR/u/$s"
    KEEP_REMOTE+=" $s"
  fi
done

# 3) Create tgz to upload
tar -C "$PKG_DIR/u" -czf site.tgz .

# 4) Upload & deploy remotely (no nginx config changes)
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no site.tgz ec2-user@"$EC2_IP":site.tgz

# FULL mode: delete extraneous root files too (still preserves remote subsites you don't have locally)
FULL_FLAG="$FULL"
HAVE_LOCAL_STR="$HAVE_LOCAL"
KEEP_REMOTE_STR="$KEEP_REMOTE"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" "bash -se" <<EOF
set -Eeuo pipefail
DOCROOT="$DOCROOT"
PKG="\$HOME/site.tgz"
WORK="\$(mktemp -d)"
mkdir -p "\$WORK"; tar -xzf "\$PKG" -C "\$WORK"

# Ensure rsync exists
if ! command -v rsync >/dev/null 2>&1; then
  if command -v yum >/dev/null 2>&1; then sudo yum install -y -q rsync >/dev/null
  elif command -v dnf >/dev/null 2>&1; then sudo dnf install -y -q rsync >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y rsync >/dev/null
  fi
fi

sudo mkdir -p "\$DOCROOT"

# Build exclude list for subsites we want to PRESERVE (not present locally)
EXCLUDES=""
for s in $KEEP_REMOTE_STR; do
  EXCLUDES="\$EXCLUDES --exclude '\$s/**'"
done

# Root sync:
#  - If --full: delete other root files (but not excluded subsites)
#  - Else: incremental (no delete), always preserving excluded subsites
if [ "$FULL_FLAG" -eq 1 ]; then
  # delete-while respecting excludes
  sudo bash -lc "rsync -a --delete --delete-excluded \$EXCLUDES \"\$WORK\"/ \"\$DOCROOT\"/"
else
  sudo bash -lc "rsync -a \$EXCLUDES \"\$WORK\"/ \"\$DOCROOT\"/"
fi

# Per-subsite sync for those you DO have locally (force-delete to make them exact)
for s in $HAVE_LOCAL_STR; do
  if [ -d "\$WORK/\$s" ]; then
    sudo rsync -a --delete "\$WORK/\$s"/ "\$DOCROOT/\$s"/
  fi
done

# Permissions (best-effort)
if id nginx >/dev/null 2>&1; then
  sudo chown -R nginx:nginx "\$DOCROOT"
fi
sudo find "\$DOCROOT" -type d -exec chmod 755 {} \; || true
sudo find "\$DOCROOT" -type f -exec chmod 644 {} \; || true

# Reload nginx (no config edits)
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t && (sudo systemctl reload nginx || sudo nginx -s reload || true)
fi

# Diagnostics (safe; no SIGPIPE)
echo "--- DOCROOT top ---"
sudo ls -la "\$DOCROOT" | sed -n '1,80p' || true
EOF

echo "✅ Done. Open:  http://$EC2_IP/?buster=$(date +%s)"
