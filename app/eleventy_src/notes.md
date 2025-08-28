---
title: Notes
layout: base.njk
permalink: /notes/
---

## Notes

<ul class="grid">
{% for note in collections.notes | reverse %}
  <li class="card">
    <a class="title" href="{{ note.url | url }}">
      {{ note.data.title | default: note.fileSlug }}
    </a>
    {% if note.data.desc %}<p class="desc">{{ note.data.desc }}</p>{% endif %}
    <a class="btn" href="{{ note.url | url }}">Open</a>
  </li>
{% endfor %}
</ul>
