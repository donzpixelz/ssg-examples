---
title: Notes
layout: base.njk
permalink: /notes/
---

## Notes

A lightweight place for quick thoughts and scratch work.

-{% for note in collections.notes | reverse %}
-- [{{ note.data.title | default: note.fileSlug }}]({{ note.url }}){% if note.data.desc %} — {{ note.data.desc }}{% endif %}
-{% endfor %}
+{% for note in collections.notes | reverse %}
+- [{{ note.data.title | default: note.fileSlug }}]({{ note.url | url }}){% if note.data.desc %} — {{ note.data.desc }}{% endif %}
+{% endfor %}


> Add more notes by creating files in `app/eleventy_src/notes/` with `tags: [notes]`.
