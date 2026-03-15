/* ═══════════════════════════════════════════════════
   sections-core.js  —  Scroll Reveal · Skill Bars · Nav
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  const NAV_MAP = {
    "#about": "#about-section",
    "#projects": "#projects-section",
    "#contact": "#contact-section",
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href");
    const tid = NAV_MAP[href];
    if (!tid) return;
    e.preventDefault();
    const t = document.querySelector(tid);
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const revObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

  const skillObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          skillObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  document.querySelectorAll(".skill-card").forEach((c) => skillObs.observe(c));

  const SEC_NAV = {
    "about-section": "#about",
    "projects-section": "#projects",
    "contact-section": "#contact",
  };
  const secObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const h = SEC_NAV[e.target.id];
        if (!h) return;
        document
          .querySelectorAll(".c-link")
          .forEach((l) => l.classList.remove("active"));
        const m = document.querySelector(`.c-link[href="${h}"]`);
        if (m) m.classList.add("active");
      });
    },
    { threshold: 0.3 },
  );
  Object.keys(SEC_NAV).forEach((id) => {
    const el = document.getElementById(id);
    if (el) secObs.observe(el);
  });
})();