// js/loaded-at.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("page-loaded-at");
    if (!el) return;

    const loadedAt = new Date();

    // Machine-readable attribute
    el.dateTime = loadedAt.toISOString();
    // Helpful tooltip
    el.title = loadedAt.toUTCString();

    // Human-readable, localized string
    const dtf = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    el.textContent = dtf.format(loadedAt);
  });
})();
