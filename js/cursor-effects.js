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