/* ═══════════════════════════════════════════════════════════════
   about-timeline.js — THE ROAD
   Entrance/exit: original scroll-driven (300vh outer, onScroll).
   Navigation display: snap engine identical to standalone.
   HUD: counter (bottom-left) + arrows (bottom-right) added.
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  window.addEventListener("load", function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(setup);
    });
  });

  /* ── card data ── */
  var CARDS = [
    {
      dotId: "hsDot0",
      tag: "Live Now",
      date: "Oct 2025 — Present",
      title: "Full Stack .NET Developer",
      org: "Arab Computers · Alexandria, Egypt",
      tags: ["ASP.NET Core", "Angular", "CQRS", "Docker", "Azure DevOps"],
      color: "#50e898",
    },
    {
      dotId: "hsDot1",
      tag: "Internship",
      date: "Mar 2025 — Aug 2025",
      title: "Full Stack .NET Intern",
      org: "ITI · Intensive Code Camp · Alexandria",
      tags: ["ASP.NET Core", "Angular", "EF Core", "SQL Server"],
      color: "#00ddc8",
    },
    {
      dotId: "hsDotMil",
      date: "Dec 2024",
      title: "Military Service",
      org: "Completed · Discipline & Teamwork",
      tags: [],
      color: "#ff3838",
      isMil: true,
    },
    {
      dotId: "hsDot2",
      tag: "Training",
      date: "2022",
      title: "IoT Development Program",
      org: "ITI · Smart Village, Egypt",
      tags: ["IoTik", "SigFox", "BLE Gateway", "Sensors"],
      color: "#b068f0",
    },
    {
      dotId: "hsDot3",
      tag: "Education",
      date: "2019 — 2023",
      title: "B.Sc. Computer Science",
      org: "Alexandria University · CGPA 3.2",
      tags: ["OOP", "Algorithms", "C#", "Java", "Flutter"],
      color: "#f0c060",
    },
  ];

  /* ── world dimensions ── */
  var WW = 3600;
  var WH = 960;
  var YN = 400;
  var YD = 680;

  var NODES = [
    { x: 380, y: YN },
    { x: 940, y: YN },
    { x: 1500, y: YD },
    { x: 2060, y: YN },
    { x: 2620, y: YN },
  ];

  /* ── state ── */
  var track, viewport, progFill, hintEl;
  var cardEls = [],
    svgNodeGroups = [],
    dotEls = [];
  var roadSVG = null;
  var isMobile = false;
  var curIdx = 0;
  var ticking = false;
  var lastIdx = -1;
  var outerTop = 0;
  var outerH = 0;

  /* ── HUD elements ── */
  var btnPrev, btnNext, counterNum;

  /* ════════════════════════════════════════════
     SETUP
  ════════════════════════════════════════════ */
  function setup() {
    track = document.getElementById("hsTrack");
    viewport = document.getElementById("hsViewport");
    progFill = document.getElementById("hsProgFill");
    hintEl = document.getElementById("hsHint");
    if (!track || !viewport) return;

    isMobile = window.innerWidth <= 700;
    buildDots();

    if (isMobile) {
      setupMobile();
      return;
    }

    measureOuter();
    buildBgCanvas();
    buildRoadSVG();
    buildCards();
    injectHUD();
    snap(0, true);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
  }

  function measureOuter() {
    var outer = document.getElementById("hsOuter");
    var rect = outer.getBoundingClientRect();
    outerTop = rect.top + window.scrollY;
    outerH = outer.offsetHeight;
  }

  /* ════════════════════════════════════════════
     HUD — counter + arrows injected into .hs-sticky
  ════════════════════════════════════════════ */
  function injectHUD() {
    var old = document.getElementById("rdHUD");
    if (old) old.parentNode.removeChild(old);

    var sticky = document.querySelector(".hs-sticky");
    if (!sticky) return;

    var hsBottom = document.querySelector(".hs-bottom");
    var hsDots = hsBottom ? hsBottom.querySelector(".hs-dots") : null;

    var hud = document.createElement("div");
    hud.id = "rdHUD";
    hud.innerHTML =
      '<div class="rd-counter">' +
      '<div class="rd-counter-num" id="rdCNum">01</div>' +
      "</div>" +
      '<div class="rd-dots-placeholder"></div>' +
      '<div class="rd-arrows">' +
      '<button class="rd-na" id="rdPrev">&#8592;</button>' +
      '<button class="rd-na" id="rdNext">&#8594;</button>' +
      "</div>";

    sticky.appendChild(hud);

    if (hsDots) {
      var placeholder = hud.querySelector(".rd-dots-placeholder");
      if (placeholder) {
        var clonedDots = hsDots.cloneNode(true);
        placeholder.replaceWith(clonedDots);
      }
      if (hsBottom) {
        hsBottom.style.display = "none";
      }
    }

    btnPrev = document.getElementById("rdPrev");
    btnNext = document.getElementById("rdNext");
    counterNum = document.getElementById("rdCNum");

    /* Arrows scroll the page to the right position — same as dots */
    btnPrev.addEventListener("click", function () {
      scrollToIdx(curIdx - 1);
    });
    btnNext.addEventListener("click", function () {
      scrollToIdx(curIdx + 1);
    });
  }

  /* Scroll page to position that will trigger snap(idx) via onScroll */
  function scrollToIdx(idx) {
    if (idx < 0 || idx >= CARDS.length) return;
    var raw = (idx + 0.05) / CARDS.length;
    window.scrollTo({
      top: outerTop + raw * (outerH - window.innerHeight),
      behavior: "smooth",
    });
  }

  /* ════════════════════════════════════════════
     SCROLL — original entrance/exit logic untouched
  ════════════════════════════════════════════ */
  function onScroll() {
    if (isMobile || ticking) return;
    ticking = true;
    requestAnimationFrame(processScroll);
  }

  function processScroll() {
    ticking = false;
    var raw = Math.max(
      0,
      Math.min(
        1,
        (window.scrollY - outerTop) / Math.max(outerH - window.innerHeight, 1),
      ),
    );
    var idx = Math.min(
      CARDS.length - 1,
      Math.max(0, Math.round(raw * (CARDS.length - 1))),
    );
    if (idx !== lastIdx) {
      lastIdx = idx;
      snap(idx, false);
    }
  }

  /* ════════════════════════════════════════════
     SNAP — translate X+Y to centre node (compositor only)
  ════════════════════════════════════════════ */
  function snap(idx, instant) {
    curIdx = idx;
    var n = NODES[idx];
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var tx = vw / 2 - n.x;
    var ty = vh / 2 - n.y;

    if (instant) {
      track.style.transition = "none";
      track.style.transform = "translate(" + tx + "px," + ty + "px)";
      requestAnimationFrame(function () {
        track.style.transition = "";
      });
    } else {
      track.style.transform = "translate(" + tx + "px," + ty + "px)";
    }

    /* Cards */
    cardEls.forEach(function (c, i) {
      c.classList.toggle("rd-active", i === idx);
      c.classList.toggle("rd-adj", Math.abs(i - idx) === 1);
    });

    /* SVG nodes */
    svgNodeGroups.forEach(function (g, i) {
      if (!g) return;
      var cs = g.querySelectorAll("circle");
      var mil = !!CARDS[i].isMil;
      if (i === idx) {
        cs[0].setAttribute("r", mil ? "26" : "20");
        cs[0].setAttribute("opacity", mil ? ".18" : ".16");
        cs[1].setAttribute("r", mil ? "11" : "9");
      } else {
        cs[0].setAttribute("r", mil ? "18" : "14");
        cs[0].setAttribute("opacity", mil ? ".12" : ".10");
        cs[1].setAttribute("r", mil ? "8" : "6");
      }
    });

    /* Dots */
    dotEls.forEach(function (d, i) {
      if (d) d.classList.toggle("active", i === idx);
    });

    /* Progress bar */
    if (progFill) progFill.style.width = (idx / (CARDS.length - 1)) * 100 + "%";

    /* Counter */
    if (counterNum) counterNum.textContent = String(idx + 1).padStart(2, "0");

    /* Arrow disabled states */
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === CARDS.length - 1;

    /* Hint */
    if (hintEl && idx > 0) hintEl.classList.add("done");
  }

  /* ════════════════════════════════════════════
     ROAD PATH
  ════════════════════════════════════════════ */
  function roadPath() {
    var mx = NODES[2].x;
    return (
      "M -1000," +
      YN +
      " L " +
      (mx - 220 * 3) +
      "," +
      YN +
      " C " +
      (mx - 220 * 2) +
      "," +
      YN +
      " " +
      (mx - 220 * 1.5) +
      "," +
      YN +
      " " +
      (mx - 220) +
      "," +
      (YN + (YD - YN) * 0.55) +
      " C " +
      (mx - 220 * 0.35) +
      "," +
      YD +
      " " +
      (mx - 220 * 0.15) +
      "," +
      YD +
      " " +
      mx +
      "," +
      YD +
      " C " +
      (mx + 220 * 0.15) +
      "," +
      YD +
      " " +
      (mx + 220 * 0.35) +
      "," +
      YD +
      " " +
      (mx + 220) +
      "," +
      (YN + (YD - YN) * 0.55) +
      " C " +
      (mx + 220 * 1.5) +
      "," +
      YN +
      " " +
      (mx + 220 * 2) +
      "," +
      YN +
      " " +
      (mx + 220 * 3) +
      "," +
      YN +
      " L " +
      WW +
      "," +
      YN
    );
  }

  /* ════════════════════════════════════════════
     SVG ROAD
  ════════════════════════════════════════════ */
  function buildRoadSVG() {
    if (roadSVG && roadSVG.parentNode) roadSVG.parentNode.removeChild(roadSVG);

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "hs-svg");
    svg.style.cssText =
      "position:absolute;top:0;left:0;" +
      "width:" +
      WW +
      "px;height:" +
      WH +
      "px;" +
      "pointer-events:none;z-index:1;overflow:visible;";

    function E(tag, a, p) {
      var el = document.createElementNS(NS, tag);
      for (var k in a) el.setAttribute(k, String(a[k]));
      (p || svg).appendChild(el);
      return el;
    }

    var defs = E("defs", {});

    var gf = E(
      "filter",
      { id: "rdG", x: "-20%", y: "-200%", width: "140%", height: "500%" },
      defs,
    );
    E("feGaussianBlur", { stdDeviation: "2.5", result: "b" }, gf);
    var gm = E("feMerge", {}, gf);
    E("feMergeNode", { in: "b" }, gm);
    E("feMergeNode", { in: "SourceGraphic" }, gm);

    var nf = E(
      "filter",
      { id: "rdNG", x: "-120%", y: "-120%", width: "340%", height: "340%" },
      defs,
    );
    E("feGaussianBlur", { stdDeviation: "7", result: "b" }, nf);
    var nm = E("feMerge", {}, nf);
    E("feMergeNode", { in: "b" }, nm);
    E("feMergeNode", { in: "SourceGraphic" }, nm);

    var mf = E(
      "filter",
      { id: "rdMG", x: "-120%", y: "-120%", width: "340%", height: "340%" },
      defs,
    );
    E("feGaussianBlur", { stdDeviation: "9", result: "b" }, mf);
    var mm = E("feMerge", {}, mf);
    E("feMergeNode", { in: "b" }, mm);
    E("feMergeNode", { in: "SourceGraphic" }, mm);

    var mx = NODES[2].x;
    var pRG = E(
      "radialGradient",
      { id: "rdP", cx: mx, cy: YD, r: 400, gradientUnits: "userSpaceOnUse" },
      defs,
    );
    E(
      "stop",
      { offset: "0%", "stop-color": "#000", "stop-opacity": ".6" },
      pRG,
    );
    E(
      "stop",
      { offset: "100%", "stop-color": "#000", "stop-opacity": "0" },
      pRG,
    );

    var RD = roadPath();
    function oy(s, d) {
      return s.replace(/([\d.]+),([\d.]+)/g, function (_, x, y) {
        return x + "," + (+y + d);
      });
    }

    E("path", { d: RD, fill: "none", stroke: "#030507", "stroke-width": 112 });
    E("path", { d: RD, fill: "none", stroke: "#070a0f", "stroke-width": 96 });
    E("path", { d: RD, fill: "none", stroke: "#0b1018", "stroke-width": 88 });
    E("path", { d: RD, fill: "none", stroke: "#0e1420", "stroke-width": 78 });
    E("path", { d: RD, fill: "none", stroke: "#141924", "stroke-width": 64 });
    E("path", {
      d: RD,
      fill: "none",
      stroke: "rgba(0,0,0,.25)",
      "stroke-width": 52,
      "stroke-dasharray": "3 22",
      "stroke-linecap": "round",
    });
    E("path", {
      d: oy(RD, -46),
      fill: "none",
      stroke: "rgba(0,221,200,.30)",
      "stroke-width": 1.6,
      "stroke-linecap": "round",
    });
    E("path", {
      d: oy(RD, +46),
      fill: "none",
      stroke: "rgba(0,221,200,.10)",
      "stroke-width": 1.6,
      "stroke-linecap": "round",
    });
    E("path", {
      d: RD,
      fill: "none",
      stroke: "rgba(0,221,200,.55)",
      "stroke-width": 1.8,
      "stroke-dasharray": "28 18",
      "stroke-linecap": "round",
      filter: "url(#rdG)",
    });

    E("rect", { x: 0, y: 0, width: WW, height: WH, fill: "url(#rdP)" });

    [-80, -36, 0, 38].forEach(function (dx) {
      E("line", {
        x1: mx + dx - 5,
        y1: YD - 26,
        x2: mx + dx + 5,
        y2: YD + 22,
        stroke: "rgba(255,56,56,.2)",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
      });
    });

    svgNodeGroups = [];
    CARDS.forEach(function (m, i) {
      var n = NODES[i];
      var flt = m.isMil ? "url(#rdMG)" : "url(#rdNG)";
      var g = E("g", { filter: flt, id: "rdSN" + i });
      E(
        "circle",
        {
          cx: n.x,
          cy: n.y,
          r: m.isMil ? 18 : 14,
          fill: m.color,
          opacity: m.isMil ? ".12" : ".10",
        },
        g,
      );
      E("circle", { cx: n.x, cy: n.y, r: m.isMil ? 8 : 6, fill: m.color }, g);
      E(
        "circle",
        {
          cx: n.x,
          cy: n.y,
          r: m.isMil ? 3.5 : 3,
          fill: "#fff",
          opacity: ".88",
        },
        g,
      );
      svgNodeGroups.push(g);
    });

    track.appendChild(svg);
    roadSVG = svg;
  }

  /* ════════════════════════════════════════════
     STARS
  ════════════════════════════════════════════ */
  function buildBgCanvas() {
    var old = document.getElementById("csBgCanvas");
    if (old) old.parentNode.removeChild(old);
    var c = document.createElement("canvas");
    c.id = "csBgCanvas";
    c.width = WW;
    c.height = WH;
    c.style.cssText =
      "position:absolute;top:0;left:0;" +
      "width:" +
      WW +
      "px;height:" +
      WH +
      "px;" +
      "pointer-events:none;z-index:0;";
    var ctx = c.getContext("2d");
    for (var i = 0; i < 230; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * WW,
        Math.random() * (YN - 80),
        Math.random() * 1.2 + 0.2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle =
        "rgba(255,255,255," + (Math.random() * 0.55 + 0.1).toFixed(2) + ")";
      ctx.fill();
    }
    for (var j = 0; j < 20; j++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * WW,
        YN - 10 - Math.random() * 65,
        0.8,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle =
        "rgba(0,221,200," + (Math.random() * 0.3 + 0.08).toFixed(2) + ")";
      ctx.fill();
    }
    track.insertBefore(c, track.firstChild);
  }

  /* ════════════════════════════════════════════
     CARDS + CONNECTORS
  ════════════════════════════════════════════ */
  function buildCards() {
    track.querySelectorAll(".rd-card,.rd-conn").forEach(function (el) {
      el.parentNode.removeChild(el);
    });
    cardEls = [];

    CARDS.forEach(function (m, i) {
      var n = NODES[i];
      var CLEN = 160;
      var cTop = n.y - CLEN;

      var conn = document.createElement("div");
      conn.className = "rd-conn";
      conn.style.cssText =
        "position:absolute;" +
        "left:" +
        (n.x - 1) +
        "px;top:" +
        cTop +
        "px;" +
        "height:" +
        CLEN +
        "px;z-index:12;pointer-events:none;" +
        (m.isMil
          ? "width:0;border-left:1px dashed " + m.color + "66;"
          : "width:2px;background:linear-gradient(to top," +
            m.color +
            "70,transparent);");
      track.appendChild(conn);

      var cardTop = cTop - 80;
      var card = document.createElement("div");
      card.className = "rd-card" + (m.isMil ? " rd-card-mil" : "");
      card.style.cssText =
        "position:absolute;" +
        "left:" +
        n.x +
        "px;top:" +
        cardTop +
        "px;" +
        "--ac:" +
        m.color +
        ";";

      var html = "";
      if (m.isMil)
        html += '<div class="rd-warning">⚠ service interrupted</div>';
      if (m.tag) html += '<div class="rd-tag">' + m.tag + "</div>";
      html += '<div class="rd-date">' + m.date + "</div>";
      html += '<div class="rd-title">' + m.title + "</div>";
      html += '<div class="rd-org">' + m.org + "</div>";
      if (m.tags.length) {
        html +=
          '<div class="rd-chips">' +
          m.tags
            .map(function (t) {
              return "<span>" + t + "</span>";
            })
            .join("") +
          "</div>";
      }
      card.innerHTML = html;
      track.appendChild(card);
      cardEls.push(card);
    });
  }

  /* ════════════════════════════════════════════
     DOTS — original scroll-to behavior
  ════════════════════════════════════════════ */
  function buildDots() {
    dotEls = [];
    CARDS.forEach(function (m, i) {
      var el = document.getElementById(m.dotId);
      if (!el) return;
      el.addEventListener("click", function () {
        var raw = (i + 0.05) / CARDS.length;
        window.scrollTo({
          top: outerTop + raw * (outerH - window.innerHeight),
          behavior: "smooth",
        });
      });
      dotEls.push(el);
    });
  }

  /* ════════════════════════════════════════════
     MOBILE
  ════════════════════════════════════════════ */
  function setupMobile() {
    track.innerHTML = "";
    track.style.transform = "none";
    track.style.transition = "none";
    CARDS.forEach(function (m) {
      var card = document.createElement("div");
      card.className = "rd-card rd-active" + (m.isMil ? " rd-card-mil" : "");
      card.style.setProperty("--ac", m.color);
      var html = "";
      if (m.isMil)
        html += '<div class="rd-warning">⚠ service interrupted</div>';
      if (m.tag) html += '<div class="rd-tag">' + m.tag + "</div>";
      html += '<div class="rd-date">' + m.date + "</div>";
      html += '<div class="rd-title">' + m.title + "</div>";
      html += '<div class="rd-org">' + m.org + "</div>";
      if (m.tags.length) {
        html +=
          '<div class="rd-chips">' +
          m.tags
            .map(function (t) {
              return "<span>" + t + "</span>";
            })
            .join("") +
          "</div>";
      }
      card.innerHTML = html;
      track.appendChild(card);
    });
  }

  /* ════════════════════════════════════════════
     RESIZE
  ════════════════════════════════════════════ */
  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      isMobile = window.innerWidth <= 700;
      var hsBottom = document.querySelector(".hs-bottom");
      if (isMobile) {
        if (hsBottom) hsBottom.style.display = "flex";
        setupMobile();
        buildDots();
        return;
      }
      if (hsBottom) hsBottom.style.display = "none";
      measureOuter();
      buildBgCanvas();
      buildRoadSVG();
      buildCards();
      injectHUD();
      lastIdx = -1;
      snap(curIdx, true);
      processScroll();
    }, 150);
  }
})();
