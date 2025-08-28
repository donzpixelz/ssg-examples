---
title: Home
layout: base.njk
permalink: /
---

## Welcome 👋

007 - This is a tiny Eleventy site meant to be **easy to change**.  
You’ll find plain Markdown pages, a single base layout, and one stylesheet you can shape however you like.

---

### What’s here

- **Pages:** `index.md`, `about.md`, `contact.md` (all Markdown, all use `base.njk`)
- **Layout:** `_includes/base.njk` (adds the header + links your CSS)
- **Styles:** `css/main.css` (copied to `/eleventy/css/main.css` on deploy)
- **Scripts (optional):** `js/loaded-at.js` (you can wire this in later if you want)

---

### Quick ways to make it yours

1. **Change the header color or fonts**  
   Open `css/main.css` and tweak variables or headings.  
   If you want only the word “Eleventy” to have a special font, target the `.font-eleventy` class there.

2. **Edit copy in Markdown**  
   Just type here—no HTML required. Eleventy will wrap this content with your layout automatically.

3. **Add a page**  
   Create `notes.md` with:
   ```md
   ---
   title: Notes
   layout: base.njk
   permalink: /notes/
   ---
   Your notes go here.
