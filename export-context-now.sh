#!/usr/bin/env bash
# File: export_context_now.sh
# Purpose: Generate NEW-CHAT-CONTEXT.md with current repo facts & tree.
# Safe: Does NOT close your IntelliJ terminal; always returns to a prompt.

# Be tolerant on purpose—finish and return to prompt even if something hiccups.
set -u

OUT="NEW-CHAT-CONTEXT.md"
LOG="/tmp/export_context_now.$USER.log"
{
  echo
  echo "===== $(date +'%Y-%m-%d %H:%M:%S') :: export_context_now START ====="
} >>"$LOG"

say(){ printf "%s\n" "$*"; echo "$*" >>"$LOG"; }
safe(){ "$@" >>"$LOG" 2>&1 || true; }

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "${ROOT}" ]; then
  say "❌ Not inside a git repository."
  printf "Wrote log: %s\n" "$LOG"
  # Do not exit nonzero; return control to shell
  exit 0
fi
cd "$ROOT" || true

REPO_NAME="$(basename "$ROOT")"
BRANCH="$(git branch --show-current 2>/dev/null || echo main)"
REMOTE="$(git remote get-url origin 2>/dev/null || echo "")"

# Gather lists without failing the run
list_safe() {
  local path="$1"; shift
  if [ -d "$path" ]; then
    (cd "$path" && find . -maxdepth 2 -type f | sort) || true
  else
    echo "(missing)"
  fi
}

TOPLEVEL="$(find . -maxdepth 1 -mindepth 1 -printf "%f\n" 2>/dev/null | sort || true)"
APP_LIST="$(list_safe app)"
NGINX_LIST="$(list_safe nginx)"
WF_LIST="$(list_safe .github/workflows)"

has_file() { [ -f "$1" ] && echo "present" || echo "missing"; }

DEPLOY_LOCAL_STATE="$(has_file ./deploy-local.sh)"
DEPLOY_SITE_NOW_STATE="$(has_file ./deploy_site_now)"
RUN_SH_STATE="$(has_file ./run.sh)"

cat > "$OUT" <<EOF
# New Chat Context: ${REPO_NAME}

## Repo
- Root: \`${ROOT}\`
- Branch: \`${BRANCH}\`
- Origin: \`${REMOTE}\`

## Non-negotiables
- Always provide **full, copy-pasteable Bash files** (no snippets).
- NEVER close my IntelliJ terminal session; scripts must always **return to a prompt**.
- Preserve both flows:
  1) Local/SSH: \`./deploy-local.sh\` — stable
  2) CI/SSM: \`deploy_site_now "message"\` — commit/push, Actions, SSM deploy

## Current files (top level)
\`\`\`
${TOPLEVEL}
\`\`\`

## app/
\`\`\`
${APP_LIST}
\`\`\`

## nginx/
\`\`\`
${NGINX_LIST}
\`\`\`

## Workflows (.github/workflows)
\`\`\`
${WF_LIST}
\`\`\`

## Deploy scripts presence
- \`deploy-local.sh\`: ${DEPLOY_LOCAL_STATE}
- \`deploy_site_now\`: ${DEPLOY_SITE_NOW_STATE}
- \`run.sh\`: ${RUN_SH_STATE}

## What works now
- CI workflow deploys via SSM inline commands (OIDC role). S3 holds the packaged site; SSM downloads & deploys into \`/usr/share/nginx/html\`. Nginx restarted idempotently.

## Next step I want help with
- Add four SSG examples and route them via nginx:
  - \`/jekyll\`, \`/hugo\`, \`/eleventy\`, \`/astro\`
- Provide:
  1) Full workflow update to build each SSG (as needed) and publish outputs to distinct subpaths.
  2) Full nginx updater (safe, idempotent; keeps \$uri literal) to expose those subpaths.
  3) A local driver that **returns to a prompt** and (optionally) opens the Actions page.

## Preferences
- Fail gracefully if a required secret is missing; name the secret explicitly.
- No fragile pipelines; avoid SIGPIPE traps.
- Keep \`./deploy-local.sh\` untouched unless I ask otherwise.
EOF

say "Wrote: $OUT"
printf "✅ Done. You can open and paste %s into your new chat.\n" "$OUT"
printf "🪵 Log: %s\n" "$LOG"
# Always return to prompt
exit 0
