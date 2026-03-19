/* ════════════════════════════════════════════════════
   CONTACT FORM — Orbital Ring Particle System
   Preserves site theme (--teal: #30cdcf)
════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── DOM guards ── */
  const formWrap = document.getElementById("ct-form-wrap");
  const flashEl = document.getElementById("ct-flash");
  const successEl = document.getElementById("ct-success");
  if (!formWrap || !successEl) return;

  /* GSAP required */
  const G = window.gsap;
  if (!G) {
    console.warn("contact-form.js: GSAP not found");
    return;
  }

  /* ── Constants ── */
  const CX = 400,
    CY = 400,
    R = 308;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ── State ── */
  const S = {
    name: false,
    email: false,
    msg: false,
    ready: false,
    busy: false,
  };

  const orb = {
    a: { angle: 270, tl: null },
    b: { angle: 0, tl: null },
    c: { angle: 90, tl: null },
  };

  /* ── Particle helpers ── */
  function toXY(deg) {
    const r = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) };
  }

  function placeParticle(key, deg) {
    const { x, y } = toXY(deg);
    ["c", "h"].forEach((s) => {
      const el = document.getElementById(`ct-p${key}-${s}`);
      if (el) {
        el.setAttribute("cx", x);
        el.setAttribute("cy", y);
      }
    });
  }

  function startOrbit(key, startDeg, secs) {
    const o = orb[key];
    o.angle = startDeg;
    if (o.tl) o.tl.kill();
    const prx = { a: startDeg };
    o.tl = G.to(prx, {
      a: startDeg + 360,
      duration: secs,
      repeat: -1,
      ease: "none",
      onUpdate() {
        o.angle = prx.a % 360;
        placeParticle(key, o.angle);
      },
    });
  }

  function stopOrbit(key) {
    if (orb[key].tl) {
      orb[key].tl.kill();
      orb[key].tl = null;
    }
    G.to(`#ct-p${key}`, { opacity: 0, duration: 0.4 });
  }

  /* ── Ambient ring animations ── */
  function ambient() {
    G.to("#ct-amb", {
      rotation: 360,
      transformOrigin: `${CX}px ${CY}px`,
      duration: 16,
      repeat: -1,
      ease: "none",
    });
    G.to(["#ct-nd0", "#ct-nd1", "#ct-nd2", "#ct-nd3"], {
      opacity: 0.9,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.6,
    });
    G.to("#ct-ticks", {
      opacity: 0.45,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  /* ── Ring glow level (0–3) ── */
  function setGlow(n) {
    const midAlpha = [0.2, 0.4, 0.62, 0.92][n];
    const edgeAlpha = [0.14, 0.28, 0.48, 0.72][n];
    const energyAlp = [0, 0.04, 0.1, 0.22][n];
    const coreAlp = [0, 0, 0.6, 1][n];
    G.to("#ct-tr-mid", { opacity: midAlpha, duration: 0.7 });
    G.to(["#ct-tr-out", "#ct-tr-in"], { opacity: edgeAlpha, duration: 0.7 });
    G.to("#ct-rp", { opacity: energyAlp, duration: 0.7 });
    G.to("#ct-core", { opacity: coreAlp, duration: 0.9 });
  }

  /* ── Sync UI (dots, progress bar, button) ── */
  const LABELS = ["0 / 3", "1 / 3", "2 / 3", "Ready →"];

  function syncUI() {
    const count = [S.name, S.email, S.msg].filter(Boolean).length;

    document.getElementById("ct-d0").classList.toggle("lit", S.name);
    document.getElementById("ct-d1").classList.toggle("lit", S.email);
    document.getElementById("ct-d2").classList.toggle("lit", S.msg);

    document.getElementById("ct-pfill").style.width = (count / 3) * 100 + "%";
    const lbl = document.getElementById("ct-plbl");
    lbl.textContent = LABELS[count];
    lbl.classList.toggle("active", count > 0);

    setGlow(count);

    const all = S.name && S.email && S.msg;
    const btn = document.getElementById("ct-btn");

    if (all && !S.ready) {
      S.ready = true;
      btn.classList.add("ready");
      btn.removeAttribute("disabled");
      Object.values(orb).forEach((o) => {
        if (o.tl) o.tl.timeScale(2.2);
      });
      G.to(["#ct-nd0", "#ct-nd1", "#ct-nd2", "#ct-nd3"], {
        filter: "url(#ct-glow-p)",
        duration: 0.5,
      });
    }
    if (!all && S.ready) {
      S.ready = false;
      btn.classList.remove("ready");
      btn.setAttribute("disabled", "");
      Object.values(orb).forEach((o) => {
        if (o.tl) o.tl.timeScale(1);
      });
      G.to(["#ct-nd0", "#ct-nd1", "#ct-nd2", "#ct-nd3"], {
        filter: "url(#ct-glow-sm)",
        duration: 0.5,
      });
    }
  }

  /* ── Hint helpers ── */
  const timers = {};
  function showHint(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add("show");
    }
  }
  function hideHint(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("show");
  }
  function setFieldState(fid, state) {
    const el = document.getElementById(fid);
    if (!el) return;
    el.classList.toggle("valid", state === "valid");
    el.classList.toggle("error", state === "error");
  }

  /* ── Field: Name ── */
  document.getElementById("ct-in").addEventListener("input", (e) => {
    clearTimeout(timers.n);
    hideHint("ct-hn");
    const v = e.target.value.trim();
    const ok = v.length >= 2;
    if (ok !== S.name) {
      S.name = ok;
      setFieldState("ct-fn", ok ? "valid" : "none");
      if (ok) {
        placeParticle("a", 270);
        G.to("#ct-pa", { opacity: 1, duration: 0.5 });
        startOrbit("a", 270, 14);
      } else stopOrbit("a");
      syncUI();
    }
    if (!ok && v.length > 0) {
      timers.n = setTimeout(() => {
        setFieldState("ct-fn", "error");
        showHint("ct-hn", "What should I call you?");
      }, 800);
    } else {
      setFieldState("ct-fn", ok ? "valid" : "none");
    }
  });

  /* ── Field: Email ── */
  document.getElementById("ct-ie").addEventListener("input", (e) => {
    clearTimeout(timers.e);
    hideHint("ct-he");
    const v = e.target.value.trim();
    const ok = EMAIL_RE.test(v);
    if (ok !== S.email) {
      S.email = ok;
      setFieldState("ct-fe", ok ? "valid" : "none");
      if (ok) {
        placeParticle("b", 0);
        G.to("#ct-pb", { opacity: 1, duration: 0.5 });
        startOrbit("b", 0, 9);
      } else stopOrbit("b");
      syncUI();
    }
    if (!ok && v.length > 4) {
      timers.e = setTimeout(() => {
        setFieldState("ct-fe", "error");
        showHint("ct-he", "Try name@domain.com");
      }, 800);
    } else {
      setFieldState("ct-fe", ok ? "valid" : "none");
    }
  });

  /* ── Field: Message ── */
  document.getElementById("ct-im").addEventListener("input", (e) => {
    clearTimeout(timers.m);
    hideHint("ct-hm");
    const v = e.target.value.trim();
    const ok = v.length >= 10;
    if (ok !== S.msg) {
      S.msg = ok;
      setFieldState("ct-fm", ok ? "valid" : "none");
      if (ok) {
        placeParticle("c", 90);
        G.to("#ct-pc", { opacity: 1, duration: 0.5 });
        startOrbit("c", 90, 5.5);
      } else stopOrbit("c");
      syncUI();
    }
    if (!ok && v.length > 0) {
      timers.m = setTimeout(() => {
        setFieldState("ct-fm", "error");
        showHint("ct-hm", "Tell me a little more");
      }, 800);
    } else {
      setFieldState("ct-fm", ok ? "valid" : "none");
    }
  });

  /* ── Submit ── */
  document.getElementById("ct-btn").addEventListener("click", () => {
    if (!S.ready || S.busy) return;
    S.busy = true;

    // ── BACKEND PLACEHOLDER ──────────────────
    // Formspree — uncomment and replace YOUR_ID:
    // fetch('https://formspree.io/f/YOUR_ID', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    //   body: JSON.stringify({
    //     name:    document.getElementById('ct-in').value.trim(),
    //     email:   document.getElementById('ct-ie').value.trim(),
    //     message: document.getElementById('ct-im').value.trim()
    //   })
    // });
    // ─────────────────────────────────────────

    runCollision();
  });

  /* ── Collision + success sequence ── */
  function runCollision() {
    const tl = G.timeline();

    // Converge particles to center
    tl.call(() => {
      Object.keys(orb).forEach((k) => {
        if (orb[k].tl) orb[k].tl.kill();
      });
      [
        "ct-pa-c",
        "ct-pb-c",
        "ct-pc-c",
        "ct-pa-h",
        "ct-pb-h",
        "ct-pc-h",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el)
          G.to(el, {
            attr: { cx: CX, cy: CY },
            duration: 0.6,
            ease: "power3.in",
          });
      });
    });

    // Burst
    tl.to(
      "#ct-cburst",
      { opacity: 1, attr: { r: 50 }, duration: 0.13, ease: "power4.out" },
      0.62,
    );
    tl.to(
      "#ct-cburst",
      { opacity: 0, attr: { r: 100 }, duration: 0.5, ease: "expo.out" },
      0.75,
    );

    // Rays
    tl.call(
      () => {
        G.set("#ct-rays", { opacity: 1 });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * 360,
            rad = (a * Math.PI) / 180;
          const ex = CX + Math.cos(rad) * 240,
            ey = CY + Math.sin(rad) * 240;
          const ray = document.getElementById(`ct-r${i}`);
          if (ray)
            G.fromTo(
              ray,
              { attr: { x1: CX, y1: CY, x2: CX, y2: CY }, opacity: 1 },
              {
                attr: { x2: ex, y2: ey },
                opacity: 0,
                duration: 0.7,
                ease: "expo.out",
                delay: i * 0.025,
              },
            );
        }
      },
      [],
      0.63,
    );

    // Shockwaves
    tl.to("#ct-sw1", { attr: { r: 340 }, opacity: 0.75, duration: 0.09 }, 0.63);
    tl.to("#ct-sw1", { opacity: 0, duration: 0.6, ease: "power2.out" }, 0.72);
    tl.to("#ct-sw2", { attr: { r: 380 }, opacity: 0.45, duration: 0.09 }, 0.73);
    tl.to("#ct-sw2", { opacity: 0, duration: 0.55 }, 0.82);
    tl.to("#ct-sw3", { attr: { r: 420 }, opacity: 0.2, duration: 0.09 }, 0.83);
    tl.to("#ct-sw3", { opacity: 0, duration: 0.5 }, 0.92);

    // Ring dies
    tl.to("#ct-rp", { opacity: 0.7, duration: 0.1 }, 0.63);
    tl.to(
      [
        "#ct-rp",
        "#ct-tr-mid",
        "#ct-tr-out",
        "#ct-tr-in",
        "#ct-amb",
        "#ct-ticks",
        "#ct-core",
      ],
      { opacity: 0, duration: 0.8, ease: "power2.in", stagger: 0.05 },
      0.73,
    );
    tl.to(
      ["#ct-nd0", "#ct-nd1", "#ct-nd2", "#ct-nd3"],
      { opacity: 0, duration: 0.4 },
      0.75,
    );
    tl.to(["#ct-pa", "#ct-pb", "#ct-pc"], { opacity: 0, duration: 0.35 }, 0.65);

    // Flash
    if (flashEl) {
      tl.to("#ct-flash", { opacity: 0.14, duration: 0.14 }, 0.63);
      tl.to("#ct-flash", { opacity: 0, duration: 0.7 }, 0.77);
    }

    // Success
    tl.to(
      "#ct-success",
      { opacity: 1, duration: 0.75, ease: "power2.out" },
      1.15,
    );
    tl.call(() => successEl.classList.add("show"), [], 1.15);
  }

  /* ── Reset ── */
  document.getElementById("ct-btn-reset").addEventListener("click", () => {
    G.to("#ct-success", {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        successEl.classList.remove("show");
      },
    });

    Object.assign(S, {
      name: false,
      email: false,
      msg: false,
      ready: false,
      busy: false,
    });
    Object.keys(orb).forEach((k) => {
      if (orb[k].tl) {
        orb[k].tl.kill();
        orb[k].tl = null;
      }
    });

    ["ct-in", "ct-ie", "ct-im"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    ["ct-fn", "ct-fe", "ct-fm"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("valid", "error");
    });
    ["ct-hn", "ct-he", "ct-hm"].forEach((id) => hideHint(id));

    const btn = document.getElementById("ct-btn");
    if (btn) {
      btn.classList.remove("ready");
      btn.setAttribute("disabled", "");
    }

    // Restore ring
    G.set(["#ct-sw1", "#ct-sw2", "#ct-sw3"], { attr: { r: 8 }, opacity: 0 });
    G.set("#ct-cburst", { opacity: 0, attr: { r: 18 } });
    G.set("#ct-rays", { opacity: 0 });
    G.to("#ct-tr-mid", { opacity: 0.2, duration: 0.9 });
    G.to(["#ct-tr-out", "#ct-tr-in"], { opacity: 0.14, duration: 0.9 });
    G.to("#ct-rp", { opacity: 0, duration: 0 });
    G.to("#ct-core", { opacity: 0, duration: 0.5 });
    G.to("#ct-amb", { opacity: 0.55, duration: 0.9 });
    G.to("#ct-ticks", { opacity: 0.22, duration: 0.9 });
    G.to(["#ct-nd0", "#ct-nd1", "#ct-nd2", "#ct-nd3"], {
      opacity: 0.5,
      duration: 0.7,
    });

    syncUI();
  });

  /* ── Underline animation on headline ── */
  function animateUnderline() {
    const em = document.getElementById("ct-em-word");
    if (em) setTimeout(() => em.classList.add("line-in"), 800);
  }

  /* ── Init ── */
  ambient();
  syncUI();
  animateUnderline();
})();
