/* ═══════════════════════════════════════════════════
   sections-core.js — Scroll Reveal · Nav · Projects
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Smooth nav scroll ── */
  const NAV_MAP = {
    "#about": "#about-section",
    "#projects": "#projects-section",
    "#contact": "#contact-section",
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const tid = NAV_MAP[link.getAttribute("href")];
    if (!tid) return;
    e.preventDefault();
    const t = document.querySelector(tid);
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ── Reveal on scroll ── */
  const revObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

  /* ── Skill bars ── */
  const skillObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          skillObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  document.querySelectorAll(".skill-card").forEach((c) => skillObs.observe(c));

  /* ── Active nav ── */
  const SEC_NAV = {
    "about-section": "#about",
    "projects-section": "#projects",
    "contact-section": "#contact",
  };
  const secObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const h = SEC_NAV[e.target.id];
        if (!h) return;
        document
          .querySelectorAll(".c-link")
          .forEach((l) => l.classList.remove("active"));
        const m = document.querySelector(`.c-link[href="${h}"]`);
        if (m) m.classList.add("active");
      });
    },
    { threshold: 0.3 },
  );
  Object.keys(SEC_NAV).forEach((id) => {
    const el = document.getElementById(id);
    if (el) secObs.observe(el);
  });

  /* ══════════════════════════════════════════════════
     PROJECTS — Cinematic filmstrip
     Active card = full height + full opacity
     Neighbors = scaled down, dimmed, blurred
     Drag · swipe · keyboard · dots
  ══════════════════════════════════════════════════ */

  const GH = `<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
  const EXT = `<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  const MORE = `<svg viewBox="0 0 10 10"><line x1="2" y1="5" x2="8" y2="5"/><polyline points="5,2 8,5 5,8"/></svg>`;

  const PROJECTS = [
    {
      id: "akelny",
      title: "Akelny",
      hue: 28,
      hasDemo: true,
      demo: "https://akelny-front.vercel.app/main",
      desc: "Food ordering platform unifying small business owners and scattered food creators into one powerful hub.",
      longDesc:
        "Akelny was built with a mission: give every small food business owner a stage, and bring all food creators — scattered across social platforms — into one powerful hub. Developed with ASP.NET Core Web API, Entity Framework Core, Angular, and SQL Server to manage restaurants, menus, and customer orders. Features secure authentication via JWT and Google OAuth, role-based access control, and Onion Architecture for long-term scalability.",
      tags: [
        "ASP.NET Core",
        "Angular",
        "SQL Server",
        "JWT",
        "Entity Framework",
      ],
      githubLinks: [
        {
          label: "Backend",
          url: "https://github.com/abdelrahmanelsaadany1/Akelni-Backend",
        },
        {
          label: "Frontend",
          url: "https://github.com/Abdelrahman-2222/AKELNY-Front",
        },
      ],
      color: "#FF6B6B",
      color2: "#4ECDC4",
      icon: "🍽️",
      category: "Food Platform",
    },
    {
      id: "inventory",
      title: "Inventory IMS",
      hue: 155,
      hasDemo: false,
      demo: null,
      desc: "Multi-warehouse inventory system with role-based access, stock validation, inter-warehouse transfers, and real-time monitoring.",
      longDesc:
        "A full-featured Inventory Management System built with ASP.NET Core MVC and Entity Framework Core. Supports multi-warehouse operations with inter-warehouse product transfers, real-time stock monitoring, and expiry/stale product reporting. Modules cover Customers, Suppliers, Products, Warehouses, Supply Orders, Release Orders, and detailed reporting dashboards.",
      tags: [
        "ASP.NET Core MVC",
        "Entity Framework Core",
        "SQL Server",
        "Role-Based Access",
        "Multi-Warehouse",
      ],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/Inventory_Management_System",
        },
      ],
      color: "#667EEA",
      color2: "#764BA2",
      icon: "📦",
      category: "Management System",
    },
    {
      id: "exam",
      title: "Examination System",
      hue: 245,
      hasDemo: true,
      demo: "https://abdelrahmanelsaadany1.github.io/Examination-System/",
      desc: "Full exam platform — secure login, dynamic questions via JSON API, countdown timer, auto-submit, and real-time scoring.",
      longDesc:
        "A browser-based Examination System built with vanilla HTML5, CSS3, and JavaScript ES6. Features secure authentication with LocalStorage, dynamic question loading from a REST/JSON API with shuffle logic, a 2-minute countdown timer that auto-submits on expiry, question flagging, and a rich result page showing pass/fail status, score percentage, confetti on success, and animated feedback.",
      tags: ["HTML5", "CSS3", "JavaScript ES6", "JSON API", "LocalStorage"],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/Examination-System",
        },
      ],
      color: "#F093FB",
      color2: "#F5576C",
      icon: "📝",
      category: "Education Platform",
    },
    {
      id: "simplify",
      title: "SIMplify",
      hue: 195,
      hasDemo: false,
      demo: null,
      desc: "Graduation project — student management platform for course tracking, GPA calculation, and personalized academic resources.",
      longDesc:
        "SIMplify is a full-stack mobile platform developed as a Computer Science graduation project (CGPA: 3.2, 2019–2023). Built for students to manage courses, track academic progress, calculate GPA, and access learning resources with personalized recommendations. Role: Flutter Developer working alongside a Laravel backend and MySQL database.",
      tags: ["Flutter", "Laravel", "MySQL", "REST API", "Mobile"],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/Graduation-project",
        },
      ],
    },
    {
      id: "orders",
      title: "Order Management",
      hue: 320,
      hasDemo: false,
      demo: null,
      desc: ".NET Web API with Clean Architecture — full order lifecycle from customer and product management to invoices and auth.",
      longDesc:
        "A .NET Web API built with Clean Architecture (Core, Infrastructure, Presentation, Shared layers). Manages the full order lifecycle — from customer and product management to order creation, invoice generation, and authentication. Controllers cover Customer, Order, Invoice, Products, and Auth endpoints.",
      tags: [
        ".NET Web API",
        "Clean Architecture",
        "Entity Framework",
        "Repository Pattern",
        "JWT Auth",
      ],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/OrderManagmentSystemRoute",
        },
      ],
    },
    {
      id: "ikea",
      title: "IKEA Clone",
      hue: 40,
      hasDemo: false,
      demo: null,
      desc: "Enterprise ASP.NET Core MVC with 3-layer architecture, Employee & Department CRUD, email auth, and reset password flows.",
      longDesc:
        "A production-structured IKEA management system built on ASP.NET Core MVC with a clean 3-layer architecture: DAL, BLL, and PL. Features full CRUD for Employees and Departments, attachment handling, email-based authentication with forget/reset password flows, sign-up/sign-in with ASP.NET Identity, and AutoMapper-based view models.",
      tags: [
        "ASP.NET Core MVC",
        "Entity Framework",
        "3-Layer Architecture",
        "ASP.NET Identity",
        "AutoMapper",
      ],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/IKEAProjectFinal",
        },
      ],
    },
    {
      id: "voya",
      title: "VOYA",
      hue: 38,
      hasDemo: true,
      demo: "https://abdelrahmanelsaadany1.github.io/Voya/",
      desc: "Travel discovery dashboard — live weather, attractions, maps, visa info, local phrases, jet lag calculator, and budget estimates.",
      longDesc:
        "VOYA is a full travel intelligence dashboard built with pure HTML, CSS, and JavaScript. Search any city and instantly get live weather via Open-Meteo, an embedded OpenStreetMap, must-see attractions, a climate chart, best months to visit, daily budget tiers, visa & entry requirements, essential local phrases with Web Speech API pronunciation, a jet lag calculator, and a safety & vibe index.",
      tags: [
        "HTML5",
        "CSS3",
        "JavaScript ES6",
        "Open-Meteo API",
        "OpenStreetMap",
      ],
      githubLinks: [
        { label: "Code", url: "https://github.com/abdelrahmanelsaadany1/Voya" },
      ],
    },
    {
      id: "atmosphera",
      title: "ATMOSPHERA",
      hue: 210,
      hasDemo: true,
      demo: "https://abdelrahmanelsaadany1.github.io/ATMOSPHERA/",
      desc: "Premium weather app — animated rain/snow/lightning, sun arc, pressure gauge, outfit builder, and ambient sound synthesis.",
      longDesc:
        "ATMOSPHERA is a feature-rich weather dashboard built with vanilla HTML, CSS, and JavaScript. Powered by OpenWeatherMap API: current conditions, 5-day forecast, animated sun arc with real sunrise/sunset tracking, dynamic rain/snow/lightning visual FX, outfit builder, activity scores, and a Web Audio API ambient sound player matching the current weather.",
      tags: [
        "HTML5",
        "CSS3",
        "JavaScript ES6",
        "OpenWeatherMap API",
        "Web Audio API",
      ],
      githubLinks: [
        {
          label: "Code",
          url: "https://github.com/abdelrahmanelsaadany1/ATMOSPHERA",
        },
      ],
    },
  ];

  /* ── DOM ── */
  const track = document.getElementById("pwTrack");
  const outer = document.getElementById("pwOuter");
  const dotsEl = document.getElementById("pwDots");
  const curEl = document.getElementById("pwCur");
  const arcEl = document.getElementById("pwArcCircle");
  if (!track || !outer) return;

  const G = window.gsap;
  const TOTAL = PROJECTS.length;
  const CIRC = 125.66;

  document.getElementById("pwTot").textContent = String(TOTAL).padStart(2, "0");

  /* ── Build cards ── */
  PROJECTS.forEach((p, i) => {
    const ghLinks = p.githubLinks
      .map(
        (g) =>
          `<a href="${g.url}" class="pw-btn-gh" target="_blank" rel="noopener" onclick="event.stopPropagation()">${GH}${g.label}</a>`,
      )
      .join("");

    const card = document.createElement("div");
    card.className = "pw-card";
    card.dataset.index = i;
    card.style.setProperty("--card-color1", "#0d2f51");
    card.style.setProperty("--card-color2", "#08203b");
    card.innerHTML = `
      <span class="pw-card-idx">${String(i + 1).padStart(2, "0")}</span>
      ${p.hasDemo ? `<span class="pw-card-live">LIVE</span>` : ""}
      <div class="pw-card-shapes">
        <span class="pw-shape shape-1"></span>
        <span class="pw-shape shape-2"></span>
        <span class="pw-shape shape-3"></span>
      </div>
      <div class="pw-card-body">
        <div class="pw-card-title">${p.title}</div>
        <div class="pw-card-desc">${p.desc}</div>
        <div class="pw-card-tags">${p.tags
          .slice(0, 6)
          .map((t) => `<span class="pw-tag">${t}</span>`)
          .join("")}</div>
        <div class="pw-card-links">
          ${p.hasDemo ? `<a href="${p.demo}" class="pw-btn-live" target="_blank" rel="noopener" onclick="event.stopPropagation()">${EXT}Live Demo</a>` : ""}
          ${ghLinks}
          <button class="pw-btn-more" onclick="event.stopPropagation();openModal(${i})">Details${MORE}</button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      if (!card.classList.contains("active") && !_dragged) goTo(i);
    });

    track.appendChild(card);

    /* dot */
    const dot = document.createElement("button");
    dot.className = "pw-dot" + (i === 0 ? " active" : "");
    dot.dataset.dot = i;
    dot.setAttribute("aria-label", `Project ${i + 1}`);
    dot.addEventListener("click", () => {
      dismissHint();
      goTo(i);
    });
    dotsEl.appendChild(dot);
  });

  const cards = Array.from(track.querySelectorAll(".pw-card"));
  const dots = Array.from(dotsEl.querySelectorAll(".pw-dot"));

  /* ══════════════════════════════════════════════════
     INJECT EXPLORE HINT PANEL (left dead zone)
  ══════════════════════════════════════════════════ */
  const section = document.getElementById("projects-section");

  const hintEl = document.createElement("div");
  hintEl.className = "pw-explore-hint";
  hintEl.innerHTML = `
    <div class="pw-hint-chevrons">
      <div class="pw-hint-chevron"></div>
      <div class="pw-hint-chevron"></div>
      <div class="pw-hint-chevron"></div>
    </div>
    <div class="pw-hint-line">
      <span class="pw-hint-particle"></span>
      <span class="pw-hint-particle"></span>
      <span class="pw-hint-particle"></span>
    </div>
    <div class="pw-hint-label">Explore</div>
  `;
  if (section) section.appendChild(hintEl);

  /* ── Arrow nav buttons ── */
  const arrowLeft = document.createElement("button");
  arrowLeft.className = "pw-nav-arrow pw-arrow-left";
  arrowLeft.setAttribute("aria-label", "Previous project");
  arrowLeft.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;

  const arrowRight = document.createElement("button");
  arrowRight.className = "pw-nav-arrow pw-arrow-right";
  arrowRight.setAttribute("aria-label", "Next project");
  arrowRight.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`;

  if (section) {
    section.appendChild(arrowLeft);
    section.appendChild(arrowRight);
  }

  arrowLeft.addEventListener("click", () => {
    dismissHint();
    goTo(_current - 1);
  });
  arrowRight.addEventListener("click", () => {
    dismissHint();
    goTo(_current + 1);
  });

  /* ── Mobile swipe hint ── */
  const swipeHint = document.createElement("div");
  swipeHint.className = "pw-swipe-hint";
  swipeHint.innerHTML = `
    <div class="pw-swipe-arrows">
      <div class="pw-swipe-arr"></div>
    </div>
    <div class="pw-swipe-icon">
      <svg class="pw-swipe-hand" viewBox="0 0 24 24" fill="none" stroke="rgba(48,205,207,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 11V9a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0v10l-1.5-1.5a2 2 0 0 0-2.83 2.83L6 22h12v-2a4 4 0 0 0-1.17-2.83L15 16"/>
      </svg>
      <span class="pw-swipe-label">Swipe</span>
    </div>
    <div class="pw-swipe-arrows">
      <div class="pw-swipe-arr" style="transform:rotate(-45deg)"></div>
    </div>
  `;

  /* Insert swipe hint after dots */
  if (dotsEl && dotsEl.parentNode) {
    dotsEl.parentNode.insertBefore(swipeHint, dotsEl.nextSibling);
  }

  /* Auto-dismiss swipe hint after 4s */
  setTimeout(() => {
    swipeHint.classList.add("dismissed");
  }, 4000);

  /* ── Dismiss hint on first interaction ── */
  let _hintDismissed = false;
  function dismissHint() {
    if (_hintDismissed) return;
    _hintDismissed = true;
    hintEl.classList.add("dismissed");
    swipeHint.classList.add("dismissed");
  }

  /* ── Carousel state ── */
  let _current = 0;
  let _busy = false;
  let _dragged = false;

  function cardW() {
    const c = cards[0];
    return c ? c.offsetWidth + 24 : 380;
  }

  function getOffset(idx) {
    const cw = cardW();
    const cardPx = cards[0] ? cards[0].offsetWidth : 400;
    const vw = outer.offsetWidth;
    return -(idx * cw) + vw / 2 - cardPx / 2;
  }

  function applyOffset(animate) {
    if (!animate) track.classList.add("no-anim");
    else track.classList.remove("no-anim");
    track.style.transform = `translateX(${getOffset(_current)}px)`;
  }

  function syncUI() {
    const pct = TOTAL <= 1 ? 1 : _current / (TOTAL - 1);
    const dashOff = CIRC - pct * CIRC;

    cards.forEach((c, i) => c.classList.toggle("active", i === _current));
    dots.forEach((d, i) => d.classList.toggle("active", i === _current));
    if (curEl) curEl.textContent = String(_current + 1).padStart(2, "0");
    if (arcEl) arcEl.style.strokeDashoffset = String(dashOff);

    /* Arrow visibility: dim at edges */
    arrowLeft.style.opacity = _current === 0 ? "0.25" : "";
    arrowRight.style.opacity = _current === TOTAL - 1 ? "0.25" : "";
  }

  function goTo(idx) {
    if (_busy) return;
    idx = ((idx % TOTAL) + TOTAL) % TOTAL;
    if (idx === _current) {
      applyOffset(true);
      return;
    }
    _busy = true;
    _current = idx;
    applyOffset(true);
    syncUI();
    setTimeout(() => {
      _busy = false;
    }, 720);
  }

  /* ── Keyboard ── */
  document.addEventListener("keydown", (e) => {
    if (!section) return;
    const r = section.getBoundingClientRect();
    if (r.top >= window.innerHeight || r.bottom <= 0) return;
    if (e.key === "ArrowLeft") {
      dismissHint();
      goTo(_current - 1);
    }
    if (e.key === "ArrowRight") {
      dismissHint();
      goTo(_current + 1);
    }
  });

  /* ── Drag (mouse) ── */
  let _mx = 0,
    _mbase = 0,
    _mdown = false,
    _mhorizDecided = false,
    _mhoriz = false;
  outer.addEventListener("mousedown", (e) => {
    _mdown = true;
    _mx = e.clientX;
    _mbase = getOffset(_current);
    _dragged = false;
    _mhorizDecided = false;
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!_mdown) return;
    const dx = e.clientX - _mx;
    if (!_mhorizDecided && Math.abs(dx) > 5) {
      _mhoriz = true;
      _mhorizDecided = true;
    }
    if (!_mhoriz) return;
    if (Math.abs(dx) > 8) _dragged = true;
    track.classList.add("no-anim");
    track.style.transform = `translateX(${_mbase + dx * 0.65}px)`;
  });
  window.addEventListener("mouseup", (e) => {
    if (!_mdown) return;
    _mdown = false;
    const dx = e.clientX - _mx;
    if (_dragged && _mhoriz) {
      dismissHint();
      if (dx < -70) goTo(_current + 1);
      else if (dx > 70) goTo(_current - 1);
      else {
        track.classList.remove("no-anim");
        applyOffset(true);
      }
    }
    _mhoriz = false;
    _mhorizDecided = false;
  });

  /* ── Touch swipe ── */
  let _tx = 0,
    _ty = 0,
    _tbase = 0,
    _thoriz = null;
  outer.addEventListener(
    "touchstart",
    (e) => {
      _tx = e.touches[0].clientX;
      _ty = e.touches[0].clientY;
      _tbase = getOffset(_current);
      _thoriz = null;
      _dragged = false;
    },
    { passive: true },
  );
  outer.addEventListener(
    "touchmove",
    (e) => {
      const dx = e.touches[0].clientX - _tx,
        dy = e.touches[0].clientY - _ty;
      if (_thoriz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
        _thoriz = Math.abs(dx) > Math.abs(dy);
      if (!_thoriz) return;
      e.preventDefault();
      if (Math.abs(dx) > 10) _dragged = true;
      track.classList.add("no-anim");
      track.style.transform = `translateX(${_tbase + dx * 0.65}px)`;
    },
    { passive: false },
  );
  outer.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - _tx;
      if (_dragged && _thoriz) {
        dismissHint();
        if (dx < -60) goTo(_current + 1);
        else if (dx > 60) goTo(_current - 1);
        else {
          track.classList.remove("no-anim");
          applyOffset(true);
        }
      }
      _thoriz = null;
    },
    { passive: true },
  );

  /* ── Resize ── */
  window.addEventListener("resize", () => applyOffset(false));

  /* ── Entrance animation ── */
  let _entered = false;
  const entObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !_entered) {
          _entered = true;
          applyOffset(false);
          syncUI();
          if (G) {
            G.fromTo(
              cards,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.07,
                ease: "power3.out",
                delay: 0.1,
                onComplete() {
                  syncUI();
                },
              },
            );
            /* Animate hint panel entrance */
            G.fromTo(
              hintEl,
              { opacity: 0, x: -16 },
              { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.6 },
            );
            /* Animate arrow buttons entrance */
            G.fromTo(
              [arrowLeft, arrowRight],
              { opacity: 0 },
              { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.9 },
            );
            const top = document.querySelector(".pw-top");
            if (top)
              G.fromTo(
                top,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
              );
          } else {
            syncUI();
          }
        }
      });
    },
    { threshold: 0.15 },
  );

  if (section) entObs.observe(section);

  /* hide cards initially */
  if (!G) {
    applyOffset(false);
    syncUI();
  } else
    cards.forEach((c) => {
      c.style.opacity = "0";
    });

  /* ── Modal ── */
  window.openModal = function (idx) {
    const p = PROJECTS[idx];
    document.getElementById("m-num").textContent =
      `PROJECT ${String(idx + 1).padStart(2, "0")}`;
    document.getElementById("m-title").textContent = p.title;
    document.getElementById("m-desc").textContent = p.longDesc;
    const badge = document.getElementById("m-badge");
    if (badge) badge.style.display = p.hasDemo ? "inline-block" : "none";

    document.getElementById("m-tags").innerHTML = p.tags
      .map((t) => `<span class="m-tag">${t}</span>`)
      .join("");

    const ghHTML = p.githubLinks
      .map(
        (g) =>
          `<a href="${g.url}" class="m-gh" target="_blank" rel="noopener">${GH}${g.label} Repo</a>`,
      )
      .join("");
    const demoHTML = p.hasDemo
      ? `<a href="${p.demo}" class="m-demo" target="_blank" rel="noopener">${EXT}Live Demo</a>`
      : `<span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;letter-spacing:2px;color:rgba(255,255,255,.2);text-transform:uppercase;align-self:center">No live demo</span>`;
    document.getElementById("m-links").innerHTML = ghHTML + demoHTML;

    document.getElementById("modal-overlay").classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function () {
    document.getElementById("modal-overlay").classList.remove("open");
    document.body.style.overflow = "";
  };

  const mClose = document.getElementById("m-close");
  const mOverlay = document.getElementById("modal-overlay");
  if (mClose) mClose.addEventListener("click", closeModal);
  if (mOverlay) {
    mOverlay.addEventListener("click", (e) => {
      if (e.target === mOverlay) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mOverlay?.classList.contains("open"))
      closeModal();
  });
})();
