/* ── Header scroll behavior ── */
(function () {
  const header = document.getElementById("main-header");
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const diff = y - lastY;

          // scrolled class
          header.classList.toggle("scrolled", y > 10);

          // hide on scroll down, reveal on scroll up (only after 120px from top)
          if (y > 120) {
            if (diff > 6) {
              header.classList.add("nav-hidden");
              header.classList.remove("nav-visible");
            } else if (diff < -4) {
              header.classList.remove("nav-hidden");
              header.classList.add("nav-visible");
            }
          } else {
            header.classList.remove("nav-hidden");
          }

          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
})();
