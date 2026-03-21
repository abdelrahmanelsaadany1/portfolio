(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════
     INTRO — Cold Boot + Shockwave Reveal  (performance build)
     Abdelrahman Elsaadany

     PERF CHANGES vs previous version
     ─────────────────────────────────────────────────────
     • Radial gradients cached on init/resize — never
       created inside the render loop
     • Arc glows   batched → 1 stroke() call  (was 8)
     • Arc mains   batched → 1 stroke() call  (was 8)
     • Arc ticks   batched → 1 stroke() call  (was 8)
     • Corner brackets     → 1 stroke() call  (was 4)
     • ctx.clip() removed from shockwave — most expensive
       mobile canvas op; not needed because destination-out
       already cleared those pixels before drawShockwave runs
     • globalAlpha used to modulate cached gradients
       instead of rebuilding rgba() strings every frame
     • setLineDash([]) reset called once per frame, not
       inside every loop iteration
  ══════════════════════════════════════════════════════ */

  /* ── Remove Spline watermark ─────────────────────── */
  var _wm = setInterval(function () {
    var el = document
      .querySelector("spline-viewer")
      ?.shadowRoot?.querySelector("#logo");
    if (el) {
      el.remove();
      clearInterval(_wm);
    }
  }, 300);

  /* ── Grab scene ──────────────────────────────────── */
  var scene = document.getElementById("introScene");
  if (!scene) return;

  /* ── Build canvas ────────────────────────────────── */
  var canvas = document.createElement("canvas");
  canvas.id = "introCanvas";
  scene.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  if (!ctx) {
    scene.remove();
    return;
  }

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W, H, CX, CY, MAXR, DIAG;

  /* ── Cached gradients (rebuilt only on resize) ───── */
  var gradDot = null; /* center dot halo  */
  var gradPulse = null; /* ready breath     */

  function buildGradients() {
    gradDot = ctx.createRadialGradient(CX, CY, 0, CX, CY, 30);
    gradDot.addColorStop(0, "rgba(0,221,200,0.28)");
    gradDot.addColorStop(1, "rgba(0,221,200,0)");

    gradPulse = ctx.createRadialGradient(CX, CY, 0, CX, CY, MAXR * 0.86);
    gradPulse.addColorStop(0, "rgba(0,221,200,0.13)");
    gradPulse.addColorStop(1, "rgba(0,221,200,0)");
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);
    CX = W / 2;
    CY = H / 2;
    MAXR = Math.min(W, H) * 0.41;
    DIAG = Math.hypot(CX, CY) * 1.06;
    buildGradients();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ══════════════════════════════════════════════════
     MATHS
  ══════════════════════════════════════════════════ */
  var TAU = Math.PI * 2;
  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  function N(v, a, b) {
    return clamp((v - a) / (b - a));
  }
  function eO3(t) {
    t = clamp(t);
    return 1 - (1 - t) * (1 - t) * (1 - t);
  }

  /* ══════════════════════════════════════════════════
     TIMING
  ══════════════════════════════════════════════════ */
  var RING_N = 5;
  var ARC_N = 8;
  var ARC_GAP = 0.11;
  var ARC_SEG = (TAU - ARC_GAP * ARC_N) / ARC_N;

  var TM = {
    r0: 0.22,
    rStep: 0.13,
    rDur: 0.56,
    a0: 1.18,
    aStep: 0.09,
    aDur: 0.48,
    rd: 2.2,
    rdDur: 0.44,
    bl: 2.7,
    blDur: 0.78,
    done: 3.62,
  };

  var T_BRACKET = TM.r0 + RING_N * TM.rStep + TM.rDur;

  /* ══════════════════════════════════════════════════
     DRAW: BOOT
     ~14 draw calls at peak (was ~50)
  ══════════════════════════════════════════════════ */
  function drawBoot(t, fade) {
    if (fade <= 0) return;

    /* ── Pre-compute ring values ─────────────────── */
    var rrs = new Array(RING_N);
    var rps = new Array(RING_N);
    var oas = new Array(RING_N);
    for (var i = 0; i < RING_N; i++) {
      var rs = TM.r0 + i * TM.rStep;
      rps[i] = eO3(N(t, rs, rs + TM.rDur));
      rrs[i] = ((MAXR * (i + 1)) / RING_N) * rps[i];
      oas[i] = (0.5 - i * 0.06) * fade;
    }

    /* ── BATCH: all ring glows in one stroke ──────── */
    ctx.strokeStyle = "rgba(0,221,200," + 0.11 * fade + ")";
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.lineCap = "butt";
    ctx.beginPath();
    for (var i = 0; i < RING_N; i++) {
      if (rps[i] < 0.5 || oas[i] <= 0 || rrs[i] < 1) continue;
      ctx.moveTo(CX + rrs[i], CY);
      ctx.arc(CX, CY, rrs[i], 0, TAU);
    }
    ctx.stroke();

    /* ── Individual dashed rings (dash pattern varies) */
    for (var i = 0; i < RING_N; i++) {
      if (rps[i] <= 0 || oas[i] <= 0 || rrs[i] < 1) continue;
      var dl = Math.max(2, (Math.PI * rrs[i]) / (9 + i * 1.5));
      ctx.strokeStyle = "rgba(0,221,200," + oas[i] + ")";
      ctx.lineWidth = 0.9;
      ctx.setLineDash([dl, dl * 0.68]);
      ctx.beginPath();
      ctx.arc(CX, CY, rrs[i], 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    /* ── Pre-compute arc values ──────────────────── */
    var arcP = new Array(ARC_N);
    var arcSa = new Array(ARC_N);
    var arcEa = new Array(ARC_N);
    var anyArc = false;
    for (var j = 0; j < ARC_N; j++) {
      arcP[j] = eO3(N(t, TM.a0 + j * TM.aStep, TM.a0 + j * TM.aStep + TM.aDur));
      arcSa[j] = j * (ARC_SEG + ARC_GAP) - Math.PI / 2;
      arcEa[j] = arcSa[j] + ARC_SEG * arcP[j];
      if (arcP[j] > 0) anyArc = true;
    }

    if (anyArc) {
      /* ── BATCH: all arc glows in one stroke ──────── */
      ctx.strokeStyle = "rgba(0,221,200," + 0.13 * fade + ")";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (var j = 0; j < ARC_N; j++) {
        if (arcP[j] <= 0) continue;
        ctx.moveTo(
          CX + Math.cos(arcSa[j]) * MAXR,
          CY + Math.sin(arcSa[j]) * MAXR,
        );
        ctx.arc(CX, CY, MAXR, arcSa[j], arcEa[j]);
      }
      ctx.stroke();

      /* ── BATCH: all arc mains in one stroke ──────── */
      ctx.strokeStyle = "rgba(0,221,200," + 0.8 * fade + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var j = 0; j < ARC_N; j++) {
        if (arcP[j] <= 0) continue;
        ctx.moveTo(
          CX + Math.cos(arcSa[j]) * MAXR,
          CY + Math.sin(arcSa[j]) * MAXR,
        );
        ctx.arc(CX, CY, MAXR, arcSa[j], arcEa[j]);
      }
      ctx.stroke();

      /* ── BATCH: all leading tick marks in one stroke  */
      ctx.strokeStyle = "rgba(255,255,255," + 0.65 * fade + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var j = 0; j < ARC_N; j++) {
        if (arcP[j] < 0.04) continue;
        var ce = Math.cos(arcEa[j]);
        var se = Math.sin(arcEa[j]);
        ctx.moveTo(CX + ce * MAXR, CY + se * MAXR);
        ctx.lineTo(CX + ce * (MAXR - 10), CY + se * (MAXR - 10));
      }
      ctx.stroke();
    }

    /* ── Ready pulse (uses cached gradient + globalAlpha) */
    var rp2 = N(t, TM.rd, TM.rd + TM.rdDur);
    var beat = Math.sin(rp2 * Math.PI) * fade;
    if (beat > 0 && gradPulse) {
      ctx.globalAlpha = beat;
      ctx.fillStyle = gradPulse;
      ctx.beginPath();
      ctx.arc(CX, CY, MAXR * 0.86, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* ── Center dot (cached gradient + globalAlpha) ── */
    var dp = eO3(N(t, 0.1, 0.36));
    var osc = 0.6 + Math.sin(t * TAU * 1.8) * 0.4;
    var da = dp * osc * fade;
    if (da > 0 && gradDot) {
      ctx.globalAlpha = da;
      ctx.fillStyle = gradDot;
      ctx.beginPath();
      ctx.arc(CX, CY, 30, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(0,221,200," + da + ")";
      ctx.beginPath();
      ctx.arc(CX, CY, 3.5, 0, TAU);
      ctx.fill();
    }

    /* ── BATCH: all 4 corner brackets in one stroke ── */
    var cp = eO3(N(t, T_BRACKET, T_BRACKET + 0.28)) * fade * 0.14;
    if (cp > 0) {
      var bl = 18,
        m = 18;
      ctx.strokeStyle = "rgba(0,221,200," + cp + ")";
      ctx.lineWidth = 1;
      ctx.lineCap = "square";
      ctx.beginPath();
      /* TL */ ctx.moveTo(m + bl, m);
      ctx.lineTo(m, m);
      ctx.lineTo(m, m + bl);
      /* TR */ ctx.moveTo(W - m - bl, m);
      ctx.lineTo(W - m, m);
      ctx.lineTo(W - m, m + bl);
      /* BL */ ctx.moveTo(m + bl, H - m);
      ctx.lineTo(m, H - m);
      ctx.lineTo(m, H - m - bl);
      /* BR */ ctx.moveTo(W - m - bl, H - m);
      ctx.lineTo(W - m, H - m);
      ctx.lineTo(W - m, H - m - bl);
      ctx.stroke();
    }
  }

  /* ══════════════════════════════════════════════════
     DRAW: SHOCKWAVE
     No ctx.clip() — destination-out already cleared those
     pixels; the ring glow framing the reveal edge is free.
     Saves the most expensive canvas op on mobile.
  ══════════════════════════════════════════════════ */
  function drawShockwave(swr, bt) {
    if (swr <= 1) return;
    var rf = Math.max(0, 1 - bt * 0.88);
    if (rf <= 0) return;

    ctx.lineCap = "butt";

    /* Outer soft glow */
    ctx.strokeStyle = "rgba(0,221,200," + rf * 0.18 + ")";
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(CX, CY, swr, 0, TAU);
    ctx.stroke();

    /* Mid glow */
    ctx.strokeStyle = "rgba(0,221,200," + rf * 0.44 + ")";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(CX, CY, swr, 0, TAU);
    ctx.stroke();

    /* White leading edge */
    ctx.strokeStyle = "rgba(255,255,255," + rf * 0.76 + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CX, CY, swr, 0, TAU);
    ctx.stroke();

    /* Teal hairline */
    ctx.strokeStyle = "rgba(0,221,200," + rf + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, CY, swr + 1, 0, TAU);
    ctx.stroke();
  }

  /* ══════════════════════════════════════════════════
     RENDER LOOP
  ══════════════════════════════════════════════════ */
  var startTime = null;
  var rafId;
  var bgCleared = false;

  function frame(now) {
    if (!startTime) startTime = now;
    var t = (now - startTime) / 1000;

    if (t >= TM.done) {
      cancelAnimationFrame(rafId);
      scene.style.pointerEvents = "none";
      scene.remove();
      return;
    }

    rafId = requestAnimationFrame(frame);

    ctx.clearRect(0, 0, W, H);

    /* ── Boot phase ──────────────────────────────── */
    if (t < TM.bl) {
      ctx.fillStyle = "#03060e";
      ctx.fillRect(0, 0, W, H);
      drawBoot(t, 1);
      return;
    }

    /* ── Blast phase ─────────────────────────────── */

    /* One-time: clear CSS bg so destination-out
       punches through to the live site underneath   */
    if (!bgCleared) {
      scene.style.background = "transparent";
      bgCleared = true;
    }

    var bt = N(t, TM.bl, TM.bl + TM.blDur);
    var swr = bt * DIAG;

    /* Dark bg — shrinks behind the growing hole */
    ctx.fillStyle = "#03060e";
    ctx.fillRect(0, 0, W, H);

    /* Boot elements fade out in first 25% of blast */
    drawBoot(t, Math.max(0, 1 - bt * 4));

    /* Detonation flash */
    if (bt < 0.15) {
      ctx.fillStyle = "rgba(255,255,255," + (1 - bt / 0.15) * 0.48 + ")";
      ctx.fillRect(0, 0, W, H);
    }

    /* Punch transparent circle → reveals live site */
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(CX, CY, Math.max(0.5, swr), 0, TAU);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    /* Shockwave ring — no clip needed */
    drawShockwave(swr, bt);

    scene.style.pointerEvents = "none";
  }

  requestAnimationFrame(frame);
})();
