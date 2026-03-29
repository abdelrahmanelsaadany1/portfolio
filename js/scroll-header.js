/* ── Scroll Progress + Header ── */
(function () {
  const bar = document.getElementById("scroll-progress");
  const header = document.getElementById("main-header");
  if (!bar) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const diff = y - lastY;

          // progress bar
          bar.style.width =
            Math.min(
              (y / (document.body.scrollHeight - window.innerHeight)) * 100,
              100,
            ) + "%";

          // scrolled class
          if (header) header.classList.toggle("scrolled", y > 10);

          // hide on scroll down, reveal on scroll up (only after 120px from top)
          if (header && y > 120) {
            if (diff > 6) {
              header.classList.add("nav-hidden");
              header.classList.remove("nav-visible");
            } else if (diff < -4) {
              header.classList.remove("nav-hidden");
              header.classList.add("nav-visible");
            }
          } else if (header) {
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