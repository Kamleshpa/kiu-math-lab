/* Unit 7 · Shapes on the Coordinate Plane */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc } = U;
  const LET = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const randPts = (n, max, avoid = []) => {
    const out = [], used = new Set(avoid.map((p) => p.join(",")));
    while (out.length < n) {
      const p = [ri(1, max), ri(1, max)];
      if (!used.has(p.join(","))) { used.add(p.join(",")); out.push(p); }
    }
    return out;
  };

  /* ---------------- skills ---------------- */
  const readPoint = (d) => {
    const max = d === 1 ? 6 : 10;
    const n = d === 1 ? 1 : d === 2 ? 3 : 5;
    const ps = randPts(n, max);
    const k = ri(0, n - 1);
    const [x, y] = ps[k];
    return {
      prompt: `What are the coordinates of point <b>${LET[k]}</b>? <span class="muted">Type them like (3, 5).</span>`,
      visual: V.coord({ max, points: ps.map((p, i) => ({ x: p[0], y: p[1], label: LET[i], cls: i === k ? "hl" : "" })) }),
      kind: "pt", answer: [x, y],
      hint: `Start at the origin (0, 0). How far across do you go? That's x. How far up? That's y.`,
      steps: [`From the origin, go <b>${x}</b> across to the right (x-coordinate).`, `Then go <b>${y}</b> up (y-coordinate).`, `Point ${LET[k]} is at <b>(${x}, ${y})</b>. Across first, then up!`],
    };
  };

  const findPoint = (d) => {
    const max = 10;
    let x = ri(1, 9), y = ri(1, 9);
    if (x === y) y = (y % 9) + 1;
    const ps = [[x, y], [y, x], ...randPts(d >= 3 ? 3 : 2, max, [[x, y], [y, x]])];
    const order = U.shuffle(ps.map((p, i) => i));
    const labeled = order.map((i, j) => ({ x: ps[i][0], y: ps[i][1], label: LET[j] }));
    const correctIdx = order.indexOf(0), swapIdx = order.indexOf(1);
    const choices = labeled.map((p) => `Point ${p.label}`);
    return {
      prompt: `Which point is located at <b>(${x}, ${y})</b>?`,
      visual: V.coord({ max, points: labeled }), kind: "mc", choices, answer: correctIdx,
      hint: `The first number tells you how far to go along the x-axis (across). The second tells you how far up.`,
      steps: [`Go ${x} across, then ${y} up.`, `That is <b>Point ${LET[correctIdx]}</b>.`, `<span class="muted">Point ${LET[swapIdx]} is at (${y}, ${x}). That's the classic mix-up of going up first.</span>`],
    };
  };

  const distance = (d) => {
    if (d >= 4 && Math.random() < 0.5) {
      const x1 = ri(1, 4), y1 = ri(1, 4), w = ri(2, 5), h = ri(2, 5);
      const vs = [[x1, y1], [x1 + w, y1], [x1 + w, y1 + h], [x1, y1 + h]];
      return {
        prompt: `A rectangle has vertices at ${vs.map((v) => `(${v[0]}, ${v[1]})`).join(", ")}. What is its <b>perimeter</b>?`,
        visual: d === 4 ? V.coord({ max: 10, poly: vs, points: vs.map((v) => ({ x: v[0], y: v[1] })) }) : "",
        kind: "num", answer: 2 * (w + h), suffix: "units",
        hint: `Find the length (difference in x) and the width (difference in y). Perimeter = 2 ${"&times;"} (length + width).`,
        steps: [`Length: ${x1 + w} &minus; ${x1} = ${w}`, `Width: ${y1 + h} &minus; ${y1} = ${h}`, `Perimeter: ${w} + ${h} + ${w} + ${h} = <b>${2 * (w + h)}</b> units`],
      };
    }
    const horiz = Math.random() < 0.5;
    const c = ri(1, 9), a = ri(0, 4), b = ri(a + 2, 10);
    const P = horiz ? [[a, c], [b, c]] : [[c, a], [c, b]];
    return {
      prompt: `How far apart are the points (${P[0][0]}, ${P[0][1]}) and (${P[1][0]}, ${P[1][1]})?`,
      visual: d <= 2 ? V.coord({ max: 10, points: [{ x: P[0][0], y: P[0][1], label: "P" }, { x: P[1][0], y: P[1][1], label: "Q" }], segs: [P] }) : "",
      kind: "num", answer: b - a, suffix: "units",
      hint: `The ${horiz ? "y" : "x"}-coordinates are the same, so the points are on a ${horiz ? "horizontal" : "vertical"} line. Subtract the ${horiz ? "x" : "y"}-coordinates.`,
      steps: [`Both points have ${horiz ? "y" : "x"} = ${c}.`, `${b} &minus; ${a} = <b>${b - a}</b> units`],
    };
  };

  const fourth = (d) => {
    const x1 = ri(1, 4), y1 = ri(1, 4), w = ri(2, 5), h = ri(2, 5);
    const vs = [[x1, y1], [x1 + w, y1], [x1 + w, y1 + h], [x1, y1 + h]];
    const miss = ri(0, 3);
    const given = vs.filter((_, i) => i !== miss);
    return {
      prompt: `Three vertices of a rectangle are ${given.map((v) => `(${v[0]}, ${v[1]})`).join(", ")}. What are the coordinates of the fourth vertex?`,
      visual: d <= 3 ? V.coord({ max: 10, points: given.map((v, i) => ({ x: v[0], y: v[1], label: LET[i] })) }) : "",
      kind: "pt", answer: vs[miss],
      hint: `A rectangle's sides are horizontal and vertical here. The missing corner shares its x with one vertex and its y with another.`,
      steps: [`The x-coordinates used are ${x1} and ${x1 + w}; the y-coordinates are ${y1} and ${y1 + h}.`, `Each x and each y must appear twice. The missing vertex is <b>(${vs[miss][0]}, ${vs[miss][1]})</b>.`],
    };
  };

  const patterns = (d) => {
    const a = ri(1, 4), k = ri(2, 4), b = a * k;
    const n = ri(4, 8);
    const A = Array.from({ length: 6 }, (_, i) => i * a), B = Array.from({ length: 6 }, (_, i) => i * b);
    const table = `<div class="tbl-wrap"><table class="tbl small"><tbody><tr><th>Rule A: start at 0, add ${a}</th>${A.map((v) => `<td>${v}</td>`).join("")}</tr><tr><th>Rule B: start at 0, add ${b}</th>${B.map((v) => `<td>${v}</td>`).join("")}</tr></tbody></table></div>`;
    const t = d <= 3 ? pick(["next", "times"]) : pick(["times", "pair", "pair"]);
    if (t === "next")
      return {
        prompt: `What is the 8th number in Rule B? <span class="muted">(The first number is 0.)</span>`, visual: table,
        kind: "num", answer: 7 * b,
        hint: `The 1st number is 0. Each step adds ${b}. How many steps to get to the 8th number?`,
        steps: [`From the 1st to the 8th number is 7 steps.`, `7 ${"&times;"} ${b} = <b>${7 * b}</b>`],
      };
    if (t === "times")
      return {
        prompt: `Look at the two patterns. Each number in Rule B is how many times the matching number in Rule A?`, visual: table,
        kind: "num", answer: k,
        hint: `Compare matching pairs: ${A[2]} and ${B[2]}, ${A[3]} and ${B[3]}…`,
        steps: [`${A[1]} ${"&times;"} ${k} = ${B[1]}, ${A[2]} ${"&times;"} ${k} = ${B[2]}, ${A[3]} ${"&times;"} ${k} = ${B[3]}`, `Rule B is always <b>${k}</b> times Rule A, because it adds ${b} = ${k} ${"&times;"} ${a} each step.`],
      };
    return {
      prompt: `The patterns make ordered pairs (A, B): (0, 0), (${a}, ${b}), (${2 * a}, ${2 * b})… Which ordered pair is also in this list?`,
      visual: table,
      ...mc(`(${n * a}, ${n * b})`, [`(${n * b}, ${n * a})`, `(${n * a}, ${n * a + b})`, `(${n * a}, ${(n + 1) * b})`]),
      hint: `In every pair, the B number is ${k} times the A number.`,
      steps: [`Check: ${n * a} ${"&times;"} ${k} = ${n * b}.`, `So <b>(${n * a}, ${n * b})</b> fits the pattern.`],
    };
  };

  const QUADS = {
    square: { name: "square", most: "square", names: ["square", "rectangle", "rhombus", "parallelogram", "trapezoid", "kite", "quadrilateral"] },
    rectangle: { name: "rectangle", most: "rectangle", names: ["rectangle", "parallelogram", "trapezoid", "quadrilateral"] },
    rhombus: { name: "rhombus", most: "rhombus", names: ["rhombus", "parallelogram", "trapezoid", "kite", "quadrilateral"] },
    parallelogram: { name: "parallelogram", most: "parallelogram", names: ["parallelogram", "trapezoid", "quadrilateral"] },
    trapezoid: { name: "trapezoid", most: "trapezoid", names: ["trapezoid", "quadrilateral"] },
    kite: { name: "kite", most: "kite", names: ["kite", "quadrilateral"] },
  };
  const ALLQ = ["square", "rectangle", "rhombus", "parallelogram", "trapezoid", "kite", "quadrilateral"];
  const TF = [
    ["Every square is a rectangle.", true, "A square has 4 right angles, which is all a rectangle needs."],
    ["Every rectangle is a square.", false, "A rectangle doesn't need 4 equal sides."],
    ["Every square is a rhombus.", true, "A square has 4 equal sides, which is all a rhombus needs."],
    ["Every rhombus is a square.", false, "A rhombus doesn't need right angles."],
    ["Every rectangle is a parallelogram.", true, "Both pairs of opposite sides of a rectangle are parallel."],
    ["Every parallelogram is a rectangle.", false, "A parallelogram can lean over. It doesn't need right angles."],
    ["Every rhombus is a parallelogram.", true, "Opposite sides of a rhombus are parallel."],
    ["Every parallelogram is a trapezoid.", true, "A trapezoid has at least one pair of parallel sides, and a parallelogram has two."],
    ["Every trapezoid is a parallelogram.", false, "A trapezoid might have only one pair of parallel sides."],
    ["Some rectangles are rhombuses.", true, "Squares are both rectangles and rhombuses."],
    ["A rhombus always has 4 right angles.", false, "Only some rhombuses (squares) do."],
    ["A rectangle can have exactly 3 right angles.", false, "If a quadrilateral has 3 right angles, the 4th angle must be right too."],
    ["A square is a parallelogram.", true, "A square has two pairs of parallel sides."],
    ["Every kite is a rhombus.", false, "A kite has two pairs of equal sides next to each other, but all 4 sides don't have to be equal."],
  ];

  const quad = (d) => {
    const t = d <= 2 ? "most" : d === 3 ? pick(["most", "not", "tf"]) : pick(["tf", "not", "tf"]);
    if (t === "tf") {
      const [s, ans, why] = pick(TF);
      const choices = ["True", "False"];
      return {
        prompt: `True or false? <b>${s}</b>`, kind: "mc", choices, answer: ans ? 0 : 1,
        hint: `Think about what each shape <i>needs</i> (its definition), not what it usually looks like.`,
        steps: [`<b>${ans ? "True" : "False"}</b>. ${why}`],
        note: `We use the definition: a trapezoid has <i>at least one</i> pair of parallel sides.`,
      };
    }
    const key = pick(Object.keys(QUADS));
    const Q = QUADS[key];
    if (t === "most") {
      const choices = U.shuffle(ALLQ.filter((n) => n !== Q.most)).slice(0, 3).concat([Q.most]);
      const sh = U.shuffle(choices);
      return {
        prompt: `What is the <b>most specific</b> name for this shape? <span class="muted">Tick marks show equal sides; arrows show parallel sides.</span>`,
        visual: V.shape(key), kind: "mc", choices: sh, answer: sh.indexOf(Q.most),
        hint: `Check: Are sides parallel? Are they equal? Are the angles right angles?`,
        steps: [`This shape is a ${Q.names.join(", a ")}.`, `The most specific name is <b>${Q.most}</b>.`],
      };
    }
    const not = ALLQ.filter((n) => !Q.names.includes(n));
    if (!not.length) return quad(d);
    const wrong = pick(not);
    const o = mc(wrong, U.shuffle(Q.names).slice(0, 3));
    return {
      prompt: `Which name does <b>NOT</b> describe this shape?`, visual: V.shape(key), ...o,
      hint: `A shape can have many names. Find the one whose rule this shape breaks.`,
      steps: [`This shape is a ${Q.names.join(", a ")}.`, `It is <b>not</b> a ${wrong}.`],
    };
  };

  const TRIS = {
    equilateral: { side: "equilateral", angle: "acute" }, isosceles: { side: "isosceles", angle: "acute" },
    acuteScalene: { side: "scalene", angle: "acute" }, rightTri: { side: "scalene", angle: "right" },
    rightIso: { side: "isosceles", angle: "right" }, obtuse: { side: "scalene", angle: "obtuse" }, obtuseIso: { side: "isosceles", angle: "obtuse" },
  };
  const TTF = [
    ["A triangle can have two right angles.", false, "Two right angles already add to 180°, leaving nothing for the third angle."],
    ["A right triangle can also be isosceles.", true, "Its two legs can be equal, like half of a square."],
    ["An equilateral triangle is also isosceles.", true, "Isosceles means at least two equal sides, and an equilateral triangle has three."],
    ["An obtuse triangle can be equilateral.", false, "Every angle of an equilateral triangle is 60°, so it is always acute."],
    ["A scalene triangle can be a right triangle.", true, "Sides 3, 4 and 5 make a right triangle with no equal sides."],
  ];
  const tri = (d) => {
    if (d >= 4 && Math.random() < 0.4) {
      const [s, ans, why] = pick(TTF);
      return { prompt: `True or false? <b>${s}</b>`, kind: "mc", choices: ["True", "False"], answer: ans ? 0 : 1, hint: `Try to sketch one. If you can't, it's probably false.`, steps: [`<b>${ans ? "True" : "False"}</b>. ${why}`] };
    }
    const key = pick(Object.keys(TRIS)), T = TRIS[key];
    const by = d <= 2 ? pick(["side", "angle"]) : "both";
    if (by === "side") {
      const ch = ["equilateral", "isosceles", "scalene"];
      return { prompt: `Classify this triangle by its <b>sides</b>.`, visual: V.shape(key), kind: "mc", choices: ch, answer: ch.indexOf(T.side), hint: `Tick marks show sides that are equal. Count how many sides match.`, steps: [`Equilateral: 3 equal sides. Isosceles: at least 2. Scalene: none.`, `This one is <b>${T.side}</b>.`] };
    }
    if (by === "angle") {
      const ch = ["acute", "right", "obtuse"];
      return { prompt: `Classify this triangle by its <b>angles</b>.`, visual: V.shape(key), kind: "mc", choices: ch, answer: ch.indexOf(T.angle), hint: `Is there a square corner (right)? An angle wider than a square corner (obtuse)? Or are all angles smaller (acute)?`, steps: [`This one is <b>${T.angle}</b>.`] };
    }
    const correct = `${T.angle} ${T.side}`;
    const ds = [];
    ["acute", "right", "obtuse"].forEach((a) => ["equilateral", "isosceles", "scalene"].forEach((s) => { if (`${a} ${s}` !== correct && !(s === "equilateral" && a !== "acute")) ds.push(`${a} ${s}`); }));
    const o = mc(correct, U.shuffle(ds).slice(0, 3));
    return { prompt: `Which name describes this triangle best?`, visual: V.shape(key), ...o, hint: `Check the angles first (right-angle box? a wide angle?), then the tick marks on the sides.`, steps: [`Angles: ${T.angle}. Sides: ${T.side}.`, `So it is <b>${correct}</b>.`] };
  };

  /* ---------------- widgets ---------------- */
  const coordPlay = (el) => {
    let target = [ri(1, 9), ri(1, 9)], found = 0;
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl"><div class="readout" data-r></div><button type="button" class="btn sm" data-new>New target</button></div></div>`;
    const pts = [];
    const draw = (msg) => {
      el.querySelector("[data-vis]").innerHTML = V.coord({ max: 10, points: pts });
      el.querySelector("[data-r]").innerHTML = `Tap the grid at <span class="big">(${target[0]}, ${target[1]})</span>${msg ? `<br>${msg}` : ""}<br><span class="muted">Found: ${found}</span>`;
      const svg = el.querySelector("svg");
      svg.style.cursor = "crosshair";
      svg.addEventListener("click", (ev) => {
        const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
        const q = p.matrixTransform(svg.getScreenCTM().inverse());
        const m = V.coordMeta(10);
        const x = Math.round((q.x - m.x0) / m.cell), y = Math.round(10 - (q.y - m.y0) / m.cell);
        if (x < 0 || y < 0 || x > 10 || y > 10) return;
        const ok = x === target[0] && y === target[1];
        pts.length = 0;
        pts.push({ x, y, label: `(${x}, ${y})`, cls: ok ? "ok" : "bad" });
        if (ok) { found++; target = [ri(0, 10), ri(0, 10)]; draw(`Yes! That's it. Try the next one.`); }
        else draw(`You tapped (${x}, ${y}). ${x === target[1] && y === target[0] ? "You switched x and y! Go across first." : "Go across " + target[0] + ", then up " + target[1] + "."}`);
      });
    };
    el.querySelector("[data-new]").addEventListener("click", () => { target = [ri(0, 10), ri(0, 10)]; pts.length = 0; draw(); });
    draw();
  };

  const tree = () => {
    const B = (x, y, t, w = 112) => `<rect x="${x - w / 2}" y="${y - 16}" width="${w}" height="32" rx="8" class="tnode"/>` + V.text(x, y, t, "lbl tl");
    const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1 + 16}" x2="${x2}" y2="${y2 - 16}" class="tlink"/>`;
    const g = L(200, 24, 120, 94) + L(200, 24, 320, 94) + L(120, 94, 120, 164) + L(120, 164, 60, 234) + L(120, 164, 200, 234) + L(320, 94, 200, 234) + L(60, 234, 130, 304) + L(200, 234, 130, 304) +
      B(200, 24, "Quadrilateral", 130) + B(120, 94, "Trapezoid") + B(320, 94, "Kite", 80) + B(120, 164, "Parallelogram", 130) + B(60, 234, "Rectangle", 104) + B(200, 234, "Rhombus", 100) + B(130, 304, "Square", 96);
    return V.svg(400, 330, g, { label: "quadrilateral family tree", max: 420 });
  };

  window.MQ.addUnit({
    id: "u7", n: 7, title: "Shapes on the Coordinate Plane", short: "Coordinate Plane", icon: "grid", hue: "var(--u7)",
    blurb: "Plotting points, patterns as ordered pairs, and the family tree of shapes.",
    bigIdea: `An ordered pair (x, y) is an address: go <b>across</b> x, then <b>up</b> y. Shapes belong to families. A square is also a rectangle, a rhombus and a parallelogram, because it follows all their rules.`,
    lessons: [
      {
        id: "l1", title: "The coordinate plane", slides: [
          { t: "learn", title: "Two number lines make a map", body: `<div class="vis-row">${V.coord({ max: 8, points: [{ x: 5, y: 3, label: "(5, 3)", cls: "hl" }], segs: [[[0, 0], [5, 0]], [[5, 0], [5, 3]]] })}</div><p>The horizontal line is the <b>x-axis</b>, and the vertical one is the <b>y-axis</b>. They meet at the <b>origin</b>, (0, 0).</p><p>To find (5, 3): go <b>5 across</b>, then <b>3 up</b>.</p>`, tip: `"Walk before you climb": go across the hall (x), then up the stairs (y).` },
          { t: "play", title: "Target practice", body: `<p>Tap where each point belongs.</p>`, widget: coordPlay },
          { t: "check", skill: "readPoint", d: 1 },
          { t: "check", skill: "findPoint", d: 2 },
          { t: "check", skill: "readPoint", d: 2 },
        ],
      },
      {
        id: "l2", title: "Distances and shapes on the grid", slides: [
          { t: "learn", title: "Same row? Subtract!", body: `<p>(2, 6) and (9, 6) have the same y-coordinate, so they are on a horizontal line. The distance is 9 &minus; 2 = <b>7 units</b>.</p><p>(4, 1) and (4, 8) share an x-coordinate, so they are on a vertical line: 8 &minus; 1 = <b>7 units</b>.</p>` },
          { t: "check", skill: "distance", d: 2 },
          { t: "learn", title: "Finding a missing corner", body: `<p>A rectangle has corners at (1, 2), (6, 2) and (6, 5). Where's the 4th?</p><p>The rectangle uses x = 1 and x = 6, and y = 2 and y = 5. Each x and each y appears twice, so the missing corner is <b>(1, 5)</b>.</p>` },
          { t: "check", skill: "fourth", d: 3 },
          { t: "check", skill: "distance", d: 4 },
        ],
      },
      {
        id: "l3", title: "Patterns and ordered pairs", slides: [
          { t: "learn", title: "Two rules side by side", body: `<p>Rule A: start at 0, add 2. Rule B: start at 0, add 6.</p><div class="tbl-wrap"><table class="tbl small"><tbody><tr><th>A</th><td>0</td><td>2</td><td>4</td><td>6</td><td>8</td></tr><tr><th>B</th><td>0</td><td>6</td><td>12</td><td>18</td><td>24</td></tr></tbody></table></div><p>Every B number is <b>3 times</b> its A number, because 6 is 3 times 2. Plot the pairs (0, 0), (2, 6), (4, 12)… and they make a straight line.</p>` },
          { t: "check", skill: "patterns", d: 3 },
          { t: "check", skill: "patterns", d: 4 },
        ],
      },
      {
        id: "l4", title: "The quadrilateral family", slides: [
          { t: "learn", title: "What each shape needs", body: `<ul class="defs"><li><b>Trapezoid:</b> at least 1 pair of parallel sides</li><li><b>Parallelogram:</b> 2 pairs of parallel sides</li><li><b>Rectangle:</b> 4 right angles</li><li><b>Rhombus:</b> 4 equal sides</li><li><b>Square:</b> 4 right angles AND 4 equal sides</li><li><b>Kite:</b> 2 pairs of equal sides next to each other</li></ul>`, tip: `Some books say a trapezoid has exactly one pair of parallel sides. Illustrative Math uses "at least one", so every parallelogram counts as a trapezoid too.` },
          { t: "learn", title: "The family tree", body: `<div class="vis-row">${tree()}</div><p>Every shape has <b>all</b> the properties of the shapes above it. A square is a rectangle AND a rhombus, so it's also a parallelogram, a trapezoid and a quadrilateral.</p>` },
          { t: "check", skill: "quad", d: 2 },
          { t: "check", skill: "quad", d: 3 },
          { t: "check", skill: "quad", d: 4 },
        ],
      },
      {
        id: "l5", title: "Classifying triangles", slides: [
          { t: "learn", title: "Sort by sides, sort by angles", body: `<div class="vis-row">${V.shape("equilateral", { max: 110 })}${V.shape("rightIso", { max: 110 })}${V.shape("obtuse", { max: 140 })}</div><ul><li><b>By sides:</b> equilateral (3 equal), isosceles (at least 2 equal), scalene (no equal sides)</li><li><b>By angles:</b> acute (all angles less than a right angle), right (one right angle), obtuse (one angle bigger than a right angle)</li></ul>` },
          { t: "check", skill: "tri", d: 2 },
          { t: "check", skill: "tri", d: 3 },
        ],
      },
    ],
    skills: [
      { id: "readPoint", name: "Reading coordinates", min: 1, max: 3, gen: readPoint },
      { id: "findPoint", name: "Locating ordered pairs", min: 1, max: 3, gen: findPoint },
      { id: "distance", name: "Distance & perimeter on the grid", min: 2, max: 5, gen: distance },
      { id: "fourth", name: "Missing vertex", min: 3, max: 5, gen: fourth },
      { id: "patterns", name: "Patterns & relationships", min: 3, max: 5, gen: patterns },
      { id: "quad", name: "Quadrilateral family", min: 1, max: 5, gen: quad },
      { id: "tri", name: "Classifying triangles", min: 2, max: 5, gen: tri },
    ],
  });
})();
