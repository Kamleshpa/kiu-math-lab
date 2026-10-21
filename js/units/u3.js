/* Unit 3 · Multiplying and Dividing Fractions */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, R, f, fmt, mul } = U;
  const X = "&times;", D = "&divide;";

  // a whole bar cut into `a` parts; the first part is cut into `n` slivers, one highlighted
  const splitBar = (a, n) => {
    const W = 330, H = 46, x0 = 10, y0 = 10, pw = W / a;
    let g = "";
    for (let i = 0; i < a; i++) g += `<rect x="${x0 + i * pw}" y="${y0}" width="${pw}" height="${H}" class="${i === 0 ? "onlyA cell" : "unsh"}"/>`;
    for (let j = 0; j < n; j++) g += `<rect x="${x0 + (j * pw) / n}" y="${y0}" width="${pw / n}" height="${H}" class="cell ${j === 0 ? "both" : "onlyA"}"/>`;
    g += `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="outline"/>`;
    g += V.text(x0 + pw / 2, y0 + H + 16, `1/${a}`, "lbl sm");
    g += V.text(x0 + W, y0 + H + 16, "1 whole", "lbl sm", "end");
    return V.svg(W + 20, H + 34, g, { label: `one ${a}th split into ${n} parts` });
  };
  const jumpsLine = (n, a) => V.numberLine({
    min: 0, max: n, denom: a, w: Math.min(440, 90 * n + 60),
    jumps: Array.from({ length: n * a }, (_, i) => [i / a, (i + 1) / a]),
    tickLabels: (v, i) => (i % a === 0 ? String(v) : null),
  });

  /* ---------------- skills ---------------- */
  const fxf = (d) => {
    let a, b, c, e;
    if (d === 1) { a = 1; c = 1; b = ri(2, 6); e = ri(2, 6); }
    else if (d === 2) { b = ri(2, 7); e = ri(2, 7); a = ri(1, b - 1); c = ri(1, e - 1); }
    else if (d === 3) { b = pick([4, 6, 8, 9, 10]); e = pick([3, 4, 5, 6]); a = ri(2, b - 1); c = ri(2, e - 1); }
    else { b = pick([6, 8, 9, 10, 12]); e = pick([5, 6, 8, 9, 12]); a = ri(3, b - 1); c = ri(2, e - 1); }
    if (a >= b || c >= e) return fxf(d);
    if (d === 5) {
      const n = ri(2, 6);
      const ans = mul(mul(R(a, b), R(c, e)), R(n, 1));
      return {
        prompt: `${f(a, b)} ${X} ${f(c, e)} ${X} ${n} = ?`, kind: "num", answer: ans,
        hint: `Multiply all the numerators, then all the denominators. Simplify before you multiply if a top number and a bottom number share a factor.`,
        steps: [`Numerators: ${a} ${X} ${c} ${X} ${n} = ${a * c * n}`, `Denominators: ${b} ${X} ${e} = ${b * e}`, `${f(a * c * n, b * e)} = <b>${fmt(ans)}</b>`],
      };
    }
    const ans = R(a * c, b * e);
    return {
      prompt: `${f(a, b)} ${X} ${f(c, e)} = ?`,
      visual: d <= 2 ? V.fracArea(a, b, c, e) : "",
      kind: "num", answer: ans,
      hint: d <= 2 ? `Look at the area model: count the darkest pieces and the total pieces.` : `Multiply numerators, multiply denominators. Then simplify.`,
      steps: [`${f(a, b)} ${X} ${f(c, e)} = ${f(`${a} ${X} ${c}`, `${b} ${X} ${e}`)} = ${f(a * c, b * e)}`, ...(ans.d !== b * e ? [`Simplify: divide top and bottom by ${U.gcd(a * c, b * e)} to get <b>${fmt(ans)}</b>`] : [`Answer: <b>${fmt(ans)}</b>`])],
    };
  };

  const mixedMult = (d) => {
    const w = ri(1, d >= 5 ? 5 : 3), b = pick([2, 3, 4, 5]), a = ri(1, b - 1);
    const m = R(w * b + a, b);
    if (d <= 3 || Math.random() < 0.4) {
      const n = ri(2, 6);
      const ans = mul(m, R(n, 1));
      return {
        prompt: `${n} ${X} ${U.mixed(w, a, b)} = ?`, kind: "num", answer: ans,
        hint: `Break apart ${U.mixed(w, a, b)} into ${w} + ${f(a, b)}. Multiply each part by ${n} and add.`,
        steps: [`${n} ${X} ${w} = ${n * w}`, `${n} ${X} ${f(a, b)} = ${fmt(R(n * a, b))}`, `${n * w} + ${fmt(R(n * a, b))} = <b>${fmt(ans)}</b>`],
      };
    }
    const e = pick([2, 3, 4, 5, 6]), c = ri(1, e - 1);
    const ans = mul(m, R(c, e));
    return {
      prompt: `${U.mixed(w, a, b)} ${X} ${f(c, e)} = ?`, kind: "num", answer: ans,
      hint: `Rewrite ${U.mixed(w, a, b)} as an improper fraction: ${f(w * b + a, b)}. Then multiply.`,
      steps: [`${U.mixed(w, a, b)} = ${f(w * b + a, b)}`, `${f(w * b + a, b)} ${X} ${f(c, e)} = ${f((w * b + a) * c, b * e)}`, `= <b>${fmt(ans)}</b>`],
    };
  };

  const scaling = (d) => {
    const n = ri(6, 60);
    const kind = pick(["lt", "gt", "eq", "lt", "gt"]);
    let fr;
    if (kind === "lt") { const b = ri(3, 9); fr = [ri(1, b - 1), b]; }
    else if (kind === "gt") { const b = ri(2, 6); fr = [ri(b + 1, 2 * b + 3), b]; }
    else { const b = ri(2, 9); fr = [b, b]; }
    const order = ["greater than", "less than", "equal to"];
    if (d >= 4 && Math.random() < 0.5) {
      // which product is greatest
      const b = ri(3, 8);
      const opts = [[b - 1, b], [b + 1, b], [b, b], [1, b]];
      const correct = `${f(opts[1][0], opts[1][1])} ${X} ${n}`;
      const o = mc(correct, opts.filter((_, i) => i !== 1).map((o2) => `${f(o2[0], o2[1])} ${X} ${n}`));
      return {
        prompt: `Without calculating, which product is the <b>greatest</b>?`, ...o,
        hint: `Every choice multiplies ${n} by something. Which factor is greater than 1?`,
        steps: [`${f(b + 1, b)} is greater than 1, so it makes ${n} bigger.`, `${f(b, b)} = 1 keeps ${n} the same. ${f(b - 1, b)} and ${f(1, b)} are less than 1, so they make ${n} smaller.`, `Greatest: <b>${correct}</b>`],
      };
    }
    const ansText = kind === "lt" ? "less than" : kind === "gt" ? "greater than" : "equal to";
    const choices = order.map((o) => `${o} ${n}`);
    return {
      prompt: `Without calculating: ${f(fr[0], fr[1])} ${X} ${n} is …`,
      kind: "mc", choices, answer: order.indexOf(ansText),
      hint: `Compare ${f(fr[0], fr[1])} with 1. Multiplying by a number less than 1 shrinks; greater than 1 grows; equal to 1 stays the same.`,
      steps: [`${f(fr[0], fr[1])} is ${kind === "lt" ? "less than 1" : kind === "gt" ? "greater than 1" : "equal to 1"}.`, `So ${f(fr[0], fr[1])} ${X} ${n} is <b>${ansText} ${n}</b>.`],
    };
  };

  const unitDivWhole = (d) => {
    const a = ri(2, d >= 3 ? 8 : 5), n = ri(2, d >= 3 ? 8 : 4);
    if (d >= 3 && Math.random() < 0.5) {
      const ctx = pick([
        `${f(1, a)} of a pan of brownies is shared equally by ${n} friends. What fraction of the whole pan does each friend get?`,
        `${U.name()} has ${f(1, a)} pound of trail mix and splits it into ${n} equal bags. How many pounds are in each bag?`,
        `A ${f(1, a)}-mile path is split into ${n} equal sections. How long is each section in miles?`,
      ]);
      return {
        prompt: ctx, kind: "num", answer: R(1, a * n),
        hint: `This is ${f(1, a)} ${D} ${n}. Picture ${f(1, a)} cut into ${n} equal pieces.`,
        steps: [`${f(1, a)} ${D} ${n}`, `Cutting each ${f(1, a)} into ${n} pieces makes ${a} ${X} ${n} = ${a * n} pieces in the whole.`, `So each piece is <b>${f(1, a * n)}</b>.`],
      };
    }
    return {
      prompt: `${f(1, a)} ${D} ${n} = ?`,
      visual: d <= 2 ? splitBar(a, n) : "",
      kind: "num", answer: R(1, a * n),
      hint: `Split ${f(1, a)} into ${n} equal parts. How many of those tiny parts would fill the whole?`,
      steps: [`If every ${f(1, a)} is cut into ${n} pieces, the whole has ${a} ${X} ${n} = ${a * n} pieces.`, `${f(1, a)} ${D} ${n} = <b>${f(1, a * n)}</b>`, `Check: ${n} ${X} ${f(1, a * n)} = ${f(n, a * n)} = ${f(1, a)} ✓`],
    };
  };

  const wholeDivUnit = (d) => {
    const n = ri(2, d >= 3 ? 9 : 4), a = ri(2, d >= 3 ? 8 : 4);
    if (d >= 3 && Math.random() < 0.5) {
      const ctx = pick([
        [`${U.name()} has ${n} cups of flour. A batch of muffins needs ${f(1, a)} cup. How many batches can be made?`, "batches"],
        [`A ${n}-meter rope is cut into pieces that are each ${f(1, a)} meter long. How many pieces are there?`, "pieces"],
        [`Each serving of rice is ${f(1, a)} cup. How many servings are in ${n} cups?`, "servings"],
      ]);
      return {
        prompt: ctx[0], kind: "num", answer: n * a, suffix: ctx[1],
        hint: `How many ${f(1, a)}s fit into ${n}? There are ${a} in each whole.`,
        steps: [`${n} ${D} ${f(1, a)}`, `Each whole has ${a} pieces of size ${f(1, a)}.`, `${n} ${X} ${a} = <b>${n * a}</b> ${ctx[1]}`],
      };
    }
    return {
      prompt: `${n} ${D} ${f(1, a)} = ?`,
      visual: d <= 2 ? jumpsLine(n, a) : "",
      kind: "num", answer: n * a,
      hint: `Ask: how many ${f(1, a)}s fit into ${n}? Count the jumps.`,
      steps: [`There are ${a} jumps of ${f(1, a)} in each whole.`, `${n} wholes ${X} ${a} = <b>${n * a}</b>`, `Check: ${n * a} ${X} ${f(1, a)} = ${n} ✓`],
    };
  };

  const divWord = (d) => {
    const which = pick(["expr", "expr", "two"]);
    const a = ri(2, 6), n = ri(2, 8);
    if (which === "expr") {
      const t = pick([0, 1, 2]);
      const stories = [
        [`${n} pounds of grapes are put into bags that each hold ${f(1, a)} pound. How many bags are filled?`, `${n} ${D} ${f(1, a)}`],
        [`${f(1, a)} of a pizza is shared equally by ${n} kids. How much of the pizza does each kid get?`, `${f(1, a)} ${D} ${n}`],
        [`${U.name()} eats ${f(1, a)} of a ${n}-ounce bag of nuts. How many ounces is that?`, `${f(1, a)} ${X} ${n}`],
      ];
      const [st, ex] = stories[t];
      const all = [`${n} ${D} ${f(1, a)}`, `${f(1, a)} ${D} ${n}`, `${f(1, a)} ${X} ${n}`, `${n} &minus; ${f(1, a)}`];
      const o = mc(ex, all.filter((x) => x !== ex));
      return {
        prompt: `Which expression matches the story?<br><span class="story">${st}</span>`, ...o,
        hint: t === 0 ? `Are you finding how many groups of ${f(1, a)} fit?` : t === 1 ? `Something less than 1 is being split into equal shares.` : `"${f(1, a)} of" something means multiply.`,
        steps: [t === 0 ? `We want how many ${f(1, a)}-pound bags fit in ${n} pounds. That is division: ${ex}.` : t === 1 ? `${f(1, a)} of a pizza is being shared by ${n} kids, so we divide ${f(1, a)} into ${n} parts.` : `"${f(1, a)} of ${n}" means ${f(1, a)} ${X} ${n}.`, `Answer: <b>${ex}</b>`],
      };
    }
    // two-step
    const k = ri(2, Math.min(5, n * a - 1));
    return {
      prompt: `A recipe uses ${f(1, a)} cup of oil per batch. ${U.name()} has ${n} cups of oil and wants to make ${k} batches. How many cups of oil will be left?`,
      kind: "num", answer: U.sub(R(n, 1), R(k, a)), suffix: "cups",
      hint: `First find how much oil ${k} batches use: ${k} ${X} ${f(1, a)}.`,
      steps: [`Oil used: ${k} ${X} ${f(1, a)} = ${fmt(R(k, a))} cups`, `Left: ${n} &minus; ${fmt(R(k, a))} = <b>${fmt(U.sub(R(n, 1), R(k, a)))}</b> cups`],
    };
  };

  /* ---------------- widgets ---------------- */
  const scalePlay = (el) => {
    el.innerHTML = `<div class="play-grid one"><div class="play-ctl">
      <label>Multiply 12 by <output data-o="s"></output><input type="range" id="u3s" min="0" max="8" value="3" step="1"></label>
      </div><div class="play-vis" data-vis></div><div class="readout" data-r></div></div>`;
    const fr = [[0, 1], [1, 4], [1, 2], [3, 4], [1, 1], [5, 4], [3, 2], [7, 4], [2, 1]];
    const draw = () => {
      const [a, b] = fr[+el.querySelector("#u3s").value];
      const v = (12 * a) / b;
      const W = 360, base = (12 / 24) * W;
      const g = `<rect x="10" y="10" width="${base}" height="26" class="unsh"/>` + V.text(10 + base / 2, 23, "12", "lbl in") +
        `<rect x="10" y="48" width="${(v / 24) * W}" height="26" class="sh"/>` + V.text(10 + Math.max(16, (v / 24) * W / 2), 61, U.num(v), "lbl in") +
        `<line x1="${10 + base}" y1="4" x2="${10 + base}" y2="82" class="dash"/>`;
      el.querySelector("[data-vis]").innerHTML = V.svg(W + 20, 86, g, { label: "scaling bar" });
      el.querySelector('[data-o="s"]').innerHTML = b === 1 ? a : f(a, b);
      const cmp = a < b ? "less than 1, so the product is <b>smaller</b> than 12" : a > b ? "greater than 1, so the product is <b>bigger</b> than 12" : "exactly 1, so the product <b>stays</b> 12";
      el.querySelector("[data-r]").innerHTML = `${b === 1 ? a : f(a, b)} is ${cmp}.<br><span class="big">${b === 1 ? a : f(a, b)} ${X} 12 = ${U.num(v)}</span>`;
    };
    el.querySelector("input").addEventListener("input", draw);
    draw();
  };

  const jumpPlay = (el) => {
    el.innerHTML = `<div class="play-grid one"><div class="play-ctl">
      <label>Whole number <output data-o="n">3</output><input type="range" id="u3j-n" min="1" max="5" value="3" data-k="n"></label>
      <label>Size of each jump: 1/<output data-o="a">4</output><input type="range" id="u3j-a" min="2" max="6" value="4" data-k="a"></label>
      </div><div class="play-vis" data-vis></div><div class="readout" data-r></div></div>`;
    const st = { n: 3, a: 4 };
    const draw = () => {
      el.querySelector("[data-vis]").innerHTML = jumpsLine(st.n, st.a);
      el.querySelector("[data-r]").innerHTML = `How many jumps of ${f(1, st.a)} reach ${st.n}? <b>${st.a}</b> jumps per whole ${X} ${st.n} wholes.<br><span class="big">${st.n} ${D} ${f(1, st.a)} = ${st.n * st.a}</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  window.MQ.addUnit({
    id: "u3", n: 3, title: "Multiplying and Dividing Fractions", short: "× and ÷ Fractions", icon: "fracx", hue: "var(--u3)",
    blurb: "Fraction × fraction, scaling, and dividing with unit fractions.",
    bigIdea: `Multiplying by a fraction less than 1 <b>shrinks</b> a number. Dividing a whole number by a unit fraction asks <b>"how many pieces fit?"</b>, and the answer is bigger than you started with.`,
    lessons: [
      {
        id: "l1", title: "Multiplying fractions", slides: [
          { t: "learn", title: "Fraction of a fraction", body: `<p>${f(1, 2)} of ${f(1, 3)} of a pan of cornbread: how much of the whole pan is that?</p><div class="vis-row">${V.fracArea(1, 2, 1, 3)}</div><p>The pan is cut into 2 ${X} 3 = 6 pieces, and we have 1 of them.</p><p class="formula">${f(1, 2)} ${X} ${f(1, 3)} = ${f(1, 6)}</p>` },
          { t: "learn", title: "The rule, and why it works", body: `<p class="formula">${f("a", "b")} ${X} ${f("c", "d")} = ${f("a × c", "b × d")}</p><p>The top numbers count the dark pieces. The bottom numbers count all the pieces in the whole.</p><p>${f(2, 3)} ${X} ${f(4, 5)} = ${f(8, 15)}</p>` },
          { t: "check", skill: "fxf", d: 1 },
          { t: "check", skill: "fxf", d: 2 },
          { t: "learn", title: "Shortcut: simplify first", body: `<p>${f(3, 8)} ${X} ${f(4, 9)}: before multiplying, notice 3 and 9 share a factor of 3, and 4 and 8 share a factor of 4.</p><p class="formula">${f("<s>3</s> 1", "<s>8</s> 2")} ${X} ${f("<s>4</s> 1", "<s>9</s> 3")} = ${f(1, 6)}</p><p>Same answer as ${f(12, 72)}, with much smaller numbers.</p>`, tip: `You can cancel a top number with ANY bottom number when you're multiplying.` },
          { t: "check", skill: "fxf", d: 3 },
          { t: "learn", title: "Mixed numbers", body: `<p>Two ways to find 3 ${X} ${U.mixed(2, 1, 4)}:</p><ol class="steps"><li><b>Break apart:</b> 3 ${X} 2 = 6 and 3 ${X} ${f(1, 4)} = ${f(3, 4)}, so the total is ${U.mixed(6, 3, 4)}.</li><li><b>Improper fraction:</b> ${U.mixed(2, 1, 4)} = ${f(9, 4)}, and 3 ${X} ${f(9, 4)} = ${f(27, 4)} = ${U.mixed(6, 3, 4)}.</li></ol>` },
          { t: "check", skill: "mixedMult", d: 3 },
        ],
      },
      {
        id: "l2", title: "Multiplication as scaling", slides: [
          { t: "learn", title: "Does it grow or shrink?", body: `<p>You can predict the size of a product <b>without calculating</b>:</p><ul><li>${X} a number <b>less than 1</b> → the result gets smaller</li><li>${X} <b>exactly 1</b> → the result stays the same</li><li>${X} a number <b>greater than 1</b> → the result gets bigger</li></ul>` },
          { t: "play", title: "Stretch and squish", body: `<p>Slide to change the scale factor. Watch the bar.</p>`, widget: scalePlay },
          { t: "check", skill: "scaling", d: 2 },
          { t: "check", skill: "scaling", d: 4 },
        ],
      },
      {
        id: "l3", title: "Unit fraction ÷ whole number", slides: [
          { t: "learn", title: "Sharing a piece", body: `<p>${f(1, 3)} of a cake is shared equally by 2 friends. How much of the whole cake does each friend get?</p><div class="vis-row">${splitBar(3, 2)}</div><p>Cut each third in half and the whole cake now has 6 pieces. Each friend gets 1 of them.</p><p class="formula">${f(1, 3)} ${D} 2 = ${f(1, 6)}</p>` },
          { t: "learn", title: "Check with multiplication", body: `<p>Division and multiplication undo each other:</p><p class="formula">${f(1, 3)} ${D} 2 = ${f(1, 6)} &nbsp; because &nbsp; 2 ${X} ${f(1, 6)} = ${f(2, 6)} = ${f(1, 3)}</p><p>Dividing ${f(1, 3)} by 2 is the same as finding ${f(1, 2)} of ${f(1, 3)}.</p>`, tip: `Dividing a unit fraction by a whole number makes the piece smaller, so the denominator gets bigger.` },
          { t: "check", skill: "unitDivWhole", d: 1 },
          { t: "check", skill: "unitDivWhole", d: 3 },
        ],
      },
      {
        id: "l4", title: "Whole number ÷ unit fraction", slides: [
          { t: "learn", title: "How many fit?", body: `<p>How many ${f(1, 4)}-cup scoops are in 3 cups?</p><div class="vis-row">${jumpsLine(3, 4)}</div><p>Each cup holds 4 scoops, so 3 cups hold 3 ${X} 4 = 12 scoops.</p><p class="formula">3 ${D} ${f(1, 4)} = 12</p>` },
          { t: "play", title: "Jump along the line", body: `<p>Change the whole number and the jump size.</p>`, widget: jumpPlay },
          { t: "check", skill: "wholeDivUnit", d: 1 },
          { t: "check", skill: "wholeDivUnit", d: 3 },
          { t: "learn", title: "Which operation?", body: `<ul><li><b>"How many ${f(1, 4)}s fit in 5?"</b> → 5 ${D} ${f(1, 4)}</li><li><b>"${f(1, 4)} shared by 5 people"</b> → ${f(1, 4)} ${D} 5</li><li><b>"${f(1, 4)} of 5"</b> → ${f(1, 4)} ${X} 5</li></ul><p>Draw a quick picture if you're not sure. Then check: does the answer make sense? Should it be bigger or smaller?</p>` },
          { t: "check", skill: "divWord", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "fxf", name: "Fraction × fraction", min: 1, max: 5, gen: fxf },
      { id: "mixedMult", name: "Multiplying mixed numbers", min: 3, max: 5, gen: mixedMult },
      { id: "scaling", name: "Multiplication as scaling", min: 2, max: 4, gen: scaling },
      { id: "unitDivWhole", name: "Unit fraction ÷ whole", min: 1, max: 5, gen: unitDivWhole },
      { id: "wholeDivUnit", name: "Whole ÷ unit fraction", min: 1, max: 5, gen: wholeDivUnit },
      { id: "divWord", name: "Which operation? Story problems", min: 3, max: 5, gen: divWord },
    ],
  });
})();
