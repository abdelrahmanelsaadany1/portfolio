"use strict";

/* ══════════════════════════════════════════════════════
   INTRO — Two Words Collide + Particle Explosion
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
  /* How long after both words land before explosion */
  holdAfterLand: 120,
  splineTimeout: 800,

  /* Particle field */
  particleCount: 110,
};

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let splineDone = false;
let lettersLanded = false;
let exitTriggered = false;
let holdTimer = null;
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

const pCanvas = document.createElement("canvas");
pCanvas.id = "introParticleCanvas";
scene.appendChild(pCanvas);

const nameEl = document.createElement("div");
nameEl.id = "introName";
scene.appendChild(nameEl);

/* Word 1 — slides from LEFT */
const word1 = document.createElement("span");
word1.className = "name-word from-left";
word1.innerHTML = '<span class="accent">A</span>bdelrahman';
nameEl.appendChild(word1);

/* Word 2 — slides from RIGHT */
const word2 = document.createElement("span");
word2.className = "name-word from-right";
word2.innerHTML = '<span class="accent">E</span>lsaadany';
nameEl.appendChild(word2);

/* Collect all letter spans for exit particles */
const letterEls = [...word1.querySelectorAll("span, :not(span)")];

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
  /* Burst from both word blocks */
  [word1, word2].forEach((word) => {
    const rect = word.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 120 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 380;
      exitParticles.push({
        x: cx + (Math.random() - 0.5) * rect.width,
        y: cy + (Math.random() - 0.5) * rect.height,
        r: Math.random() * 2.2 + 0.6,
        a: 0.85 + Math.random() * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 60,
        life: 1,
        decay: 0.014 + Math.random() * 0.02,
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
   ENTRANCE — both words fire at the same time
══════════════════════════════════════════════════════ */
let wordsLanded = 0;

function onWordLanded() {
  wordsLanded++;
  if (wordsLanded === 2) {
    lettersLanded = true;
    maybeStartHold();
  }
}

/* Small rAF delay so browser has painted before transition */
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    word1.classList.add("landed");
    word2.classList.add("landed");

    word1.addEventListener("transitionend", onWordLanded, { once: true });
    word2.addEventListener("transitionend", onWordLanded, { once: true });
  });
});

/* ══════════════════════════════════════════════════════
   EXIT
══════════════════════════════════════════════════════ */
function triggerExit() {
  if (exitTriggered) return;
  exitTriggered = true;
  isExiting = true;

  spawnExitParticles();

  word1.style.transition = "opacity 0.1s ease";
  word2.style.transition = "opacity 0.1s ease";
  word1.style.opacity = "0";
  word2.style.opacity = "0";

  scene.classList.add("exiting");

  setTimeout(() => {
    cancelAnimationFrame(rafId);
    scene.style.pointerEvents = "none";
    scene.remove();
  }, 1200);
}
