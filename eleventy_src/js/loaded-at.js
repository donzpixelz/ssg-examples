// js/loaded-at.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("page-loaded-at");
    if (!el) return;

    const loadedAt = new Date();
    el.dateTime = loadedAt.toISOString();
    el.title = loadedAt.toUTCString();

    const dtf = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    el.textContent = dtf.format(loadedAt);
  });
})();
