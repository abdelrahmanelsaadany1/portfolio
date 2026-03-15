/* ══════════════════════════════════════════════════
   TEXT SCRAMBLE ENGINE
══════════════════════════════════════════════════ */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#0123456789ABCDEF";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 12);
      const end = start + Math.floor(Math.random() * 14);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "",
      complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += `<span style="color:inherit">${to}</span>`;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span style="color:rgba(48,205,207,0.65)">${char}</span>`;
      } else {
        output += `<span style="opacity:0.25">${from}</span>`;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

(function () {
  const headings = document.querySelectorAll(".section-heading h2");
  const scrambled = new Set();
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !scrambled.has(entry.target)) {
          scrambled.add(entry.target);
          const el = entry.target;
          const orig = el.textContent;
          setTimeout(() => new TextScramble(el).setText(orig), 150);
        }
      });
    },
    { threshold: 0.5 },
  );
  headings.forEach((h) => obs.observe(h));
})();