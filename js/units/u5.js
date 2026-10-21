/* Unit 5 · Place Value Patterns and Decimal Operations */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, R, f, num } = U;
  const X = "&times;", D = "&divide;";

  // integer n with k decimal places -> string, e.g. ds(3402,3) = "3.402"
  const ds = (n, k) => {
    if (!k) return num(n);
    const neg = n < 0; n = Math.abs(n);
    const s = String(n).padStart(k + 1, "0");
    const whole = s.slice(0, s.length - k), frac = s.slice(s.length - k);
    return (neg ? "-" : "") + num(+whole) + "." + frac;
  };
  const trim = (s) => (s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s);
  const dr = (n, k) => R(n, Math.pow(10, k));
  const PLACES = ["thousands", "hundreds", "tens", "ones", "tenths", "hundredths", "thousandths"];
  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const words = (n) => {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + words(n % 100) : "");
  };

  const pvChart = (str, hi) => {
    const [w, fr = ""] = str.split(".");
    const cells = [];
    const wd = w.padStart(4, " ").slice(-4).split("");
    const fd = fr.padEnd(3, " ").slice(0, 3).split("");
    [...wd, ...fd].forEach((c, i) => cells.push(`<td class="${i === hi ? "hi" : ""} ${i === 3 ? "onesc" : ""}">${c.trim()}</td>`));
    return `<div class="pv-wrap"><table class="pv"><thead><tr>${PLACES.map((p, i) => `<th class="${i === hi ? "hi" : ""}">${p}</th>`).join("")}</tr></thead><tbody><tr>${cells.join("")}</tr></tbody></table></div>`;
  };

  /* ---------------- skills ---------------- */
  const pvValue = (d) => {
    if (d >= 3 && Math.random() < 0.5) {
      const dig = ri(1, 9), p1 = ri(0, 2), gap = ri(1, 2), p2 = p1 + gap;
      const a = ds(dig * Math.pow(10, 3 - p1), 3), b = ds(dig * Math.pow(10, 3 - p2), 3);
      const ta = trim(a), tb = trim(b);
      return {
        prompt: `The ${dig} in <b>${ta}</b> is how many times as large as the ${dig} in <b>${tb}</b>?`,
        kind: "num", answer: Math.pow(10, gap),
        hint: `Each place is 10 times the place to its right. How many places apart are the two ${dig}s?`,
        steps: [`In ${ta} the ${dig} is worth ${ta}. In ${tb} it is worth ${tb}.`, `The ${dig} moved ${gap} place${gap > 1 ? "s" : ""} to the left: ${gap === 1 ? "10" : "10 " + X + " 10"} = <b>${Math.pow(10, gap)}</b> times as large.`],
      };
    }
    const k = d === 1 ? 2 : 3;
    let n;
    do { n = ri(Math.pow(10, k), Math.pow(10, k + 1) * 4); } while (new Set(String(n)).size < String(n).length);
    const s = ds(n, k);
    const digits = s.replace(/[.,]/g, "");
    const pos = ri(1, digits.length - 1);
    const dig = +digits[pos];
    const placeFromRight = digits.length - 1 - pos;
    const exp = placeFromRight - k; // power of ten
    const valR = exp >= 0 ? R(dig * Math.pow(10, exp), 1) : R(dig, Math.pow(10, -exp));
    const placeName = PLACES[3 - exp];
    return {
      prompt: `What is the <b>value</b> of the digit ${dig} in <b>${s}</b>?`,
      visual: pvChart(s, 3 - exp),
      kind: "num", answer: valR,
      hint: `Find the ${dig} in the place value chart. Which place is it in?`,
      steps: [`The ${dig} is in the <b>${placeName}</b> place.`, `So it is worth ${dig} ${placeName} = <b>${trim(ds(valR.n * (Math.pow(10, 3) / valR.d), 3))}</b>`],
      show: "dec",
    };
  };

  const readWrite = (d) => {
    const t = d <= 2 ? pick(["word", "frac"]) : pick(["word", "expanded", "frac"]);
    const w = ri(0, d >= 3 ? 99 : 9);
    const k = d === 1 ? pick([1, 2]) : pick([2, 3, 3]);
    const fpart = ri(1, Math.pow(10, k) - 1);
    if (fpart % 10 === 0 && k > 1) return readWrite(d);
    const n = w * Math.pow(10, k) + fpart;
    const unit = ["", "tenths", "hundredths", "thousandths"][k];
    if (t === "word")
      return {
        prompt: `Write as a decimal: <b>${w ? words(w) + " and " : ""}${words(fpart)} ${fpart === 1 ? unit.slice(0, -1) : unit}</b>`,
        kind: "num", answer: dr(n, k), show: "dec",
        hint: `"And" marks the decimal point. ${unit[0].toUpperCase() + unit.slice(1)} means the last digit goes ${k} place${k > 1 ? "s" : ""} after the point.`,
        steps: [`Whole number part: ${w}`, `${words(fpart)} ${unit} = ${ds(fpart, k)}`, `Together: <b>${ds(n, k)}</b>`],
      };
    if (t === "frac")
      return {
        prompt: `Write ${w ? w + " " : ""}${f(fpart, Math.pow(10, k))} as a decimal.`,
        kind: "num", answer: dr(n, k), show: "dec",
        hint: `The denominator ${Math.pow(10, k)} means the decimal has ${k} digit${k > 1 ? "s" : ""} after the point.`,
        steps: [`${f(fpart, Math.pow(10, k))} = ${ds(fpart, k)}`, `Answer: <b>${ds(n, k)}</b>`],
      };
    const s = ds(n, 3).replace(/,/g, "");
    const digs = s.replace(".", "").padStart(5, "0");
    const placesV = [10, 1, R(1, 10), R(1, 100), R(1, 1000)];
    const parts = [];
    digs.split("").forEach((c, i) => {
      if (+c) parts.push(`${c} ${X} ${typeof placesV[i] === "number" ? placesV[i] : f(1, placesV[i].d)}`);
    });
    return {
      prompt: `Write as a decimal: <span class="expr">${parts.join(" + ")}</span>`,
      kind: "num", answer: dr(n, 3), show: "dec",
      hint: `Each part tells you a digit and its place. Any place that isn't mentioned gets a 0.`,
      steps: [`Put each digit in its place, using 0 for empty places.`, `<b>${trim(ds(n, 3))}</b>`],
    };
  };

  const compare = (d) => {
    const w = ri(0, 9);
    let a, b;
    const t = pick(d >= 2 ? ["trail", "trap", "plain", "eq"] : ["plain", "trail"]);
    if (t === "trail") { a = ds(w * 100 + ri(11, 98), 2); b = ds(w * 1000 + ri(101, 989), 3); }
    else if (t === "trap") { const x = ri(1, 9), y = ri(1, 9), z = ri(1, 9); a = ds(w * 100 + x * 10 + y, 2); b = ds(w * 1000 + x * 100 + z, 3); }
    else if (t === "eq") { const x = ri(10, 99); a = ds(w * 100 + x, 2); b = ds(w * 1000 + x * 10, 3); }
    else { a = ds(w * 10 + ri(1, 9), 1); b = ds(w * 100 + ri(1, 99), 2); }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const va = U.parse(a), vb = U.parse(b);
    const sym = U.eq(va, vb) ? "=" : U.val(va) > U.val(vb) ? "&gt;" : "&lt;";
    const choices = ["&gt;", "&lt;", "="];
    const pad = (s) => s.padEnd(s.split(".")[0].length + 4, "0");
    return {
      prompt: `Which symbol makes this true? <span class="expr">${a} <span class="blank">?</span> ${b}</span>`,
      kind: "mc", choices, answer: choices.indexOf(sym),
      hint: `Line up the decimal points. Add zeros at the end so both numbers have the same number of digits, then compare place by place.`,
      steps: [`${a} = ${pad(a).slice(0, pad(a).indexOf(".") + 4)} and ${b} = ${pad(b).slice(0, pad(b).indexOf(".") + 4)}`, `Compare from the left. So ${a} <b>${sym}</b> ${b}.`],
    };
  };

  const round = (d) => {
    const n = ri(1001, 49999);
    const to = d <= 2 ? pick(["whole", "tenth"]) : pick(["whole", "tenth", "hundredth"]);
    const k = { whole: 3, tenth: 2, hundredth: 1 }[to];
    const unit = Math.pow(10, k);
    const r = Math.round(n / unit) * unit;
    const s = ds(n, 3);
    const lower = Math.floor(n / unit) * unit, upper = lower + unit;
    return {
      prompt: `Round <b>${s}</b> to the nearest <b>${to}</b>.`,
      visual: V.numberLine({ min: 0, max: 1, denom: 10, w: 360, tickLabels: (v, i) => (i === 0 ? trim(ds(lower, 3)) : i === 10 ? trim(ds(upper, 3)) : i === 5 ? "halfway" : null), marks: [{ v: (n - lower) / unit, label: trim(s) }] }),
      kind: "num", answer: dr(r, 3), show: "dec",
      hint: `Which two ${to}s is ${s} between? Is it past the halfway point?`,
      steps: [`${s} is between ${trim(ds(lower, 3))} and ${trim(ds(upper, 3))}.`, `Halfway is ${trim(ds(lower + unit / 2, 4 - 1))}. ${s} is ${n - lower >= unit / 2 ? "at or past" : "before"} halfway.`, `Rounded: <b>${trim(ds(r, 3))}</b>`],
    };
  };

  const addSub = (d) => {
    const op = d <= 1 ? "+" : d === 4 ? "-" : pick(["+", "-"]);
    let ka = d <= 1 ? 1 : pick([1, 2]), kb = d <= 2 ? ka : pick([1, 2, 3]);
    let a = ri(10, d >= 3 ? 9999 : 999), b = ri(10, d >= 3 ? 999 : 999);
    if (d === 4 && Math.random() < 0.5) { a = ri(2, 20); ka = 0; kb = pick([1, 2]); b = ri(11, a * Math.pow(10, kb) - 1); }
    const K = Math.max(ka, kb);
    let A = a * Math.pow(10, K - ka), B = b * Math.pow(10, K - kb);
    if (op === "-" && A < B) { [A, B] = [B, A]; [a, b] = [b, a]; [ka, kb] = [kb, ka]; }
    const res = op === "+" ? A + B : A - B;
    const sa = ds(a, ka), sb = ds(b, kb);
    if (d === 5) {
      const p1 = ri(250, 2499), p2 = ri(150, 1499), paid = Math.ceil((p1 + p2) / 1000) * 1000 + pick([0, 1000]);
      return {
        prompt: `${U.name()} buys a book for $${ds(p1, 2)} and a game for $${ds(p2, 2)}, and pays with $${ds(paid, 2).replace(".00", "")}. How much change comes back?`,
        kind: "num", answer: dr(paid - p1 - p2, 2), show: "dec", prefix: "$",
        hint: `First add the two prices. Then subtract from the amount paid.`,
        steps: [`$${ds(p1, 2)} + $${ds(p2, 2)} = $${ds(p1 + p2, 2)}`, `$${ds(paid, 2)} &minus; $${ds(p1 + p2, 2)} = <b>$${ds(paid - p1 - p2, 2)}</b>`],
      };
    }
    return {
      prompt: `${sa} ${op === "+" ? "+" : "&minus;"} ${sb} = ?`,
      kind: "num", answer: dr(res, K), show: "dec",
      hint: `Line up the decimal points. ${ka !== kb ? `Write a 0 to fill empty places: ${ds(A, K)} ${op === "+" ? "+" : "&minus;"} ${ds(B, K)}.` : "Add or subtract place by place, starting from the right."}`,
      steps: [`Line up the points: ${ds(A, K)} ${op === "+" ? "+" : "&minus;"} ${ds(B, K)}`, `= <b>${trim(ds(res, K))}</b>`],
    };
  };

  const pow10 = (d) => {
    const k = pick([1, 2, 3]);
    const n = ri(11, 9999), kn = pick([0, 1, 2, 3]);
    const op = pick(["×", "÷"]);
    const p = Math.pow(10, k);
    const ten = d >= 4 && Math.random() < 0.6 ? `10<sup>${k}</sup>` : num(p);
    let resN = n, resK = kn;
    if (op === "×") { resK = kn - k; if (resK < 0) { resN = n * Math.pow(10, -resK); resK = 0; } }
    else resK = kn + k;
    const ans = dr(resN, resK);
    return {
      prompt: `${trim(ds(n, kn))} ${op === "×" ? X : D} ${ten} = ?`,
      kind: "num", answer: ans, show: "dec",
      hint: op === "×" ? `Multiplying by ${num(p)} makes every digit worth ${num(p)} times as much. Each digit moves ${k} place${k > 1 ? "s" : ""} to the left.` : `Dividing by ${num(p)} makes every digit worth ${f(1, p)} as much. Each digit moves ${k} place${k > 1 ? "s" : ""} to the right.`,
      steps: [...(ten.includes("sup") ? [`10<sup>${k}</sup> = ${num(p)} (${k} tens multiplied together)`] : []), `Each digit moves ${k} place${k > 1 ? "s" : ""} to the ${op === "×" ? "left" : "right"}.`, `${trim(ds(n, kn))} ${op === "×" ? X : D} ${num(p)} = <b>${trim(ds(resN, resK))}</b>`],
    };
  };

  const multDec = (d) => {
    if (d === 3) {
      const a = ri(2, 99), ka = a < 10 ? 1 : pick([1, 2]), b = ri(2, 9);
      return {
        prompt: `${ds(a, ka)} ${X} ${b} = ?`, kind: "num", answer: dr(a * b, ka), show: "dec",
        hint: `Multiply as if there were no decimal point (${a} ${X} ${b}), then think about how big the answer should be.`,
        steps: [`${a} ${X} ${b} = ${a * b}`, `${ds(a, ka)} has ${ka} decimal place${ka > 1 ? "s" : ""}, so the answer does too: <b>${trim(ds(a * b, ka))}</b>`, ...(Math.round(a / Math.pow(10, ka)) >= 1 ? [`Estimate check: ${ds(a, ka)} is about ${Math.round(a / Math.pow(10, ka))}, and ${Math.round(a / Math.pow(10, ka))} ${X} ${b} = ${Math.round(a / Math.pow(10, ka)) * b}.`] : [])],
      };
    }
    if (d === 4 && Math.random() < 0.5) {
      const a = ri(1, 9), b = ri(1, 9);
      return {
        prompt: `0.${a} ${X} 0.${b} = ?`, visual: V.decMult(a, b), kind: "num", answer: dr(a * b, 2), show: "dec",
        hint: `Tenths ${X} tenths = hundredths. Count the darkest squares on the hundredths grid.`,
        steps: [`${f(a, 10)} ${X} ${f(b, 10)} = ${f(a * b, 100)}`, `= <b>${ds(a * b, 2)}</b>`],
      };
    }
    const a = ri(11, 99), b = ri(2, d >= 5 ? 99 : 9);
    const ka = 1, kb = b >= 10 ? pick([1, 2]) : 1;
    if (d === 5) {
      const price = ri(105, 899), lbs = ri(12, 49);
      return {
        prompt: `Apples cost $${ds(price, 2)} per pound. How much do ${ds(lbs, 1)} pounds of apples cost?<br><span class="muted">Round to the nearest cent if needed.</span>`,
        kind: "num", answer: dr(Math.round((price * lbs) / 10), 2), show: "dec", prefix: "$",
        hint: `Multiply ${ds(price, 2)} ${X} ${ds(lbs, 1)}. Estimate first: about ${Math.round(price / 100)} ${X} ${Math.round(lbs / 10)}.`,
        steps: [`${price} ${X} ${lbs} = ${num(price * lbs)}`, `There are 2 + 1 = 3 decimal places: ${ds(price * lbs, 3)}`, `To the nearest cent: <b>$${ds(Math.round((price * lbs) / 10), 2)}</b>`],
      };
    }
    return {
      prompt: `${ds(a, ka)} ${X} ${ds(b, kb)} = ?`, kind: "num", answer: dr(a * b, ka + kb), show: "dec",
      hint: `Multiply ${a} ${X} ${b}. Then count the decimal places in both factors.`,
      steps: [`${a} ${X} ${b} = ${num(a * b)}`, `${ds(a, ka)} has ${ka} decimal place and ${ds(b, kb)} has ${kb}: ${ka + kb} in all.`, `<b>${trim(ds(a * b, ka + kb))}</b>`],
    };
  };

  const divDec = (d) => {
    if (d === 3) {
      const q = ri(11, 99), b = ri(2, 9), kq = pick([1, 2]);
      return {
        prompt: `${ds(q * b, kq)} ${D} ${b} = ?`, kind: "num", answer: dr(q, kq), show: "dec",
        hint: `Think of ${ds(q * b, kq)} as ${q * b} ${kq === 1 ? "tenths" : "hundredths"}. Divide ${q * b} by ${b}.`,
        steps: [`${ds(q * b, kq)} = ${q * b} ${kq === 1 ? "tenths" : "hundredths"}`, `${q * b} ${D} ${b} = ${q}, so ${q} ${kq === 1 ? "tenths" : "hundredths"}`, `= <b>${trim(ds(q, kq))}</b>`],
      };
    }
    if (d === 4) {
      const t = pick(["unit", "dd"]);
      if (t === "unit") {
        const w = ri(1, 9), dv = pick([[5, 1, 2], [1, 1, 10], [25, 2, 4], [2, 1, 5]]);
        return {
          prompt: `${w} ${D} ${ds(dv[0], dv[1])} = ?`, kind: "num", answer: w * dv[2],
          hint: `How many ${ds(dv[0], dv[1])}s fit into 1? Then into ${w}?`,
          steps: [`There are ${dv[2]} groups of ${ds(dv[0], dv[1])} in 1.`, `${w} ${X} ${dv[2]} = <b>${w * dv[2]}</b>`],
        };
      }
      const q = ri(2, 9), dvs = ri(2, 9);
      return {
        prompt: `${ds(q * dvs, 1)} ${D} 0.${dvs} = ?`, kind: "num", answer: q,
        hint: `Both numbers are in tenths: ${q * dvs} tenths ${D} ${dvs} tenths is the same as ${q * dvs} ${D} ${dvs}.`,
        steps: [`${ds(q * dvs, 1)} = ${q * dvs} tenths, 0.${dvs} = ${dvs} tenths`, `${q * dvs} ${D} ${dvs} = <b>${q}</b>`],
      };
    }
    const per = pick([25, 50, 75, 125]), n = ri(4, 12);
    return {
      prompt: `A ${ds(per * n, 2)}-liter jug of water is poured into bottles that each hold ${ds(per, 2)} liter. How many bottles are filled?`,
      kind: "num", answer: n, suffix: "bottles",
      hint: `Divide ${ds(per * n, 2)} by ${ds(per, 2)}. Both are in hundredths, so you can divide ${per * n} by ${per}.`,
      steps: [`${ds(per * n, 2)} ${D} ${ds(per, 2)} = ${per * n} ${D} ${per}`, `= <b>${n}</b> bottles`],
    };
  };

  /* ---------------- widgets ---------------- */
  const pvPlay = (el) => {
    el.innerHTML = `<div class="play-grid one"><div class="play-ctl">
      <label for="u5pv">Type a number with up to 3 decimal places</label>
      <input type="text" id="u5pv" class="txt" value="47.385" inputmode="decimal" autocomplete="off">
      <div class="btnrow"><button type="button" class="btn sm" data-x="10">${X} 10</button><button type="button" class="btn sm" data-x="0.1">${D} 10</button></div>
      </div><div class="play-vis" data-vis></div><div class="readout" data-r></div></div>`;
    const inp = el.querySelector("#u5pv");
    const draw = () => {
      const r = U.parse(inp.value);
      if (!r || r.n / r.d >= 10000) { el.querySelector("[data-r]").textContent = "Try a number less than 10,000 with up to 3 decimal places."; return; }
      const n3 = Math.round((r.n / r.d) * 1000);
      const s = ds(n3, 3).replace(/,/g, "");
      el.querySelector("[data-vis]").innerHTML = pvChart(s, -1);
      const digs = s.replace(".", "");
      const parts = [];
      digs.split("").forEach((c, i) => {
        const exp = digs.length - 4 - i;
        if (+c) parts.push(exp >= 0 ? `${+c * Math.pow(10, exp)}` : `${c} ${X} ${f(1, Math.pow(10, -exp))}`);
      });
      el.querySelector("[data-r]").innerHTML = `Expanded form:<br><span class="big">${parts.join(" + ") || "0"}</span>`;
    };
    inp.addEventListener("input", draw);
    el.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => {
      const r = U.parse(inp.value) || R(0);
      const v = U.fix((r.n / r.d) * +b.dataset.x);
      if (v < 10000 && U.fix(v * 1000) % 1 === 0) inp.value = String(v);
      draw();
    }));
    draw();
  };

  const gridPlay = (el) => {
    el.innerHTML = `<div class="play-grid"><div class="play-vis" data-vis></div><div class="play-ctl">
      <label>First factor 0.<output data-o="a">3</output><input type="range" id="u5g-a" min="1" max="9" value="3" data-k="a"></label>
      <label>Second factor 0.<output data-o="b">4</output><input type="range" id="u5g-b" min="1" max="9" value="4" data-k="b"></label>
      <div class="readout" data-r></div></div></div>`;
    const st = { a: 3, b: 4 };
    const draw = () => {
      el.querySelector("[data-vis]").innerHTML = V.decMult(st.a, st.b);
      el.querySelector("[data-r]").innerHTML = `${st.a} tenths ${X} ${st.b} tenths = ${st.a * st.b} hundredths<br><span class="big">0.${st.a} ${X} 0.${st.b} = ${ds(st.a * st.b, 2)}</span><br><span class="muted">The answer is smaller than both factors. Why?</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  window.MQ.addUnit({
    id: "u5", n: 5, title: "Place Value Patterns and Decimal Operations", short: "Decimals", icon: "dot", hue: "var(--u5)",
    blurb: "Thousandths, comparing and rounding, and all four operations with decimals.",
    bigIdea: `Every place is <b>10 times</b> the place to its right. Hold on to that one idea and decimals stop being tricky: you can line them up, shift them by powers of ten, and multiply or divide them like whole numbers.`,
    lessons: [
      {
        id: "l1", title: "Thousandths and place value", slides: [
          { t: "learn", title: "Zooming in past the ones", body: `<p>Cut 1 whole into 10 parts and you get <b>tenths</b>. Cut a tenth into 10 parts and you get <b>hundredths</b>. Cut a hundredth into 10 parts and you get <b>thousandths</b>.</p>${pvChart("3.472", 6)}<p>In 3.472 the 2 is worth 2 thousandths, or ${f(2, 1000)}.</p>` },
          { t: "play", title: "Place value machine", body: `<p>Type a number, then press ${X} 10 or ${D} 10. Watch every digit slide one place.</p>`, widget: pvPlay },
          { t: "check", skill: "pvValue", d: 1 },
          { t: "check", skill: "pvValue", d: 2 },
          { t: "learn", title: "Three ways to write a number", body: `<ul><li><b>Standard:</b> 5.017</li><li><b>Words:</b> five <i>and</i> seventeen thousandths</li><li><b>Expanded:</b> 5 ${X} 1 + 1 ${X} ${f(1, 100)} + 7 ${X} ${f(1, 1000)}</li></ul><p>The word <b>"and"</b> is where the decimal point goes.</p>` },
          { t: "check", skill: "readWrite", d: 2 },
          { t: "check", skill: "pvValue", d: 3 },
        ],
      },
      {
        id: "l2", title: "Comparing and rounding", slides: [
          { t: "learn", title: "Longer isn't larger", body: `<p>Which is greater, <b>0.5</b> or <b>0.457</b>?</p><p>Add zeros so they have the same number of places: 0.<b>500</b> and 0.<b>457</b>. 500 thousandths &gt; 457 thousandths, so <b>0.5 &gt; 0.457</b>.</p>`, tip: `Adding zeros at the END of a decimal doesn't change its value. 0.5 = 0.50 = 0.500.` },
          { t: "check", skill: "compare", d: 2 },
          { t: "learn", title: "Rounding on a number line", body: `<p>Round 4.267 to the nearest tenth. It sits between 4.2 and 4.3:</p><div class="vis-row">${V.numberLine({ min: 0, max: 1, denom: 10, w: 380, tickLabels: (v, i) => (i === 0 ? "4.2" : i === 10 ? "4.3" : i === 5 ? "4.25" : null), marks: [{ v: 0.67, label: "4.267" }] })}</div><p>It is past the halfway point (4.25), so it rounds to <b>4.3</b>.</p>` },
          { t: "check", skill: "round", d: 2 },
          { t: "check", skill: "round", d: 3 },
        ],
      },
      {
        id: "l3", title: "Adding and subtracting decimals", slides: [
          { t: "learn", title: "Line up the points", body: `<pre class="algo">   3.50
 + 1.27
 ------
   4.77</pre><p>Line up the decimal points so tenths add to tenths and hundredths to hundredths. Fill empty places with 0.</p>`, tip: `Whole numbers have an invisible decimal point at the end: 5 = 5.00` },
          { t: "check", skill: "addSub", d: 2 },
          { t: "learn", title: "Subtracting with zeros", body: `<pre class="algo">   5.00
 − 2.38
 ------
   2.62</pre><p>Write 5 as 5.00 and regroup. One whole becomes 10 tenths, and one tenth becomes 10 hundredths.</p><p>Check by adding: 2.62 + 2.38 = 5 ✓</p>` },
          { t: "check", skill: "addSub", d: 3 },
          { t: "check", skill: "addSub", d: 4 },
        ],
      },
      {
        id: "l4", title: "Powers of ten", slides: [
          { t: "learn", title: "Digits slide, points stay", body: `<p>When you multiply by 10, every digit becomes worth 10 times as much, so it slides <b>one place left</b>.</p><p class="formula">0.36 ${X} 10 = 3.6 &nbsp;&nbsp; 0.36 ${X} 100 = 36 &nbsp;&nbsp; 0.36 ${X} 1,000 = 360</p><p>Dividing by 10 slides digits <b>one place right</b>:</p><p class="formula">45 ${D} 10 = 4.5 &nbsp;&nbsp; 45 ${D} 100 = 0.45 &nbsp;&nbsp; 45 ${D} 1,000 = 0.045</p>` },
          { t: "learn", title: "Exponents", body: `<p>10<sup>3</sup> means 10 ${X} 10 ${X} 10 = 1,000. The small number counts how many 10s are multiplied.</p><p class="formula">10<sup>1</sup> = 10 &nbsp; 10<sup>2</sup> = 100 &nbsp; 10<sup>3</sup> = 1,000</p><p>So 2.7 ${X} 10<sup>2</sup> = 270. The exponent also tells you how many places the digits move!</p>` },
          { t: "check", skill: "pow10", d: 2 },
          { t: "check", skill: "pow10", d: 4 },
        ],
      },
      {
        id: "l5", title: "Multiplying decimals", slides: [
          { t: "learn", title: "Decimal × whole number", body: `<p>2.4 ${X} 3 is 24 tenths ${X} 3 = 72 tenths = <b>7.2</b>.</p><p>Estimate to check: 2.4 is about 2, and 2 ${X} 3 = 6. So 7.2 makes sense, but 72 or 0.72 doesn't.</p>` },
          { t: "check", skill: "multDec", d: 3 },
          { t: "play", title: "Tenths times tenths", body: `<p>The darkest squares show the product on a hundredths grid.</p>`, widget: gridPlay },
          { t: "learn", title: "Count the decimal places", body: `<p>1.5 ${X} 0.24:</p><ol class="steps"><li>Ignore the points: 15 ${X} 24 = 360.</li><li>Count the decimal places in the factors: 1 + 2 = 3.</li><li>Put 3 places in the answer: 0.360 = <b>0.36</b>.</li></ol><p>Estimate: 1.5 ${X} about a quarter is about 0.4. ✓</p>` },
          { t: "check", skill: "multDec", d: 4 },
        ],
      },
      {
        id: "l6", title: "Dividing decimals", slides: [
          { t: "learn", title: "Decimal ÷ whole number", body: `<p>4.8 ${D} 4: think of 4.8 as 4 wholes and 8 tenths. Share them among 4 groups: each group gets 1 whole and 2 tenths.</p><p class="formula">4.8 ${D} 4 = 1.2</p>` },
          { t: "check", skill: "divDec", d: 3 },
          { t: "learn", title: "Dividing by a decimal", body: `<p>3 ${D} 0.5 asks: how many halves are in 3? There are 2 halves in each whole, so <b>6</b>.</p><p>1.2 ${D} 0.3 is 12 tenths ${D} 3 tenths, the same as 12 ${D} 3 = <b>4</b>.</p>`, tip: `Dividing by a number less than 1 gives an answer BIGGER than what you started with.` },
          { t: "check", skill: "divDec", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "pvValue", name: "Value of a digit", min: 1, max: 4, gen: pvValue },
      { id: "readWrite", name: "Reading & writing decimals", min: 1, max: 4, gen: readWrite },
      { id: "compare", name: "Comparing decimals", min: 1, max: 4, gen: compare },
      { id: "round", name: "Rounding decimals", min: 2, max: 4, gen: round },
      { id: "addSub", name: "Adding & subtracting decimals", min: 1, max: 5, gen: addSub },
      { id: "pow10", name: "× and ÷ by powers of 10", min: 2, max: 5, gen: pow10 },
      { id: "multDec", name: "Multiplying decimals", min: 3, max: 5, gen: multDec },
      { id: "divDec", name: "Dividing decimals", min: 3, max: 5, gen: divDec },
    ],
  });
})();
