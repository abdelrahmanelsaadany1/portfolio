/* ═══════════════════════════════════════════════════
   sections.js  —  Scroll Reveal · Skill Bars · Nav
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

/* ═══════════════════════════════════════════════════
   ELECTRIC SWITCHES — Contact Form
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── DOM guards ── */
  const formWrap = document.getElementById("contactFormWrap");
  const cForm = document.getElementById("contactForm");
  const txOverlay = document.getElementById("txOverlay");
  const txCanvas = document.getElementById("txCanvas");
  if (!formWrap || !cForm || !txOverlay) return;

  /* ── Field definitions ── */
  const FIELDS = [
    {
      fg: "fg-name",
      input: "cf-name",
      ft: "ft-name",
      validate: (v) => v.trim().length > 2,
    },
    {
      fg: "fg-email",
      input: "cf-email",
      ft: "ft-email",
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
    {
      fg: "fg-subject",
      input: "cf-subject",
      ft: "ft-subject",
      validate: (v) => v.trim().length > 1,
    },
    {
      fg: "fg-msg",
      input: "cf-msg",
      ft: "ft-msg",
      validate: (v) => v.trim().length > 5,
    },
  ];

  /* ── Build switches into each .field-header ── */
  FIELDS.forEach((f) => {
    const fg = document.getElementById(f.fg);
    if (!fg) return;
    const hdr = fg.querySelector(".field-header");
    if (!hdr) return;

    const esw = document.createElement("div");
    esw.className = "esw";
    esw.id = "esw-" + f.input;
    esw.innerHTML = `
      <div class="esw-dot" id="dot-${f.input}"></div>
      <div class="esw-body">
        <div class="esw-lever" id="lev-${f.input}"></div>
        <div class="esw-spark" id="spark-${f.input}"></div>
      </div>
    `;
    hdr.appendChild(esw);
  });

  /* ── State ── */
  const state = {};
  FIELDS.forEach((f) => (state[f.input] = false));

  function countOn() {
    return Object.values(state).filter(Boolean).length;
  }

  /* ── Flip switch ON/OFF ── */
  function flipOn(f) {
    const fg = document.getElementById(f.fg);
    const spark = document.getElementById("spark-" + f.input);
    if (!fg) return;
    fg.classList.add("fg-on");
    state[f.input] = true;
    /* spark */
    if (spark) {
      spark.classList.remove("fire");
      void spark.offsetWidth; /* reflow */
      spark.classList.add("fire");
      setTimeout(() => spark.classList.remove("fire"), 350);
    }
    /* fill track */
    updateTrack(f);
    updateSubmitBtn();
  }

  function flipOff(f) {
    const fg = document.getElementById(f.fg);
    if (!fg) return;
    fg.classList.remove("fg-on");
    state[f.input] = false;
    updateTrack(f);
    updateSubmitBtn();
  }

  function updateTrack(f) {
    const el = document.getElementById(f.input);
    const ft = document.getElementById(f.ft);
    if (!el || !ft) return;
    if (state[f.input]) {
      ft.style.width = "100%";
    } else {
      /* partial fill based on current value length for in-progress feel */
      const val = el.value.trim();
      const prog = Math.min(val.length / 12, 0.85);
      ft.style.width = prog * 100 + "%";
    }
  }

  function updateSubmitBtn() {
    const btn = document.getElementById("submitBtn");
    if (!btn) return;
    const allOn = countOn() === FIELDS.length;
    btn.disabled = !allOn;
    if (allOn) {
      btn.style.borderColor = "var(--teal)";
      btn.style.boxShadow = "0 0 24px rgba(48,205,207,.35)";
    } else {
      btn.style.borderColor = "";
      btn.style.boxShadow = "";
    }
  }

  /* initial state — disable submit */
  updateSubmitBtn();

  /* ── Wire inputs ── */
  FIELDS.forEach((f) => {
    const el = document.getElementById(f.input);
    if (!el) return;

    el.addEventListener("input", () => {
      const ok = f.validate(el.value);
      if (ok && !state[f.input]) flipOn(f);
      if (!ok && state[f.input]) flipOff(f);
      if (!state[f.input]) updateTrack(f);
    });

    el.addEventListener("focus", () => {
      /* subtle track hint */
      const ft = document.getElementById(f.ft);
      if (ft && !state[f.input]) {
        const val = el.value.trim();
        ft.style.width = Math.max((val.length / 12) * 85, 8) + "%";
      }
    });

    el.addEventListener("blur", () => {
      if (!state[f.input]) updateTrack(f);
    });
  });

  /* ════════════════════════════════════════════════
     TRANSMISSION COMPLETE — cinematic sequence
  ════════════════════════════════════════════════ */

  /* particle system on the overlay canvas */
  let txParts = [];
  let txRaf = null;

  function txResizeCanvas() {
    const r = txOverlay.getBoundingClientRect();
    txCanvas.width = r.width;
    txCanvas.height = r.height;
  }

  function txSpawnParticles() {
    txParts = [];
    const cx = txCanvas.width / 2,
      cy = txCanvas.height / 2;
    for (let i = 0; i < 80; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.6 + Math.random() * 2.8;
      txParts.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 1 + Math.random() * 2.5,
        color: Math.random() > 0.5 ? "48,205,207" : "200,255,255",
      });
    }
  }

  function txDrawLoop() {
    const ctx = txCanvas.getContext("2d");
    ctx.clearRect(0, 0, txCanvas.width, txCanvas.height);

    /* grid lines — slow scan */
    const now = Date.now();
    ctx.save();
    for (let x = 0; x < txCanvas.width; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, txCanvas.height);
      ctx.strokeStyle = `rgba(48,205,207,${0.025 + 0.01 * Math.sin(x * 0.1 + now * 0.001)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let y = 0; y < txCanvas.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(txCanvas.width, y);
      ctx.strokeStyle = `rgba(48,205,207,${0.025 + 0.01 * Math.sin(y * 0.1 + now * 0.001)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    /* particles */
    for (let i = txParts.length - 1; i >= 0; i--) {
      const p = txParts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life -= p.decay;
      if (p.life <= 0) {
        txParts.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.life})`;
      ctx.fill();
    }

    txRaf = requestAnimationFrame(txDrawLoop);
  }

  /* typewriter helper */
  function typeText(el, text, speed, cb) {
    let i = 0;
    el.textContent = "";
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else if (cb) cb();
    };
    tick();
  }

  function showTxOverlay() {
    /* setup */
    txResizeCanvas();
    /* reset text spans */
    ["tl1", "tl2", "tl3", "tl4"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const t = el.querySelector(".tx-text");
        if (t) t.textContent = "";
      }
    });

    txOverlay.classList.add("show");
    txSpawnParticles();
    txDrawLoop();

    /* sequence */
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      await delay(700);
      const t1 = document.querySelector("#tl1 .tx-text");
      if (t1) await new Promise((r) => typeText(t1, "signal encrypted", 40, r));

      await delay(200);
      const t2 = document.querySelector("#tl2 .tx-text");
      if (t2)
        await new Promise((r) => typeText(t2, "channel open → ready", 40, r));

      await delay(200);
      const t3 = document.querySelector("#tl3 .tx-text");
      if (t3)
        await new Promise((r) => typeText(t3, "packet delivered  ✓", 40, r));

      await delay(300);
      const t4 = document.querySelector("#tl4 .tx-text");
      if (t4)
        await new Promise((r) => typeText(t4, "TRANSMISSION COMPLETE", 60, r));

      /* after full sequence, reset everything after 2.8s */
      await delay(2800);
      teardown();
    })();
  }

  function teardown() {
    /* stop canvas loop */
    if (txRaf) {
      cancelAnimationFrame(txRaf);
      txRaf = null;
    }
    txParts = [];

    /* hide overlay */
    txOverlay.classList.remove("show");

    /* reset all switches */
    FIELDS.forEach((f) => {
      state[f.input] = false;
      const fg = document.getElementById(f.fg);
      if (fg) fg.classList.remove("fg-on");
      const ft = document.getElementById(f.ft);
      if (ft) ft.style.width = "0%";
      const el = document.getElementById(f.input);
      if (el) el.value = "";
    });
    updateSubmitBtn();
  }

  /* ── Submit ── */
  cForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (countOn() < FIELDS.length) return;
    showTxOverlay();
  });
})();
