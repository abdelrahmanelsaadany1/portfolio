# Abdelrahman Elsaadany — Portfolio Documentation

> **For AI assistants:** Copy everything from the "AI Context Block" section at the bottom of this file to give an AI full understanding of this project before asking it to help with any changes.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Visual Identity & Theme](#2-visual-identity--theme)
3. [File Structure](#3-file-structure)
4. [File Groups — HTML + CSS + JS Together](#4-file-groups--html--css--js-together)
5. [Every File Explained](#5-every-file-explained)
6. [Portfolio Sections](#6-portfolio-sections)
7. [Change Guide](#7-change-guide)
8. [AI Context Block](#8-ai-context-block)

---

## 1. Project Overview

A single-page personal portfolio website for **Abdelrahman Elsaadany**, a Full Stack .NET Developer based in Egypt. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build tools. Deep space sci-fi aesthetic with canvas animations, particle systems, and physics-based interactions.

**Tech Stack:** HTML5 · CSS3 · Vanilla JS · Spline · GSAP · Boxicons · Google Fonts (Rajdhani + Share Tech Mono)

---

## 2. Visual Identity & Theme

| Property | Value |
|---|---|
| **Primary accent** | `#00ddc8` (teal/cyan) |
| **Background** | `#03060e` (near-black deep navy) |
| **Text** | `rgba(224, 232, 228, 0.92)` (off-white) |
| **Dimmed text** | `rgba(224, 232, 228, 0.45)` |
| **Display font** | Rajdhani 700 — headings, names, titles |
| **Mono font** | Share Tech Mono — labels, tags, code-style text |
| **Borders** | `1px solid rgba(0, 221, 200, 0.12)` |
| **Glass panels** | `rgba(2, 8, 18, 0.82)` + `backdrop-filter: blur(22px)` |
| **Glow** | `box-shadow` with teal color on interactive elements |
| **Nav height** | `76px` → CSS variable `--nav-h` |

**CSS Variables (in `css/base.css`):**
```css
--void: #02050a
--teal: #00ddc8
--teal-05 / --teal-10 / --teal-18 / --teal-30 / --teal-60
--glass: rgba(2, 10, 20, 0.88)
--border: rgba(0, 221, 200, 0.12)
--text: rgba(224, 232, 228, 0.92)
--dim: rgba(224, 232, 228, 0.45)
--faint: rgba(224, 232, 228, 0.14)
--nav-h: 76px
--ease: cubic-bezier(0.16, 1, 0.3, 1)
--ease-back: cubic-bezier(0.34, 1.56, 0.64, 1)
--font-mono: "Share Tech Mono", monospace
--font-ui: "Rajdhani", sans-serif
```

---

## 3. File Structure

```
portfolio/
│
├── index.html
├── intro.css
├── intro.js
├── resume.pdf
│
├── css/
│   ├── base.css
│   ├── background.css
│   ├── header.css
│   ├── hero.css
│   ├── cursor.css
│   ├── spider.css
│   ├── main-responsive.css
│   ├── sections-base.css
│   ├── about-skills.css
│   ├── projects.css
│   ├── contact.css
│   └── glass-cards.css
│
├── js/
│   ├── bg-particles.js
│   ├── text-scramble.js
│   ├── magnetic.js
│   ├── parallax-scroll.js
│   ├── cursor-effects.js
│   ├── scroll-header.js
│   ├── constellation-nav.js
│   ├── mobile-nav.js
│   ├── active-nav.js
│   ├── spider-web-canvas.js
│   ├── spider-hang-cv.js
│   ├── cursor-cloud.js
│   ├── sections-core.js
│   └── contact-form.js
│
└── the road/
    ├── about-timeline.css
    └── about-timeline.js
```

---

## 4. File Groups — HTML + CSS + JS Together

> **"I want to change X — which files do I open?"**

---

### GROUP 1 — Intro Animation
> Full-screen animation on page load. Letters fall with physics, particles scatter, scene exits.

| Role | File |
|---|---|
| HTML | `index.html` → `<div id="introScene">` block |
| CSS | `intro.css` |
| JS | `intro.js` |

**Change here for:** name in drop animation · letter accent colors · gravity & bounce · particle count · hold duration · exit speed

---

### GROUP 2 — Background Particle Field
> Floating star-dust particles across the entire site. React to cursor movement with attract/repel.

| Role | File |
|---|---|
| HTML | Injected by JS — not in HTML |
| CSS | `css/background.css` |
| JS | `js/bg-particles.js` |

**Change here for:** particle colors & density · cursor radius · animated color blobs · film grain · vignette · background color

---

### GROUP 3 — Header & Desktop Navigation
> Fixed top bar. Logo left, constellation nav center, socials + hamburger right. Hides on scroll down.

| Role | File |
|---|---|
| HTML | `index.html` → `<header id="main-header">` block |
| CSS | `css/header.css` |
| JS | `js/constellation-nav.js` · `js/scroll-header.js` · `js/active-nav.js` |

**Change here for:** logo image · your name · nav link labels · social media URLs · hide/show scroll behavior · constellation star animation

---

### GROUP 4 — Mobile Navigation
> Hamburger button and full-screen overlay menu. Appears on screens below 1020px.

| Role | File |
|---|---|
| HTML | `index.html` → `.hamburger` button + `<div class="mobile-overlay">` block |
| CSS | `css/header.css` → `.hamburger`, `.mobile-overlay`, `.mobile-link`, `.mobile-back-btn` |
| JS | `js/mobile-nav.js` |

**Change here for:** mobile link labels · back button text · overlay constellation animation · breakpoint (in `css/main-responsive.css`)

---

### GROUP 5 — Scroll Progress Bar
> Thin teal line at very top of page that fills as you scroll down.

| Role | File |
|---|---|
| HTML | `index.html` → `<div id="scroll-progress"></div>` |
| CSS | `css/header.css` → `#scroll-progress` section |
| JS | `js/scroll-header.js` |

**Change here for:** bar color · bar height · glowing dot at end of bar

---

### GROUP 6 — Custom Cursor
> Replaces default cursor with a glowing teal orb. Trail particles follow. Expands on hover. Bursts on click.

| Role | File |
|---|---|
| HTML | `index.html` → `<div id="cursor-dot"></div>` + `<div id="cursor-ring"></div>` |
| CSS | `css/cursor.css` |
| JS | `js/cursor-effects.js` |

**Change here for:** cursor color & size · trail behavior · disable cursor entirely (remove both files + 2 divs in HTML)

---

### GROUP 7 — Spider Hang CV Button
> Animated spider crawls down silk thread from top center. Holds the CV download button. Retracts on click.

| Role | File |
|---|---|
| HTML | `index.html` → `<div class="spider-pos" id="spiderPos">` block |
| CSS | `css/spider.css` · `css/main-responsive.css` (mobile position) |
| JS | `js/spider-hang-cv.js` |

**Change here for:** CV file (update `href` in HTML AND `a.href` in JS) · button label · sway physics · mobile button position

---

### GROUP 8 — Hero Section (Skills Web + 3D Robot)
> First visible section. Left: interactive spider web skills wheel. Right: Spline 3D robot model.

| Role | File |
|---|---|
| HTML | `index.html` → `<section class="hero" id="about">` block |
| CSS | `css/hero.css` |
| JS | `js/spider-web-canvas.js` · `js/cursor-cloud.js` · `js/parallax-scroll.js` |

**Change here for:** "I AM A / FULL-STACK / DEVELOPER" text · skills in web wheel (edit `SKILLS` array in `js/spider-web-canvas.js`) · Spline 3D model URL · cursor particle cloud · center node size

---

### GROUP 9 — Experience Timeline (The Road)
> Horizontal-scrolling constellation career journey. Stars reveal as you scroll. Military star drops below the line.

| Role | File |
|---|---|
| HTML | `index.html` → `<section class="section-page" id="about-section">` block |
| CSS | `the road/about-timeline.css` |
| JS | `the road/about-timeline.js` |

**Change here for:** experience entries (edit `STARS` + `CARD_DATA` in JS + add div in HTML) · star colors · scroll speed · card content · military position below line · pagination dots

---

### GROUP 10 — Projects Section
> Three glass project cards in a responsive grid. Emoji icon, tech tags, title, description, links.

| Role | File |
|---|---|
| HTML | `index.html` → `<section class="section-page" id="projects-section">` block |
| CSS | `css/projects.css` · `css/glass-cards.css` · `css/sections-base.css` |
| JS | `js/sections-core.js` (scroll reveal) · `js/text-scramble.js` (heading) · `js/magnetic.js` (buttons) |

**Change here for:** add/edit/remove project cards (HTML only) · titles, descriptions, tags, links · glass blur style (`glass-cards.css`) · corner bracket decoration · card hover lift

---

### GROUP 11 — Contact Section
> Info panel left + form right. Electric toggle switches flip ON when fields are valid. Cinematic TX overlay on submit.

| Role | File |
|---|---|
| HTML | `index.html` → `<section class="section-page" id="contact-section">` block |
| CSS | `css/contact.css` · `css/glass-cards.css` |
| JS | `js/contact-form.js` |

**Change here for:** contact details email/LinkedIn/GitHub/location (HTML only) · form field labels (HTML only) · connect to real backend (add `fetch()` in `js/contact-form.js` inside `showTxOverlay()`) · terminal messages · switch animation style

---

### GROUP 12 — Section Shared Styles & Reveal Animations
> Shared layout, heading styles, scanline grid, and scroll-reveal fade-in used by all content sections.

| Role | File |
|---|---|
| HTML | `index.html` → any `.reveal`, `.section-heading`, `.sec-tag`, `.sec-line` element |
| CSS | `css/sections-base.css` |
| JS | `js/sections-core.js` · `js/text-scramble.js` |

**Change here for:** section heading font size · fade-in reveal behavior · scanline grid overlay · section padding

---

### GROUP 13 — Global Base & Responsive
> CSS foundation everything else depends on. Variables, reset, body. All breakpoints.

| Role | File |
|---|---|
| HTML | `index.html` → `<html>`, `<body>`, `.container` |
| CSS | `css/base.css` · `css/main-responsive.css` |
| JS | None |

**Change here for:** accent color globally · fonts globally · background color · any responsive breakpoint

---

### GROUP 14 — Magnetic Buttons
> All buttons and links slightly follow the cursor when hovered, spring back on mouse leave.

| Role | File |
|---|---|
| HTML | All `.nav-socials a`, `.form-submit`, `.project-link`, `.mobile-back-btn`, `.spider-btn` |
| CSS | None (transform applied inline by JS) |
| JS | `js/magnetic.js` |

**Change here for:** magnetic strength · return spring speed · add more elements to magnetic effect

---

## 5. Every File Explained

### `index.html`
Entire page structure. All sections, all CSS links, all JS scripts.

### `intro.css`
`#introScene`, `#introParticleCanvas`, `#introName`, `.drop-letter`, `.drop-letter.accent`, `.drop-space`, exit animation `#introScene.exiting`.

### `intro.js`
Physics letter drop + particle field + scatter exit. Config at top: `gravity`, `bounceDamp`, `maxBounces`, `holdAfterLand`, `particleCount`.

### `css/base.css`
CSS reset, `:root` variables, `body`, `.container`, `.blue-name`.

### `css/background.css`
`#bg-root`, animated blob gradients (`@keyframes blobBreath`), `#particle-canvas`, `.bg-vignette`, `.bg-grain` film grain.

### `css/header.css`
`#scroll-progress`, `header`, `.nav-brand`, `.nav-brand-img-wrap`, `.brand-first/last`, `.constellation-nav`, `.c-link`, `.c-label`, `.star`, `.nav-right-group`, `.nav-socials`, `.hamburger`, `.mobile-overlay`, `.mobile-link`, `.mobile-back-btn`.

### `css/hero.css`
`.hero`, `.hero-content`, `.hero-robot`, `.web-wrap`, `#webCanvas`, `.web-center-node`, `.wcn-rings`, `.wcn-inner`, `.wcn-top/main/sub`, `.section-divider`.

### `css/cursor.css`
`@media (hover:hover)` block: `* { cursor: none }`, `#cursor-dot`, `.cursor-particle`, `.cursor-ripple`, hover/click body states.

### `css/spider.css`
`.spider-pos`, `.spider-hang`, `.spider-canvas`, `.spider-btn`.

### `css/main-responsive.css`
All `@media` breakpoints: 1260px, 1020px, 768px, 520px, 480px, 380px.

### `css/sections-base.css`
`.section-page`, `.section-heading`, `.sec-tag`, `.sec-line`, `.section-divider`, `.reveal`, `.reveal.visible`, `.reveal-delay-1/2/3`.

### `css/about-skills.css`
`#about-section`, `.about-grid`, `.about-avatar-frame`, `.about-text`, `.about-stats`, `#skills-section`, `.skill-card`, `.skill-bar-fill`.

### `css/projects.css`
`#projects-section`, `.projects-grid`, `.project-card`, `.project-thumb`, `.corner`, `.project-body`, `.project-tags`, `.project-tag`, `.project-links`, `.project-link.primary/secondary`.

### `css/contact.css`
`#contact-section`, `.contact-wrap`, `.contact-info`, `.contact-item`, `.contact-form-wrap`, `.form-group`, `.field-header`, `.esw` (switch), `.esw-dot`, `.esw-body`, `.esw-lever`, `.esw-spark`, `.field-track`, `.form-submit`, `.tx-overlay`, `.tx-rings-wrap`, `.tx-checkmark`, `.tx-terminal`.

### `css/glass-cards.css`
Glass morphism on `.project-card`, `.contact-info`, `.contact-form-wrap`, `.rn-card`, `.rn-detour-sign`. Corner brackets via pseudo-elements. Top shimmer edges.

### `js/bg-particles.js`
Injects `#bg-root`. 80–380 particles. Cursor attract/repel. Connecting lines between nearby particles. Cursor glow halo.

### `js/text-scramble.js`
`TextScramble` class + `IntersectionObserver` on `.section-heading h2`. Glitch effect plays once on scroll-in.

### `js/magnetic.js`
Spring-physics magnetic hover on nav socials, form submit, project links, mobile back btn, spider btn. `STRENGTH: 0.32`, `RETURN_EASE: 0.12`.

### `js/parallax-scroll.js`
Sets `--parallax-y` on `.hero`. Desktop only (`> 768px`).

### `js/cursor-effects.js`
Moves `#cursor-dot`. Spawns `.cursor-particle` trail divs. Spawns `.cursor-ripple` on click. Toggles `cursor-hover` and `cursor-click` on `body`.

### `js/scroll-header.js`
Progress bar width. `scrolled` class at 10px. `nav-hidden` on scroll down past 120px. `nav-visible` on scroll up.

### `js/constellation-nav.js`
Twinkling bg stars, gradient lines between nav stars, traveling glow orb on active star, trail particles on hover between stars.

### `js/mobile-nav.js`
Hamburger toggle. Mobile overlay open/close. Constellation canvas inside overlay. Exposes `window.closeMobile()`.

### `js/active-nav.js`
Scroll listener. Adds `active` class to `.c-link` matching current section.

### `js/spider-web-canvas.js`
10 skill nodes in circle. Concentric rings. Spoke lines. Hover sparks. Click burst. Ambient idle sparks. Intro particles on load. Edit `SKILLS` array to change skills.

### `js/spider-hang-cv.js`
Spider crawls down after 3.4s. Sway physics. Hover: stretch + mini web. Click: retract → download CV. Mobile: normal link.

### `js/cursor-cloud.js`
120 spring-physics particles orbiting cursor. Hero section only. Desktop only. After intro exits only.

### `js/sections-core.js`
Smooth scroll to sections. `.reveal` IntersectionObserver. Section-based active nav highlight.

### `js/contact-form.js`
Builds switch widgets. Validates on input. Flips ON/OFF. Enables submit at all-4-ON. TX overlay sequence: particles → rings → checkmark → typewriter → reset.

### `the road/about-timeline.css`
`.hs-outer` (320vh), `.hs-sticky`, `.hs-track` (5000px), `.hs-svg`, `.cs-star`, `.cs-card` above/below, military red star, `.hs-dots`, mobile vertical fallback.

### `the road/about-timeline.js`
Positions stars. Builds DOM. Builds SVG. rAF scroll handler. CSS transform pan. SVG line draw. Star reveal at thresholds. Dot navigation. Edit `STARS` + `CARD_DATA` to change entries.

---

## 6. Portfolio Sections

| Section | HTML ID | Number | CSS | JS |
|---|---|---|---|---|
| Intro | `#introScene` | — | `intro.css` | `intro.js` |
| Hero | `#about` | — | `css/hero.css` | `spider-web-canvas.js`, `cursor-cloud.js`, `parallax-scroll.js` |
| Experience | `#about-section` | `// 01` | `the road/about-timeline.css` | `the road/about-timeline.js` |
| Projects | `#projects-section` | `// 02` | `css/projects.css`, `css/glass-cards.css` | `sections-core.js` |
| Contact | `#contact-section` | `// 03` | `css/contact.css`, `css/glass-cards.css` | `contact-form.js` |

---

## 7. Change Guide

| What | Files |
|---|---|
| Name in intro drop | `intro.js` → `CFG.name` array |
| Name in header | `index.html` → `.brand-first` + `.brand-last` |
| Logo image | `index.html` → `img` inside `.nav-brand-img-wrap` |
| Nav link labels | `index.html` → `.c-label` spans |
| Social links | `index.html` → `.nav-socials a` href values |
| Accent color | `css/base.css` → `--teal` + opacity variants |
| Fonts | `index.html` Google Fonts link + `css/base.css` variables |
| Background color | `css/base.css` body + `css/background.css` #bg-root |
| 3D robot model | `index.html` → `url` on `<spline-viewer>` |
| Skills in web wheel | `js/spider-web-canvas.js` → `SKILLS` array |
| Hero center text | `index.html` → `.wcn-top`, `.wcn-main`, `.wcn-sub` |
| CV file | `index.html` `#spiderBtn` href + download + `js/spider-hang-cv.js` a.href |
| Experience entries | `the road/about-timeline.js` STARS + CARD_DATA + `index.html` div in #hsTrack |
| Project cards | `index.html` → `.project-card` blocks |
| Contact details | `index.html` → `.contact-item` blocks |
| Form backend | `js/contact-form.js` → add `fetch()` in `showTxOverlay()` |
| TX terminal messages | `js/contact-form.js` → `typeText` calls |
| Disable cursor | Delete `css/cursor.css` + `js/cursor-effects.js` + remove `#cursor-dot` `#cursor-ring` divs |
| Disable intro | Delete `intro.css` + `intro.js` + remove `#introScene` div |
| Mobile breakpoint | `css/main-responsive.css` → `@media (max-width: 1020px)` |

---

## 8. AI Context Block

> **Copy everything inside the code block below and paste it at the start of your prompt when asking an AI to help with this project.**

```
PROJECT: Personal portfolio — Abdelrahman Elsaadany, Full Stack .NET Developer, Egypt.
STACK: Pure HTML5, CSS3, Vanilla JavaScript. No frameworks, no build tools. Single page.

THEME:
- Deep space / sci-fi terminal aesthetic
- Accent: #00ddc8 (teal) | Background: #03060e | Text: rgba(224,232,228,0.92)
- Fonts: Rajdhani 700 (display) + Share Tech Mono (mono)
- Glass: rgba(2,8,18,0.82) + backdrop-filter blur(22px)
- Borders: 1px solid rgba(0,221,200,0.12)
- Glow: box-shadow with teal on all interactive elements
- Corner bracket pseudo-elements on cards

CSS VARIABLES (css/base.css):
--teal:#00ddc8 | --void:#02050a | --nav-h:76px
--teal-05/10/18/30/60 (opacity variants)
--font-ui:"Rajdhani" | --font-mono:"Share Tech Mono"
--ease:cubic-bezier(0.16,1,0.3,1) | --ease-back:cubic-bezier(0.34,1.56,0.64,1)

FILE GROUPS (HTML + CSS + JS per feature):
- Intro animation      → index.html #introScene | intro.css | intro.js
- Background particles → injected by JS | css/background.css | js/bg-particles.js
- Header desktop nav   → index.html header | css/header.css | js/constellation-nav.js + scroll-header.js + active-nav.js
- Mobile nav           → index.html .mobile-overlay | css/header.css | js/mobile-nav.js
- Scroll progress bar  → index.html #scroll-progress | css/header.css | js/scroll-header.js
- Custom cursor        → index.html #cursor-dot | css/cursor.css | js/cursor-effects.js
- Spider hang CV       → index.html #spiderPos | css/spider.css | js/spider-hang-cv.js
- Hero section         → index.html section.hero#about | css/hero.css | js/spider-web-canvas.js + cursor-cloud.js + parallax-scroll.js
- Experience timeline  → index.html #about-section | the road/about-timeline.css | the road/about-timeline.js
- Projects section     → index.html #projects-section | css/projects.css + glass-cards.css | js/sections-core.js
- Contact section      → index.html #contact-section | css/contact.css + glass-cards.css | js/contact-form.js
- Section reveals      → index.html .reveal elements | css/sections-base.css | js/sections-core.js + text-scramble.js
- Global base          → index.html html/body | css/base.css + main-responsive.css | none
- Magnetic buttons     → all buttons/links | none | js/magnetic.js

ALL CSS FILES (12): base, background, header, hero, cursor, spider,
main-responsive, sections-base, about-skills, projects, contact, glass-cards

ALL JS FILES (14): bg-particles, text-scramble, magnetic, parallax-scroll,
cursor-effects, scroll-header, constellation-nav, mobile-nav, active-nav,
spider-web-canvas, spider-hang-cv, cursor-cloud, sections-core, contact-form

TIMELINE ENTRIES (the road/about-timeline.js):
- Arab Computers: Full Stack .NET Dev, Oct 2025–Present | green #50e898 | above line
- ITI: Full Stack .NET Intern, Mar–Aug 2025 | teal #00ddc8 | above line
- Military: Dec 2024 | red #ff3838 | BELOW line (the downfall)
- IoT Training: ITI 2022 | purple #b068f0 | above line
- Alexandria University: B.Sc. CS 2019–2023 | gold #f0c060 | above line

PROJECTS (index.html):
1. E-Commerce Platform — ASP.NET Core, Angular, SQL Server, Onion Arch
2. Task Management App — .NET, EF Core, Angular, CQRS
3. Real-Time Chat System — SignalR, C#, JavaScript

CONTACT: LinkedIn: abdelrahman-elsaadany-a20 | GitHub: abdelrahmanelsaadany1 | Egypt · Open to Remote

RULES:
- Never change logic, only what is asked
- JS files are plain IIFEs (no modules/imports)
- CSS is plain — no preprocessors
- Never break requestAnimationFrame canvas loops
- Intro scene removes itself from DOM after playing
- Mobile breakpoints: 700px timeline | 768px hero | 1020px nav
- Folder is literally named "the road" with a space — keep paths exact
```
