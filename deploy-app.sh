#!/usr/bin/env bash
# deploy-app.sh — commit & push ONLY changes under app/, then print your site URL(s)
# For ssg-examples (multi-site), links: /jekyll /hugo /eleventy /astro

set -euo pipefail

# --- Settings (edit if needed) ---
AWS_REGION="us-east-2"
EC2_KEY_NAME="ssg-examples-key"

# Optional manual fallbacks (leave empty if unknown)
FALLBACK_HOST_DNS=""
FALLBACK_HOST_IP=""

PRIMARY_PORT=80
# ---------------------------------

cd "$(dirname "$0")" || exit 1

get_host_from_terraform() {
  if command -v terraform >/dev/null 2>&1 && [ -d terraform ]; then
    (
      cd terraform
      # Try public_dns first, then public_ip
      terraform output -raw public_dns 2>/dev/null || terraform output -raw public_ip 2>/dev/null || true
    )
  fi
}

get_host_from_aws() {
  if command -v aws >/dev/null 2>&1; then
    local DNS
    DNS="$(aws ec2 describe-instances \
      --region "$AWS_REGION" \
      --filters "Name=key-name,Values=${EC2_KEY_NAME}" "Name=instance-state-name,Values=running" \
      --query "Reservations[].Instances[].PublicDnsName" --output text 2>/dev/null | head -n1 || true)"
    if [[ -n "$DNS" && "$DNS" != "None" ]]; then
      echo "$DNS"; return
    fi
    local IP
    IP="$(aws ec2 describe-instances \
      --region "$AWS_REGION" \
      --filters "Name=key-name,Values=${EC2_KEY_NAME}" "Name=instance-state-name,Values=running" \
      --query "Reservations[].Instances[].PublicIpAddress" --output text 2>/dev/null | head -n1 || true)"
    if [[ -n "$IP" && "$IP" != "None" ]]; then
      echo "$IP"; return
    fi
  fi
}

get_host() {
  # Priority: env var > .deploy-host file > Terraform outputs > AWS > manual fallbacks
  if [[ -n "${DEPLOY_HOST:-}" ]]; then echo "$DEPLOY_HOST"; return; fi

  if [[ -f .deploy-host ]]; then
    local H; H="$(head -n1 .deploy-host || true)"
    [[ -n "$H" ]] && { echo "$H"; return; }
  fi

  local T; T="$(get_host_from_terraform || true)"
  [[ -n "$T" ]] && { echo "$T"; return; }

  local A; A="$(get_host_from_aws || true)"
  [[ -n "$A" ]] && { echo "$A"; return; }

  [[ -n "$FALLBACK_HOST_DNS" ]] && echo "$FALLBACK_HOST_DNS" || echo "$FALLBACK_HOST_IP"
}

get_ip() {
  local H="$1"
  if [[ "$H" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then echo "$H"; return; fi
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import socket,sys;print(socket.gethostbyname(sys.argv[1]))' "$H" 2>/dev/null || true; return
  fi
  if command -v dig >/dev/null 2>&1; then
    dig +short "$H" A | head -n1; return
  fi
  echo "$FALLBACK_HOST_IP"
}

HOST="$(get_host)"
IP="$(get_ip "$HOST")"

printf 'Checking for changes in app/... \n'
git add -A -- app/

if git diff --cached --quiet; then
  printf 'No changes detected in app/ (nothing to commit).\n'
  printf 'Open:  http://%s/\n' "$HOST"
  [[ -n "$IP" ]] && printf 'Plain: http://%s/\n' "$IP"
  printf 'Subpaths (if populated): /jekyll/  /hugo/  /eleventy/  /astro/\n'
  exit 0
fi

printf 'Committing and pushing app/ changes...\n'
git commit -m "Update app (HTML/CSS/JS)"
if ! git push origin main; then
  printf 'Push failed because remote main has new commits.\n'
  printf 'Either run:  git pull --rebase origin main  &&  git push origin main\n'
  printf '...or use PR flow with ./deploy-app-pr.sh\n'
  exit 1
fi

printf 'Done. Your site should update via GitHub Actions shortly.\n'
printf 'Open:  http://%s/\n' "$HOST"
[[ -n "$IP" ]] && printf 'Plain: http://%s/\n' "$IP"
printf 'Subpaths (if populated): /jekyll/  /hugo/  /eleventy/  /astro/\n'
