---
title: Blog
layout: base.njk
permalink: /blog/
---

## Blog

<ul class="grid">
{% for post in collections.post | reverse %}
  <li class="card">
    <a class="title" href="{{ post.url | url }}">
      {{ post.data.title | default: post.fileSlug }}
    </a>
    <p class="desc">
      {% if post.data.desc %}
        {{ post.data.desc }}
      {% else %}
        Published {{ post.date | date: "%b %-d, %Y" }}
      {% endif %}
    </p>
    <a class="btn" href="{{ post.url | url }}">Read</a>
  </li>
{% endfor %}
</ul>
