/* ═══════════════════════════════════════════════════════════════
   about-timeline.js — THE JOURNEY
   OPTIMISED: timeline particle canvas removed (was 5x viewport
   wide), replaced with a small viewport-sized canvas; RAF paused
   when tab hidden or section not visible; resize debounced and
   no full DOM rebuild on every resize; IntersectionObserver used
   to pause particles when section scrolled away.
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
  var TRANSITION_MS = 850;
  var isTransitioning = false;
  var transitionTimer = null;

  var BOUNDARY_HOLD_MS = 700;
  var boundaryHeld = false;
  var boundaryReleased = false;
  var boundaryDir = 0;
  var boundaryTimer = null;

  /* ── particle state ── */
  var particlesPaused = false; // paused when section off-screen or tab hidden
  var particleCanvas = null;

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
    window.addEventListener("wheel", onWheel, { passive: false });

    /* Pause particles when tab hidden */
    document.addEventListener("visibilitychange", function () {
      particlesPaused = document.hidden;
      if (!particlesPaused && animFrame === null) resumeParticles();
    });

    /* Pause particles when section leaves viewport */
    var outer = document.getElementById("hsOuter");
    if (outer && "IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          particlesPaused = !entries[0].isIntersecting;
          if (!particlesPaused && animFrame === null) resumeParticles();
        },
        { rootMargin: "200px" },
      ).observe(outer);
    }
  }

  function measureOuter() {
    var outer = document.getElementById("hsOuter");
    var rect = outer.getBoundingClientRect();
    outerTop = rect.top + window.scrollY;
    outerH = outer.offsetHeight;
  }

  /* ════════════════════════════════════════════ WHEEL SNAP */
  function onWheel(e) {
    if (isMobile) return;
    var outer = document.getElementById("hsOuter");
    if (!outer) return;
    var rect = outer.getBoundingClientRect();
    var inSection = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    if (!inSection) {
      boundaryHeld = false;
      boundaryReleased = false;
      clearTimeout(boundaryTimer);
      return;
    }

    var dir = e.deltaY > 0 ? 1 : -1;
    var nextIdx = curIdx + dir;

    if (boundaryHeld || boundaryReleased) {
      if (dir !== boundaryDir) {
        boundaryHeld = false;
        boundaryReleased = false;
        clearTimeout(boundaryTimer);
      } else if (boundaryHeld) {
        e.preventDefault();
        e.stopPropagation();
        return;
      } else {
        boundaryReleased = false;
        return;
      }
    }

    if (nextIdx < 0 || nextIdx >= CARDS.length) {
      e.preventDefault();
      e.stopPropagation();
      var scrollable = Math.max(outerH - window.innerHeight, 1);
      if (dir < 0) {
        window.scrollTo({ top: outerTop, behavior: "instant" });
      } else {
        window.scrollTo({ top: outerTop + scrollable, behavior: "instant" });
      }
      lastScrollIdx = curIdx;
      if (boundaryHeld && dir === boundaryDir) return;
      boundaryHeld = true;
      boundaryReleased = false;
      boundaryDir = dir;
      clearTimeout(boundaryTimer);
      boundaryTimer = setTimeout(function () {
        boundaryHeld = false;
        boundaryReleased = true;
      }, BOUNDARY_HOLD_MS);
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (isTransitioning) return;
    isTransitioning = true;
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function () {
      isTransitioning = false;
    }, TRANSITION_MS + 60);
    snap(nextIdx, false);
    syncScrollPosition(nextIdx);
  }

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

    /* Viewport-sized particle canvas instead of 5× wide canvas */
    particleCanvas = document.createElement("canvas");
    particleCanvas.id = "csBgCanvas";
    particleCanvas.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;" +
      "pointer-events:none;z-index:0;opacity:0.5;";
    track.appendChild(particleCanvas);
    startParticles(particleCanvas);

    CARDS.forEach(function (m, i) {
      var station = document.createElement("div");
      station.className = "rd-station" + (m.isMil ? " rd-station-mil" : "");

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

      var card = document.createElement("div");
      card.className = "rd-card-new";
      var html = "";
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
      html += '<div class="rd-date-new">' + m.date + "</div>";
      html += '<h3 class="rd-title-new">' + m.title + "</h3>";
      html += '<div class="rd-org-block">';
      html += '  <div class="rd-org-company">' + m.company + "</div>";
      html += '  <div class="rd-org-location">' + m.location + "</div>";
      html += "</div>";
      html += '<div class="rd-sep"></div>';
      if (m.tags.length) {
        html += '<div class="rd-chips-new">';
        m.tags.forEach(function (t) {
          html += '<span class="rd-chip">' + t + "</span>";
        });
        html += "</div>";
      }
      card.innerHTML = html;
      station.appendChild(card);

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

  /* ════════════════════════════════════════════ PARTICLES
     Viewport-sized canvas, paused when hidden/off-screen.
     Reduced count: 60 instead of 160.
  ════════════════════════════════════════════ */
  function startParticles(canvas) {
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    var pts = [];
    for (var i = 0; i < 60; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.0 + 0.2,
        a: Math.random() * 0.4 + 0.05,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.06,
      });
    }

    function draw() {
      if (particlesPaused) {
        animFrame = null;
        return;
      }
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
        ctx.fillStyle = "rgba(255,255,255," + p.a.toFixed(2) + ")";
        ctx.fill();
      }
      animFrame = requestAnimationFrame(draw);
    }
    animFrame = requestAnimationFrame(draw);
  }

  function resumeParticles() {
    if (particleCanvas && animFrame === null) {
      /* re-kick the RAF by rebuilding — simpler than re-threading state */
      startParticles(particleCanvas);
    }
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

  /* ════════════════════════════════════════════ SCROLL */
  function onScroll() {
    if (isMobile || ticking) return;
    ticking = true;
    requestAnimationFrame(processScroll);
  }

  function processScroll() {
    ticking = false;
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

    stationEls.forEach(function (s, i) {
      var diff = i - idx;
      s.classList.toggle("rd-station-active", diff === 0);
      s.classList.toggle("rd-station-adj-l", diff === -1);
      s.classList.toggle("rd-station-adj-r", diff === 1);
      s.classList.toggle("rd-station-distant", Math.abs(diff) > 1);
    });

    dotEls.forEach(function (d, i) {
      if (d) d.classList.toggle("active", i === idx);
    });
    document.querySelectorAll("#rdHUD .hs-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === idx);
    });

    if (progFill) progFill.style.width = (idx / (CARDS.length - 1)) * 100 + "%";
    if (counterNum) counterNum.textContent = String(idx + 1).padStart(2, "0");
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === CARDS.length - 1;
    if (hintEl && idx > 0) hintEl.classList.add("done");
  }

  /* ════════════════════════════════════════════ DOTS */
  function buildDots() {
    dotEls = [];
    CARDS.forEach(function (m, i) {
      var el = document.getElementById(m.dotId);
      if (!el) return;
      el.addEventListener("click", function () {
        if (!isMobile) scrollToIdx(i);
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

  /* ════════════════════════════════════════════ RESIZE
     Debounced. On desktop: only remeasure + re-snap,
     no full DOM rebuild (cards already exist).
  ════════════════════════════════════════════ */
  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var wasMobile = isMobile;
      isMobile = window.innerWidth <= 700;
      var hsBottom = document.querySelector(".hs-bottom");

      if (isMobile && !wasMobile) {
        /* Switch to mobile layout */
        if (animFrame) {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
        if (hsBottom) hsBottom.style.display = "flex";
        setupMobile();
        buildDots();
        return;
      }

      if (!isMobile && wasMobile) {
        /* Switch back to desktop layout */
        if (hsBottom) hsBottom.style.display = "none";
        buildStrip();
        injectHUD();
        lastScrollIdx = -1;
      }

      if (!isMobile) {
        measureOuter();
        snap(curIdx, true);
        processScroll();
      }
    }, 200);
  }
})();
