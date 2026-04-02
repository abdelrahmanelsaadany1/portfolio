/* ═══════════════════════════════════════════════════════════════
   about-timeline.js — THE JOURNEY
   Single accent colour throughout. Company name separate from location.
   Exactly 5 stations, 4 scroll steps. Entrance/exit unchanged.
   Robust wheel snap: hard/fast scrolls cannot skip cards.
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  window.addEventListener("load", function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(setup);
    });
  });

  var CARDS = [
    {
      dotId: "hsDot0",
      tag: "Live Now",
      date: "Oct 2025 — Present",
      title: "Full Stack .NET Developer",
      company: "Arab Computers",
      location: "Alexandria, Egypt",
      tags: ["ASP.NET Core", "Angular", "CQRS", "Docker", "Azure DevOps"],
      num: "01",
    },
    {
      dotId: "hsDot1",
      tag: "Internship",
      date: "Mar 2025 — Aug 2025",
      title: "Full Stack .NET Intern",
      company: "ITI — Intensive Code Camp",
      location: "Alexandria, Egypt",
      tags: ["ASP.NET Core", "Angular", "EF Core", "SQL Server"],
      num: "02",
    },
    {
      dotId: "hsDotMil",
      tag: "Service",
      date: "Dec 2024",
      title: "Military Service",
      company: "Egyptian Armed Forces",
      location: "Completed",
      tags: ["Discipline", "Leadership", "Teamwork"],
      num: "03",
      isMil: true,
    },
    {
      dotId: "hsDot2",
      tag: "Training",
      date: "2022",
      title: "IoT Development Program",
      company: "ITI — Smart Village",
      location: "Cairo, Egypt",
      tags: ["IoTik", "SigFox", "BLE Gateway", "Sensors"],
      num: "04",
    },
    {
      dotId: "hsDot3",
      tag: "Education",
      date: "2019 — 2023",
      title: "B.Sc. Computer Science",
      company: "Alexandria University",
      location: "CGPA 3.2 / 4.0",
      tags: ["OOP", "Algorithms", "C#", "Java", "Flutter"],
      num: "05",
    },
  ];

  /* ── state ── */
  var track, viewport, progFill, hintEl;
  var stationEls = [];
  var dotEls = [];
  var isMobile = false;
  var curIdx = 0;
  var ticking = false;
  var lastScrollIdx = -1;
  var outerTop = 0;
  var outerH = 0;
  var btnPrev, btnNext, counterNum;
  var animFrame = null;

  /* ── wheel-snap state ── */
  var TRANSITION_MS = 850; // matches CSS transition duration
  var isTransitioning = false;
  var transitionTimer = null;

  /* ════════════════════════════════════════════ SETUP */
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
    buildStrip();
    injectHUD();
    snap(0, true);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    /* Intercept wheel — always preventDefault when inside section */
    window.addEventListener("wheel", onWheel, { passive: false });
  }

  function measureOuter() {
    var outer = document.getElementById("hsOuter");
    var rect = outer.getBoundingClientRect();
    outerTop = rect.top + window.scrollY;
    outerH = outer.offsetHeight;
  }

  /* ════════════════════════════════════════════ WHEEL SNAP
     Strategy:
     - If the section is not in sticky mode → let the page scroll normally.
     - If we're at card 0 and scrolling UP  → let the page scroll up (enter from above works).
     - If we're at card N-1 and scrolling DOWN → let the page scroll down (exit to next section works).
     - In all other cases: preventDefault + step exactly ONE card.
       A transition lock prevents any further steps until the animation ends,
       so no matter how fast or hard the user scrolls they can't skip.
  ════════════════════════════════════════════ */
  function onWheel(e) {
    if (isMobile) return;

    var outer = document.getElementById("hsOuter");
    if (!outer) return;
    var rect = outer.getBoundingClientRect();

    /* Is the section currently "stuck" (sticky mode active)? */
    var inSection = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    if (!inSection) return; /* not stuck — don't interfere */

    var dir = e.deltaY > 0 ? 1 : -1;
    var nextIdx = curIdx + dir;

    /* Allow natural exit at the boundaries */
    if (nextIdx < 0 || nextIdx >= CARDS.length) return;

    /* We own this event — stop the page from scrolling */
    e.preventDefault();
    e.stopPropagation();

    /* If a transition is already running, swallow the event but do nothing */
    if (isTransitioning) return;

    /* Start transition lock */
    isTransitioning = true;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () {
      isTransitioning = false;
    }, TRANSITION_MS + 60); /* small buffer beyond the CSS transition */

    /* Move exactly one step */
    snap(nextIdx, false);

    /* Silently realign the page scroll so the passive scroll listener
       and progress bar stay consistent */
    syncScrollPosition(nextIdx);
  }

  /* Align window.scrollY to match the given card index */
  function syncScrollPosition(idx) {
    var scrollable = Math.max(outerH - window.innerHeight, 1);
    var sliceSize = scrollable / (CARDS.length - 1);
    window.scrollTo({ top: outerTop + idx * sliceSize, behavior: "instant" });
    lastScrollIdx = idx;
  }

  /* ════════════════════════════════════════════ BUILD STRIP */
  function buildStrip() {
    track.innerHTML = "";
    stationEls = [];

    /* Particle canvas */
    var canvas = document.createElement("canvas");
    canvas.id = "csBgCanvas";
    track.appendChild(canvas);
    initParticles(canvas);

    CARDS.forEach(function (m, i) {
      var station = document.createElement("div");
      station.className = "rd-station" + (m.isMil ? " rd-station-mil" : "");

      /* ── Left decorative pane ── */
      var leftPane = document.createElement("div");
      leftPane.className = "rd-left-pane";

      var ghost = document.createElement("div");
      ghost.className = "rd-ghost-num";
      ghost.textContent = m.num;
      leftPane.appendChild(ghost);

      var vline = document.createElement("div");
      vline.className = "rd-vline";
      var vdot = document.createElement("div");
      vdot.className = "rd-vdot";
      vline.appendChild(vdot);
      leftPane.appendChild(vline);

      station.appendChild(leftPane);

      /* ── Main card ── */
      var card = document.createElement("div");
      card.className = "rd-card-new";

      var html = "";

      /* Header row — badge + step index */
      html += '<div class="rd-header-row">';
      html +=
        '<span class="rd-tag-pill' +
        (m.isMil ? " rd-tag-mil" : "") +
        '">' +
        m.tag +
        "</span>";
      html +=
        '<span class="rd-idx">' +
        m.num +
        ' <span style="opacity:.3">/ 05</span></span>';
      html += "</div>";

      /* Date */
      html += '<div class="rd-date-new">' + m.date + "</div>";

      /* Job title */
      html += '<h3 class="rd-title-new">' + m.title + "</h3>";

      /* Company block */
      html += '<div class="rd-org-block">';
      html += '  <div class="rd-org-company">' + m.company + "</div>";
      html += '  <div class="rd-org-location">' + m.location + "</div>";
      html += "</div>";

      /* Separator */
      html += '<div class="rd-sep"></div>';

      /* Tech chips */
      if (m.tags.length) {
        html += '<div class="rd-chips-new">';
        m.tags.forEach(function (t) {
          html += '<span class="rd-chip">' + t + "</span>";
        });
        html += "</div>";
      }

      card.innerHTML = html;
      station.appendChild(card);

      /* ── Right step-indicator pane ── */
      var rightPane = document.createElement("div");
      rightPane.className = "rd-right-pane";
      var stepsHtml = "";
      CARDS.forEach(function (_, si) {
        stepsHtml +=
          '<div class="rd-step' + (si === i ? " rd-step-ac" : "") + '"></div>';
      });
      rightPane.innerHTML = stepsHtml;
      station.appendChild(rightPane);

      track.appendChild(station);
      stationEls.push(station);
    });
  }

  /* ════════════════════════════════════════════ PARTICLES */
  function initParticles(canvas) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var W = vw * CARDS.length;
    var H = vh;

    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText =
      "position:absolute;top:0;left:0;" +
      "width:" +
      W +
      "px;height:" +
      H +
      "px;" +
      "pointer-events:none;z-index:0;";

    var ctx = canvas.getContext("2d");
    var pts = [];
    for (var i = 0; i < 160; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.0 + 0.2,
        a: Math.random() * 0.4 + 0.05,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.06,
      });
    }

    if (animFrame) cancelAnimationFrame(animFrame);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + p.a.toFixed(2) + ")";
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ════════════════════════════════════════════ HUD */
  function injectHUD() {
    var old = document.getElementById("rdHUD");
    if (old) old.parentNode.removeChild(old);

    var sticky = document.querySelector(".hs-sticky");
    if (!sticky) return;

    var hsBottom = document.querySelector(".hs-bottom");
    var hsDots = hsBottom ? hsBottom.querySelector(".hs-dots") : null;

    var hud = document.createElement("div");
    hud.id = "rdHUD";

    /* Top row: counter | dots | arrows */
    var row = document.createElement("div");
    row.className = "rd-hud-row";
    row.innerHTML =
      '<div class="rd-counter"><div class="rd-counter-num" id="rdCNum">01</div></div>' +
      '<div class="rd-dots-placeholder"></div>' +
      '<div class="rd-arrows">' +
      '<button class="rd-na" id="rdPrev">&#8592;</button>' +
      '<button class="rd-na" id="rdNext">&#8594;</button>' +
      "</div>";
    hud.appendChild(row);

    /* Progress bar below the row */
    var progressBar = document.createElement("div");
    progressBar.className = "rd-hud-progress";
    progressBar.innerHTML =
      '<div class="rd-hud-progress-fill" id="rdProgFill"></div>';
    hud.appendChild(progressBar);

    sticky.appendChild(hud);

    if (hsDots) {
      var ph = row.querySelector(".rd-dots-placeholder");
      if (ph) ph.replaceWith(hsDots.cloneNode(true));
      if (hsBottom) hsBottom.style.display = "none";
    }

    btnPrev = document.getElementById("rdPrev");
    btnNext = document.getElementById("rdNext");
    counterNum = document.getElementById("rdCNum");

    /* Point progFill at the new in-HUD bar */
    progFill = document.getElementById("rdProgFill");

    btnPrev.addEventListener("click", function () {
      scrollToIdx(curIdx - 1);
    });
    btnNext.addEventListener("click", function () {
      scrollToIdx(curIdx + 1);
    });
  }

  function scrollToIdx(idx) {
    if (idx < 0 || idx >= CARDS.length) return;
    var scrollable = outerH - window.innerHeight;
    var sliceSize = scrollable / (CARDS.length - 1);
    window.scrollTo({ top: outerTop + idx * sliceSize, behavior: "smooth" });
  }

  /* ════════════════════════════════════════════ SCROLL
     The passive scroll listener is only used when the user scrolls with
     methods OTHER than wheel (keyboard arrows, scrollbar drag, momentum
     after leaving the section, etc.).  When the wheel handler is in
     control it manually syncs scrollY, so lastScrollIdx will match and
     this function will be a no-op.
  ════════════════════════════════════════════ */
  function onScroll() {
    if (isMobile || ticking) return;
    ticking = true;
    requestAnimationFrame(processScroll);
  }

  function processScroll() {
    ticking = false;

    /* While a wheel-driven transition is running, ignore passive scroll
       events so the two systems don't fight each other. */
    if (isTransitioning) return;

    var scrollable = Math.max(outerH - window.innerHeight, 1);
    var raw = Math.max(
      0,
      Math.min(1, (window.scrollY - outerTop) / scrollable),
    );
    var idx = Math.min(
      CARDS.length - 1,
      Math.max(0, Math.round(raw * (CARDS.length - 1))),
    );
    if (idx !== lastScrollIdx) {
      lastScrollIdx = idx;
      snap(idx, false);
    }
  }

  /* ════════════════════════════════════════════ SNAP */
  function snap(idx, instant) {
    curIdx = idx;

    var tx = -(idx * window.innerWidth);

    if (instant) {
      track.style.transition = "none";
      track.style.transform = "translate(" + tx + "px,0)";
      requestAnimationFrame(function () {
        track.style.transition = "";
      });
    } else {
      track.style.transform = "translate(" + tx + "px,0)";
    }

    /* Station active states */
    stationEls.forEach(function (s, i) {
      var diff = i - idx;
      s.classList.toggle("rd-station-active", diff === 0);
      s.classList.toggle("rd-station-adj-l", diff === -1);
      s.classList.toggle("rd-station-adj-r", diff === 1);
      s.classList.toggle("rd-station-distant", Math.abs(diff) > 1);
    });

    /* Dots */
    dotEls.forEach(function (d, i) {
      if (d) d.classList.toggle("active", i === idx);
    });
    document.querySelectorAll("#rdHUD .hs-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === idx);
    });

    /* Progress */
    if (progFill) progFill.style.width = (idx / (CARDS.length - 1)) * 100 + "%";

    /* Counter */
    if (counterNum) counterNum.textContent = String(idx + 1).padStart(2, "0");

    /* Arrows */
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === CARDS.length - 1;

    /* Hint */
    if (hintEl && idx > 0) hintEl.classList.add("done");
  }

  /* ════════════════════════════════════════════ DOTS */
  function buildDots() {
    dotEls = [];
    CARDS.forEach(function (m, i) {
      var el = document.getElementById(m.dotId);
      if (!el) return;
      el.addEventListener("click", function () {
        if (isMobile) return;
        scrollToIdx(i);
      });
      dotEls.push(el);
    });
  }

  /* ════════════════════════════════════════════ MOBILE */
  function setupMobile() {
    track.innerHTML = "";
    track.style.transform = "none";
    track.style.transition = "none";

    CARDS.forEach(function (m) {
      var card = document.createElement("div");
      card.className = "rd-card rd-active" + (m.isMil ? " rd-card-mil" : "");

      var html = "";
      if (m.isMil) html += '<div class="rd-warning">◈ Military Service</div>';
      html += '<div class="rd-tag">' + m.tag + "</div>";
      html += '<div class="rd-date">' + m.date + "</div>";
      html += '<div class="rd-title">' + m.title + "</div>";
      html +=
        '<div class="rd-org">' + m.company + " · " + m.location + "</div>";
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

  /* ════════════════════════════════════════════ RESIZE */
  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      isMobile = window.innerWidth <= 700;
      var hsBottom = document.querySelector(".hs-bottom");
      if (isMobile) {
        if (animFrame) cancelAnimationFrame(animFrame);
        if (hsBottom) hsBottom.style.display = "flex";
        setupMobile();
        buildDots();
        return;
      }
      if (hsBottom) hsBottom.style.display = "none";
      measureOuter();
      buildStrip();
      injectHUD();
      lastScrollIdx = -1;
      snap(curIdx, true);
      processScroll();
    }, 150);
  }
})();
