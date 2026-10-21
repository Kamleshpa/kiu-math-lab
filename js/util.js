/* Shared math + formatting helpers. Everything hangs off window.MQ. */
(function () {
  const MQ = (window.MQ = window.MQ || {});
  const U = (MQ.U = {});

  U.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  U.lcm = (a, b) => (a / U.gcd(a, b)) * b;
  U.fix = (x) => Math.round(x * 1e6) / 1e6;

  /* ---------- rationals ---------- */
  U.R = (n, d = 1) => {
    if (d < 0) { n = -n; d = -d; }
    const g = U.gcd(n, d);
    return { n: n / g, d: d / g };
  };
  U.add = (a, b) => U.R(a.n * b.d + b.n * a.d, a.d * b.d);
  U.sub = (a, b) => U.R(a.n * b.d - b.n * a.d, a.d * b.d);
  U.mul = (a, b) => U.R(a.n * b.n, a.d * b.d);
  U.div = (a, b) => U.R(a.n * b.d, a.d * b.n);
  U.eq = (a, b) => a.n * b.d === b.n * a.d;
  U.val = (r) => r.n / r.d;
  U.toRat = (x) => {
    if (x && typeof x === "object" && "n" in x) return U.R(x.n, x.d);
    const s = String(U.fix(x));
    if (!s.includes(".")) return U.R(parseInt(s, 10), 1);
    const [i, f] = s.split(".");
    return U.R(parseInt(i + f, 10), Math.pow(10, f.length));
  };
  U.isTerminating = (r) => {
    let d = U.R(r.n, r.d).d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  };

  /* ---------- formatting ---------- */
  U.num = (x) => {
    const v = U.fix(x);
    return v.toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  U.f = (n, d) =>
    `<span class="frac" aria-label="${n} over ${d}"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
  U.mixed = (w, n, d) => `<span class="mixed">${w}${U.f(n, d)}</span>`;
  // Render a rational: whole, proper fraction, or mixed number (default) / improper.
  U.fmt = (r, opt = {}) => {
    r = U.toRat(r);
    if (r.d === 1) return U.num(r.n);
    if (opt.dec && U.isTerminating(r)) return U.num(r.n / r.d);
    if (r.n > r.d && opt.mixed !== false) {
      const w = Math.floor(r.n / r.d);
      return U.mixed(w, r.n - w * r.d, r.d);
    }
    return U.f(r.n, r.d);
  };
  U.fmtImp = (r) => U.fmt(r, { mixed: false });
  U.txt = (r, opt = {}) => {
    r = U.toRat(r);
    if (r.d === 1) return String(r.n);
    if (opt.dec && U.isTerminating(r)) return String(U.fix(r.n / r.d));
    if (r.n > r.d) {
      const w = Math.floor(r.n / r.d);
      return `${w} ${r.n - w * r.d}/${r.d}`;
    }
    return `${r.n}/${r.d}`;
  };
  U.strip = (html) =>
    String(html || "")
      .replace(/<span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span>/g, " $1/$2")
      .replace(/<[^>]+>/g, " ")
      .replace(/&times;/g, "×").replace(/&divide;/g, "÷").replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /* ---------- parsing kid answers ---------- */
  U.parse = (raw) => {
    let s = String(raw || "").trim().replace(/,/g, "").replace(/\s+/g, " ");
    if (!s) return null;
    let m;
    if ((m = s.match(/^(\d+) (\d+) ?\/ ?(\d+)$/))) {
      const d = +m[3];
      if (!d) return null;
      return U.R(+m[1] * d + +m[2], d);
    }
    if ((m = s.match(/^(\d+) ?\/ ?(\d+)$/))) {
      if (!+m[2]) return null;
      return U.R(+m[1], +m[2]);
    }
    if ((m = s.match(/^(\d*)\.(\d+)$/))) return U.R(parseInt((m[1] || "0") + m[2], 10), Math.pow(10, m[2].length));
    if ((m = s.match(/^(\d+)\.?$/))) return U.R(+m[1], 1);
    return null;
  };
  U.parsePoint = (raw) => {
    const m = String(raw || "").trim().match(/^\(?\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*\)?$/);
    return m ? [+m[1], +m[2]] : null;
  };

  /* ---------- question helpers ---------- */
  // Multiple choice: correct html + distractors -> {kind, choices, answer}
  U.mc = (correct, distractors, keepOrder) => {
    const seen = new Set([U.strip(correct)]);
    const ds = [];
    for (const d of distractors) {
      const k = U.strip(d);
      if (!seen.has(k)) { seen.add(k); ds.push(d); }
    }
    const all = keepOrder ? [correct, ...ds] : U.shuffle([correct, ...ds]);
    return { kind: "mc", choices: all, answer: all.indexOf(correct) };
  };
  U.ordered = (choices, answer) => ({ kind: "mc", choices, answer });
  U.names = ["Maya", "Leo", "Priya", "Sam", "Aiden", "Zara", "Noah", "Elena", "Kai", "Ruby", "Omar", "Lily", "Arjun", "Mia", "Jonah", "Ava"];
  U.name = () => U.pick(U.names);
  U.times = "&times;";
  U.divs = "&divide;";
  U.op = (a, sym, b) => `${a} ${sym} ${b}`;
})();
