/* ═══════════════════════════════════════════════════════
   about-timeline.js — SCAVENGER HEXAPOD EDITION
   ► Walking hexapod robot with mechanical leg animation
   ► Glitch effect at military dip (downfall)
   ► Smooth 180° head-turn when scrolling backward
   ► Mobile: Vertical timeline layout
═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const outer = document.getElementById("hsOuter");
  const track = document.getElementById("hsTrack");
  const roadFill = document.getElementById("hsRoadFill");
  const roadGlow = document.getElementById("hsRoadGlow");
  const progFill = document.getElementById("hsProgFill");
  const hintEl = document.getElementById("hsHint");

  if (!outer || !track || !roadFill) return;

  /* ═══════════════════════════════════════
     INJECT HEXAPOD SVG into hs-track
  ═══════════════════════════════════════ */
  const hexapod = document.createElement("div");
  hexapod.id = "hsHexapod";
  hexapod.style.cssText =
    "position:absolute;width:80px;height:48px;" +
    "transform-origin:40px 24px;pointer-events:none;" +
    "z-index:20;will-change:transform,left,top;";

  hexapod.innerHTML =
    '<svg viewBox="0 0 80 48" width="80" height="48" xmlns="http://www.w3.org/2000/svg">' +
    "<defs>" +
    '<filter id="hexGlow" x="-50%" y="-100%" width="200%" height="300%">' +
    '<feGaussianBlur stdDeviation="1.8" result="b"/>' +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    "</filter>" +
    '<filter id="hexGlitch" x="-20%" y="-20%" width="140%" height="140%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" seed="2"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter>" +
    '<linearGradient id="hexBody" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%"   stop-color="#1a3a3a"/>' +
    '<stop offset="50%"  stop-color="#0d2626"/>' +
    '<stop offset="100%" stop-color="#061414"/>' +
    "</linearGradient>" +
    '<linearGradient id="hexHead" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%"   stop-color="#2a4a4a"/>' +
    '<stop offset="100%" stop-color="#0f2e2e"/>' +
    "</linearGradient>" +
    "</defs>" +
    /* shadow */
    '<ellipse cx="40" cy="46.5" rx="32" ry="1.5" fill="rgba(0,0,0,0.6)"/>' +
    /* main body segments */
    '<rect x="18" y="18" width="44" height="16" rx="4" fill="url(#hexBody)" stroke="rgba(48,205,207,0.25)" stroke-width="0.9"/>' +
    /* head (front) */
    '<ellipse cx="62" cy="20" rx="8.5" ry="10" fill="url(#hexHead)" stroke="rgba(48,205,207,0.35)" stroke-width="1"/>' +
    /* eyes (glow) */
    '<circle cx="65" cy="17" r="2.2" fill="#30cdcf" opacity="0.9" filter="url(#hexGlow)"/>' +
    '<circle cx="65" cy="17" r="1.2" fill="#e8ffff" opacity="0.95"/>' +
    '<circle cx="59" cy="17" r="2.2" fill="#30cdcf" opacity="0.7" filter="url(#hexGlow)"/>' +
    '<circle cx="59" cy="17" r="1.2" fill="#b0ffff" opacity="0.8"/>' +
    /* antenna */
    '<line x1="62" y1="9.5" x2="62" y2="4" stroke="rgba(48,205,207,0.4)" stroke-width="0.8" stroke-linecap="round"/>' +
    '<circle cx="62" cy="3.5" r="1" fill="rgba(48,205,207,0.6)"/>' +
    /* energy core on body */
    '<circle cx="40" cy="26" r="3.5" fill="rgba(48,205,207,0.3)" stroke="#30cdcf" stroke-width="1"/>' +
    '<circle cx="40" cy="26" r="2" fill="#30cdcf" opacity="0.6"/>' +
    /* teal stripe down center */
    '<line x1="40" y1="18" x2="40" y2="34" stroke="#30cdcf" stroke-width="1.2" opacity="0.5"/>' +
    /* ─────────────────────────────────────
       LEFT LEGS (3)
    ───────────────────────────────────────*/
    /* Left Front Leg */
    '<g id="legLF" class="hex-leg">' +
    '<line x1="55" y1="24" x2="70" y2="16" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="70" cy="16" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    /* Left Mid Leg */
    '<g id="legLM" class="hex-leg">' +
    '<line x1="40" y1="34" x2="28" y2="42" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="28" cy="42" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    /* Left Rear Leg */
    '<g id="legLR" class="hex-leg">' +
    '<line x1="25" y1="24" x2="8" y2="16" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="8" cy="16" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    /* ─────────────────────────────────────
       RIGHT LEGS (3)
    ───────────────────────────────────────*/
    /* Right Front Leg */
    '<g id="legRF" class="hex-leg">' +
    '<line x1="55" y1="28" x2="70" y2="36" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="70" cy="36" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    /* Right Mid Leg */
    '<g id="legRM" class="hex-leg">' +
    '<line x1="40" y1="34" x2="52" y2="42" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="52" cy="42" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    /* Right Rear Leg */
    '<g id="legRR" class="hex-leg">' +
    '<line x1="25" y1="28" x2="8" y2="36" stroke="rgba(48,205,207,0.5)" stroke-width="1.2" stroke-linecap="round"/>' +
    '<circle cx="8" cy="36" r="1.5" fill="rgba(48,205,207,0.7)"/>' +
    "</g>" +
    "</svg>";

  track.appendChild(hexapod);

  /* ═══════════════════════════════════════
     ANIMATION STATE & WALKING
  ═══════════════════════════════════════ */
  var curAngle = 0;
  var tgtAngle = 0;
  var lastRaw = 0;
  var lastDir = 1;
  var rafId = null;
  var curRaw = 0;
  var LERP = 0.09; /* lower = smoother / slower turn */
  var walkPhase = 0; /* 0-1 for leg animation cycle */
  var glitchIntensity = 0; /* 0-1 for military dip glitch */

  function normDiff(from, to) {
    var d = to - from;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  function tangentAngle(dist) {
    var len = roadFill.getTotalLength();
    var D = 18;
    var a = roadFill.getPointAtLength(Math.max(0, dist - D));
    var b = roadFill.getPointAtLength(Math.min(len, dist + D));
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
  }

  /* ─────────────────────────────────────
     LEG ANIMATION HELPERS
  ───────────────────────────────────────*/
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function animateLeg(legId, phase, offset) {
    var leg = document.getElementById(legId);
    if (!leg) return;
    var line = leg.querySelector("line");
    var circle = leg.querySelector("circle");
    if (!line || !circle) return;

    var t = (phase + offset) % 1;
    var lift = Math.sin(t * Math.PI) * 3; /* lift height */
    var x1 =
      parseFloat(line.getAttribute("data-x1")) ||
      parseFloat(line.getAttribute("x1"));
    var y1 =
      parseFloat(line.getAttribute("data-y1")) ||
      parseFloat(line.getAttribute("y1"));
    var x2 =
      parseFloat(line.getAttribute("data-x2")) ||
      parseFloat(line.getAttribute("x2"));
    var y2 =
      parseFloat(line.getAttribute("data-y2")) ||
      parseFloat(line.getAttribute("y2"));

    if (!line.getAttribute("data-x1")) {
      line.setAttribute("data-x1", x1);
      line.setAttribute("data-y1", y1);
      line.setAttribute("data-x2", x2);
      line.setAttribute("data-y2", y2);
    }

    var newY2 = y2 - lift;
    line.setAttribute("y2", newY2);
    circle.setAttribute("cy", newY2);
  }

  function updateLegAnimations(phase, direction) {
    if (direction > 0) {
      /* forward walk */
      animateLeg("legLF", phase, 0);
      animateLeg("legLM", phase, 0.33);
      animateLeg("legLR", phase, 0.66);
      animateLeg("legRF", phase, 0.33);
      animateLeg("legRM", phase, 0.66);
      animateLeg("legRR", phase, 0);
    } else {
      /* backward walk */
      animateLeg("legLF", phase, 0.33);
      animateLeg("legLM", phase, 0.66);
      animateLeg("legLR", phase, 0);
      animateLeg("legRF", phase, 0.66);
      animateLeg("legRM", phase, 0);
      animateLeg("legRR", phase, 0.33);
    }
  }

  /* ─────────────────────────────────────
     GLITCH EFFECT AT MILITARY DIP
  ───────────────────────────────────────*/
  function updateGlitchEffect(raw) {
    var militaryPos = 0.33; /* military is at 33% */
    var glitchRange = 0.08; /* glitch ±8% around military */
    var distFromMil = Math.abs(raw - militaryPos);

    if (distFromMil < glitchRange) {
      glitchIntensity = 1 - distFromMil / glitchRange;
      var filter = document.getElementById("hexGlitch");
      if (filter) {
        var displace = filter.querySelector("feDisplacementMap");
        if (displace) {
          displace.setAttribute("scale", glitchIntensity * 2.5);
        }
      }
      /* add color shift */
      hexapod.style.filter = `hue-rotate(${glitchIntensity * 15}deg) brightness(${1 - glitchIntensity * 0.2})`;
    } else {
      glitchIntensity = 0;
      hexapod.style.filter = "none";
    }
  }

  function renderHexapod() {
    var len = roadFill.getTotalLength();
    var pt = roadFill.getPointAtLength(curRaw * len);
    var diff = normDiff(curAngle, tgtAngle);
    curAngle += diff * LERP;

    /* update position */
    hexapod.style.left = pt.x - 40 + "px";
    hexapod.style.top = pt.y - 24 + "px";
    hexapod.style.transform = "rotate(" + curAngle + "deg)";

    /* update leg animation */
    walkPhase += 0.03 * lastDir;
    if (walkPhase > 1) walkPhase -= 1;
    if (walkPhase < 0) walkPhase += 1;
    updateLegAnimations(walkPhase, lastDir);

    /* update glitch at military */
    updateGlitchEffect(curRaw);
  }

  function animLoop() {
    renderHexapod();
    if (Math.abs(normDiff(curAngle, tgtAngle)) > 0.08) {
      rafId = requestAnimationFrame(animLoop);
    } else {
      rafId = null;
    }
  }

  function kickAnim() {
    if (!rafId) rafId = requestAnimationFrame(animLoop);
  }

  function updateHexapod(raw) {
    curRaw = raw;
    var dist = raw * roadFill.getTotalLength();
    var angle = tangentAngle(dist);
    if (lastDir < 0) {
      /* scrolling back → flip */
      angle += 180;
      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
    }
    tgtAngle = angle;
    kickAnim();
  }

  /* ═══════════════════════════════════════════════════════
     YOUR ORIGINAL SCROLL LOGIC — UNTOUCHED FROM HERE DOWN
  ═══════════════════════════════════════════════════════ */
  requestAnimationFrame(function () {
    var totalLen = roadFill.getTotalLength();

    [roadFill, roadGlow].forEach(function (el) {
      if (!el) return;
      el.style.strokeDasharray = totalLen;
      el.style.strokeDashoffset = totalLen;
    });

    var TRACK_W = 4150;

    var NODES = [
      { el: document.getElementById("rnAc"), showAt: 0.0 },
      { el: document.getElementById("rnIti"), showAt: 0.16 },
      { el: document.getElementById("rnMil"), showAt: 0.33 },
      { el: document.getElementById("rnIot"), showAt: 0.52 },
      { el: document.getElementById("rnAsu"), showAt: 0.74 },
    ];

    var DOTS = [
      { el: document.getElementById("hsDot0"), at: 0.0 },
      { el: document.getElementById("hsDot1"), at: 0.16 },
      { el: document.getElementById("hsDotMil"), at: 0.33 },
      { el: document.getElementById("hsDot2"), at: 0.52 },
      { el: document.getElementById("hsDot3"), at: 0.74 },
    ];

    function update() {
      if (window.innerWidth <= 700) return;

      var rect = outer.getBoundingClientRect();
      var total = outer.offsetHeight - window.innerHeight;
      var raw = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));

      if (Math.abs(raw - lastRaw) < 0.0003) return;

      lastDir = raw >= lastRaw ? 1 : -1;
      lastRaw = raw;

      var maxPan = TRACK_W - window.innerWidth;
      track.style.transform = "translateX(" + -(raw * maxPan) + "px)";

      if (progFill) progFill.style.width = raw * 100 + "%";

      var offset = totalLen * (1 - raw);
      roadFill.style.strokeDashoffset = offset;
      if (roadGlow) roadGlow.style.strokeDashoffset = offset;

      NODES.forEach(function (n) {
        if (n.el && raw >= n.showAt) n.el.classList.add("revealed");
      });

      if (hintEl && raw > 0.02) hintEl.classList.add("done");

      DOTS.forEach(function (d) {
        if (d.el) d.el.classList.toggle("active", raw >= d.at);
      });

      updateHexapod(raw); /* ← hexapod update */
    }

    function setupMobile() {
      NODES.forEach(function (n) {
        if (n.el) n.el.classList.add("revealed");
      });
      roadFill.style.strokeDashoffset = 0;
      if (roadGlow) roadGlow.style.strokeDashoffset = 0;
      hexapod.style.display = "none";
    }

    if (window.innerWidth <= 700) {
      setupMobile();
    } else {
      var acEl = document.getElementById("rnAc");
      var d0 = document.getElementById("hsDot0");
      if (acEl) acEl.classList.add("revealed");
      if (d0) d0.classList.add("active");

      curRaw = 0;
      renderHexapod();

      window.addEventListener("scroll", update, { passive: true });
      update();
    }

    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth <= 700) setupMobile();
        else {
          hexapod.style.display = "block";
          update();
        }
      },
      { passive: true },
    );
  });
})();
