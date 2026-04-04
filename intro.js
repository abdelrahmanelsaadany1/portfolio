/* ═══════════════════════════════════════════
   intro.js — Logo intro → GSAP split-screen reveal
   Requires: GSAP (loaded before this script in index.html)
═══════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Remove Spline watermark logo ── */
  var _wm = setInterval(function () {
    var viewer = document.querySelector("spline-viewer");
    if (!viewer) return;
    var el = viewer.shadowRoot && viewer.shadowRoot.querySelector("#logo");
    if (el) {
      el.remove();
      clearInterval(_wm);
    }
  }, 300);

  /* ── Scene ── */
  var scene = document.getElementById("introScene");
  if (!scene) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scene.style.display = "none";
    return;
  }

  /* Clear any old intro DOM */
  scene.innerHTML = "";

  /* ── Panels ── */
  var panelL = document.createElement("div");
  panelL.id = "intro-panel-left";
  scene.appendChild(panelL);

  var panelR = document.createElement("div");
  panelR.id = "intro-panel-right";
  scene.appendChild(panelR);

  /* ── Particle canvas ── */
  var bgCanvas = document.createElement("canvas");
  bgCanvas.id = "intro-bg-canvas";
  scene.appendChild(bgCanvas);
  var ctx = bgCanvas.getContext("2d");

  /* ── Logo ── */
  var logoWrap = document.createElement("div");
  logoWrap.id = "intro-logo-wrap";
  logoWrap.innerHTML =
    '<svg id="intro-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    "<defs>" +
    '<filter id="intro-ng" x="-120%" y="-120%" width="340%" height="340%">' +
    '<feGaussianBlur stdDeviation="3" result="b"/>' +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    "</filter></defs>" +
    '<path id="il1" d="M50 20 L20 85" fill="none" stroke="#30cdcf" stroke-width="2.5"' +
    ' stroke-linecap="round" stroke-dasharray="72" stroke-dashoffset="72" opacity="0.25"/>' +
    '<path id="il2" d="M50 20 L80 85" fill="none" stroke="#30cdcf" stroke-width="2.5"' +
    ' stroke-linecap="round" stroke-dasharray="72" stroke-dashoffset="72" opacity="0.25"/>' +
    '<path id="il3" d="M32 62 L68 62" fill="none" stroke="#30cdcf" stroke-width="2.5"' +
    ' stroke-linecap="round" stroke-dasharray="38" stroke-dashoffset="38" opacity="0.25"/>' +
    '<g id="in1" opacity="0" filter="url(#intro-ng)"><circle cx="50" cy="20" r="4.5" fill="#03060e" stroke="#30cdcf" stroke-width="2.5"/></g>' +
    '<g id="in2" opacity="0" filter="url(#intro-ng)"><circle cx="20" cy="85" r="4.5" fill="#03060e" stroke="#30cdcf" stroke-width="2.5"/></g>' +
    '<g id="in3" opacity="0" filter="url(#intro-ng)"><circle cx="80" cy="85" r="4.5" fill="#03060e" stroke="#30cdcf" stroke-width="2.5"/></g>' +
    '<g id="in4" opacity="0" filter="url(#intro-ng)"><circle cx="32" cy="62" r="3.5" fill="#03060e" stroke="#30cdcf" stroke-width="2.5"/></g>' +
    '<g id="in5" opacity="0" filter="url(#intro-ng)"><circle cx="68" cy="62" r="3.5" fill="#03060e" stroke="#30cdcf" stroke-width="2.5"/></g>' +
    "</svg>";
  scene.appendChild(logoWrap);

  /* ── Name ── */
  var nameEl = document.createElement("div");
  nameEl.id = "intro-name";
  nameEl.innerHTML =
    '<span class="first">Abdelrahman </span><span class="last">Elsaadany</span>';
  scene.appendChild(nameEl);

  /* ══════════════════════════════════════
     PARTICLES
  ══════════════════════════════════════ */
  var W, H;
  var pts = [];
  var bgRunning = true;

  function resizeCanvas() {
    W = bgCanvas.width = window.innerWidth;
    H = bgCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  for (var i = 0; i < 55; i++) {
    pts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.35 + 0.06,
      r: Math.random() * 0.8 + 0.2,
    });
  }

  function drawParticles() {
    if (!bgRunning) return;
    ctx.clearRect(0, 0, W, H);
    for (var j = 0; j < pts.length; j++) {
      var p = pts[j];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      else if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(48,205,207," + p.a + ")";
      ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ══════════════════════════════════════
     SVG TWEENS
  ══════════════════════════════════════ */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function easeBack(t) {
    var c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function tweenDash(id, from, to, dur, delay) {
    var el = document.getElementById(id);
    if (!el) return;
    var start = null;
    setTimeout(function () {
      el.setAttribute("stroke-dashoffset", from);
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.setAttribute("stroke-dashoffset", from + (to - from) * ease(p));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, delay || 0);
  }

  function tweenOp(id, from, to, dur, delay, ef) {
    var el = document.getElementById(id);
    if (!el) return;
    var fn = ef || ease,
      start = null;
    setTimeout(function () {
      el.setAttribute("opacity", from);
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.setAttribute(
          "opacity",
          Math.max(0, Math.min(1, from + (to - from) * fn(p))),
        );
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, delay || 0);
  }

  /* ══════════════════════════════════════
     KILL SCENE — guaranteed, no race conditions
  ══════════════════════════════════════ */
  var killed = false;
  function killScene() {
    if (killed) return;
    killed = true;
    bgRunning = false;
    ctx.clearRect(0, 0, W, H);
    scene.style.display = "none";
    scene.style.pointerEvents = "none";
    if (scene.parentNode) scene.parentNode.removeChild(scene);
  }

  /* ══════════════════════════════════════
     SPLIT REVEAL
  ══════════════════════════════════════ */
  function splitReveal() {
    bgRunning = false;
    ctx.clearRect(0, 0, W, H);

    gsap.to([logoWrap, nameEl], {
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
    });

    var tl = gsap.timeline({ onComplete: killScene });

    tl.to(
      panelL,
      {
        xPercent: -100,
        duration: 0.72,
        ease: "expo.inOut",
        force3D: true,
      },
      0.22,
    );

    tl.to(
      panelR,
      {
        xPercent: 100,
        duration: 0.72,
        ease: "expo.inOut",
        force3D: true,
      },
      0.22,
    );

    /* Safety net */
    setTimeout(killScene, 2000);
  }

  /* ══════════════════════════════════════
     LOGO SEQUENCE
  ══════════════════════════════════════ */
  function resetSVG() {
    document.getElementById("il1").setAttribute("stroke-dashoffset", "72");
    document.getElementById("il2").setAttribute("stroke-dashoffset", "72");
    document.getElementById("il3").setAttribute("stroke-dashoffset", "38");
    ["in1", "in2", "in3", "in4", "in5"].forEach(function (id) {
      document.getElementById(id).setAttribute("opacity", "0");
    });
    gsap.set(nameEl, { opacity: 0 });
    gsap.set(logoWrap, { opacity: 1 });
  }

  function runIntro() {
    resetSVG();

    tweenDash("il1", 72, 0, 700, 300);
    tweenOp("in1", 0, 1, 320, 320, easeBack);
    tweenOp("in2", 0, 1, 320, 950, easeBack);

    tweenDash("il2", 72, 0, 700, 530);
    tweenOp("in3", 0, 1, 320, 1180, easeBack);

    tweenDash("il3", 38, 0, 480, 1000);
    tweenOp("in4", 0, 1, 300, 1020, easeBack);
    tweenOp("in5", 0, 1, 300, 1220, easeBack);

    /* Name fade in */
    setTimeout(function () {
      gsap.to(nameEl, { opacity: 1, duration: 0.65, ease: "power2.out" });
    }, 1550);

    /* Hold → reverse → split */
    setTimeout(function () {
      gsap.to(nameEl, { opacity: 0, duration: 0.3, ease: "power2.in" });

      tweenOp("in5", 1, 0, 240, 0, ease);
      tweenOp("in4", 1, 0, 240, 55, ease);
      tweenOp("in3", 1, 0, 240, 110, ease);
      tweenOp("in2", 1, 0, 240, 165, ease);
      tweenOp("in1", 1, 0, 240, 220, ease);

      setTimeout(function () {
        tweenDash("il3", 0, 38, 430, 0);
        tweenDash("il2", 0, 72, 560, 170);
        tweenDash("il1", 0, 72, 560, 330);
      }, 300);

      setTimeout(splitReveal, 980);
    }, 3200);
  }

  /* ══════════════════════════════════════
     BOOT
  ══════════════════════════════════════ */
  function boot() {
    setTimeout(runIntro, 300);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    setTimeout(boot, 150);
  }
})();
