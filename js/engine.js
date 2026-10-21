/* Engine: unit registry, progress state, persistence (localStorage + account sync), scoring, quiz building. */
(function () {
  const MQ = window.MQ;
  const U = MQ.U;

  /* ---------------- registry ---------------- */
  MQ.units = [];
  MQ.skills = {};
  MQ.addUnit = (def) => {
    def.skills.forEach((s) => {
      s.key = `${def.id}.${s.id}`;
      s.unit = def;
      s.min = s.min || 1; s.max = s.max || 5;
      MQ.skills[s.key] = s;
    });
    def.lessons.forEach((l) => (l.key = `${def.id}.${l.id}`));
    MQ.units.push(def);
  };
  MQ.unitById = (id) => MQ.units.find((u) => u.id === id);

  MQ.gen = (key, d) => {
    const s = MQ.skills[key];
    d = Math.max(1, Math.min(5, d));
    let q;
    for (let i = 0; i < 6; i++) {
      try { q = s.gen(d); if (q) break; } catch (e) { console.warn("generator failed", key, d, e); }
    }
    if (!q) q = MQ.skills["u8.exprEval"].gen(1);
    q.skill = key; q.d = d; q.unit = s.unit.id;
    if (q.kind === "num") q.answer = U.toRat(q.answer);
    return q;
  };

  /* ---------------- state ---------------- */
  const KEY = "cubo-mathlab-v1";
  const blank = () => ({
    v: 1, name: "", xp: 0, total: 0, correct: 0, bestCombo: 0,
    skills: {}, lessons: {}, tests: {}, badges: {}, mistakes: [], log: {},
    streak: { last: null, days: 0 }, dailyCount: 0, dailyLast: null, sound: true, updatedAt: 0,
  });
  let state = blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: progress lasts for this visit */ }
  MQ.state = () => state;

  const listeners = new Set();
  MQ.onState = (fn) => listeners.add(fn);

  /* ---------------- cloud sync (Claude artifact db) ---------------- */
  const cloud = { ref: null, writing: false, pending: false, timer: null, status: "local" };
  MQ.cloud = cloud;
  const push = async () => {
    if (!cloud.ref) return;
    if (cloud.writing) { cloud.pending = true; return; }
    cloud.writing = true;
    try {
      await cloud.ref.set(JSON.parse(JSON.stringify(state)));
      cloud.status = "synced";
    } catch (e) {
      cloud.status = e && (e.code === "revoked" || e.code === "invalid_argument") ? "local" : "retry";
      if (e && e.code === "invalid_argument") cloud.ref = null;
    }
    cloud.writing = false;
    listeners.forEach((fn) => fn("cloud"));
    if (cloud.pending) { cloud.pending = false; push(); }
  };
  MQ.initCloud = async () => {
    if (!window.claude || typeof window.claude.use !== "function") return;
    try {
      const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      const ref = db.doc(`data/users/${id}/progress`);
      const snap = await ref.get();
      cloud.ref = ref;
      if (snap.exists) {
        const remote = snap.data();
        if ((remote.updatedAt || 0) > (state.updatedAt || 0)) {
          state = Object.assign(blank(), JSON.parse(JSON.stringify(remote)));
          saveLocal();
          listeners.forEach((fn) => fn("reload"));
        } else if ((state.updatedAt || 0) > (remote.updatedAt || 0)) push();
      } else if (state.updatedAt) push();
      cloud.status = "synced";
      listeners.forEach((fn) => fn("cloud"));
    } catch (e) { /* stay local */ }
  };
  const saveLocal = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  MQ.save = (now) => {
    state.updatedAt = Date.now();
    saveLocal();
    if (cloud.ref) {
      clearTimeout(cloud.timer);
      cloud.timer = setTimeout(push, now ? 0 : 2500);
    }
    listeners.forEach((fn) => fn("save"));
  };
  MQ.resetAll = () => {
    const keepName = state.name, sound = state.sound;
    state = blank();
    state.name = keepName; state.sound = sound;
    MQ.save(true);
  };

  /* ---------------- dates & streak ---------------- */
  const dayKey = (t = new Date()) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  MQ.dayKey = dayKey;
  const touchDay = () => {
    const today = dayKey();
    if (state.streak.last === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    state.streak.days = state.streak.last === dayKey(y) ? state.streak.days + 1 : 1;
    state.streak.last = today;
  };
  MQ.currentStreak = () => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return state.streak.last === dayKey() || state.streak.last === dayKey(y) ? state.streak.days : 0;
  };

  /* ---------------- ranks & xp ---------------- */
  MQ.RANKS = [
    [0, "Number Scout"], [300, "Fraction Finder"], [800, "Decimal Detective"], [1600, "Volume Voyager"],
    [3000, "Pattern Pro"], [5000, "Math Ninja"], [8000, "Math Wizard"], [12000, "Grand Mathmaster"],
  ];
  MQ.rank = (xp = state.xp) => {
    let i = 0;
    while (i + 1 < MQ.RANKS.length && xp >= MQ.RANKS[i + 1][0]) i++;
    const next = MQ.RANKS[i + 1];
    return { name: MQ.RANKS[i][1], idx: i, floor: MQ.RANKS[i][0], next: next ? next[0] : null, nextName: next ? next[1] : null };
  };
  MQ.addXP = (n) => { state.xp += n; };

  /* ---------------- recording answers ---------------- */
  MQ.record = (q, res) => {
    // res: {firstTry: bool, solved: bool, given: string}
    touchDay();
    const k = q.skill;
    const s = (state.skills[k] = state.skills[k] || { a: 0, c: 0, r: [], d: 1 });
    s.a++;
    if (res.firstTry) s.c++;
    s.r.push(res.firstTry ? 1 : 0);
    if (s.r.length > 12) s.r.shift();
    s.d = Math.max(s.d || 1, res.firstTry ? q.d : 1);
    state.total++;
    if (res.firstTry) state.correct++;
    const lg = (state.log[dayKey()] = state.log[dayKey()] || { q: 0, c: 0 });
    lg.q++; if (res.firstTry) lg.c++;
    const keys = Object.keys(state.log).sort();
    while (keys.length > 60) delete state.log[keys.shift()];
    let xp = 0;
    if (res.firstTry) xp = 5 + 3 * q.d;
    else if (res.solved) xp = 2;
    if (!res.firstTry) {
      state.mistakes.unshift({
        t: Date.now(), skill: k, d: q.d, q: U.strip(q.prompt).slice(0, 180),
        given: String(res.given || "").slice(0, 40), answer: MQ.answerText(q),
      });
      if (state.mistakes.length > 40) state.mistakes.length = 40;
    }
    MQ.addXP(xp);
    return xp;
  };

  MQ.answerText = (q) => {
    if (q.kind === "mc") return U.strip(q.choices[q.answer]);
    if (q.kind === "pt") return `(${q.answer[0]}, ${q.answer[1]})`;
    return (q.prefix || "") + U.txt(q.answer, { dec: q.show === "dec" }) + (q.suffix ? " " + q.suffix : "");
  };
  MQ.answerHTML = (q) => {
    if (q.kind === "mc") return q.choices[q.answer];
    if (q.kind === "pt") return `(${q.answer[0]}, ${q.answer[1]})`;
    let h = (q.prefix || "") + U.fmt(q.answer, { dec: q.show === "dec" });
    // show the improper / decimal twin when it helps
    const r = q.answer;
    if (r.d !== 1 && r.n > r.d && q.show !== "dec") h += ` <span class="muted">(or ${U.fmtImp(r)})</span>`;
    if (q.suffix) h += ` <span class="muted">${q.suffix}</span>`;
    return h;
  };
  MQ.check = (q, raw) => {
    if (q.kind === "mc") return raw === q.answer;
    if (q.kind === "pt") {
      const p = U.parsePoint(raw);
      return !!p && p[0] === q.answer[0] && p[1] === q.answer[1];
    }
    const v = U.parse(String(raw).replace(/\$/g, ""));
    return !!v && U.eq(v, q.answer);
  };

  /* ---------------- mastery ---------------- */
  MQ.mastery = (key) => {
    const s = state.skills[key];
    if (!s || s.r.length < 3) return null;
    const r = s.r.slice(-10);
    return r.reduce((a, b) => a + b, 0) / r.length;
  };
  MQ.masteryLabel = (m) => (m == null ? { t: "Not started", c: "none" } : m >= 0.85 ? { t: "Strong", c: "good" } : m >= 0.6 ? { t: "Getting there", c: "warn" } : { t: "Needs practice", c: "crit" });
  MQ.test = (uid, L) => (state.tests[uid] && state.tests[uid][L]) || null;
  MQ.levelUnlocked = (uid, L) => L === 1 || ((MQ.test(uid, L - 1) || {}).stars || 0) >= 1;
  MQ.unitStars = (uid) => [1, 2, 3, 4, 5].reduce((s, L) => s + ((MQ.test(uid, L) || {}).stars || 0), 0);
  MQ.lessonsDone = (u) => u.lessons.filter((l) => state.lessons[l.key]).length;
  MQ.unitProgress = (u) => (MQ.lessonsDone(u) / u.lessons.length) * 0.3 + (MQ.unitStars(u.id) / 15) * 0.7;

  MQ.completeLesson = (lesson) => {
    const first = !state.lessons[lesson.key];
    state.lessons[lesson.key] = state.lessons[lesson.key] || Date.now();
    touchDay();
    let xp = 0;
    if (first) { xp = 25; MQ.addXP(xp); }
    return xp;
  };

  MQ.STARS = (pct) => (pct >= 1 ? 3 : pct >= 0.9 ? 2 : pct >= 0.8 ? 1 : 0);
  MQ.finishTest = (uid, L, pct) => {
    const t = (state.tests[uid] = state.tests[uid] || {});
    const prev = t[L] || { best: 0, stars: 0, tries: 0 };
    const stars = MQ.STARS(pct);
    const improved = stars > prev.stars;
    t[L] = { best: Math.max(prev.best, pct), stars: Math.max(prev.stars, stars), tries: prev.tries + 1, last: Date.now() };
    let xp = 0;
    if (stars >= 1) xp += 20 * L;
    if (improved && stars === 3) xp += 50;
    MQ.addXP(xp);
    return { stars, improved, xp };
  };

  /* ---------------- badges ---------------- */
  MQ.BADGES = [
    { id: "lesson1", icon: "book", name: "First Steps", desc: "Finish your first lesson" },
    { id: "lesson10", icon: "book", name: "Bookworm", desc: "Finish 10 lessons" },
    { id: "pass1", icon: "check", name: "Level Up", desc: "Pass a test level" },
    { id: "star3", icon: "star", name: "Perfectionist", desc: "Get 3 stars on a level" },
    { id: "boss", icon: "trophy", name: "Boss Beater", desc: "Pass a Boss level" },
    { id: "combo10", icon: "bolt", name: "On Fire", desc: "10 right in a row" },
    { id: "q100", icon: "target", name: "Century", desc: "Answer 100 questions" },
    { id: "q500", icon: "target", name: "Marathon", desc: "Answer 500 questions" },
    { id: "streak3", icon: "flame", name: "Habit Builder", desc: "Practice 3 days in a row" },
    { id: "streak7", icon: "flame", name: "Unstoppable", desc: "Practice 7 days in a row" },
    { id: "fixer", icon: "redo", name: "Mistake Fixer", desc: "Fix every mistake in a fix-it round" },
    { id: "daily5", icon: "bolt", name: "Warm-up Hero", desc: "Finish 5 daily warm-ups" },
    { id: "master", icon: "trophy", name: "Unit Master", desc: "2+ stars on every level of a unit" },
  ];
  MQ.checkBadges = (ctx = {}) => {
    const got = [];
    const give = (id) => { if (!state.badges[id]) { state.badges[id] = Date.now(); got.push(MQ.BADGES.find((b) => b.id === id)); } };
    const lessons = Object.keys(state.lessons).length;
    if (lessons >= 1) give("lesson1");
    if (lessons >= 10) give("lesson10");
    const allTests = Object.entries(state.tests);
    if (allTests.some(([, t]) => Object.values(t).some((x) => x.stars >= 1))) give("pass1");
    if (allTests.some(([, t]) => Object.values(t).some((x) => x.stars >= 3))) give("star3");
    if (allTests.some(([, t]) => t[5] && t[5].stars >= 1)) give("boss");
    if (allTests.some(([, t]) => [1, 2, 3, 4, 5].every((L) => t[L] && t[L].stars >= 2))) give("master");
    if (state.bestCombo >= 10) give("combo10");
    if (state.total >= 100) give("q100");
    if (state.total >= 500) give("q500");
    if (MQ.currentStreak() >= 3) give("streak3");
    if (MQ.currentStreak() >= 7) give("streak7");
    if (ctx.fixedAll) give("fixer");
    if (state.dailyCount >= 5) give("daily5");
    return got;
  };

  /* ---------------- quiz builders ---------------- */
  MQ.LEVELS = [
    { L: 1, name: "Warm-up", n: 10, desc: "Core ideas, small numbers" },
    { L: 2, name: "Builder", n: 12, desc: "The standard skills" },
    { L: 3, name: "Challenger", n: 12, desc: "Bigger numbers, more steps" },
    { L: 4, name: "Expert", n: 12, desc: "Tricky cases and fewer pictures" },
    { L: 5, name: "Boss", n: 10, desc: "Multi-step word problems" },
  ];

  // Returns an array of thunks that each produce a fresh question
  MQ.buildTest = (u, L) => {
    const lv = MQ.LEVELS[L - 1];
    const own = u.skills.filter((s) => s.min <= L && L <= s.max);
    let pool = own;
    if (u.review) {
      const others = MQ.units.filter((x) => x !== u).flatMap((x) => x.skills.filter((s) => s.min <= L && L <= s.max));
      pool = [];
      for (let i = 0; i < lv.n; i++) pool.push(i % 3 === 0 ? U.pick(own) : U.pick(others));
      return U.shuffle(pool).map((s) => () => MQ.gen(s.key, L));
    }
    const seq = [];
    let bag = [];
    while (seq.length < lv.n) {
      if (!bag.length) bag = U.shuffle(pool);
      seq.push(bag.pop());
    }
    return seq.map((s) => () => MQ.gen(s.key, L));
  };

  MQ.buildPractice = (key) => {
    const s = MQ.skills[key];
    const st = state.skills[key];
    let d = Math.max(s.min, Math.min(s.max, st ? st.d || s.min : s.min));
    let streak = 0;
    const thunks = [];
    for (let i = 0; i < 10; i++) thunks.push(() => MQ.gen(key, d));
    thunks.adapt = (correct) => {
      if (correct) { streak = Math.max(1, streak + 1); if (streak >= 2 && d < s.max) { d++; streak = 0; } }
      else { streak = 0; if (d > s.min) d--; }
    };
    thunks.level = () => d;
    return thunks;
  };

  MQ.touchedUnits = () => {
    const t = MQ.units.filter((u) => u.lessons.some((l) => state.lessons[l.key]) || state.tests[u.id]);
    return t.length ? t : [MQ.units[0]];
  };
  MQ.buildDaily = () => {
    const units = MQ.touchedUnits();
    const skills = units.flatMap((u) => u.skills);
    const weak = skills.filter((s) => { const m = MQ.mastery(s.key); return m != null && m < 0.8; });
    const thunks = [];
    for (let i = 0; i < 10; i++) {
      const s = weak.length && i % 2 === 0 ? U.pick(weak) : U.pick(skills);
      const passed = [1, 2, 3, 4, 5].filter((L) => ((MQ.test(s.unit.id, L) || {}).stars || 0) >= 1).length;
      const d = Math.max(s.min, Math.min(s.max, Math.min(4, passed + 1)));
      thunks.push(() => MQ.gen(s.key, d));
    }
    return thunks;
  };
  MQ.finishDaily = () => {
    if (state.dailyLast !== dayKey()) { state.dailyCount++; state.dailyLast = dayKey(); MQ.addXP(30); return 30; }
    return 0;
  };
})();
