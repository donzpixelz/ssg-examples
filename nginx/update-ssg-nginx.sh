#!/usr/bin/env bash
# update-ssg-nginx.sh — run on EC2 (via SSM) to add SSG subroutes safely
set -euo pipefail

DOCROOT="${1:-/usr/share/nginx/html}"
CONF="/etc/nginx/conf.d/ssg-subsites.conf"

sudo mkdir -p "$(dirname "$CONF")"

# Write config with literal $uri (single-quoted heredoc prevents shell expansion)
sudo tee "$CONF" >/dev/null <<'NGX'
# Auto-managed SSG subroutes for ssg-examples
# Each route serves static files from the DOCROOT subfolder and falls back to that folder's index.html.
# No regex capture; no shell expansion.
server {
    # These location blocks can be merged into an existing server{} if you prefer.
    # If you already have a default server, nginx will merge by file include order.
}

# Subroutes:
# Use `root` (not alias) so try_files works with absolute fallback paths.
location ^~ /jekyll/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /jekyll/index.html;
    autoindex off;
}

location ^~ /hugo/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /hugo/index.html;
    autoindex off;
}

location ^~ /eleventy/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /eleventy/index.html;
    autoindex off;
}

location ^~ /astro/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /astro/index.html;
    autoindex off;
}
NGX

# Test & reload nginx idempotently
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl reload nginx 2>/dev/null || sudo nginx -s reload 2>/dev/null || true
fi

echo "✅ Nginx routes ensured at $CONF; docroot=$DOCROOT"
