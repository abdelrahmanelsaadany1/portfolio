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