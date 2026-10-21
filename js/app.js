/* App shell: screens, question player, lessons, results, parent view. */
(function () {
  const MQ = window.MQ, U = MQ.U, V = MQ.V;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = () => MQ.state();
  const coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icon = V.icon;

  let route = "home";
  let quiz = null, results = null, lessonCtx = null, confirmLeave = false;

  /* ---------------- sound ---------------- */
  let actx = null;
  const tone = (freqs, type = "triangle", dur = 0.12, gap = 0.08, vol = 0.16) => {
    if (!S().sound) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        const t = actx.currentTime + i * gap;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + dur + 0.03);
      });
    } catch (e) { /* no audio */ }
  };
  const sfx = {
    good: () => tone([660, 880]),
    combo: () => tone([660, 830, 990, 1320], "triangle", 0.12, 0.06),
    bad: () => tone([240, 200], "sine", 0.16, 0.1, 0.12),
    win: () => tone([523, 659, 784, 1047, 1319], "triangle", 0.18, 0.09),
    tap: () => tone([520], "sine", 0.05, 0, 0.05),
  };

  /* ---------------- toast & confetti ---------------- */
  let toastT;
  const toast = (html) => {
    const t = $("#toast");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  };
  const confetti = () => {
    if (reduced) return;
    const c = $("#confetti"), ctx = c.getContext("2d");
    const W = (c.width = innerWidth), H = (c.height = innerHeight);
    const css = getComputedStyle(document.documentElement);
    const cols = ["--u1", "--u2", "--u3", "--u4", "--u5", "--u6", "--u7"].map((v) => css.getPropertyValue(v).trim() || "#4a7");
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.4, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, c: U.pick(cols) }));
    let fr = 0;
    c.style.display = "block";
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      P.forEach((p) => {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      });
      if (++fr < 120) requestAnimationFrame(step);
      else { ctx.clearRect(0, 0, W, H); c.style.display = "none"; }
    };
    step();
  };

  /* ---------------- Ask Cubo (Claude sample capability) ---------------- */
  let samplePromise = null, aiOK = !!(window.claude && typeof window.claude.use === "function");
  const getSample = () => (samplePromise = samplePromise || window.claude.use("sample").catch(() => null));
  const aiFmt = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>");
  const aiButton = (label = "Explain it another way") => (aiOK ? `<button type="button" class="btn ghost sm ai-btn" data-ai>${icon("chat")} ${label}</button><div class="ai-out" data-ai-out hidden></div>` : "");
  const runAI = async (root, buildPrompt) => {
    const out = $("[data-ai-out]", root), btn = $("[data-ai]", root);
    if (!out) return;
    out.hidden = false;
    btn.disabled = true;
    out.innerHTML = `<div class="ai-head">${V.cubo("think", 34)}<span>Cubo is thinking…</span></div><p class="ai-text"></p>`;
    const sample = await getSample();
    if (!sample) {
      aiOK = false;
      out.innerHTML = `<p class="muted">Cubo's explainer isn't available here. Read the steps above, or ask a grown-up to work through one with you.</p>`;
      return;
    }
    const txt = $(".ai-text", out);
    try {
      const res = await sample(buildPrompt(), { modelTier: "default", onText: ({ text }) => { txt.innerHTML = aiFmt(text); } });
      txt.innerHTML = aiFmt(res.text);
      $(".ai-head span", out).textContent = "Cubo says:";
      $(".ai-head", out).innerHTML = `${V.cubo("happy", 34)}<span>Cubo says:</span>`;
      btn.disabled = false;
      btn.innerHTML = `${icon("chat")} Explain it yet another way`;
    } catch (e) {
      if (e && e.code === "not_granted") { aiOK = false; out.innerHTML = `<p class="muted">Cubo's explainer was turned off for this page. A grown-up can turn it back on from the page's permissions.</p>`; return; }
      out.innerHTML = `<p class="muted">Cubo couldn't answer just now. Try again in a minute.</p>`;
      btn.disabled = false;
    }
  };
  const TUTOR = `You are Cubo, a warm, upbeat math tutor (a friendly cube) for a 9-year-old in a 4th-grade highly capable program who is learning the Illustrative Mathematics Grade 5 curriculum. Use plain words and short sentences. Use the representations IM uses (tape diagrams, area diagrams, number lines, place value charts, unit cubes, layers), described in words. Keep it under 120 words. No LaTeX, no headings, no lists longer than 4 items. You may use **bold** once or twice. Write fractions like 3/4 and mixed numbers like 2 1/3.`;

  /* ---------------- header ---------------- */
  const renderTop = () => {
    const st = S(), rk = MQ.rank();
    const streak = MQ.currentStreak();
    const sync = MQ.cloud.status === "synced" ? `<span class="chip sync" title="Progress is saved to this Claude account">${icon("check")} Saved</span>` : "";
    $("#topstats").innerHTML = `
      <span class="chip xp" title="${esc(rk.name)}">${icon("star")} <b>${U.num(st.xp)}</b> XP</span>
      <span class="chip streak ${streak ? "on" : ""}" title="Days in a row">${icon("flame")} <b>${streak}</b><span class="hide-sm"> day${streak === 1 ? "" : "s"}</span></span>
      ${sync}
      <button type="button" class="iconbtn" data-sound aria-label="${st.sound ? "Turn sound off" : "Turn sound on"}">${icon(st.sound ? "sound" : "mute")}</button>
      <button type="button" class="iconbtn" data-go="parent" aria-label="Grown-ups">${icon("parent")}<span class="hide-sm">Grown-ups</span></button>`;
  };

  /* ---------------- router ---------------- */
  const go = (r) => {
    if (route === "quiz" && r !== "quiz" && r !== "results" && quiz && !quiz.finished && !confirmLeave) {
      confirmLeave = r;
      renderQuizLeave();
      return;
    }
    confirmLeave = false;
    route = r;
    render();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };
  MQ.go = go;
  const render = () => {
    renderTop();
    const [name, a, b] = route.split("/");
    const v = $("#view");
    v.dataset.screen = name;
    if (name === "unit") return renderUnit(a);
    if (name === "lesson") return renderLesson(a, b);
    if (name === "quiz") return renderQuiz();
    if (name === "results") return renderResults();
    if (name === "parent") return renderParent();
    renderHome();
  };

  /* ---------------- shared bits ---------------- */
  const meter = (p, hue, label) => `<div class="meter" style="--h:${hue}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(p * 100)}" aria-label="${esc(label || "progress")}"><span style="width:${Math.max(0, Math.min(100, p * 100))}%"></span></div>`;
  const stars = (n, cls = "") => `<span class="stars ${cls}" aria-label="${n} of 3 stars">${[0, 1, 2].map((i) => `<span class="st ${i < n ? "on" : ""}">${icon("star")}</span>`).join("")}</span>`;
  const statusPill = (m) => {
    const L = MQ.masteryLabel(m);
    const ic = { good: "check", warn: "target", crit: "bolt", none: "" }[L.c];
    return `<span class="pill ${L.c}">${ic ? icon(ic) : ""}${L.t}</span>`;
  };

  const suggestNext = () => {
    const st = S();
    const order = st.focus ? [MQ.unitById(st.focus), ...MQ.units.filter((u) => u.id !== st.focus)] : MQ.units;
    for (const u of order) {
      const l = u.lessons.find((x) => !st.lessons[x.key]);
      if (l) return { u, label: l.title, sub: `Lesson ${u.lessons.indexOf(l) + 1} · Unit ${u.n}`, act: `lesson/${u.id}/${l.id}`, kind: "Learn" };
      const L = [1, 2, 3, 4, 5].find((x) => !((MQ.test(u.id, x) || {}).stars >= 1));
      if (L) return { u, label: `${MQ.LEVELS[L - 1].name} test`, sub: `Level ${L} · Unit ${u.n}`, act: `test:${u.id}:${L}`, kind: "Test" };
    }
    const u = MQ.units[MQ.units.length - 1];
    return { u, label: "Grand Review Boss", sub: "Keep your skills sharp", act: `test:${u.id}:5`, kind: "Test" };
  };

  /* ---------------- HOME ---------------- */
  const renderHome = () => {
    const st = S(), rk = MQ.rank();
    const pct = rk.next ? (st.xp - rk.floor) / (rk.next - rk.floor) : 1;
    const nx = suggestNext();
    const dailyDone = st.dailyLast === MQ.dayKey();
    const greet = st.name ? `Hi, ${esc(st.name)}!` : "Hi there!";
    const badges = MQ.BADGES.map((b) => `<li class="badge ${st.badges[b.id] ? "on" : ""}" title="${esc(b.desc)}">${icon(b.icon)}<span>${b.name}</span></li>`).join("");
    $("#view").innerHTML = `
      <section class="hero">
        <div class="hero-mascot">${V.cubo(st.xp > 0 ? "happy" : "star", 92)}</div>
        <div class="hero-main">
          <p class="eyebrow">Grade 5 math · Illustrative Mathematics order</p>
          <h1>${greet}</h1>
          <p class="rank">You're a <b>${rk.name}</b>${rk.next ? ` · ${U.num(rk.next - st.xp)} XP to <b>${rk.nextName}</b>` : " · top rank!"}</p>
          ${meter(pct, "var(--accent)", "XP to next rank")}
          ${st.name ? "" : `<form class="namerow" data-nameform><label for="kidname">What should Cubo call you?</label><div class="inline"><input id="kidname" class="txt" maxlength="20" autocomplete="off" placeholder="Your name"><button class="btn sm">Save</button></div></form>`}
        </div>
      </section>

      <section class="today">
        <button type="button" class="tcard next" style="--h:${nx.u.hue}" data-act="${nx.act}">
          <span class="tlabel">${icon("play")} Up next · ${nx.kind}</span>
          <span class="ttitle">${esc(nx.label)}</span>
          <span class="tsub">${esc(nx.sub)} · ${esc(nx.u.short)}</span>
        </button>
        <button type="button" class="tcard daily" data-act="daily">
          <span class="tlabel">${icon("bolt")} Daily warm-up ${dailyDone ? `<span class="pill good">${icon("check")}Done today</span>` : ""}</span>
          <span class="ttitle">10 mixed questions</span>
          <span class="tsub">Mostly from skills that need practice. Done ${st.dailyCount} time${st.dailyCount === 1 ? "" : "s"}.</span>
        </button>
      </section>

      <section>
        <div class="sec-head"><h2>Your units</h2>
          <label class="focus-sel" for="focusunit">In class we're on
            <select id="focusunit" data-focus><option value="">—</option>${MQ.units.map((u) => `<option value="${u.id}" ${st.focus === u.id ? "selected" : ""}>Unit ${u.n}</option>`).join("")}</select>
          </label>
        </div>
        <div class="units">
          ${MQ.units.map((u) => {
            const p = MQ.unitProgress(u);
            return `<button type="button" class="ucard ${st.focus === u.id ? "focus" : ""}" style="--h:${u.hue}" data-go="unit/${u.id}">
              <span class="uc-top"><span class="uc-icon">${icon(u.icon)}</span><span class="uc-n">Unit ${u.n}</span>${st.focus === u.id ? `<span class="pill inclass">In class now</span>` : ""}</span>
              <span class="uc-title">${esc(u.short)}</span>
              <span class="uc-blurb">${esc(u.blurb)}</span>
              ${meter(p, u.hue, `Unit ${u.n} progress`)}
              <span class="uc-stats"><span>${MQ.lessonsDone(u)}/${u.lessons.length} lessons</span><span>${icon("star")} ${MQ.unitStars(u.id)}/15</span></span>
            </button>`;
          }).join("")}
        </div>
      </section>

      <section>
        <div class="sec-head"><h2>Trophy shelf</h2><span class="muted">${Object.keys(st.badges).length} of ${MQ.BADGES.length} earned</span></div>
        <ul class="badges">${badges}</ul>
      </section>`;
  };

  /* ---------------- UNIT ---------------- */
  const renderUnit = (uid) => {
    const u = MQ.unitById(uid);
    if (!u) return go("home");
    const st = S();
    const lessons = u.lessons.map((l, i) => {
      const done = !!st.lessons[l.key];
      return `<li class="lrow ${done ? "done" : ""}"><span class="lnum">${done ? icon("check") : i + 1}</span>
        <span class="ltxt"><b>${esc(l.title)}</b><span class="muted">${l.slides.length} steps · ${l.slides.filter((s) => s.t === "check").length} quick checks</span></span>
        <button type="button" class="btn sm ${done ? "ghost" : ""}" data-go="lesson/${u.id}/${l.id}">${done ? "Review" : "Start"}</button></li>`;
    }).join("");
    const ladder = MQ.LEVELS.map((lv) => {
      const t = MQ.test(u.id, lv.L), open = MQ.levelUnlocked(u.id, lv.L);
      return `<li class="rung ${open ? "" : "locked"} ${t && t.stars ? "passed" : ""} ${lv.L === 5 ? "boss" : ""}">
        <span class="rnum">${lv.L}</span>
        <span class="rtxt"><b>${lv.name}</b><span class="muted">${lv.n} questions · ${lv.desc}</span>${t ? `<span class="muted small">Best ${Math.round(t.best * 100)}% · ${t.tries} tr${t.tries === 1 ? "y" : "ies"}</span>` : ""}</span>
        ${stars(t ? t.stars : 0)}
        ${open ? `<button type="button" class="btn sm ${t && t.stars === 3 ? "ghost" : ""}" data-act="test:${u.id}:${lv.L}">${t ? "Retry" : "Start"}</button>` : `<span class="lockmsg">${icon("lock")}<span>Pass level ${lv.L - 1}</span></span>`}
      </li>`;
    }).join("");
    const gymSkills = u.review ? u.skills : u.skills;
    const gym = gymSkills.map((s) => {
      const m = MQ.mastery(s.key), rec = st.skills[s.key];
      return `<li class="grow"><span class="gname">${esc(s.name)}<span class="muted small">${rec ? `${rec.c}/${rec.a} right first try` : "No practice yet"}</span></span>${statusPill(m)}<button type="button" class="btn sm ghost" data-act="practice:${s.key}">Practice</button></li>`;
    }).join("");
    $("#view").innerHTML = `
      <section class="uband" style="--h:${u.hue}">
        <button type="button" class="back" data-go="home">${icon("back")} All units</button>
        <div class="uband-row">
          <span class="uband-icon">${icon(u.icon)}</span>
          <div><p class="eyebrow">Unit ${u.n}</p><h1>${esc(u.title)}</h1></div>
        </div>
        <p class="bigidea"><span class="bi-label">${icon("bulb")} Big idea</span> ${u.bigIdea}</p>
        ${u.review ? `<p class="muted">Tests in this unit mix questions from all 8 units.</p>` : ""}
      </section>
      <div class="ucols">
        <section class="panel"><h2>${icon("book")} Learn</h2><ol class="lessons">${lessons}</ol></section>
        <section class="panel"><h2>${icon("trophy")} Test ladder</h2><p class="muted small">Score 80% to unlock the next level. 90% earns 2 stars and 100% earns 3. Questions are new every time.</p><ol class="ladder">${ladder}</ol></section>
      </div>
      <section class="panel"><h2>${icon("target")} Skill gym</h2><p class="muted small">10 questions on one skill. They get harder when you're right and easier when you're stuck.</p><ul class="gym">${gym}</ul></section>`;
  };

  /* ---------------- QUESTION PLAYER ---------------- */
  // mount a question; opts: { onResult(res) -> xp, onNext(), nextLabel, compact }
  const mountQuestion = (el, q, opts) => {
    let tries = 0, done = false, sel = null, firstGiven = "";
    const skill = MQ.skills[q.skill];
    const isNum = q.kind === "num", isPt = q.kind === "pt";
    const keys = isPt ? ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ",", "⌫"] : ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "/", "␣", "⌫"];
    const answerArea = q.kind === "mc"
      ? `<div class="choices ${q.choices.length > 3 ? "" : "few"}" role="group" aria-label="Choices">${q.choices.map((c, i) => `<button type="button" class="choice" data-i="${i}"><span class="ck">${i + 1}</span><span class="ct">${c}</span></button>`).join("")}</div>`
      : `<div class="inrow">${q.prefix ? `<span class="affix">${q.prefix}</span>` : ""}<input id="qin" class="ans" autocomplete="off" spellcheck="false" ${coarse ? 'inputmode="none"' : ""} placeholder="${isPt ? "(x, y)" : "your answer"}" aria-label="Your answer">${q.suffix ? `<span class="affix">${esc(q.suffix)}</span>` : ""}<span class="preview" aria-hidden="true"></span></div>
         <div class="keypad ${isPt ? "pt" : ""}">${keys.map((k) => `<button type="button" class="key ${k === "⌫" ? "del" : ""}" data-k="${k}" aria-label="${k === "␣" ? "space (for mixed numbers)" : k === "⌫" ? "delete" : k}">${k === "␣" ? "space" : k}</button>`).join("")}</div>
         ${isNum ? `<p class="muted small inhelp">Fractions: 3/4 · Mixed numbers: 2 1/3 (use space) · Decimals: 0.25</p>` : ""}`;
    el.innerHTML = `
      <article class="qcard" style="--h:${skill.unit.hue}">
        ${opts.compact ? "" : `<div class="qmeta"><span class="tag">${esc(skill.name)}</span><span class="tag lvl">Level ${q.d}</span></div>`}
        <div class="qprompt">${q.prompt}</div>
        ${q.visual ? `<div class="qvis">${q.visual}</div>` : ""}
        <div class="qans">${answerArea}</div>
        <div class="qfb" aria-live="polite"></div>
        <div class="qactions"><button type="button" class="btn primary big" data-check>Check</button></div>
      </article>`;
    const fb = $(".qfb", el), btn = $("[data-check]", el), inp = $("#qin", el);
    const prev = $(".preview", el);
    const showPreview = () => {
      if (!prev || !isNum) return;
      const s = inp.value.trim().replace(/\$/g, "");
      let m;
      if ((m = s.match(/^(\d+) (\d+)\/(\d+)$/))) prev.innerHTML = `= ${U.mixed(m[1], m[2], m[3])}`;
      else if ((m = s.match(/^(\d+)\/(\d+)$/))) prev.innerHTML = `= ${U.f(m[1], m[2])}`;
      else prev.innerHTML = "";
    };
    if (inp) {
      inp.addEventListener("input", showPreview);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
      $$(".key", el).forEach((k) => k.addEventListener("click", () => {
        if (done) return;
        const v = k.dataset.k;
        if (v === "⌫") inp.value = inp.value.slice(0, -1);
        else if (v === "␣") inp.value += " ";
        else inp.value += v;
        showPreview();
        if (!coarse) inp.focus();
      }));
      if (!coarse) setTimeout(() => inp.focus({ preventScroll: true }), 30);
    }
    $$(".choice", el).forEach((c) => c.addEventListener("click", () => {
      if (done) return;
      sel = +c.dataset.i;
      $$(".choice", el).forEach((x) => x.classList.toggle("sel", x === c));
      sfx.tap();
    }));
    el.onkeydown = (e) => {
      if (q.kind === "mc" && /^[1-9]$/.test(e.key) && !done) {
        const c = $$(".choice", el)[+e.key - 1];
        if (c) c.click();
      } else if (e.key === "Enter" && q.kind === "mc") { e.preventDefault(); submit(); }
    };
    const solutionHTML = () => `
      <div class="solution">
        <p class="sol-ans">Answer: <b>${MQ.answerHTML(q)}</b></p>
        <ol class="steps">${(q.steps || []).map((s) => `<li>${s}</li>`).join("")}</ol>
        ${q.note ? `<p class="muted small">${q.note}</p>` : ""}
        ${aiButton()}
      </div>`;
    const finish = (res) => {
      done = true;
      const xp = opts.onResult ? opts.onResult(res) : 0;
      btn.textContent = opts.nextLabel || "Next";
      btn.classList.add("next");
      if (inp) inp.readOnly = true;
      el.classList.add("answered");
      return xp;
    };
    const submit = () => {
      if (done) { opts.onNext && opts.onNext(); return; }
      const raw = q.kind === "mc" ? sel : inp.value.trim();
      if (raw == null || raw === "") {
        fb.innerHTML = `<p class="nudge">${q.kind === "mc" ? "Pick an answer first." : "Type an answer first."}</p>`;
        return;
      }
      if (isNum && !U.parse(String(raw).replace(/\$/g, ""))) {
        fb.innerHTML = `<p class="nudge">I can't read that. Try a form like <b>12</b>, <b>3/4</b>, <b>2 1/3</b> or <b>0.25</b>.</p>`;
        return;
      }
      if (isPt && !U.parsePoint(raw)) {
        fb.innerHTML = `<p class="nudge">Type two numbers, like <b>(3, 5)</b>.</p>`;
        return;
      }
      tries++;
      const given = q.kind === "mc" ? U.strip(q.choices[raw]) : String(raw);
      if (tries === 1) firstGiven = given;
      const ok = MQ.check(q, raw);
      if (q.kind === "mc") $$(".choice", el).forEach((c) => c.classList.remove("sel"));
      if (ok) {
        const xp = finish({ firstTry: tries === 1, solved: true, given: firstGiven });
        if (q.kind === "mc") $$(".choice", el)[q.answer].classList.add("right");
        const praise = tries === 1 ? U.pick(["Nailed it!", "Yes! That's right.", "Exactly right!", "Great thinking!", "Correct!", "You've got it!"]) : U.pick(["You fixed it! Nice.", "Got it on the second try!", "That's it. Good recovery!"]);
        fb.innerHTML = `<div class="fb good">${V.cubo("star", 44)}<div><p><b>${praise}</b>${xp ? ` <span class="xpgain">+${xp} XP</span>` : ""}</p>${tries > 1 ? `<details><summary>See the full solution</summary>${solutionHTML()}</details>` : ""}</div></div>`;
        (opts.comboBoost && opts.comboBoost() ? sfx.combo : sfx.good)();
      } else if (tries === 1) {
        if (q.kind === "mc") $$(".choice", el)[raw].classList.add("wrong");
        fb.innerHTML = `<div class="fb hint">${V.cubo("think", 44)}<div><p><b>Not quite. Try once more!</b></p><p>${icon("bulb")} ${q.hint || "Read the question again carefully."}</p></div></div>`;
        sfx.bad();
        if (inp) { inp.select(); el.querySelector(".qcard").classList.add("shake"); setTimeout(() => el.querySelector(".qcard").classList.remove("shake"), 400); }
      } else {
        finish({ firstTry: false, solved: false, given: firstGiven });
        if (q.kind === "mc") { $$(".choice", el)[raw].classList.add("wrong"); $$(".choice", el)[q.answer].classList.add("right"); }
        fb.innerHTML = `<div class="fb sol">${V.cubo("sad", 44)}<div><p><b>Let's look at it together.</b> This one goes into your fix-it list.</p>${solutionHTML()}</div></div>`;
        sfx.bad();
      }
      const aiB = $("[data-ai]", fb);
      if (aiB) aiB.addEventListener("click", () => runAI(fb, () => `${TUTOR}\n\nThe student is working on: ${skill.name} (${skill.unit.title}).\nProblem: ${U.strip(q.prompt)}\nCorrect answer: ${MQ.answerText(q)}\nStudent's first answer: ${firstGiven}${tries > 1 && !ok ? "" : ""}\nWorked steps the student already saw: ${(q.steps || []).map(U.strip).join(" | ")}\n\nExplain the idea a DIFFERENT way than those steps: try a picture described in words, an everyday example, or the same problem with smaller numbers first. If the student's answer shows a specific misconception, gently name it. End with one tiny practice question for the student to try (do not give its answer).`));
    };
    btn.addEventListener("click", submit);
  };

  /* ---------------- QUIZ ---------------- */
  const startQuiz = (cfg) => {
    quiz = Object.assign({ i: 0, results: [], combo: 0, xp: 0, finished: false }, cfg);
    quiz.n = quiz.thunks.length;
    quiz.seen = new Set();
    nextQ();
    confirmLeave = false;
    route = "quiz";
    render();
    window.scrollTo({ top: 0 });
  };
  const nextQ = () => {
    let q;
    for (let t = 0; t < 6; t++) {
      q = quiz.thunks[quiz.i]();
      const sig = U.strip(q.prompt) + (q.visual || "").length;
      if (!quiz.seen.has(sig)) { quiz.seen.add(sig); break; }
    }
    quiz.q = q;
  };
  const renderQuizLeave = () => {
    const box = $(".leave");
    if (!box) return;
    box.hidden = false;
    $("[data-stay]", box).focus();
  };
  const renderQuiz = () => {
    if (!quiz) return go("home");
    const u = quiz.unit;
    const pct = quiz.i / quiz.n;
    $("#view").innerHTML = `
      <div class="qtop" style="--h:${u ? u.hue : "var(--accent)"}">
        <button type="button" class="iconbtn" data-go="${u ? `unit/${u.id}` : "home"}" aria-label="Leave">${icon("back")}</button>
        <div class="qtitle"><b>${esc(quiz.title)}</b><span class="muted small">Question ${quiz.i + 1} of ${quiz.n}</span></div>
        ${meter(pct, u ? u.hue : "var(--accent)", "quiz progress")}
        <span class="combo ${quiz.combo >= 3 ? "hot" : ""}" title="Right in a row">${icon("flame")}${quiz.combo}</span>
      </div>
      <div class="leave" hidden role="alertdialog" aria-label="Leave this round?">
        <p><b>Leave this round?</b> Answers so far still count toward your skills, but the round won't be scored.</p>
        <div class="btnrow"><button type="button" class="btn ghost" data-stay>Keep going</button><button type="button" class="btn danger" data-leave>Leave</button></div>
      </div>
      <div class="qhost"></div>`;
    $("[data-stay]").addEventListener("click", () => { confirmLeave = false; $(".leave").hidden = true; });
    $("[data-leave]").addEventListener("click", () => { const r = confirmLeave; quiz.finished = true; confirmLeave = false; go(typeof r === "string" ? r : "home"); });
    mountQuestion($(".qhost"), quiz.q, {
      nextLabel: quiz.i + 1 >= quiz.n ? "See results" : "Next question",
      comboBoost: () => quiz.combo > 0 && quiz.combo % 5 === 0,
      onResult: (res) => {
        const xp0 = MQ.record(quiz.q, res);
        let xp = xp0;
        if (res.firstTry) {
          quiz.combo++;
          if (quiz.combo % 5 === 0) { xp += 10; MQ.addXP(10); toast(`${icon("flame")} ${quiz.combo} in a row! +10 bonus XP`); }
          S().bestCombo = Math.max(S().bestCombo, quiz.combo);
        } else quiz.combo = 0;
        quiz.xp += xp;
        quiz.results.push({ q: quiz.q, ...res });
        if (quiz.thunks.adapt) quiz.thunks.adapt(res.firstTry);
        MQ.save();
        const c = $(".combo"); if (c) { c.innerHTML = `${icon("flame")}${quiz.combo}`; c.classList.toggle("hot", quiz.combo >= 3); }
        renderTop();
        return xp;
      },
      onNext: () => {
        quiz.i++;
        if (quiz.i >= quiz.n) return finishQuiz();
        nextQ();
        renderQuiz();
        window.scrollTo({ top: 0 });
      },
    });
  };

  const finishQuiz = () => {
    quiz.finished = true;
    const score = quiz.results.reduce((s, r) => s + (r.firstTry ? 1 : r.solved ? 0.5 : 0), 0);
    const pct = score / quiz.n;
    const firstRight = quiz.results.filter((r) => r.firstTry).length;
    const out = { mode: quiz.mode, title: quiz.title, unit: quiz.unit, L: quiz.L, pct, firstRight, n: quiz.n, xp: quiz.xp, misses: quiz.results.filter((r) => !r.firstTry), skillKey: quiz.skillKey };
    if (quiz.mode === "test") { const r = MQ.finishTest(quiz.unit.id, quiz.L, pct); Object.assign(out, r); out.xp += r.xp; }
    if (quiz.mode === "daily") out.xp += MQ.finishDaily();
    out.badges = MQ.checkBadges({ fixedAll: quiz.mode === "fix" && out.misses.length === 0 });
    MQ.save(true);
    results = out;
    route = "results";
    render();
    window.scrollTo({ top: 0 });
    if ((quiz.mode === "test" && out.stars >= 1) || (quiz.mode !== "test" && pct >= 0.8)) { sfx.win(); confetti(); }
  };

  const startTest = (uid, L) => {
    const u = MQ.unitById(uid);
    if (!MQ.levelUnlocked(uid, L)) return toast(`Pass level ${L - 1} first`);
    startQuiz({ mode: "test", unit: u, L, title: `Unit ${u.n} · Level ${L}: ${MQ.LEVELS[L - 1].name}`, thunks: MQ.buildTest(u, L) });
  };
  const startPractice = (key) => {
    const s = MQ.skills[key];
    startQuiz({ mode: "practice", unit: s.unit, skillKey: key, title: `Skill gym · ${s.name}`, thunks: MQ.buildPractice(key) });
  };
  const startDaily = () => startQuiz({ mode: "daily", unit: null, title: "Daily warm-up", thunks: MQ.buildDaily() });
  const startFix = (misses, unit) => startQuiz({ mode: "fix", unit, title: "Fix my mistakes", thunks: misses.map((m) => () => MQ.gen(m.q.skill, m.q.d)) });

  /* ---------------- RESULTS ---------------- */
  const renderResults = () => {
    const r = results;
    if (!r) return go("home");
    const pctTxt = Math.round(r.pct * 100);
    let headline, mood;
    if (r.mode === "test") {
      if (r.stars === 3) { headline = "Perfect score!"; mood = "star"; }
      else if (r.stars >= 1) { headline = r.L < 5 ? `Level passed! Level ${r.L + 1} is unlocked.` : "Boss beaten!"; mood = "star"; }
      else { headline = pctTxt >= 65 ? `So close! You need 80% to pass.` : `Good effort. Let's build it up.`; mood = "think"; }
    } else if (r.mode === "fix") { headline = r.misses.length ? "Better! A few still need work." : "Every mistake fixed!"; mood = r.misses.length ? "think" : "star"; }
    else { headline = r.pct >= 0.8 ? "Great round!" : "Nice work practicing!"; mood = r.pct >= 0.8 ? "star" : "happy"; }
    const u = r.unit;
    const advice = r.mode === "test" && !r.stars
      ? `<p class="advice">${icon("bulb")} Tip: try the <b>Skill gym</b> for the skills below, or review the lesson, then come back. The questions will be new.</p>` : "";
    const missList = r.misses.map((m) => `<li><div class="mq">${m.q.prompt}</div>${m.q.visual && m.q.visual.length < 9000 ? `<div class="mvis">${m.q.visual}</div>` : ""}<p class="small">You said <b>${esc(m.given || "—")}</b> · Answer <b>${MQ.answerHTML(m.q)}</b></p></li>`).join("");
    const weakSkills = [...new Set(r.misses.map((m) => m.q.skill))];
    $("#view").innerHTML = `
      <section class="results" style="--h:${u ? u.hue : "var(--accent)"}">
        <div class="res-mascot">${V.cubo(mood, 110)}</div>
        <p class="eyebrow">${esc(r.title)}</p>
        <h1>${headline}</h1>
        ${r.mode === "test" ? `<div class="res-stars">${stars(r.stars, "big pop")}</div>` : ""}
        <div class="res-nums">
          <div><span class="big-n">${pctTxt}%</span><span class="muted">score</span></div>
          <div><span class="big-n">${r.firstRight}/${r.n}</span><span class="muted">right first try</span></div>
          <div><span class="big-n">+${r.xp}</span><span class="muted">XP</span></div>
        </div>
        ${r.badges && r.badges.length ? `<div class="newbadges">${r.badges.map((b) => `<span class="badge on">${icon(b.icon)}<span>New badge: <b>${b.name}</b></span></span>`).join("")}</div>` : ""}
        ${advice}
        <div class="btnrow center">
          ${r.misses.length ? `<button type="button" class="btn primary" data-act="fix">${icon("redo")} Fix my mistakes (${r.misses.length})</button>` : ""}
          ${r.mode === "test" && r.stars >= 1 && r.L < 5 ? `<button type="button" class="btn ${r.misses.length ? "" : "primary"}" data-act="test:${u.id}:${r.L + 1}">Next level</button>` : ""}
          ${r.mode === "test" ? `<button type="button" class="btn ghost" data-act="test:${u.id}:${r.L}">Retry level ${r.L}</button>` : ""}
          ${r.mode === "practice" ? `<button type="button" class="btn ghost" data-act="practice:${r.skillKey}">10 more</button>` : ""}
          <button type="button" class="btn ghost" data-go="${u ? `unit/${u.id}` : "home"}">${u ? "Back to unit" : "Home"}</button>
        </div>
      </section>
      ${weakSkills.length ? `<section class="panel"><h2>${icon("target")} Practice these skills</h2><ul class="gym">${weakSkills.map((k) => `<li class="grow"><span class="gname">${esc(MQ.skills[k].name)}<span class="muted small">Unit ${MQ.skills[k].unit.n}</span></span>${statusPill(MQ.mastery(k))}<button type="button" class="btn sm ghost" data-act="practice:${k}">Practice</button></li>`).join("")}</ul></section>` : ""}
      ${r.misses.length ? `<section class="panel"><h2>Review your misses</h2><ol class="misses">${missList}</ol></section>` : ""}`;
  };

  /* ---------------- LESSON ---------------- */
  const renderLesson = (uid, lid) => {
    const u = MQ.unitById(uid), l = u && u.lessons.find((x) => x.id === lid);
    if (!l) return go("home");
    if (!lessonCtx || lessonCtx.l !== l) lessonCtx = { u, l, i: 0, ok: new Set(), done: false };
    const c = lessonCtx;
    if (c.done) return renderLessonDone();
    const s = l.slides[c.i];
    const isCheck = s.t === "check";
    const canNext = !isCheck || c.ok.has(c.i);
    const dots = l.slides.map((x, i) => `<span class="dot ${i === c.i ? "cur" : i < c.i ? "past" : ""} ${x.t}" aria-hidden="true"></span>`).join("");
    $("#view").innerHTML = `
      <div class="lesson" style="--h:${u.hue}">
        <div class="ltop">
          <button type="button" class="back" data-go="unit/${u.id}">${icon("back")} Unit ${u.n}</button>
          <div class="ltitle"><p class="eyebrow">Lesson ${u.lessons.indexOf(l) + 1}</p><h1>${esc(l.title)}</h1></div>
          <div class="dots" aria-label="Step ${c.i + 1} of ${l.slides.length}">${dots}</div>
        </div>
        <article class="slide ${s.t}">
          ${isCheck ? `<p class="slide-kind">${icon("target")} Quick check</p><div class="qhost"></div>` : `
            <p class="slide-kind">${s.t === "play" ? `${icon("play")} Try it` : `${icon("book")} Learn`}</p>
            <h2>${s.title}</h2>
            <div class="sbody">${s.body}</div>
            ${s.widget ? `<div class="widget"></div>` : ""}
            ${s.tip ? `<aside class="tip">${icon("bulb")}<div><b>Cubo's tip</b><p>${s.tip}</p></div></aside>` : ""}
            ${s.t === "learn" ? `<div class="ai-wrap">${aiButton("Explain this differently")}</div>` : ""}`}
        </article>
        <nav class="lnav">
          <button type="button" class="btn ghost" data-lprev ${c.i === 0 ? "disabled" : ""}>Back</button>
          <span class="muted small">${c.i + 1} / ${l.slides.length}</span>
          <button type="button" class="btn primary" data-lnext ${canNext ? "" : "disabled"}>${c.i === l.slides.length - 1 ? "Finish lesson" : "Next"}</button>
        </nav>
      </div>`;
    if (s.widget) s.widget($(".widget"));
    if (isCheck) {
      const q = MQ.gen(`${u.id}.${s.skill}`, s.d);
      mountQuestion($(".qhost"), q, {
        compact: false,
        nextLabel: c.i === l.slides.length - 1 ? "Finish lesson" : "Continue",
        onResult: (res) => { const xp = MQ.record(q, res); c.ok.add(c.i); MQ.save(); renderTop(); $("[data-lnext]").disabled = false; return xp; },
        onNext: () => advance(),
      });
    }
    const aiWrap = $(".ai-wrap");
    if (aiWrap && $("[data-ai]", aiWrap)) $("[data-ai]", aiWrap).addEventListener("click", () => runAI(aiWrap, () => `${TUTOR}\n\nThe student is reading a lesson called "${l.title}" in ${u.title}. This is the part they want explained differently:\nTitle: ${U.strip(s.title)}\nText: ${U.strip(s.body)}\n${s.tip ? "Tip: " + U.strip(s.tip) : ""}\n\nExplain the same idea in a fresh way, with a different everyday example and small numbers. End with one quick question to check understanding (do not give its answer).`));
    $("[data-lprev]").addEventListener("click", () => { if (c.i > 0) { c.i--; renderLesson(uid, lid); window.scrollTo({ top: 0 }); } });
    $("[data-lnext]").addEventListener("click", advance);
  };
  const advance = () => {
    const c = lessonCtx;
    if (c.i < c.l.slides.length - 1) { c.i++; renderLesson(c.u.id, c.l.id); window.scrollTo({ top: 0 }); return; }
    c.done = true;
    c.xp = MQ.completeLesson(c.l);
    c.badges = MQ.checkBadges();
    MQ.save(true);
    sfx.win(); confetti();
    renderLessonDone();
  };
  const renderLessonDone = () => {
    const c = lessonCtx, u = c.u;
    const idx = u.lessons.indexOf(c.l), nextL = u.lessons[idx + 1];
    const skillIds = [...new Set(c.l.slides.filter((s) => s.t === "check").map((s) => `${u.id}.${s.skill}`))];
    renderTop();
    $("#view").innerHTML = `
      <section class="results" style="--h:${u.hue}">
        <div class="res-mascot">${V.cubo("star", 110)}</div>
        <p class="eyebrow">Unit ${u.n} · Lesson ${idx + 1}</p>
        <h1>Lesson complete!</h1>
        <p class="lead">${esc(c.l.title)}${c.xp ? ` · <span class="xpgain">+${c.xp} XP</span>` : ""}</p>
        ${c.badges && c.badges.length ? `<div class="newbadges">${c.badges.map((b) => `<span class="badge on">${icon(b.icon)}<span>New badge: <b>${b.name}</b></span></span>`).join("")}</div>` : ""}
        <div class="btnrow center">
          ${nextL ? `<button type="button" class="btn primary" data-go="lesson/${u.id}/${nextL.id}">Next lesson: ${esc(nextL.title)}</button>` : `<button type="button" class="btn primary" data-act="test:${u.id}:1">Start the Level 1 test</button>`}
          <button type="button" class="btn ghost" data-go="unit/${u.id}">Back to unit</button>
        </div>
      </section>
      <section class="panel"><h2>${icon("target")} Lock it in with practice</h2><ul class="gym">${skillIds.map((k) => `<li class="grow"><span class="gname">${esc(MQ.skills[k].name)}</span>${statusPill(MQ.mastery(k))}<button type="button" class="btn sm ghost" data-act="practice:${k}">Practice</button></li>`).join("")}</ul></section>`;
    lessonCtx = null;
  };

  /* ---------------- PARENT ---------------- */
  let resetArm = false;
  const renderParent = () => {
    const st = S();
    const totalLessons = MQ.units.reduce((s, u) => s + u.lessons.length, 0);
    const doneLessons = Object.keys(st.lessons).length;
    const totalStars = MQ.units.reduce((s, u) => s + MQ.unitStars(u.id), 0);
    const acc = st.total ? Math.round((st.correct / st.total) * 100) : null;
    let siteKey = false;
    try { siteKey = !!localStorage.getItem("cubo-site-key"); } catch (e) { /* storage unavailable */ }
    // last 14 days activity
    const days = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = MQ.dayKey(d); days.push({ k, d, ...(st.log[k] || { q: 0, c: 0 }) }); }
    const activeDays = days.filter((d) => d.q > 0).length;
    const maxQ = Math.max(10, ...days.map((d) => d.q));
    const W = 560, H = 150, bw = W / 14;
    const bars = days.map((d, i) => {
      const h = d.q ? Math.max(4, (d.q / maxQ) * (H - 28)) : 0;
      const x = i * bw + 6, y = H - 22 - h;
      const lab = d.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      return `<g class="bar" tabindex="0" data-tip="${esc(lab)}: ${d.q} question${d.q === 1 ? "" : "s"}${d.q ? `, ${Math.round((d.c / d.q) * 100)}% right first try` : ""}">
        <rect x="${i * bw}" y="0" width="${bw}" height="${H - 22}" class="hit"/>
        ${h ? `<path d="M${x} ${H - 22} V${y + 4} q0 -4 4 -4 H${x + bw - 16} q4 0 4 4 V${H - 22} Z" class="barfill"/>` : `<rect x="${x}" y="${H - 24}" width="${bw - 12}" height="2" class="barzero"/>`}
        ${i % 2 === 1 || i === 13 ? V.text(i * bw + bw / 2, H - 8, d.d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }), "lbl sm") : ""}
      </g>`;
    }).join("");
    const chart = `<svg viewBox="0 0 ${W} ${H}" class="actchart" role="img" aria-label="Questions answered per day, last 14 days"><line x1="0" y1="${H - 22}" x2="${W}" y2="${H - 22}" class="axis"/>${bars}</svg>`;
    const weak = Object.keys(st.skills).filter((k) => MQ.skills[k]).map((k) => ({ k, m: MQ.mastery(k) })).filter((x) => x.m != null && x.m < 0.85).sort((a, b) => a.m - b.m).slice(0, 8);
    const unitRows = MQ.units.map((u) => `<tr><th scope="row"><span class="sw" style="--h:${u.hue}"></span>Unit ${u.n} · ${esc(u.short)}</th><td class="num">${MQ.lessonsDone(u)}/${u.lessons.length}</td>${[1, 2, 3, 4, 5].map((L) => { const t = MQ.test(u.id, L); return `<td class="num lvcell">${t ? `${"★".repeat(t.stars)}${"☆".repeat(3 - t.stars)}<span class="muted small">${Math.round(t.best * 100)}%</span>` : `<span class="muted">—</span>`}</td>`; }).join("")}<td>${meter(MQ.unitProgress(u), u.hue, `Unit ${u.n}`)}</td></tr>`).join("");
    const mistakes = st.mistakes.slice(0, 15).map((m) => { const s = MQ.skills[m.skill]; return `<tr><td class="nowrap">${new Date(m.t).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td><td>${s ? `U${s.unit.n} · ${esc(s.name)}` : ""}</td><td>${esc(m.q)}</td><td>${esc(m.given)}</td><td><b>${esc(m.answer)}</b></td></tr>`; }).join("");
    $("#view").innerHTML = `
      <section class="parent">
        <button type="button" class="back" data-go="home">${icon("back")} Back to the app</button>
        <p class="eyebrow">For grown-ups</p>
        <h1>Progress report${st.name ? ` for ${esc(st.name)}` : ""}</h1>
        <div class="tiles">
          <div class="tile"><span class="tv">${U.num(st.total)}</span><span class="tl">questions answered</span></div>
          <div class="tile"><span class="tv">${acc == null ? "—" : acc + "%"}</span><span class="tl">right on the first try</span></div>
          <div class="tile"><span class="tv">${doneLessons}/${totalLessons}</span><span class="tl">lessons finished</span></div>
          <div class="tile"><span class="tv">${totalStars}/${MQ.units.length * 15}</span><span class="tl">test stars earned</span></div>
          <div class="tile"><span class="tv">${MQ.currentStreak()}</span><span class="tl">day streak · ${activeDays} of last 14 days active</span></div>
        </div>
      </section>
      <section class="panel"><h2>Activity, last 14 days</h2><p class="muted small">Questions answered each day. Hover or tap a bar for details.</p>
        <div class="chartwrap">${chart}<div class="ctip" hidden></div></div>
        <details><summary>Show as a table</summary><div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Day</th><th class="num">Questions</th><th class="num">Right first try</th></tr></thead><tbody>${days.map((d) => `<tr><td>${d.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td><td class="num">${d.q}</td><td class="num">${d.c}</td></tr>`).join("")}</tbody></table></div></details>
      </section>
      <section class="panel"><h2>Skills that need attention</h2>
        ${weak.length ? `<ul class="gym">${weak.map(({ k, m }) => `<li class="grow"><span class="gname">${esc(MQ.skills[k].name)}<span class="muted small">Unit ${MQ.skills[k].unit.n} · last ${Math.min(10, st.skills[k].r.length)} tries: ${Math.round(m * 100)}% right first try</span></span>${statusPill(m)}<button type="button" class="btn sm ghost" data-act="practice:${k}">Practice</button></li>`).join("")}</ul>`
          : `<p class="empty">${st.total < 10 ? "Not enough answers yet. Skills show up here after 3 or more tries." : "Nothing flagged. Every practiced skill is at 85% or better on recent tries."}</p>`}
      </section>
      <section class="panel"><h2>Units</h2><div class="tbl-wrap"><table class="tbl units-t"><thead><tr><th>Unit</th><th class="num">Lessons</th>${MQ.LEVELS.map((l) => `<th class="num">L${l.L}</th>`).join("")}<th>Progress</th></tr></thead><tbody>${unitRows}</tbody></table></div></section>
      <section class="panel"><h2>Recent mistakes</h2>${mistakes ? `<div class="tbl-wrap"><table class="tbl small"><thead><tr><th>When</th><th>Skill</th><th>Question</th><th>Answered</th><th>Correct</th></tr></thead><tbody>${mistakes}</tbody></table></div>` : `<p class="empty">No mistakes recorded yet.</p>`}</section>
      <section class="panel guide"><h2>How this app works</h2>
        <ul>
          <li><b>Units follow the Illustrative Mathematics Grade 5 order.</b> Use "In class we're on" on the home screen so "Up next" follows the class.</li>
          <li><b>Lessons</b> explain each idea with pictures and interactive models, with quick checks along the way.</li>
          <li><b>Test ladder:</b> 5 levels per unit (Warm-up → Boss). 80% unlocks the next level. Every attempt generates new questions, so retrying gives fresh practice.</li>
          <li><b>When an answer is wrong:</b> first a hint, then the full worked solution. Missed questions can be redone right away with "Fix my mistakes".</li>
          <li><b>Daily warm-up:</b> 10 mixed questions weighted toward weaker skills. That's spaced review, which helps memory most.</li>
          <li><b>A good routine:</b> warm-up (5 min) + one lesson or one test level (15 min), 4–5 days a week.</li>
          <li><b>Progress</b> is saved in this browser${MQ.cloud.status === "synced" ? " and to this Claude account, so it follows you across devices" : ""}.</li>
        </ul>
      </section>
      <section class="panel"><h2>Settings</h2>
        <div class="settings">
          <label for="set-name">Child's name<input id="set-name" class="txt" maxlength="20" value="${esc(st.name)}" autocomplete="off"></label>
          <label class="check"><input type="checkbox" id="set-sound" ${st.sound ? "checked" : ""}> Sound effects</label>
          ${siteKey ? `<div class="reset"><p class="muted small">This device remembers the website password.</p><button type="button" class="btn ghost" data-forget>Forget the password on this device</button></div>` : ""}
          <div class="reset">${resetArm ? `<p><b>Erase all progress?</b> Lessons, stars, XP and badges will be gone. This can't be undone.</p><div class="btnrow"><button type="button" class="btn ghost" data-reset-no>Cancel</button><button type="button" class="btn danger" data-reset-yes>Erase everything</button></div>` : `<button type="button" class="btn ghost" data-reset>Reset progress…</button>`}</div>
        </div>
      </section>`;
    // chart tooltip
    const tip = $(".ctip"), wrap = $(".chartwrap");
    $$(".bar", wrap).forEach((b) => {
      const show = () => { const r = b.getBoundingClientRect(), w = wrap.getBoundingClientRect(); tip.textContent = b.dataset.tip; tip.hidden = false; tip.style.left = `${Math.min(w.width - 180, Math.max(0, r.left - w.left + r.width / 2 - 90))}px`; };
      b.addEventListener("mouseenter", show); b.addEventListener("focus", show); b.addEventListener("click", show);
      b.addEventListener("mouseleave", () => (tip.hidden = true)); b.addEventListener("blur", () => (tip.hidden = true));
    });
    $("#set-name").addEventListener("change", (e) => { S().name = e.target.value.trim().slice(0, 20); MQ.save(); toast("Name saved"); });
    $("#set-sound").addEventListener("change", (e) => { S().sound = e.target.checked; MQ.save(); renderTop(); });
    const fg = $("[data-forget]");
    if (fg) fg.addEventListener("click", () => { try { localStorage.removeItem("cubo-site-key"); } catch (e) { /* ignore */ } toast("This device will ask for the password next time."); renderParent(); });
    const rs = $("[data-reset]"); if (rs) rs.addEventListener("click", () => { resetArm = true; renderParent(); });
    const rn = $("[data-reset-no]"); if (rn) rn.addEventListener("click", () => { resetArm = false; renderParent(); });
    const ry = $("[data-reset-yes]"); if (ry) ry.addEventListener("click", () => { resetArm = false; MQ.resetAll(); toast("Progress erased"); renderParent(); });
  };

  /* ---------------- global events ---------------- */
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const a = e.target.closest("[data-act]");
    if (a) {
      const [k, x, y] = a.dataset.act.split(":");
      if (k === "test") startTest(x, +y);
      else if (k === "practice") startPractice(x);
      else if (k === "daily") startDaily();
      else if (k === "fix" && results) startFix(results.misses, results.unit);
      else if (a.dataset.act.startsWith("lesson/")) go(a.dataset.act);
      return;
    }
    if (e.target.closest("[data-sound]")) { S().sound = !S().sound; MQ.save(); renderTop(); }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.matches("[data-nameform]")) {
      e.preventDefault();
      const v = $("#kidname").value.trim().slice(0, 20);
      if (v) { S().name = v; MQ.save(); render(); toast(`Nice to meet you, ${esc(v)}!`); }
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-focus]")) { S().focus = e.target.value || null; MQ.save(); renderHome(); }
  });
  MQ.onState((why) => {
    if (why === "reload") { if (route !== "quiz") render(); else renderTop(); }
    if (why === "cloud") renderTop();
  });

  /* ---------------- boot ---------------- */
  const start = (data) => {
    $("#brand").innerHTML = `${V.cubo("happy", 40)}<span>Cubo's Math Lab</span>`;
    const r = data && data.route;
    route = r && !/^(quiz|results)/.test(r) ? r : "home";
    render();
    MQ.initCloud();
  };
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(() => ({ route: /^(quiz|results)/.test(route) ? (quiz && quiz.unit ? `unit/${quiz.unit.id}` : "home") : route }));
  if (hot && hot.ready) hot.ready(start);
  else start((hot && hot.data) || {});
})();
