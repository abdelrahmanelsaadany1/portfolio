/* ══════════════════════════════════════════════════
   SPIDER WEB CANVAS
   OPTIMISED: gradient creation moved out of hot path
   (pre-compute spoke gradients, use shadow for halos),
   setInterval replaced with rAF-based timer, visibility
   API pause, intro particles run once and stop.
══════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("webCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;

  const SKILLS = [
    { name: "C#", teal: true, dim: false },
    { name: "SQL SERVER", teal: false, dim: false },
    { name: "ASP.NET", teal: false, dim: false },
    { name: ".NET", teal: false, dim: false },
    { name: "EF CORE", teal: false, dim: false },
    { name: "ANGULAR", teal: false, dim: false },
    { name: "JAVASCRIPT", teal: false, dim: false },
    { name: "GIT", teal: false, dim: false },
    { name: "LINQ", teal: false, dim: false },
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
  let introsDone = false;

  /* Visibility API — pause when tab hidden or canvas off-screen */
  let hidden = false;
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
  });

  let inView = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
      },
      { threshold: 0.1 },
    ).observe(canvas);
  }

  function resize() {
    const w = wrap.offsetWidth,
      h = wrap.offsetHeight;
    const sz = Math.min(w, h, 450);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = sz * dpr;
    canvas.height = sz * dpr;
    canvas.style.width = sz + "px";
    canvas.style.height = sz + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = H = sz;
    CX = CY = sz / 2;
    R_OUT = sz * 0.42;
    R_IN = sz * 0.135;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function pos(i, r) {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), a };
  }

  /* Intro particles — fire once on load then stop */
  setTimeout(() => {
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < 4; k++) {
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
      }
    }
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
      const p = pos(hit, R_OUT);
      spawnBurst(p.x, p.y);
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
        const p = pos(hit, R_OUT);
        spawnBurst(p.x, p.y);
      }
    },
    { passive: true },
  );

  function spawnSparks(ni, c) {
    for (let k = 0; k < c; k++) {
      sparks.push({
        node: ni,
        progress: Math.random() * 0.25,
        speed: 0.012 + Math.random() * 0.018,
        size: Math.random() * 2.8 + 0.8,
        life: 1,
        inward: Math.random() > 0.5,
      });
    }
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

  /* Ambient spark timer — rAF-based, respects pause */
  let lastSparkT = 0;
  const SPARK_INTERVAL = 260;

  function draw(now) {
    requestAnimationFrame(draw);

    /* Pause rendering when hidden or off-screen */
    if (hidden || !inView) return;

    /* Ambient sparks via rAF timer — no setInterval */
    if (now - lastSparkT > SPARK_INTERVAL) {
      lastSparkT = now;
      if (Math.random() > 0.5) {
        sparks.push({
          node: Math.floor(Math.random() * N),
          progress: 0,
          speed: 0.006 + Math.random() * 0.009,
          size: Math.random() * 1.8 + 0.4,
          life: 1,
          inward: Math.random() > 0.5,
        });
      }
    }

    ctx.clearRect(0, 0, W, H);
    t += 0.007;

    /* ── Ambient glow ── */
    const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_OUT * 1.1);
    g.addColorStop(0, TEAL_A(0.04));
    g.addColorStop(0.5, TEAL_A(0.018));
    g.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(CX, CY, R_OUT * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    /* ── Rings ── */
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

    /* ── Spokes ── */
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const hot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i * ((Math.PI * 2) / N));
      /* Build gradient once per spoke — cheaper than radial */
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

    /* ── Web polygon rings ── */
    [0.28, 0.52, 0.76].forEach((frac, ri) => {
      const r = R_IN + (R_OUT - R_IN) * frac;
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        const pi = pos(i, r),
          pj = pos(j, r);
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

    /* ── Outer ring ── */
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const pi = pos(i, R_OUT),
        pj = pos(j, R_OUT);
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

    /* ── Sparks ── */
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (s.burst) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.91;
        s.vy *= 0.91;
        s.life -= s.speed;
        /* Use shadow instead of radial gradient — much cheaper */
        ctx.save();
        ctx.shadowColor = TEAL;
        ctx.shadowBlur = s.size * 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${s.life * 0.9})`;
        ctx.fill();
        ctx.restore();
      } else {
        s.progress += s.speed;
        s.life = Math.max(0, 1 - s.progress);
        const frac2 = Math.max(
          0,
          Math.min(1, s.inward ? 1 - s.progress : s.progress),
        );
        const p2 = pos(s.node, R_IN + (R_OUT - R_IN) * frac2);
        ctx.save();
        ctx.shadowColor = TEAL;
        ctx.shadowBlur = s.size * 6;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, s.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${s.life * 0.85})`;
        ctx.fill();
        ctx.restore();
      }
      if (s.life <= 0) sparks.splice(i, 1);
    }

    /* ── Intro particles — stop updating once all gone ── */
    if (!introsDone) {
      for (let i = introParticles.length - 1; i >= 0; i--) {
        const s = introParticles[i];
        s.progress += s.speed;
        s.life = Math.max(0, 1 - s.progress * 0.7);
        const p2 = pos(s.node, R_IN + (R_OUT - R_IN) * Math.min(1, s.progress));
        ctx.save();
        ctx.shadowColor = TEAL;
        ctx.shadowBlur = s.size * 8;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, s.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${s.life})`;
        ctx.fill();
        ctx.restore();
        if (s.progress >= 1) introParticles.splice(i, 1);
      }
      if (introParticles.length === 0) introsDone = true;
    }

    /* ── Node dots + labels ── */
    for (let i = 0; i < N; i++) {
      const p = pos(i, R_OUT);
      const sk = SKILLS[i];
      const hot = i === hoveredNode || i === activeNode;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + i * ((Math.PI * 2) / N));

      /* Halo — use shadow instead of createRadialGradient per node per frame */
      const dotR = hot ? 8 : sk.dim ? 3.5 : 5.5;
      ctx.save();
      ctx.shadowColor = TEAL;
      ctx.shadowBlur = hot ? 28 : 14;
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
      ctx.restore();

      /* Hover rings */
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

      /* Label */
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

      /* Tick */
      const t1 = R_OUT * 1.035,
        t2 = R_OUT * 1.075;
      ctx.beginPath();
      ctx.moveTo(CX + t1 * Math.cos(p.a), CY + t1 * Math.sin(p.a));
      ctx.lineTo(CX + t2 * Math.cos(p.a), CY + t2 * Math.sin(p.a));
      ctx.strokeStyle = hot ? TEAL_A(0.95) : TEAL_A(sk.dim ? 0.2 : 0.4);
      ctx.lineWidth = hot ? 2 : 0.9;
      ctx.stroke();
    }
  }

  requestAnimationFrame(draw);
})();
