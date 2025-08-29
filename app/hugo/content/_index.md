+++
title = "Home"
description = "A simple Hugo example homepage with helpful links and quick-start notes."
+++

Welcome! This is a clean **Hugo example** site. Edit content under `content/`, layouts in `layouts/`, and assets in `static/`. The header title comes from `config.toml` (`title = "Hugo Example"`), and the link targets respect your `baseURL`.

<div class="card">
  <h2>Get started</h2>
  <p>Create your first post, run the dev server, and explore the generated pages.</p>
  <pre><code>hugo new posts/hello-world.md
hugo server -D</code></pre>
  <p>Then open the “Latest” list below or jump to the blog index.</p>
  <p>
    <a class="button" href="posts/">Read the blog</a>
    <a class="button small" href="about/">About</a>
    <a class="button small" href="contact/">Contact</a>
  </p>
</div>

<div class="card">
  <h2>Project structure (quick tour)</h2>
  <pre><code>.
├── config.toml            # site settings (title, baseURL, menus, params)
├── content/               # your Markdown content
│   ├── _index.md          # ← this file (homepage content)
│   ├── posts/             # blog posts
│   ├── about/             # optional: about page
│   └── contact/           # optional: contact page
├── layouts/               # templates/partials
│   ├── _default/
│   │   ├── baseof.html
│   │   ├── list.html
│   │   └── single.html
│   └── partials/
│       ├── head.html
│       ├── header.html
│       └── footer.html
└── static/
    └── css/
        └── main.css       # your theme styles
</code></pre>
</div>

<div class="card">
  <h2>Useful commands</h2>
  <ul>
    <li><code>hugo server -D</code> — run local server with drafts</li>
    <li><code>hugo new posts/my-post.md</code> — new post with front matter</li>
    <li><code>hugo -D</code> — build the site into <code>public/</code></li>
  </ul>
</div>

---

### What’s on this page?
- A short intro (this text)
- A quick-start section with buttons to common pages
- A project structure overview
- Below, the **Latest** list (automatically pulled from your posts)

> Tip: If you create <code>content/about/_index.md</code> or <code>content/contact/_index.md</code>, the buttons above will just work (links are relative, so they honor <code>baseURL = "/hugo/"</code>).
