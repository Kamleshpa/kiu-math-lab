/* Unit 2 · Fractions as Quotients and Fraction Multiplication */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, R, f, fmt, fmtImp } = U;
  const X = "&times;", D = "&divide;";

  /* ---------------- skills ---------------- */
  const quotient = (d) => {
    const things = pick([["sandwiches", "kids"], ["pizzas", "friends"], ["pounds of clay", "groups"], ["liters of juice", "bottles"], ["feet of ribbon", "pieces"]]);
    if (d === 1) {
      const b = ri(3, 6), a = ri(1, b - 1);
      return {
        prompt: `${a} ${things[0]} are shared equally by ${b} ${things[1]}. How much does each get?`,
        visual: things[0] === "sandwiches" || things[0] === "pizzas" ? V.sharing(a, b) : "",
        kind: "num", answer: R(a, b),
        hint: `Sharing ${a} things among ${b} is the division ${a} ${D} ${b}. You can write any division as a fraction.`,
        steps: [`Cut each item into ${b} equal pieces. Each one gets 1 piece from every item, so ${a} pieces of size ${f(1, b)}.`, `${a} ${D} ${b} = <b>${f(a, b)}</b>`],
      };
    }
    if (d === 2) {
      const b = ri(2, 5), a = ri(b + 1, 3 * b);
      if (a % b === 0) return quotient(2);
      return {
        prompt: `${a} ${things[0]} are shared equally by ${b} ${things[1]}. How much does each get? <span class="muted">You can answer as a fraction or a mixed number.</span>`,
        visual: a <= 8 && (things[0] === "sandwiches" || things[0] === "pizzas") ? V.sharing(a, b) : "",
        kind: "num", answer: R(a, b),
        hint: `${a} ${D} ${b} = ${f(a, b)}. How many whole ones are in that?`,
        steps: [`${a} ${D} ${b} = ${f(a, b)}`, `${b} goes into ${a} ${Math.floor(a / b)} times with ${a % b} left over.`, `So each gets <b>${fmt(R(a, b))}</b>.`],
      };
    }
    if (d === 3) {
      const b = ri(3, 9), a = ri(2, 4 * b);
      if (a % b === 0) return quotient(3);
      const t = pick(["expr", "between"]);
      if (t === "expr") {
        const o = mc(`${a} ${D} ${b}`, [`${b} ${D} ${a}`, `${a} ${X} ${b}`, `${a} &minus; ${b}`, `${b} &minus; ${a}`]);
        return {
          prompt: `Which expression is equal to ${f(a, b)}?`, ...o,
          hint: `The fraction bar means "divided by". The top number is divided by the bottom number.`,
          steps: [`${f(a, b)} means ${a} divided into ${b} equal parts.`, `So ${f(a, b)} = <b>${a} ${D} ${b}</b>.`],
        };
      }
      const w = Math.floor(a / b);
      const choices = U.shuffle([`${w} and ${w + 1}`, `${w + 1} and ${w + 2}`, `${w + 2} and ${w + 3}`, w > 0 ? `${w - 1} and ${w}` : `${w + 3} and ${w + 4}`]);
      return {
        prompt: `${a} ${D} ${b} is between which two whole numbers?`, kind: "mc", choices, answer: choices.indexOf(`${w} and ${w + 1}`),
        hint: `How many groups of ${b} fit into ${a}?`,
        steps: [`${b} ${X} ${w} = ${b * w} and ${b} ${X} ${w + 1} = ${b * (w + 1)}.`, `${a} is between them, so ${a} ${D} ${b} = ${fmt(R(a, b))} is between <b>${w} and ${w + 1}</b>.`],
      };
    }
    const b = pick([3, 4, 5, 6, 8]), a = ri(b + 1, 5 * b);
    if (a % b === 0) return quotient(d);
    const ctx = pick([
      [`A ${a}-foot rope is cut into ${b} equal pieces. How many feet long is each piece?`, "feet"],
      [`${U.name()} runs ${a} miles in ${b} days, the same distance each day. How many miles is each day's run?`, "miles"],
      [`${a} pounds of rice are packed equally into ${b} bags. How many pounds are in each bag?`, "pounds"],
    ]);
    return {
      prompt: ctx[0], kind: "num", answer: R(a, b), suffix: ctx[1],
      hint: `This is equal sharing: ${a} ${D} ${b}. Write it as a fraction.`,
      steps: [`${a} ${D} ${b} = ${f(a, b)}`, `= <b>${fmt(R(a, b))}</b> ${ctx[1]}`],
    };
  };

  const fracOfWhole = (d) => {
    if (d <= 2) {
      const b = pick([2, 3, 4, 5, 6, 8]), k = ri(2, d === 1 ? 4 : 6), n = b * k;
      const a = d === 1 ? 1 : ri(2, b - 1);
      return {
        prompt: `What is ${f(a, b)} of ${n}?`,
        visual: V.tape(b, a, { total: String(n), partLabel: String(k) }),
        kind: "num", answer: a * k,
        hint: `Split ${n} into ${b} equal parts. How big is each part? Then take ${a} of them.`,
        steps: [`${n} ${D} ${b} = ${k}, so ${f(1, b)} of ${n} is ${k}.`, ...(a > 1 ? [`${a} parts: ${a} ${X} ${k} = <b>${a * k}</b>`] : [`So the answer is <b>${k}</b>.`])],
      };
    }
    if (d === 3) {
      const b = pick([3, 4, 5, 6, 8]), a = ri(1, b - 1), n = ri(2, 9);
      if ((a * n) % b === 0) return fracOfWhole(3);
      const order = Math.random() < 0.5;
      return {
        prompt: order ? `${n} ${X} ${f(a, b)} = ?` : `${f(a, b)} ${X} ${n} = ?`,
        kind: "num", answer: R(a * n, b),
        hint: `Multiply the whole number by the numerator, and keep the denominator: ${n} ${X} ${f(a, b)} = ${f(`${n} ${X} ${a}`, b)}.`,
        steps: [`${n} ${X} ${f(a, b)} = ${f(n * a, b)}`, `As a mixed number that is <b>${fmt(R(n * a, b))}</b>.`],
      };
    }
    const b = pick([4, 5, 6, 8, 10, 12]), a = ri(2, b - 1), k = ri(3, 12), n = b * k;
    if (d === 4)
      return {
        prompt: `${f(a, b)} ${X} ${n} = ?`, kind: "num", answer: a * k,
        hint: `Divide first to keep the numbers small: ${n} ${D} ${b}, then multiply by ${a}.`,
        steps: [`${n} ${D} ${b} = ${k}`, `${a} ${X} ${k} = <b>${a * k}</b>`],
      };
    const ctx = pick([
      [`A class has ${n} students. ${f(a, b)} of them walk to school. How many students walk?`, "students"],
      [`${U.name()} has ${n} stickers and gives away ${f(a, b)} of them. How many stickers are given away?`, "stickers"],
      [`A trail is ${n} km long. ${U.name()} has hiked ${f(a, b)} of it. How many km are left to hike?`, "km", true],
    ]);
    const ans = ctx[2] ? n - a * k : a * k;
    return {
      prompt: ctx[0], kind: "num", answer: ans, suffix: ctx[1],
      visual: V.tape(b, a, { total: String(n), partLabel: String(k) }),
      hint: ctx[2] ? `Find ${f(a, b)} of ${n} first. Then think about what is left.` : `Find ${f(1, b)} of ${n}, then multiply by ${a}.`,
      steps: [`${f(1, b)} of ${n} = ${n} ${D} ${b} = ${k}`, `${f(a, b)} of ${n} = ${a} ${X} ${k} = ${a * k}`, ...(ctx[2] ? [`Left: ${n} &minus; ${a * k} = <b>${ans}</b> km`] : [`Answer: <b>${ans}</b>`])],
    };
  };

  const areaUnit = (d) => {
    const b = ri(2, 5), dd = ri(2, 5);
    if (d >= 3 && Math.random() < 0.4) {
      const o = mc(`${f(1, b)} ${X} ${f(1, dd)}`, [`${f(1, b)} + ${f(1, dd)}`, `${f(1, b + dd)}`, `${b} ${X} ${dd}`]);
      return {
        prompt: `Which expression gives the area of the darkest rectangle, in square units?`,
        visual: V.fracArea(1, b, 1, dd), ...o,
        hint: `The darkest rectangle is ${f(1, b)} unit wide and ${f(1, dd)} unit tall. Area = width ${X} height.`,
        steps: [`Area = width ${X} height = <b>${f(1, b)} ${X} ${f(1, dd)}</b> = ${f(1, b * dd)} square unit.`],
      };
    }
    return {
      prompt: `The big square has a side length of 1 unit. What is the area of the darkest rectangle?`,
      visual: V.fracArea(1, b, 1, dd), kind: "num", answer: R(1, b * dd), suffix: "square units",
      hint: `How many of the small rectangles fill the whole square? Each one is that fraction of the square.`,
      steps: [`The square is cut into ${b} columns and ${dd} rows.`, `That makes ${b} ${X} ${dd} = ${b * dd} equal pieces.`, `So one piece is ${f(1, b)} ${X} ${f(1, dd)} = <b>${f(1, b * dd)}</b> square unit.`],
    };
  };

  const areaFrac = (d) => {
    const b = ri(2, 6), dd = ri(2, 6), a = ri(1, b - 1 || 1), c = ri(1, dd - 1 || 1);
    if (a >= b || c >= dd) return areaFrac(d);
    const ans = R(a * c, b * dd);
    return {
      prompt: d <= 3
        ? `The square has side 1 unit. What is the area of the dark rectangle that is ${f(a, b)} unit by ${f(c, dd)} unit?`
        : `A rectangle is ${f(a, b)} m long and ${f(c, dd)} m wide. What is its area?`,
      visual: d <= 3 ? V.fracArea(a, b, c, dd) : "",
      kind: "num", answer: ans, suffix: d <= 3 ? "square units" : "square m",
      hint: d <= 3 ? `Count the dark pieces (that's the numerator) and all the pieces in the square (that's the denominator).` : `Multiply the numerators, then multiply the denominators.`,
      steps: [`Dark pieces: ${a} ${X} ${c} = ${a * c}`, `Pieces in the whole square: ${b} ${X} ${dd} = ${b * dd}`, `${f(a, b)} ${X} ${f(c, dd)} = ${f(a * c, b * dd)}${ans.d !== b * dd ? ` = ${fmt(ans)}` : ""}`, `Area = <b>${fmt(ans)}</b>`],
    };
  };

  const mixedArea = (d) => {
    const w = ri(1, 4), b = pick([2, 3, 4]), a = ri(1, b - 1), n = ri(2, d >= 5 ? 9 : 6);
    const side = R(w * b + a, b), area = U.mul(side, R(n, 1));
    const cols = [{ w: w, label: String(w) }, { w: a / b, label: `${a}/${b}` }];
    const rows = [{ w: 1, label: String(n) }];
    return {
      prompt: `A rectangle is ${U.mixed(w, a, b)} feet long and ${n} feet wide. What is its area?`,
      visual: V.areaModel(cols, rows, [[`${w} ${X} ${n}`, `${a}/${b} ${X} ${n}`]], { h: 90 }),
      kind: "num", answer: area, suffix: "square feet",
      hint: `Split the length into ${w} and ${f(a, b)}. Find each smaller area, then add (partial products).`,
      steps: [`${w} ${X} ${n} = ${w * n}`, `${f(a, b)} ${X} ${n} = ${f(a * n, b)} = ${fmt(R(a * n, b))}`, `${w * n} + ${fmt(R(a * n, b))} = <b>${fmt(area)}</b> square feet`],
    };
  };

  const word = (d) => {
    const t = pick(d >= 5 ? ["mix", "ribbon", "farm"] : ["share", "ribbon", "farm"]);
    if (t === "share") {
      const b = pick([3, 4, 5, 6]), a = ri(b + 1, 4 * b);
      if (a % b === 0) return word(d);
      return {
        prompt: `${a} cups of trail mix are split evenly into ${b} bags. Between which two whole numbers is the amount in each bag?`,
        ...(() => { const w = Math.floor(a / b); const ch = U.shuffle([`${w} and ${w + 1}`, `${w + 1} and ${w + 2}`, `${Math.max(0, w - 1)} and ${Math.max(1, w)}`, `${w + 2} and ${w + 3}`].filter((v, i, s) => s.indexOf(v) === i)); return { kind: "mc", choices: ch, answer: ch.indexOf(`${w} and ${w + 1}`) }; })(),
        hint: `Each bag gets ${a} ${D} ${b} = ${f(a, b)} cups.`,
        steps: [`${a} ${D} ${b} = ${f(a, b)} = ${fmt(R(a, b))} cups`, `That is between <b>${Math.floor(a / b)} and ${Math.floor(a / b) + 1}</b>.`],
      };
    }
    if (t === "ribbon") {
      const b = pick([2, 3, 4, 5]), a = ri(1, b - 1), n = ri(3, 9);
      return {
        prompt: `${U.name()} makes ${n} bows. Each bow uses ${f(a, b)} yard of ribbon. How many yards of ribbon are used in all?`,
        kind: "num", answer: R(n * a, b), suffix: "yards",
        hint: `${n} groups of ${f(a, b)} is ${n} ${X} ${f(a, b)}.`,
        steps: [`${n} ${X} ${f(a, b)} = ${f(n * a, b)}`, `= <b>${fmt(R(n * a, b))}</b> yards`],
      };
    }
    if (t === "farm") {
      const b = pick([3, 4, 5, 8]), a = ri(1, b - 1), k = ri(3, 9), n = b * k;
      return {
        prompt: `A farm has ${n} animals. ${f(a, b)} of the animals are goats. How many animals are <b>not</b> goats?`,
        kind: "num", answer: n - a * k, suffix: "animals",
        visual: V.tape(b, a, { total: String(n) }),
        hint: `Find how many are goats, then subtract from ${n}. Or find ${f(b - a, b)} of ${n} directly.`,
        steps: [`Goats: ${f(a, b)} of ${n} = ${a} ${X} (${n} ${D} ${b}) = ${a * k}`, `Not goats: ${n} &minus; ${a * k} = <b>${n - a * k}</b>`],
      };
    }
    const w = ri(2, 5), b = pick([2, 4]), a = 1, n = ri(3, 6);
    const area = U.mul(R(w * b + a, b), R(n, 1));
    return {
      prompt: `A garden is ${n} meters wide and ${U.mixed(w, a, b)} meters long. Fertilizer is needed for every square meter. How many square meters need fertilizer?`,
      kind: "num", answer: area, suffix: "square meters",
      hint: `Area = length ${X} width. Split ${U.mixed(w, a, b)} into ${w} + ${f(a, b)}.`,
      steps: [`${w} ${X} ${n} = ${w * n}`, `${f(a, b)} ${X} ${n} = ${fmt(R(n, b))}`, `Total: <b>${fmt(area)}</b> square meters`],
    };
  };

  /* ---------------- play widgets ---------------- */
  const sharePlay = (el) => {
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl">
      <label>Things to share <output data-o="a">3</output><input type="range" id="u2s-a" min="1" max="8" value="3" data-k="a"></label>
      <label>People <output data-o="b">4</output><input type="range" id="u2s-b" min="2" max="6" value="4" data-k="b"></label>
      <div class="readout" data-r></div></div></div>`;
    const st = { a: 3, b: 4 };
    const draw = () => {
      el.querySelector("[data-vis]").innerHTML = V.sharing(st.a, st.b);
      const r = R(st.a, st.b);
      el.querySelector("[data-r]").innerHTML = `Each color is one person's share.<br>Each person gets ${st.a} piece${st.a > 1 ? "s" : ""} of size ${f(1, st.b)}.<br><span class="big">${st.a} ${D} ${st.b} = ${f(st.a, st.b)}${r.d === 1 || st.a > st.b ? " = " + fmt(r) : ""}</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  const tapePlay = (el) => {
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl">
      <label>Numerator <output data-o="a">2</output><input type="range" id="u2t-a" min="1" max="7" value="2" data-k="a"></label>
      <label>Denominator <output data-o="b">3</output><input type="range" id="u2t-b" min="2" max="8" value="3" data-k="b"></label>
      <label>Groups in each part <output data-o="k">4</output><input type="range" id="u2t-k" min="1" max="6" value="4" data-k="k"></label>
      <div class="readout" data-r></div></div></div>`;
    const st = { a: 2, b: 3, k: 4 };
    const draw = () => {
      if (st.a > st.b) st.a = st.b;
      el.querySelector("#u2t-a").value = st.a;
      const n = st.b * st.k;
      el.querySelector("[data-vis]").innerHTML = V.tape(st.b, st.a, { total: String(n), partLabel: String(st.k), shadeLabel: `${st.a * st.k}` });
      el.querySelector("[data-r]").innerHTML = `${n} split into ${st.b} equal parts gives ${st.k} in each part.<br>Take ${st.a} part${st.a > 1 ? "s" : ""}:<br><span class="big">${f(st.a, st.b)} ${X} ${n} = ${st.a * st.k}</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  const areaPlay = (el) => {
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl">
      <label>Width: <output data-o="w"></output><input type="range" id="u2a-a" min="1" max="6" value="2" data-k="a"><input type="range" id="u2a-b" min="2" max="6" value="3" data-k="b"></label>
      <label>Height: <output data-o="h"></output><input type="range" id="u2a-c" min="1" max="6" value="3" data-k="c"><input type="range" id="u2a-d" min="2" max="6" value="4" data-k="d"></label>
      <p class="muted small">Top slider = numerator, bottom slider = denominator.</p>
      <div class="readout" data-r></div></div></div>`;
    const st = { a: 2, b: 3, c: 3, d: 4 };
    const draw = () => {
      if (st.a > st.b) st.a = st.b;
      if (st.c > st.d) st.c = st.d;
      el.querySelector("#u2a-a").value = st.a; el.querySelector("#u2a-c").value = st.c;
      el.querySelector("[data-vis]").innerHTML = V.fracArea(st.a, st.b, st.c, st.d);
      el.querySelector('[data-o="w"]').innerHTML = f(st.a, st.b);
      el.querySelector('[data-o="h"]').innerHTML = f(st.c, st.d);
      const r = R(st.a * st.c, st.b * st.d);
      el.querySelector("[data-r]").innerHTML = `Dark pieces: ${st.a} ${X} ${st.c} = <b>${st.a * st.c}</b><br>Pieces in the square: ${st.b} ${X} ${st.d} = <b>${st.b * st.d}</b><br><span class="big">${f(st.a, st.b)} ${X} ${f(st.c, st.d)} = ${f(st.a * st.c, st.b * st.d)}${r.d !== st.b * st.d ? " = " + fmt(r) : ""}</span>`;
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  window.MQ.addUnit({
    id: "u2", n: 2, title: "Fractions as Quotients and Fraction Multiplication", short: "Fractions as Division", icon: "share", hue: "var(--u2)",
    blurb: "a ÷ b = a/b, fractions of whole numbers, and area with fraction side lengths.",
    bigIdea: `A fraction is also a division: <b>${f("a", "b")} = a ${D} b</b>. Once you see that, finding a fraction <i>of</i> a number and finding the area of a rectangle with fraction sides become the same kind of thinking.`,
    lessons: [
      {
        id: "l1", title: "Fractions are division", slides: [
          { t: "learn", title: "Sharing sandwiches", body: `<p>3 sandwiches are shared equally by 4 kids. How much does each kid get?</p><div class="vis-row">${V.sharing(3, 4)}</div><p>Cut every sandwich into 4 equal pieces. Each kid gets one piece from each sandwich: 3 pieces of size ${f(1, 4)}. That's ${f(3, 4)} of a sandwich.</p><p class="formula">3 ${D} 4 = ${f(3, 4)}</p>` },
          { t: "play", title: "Try your own sharing", body: `<p>Change how many things there are and how many people share them.</p>`, widget: sharePlay },
          { t: "learn", title: "The fraction bar means ÷", body: `<p class="formula">${f("a", "b")} = a ${D} b</p><p>When there are more things than people, each share is more than 1 whole:</p><p class="formula">7 ${D} 3 = ${f(7, 3)} = ${U.mixed(2, 1, 3)}</p><p>Each person gets 2 whole ones and ${f(1, 3)} more.</p>`, tip: `${f(7, 3)} is between 2 and 3, because 3 ${X} 2 = 6 and 3 ${X} 3 = 9.` },
          { t: "check", skill: "quotient", d: 1 },
          { t: "check", skill: "quotient", d: 2 },
          { t: "check", skill: "quotient", d: 3 },
        ],
      },
      {
        id: "l2", title: "Fraction of a whole number", slides: [
          { t: "learn", title: "Use a tape diagram", body: `<p>What is ${f(2, 3)} of 12?</p><div class="vis-row">${V.tape(3, 2, { total: "12", partLabel: "4", shadeLabel: "8" })}</div><ol class="steps"><li>Split 12 into 3 equal parts: 12 ${D} 3 = 4.</li><li>Take 2 of those parts: 2 ${X} 4 = <b>8</b>.</li></ol><p>"${f(2, 3)} of 12" means the same as <b>${f(2, 3)} ${X} 12</b>.</p>` },
          { t: "play", title: "Build a tape diagram", body: `<p>Change the fraction and the size of each part.</p>`, widget: tapePlay },
          { t: "check", skill: "fracOfWhole", d: 1 },
          { t: "check", skill: "fracOfWhole", d: 2 },
          { t: "learn", title: "When it doesn't divide evenly", body: `<p>${f(2, 3)} ${X} 5 = ?</p><p>5 doesn't split evenly into 3 parts, and that's fine:</p><p class="formula">${f(2, 3)} ${X} 5 = ${f(`2 ${X} 5`, 3)} = ${f(10, 3)} = ${U.mixed(3, 1, 3)}</p><p>Multiply the whole number by the numerator and keep the denominator.</p>`, tip: `Divide first when you can. ${f(3, 8)} ${X} 40: 40 ${D} 8 = 5, then 3 ${X} 5 = 15. Smaller numbers mean fewer mistakes.` },
          { t: "check", skill: "fracOfWhole", d: 3 },
          { t: "check", skill: "fracOfWhole", d: 4 },
        ],
      },
      {
        id: "l3", title: "Area with fraction side lengths", slides: [
          { t: "learn", title: "Inside one square unit", body: `<p>This square is 1 unit by 1 unit, so its area is 1 square unit.</p><div class="vis-row">${V.fracArea(1, 3, 1, 4)}</div><p>Cut it into 3 columns and 4 rows and you get 12 equal pieces. The darkest piece is ${f(1, 3)} unit wide and ${f(1, 4)} unit tall. Its area is <b>${f(1, 12)}</b> square unit.</p><p class="formula">${f(1, 3)} ${X} ${f(1, 4)} = ${f(1, 12)}</p>` },
          { t: "check", skill: "areaUnit", d: 2 },
          { t: "learn", title: "Bigger fraction rectangles", body: `<div class="vis-row">${V.fracArea(2, 3, 3, 4)}</div><p>The dark rectangle is ${f(2, 3)} by ${f(3, 4)}. It covers 2 ${X} 3 = <b>6</b> pieces, and the square has 3 ${X} 4 = <b>12</b> pieces.</p><p class="formula">${f(2, 3)} ${X} ${f(3, 4)} = ${f(6, 12)} = ${f(1, 2)}</p><p>Numerator ${X} numerator, over denominator ${X} denominator. The picture shows you <i>why</i>.</p>` },
          { t: "play", title: "Make your own rectangle", body: `<p>Set the width and height fractions. Count the pieces.</p>`, widget: areaPlay },
          { t: "check", skill: "areaFrac", d: 3 },
          { t: "check", skill: "areaFrac", d: 4 },
        ],
      },
      {
        id: "l4", title: "Mixed number side lengths", slides: [
          { t: "learn", title: "Partial products", body: `<p>A rectangle is ${U.mixed(2, 1, 2)} ft by 4 ft. Split the long side into 2 and ${f(1, 2)}.</p><div class="vis-row">${V.areaModel([{ w: 2, label: "2" }, { w: 0.5, label: "1/2" }], [{ w: 1, label: "4" }], [["2 × 4 = 8", "½ × 4 = 2"]], { h: 90 })}</div><p class="formula">8 + 2 = 10 square feet</p>` },
          { t: "check", skill: "mixedArea", d: 4 },
          { t: "check", skill: "word", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "quotient", name: "Fractions as division", min: 1, max: 5, gen: quotient },
      { id: "fracOfWhole", name: "Fraction × whole number", min: 1, max: 5, gen: fracOfWhole },
      { id: "areaUnit", name: "Area of unit-fraction rectangles", min: 2, max: 3, gen: areaUnit },
      { id: "areaFrac", name: "Area with fraction sides", min: 3, max: 5, gen: areaFrac },
      { id: "mixedArea", name: "Area with mixed numbers", min: 4, max: 5, gen: mixedArea },
      { id: "word", name: "Fraction story problems", min: 3, max: 5, gen: word },
    ],
  });
})();
