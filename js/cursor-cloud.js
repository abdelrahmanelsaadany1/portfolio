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