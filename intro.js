"use strict";

/* ══════════════════════════════════════════════════════
   INTRO — Physics Drop + Particle Field + Scatter Exit
   Abdelrahman Elsaadany
══════════════════════════════════════════════════════ */

/* ── Remove Spline watermark ─────────────────────────── */
const _wm = setInterval(() => {
  const logo = document
    .querySelector("spline-viewer")
    ?.shadowRoot?.querySelector("#logo");
  if (logo) {
    logo.remove();
    clearInterval(_wm);
  }
}, 300);

/* ══════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════ */
const CFG = {
  name: [
    ["A", true],
    ["b", false],
    ["d", false],
    ["e", false],
    ["l", false],
    ["r", false],
    ["a", false],
    ["h", false],
    ["m", false],
    ["a", false],
    ["n", false],
    ["__SPACE__"],
    ["E", true],
    ["l", false],
    ["s", false],
    ["a", false],
    ["a", false],
    ["d", false],
    ["a", false],
    ["n", false],
    ["y", false],
  ],

  /* Physics */
  gravity: 2600,
  bounceDamp: 0.36,
  bounceMin: 55,
  maxBounces: 3,
  velMin: 300,
  velMax: 650,

  /* Stagger */
  baseDelay: 0.04,
  staggerMin: 0.03,
  staggerMax: 0.11,

  /* Particle field */
  particleCount: 110,

  /* Exit */
  holdAfterLand: 1100,
  splineTimeout: 2500,
};

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let lettersLanded = false;
let splineDone = false;
let exitTriggered = false;
let holdTimer = null;
let landedCount = 0;
let isExiting = false;

/* ══════════════════════════════════════════════════════
   SPLINE GATE
══════════════════════════════════════════════════════ */
document.querySelector("spline-viewer")?.addEventListener(
  "load",
  () => {
    splineDone = true;
    maybeStartHold();
  },
  { once: true },
);
setTimeout(() => {
  splineDone = true;
  maybeStartHold();
}, CFG.splineTimeout);

function maybeStartHold() {
  if (lettersLanded && splineDone && !exitTriggered && !holdTimer)
    holdTimer = setTimeout(triggerExit, CFG.holdAfterLand);
}

/* ══════════════════════════════════════════════════════
   BUILD DOM
══════════════════════════════════════════════════════ */
const scene = document.getElementById("introScene");

/* Single particle canvas */
const pCanvas = document.createElement("canvas");
pCanvas.id = "introParticleCanvas";
scene.appendChild(pCanvas);

/* Name */
const nameEl = document.createElement("div");
nameEl.id = "introName";
scene.appendChild(nameEl);

const letterEls = [];

CFG.name.forEach(([ch, accent]) => {
  if (ch === "__SPACE__") {
    const sp = document.createElement("span");
    sp.className = "drop-space";
    nameEl.appendChild(sp);
    return;
  }
  const el = document.createElement("span");
  el.className = "drop-letter" + (accent ? " accent" : "");
  el.textContent = ch;
  nameEl.appendChild(el);
  letterEls.push({ el, accent });
});

/* ══════════════════════════════════════════════════════
   CANVAS SETUP
══════════════════════════════════════════════════════ */
const pCtx = pCanvas.getContext("2d");
let W, H;

function resize() {
  W = pCanvas.width = window.innerWidth;
  H = pCanvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ══════════════════════════════════════════════════════
   PARTICLE FIELD
══════════════════════════════════════════════════════ */
let fieldParticles = [];
let exitParticles = [];

function spawnField() {
  fieldParticles = Array.from({ length: CFG.particleCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.1 + 0.3,
    a: Math.random() * 0.22 + 0.04,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.5) * 16,
  }));
}
spawnField();

function tickField(dt) {
  fieldParticles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < 0) p.x += W;
    if (p.x > W) p.x -= W;
    if (p.y < 0) p.y += H;
    if (p.y > H) p.y -= H;
    p.a += (Math.random() - 0.5) * 0.01;
    p.a = Math.max(0.03, Math.min(0.28, p.a));
  });
}

function drawField() {
  fieldParticles.forEach((p) => {
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(0,221,200,${p.a})`;
    pCtx.fill();
  });
}

function spawnExitParticles() {
  exitParticles = [];
  letterEls.forEach(({ el }) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 25 + Math.floor(Math.random() * 18);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 300;
      exitParticles.push({
        x: cx,
        y: cy,
        r: Math.random() * 2.2 + 0.6,
        a: 0.85 + Math.random() * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 50,
        life: 1,
        decay: 0.016 + Math.random() * 0.022,
        teal: Math.random() < 0.35,
      });
    }
  });
}

function tickExit(dt) {
  exitParticles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 100 * dt;
    p.life -= p.decay;
    p.a = Math.max(0, p.life);
  });
  exitParticles = exitParticles.filter((p) => p.life > 0);
}

function drawExit() {
  exitParticles.forEach((p) => {
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = p.teal
      ? `rgba(0,221,200,${p.a})`
      : `rgba(180,220,215,${p.a * 0.65})`;
    pCtx.fill();
  });
}

/* ══════════════════════════════════════════════════════
   RENDER LOOP
══════════════════════════════════════════════════════ */
let lastT = 0;
let rafId;

function loop(t) {
  rafId = requestAnimationFrame(loop);
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;

  pCtx.clearRect(0, 0, W, H);

  if (!isExiting) {
    tickField(dt);
    drawField();
  } else {
    tickExit(dt);
    drawExit();
  }
}
requestAnimationFrame((t) => {
  lastT = t;
  loop(t);
});

/* ══════════════════════════════════════════════════════
   PHYSICS DROP
══════════════════════════════════════════════════════ */
function rand(min, max) {
  return min + Math.random() * (max - min);
}

const startY = window.innerHeight * -1.15;

letterEls.forEach(({ el }) => {
  el.style.transform = `translateY(${startY}px)`;
  el.style.opacity = "0";
});

function dropLetter({ el, accent }, delay) {
  const v0 = rand(CFG.velMin, CFG.velMax);

  setTimeout(() => {
    el.style.opacity = "1";

    let y = startY;
    let vy = v0;
    let bounces = 0;
    let last = performance.now();
    let settled = false;

    function step(now) {
      if (settled) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      vy += CFG.gravity * dt;
      y += vy * dt;

      if (y >= 0) {
        y = 0;
        vy = -vy * CFG.bounceDamp;
        bounces++;

        if (Math.abs(vy) < CFG.bounceMin || bounces >= CFG.maxBounces) {
          y = 0;
          vy = 0;
          settled = true;
          el.style.transform = "translateY(0px)";
          onLetterLand();
          return;
        }
      }

      el.style.transform = `translateY(${y}px)`;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, delay * 1000);
}

function onLetterLand() {
  landedCount++;
  if (landedCount === letterEls.length) {
    lettersLanded = true;
    maybeStartHold();
  }
}

/* Fire drops */
letterEls.forEach((item, i) => {
  const extra = rand(CFG.staggerMin, CFG.staggerMax);
  dropLetter(item, CFG.baseDelay + i * extra);
});

/* ══════════════════════════════════════════════════════
   EXIT
══════════════════════════════════════════════════════ */
function triggerExit() {
  if (exitTriggered) return;
  exitTriggered = true;
  isExiting = true;

  spawnExitParticles();

  letterEls.forEach(({ el }) => {
    el.style.transition = "opacity 0.12s ease";
    el.style.opacity = "0";
  });

  scene.classList.add("exiting");

  setTimeout(() => {
    cancelAnimationFrame(rafId);
    scene.style.pointerEvents = "none";
    scene.remove();
  }, 1200);
}
