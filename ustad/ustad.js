/* "Science Ustad" (سائنس استاد): a child types or says a science question and gets a short answer made only from
   the Class 5 book, in Sindhi, Urdu or English. The answer comes from the Supabase function `science-ustad`
   (source: tools/ustad/index.ts), which has a daily limit so the AI bill stays small. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    title: { sd: 'سائنس استاد', ur: 'سائنس استاد', en: 'Science Ustad' },
    lead: {
      sd: 'سائنس جو ڪو به سوال پڇو. سائنس استاد توهان جي ڪلاس 5 جي ڪتاب مان آسان لفظن ۾ جواب ڏيندو.',
      ur: 'سائنس کا کوئی بھی سوال پوچھیں۔ سائنس استاد آپ کی جماعت پنجم کی کتاب سے آسان الفاظ میں جواب دے گا۔',
      en: 'Ask any science question. Science Ustad answers in simple words from your Class 5 book.'
    },
    label: { sd: 'توهان جو سوال', ur: 'آپ کا سوال', en: 'Your question' },
    placeholder: { sd: 'مثال: مينهن ڇو ٿو وسي؟', ur: 'مثال: بارش کیوں ہوتی ہے؟', en: 'For example: Why does it rain?' },
    ask: { sd: 'پڇو', ur: 'پوچھیں', en: 'Ask' },
    speak: { sd: 'ڳالهائي پڇو', ur: 'بول کر پوچھیں', en: 'Ask by speaking' },
    listening: { sd: 'ٻڌي رهيو آهيان…', ur: 'سن رہا ہوں…', en: 'Listening…' },
    micNote: {
      sd: 'ڳالهائڻ واري بٽڻ تي توهان جو آواز لفظن ۾ بدلائڻ لاءِ برائوزر جي سروس ڏانهن وڃي ٿو.',
      ur: 'بول کر پوچھنے پر آپ کی آواز الفاظ میں بدلنے کے لیے براؤزر کی سروس کو جاتی ہے۔',
      en: 'When you ask by speaking, your voice goes to the browser\'s speech service to turn it into words.'
    },
    tryThese: { sd: 'هي سوال آزمايو:', ur: 'یہ سوال آزمائیں:', en: 'Try these questions:' },
    examples: {
      sd: ['مينهن ڇو ٿو وسي؟', 'ٻوٽا کاڌو ڪيئن ٺاهيندا آهن؟', 'مقناطيس ڇا ڇڪي ٿو؟'],
      ur: ['بارش کیوں ہوتی ہے؟', 'پودے خوراک کیسے بناتے ہیں؟', 'مقناطیس کیا چیزیں کھینچتا ہے؟'],
      en: ['Why does it rain?', 'How do plants make food?', 'What does a magnet pull?']
    },
    thinking: { sd: 'سائنس استاد سوچي رهيو آهي…', ur: 'سائنس استاد سوچ رہا ہے…', en: 'Science Ustad is thinking…' },
    answer: { sd: 'جواب', ur: 'جواب', en: 'Answer' },
    listen: { sd: 'جواب ٻڌو', ur: 'جواب سنیں', en: 'Listen' },
    stop: { sd: 'روڪيو', ur: 'روکیں', en: 'Stop' },
    readMore: { sd: 'ڪتاب ۾ پڙهو:', ur: 'کتاب میں پڑھیں:', en: 'Read in the book:' },
    note: {
      sd: 'جواب ڪمپيوٽر (AI) ڪتاب مان ٺاهي ٿو. ڪڏهن ڪڏهن غلطي ٿي سگهي ٿي، تنهن ڪري استاد کان به پڇو.',
      ur: 'جواب کمپیوٹر (AI) کتاب سے بناتا ہے۔ کبھی کبھی غلطی ہو سکتی ہے، اس لیے استاد سے بھی پوچھیں۔',
      en: 'A computer (AI) writes the answer from the book. It can sometimes be wrong, so also ask your teacher.'
    },
    privacy: {
      sd: 'پنهنجو نالو، فون نمبر يا ايڊريس نه لکو.',
      ur: 'اپنا نام، فون نمبر یا پتہ نہ لکھیں۔',
      en: 'Do not write your name, phone number or address.'
    },
    tooShort: { sd: 'پهريان پنهنجو سوال لکو.', ur: 'پہلے اپنا سوال لکھیں۔', en: 'Write your question first.' },
    notInBook: {
      sd: 'هي سوال توهان جي ڪلاس 5 جي ڪتاب ۾ نه آهي. پنهنجي استاد کان پڇو، يا ٻيو سوال پڇو.',
      ur: 'یہ سوال آپ کی جماعت پنجم کی کتاب میں نہیں ہے۔ اپنے استاد سے پوچھیں، یا کوئی اور سوال پوچھیں۔',
      en: 'This is not in your Class 5 book. Ask your teacher, or ask another question.'
    },
    notReady: {
      sd: 'سائنس استاد جلد شروع ٿيندو. تيستائين سبق ۽ ڪوئز ڏسو.',
      ur: 'سائنس استاد جلد شروع ہوگا۔ تب تک اسباق اور کوئز دیکھیں۔',
      en: 'Science Ustad is starting soon. Until then, have a look at the lessons and quizzes.'
    },
    personLimit: { sd: 'اڄ جا سوال پورا ٿي ويا. سڀاڻي ٻيهر پڇو.', ur: 'آج کے سوال پورے ہو گئے۔ کل دوبارہ پوچھیں۔', en: 'That is all the questions for today. Ask again tomorrow.' },
    siteLimit: {
      sd: 'اڄ سائنس استاد کان تمام گهڻا سوال پڇيا ويا. سڀاڻي ٻيهر ڪوشش ڪريو.',
      ur: 'آج سائنس استاد سے بہت زیادہ سوال پوچھے گئے۔ کل دوبارہ کوشش کریں۔',
      en: 'Science Ustad has had a lot of questions today. Please try again tomorrow.'
    },
    busy: { sd: 'هن وقت جواب نه ملي سگهيو. ٿوري دير بعد ٻيهر ڪوشش ڪريو.', ur: 'اس وقت جواب نہیں مل سکا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔', en: 'Could not get an answer right now. Please try again a little later.' },
    offline: { sd: 'سوال پڇڻ لاءِ انٽرنيٽ گهرجي.', ur: 'سوال پوچھنے کے لیے انٹرنیٹ چاہیے۔', en: 'You need the internet to ask a question.' }
  };

  var main = document.getElementById('main');
  var state = { lang: 'sd', busy: false };
  try { var saved = JSON.parse(localStorage.getItem('ssp1.lang')); if (LANGS.indexOf(saved) >= 0) state.lang = saved; } catch (e) { /* Sindhi */ }
  var chapterHint = (location.search.match(/[?&]ch=([\w-]{1,40})/) || [])[1] || null;

  function t(k) { var o = T[k]; return o ? (o[state.lang] != null ? o[state.lang] : o.en) : k; }
  function L(o) { return o == null ? '' : typeof o === 'object' ? (o[state.lang] || o.en || '') : String(o); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var ICON = {
    ask: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.5M12 16h.01"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>'
  };
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[n] + '</svg>'; }

  /* ---------- speaking and listening (the phone's own voices) ---------- */

  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  function voiceFor(lang) {
    if (!('speechSynthesis' in window)) return null;
    var want = lang === 'en' ? 'en' : lang;
    return speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(want) === 0; })[0] || null;
  }
  function listen(input, btn) {
    var r = new Rec();
    r.lang = state.lang === 'en' ? 'en-US' : state.lang === 'sd' ? 'sd-PK' : 'ur-PK';
    r.interimResults = false; r.maxAlternatives = 1;
    btn.classList.add('on'); btn.querySelector('span').textContent = t('listening');
    r.onresult = function (e) { input.value = e.results[0][0].transcript; input.focus(); };
    r.onerror = r.onend = function () { btn.classList.remove('on'); btn.querySelector('span').textContent = t('speak'); };
    try { r.start(); } catch (e) { r.onend(); }
  }

  /* ---------- asking ---------- */

  function ask(q) {
    var out = main.querySelector('.us-answer'), btn = main.querySelector('.us-form button[type=submit]');
    if (q.trim().length < 3) { out.innerHTML = '<p class="us-msg">' + esc(t('tooShort')) + '</p>'; return; }
    if (!CFG || navigator.onLine === false) { out.innerHTML = '<p class="us-msg">' + esc(t('offline')) + '</p>'; return; }
    if (state.busy) return;
    state.busy = true; btn.disabled = true;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    out.innerHTML = '<p class="us-msg" role="status">' + esc(t('thinking')) + '</p>';
    fetch(CFG.supabaseUrl + '/functions/v1/science-ustad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseKey },
      body: JSON.stringify({ q: q.trim().slice(0, 300), lang: state.lang, chapter: chapterHint })
    }).then(function (r) {
      return r.json().catch(function () { return { error: 'busy' }; });
    }).then(function (d) {
      if (d.answer) return show(q, d.answer, d.sources || []);
      var key = d.notInBook || d.refused ? 'notInBook' : d.error === 'not_ready' ? 'notReady' : d.error === 'person_limit' ? 'personLimit' :
        d.error === 'site_limit' ? 'siteLimit' : d.error === 'too_short' ? 'tooShort' : 'busy';
      out.innerHTML = '<p class="us-msg">' + esc(t(key)) + '</p>';
    }).catch(function () {
      out.innerHTML = '<p class="us-msg">' + esc(t(navigator.onLine === false ? 'offline' : 'busy')) + '</p>';
    }).then(function () { state.busy = false; btn.disabled = false; });
  }

  function show(q, answer, sources) {
    var out = main.querySelector('.us-answer');
    var seen = {}, links = sources.filter(function (s) { if (seen[s.chapter]) return false; seen[s.chapter] = 1; return true; }).map(function (s) {
      return '<a href="/class-5/science/' + encodeURIComponent(s.chapter) + '#' + encodeURIComponent(s.section) + '">' + icon('book') + '<span>' + esc(L(s.title)) + '</span></a>';
    }).join('');
    var canSpeak = !!voiceFor(state.lang);
    out.innerHTML = '<section class="card us-reply" aria-live="polite">' +
      '<p class="us-q">' + esc(q) + '</p>' +
      '<h2>' + esc(t('answer')) + '</h2>' +
      '<div class="us-text">' + answer.split(/\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      (canSpeak ? '<button type="button" class="btn ghost small us-listen">' + icon('volume') + '<span>' + esc(t('listen')) + '</span></button>' : '') +
      (links ? '<div class="us-sources"><p class="muted small">' + esc(t('readMore')) + '</p>' + links + '</div>' : '') +
      '</section>';
    var lb = out.querySelector('.us-listen');
    if (lb) lb.addEventListener('click', function () {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); lb.querySelector('span').textContent = t('listen'); return; }
      var u = new SpeechSynthesisUtterance(answer);
      u.voice = voiceFor(state.lang); u.lang = u.voice.lang; u.rate = 0.9;
      u.onend = function () { lb.querySelector('span').textContent = t('listen'); };
      lb.querySelector('span').textContent = t('stop');
      speechSynthesis.speak(u);
    });
  }

  /* ---------- page ---------- */

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = RTL[state.lang] ? 'rtl' : 'ltr';
    document.title = t('title') + ' | ' + t('siteName');
    var sn = document.getElementById('site-name'); if (sn) sn.textContent = t('siteName');
    [].forEach.call(document.querySelectorAll('[data-setlang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === state.lang)); });
  }
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="card us-hero"><span class="icon-tile us-icon">' + icon('ask') + '</span><div><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div></section>' +
      '<form class="card us-form" novalidate>' +
        '<label for="us-q"><strong>' + esc(t('label')) + '</strong></label>' +
        '<textarea id="us-q" name="q" rows="3" maxlength="300" placeholder="' + esc(t('placeholder')) + '"></textarea>' +
        '<p class="muted small">' + esc(t('privacy')) + '</p>' +
        '<div class="btn-row"><button type="submit" class="btn">' + icon('ask') + esc(t('ask')) + '</button>' +
          (Rec ? '<button type="button" class="btn ghost us-mic">' + icon('mic') + '<span>' + esc(t('speak')) + '</span></button>' : '') + '</div>' +
        (Rec ? '<p class="muted small">' + esc(t('micNote')) + '</p>' : '') +
        '<p class="us-try"><span class="muted small">' + esc(t('tryThese')) + '</span>' + t('examples').map(function (x) {
          return '<button type="button" class="chip" data-q="' + esc(x) + '">' + esc(x) + '</button>';
        }).join('') + '</p>' +
      '</form>' +
      '<div class="us-answer"></div>' +
      '<p class="muted small us-note">' + esc(t('note')) + '</p>';
    var form = main.querySelector('.us-form'), input = form.querySelector('textarea');
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    form.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-q'); ask(input.value); }); });
    var mic = form.querySelector('.us-mic');
    if (mic) mic.addEventListener('click', function () { listen(input, mic); });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (!b) return;
    var l = b.getAttribute('data-setlang');
    if (LANGS.indexOf(l) < 0 || l === state.lang) return;
    state.lang = l;
    try { localStorage.setItem('ssp1.lang', JSON.stringify(l)); } catch (err) { /* this visit only */ }
    applyLang(); render();
  });
  if ('speechSynthesis' in window) speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', function () { /* voices load late on some phones */ });

  applyLang();
  render();
})();
