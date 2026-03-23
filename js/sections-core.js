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

  /* SVG art generators */
  const SVG = {
    akelny: (w, h, hue = 28) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="a1" cx="55%" cy="45%" r="60%"><stop offset="0%" stop-color="hsl(${hue},60%,9%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="a2"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="${w}" height="${h}" fill="url(#a1)"/><circle cx="${w * 0.58}" cy="${h * 0.45}" r="70" fill="hsl(${hue},80%,45%)" opacity=".07" filter="url(#a2)"/><circle cx="${w * 0.58}" cy="${h * 0.46}" r="52" fill="none" stroke="hsl(${hue},75%,55%)" stroke-width="1.2" opacity=".4"/><circle cx="${w * 0.58}" cy="${h * 0.46}" r="40" fill="none" stroke="hsl(${hue},75%,55%)" stroke-width=".6" opacity=".22"/><circle cx="${w * 0.58}" cy="${h * 0.46}" r="22" fill="hsl(${hue},70%,48%)" opacity=".14"/><g stroke="hsl(${hue},75%,60%)" stroke-width="1.4" stroke-linecap="round" opacity=".75"><line x1="${w * 0.36}" y1="${h * 0.16}" x2="${w * 0.36}" y2="${h * 0.76}"/><line x1="${w * 0.33}" y1="${h * 0.16}" x2="${w * 0.33}" y2="${h * 0.38}"/><line x1="${w * 0.39}" y1="${h * 0.16}" x2="${w * 0.39}" y2="${h * 0.38}"/><path d="M${w * 0.33},${h * 0.38} Q${w * 0.36},${h * 0.47} ${w * 0.39},${h * 0.38}" fill="none"/></g><g stroke="hsl(${hue},75%,60%)" stroke-width="1.4" stroke-linecap="round" opacity=".75"><line x1="${w * 0.44}" y1="${h * 0.16}" x2="${w * 0.44}" y2="${h * 0.76}"/><path d="M${w * 0.44},${h * 0.16} Q${w * 0.48},${h * 0.28} ${w * 0.44},${h * 0.43}" fill="hsl(${hue},50%,30%)" stroke="hsl(${hue},75%,60%)"/></g><g stroke="hsl(${hue},60%,65%)" stroke-width="1" stroke-linecap="round" opacity=".3" fill="none"><path d="M${w * 0.54},${h * 0.1} Q${w * 0.57},${h * 0.07} ${w * 0.54},${h * 0.04}"/><path d="M${w * 0.6},${h * 0.12} Q${w * 0.63},${h * 0.09} ${w * 0.6},${h * 0.06}"/></g></svg>`,
    inventory: (w, h, hue = 155) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="i1" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="hsl(${hue},55%,8%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="i2"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="${w}" height="${h}" fill="url(#i1)"/><circle cx="${w * 0.5}" cy="${h * 0.4}" r="80" fill="hsl(${hue},70%,40%)" opacity=".06" filter="url(#i2)"/>${[
        0, 1, 2,
      ]
        .map((r) =>
          [0, 1, 2]
            .map((c) => {
              const bx = w * 0.28 + c * 52,
                by = h * 0.16 + r * 40;
              return `<rect x="${bx}" y="${by}" width="38" height="28" rx="3" fill="hsl(${hue},60%,35%)" stroke="hsl(${hue},70%,50%)" stroke-width=".8" opacity="${(r * 3 + c) % 3 === 0 ? 0.4 : 0.18}"/><line x1="${bx + 6}" y1="${by + 8}" x2="${bx + 20}" y2="${by + 8}" stroke="hsl(${hue},70%,60%)" stroke-width=".6" opacity=".35"/><line x1="${bx + 6}" y1="${by + 14}" x2="${bx + 16}" y2="${by + 14}" stroke="hsl(${hue},70%,60%)" stroke-width=".6" opacity=".25"/>`;
            })
            .join(""),
        )
        .join("")}</svg>`,
    exam: (w, h, hue = 245) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="e1" cx="55%" cy="45%" r="60%"><stop offset="0%" stop-color="hsl(${hue},55%,10%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="e2"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="${w}" height="${h}" fill="url(#e1)"/><circle cx="${w * 0.55}" cy="${h * 0.45}" r="75" fill="hsl(${hue},60%,45%)" opacity=".07" filter="url(#e2)"/><circle cx="${w * 0.58}" cy="${h * 0.45}" r="44" fill="none" stroke="hsl(${hue},65%,55%)" stroke-width="1.2" opacity=".38"/><line x1="${w * 0.58}" y1="${h * 0.45}" x2="${w * 0.58}" y2="${h * 0.24}" stroke="hsl(${hue},70%,65%)" stroke-width="2.2" stroke-linecap="round" opacity=".75"/><line x1="${w * 0.58}" y1="${h * 0.45}" x2="${w * 0.73}" y2="${h * 0.53}" stroke="hsl(${hue},70%,65%)" stroke-width="1.6" stroke-linecap="round" opacity=".6"/><circle cx="${w * 0.58}" cy="${h * 0.45}" r="4" fill="hsl(${hue},70%,60%)" opacity=".85"/>${[
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      ]
        .map((i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2,
            r1 = 38,
            r2 = i % 3 === 0 ? 30 : 35;
          return `<line x1="${(w * 0.58 + Math.cos(a) * r1).toFixed(1)}" y1="${(h * 0.45 + Math.sin(a) * r1).toFixed(1)}" x2="${(w * 0.58 + Math.cos(a) * r2).toFixed(1)}" y2="${(h * 0.45 + Math.sin(a) * r2).toFixed(1)}" stroke="hsl(${hue},60%,55%)" stroke-width="${i % 3 === 0 ? 1.3 : 0.6}" opacity="${i % 3 === 0 ? 0.55 : 0.25}"/>`;
        })
        .join("")}</svg>`,
    simplify: (w, h, hue = 195) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="s1" cx="50%" cy="45%" r="62%"><stop offset="0%" stop-color="hsl(${hue},55%,9%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="s2"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="${w}" height="${h}" fill="url(#s1)"/><circle cx="${w * 0.55}" cy="${h * 0.45}" r="70" fill="hsl(${hue},65%,45%)" opacity=".07" filter="url(#s2)"/><rect x="${w * 0.52}" y="${h * 0.09}" width="${w * 0.26}" height="${h * 0.82}" rx="10" fill="rgba(7,16,31,.65)" stroke="hsl(${hue},65%,55%)" stroke-width="1.3" opacity=".55"/><rect x="${w * 0.6}" y="${h * 0.09}" width="${w * 0.1}" height="${h * 0.04}" rx="2" fill="hsl(${hue},50%,12%)" opacity=".85"/>${[0, 1, 2, 3].map((i) => `<rect x="${w * 0.56}" y="${h * 0.18 + i * h * 0.14}" width="${w * 0.18}" height="${h * 0.07}" rx="3" fill="hsl(${hue},55%,40%)" opacity="${0.08 + i * 0.04}"/><rect x="${w * 0.56}" y="${h * 0.19 + i * h * 0.14}" width="${w * 0.1 + i * 0.01}" height="${h * 0.015}" rx="1" fill="hsl(${hue},70%,55%)" opacity="${0.16 + i * 0.05}"/>`).join("")}<polyline points="${w * 0.08},${h * 0.72} ${w * 0.15},${h * 0.58} ${w * 0.22},${h * 0.62} ${w * 0.3},${h * 0.44} ${w * 0.37},${h * 0.38} ${w * 0.44},${h * 0.3}" fill="none" stroke="hsl(${hue},75%,55%)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" opacity=".65"/>${[
        [0.08, 0.72],
        [0.15, 0.58],
        [0.22, 0.62],
        [0.3, 0.44],
        [0.37, 0.38],
        [0.44, 0.3],
      ]
        .map(
          ([x, y]) =>
            `<circle cx="${w * x}" cy="${h * y}" r="2.5" fill="hsl(${hue},80%,60%)" opacity=".7"/>`,
        )
        .join("")}</svg>`,
    orders: (w, h, hue = 320) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="o1" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="hsl(${hue},55%,9%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="o2"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="${w}" height="${h}" fill="url(#o1)"/><circle cx="${w * 0.5}" cy="${h * 0.45}" r="80" fill="hsl(${hue},60%,40%)" opacity=".06" filter="url(#o2)"/>${[
        [0.5, 0.16, "API"],
        [0.22, 0.38, "Customer"],
        [0.78, 0.38, "Product"],
        [0.22, 0.68, "Order"],
        [0.78, 0.68, "Invoice"],
        [0.5, 0.86, "Auth"],
      ]
        .map(([x, y, lbl], i) => {
          const cx = w * x,
            cy = h * y,
            ic = i === 0;
          return `<circle cx="${cx}" cy="${cy}" r="${ic ? 14 : 10}" fill="hsl(${hue},50%,12%)" stroke="hsl(${hue},70%,55%)" stroke-width="${ic ? 1.5 : 1}" opacity="${ic ? 0.85 : 0.58}"/><text x="${cx}" y="${cy + 3.5}" text-anchor="middle" font-family="monospace" font-size="${ic ? 6.5 : 5.5}" fill="hsl(${hue},80%,72%)" opacity="${ic ? 0.95 : 0.7}">${lbl}</text>`;
        })
        .join("")}${[
        [0.5, 0.16, 0.22, 0.38],
        [0.5, 0.16, 0.78, 0.38],
        [0.22, 0.38, 0.22, 0.68],
        [0.78, 0.38, 0.78, 0.68],
        [0.22, 0.68, 0.5, 0.86],
        [0.78, 0.68, 0.5, 0.86],
      ]
        .map(
          ([x1, y1, x2, y2]) =>
            `<line x1="${w * x1}" y1="${h * y1}" x2="${w * x2}" y2="${h * y2}" stroke="hsl(${hue},60%,50%)" stroke-width=".85" opacity=".25" stroke-dasharray="3 4"/>`,
        )
        .join("")}</svg>`,
    ikea: (w, h, hue = 40) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="k1" cx="50%" cy="50%" r="65%"><stop offset="0%" stop-color="hsl(${hue},55%,9%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="k2"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="${w}" height="${h}" fill="url(#k1)"/><ellipse cx="${w * 0.55}" cy="${h * 0.5}" rx="90" ry="55" fill="hsl(${hue},70%,40%)" opacity=".06" filter="url(#k2)"/>${[
        { y: 0.22, lbl: "PL — Presentation", op: 0.72, hl: 1 },
        { y: 0.45, lbl: "BLL — Business Logic", op: 0.55, hl: 0 },
        { y: 0.68, lbl: "DAL — Data Access", op: 0.45, hl: 0 },
      ]
        .map(
          ({ y, lbl, op, hl }) =>
            `<rect x="${w * 0.18}" y="${h * y}" width="${w * 0.64}" height="${h * 0.18}" rx="6" fill="hsl(${hue},45%,${hl ? 13 : 8}%)" stroke="hsl(${hue},70%,${hl ? 62 : 52}%)" stroke-width="${hl ? 1.5 : 0.9}" opacity="${op}"/><text x="${w * 0.5}" y="${h * y + h * 0.09 + 4}" text-anchor="middle" font-family="monospace" font-size="8" fill="hsl(${hue},80%,72%)" opacity="${op}" letter-spacing="1">${lbl}</text>`,
        )
        .join(
          "",
        )}<g stroke="hsl(${hue},70%,55%)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".5"><line x1="${w * 0.5}" y1="${h * 0.4}" x2="${w * 0.5}" y2="${h * 0.45}"/><polyline points="${w * 0.47},${h * 0.43} ${w * 0.5},${h * 0.45} ${w * 0.53},${h * 0.43}"/><line x1="${w * 0.5}" y1="${h * 0.63}" x2="${w * 0.5}" y2="${h * 0.68}"/><polyline points="${w * 0.47},${h * 0.66} ${w * 0.5},${h * 0.68} ${w * 0.53},${h * 0.66}"/></g></svg>`,
    voya: (w, h, hue = 38) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="v1" cx="55%" cy="45%" r="65%"><stop offset="0%" stop-color="hsl(${hue},55%,9%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="v2"><feGaussianBlur stdDeviation="5"/></filter><clipPath id="vc"><circle cx="${w * 0.56}" cy="${h * 0.46}" r="48"/></clipPath></defs><rect width="${w}" height="${h}" fill="url(#v1)"/><circle cx="${w * 0.56}" cy="${h * 0.46}" r="75" fill="hsl(${hue},65%,40%)" opacity=".06" filter="url(#v2)"/><circle cx="${w * 0.56}" cy="${h * 0.46}" r="48" fill="hsl(${hue},40%,7%)" stroke="hsl(${hue},70%,55%)" stroke-width="1.3" opacity=".55"/>${[-24, -12, 0, 12, 24].map((off) => `<ellipse cx="${w * 0.56}" cy="${h * 0.46 + off * 0.8}" rx="48" ry="${Math.abs(4 + off * 0.3) + 2}" fill="none" stroke="hsl(${hue},60%,50%)" stroke-width=".5" opacity=".2" clip-path="url(#vc)"/>`).join("")}<ellipse cx="${w * 0.56}" cy="${h * 0.46}" rx="24" ry="48" fill="none" stroke="hsl(${hue},60%,50%)" stroke-width=".5" opacity=".22" clip-path="url(#vc)"/><path d="M${w * 0.2},${h * 0.72} Q${w * 0.38},${h * 0.12} ${w * 0.78},${h * 0.3}" fill="none" stroke="hsl(${hue},85%,60%)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 3" opacity=".75"/><circle cx="${w * 0.2}" cy="${h * 0.72}" r="4" fill="hsl(${hue},80%,55%)" opacity=".75"/><g transform="translate(${w * 0.76},${h * 0.22})"><path d="M0,-13 Q7,-13 7,-6 Q7,0 0,11 Q-7,0 -7,-6 Q-7,-13 0,-13 Z" fill="hsl(${hue},85%,55%)" opacity=".85"/><circle cx="0" cy="-6" r="3.5" fill="#03060e" opacity=".75"/></g><rect x="${w * 0.06}" y="${h * 0.28}" width="58" height="32" rx="5" fill="rgba(7,16,31,.75)" stroke="hsl(${hue},60%,50%)" stroke-width=".6" opacity=".5"/><text x="${w * 0.06 + 8}" y="${h * 0.28 + 12}" font-family="monospace" font-size="6" fill="hsl(${hue},80%,70%)" opacity=".65">PARIS</text><text x="${w * 0.06 + 8}" y="${h * 0.28 + 22}" font-family="monospace" font-size="8" fill="hsl(${hue},90%,78%)" opacity=".85">22°C ☀</text></svg>`,
    atmosphera: (w, h, hue = 210) =>
      `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="at1" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="hsl(${hue},60%,10%)"/><stop offset="100%" stop-color="#03060e"/></radialGradient><filter id="at2"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="at3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="hsl(25,90%,55%)"/><stop offset="100%" stop-color="hsl(45,95%,60%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#at1)"/><ellipse cx="${w * 0.5}" cy="${h * 0.2}" rx="110" ry="60" fill="hsl(${hue},65%,40%)" opacity=".08" filter="url(#at2)"/><path d="M${w * 0.12},${h * 0.68} A${w * 0.38},${h * 0.58} 0 0 1 ${w * 0.88},${h * 0.68}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="2.5"/><path d="M${w * 0.12},${h * 0.68} A${w * 0.38},${h * 0.58} 0 0 1 ${w * 0.62},${h * 0.22}" fill="none" stroke="url(#at3)" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><circle cx="${w * 0.62}" cy="${h * 0.22}" r="10" fill="hsl(45,95%,65%)" opacity=".88"/><circle cx="${w * 0.62}" cy="${h * 0.22}" r="16" fill="hsl(45,95%,65%)" opacity=".13" filter="url(#at2)"/><g opacity=".48"><ellipse cx="${w * 0.32}" cy="${h * 0.44}" rx="28" ry="15" fill="hsl(${hue},40%,40%)"/><ellipse cx="${w * 0.22}" cy="${h * 0.48}" rx="17" ry="13" fill="hsl(${hue},35%,42%)"/><ellipse cx="${w * 0.42}" cy="${h * 0.47}" rx="15" ry="12" fill="hsl(${hue},35%,42%)"/></g>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="${w * 0.18 + i * w * 0.04}" y1="${h * 0.6 + (i % 3) * h * 0.06}" x2="${w * 0.18 + i * w * 0.04 - 2}" y2="${h * 0.6 + (i % 3) * h * 0.06 + 9}" stroke="hsl(${hue},70%,65%)" stroke-width="1.3" stroke-linecap="round" opacity="${0.32 + (i % 3) * 0.1}"/>`).join("")}<path d="M${w * 0.66},${h * 0.72} A${w * 0.14},${w * 0.14} 0 0 1 ${w * 0.88},${h * 0.72}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8" stroke-linecap="round"/><path d="M${w * 0.66},${h * 0.72} A${w * 0.14},${w * 0.14} 0 0 1 ${w * 0.8},${h * 0.6}" fill="none" stroke="hsl(${hue},80%,60%)" stroke-width="8" stroke-linecap="round" opacity=".52"/></svg>`,
  };

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
  const CIRC = 125.66; // 2π×20

  document.getElementById("pwTot").textContent = String(TOTAL).padStart(2, "0");

  /* ── Build cards ── */
  PROJECTS.forEach((p, i) => {
    const artFn = SVG[p.id];
    const artHTML = artFn
      ? artFn(520, 300, p.hue)
      : `<svg viewBox="0 0 520 300"><rect width="520" height="300" fill="#07101f"/></svg>`;

    const ghLinks = p.githubLinks
      .map(
        (g) =>
          `<a href="${g.url}" class="pw-btn-gh" target="_blank" rel="noopener" onclick="event.stopPropagation()">${GH}${g.label}</a>`,
      )
      .join("");

    const card = document.createElement("div");
    card.className = "pw-card";
    card.dataset.index = i;
    card.innerHTML = `
      <div class="pw-card-art">${artHTML}</div>
      <span class="pw-card-idx">${String(i + 1).padStart(2, "0")}</span>
      ${p.hasDemo ? `<span class="pw-card-live">LIVE</span>` : ""}
      <div class="pw-card-body">
        <div class="pw-card-title">${p.title}</div>
        <div class="pw-card-desc">${p.desc}</div>
        <div class="pw-card-tags">${p.tags
          .slice(0, 4)
          .map((t) => `<span class="pw-tag">${t}</span>`)
          .join("")}</div>
        <div class="pw-card-links">
          ${p.hasDemo ? `<a href="${p.demo}" class="pw-btn-live" target="_blank" rel="noopener" onclick="event.stopPropagation()">${EXT}Live Demo</a>` : ""}
          ${ghLinks}
          <button class="pw-btn-more" onclick="event.stopPropagation();openModal(${i})">Details${MORE}</button>
        </div>
      </div>
    `;

    /* clicking inactive card → navigate to it */
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
      goTo(i);
    });
    dotsEl.appendChild(dot);
  });

  const cards = Array.from(track.querySelectorAll(".pw-card"));
  const dots = Array.from(dotsEl.querySelectorAll(".pw-dot"));

  /* ── Carousel state ── */
  let _current = 0;
  let _busy = false;
  let _dragged = false;

  /* card width + gap */
  function cardW() {
    const c = cards[0];
    return c ? c.offsetWidth + 24 : 380;
  }

  /* offset so active card is centered in viewport */
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
  }

  function goTo(idx) {
    if (_busy) return;
    idx = ((idx % TOTAL) + TOTAL) % TOTAL; // wrap
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
  const section = document.getElementById("projects-section");
  document.addEventListener("keydown", (e) => {
    if (!section) return;
    const r = section.getBoundingClientRect();
    if (r.top >= window.innerHeight || r.bottom <= 0) return;
    if (e.key === "ArrowLeft") goTo(_current - 1);
    if (e.key === "ArrowRight") goTo(_current + 1);
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
    const dx = e.clientX - _mx,
      dy = e.clientY - _mx * 0;
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

    const artFn = SVG[p.id];
    document.getElementById("m-art").innerHTML = artFn
      ? artFn(720, 260, p.hue)
      : "";

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
  if (mOverlay)
    mOverlay.addEventListener("click", (e) => {
      if (e.target === mOverlay) closeModal();
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mOverlay?.classList.contains("open"))
      closeModal();
  });
})();
