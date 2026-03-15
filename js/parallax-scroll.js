/* ══════════════════════════════════════════════════
   PARALLAX SCROLL
══════════════════════════════════════════════════ */
(function () {
  if (window.innerWidth < 768) return;
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const hero = document.querySelector(".hero");
          if (hero)
            hero.style.setProperty(
              "--parallax-y",
              window.scrollY * 0.15 + "px",
            );
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
})();