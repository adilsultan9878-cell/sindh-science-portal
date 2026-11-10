/* Mock exam (/exam/): 20 or 30 questions mixed from the chosen chapters, one at a time, with a clock (1 minute per
   question). At the end: the score, a chapter-by-chapter table that shows the weak chapters, and a review of every
   answer. As on the main site, a result under 50% is not saved; 50% or more goes into this phone's exam history
   (and with the student's account, js/student.js copies it to every phone they log in on). */
(function () {
  'use strict';

  var K = window.Kit, esc = K.esc, L = K.L;
  var T = {
    title: { sd: 'امتحان جي تياري', ur: 'امتحان کی تیاری', en: 'Mock exam' },
    lead: {
      sd: 'سڀني بابن مان سوال، بورڊ جي امتحان وانگر وقت سان. آخر ۾ ڏسو ته ڪهڙا باب ٻيهر پڙهڻا آهن.',
      ur: 'تمام ابواب سے سوالات، بورڈ کے امتحان کی طرح وقت کے ساتھ۔ آخر میں دیکھیں کہ کون سے ابواب دوبارہ پڑھنے ہیں۔',
      en: 'Questions from all chapters, timed like the board exam. At the end, see which chapters to read again.'
    },
    howMany: { sd: 'ڪيترا سوال؟', ur: 'کتنے سوال؟', en: 'How many questions?' },
    nQ: { sd: '{n} سوال · {m} منٽ', ur: '{n} سوال · {m} منٹ', en: '{n} questions · {m} minutes' },
    whichCh: { sd: 'ڪهڙا باب؟', ur: 'کون سے ابواب؟', en: 'Which chapters?' },
    all: { sd: 'سڀ', ur: 'سب', en: 'All' },
    none: { sd: 'ڪوبه نه', ur: 'کوئی نہیں', en: 'None' },
    start: { sd: 'امتحان شروع ڪريو', ur: 'امتحان شروع کریں', en: 'Start the exam' },
    pickCh: { sd: 'گهٽ ۾ گهٽ هڪ باب چونڊيو.', ur: 'کم از کم ایک باب چنیں۔', en: 'Choose at least one chapter.' },
    rules: {
      sd: 'هر سوال لاءِ هڪ منٽ. "پوئتي" سان ڪنهن به سوال ڏانهن واپس وڃي سگهو ٿا. وقت پورو ٿيڻ تي امتحان پاڻمرادو ختم ٿيندو.',
      ur: 'ہر سوال کے لیے ایک منٹ۔ "پیچھے" سے کسی بھی سوال پر واپس جا سکتے ہیں۔ وقت ختم ہونے پر امتحان خود ختم ہو جائے گا۔',
      en: 'One minute per question. Use "Back" to return to any question. The exam ends by itself when the time is up.'
    },
    qOf: { sd: 'سوال {n} / {m}', ur: 'سوال {n} / {m}', en: 'Question {n} of {m}' },
    timeLeft: { sd: 'باقي وقت', ur: 'باقی وقت', en: 'Time left' },
    back: { sd: 'پوئتي', ur: 'پیچھے', en: 'Back' },
    next: { sd: 'اڳيون', ur: 'اگلا', en: 'Next' },
    finish: { sd: 'امتحان ختم ڪريو', ur: 'امتحان ختم کریں', en: 'Finish the exam' },
    unanswered: { sd: '{n} سوال اڃا خالي آهن. پوءِ به ختم ڪريو؟', ur: '{n} سوال ابھی خالی ہیں۔ پھر بھی ختم کریں؟', en: '{n} questions are still empty. Finish anyway?' },
    jump: { sd: 'سوالن جي فهرست', ur: 'سوالات کی فہرست', en: 'All questions' },
    trueW: { sd: 'صحيح', ur: 'درست', en: 'True' },
    falseW: { sd: 'غلط', ur: 'غلط', en: 'False' },
    timeUp: { sd: 'وقت پورو ٿي ويو!', ur: 'وقت ختم ہو گیا!', en: 'Time is up!' },
    result: { sd: 'نتيجو: {s} / {m} ({p}%)', ur: 'نتیجہ: {s} / {m} ({p}%)', en: 'Result: {s} / {m} ({p}%)' },
    took: { sd: 'وقت لڳو: {t}', ur: 'وقت لگا: {t}', en: 'Time taken: {t}' },
    saved: { sd: 'هي نتيجو محفوظ ٿي ويو.', ur: 'یہ نتیجہ محفوظ ہو گیا۔', en: 'This result is saved.' },
    byChapter: { sd: 'باب وار نتيجو', ur: 'باب وار نتیجہ', en: 'Result by chapter' },
    chapter: { sd: 'باب', ur: 'باب', en: 'Chapter' },
    right: { sd: 'صحيح', ur: 'درست', en: 'Right' },
    readAgain: { sd: 'ٻيهر پڙهو', ur: 'دوبارہ پڑھیں', en: 'Read again' },
    good: { sd: 'سٺو', ur: 'اچھا', en: 'Good' },
    review: { sd: 'سڀ جواب ڏسو', ur: 'تمام جوابات دیکھیں', en: 'See all answers' },
    yours: { sd: 'توهان جو جواب', ur: 'آپ کا جواب', en: 'Your answer' },
    correct: { sd: 'صحيح جواب', ur: 'درست جواب', en: 'Right answer' },
    empty: { sd: 'خالي', ur: 'خالی', en: 'Empty' },
    again: { sd: 'نئون امتحان', ur: 'نیا امتحان', en: 'New exam' },
    history: { sd: 'اڳيان امتحان', ur: 'پچھلے امتحانات', en: 'Earlier exams' },
    histRow: { sd: '{d}: {p}% ({n} سوال)', ur: '{d}: {p}% ({n} سوال)', en: '{d}: {p}% ({n} questions)' },
    loadError: { sd: 'سوال لوڊ نه ٿي سگهيا. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'سوالات لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Could not load the questions. Check the internet and try again.' }
  };
  function t(k, v) { return K.text(T, k, v); }

  var main = document.getElementById('main');
  var chs = [], picked = null, size = 20, exam = null, timer = null;

  function icon(d) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; }
  var I = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    exam: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
    next: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>', check: '<path d="M5 12l4 4 10-10"/>', grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>'
  };
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function crumbs() { return '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(K.text(null, 'home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>'; }

  /* ---------- 1. choose ---------- */

  function setup() {
    K.applyLang(t('title'));
    if (!picked) picked = chs.map(function (c) { return c.id; });
    var hist = K.load('exams', []) || [];
    main.innerHTML = crumbs() +
      '<section class="card ex-hero"><span class="icon-tile ex-icon">' + icon(I.exam) + '</span><div><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div></section>' +
      '<form class="card ex-setup" novalidate>' +
        '<h2>' + esc(t('howMany')) + '</h2><div class="ex-sizes">' + [20, 30].map(function (n) {
          return '<label class="ex-size"><input type="radio" name="size" value="' + n + '"' + (n === size ? ' checked' : '') + '><span>' + esc(t('nQ', { n: n, m: n })) + '</span></label>';
        }).join('') + '</div>' +
        '<h2>' + esc(t('whichCh')) + ' <span class="ex-quick"><button type="button" class="btn ghost small" data-all="1">' + esc(t('all')) + '</button>' +
          '<button type="button" class="btn ghost small" data-all="0">' + esc(t('none')) + '</button></span></h2>' +
        '<div class="ex-chs">' + chs.map(function (c) {
          return '<label class="ex-ch"><input type="checkbox" name="ch" value="' + esc(c.id) + '"' + (picked.indexOf(c.id) >= 0 ? ' checked' : '') + '><span>' +
            esc(K.text(null, 'chapterN', { n: c._n })) + ': ' + esc(L(c.title)) + '</span></label>';
        }).join('') + '</div>' +
        '<p class="muted small">' + esc(t('rules')) + '</p>' +
        '<button type="submit" class="btn big">' + icon(I.clock) + esc(t('start')) + '</button> <span class="form-msg" aria-live="polite"></span>' +
      '</form>' +
      (hist.length ? '<section class="card"><h2>' + esc(t('history')) + '</h2><ul class="ex-hist">' + hist.slice(0, 8).map(function (h) {
        return '<li>' + esc(t('histRow', { d: h.at, p: h.pct, n: h.n })) + '</li>';
      }).join('') + '</ul></section>' : '');
    var f = main.querySelector('form');
    f.addEventListener('click', function (e) {
      var b = e.target.closest('[data-all]');
      if (b) f.querySelectorAll('input[name=ch]').forEach(function (x) { x.checked = b.getAttribute('data-all') === '1'; });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      size = +f.querySelector('input[name=size]:checked').value;
      picked = [].map.call(f.querySelectorAll('input[name=ch]:checked'), function (x) { return x.value; });
      if (!picked.length) { f.querySelector('.form-msg').textContent = t('pickCh'); return; }
      begin();
    });
  }

  /* ---------- 2. answer ---------- */

  // Fair mix: one question from each chosen chapter in turn until the exam is full.
  function build() {
    var pools = chs.filter(function (c) { return picked.indexOf(c.id) >= 0; }).map(function (c) {
      return K.shuffle((c.quiz || []).filter(function (q) { return q && (q.type === 'mcq' || q.type === 'tf'); }).map(function (q) {
        var item = { ch: c, q: q, pick: null };
        if (q.type === 'mcq') item.order = K.shuffle(q.options.map(function (o, i) { return i; }));
        return item;
      }));
    });
    var out = [], i = 0;
    while (out.length < size && pools.some(function (p) { return p.length; })) {
      var p = pools[i % pools.length];
      if (p.length) out.push(p.shift());
      i++;
    }
    return K.shuffle(out);
  }
  function begin() {
    var qs = build();
    exam = { qs: qs, cur: 0, start: Date.now(), limit: qs.length * 60, done: false };
    draw();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    window.addEventListener('beforeunload', guard);
  }
  function guard(e) { if (exam && !exam.done) { e.preventDefault(); e.returnValue = ''; } }
  function left() { return exam.limit - (Date.now() - exam.start) / 1000; }
  function tick() {
    var el = main.querySelector('.ex-time b');
    if (el) el.textContent = mmss(left());
    if (left() <= 60) { var box = main.querySelector('.ex-time'); if (box) box.classList.add('low'); }
    if (left() <= 0) finish(true);
  }
  function choiceHTML(item, i) {
    var q = item.q, name = 'a' + i;
    if (q.type === 'tf') {
      return [true, false].map(function (v) {
        return '<label class="ex-opt"><input type="radio" name="' + name + '" value="' + v + '"' + (item.pick === v ? ' checked' : '') + '><span>' + esc(t(v ? 'trueW' : 'falseW')) + '</span></label>';
      }).join('');
    }
    return item.order.map(function (o) {
      return '<label class="ex-opt"><input type="radio" name="' + name + '" value="' + o + '"' + (item.pick === o ? ' checked' : '') + '><span>' + esc(L(q.options[o])) + '</span></label>';
    }).join('');
  }
  function draw() {
    K.applyLang(t('title'));
    var n = exam.qs.length, item = exam.qs[exam.cur], answered = exam.qs.filter(function (x) { return x.pick !== null; }).length;
    main.innerHTML = crumbs() +
      '<div class="ex-bar card"><span class="ex-count">' + esc(t('qOf', { n: exam.cur + 1, m: n })) + '</span>' +
        '<span class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + answered + '"><span style="width:' + Math.round(100 * answered / n) + '%"></span></span>' +
        '<span class="ex-time' + (left() <= 60 ? ' low' : '') + '" role="timer" aria-label="' + esc(t('timeLeft')) + '">' + icon(I.clock) + '<b>' + mmss(left()) + '</b></span></div>' +
      '<form class="card ex-q" novalidate><p class="eyebrow">' + esc(K.text(null, 'chapterN', { n: item.ch._n })) + ' · ' + esc(L(item.ch.title)) + '</p>' +
        '<h2>' + esc(L(item.q.q)) + '</h2><div class="ex-opts">' + choiceHTML(item, exam.cur) + '</div>' +
        '<div class="ex-nav"><button type="button" class="btn ghost" data-go="-1"' + (exam.cur === 0 ? ' disabled' : '') + '>' + icon(I.back) + esc(t('back')) + '</button>' +
          (exam.cur < n - 1 ? '<button type="button" class="btn" data-go="1">' + esc(t('next')) + icon(I.next) + '</button>' : '') +
          '<button type="button" class="btn' + (exam.cur < n - 1 ? ' ghost' : '') + '" data-finish>' + icon(I.check) + esc(t('finish')) + '</button></div>' +
      '</form>' +
      '<details class="card ex-jump"><summary>' + icon(I.grid) + ' ' + esc(t('jump')) + '</summary><div class="ex-grid">' + exam.qs.map(function (x, i) {
        return '<button type="button" class="ex-num' + (x.pick !== null ? ' done' : '') + (i === exam.cur ? ' cur' : '') + '" data-to="' + i + '">' + (i + 1) + '</button>';
      }).join('') + '</div></details>';
    var f = main.querySelector('.ex-q');
    f.addEventListener('change', function (e) {
      var v = e.target.value;
      item.pick = item.q.type === 'tf' ? v === 'true' : +v;
      var bar = main.querySelector('.ex-bar .pbar span'), done = exam.qs.filter(function (x) { return x.pick !== null; }).length;
      bar.style.width = Math.round(100 * done / n) + '%';
      var num = main.querySelector('.ex-num[data-to="' + exam.cur + '"]'); if (num) num.classList.add('done');
    });
  }
  main.addEventListener('click', function (e) {
    if (!exam || exam.done) return;
    var go = e.target.closest('[data-go]'), to = e.target.closest('[data-to]');
    if (go) { exam.cur = Math.max(0, Math.min(exam.qs.length - 1, exam.cur + +go.getAttribute('data-go'))); draw(); window.scrollTo(0, 0); }
    if (to) { exam.cur = +to.getAttribute('data-to'); draw(); }
    if (e.target.closest('[data-finish]')) {
      var empty = exam.qs.filter(function (x) { return x.pick === null; }).length;
      if (empty && !window.confirm(t('unanswered', { n: empty }))) return;
      finish(false);
    }
  });

  /* ---------- 3. result ---------- */

  function isRight(x) { return x.q.type === 'tf' ? x.pick === !!x.q.answer : x.pick === x.q.answer; }
  function answerText(x, v) {
    if (v === null) return t('empty');
    return x.q.type === 'tf' ? t(v ? 'trueW' : 'falseW') : L(x.q.options[v]);
  }
  function finish(timeUp) {
    if (exam.done) return;
    exam.done = true;
    clearInterval(timer);
    window.removeEventListener('beforeunload', guard);
    var n = exam.qs.length, score = exam.qs.filter(isRight).length, pct = n ? Math.round(100 * score / n) : 0;
    var secs = Math.min(exam.limit, (Date.now() - exam.start) / 1000);
    var low = pct < 50;
    if (!low) {
      var hist = K.load('exams', []) || [];
      hist.unshift({ at: K.today(), pct: pct, score: score, n: n });
      K.save('exams', hist.slice(0, 30));
    }
    var by = {};
    exam.qs.forEach(function (x) {
      var b = by[x.ch.id] || (by[x.ch.id] = { ch: x.ch, n: 0, ok: 0 });
      b.n++; if (isRight(x)) b.ok++;
    });
    var rows = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.ok / a.n - b.ok / b.n; });
    main.innerHTML = crumbs() +
      (timeUp ? '<p class="card note ex-timeup" role="status">' + icon(I.clock) + ' ' + esc(t('timeUp')) + '</p>' : '') +
      '<section class="card ex-result"><h1>' + esc(t('result', { s: score, m: n, p: pct })) + '</h1>' +
        '<span class="pbar big"><span style="width:' + pct + '%"></span></span>' +
        '<p class="muted">' + esc(t('took', { t: mmss(secs) })) + '</p>' +
        (low ? '<div class="low-score card note"><h2>' + esc(K.text(null, 'lowScoreTitle', { pct: pct })) + '</h2><p>' + esc(K.text(null, 'lowScoreText')) + '</p></div>'
          : '<p class="ex-saved">' + icon(I.check) + ' ' + esc(t('saved')) + '</p>') +
        '<button type="button" class="btn" data-new>' + icon(I.exam) + esc(t('again')) + '</button></section>' +
      '<section class="card"><h2>' + esc(t('byChapter')) + '</h2><div class="table-wrap"><table class="ex-table"><thead><tr><th>' + esc(t('chapter')) + '</th><th>' + esc(t('right')) + '</th><th>%</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          var p = Math.round(100 * r.ok / r.n), weak = p < 50;
          return '<tr class="' + (weak ? 'weak' : 'strong') + '"><td>' + esc(K.text(null, 'chapterN', { n: r.ch._n })) + ': ' + esc(L(r.ch.title)) + '</td><td dir="ltr">' + r.ok + ' / ' + r.n + '</td><td dir="ltr">' + p + '%</td><td>' +
            (weak ? '<a class="btn small" href="' + K.chapterUrl(r.ch) + '">' + esc(t('readAgain')) + '</a>' : '<span class="ex-ok">' + icon(I.check) + esc(t('good')) + '</span>') + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
      '<details class="card ex-review"><summary>' + esc(t('review')) + '</summary><ol>' + exam.qs.map(function (x) {
        var ok = isRight(x);
        return '<li class="' + (ok ? 'ok' : 'bad') + '"><p><strong>' + esc(L(x.q.q)) + '</strong></p><p>' + esc(t('yours')) + ': ' + esc(answerText(x, x.pick)) + (ok ? ' ✔' : ' ✘') + '</p>' +
          (ok ? '' : '<p class="ex-right">' + esc(t('correct')) + ': ' + esc(answerText(x, x.q.type === 'tf' ? !!x.q.answer : x.q.answer)) + '</p>') + '</li>';
      }).join('') + '</ol></details>';
    main.querySelector('[data-new]').addEventListener('click', function () { exam = null; setup(); window.scrollTo(0, 0); });
    window.scrollTo(0, 0);
  }

  K.onLang(function () { if (!exam) setup(); else if (exam.done) setup(); else draw(); });
  K.applyLang(t('title'));
  K.chapters().then(function (list) { chs = list; setup(); }).catch(function () {
    main.innerHTML = crumbs() + '<p class="card note">' + esc(t('loadError')) + '</p>';
  });
})();
