+++
title = "Home"
layout = "index"
description = "A simple Hugo example homepage with helpful links, quick-start notes, and practical tips."
+++

Welcome! This is a clean **Hugo example** site. Edit content under `content/`, layouts in `layouts/`, and assets in `static/`. The header title comes from `config.toml` (`title = "Hugo Example"`), and links respect your `baseURL`.

<div class="card">
  <h2>Get started</h2>
  <p>Create your first post, run the dev server, and explore the generated pages.</p>
  <pre><code>hugo new posts/hello-world.md
hugo server -D --disableFastRender</code></pre>
  <p>Then open the “Latest” list below or jump to the blog index.</p>
  <p>
    <a class="button" href="posts/">Read the blog</a>
    <a class="button small" href="about/">About</a>
    <a class="button small" href="contact/">Contact</a>
  </p>
</div>

<div class="card">
  <h2>Why Hugo?</h2>
  <ul>
    <li><strong>Ridiculously fast builds</strong> — even large sites compile in seconds.</li>
    <li><strong>Organized content</strong> — Markdown + front matter keeps things tidy.</li>
    <li><strong>Composable layouts</strong> — base templates, partials, and shortcodes.</li>
    <li><strong>Subpath-friendly</strong> — set <code>baseURL</code> and your links just work.</li>
  </ul>
</div>

<div class="card">
  <h2>Project structure (quick tour)</h2>
  <pre><code>.
├── config.toml
├── content/
│   ├── _index.md      # ← this file (homepage)
│   ├── posts/
│   ├── about/
│   └── contact/
├── layouts/
│   ├── index.html     # ← home template (this page uses it)
│   ├── _default/
│   └── partials/
└── static/
    └── css/
        └── main.css
</code></pre>
</div>

<div class="card">
  <h2>Draft → published workflow</h2>
  <ol>
    <li>Create a draft: <code>hugo new --kind post posts/my-post.md</code> (adds <code>draft = true</code>).</li>
    <li>Preview drafts: <code>hugo server -D --disableFastRender</code>.</li>
    <li>Publish by removing <code>draft = true</code> or setting <code>publishDate</code>.</li>
    <li>Build for production: <code>hugo -D</code> (or without <code>-D</code> to exclude drafts).</li>
  </ol>
</div>

---

> Tip: Because links here are relative (e.g., <code>posts/</code>, <code>about/</code>), they honor <code>baseURL = "/hugo/"</code>.
