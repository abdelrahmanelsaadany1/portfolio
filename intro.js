// ═══════════════════════════════════════════════════════════════════════
// intro.js — Intro scene: lamp, orb drop, letter ignition, flip
//
// SEQUENCE:
// 1. Lamp is already in HTML — visible from page load (dim bulb)
// 2. Brackets appear
// 3. Lamp lights up — bulb glows
// 4. Orb detaches from bulb, falls straight down onto A
// 5. A ignites teal
// 6. Chain reaction left→right all other letters
// 7. Spotlight sweep
// 8. Elsaadany fades up
// 9. Lock line sweeps
// 10. Flip when spline ready
// ═══════════════════════════════════════════════════════════════════════

const WORD = "ABDELRAHMAN";
const LAST = "ELSAADANY";
const LETTERS = WORD.split("");

let splineReady = false;
let introReady = false;

// ── Spline logo removal ──────────────────────────────────────────────
const logoTimer = setInterval(() => {
  const logo = document
    .querySelector("spline-viewer")
    ?.shadowRoot?.querySelector("#logo");
  if (logo) {
    logo.remove();
    clearInterval(logoTimer);
  }
}, 400);

function onSplineReady() {
  splineReady = true;
  if (introReady) doFlip();
}
setTimeout(onSplineReady, 4000);
document
  .querySelector("spline-viewer")
  .addEventListener("load", onSplineReady, { once: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════════════
// BUILD LETTERS — inject into #letterSpans
// ═══════════════════════════════════════════════════════════════════════
function buildLetters() {
  const container = document.getElementById("letterSpans");
  const spans = LETTERS.map((l, i) => {
    const s = document.createElement("span");
    s.className = "nl";
    s.textContent = l;
    s.style.opacity = "1";
    if (i === 0) s.id = "letterA";
    container.appendChild(s);
    return s;
  });
  return spans;
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSIVE LAMP POSITIONING
// ═══════════════════════════════════════════════════════════════════════
function positionLamp() {
  const lamp = document.getElementById("streetLamp");
  const nameRow = document.getElementById("nameRow");
  const letterA = document.getElementById("letterA");

  if (!lamp || !nameRow || !letterA) return;

  const aRect = letterA.getBoundingClientRect();
  const rowRect = nameRow.getBoundingClientRect();

  // Only control horizontal position — CSS clamp handles height
  const aCenterInRow = aRect.left - rowRect.left + aRect.width / 2;
  const lampLeft = aCenterInRow - 72;

  lamp.style.left = lampLeft + "px";
}

// ═══════════════════════════════════════════════════════════════════════
// DROP ORB — from bulb down to letter A
// ═══════════════════════════════════════════════════════════════════════
function dropOrb(orb, bulbEl, targetEl) {
  return new Promise((resolve) => {
    const br = bulbEl.getBoundingClientRect();
    const tr = targetEl.getBoundingClientRect();

    const startX = br.left + br.width / 2;
    const startY = br.top + br.height / 2;
    const endX = tr.left + tr.width / 2;
    const endY = tr.top + tr.height / 2;

    const dx = endX - startX;
    const dy = endY - startY;

    orb.style.left = startX + "px";
    orb.style.top = startY + "px";
    orb.style.transform = "translate(-50%,-50%) scale(0)";
    orb.style.opacity = "1";

    const duration = 650;
    let t0 = null;
    let lastTrail = 0;

    function frame(ts) {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / duration, 1);
      const ease = t * t; // gravity acceleration

      const cx = dx * ease;
      const cy = dy * ease;
      const scale = 0.25 + ease * 0.75;

      orb.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px)) scale(${scale})`;

      if (t - lastTrail > 0.06) {
        spawnOrbTrail(startX + cx, startY + cy);
        lastTrail = t;
      }

      t < 1 ? requestAnimationFrame(frame) : resolve({ x: endX, y: endY });
    }

    requestAnimationFrame(frame);
  });
}

function spawnOrbTrail(x, y) {
  const dot = document.createElement("div");
  dot.className = "orbTrail";
  dot.style.left = x + "px";
  dot.style.top = y + "px";
  document.getElementById("trailContainer").appendChild(dot);
  dot.addEventListener("animationend", () => dot.remove(), { once: true });
}

// ═══════════════════════════════════════════════════════════════════════
// IMPACT RINGS at hit point
// ═══════════════════════════════════════════════════════════════════════
function impact(x, y) {
  [0, 110, 220].forEach((d) => {
    const ring = document.createElement("div");
    ring.className = "impactRing";
    ring.style.left = x + "px";
    ring.style.top = y + "px";
    ring.style.animationDelay = d + "ms";
    document.body.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// CHAIN REACTION — rAF based, no setTimeout stacking
// ═══════════════════════════════════════════════════════════════════════
function lightUpRest(spans) {
  return new Promise((resolve) => {
    const stepMs = 70;
    let t0 = null;
    let lastLit = 0;

    function frame(ts) {
      if (!t0) t0 = ts;
      const should = 1 + Math.floor((ts - t0) / stepMs);
      for (let i = lastLit + 1; i <= should && i < spans.length; i++) {
        spans[i].classList.add("lit");
        lastLit = i;
      }
      lastLit < spans.length - 1 ? requestAnimationFrame(frame) : resolve();
    }

    requestAnimationFrame(frame);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// FLIP — reveal main site
// ═══════════════════════════════════════════════════════════════════════
function doFlip() {
  const card = document.getElementById("introCard");
  const shimmer = document.getElementById("flipShimmer");
  const scene = document.getElementById("introScene");
  if (!card) return;
  shimmer.classList.add("run");
  card.classList.add("flip");
  scene.classList.add("done");
  setTimeout(() => scene.remove(), 1500);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════
async function run() {
  const front = document.getElementById("introFront");
  const lamp = document.getElementById("streetLamp");
  const nameRow = document.getElementById("nameRow");
  const lastName = document.getElementById("lastName");
  const lockLine = document.getElementById("lockLine");

  // Build letters
  const spans = buildLetters();

  // Initial positioning
  positionLamp();
  window.addEventListener("resize", positionLamp);

  // Create the falling orb element in body so fixed positioning works
  const orb = document.createElement("div");
  orb.id = "fallingOrb";
  document.body.appendChild(orb);

  // ── 1. Brackets ───────────────────────────────────────────────────
  await delay(120);
  front.classList.add("armed");
  await delay(300);

  // ── 2. Lamp lights up ─────────────────────────────────────────────
  lamp.classList.add("lit");
  await delay(1000);

  // ── 3. Orb falls from bulb to A ───────────────────────────────────
  const bulbEl = lamp.querySelector(".sl-bulb");
  const { x: impX, y: impY } = await dropOrb(orb, bulbEl, spans[0]);

  // Hide orb — absorbed by A
  orb.style.opacity = "0";

  // Lamp spent
  lamp.classList.remove("lit");
  lamp.classList.add("spent");

  // ── 4. Impact + A ignites ─────────────────────────────────────────
  impact(impX, impY);
  spans[0].classList.add("ignite");
  await delay(550);

  // ── 5. Chain reaction ─────────────────────────────────────────────
  await lightUpRest(spans);
  await delay(200);

  // ── 6. Spotlight ──────────────────────────────────────────────────
  nameRow.classList.add("spotlight");
  await delay(1000);

  // ── 7. Elsaadany ──────────────────────────────────────────────────
  lastName.classList.add("show");
  await delay(500);

  // ── 8. Lock line ──────────────────────────────────────────────────
  lockLine.style.width = "220px";
  await delay(560);

  // ── 9. Flip ───────────────────────────────────────────────────────
  introReady = true;
  if (splineReady) doFlip();
}

run();
