+++
title = "Home"
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
├── config.toml            # site settings (title, baseURL, menus, params)
├── content/               # your Markdown content
│   ├── _index.md          # ← this file (homepage content)
│   ├── posts/             # blog posts
│   ├── about/             # about page (optional)
│   └── contact/           # contact page (optional)
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
        └── main.css       # theme styles
</code></pre>
</div>

<div class="card">
  <h2>Content & taxonomy tips</h2>
  <p>Use front matter to set titles, dates, summaries, and tags:</p>
  <pre><code>+++
title = "Hello World"
date = 2025-08-29T10:00:00
tags = ["intro","hugo"]
summary = "A short teaser that appears on list pages."
+++

Your Markdown goes here.
</code></pre>
  <p>Create tag and category pages by adding <code>_index.md</code> files or enabling taxonomy templates later. Common URLs:</p>
  <ul>
    <li><code>tags/</code> → list of tags</li>
    <li><code>tags/intro/</code> → all posts tagged “intro”</li>
    <li><code>categories/</code> → similar to tags if you use them</li>
  </ul>
</div>

<div class="card">
  <h2>Draft → published workflow</h2>
  <ol>
    <li>Create a draft: <code>hugo new --kind post posts/my-post.md</code> (adds <code>draft = true</code>).</li>
    <li>Preview drafts locally: <code>hugo server -D</code>.</li>
    <li>Publish by removing <code>draft = true</code> or setting <code>publishDate</code> in the front matter.</li>
    <li>Build for production: <code>hugo -D</code> (or without <code>-D</code> if you don’t want drafts included).</li>
  </ol>
</div>

<div class="card">
  <h2>Deployment notes</h2>
  <ul>
    <li>If your site lives at a subpath (e.g., <code>/hugo/</code>), set <code>baseURL = "/hugo/"</code> in <code>config.toml</code>.</li>
    <li>Use relative links (e.g., <code>posts/</code>, <code>about/</code>) in content like this page so they honor your <code>baseURL</code>.</li>
    <li>Static files (images, CSS) go in <code>static/</code> and are served from the site root.</li>
  </ul>
</div>

<div class="card">
  <h2>Useful commands</h2>
  <ul>
    <li><code>hugo server -D --disableFastRender</code> — dev server with drafts; full refresh on changes</li>
    <li><code>hugo new posts/my-post.md</code> — create a new post</li>
    <li><code>hugo -D</code> — build the site into <code>public/</code></li>
  </ul>
</div>

---

### What’s on this page?
- A short intro (this text)
- Quick-start & “Why Hugo”
- Project structure, content tips, draft workflow, and deployment notes
- A commands cheat sheet
- Below, the **Latest** list (auto-pulled from your posts)

> Tip: If you create <code>content/about/_index.md</code> or <code>content/contact/_index.md</code>, the buttons above will “just work” because links are relative (they’ll honor <code>baseURL = "/hugo/"</code>).
