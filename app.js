/* ============================================================
   app.js — 主逻辑
   你是哪块猪肉？ / 东彦猪格研究所™ / PIG-TI v5.18
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- 依赖 & 常量 ---------------- */

  var D = window.PIG_DATA;
  var EGGS = window.PIG_ACHIEVEMENTS;

  if (!D || !EGGS) {
    // 数据文件没加载成功时不要抛异常刷屏
    console.warn('PIG-TI: 数据文件未加载，请确认 data.js / achievements.js 在 app.js 之前引入。');
    return;
  }

  var P = D.personalities;
  var META = D.meta;
  var QS = D.questions;

  var KEY_PROGRESS = 'pigProgress';
  var KEY_ACH = 'pigAchievements';
  var PROGRESS_VERSION = 1;

  var REDUCED = false;
  try {
    REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { REDUCED = false; }

  /* ---------------- 小工具 ---------------- */

  function $(id) { return document.getElementById(id); }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, Math.max(0, ms)); });
  }

  function zeroScores() {
    return { cyber: 0, flying: 0, attack: 0, bed: 0, potato: 0, party: 0 };
  }

  function zeroFlags() {
    return { wKey: 0, walking: 0, empower: 0, whiff: 0, commander: 0, actor: 0, green: 0, accuser: 0 };
  }

  function safeGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* 隐私模式忽略 */ } }
  function safeDel(k) { try { window.localStorage.removeItem(k); } catch (e) { /* 忽略 */ } }

  function findEgg(id) {
    for (var i = 0; i < EGGS.length; i++) { if (EGGS[i].id === id) return EGGS[i]; }
    return null;
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      function p(n) { return n < 10 ? '0' + n : '' + n; }
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
             ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return ''; }
  }

  /* ---------------- 状态 ---------------- */

  var state = {
    screen: 'home',
    qIndex: 0,
    answers: [],
    scores: zeroScores(),
    flags: zeroFlags(),
    result: null,
    winnerScore: 0,
    newAchIds: [],
    direct: false,
    locked: false,
    lastBoostToast: 0,
    timers: []
  };

  var achStore = {};

  /* ---------------- 成就存储 ---------------- */

  function loadAch() {
    var raw = safeGet(KEY_ACH);
    if (!raw) { achStore = {}; return; }
    try {
      var obj = JSON.parse(raw);
      achStore = (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
    } catch (e) { achStore = {}; }
  }

  function saveAch() { safeSet(KEY_ACH, JSON.stringify(achStore)); }

  function achCount() {
    var n = 0;
    for (var i = 0; i < EGGS.length; i++) { if (achStore[EGGS[i].id]) n++; }
    return n;
  }

  function unlockAch(id) {
    if (achStore[id]) return false;
    achStore[id] = new Date().toISOString();
    saveAch();
    return true;
  }

  function renderCodexCount() {
    var el = $('codex-count');
    if (el) el.textContent = '🏆 彩蛋 ' + achCount() + ' / ' + EGGS.length;
  }

  /* ---------------- Toast ---------------- */

  var lastToast = { text: '', at: 0 };

  function toast(text, kind, duration) {
    var now = Date.now();
    if (text === lastToast.text && now - lastToast.at < 1800) return;
    lastToast.text = text;
    lastToast.at = now;

    var wrap = $('toast-wrap');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = text;
    wrap.appendChild(el);

    var life = duration || 2200;
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }, life);

    // 防止 toast 无限堆积
    while (wrap.children.length > 4) { wrap.removeChild(wrap.firstChild); }
  }

  /* ---------------- 音效（预留接口，第一版不出声） ----------------
     以后想加音效：把素材放进 assets/，在 SOUNDS 里登记路径即可。
     没有素材时不会联网、不会报错、不会影响任何流程。            */

  var SOUNDS = {
    // click: 'assets/click.mp3',
    // egg:   'assets/egg.mp3'
  };

  function playSound(name) {
    try {
      var src = SOUNDS[name];
      if (!src || typeof window.Audio !== 'function') return;
      var a = new window.Audio(src);
      var p = a.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* 自动播放被拦截，忽略 */ });
    } catch (e) { /* 静默失败 */ }
  }

  /* ---------------- 页面切换 ---------------- */

  var SCREENS = ['home', 'quiz', 'analysis', 'result'];

  function goScreen(name) {
    if (SCREENS.indexOf(name) === -1) name = 'home';
    state.screen = name;
    for (var i = 0; i < SCREENS.length; i++) {
      var el = $('screen-' + SCREENS[i]);
      if (el) el.classList.toggle('is-active', SCREENS[i] === name);
    }
    try { window.scrollTo(0, 0); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 首页 ---------------- */

  function renderHomeCards() {
    var box = $('home-cards');
    if (!box) return;
    box.innerHTML = '';
    META.order.forEach(function (id) {
      var p = P[id];
      if (!p) return;
      var card = document.createElement('div');
      card.className = 'home-card';
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name + '表情包';
      img.loading = 'lazy';
      img.width = 200;
      img.height = 200;
      card.appendChild(img);
      box.appendChild(card);
    });
  }

  function rollRandomTip() {
    var el = $('random-tip');
    if (!el || !D.randomTips || !D.randomTips.length) return;
    el.textContent = D.randomTips[Math.floor(Math.random() * D.randomTips.length)];
  }

  function updateResumeBox() {
    var box = $('resume-box');
    if (!box) return;
    var p = readProgress();
    if (!p) { box.classList.add('hidden'); return; }
    var answered = 0;
    for (var i = 0; i < p.answers.length; i++) {
      if (typeof p.answers[i] === 'number') answered++;
    }
    var nextQ = Math.min(answered + 1, QS.length);
    $('resume-sub').textContent = '已答 ' + answered + ' / ' + QS.length + ' 题，上次停在第 ' + nextQ + ' 题';
    box.classList.remove('hidden');
  }

  function renderHome() {
    updateResumeBox();
    renderCodexCount();
    rollRandomTip();
  }

  /* ---------------- 进度存储 ---------------- */

  function readProgress() {
    var raw = safeGet(KEY_PROGRESS);
    if (!raw) return null;
    try {
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      if (p.version !== PROGRESS_VERSION) return null;
      if (!Array.isArray(p.answers)) return null;
      if (p.answers.length === 0) return null;
      if (p.answers.length >= QS.length) return null;
      var hasOne = false;
      for (var i = 0; i < p.answers.length; i++) {
        if (typeof p.answers[i] === 'number') { hasOne = true; break; }
      }
      return hasOne ? p : null;
    } catch (e) { return null; }
  }

  function saveProgress() {
    var payload = {
      version: PROGRESS_VERSION,
      qIndex: state.qIndex,
      answers: state.answers.slice(),
      scores: state.scores,
      flags: state.flags,
      updatedAt: Date.now()
    };
    safeSet(KEY_PROGRESS, JSON.stringify(payload));
  }

  function clearProgress() { safeDel(KEY_PROGRESS); }

  /* ---------------- 会话 ---------------- */

  function resetSession() {
    state.qIndex = 0;
    state.answers = [];
    state.scores = zeroScores();
    state.flags = zeroFlags();
    state.result = null;
    state.winnerScore = 0;
    state.newAchIds = [];
    state.locked = false;
  }

  function applyOption(opt) {
    if (!opt) return;
    var k;
    if (opt.scores) {
      for (k in opt.scores) {
        if (Object.prototype.hasOwnProperty.call(opt.scores, k) && k in state.scores) {
          state.scores[k] += Number(opt.scores[k]) || 0;
        }
      }
    }
    if (opt.flags) {
      for (k in opt.flags) {
        if (Object.prototype.hasOwnProperty.call(opt.flags, k) && k in state.flags) {
          state.flags[k] += Number(opt.flags[k]) || 0;
        }
      }
    }
  }

  /* ---------------- 答题 ---------------- */

  function beginQuiz() {
    resetSession();
    clearProgress();
    goScreen('quiz');
    paintQuestion(0);
  }

  function resumeQuiz() {
    var p = readProgress();
    if (!p) { beginQuiz(); return; }

    resetSession();
    var answers = [];
    for (var qi = 0; qi < p.answers.length; qi++) {
      var optIdx = p.answers[qi];
      var q = QS[qi];
      if (!q || typeof optIdx !== 'number' || !q.options[optIdx]) {
        answers.push(null);
        continue;
      }
      answers.push(optIdx);
      applyOption(q.options[optIdx]);
    }
    state.answers = answers;

    var next = -1;
    for (var i = 0; i < answers.length; i++) {
      if (answers[i] === null) { next = i; break; }
    }
    if (next === -1) next = answers.length;
    if (next >= QS.length) { beginQuiz(); return; }

    goScreen('quiz');
    paintQuestion(next);
    toast('接着验，猪肉不会跑。', 'ok', 1600);
  }

  function paintQuestion(idx) {
    var q = QS[idx];
    if (!q) return;
    state.qIndex = idx;
    state.locked = false;

    $('q-index').textContent = 'Q' + (idx + 1);
    $('q-text').textContent = q.text;

    var hint = $('q-hint');
    if (q.hint) {
      hint.textContent = q.hint;
      hint.classList.remove('hidden');
    } else {
      hint.textContent = '';
      hint.classList.add('hidden');
    }

    var box = $('q-options');
    box.innerHTML = '';
    var keys = ['A', 'B', 'C', 'D', 'E', 'F'];

    q.options.forEach(function (opt, oi) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'q-option';
      btn.setAttribute('data-idx', String(oi));

      var k = document.createElement('span');
      k.className = 'opt-key';
      k.textContent = keys[oi] || String(oi + 1);

      var t = document.createElement('span');
      t.className = 'opt-text';
      t.textContent = opt.text;

      btn.appendChild(k);
      btn.appendChild(t);
      btn.addEventListener('click', function () { selectOption(idx, oi); });

      box.appendChild(btn);
    });

    updateQuizProgress();
  }

  function updateQuizProgress() {
    var answered = 0;
    for (var i = 0; i < state.answers.length; i++) {
      if (typeof state.answers[i] === 'number') answered++;
    }
    var pct = Math.round((answered / QS.length) * 100);
    $('quiz-progress-label').textContent = '猪肉鉴定进度 ' + pct + '%';
    $('quiz-progress-count').textContent = (state.qIndex + 1) + ' / ' + QS.length;
    $('quiz-progress-fill').style.width = pct + '%';
  }

  function maybeBoostToast(opt) {
    var now = Date.now();

    // 赋能 toast：偶尔出现，别每次都弹
    if (opt.flags && opt.flags.empower > 0) {
      if (now - state.lastBoostToast > 9000 && Math.random() < 0.5) {
        state.lastBoostToast = now;
        toast('✨ 本次操作已赋能', '', 700);
        return;
      }
    }

    // 极小概率来一句研究员吐槽
    if (D.pickReactions && D.pickReactions.length && now - state.lastBoostToast > 6000 && Math.random() < 0.18) {
      state.lastBoostToast = now;
      toast(D.pickReactions[Math.floor(Math.random() * D.pickReactions.length)], '', 1400);
    }
  }

  function selectOption(qIdx, optIdx) {
    if (state.locked) return;
    if (state.screen !== 'quiz') return;

    var q = QS[qIdx];
    if (!q) return;
    var opt = q.options[optIdx];
    if (!opt) return;

    state.locked = true;

    state.answers[qIdx] = optIdx;
    applyOption(opt);
    saveProgress();

    // 高亮 + 锁死所有按钮，防止连点跳题
    var box = $('q-options');
    var btns = box ? box.querySelectorAll('.q-option') : [];
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      btns[i].classList.toggle('picked', i === optIdx);
    }

    maybeBoostToast(opt);

    var card = $('q-card');
    var holdMs = REDUCED ? 40 : 170;
    var leaveMs = REDUCED ? 0 : 140;
    var enterMs = REDUCED ? 0 : 200;

    setTimeout(function () {
      if (qIdx + 1 >= QS.length) { finishQuiz(); return; }

      card.classList.add('leaving');
      setTimeout(function () {
        card.classList.remove('leaving');
        paintQuestion(qIdx + 1);
        card.classList.add('entering');
        // 强制重排，确保动画重新播放
        void card.offsetWidth;
        setTimeout(function () {
          card.classList.remove('entering');
          state.locked = false;
        }, enterMs);
      }, leaveMs);
    }, holdMs);
  }

  function finishQuiz() {
    clearProgress();
    runAnalysis();
  }

  /* ---------------- 彩蛋调度 ---------------- */

  function pickWinner() {
    var best = -Infinity;
    var ties = [];
    META.order.forEach(function (id) {
      var s = state.scores[id] || 0;
      if (s > best) { best = s; ties = [id]; }
      else if (s === best) { ties.push(id); }
    });
    var id = ties[Math.floor(Math.random() * ties.length)] || META.order[0];
    return { id: id, score: best, ties: ties };
  }

  function buildEggContext() {
    var win = pickWinner();
    return {
      flags: state.flags,
      scores: state.scores,
      winner: win.id,
      winnerScore: win.score
    };
  }

  function planEggs(ctx) {
    var eligible = [];
    EGGS.forEach(function (egg) {
      var ok = false;
      try { ok = !!egg.condition(ctx); } catch (e) { ok = false; }
      if (!ok) return;
      if (typeof egg.chance === 'number' && egg.chance < 1) {
        if (Math.random() >= egg.chance) return;
      }
      eligible.push(egg);
    });

    var quick = eligible.filter(function (e) { return !!e.quickAnimation; });

    var full = eligible.filter(function (e) { return !!e.fullAnimation; })
      .sort(function (a, b) { return (a.priority || 99) - (b.priority || 99); })
      .slice(0, 2);

    var shown = {};
    full.concat(quick).forEach(function (e) { shown[e.id] = true; });

    var silent = eligible.filter(function (e) { return !shown[e.id]; });

    return { eligible: eligible, full: full, quick: quick, silent: silent };
  }

  function buildAnalysisLines(ctx) {
    var base = (D.analysisLines || []).slice();
    var extras = (D.analysisExtras || []).filter(function (x) {
      return (ctx.flags[x.flag] || 0) >= x.min;
    }).slice(0, 2).map(function (x) {
      return { text: x.text, kind: x.kind || 'result', delay: 400 };
    });

    if (!extras.length) return base;

    var out = [];
    base.forEach(function (line, i) {
      if (i === base.length - 1) {
        extras.forEach(function (e) { out.push(e); });
      }
      out.push(line);
    });
    return out;
  }

  function appendAnalysisLine(container, line) {
    var d = document.createElement('div');
    d.className = 'an-line' + (line.kind ? ' k-' + line.kind : '');
    d.textContent = line.text;
    container.appendChild(d);
    try { d.scrollIntoView({ block: 'nearest' }); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 彩蛋播放器（脚本 DSL） ---------------- */

  var eggSkipFlag = false;
  var eggRunning = false;
  var eggTimers = [];
  var eggDriverTimer = null;
  var eggAbort = null;

  // 彩蛋内部的延时必须可取消，否则跳过后残留定时器会污染下一个彩蛋
  function eggTimeout(fn, ms) {
    var id = setTimeout(function () {
      var i = eggTimers.indexOf(id);
      if (i !== -1) eggTimers.splice(i, 1);
      fn();
    }, ms);
    eggTimers.push(id);
    return id;
  }

  function clearEggTimers() {
    for (var i = 0; i < eggTimers.length; i++) clearTimeout(eggTimers[i]);
    eggTimers = [];
  }

  function scrollEggToBottom() {
    var panel = $('egg-panel');
    if (panel) panel.scrollTop = panel.scrollHeight;
  }

  function animateNumber(el, to, duration, prefix, suffix, thousands) {
    var dur = REDUCED ? 1 : duration;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = Math.round(to * eased);
      el.textContent = prefix + (thousands ? v.toLocaleString('en-US') : String(v)) + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  function execStep(container, step) {
    if (!step || !step.t) return 180;

    var d;
    switch (step.t) {
      case 'log':
        d = document.createElement('div');
        d.className = 'egg-line' + (step.cls ? ' ' + step.cls : '');
        d.textContent = step.text;
        container.appendChild(d);
        scrollEggToBottom();
        return step.delay || 460;

      case 'lines': {
        var items = step.items || [];
        var stepMs = REDUCED ? 28 : (step.step || 250);
        items.forEach(function (txt, idx) {
          eggTimeout(function () {
            var row = document.createElement('div');
            row.className = 'egg-line' + (step.cls ? ' ' + step.cls : '');
            row.textContent = txt;
            container.appendChild(row);
            scrollEggToBottom();
          }, idx * stepMs);
        });
        return items.length * stepMs + 240;
      }

      case 'wait':
        return step.ms || 500;

      case 'big':
        d = document.createElement('div');
        d.className = 'egg-big' + (step.cls ? ' ' + step.cls : '');
        d.textContent = step.text;
        container.appendChild(d);
        scrollEggToBottom();
        return 820;

      case 'counter':
        d = document.createElement('div');
        d.className = 'egg-line num';
        d.textContent = '0';
        container.appendChild(d);
        animateNumber(d, step.to || 0, step.duration || 700, step.prefix || '', step.suffix || '', false);
        scrollEggToBottom();
        return (step.duration || 700) + 200;

      case 'money':
        d = document.createElement('div');
        d.className = 'egg-money';
        d.textContent = '¥0';
        container.appendChild(d);
        animateNumber(d, step.to || 0, step.duration || 1200, '¥', '', true);
        scrollEggToBottom();
        return (step.duration || 1200) + 220;

      case 'barline': {
        var wrap = document.createElement('div');
        wrap.className = 'egg-line egg-bar-line';
        var label = document.createElement('span');
        label.className = 'egg-bar-label';
        label.textContent = step.label || '';
        var blocks = document.createElement('span');
        blocks.className = 'egg-blocks';
        wrap.appendChild(label);
        wrap.appendChild(blocks);
        container.appendChild(wrap);

        var total = step.total || 10;
        var fill = step.fill || 0;
        var gap = REDUCED ? 30 : (step.step || 120);
        for (var k = 0; k < total; k++) {
          (function (kk) {
            eggTimeout(function () {
              blocks.textContent += (kk < fill ? '█' : '░');
              if (kk === total - 1 && step.pct) blocks.textContent += ' ' + step.pct;
            }, kk * gap);
          })(k);
        }
        scrollEggToBottom();
        return total * gap + 440;
      }

      case 'pct': {
        var steps = step.steps || [];
        var pw = document.createElement('div');
        pw.className = 'egg-line egg-bar-line';
        var pl = document.createElement('span');
        pl.className = 'egg-bar-label';
        pl.textContent = step.label || '';
        var pv = document.createElement('span');
        pv.className = 'egg-blocks';
        pw.appendChild(pl);
        pw.appendChild(pv);
        container.appendChild(pw);

        var pStep = REDUCED ? 30 : (step.step || 280);
        steps.forEach(function (s, idx) {
          eggTimeout(function () { pv.textContent = s; }, idx * pStep);
        });
        scrollEggToBottom();
        return steps.length * pStep + 400;
      }

      case 'green':
        $('egg-panel').classList.add('green-mode');
        return 640;

      case 'keys': {
        var row = document.createElement('div');
        row.className = 'egg-line egg-bar-line';
        ['W', 'A', 'S', 'D'].forEach(function (key, i) {
          var cap = document.createElement('span');
          cap.className = 'keycap';
          cap.textContent = key;
          if (i > 0) cap.style.animation = 'none';
          row.appendChild(cap);
        });
        container.appendChild(row);
        scrollEggToBottom();
        return 860;
      }

      case 'foot':
        d = document.createElement('div');
        d.className = 'egg-foot';
        d.textContent = step.text;
        container.appendChild(d);
        scrollEggToBottom();
        return 360;

      default:
        return 180;
    }
  }

  function runScript(container, script, isSkipped) {
    return new Promise(function (resolve) {
      var i = 0;
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        eggAbort = null;
        clearTimeout(eggDriverTimer);
        resolve();
      }

      eggAbort = finish;

      function next() {
        if (done) return;
        if (isSkipped()) { finish(); return; }
        if (i >= script.length) { finish(); return; }

        var step = script[i++];
        var dur;
        try { dur = execStep(container, step); } catch (e) { dur = 180; }
        if (REDUCED) dur = Math.min(dur, 130);
        eggDriverTimer = setTimeout(next, dur);
      }

      next();
    });
  }

  function playEgg(egg) {
    return new Promise(function (resolve) {
      var overlay = $('egg-overlay');
      var panel = $('egg-panel');
      var stream = $('egg-stream');

      clearEggTimers();
      stream.innerHTML = '';
      panel.classList.remove('green-mode');
      $('egg-tag').textContent = 'EASTER EGG · ' + egg.name;
      overlay.classList.remove('hidden');

      eggSkipFlag = false;
      eggRunning = true;

      runScript(stream, egg.script || [], function () { return eggSkipFlag; })
        .then(function () {
          if (eggSkipFlag) return null;
          return sleep(REDUCED ? 200 : 950);
        })
        .then(function () {
          clearEggTimers();
          overlay.classList.add('hidden');
          panel.classList.remove('green-mode');
          stream.innerHTML = '';
          eggRunning = false;
          resolve();
        });
    });
  }

  function requestEggSkip() {
    if (!eggRunning) return;
    eggSkipFlag = true;
    clearEggTimers();          // 干掉还没出现的残留行
    if (eggAbort) eggAbort();  // 立刻结束当前脚本
  }

  /* ---------------- 分析流程 ---------------- */

  function finalizeAchievements(plan) {
    var order = plan.full.concat(plan.quick, plan.silent);
    state.newAchIds = [];
    order.forEach(function (egg) {
      if (unlockAch(egg.id)) state.newAchIds.push(egg.id);
    });
    renderCodexCount();
    if (state.newAchIds.length) {
      var btn = $('codex-btn');
      if (btn) {
        btn.classList.remove('pop');
        void btn.offsetWidth;
        btn.classList.add('pop');
      }
    }
  }

  function runAnalysis() {
    goScreen('analysis');

    var stream = $('analysis-stream');
    var bar = $('analysis-bar-fill');
    if (stream) stream.innerHTML = '';
    if (bar) bar.style.width = '8%';

    var ctx = buildEggContext();
    state.winnerScore = ctx.winnerScore;
    var plan = planEggs(ctx);
    var lines = buildAnalysisLines(ctx);

    var pctStep = 84 / Math.max(1, lines.length);
    var chain = Promise.resolve();

    lines.forEach(function (line, i) {
      chain = chain.then(function () {
        return sleep(REDUCED ? 70 : (line.delay || 340));
      }).then(function () {
        if (stream) appendAnalysisLine(stream, line);
        if (bar) bar.style.width = (8 + pctStep * (i + 1)) + '%';
      });
    });

    return chain
      .then(function () { return sleep(REDUCED ? 80 : 380); })
      .then(function () {
        // 快速插播彩蛋（纯血猪肉，不占完整名额）
        return plan.quick.reduce(function (acc, egg) {
          return acc.then(function () { return playEgg(egg); });
        }, Promise.resolve());
      })
      .then(function () {
        // 完整彩蛋：最多 2 个
        return plan.full.reduce(function (acc, egg) {
          return acc.then(function () { return playEgg(egg); });
        }, Promise.resolve());
      })
      .then(function () {
        finalizeAchievements(plan);
        if (bar) bar.style.width = '100%';
        return sleep(REDUCED ? 60 : 340);
      })
      .then(function () {
        showResult(ctx.winner, ctx.winnerScore);
      })
      .catch(function (err) {
        // 任何意外都不要卡死用户
        console.warn('PIG-TI: 分析流程异常，直接出结果。', err);
        try { $('egg-overlay').classList.add('hidden'); } catch (e) { /* 忽略 */ }
        showResult(ctx.winner, ctx.winnerScore);
      });
  }

  /* ---------------- 结果页 ---------------- */

  function renderStats(p) {
    var box = $('stats');
    if (!box) return;
    box.innerHTML = '';
    var names = Object.keys(p.stats || {});
    names.forEach(function (name) {
      var val = Number(p.stats[name]) || 0;

      var row = document.createElement('div');
      row.className = 'stat-row';

      var top = document.createElement('div');
      top.className = 'stat-top';
      var l = document.createElement('span');
      l.textContent = name;
      var r = document.createElement('span');
      r.className = 'stat-val';
      r.textContent = val + '%';
      top.appendChild(l);
      top.appendChild(r);

      var track = document.createElement('div');
      track.className = 'stat-track';
      var fill = document.createElement('div');
      fill.className = 'stat-fill';
      fill.setAttribute('data-pct', String(val));
      track.appendChild(fill);

      row.appendChild(top);
      row.appendChild(track);
      box.appendChild(row);
    });
  }

  function animateStats() {
    var box = $('stats');
    if (!box) return;
    var fills = box.querySelectorAll('.stat-fill');
    for (var i = 0; i < fills.length; i++) {
      (function (el, idx) {
        var pct = Number(el.getAttribute('data-pct')) || 0;
        setTimeout(function () { el.style.width = pct + '%'; }, REDUCED ? 0 : idx * 90);
      })(fills[i], i);
    }
  }

  function renderNewAchievements() {
    var box = $('new-achs');
    var list = $('new-achs-list');
    if (!box || !list) return;
    list.innerHTML = '';

    (state.newAchIds || []).forEach(function (id) {
      var egg = findEgg(id);
      if (!egg) return;

      var chip = document.createElement('div');
      chip.className = 'ach-chip';

      var icon = document.createElement('span');
      icon.className = 'ach-icon';
      icon.textContent = egg.icon;

      var body = document.createElement('div');
      var n = document.createElement('div');
      n.className = 'ach-name';
      n.textContent = egg.name;
      var ds = document.createElement('div');
      ds.className = 'ach-desc';
      ds.textContent = egg.desc.replace(/\n/g, ' ');
      body.appendChild(n);
      body.appendChild(ds);

      chip.appendChild(icon);
      chip.appendChild(body);
      list.appendChild(chip);
    });

    box.classList.toggle('hidden', list.children.length === 0);
  }

  function showResult(id, winnerScore) {
    var p = P[id];
    if (!p) { goScreen('home'); renderHome(); return; }

    state.result = id;
    if (typeof winnerScore === 'number') state.winnerScore = winnerScore;

    var root = $('screen-result');
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-soft', p.accentSoft);

    $('result-name').textContent = p.name;
    $('result-meme').textContent = p.meme;
    $('result-mbti').textContent = p.mbti;

    var img = $('result-img');
    img.src = p.image;
    img.alt = p.name + '表情包';
    $('result-photo').setAttribute('aria-label', '查看' + p.name + '完整图片');

    $('result-tagline').textContent = p.tagline;

    var desc = $('result-desc');
    desc.innerHTML = '';
    (p.description || []).forEach(function (t) {
      var el = document.createElement('p');
      el.textContent = t;
      desc.appendChild(el);
    });

    renderStats(p);

    var comments = p.comments || [];
    $('result-comment').textContent = comments.length
      ? comments[Math.floor(Math.random() * comments.length)]
      : '';

    $('mvp-badge').classList.toggle('hidden', !(state.flags.actor >= 9));

    renderNewAchievements();
    goScreen('result');

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(animateStats);
    });
  }

  /* ---------------- 复制结果 ---------------- */

  function buildCopyText() {
    var p = P[state.result];
    if (!p) return '';
    var purity = (p.stats && p.stats['猪肉纯度'] != null) ? p.stats['猪肉纯度'] : '99';

    var text = '我测出来是【' + p.name + ' ' + p.mbti + '】🐷\n\n' +
               p.meme + '\n\n' +
               '猪肉纯度：' + purity + '%\n\n' +
               '你也来测测你是哪块猪肉。';

    var names = (state.newAchIds || []).map(function (id) {
      var egg = findEgg(id);
      return egg ? egg.name : null;
    }).filter(Boolean);

    if (names.length) {
      text += '\n\n顺便解锁了' + names.map(function (n) { return '【' + n + '】'; }).join('') + '🎖️';
    }

    try {
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        text += '\n' + location.href.split('#')[0].split('?')[0];
      }
    } catch (e) { /* 忽略 */ }

    return text;
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.left = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  }

  function copyResult() {
    var text = buildCopyText();
    if (!text) { toast('没东西可复制。', '', 1600); return; }

    var done = function (ok) {
      toast(ok ? '已复制，去群里丢人吧。' : '复制失败，手动截图吧。', ok ? 'ok' : '', 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done(true);
      }).catch(function () {
        done(legacyCopy(text));
      });
    } else {
      done(legacyCopy(text));
    }
  }

  /* ---------------- 猪肉图鉴 ---------------- */

  function openCodex() {
    var list = $('codex-list');
    if (!list) return;
    list.innerHTML = '';

    EGGS.forEach(function (egg) {
      var unlocked = !!achStore[egg.id];

      var item = document.createElement('div');
      item.className = 'codex-item' + (unlocked ? '' : ' locked');

      var icon = document.createElement('span');
      icon.className = 'ach-icon';
      icon.textContent = unlocked ? egg.icon : '🔒';

      var body = document.createElement('div');

      var n = document.createElement('div');
      n.className = 'ach-name';
      n.textContent = unlocked ? egg.name : '？？？？？？';
      body.appendChild(n);

      var ds = document.createElement('div');
      ds.className = 'ach-desc';
      ds.textContent = unlocked ? egg.desc.replace(/\n/g, ' ') : '尚未解锁';
      body.appendChild(ds);

      if (unlocked) {
        var t = document.createElement('div');
        t.className = 'codex-time';
        t.textContent = '首次解锁：' + formatTime(achStore[egg.id]);
        body.appendChild(t);
      }

      item.appendChild(icon);
      item.appendChild(body);
      list.appendChild(item);
    });

    var line = $('codex-line');
    if (line) line.textContent = '已解锁 ' + achCount() + ' / ' + EGGS.length;

    $('codex-modal').classList.remove('hidden');
    var closeBtn = $('codex-close');
    if (closeBtn) { try { closeBtn.focus(); } catch (e) { /* 忽略 */ } }
  }

  function closeCodex() {
    $('codex-modal').classList.add('hidden');
  }

  /* ---------------- 图片预览 ---------------- */

  function openLightbox(src, alt, cap) {
    if (!src) return;
    $('lightbox-img').src = src;
    $('lightbox-img').alt = alt || '';
    $('lightbox-cap').textContent = cap || '';
    $('lightbox').classList.remove('hidden');
    try { $('lightbox-close').focus(); } catch (e) { /* 忽略 */ }
  }

  function closeLightbox() {
    $('lightbox').classList.add('hidden');
  }

  /* ---------------- 事件绑定 ---------------- */

  var lastStartAt = 0;

  function onStart() {
    var now = Date.now();
    if (now - lastStartAt < 900) { toast('别点了，已经在验了。', '', 1500); return; }
    lastStartAt = now;
    beginQuiz();
  }

  function bindEvents() {
    var start = $('btn-start');
    if (start) start.addEventListener('click', onStart);

    var resume = $('btn-resume');
    if (resume) resume.addEventListener('click', resumeQuiz);

    var restart = $('btn-restart');
    if (restart) restart.addEventListener('click', beginQuiz);

    var quit = $('btn-quit');
    if (quit) quit.addEventListener('click', function () {
      state.locked = false;
      goScreen('home');
      renderHome();
    });

    var codexBtn = $('codex-btn');
    if (codexBtn) codexBtn.addEventListener('click', openCodex);

    var codex2 = $('btn-codex2');
    if (codex2) codex2.addEventListener('click', openCodex);

    var c1 = $('codex-close');
    if (c1) c1.addEventListener('click', closeCodex);
    var c2 = $('codex-close2');
    if (c2) c2.addEventListener('click', closeCodex);

    var modal = $('codex-modal');
    if (modal) modal.addEventListener('click', function (e) {
      if (e.target === modal) closeCodex();
    });

    var skip = $('egg-skip');
    if (skip) skip.addEventListener('click', requestEggSkip);

    var photo = $('result-photo');
    if (photo) {
      photo.addEventListener('click', function () {
        var p = P[state.result];
        if (!p) return;
        openLightbox(p.image, p.name + '表情包', p.name + ' · ' + p.mbti);
      });
      photo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          photo.click();
        }
      });
    }

    var lc = $('lightbox-close');
    if (lc) lc.addEventListener('click', closeLightbox);
    var lb = $('lightbox');
    if (lb) lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });

    var copy = $('btn-copy');
    if (copy) copy.addEventListener('click', copyResult);

    var again = $('btn-again');
    if (again) again.addEventListener('click', beginQuiz);

    var home2 = $('btn-home2');
    if (home2) home2.addEventListener('click', function () {
      goScreen('home');
      renderHome();
    });

    // 键盘支持
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;

      if (!$('lightbox').classList.contains('hidden')) { closeLightbox(); return; }
      if (!$('codex-modal').classList.contains('hidden')) { closeCodex(); return; }
      if (eggRunning) { requestEggSkip(); }
    });

    // 答题页数字键快捷选择（1-6）
    document.addEventListener('keydown', function (e) {
      if (state.screen !== 'quiz' || state.locked) return;
      if (e.key < '1' || e.key > '6') return;
      var idx = Number(e.key) - 1;
      var box = $('q-options');
      if (!box) return;
      var btns = box.querySelectorAll('.q-option');
      if (btns[idx]) { e.preventDefault(); btns[idx].click(); }
    });

    // 页面隐藏时把彩蛋快进，避免回来还在等动画
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && eggRunning) requestEggSkip();
    });
  }

  /* ---------------- URL ?result=xxx ---------------- */

  function handleUrlResult() {
    var id = null;
    try {
      var params = new URLSearchParams(window.location.search);
      id = params.get('result');
    } catch (e) { id = null; }

    if (!id) return false;

    id = String(id).trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(P, id)) return false;

    resetSession();
    state.direct = true;
    // 直接链接模式：不解锁任何成就
    state.newAchIds = [];
    showResult(id, state.winnerScore);
    return true;
  }

  /* ---------------- 控制台彩蛋 ---------------- */

  function consoleEgg() {
    try {
      console.log('%c🐷 东彦猪格研究所', 'font-size:16px;font-weight:bold;color:#ff6f91');
      console.log('%cPIG-TI v5.18', 'font-family:monospace;color:#5b5362');
      console.log('%c你都打开控制台了，不如去练枪。', 'color:#b3273f');
    } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 启动 ---------------- */

  function init() {
    loadAch();
    renderHomeCards();
    renderCodexCount();
    bindEvents();
    consoleEgg();

    if (!handleUrlResult()) {
      renderHome();
      goScreen('home');
    }

    // 首页角落小文案轮换
    setInterval(function () {
      if (state.screen === 'home') rollRandomTip();
    }, 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
