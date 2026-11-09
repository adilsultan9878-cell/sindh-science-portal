/* Quick games (/play/) from the whole book:
   - Picture puzzle: a real photo or a lesson drawing; the child picks the chapter it belongs to (10 pictures).
   - True or false in 30 seconds: as many statements as the child can answer.
   Results add to "My progress" points.
   Chapters come from the database (what the staff panel publishes), with the files in /data as backup.
   Address: /play/ (both games), /play/?g=picture, /play/?g=tf */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var ROUND = 10, PHOTOS = 5, SECONDS = 30;
  var main = document.getElementById('main');

  var T = {
    pageTitle: { sd: 'تڪڙيون رانديون', ur: 'فوری کھیل', en: 'Quick games' },
    intro: { sd: 'سڄي ڪتاب مان ٻه مزيدار رانديون. هر صحيح جواب تي پوائنٽ ملي ٿو.', ur: 'پوری کتاب سے دو مزے دار کھیل۔ ہر درست جواب پر پوائنٹ ملتا ہے۔', en: 'Two fun games from the whole book. Every right answer gives a point.' },
    picTitle: { sd: 'تصوير سڃاڻو', ur: 'تصویر پہچانو', en: 'Picture puzzle' },
    picText: { sd: 'تصوير ڏسو ۽ ٻڌايو ته هي ڪهڙي باب جي آهي. 10 تصويرون.', ur: 'تصویر دیکھیں اور بتائیں کہ یہ کس باب کی ہے۔ 10 تصویریں۔', en: 'Look at the picture and say which chapter it is from. 10 pictures.' },
    tfTitle: { sd: 'صحيح يا غلط: 30 سيڪنڊ', ur: 'سچ یا جھوٹ: 30 سیکنڈ', en: 'True or false: 30 seconds' },
    tfText: { sd: '30 سيڪنڊن ۾ جيترا وڌيڪ جواب ڏئي سگهو، ڏيو.', ur: '30 سیکنڈ میں جتنے زیادہ جواب دے سکیں، دیں۔', en: 'Answer as many as you can in 30 seconds.' },
    play: { sd: 'کيڏو', ur: 'کھیلیں', en: 'Play' },
    best: { sd: 'توهان جو بهترين: {n}', ur: 'آپ کا بہترین: {n}', en: 'Your best: {n}' },
    which: { sd: 'هي تصوير ڪهڙي باب جي آهي؟', ur: 'یہ تصویر کس باب کی ہے؟', en: 'Which chapter is this picture from?' },
    picOf: { sd: 'تصوير {n} / {m}', ur: 'تصویر {n} / {m}', en: 'Picture {n} of {m}' },
    kindPhoto: { sd: 'اصل تصوير', ur: 'اصل تصویر', en: 'Real photo' },
    kindPicture: { sd: 'تصوير', ur: 'تصویر', en: 'Picture' },
    kindDrawing: { sd: 'سبق جي تصوير', ur: 'سبق کی تصویر', en: 'Lesson drawing' },
    kindExp: { sd: 'تجربي جي تصوير', ur: 'تجربے کی تصویر', en: 'Experiment drawing' },
    right: { sd: 'شاباس! صحيح جواب.', ur: 'شاباش! درست جواب۔', en: 'Well done! That is right.' },
    wrong: { sd: 'صحيح جواب: {c}', ur: 'درست جواب: {c}', en: 'The right answer: {c}' },
    fromPart: { sd: 'هي تصوير «{p}» حصي مان آهي.', ur: 'یہ تصویر «{p}» والے حصے سے ہے۔', en: 'This picture is from the part "{p}".' },
    fromExp: { sd: 'هي تجربي «{p}» جي تصوير آهي.', ur: 'یہ تجربے «{p}» کی تصویر ہے۔', en: 'This is the experiment "{p}".' },
    fromPhoto: { sd: 'هي هن باب جي تصوير آهي.', ur: 'یہ اس باب کی تصویر ہے۔', en: 'This is the picture of this chapter.' },
    readChapter: { sd: 'هي باب پڙهو', ur: 'یہ باب پڑھیں', en: 'Read this chapter' },
    next: { sd: 'اڳيون', ur: 'اگلا', en: 'Next' },
    finish: { sd: 'نتيجو ڏسو', ur: 'نتیجہ دیکھیں', en: 'See the result' },
    scoreOf: { sd: '{n} / {m} صحيح', ur: '{n} / {m} درست', en: '{n} of {m} right' },
    again: { sd: 'ٻيهر کيڏو', ur: 'دوبارہ کھیلیں', en: 'Play again' },
    allGames: { sd: 'سڀ رانديون', ur: 'تمام کھیل', en: 'All games' },
    newBest: { sd: 'نئون رڪارڊ!', ur: 'نیا ریکارڈ!', en: 'New record!' },
    points: { sd: '+{n} پوائنٽس «منهنجي ترقي» ۾', ur: '+{n} پوائنٹس «میری پیش رفت» میں', en: '+{n} points in "My progress"' },
    tfRules: { sd: 'جملو پڙهو ۽ ✔ صحيح يا ✘ غلط دٻايو. هر صحيح جواب = 1 پوائنٽ. «شروع ڪريو» دٻائڻ سان 30 سيڪنڊ شروع ٿيندا.', ur: 'جملہ پڑھیں اور ✔ سچ یا ✘ جھوٹ دبائیں۔ ہر درست جواب = 1 پوائنٹ۔ «شروع کریں» دبانے سے 30 سیکنڈ شروع ہوں گے۔', en: 'Read the sentence and press ✔ True or ✘ False. Each right answer = 1 point. The 30 seconds start when you press Start.' },
    keys: { sd: 'ڪمپيوٽر تي: T = صحيح، F = غلط', ur: 'کمپیوٹر پر: T = سچ، F = جھوٹ', en: 'On a computer: T = true, F = false' },
    start: { sd: 'شروع ڪريو', ur: 'شروع کریں', en: 'Start' },
    trueBtn: { sd: 'صحيح', ur: 'سچ', en: 'True' },
    falseBtn: { sd: 'غلط', ur: 'جھوٹ', en: 'False' },
    timeLeft: { sd: 'باقي وقت', ur: 'باقی وقت', en: 'Time left' },
    score: { sd: 'اسڪور', ur: 'اسکور', en: 'Score' },
    streak: { sd: 'لڳاتار {n}', ur: 'لگاتار {n}', en: '{n} in a row' },
    timeUp: { sd: 'وقت پورو!', ur: 'وقت ختم!', en: "Time's up!" },
    answered: { sd: '{a} جملن مان {n} صحيح', ur: '{a} جملوں میں سے {n} درست', en: '{n} right out of {a}' },
    review: { sd: 'هي ٻيهر سکو', ur: 'یہ دوبارہ سیکھیں', en: 'Learn these again' },
    yourAnswers: { sd: 'توهان جا جواب', ur: 'آپ کے جوابات', en: 'Your answers' },
    itIs: { sd: 'هي جملو {x} آهي.', ur: 'یہ جملہ {x} ہے۔', en: 'This sentence is {x}.' },
    allRight: { sd: 'سڀ جواب صحيح! واهه!', ur: 'سب جواب درست! واہ!', en: 'All answers right! Wonderful!' },
    loading: { sd: 'باب لوڊ ٿي رهيا آهن…', ur: 'ابواب لوڈ ہو رہے ہیں…', en: 'Loading the chapters…' },
    loadError: { sd: 'باب لوڊ نه ٿي سگهيا. انٽرنيٽ چيڪ ڪري صفحو ٻيهر کوليو.', ur: 'ابواب لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کر کے صفحہ دوبارہ کھولیں۔', en: 'The chapters could not be loaded. Check the internet and open the page again.' },
    credit: { sd: 'تصوير', ur: 'تصویر', en: 'Picture' }
  };

  function load(k, d) { try { var v = localStorage.getItem('ssp1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('ssp1.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  var params = new URLSearchParams(location.search);
  var state = {
    lang: LANGS.indexOf(load('lang', null)) >= 0 ? load('lang', null) : 'sd',
    game: ['picture', 'tf'].indexOf(params.get('g')) >= 0 ? params.get('g') : null,
    chapters: [],
    pic: null,      // { items, i, score, answered }
    tf: null        // { deck, i, score, streak, log, endAt, running, done, lock }
  };

  /* ---------- text helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) {
    if (o == null) return '';
    if (typeof o !== 'object') return String(o);
    var v = o[state.lang];
    return v != null && v !== '' ? String(v) : String(o.en || o.ur || o.sd || '');
  }
  function t(key, vars) {
    var src = T[key] || (window.UI_TEXT || {})[key];
    var s = src ? L(src) : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function chName(ch) { return t('chapterN', { n: ch._n }) + ': ' + L(ch.title); }
  function chUrl(ch) { return '/class-5/science/' + encodeURIComponent(ch.id); }

  /* ---------- data: database first, the files in /data as backup ---------- */

  function getJSON(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }
  function chapterIds(catalog) {
    var cls = catalog && (catalog.classes || []).filter(function (c) { return c.id === '5'; })[0];
    var subj = cls && (cls.subjects || []).filter(function (s) { return s.id === 'science'; })[0];
    return subj && Array.isArray(subj.chapters) ? subj.chapters : [];
  }
  function fromDb() {
    if (!CFG || !CFG.supabaseUrl) return Promise.reject(new Error('no config'));
    var ctl = typeof AbortController === 'function' ? new AbortController() : null, timer;
    var req = fetch(CFG.supabaseUrl + '/rest/v1/rpc/public_subject', {
      method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_class: '5', p_subject: 'science' }), signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (!r.ok) throw new Error('db ' + r.status); return r.json(); })
      .then(function (rows) { if (!Array.isArray(rows) || !rows.length) throw new Error('empty'); return rows; });
    var limit = new Promise(function (resolve, reject) { timer = setTimeout(function () { if (ctl) ctl.abort(); reject(new Error('timeout')); }, 8000); });
    return Promise.race([req, limit]).then(function (rows) { clearTimeout(timer); return rows; }, function (e) { clearTimeout(timer); throw e; });
  }
  function loadChapters() {
    var catalog = getJSON('/data/catalog.json').catch(function () { return null; });
    return fromDb().catch(function () {
      return catalog.then(function (c) {
        return Promise.all(chapterIds(c).map(function (id) { return getJSON('/data/class-5/science/' + encodeURIComponent(id) + '.json').catch(function () { return null; }); }));
      }).then(function (rows) { rows = rows.filter(Boolean); if (!rows.length) throw new Error('no files'); return rows; });
    }).catch(function () {
      var saved = load('content.5/science', null);
      if (Array.isArray(saved) && saved.length) return saved;
      throw new Error('no chapters');
    }).then(function (rows) {
      return catalog.then(function (c) {
        var ids = chapterIds(c);
        rows = rows.filter(function (ch) { return ch && ch.id && ch.title; });
        rows.sort(function (a, b) {
          var ia = ids.indexOf(a.id), ib = ids.indexOf(b.id);
          if (ia < 0) ia = 1000 + (+a.number || 0);
          if (ib < 0) ib = 1000 + (+b.number || 0);
          return ia - ib;
        });
        rows.forEach(function (ch, i) { ch._n = ch.number != null && ch.number !== '' ? ch.number : i + 1; });
        return rows;
      });
    });
  }

  /* ---------- results ---------- */

  function bestOf(game) { return (load('play', {}) || {})[game] || 0; }
  // Saves the best score, adds the points to "My progress".
  function finishGame(game, score, total) {
    var bests = load('play', {}) || {}, isBest = score > (bests[game] || 0);
    if (isBest) { bests[game] = score; save('play', bests); }
    if (score > 0) { var p = load('progress', {}) || {}; p.points = (p.points || 0) + score; save('progress', p); }
    return isBest && score > 0;
  }
  function resultExtras(score, isBest) {
    return (isBest ? '<p class="pl-best">🏆 ' + esc(t('newBest')) + '</p>' : '') +
      (score > 0 ? '<p class="pl-points">' + esc(t('points', { n: score })) + '</p>' : '');
  }

  /* ---------- landing ---------- */

  function viewLanding() {
    main.innerHTML = '<p class="crumbs no-print"><a href="/">' + esc(t('home')) + '</a> › <a href="/games">' + esc(t('gamesTitle')) + '</a> › ' + esc(t('pageTitle')) + '</p>' +
      '<h1>' + esc(t('pageTitle')) + '</h1><p>' + esc(t('intro')) + '</p>' +
      '<div class="pl-cards">' +
        '<a class="card pl-card" href="/play/?g=picture"><span class="pl-emoji" aria-hidden="true">🖼️</span><span><strong>' + esc(t('picTitle')) + '</strong>' +
          '<span class="muted">' + esc(t('picText')) + '</span><small class="pl-mini">' + esc(t('best', { n: bestOf('picture') + ' / ' + ROUND })) + '</small></span></a>' +
        '<a class="card pl-card" href="/play/?g=tf"><span class="pl-emoji" aria-hidden="true">⏱️</span><span><strong>' + esc(t('tfTitle')) + '</strong>' +
          '<span class="muted">' + esc(t('tfText')) + '</span><small class="pl-mini">' + esc(t('best', { n: bestOf('tf') })) + '</small></span></a>' +
      '</div>';
  }

  /* ---------- picture puzzle ---------- */

  function sectionOf(ch, sid) { return (ch.lesson || []).filter(function (s) { return s.id === sid; })[0] || null; }
  // Ten different chapters; the first five get their chapter photo when they have one, the rest a lesson or experiment drawing.
  function makePictureRound() {
    var chs = state.chapters, picks = shuffle(chs.filter(function (ch) { return (window.PICTURES || {})[ch.id]; })).slice(0, PHOTOS);
    var others = shuffle(chs.filter(function (ch) { return picks.indexOf(ch) < 0; })).slice(0, ROUND - picks.length);
    var items = picks.map(function (ch) {
      var pic = window.PICTURES[ch.id];
      return { ch: ch, kind: /\.jpe?g$/i.test(pic.link || '') ? 'photo' : 'picture', src: pic.src, w: pic.w, h: pic.h, credit: pic.author + ' · ' + pic.license + ' · Wikimedia Commons', part: sectionOf(ch, pic.topic) };
    }).concat(others.map(function (ch) {
      var secs = ch.lesson || [], useExp = ch.experiment && (!secs.length || Math.random() < 0.25);
      if (useExp) return { ch: ch, kind: 'exp', src: '/img/exp/' + ch.id + '.svg', w: 600, h: 320, exp: ch.experiment };
      var sec = secs[Math.floor(Math.random() * secs.length)];
      return { ch: ch, kind: 'drawing', src: '/img/lesson/' + ch.id + '-' + sec.id + '.svg', w: 640, h: 400, part: sec };
    }));
    return shuffle(items).map(function (it) {
      return { it: it, options: shuffle([it.ch].concat(shuffle(chs.filter(function (c) { return c !== it.ch; })).slice(0, 3))), chosen: null };
    });
  }
  function kindLabel(it) { return t({ photo: 'kindPhoto', picture: 'kindPicture', drawing: 'kindDrawing', exp: 'kindExp' }[it.kind]); }
  function explain(it) {
    if (it.kind === 'exp') return t('fromExp', { p: L(it.exp.title) });
    if (it.kind === 'drawing' && it.part) return t('fromPart', { p: L(it.part.title) });
    return it.part ? t('fromPart', { p: L(it.part.title) }) : t('fromPhoto');
  }

  function viewPicture() {
    var g = state.pic;
    if (!g || g.done) return viewPictureEnd();
    var q = g.items[g.i], it = q.it, answered = q.chosen != null;
    main.innerHTML = '<p class="crumbs no-print"><a href="/">' + esc(t('home')) + '</a> › <a href="/play/">' + esc(t('pageTitle')) + '</a> › ' + esc(t('picTitle')) + '</p>' +
      '<h1>' + esc(t('picTitle')) + '</h1>' +
      '<div class="pl-top"><span>' + esc(t('picOf', { n: g.i + 1, m: g.items.length })) + '</span><span class="pl-score">' + esc(t('score')) + ': <b>' + g.score + '</b></span></div>' +
      '<div class="pl-progress" aria-hidden="true"><span style="width:' + Math.round(100 * g.i / g.items.length) + '%"></span></div>' +
      '<figure class="card pl-pic"><span class="pl-kind">' + esc(kindLabel(it)) + '</span>' +
        '<img src="' + esc(it.src) + '" alt="' + esc(t('which')) + '" width="' + it.w + '" height="' + it.h + '">' +
        (it.credit ? '<figcaption>' + esc(t('credit')) + ': ' + esc(it.credit) + '</figcaption>' : '') + '</figure>' +
      '<h2 class="pl-q">' + esc(t('which')) + '</h2>' +
      '<div class="pl-opts">' + q.options.map(function (ch, k) {
        var cls = !answered ? '' : ch === it.ch ? ' is-right' : ch === q.chosen ? ' is-wrong' : ' is-dim';
        return '<button type="button" class="pl-opt' + cls + '" data-opt="' + k + '"' + (answered ? ' disabled' : '') + '><span class="pl-opt-icon" aria-hidden="true">' + esc(ch.icon || '') + '</span>' +
          '<span><small>' + esc(t('chapterN', { n: ch._n })) + '</small>' + esc(L(ch.title)) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="pl-feedback" role="status" aria-live="polite">' + (answered ?
        '<div class="pl-note ' + (q.chosen === it.ch ? 'ok' : 'bad') + '"><strong>' + esc(q.chosen === it.ch ? t('right') : t('wrong', { c: chName(it.ch) })) + '</strong> ' +
          esc(explain(it)) + ' <a href="' + chUrl(it.ch) + '">' + esc(t('readChapter')) + '</a></div>' +
        '<button type="button" class="btn big" data-act="next">' + esc(g.i + 1 < g.items.length ? t('next') : t('finish')) + '</button>' : '') + '</div>';
    if (answered) { var nb = main.querySelector('[data-act="next"]'); if (nb) nb.focus(); }
  }
  function viewPictureEnd() {
    var g = state.pic;
    main.innerHTML = '<h1>' + esc(t('picTitle')) + '</h1>' +
      '<div class="card pl-result"><p class="pl-big">' + esc(t('scoreOf', { n: g.score, m: g.items.length })) + '</p>' + resultExtras(g.score, g.isBest) +
        '<div class="btn-row"><button type="button" class="btn big" data-act="pic-again">' + esc(t('again')) + '</button>' +
        '<a class="btn ghost big" href="/play/">' + esc(t('allGames')) + '</a></div></div>' +
      '<h2>' + esc(t('yourAnswers')) + '</h2><ol class="pl-review">' + g.items.map(function (q) {
        var ok = q.chosen === q.it.ch;
        return '<li class="' + (ok ? 'ok' : 'bad') + '"><img src="' + esc(q.it.src) + '" alt="" width="96" height="64" loading="lazy"><span>' +
          '<b>' + (ok ? '✔ ' : '✘ ') + '<a href="' + chUrl(q.it.ch) + '">' + esc(chName(q.it.ch)) + '</a></b><small class="muted">' + esc(explain(q.it)) + '</small></span></li>';
      }).join('') + '</ol>';
  }
  function startPicture() { state.pic = { items: makePictureRound(), i: 0, score: 0, done: false }; viewPicture(); window.scrollTo(0, 0); }

  /* ---------- true or false in 30 seconds ---------- */

  function tfDeck() {
    var pool = [];
    state.chapters.forEach(function (ch) {
      (ch.quiz || []).forEach(function (q) { if (q.type === 'tf' && q.q) pool.push({ ch: ch, text: q.q, answer: !!q.answer }); });
      ((ch.worksheet || {}).tf || []).forEach(function (x) { if (x.text) pool.push({ ch: ch, text: x.text, answer: !!x.answer }); });
    });
    return shuffle(pool);
  }
  var tick = null;
  function stopTimer() { if (tick) { clearInterval(tick); tick = null; } }
  function secondsLeft() { var g = state.tf; return g && g.running ? Math.max(0, (g.endAt - Date.now()) / 1000) : SECONDS; }

  function viewTf() {
    var g = state.tf;
    if (g && g.done) return viewTfEnd();
    var crumbs = '<p class="crumbs no-print"><a href="/">' + esc(t('home')) + '</a> › <a href="/play/">' + esc(t('pageTitle')) + '</a> › ' + esc(t('tfTitle')) + '</p>';
    if (!g || !g.running) {
      main.innerHTML = crumbs + '<h1>' + esc(t('tfTitle')) + '</h1>' +
        '<div class="card pl-start"><p>' + esc(t('tfRules')) + '</p><p class="muted small">' + esc(t('keys')) + '</p>' +
        '<p class="pl-mini">' + esc(t('best', { n: bestOf('tf') })) + '</p>' +
        '<button type="button" class="btn big" data-act="tf-start">' + esc(t('start')) + '</button></div>';
      return;
    }
    var item = g.deck[g.i % g.deck.length], left = secondsLeft();
    main.innerHTML = crumbs + '<h1>' + esc(t('tfTitle')) + '</h1>' +
      '<div class="pl-top"><span class="pl-time" role="timer">' + esc(t('timeLeft')) + ': <b id="tf-secs">' + Math.ceil(left) + '</b></span>' +
        '<span class="pl-score">' + esc(t('score')) + ': <b>' + g.score + '</b>' + (g.streak >= 3 ? ' · 🔥 ' + esc(t('streak', { n: g.streak })) : '') + '</span></div>' +
      '<div class="pl-progress time" aria-hidden="true"><span id="tf-bar" style="width:' + (100 * left / SECONDS) + '%"></span></div>' +
      '<div class="card pl-statement' + (g.flash ? ' flash-' + g.flash : '') + '"><small class="muted">' + esc(chName(item.ch)) + '</small><p>' + esc(L(item.text)) + '</p></div>' +
      '<div class="pl-tf"><button type="button" class="pl-tf-btn yes" data-tf="1"' + (g.lock ? ' disabled' : '') + '>✔ ' + esc(t('trueBtn')) + '</button>' +
        '<button type="button" class="pl-tf-btn no" data-tf="0"' + (g.lock ? ' disabled' : '') + '>✘ ' + esc(t('falseBtn')) + '</button></div>';
  }
  function viewTfEnd() {
    var g = state.tf, wrong = g.log.filter(function (x) { return !x.ok; });
    main.innerHTML = '<h1>' + esc(t('tfTitle')) + '</h1>' +
      '<div class="card pl-result"><p class="pl-time-up">⏰ ' + esc(t('timeUp')) + '</p><p class="pl-big">' + esc(t('answered', { a: g.log.length, n: g.score })) + '</p>' + resultExtras(g.score, g.isBest) +
        '<div class="btn-row"><button type="button" class="btn big" data-act="tf-start">' + esc(t('again')) + '</button>' +
        '<a class="btn ghost big" href="/play/">' + esc(t('allGames')) + '</a></div></div>' +
      (g.log.length ? (wrong.length ? '<h2>' + esc(t('review')) + '</h2><ol class="pl-review tf">' + wrong.map(function (x) {
        return '<li class="bad"><span><b>' + esc(L(x.item.text)) + '</b><small>' + esc(t('itIs', { x: x.item.answer ? t('trueBtn') : t('falseBtn') })) + ' · <a href="' + chUrl(x.item.ch) + '">' + esc(chName(x.item.ch)) + '</a></small></span></li>';
      }).join('') + '</ol>' : '<p class="pl-note ok">🌟 ' + esc(t('allRight')) + '</p>') : '');
  }
  function startTf() {
    stopTimer();
    state.tf = { deck: tfDeck(), i: 0, score: 0, streak: 0, log: [], running: true, done: false, lock: false, flash: null, endAt: Date.now() + SECONDS * 1000 };
    viewTf();
    window.scrollTo(0, 0);
    tick = setInterval(function () {
      var g = state.tf;
      if (!g || !g.running) return stopTimer();
      var left = secondsLeft(), s = document.getElementById('tf-secs'), b = document.getElementById('tf-bar');
      if (s) s.textContent = Math.ceil(left);
      if (b) b.style.width = (100 * left / SECONDS) + '%';
      if (left <= 0) endTf();
    }, 100);
  }
  function answerTf(val) {
    var g = state.tf;
    if (!g || !g.running || g.lock) return;
    var item = g.deck[g.i % g.deck.length], ok = item.answer === val;
    g.log.push({ item: item, ok: ok });
    if (ok) { g.score++; g.streak++; } else g.streak = 0;
    g.flash = ok ? 'ok' : 'bad';
    g.lock = true;
    viewTf();
    setTimeout(function () {
      if (state.tf !== g || !g.running) return;
      g.i++; g.lock = false; g.flash = null;
      viewTf();
    }, ok ? 250 : 650);
  }
  function endTf() {
    var g = state.tf;
    stopTimer();
    if (!g || g.done) return;
    g.running = false; g.done = true;
    g.isBest = finishGame('tf', g.score, g.log.length);
    viewTf();
  }

  /* ---------- page ---------- */

  function applyLang() {
    var l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    var site = document.getElementById('site-name');
    if (site) site.textContent = t('siteName');
    document.querySelectorAll('[data-setlang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === l)); });
    document.title = (state.game === 'picture' ? t('picTitle') : state.game === 'tf' ? t('tfTitle') : t('pageTitle')) + ' | ' + t('siteName');
  }
  function render() {
    applyLang();
    if (state.game === 'picture') { if (!state.pic) state.pic = { items: makePictureRound(), i: 0, score: 0, done: false }; viewPicture(); }
    else if (state.game === 'tf') viewTf();
    else viewLanding();
  }

  main.addEventListener('click', function (e) {
    var opt = e.target.closest('[data-opt]'), act = e.target.closest('[data-act]'), tf = e.target.closest('[data-tf]');
    if (opt && state.pic && !state.pic.done) {
      var q = state.pic.items[state.pic.i];
      if (q.chosen != null) return;
      q.chosen = q.options[+opt.getAttribute('data-opt')];
      if (q.chosen === q.it.ch) state.pic.score++;
      viewPicture();
    } else if (act) {
      var a = act.getAttribute('data-act');
      if (a === 'next') {
        var g = state.pic;
        if (g.i + 1 < g.items.length) { g.i++; viewPicture(); window.scrollTo(0, 0); }
        else { g.done = true; g.isBest = finishGame('picture', g.score, g.items.length); viewPicture(); window.scrollTo(0, 0); }
      } else if (a === 'pic-again') startPicture();
      else if (a === 'tf-start') startTf();
    } else if (tf) answerTf(tf.getAttribute('data-tf') === '1');
  });
  document.addEventListener('keydown', function (e) {
    if (state.game !== 'tf' || !state.tf || !state.tf.running || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = (e.key || '').toLowerCase();
    if (k === 't' || k === '1') { e.preventDefault(); answerTf(true); }
    else if (k === 'f' || k === '2') { e.preventDefault(); answerTf(false); }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (!b) return;
    state.lang = b.getAttribute('data-setlang');
    save('lang', state.lang);
    if (state.chapters.length) render(); else applyLang();
  });

  applyLang();
  main.innerHTML = '<p class="loading">' + esc(t('loading')) + '</p>';
  loadChapters().then(function (chs) { state.chapters = chs; render(); })
    .catch(function () { main.innerHTML = '<p class="card">' + esc(t('loadError')) + '</p>'; });
})();
