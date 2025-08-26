# New Chat Context: ssg-examples

## Repo
- Root: `/Users/.projects/ssg-examples`
- Branch: `main`
- Origin: `https://github.com/donzpixelz/ssg-examples.git`

## Non-negotiables
- Always provide **full, copy-pasteable Bash files** (no snippets).
- NEVER close my IntelliJ terminal session; scripts must always **return to a prompt**.
- Preserve both flows:
  1) Local/SSH: `./deploy-local.sh` — stable
  2) CI/SSM: `deploy_site_now "message"` — commit/push, Actions, SSM deploy

## Current files (top level)
```

```

## app/
```
./css/main.css
./index.html
./js/loaded-at.js
```

## nginx/
```
./99-no-cache.conf
./default.conf
```

## Workflows (.github/workflows)
```
./deploy-site-ssm.yml
```

## Deploy scripts presence
- `deploy-local.sh`: present
- `deploy_site_now`: present
- `run.sh`: present

## What works now
- CI workflow deploys via SSM inline commands (OIDC role). S3 holds the packaged site; SSM downloads & deploys into `/usr/share/nginx/html`. Nginx restarted idempotently.

## Next step I want help with
- Add four SSG examples and route them via nginx:
  - `/jekyll`, `/hugo`, `/eleventy`, `/astro`
- Provide:
  1) Full workflow update to build each SSG (as needed) and publish outputs to distinct subpaths.
  2) Full nginx updater (safe, idempotent; keeps $uri literal) to expose those subpaths.
  3) A local driver that **returns to a prompt** and (optionally) opens the Actions page.

## Preferences
- Fail gracefully if a required secret is missing; name the secret explicitly.
- No fragile pipelines; avoid SIGPIPE traps.
- Keep `./deploy-local.sh` untouched unless I ask otherwise.
