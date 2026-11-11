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
    tooShort: { sd: 'سوال ٿورو وڏو لکو.', ur: 'سوال تھوڑا لمبا لکھیں۔', en: 'Please write a longer question.' },
    offline: { sd: 'انٽرنيٽ ناهي. انٽرنيٽ سان ٻيهر ڪوشش ڪريو.', ur: 'انٹرنیٹ نہیں ہے۔ انٹرنیٹ کے ساتھ دوبارہ کوشش کریں۔', en: 'No internet. Please try again when you are online.' },
    busy: { sd: 'هن وقت جواب نه ملي سگهيو. ٿوري دير بعد ٻيهر ڪوشش ڪريو.', ur: 'اس وقت جواب نہیں مل سکا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔', en: 'Could not answer right now. Please try again in a little while.' },
    limit: { sd: 'اڄ جا سوال پورا ٿي ويا. سڀاڻي ٻيهر پڇو.', ur: 'آج کے سوال پورے ہو گئے۔ کل دوبارہ پوچھیں۔', en: 'Today\'s questions are used up. Please ask again tomorrow.' },
    notReady: { sd: 'AI استاد اڃا تيار ناهي.', ur: 'AI استاد ابھی تیار نہیں ہے۔', en: 'AI Ustad is not ready yet.' },
    noSchool: { sd: 'مان رڳو اسڪول ۽ پڙهائي بابت مدد ڪري سگهان ٿو.', ur: 'میں صرف اسکول اور پڑھائی کے بارے میں مدد کر سکتا ہوں۔', en: 'I can only help with school and studies.' },
    read: { sd: 'ڪتاب ۾ پڙهو', ur: 'کتاب میں پڑھیں', en: 'Read in the book' }
  };
  function lang() {
    var l = 'sd';
    try { l = JSON.parse(localStorage.getItem('ssp1.lang')) || document.documentElement.lang || 'sd'; } catch (e) { l = document.documentElement.lang || 'sd'; }
    return T.title[l] ? l : 'sd';
  }
  function t(k) { var l = lang(); return T[k][l] || T[k].ur; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]; }); }
  function L(o) { var l = lang(); return o ? (o[l] || o.ur || o.en || '') : ''; }
  function skip() { return /^\/(ustad|class|school|paper|staff|stats|admin|parent)(\/|$)/.test(location.pathname); }

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
    if (q.length < 3) { add('bot', esc(t('tooShort'))); return; }
    add('me', esc(q));
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
        wait.innerHTML = esc(d.answer).replace(/\n+/g, '<br>') + (links ? '<span class="uc-links">' + links + '</span>' : '');
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
