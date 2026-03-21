(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════
     INTRO v2-fixed: SVG + Pure Opacity Compositor
     ────────────────────────────────────────────────────
     WHAT CAUSED THE PER-RING HITCH
     ────────────────────────────────────────────────────
     Browsers promote elements to compositor layers LAZILY
     — only when their animation first fires. That promotion
     itself costs a frame paint, which is exactly the hitch
     you see on each ring appearing.

     FIXES APPLIED
     ──────────────
     1. will-change:opacity injected on every SVG element
        immediately at creation → browser promotes ALL
        layers upfront at load time, not one-by-one later.

     2. transform:scale() removed from ALL ring animations.
        Scale changes geometry → triggers repaint even on
        the compositor thread. Pure opacity is the only
        property that is 100% zero-repaint on every browser.

     3. Ring fade durations slightly staggered in length
        (not just delay) so each one fully settles before
        the next starts — no overlapping promotions.

     Boot phase  : SVG elements, CSS opacity-only animations
     Blast phase : Canvas shockwave (unchanged from original)
  ══════════════════════════════════════════════════════ */

  /* ── Spline watermark removal ────────────────────── */
  var _wm = setInterval(function () {
    var el = document
      .querySelector("spline-viewer")
      ?.shadowRoot?.querySelector("#logo");
    if (el) {
      el.remove();
      clearInterval(_wm);
    }
  }, 300);

  /* ── Scene ───────────────────────────────────────── */
  var scene = document.getElementById("introScene");
  if (!scene) return;

  /* ── Timing ──────────────────────────────────────── */
  var BLAST_START = 3.2;
  var BLAST_DUR = 0.82;
  var DONE = BLAST_START + BLAST_DUR + 0.22;

  /* ── Geometry ────────────────────────────────────── */
  var W = window.innerWidth;
  var H = window.innerHeight;
  var CX = W / 2;
  var CY = H / 2;
  var MAXR = Math.min(W, H) * 0.41;
  var DIAG = Math.hypot(CX, CY) * 1.06;
  var TAU = Math.PI * 2;

  /* ── Arc config ──────────────────────────────────── */
  var RING_N = 5;
  var ARC_N = 8;
  var ARC_GAP = 0.11;
  var ARC_SEG = (TAU - ARC_GAP * ARC_N) / ARC_N;

  /* ══════════════════════════════════════════════════
     INJECT STYLES
     ─────────────
     KEY RULE: only opacity is animated.
     No transform, no scale, no stroke-dashoffset.

     will-change:opacity on every element is set via
     the shared .il class applied at createElement time
     — this forces the browser to promote ALL layers
     at script execution, before any animation fires.
  ══════════════════════════════════════════════════ */
  var styleEl = document.createElement("style");
  var css = "";

  /* Reduce motion: skip entirely */
  css +=
    "@media(prefers-reduced-motion:reduce){#introScene{display:none!important}}";

  /* Pre-promotion class — applied to every SVG element */
  css += ".iv{will-change:opacity}";

  /* ── Rings: opacity 0 → target, pure fade, no transform ── */
  var RING_OA = [0.4, 0.33, 0.26, 0.19, 0.13];
  /* Delay each ring enough that the previous one has fully
     settled its compositor layer before the next promotes. */
  var RING_DEL = [0.1, 0.32, 0.54, 0.76, 0.98];
  /* Duration slightly shorter for inner rings (they need
     to feel snappier), longer for outer (more graceful).  */
  var RING_DUR = [0.45, 0.48, 0.5, 0.52, 0.54];

  for (var i = 0; i < RING_N; i++) {
    css +=
      "#ir" +
      i +
      "{" +
      "opacity:0;" +
      "animation:rIn" +
      i +
      " " +
      RING_DUR[i] +
      "s ease-out " +
      RING_DEL[i] +
      "s both" +
      "}" +
      "@keyframes rIn" +
      i +
      "{" +
      "0%{opacity:0}" +
      "100%{opacity:" +
      RING_OA[i] +
      "}" +
      "}";
  }

  /* ── Arcs: pure opacity stagger ──────────────────── */
  for (var j = 0; j < ARC_N; j++) {
    var d = (1.15 + j * 0.13).toFixed(3);
    css +=
      "#ia" + j + "{opacity:0;animation:arcIn .40s ease-out " + d + "s both}";
  }
  css += "@keyframes arcIn{0%{opacity:0}100%{opacity:.88}}";

  /* ── Ticks: appear just after their arc ──────────── */
  for (var j = 0; j < ARC_N; j++) {
    var dt = (1.15 + j * 0.13 + 0.36).toFixed(3);
    css +=
      "#it" + j + "{opacity:0;animation:tickIn .20s ease-out " + dt + "s both}";
  }
  css += "@keyframes tickIn{0%{opacity:0}100%{opacity:.60}}";

  /* ── Center halo: pure opacity ───────────────────── */
  css +=
    "#ihalo{opacity:0;animation:haloIn .35s ease-out .08s both}" +
    "@keyframes haloIn{0%{opacity:0}100%{opacity:.12}}";

  /* ── Center dot + slow pulse ─────────────────────── */
  css +=
    "#idot{opacity:0;" +
    "animation:dotIn .28s ease-out .06s both," +
    "dotPulse 1.8s ease-in-out .5s infinite alternate}" +
    "@keyframes dotIn{to{opacity:1}}" +
    "@keyframes dotPulse{from{opacity:.32}to{opacity:1}}";

  /* ── Ready pulse — wide soft glow + crisp thin ring ─
     Both start from opacity:0 (no pop), peak together,
     fade out before blast fires.                        */
  css +=
    "#ipulse-glow{opacity:0;" +
    "animation:plsGlow 1.0s cubic-bezier(.25,0,.75,1) 2.35s 1 forwards}" +
    "@keyframes plsGlow{" +
    "0%{opacity:0}" +
    "20%{opacity:1}" +
    "65%{opacity:.8}" +
    "100%{opacity:0}" +
    "}" +
    "#ipulse-ring{opacity:0;" +
    "animation:plsRing 1.0s cubic-bezier(.25,0,.75,1) 2.35s 1 forwards}" +
    "@keyframes plsRing{" +
    "0%{opacity:0}" +
    "20%{opacity:1}" +
    "65%{opacity:.9}" +
    "100%{opacity:0}" +
    "}";

  /* ── SVG fade-out when blast fires ───────────────── */
  css +=
    "#introSVG{will-change:opacity}" +
    "#introSVG.blast{opacity:0;transition:opacity .16s ease}";

  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════
     BUILD SVG
  ══════════════════════════════════════════════════ */
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.id = "introSVG";
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;" +
    "pointer-events:none;overflow:visible;";
  scene.appendChild(svg);

  /* mk: create + append + force pre-promotion via .iv class */
  function mk(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    /* Pre-promote compositor layer immediately at creation */
    e.setAttribute("class", "iv");
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    svg.appendChild(e);
    return e;
  }

  /* SVG arc path helper */
  function arcPath(r, a0, a1) {
    var x0 = CX + Math.cos(a0) * r;
    var y0 = CY + Math.sin(a0) * r;
    var x1 = CX + Math.cos(a1) * r;
    var y1 = CY + Math.sin(a1) * r;
    return (
      "M " +
      x0.toFixed(2) +
      " " +
      y0.toFixed(2) +
      " A " +
      r.toFixed(2) +
      " " +
      r.toFixed(2) +
      " 0 0 1 " +
      x1.toFixed(2) +
      " " +
      y1.toFixed(2)
    );
  }

  /* ── Rings ───────────────────────────────────────── */
  for (var i = 0; i < RING_N; i++) {
    mk("circle", {
      id: "ir" + i,
      cx: CX.toFixed(1),
      cy: CY.toFixed(1),
      r: ((MAXR * (i + 1)) / RING_N).toFixed(2),
      fill: "none",
      stroke: "#30cdcf",
      "stroke-width": "0.9",
    });
  }

  /* ── Arcs + ticks ────────────────────────────────── */
  for (var j = 0; j < ARC_N; j++) {
    var a0 = j * (ARC_SEG + ARC_GAP) - Math.PI / 2;
    var a1 = a0 + ARC_SEG;

    mk("path", {
      id: "ia" + j,
      d: arcPath(MAXR, a0, a1),
      fill: "none",
      stroke: "#30cdcf",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
    });

    var ex = CX + Math.cos(a1) * MAXR;
    var ey = CY + Math.sin(a1) * MAXR;
    var ex2 = CX + Math.cos(a1) * (MAXR - 9);
    var ey2 = CY + Math.sin(a1) * (MAXR - 9);
    mk("line", {
      id: "it" + j,
      x1: ex.toFixed(2),
      y1: ey.toFixed(2),
      x2: ex2.toFixed(2),
      y2: ey2.toFixed(2),
      stroke: "#ffffff",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
    });
  }

  /* ── Ready pulse — glow ring (wide soft) + crisp ring ── */
  var pulseR = (MAXR * 0.86).toFixed(2);
  /* Wide soft glow — very low opacity cap so it blends,
     not pops. stroke-width wide to simulate bloom.     */
  mk("circle", {
    id: "ipulse-glow",
    cx: CX.toFixed(1),
    cy: CY.toFixed(1),
    r: pulseR,
    fill: "none",
    stroke: "#30cdcf",
    "stroke-width": "22",
    "stroke-opacity": "0.10",
  });
  /* Crisp thin ring on top — higher opacity, 1px stroke */
  mk("circle", {
    id: "ipulse-ring",
    cx: CX.toFixed(1),
    cy: CY.toFixed(1),
    r: pulseR,
    fill: "none",
    stroke: "#30cdcf",
    "stroke-width": "1",
    "stroke-opacity": "0.55",
  });

  /* ── Halo ────────────────────────────────────────── */
  mk("circle", {
    id: "ihalo",
    cx: CX.toFixed(1),
    cy: CY.toFixed(1),
    r: "26",
    fill: "#30cdcf",
  });

  /* ── Dot ─────────────────────────────────────────── */
  mk("circle", {
    id: "idot",
    cx: CX.toFixed(1),
    cy: CY.toFixed(1),
    r: "3.5",
    fill: "#30cdcf",
  });

  /* ══════════════════════════════════════════════════
     CANVAS — shockwave only, idle during boot
  ══════════════════════════════════════════════════ */
  var canvas = document.createElement("canvas");
  canvas.id = "introCanvas";
  canvas.style.cssText =
    "position:absolute;inset:0;display:block;" +
    "width:100%;height:100%;will-change:transform;";
  scene.appendChild(canvas);

  var ctx2 = canvas.getContext("2d");
  if (!ctx2) {
    scene.remove();
    return;
  }

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx2.scale(DPR, DPR);

  /* ══════════════════════════════════════════════════
     RENDER LOOP — canvas idles during boot (clearRect only)
  ══════════════════════════════════════════════════ */
  var startTime = null;
  var blastStarted = false;
  var rafId;

  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  function nrm(v, a, b) {
    return clamp((v - a) / (b - a));
  }

  function frame(now) {
    if (!startTime) startTime = now;
    var t = (now - startTime) / 1000;

    if (t >= DONE) {
      cancelAnimationFrame(rafId);
      scene.style.pointerEvents = "none";
      setTimeout(function () {
        if (scene.parentNode) scene.remove();
        if (styleEl.parentNode) styleEl.remove();
      }, 80);
      return;
    }

    rafId = requestAnimationFrame(frame);

    /* Boot: canvas stays transparent — SVG handles visuals */
    if (t < BLAST_START) {
      ctx2.clearRect(0, 0, W, H);
      return;
    }

    /* Fade SVG out once when blast begins */
    if (!blastStarted) {
      blastStarted = true;
      svg.classList.add("blast");
    }

    /* ── Blast ─────────────────────────────────────── */
    var bt = nrm(t, BLAST_START, BLAST_START + BLAST_DUR);
    var swr = bt * DIAG;

    ctx2.clearRect(0, 0, W, H);

    ctx2.fillStyle = "#03060e";
    ctx2.fillRect(0, 0, W, H);

    if (bt < 0.14) {
      ctx2.fillStyle = "rgba(255,255,255," + (1 - bt / 0.14) * 0.46 + ")";
      ctx2.fillRect(0, 0, W, H);
    }

    ctx2.globalCompositeOperation = "destination-out";
    ctx2.beginPath();
    ctx2.arc(CX, CY, Math.max(0.5, swr), 0, TAU);
    ctx2.fillStyle = "#000";
    ctx2.fill();
    ctx2.globalCompositeOperation = "source-over";

    if (swr > 1) {
      var rf = Math.max(0, 1 - bt * 0.9);
      ctx2.setLineDash([]);
      ctx2.lineCap = "butt";

      ctx2.strokeStyle = "rgba(48,205,207," + rf * 0.18 + ")";
      ctx2.lineWidth = 26;
      ctx2.beginPath();
      ctx2.arc(CX, CY, swr, 0, TAU);
      ctx2.stroke();

      ctx2.strokeStyle = "rgba(48,205,207," + rf * 0.44 + ")";
      ctx2.lineWidth = 9;
      ctx2.beginPath();
      ctx2.arc(CX, CY, swr, 0, TAU);
      ctx2.stroke();

      ctx2.strokeStyle = "rgba(255,255,255," + rf * 0.76 + ")";
      ctx2.lineWidth = 2.5;
      ctx2.beginPath();
      ctx2.arc(CX, CY, swr, 0, TAU);
      ctx2.stroke();

      ctx2.strokeStyle = "rgba(48,205,207," + rf + ")";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.arc(CX, CY, swr + 1, 0, TAU);
      ctx2.stroke();
    }
  }

  requestAnimationFrame(frame);
})();
