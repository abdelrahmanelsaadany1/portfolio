/* ═══════════════════════════════════════════════════
   sections-core.js — Scroll Reveal · Nav · Projects
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Smooth nav scroll ── */
  const NAV_MAP = {
    "#about": "#about-section",
    "#projects": "#projects-section",
    "#contact": "#contact-section",
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const tid = NAV_MAP[link.getAttribute("href")];
    if (!tid) return;
    e.preventDefault();
    const t = document.querySelector(tid);
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ── Reveal on scroll ── */
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

  /* ── Skill bars ── */
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

  /* ── Active nav link on scroll ── */
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

  /* ══════════════════════════════════════════════════
     PROJECTS — 3-card focus carousel
     · Center card = full size, sides = smaller + faded
     · Auto-scroll slow, pauses on hover/interaction
     · No arrows — dots only (large hit area)
     · Swipe + drag + keyboard
  ══════════════════════════════════════════════════ */
  const viewport = document.getElementById("projViewport");
  const track = document.getElementById("projTrack");
  const dotsEl = document.getElementById("projDots");

  if (!viewport || !track) return;

  const cards = Array.from(track.querySelectorAll(".proj-card"));
  const dots = dotsEl ? Array.from(dotsEl.querySelectorAll(".proj-dot")) : [];
  const TOTAL = cards.length;
  const CARD_W = 400 + 24; // card width + gap (matches CSS)
  const AUTO_INTERVAL = 4000; // ms between auto-advances

  let current = 0;
  let busy = false;
  let paused = false; // paused by hover/interaction
  let autoTimer = null;

  /* ── Get responsive card width ── */
  function getCardW() {
    const card = cards[0];
    if (!card) return CARD_W;
    return card.offsetWidth + 24;
  }

  /* ── Move track so current card is centered ── */
  function getOffset(idx) {
    const cw = getCardW();
    // viewport center minus card center
    return -(idx * cw);
  }

  /* ── Apply transform ── */
  function applyOffset(animate) {
    if (!animate) track.classList.add("no-anim");
    else track.classList.remove("no-anim");
    track.style.transform = `translateX(${getOffset(current)}px)`;
  }

  /* ── Update card states + dots ── */
  function syncState() {
    cards.forEach((c, i) => c.classList.toggle("active", i === current));
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  /* ── Go to index ── */
  function goTo(idx) {
    if (busy) return;
    // wrap around
    if (idx < 0) idx = TOTAL - 1;
    if (idx >= TOTAL) idx = 0;
    if (idx === current) return;
    busy = true;
    current = idx;
    applyOffset(true);
    syncState();
    setTimeout(() => {
      busy = false;
    }, 650);
  }

  /* ── Auto-scroll ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, AUTO_INTERVAL);
  }
  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /* pause on hover over section, resume when mouse leaves */
  const section = document.getElementById("projects-section");
  if (section) {
    section.addEventListener("mouseenter", () => {
      paused = true;
    });
    section.addEventListener("mouseleave", () => {
      paused = false;
    });
  }

  /* ── Dot clicks ── */
  dots.forEach((d, i) => {
    d.addEventListener("click", () => {
      paused = true;
      goTo(i);
      // resume auto after 6s of no interaction
      clearTimeout(d._resumeT);
      d._resumeT = setTimeout(() => {
        paused = false;
      }, 6000);
    });
  });

  /* ── Keyboard ── */
  document.addEventListener("keydown", (e) => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
    if (e.key === "ArrowLeft") {
      paused = true;
      goTo(current - 1);
    }
    if (e.key === "ArrowRight") {
      paused = true;
      goTo(current + 1);
    }
  });

  /* ── Touch swipe ── */
  let touchX = 0;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.touches[0].clientX;
      paused = true;
    },
    { passive: true },
  );
  viewport.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (dx < -50) goTo(current + 1);
      if (dx > 50) goTo(current - 1);
      setTimeout(() => {
        paused = false;
      }, 4000);
    },
    { passive: true },
  );

  /* ── Mouse drag ── */
  let mouseDown = false,
    mouseStartX = 0,
    mouseMoved = false;
  viewport.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    mouseMoved = false;
    paused = true;
    viewport.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    if (Math.abs(e.clientX - mouseStartX) > 8) mouseMoved = true;
  });
  window.addEventListener("mouseup", (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    viewport.style.cursor = "";
    if (!mouseMoved) return;
    const dx = e.clientX - mouseStartX;
    if (dx < -60) goTo(current + 1);
    if (dx > 60) goTo(current - 1);
    setTimeout(() => {
      paused = false;
    }, 4000);
  });

  /* ── Clicking a side card navigates to it ── */
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (mouseMoved) return;
      if (i !== current) {
        paused = true;
        goTo(i);
        setTimeout(() => {
          paused = false;
        }, 4000);
      }
    });
  });

  /* ── Init ── */
  // give layout time to settle then set initial position
  requestAnimationFrame(() => {
    applyOffset(false);
    syncState();
    startAuto();
  });

  // recalculate on resize
  window.addEventListener("resize", () => {
    applyOffset(false);
  });
})();
