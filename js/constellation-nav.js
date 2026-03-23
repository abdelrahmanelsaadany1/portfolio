/* ══════════════════════════════════════════════════
   CONSTELLATION NAV — AWWWARDS EDITION
   + Magnetic hover on nav links
══════════════════════════════════════════════════ */
(function () {
  const wrap = document.getElementById("constWrap");
  const canvas = document.getElementById("constellation-canvas");
  if (!wrap || !canvas) return;

  const ctx = canvas.getContext("2d");
  const links = document.querySelectorAll(".c-link");

  const STAR_SPACING = window.innerWidth < 1150 ? 130 : 160;
  const NAV_W = STAR_SPACING * (links.length - 1) + 120;
  const NAV_H = 80;
  const CY = NAV_H / 2;
  const starX = Array.from(links).map((_, i) => 60 + i * STAR_SPACING);

  canvas.width = NAV_W;
  canvas.height = NAV_H;
  wrap.style.width = NAV_W + "px";
  wrap.style.height = NAV_H + "px";

  links.forEach((link, i) => {
    link.style.left = starX[i] + "px";
    link.style.top = CY - 4 + "px";
  });

  /* ── Background stars ── */
  const bgStars = Array.from({ length: 32 }, () => ({
    x: Math.random() * NAV_W,
    y: Math.random() * NAV_H,
    r: Math.random() * 0.9 + 0.2,
    a: Math.random() * 0.4 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  let trailParticles = [];
  let hoveredIndex = -1;

  /* ══════════════════════════════════════════════
     MAGNETIC HOVER
     Each link pulls toward cursor within radius
  ══════════════════════════════════════════════ */
  const MAGNET_RADIUS = 60; /* px — pull zone */
  const MAGNET_STRENGTH = 0.35; /* 0..1 — how far it moves */

  /* Current magnetic offsets per link */
  const magX = new Array(links.length).fill(0);
  const magY = new Array(links.length).fill(0);
  const magVX = new Array(links.length).fill(0);
  const magVY = new Array(links.length).fill(0);

  function updateMagnetic(mx, my) {
    const rect = canvas.getBoundingClientRect();
    links.forEach((link, i) => {
      /* Star center in viewport coords */
      const sx = rect.left + starX[i];
      const sy = rect.top + CY;
      const dx = mx - sx;
      const dy = my - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX = 0;
      let targetY = 0;

      if (dist < MAGNET_RADIUS) {
        const force = 1 - dist / MAGNET_RADIUS;
        targetX = dx * force * MAGNET_STRENGTH;
        targetY = dy * force * MAGNET_STRENGTH;
      }

      /* Spring toward target */
      magVX[i] += (targetX - magX[i]) * 0.22;
      magVY[i] += (targetY - magY[i]) * 0.22;
      magVX[i] *= 0.72;
      magVY[i] *= 0.72;
      magX[i] += magVX[i];
      magY[i] += magVY[i];

      /* Apply as CSS transform — keeps absolute positioning intact */
      link.style.transform = `translate(calc(-50% + ${magX[i]}px), calc(-50% + ${magY[i]}px))`;
    });
  }

  /* Relax all magnets when mouse leaves */
  function relaxMagnetic() {
    links.forEach((_, i) => {
      magVX[i] += (0 - magX[i]) * 0.22;
      magVY[i] += (0 - magY[i]) * 0.22;
      magVX[i] *= 0.72;
      magVY[i] *= 0.72;
      magX[i] += magVX[i];
      magY[i] += magVY[i];
      const link = links[i];
      link.style.transform = `translate(calc(-50% + ${magX[i]}px), calc(-50% + ${magY[i]}px))`;
    });
  }

  /* ── Magnetic runs every frame ── */
  let mouseInNav = false;
  let globalMouseX = 0;
  let globalMouseY = 0;

  document.addEventListener(
    "mousemove",
    (e) => {
      globalMouseX = e.clientX;
      globalMouseY = e.clientY;
    },
    { passive: true },
  );

  /* ── Hover for trail particles ── */
  wrap.addEventListener("mousemove", (e) => {
    mouseInNav = true;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearest = -1;
    let bestD = 55;
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
    mouseInNav = false;
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

  /* ══════════════════════════════════════════════
     CANVAS DRAW
  ══════════════════════════════════════════════ */
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, NAV_W, NAV_H);
    t += 0.012;

    const ai = getActiveIdx();

    /* Background stars */
    bgStars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a * (0.6 + 0.4 * Math.sin(t + s.pulse))})`;
      ctx.fill();
    });

    /* Connections between stars */
    for (let i = 0; i < starX.length - 1; i++) {
      const hot =
        i === ai ||
        i + 1 === ai ||
        i === hoveredIndex ||
        i + 1 === hoveredIndex;
      const g = ctx.createLinearGradient(starX[i], CY, starX[i + 1], CY);
      if (hot) {
        g.addColorStop(0, "rgba(48,205,207,0.65)");
        g.addColorStop(0.5, "rgba(48,205,207,0.95)");
        g.addColorStop(1, "rgba(48,205,207,0.65)");
      } else {
        g.addColorStop(0, "rgba(255,255,255,0.05)");
        g.addColorStop(0.5, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(255,255,255,0.05)");
      }
      ctx.beginPath();
      ctx.moveTo(starX[i], CY);
      ctx.lineTo(starX[i + 1], CY);
      ctx.strokeStyle = g;
      ctx.lineWidth = hot ? 1.8 : 0.9;
      ctx.stroke();
    }

    /* Travelling glow on active segment */
    if (ai >= 0) {
      const isP = ai === 1;
      const fromX = isP ? starX[0] : starX[Math.max(ai - 1, 0)];
      const toX = isP
        ? starX[starX.length - 1]
        : starX[Math.min(ai + 1, starX.length - 1)];
      const px = fromX + (toX - fromX) * ((Math.sin(t * 1.8) + 1) / 2);
      const g2 = ctx.createRadialGradient(px, CY, 0, px, CY, 14);
      g2.addColorStop(0, "rgba(48,205,207,0.9)");
      g2.addColorStop(1, "rgba(48,205,207,0)");
      ctx.beginPath();
      ctx.arc(px, CY, 14, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
    }

    /* Trail particles */
    trailParticles = trailParticles.filter((p) => p.life > 0);
    trailParticles.forEach((p) => {
      p.life -= p.speed;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
      g.addColorStop(0, `rgba(48,205,207,${p.life})`);
      g.addColorStop(1, "rgba(48,205,207,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    /* ── Update magnetic offsets every frame ── */
    if (mouseInNav) {
      updateMagnetic(globalMouseX, globalMouseY);
    } else {
      relaxMagnetic();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
