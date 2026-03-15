/* ── Active Nav on Scroll ── */
(function () {
  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY + 120;
      ["about", "projects", "contact"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (
          scrollY >= el.offsetTop &&
          scrollY < el.offsetTop + el.offsetHeight
        ) {
          document
            .querySelectorAll(".c-link")
            .forEach((l) => l.classList.remove("active"));
          const m = document.querySelector(`.c-link[href="#${id}"]`);
          if (m) m.classList.add("active");
        }
      });
    },
    { passive: true },
  );
})();