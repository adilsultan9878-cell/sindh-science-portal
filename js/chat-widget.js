/* AI Ustad chat bubble: a round green button in the corner of every children's page that opens a small chat.
   It asks the same "science-ustad" server as the /ustad/ page, in "school" mode: it answers school and study
   questions only and kindly says no to anything else. The chat stays only in this open page. */
(function () {
  'use strict';
  if (window.__ustadChat) return;
  window.__ustadChat = true;
  var CFG = window.PORTAL_CONFIG || null;
  var T = {
    title: { sd: 'AI استاد', ur: 'AI استاد', en: 'AI Ustad' },
    sub: { sd: 'اسڪول ۽ پڙهائي بابت پڇو', ur: 'اسکول اور پڑھائی کے بارے میں پوچھیں', en: 'Ask about school and studies' },
    hello: { sd: 'السلام عليڪم! مان توهان جو AI استاد آهيان. سائنس، سبق، هوم ورڪ يا امتحان بابت ڪجهه به پڇو.', ur: 'السلام علیکم! میں آپ کا AI استاد ہوں۔ سائنس، سبق، ہوم ورک یا امتحان کے بارے میں کچھ بھی پوچھیں۔', en: 'Hello! I am your AI Ustad. Ask me anything about science, lessons, homework or exams.' },
    place: { sd: 'پنهنجو سوال لکو...', ur: 'اپنا سوال لکھیں...', en: 'Type your question...' },
    send: { sd: 'موڪليو', ur: 'بھیجیں', en: 'Send' },
    open: { sd: 'AI استاد سان ڳالهايو', ur: 'AI استاد سے بات کریں', en: 'Chat with AI Ustad' },
    close: { sd: 'بند ڪريو', ur: 'بند کریں', en: 'Close' },
    thinking: { sd: 'سوچي رهيو آهيان...', ur: 'سوچ رہا ہوں...', en: 'Thinking...' },
    tooShort: { sd: 'سوال ٿورو وڏو لکو. مثال: ٻج ڪيئن ڦٽي ٿو؟', ur: 'سوال تھوڑا لمبا لکھیں۔ مثال: بیج کیسے اگتا ہے؟', en: 'Please write a longer question. Example: How does a seed grow?' },
    greet: { sd: 'وعليڪم السلام! 😊 پنهنجو سائنس جو سوال لکو، مثال: ٻوٽن کي وڌڻ لاءِ ڇا گهرجي؟', ur: 'وعلیکم السلام! 😊 اپنا سائنس کا سوال لکھیں، مثال: پودوں کو بڑھنے کے لیے کیا چاہیے؟', en: 'Hello! 😊 Type your science question, for example: What do plants need to grow?' },
    offline: { sd: 'انٽرنيٽ ناهي. انٽرنيٽ سان ٻيهر ڪوشش ڪريو.', ur: 'انٹرنیٹ نہیں ہے۔ انٹرنیٹ کے ساتھ دوبارہ کوشش کریں۔', en: 'No internet. Please try again when you are online.' },
    busy: { sd: 'هن وقت جواب نه ملي سگهيو. ٿوري دير بعد ٻيهر ڪوشش ڪريو.', ur: 'اس وقت جواب نہیں مل سکا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔', en: 'Could not answer right now. Please try again in a little while.' },
    limit: { sd: 'اڄ جا سوال پورا ٿي ويا. سڀاڻي ٻيهر پڇو.', ur: 'آج کے سوال پورے ہو گئے۔ کل دوبارہ پوچھیں۔', en: 'Today\'s questions are used up. Please ask again tomorrow.' },
    notReady: { sd: 'AI استاد اڃا تيار ناهي.', ur: 'AI استاد ابھی تیار نہیں ہے۔', en: 'AI Ustad is not ready yet.' },
    noSchool: { sd: 'مان رڳو اسڪول ۽ پڙهائي بابت مدد ڪري سگهان ٿو.', ur: 'میں صرف اسکول اور پڑھائی کے بارے میں مدد کر سکتا ہوں۔', en: 'I can only help with school and studies.' },
    read: { sd: 'ڪتاب ۾ پڙهو', ur: 'کتاب میں پڑھیں', en: 'Read in the book' },
    here: { sd: 'هي رهيو ڳنڍڻو:', ur: 'یہ رہا لنک:', en: 'Here is the link:' },
    chapter: { sd: 'باب', ur: 'باب', en: 'Chapter' },
    whichChapter: { sd: 'ڪهڙي باب جو؟ باب جو نمبر لکو، مثال: باب 2 جي ورڪ شيٽ', ur: 'کس باب کا؟ باب کا نمبر لکھیں، مثال: باب 2 کی ورک شیٹ', en: 'Which chapter? Write its number, for example: worksheet of chapter 2' }
  };
  function lang() {
    var l = 'sd';
    try { l = JSON.parse(localStorage.getItem('ssp1.lang')) || document.documentElement.lang || 'sd'; } catch (e) { l = document.documentElement.lang || 'sd'; }
    return T.title[l] ? l : 'sd';
  }
  function t(k) { var l = lang(); return T[k][l] || T[k].ur; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]; }); }
  function L(o) { var l = lang(); return o ? (o[l] || o.ur || o.en || '') : ''; }
  function skip() { return /^\/ustad(\/|$)/.test(location.pathname); }   // the full AI Ustad page has its own chat

  /* ---------- website help: "worksheet of chapter 2" gives the link, no AI needed ---------- */
  var PAGES = [
    { re: /worksheet|ورک\s*شیٹ|ورڪ\s*شيٽ/i, tab: 'worksheet', name: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' } },
    { re: /quiz|test|کوئز|ڪوئز|ٹیسٹ/i, tab: 'quiz', name: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quiz' } },
    { re: /experiment|tajurb|tajarb|تجرب/i, tab: 'experiment', name: { sd: 'تجربو', ur: 'تجربہ', en: 'Experiment' } },
    { re: /diagram|خاکہ|خاڪو/i, tab: 'diagram', name: { sd: 'خاڪو', ur: 'خاکہ', en: 'Diagram' } },
    { re: /game|khel|کھیل|راند/i, tab: 'game', name: { sd: 'راند', ur: 'کھیل', en: 'Game' } },
    { re: /words|glossary|الفاظ|لفظ/i, tab: 'words', name: { sd: 'اهم لفظ', ur: 'اہم الفاظ', en: 'Key words' } },
    { re: /pdf|book|kitab|کتاب|ڪتاب/i, book: true, name: { sd: 'ڪتاب PDF', ur: 'کتاب PDF', en: 'Book PDF' } },
    { re: /lesson|chapter|sabaq|baab|سبق|باب/i, tab: '', name: { sd: 'سبق', ur: 'سبق', en: 'Lesson' } }
  ];
  var SITE = [
    { re: /log\s*in|login|password|لاگ|پاسورڈ/i, href: '/login', name: { sd: 'لاگ ان', ur: 'لاگ ان', en: 'Log in' } },
    { re: /progress|result|natija|پیش\s*رفت|ترقي|نتیجہ|نتيجو/i, href: '/progress', name: { sd: 'منهنجي ترقي', ur: 'میری پیش رفت', en: 'My progress' } },
    { re: /competition|مقابل/i, href: '/competition', name: { sd: 'مقابلو', ur: 'مقابلہ', en: 'Competition' } },
    { re: /leaderboard|لیڈر|ليڊر/i, href: '/leaderboard', name: { sd: 'ليڊر بورڊ', ur: 'لیڈر بورڈ', en: 'Leaderboard' } },
    { re: /video|ویڈیو|وڊيو/i, href: '/watch', name: { sd: 'وڊيو', ur: 'ویڈیوز', en: 'Videos' } },
    { re: /exam|imtihan|امتحان/i, href: '/exam/', name: { sd: 'امتحان جي تياري', ur: 'امتحان کی تیاری', en: 'Mock exam' } },
    { re: /flash|cards|کارڈ|ڪارڊ/i, href: '/cards/', name: { sd: 'ڪارڊ', ur: 'فلیش کارڈ', en: 'Flash cards' } },
    { re: /teacher|اساتذہ|استادن/i, href: '/class/', name: { sd: 'استاد جو صفحو', ur: 'استاد کا صفحہ', en: 'Teacher page' } },
    { re: /games|کھیل|راند/i, href: '/games', name: { sd: 'رانديون', ur: 'کھیل', en: 'Games' } }
  ];
  var NUMS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
    'ایک': 1, 'دو': 2, 'تین': 3, 'چار': 4, 'پانچ': 5, 'چھ': 6, 'سات': 7, 'آٹھ': 8, 'نو': 9, 'دس': 10, 'گیارہ': 11, 'بارہ': 12, 'تیرہ': 13,
    'هڪ': 1, 'ٻه': 2, 'ٽي': 3, 'پنج': 5, 'ڇهه': 6, 'ست': 7, 'اٺ': 8, 'ڏهه': 10 };
  var chapterIds = null;
  function loadIds() {
    if (chapterIds) return Promise.resolve(chapterIds);
    return fetch('/data/catalog.json').then(function (r) { return r.json(); }).then(function (c) {
      var cls = c.classes.filter(function (x) { return x.id === '5'; })[0];
      chapterIds = cls.subjects.filter(function (s) { return s.id === 'science'; })[0].chapters;
      return chapterIds;
    });
  }
  function chapterNumber(q) {
    var s = q.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }).replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); });
    var m = s.match(/(\d{1,2})/);
    if (m) return +m[1];
    var w = s.toLowerCase().split(/[\s،,.؟?!]+/);
    for (var i = 0; i < w.length; i++) if (NUMS[w[i]]) return NUMS[w[i]];
    return 0;
  }
  // a promise of the reply (HTML) when the child is looking for a page of the website, otherwise null
  function siteHelp(q) {
    var wantsLink = /kahan|kidhar|kaha[ny]|chahi?ye|chaiye|dikhao|kholo|batao|link|لنک|ڳنڍڻو|کہاں|ڪٿي|where|open|کھول|کول|چاہیے|چاهي|want|need|give|show|دکھا|ڏيکار|ملے|ملي/i.test(q);
    var n = chapterNumber(q), page = PAGES.filter(function (p) { return p.re.test(q); })[0];
    if (n >= 1 && n <= 13 && page) {
      return loadIds().then(function (ids) {
        var id = ids[n - 1];
        if (!id) return null;
        var href = page.book ? '/book/pdf/' + id + '-' + lang() + '.pdf' : '/class-5/science/' + id + (page.tab ? '/' + page.tab : '');
        return esc(t('here')) + '<span class="uc-links"><a href="' + href + '">' + esc(L(page.name)) + ' · ' + esc(t('chapter')) + ' ' + n + '</a></span>';
      }).catch(function () { return null; });
    }
    if (!wantsLink) return null;
    var hit = SITE.filter(function (p) { return p.re.test(q); })[0];
    if (hit) return Promise.resolve(esc(t('here')) + '<span class="uc-links"><a href="' + hit.href + '">' + esc(L(hit.name)) + '</a></span>');
    if (page) return Promise.resolve(esc(t('whichChapter')));
    return null;
  }


  var CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';
  var root = document.createElement('div');
  root.className = 'uc no-print';
  root.innerHTML = '<button type="button" class="uc-fab" aria-expanded="false">' + CHAT + '</button>' +
    '<section class="uc-box" hidden role="dialog"><header class="uc-head"><span class="uc-avatar">' + CHAT + '</span><span class="uc-hd"><strong></strong><small></small></span>' +
    '<button type="button" class="uc-x">&times;</button></header><div class="uc-log" aria-live="polite"></div>' +
    '<form class="uc-form"><input type="text" maxlength="300" autocomplete="off"><button type="submit" class="uc-send"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2-7z"/></svg></button></form></section>';
  var fab = root.querySelector('.uc-fab'), box = root.querySelector('.uc-box'), log = root.querySelector('.uc-log'),
    form = root.querySelector('.uc-form'), input = form.querySelector('input'), busy = false, said = false;

  function labels() {
    fab.setAttribute('aria-label', t('open')); fab.title = t('open');
    box.setAttribute('aria-label', t('title'));
    root.querySelector('.uc-hd strong').textContent = t('title');
    root.querySelector('.uc-hd small').textContent = t('sub');
    root.querySelector('.uc-x').setAttribute('aria-label', t('close'));
    input.placeholder = t('place');
    form.querySelector('.uc-send').setAttribute('aria-label', t('send'));
    root.dir = lang() === 'en' ? 'ltr' : 'rtl';
  }
  function add(who, html) {
    var p = document.createElement('div');
    p.className = 'uc-msg ' + who;
    p.innerHTML = html;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }
  function openBox(on) {
    box.hidden = !on;
    fab.setAttribute('aria-expanded', on ? 'true' : 'false');
    root.classList.toggle('on', on);
    if (on) {
      labels();
      if (!said) { said = true; add('bot', esc(t('hello'))); }
      setTimeout(function () { input.focus(); }, 50);
    }
  }
  function chapterHint() { var m = location.pathname.match(/^\/class-\d+\/[\w-]+\/([\w-]{1,40})/); return m ? m[1] : null; }
  function ask(q) {
    q = q.trim();
    if (busy) return;
    // a greeting ("hi", "salam", "اسلام علیکم" …) gets a friendly answer instead of "too short"
    if (/^(hi+|hey|hello|helo|salam|salaam|aoa|assalam\w*|السلام\s*علي[کك]م|اسلام\s*علي[کك]م|سلام|ہیلو|هيلو)[\s!.,،۔]*$/i.test(q)) {
      add('me', esc(q)); add('bot', esc(t('greet'))); input.value = ''; return;
    }
    if (q.length < 3) { add('bot', esc(t('tooShort'))); return; }
    add('me', esc(q));
    var help = siteHelp(q);
    if (help) {
      busy = true;
      help.then(function (html) { busy = false; if (html) add('bot', html); else askAi(q); });
      return;
    }
    askAi(q);
  }
  function askAi(q) {
    if (!CFG || navigator.onLine === false) { add('bot', esc(t('offline'))); return; }
    busy = true;
    var wait = add('bot wait', esc(t('thinking')));
    fetch(CFG.supabaseUrl + '/functions/v1/science-ustad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.supabaseKey },
      body: JSON.stringify({ q: q.slice(0, 300), lang: lang(), chapter: chapterHint(), mode: 'school' })
    }).then(function (r) { return r.json().catch(function () { return { error: 'busy' }; }); }).then(function (d) {
      if (d.answer) {
        var seen = {}, links = (d.sources || []).filter(function (s) { if (seen[s.chapter]) return false; seen[s.chapter] = 1; return true; }).slice(0, 2).map(function (s) {
          return '<a href="/class-5/science/' + encodeURIComponent(s.chapter) + '">' + esc(t('read')) + ': ' + esc(L(s.title)) + '</a>';
        }).join('');
        wait.className = 'uc-msg bot';
        wait.innerHTML = esc(d.answer).replace(/\n+/g, '<br>')
          .replace(/https:\/\/sindh-science-portal\.vercel\.app[^\s<)"'،۔]*/g, function (u) { u = u.replace(/[.,;:!?]+$/, ''); return '<a href="' + u + '" dir="ltr">' + u.replace('https://sindh-science-portal.vercel.app', '') + '</a>'; }) + (links ? '<span class="uc-links">' + links + '</span>' : '');
      } else {
        var key = d.notInBook || d.refused ? 'noSchool' : d.error === 'not_ready' ? 'notReady' : (d.error === 'person_limit' || d.error === 'site_limit') ? 'limit' : d.error === 'too_short' ? 'tooShort' : 'busy';
        wait.className = 'uc-msg bot'; wait.textContent = t(key);
      }
    }).catch(function () {
      wait.className = 'uc-msg bot'; wait.textContent = t(navigator.onLine === false ? 'offline' : 'busy');
    }).then(function () { busy = false; log.scrollTop = log.scrollHeight; });
  }

  fab.addEventListener('click', function () { openBox(box.hidden); });
  root.querySelector('.uc-x').addEventListener('click', function () { openBox(false); fab.focus(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value; input.value = ''; ask(q); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) { openBox(false); fab.focus(); } });
  // the SPA changes pages without reloading: hide the bubble on grown-ups' pages and the full AI Ustad page
  function place() { root.hidden = skip(); if (root.hidden) openBox(false); labels(); }
  ['pushState', 'replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () { var r = orig.apply(this, arguments); setTimeout(place, 0); return r; };
  });
  window.addEventListener('popstate', place);
  document.addEventListener('click', function (e) { if (e.target.closest('.lang-btn')) setTimeout(labels, 0); });
  function start() { document.body.appendChild(root); place(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
