/* Unit 8 · Putting It All Together */
(function () {
  const { U } = window.MQ;
  const { ri, pick, mc, R, f, fmt, num } = U;
  const X = "&times;", D = "&divide;";

  /* ---------------- skills ---------------- */
  const exprEval = (d) => {
    if (d === 1) {
      const a = ri(2, 12), b = ri(2, 12), c = ri(2, 9);
      const t = pick([0, 1]);
      return t === 0
        ? { prompt: `(${a} + ${b}) ${X} ${c} = ?`, kind: "num", answer: (a + b) * c, hint: `Work inside the parentheses first.`, steps: [`${a} + ${b} = ${a + b}`, `${a + b} ${X} ${c} = <b>${(a + b) * c}</b>`] }
        : { prompt: `${a} + ${b} ${X} ${c} = ?`, kind: "num", answer: a + b * c, hint: `No parentheses here, so multiply before you add.`, steps: [`${b} ${X} ${c} = ${b * c}`, `${a} + ${b * c} = <b>${a + b * c}</b>`] };
    }
    if (d === 2) {
      const b = ri(6, 15), c = ri(1, b - 2), a = ri(2, 9), e = ri(1, 20);
      return { prompt: `${a} ${X} (${b} &minus; ${c}) + ${e} = ?`, kind: "num", answer: a * (b - c) + e, hint: `Parentheses first, then multiply, then add.`, steps: [`${b} &minus; ${c} = ${b - c}`, `${a} ${X} ${b - c} = ${a * (b - c)}`, `${a * (b - c)} + ${e} = <b>${a * (b - c) + e}</b>`] };
    }
    if (d === 3) {
      const a = ri(2, 6), b = ri(2, 9), c = ri(1, 9), e = ri(2, 5);
      const inner = b * c + a, g = ri(1, Math.min(30, inner * e - 1));
      return { prompt: `[${b} ${X} ${c} + ${a}] ${X} ${e} &minus; ${g} = ?`, kind: "num", answer: inner * e - g,
        hint: `Brackets are like parentheses. Do everything inside them first (multiply before adding).`,
        steps: [`Inside the brackets: ${b} ${X} ${c} = ${b * c}, then ${b * c} + ${a} = ${inner}`, `${inner} ${X} ${e} = ${inner * e}`, `${inner * e} &minus; ${g} = <b>${inner * e - g}</b>`] };
    }
    if (d === 4) {
      const den = pick([2, 3, 4]), k = ri(2, 6), n = den * k * ri(1, 3), a = ri(1, den - 1);
      return { prompt: `(${n} + ${den * k}) ${X} ${f(a, den)} = ?`, kind: "num", answer: R((n + den * k) * a, den),
        hint: `Add inside the parentheses, then find ${f(a, den)} of that number.`,
        steps: [`${n} + ${den * k} = ${n + den * k}`, `${f(a, den)} ${X} ${n + den * k} = ${a} ${X} (${n + den * k} ${D} ${den}) = <b>${fmt(R((n + den * k) * a, den))}</b>`] };
    }
    const a = ri(2, 5), b = ri(3, 8), c = ri(1, b - 1), e = ri(2, 4), g = ri(10, 40);
    const v = g - a * (b - c) * e;
    if (v < 0) return exprEval(d);
    return { prompt: `${g} &minus; {${a} ${X} [(${b} &minus; ${c}) ${X} ${e}]} = ?`, kind: "num", answer: v,
      hint: `Work from the inside out: parentheses ( ), then brackets [ ], then braces { }.`,
      steps: [`( ${b} &minus; ${c} ) = ${b - c}`, `[ ${b - c} ${X} ${e} ] = ${(b - c) * e}`, `{ ${a} ${X} ${(b - c) * e} } = ${a * (b - c) * e}`, `${g} &minus; ${a * (b - c) * e} = <b>${v}</b>`] };
  };

  const exprWrite = (d) => {
    const t = d <= 2 ? "match" : pick(["match", "times", "compare"]);
    if (t === "match") {
      const a = ri(2, 15), b = ri(2, 15), c = ri(2, 9);
      const forms = [
        [`Add ${a} and ${b}, then multiply by ${c}.`, `(${a} + ${b}) ${X} ${c}`, [`${a} + ${b} ${X} ${c}`, `${a} ${X} ${c} + ${b}`, `(${a} ${X} ${b}) + ${c}`]],
        [`Multiply ${a} by ${c}, then subtract ${b}.`, `${a} ${X} ${c} &minus; ${b}`, [`${a} ${X} (${c} &minus; ${b})`, `(${a} &minus; ${b}) ${X} ${c}`, `${b} &minus; ${a} ${X} ${c}`]],
        [`Divide the sum of ${a * c} and ${b * c} by ${c}.`, `(${a * c} + ${b * c}) ${D} ${c}`, [`${a * c} + ${b * c} ${D} ${c}`, `${c} ${D} (${a * c} + ${b * c})`, `(${a * c} ${D} ${c}) + ${b * c}`]],
        [`Triple the difference of ${Math.max(a, b)} and ${Math.min(a, b)}.`, `3 ${X} (${Math.max(a, b)} &minus; ${Math.min(a, b)})`, [`3 ${X} ${Math.max(a, b)} &minus; ${Math.min(a, b)}`, `(3 ${X} ${Math.max(a, b)}) + ${Math.min(a, b)}`, `${Math.max(a, b)} &minus; 3 ${X} ${Math.min(a, b)}`]],
      ];
      const [w, right, wrong] = pick(forms);
      const o = mc(right, wrong);
      return { prompt: `Which expression matches the words?<br><span class="story">${w}</span>`, ...o, hint: `When something must happen first, it needs parentheses.`, steps: [`The words say what to do first, and parentheses show that.`, `<b>${right}</b>`] };
    }
    if (t === "times") {
      const k = ri(2, 9), a = ri(1000, 29999), b = ri(100, 999);
      return { prompt: `Without calculating: ${k} ${X} (${num(a)} + ${b}) is how many times as large as ${num(a)} + ${b}?`, kind: "num", answer: k,
        hint: `The whole sum in parentheses is being multiplied by one number.`,
        steps: [`${num(a)} + ${b} is one amount. Multiplying it by ${k} makes it <b>${k}</b> times as large.`] };
    }
    const a = ri(20, 90), b = ri(2, 9), c = ri(2, 9);
    const choices = ["the first expression", "the second expression", "they are equal"];
    const v1 = (a + b) * c, v2 = a + b * c;
    return { prompt: `Without calculating every step, which is greater?<br><span class="expr">(${a} + ${b}) ${X} ${c} &nbsp; or &nbsp; ${a} + ${b} ${X} ${c}</span>`, kind: "mc", choices, answer: v1 > v2 ? 0 : v1 < v2 ? 1 : 2,
      hint: `In the first one, all of ${a} gets multiplied by ${c}. In the second, only ${b} does.`,
      steps: [`(${a} + ${b}) ${X} ${c} = ${v1}`, `${a} + ${b} ${X} ${c} = ${v2}`, `<b>${v1 > v2 ? "The first expression" : "The second expression"}</b> is greater.`] };
  };

  const multiStep = (d) => {
    const t = pick(["party", "garden", "fund", "trip"]);
    if (t === "party") {
      const people = ri(12, 30), slices = 8, perPerson = pick([R(3, 2), R(5, 2), R(2)]);
      const need = U.mul(perPerson, R(people));
      const pizzas = Math.ceil(U.val(need) / slices);
      return { prompt: `${people} people are coming to a party. Each person eats ${fmt(perPerson)} slices of pizza. Each pizza has ${slices} slices. How many pizzas should be ordered?`, kind: "num", answer: pizzas, suffix: "pizzas",
        hint: `Find the total slices needed first. Then divide by ${slices}. Can you order part of a pizza?`,
        steps: [`Slices needed: ${people} ${X} ${fmt(perPerson)} = ${fmt(need)}`, `${fmt(need)} ${D} ${slices} = ${U.num(Math.round((U.val(need) / slices) * 100) / 100)}`, `Round up so there's enough: <b>${pizzas}</b> pizzas`] };
    }
    if (t === "garden") {
      const l = ri(4, 9), w = ri(2, 5), depth = pick([R(1, 2), R(1, 4), R(3, 4)]);
      const v = U.mul(R(l * w), depth);
      return { prompt: `A garden bed is ${l} ft long and ${w} ft wide. It is filled with soil ${fmt(depth)} ft deep. How many cubic feet of soil is that?`, kind: "num", answer: v, suffix: "cubic feet",
        hint: `Volume = length ${X} width ${X} height, even when one of them is a fraction.`,
        steps: [`${l} ${X} ${w} = ${l * w}`, `${l * w} ${X} ${fmt(depth)} = <b>${fmt(v)}</b> cubic feet`] };
    }
    if (t === "fund") {
      const goal = ri(30, 90) * 10, weeks = ri(4, 9), per = ri(12, 45) * 1 + ri(0, 3) * 0.25;
      const saved = Math.round(per * weeks * 100) / 100;
      const left = Math.round((goal - saved) * 100) / 100;
      if (left <= 0) return multiStep(d);
      return { prompt: `${U.name()} wants to save $${goal} for a bike, and saves $${per.toFixed(2)} each week for ${weeks} weeks. How much more money is still needed?`, kind: "num", answer: U.toRat(left), show: "dec", prefix: "$",
        hint: `First find the total saved: ${weeks} ${X} $${per.toFixed(2)}. Then subtract from $${goal}.`,
        steps: [`Saved: ${weeks} ${X} $${per.toFixed(2)} = $${saved.toFixed(2)}`, `$${goal} &minus; $${saved.toFixed(2)} = <b>$${left.toFixed(2)}</b>`] };
    }
    const km = ri(3, 9) + pick([0.5, 0.25, 0.75]), days = ri(3, 6);
    const tot = Math.round(km * days * 100) / 100;
    return { prompt: `${U.name()} bikes ${km} km each day for ${days} days. How many <b>meters</b> is that in all?`, kind: "num", answer: Math.round(tot * 1000), suffix: "meters",
      hint: `Find the total kilometers first. Then change km to meters (${X} 1,000).`,
      steps: [`${km} ${X} ${days} = ${tot} km`, `${tot} ${X} 1,000 = <b>${num(Math.round(tot * 1000))}</b> meters`] };
  };

  window.MQ.addUnit({
    id: "u8", n: 8, title: "Putting It All Together", short: "Grand Review", icon: "puzzle", hue: "var(--u8)",
    blurb: "Expressions, multi-step problems, and mixed review of the whole year.",
    review: true,
    bigIdea: `This unit connects everything. Expressions tell a story about the order of operations, and big problems are just small problems chained together. The tests here mix skills from <b>every unit</b>.`,
    lessons: [
      {
        id: "l1", title: "Grouping symbols", slides: [
          { t: "learn", title: "Who goes first?", body: `<ol class="steps"><li>Grouping symbols: ( ) parentheses, then [ ] brackets, then { } braces. Work from the inside out.</li><li>Multiply and divide, left to right.</li><li>Add and subtract, left to right.</li></ol><p class="formula">2 ${X} [5 + (6 &minus; 2)] = 2 ${X} [5 + 4] = 2 ${X} 9 = 18</p>` },
          { t: "check", skill: "exprEval", d: 1 },
          { t: "check", skill: "exprEval", d: 3 },
          { t: "check", skill: "exprEval", d: 5 },
        ],
      },
      {
        id: "l2", title: "Reading expressions like sentences", slides: [
          { t: "learn", title: "Expressions tell stories", body: `<p>"Add 8 and 7, then multiply by 2" → <b>(8 + 7) ${X} 2</b></p><p>You can also reason about an expression <b>without calculating</b>:</p><p class="formula">3 ${X} (18,932 + 921)</p><p>That is 3 times as large as 18,932 + 921, and you never need the actual sum!</p>` },
          { t: "check", skill: "exprWrite", d: 2 },
          { t: "check", skill: "exprWrite", d: 4 },
        ],
      },
      {
        id: "l3", title: "Problem-solving toolkit", slides: [
          { t: "learn", title: "Four moves for any problem", body: `<ol class="steps"><li><b>Understand:</b> What's the question? Underline it. What facts do you have?</li><li><b>Draw:</b> a tape diagram, an area model, a number line or a prism. Pictures catch mistakes.</li><li><b>Solve:</b> step by step. Write each step down.</li><li><b>Check:</b> Estimate. Does the answer make sense? Are the units right?</li></ol>`, tip: `Most mistakes in big problems happen in the reading, not the math. Read the question one more time before you answer.` },
          { t: "check", skill: "multiStep", d: 4 },
          { t: "check", skill: "multiStep", d: 5 },
        ],
      },
    ],
    skills: [
      { id: "exprEval", name: "Evaluating expressions", min: 1, max: 5, gen: exprEval },
      { id: "exprWrite", name: "Writing & reading expressions", min: 2, max: 5, gen: exprWrite },
      { id: "multiStep", name: "Multi-step problems", min: 3, max: 5, gen: multiStep },
    ],
  });
})();
