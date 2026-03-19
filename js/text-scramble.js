/* ═══════════════════════════════════════════════════
   HEADING REVEAL — Awwwards-level
   Each heading splits into chars, each char:
   · starts clipped below (clip-path), offset, blurred
   · snaps up with spring stagger + teal flash on land
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  function buildReveal(el) {
    const text = el.textContent;
    const isHTML = el.innerHTML !== el.textContent; // has <span> children
    let html = "";

    /* Walk child nodes so we preserve <span class="teal"> wrappers */
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split("").forEach((ch, i) => {
          html += wrapChar(ch);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        /* span wrapper (e.g. teal-coloured word) — wrap chars inside */
        const inner = node.textContent.split("").map(wrapChar).join("");
        html += `<span class="${node.className}" style="display:inline;">${inner}</span>`;
      }
    });

    el.innerHTML = html;
  }

  function wrapChar(ch) {
    if (ch === " ")
      return `<span style="display:inline-block;width:0.32em;"></span>`;
    return `<span class="hr-char" style="
      display:inline-block;
      position:relative;
      overflow:hidden;
      vertical-align:bottom;
      line-height:1.1;
    "><span class="hr-inner" style="
      display:inline-block;
      transform: translateY(115%) skewY(6deg);
      opacity: 0;
      filter: blur(4px);
      will-change: transform, opacity, filter;
    ">${ch}</span></span>`;
  }

  function animateEl(el) {
    const inners = el.querySelectorAll(".hr-inner");
    inners.forEach((span, i) => {
      const delay = i * 28 + Math.random() * 12;

      /* Step 1: slide up + unblur */
      setTimeout(() => {
        span.style.transition = `
          transform 620ms cubic-bezier(0.16, 1, 0.3, 1) 0ms,
          opacity   480ms ease 0ms,
          filter    540ms ease 0ms
        `;
        span.style.transform = "translateY(0) skewY(0deg)";
        span.style.opacity = "1";
        span.style.filter = "blur(0px)";
      }, delay);

      /* Step 2: teal flash on landing */
      setTimeout(() => {
        span.style.transition = "color 60ms ease, text-shadow 60ms ease";
        span.style.color = "#00ddc8";
        span.style.textShadow = "0 0 18px rgba(0,221,200,0.7)";
      }, delay + 560);

      /* Step 3: fade flash back to normal */
      setTimeout(() => {
        span.style.transition = "color 400ms ease, text-shadow 400ms ease";
        span.style.color = "";
        span.style.textShadow = "";
      }, delay + 680);
    });
  }

  /* ── Init ── */
  const headings = document.querySelectorAll(".section-heading h2");
  const revealed = new Set();

  headings.forEach((h) => buildReveal(h));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !revealed.has(entry.target)) {
          revealed.add(entry.target);
          setTimeout(() => animateEl(entry.target), 100);
        }
      });
    },
    { threshold: 0.35 },
  );

  headings.forEach((h) => obs.observe(h));
})();
