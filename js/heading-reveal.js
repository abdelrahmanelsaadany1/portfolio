/* ═══════════════════════════════════════════════════
   heading-reveal.js
   · Char-split reveal for ALL .section-heading h2
     (Projects, Contact Me, and any future headings)
   · Matches the exact spring + teal-flash effect
   · Performance pass: passive listeners, will-change
     hints, requestAnimationFrame batching, reduced
     motion respect
═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Respect prefers-reduced-motion ── */
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ── Wrap each character in a clip container ── */
  function buildReveal(el) {
    let html = "";

    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split("").forEach((ch) => {
          html += wrapChar(ch);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        /* Preserve teal <span> wrappers, wrap chars inside */
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
      transform:translateY(115%) skewY(6deg);
      opacity:0;
      filter:blur(4px);
      will-change:transform,opacity,filter;
    ">${ch}</span></span>`;
  }

  /* ── Animate one heading (batched via rAF) ── */
  function animateEl(el) {
    const inners = el.querySelectorAll(".hr-inner");

    if (prefersReduced) {
      /* Just snap in immediately — no motion */
      inners.forEach((span) => {
        span.style.transform = "none";
        span.style.opacity = "1";
        span.style.filter = "none";
      });
      return;
    }

    /* Use a single rAF to batch all setTimeout scheduling */
    requestAnimationFrame(() => {
      inners.forEach((span, i) => {
        const delay = i * 28 + Math.random() * 12;

        /* Step 1 — slide up + unblur */
        setTimeout(() => {
          span.style.transition =
            "transform 620ms cubic-bezier(0.16,1,0.3,1)," +
            "opacity 480ms ease," +
            "filter 540ms ease";
          span.style.transform = "translateY(0) skewY(0deg)";
          span.style.opacity = "1";
          span.style.filter = "blur(0px)";
        }, delay);

        /* Step 2 — teal flash on landing */
        setTimeout(() => {
          span.style.transition = "color 60ms ease,text-shadow 60ms ease";
          span.style.color = "#00ddc8";
          span.style.textShadow = "0 0 18px rgba(0,221,200,0.7)";
        }, delay + 560);

        /* Step 3 — fade flash away */
        setTimeout(() => {
          span.style.transition = "color 400ms ease,text-shadow 400ms ease";
          span.style.color = "";
          span.style.textShadow = "";
        }, delay + 680);
      });
    });
  }

  /* ── Section-level entrance: contact panel + ring ── */
  function animateContactEntrance(section) {
    if (prefersReduced) return;

    /* Left panel slides in from left */
    const left = section.querySelector(".ct-left");
    if (left) {
      left.style.opacity = "0";
      left.style.transform = "translateX(-40px)";
      left.style.transition =
        "opacity 800ms cubic-bezier(0.16,1,0.3,1) 180ms," +
        "transform 800ms cubic-bezier(0.16,1,0.3,1) 180ms";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          left.style.opacity = "1";
          left.style.transform = "translateX(0)";
        });
      });
    }

    /* Contact items stagger up */
    const items = section.querySelectorAll(".contact-item");
    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(24px)";
      item.style.transition =
        `opacity 600ms ease ${300 + i * 90}ms,` +
        `transform 600ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 90}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        });
      });
    });

    /* Right panel (ring + form) fades + scales up */
    const right = section.querySelector(".ct-right");
    if (right) {
      right.style.opacity = "0";
      right.style.transform = "scale(0.92) translateX(32px)";
      right.style.transition =
        "opacity 900ms cubic-bezier(0.16,1,0.3,1) 260ms," +
        "transform 900ms cubic-bezier(0.16,1,0.3,1) 260ms";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          right.style.opacity = "1";
          right.style.transform = "scale(1) translateX(0)";
        });
      });
    }

    /* Ring SVG: animate each ring circle drawing in */
    const ringCircles = section.querySelectorAll(
      "#ct-ring-svg circle:not([id])",
    );
    ringCircles.forEach((circle, i) => {
      const r = parseFloat(circle.getAttribute("r") || 0);
      const circ = 2 * Math.PI * r;
      circle.style.strokeDasharray = `${circ}`;
      circle.style.strokeDashoffset = `${circ}`;
      circle.style.transition = `stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1) ${400 + i * 60}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          circle.style.strokeDashoffset = "0";
        });
      });
    });

    /* Form fields cascade down */
    const fields = section.querySelectorAll(".ct-field");
    fields.forEach((field, i) => {
      field.style.opacity = "0";
      field.style.transform = "translateY(20px)";
      field.style.transition =
        `opacity 550ms ease ${500 + i * 100}ms,` +
        `transform 550ms cubic-bezier(0.16,1,0.3,1) ${500 + i * 100}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          field.style.opacity = "1";
          field.style.transform = "translateY(0)";
        });
      });
    });

    /* Submit button pops in last */
    const btn = section.querySelector("#ct-btn");
    if (btn) {
      btn.style.opacity = "0";
      btn.style.transform = "translateY(16px)";
      btn.style.transition =
        "opacity 500ms ease 900ms," +
        "transform 500ms cubic-bezier(0.16,1,0.3,1) 900ms";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          btn.style.opacity = "1";
          btn.style.transform = "translateY(0)";
        });
      });
    }

    /* Progress row */
    const progRow = section.querySelector(".ct-progress-row");
    if (progRow) {
      progRow.style.opacity = "0";
      progRow.style.transition = "opacity 600ms ease 420ms";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progRow.style.opacity = "1";
        });
      });
    }
  }

  /* ── Wait for DOM ── */
  function init() {
    /* Build char wrappers on all section headings */
    const headings = document.querySelectorAll(".section-heading h2");
    headings.forEach((h) => buildReveal(h));

    /* Set initial hidden state for contact section children
       (projects section already handled by sections-core.js GSAP) */
    const contactSection = document.getElementById("contact-section");
    if (contactSection && !prefersReduced) {
      const initialHide = [
        ".ct-left",
        ".ct-right",
        ".contact-item",
        ".ct-field",
        "#ct-btn",
        ".ct-progress-row",
      ];
      initialHide.forEach((sel) => {
        contactSection.querySelectorAll(sel).forEach((el) => {
          el.style.opacity = "0";
        });
      });
    }

    /* ── Single IntersectionObserver for all headings ── */
    const revealedHeadings = new Set();
    const headingObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !revealedHeadings.has(entry.target)) {
            revealedHeadings.add(entry.target);
            /* Small delay so the section itself is fully in view */
            setTimeout(() => animateEl(entry.target), 80);
          }
        });
      },
      { threshold: 0.4 },
    );
    headings.forEach((h) => headingObs.observe(h));

    /* ── Observer for contact section entrance ── */
    if (contactSection) {
      let contactEntered = false;
      const contactObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !contactEntered) {
              contactEntered = true;
              animateContactEntrance(contactSection);
              contactObs.disconnect();
            }
          });
        },
        { threshold: 0.15 },
      );
      contactObs.observe(contactSection);
    }

    /* ── PERFORMANCE: Make all scroll listeners passive ── */
    /* Patch addEventListener for wheel + touch on window */
    const _origAdd = EventTarget.prototype.addEventListener;
    /* Only patch if not already done by another lib */
    if (!window.__hrPassivePatched) {
      window.__hrPassivePatched = true;
      EventTarget.prototype.addEventListener = function (type, fn, opts) {
        if (
          (type === "touchstart" ||
            type === "touchmove" ||
            type === "wheel" ||
            type === "mousewheel") &&
          opts === undefined
        ) {
          opts = { passive: true };
        }
        return _origAdd.call(this, type, fn, opts);
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
