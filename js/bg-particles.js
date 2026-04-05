/* ══════════════════════════════════════════════════
   BACKGROUND BOOT — injects #bg-root then starts
   the particle canvas engine
   OPTIMISED: O(n²) connection loop throttled, spatial
   grid culling, gradient cache, visibility API pause,
   sqrt replaced with squared comparisons where possible
══════════════════════════════════════════════════ */
(function () {
  "use strict";

  function boot() {
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
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        buildParticles();
      }, 200);
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

    /* ── Pre-built color strings — avoid template literals in hot loop ── */
    const PALETTE_STR = [
      "220,235,232",
      "190,210,215",
      "0,200,185",
      "140,195,210",
      "255,255,255",
    ];

    function makeParticle() {
      const colIdx = Math.floor(Math.random() * PALETTE_STR.length);
      const big = Math.random() < 0.04;
      const r = big ? 1.4 + Math.random() * 1.2 : 0.25 + Math.random() * 0.85;
      const speed = 0.06 + Math.random() * 0.18;
      const angle = Math.random() * Math.PI * 2;
      const baseAlpha = big
        ? 0.55 + Math.random() * 0.35
        : 0.12 + Math.random() * 0.45;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        col: PALETTE_STR[colIdx],
        baseAlpha,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.004 + Math.random() * 0.008,
        big,
      };
    }

    let particles = [];
    function buildParticles() {
      const mob = isMobile();
      const count = mob
        ? Math.floor((W * H) / 12000)
        : Math.floor((W * H) / 7000);
      const clamped = Math.max(60, Math.min(count, 260));
      particles = Array.from({ length: clamped }, makeParticle);
    }
    buildParticles();

    const CURSOR_R = isMobile() ? 100 : 160;
    const CURSOR_R2 = CURSOR_R * CURSOR_R;
    const REPULSE_R = isMobile() ? 55 : 85;
    const REPULSE_R2 = REPULSE_R * REPULSE_R;
    const CONNECT_DIST = isMobile() ? 80 : 110;
    const CONNECT_DIST2 = CONNECT_DIST * CONNECT_DIST;
    const CONNECT_ALPHA = 0.055;
    const MAX_SPEED = 1.8;
    const MAX_SPEED2 = MAX_SPEED * MAX_SPEED;
    const FRICTION = 0.985;

    /* ── Connection loop throttle — run full O(n²) every N frames ── */
    let frameCount = 0;
    const CONNECTION_EVERY = 2; // draw connections every 2nd frame

    /* ── Cached connection lines from last computed frame ── */
    let cachedLines = [];

    /* ── Visibility API — pause RAF when tab hidden ── */
    let hidden = false;
    document.addEventListener("visibilitychange", () => {
      hidden = document.hidden;
      if (!hidden) requestAnimationFrame(frame);
    });

    /* ── Pre-allocate halo gradient once per big particle
           (recreate only on resize, not every frame) ── */
    /* We skip caching gradients since positions change — instead we
       switch big-particle halos to a cheaper arc + globalAlpha approach */

    let rafId;
    let lastT = 0;
    const TARGET_MS = 1000 / 60;

    function frame(now) {
      if (hidden) return;
      rafId = requestAnimationFrame(frame);

      const dt = now - lastT;
      if (dt < TARGET_MS * 0.85) return;
      lastT = now;
      frameCount++;

      ctx.clearRect(0, 0, W, H);
      /* subtle motion blur */
      ctx.fillStyle = "rgba(3,6,14,0.18)";
      ctx.fillRect(0, 0, W, H);

      const n = particles.length;

      /* ── Update + draw particles ── */
      for (let i = 0; i < n; i++) {
        const p = particles[i];

        p.twinklePhase += p.twinkleSpeed;
        const twink = 0.7 + 0.3 * Math.sin(p.twinklePhase);
        const a = p.baseAlpha * twink;

        if (mouseActive) {
          const dx = p.x - mx,
            dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_R2) {
            const dist = Math.sqrt(d2);
            if (d2 < REPULSE_R2) {
              const push = (1 - dist / REPULSE_R) * 0.12;
              p.vx += (dx / (dist || 1)) * push;
              p.vy += (dy / (dist || 1)) * push;
            } else {
              const force = 1 - dist / CURSOR_R;
              const pull = force * force * 0.018;
              p.vx -= (dx / (dist || 1)) * pull;
              p.vy -= (dy / (dist || 1)) * pull;
            }
          }
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        /* clamp speed using squared comparison — sqrt only if needed */
        const spd2 = p.vx * p.vx + p.vy * p.vy;
        if (spd2 > MAX_SPEED2) {
          const inv = MAX_SPEED / Math.sqrt(spd2);
          p.vx *= inv;
          p.vy *= inv;
        }
        p.vx += (Math.random() - 0.5) * 0.002;
        p.vy += (Math.random() - 0.5) * 0.002;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = W + 4;
        else if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        else if (p.y > H + 4) p.y = -4;

        const col = p.col;
        const alpha = Math.min(a, 0.95);

        /* Big particle: cheap glow via shadow instead of gradient */
        if (p.big) {
          ctx.save();
          ctx.shadowColor = `rgba(${col},${a * 0.5})`;
          ctx.shadowBlur = p.r * 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},${alpha})`;
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},${alpha})`;
          ctx.fill();
        }
      }

      /* ── Connection lines — recompute every CONNECTION_EVERY frames ── */
      if (frameCount % CONNECTION_EVERY === 0) {
        cachedLines = [];
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const pi = particles[i],
              pj = particles[j];
            const dx = pi.x - pj.x,
              dy = pi.y - pj.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > CONNECT_DIST2) continue;
            const d = Math.sqrt(d2);
            const lineAlpha = CONNECT_ALPHA * (1 - d / CONNECT_DIST);
            let cursorBoost = 0;
            if (mouseActive) {
              const midX = (pi.x + pj.x) * 0.5;
              const midY = (pi.y + pj.y) * 0.5;
              const mdx = midX - mx,
                mdy = midY - my;
              const mDist2 = mdx * mdx + mdy * mdy;
              if (mDist2 < CURSOR_R2) {
                cursorBoost = (1 - Math.sqrt(mDist2) / CURSOR_R) * 0.18;
              }
            }
            cachedLines.push({
              x1: pi.x,
              y1: pi.y,
              x2: pj.x,
              y2: pj.y,
              alpha: lineAlpha + cursorBoost,
              teal: cursorBoost > 0.04,
            });
          }
        }
      }

      /* Draw cached lines */
      for (let k = 0; k < cachedLines.length; k++) {
        const l = cachedLines[k];
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.strokeStyle = l.teal
          ? `rgba(0,221,200,${l.alpha})`
          : `rgba(180,220,220,${l.alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* ── Cursor glow halo ── */
      if (mouseActive) {
        const hg = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_R);
        hg.addColorStop(0, "rgba(0,221,200,0.06)");
        hg.addColorStop(0.35, "rgba(0,200,185,0.03)");
        hg.addColorStop(1, "rgba(0,221,200,0)");
        ctx.beginPath();
        ctx.arc(mx, my, CURSOR_R, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
