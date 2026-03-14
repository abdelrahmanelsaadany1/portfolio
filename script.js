/* ═══════════════════════════════════════════════════
   SECTOR_01 — script.js  PREMIUM REMASTER
   Background: Google Antigravity-style particle void
   Deep dark · floating dust · cursor gravity field
═══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   BACKGROUND BOOT — injects #bg-root then starts
   the particle canvas engine
══════════════════════════════════════════════════ */
(function () {
  "use strict";

  function boot() {
    /* ── Inject shell ── */
    const root = document.createElement("div");
    root.id = "bg-root";
    root.innerHTML =
      '<canvas id="particle-canvas"></canvas>' +
      '<div class="bg-vignette"></div>' +
      '<div class="bg-grain"></div>';
    document.body.insertBefore(root, document.body.firstChild);

    initParticles();
  }

  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const isMobile = () => window.innerWidth < 768;

    let W = 0,
      H = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", () => {
      resize();
      buildParticles();
    });

    let mx = -9999,
      my = -9999,
      mouseActive = false;
    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        mouseActive = true;
      },
      { passive: true },
    );
    window.addEventListener("mouseleave", () => {
      mouseActive = false;
      mx = -9999;
      my = -9999;
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        mx = t.clientX;
        my = t.clientY;
        mouseActive = true;
      },
      { passive: true },
    );
    window.addEventListener("touchend", () => {
      mouseActive = false;
      mx = -9999;
      my = -9999;
    });

    const PALETTE = [
      { r: 220, g: 235, b: 232 },
      { r: 190, g: 210, b: 215 },
      { r: 0, g: 200, b: 185 },
      { r: 140, g: 195, b: 210 },
      { r: 255, g: 255, b: 255 },
    ];

    function makeParticle() {
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const big = Math.random() < 0.04;
      const r = big ? 1.4 + Math.random() * 1.2 : 0.25 + Math.random() * 0.85;
      const speed = 0.06 + Math.random() * 0.18;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        baseR: r,
        col,
        alpha: big ? 0.55 + Math.random() * 0.35 : 0.12 + Math.random() * 0.45,
        baseAlpha: 0,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.004 + Math.random() * 0.008,
        big,
      };
    }

    let particles = [];
    function buildParticles() {
      const count = isMobile()
        ? Math.floor((W * H) / 10000)
        : Math.floor((W * H) / 5500);
      const clamped = Math.max(80, Math.min(count, 380));
      particles = Array.from({ length: clamped }, () => {
        const p = makeParticle();
        p.baseAlpha = p.alpha;
        return p;
      });
    }
    buildParticles();

    const CURSOR_RADIUS = isMobile() ? 100 : 160;
    const REPULSE_RADIUS = isMobile() ? 55 : 85;
    const CONNECT_DIST = isMobile() ? 80 : 110;
    const CONNECT_ALPHA = 0.055;
    const MAX_SPEED = 1.8;
    const FRICTION = 0.985;

    let lastT = 0;
    const TARGET = 1000 / 60;

    function frame(now) {
      requestAnimationFrame(frame);
      if (now - lastT < TARGET * 0.85) return;
      lastT = now;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(3,6,14,0.18)";
      ctx.fillRect(0, 0, W, H);

      const n = particles.length;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        p.twinklePhase += p.twinkleSpeed;
        const twink = 0.7 + 0.3 * Math.sin(p.twinklePhase);
        const dx = p.x - mx,
          dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (mouseActive && dist < CURSOR_RADIUS) {
          const force = 1 - dist / CURSOR_RADIUS;
          if (dist < REPULSE_RADIUS) {
            const push = (1 - dist / REPULSE_RADIUS) * 0.12;
            p.vx += (dx / (dist || 1)) * push;
            p.vy += (dy / (dist || 1)) * push;
          } else {
            const pull = force * force * 0.018;
            p.vx -= (dx / (dist || 1)) * pull;
            p.vy -= (dy / (dist || 1)) * pull;
          }
        }
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) {
          p.vx = (p.vx / spd) * MAX_SPEED;
          p.vy = (p.vy / spd) * MAX_SPEED;
        }
        p.vx += (Math.random() - 0.5) * 0.002;
        p.vy += (Math.random() - 0.5) * 0.002;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        if (p.y > H + 4) p.y = -4;
        const a = p.baseAlpha * twink;
        const { r: cr, g: cg, b: cb } = p.col;
        if (p.big) {
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          halo.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.35})`);
          halo.addColorStop(0.4, `rgba(${cr},${cg},${cb},${a * 0.12})`);
          halo.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(a, 0.95)})`;
        ctx.fill();
      }

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const pi = particles[i],
            pj = particles[j];
          const dx = pi.x - pj.x,
            dy = pi.y - pj.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > CONNECT_DIST) continue;
          const lineAlpha = CONNECT_ALPHA * (1 - d / CONNECT_DIST);
          const midX = (pi.x + pj.x) * 0.5,
            midY = (pi.y + pj.y) * 0.5;
          const mDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
          const cursorBoost =
            mouseActive && mDist < CURSOR_RADIUS
              ? (1 - mDist / CURSOR_RADIUS) * 0.18
              : 0;
          const la = lineAlpha + cursorBoost;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.strokeStyle =
            cursorBoost > 0.04
              ? `rgba(0,221,200,${la})`
              : `rgba(180,220,220,${la})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      if (mouseActive) {
        const hg = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_RADIUS);
        hg.addColorStop(0, "rgba(0,221,200,0.06)");
        hg.addColorStop(0.35, "rgba(0,200,185,0.03)");
        hg.addColorStop(1, "rgba(0,221,200,0)");
        ctx.beginPath();
        ctx.arc(mx, my, CURSOR_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }
    }

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* ══════════════════════════════════════════════════
   TEXT SCRAMBLE ENGINE
══════════════════════════════════════════════════ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#0123456789ABCDEF";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 12);
      const end = start + Math.floor(Math.random() * 14);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "",
      complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += `<span style="color:inherit">${to}</span>`;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span style="color:rgba(48,205,207,0.65)">${char}</span>`;
      } else {
        output += `<span style="opacity:0.25">${from}</span>`;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

(function () {
  const headings = document.querySelectorAll(".section-heading h2");
  const scrambled = new Set();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !scrambled.has(entry.target)) {
          scrambled.add(entry.target);
          const el = entry.target;
          const orig = el.textContent;
          setTimeout(() => new TextScramble(el).setText(orig), 150);
        }
      });
    },
    { threshold: 0.5 },
  );
  headings.forEach((h) => obs.observe(h));
})();

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

/* ══════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════ */
(function () {
  const dot = document.getElementById("cursor-dot");
  if (!dot) return;
  const ring = document.getElementById("cursor-ring");
  if (ring) ring.style.display = "none";

  let lastTrail = 0,
    lastMX = 0,
    lastMY = 0;

  function spawnTrail(x, y, vx, vy) {
    const now = Date.now();
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (now - lastTrail < (speed > 8 ? 20 : 40)) return;
    lastTrail = now;
    const p = document.createElement("div");
    const sz = Math.random() * 4 + 1.5;
    p.className = "cursor-particle";
    p.style.cssText =
      `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;` +
      `background:radial-gradient(circle,rgba(255,255,220,${speed > 8 ? 0.95 : 0.7}) 0%,rgba(0,221,200,0.7) 55%,transparent 100%);` +
      `box-shadow:0 0 ${sz * 2.5}px rgba(0,221,200,0.8);`;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove(), { once: true });
  }

  document.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    spawnTrail(e.clientX, e.clientY, e.clientX - lastMX, e.clientY - lastMY);
    lastMX = e.clientX;
    lastMY = e.clientY;
  });

  document.addEventListener("mousedown", (e) => {
    document.body.classList.add("cursor-click");
    [0, 80, 180].forEach((delay) => {
      const r = document.createElement("div");
      r.className = "cursor-ripple";
      r.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:20px;height:20px;animation-delay:${delay}ms`;
      document.body.appendChild(r);
      r.addEventListener("animationend", () => r.remove(), { once: true });
    });
  });
  document.addEventListener("mouseup", () =>
    document.body.classList.remove("cursor-click"),
  );

  const SEL = "a,button,[data-cursor-hover],.project-card,input,textarea";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(SEL)) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(SEL)) document.body.classList.remove("cursor-hover");
  });
})();

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

/* ── Constellation Canvas (desktop nav) ── */
(function () {
  const wrap = document.getElementById("constWrap");
  const canvas = document.getElementById("constellation-canvas");
  if (!wrap || !canvas) return;
  const ctx = canvas.getContext("2d");
  const links = document.querySelectorAll(".c-link");

  const STAR_SPACING = window.innerWidth < 1150 ? 130 : 160;
  const NAV_W = STAR_SPACING * (links.length - 1) + 120;
  const NAV_H = 80,
    CY = NAV_H / 2;
  const starX = Array.from(links).map((_, i) => 60 + i * STAR_SPACING);

  canvas.width = NAV_W;
  canvas.height = NAV_H;
  wrap.style.width = NAV_W + "px";
  wrap.style.height = NAV_H + "px";
  links.forEach((link, i) => {
    link.style.left = starX[i] + "px";
    link.style.top = CY - 4 + "px";
  });

  const bgStars = Array.from({ length: 32 }, () => ({
    x: Math.random() * NAV_W,
    y: Math.random() * NAV_H,
    r: Math.random() * 0.9 + 0.2,
    a: Math.random() * 0.4 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  let trailParticles = [],
    hoveredIndex = -1;

  wrap.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearest = -1,
      bestD = 55;
    starX.forEach((sx, i) => {
      const d = Math.abs(mx - sx);
      if (d < bestD) {
        bestD = d;
        nearest = i;
      }
    });
    if (nearest !== hoveredIndex) {
      if (nearest !== -1 && hoveredIndex !== -1)
        spawnTrail(hoveredIndex, nearest);
      hoveredIndex = nearest;
    }
  });
  wrap.addEventListener("mouseleave", () => {
    hoveredIndex = -1;
  });
  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  function getActiveIdx() {
    let idx = -1;
    links.forEach((l, i) => {
      if (l.classList.contains("active")) idx = i;
    });
    return idx;
  }

  function spawnTrail(from, to) {
    const x1 = starX[from],
      x2 = starX[to];
    for (let s = 0; s < 10; s++) {
      const tt = s / 9;
      trailParticles.push({
        x: x1 + (x2 - x1) * tt + (Math.random() - 0.5) * 8,
        y: CY + (Math.random() - 0.5) * 12,
        life: 1,
        speed: 0.04 + Math.random() * 0.03,
        size: Math.random() * 2.2 + 1,
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, NAV_W, NAV_H);
    t += 0.012;
    const ai = getActiveIdx();
    bgStars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * (0.6 + 0.4 * Math.sin(t + s.pulse))})`;
      ctx.fill();
    });
    for (let i = 0; i < starX.length - 1; i++) {
      const hot =
        i === ai ||
        i + 1 === ai ||
        i === hoveredIndex ||
        i + 1 === hoveredIndex;
      const g = ctx.createLinearGradient(starX[i], CY, starX[i + 1], CY);
      if (hot) {
        g.addColorStop(0, "rgba(0,221,200,0.65)");
        g.addColorStop(0.5, "rgba(0,221,200,0.95)");
        g.addColorStop(1, "rgba(0,221,200,0.65)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.06)");
        g.addColorStop(0.5, "rgba(255,255,255,0.15)");
        g.addColorStop(1, "rgba(255,255,255,0.06)");
      }
      ctx.beginPath();
      ctx.moveTo(starX[i], CY);
      ctx.lineTo(starX[i + 1], CY);
      ctx.strokeStyle = g;
      ctx.lineWidth = hot ? 1.8 : 0.9;
      ctx.stroke();
      if (!hot) {
        ctx.beginPath();
        ctx.setLineDash([3, 9]);
        ctx.moveTo(starX[i], CY - 9);
        ctx.lineTo(starX[i + 1], CY - 9);
        ctx.strokeStyle = "rgba(0,221,200,0.05)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (ai >= 0) {
      const isP = ai === 1;
      const fromX = isP ? starX[0] : starX[Math.max(ai - 1, 0)];
      const toX = isP
        ? starX[starX.length - 1]
        : starX[Math.min(ai + 1, starX.length - 1)];
      const px = fromX + (toX - fromX) * ((Math.sin(t * 1.8) + 1) / 2);
      const g2 = ctx.createRadialGradient(px, CY, 0, px, CY, 14);
      g2.addColorStop(0, "rgba(0,221,200,0.95)");
      g2.addColorStop(1, "rgba(0,221,200,0)");
      ctx.beginPath();
      ctx.arc(px, CY, 14, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
    }
    trailParticles = trailParticles.filter((p) => p.life > 0);
    trailParticles.forEach((p) => {
      p.life -= p.speed;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      g.addColorStop(0, `rgba(0,221,200,${p.life})`);
      g.addColorStop(1, "rgba(0,221,200,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Mobile Menu ── */
(function () {
  const hamburger = document.getElementById("hamburger");
  const mobileOverlay = document.getElementById("mobileOverlay");
  if (!hamburger || !mobileOverlay) return;

  hamburger.addEventListener("click", () => {
    const isOpen = mobileOverlay.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) drawMobileConstellation();
  });

  window.closeMobile = function () {
    mobileOverlay.classList.remove("open");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  };

  function drawMobileConstellation() {
    const canvas = document.getElementById("mobile-constellation");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));
    const lines = [];
    stars.forEach((s, i) => {
      stars.forEach((s2, j) => {
        if (j <= i) return;
        if (Math.hypot(s.x - s2.x, s.y - s2.y) < 100 && Math.random() > 0.6)
          lines.push([i, j]);
      });
    });
    let t = 0;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;
      lines.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.strokeStyle = "rgba(0,221,200,0.07)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * (0.6 + 0.4 * Math.sin(t + s.pulse))})`;
        ctx.fill();
      });
      if (mobileOverlay.classList.contains("open"))
        requestAnimationFrame(frame);
    }
    frame();
  }
})();

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

/* ══════════════════════════════════════════════════
   SPIDER WEB CANVAS
══════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("webCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;

  const SKILLS = [
    { name: "C#", teal: true, dim: false },
    { name: "SQL SERVER", teal: false, dim: false },
    { name: "ASP.NET", teal: false, dim: true },
    { name: ".NET", teal: false, dim: false },
    { name: "EF CORE", teal: false, dim: true },
    { name: "ANGULAR", teal: false, dim: false },
    { name: "JAVASCRIPT", teal: false, dim: true },
    { name: "GIT", teal: false, dim: false },
    { name: "LINQ", teal: false, dim: true },
    { name: "HTML · CSS", teal: false, dim: false },
  ];

  const N = SKILLS.length;
  const TEAL = "#00ddc8";
  const TEAL_A = (a) => `rgba(0,221,200,${a})`;
  const WHITE_A = (a) => `rgba(255,255,255,${a})`;

  let W,
    H,
    CX,
    CY,
    R_OUT,
    R_IN,
    t = 0;
  let hoveredNode = -1,
    activeNode = -1;
  const sparks = [],
    introParticles = [];

  function resize() {
    const sz = wrap.offsetWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = sz * dpr;
    canvas.height = sz * dpr;
    canvas.style.width = sz + "px";
    canvas.style.height = sz + "px";
    ctx.scale(dpr, dpr);
    W = H = sz;
    CX = CY = sz / 2;
    R_OUT = sz * 0.42;
    R_IN = sz * 0.135;
  }
  resize();
  window.addEventListener("resize", resize);

  function pos(i, r) {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), a };
  }

  setTimeout(() => {
    for (let i = 0; i < N; i++)
      for (let k = 0; k < 4; k++)
        setTimeout(
          () =>
            introParticles.push({
              node: i,
              progress: 0,
              speed: 0.015 + Math.random() * 0.015,
              size: Math.random() * 3 + 1.5,
              life: 1,
            }),
          k * 100 + i * 25,
        );
  }, 800);

  function getHit(mx, my) {
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      if (Math.hypot(mx - p.x, my - p.y) < 32) return i;
    }
    return -1;
  }

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const hit = getHit(e.clientX - r.left, e.clientY - r.top);
    if (hit !== hoveredNode) {
      if (hit !== -1) spawnSparks(hit, 6);
      hoveredNode = hit;
    }
    canvas.style.cursor = hit !== -1 ? "pointer" : "default";
  });
  canvas.addEventListener("mouseleave", () => {
    hoveredNode = -1;
    canvas.style.cursor = "";
  });
  canvas.addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect();
    const hit = getHit(e.clientX - r.left, e.clientY - r.top);
    if (hit !== -1) {
      activeNode = activeNode === hit ? -1 : hit;
      spawnBurst(pos(hit, R_OUT).x, pos(hit, R_OUT).y);
      spawnSparks(hit, 10);
    }
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const r = canvas.getBoundingClientRect();
      const t0 = e.touches[0];
      const hit = getHit(t0.clientX - r.left, t0.clientY - r.top);
      if (hit !== -1) {
        activeNode = activeNode === hit ? -1 : hit;
        spawnBurst(pos(hit, R_OUT).x, pos(hit, R_OUT).y);
      }
    },
    { passive: true },
  );

  function spawnSparks(ni, c) {
    for (let k = 0; k < c; k++)
      sparks.push({
        node: ni,
        progress: Math.random() * 0.25,
        speed: 0.012 + Math.random() * 0.018,
        size: Math.random() * 2.8 + 0.8,
        life: 1,
        inward: Math.random() > 0.5,
      });
  }
  function spawnBurst(x, y) {
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      sparks.push({
        burst: true,
        x,
        y,
        vx: Math.cos(a) * (2.5 + Math.random() * 4),
        vy: Math.sin(a) * (2.5 + Math.random() * 4),
        size: Math.random() * 3.5 + 1,
        life: 1,
        speed: 0.025 + Math.random() * 0.025,
      });
    }
  }
  setInterval(() => {
    if (Math.random() > 0.5)
      sparks.push({
        node: Math.floor(Math.random() * N),
        progress: 0,
        speed: 0.006 + Math.random() * 0.009,
        size: Math.random() * 1.8 + 0.4,
        life: 1,
        inward: Math.random() > 0.5,
      });
  }, 260);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.007;
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_OUT * 1.1);
    g.addColorStop(0, TEAL_A(0.04));
    g.addColorStop(0.5, TEAL_A(0.018));
    g.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUT * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    const rf = [0.28, 0.52, 0.76, 1.0];
    rf.forEach((frac, ri) => {
      const r = R_IN + (R_OUT - R_IN) * frac;
      if (ri === rf.length - 1) {
        [
          { dir: 1, speed: 0.22, alpha: 0.1, gap: 0.55, width: 1.3 },
          { dir: -1, speed: 0.12, alpha: 0.04, gap: 0.4, width: 0.7 },
        ].forEach(({ dir, speed, alpha, width, gap }) => {
          for (let s = 0; s < 52; s++) {
            ctx.beginPath();
            ctx.arc(
              CX,
              CY,
              r,
              (s / 52) * Math.PI * 2 + dir * t * speed,
              ((s + gap) / 52) * Math.PI * 2 + dir * t * speed,
            );
            ctx.strokeStyle = TEAL_A(
              alpha + 0.045 * Math.sin(t * 1.6 + s * 0.3),
            );
            ctx.lineWidth = width;
            ctx.stroke();
          }
        });
      } else {
        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = TEAL_A(
          0.03 + 0.016 * Math.sin(t * 0.8 + ri * 0.9) + 0.04 * ri,
        );
        ctx.lineWidth = ri === rf.length - 2 ? 0.9 : 0.6;
        ctx.stroke();
      }
    });
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const hot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i * ((Math.PI * 2) / N));
      const sg = ctx.createLinearGradient(CX, CY, p.x, p.y);
      if (hot) {
        sg.addColorStop(0, TEAL_A(0));
        sg.addColorStop(0.2, TEAL_A(0.3));
        sg.addColorStop(0.7, TEAL_A(0.8));
        sg.addColorStop(1, TEAL_A(1));
      } else {
        sg.addColorStop(0, TEAL_A(0));
        sg.addColorStop(0.3, TEAL_A(0.05 + 0.03 * pulse));
        sg.addColorStop(0.8, TEAL_A(0.16 + 0.06 * pulse));
        sg.addColorStop(1, TEAL_A(0.3 + 0.09 * pulse));
      }
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = sg;
      ctx.lineWidth = hot ? 2 : 0.9;
      ctx.stroke();
    }
    [0.28, 0.52, 0.76].forEach((frac, ri) => {
      const r = R_IN + (R_OUT - R_IN) * frac;
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const pi = pos(i, r);
        const pj = pos(j, r);
        const hot =
          i === hoveredNode ||
          j === hoveredNode ||
          i === activeNode ||
          j === activeNode;
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.strokeStyle = TEAL_A(
          hot
            ? 0.5
            : 0.055 + 0.03 * ri + 0.025 * Math.sin(t * 0.6 + i * 0.4 + ri),
        );
        ctx.lineWidth = hot ? 1.4 : 0.55;
        ctx.stroke();
      }
    });
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const pi = pos(i, R_OUT);
      const pj = pos(j, R_OUT);
      const hot =
        i === hoveredNode ||
        j === hoveredNode ||
        i === activeNode ||
        j === activeNode;
      ctx.beginPath();
      ctx.moveTo(pi.x, pi.y);
      ctx.lineTo(pj.x, pj.y);
      ctx.strokeStyle = hot ? TEAL_A(0.6) : TEAL_A(0.1);
      ctx.lineWidth = hot ? 1.6 : 0.7;
      ctx.stroke();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (s.burst) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.91;
        s.vy *= 0.91;
        s.life -= s.speed;
        const g2 = ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          s.size * 2.8,
        );
        g2.addColorStop(0, `rgba(255,255,220,${s.life * 0.95})`);
        g2.addColorStop(0.35, TEAL_A(s.life * 0.8));
        g2.addColorStop(1, TEAL_A(0));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();
      } else {
        s.progress += s.speed;
        s.life = Math.max(0, 1 - s.progress);
        const frac2 = Math.max(
          0,
          Math.min(1, s.inward ? 1 - s.progress : s.progress),
        );
        const r2 = R_IN + (R_OUT - R_IN) * frac2;
        const p2 = pos(s.node, r2);
        const g3 = ctx.createRadialGradient(
          p2.x,
          p2.y,
          0,
          p2.x,
          p2.y,
          s.size * 3.2,
        );
        g3.addColorStop(0, `rgba(255,255,220,${s.life * 0.9})`);
        g3.addColorStop(0.3, TEAL_A(s.life * 0.78));
        g3.addColorStop(1, TEAL_A(0));
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, s.size * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = g3;
        ctx.fill();
      }
      if (s.life <= 0) sparks.splice(i, 1);
    }
    for (let i = introParticles.length - 1; i >= 0; i--) {
      const s = introParticles[i];
      s.progress += s.speed;
      s.life = Math.max(0, 1 - s.progress * 0.7);
      const p2 = pos(s.node, R_IN + (R_OUT - R_IN) * Math.min(1, s.progress));
      const g4 = ctx.createRadialGradient(
        p2.x,
        p2.y,
        0,
        p2.x,
        p2.y,
        s.size * 4.5,
      );
      g4.addColorStop(0, `rgba(255,255,220,${s.life})`);
      g4.addColorStop(0.25, TEAL_A(s.life * 0.85));
      g4.addColorStop(1, TEAL_A(0));
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, s.size * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = g4;
      ctx.fill();
      if (s.progress >= 1) introParticles.splice(i, 1);
    }
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const sk = SKILLS[i];
      const hot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i * ((Math.PI * 2) / N));
      const haloR = hot ? 28 : sk.dim ? 12 : 17;
      const haloA = hot
        ? 0.42 + 0.16 * pulse
        : (sk.dim ? 0.06 : 0.13) + 0.06 * pulse;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
      halo.addColorStop(0, TEAL_A(haloA));
      halo.addColorStop(1, TEAL_A(0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
      const dotR = hot ? 8 : sk.dim ? 3.5 : 5.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
      if (hot) {
        const dg = ctx.createRadialGradient(
          p.x - dotR * 0.3,
          p.y - dotR * 0.3,
          0,
          p.x,
          p.y,
          dotR,
        );
        dg.addColorStop(0, "#fff");
        dg.addColorStop(0.4, TEAL);
        dg.addColorStop(1, TEAL_A(0.5));
        ctx.fillStyle = dg;
      } else {
        ctx.fillStyle = TEAL_A(
          sk.dim ? 0.35 + 0.15 * pulse : sk.teal ? 1 : 0.6 + 0.24 * pulse,
        );
      }
      ctx.fill();
      if (hot) {
        [dotR + 7, dotR + 16].forEach((r2, ri) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r2 + ri * 2 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = TEAL_A(
            ri === 0 ? 0.55 + 0.22 * pulse : 0.2 + 0.12 * pulse,
          );
          ctx.lineWidth = ri === 0 ? 1.3 : 0.9;
          ctx.stroke();
        });
      }
      const LABEL_GAP = W * 0.064;
      const lx = CX + (R_OUT + LABEL_GAP) * Math.cos(p.a);
      const ly = CY + (R_OUT + LABEL_GAP) * Math.sin(p.a);
      ctx.font = `700 ${Math.max(9, Math.min(13, W * 0.027))}px 'Rajdhani',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (hot) {
        ctx.shadowColor = TEAL;
        ctx.shadowBlur = 18;
      }
      ctx.fillStyle = hot
        ? TEAL_A(0.95 + 0.05 * pulse)
        : sk.teal
          ? TEAL
          : sk.dim
            ? WHITE_A(0.28 + 0.08 * pulse)
            : WHITE_A(0.74 + 0.12 * pulse);
      ctx.fillText(sk.name.toUpperCase(), lx, ly);
      ctx.shadowBlur = 0;
      const t1 = R_OUT * 1.035,
        t2 = R_OUT * 1.075;
      ctx.beginPath();
      ctx.moveTo(CX + t1 * Math.cos(p.a), CY + t1 * Math.sin(p.a));
      ctx.lineTo(CX + t2 * Math.cos(p.a), CY + t2 * Math.sin(p.a));
      ctx.strokeStyle = hot ? TEAL_A(0.95) : TEAL_A(sk.dim ? 0.2 : 0.4);
      ctx.lineWidth = hot ? 2 : 0.9;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════════════
   SPIDER HANG — CV Download
══════════════════════════════════════════════════ */
(function () {
  const sPos = document.getElementById("spiderPos");
  const hang = document.getElementById("spiderHang");
  const canvas = document.getElementById("spiderCanvas");
  const btn = document.getElementById("spiderBtn");
  if (!sPos || !hang || !canvas || !btn) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const CW = 40,
    CH = 86,
    BASE_EY = 84;
  canvas.width = CW * dpr;
  canvas.height = CH * dpr;
  canvas.style.width = CW + "px";
  canvas.style.height = CH + "px";
  ctx.scale(dpr, dpr);

  const AX = CW / 2,
    AY = 2;
  const TC = (a) => `rgba(0,221,200,${a})`;

  let swayT = Math.random() * Math.PI * 2,
    bobT = Math.random() * Math.PI * 2;
  let angle = 0,
    angleVel = 0;
  let hovered = false,
    hoverAmt = 0;
  let stretch = 0,
    stretchV = 0;
  let started = false,
    crawlP = 0;
  let retracting = false,
    retractP = 0;

  sPos.style.opacity = "0";
  sPos.style.transition = "opacity 0.8s ease";
  setTimeout(() => {
    sPos.style.opacity = "1";
    started = true;
  }, 3400);

  function bez(tt, x0, y0, x1, y1, x2, y2) {
    const m = 1 - tt;
    return {
      x: m * m * x0 + 2 * m * tt * x1 + tt * tt * x2,
      y: m * m * y0 + 2 * m * tt * y1 + tt * tt * y2,
    };
  }

  function drawHoverWeb(sp, amt) {
    const SC = 10,
      SL = 24;
    const angs = Array.from({ length: SC }, (_, i) => (i / SC) * Math.PI * 2);
    const eps = angs.map((a) => ({
      x: sp.x + Math.cos(a) * SL,
      y: sp.y + Math.sin(a) * SL,
    }));
    angs.forEach((a, i) => {
      const p = Math.max(0, Math.min(1, (amt - (i / SC) * 0.35) / 0.65));
      if (p <= 0) return;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x + Math.cos(a) * SL * p, sp.y + Math.sin(a) * SL * p);
      ctx.strokeStyle = TC(0.38 * amt);
      ctx.lineWidth = 0.65;
      ctx.stroke();
    });
    [0.28, 0.52, 0.76, 0.98].forEach((frac, ri) => {
      const rp = Math.max(0, Math.min(1, (amt - 0.2 - ri * 0.15) / 0.55));
      if (rp <= 0) return;
      const rpts = eps.map((ep) => ({
        x: sp.x + (ep.x - sp.x) * frac,
        y: sp.y + (ep.y - sp.y) * frac,
      }));
      const vc = rp * rpts.length;
      const fs = Math.floor(vc);
      ctx.beginPath();
      ctx.moveTo(rpts[0].x, rpts[0].y);
      for (let i = 1; i <= fs && i < rpts.length; i++) {
        const mid = {
          x: (rpts[i - 1].x + rpts[i].x) / 2,
          y: (rpts[i - 1].y + rpts[i].y) / 2,
        };
        ctx.quadraticCurveTo(rpts[i - 1].x, rpts[i - 1].y, mid.x, mid.y);
      }
      if (fs < rpts.length) {
        const pp = vc - fs;
        const prev2 = rpts[fs];
        const next2 = rpts[(fs + 1) % rpts.length];
        ctx.quadraticCurveTo(
          prev2.x,
          prev2.y,
          prev2.x + (next2.x - prev2.x) * pp * 0.5,
          prev2.y + (next2.y - prev2.y) * pp * 0.5,
        );
      }
      if (rp >= 1) {
        const last2 = rpts[rpts.length - 1];
        const f2 = rpts[0];
        ctx.quadraticCurveTo(
          last2.x,
          last2.y,
          (last2.x + f2.x) / 2,
          (last2.y + f2.y) / 2,
        );
        ctx.closePath();
      }
      ctx.strokeStyle = TC(0.28 * amt * (1 - ri * 0.12));
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, CW, CH);
    const endY = BASE_EY + stretch * 6;
    const bend = angle * 0.6;
    const cxb = AX + bend;
    const cyb = AY + (endY - AY) * 0.42;
    const ex = AX + bend * 0.35;
    const tf = retracting ? Math.max(0, 1 - retractP) : 1;
    ctx.beginPath();
    ctx.moveTo(AX, AY);
    ctx.quadraticCurveTo(
      AX + (cxb - AX) * tf,
      AY + (cyb - AY) * tf,
      AX + (ex - AX) * tf,
      AY + (endY - AY) * tf,
    );
    ctx.strokeStyle = TC(0.55);
    ctx.lineWidth = 0.9;
    ctx.shadowColor = TC(0.3);
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = TC(0.55);
    ctx.beginPath();
    ctx.arc(AX, AY, 2, 0, Math.PI * 2);
    ctx.fill();
    const REST = 0.3 + Math.sin(bobT) * 0.055;
    const spT = retracting
      ? Math.max(0, REST * (1 - retractP * 1.9)) * tf
      : REST * crawlP * tf;
    if (spT < 0.01) return;
    const sp = bez(spT, AX, AY, cxb, cyb, ex, endY);
    if (hoverAmt > 0) drawHoverWeb(sp, hoverAmt);
    ctx.shadowColor = TC(0.7);
    ctx.shadowBlur = 10;
    ctx.fillStyle = TC(0.92);
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(200,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(sp.x, sp.y - 6.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0a0b0d";
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.arc(sp.x + d * 0.9, sp.y - 7, 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = TC(0.65);
    ctx.lineWidth = 0.75;
    [
      [-6, -2],
      [-7, 1],
      [-6, 4],
      [-4, 6],
      [6, -2],
      [7, 1],
      [6, 4],
      [4, 6],
    ].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.quadraticCurveTo(
        sp.x + lx * 0.55,
        sp.y + ly * 0.4 - 2,
        sp.x + lx,
        sp.y + ly,
      );
      ctx.stroke();
    });
  }

  function animate() {
    swayT += 0.016;
    bobT += 0.008;
    angleVel += (Math.sin(swayT * 0.82) * 5 - angle) * 0.04;
    angleVel *= 0.88;
    angle += angleVel;
    stretchV += ((hovered ? 1 : 0) - stretch) * 0.1;
    stretchV *= 0.76;
    stretch += stretchV;
    hoverAmt = Math.max(0, Math.min(1, hoverAmt + (hovered ? 1 : -1) * 0.05));
    if (started && crawlP < 1) crawlP = Math.min(1, crawlP + 0.009);
    if (retracting && retractP < 1) retractP = Math.min(1, retractP + 0.045);
    hang.style.transform = `rotate(${angle * 0.5}deg)`;
    draw();
    requestAnimationFrame(animate);
  }

  btn.addEventListener("mouseenter", () => {
    hovered = true;
  });
  btn.addEventListener("mouseleave", () => {
    hovered = false;
  });
  btn.addEventListener("click", (e) => {
    if (window.matchMedia("(hover: none)").matches) return;
    e.preventDefault();
    if (retracting) return;
    retracting = true;
    retractP = 0;
    hovered = false;
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = "resume.pdf";
      a.download = "Abdelrahman Elsaadany CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        retracting = false;
        retractP = 0;
        crawlP = 0;
      }, 350);
    }, 750);
  });
  animate();
})();

/* ══════════════════════════════════════════════════
   CURSOR CLOUD — hero section only · no intro
   Desktop only · spring physics · faint opacity
══════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (window.matchMedia("(hover: none)").matches) return;

  function boot() {
    const cv = document.createElement("canvas");
    cv.id = "cursor-cloud-canvas";
    cv.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999998;";
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");

    let W = window.innerWidth,
      H = window.innerHeight;
    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let mouse = { x: W / 2, y: H / 2 };
    let center = { x: mouse.x, y: mouse.y };
    let active = false;

    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        active = true;
      },
      { passive: true },
    );
    window.addEventListener("mouseleave", () => {
      active = false;
    });

    const COLORS = [
      "rgba(0,221,200,",
      "rgba(224,232,228,",
      "rgba(0,221,200,",
      "rgba(180,220,215,",
    ];
    const TOTAL = 120;

    class Particle {
      reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 280;
        this.targetX = Math.cos(angle) * dist;
        this.targetY = Math.sin(angle) * dist;
        this.x = center.x;
        this.y = center.y;
        this.vx = 0;
        this.vy = 0;
        this.baseSize = 0.5 + Math.random() * 1.8;
        this.size = this.baseSize;
        this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.baseOpacity = 0.06 + Math.random() * 0.22;
        this.opacity = this.baseOpacity;
        this.friction = 0.92 + Math.random() * 0.04;
        this.spring = 0.001 + Math.random() * 0.002;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.012 + Math.random() * 0.02;
        this.pulseRange = 0.2 + Math.random() * 0.3;
        this.oscPhaseX = Math.random() * Math.PI * 2;
        this.oscPhaseY = Math.random() * Math.PI * 2;
        this.oscSpeedX = 0.006 + Math.random() * 0.012;
        this.oscSpeedY = 0.006 + Math.random() * 0.012;
        this.oscAmp = 25 + Math.random() * 40;
      }
      constructor() {
        this.reset();
      }
      update() {
        this.pulsePhase += this.pulseSpeed;
        this.oscPhaseX += this.oscSpeedX;
        this.oscPhaseY += this.oscSpeedY;
        const pf = Math.sin(this.pulsePhase);
        this.size = this.baseSize * (1 + pf * this.pulseRange);
        this.opacity = Math.max(0.02, this.baseOpacity * (0.8 + pf * 0.2));
        const ox = Math.sin(this.oscPhaseX) * this.oscAmp;
        const oy = Math.cos(this.oscPhaseY) * this.oscAmp;
        const tx = center.x + this.targetX + ox;
        const ty = center.y + this.targetY + oy;
        this.vx += (tx - this.x) * this.spring;
        this.vy += (ty - this.y) * this.spring;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.3, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + this.opacity.toFixed(3) + ")";
        ctx.fill();
      }
    }

    const particles = Array.from({ length: TOTAL }, () => new Particle());

    /* ── only show inside hero section ── */
    let inHero = true;
    const heroEl = document.getElementById("about");
    if (heroEl && "IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          inHero = entries[0].isIntersecting;
        },
        { threshold: 0.1 },
      ).observe(heroEl);
    }

    function frame() {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);

      /* skip during intro */
      if (document.getElementById("introScene")) return;

      /* skip outside hero */
      if (!inHero) return;

      /* skip if mouse never moved */
      if (!active) return;

      center.x += (mouse.x - center.x) * 0.025;
      center.y += (mouse.y - center.y) * 0.025;

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
    }

    frame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
