/* Unit 6 · More Decimal and Fraction Operations */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, R, f, fmt, add, sub } = U;
  const X = "&times;", D = "&divide;";

  // a/b bar and c/d bar; optional re-cut lines at a common denominator
  const twoBars = (a, b, c, d, common) => {
    const W = 330, H = 34, x0 = 54;
    let g = "";
    const bar = (y, n, den, cls, lab) => {
      for (let i = 0; i < den; i++) g += `<rect x="${x0 + (i * W) / den}" y="${y}" width="${W / den}" height="${H}" class="${i < n ? cls : "unsh"}"/>`;
      if (common) for (let i = 1; i < common; i++) g += `<line x1="${x0 + (i * W) / common}" y1="${y}" x2="${x0 + (i * W) / common}" y2="${y + H}" class="dash"/>`;
      g += `<rect x="${x0}" y="${y}" width="${W}" height="${H}" class="outline"/>` + V.text(x0 - 10, y + H / 2, lab, "lbl", "end");
    };
    bar(6, a, b, "sh", `${a}/${b}`);
    bar(50, c, d, "sh2", `${c}/${d}`);
    return V.svg(W + x0 + 12, 92, g, { label: "fraction bars" });
  };

  /* ---------------- skills ---------------- */
  const CONV = [
    { big: "m", small: "cm", k: 100, kind: "length" }, { big: "km", small: "m", k: 1000, kind: "length" },
    { big: "kg", small: "g", k: 1000, kind: "mass" }, { big: "L", small: "mL", k: 1000, kind: "volume" },
    { big: "cm", small: "mm", k: 10, kind: "length" }, { big: "ft", small: "in", k: 12, kind: "length" },
    { big: "yd", small: "ft", k: 3, kind: "length" }, { big: "lb", small: "oz", k: 16, kind: "weight" },
    { big: "gal", small: "qt", k: 4, kind: "capacity" }, { big: "hr", small: "min", k: 60, kind: "time" },
  ];
  const metric = CONV.slice(0, 5);
  const convert = (d) => {
    if (d <= 2) {
      const c = pick(CONV), n = ri(2, 12);
      if (d === 1)
        return {
          prompt: `${n} ${c.big} = ? ${c.small}`, kind: "num", answer: n * c.k, suffix: c.small,
          hint: `1 ${c.big} = ${c.k} ${c.small}. Going from a bigger unit to a smaller unit, you need MORE of them, so multiply.`,
          steps: [`1 ${c.big} = ${c.k} ${c.small}`, `${n} ${X} ${c.k} = <b>${U.num(n * c.k)}</b> ${c.small}`],
        };
      return {
        prompt: `${U.num(n * c.k)} ${c.small} = ? ${c.big}`, kind: "num", answer: n, suffix: c.big,
        hint: `Going from a smaller unit to a bigger unit, you need FEWER of them, so divide by ${c.k}.`,
        steps: [`1 ${c.big} = ${c.k} ${c.small}`, `${U.num(n * c.k)} ${D} ${c.k} = <b>${n}</b> ${c.big}`],
      };
    }
    if (d === 3) {
      const c = pick(metric);
      const places = Math.round(Math.log10(c.k));
      const n = ri(11, 99) * (Math.random() < 0.5 ? 1 : 10) + 0;
      if (Math.random() < 0.5) {
        const big = U.R(n, 10);
        return {
          prompt: `${U.num(n / 10)} ${c.big} = ? ${c.small}`, kind: "num", answer: U.mul(big, R(c.k)), suffix: c.small,
          hint: `Multiply by ${U.num(c.k)}: move every digit ${places} place${places > 1 ? "s" : ""} to the left.`,
          steps: [`${U.num(n / 10)} ${X} ${U.num(c.k)} = <b>${U.num((n / 10) * c.k)}</b> ${c.small}`],
        };
      }
      return {
        prompt: `${U.num(n)} ${c.small} = ? ${c.big}`, kind: "num", answer: R(n, c.k), show: "dec", suffix: c.big,
        hint: `Divide by ${U.num(c.k)}: move every digit ${places} place${places > 1 ? "s" : ""} to the right.`,
        steps: [`${U.num(n)} ${D} ${U.num(c.k)} = <b>${U.num(n / c.k)}</b> ${c.big}`],
      };
    }
    if (d === 4) {
      const c = pick(CONV.slice(5));
      const a = ri(2, 9), b = ri(1, c.k - 1);
      return {
        prompt: `${a} ${c.big} ${b} ${c.small} = ? ${c.small}`, kind: "num", answer: a * c.k + b, suffix: c.small,
        hint: `Change the ${c.big} into ${c.small} first, then add the extra ${b} ${c.small}.`,
        steps: [`${a} ${c.big} = ${a} ${X} ${c.k} = ${a * c.k} ${c.small}`, `${a * c.k} + ${b} = <b>${a * c.k + b}</b> ${c.small}`],
      };
    }
    const t = pick(["ribbon", "water", "run"]);
    if (t === "ribbon") {
      const m = ri(2, 6), pieces = pick([4, 5, 8, 10]);
      const each = (m * 100) / pieces;
      return {
        prompt: `${U.name()} cuts a ${m}-meter ribbon into ${pieces} equal pieces. How many <b>centimeters</b> long is each piece?`,
        kind: "num", answer: U.toRat(each), show: "dec", suffix: "cm",
        hint: `Change meters to centimeters first: ${m} m = ${m * 100} cm.`,
        steps: [`${m} m = ${m * 100} cm`, `${m * 100} ${D} ${pieces} = <b>${U.num(each)}</b> cm`],
      };
    }
    if (t === "water") {
      const ml = pick([250, 350, 500, 750]), glasses = ri(2, Math.floor(3000 / ml));
      return {
        prompt: `A pitcher holds 3 liters. ${U.name()} pours out ${glasses} glasses of ${ml} mL each. How many mL are left in the pitcher?`,
        kind: "num", answer: 3000 - glasses * ml, suffix: "mL",
        hint: `3 liters = 3,000 mL. How much was poured out?`,
        steps: [`Poured: ${glasses} ${X} ${ml} = ${U.num(glasses * ml)} mL`, `3,000 &minus; ${U.num(glasses * ml)} = <b>${U.num(3000 - glasses * ml)}</b> mL`],
      };
    }
    const laps = ri(4, 12), yd = pick([100, 200, 400]);
    return {
      prompt: `${U.name()} swims ${laps} laps. Each lap is ${yd} yards. How many <b>feet</b> is that?`,
      kind: "num", answer: laps * yd * 3, suffix: "feet",
      hint: `Find the total yards, then remember 1 yard = 3 feet.`,
      steps: [`${laps} ${X} ${yd} = ${U.num(laps * yd)} yards`, `${U.num(laps * yd)} ${X} 3 = <b>${U.num(laps * yd * 3)}</b> feet`],
    };
  };

  const pairDen = (d) => {
    if (d === 1) { const b = pick([2, 3, 4, 5]), m = pick([2, 3]); return [b, b * m]; }
    const opts = [[2, 3], [3, 4], [2, 5], [4, 5], [3, 5], [4, 6], [6, 8], [3, 8], [5, 6], [6, 9], [4, 10], [8, 12]];
    return pick(opts);
  };
  const addFrac = (d) => {
    let [b, e] = pairDen(d);
    if (Math.random() < 0.5) [b, e] = [e, b];
    if (d <= 3) {
      const a = ri(1, b - 1), c = ri(1, e - 1);
      const L = U.lcm(b, e), ans = add(R(a, b), R(c, e));
      return {
        prompt: `${f(a, b)} + ${f(c, e)} = ?`, visual: d <= 2 ? twoBars(a, b, c, e, L) : "",
        kind: "num", answer: ans,
        hint: `The pieces are different sizes. Rewrite both fractions with denominator ${L}.`,
        steps: [`${f(a, b)} = ${f(a * (L / b), L)} and ${f(c, e)} = ${f(c * (L / e), L)}`, `${f(a * (L / b), L)} + ${f(c * (L / e), L)} = ${f(a * (L / b) + c * (L / e), L)}`, `= <b>${fmt(ans)}</b>`],
      };
    }
    const w1 = ri(1, 6), w2 = ri(1, 5), a = ri(1, b - 1), c = ri(1, e - 1);
    if (d === 5) {
      const g = pick([2, 3, 4]), h = ri(1, g - 1);
      const ans = add(add(R(a, b), R(c, e)), R(h, g));
      const L = U.lcm(U.lcm(b, e), g);
      return {
        prompt: `${f(a, b)} + ${f(c, e)} + ${f(h, g)} = ?`, kind: "num", answer: ans,
        hint: `Find one denominator that works for ${b}, ${e} and ${g}. Try ${L}.`,
        steps: [`Rewrite with denominator ${L}: ${f(a * (L / b), L)} + ${f(c * (L / e), L)} + ${f(h * (L / g), L)}`, `= ${f(a * (L / b) + c * (L / e) + h * (L / g), L)} = <b>${fmt(ans)}</b>`],
      };
    }
    const A = add(R(w1), R(a, b)), B = add(R(w2), R(c, e)), ans = add(A, B);
    const L = U.lcm(b, e);
    const fs = a * (L / b) + c * (L / e);
    return {
      prompt: `${U.mixed(w1, a, b)} + ${U.mixed(w2, c, e)} = ?`, kind: "num", answer: ans,
      hint: `Add the whole numbers. Add the fractions using a common denominator. If the fractions add to more than 1, regroup.`,
      steps: [`Wholes: ${w1} + ${w2} = ${w1 + w2}`, `Fractions: ${f(a * (L / b), L)} + ${f(c * (L / e), L)} = ${f(fs, L)}${fs >= L ? ` = ${fmt(R(fs, L))}` : ""}`, `Total: <b>${fmt(ans)}</b>`],
    };
  };

  const subFrac = (d) => {
    let [b, e] = pairDen(d);
    if (d <= 3) {
      let a = ri(1, b - 1), c = ri(1, e - 1);
      if (a / b === c / e) return subFrac(d);
      if (a / b < c / e) { [a, c] = [c, a]; [b, e] = [e, b]; }
      const L = U.lcm(b, e), ans = sub(R(a, b), R(c, e));
      return {
        prompt: `${f(a, b)} &minus; ${f(c, e)} = ?`, visual: d <= 2 ? twoBars(a, b, c, e, L) : "", kind: "num", answer: ans,
        hint: `Rewrite both fractions with the same denominator (${L}), then subtract the numerators.`,
        steps: [`${f(a, b)} = ${f(a * (L / b), L)} and ${f(c, e)} = ${f(c * (L / e), L)}`, `${f(a * (L / b), L)} &minus; ${f(c * (L / e), L)} = ${f(a * (L / b) - c * (L / e), L)} = <b>${fmt(ans)}</b>`],
      };
    }
    const w1 = ri(3, 8), w2 = ri(1, w1 - 1), a = ri(1, b - 1), c = ri(1, e - 1);
    const A = add(R(w1), R(a, b)), B = add(R(w2), R(c, e));
    const ans = sub(A, B);
    const L = U.lcm(b, e);
    const fa = a * (L / b), fc = c * (L / e);
    const regroup = fa < fc;
    return {
      prompt: `${U.mixed(w1, a, b)} &minus; ${U.mixed(w2, c, e)} = ?`, kind: "num", answer: ans,
      hint: regroup ? `${f(fa, L)} is less than ${f(fc, L)}, so trade 1 whole for ${f(L, L)} before subtracting.` : `Use denominator ${L}. Subtract the wholes and the fractions separately.`,
      steps: [
        `Rewrite: ${U.mixed(w1, fa, L)} &minus; ${U.mixed(w2, fc, L)}`,
        ...(regroup ? [`Regroup: ${U.mixed(w1, fa, L)} = ${U.mixed(w1 - 1, fa + L, L)}`] : []),
        `= <b>${fmt(ans)}</b>`,
      ],
    };
  };

  const benchmark = (d) => {
    const pool = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [1, 6], [7, 8], [1, 8], [3, 8], [5, 8]];
    if (d >= 3 && Math.random() < 0.5) {
      const w1 = ri(1, 5), w2 = ri(1, 5), p = pick(pool), q = pick(pool);
      const sum = U.val(add(R(w1 * p[1] + p[0], p[1]), R(w2 * q[1] + q[0], q[1])));
      const near = Math.round(sum);
      const o = mc(String(near), [String(near - 1), String(near + 1), String(w1 + w2)]);
      return {
        prompt: `Estimate: ${U.mixed(w1, p[0], p[1])} + ${U.mixed(w2, q[0], q[1])} is closest to which whole number?`, ...o,
        hint: `Round each mixed number to the nearest whole first. Is each fraction more or less than ${f(1, 2)}?`,
        steps: [`${U.mixed(w1, p[0], p[1])} ≈ ${p[0] / p[1] >= 0.5 ? w1 + 1 : w1}, ${U.mixed(w2, q[0], q[1])} ≈ ${q[0] / q[1] >= 0.5 ? w2 + 1 : w2}`, `The exact sum is about ${U.num(Math.round(sum * 100) / 100)}, so the closest whole number is <b>${near}</b>.`],
      };
    }
    let p, q;
    do { p = pick(pool); q = pick(pool); } while (Math.abs(p[0] / p[1] + q[0] / q[1] - 1) < 0.01);
    const s = p[0] / p[1] + q[0] / q[1];
    const choices = ["more than 1", "less than 1"];
    return {
      prompt: `Without finding the exact answer, is ${f(...p)} + ${f(...q)} more or less than 1?`, kind: "mc", choices, answer: s > 1 ? 0 : 1,
      hint: `Compare each fraction to ${f(1, 2)}. Two fractions bigger than ${f(1, 2)} add to more than 1.`,
      steps: [`${f(...p)} is ${p[0] / p[1] > 0.5 ? "more than" : p[0] / p[1] < 0.5 ? "less than" : "equal to"} ${f(1, 2)}; ${f(...q)} is ${q[0] / q[1] > 0.5 ? "more than" : q[0] / q[1] < 0.5 ? "less than" : "equal to"} ${f(1, 2)}.`, `The sum is <b>${s > 1 ? "more than 1" : "less than 1"}</b>.`],
    };
  };

  const linePlot = (d) => {
    const den = pick([4, 8]);
    const lo = ri(0, 2);
    const N = ri(7, 11);
    const vals = Array.from({ length: N }, () => R(lo * den + ri(1, 2 * den - 1), den));
    const vis = V.linePlot(vals, lo, lo + 2, den, pick(["Lengths of pencils (inches)", "Rainfall (inches)", "Plant heights (feet)"]));
    const sorted = vals.slice().sort((a, b) => U.val(a) - U.val(b));
    const t = d <= 3 ? pick(["count", "diff"]) : pick(["diff", "total", "count"]);
    if (t === "count") {
      const cut = R(lo * den + den, den);
      const k = vals.filter((v) => U.val(v) > U.val(cut)).length;
      return {
        prompt: `How many measurements are <b>greater than</b> ${fmt(cut)}?`, visual: vis, kind: "num", answer: k,
        hint: `Each × is one measurement. Count the ×s to the right of ${fmt(cut)}.`,
        steps: [`Count the ×s to the right of ${fmt(cut)} (not counting any above ${fmt(cut)} itself).`, `There are <b>${k}</b>.`],
      };
    }
    if (t === "diff") {
      const ans = sub(sorted[N - 1], sorted[0]);
      return {
        prompt: `What is the difference between the <b>greatest</b> and the <b>least</b> measurement?`, visual: vis, kind: "num", answer: ans,
        hint: `Find the × farthest right and the × farthest left, then subtract.`,
        steps: [`Greatest: ${fmt(sorted[N - 1])}. Least: ${fmt(sorted[0])}.`, `${fmt(sorted[N - 1])} &minus; ${fmt(sorted[0])} = <b>${fmt(ans)}</b>`],
      };
    }
    const tot = vals.reduce((s, v) => add(s, v), R(0));
    return {
      prompt: `What is the <b>total</b> of all the measurements?`, visual: vis, kind: "num", answer: tot,
      hint: `Add up the value of every ×. Group equal values: (number of ×s) ${X} (value).`,
      steps: [`Add every value: ${vals.slice().sort((a, b) => U.val(a) - U.val(b)).map((v) => U.txt(v)).join(" + ")}`, `Total = <b>${fmt(tot)}</b>`],
    };
  };

  const fracWord = (d) => {
    const t = pick(["walk", "paint", "left"]);
    let [b, e] = pairDen(Math.max(2, d - 1));
    const a = ri(1, b - 1), c = ri(1, e - 1);
    if (t === "walk") {
      const ans = add(R(a, b), R(c, e));
      return {
        prompt: `${U.name()} walked ${f(a, b)} mile to the park and then ${f(c, e)} mile to the library. How far was that in all?`,
        kind: "num", answer: ans, suffix: "miles",
        hint: `Add ${f(a, b)} + ${f(c, e)} using a common denominator.`,
        steps: [`${f(a, b)} + ${f(c, e)} = ${f(a * (U.lcm(b, e) / b), U.lcm(b, e))} + ${f(c * (U.lcm(b, e) / e), U.lcm(b, e))}`, `= <b>${fmt(ans)}</b> miles`],
      };
    }
    if (t === "paint") {
      if (a / b <= c / e) return fracWord(d);
      const ans = sub(R(a, b), R(c, e));
      return {
        prompt: `A can had ${f(a, b)} gallon of paint. ${U.name()} used ${f(c, e)} gallon. How much paint is left?`,
        kind: "num", answer: ans, suffix: "gallon",
        hint: `Subtract ${f(a, b)} &minus; ${f(c, e)} using a common denominator.`,
        steps: [`Common denominator ${U.lcm(b, e)}`, `${f(a, b)} &minus; ${f(c, e)} = <b>${fmt(ans)}</b> gallon`],
      };
    }
    const tot = ri(3, 6);
    const ans = sub(R(tot), add(R(a, b), R(c, e)));
    return {
      prompt: `${U.name()} has ${tot} cups of flour. Bread uses ${f(a, b)} cup and cookies use ${f(c, e)} cup. How much flour is left?`,
      kind: "num", answer: ans, suffix: "cups",
      hint: `First add the flour used. Then subtract from ${tot}.`,
      steps: [`Used: ${f(a, b)} + ${f(c, e)} = ${fmt(add(R(a, b), R(c, e)))}`, `${tot} &minus; ${fmt(add(R(a, b), R(c, e)))} = <b>${fmt(ans)}</b> cups`],
    };
  };

  /* ---------------- widgets ---------------- */
  const commonPlay = (el) => {
    el.innerHTML = `<div class="play-grid one"><div class="play-ctl row2">
      <label>First: <output data-o="f1"></output><input type="range" id="u6c-a" min="1" max="5" value="1" data-k="a"><input type="range" id="u6c-b" min="2" max="6" value="2" data-k="b"></label>
      <label>Second: <output data-o="f2"></output><input type="range" id="u6c-c" min="1" max="5" value="1" data-k="c"><input type="range" id="u6c-d" min="2" max="6" value="3" data-k="d"></label>
      </div><div class="btnrow"><button type="button" class="btn sm" data-cut>Cut into same-size pieces</button></div>
      <div class="play-vis" data-vis></div><div class="readout" data-r></div></div>`;
    const st = { a: 1, b: 2, c: 1, d: 3 };
    let cut = false;
    const draw = () => {
      if (st.a >= st.b) st.a = st.b - 1;
      if (st.c >= st.d) st.c = st.d - 1;
      el.querySelector("#u6c-a").value = st.a; el.querySelector("#u6c-c").value = st.c;
      const L = U.lcm(st.b, st.d);
      el.querySelector("[data-vis]").innerHTML = twoBars(st.a, st.b, st.c, st.d, cut ? L : 0);
      el.querySelector('[data-o="f1"]').innerHTML = f(st.a, st.b);
      el.querySelector('[data-o="f2"]').innerHTML = f(st.c, st.d);
      const s = add(R(st.a, st.b), R(st.c, st.d));
      el.querySelector("[data-r]").innerHTML = cut
        ? `Both bars are now cut into <b>${L}</b> pieces.<br>${f(st.a, st.b)} = ${f(st.a * (L / st.b), L)} and ${f(st.c, st.d)} = ${f(st.c * (L / st.d), L)}<br><span class="big">${f(st.a, st.b)} + ${f(st.c, st.d)} = ${f(st.a * (L / st.b) + st.c * (L / st.d), L)}${s.d !== L || s.n >= s.d ? " = " + fmt(s) : ""}</span>`
        : `The pieces are different sizes, so we can't just add the tops. Press the button.`;
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; cut = false; draw(); }));
    el.querySelector("[data-cut]").addEventListener("click", () => { cut = true; draw(); });
    draw();
  };

  const convTable = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Metric</th><th>Customary</th></tr></thead><tbody>
    <tr><td>1 cm = 10 mm</td><td>1 ft = 12 in</td></tr>
    <tr><td>1 m = 100 cm</td><td>1 yd = 3 ft</td></tr>
    <tr><td>1 km = 1,000 m</td><td>1 lb = 16 oz</td></tr>
    <tr><td>1 kg = 1,000 g</td><td>1 gal = 4 qt</td></tr>
    <tr><td>1 L = 1,000 mL</td><td>1 hr = 60 min</td></tr></tbody></table></div>`;

  window.MQ.addUnit({
    id: "u6", n: 6, title: "More Decimal and Fraction Operations", short: "Measure & Add Fractions", icon: "ruler", hue: "var(--u6)",
    blurb: "Unit conversions, adding and subtracting fractions with unlike denominators, line plots.",
    bigIdea: `To add or subtract fractions, the pieces must be the <b>same size</b>, so find a common denominator first. Converting units works like place value: big unit to small unit means <b>multiply</b>, and small unit to big unit means <b>divide</b>.`,
    lessons: [
      {
        id: "l1", title: "Converting measurements", slides: [
          { t: "learn", title: "Bigger unit → more of the smaller unit", body: `<p>1 meter is 100 centimeters. So 4 meters is 4 ${X} 100 = <b>400 cm</b>.</p><p>Going the other way, 600 cm is 600 ${D} 100 = <b>6 m</b>.</p>${convTable}`, tip: `Ask: will I need MORE of the new unit (multiply) or FEWER (divide)? Small units → more of them.` },
          { t: "check", skill: "convert", d: 1 },
          { t: "check", skill: "convert", d: 2 },
          { t: "learn", title: "Metric = powers of ten", body: `<p>Metric units are built on 10, 100 and 1,000, so converting is just sliding digits:</p><p class="formula">2.5 kg = 2.5 ${X} 1,000 = 2,500 g</p><p class="formula">450 mL = 450 ${D} 1,000 = 0.45 L</p>` },
          { t: "check", skill: "convert", d: 3 },
          { t: "check", skill: "convert", d: 4 },
        ],
      },
      {
        id: "l2", title: "Adding and subtracting with unlike denominators", slides: [
          { t: "learn", title: "Same-size pieces first", body: `<p>${f(1, 2)} + ${f(1, 3)} isn't ${f(2, 5)}! Halves and thirds are different sizes.</p><div class="vis-row">${twoBars(1, 2, 1, 3, 6)}</div><p>Cut both into <b>sixths</b>: ${f(1, 2)} = ${f(3, 6)} and ${f(1, 3)} = ${f(2, 6)}.</p><p class="formula">${f(3, 6)} + ${f(2, 6)} = ${f(5, 6)}</p>` },
          { t: "play", title: "Find a common denominator", body: `<p>Pick two fractions. Then cut them into same-size pieces.</p>`, widget: commonPlay },
          { t: "learn", title: "Finding a common denominator", body: `<ul><li><b>Multiply the denominators:</b> 3 ${X} 4 = 12 always works.</li><li><b>Or find a smaller one:</b> for ${f(1, 4)} + ${f(5, 6)}, 12 works (4 ${X} 3 and 6 ${X} 2). It's smaller than 24.</li></ul><p class="formula">${f(1, 4)} + ${f(5, 6)} = ${f(3, 12)} + ${f(10, 12)} = ${f(13, 12)} = ${U.mixed(1, 1, 12)}</p>` },
          { t: "check", skill: "addFrac", d: 1 },
          { t: "check", skill: "addFrac", d: 2 },
          { t: "check", skill: "subFrac", d: 2 },
          { t: "check", skill: "benchmark", d: 2 },
        ],
      },
      {
        id: "l3", title: "Mixed numbers", slides: [
          { t: "learn", title: "Wholes with wholes, parts with parts", body: `<p class="formula">${U.mixed(2, 1, 2)} + ${U.mixed(1, 3, 4)}</p><ol class="steps"><li>Wholes: 2 + 1 = 3</li><li>Parts: ${f(2, 4)} + ${f(3, 4)} = ${f(5, 4)} = ${U.mixed(1, 1, 4)}</li><li>Together: 3 + ${U.mixed(1, 1, 4)} = <b>${U.mixed(4, 1, 4)}</b></li></ol>` },
          { t: "check", skill: "addFrac", d: 4 },
          { t: "learn", title: "Trading a whole", body: `<p class="formula">${U.mixed(4, 1, 3)} &minus; ${U.mixed(1, 1, 2)}</p><ol class="steps"><li>Common denominator: ${U.mixed(4, 2, 6)} &minus; ${U.mixed(1, 3, 6)}</li><li>${f(2, 6)} is less than ${f(3, 6)}, so trade 1 whole for ${f(6, 6)}: ${U.mixed(4, 2, 6)} = ${U.mixed(3, 8, 6)}</li><li>${U.mixed(3, 8, 6)} &minus; ${U.mixed(1, 3, 6)} = <b>${U.mixed(2, 5, 6)}</b></li></ol>` },
          { t: "check", skill: "subFrac", d: 4 },
          { t: "check", skill: "fracWord", d: 3 },
        ],
      },
      {
        id: "l4", title: "Line plots with fractions", slides: [
          { t: "learn", title: "Reading a line plot", body: `<p>Each × stands for one measurement. Stacked ×s mean several measurements were the same.</p><div class="vis-row">${V.linePlot([R(1, 4), R(1, 2), R(1, 2), R(3, 4), R(5, 4), R(1, 1), R(1, 2), R(3, 2)], 0, 2, 4, "Snail trail lengths (feet)")}</div><p>The most common length is ${f(1, 2)} ft (3 snails). Longest &minus; shortest: ${U.mixed(1, 1, 2)} &minus; ${f(1, 4)} = ${U.mixed(1, 1, 4)} ft.</p>` },
          { t: "check", skill: "linePlot", d: 3 },
          { t: "check", skill: "linePlot", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "convert", name: "Measurement conversions", min: 1, max: 5, gen: convert },
      { id: "addFrac", name: "Adding fractions (unlike denominators)", min: 1, max: 5, gen: addFrac },
      { id: "subFrac", name: "Subtracting fractions (unlike denominators)", min: 1, max: 5, gen: subFrac },
      { id: "benchmark", name: "Estimating with benchmarks", min: 2, max: 4, gen: benchmark },
      { id: "linePlot", name: "Line plots with fractions", min: 3, max: 5, gen: linePlot },
      { id: "fracWord", name: "Fraction story problems", min: 3, max: 5, gen: fracWord },
    ],
  });
})();
