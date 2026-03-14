/* ═══════════════════════════════════════════════════════════════
   about-timeline.js  —  CONSTELLATION · STRAIGHT LINE · NO LAG
   • rAF-throttled scroll — never reads DOM in scroll handler
   • All values cached on init/resize
   • CSS transform only for track pan (GPU)
   • SVG line drawn via pre-cached strokeDashoffset
   • Stars on a straight horizontal line
   • Military star drops far below the line
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var outer = document.getElementById("hsOuter");
  var track = document.getElementById("hsTrack");
  var progFill = document.getElementById("hsProgFill");
  var hintEl = document.getElementById("hsHint");

  if (!outer || !track) return;

  var TRACK_W = 5000;
  var isMobile = window.innerWidth <= 700;

  /* ── Star definitions ─────────────────────────────────
     yf = fraction of track height
     Normal stars sit at 0.42 (middle-ish)
     Military drops to 0.78 (the downfall)
  ─────────────────────────────────────────────────────── */
  var STARS = [
    {
      id: "rnAc",
      xf: 0.08,
      yf: 0.42,
      card: "above",
      cls: "cs-ac",
      showAt: 0.0,
    },
    {
      id: "rnIti",
      xf: 0.26,
      yf: 0.42,
      card: "above",
      cls: "cs-iti",
      showAt: 0.1,
    },
    {
      id: "rnMil",
      xf: 0.48,
      yf: 0.62,
      card: "below",
      cls: "cs-mil",
      showAt: 0.33,
    },
    {
      id: "rnIot",
      xf: 0.68,
      yf: 0.42,
      card: "above",
      cls: "cs-iot",
      showAt: 0.58,
    },
    {
      id: "rnAsu",
      xf: 0.88,
      yf: 0.42,
      card: "above",
      cls: "cs-asu",
      showAt: 0.82,
    },
  ];

  var DOTS = [
    { id: "hsDot0", at: 0.0, sf: 0 },
    { id: "hsDot1", at: 0.12, sf: 1 },
    { id: "hsDotMil", at: 0.36, sf: 2 },
    { id: "hsDot2", at: 0.6, sf: 3 },
    { id: "hsDot3", at: 0.84, sf: 4 },
  ];

  var CARD_DATA = {
    rnAc: {
      tag: "Live Now",
      date: "Oct 2025 — Present",
      title: "Full Stack .NET Developer",
      org: "Arab Computers · Alexandria, Egypt",
      tags: ["ASP.NET Core", "Angular", "CQRS", "Docker", "Azure DevOps"],
    },
    rnIti: {
      tag: "Internship",
      date: "Mar 2025 — Aug 2025",
      title: "Full Stack .NET Intern",
      org: "ITI · Intensive Code Camp · Alexandria",
      tags: ["ASP.NET Core", "Angular", "EF Core", "SQL Server"],
    },
    rnMil: {
      mil: true,
      date: "Dec 2024",
      title: "Military Service",
      org: "Completed · Discipline &amp; Teamwork",
      tags: [],
    },
    rnIot: {
      tag: "Training",
      date: "2022",
      title: "IoT Development Program",
      org: "ITI · Smart Village, Egypt",
      tags: ["IoTik", "SigFox", "BLE Gateway", "Sensors"],
    },
    rnAsu: {
      tag: "Education",
      date: "2019 — 2023",
      title: "B.Sc. Computer Science",
      org: "Alexandria University · CGPA 3.2",
      tags: ["OOP", "Algorithms", "C#", "Java", "Flutter"],
    },
  };

  /* ══════════════════════════════════════════
     BUILD STAR DOM  (runs once)
  ══════════════════════════════════════════ */
  STARS.forEach(function (s) {
    var el = document.getElementById(s.id);
    if (!el) return;
    var d = CARD_DATA[s.id];

    el.className = "cs-star " + s.cls;
    el.style.cssText = "position:absolute;";

    var tagsHTML = d.tags
      .map(function (t) {
        return "<span>" + t + "</span>";
      })
      .join("");
    var tagLine = d.mil
      ? '<div class="cs-mil-warning">⚠ Service Interrupted</div>'
      : d.tag
        ? '<div class="cs-card-tag">' + d.tag + "</div>"
        : "";

    var cardCls =
      "cs-card " +
      (s.card === "above" ? "card-above" : "card-below") +
      (d.mil ? " cs-mil-card" : "");
    var armCls = "cs-arm " + (s.card === "above" ? "arm-up" : "arm-down");

    el.innerHTML =
      '<div class="cs-star-dot">' +
      '<div class="cs-star-ring"></div>' +
      '<div class="cs-star-ring2"></div>' +
      '<div class="cs-star-cross"></div>' +
      "</div>" +
      '<div class="' +
      armCls +
      '"></div>' +
      '<div class="' +
      cardCls +
      '">' +
      tagLine +
      '<div class="cs-card-date">' +
      d.date +
      "</div>" +
      '<div class="cs-card-title">' +
      d.title +
      "</div>" +
      '<div class="cs-card-org">' +
      d.org +
      "</div>" +
      (tagsHTML ? '<div class="cs-card-tags">' + tagsHTML + "</div>" : "") +
      "</div>";
  });

  /* rebuild dot star spans */
  DOTS.forEach(function (d) {
    var el = document.getElementById(d.id);
    if (!el || el.querySelector(".hs-dot-star")) return;
    var span = document.createElement("div");
    span.className = "hs-dot-star";
    el.insertBefore(span, el.firstChild);
  });

  /* cache element refs — avoid getElementById in hot scroll loop */
  var starEls = STARS.map(function (s) {
    return document.getElementById(s.id);
  });
  var dotEls = DOTS.map(function (d) {
    return document.getElementById(d.id);
  });
  var bgCanvas = document.createElement("canvas");
  bgCanvas.id = "csBgCanvas";
  track.insertBefore(bgCanvas, track.firstChild);

  var lastBgH = 0;
  function paintBgStars(H) {
    if (H === lastBgH) return;
    lastBgH = H;
    bgCanvas.width = TRACK_W;
    bgCanvas.height = H;
    var ctx = bgCanvas.getContext("2d");
    var sizes = [0.4, 0.8, 1.2];
    sizes.forEach(function (r) {
      for (var i = 0; i < 65; i++) {
        var x = Math.random() * TRACK_W;
        var y = Math.random() * H;
        var a = (Math.random() * 0.38 + 0.07).toFixed(2);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = "rgba(200,240,255," + a + ")";
        ctx.fill();
      }
    });
  }

  /* ══════════════════════════════════════════
     SVG LINE  —  straight across + drop for military
     Built once; length cached; never re-read in scroll
  ══════════════════════════════════════════ */
  var svgEl, lineMain, lineGlow, lineFill;
  var pathLen = 0; /* cached — never call getTotalLength in scroll */

  function buildSVG(H) {
    if (svgEl && svgEl.parentNode) svgEl.parentNode.removeChild(svgEl);

    /* Y of the main horizontal line */
    var lineY = STARS[0].yf * H; /* 0.42 * H */

    /* The path:
       - straight from x=0 to just before military x
       - drop down to military y
       - go back up to line y
       - straight to end
    */
    var milX = STARS[2].xf * TRACK_W;
    var milY = STARS[2].yf * H;
    var dropW = 50; /* horizontal spread of the drop curve */

    var d =
      "M 0," +
      lineY +
      " L " +
      (milX - dropW) +
      "," +
      lineY +
      " C " +
      (milX - dropW / 2) +
      "," +
      lineY +
      " " +
      (milX - dropW / 2) +
      "," +
      milY +
      " " +
      milX +
      "," +
      milY +
      " C " +
      (milX + dropW / 2) +
      "," +
      milY +
      " " +
      (milX + dropW / 2) +
      "," +
      lineY +
      " " +
      (milX + dropW) +
      "," +
      lineY +
      " L " +
      TRACK_W +
      "," +
      lineY;

    var ns = "http://www.w3.org/2000/svg";
    svgEl = document.createElementNS(ns, "svg");
    svgEl.setAttribute("class", "hs-svg");
    svgEl.setAttribute("xmlns", ns);
    svgEl.style.cssText =
      "position:absolute;inset:0;width:" +
      TRACK_W +
      "px;height:" +
      H +
      "px;pointer-events:none;z-index:1;overflow:visible;";

    var defs = document.createElementNS(ns, "defs");
    defs.innerHTML =
      '<filter id="csGF" x="-2%" y="-300%" width="104%" height="700%">' +
      '<feGaussianBlur stdDeviation="6" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      "</filter>";
    svgEl.appendChild(defs);

    /* ambient dashed base line */
    var base = document.createElementNS(ns, "path");
    base.setAttribute("d", d);
    base.setAttribute("fill", "none");
    base.setAttribute("stroke", "rgba(0,221,200,0.08)");
    base.setAttribute("stroke-width", "1.5");
    base.setAttribute("stroke-dasharray", "8 14");
    svgEl.appendChild(base);

    /* glow layer */
    lineGlow = document.createElementNS(ns, "path");
    lineGlow.setAttribute("d", d);
    lineGlow.setAttribute("fill", "none");
    lineGlow.setAttribute("stroke", "rgba(0,221,200,0.12)");
    lineGlow.setAttribute("stroke-width", "18");
    lineGlow.setAttribute("stroke-linecap", "round");
    lineGlow.setAttribute("filter", "url(#csGF)");
    svgEl.appendChild(lineGlow);

    /* main teal line */
    lineFill = document.createElementNS(ns, "path");
    lineFill.setAttribute("d", d);
    lineFill.setAttribute("fill", "none");
    lineFill.setAttribute("stroke", "#00ddc8");
    lineFill.setAttribute("stroke-width", "2");
    lineFill.setAttribute("stroke-linecap", "round");
    svgEl.appendChild(lineFill);

    /* insert SVG before stars */
    var firstStar = document.getElementById("rnAc");
    track.insertBefore(svgEl, firstStar || null);

    /* cache total length HERE — only once */
    pathLen = lineFill.getTotalLength();
    lineFill.style.strokeDasharray = pathLen;
    lineFill.style.strokeDashoffset = pathLen;
    lineGlow.style.strokeDasharray = pathLen;
    lineGlow.style.strokeDashoffset = pathLen;
  }

  /* ══════════════════════════════════════════
     POSITION STARS  (runs on init + resize)
  ══════════════════════════════════════════ */
  function positionStars(H) {
    for (var i = 0; i < STARS.length; i++) {
      var el = starEls[i];
      if (!el) continue;
      el.style.left = STARS[i].xf * TRACK_W + "px";
      el.style.top = STARS[i].yf * H + "px";
    }
  }

  /* ══════════════════════════════════════════
     CACHED SCROLL VALUES
     Re-computed only on resize, never in scroll handler
  ══════════════════════════════════════════ */
  var cache = {
    maxPan: 0,
    total: 0,
    outerTop: 0 /* outer.getBoundingClientRect().top + scrollY */,
  };

  function refreshCache() {
    cache.maxPan = TRACK_W - window.innerWidth;
    cache.total = outer.offsetHeight - window.innerHeight;
    cache.outerTop = outer.getBoundingClientRect().top + window.scrollY;
  }

  /* ══════════════════════════════════════════
     rAF-THROTTLED SCROLL
  ══════════════════════════════════════════ */
  var ticking = false;
  var lastRaw = -1;

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(processScroll);
    }
  }

  function processScroll() {
    ticking = false;
    if (isMobile) return;

    var scrollY = window.scrollY;
    var raw = (scrollY - cache.outerTop) / Math.max(cache.total, 1);
    raw = raw < 0 ? 0 : raw > 1 ? 1 : raw;

    if (Math.abs(raw - lastRaw) < 0.0006) return;
    lastRaw = raw;

    /* pan track — GPU transform */
    var pan = raw * cache.maxPan;
    track.style.transform = "translateX(" + -pan + "px)";

    /* progress bar */
    if (progFill) progFill.style.width = raw * 100 + "%";

    /* draw line — no DOM read, just set cached value */
    if (lineFill && pathLen) {
      var off = pathLen * (1 - raw);
      lineFill.style.strokeDashoffset = off;
      lineGlow.style.strokeDashoffset = off;
    }

    /* reveal stars — cached refs, no getElementById */
    for (var i = 0; i < starEls.length; i++) {
      var el = starEls[i];
      if (!el) continue;
      if (raw >= STARS[i].showAt) {
        if (!el.classList.contains("revealed")) el.classList.add("revealed");
      } else if (raw < STARS[i].showAt - 0.02) {
        if (el.classList.contains("revealed")) el.classList.remove("revealed");
      }
    }

    /* hint */
    if (hintEl && raw > 0.02 && !hintEl.classList.contains("done")) {
      hintEl.classList.add("done");
    }

    /* active dots — cached refs */
    for (var j = 0; j < dotEls.length; j++) {
      var dotEl = dotEls[j];
      if (!dotEl) continue;
      var nextAt = DOTS[j + 1] ? DOTS[j + 1].at : 1.1;
      var isActive =
        j === dotEls.length - 1
          ? raw >= DOTS[j].at
          : raw >= DOTS[j].at && raw < nextAt;
      dotEl.classList.toggle("active", isActive);
    }
  }

  /* ══════════════════════════════════════════
     DOT CLICK — smooth scroll to star
  ══════════════════════════════════════════ */
  function snapToStar(starIndex) {
    var s = STARS[starIndex];
    var starX = s.xf * TRACK_W;
    var raw = (starX - window.innerWidth / 2) / cache.maxPan;
    raw = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    var targetY = cache.outerTop + raw * cache.total;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  DOTS.forEach(function (d) {
    var el = document.getElementById(d.id);
    if (!el) return;
    el.addEventListener("click", function () {
      snapToStar(d.sf);
    });
  });

  /* ══════════════════════════════════════════
     MOBILE SETUP
  ══════════════════════════════════════════ */
  function setupMobile() {
    STARS.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) el.classList.add("revealed");
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  function init() {
    var H = track.offsetHeight || window.innerHeight * 0.72;

    /* hint compositor to promote track to its own layer */
    track.style.willChange = "transform";

    paintBgStars(H);
    positionStars(H);

    if (!isMobile) {
      buildSVG(H);
      refreshCache();

      /* show first star + dot immediately */
      var first = document.getElementById("rnAc");
      var dot0 = document.getElementById("hsDot0");
      if (first) first.classList.add("revealed");
      if (dot0) dot0.classList.add("active");

      window.addEventListener("scroll", onScroll, { passive: true });
      processScroll();
    } else {
      setupMobile();
    }
  }

  /* ── Resize: debounced ── */
  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        isMobile = window.innerWidth <= 700;
        var H = track.offsetHeight || window.innerHeight * 0.72;
        paintBgStars(H);
        positionStars(H);
        if (!isMobile) {
          buildSVG(H);
          refreshCache();
          lastRaw = -1;
          processScroll();
        } else {
          setupMobile();
        }
      }, 120);
    },
    { passive: true },
  );

  /* Run after layout is ready */
  requestAnimationFrame(function () {
    requestAnimationFrame(init);
  });
})();
