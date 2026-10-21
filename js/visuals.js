/* SVG drawing helpers. Every function returns an SVG string; colors come from CSS tokens. */
(function () {
  const MQ = window.MQ;
  const V = (MQ.V = {});
  const r1 = (x) => Math.round(x * 10) / 10;
  const pts = (arr) => arr.map((p) => `${r1(p[0])},${r1(p[1])}`).join(" ");

  V.svg = (w, h, inner, opt = {}) =>
    `<svg viewBox="${r1(opt.x || 0)} ${r1(opt.y || 0)} ${r1(w)} ${r1(h)}" class="viz ${opt.cls || ""}" style="max-width:${opt.max || Math.max(160, Math.round(w))}px" role="img" aria-label="${opt.label || "diagram"}">${inner}</svg>`;
  const text = (x, y, s, cls = "lbl", anchor = "middle") =>
    `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" text-anchor="${anchor}" dominant-baseline="middle">${s}</text>`;
  V.text = text;

  /* ---------- isometric cubes ---------- */
  // cubes: [[x,y,z,hueVar]] ; hue is a CSS color expression
  V.cubes = function (cubes, opt = {}) {
    const s = opt.s || 24, c = 0.866;
    const P = (x, y, z) => [(x - y) * s * c, (x + y) * s * 0.5 - z * s];
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    cubes.forEach(([x, y, z]) => {
      for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) {
        const p = P(x + dx, y + dy, z + dz);
        minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
        minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
      }
    });
    const sorted = cubes.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
    let g = "";
    for (const [i, j, k, hue] of sorted) {
      const st = `style="--h:${hue || "var(--accent)"}"`;
      g += `<g class="cube" ${st}>` +
        `<polygon class="ft" points="${pts([P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)])}"/>` +
        `<polygon class="fr" points="${pts([P(i + 1, j, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i + 1, j, k + 1)])}"/>` +
        `<polygon class="fl" points="${pts([P(i, j + 1, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)])}"/>` +
        `</g>`;
    }
    let labels = "";
    (opt.labels || []).forEach((L) => {
      const p = P(...L.at);
      labels += text(p[0] + (L.dx || 0), p[1] + (L.dy || 0), L.text, "lbl dim", L.anchor || "middle");
    });
    const pad = opt.pad || 30;
    return V.svg(maxX - minX + pad * 2, maxY - minY + pad * 2, g + labels, {
      x: minX - pad, y: minY - pad, label: opt.label || "solid made of unit cubes", max: opt.max,
    });
  };

  // Rectangular prism of unit cubes, optional dimension labels and layer colors
  V.prism = function (l, w, h, opt = {}) {
    const cubes = [];
    const hues = opt.layerHues;
    for (let z = 0; z < h; z++)
      for (let x = 0; x < l; x++)
        for (let y = 0; y < w; y++) {
          let hue = opt.hue;
          if (hues) hue = hues[z % hues.length];
          if (opt.topOnly && z === h - 1) hue = opt.topHue;
          cubes.push([x, y, z, hue]);
        }
    const labels = [];
    if (opt.labels) {
      const [a, b, c] = opt.labels;
      if (a) labels.push({ at: [l / 2, w, 0], text: a, dx: -12, dy: 16 });
      if (b) labels.push({ at: [l, w / 2, 0], text: b, dx: 16, dy: 14 });
      if (c) labels.push({ at: [l, 0, h / 2], text: c, dx: 10, anchor: "start" });
    }
    const s = opt.s || Math.max(12, Math.min(28, 190 / Math.max(l + w, h * 1.4)));
    return V.cubes(cubes, { s, labels, label: `prism ${l} by ${w} by ${h}`, max: opt.max });
  };

  // Solid box (no unit cubes) with optional grid lines and labels; dims are drawing dims
  V.box = function (l, w, h, opt = {}) {
    const s = opt.s || Math.min(26, 200 / Math.max(l + w, h * 1.5)), c = 0.866;
    const P = (x, y, z) => [(x - y) * s * c, (x + y) * s * 0.5 - z * s];
    const top = [P(0, 0, h), P(l, 0, h), P(l, w, h), P(0, w, h)];
    const right = [P(l, 0, 0), P(l, w, 0), P(l, w, h), P(l, 0, h)];
    const left = [P(0, w, 0), P(l, w, 0), P(l, w, h), P(0, w, h)];
    let g = `<g class="cube" style="--h:${opt.hue || "var(--accent)"}"><polygon class="ft" points="${pts(top)}"/><polygon class="fr" points="${pts(right)}"/><polygon class="fl" points="${pts(left)}"/></g>`;
    if (opt.grid) {
      let ln = "";
      const L = (a, b) => (ln += `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`);
      for (let x = 1; x < l; x++) { L(P(x, 0, h), P(x, w, h)); L(P(x, w, 0), P(x, w, h)); }
      for (let y = 1; y < w; y++) { L(P(0, y, h), P(l, y, h)); L(P(l, y, 0), P(l, y, h)); }
      for (let z = 1; z < h; z++) { L(P(l, 0, z), P(l, w, z)); L(P(0, w, z), P(l, w, z)); }
      g += `<g class="gridln">${ln}</g>`;
    }
    const [a, b, cc] = opt.labels || [];
    let lb = "";
    if (a) { const p = P(l / 2, w, 0); lb += text(p[0] - 12, p[1] + 16, a, "lbl dim"); }
    if (b) { const p = P(l, w / 2, 0); lb += text(p[0] + 18, p[1] + 14, b, "lbl dim"); }
    if (cc) { const p = P(l, 0, h / 2); lb += text(p[0] + 10, p[1], cc, "lbl dim", "start"); }
    const xs = [...top, ...right, ...left].map((p) => p[0]), ys = [...top, ...right, ...left].map((p) => p[1]);
    const pad = 34;
    const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
    return V.svg(Math.max(...xs) - minX + pad + 20, Math.max(...ys) - minY + pad, g + lb, { x: minX, y: minY, label: opt.label || "rectangular prism" });
  };

  /* ---------- fractions ---------- */
  // Tape diagram: `parts` equal pieces, first `shade` shaded. total label above, part labels inside.
  V.tape = function (parts, shade, opt = {}) {
    const W = opt.w || 320, H = 44, x0 = 10, y0 = opt.total ? 34 : 10;
    const pw = W / parts;
    let g = "";
    for (let i = 0; i < parts; i++) {
      g += `<rect x="${r1(x0 + i * pw)}" y="${y0}" width="${r1(pw)}" height="${H}" class="${i < shade ? "sh" : "unsh"}"/>`;
      if (opt.partLabel) g += text(x0 + i * pw + pw / 2, y0 + H / 2, i < (opt.labelCount || parts) ? opt.partLabel : "", "lbl in");
    }
    if (opt.total) {
      g += `<path class="brace" d="M${x0} ${y0 - 6} v-8 H${x0 + W} v8"/>`;
      g += text(x0 + W / 2, y0 - 22, opt.total, "lbl");
    }
    if (opt.shadeLabel && shade) {
      g += `<path class="brace" d="M${x0} ${y0 + H + 6} v8 H${r1(x0 + shade * pw)} v-8"/>`;
      g += text(x0 + (shade * pw) / 2, y0 + H + 24, opt.shadeLabel, "lbl");
    }
    return V.svg(W + 20, y0 + H + (opt.shadeLabel ? 40 : 12), g, { label: opt.label || "tape diagram", max: opt.max });
  };

  // Several whole bars, each split in `parts`, shading `shadeTotal` pieces across bars
  V.bars = function (wholes, parts, shadeTotal, opt = {}) {
    const W = opt.w || 260, H = 34, gap = 10;
    let g = "", k = 0;
    for (let b = 0; b < wholes; b++) {
      const y = 6 + b * (H + gap);
      for (let i = 0; i < parts; i++, k++)
        g += `<rect x="${r1(10 + (i * W) / parts)}" y="${y}" width="${r1(W / parts)}" height="${H}" class="${k < shadeTotal ? "sh" : "unsh"}"/>`;
    }
    return V.svg(W + 20, wholes * (H + gap) + 6, g, { label: opt.label || "fraction bars" });
  };

  // a items shared by b people: each item cut into b slices; slice i goes to person i
  V.sharing = function (a, b) {
    const W = 64, H = 64, gap = 14, per = Math.min(a, 6);
    const rows = Math.ceil(a / per);
    let g = "";
    for (let t = 0; t < a; t++) {
      const x = 8 + (t % per) * (W + gap), y = 8 + Math.floor(t / per) * (H + gap);
      for (let i = 0; i < b; i++)
        g += `<rect x="${r1(x + (i * W) / b)}" y="${y}" width="${r1(W / b)}" height="${H}" class="share p${i % 6}"/>`;
      g += `<rect x="${x}" y="${y}" width="${W}" height="${H}" class="outline" rx="6"/>`;
    }
    return V.svg(per * (W + gap) + 4, rows * (H + gap) + 4, g, { label: `${a} items each cut into ${b} equal pieces` });
  };

  // Unit square area model for (a/b) x (c/d), both <= 1
  V.fracArea = function (a, b, c, d, opt = {}) {
    const S = opt.size || 210, x0 = 34, y0 = 14;
    let g = "";
    for (let i = 0; i < b; i++)
      for (let j = 0; j < d; j++) {
        const inA = i < a, inC = j < c;
        const cls = inA && inC ? "both" : inA ? "onlyA" : inC ? "onlyB" : "none";
        g += `<rect x="${r1(x0 + (i * S) / b)}" y="${r1(y0 + S - ((j + 1) * S) / d)}" width="${r1(S / b)}" height="${r1(S / d)}" class="cell ${opt.plain ? "none" : cls}"/>`;
      }
    g += `<rect x="${x0}" y="${y0}" width="${S}" height="${S}" class="outline"/>`;
    if (!opt.noLabels) {
      g += text(x0 + (a * S) / b / 2, y0 + S + 16, opt.topLabel || `${a}/${b}`, "lbl");
      g += text(x0 - 16, y0 + S - (c * S) / d / 2, opt.sideLabel || `${c}/${d}`, "lbl");
      g += `<path class="brace" d="M${x0} ${y0 + S + 5} v4 H${r1(x0 + (a * S) / b)} v-4"/>`;
      g += `<path class="brace" d="M${x0 - 5} ${y0 + S} h-4 V${r1(y0 + S - (c * S) / d)} h4"/>`;
    }
    return V.svg(S + x0 + 12, S + y0 + 30, g, { label: `unit square split into ${b} columns and ${d} rows` });
  };

  // Generic proportional area model. cols/rows: [{w, label}], cells: [[label]]
  V.areaModel = function (cols, rows, cells, opt = {}) {
    const W = opt.w || 300, H = opt.h || 170, x0 = 50, y0 = 26;
    const tw = cols.reduce((s, c) => s + c.w, 0), th = rows.reduce((s, r) => s + r.w, 0);
    let g = "", x = x0;
    cols.forEach((c, i) => {
      const cw = (c.w / tw) * W;
      g += text(x + cw / 2, y0 - 12, c.label, "lbl");
      let y = y0;
      rows.forEach((r, j) => {
        const rh = (r.w / th) * H;
        g += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(cw)}" height="${r1(rh)}" class="cell am${(i + j) % 4}"/>`;
        const lab = cells && cells[j] && cells[j][i];
        if (lab != null) g += text(x + cw / 2, y + rh / 2, lab, "lbl in");
        if (i === 0) g += text(x0 - 10, y + rh / 2, r.label, "lbl", "end");
        y += rh;
      });
      x += cw;
    });
    return V.svg(W + x0 + 12, H + y0 + 10, g, { label: "area model", max: opt.max });
  };

  /* ---------- number line ---------- */
  // opt: min, max, denom (ticks per unit), marks:[{v, label, cls}], jumps:[[from,to]], labelEvery
  V.numberLine = function (opt) {
    const W = opt.w || 420, x0 = 22, y = 58;
    const { min, max } = opt;
    const den = opt.denom || 1;
    const X = (v) => x0 + ((v - min) / (max - min)) * W;
    let g = `<line x1="${x0 - 8}" y1="${y}" x2="${x0 + W + 8}" y2="${y}" class="axis"/>`;
    const steps = Math.round((max - min) * den);
    for (let i = 0; i <= steps; i++) {
      const v = min + i / den;
      const whole = Math.abs(v - Math.round(v)) < 1e-9;
      g += `<line x1="${r1(X(v))}" y1="${y - (whole ? 10 : 6)}" x2="${r1(X(v))}" y2="${y + (whole ? 10 : 6)}" class="tick"/>`;
      if (opt.tickLabels) {
        const lab = opt.tickLabels(v, i);
        if (lab != null) g += text(X(v), y + 24, lab, whole ? "lbl" : "lbl sm");
      } else if (whole) g += text(X(v), y + 24, MQ.U.num(v), "lbl");
    }
    (opt.jumps || []).forEach(([a, b], i) => {
      const xa = X(a), xb = X(b), mid = (xa + xb) / 2, hgt = Math.min(34, (xb - xa) * 0.6 + 8);
      g += `<path d="M${r1(xa)} ${y - 4} Q${r1(mid)} ${r1(y - 4 - hgt * 1.6)} ${r1(xb)} ${y - 4}" class="jump j${i % 3}"/>`;
    });
    (opt.marks || []).forEach((m) => {
      g += `<circle cx="${r1(X(m.v))}" cy="${y}" r="6" class="mark ${m.cls || ""}"/>`;
      if (m.label) g += text(X(m.v), y - 20, m.label, "lbl mk");
    });
    return V.svg(W + x0 * 2, 92, g, { label: opt.label || "number line", max: opt.max });
  };

  /* ---------- decimals ---------- */
  V.hundred = function (shaded, opt = {}) {
    const S = 180, c = S / 10;
    let g = "";
    for (let i = 0; i < 100; i++) {
      const col = Math.floor(i / 10), row = i % 10;
      g += `<rect x="${r1(4 + col * c)}" y="${r1(4 + row * c)}" width="${r1(c)}" height="${r1(c)}" class="cell ${i < shaded ? "onlyA" : "none"}"/>`;
    }
    g += `<rect x="4" y="4" width="${S}" height="${S}" class="outline"/>`;
    return V.svg(S + 8, S + 8, g, { label: opt.label || `hundredths grid with ${shaded} shaded` });
  };
  // 0.a x 0.b on a hundredths grid
  V.decMult = function (a, b) {
    return V.fracArea(a, 10, b, 10, { topLabel: `0.${a}`, sideLabel: `0.${b}` });
  };

  /* ---------- coordinate plane ---------- */
  // opt: max, points:[{x,y,label,cls}], segs:[[[x,y],[x,y]]], poly:[[x,y]...], cell
  V.coord = function (opt) {
    const max = opt.max || 10, cell = opt.cell || Math.min(30, 300 / max), x0 = 30, y0 = 12;
    const X = (x) => x0 + x * cell, Y = (y) => y0 + (max - y) * cell;
    let g = "";
    for (let i = 0; i <= max; i++) {
      g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(max)}" class="gline"/>`;
      g += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(max)}" y2="${Y(i)}" class="gline"/>`;
      if (!opt.noNums || i === 0) {
        g += text(X(i), Y(0) + 14, i, "lbl sm");
        if (i) g += text(X(0) - 12, Y(i), i, "lbl sm");
      }
    }
    g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(max) + 8}" y2="${Y(0)}" class="axis"/>`;
    g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(max) - 8}" class="axis"/>`;
    g += text(X(max) + 12, Y(0), "x", "lbl ax", "start");
    g += text(X(0), Y(max) - 14, "y", "lbl ax");
    if (opt.poly) g += `<polygon points="${pts(opt.poly.map(([x, y]) => [X(x), Y(y)]))}" class="cpoly"/>`;
    (opt.segs || []).forEach(([a, b]) => (g += `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" class="cseg"/>`));
    (opt.points || []).forEach((p) => {
      g += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5.5" class="cpt ${p.cls || ""}"/>`;
      if (p.label) g += text(X(p.x) + 9, Y(p.y) - 10, p.label, "lbl pt", "start");
    });
    return V.svg(max * cell + x0 + 26, max * cell + y0 + 26, g, { label: "coordinate grid", cls: "coordsvg", max: opt.maxPx || 380 });
  };
  V.coordMeta = (max, cell) => ({ x0: 30, y0: 12, cell: cell || Math.min(30, 300 / max), max });

  /* ---------- line plot ---------- */
  // values: array of rationals; denom: tick spacing 1/denom
  V.linePlot = function (values, min, max, denom, title) {
    const W = 380, x0 = 26, y = 150;
    const X = (v) => x0 + ((v - min) / (max - min)) * W;
    let g = `<line x1="${x0 - 6}" y1="${y}" x2="${x0 + W + 6}" y2="${y}" class="axis"/>`;
    const steps = Math.round((max - min) * denom);
    for (let i = 0; i <= steps; i++) {
      const v = min + i / denom;
      const whole = Math.abs(v - Math.round(v)) < 1e-9;
      g += `<line x1="${r1(X(v))}" y1="${y - 6}" x2="${r1(X(v))}" y2="${y + 6}" class="tick"/>`;
      let lab;
      if (whole) lab = MQ.U.num(v);
      else {
        const n = Math.round((v - Math.floor(v)) * denom), r = MQ.U.R(n, denom);
        lab = (Math.floor(v) ? Math.floor(v) + " " : "") + r.n + "/" + r.d;
      }
      g += text(X(v), y + 22, lab, whole ? "lbl" : "lbl sm");
    }
    const counts = {};
    values.forEach((r) => {
      const k = r.n / r.d;
      counts[k] = (counts[k] || 0) + 1;
      g += text(X(k), y - 14 - (counts[k] - 1) * 18, "×", "lbl xmark");
    });
    if (title) g += text(x0 + W / 2, y + 44, title, "lbl sm");
    return V.svg(W + x0 * 2, y + (title ? 54 : 34), g, { label: "line plot" });
  };

  /* ---------- polygons ---------- */
  const SHAPES = {
    square: { p: [[20, 20], [140, 20], [140, 140], [20, 140]], eq: [[0, 1, 2, 3]], right: [0, 1, 2, 3], par: [[0, 2], [1, 3]] },
    rectangle: { p: [[10, 40], [190, 40], [190, 130], [10, 130]], eq: [[0, 2], [1, 3]], right: [0, 1, 2, 3], par: [[0, 2], [1, 3]] },
    rhombus: { p: [[60, 20], [170, 20], [130, 120], [20, 120]].map(([x, y]) => [x, y]), eq: [[0, 1, 2, 3]], par: [[0, 2], [1, 3]] },
    parallelogram: { p: [[60, 30], [200, 30], [160, 120], [20, 120]], eq: [[0, 2], [1, 3]], par: [[0, 2], [1, 3]] },
    trapezoid: { p: [[60, 30], [150, 30], [200, 120], [10, 120]], par: [[0, 2]] },
    rightTrapezoid: { p: [[20, 30], [120, 30], [190, 120], [20, 120]], right: [0, 3], par: [[0, 2]] },
    kite: { p: [[100, 10], [160, 60], [100, 150], [40, 60]], eq: [[0, 3], [1, 2]] },
    quad: { p: [[30, 40], [150, 20], [190, 130], [60, 110]] },
    equilateral: { p: [[100, 18], [176, 150], [24, 150]], eq: [[0, 1, 2]] },
    isosceles: { p: [[100, 14], [150, 150], [50, 150]], eq: [[0, 2]] },
    scalene: { p: [[40, 30], [190, 150], [14, 150]] },
    rightTri: { p: [[30, 20], [30, 150], [180, 150]], right: [1] },
    rightIso: { p: [[30, 20], [30, 150], [160, 150]], right: [1], eq: [[0, 1]] },
    obtuse: { p: [[60, 90], [200, 150], [10, 150]] },
    obtuseIso: { p: [[105, 100], [200, 150], [10, 150]], eq: [[0, 2]] },
    acuteScalene: { p: [[120, 20], [190, 150], [20, 150]] },
  };
  // fix rhombus to have equal sides: side 110 horizontal, slant 110
  SHAPES.rhombus.p = [[66, 20], [176, 20], [130, 122], [20, 122]];
  V.shapeNames = Object.keys(SHAPES);
  V.shape = function (name, opt = {}) {
    const S = SHAPES[name];
    const p = S.p;
    const n = p.length;
    const side = (i) => [p[i], p[(i + 1) % n]];
    let g = `<polygon points="${pts(p)}" class="shape"/>`;
    // equal-side ticks
    (S.eq || []).forEach((group, gi) => {
      group.forEach((i) => {
        const [a, b] = side(i);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
        const nx = -dy / L, ny = dx / L, tx = dx / L, ty = dy / L;
        for (let k = 0; k <= gi; k++) {
          const o = (k - gi / 2) * 6;
          g += `<line x1="${r1(mx + tx * o - nx * 7)}" y1="${r1(my + ty * o - ny * 7)}" x2="${r1(mx + tx * o + nx * 7)}" y2="${r1(my + ty * o + ny * 7)}" class="tickm"/>`;
        }
      });
    });
    (S.right || []).forEach((i) => {
      const v = p[i], a = p[(i + n - 1) % n], b = p[(i + 1) % n];
      const u1 = [(a[0] - v[0]), (a[1] - v[1])], u2 = [(b[0] - v[0]), (b[1] - v[1])];
      const l1 = Math.hypot(...u1), l2 = Math.hypot(...u2), k = 12;
      const q1 = [v[0] + (u1[0] / l1) * k, v[1] + (u1[1] / l1) * k], q2 = [v[0] + (u2[0] / l2) * k, v[1] + (u2[1] / l2) * k];
      const q3 = [q1[0] + q2[0] - v[0], q1[1] + q2[1] - v[1]];
      g += `<polyline points="${pts([q1, q3, q2])}" class="rightm"/>`;
    });
    if (opt.parallel !== false)
      (S.par || []).forEach((pair, pi) => {
        pair.forEach((i) => {
          const [a, b] = side(i);
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
          const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
          const tx = dx / L, ty = dy / L, nx = -ty, ny = tx;
          for (let k = 0; k <= pi; k++) {
            const o = k * 7 - pi * 3.5 + (pi ? 0 : 0);
            const cx = mx + tx * o, cy = my + ty * o;
            // arrow chevron pointing along the side direction (direction normalised so pairs match)
            const sgn = i >= 2 ? -1 : 1;
            const ax = tx * sgn, ay = ty * sgn;
            g += `<polyline points="${pts([[cx - ax * 6 + nx * 5, cy - ay * 6 + ny * 5], [cx, cy], [cx - ax * 6 - nx * 5, cy - ay * 6 - ny * 5]])}" class="parm"/>`;
          }
        });
      });
    const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
    const minX = Math.min(...xs) - 16, minY = Math.min(...ys) - 16;
    return V.svg(Math.max(...xs) - minX + 16, Math.max(...ys) - minY + 16, g, { x: minX, y: minY, label: opt.label || "shape", max: opt.max || 220 });
  };

  /* ---------- mascot ---------- */
  V.cubo = function (mood = "happy", size = 72) {
    const c = 0.866, s = 34;
    const P = (x, y, z) => [(x - y) * s * c, (x + y) * s * 0.5 - z * s];
    const top = [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)];
    const right = [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)];
    const left = [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)];
    // face on the left (+y) face
    const fc = (u, v) => { const a = P(u, 1, v); return a; };
    const e1 = fc(0.32, 0.6), e2 = fc(0.7, 0.6);
    let mouth;
    if (mood === "sad") { const m1 = fc(0.35, 0.28), m2 = fc(0.68, 0.28), mc = fc(0.52, 0.38); mouth = `M${r1(m1[0])} ${r1(m1[1])} Q${r1(mc[0])} ${r1(mc[1] - 6)} ${r1(m2[0])} ${r1(m2[1])}`; }
    else if (mood === "think") { const m1 = fc(0.4, 0.3), m2 = fc(0.64, 0.3); mouth = `M${r1(m1[0])} ${r1(m1[1])} L${r1(m2[0])} ${r1(m2[1])}`; }
    else { const m1 = fc(0.3, 0.36), m2 = fc(0.72, 0.36), mc = fc(0.52, 0.18); mouth = `M${r1(m1[0])} ${r1(m1[1])} Q${r1(mc[0])} ${r1(mc[1] + 8)} ${r1(m2[0])} ${r1(m2[1])}`; }
    const eye = (e) => mood === "star"
      ? `<path d="M${r1(e[0])} ${r1(e[1] - 6)} l2 4.5 5 .5-3.8 3.2 1.2 5-4.4-2.8-4.4 2.8 1.2-5-3.8-3.2 5-.5z" class="mface-star"/>`
      : `<ellipse cx="${r1(e[0])}" cy="${r1(e[1])}" rx="3.6" ry="${mood === "think" ? 2 : 4.6}" class="mface"/>`;
    const g = `<g class="cube cubo" style="--h:var(--mascot)"><polygon class="ft" points="${pts(top)}"/><polygon class="fr" points="${pts(right)}"/><polygon class="fl" points="${pts(left)}"/></g>` +
      eye(e1) + eye(e2) + `<path d="${mouth}" class="mmouth"/>` +
      `<ellipse cx="${r1(fc(0.15, 0.4)[0])}" cy="${r1(fc(0.15, 0.4)[1] + 2)}" rx="4" ry="2.5" class="mcheek"/><ellipse cx="${r1(fc(0.88, 0.4)[0])}" cy="${r1(fc(0.88, 0.4)[1] + 2)}" rx="4" ry="2.5" class="mcheek"/>`;
    return `<svg viewBox="-36 -42 72 76" width="${size}" height="${size}" class="cubo-svg" aria-hidden="true">${g}</svg>`;
  };

  /* ---------- unit icons ---------- */
  V.icon = function (k) {
    const I = {
      cube: `<path d="M12 3 21 8v8l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v8" />`,
      share: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14M15 5v14"/>`,
      fracx: `<path d="M5 6h6M8 3v0M5 11h6M8 14v0 M14 14l6 6M20 14l-6 6 M4 18h7"/><circle cx="8" cy="3.5" r="1"/><circle cx="8" cy="14" r="1"/>`,
      long: `<path d="M8 6c2 3 2 9 0 12 M8 6h13 M12 12h6 M3 12h3"/>`,
      dot: `<path d="M3 18h4M12 6v12M17 6h4v12h-4z"/><circle cx="9" cy="17" r="1.6"/>`,
      ruler: `<path d="M3 15 15 3l6 6L9 21z M7 11l2 2M10 8l2 2M13 5l2 2"/>`,
      grid: `<path d="M4 4v16h16 M4 12h16M12 4v16 M4 8h16M8 4v16M16 4v16M4 16h16" opacity=".5"/><circle cx="16" cy="8" r="2"/>`,
      puzzle: `<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>`,
      flame: `<path d="M12 21c-4 0-7-3-7-7 0-3 2-5 3-7 0 2 1 3 2 3 0-3 1-6 4-8 0 3 5 6 5 12 0 4-3 7-7 7z"/>`,
      star: `<path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.2-.9z"/>`,
      lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
      check: `<path d="m5 12 5 5 9-10"/>`,
      back: `<path d="M15 5 8 12l7 7"/>`,
      sound: `<path d="M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6"/>`,
      mute: `<path d="M4 9h4l5-4v14l-5-4H4z M17 9l4 6M21 9l-4 6"/>`,
      parent: `<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6 M17 11a2.5 2.5 0 1 0 0-5 M16 14c3 0 5 2 5 5"/>`,
      bolt: `<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>`,
      trophy: `<path d="M8 4h8v5a4 4 0 0 1-8 0z M8 6H4a3 3 0 0 0 4 4 M16 6h4a3 3 0 0 1-4 4 M12 13v4 M8 21h8 M9 17h6v4H9z"/>`,
      bulb: `<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>`,
      play: `<path d="M7 4v16l13-8z"/>`,
      book: `<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z M4 19V5 M8 7h8"/>`,
      target: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>`,
      chat: `<path d="M4 5h16v11H9l-5 4z"/>`,
      redo: `<path d="M4 12a8 8 0 1 0 3-6.2 M4 4v5h5"/>`,
    };
    return `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">${I[k] || ""}</svg>`;
  };
})();
