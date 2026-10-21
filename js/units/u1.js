/* Unit 1 · Finding Volume */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, num } = U;
  const X = "&times;";
  const hue = "var(--u1)";
  const LAYERS = ["var(--u1)", "var(--u1b)"];

  /* ---------------- skills ---------------- */
  const count = (d) => {
    const R = [[1, 3], [2, 4], [3, 5], [3, 6], [3, 6]][d - 1];
    const l = ri(R[0], R[1]), w = ri(Math.max(1, R[0] - 1), R[1] - 1), h = ri(R[0], R[1]);
    const ask = d >= 2 && Math.random() < 0.3 ? "layer" : "all";
    if (ask === "layer")
      return {
        prompt: `Look at the bottom layer of this prism. How many unit cubes are in <b>one layer</b>?`,
        visual: V.prism(l, w, h, { layerHues: LAYERS }),
        kind: "num", answer: l * w, suffix: "cubes",
        hint: `The bottom layer is a rectangle of cubes: count the cubes along the front edge and along the side edge, then multiply.`,
        steps: [`The front edge has ${l} cubes.`, `The side edge has ${w} cubes.`, `One layer = ${l} ${X} ${w} = <b>${l * w}</b> cubes.`],
      };
    return {
      prompt: `How many unit cubes make up this prism? <span class="muted">(Some cubes are hidden behind the ones you see.)</span>`,
      visual: V.prism(l, w, h, { layerHues: LAYERS }),
      kind: "num", answer: l * w * h, suffix: "cubic units",
      hint: `Count the cubes in one layer first. Then count how many layers are stacked up.`,
      steps: [`One layer: ${l} ${X} ${w} = ${l * w} cubes.`, `There are ${h} layers.`, `${h} ${X} ${l * w} = <b>${l * w * h}</b> cubic units.`],
    };
  };

  const layers = (d) => {
    const l = ri(2, 4 + d), w = ri(2, 3 + d), h = ri(2, 3 + d);
    const t = pick(["box", "stack"]);
    const prompt = t === "box"
      ? `A prism is built from unit cubes. Each layer is ${l} cubes long and ${w} cubes wide. There are ${h} layers. What is the volume?`
      : `${U.name()} stacks ${h} layers of cubes. Every layer has ${l * w} cubes. How many cubes are there in all?`;
    return {
      prompt, kind: "num", answer: l * w * h, suffix: "cubic units",
      hint: t === "box" ? `First find how many cubes are in one layer (${l} ${X} ${w}).` : `Each layer has the same number of cubes. Multiply by the number of layers.`,
      steps: t === "box"
        ? [`One layer = ${l} ${X} ${w} = ${l * w} cubes.`, `${h} layers ${X} ${l * w} = <b>${l * w * h}</b>.`]
        : [`${h} ${X} ${l * w} = <b>${l * w * h}</b> cubes.`],
    };
  };

  const formula = (d) => {
    const big = [6, 10, 12, 15, 20][d - 1];
    let l = ri(2, big), w = ri(2, Math.min(big, 9)), h = ri(2, Math.min(big, 10));
    if (d >= 3) l = ri(10, 6 * d);
    const u = pick(["cm", "in", "ft", "m"]);
    const V0 = l * w * h;
    return {
      prompt: `Find the volume of the rectangular prism.`,
      visual: V.box(Math.min(l, 9), Math.min(w, 5), Math.min(h, 6), { labels: [`${l} ${u}`, `${w} ${u}`, `${h} ${u}`], hue, grid: false }),
      kind: "num", answer: V0, suffix: `cubic ${u}`,
      hint: `Volume = length ${X} width ${X} height. Pick the order that makes the multiplication easiest.`,
      steps: [`V = ${l} ${X} ${w} ${X} ${h}`, `${l} ${X} ${w} = ${l * w} (the area of the base)`, `${l * w} ${X} ${h} = <b>${num(V0)}</b> cubic ${u}`],
    };
  };

  const baseArea = (d) => {
    const u = pick(["cm", "in", "ft"]);
    if (d <= 2) {
      const B = ri(6, 12 * d + 8), h = ri(2, 4 + 2 * d);
      return {
        prompt: `The base of a prism has an area of <b>${B} square ${u}</b>. The prism is <b>${h} ${u}</b> tall. What is its volume?`,
        visual: V.box(4, 3, 3, { labels: ["", "", `${h} ${u}`], hue }) ,
        kind: "num", answer: B * h, suffix: `cubic ${u}`,
        hint: `Volume = (area of base) ${X} height. The base area tells you how many cubes fit in one layer.`,
        steps: [`V = B ${X} h`, `V = ${B} ${X} ${h} = <b>${B * h}</b> cubic ${u}`],
      };
    }
    const l = ri(3, 4 + d * 2), w = ri(2, 3 + d), h = ri(2, 4 + d);
    const V0 = l * w * h;
    const which = d >= 4 ? pick(["h", "l"]) : "h";
    if (which === "h")
      return {
        prompt: `A box has a volume of <b>${V0} cubic ${u}</b>. Its base is ${l} ${u} by ${w} ${u}. How tall is the box?`,
        kind: "num", answer: h, suffix: u,
        hint: `Find the area of the base first. Then ask: base area ${X} what = ${V0}?`,
        steps: [`Base area = ${l} ${X} ${w} = ${l * w} square ${u}.`, `${l * w} ${X} h = ${V0}`, `h = ${V0} &divide; ${l * w} = <b>${h}</b> ${u}`],
      };
    return {
      prompt: `A prism has a volume of <b>${V0} cubic ${u}</b>. It is ${w} ${u} wide and ${h} ${u} tall. How long is it?`,
      kind: "num", answer: l, suffix: u,
      hint: `Multiply the two edges you know. Then divide the volume by that number.`,
      steps: [`${w} ${X} ${h} = ${w * h}`, `${V0} &divide; ${w * h} = <b>${l}</b> ${u}`],
    };
  };

  const expression = (d) => {
    const l = ri(2, 5), w = ri(2, 4), h = ri(2, 5);
    const vis = V.prism(l, w, h, { layerHues: LAYERS, labels: [String(l), String(w), String(h)] });
    if (d >= 3 && Math.random() < 0.5) {
      // which is NOT equal
      const right = [`(${l} ${X} ${w}) ${X} ${h}`, `${l} ${X} (${w} ${X} ${h})`, `${h} ${X} ${l * w}`, `${w} ${X} ${h} ${X} ${l}`];
      const wrong = pick([`${l} + ${w} + ${h}`, `(${l} ${X} ${w}) + ${h}`, `${l} ${X} ${w} ${X} ${h + 1}`]);
      const o = mc(wrong, U.shuffle(right).slice(0, 3));
      return {
        prompt: `Which expression does <b>NOT</b> give the volume of this prism?`, visual: vis, ...o,
        hint: `Volume needs all three edge lengths <i>multiplied</i>. Grouping and order can change. Adding cannot.`,
        steps: [`All the correct expressions multiply ${l}, ${w} and ${h} in some order or grouping, which always gives ${l * w * h}.`, `<b>${wrong}</b> does something different, so it is not the volume.`],
      };
    }
    const correct = pick([`(${l} ${X} ${w}) ${X} ${h}`, `${l * w} ${X} ${h}`, `${h} ${X} (${l} ${X} ${w})`]);
    const o = mc(correct, [`${l} + ${w} + ${h}`, `${l} ${X} ${w}`, `(${l} ${X} ${w}) + ${h}`, `${l} ${X} ${w} + ${w} ${X} ${h}`]);
    return {
      prompt: `Which expression represents the volume of this prism?`, visual: vis, ...o,
      hint: `Think of one layer (${l} by ${w}) and then how many layers are stacked.`,
      steps: [`One layer = ${l} ${X} ${w} = ${l * w} cubes.`, `There are ${h} layers, so the volume is (${l} ${X} ${w}) ${X} ${h} = ${l * w * h}.`, `The correct choice is <b>${correct}</b>.`],
    };
  };

  function lShape(l1, w, h1, l2, h2) {
    const cubes = [];
    for (let z = 0; z < h1; z++) for (let x = 0; x < l1; x++) for (let y = 0; y < w; y++) cubes.push([x, y, z, "var(--u1)"]);
    for (let z = h1; z < h1 + h2; z++) for (let x = 0; x < l2; x++) for (let y = 0; y < w; y++) cubes.push([x, y, z, "var(--u1c)"]);
    return cubes;
  }
  const composite = (d) => {
    const l1 = ri(4, 7), w = ri(2, 4), h1 = ri(1, 3), l2 = ri(1, l1 - 2), h2 = ri(2, 4);
    const A = l1 * w * h1, B = l2 * w * h2, T = A + B;
    const H = h1 + h2;
    let prompt, labels = [];
    if (d <= 3) {
      prompt = `This figure is made of two prisms. The bottom prism is <b>${l1} ${X} ${w} ${X} ${h1}</b> units. The top prism is <b>${l2} ${X} ${w} ${X} ${h2}</b> units. What is the total volume?`;
    } else {
      prompt = `Find the volume of the figure. <span class="muted">Use the labels to work out the size of each part.</span>`;
      labels = [
        { at: [l1 / 2, w, 0], text: `${l1}`, dx: -12, dy: 16 },
        { at: [l1, w / 2, 0], text: `${w}`, dx: 16, dy: 12 },
        { at: [l1, 0, h1 / 2], text: `${h1}`, dx: 10, anchor: "start" },
        { at: [0, w, H / 2], text: `${H}`, dx: -12, anchor: "end" },
        { at: [l2 / 2, 0, H], text: `${l2}`, dx: 8, dy: -10 },
      ];
    }
    return {
      prompt,
      visual: V.cubes(lShape(l1, w, h1, l2, h2), { s: 20, labels, label: "figure made of two prisms" }),
      kind: "num", answer: T, suffix: "cubic units",
      hint: d <= 3 ? `Find the volume of each prism separately, then add them.` : `Split the figure into a bottom prism and a top prism. The top prism is ${H} &minus; ${h1} tall.`,
      steps: [
        ...(d > 3 ? [`The bottom prism is ${l1} long, ${w} wide and ${h1} tall.`, `The top prism is ${l2} long, ${w} wide and ${H} &minus; ${h1} = ${h2} tall.`] : []),
        `Bottom: ${l1} ${X} ${w} ${X} ${h1} = ${A}`,
        `Top: ${l2} ${X} ${w} ${X} ${h2} = ${B}`,
        `Total: ${A} + ${B} = <b>${T}</b> cubic units`,
      ],
    };
  };

  const word = (d) => {
    const n = U.name();
    const kind = d <= 3 ? pick(["tank", "sand", "box"]) : pick(["pack", "two", "compare", "missing", "pack"]);
    if (kind === "tank") {
      const l = ri(2, 6) * 5, w = ri(2, 4) * 5, h = ri(3, 6) * 4;
      return {
        prompt: `${n}'s fish tank is ${l} inches long, ${w} inches wide and ${h} inches tall. What is the volume of the tank?`,
        kind: "num", answer: l * w * h, suffix: "cubic inches",
        hint: `Multiply length ${X} width ${X} height. Multiplying the two numbers that end in 5 or 0 first can make it easier.`,
        steps: [`${l} ${X} ${w} = ${l * w}`, `${l * w} ${X} ${h} = <b>${num(l * w * h)}</b> cubic inches`],
      };
    }
    if (kind === "sand") {
      const l = ri(4, 9), w = ri(3, 6), dep = ri(1, 3);
      return {
        prompt: `A sandbox is ${l} feet long and ${w} feet wide. ${n} fills it with sand ${dep} feet deep. How many cubic feet of sand are in the sandbox?`,
        kind: "num", answer: l * w * dep, suffix: "cubic feet",
        hint: `The depth of the sand is the height of the prism of sand.`,
        steps: [`Base: ${l} ${X} ${w} = ${l * w} square feet`, `${l * w} ${X} ${dep} = <b>${l * w * dep}</b> cubic feet`],
      };
    }
    if (kind === "box") {
      const l = ri(3, 8), w = ri(2, 6), h = ri(2, 6);
      return {
        prompt: `A cereal box is ${l} cm long, ${w} cm wide and ${h} cm tall. ${n} wants to fill it completely with 1 cm cubes. How many cubes are needed?`,
        kind: "num", answer: l * w * h, suffix: "cubes",
        hint: `Each 1 cm cube is one cubic centimeter. Find the volume.`,
        steps: [`${l} ${X} ${w} ${X} ${h} = <b>${l * w * h}</b> cubes`],
      };
    }
    if (kind === "pack") {
      const s = pick([2, 2, 3]);
      const a = ri(2, 4), b = ri(2, 3), c = ri(2, 4);
      return {
        prompt: `A box is ${a * s} inches long, ${b * s} inches wide and ${c * s} inches tall. How many <b>${s}-inch cubes</b> can be packed inside with no gaps?`,
        kind: "num", answer: a * b * c, suffix: "cubes",
        hint: `How many ${s}-inch cubes fit along each edge? Divide each edge by ${s} first.`,
        steps: [`Along the length: ${a * s} &divide; ${s} = ${a}`, `Along the width: ${b * s} &divide; ${s} = ${b}`, `Along the height: ${c * s} &divide; ${s} = ${c}`, `${a} ${X} ${b} ${X} ${c} = <b>${a * b * c}</b> cubes`, `<span class="muted">Careful: ${a * s * b * s * c * s} &divide; ${s} would be wrong, because each cube takes up ${s * s * s} cubic inches.</span>`],
      };
    }
    if (kind === "two") {
      const l = ri(4, 8), w = ri(2, 4), h = ri(1, 3), k = ri(2, 4);
      return {
        prompt: `A garden has ${k} raised beds. Each bed is ${l} feet long, ${w} feet wide and ${h} feet deep. How many cubic feet of soil fill all the beds?`,
        kind: "num", answer: l * w * h * k, suffix: "cubic feet",
        hint: `Find the volume of one bed, then multiply by the number of beds.`,
        steps: [`One bed: ${l} ${X} ${w} ${X} ${h} = ${l * w * h}`, `${k} beds: ${k} ${X} ${l * w * h} = <b>${l * w * h * k}</b> cubic feet`],
      };
    }
    if (kind === "compare") {
      const a = [ri(4, 9), ri(3, 6), ri(2, 5)], b = [ri(4, 9), ri(3, 6), ri(2, 5)];
      const va = a[0] * a[1] * a[2], vb = b[0] * b[1] * b[2];
      if (va === vb) b[2]++;
      const vb2 = b[0] * b[1] * b[2];
      return {
        prompt: `Box A is ${a.join(" cm by ")} cm. Box B is ${b.join(" cm by ")} cm. How many more cubic centimeters does the larger box hold?`,
        kind: "num", answer: Math.abs(va - vb2), suffix: "cubic cm",
        hint: `Find both volumes, then subtract the smaller from the larger.`,
        steps: [`Box A: ${a.join(` ${X} `)} = ${va}`, `Box B: ${b.join(` ${X} `)} = ${vb2}`, `Difference: <b>${Math.abs(va - vb2)}</b> cubic cm`],
      };
    }
    const l = ri(5, 12), w = ri(3, 8), h = ri(2, 9), V0 = l * w * h;
    return {
      prompt: `A storage bin holds ${V0} cubic inches. The bottom of the bin is ${l} inches by ${w} inches. How deep is the bin?`,
      kind: "num", answer: h, suffix: "inches",
      hint: `Volume = base area ${X} height, so height = volume &divide; base area.`,
      steps: [`Base area: ${l} ${X} ${w} = ${l * w}`, `${V0} &divide; ${l * w} = <b>${h}</b> inches`],
    };
  };

  /* ---------------- lessons ---------------- */
  const prismPlay = (el) => {
    el.innerHTML = `
      <div class="play-grid">
        <div class="play-vis" data-vis></div>
        <div class="play-ctl">
          <label>Length <output data-o="l">4</output><input type="range" id="u1p-l" min="1" max="7" value="4" data-k="l"></label>
          <label>Width <output data-o="w">3</output><input type="range" id="u1p-w" min="1" max="5" value="3" data-k="w"></label>
          <label>Height <output data-o="h">2</output><input type="range" id="u1p-h" min="1" max="6" value="2" data-k="h"></label>
          <div class="readout" data-r></div>
        </div>
      </div>`;
    const st = { l: 4, w: 3, h: 2 };
    const draw = () => {
      el.querySelector("[data-vis]").innerHTML = V.prism(st.l, st.w, st.h, { layerHues: LAYERS, s: 22 });
      el.querySelector("[data-r]").innerHTML =
        `One layer: <b>${st.l} ${X} ${st.w} = ${st.l * st.w}</b> cubes<br>${st.h} layer${st.h > 1 ? "s" : ""}: <b>${st.l * st.w} ${X} ${st.h} = ${st.l * st.w * st.h}</b> cubes<br><span class="big">Volume = ${st.l * st.w * st.h} cubic units</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  const compositePlay = (el) => {
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl">
      <div class="seg" role="group" aria-label="How to split">
        <button type="button" class="segb on" data-m="h">Split across</button><button type="button" class="segb" data-m="v">Split down</button>
      </div><div class="readout" data-r></div></div></div>`;
    // L shape: bottom 6x3x2, top 2x3x3 (total height 5)
    const draw = (m) => {
      const cubes = [];
      for (let z = 0; z < 5; z++) for (let x = 0; x < 6; x++) for (let y = 0; y < 3; y++) {
        if (z >= 2 && x >= 2) continue;
        const partA = m === "h" ? z < 2 : x < 2;
        cubes.push([x, y, z, partA ? "var(--u1)" : "var(--u1c)"]);
      }
      el.querySelector("[data-vis]").innerHTML = V.cubes(cubes, { s: 22 });
      el.querySelector("[data-r]").innerHTML = m === "h"
        ? `<span class="sw" style="--h:var(--u1)"></span>Bottom: 6 ${X} 3 ${X} 2 = <b>36</b><br><span class="sw" style="--h:var(--u1c)"></span>Top: 2 ${X} 3 ${X} 3 = <b>18</b><br><span class="big">36 + 18 = 54 cubic units</span>`
        : `<span class="sw" style="--h:var(--u1)"></span>Tall part: 2 ${X} 3 ${X} 5 = <b>30</b><br><span class="sw" style="--h:var(--u1c)"></span>Short part: 4 ${X} 3 ${X} 2 = <b>24</b><br><span class="big">30 + 24 = 54 cubic units</span>`;
      el.querySelectorAll(".segb").forEach((b) => b.classList.toggle("on", b.dataset.m === m));
    };
    el.querySelectorAll(".segb").forEach((b) => b.addEventListener("click", () => draw(b.dataset.m)));
    draw("h");
  };

  window.MQ.addUnit({
    id: "u1", n: 1, title: "Finding Volume", short: "Volume", icon: "cube", hue: "var(--u1)",
    blurb: "Unit cubes, layers, V = l × w × h, and figures built from prisms.",
    bigIdea: `Volume is how much space a solid takes up. We measure it by counting <b>unit cubes</b>. Count one layer and multiply by the number of layers, and you never have to count every cube.`,
    lessons: [
      {
        id: "l1", title: "What is volume?", slides: [
          { t: "learn", title: "Meet the unit cube", body: `<p>A <b>unit cube</b> is a cube whose edges are each 1 unit long. It is our measuring tool for space.</p><div class="vis-row">${V.prism(1, 1, 1, { s: 46, labels: ["1", "1", "1"], hue })}</div><p>The <b>volume</b> of a solid is the number of unit cubes that fill it with no gaps and no overlaps. We say the answer in <b>cubic units</b>, like cubic centimeters or cubic inches.</p>` },
          { t: "learn", title: "Watch out for hidden cubes", body: `<div class="vis-row">${V.prism(3, 2, 2, { layerHues: LAYERS, s: 30 })}</div><p>You can only see the front, side and top. Some cubes are hidden in the back!</p><p>Smart move: count <b>one layer</b> (the bottom: 3 ${X} 2 = 6 cubes), then count the <b>layers</b> (2). So the volume is 6 ${X} 2 = <b>12 cubic units</b>.</p>`, tip: `Each layer is a different color so you can see where one layer ends and the next begins.` },
          { t: "play", title: "Build a prism", body: `<p>Drag the sliders. Watch how the number of cubes in a layer and the number of layers make the volume.</p>`, widget: prismPlay },
          { t: "check", skill: "count", d: 1 },
          { t: "check", skill: "count", d: 2 },
          { t: "learn", title: "Same volume, different shapes", body: `<p>Two prisms can look very different and still have the same volume.</p><div class="vis-row">${V.prism(6, 1, 2, { hue })}${V.prism(2, 2, 3, { hue: "var(--u1c)" })}</div><p>Both are made of <b>12</b> unit cubes: 6 ${X} 1 ${X} 2 = 12 and 2 ${X} 2 ${X} 3 = 12.</p>` },
          { t: "check", skill: "layers", d: 1 },
        ],
      },
      {
        id: "l2", title: "Layers and the volume formula", slides: [
          { t: "learn", title: "From counting to multiplying", body: `<div class="vis-row">${V.prism(4, 3, 3, { layerHues: LAYERS, labels: ["length 4", "width 3", "height 3"], s: 24 })}</div><p>One layer is <b>length ${X} width</b> = 4 ${X} 3 = 12 cubes. The height tells us there are 3 layers.</p><p class="formula">V = length ${X} width ${X} height</p><p class="formula">V = 4 ${X} 3 ${X} 3 = 36 cubic units</p>` },
          { t: "learn", title: "V = B × h", body: `<p>The bottom face is called the <b>base</b>. Its area <b>B</b> tells you how many cubes fit in one layer. The height <b>h</b> tells you how many layers there are.</p><p class="formula">V = B ${X} h</p><p>If the base has an area of 20 square cm and the prism is 6 cm tall, then V = 20 ${X} 6 = <b>120 cubic cm</b>. You don't even need the length and width!</p>` },
          { t: "check", skill: "formula", d: 1 },
          { t: "learn", title: "Pick the friendly order", body: `<p>You can multiply the three numbers in <b>any order</b> or grouping and get the same volume. Mathematicians call this the associative and commutative properties.</p><p class="formula">(25 ${X} 7) ${X} 4 &nbsp;=&nbsp; 7 ${X} (25 ${X} 4)</p><p>Which is easier? 25 ${X} 4 = 100, and 7 ${X} 100 = <b>700</b>. Look for pairs that make 10, 100 or 1,000.</p>`, tip: `Look for 5 and an even number, or 25 and 4. They make friendly tens and hundreds.` },
          { t: "check", skill: "expression", d: 2 },
          { t: "check", skill: "baseArea", d: 2 },
          { t: "learn", title: "Working backward", body: `<p>Sometimes you know the volume and need a missing edge.</p><p>A box holds <b>60</b> cubic inches. Its base is 4 in by 3 in. How tall is it?</p><ol class="steps"><li>Base area = 4 ${X} 3 = 12</li><li>12 ${X} <b>?</b> = 60</li><li>? = 60 &divide; 12 = <b>5 inches</b></li></ol>` },
          { t: "check", skill: "baseArea", d: 3 },
        ],
      },
      {
        id: "l3", title: "Figures made of prisms", slides: [
          { t: "learn", title: "Break it into prisms", body: `<p>Some solids are not a single box. Split them into rectangular prisms, find each volume, then <b>add</b>.</p><p>Volume is <b>additive</b>: the volume of the whole is the sum of the volumes of the parts (as long as the parts don't overlap).</p>` },
          { t: "play", title: "Two ways to split", body: `<p>Try both buttons. The parts change, but the total volume never does.</p>`, widget: compositePlay },
          { t: "check", skill: "composite", d: 3 },
          { t: "learn", title: "Find the hidden lengths", body: `<p>Labels don't always tell you every edge. Use what you know:</p><ul><li>If the whole figure is 5 tall and the bottom part is 2 tall, the top part is 5 &minus; 2 = <b>3</b> tall.</li><li>Edges that line up across the figure are the same length.</li></ul>`, tip: `Before you calculate, write the length, width and height of each part. Mistakes usually happen with a missing edge.` },
          { t: "check", skill: "composite", d: 4 },
        ],
      },
      {
        id: "l4", title: "Volume detective: word problems", slides: [
          { t: "learn", title: "A plan for every story problem", body: `<ol class="steps"><li><b>Read</b> it twice. What is the question asking?</li><li><b>Picture</b> the solid. Which numbers are length, width and height?</li><li><b>Choose</b>: l ${X} w ${X} h, B ${X} h, or work backward with &divide;</li><li><b>Check</b> your units. Volume is in <i>cubic</i> units.</li></ol>` },
          { t: "learn", title: "Packing bigger cubes", body: `<p>How many <b>2-inch cubes</b> fit in a box that is 6 in ${X} 4 in ${X} 8 in?</p><p>Count how many cubes fit along each edge: 6 &divide; 2 = 3, 4 &divide; 2 = 2, 8 &divide; 2 = 4.</p><p class="formula">3 ${X} 2 ${X} 4 = 24 cubes</p><p class="muted">Trap: the box is 192 cubic inches, but each 2-inch cube takes up 8 cubic inches. So 192 &divide; 8 = 24 also works, while 192 &divide; 2 does not!</p>` },
          { t: "check", skill: "word", d: 3 },
          { t: "check", skill: "word", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "count", name: "Count cubes in a prism", min: 1, max: 3, gen: count },
      { id: "layers", name: "Layers × cubes per layer", min: 1, max: 3, gen: layers },
      { id: "formula", name: "V = l × w × h", min: 1, max: 5, gen: formula },
      { id: "expression", name: "Expressions for volume", min: 2, max: 4, gen: expression },
      { id: "baseArea", name: "V = B × h and missing edges", min: 2, max: 5, gen: baseArea },
      { id: "composite", name: "Figures made of two prisms", min: 3, max: 5, gen: composite },
      { id: "word", name: "Volume word problems", min: 3, max: 5, gen: word },
    ],
  });
})();
