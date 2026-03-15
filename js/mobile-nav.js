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