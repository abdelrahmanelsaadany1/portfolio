/* ══════════════════════════════════════════════════
   MAGNETIC BUTTON SYSTEM
══════════════════════════════════════════════════ */
(function () {
  const STRENGTH = 0.32;
  const RETURN_EASE = 0.12;
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function applyMagnetic(el) {
    let animId,
      tx = 0,
      ty = 0;
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      tx = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
      ty = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
      el.style.transform = `translate(${tx}px,${ty}px)`;
    });
    el.addEventListener("mouseleave", () => {
      cancelAnimationFrame(animId);
      let cx = tx,
        cy = ty;
      (function go() {
        cx = lerp(cx, 0, RETURN_EASE);
        cy = lerp(cy, 0, RETURN_EASE);
        el.style.transform = `translate(${cx}px,${cy}px)`;
        if (Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1)
          animId = requestAnimationFrame(go);
        else el.style.transform = "";
      })();
      tx = ty = 0;
    });
  }

  function init() {
    document
      .querySelectorAll(
        ".nav-socials a, .form-submit, .project-link, .mobile-back-btn, .spider-btn",
      )
      .forEach(applyMagnetic);
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();