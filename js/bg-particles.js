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