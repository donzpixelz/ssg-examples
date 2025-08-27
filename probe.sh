#!/usr/bin/env bash
# probe.sh — read-only status probe (no changes). Checks common routes.
# Usage:
#   ./probe.sh            # tries EC2_IP from ./deploy-local.sh
#   ./probe.sh HOST_OR_IP # override target
set -Eeuo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" && -f "./deploy-local.sh" ]]; then
  TARGET="$(awk -F= '/^EC2_IP=/{gsub(/"/,"",$2); print $2}' ./deploy-local.sh | head -n1 || true)"
fi
if [[ -z "${TARGET:-}" ]]; then
  echo "Usage: $0 <host-or-ip>  (or ensure EC2_IP is set in ./deploy-local.sh)"
  exit 1
fi

BASE="http://${TARGET}"
paths=( "/" "/jekyll/" "/hugo/" "/eleventy/" "/astro/" )

echo "Probing ${BASE}"
for p in "${paths[@]}"; do
  HEADERS="$(curl -sS -I --max-time 8 -H 'Cache-Control: no-cache' "${BASE}${p}" || true)"
  CODE="$(awk 'NR==1{print $2}' <<<"$HEADERS" || true)"
  TYPE="$(awk 'BEGIN{IGNORECASE=1}/^Content-Type:/{sub(/\r$/,""); $1=""; sub(/^ /,""); print}' <<<"$HEADERS" | head -n1 || true)"
  DISP="$(awk 'BEGIN{IGNORECASE=1}/^Content-Disposition:/{sub(/\r$/,""); $1=""; sub(/^ /,""); print}' <<<"$HEADERS" | head -n1 || true)"
  LOC="$(awk 'BEGIN{IGNORECASE=1}/^Location:/{sub(/\r$/,""); $1=""; sub(/^ /,""); print}' <<<"$HEADERS" | head -n1 || true)"

  NOTE=""
  [[ -z "$CODE" ]] && CODE="(no response)"
  if [[ "$CODE" == "200" ]]; then
    if grep -qi 'attachment' <<<"${DISP:-}"; then
      NOTE=" ⚠️ downloads (attachment)"
    elif [[ -n "$TYPE" && ! "$TYPE" =~ [Tt][Ee][Xx][Tt]/[Hh][Tt][Mm][Ll] ]]; then
      NOTE=" ⚠️ type=${TYPE}"
    else
      NOTE=" ✅"
    fi
  elif [[ "$CODE" =~ ^3 ]]; then
    NOTE=" ➜ ${LOC}"
  elif [[ "$CODE" =~ ^4 ]]; then
    NOTE=" ❌ client error"
  elif [[ "$CODE" =~ ^5 ]]; then
    NOTE=" ❌ server error"
  fi

  printf "%-18s -> %s%s\n" "$p" "$CODE" "$NOTE"
done
