/* Unit 4 · Wrapping Up Multiplication and Division with Multi-Digit Numbers */
(function () {
  const { U, V } = window.MQ;
  const { ri, pick, mc, num } = U;
  const X = "&times;", D = "&divide;";

  const split = (n) => {
    const s = String(n), out = [];
    for (let i = 0; i < s.length; i++) if (s[i] !== "0") out.push(+s[i] * Math.pow(10, s.length - 1 - i));
    return out;
  };
  const multSteps = (a, b) => {
    const parts = split(b);
    const steps = parts.map((p) => `${num(a)} ${X} ${num(p)} = ${num(a * p)}`);
    if (parts.length > 1) steps.push(`Add the partial products: ${parts.map((p) => num(a * p)).join(" + ")} = <b>${num(a * b)}</b>`);
    else steps[0] = steps[0].replace(/= ([\d,]+)$/, "= <b>$1</b>");
    return steps;
  };
  const divSteps = (n, d) => {
    const steps = [];
    let rem = n, q = 0;
    const parts = [];
    for (let p = Math.pow(10, String(n).length); p >= 1; p /= 10) {
      const k = Math.floor(rem / (d * p));
      if (k > 0) {
        steps.push(`${num(d)} ${X} ${num(k * p)} = ${num(d * k * p)}. ${num(rem)} &minus; ${num(d * k * p)} = ${num(rem - d * k * p)} left.`);
        parts.push(k * p); rem -= d * k * p; q += k * p;
      }
    }
    steps.push(`Add the partial quotients: ${parts.map(num).join(" + ")} = <b>${num(q)}</b>${rem ? ` remainder ${rem}` : ""}`);
    return steps;
  };

  /* ---------------- skills ---------------- */
  const mult = (d) => {
    const R = [[[12, 99], [3, 9]], [[102, 999], [3, 9]], [[105, 999], [12, 89]], [[1020, 9999], [12, 79]], [[120, 899], [14, 99]]][d - 1];
    let a = ri(...R[0]), b = ri(...R[1]);
    if (d === 2 && Math.random() < 0.5) { a = ri(14, 99); b = ri(12, 99); }
    if (d === 5) {
      const ctx = pick([
        [`A theater has ${b} rows with ${a} seats in each row. How many seats are there?`, "seats"],
        [`A school orders ${b} boxes of pencils. Each box has ${a} pencils. How many pencils is that?`, "pencils"],
        [`A train travels ${a} miles every day for ${b} days. How many miles is that in all?`, "miles"],
      ]);
      return { prompt: ctx[0], kind: "num", answer: a * b, suffix: ctx[1], hint: `Multiply ${num(a)} ${X} ${b}. Estimate first: about ${num(Math.round(a / 100) * 100 || a)} ${X} ${Math.round(b / 10) * 10 || b}.`, steps: multSteps(a, b) };
    }
    return {
      prompt: `${num(a)} ${X} ${num(b)} = ?`, kind: "num", answer: a * b,
      hint: `Break ${b} into place values (${split(b).map(num).join(" + ")}). Multiply ${num(a)} by each part, then add.`,
      steps: multSteps(a, b),
    };
  };

  const partial = (d) => {
    const a = ri(12, 89), b = ri(d === 1 ? 3 : 12, d === 1 ? 9 : 79);
    const ac = split(a), bc = split(b);
    if (ac.length < 2) return partial(d);
    const cells = bc.map((bv) => ac.map((av) => `${num(av * bv)}`));
    const hideR = ri(0, bc.length - 1), hideC = ri(0, ac.length - 1);
    const missing = ac[hideC] * bc[hideR];
    cells[hideR][hideC] = "?";
    const ask = d >= 3 ? "total" : "cell";
    const vis = V.areaModel(ac.map((v) => ({ w: v, label: num(v) })), bc.map((v) => ({ w: Math.max(v, 4), label: num(v) })), ask === "total" ? bc.map((bv) => ac.map((av) => num(av * bv))) : cells, { h: bc.length > 1 ? 150 : 80 });
    if (ask === "cell")
      return {
        prompt: `This area model shows ${a} ${X} ${b}. What number goes in the box with the "?"`,
        visual: vis, kind: "num", answer: missing,
        hint: `Each box is (the number above it) ${X} (the number beside it).`,
        steps: [`The ? box is ${num(ac[hideC])} wide and ${num(bc[hideR])} tall.`, `${num(ac[hideC])} ${X} ${num(bc[hideR])} = <b>${num(missing)}</b>`],
      };
    return {
      prompt: `Use the area model to find ${a} ${X} ${b}.`, visual: vis, kind: "num", answer: a * b,
      hint: `Add up all the partial products in the boxes.`,
      steps: [`Partial products: ${bc.flatMap((bv) => ac.map((av) => num(av * bv))).join(" + ")}`, `Total = <b>${num(a * b)}</b>`],
    };
  };

  const div = (d) => {
    const R = [[[3, 9], [4, 19]], [[3, 9], [21, 199]], [[12, 39], [8, 39]], [[14, 89], [21, 199]], [[12, 49], [12, 79]]][d - 1];
    const dv = ri(...R[0]), q = ri(...R[1]);
    const n = dv * q;
    return {
      prompt: `${num(n)} ${D} ${dv} = ?`, kind: "num", answer: q,
      hint: `Use partial quotients: how many groups of ${dv} can you take away at a time? Try ${dv} ${X} 10 or ${dv} ${X} 100 first.`,
      steps: [...divSteps(n, dv), `Check: ${num(q)} ${X} ${dv} = ${num(n)} ✓`],
    };
  };

  const estimate = (d) => {
    if (Math.random() < 0.5) {
      const a = ri(210, 890), b = ri(21, 89);
      const ea = Math.round(a / 100) * 100, eb = Math.round(b / 10) * 10, e = ea * eb;
      const o = mc(num(e), [num(e / 10), num(e * 10), num(ea + eb)]);
      return {
        prompt: `Which is the best estimate of ${a} ${X} ${b}?`, ...o,
        hint: `Round ${a} to the nearest hundred and ${b} to the nearest ten.`,
        steps: [`${a} ≈ ${ea} and ${b} ≈ ${eb}`, `${ea} ${X} ${eb} = <b>${num(e)}</b>`],
      };
    }
    const dv = ri(21, 48), q = ri(18, 95), n = dv * q + ri(0, dv - 1);
    const ed = Math.round(dv / 10) * 10;
    const eq = Math.round(n / ed / 10) * 10 || 10;
    const o = mc(String(eq), [String(eq * 10), String(Math.max(1, eq / 10)), String(eq + 100)]);
    return {
      prompt: `About how much is ${num(n)} ${D} ${dv}?`, ...o,
      hint: `Round ${dv} to a friendly ten (${ed}). Then ask: ${ed} ${X} what is close to ${num(n)}?`,
      steps: [`${dv} ≈ ${ed}`, `${ed} ${X} ${eq} = ${num(ed * eq)}, which is close to ${num(n)}.`, `Best estimate: <b>${eq}</b>`],
    };
  };

  const missing = (d) => {
    const a = ri(12, d >= 4 ? 99 : 40), b = ri(11, d >= 4 ? 99 : 35);
    return {
      prompt: `${num(a * b)} = ${a} ${X} <span class="blank">?</span>`, kind: "num", answer: b,
      hint: `Missing factor problems are division problems: ${num(a * b)} ${D} ${a}.`,
      steps: [...divSteps(a * b, a)],
    };
  };

  const remainder = (d) => {
    const t = pick(["up", "down", "left"]);
    const dv = ri(d >= 5 ? 12 : 4, d >= 5 ? 32 : 12), q = ri(5, d >= 5 ? 40 : 25), r = ri(1, dv - 1), n = dv * q + r;
    if (t === "up")
      return {
        prompt: `${n} students are going on a field trip. Each van holds ${dv} students. How many vans are needed so everyone can go?`,
        kind: "num", answer: q + 1, suffix: "vans",
        hint: `${n} ${D} ${dv} has a remainder. Can the leftover students stay home?`,
        steps: [`${n} ${D} ${dv} = ${q} remainder ${r}`, `${q} vans are full, but ${r} students still need a ride.`, `So we need <b>${q + 1}</b> vans.`],
      };
    if (t === "down")
      return {
        prompt: `A baker has ${n} eggs. Each cake needs ${dv} eggs. How many whole cakes can be baked?`,
        kind: "num", answer: q, suffix: "cakes",
        hint: `${n} ${D} ${dv} has a remainder. Is there enough for one more cake?`,
        steps: [`${n} ${D} ${dv} = ${q} remainder ${r}`, `The ${r} leftover eggs are not enough for another cake.`, `So <b>${q}</b> cakes.`],
      };
    return {
      prompt: `${n} marbles are shared equally into ${dv} bags with as many as possible in each bag. How many marbles are left over?`,
      kind: "num", answer: r, suffix: "marbles",
      hint: `Find ${n} ${D} ${dv}. The question wants the remainder.`,
      steps: [`${dv} ${X} ${q} = ${dv * q}`, `${n} &minus; ${dv * q} = <b>${r}</b> left over`],
    };
  };

  /* ---------------- widgets ---------------- */
  const areaPlay = (el) => {
    el.innerHTML = `<div class="play-grid one"><div class="play-ctl row2">
      <label>First number <output data-o="a">34</output><input type="range" id="u4a-a" min="11" max="99" value="34" data-k="a"></label>
      <label>Second number <output data-o="b">26</output><input type="range" id="u4a-b" min="11" max="99" value="26" data-k="b"></label>
      </div><div class="play-vis" data-vis></div><div class="readout" data-r></div></div>`;
    const st = { a: 34, b: 26 };
    const draw = () => {
      const ac = split(st.a), bc = split(st.b);
      el.querySelector("[data-vis]").innerHTML = V.areaModel(ac.map((v) => ({ w: v, label: v })), bc.map((v) => ({ w: Math.max(v, 3), label: v })), bc.map((bv) => ac.map((av) => num(av * bv))), { h: 150 });
      el.querySelector("[data-r]").innerHTML = `${bc.flatMap((bv) => ac.map((av) => num(av * bv))).join(" + ")}<br><span class="big">${st.a} ${X} ${st.b} = ${num(st.a * st.b)}</span>`;
      for (const k in st) el.querySelector(`[data-o="${k}"]`).textContent = st[k];
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", () => { st[i.dataset.k] = +i.value; draw(); }));
    draw();
  };

  const algo = `<pre class="algo">      3 4 7
  ${X}     2 6
  ---------
    2 0 8 2   <span class="muted">← 347 ${X} 6</span>
  + 6 9 4 0   <span class="muted">← 347 ${X} 20</span>
  ---------
    9 0 2 2</pre>`;

  const pq = `<pre class="algo">  24 ) 1 8 7 2
     − 1 2 0 0   <span class="muted">24 ${X} 50</span>
       -------
         6 7 2
     −   4 8 0   <span class="muted">24 ${X} 20</span>
       -------
         1 9 2
     −   1 9 2   <span class="muted">24 ${X} 8</span>
       -------
             0     50 + 20 + 8 = <b>78</b></pre>`;

  window.MQ.addUnit({
    id: "u4", n: 4, title: "Wrapping Up Multiplication and Division with Multi-Digit Numbers", short: "Big Number × and ÷", icon: "long", hue: "var(--u4)",
    blurb: "Area models, partial products, the standard algorithm and partial quotients.",
    bigIdea: `Big multiplications are just many small ones added together. Division works the same way in reverse: take away big, friendly chunks until nothing is left. <b>Place value</b> is the secret behind every step.`,
    lessons: [
      {
        id: "l1", title: "Area models and partial products", slides: [
          { t: "learn", title: "Break numbers into place values", body: `<p>To find 34 ${X} 26, split each number: 34 = 30 + 4 and 26 = 20 + 6.</p><div class="vis-row">${V.areaModel([{ w: 30, label: "30" }, { w: 4, label: "4" }], [{ w: 20, label: "20" }, { w: 6, label: "6" }], [["600", "80"], ["180", "24"]], { h: 140 })}</div><p class="formula">600 + 80 + 180 + 24 = 884</p>` },
          { t: "play", title: "Area model explorer", body: `<p>Pick any two numbers and see the partial products.</p>`, widget: areaPlay },
          { t: "check", skill: "partial", d: 1 },
          { t: "check", skill: "partial", d: 3 },
        ],
      },
      {
        id: "l2", title: "The standard algorithm", slides: [
          { t: "learn", title: "Same idea, fewer marks", body: `<p>The standard algorithm is a short way to write partial products. Here's 347 ${X} 26:</p>${algo}<ol class="steps"><li>Multiply 347 by the <b>6 ones</b>: 2,082.</li><li>Multiply 347 by the <b>2 tens</b> (that's 20!): 6,940. The 0 in the ones place reminds you it's tens.</li><li>Add: 2,082 + 6,940 = <b>9,022</b>.</li></ol>`, tip: `Estimate first: 347 is about 350, and 350 ${X} 26 is about 9,000. If your answer is near 900 or 90,000, check your zeros.` },
          { t: "check", skill: "mult", d: 2 },
          { t: "check", skill: "mult", d: 3 },
          { t: "check", skill: "estimate", d: 2 },
        ],
      },
      {
        id: "l3", title: "Dividing with partial quotients", slides: [
          { t: "learn", title: "Take away friendly chunks", body: `<p>1,872 ${D} 24: how many groups of 24 are in 1,872?</p>${pq}<p>Take away chunks you know (24 ${X} 50, 24 ${X} 20…) until nothing is left, then add up the chunks.</p>` },
          { t: "learn", title: "Make a helper list", body: `<p>Before dividing by 24, jot down easy multiples:</p><ul class="cols"><li>24 ${X} 1 = 24</li><li>24 ${X} 2 = 48</li><li>24 ${X} 5 = 120</li><li>24 ${X} 10 = 240</li><li>24 ${X} 20 = 480</li><li>24 ${X} 50 = 1,200</li><li>24 ${X} 100 = 2,400</li></ul><p>Then always check with multiplication: 78 ${X} 24 = 1,872 ✓</p>` },
          { t: "check", skill: "div", d: 2 },
          { t: "check", skill: "div", d: 3 },
          { t: "check", skill: "missing", d: 3 },
        ],
      },
      {
        id: "l4", title: "What do I do with the remainder?", slides: [
          { t: "learn", title: "Read the story!", body: `<p>53 ${D} 4 = 13 remainder 1. The right answer depends on the story:</p><ul><li><b>Round up:</b> 53 kids, 4 per car → <b>14 cars</b> (no one gets left behind).</li><li><b>Drop it:</b> 53 cookies, 4 per box → <b>13 full boxes</b>.</li><li><b>The remainder is the answer:</b> how many cookies are left over? → <b>1</b>.</li></ul>` },
          { t: "check", skill: "remainder", d: 3 },
          { t: "check", skill: "remainder", d: 4 },
        ],
      },
    ],
    skills: [
      { id: "partial", name: "Area models & partial products", min: 1, max: 3, gen: partial },
      { id: "mult", name: "Multi-digit multiplication", min: 1, max: 5, gen: mult },
      { id: "estimate", name: "Estimating products & quotients", min: 2, max: 4, gen: estimate },
      { id: "div", name: "Multi-digit division", min: 1, max: 5, gen: div },
      { id: "missing", name: "Missing factors", min: 2, max: 4, gen: missing },
      { id: "remainder", name: "Interpreting remainders", min: 3, max: 5, gen: remainder },
    ],
  });
})();
