---
title: Blog
layout: base.njk
permalink: /blog/
---

## Blog

Short posts when a “note” needs a little more room.

{% for post in collections.post | reverse %}
- [{{ post.data.title | default: post.fileSlug }}]({{ post.url }}) — {{ post.date | date: "%b %-d, %Y" }}
  {% endfor %}

> Add posts in `app/eleventy_src/posts/` with `tags: [post]`.
