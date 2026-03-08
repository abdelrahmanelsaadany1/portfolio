// ═══════════════════════════════════════════════════
// script.js — Cursor + Constellation Navbar Logic
// ═══════════════════════════════════════════════════

/* ── Custom Cursor: Energy Orb + Particles + Ripple ── */
(function () {
  const dot = document.getElementById("cursor-dot");
  if (!dot) return;

  const ring = document.getElementById("cursor-ring");
  if (ring) ring.style.display = "none";

  let lastTrail = 0;

  function spawnTrail(x, y) {
    const now = Date.now();
    if (now - lastTrail < 35) return;
    lastTrail = now;
    const p = document.createElement("div");
    p.className = "cursor-particle";
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      background:radial-gradient(circle,rgba(255,255,220,0.9) 0%,rgba(48,205,207,0.7) 60%,transparent 100%);
      box-shadow:0 0 ${size * 2}px rgba(48,205,207,0.8);
    `;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove(), { once: true });
  }

  document.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    spawnTrail(e.clientX, e.clientY);
  });

  document.addEventListener("mousedown", (e) => {
    document.body.classList.add("cursor-click");
    [0, 100, 200].forEach((delay) => {
      const r = document.createElement("div");
      r.className = "cursor-ripple";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      r.style.width = "20px";
      r.style.height = "20px";
      r.style.animationDelay = delay + "ms";
      document.body.appendChild(r);
      r.addEventListener("animationend", () => r.remove(), { once: true });
    });
  });

  document.addEventListener("mouseup", () =>
    document.body.classList.remove("cursor-click"),
  );

  const hoverEls = "a, button, [data-cursor-hover]";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverEls)) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverEls))
      document.body.classList.remove("cursor-hover");
  });
})();

/* ── Scroll Progress Bar + Header Shadow ── */
(function () {
  const bar = document.getElementById("scroll-progress");
  const header = document.getElementById("main-header");
  if (!bar) return;

  window.addEventListener("scroll", () => {
    const pct =
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
      100;
    bar.style.width = Math.min(pct, 100) + "%";
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
  });
})();

/* ── Constellation Canvas — Desktop ── */
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

  const bgStars = Array.from({ length: 28 }, () => ({
    x: Math.random() * NAV_W,
    y: Math.random() * NAV_H,
    r: Math.random() * 0.8 + 0.2,
    a: Math.random() * 0.4 + 0.1,
    pulse: Math.random() * Math.PI * 2,
  }));

  let trailParticles = [];
  let hoveredIndex = -1;

  wrap.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let nearest = -1,
      bestD = 50;
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

  /* ── Read active index live from DOM every frame ── */
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
    const steps = 8;
    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1);
      trailParticles.push({
        x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 6,
        y: CY + (Math.random() - 0.5) * 10,
        life: 1,
        speed: 0.04 + Math.random() * 0.03,
        size: Math.random() * 2 + 1,
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, NAV_W, NAV_H);
    t += 0.012;

    /* ── Always read live from DOM — fixes ball staying on wrong section ── */
    const activeIndex = getActiveIdx();

    // Background stars
    bgStars.forEach((s) => {
      const a = s.a * (0.6 + 0.4 * Math.sin(t + s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // Constellation lines
    for (let i = 0; i < starX.length - 1; i++) {
      const isActive =
        i === activeIndex ||
        i + 1 === activeIndex ||
        i === hoveredIndex ||
        i + 1 === hoveredIndex;
      const grad = ctx.createLinearGradient(starX[i], CY, starX[i + 1], CY);
      if (isActive) {
        grad.addColorStop(0, "rgba(48,205,207,0.65)");
        grad.addColorStop(0.5, "rgba(48,205,207,0.90)");
        grad.addColorStop(1, "rgba(48,205,207,0.65)");
      } else {
        grad.addColorStop(0, "rgba(255,255,255,0.06)");
        grad.addColorStop(0.5, "rgba(255,255,255,0.14)");
        grad.addColorStop(1, "rgba(255,255,255,0.06)");
      }
      ctx.beginPath();
      ctx.moveTo(starX[i], CY);
      ctx.lineTo(starX[i + 1], CY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = isActive ? 1.5 : 0.8;
      ctx.stroke();

      if (!isActive) {
        ctx.beginPath();
        ctx.setLineDash([3, 8]);
        ctx.moveTo(starX[i], CY - 8);
        ctx.lineTo(starX[i + 1], CY - 8);
        ctx.strokeStyle = "rgba(48,205,207,0.06)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Animated light pulse — tracks live active index
    if (activeIndex >= 0) {
      const isProjects = activeIndex === 1;
      const fromX = isProjects ? starX[0] : starX[Math.max(activeIndex - 1, 0)];
      const toX = isProjects
        ? starX[starX.length - 1]
        : starX[Math.min(activeIndex + 1, starX.length - 1)];
      const prog = (Math.sin(t * 1.8) + 1) / 2;
      const px = fromX + (toX - fromX) * prog;
      const g2 = ctx.createRadialGradient(px, CY, 0, px, CY, 12);
      g2.addColorStop(0, "rgba(48,205,207,0.9)");
      g2.addColorStop(1, "rgba(48,205,207,0)");
      ctx.beginPath();
      ctx.arc(px, CY, 12, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
    }

    // Trail particles
    trailParticles = trailParticles.filter((p) => p.life > 0);
    trailParticles.forEach((p) => {
      p.life -= p.speed;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      g.addColorStop(0, `rgba(48,205,207,${p.life})`);
      g.addColorStop(1, "rgba(48,205,207,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
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

    const stars = Array.from({ length: 80 }, () => ({
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
        const d = Math.hypot(s.x - s2.x, s.y - s2.y);
        if (d < 100 && Math.random() > 0.55) lines.push([i, j]);
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
        ctx.strokeStyle = "rgba(48,205,207,0.07)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      stars.forEach((s) => {
        const a = s.a * (0.6 + 0.4 * Math.sin(t + s.pulse));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });
      if (mobileOverlay.classList.contains("open"))
        requestAnimationFrame(frame);
    }
    frame();
  }
})();

/* ── Active Nav Link on Scroll ── */
(function () {
  const sections = ["about", "projects", "contact"];

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY + 120;
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) {
        document
          .querySelectorAll(".c-link")
          .forEach((l) => l.classList.remove("active"));
        const match = document.querySelector(`.c-link[href="#${id}"]`);
        if (match) match.classList.add("active");
      }
    });
  });
})();

/* ── Spider Web Canvas — Jaw-Dropping ── */
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
  const TEAL = "#30cdcf";
  const TEAL_A = (a) => `rgba(48,205,207,${a})`;
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
  const sparks = [];
  const introParticles = [];

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

  function launchIntro() {
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < 3; k++) {
        const delay = k * 120 + i * 20;
        setTimeout(() => {
          introParticles.push({
            node: i,
            progress: 0,
            speed: 0.018 + Math.random() * 0.012,
            size: Math.random() * 2.5 + 1.5,
            life: 1,
          });
        }, delay);
      }
    }
  }
  setTimeout(launchIntro, 700);

  function getHit(mx, my) {
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      if (Math.hypot(mx - p.x, my - p.y) < 30) return i;
    }
    return -1;
  }

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    const hit = getHit(e.clientX - r.left, e.clientY - r.top);
    if (hit !== hoveredNode) {
      if (hit !== -1) spawnSparks(hit, 5);
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
      const p = pos(hit, R_OUT);
      spawnBurst(p.x, p.y);
      spawnSparks(hit, 8);
    }
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const hit = getHit(touch.clientX - r.left, touch.clientY - r.top);
      if (hit !== -1) {
        activeNode = activeNode === hit ? -1 : hit;
        const p = pos(hit, R_OUT);
        spawnBurst(p.x, p.y);
      }
    },
    { passive: true },
  );

  function spawnSparks(nodeIdx, count) {
    for (let k = 0; k < count; k++) {
      sparks.push({
        node: nodeIdx,
        progress: Math.random() * 0.25,
        speed: 0.013 + Math.random() * 0.018,
        size: Math.random() * 2.5 + 0.8,
        life: 1,
        inward: Math.random() > 0.5,
      });
    }
  }

  function spawnBurst(x, y) {
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      sparks.push({
        burst: true,
        x,
        y,
        vx: Math.cos(a) * (2.5 + Math.random() * 3.5),
        vy: Math.sin(a) * (2.5 + Math.random() * 3.5),
        size: Math.random() * 3 + 1,
        life: 1,
        speed: 0.028 + Math.random() * 0.022,
      });
    }
  }

  setInterval(() => {
    if (Math.random() > 0.55) {
      sparks.push({
        node: Math.floor(Math.random() * N),
        progress: 0,
        speed: 0.007 + Math.random() * 0.01,
        size: Math.random() * 1.8 + 0.4,
        life: 1,
        inward: Math.random() > 0.5,
      });
    }
  }, 280);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.007;

    drawBackground();
    drawRings();
    drawSpokes();
    drawPolygons();
    drawSparks();
    drawIntroParticles();
    drawNodes();

    requestAnimationFrame(draw);
  }

  function drawBackground() {
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_OUT * 1.1);
    g.addColorStop(0, TEAL_A(0.03));
    g.addColorStop(0.5, TEAL_A(0.015));
    g.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUT * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawRings() {
    const ringFracs = [0.28, 0.52, 0.76, 1.0];
    ringFracs.forEach((frac, ri) => {
      const r = R_IN + (R_OUT - R_IN) * frac;
      const isOuter = ri === ringFracs.length - 1;

      if (isOuter) {
        const segs = 48;
        [
          { dir: 1, speed: 0.22, alpha: 0.1, gap: 0.55, width: 1.2, offset: 0 },
          {
            dir: -1,
            speed: 0.12,
            alpha: 0.04,
            gap: 0.4,
            width: 0.7,
            offset: r + 8,
          },
        ].forEach(({ dir, speed, alpha, gap, width, offset }) => {
          for (let s = 0; s < segs; s++) {
            const a1 = (s / segs) * Math.PI * 2 + dir * t * speed;
            const a2 = ((s + gap) / segs) * Math.PI * 2 + dir * t * speed;
            ctx.beginPath();
            ctx.arc(CX, CY, r + (offset > 0 ? 8 : 0), a1, a2);
            const bright = alpha + 0.04 * Math.sin(t * 1.5 + s * 0.3);
            ctx.strokeStyle = TEAL_A(bright);
            ctx.lineWidth = width;
            ctx.stroke();
          }
        });
      } else {
        const breath = 0.03 + 0.015 * Math.sin(t * 0.8 + ri * 0.9);
        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = TEAL_A(breath + 0.04 * ri);
        ctx.lineWidth = ri === ringFracs.length - 2 ? 0.9 : 0.6;
        ctx.stroke();
      }
    });
  }

  function drawSpokes() {
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const isHot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i * ((Math.PI * 2) / N));

      const grad = ctx.createLinearGradient(CX, CY, p.x, p.y);
      if (isHot) {
        grad.addColorStop(0, TEAL_A(0.0));
        grad.addColorStop(0.2, TEAL_A(0.3));
        grad.addColorStop(0.7, TEAL_A(0.75));
        grad.addColorStop(1, TEAL_A(1.0));
      } else {
        grad.addColorStop(0, TEAL_A(0.0));
        grad.addColorStop(0.3, TEAL_A(0.05 + 0.03 * pulse));
        grad.addColorStop(0.8, TEAL_A(0.15 + 0.05 * pulse));
        grad.addColorStop(1, TEAL_A(0.28 + 0.08 * pulse));
      }
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = isHot ? 1.8 : 0.9;
      ctx.stroke();
    }
  }

  function drawPolygons() {
    const ringFracs = [0.28, 0.52, 0.76];
    ringFracs.forEach((frac, ri) => {
      const r = R_IN + (R_OUT - R_IN) * frac;
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const pi = pos(i, r);
        const pj = pos(j, r);
        const isHot =
          i === hoveredNode ||
          j === hoveredNode ||
          i === activeNode ||
          j === activeNode;
        const alpha = isHot
          ? 0.45
          : 0.05 + 0.03 * ri + 0.02 * Math.sin(t * 0.6 + i * 0.4 + ri);
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.strokeStyle = TEAL_A(alpha);
        ctx.lineWidth = isHot ? 1.3 : 0.55;
        ctx.stroke();
      }
    });

    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const pi = pos(i, R_OUT);
      const pj = pos(j, R_OUT);
      const isHot =
        i === hoveredNode ||
        j === hoveredNode ||
        i === activeNode ||
        j === activeNode;
      ctx.beginPath();
      ctx.moveTo(pi.x, pi.y);
      ctx.lineTo(pj.x, pj.y);
      ctx.strokeStyle = isHot ? TEAL_A(0.55) : TEAL_A(0.1);
      ctx.lineWidth = isHot ? 1.5 : 0.7;
      ctx.stroke();
    }
  }

  function drawSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (s.burst) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.91;
        s.vy *= 0.91;
        s.life -= s.speed;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2.5);
        g.addColorStop(0, `rgba(255,255,220,${s.life * 0.95})`);
        g.addColorStop(0.35, TEAL_A(s.life * 0.8));
        g.addColorStop(1, TEAL_A(0));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      } else {
        s.progress += s.speed;
        s.life = Math.max(0, 1 - s.progress);
        const frac = Math.max(
          0,
          Math.min(1, s.inward ? 1 - s.progress : s.progress),
        );
        const r = R_IN + (R_OUT - R_IN) * frac;
        const p = pos(s.node, r);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s.size * 3);
        g.addColorStop(0, `rgba(255,255,220,${s.life * 0.9})`);
        g.addColorStop(0.3, TEAL_A(s.life * 0.75));
        g.addColorStop(1, TEAL_A(0));
        ctx.beginPath();
        ctx.arc(p.x, p.y, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      if (s.life <= 0) sparks.splice(i, 1);
    }
  }

  function drawIntroParticles() {
    for (let i = introParticles.length - 1; i >= 0; i--) {
      const s = introParticles[i];
      s.progress += s.speed;
      s.life = Math.max(0, 1 - s.progress * 0.7);
      const frac = Math.min(1, s.progress);
      const r = R_IN + (R_OUT - R_IN) * frac;
      const p = pos(s.node, r);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s.size * 4);
      g.addColorStop(0, `rgba(255,255,220,${s.life})`);
      g.addColorStop(0.25, TEAL_A(s.life * 0.85));
      g.addColorStop(1, TEAL_A(0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, s.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      if (s.progress >= 1) introParticles.splice(i, 1);
    }
  }

  function drawNodes() {
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const sk = SKILLS[i];
      const isHot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i * ((Math.PI * 2) / N));

      const haloR = isHot ? 26 : sk.dim ? 12 : 16;
      const haloA = isHot
        ? 0.38 + 0.15 * pulse
        : (sk.dim ? 0.06 : 0.12) + 0.06 * pulse;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
      halo.addColorStop(0, TEAL_A(haloA));
      halo.addColorStop(1, TEAL_A(0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      const dotR = isHot ? 7.5 : sk.dim ? 3.5 : 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
      if (isHot) {
        const dg = ctx.createRadialGradient(
          p.x - dotR * 0.3,
          p.y - dotR * 0.3,
          0,
          p.x,
          p.y,
          dotR,
        );
        dg.addColorStop(0, "#ffffff");
        dg.addColorStop(0.4, TEAL);
        dg.addColorStop(1, TEAL_A(0.5));
        ctx.fillStyle = dg;
      } else {
        const alpha = sk.dim
          ? 0.35 + 0.15 * pulse
          : sk.teal
            ? 1
            : 0.6 + 0.22 * pulse;
        ctx.fillStyle = TEAL_A(alpha);
      }
      ctx.fill();

      if (isHot) {
        [dotR + 6, dotR + 14].forEach((r, ri) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + ri * 2 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = TEAL_A(
            ri === 0 ? 0.5 + 0.2 * pulse : 0.18 + 0.1 * pulse,
          );
          ctx.lineWidth = ri === 0 ? 1.2 : 0.8;
          ctx.stroke();
        });
      }

      drawLabel(p, sk, i, isHot, pulse);
    }
  }

  function drawLabel(p, sk, i, isHot, pulse) {
    const LABEL_GAP = W * 0.062;
    const lx = CX + (R_OUT + LABEL_GAP) * Math.cos(p.a);
    const ly = CY + (R_OUT + LABEL_GAP) * Math.sin(p.a);

    const fs = Math.max(9, Math.min(13, W * 0.027));
    ctx.font = `700 ${fs}px 'Rajdhani', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isHot) {
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = 14;
    }

    ctx.fillStyle = isHot
      ? `rgba(48,205,207,${0.92 + 0.08 * pulse})`
      : sk.teal
        ? TEAL
        : sk.dim
          ? WHITE_A(0.28 + 0.08 * pulse)
          : WHITE_A(0.72 + 0.1 * pulse);

    ctx.fillText(sk.name.toUpperCase(), lx, ly);
    ctx.shadowBlur = 0;

    const t1 = R_OUT * 1.035,
      t2 = R_OUT * 1.075;
    ctx.beginPath();
    ctx.moveTo(CX + t1 * Math.cos(p.a), CY + t1 * Math.sin(p.a));
    ctx.lineTo(CX + t2 * Math.cos(p.a), CY + t2 * Math.sin(p.a));
    ctx.strokeStyle = isHot ? TEAL_A(0.9) : TEAL_A(sk.dim ? 0.2 : 0.38);
    ctx.lineWidth = isHot ? 1.8 : 0.9;
    ctx.stroke();
  }

  draw();
})();

/* ── Spider Hang — CV Download ── */
(function () {
  const pos = document.getElementById("spiderPos");
  const hang = document.getElementById("spiderHang");
  const canvas = document.getElementById("spiderCanvas");
  const btn = document.getElementById("spiderBtn");
  if (!pos || !hang || !canvas || !btn) return;

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const CW = 40;
  const CH = 86;
  const BASE_EY = 84; /* thread goes all the way to button top */

  canvas.width = CW * dpr;
  canvas.height = CH * dpr;
  canvas.style.width = CW + "px";
  canvas.style.height = CH + "px";
  ctx.scale(dpr, dpr);

  const AX = CW / 2;
  const AY = 2;
  const TEAL = (a) => `rgba(48,205,207,${a})`;

  /* ── State ── */
  let swayT = Math.random() * Math.PI * 2;
  let bobT = Math.random() * Math.PI * 2;
  let angle = 0;
  let angleVel = 0;
  let hovered = false;
  let hoverAmt = 0;
  let stretch = 0;
  let stretchV = 0;
  let started = false;
  let crawlP = 0;
  let retracting = false;
  let retractP = 0;

  const REST_BASE = 0.3;

  /* hide until intro completes */
  pos.style.opacity = "0";
  pos.style.transition = "opacity 0.8s ease";
  setTimeout(() => {
    pos.style.opacity = "1";
    started = true;
  }, 3400);

  /* bezier point helper */
  function bez(t, x0, y0, x1, y1, x2, y2) {
    const m = 1 - t;
    return {
      x: m * m * x0 + 2 * m * t * x1 + t * t * x2,
      y: m * m * y0 + 2 * m * t * y1 + t * t * y2,
    };
  }

  /* ── hover web — many strands + rings ── */
  function drawHoverWeb(sp, amt) {
    const STRAND_COUNT = 10;
    const STRAND_LEN = 24;
    const RING_FRACS = [0.28, 0.52, 0.76, 0.98];

    const angles = Array.from(
      { length: STRAND_COUNT },
      (_, i) => (i / STRAND_COUNT) * Math.PI * 2,
    );

    const endpoints = angles.map((a) => ({
      x: sp.x + Math.cos(a) * STRAND_LEN,
      y: sp.y + Math.sin(a) * STRAND_LEN,
    }));

    /* strands */
    angles.forEach((a, i) => {
      const delay = (i / STRAND_COUNT) * 0.35;
      const p = Math.max(0, Math.min(1, (amt - delay) / 0.65));
      if (p <= 0) return;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(
        sp.x + Math.cos(a) * STRAND_LEN * p,
        sp.y + Math.sin(a) * STRAND_LEN * p,
      );
      ctx.strokeStyle = TEAL(0.38 * amt);
      ctx.lineWidth = 0.65;
      ctx.stroke();
    });

    /* arc rings */
    RING_FRACS.forEach((frac, ri) => {
      const ringDelay = 0.2 + ri * 0.15;
      const rp = Math.max(0, Math.min(1, (amt - ringDelay) / 0.55));
      if (rp <= 0) return;

      const ringPts = endpoints.map((ep) => ({
        x: sp.x + (ep.x - sp.x) * frac,
        y: sp.y + (ep.y - sp.y) * frac,
      }));

      const visCount = rp * ringPts.length;
      const fullSegs = Math.floor(visCount);

      ctx.beginPath();
      ctx.moveTo(ringPts[0].x, ringPts[0].y);

      for (let i = 1; i <= fullSegs && i < ringPts.length; i++) {
        const prev = ringPts[i - 1];
        const curr = ringPts[i];
        const mid = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 };
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      }

      /* partial last segment */
      if (fullSegs < ringPts.length) {
        const partial = visCount - fullSegs;
        const prev = ringPts[fullSegs];
        const next = ringPts[(fullSegs + 1) % ringPts.length];
        const mid = {
          x: prev.x + (next.x - prev.x) * partial * 0.5,
          y: prev.y + (next.y - prev.y) * partial * 0.5,
        };
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      }

      /* close ring when fully drawn */
      if (rp >= 1) {
        const last = ringPts[ringPts.length - 1];
        const first = ringPts[0];
        const mid = { x: (last.x + first.x) / 2, y: (last.y + first.y) / 2 };
        ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
        ctx.closePath();
      }

      ctx.strokeStyle = TEAL(0.28 * amt * (1 - ri * 0.12));
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
  }

  /* ── main draw ── */
  function draw() {
    ctx.clearRect(0, 0, CW, CH);

    const endY = BASE_EY + stretch * 6;
    const bend = angle * 0.6;
    const cx = AX + bend;
    const cy = AY + (endY - AY) * 0.42;
    const ex = AX + bend * 0.35;

    const tf = retracting ? Math.max(0, 1 - retractP) : 1;
    const dEY = AY + (endY - AY) * tf;
    const dEX = AX + (ex - AX) * tf;
    const dCX = AX + (cx - AX) * tf;
    const dCY = AY + (cy - AY) * tf;

    /* main thread */
    ctx.beginPath();
    ctx.moveTo(AX, AY);
    ctx.quadraticCurveTo(dCX, dCY, dEX, dEY);
    ctx.strokeStyle = TEAL(0.55);
    ctx.lineWidth = 0.9;
    ctx.shadowColor = TEAL(0.3);
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* anchor dot at navbar */
    ctx.fillStyle = TEAL(0.55);
    ctx.beginPath();
    ctx.arc(AX, AY, 2, 0, Math.PI * 2);
    ctx.fill();

    /* spider position — bob up and down slowly */
    const bobOffset = Math.sin(bobT) * 0.055;
    const REST = REST_BASE + bobOffset;

    const spT = retracting
      ? Math.max(0, REST * (1 - retractP * 1.9)) * tf
      : REST * crawlP * tf;

    if (spT < 0.01) return;

    const sp = bez(spT, AX, AY, cx, cy, ex, endY);

    /* hover web drawn behind spider */
    if (hoverAmt > 0) drawHoverWeb(sp, hoverAmt);

    /* spider body */
    ctx.shadowColor = TEAL(0.7);
    ctx.shadowBlur = 9;

    /* abdomen */
    ctx.fillStyle = TEAL(0.92);
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    /* head */
    ctx.fillStyle = "rgba(200,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(sp.x, sp.y - 6.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    /* eyes */
    ctx.fillStyle = "#0a0b0d";
    [-1, 1].forEach((d) => {
      ctx.beginPath();
      ctx.arc(sp.x + d * 0.9, sp.y - 7, 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    /* legs — 4 pairs */
    ctx.strokeStyle = TEAL(0.65);
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

  /* ── animation loop ── */
  function animate() {
    swayT += 0.016;
    bobT += 0.008; /* slow bob */

    /* pendulum sway */
    const swayTarget = Math.sin(swayT * 0.82) * 5;
    angleVel += (swayTarget - angle) * 0.04;
    angleVel *= 0.88;
    angle += angleVel;

    /* hover stretch */
    stretchV += ((hovered ? 1 : 0) - stretch) * 0.1;
    stretchV *= 0.76;
    stretch += stretchV;

    /* hover web fade in/out */
    hoverAmt += (hovered ? 1 : -1) * 0.05;
    hoverAmt = Math.max(0, Math.min(1, hoverAmt));

    /* crawl down on intro */
    if (started && crawlP < 1) crawlP = Math.min(1, crawlP + 0.009);

    /* retract on click */
    if (retracting && retractP < 1) retractP = Math.min(1, retractP + 0.045);

    hang.style.transform = `rotate(${angle * 0.5}deg)`;
    draw();
    requestAnimationFrame(animate);
  }

  /* ── events ── */
  btn.addEventListener("mouseenter", () => {
    hovered = true;
  });
  btn.addEventListener("mouseleave", () => {
    hovered = false;
  });

  const isTouch = () => window.matchMedia("(hover: none)").matches;

  btn.addEventListener("click", (e) => {
    if (isTouch()) return;
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
