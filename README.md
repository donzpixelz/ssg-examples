# SSG Examples (Terraform + Nginx + GitHub Actions on AWS)

Host multiple static-site generators (SSGs) **side-by-side** on a single EC2 instance using **Terraform**, **Docker/Nginx**, and **GitHub Actions**.

**Region:** `us-east-2` (Ohio)  
**Paths served:** `/jekyll/`, `/hugo/`, `/eleventy/`, `/astro/` (optional landing page at `/`)

---

## What’s inside

- **Terraform**  
  Provisions a small **EC2** (Amazon Linux 2) in **`us-east-2`**, opens **HTTP :80** to the world and **SSH :22** only to *your current IP*, and installs Docker via cloud-init.
- **Nginx (Docker)**  
  Runs stock `nginx:alpine`; mounts your content from `app/` and two configs:
   - `nginx/99-no-cache.conf` → http-level “no cache” headers
   - `nginx/default.conf` → server block that routes `/jekyll`, `/hugo`, `/eleventy`, `/astro`
- **GitHub Actions**
   - `.github/workflows/deploy.yml` (push to `main`): uploads `app/**` + both Nginx confs over SSH, recreates the container, smoke-tests port 80, then cleans up.
   - `.github/workflows/pr-check.yml` (PRs/feature branches): checks Terraform format/validate (no backend), validates Nginx config inside a container, and can test-build locally (no push).

> No custom Docker image is required in production: we run **stock `nginx:alpine`** and mount your files.

---

## Repository layout

