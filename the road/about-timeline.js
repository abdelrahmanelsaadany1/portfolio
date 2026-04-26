(function () {
  "use strict";

  window.addEventListener("load", function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(setup);
    });
  });

  /* ─── DATA ─── */
  var CARDS = [
    {
      dotId: "hsDot0",
      tag: "Full-Time",
      date: "Oct 2025 — Apr 2026",
      title: "Full Stack .NET Developer",
      company: "Arab Computers",
      location: "Alexandria, Egypt · 7 months",
      bullets: [
        "Built a multi-tenant logistics & freight management system with .NET 8 Web API + Angular — shipment tracking, invoicing, tariffs, multi-currency transactions",
        "Maintained an enterprise HR & payroll system (ASP.NET MVC / .NET Framework) covering employee lifecycle, attendance, payroll, recruitment & KPI workflows",
        "Containerised services with Docker and ran Agile sprints via Azure DevOps",
      ],
      tags: [
        { name: "ASP.NET Core", accent: true },
        { name: "Angular", accent: true },
        { name: "CQRS", accent: true },
        { name: ".NET 8", accent: false },
        { name: "Docker", accent: false },
        { name: "Azure DevOps", accent: false },
        { name: "SQL Server", accent: false },
        { name: "JWT", accent: false },
        { name: "EF Core", accent: false },
        { name: "REST API", accent: false },
        { name: "SignalR", accent: false },
        { name: "C#", accent: true },
      ],
      layout: "job",
      num: "01",
    },
    {
      dotId: "hsDot1",
      tag: "Internship",
      date: "Mar 2025 — Aug 2025",
      title: "Full Stack .NET Intern",
      company: "ITI — Intensive Code Camp",
      location: "Alexandria, Egypt · 6 months",
      bullets: [
        "C#, ASP.NET Core, LINQ, Entity Framework Core and SQL Server deep-dive track",
        "Front-end track: HTML5, CSS3, Bootstrap, JavaScript (ES6+), Angular",
        "Applied Agile, version control, secure coding & software testing on real-world projects",
      ],
      tags: [
        { name: "ASP.NET Core", accent: true },
        { name: "Angular", accent: true },
        { name: "EF Core", accent: true },
        { name: "SQL Server", accent: false },
        { name: "JWT", accent: false },
        { name: "Bootstrap", accent: false },
        { name: "C#", accent: true },
        { name: "LINQ", accent: false },
        { name: "JavaScript", accent: false },
        { name: "REST API", accent: false },
        { name: "HTML5", accent: false },
        { name: "CSS3", accent: false },
      ],
      layout: "job",
      num: "02",
    },
    {
      dotId: "hsDotMil",
      tag: "Service",
      date: "Dec 2024",
      title: "Military Service",
      company: "Egyptian Armed Forces",
      location: "Completed · Dec 2024",
      bullets: [
        "Successfully completed mandatory national military service",
        "Strengthened discipline, leadership under pressure & teamwork in high-stakes environments",
      ],
      tags: [],
      layout: "full-left",
      isMil: true,
      num: "03",
    },
    {
      dotId: "hsDot2",
      tag: "Training",
      date: "2022",
      title: "IoT Development Program",
      company: "ITI — Smart Village",
      location: "Cairo, Egypt",
      bullets: [
        "Hands-on IoT application development with IoTik, Sense SigFox & Minew BLE Gateway",
        "Implemented wireless communication protocols and tested sensor-to-cloud data pipelines",
      ],
      tags: [],
      layout: "full-left",
      num: "04",
    },
    {
      dotId: "hsDot3",
      tag: "Education",
      date: "2019 — 2023",
      title: "B.Sc. Computer Science",
      company: "Alexandria University",
      location: "Faculty of Science · CGPA 3.2 / 4.0",
      bullets: [
        "SIM Department — Software, Internet & Multimedia engineering track",
        "Graduation Project: SIMplify — student management platform (Flutter, Laravel, MySQL)",
        "Core modules: OOP, Algorithms, Data Structures, Databases, Software Engineering",
      ],
      tags: [
        { name: "OOP", accent: false },
        { name: "Algorithms", accent: false },
        { name: "C#", accent: true },
        { name: "Java", accent: false },
        { name: "Flutter", accent: true },
        { name: "Laravel", accent: true },
        { name: "MySQL", accent: false },
        { name: "Data Structures", accent: false },
        { name: "Sw Engineering", accent: false },
      ],
      layout: "job",
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
  var outerTop = 0,
    outerH = 0;
  var btnPrev, btnNext, counterNum;
  var animFrame = null;

  var TRANSITION_MS = 880;
  var isTransitioning = false;
  var transitionTimer = null;

  var BOUNDARY_HOLD_MS = 700;
  var boundaryHeld = false;
  var boundaryReleased = false;
  var boundaryDir = 0;
  var boundaryTimer = null;

  var particlesPaused = false;
  var particleCanvas = null;

  /* ═══ SETUP ═══ */
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

    document.addEventListener("visibilitychange", function () {
      particlesPaused = document.hidden;
      if (!particlesPaused && animFrame === null) resumeParticles();
    });

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

  /* ═══ WHEEL SNAP ═══ */
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
      window.scrollTo({
        top: dir < 0 ? outerTop : outerTop + scrollable,
        behavior: "instant",
      });
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

  /* ══════════════════════════════════════════════════════════
     BUILD SKILL MARQUEE
     3 horizontal rows, alternating scroll direction.
     Each row duplicated once for seamless CSS loop.
  ══════════════════════════════════════════════════════════ */
  function buildSkillMarqueeHTML(tags) {
    var rows = [[], [], []];
    tags.forEach(function (t, i) {
      rows[i % 3].push(t);
    });

    var html = '<div class="rd-marquee-wrap">';
    rows.forEach(function (row, ri) {
      if (!row.length) return;
      var dir = ri % 2 === 0 ? "fwd" : "rev";
      html += '<div class="rd-marquee-row">';
      html += '<div class="rd-marquee-inner rd-mq-' + dir + '">';
      /* Copy A */
      row.forEach(function (t) {
        html +=
          '<span class="rd-mq-chip' +
          (t.accent ? " rd-mq-accent" : "") +
          '">' +
          t.name +
          "</span>";
      });
      /* Copy B — seamless duplicate */
      row.forEach(function (t) {
        html +=
          '<span class="rd-mq-chip rd-mq-dup' +
          (t.accent ? " rd-mq-accent" : "") +
          '">' +
          t.name +
          "</span>";
      });
      html += "</div></div>";
    });
    html += "</div>";
    return html;
  }

  /* ═══ BUILD STRIP ═══ */
  function buildStrip() {
    track.innerHTML = "";
    stationEls = [];

    particleCanvas = document.createElement("canvas");
    particleCanvas.id = "csBgCanvas";
    particleCanvas.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;opacity:0.38;";
    track.appendChild(particleCanvas);
    startParticles(particleCanvas);

    CARDS.forEach(function (m) {
      var isFull = m.layout === "full-left";
      var station = document.createElement("div");
      station.className =
        "rd-station" +
        (m.isMil ? " rd-station-mil" : "") +
        (isFull ? " rd-station-full" : "");

      var leftPane = document.createElement("div");
      leftPane.className = "rd-left-pane";
      station.appendChild(leftPane);

      var card = document.createElement("div");
      card.className = "rd-card-new" + (isFull ? " rd-card-full" : "");

      /* LEFT COLUMN */
      var leftHTML =
        '<div class="rd-col-left' +
        (isFull ? " rd-col-left-wide" : "") +
        '">' +
        '<div class="rd-meta-row">' +
        '<span class="rd-status' +
        (m.isMil ? " rd-status-mil" : "") +
        '">' +
        '<span class="rd-status-dot"></span>' +
        m.tag +
        "</span>" +
        "</div>" +
        '<div class="rd-date-new">' +
        m.date +
        "</div>" +
        '<h3 class="rd-title-new">' +
        m.title +
        "</h3>" +
        '<div class="rd-company-block">' +
        '<div class="rd-company-name">' +
        m.company +
        "</div>" +
        '<div class="rd-company-loc">' +
        m.location +
        "</div>" +
        "</div>" +
        '<div class="rd-col-divider"></div>';

      if (m.bullets && m.bullets.length) {
        leftHTML += '<ul class="rd-bullets">';
        m.bullets.forEach(function (b) {
          leftHTML += "<li>" + b + "</li>";
        });
        leftHTML += "</ul>";
      }
      leftHTML += "</div>";

      /* RIGHT COLUMN — job layout only */
      var rightHTML = "";
      if (!isFull && m.tags && m.tags.length) {
        rightHTML =
          '<div class="rd-col-right">' +
          '<div class="rd-ghost-num">' +
          m.num +
          "</div>" +
          '<div class="rd-right-label">Technologies</div>' +
          buildSkillMarqueeHTML(m.tags) +
          "</div>";
      }

      card.innerHTML = leftHTML + rightHTML;
      station.appendChild(card);

      var rightPane = document.createElement("div");
      rightPane.className = "rd-right-pane";
      station.appendChild(rightPane);

      track.appendChild(station);
      stationEls.push(station);
    });
  }

  /* ═══ PARTICLES ═══ */
  function startParticles(canvas) {
    var W = window.innerWidth,
      H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    var pts = [];
    for (var i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1 + 0.2,
        a: Math.random() * 0.38 + 0.04,
        vx: (Math.random() - 0.5) * 0.11,
        vy: (Math.random() - 0.5) * 0.055,
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
    if (particleCanvas && animFrame === null) startParticles(particleCanvas);
  }

  /* ═══ HUD ═══ */
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

    var pb = document.createElement("div");
    pb.className = "rd-hud-progress";
    pb.innerHTML = '<div class="rd-hud-progress-fill" id="rdProgFill"></div>';
    hud.appendChild(pb);

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

  /* ═══ SCROLL ═══ */
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

  /* ═══ SNAP ═══ */
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

  /* ═══ DOTS ═══ */
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

  /* ═══ MOBILE ═══ */
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
      if (m.bullets && m.bullets.length) {
        html += '<ul class="rd-mob-bullets">';
        m.bullets.forEach(function (b) {
          html += "<li>" + b + "</li>";
        });
        html += "</ul>";
      }
      if (m.tags && m.tags.length) {
        html +=
          '<div class="rd-chips">' +
          m.tags
            .map(function (t) {
              return "<span>" + t.name + "</span>";
            })
            .join("") +
          "</div>";
      }
      card.innerHTML = html;
      track.appendChild(card);
    });
  }

  /* ═══ RESIZE ═══ */
  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var wasMobile = isMobile;
      isMobile = window.innerWidth <= 700;
      var hsBottom = document.querySelector(".hs-bottom");
      if (isMobile && !wasMobile) {
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
