/* Sindh Science Learning Portal — the whole site in one small script.
   No framework and no build step. Content comes from /data/*.json, interface text from ui-text.js.
   To add a class, subject or chapter, edit /data only. */
(function () {
  'use strict';

  var UI = window.UI_TEXT;
  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'];
  var LANG_NAMES = { sd: 'سنڌي', ur: 'اردو', en: 'English' };
  var RTL = { sd: true, ur: true, en: false };
  var COMP_QUESTIONS = 15;
  var COMP_SECONDS = 300;
  // Chapters whose home experiment has a drawing in /img/exp/<chapter id>.svg
  var EXP_PICTURES = ['living-things', 'plants', 'digestion', 'water-cycle', 'matter', 'force-machines', 'light-sound', 'electricity-magnets', 'earth-space'];
  var TAB_ICONS ={ lesson: '📖', diagram: '🖼️', quiz: '✅', worksheet: '📝', game: '🎮', experiment: '🔬', words: '🔤' };

  var main = document.getElementById('main');

  /* ---------- storage (this device only) ---------- */

  var PREFIX = 'ssp1.';
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* storage blocked: site still works */ }
    }
  };

  var savedLang = store.get('lang', null);
  var state = {
    lang: LANGS.indexOf(savedLang) >= 0 ? savedLang : null,
    catalog: null,
    chapters: {},
    subjects: {},
    timer: null
  };

  function getProgress() {
    var p = store.get('progress', {}) || {};
    return {
      quiz: p.quiz || {},
      games: p.games || {},
      points: p.points || 0,
      badges: p.badges || [],
      daily: p.daily || { last: null, streak: 0, ok: null },
      comps: p.comps || [],
      nick: p.nick || '',
      city: p.city || ''
    };
  }
  function saveProgress(p) { store.set('progress', p); }

  /* ---------- text helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Pick the current language from a {sd, ur, en} record.
  function L(o) {
    if (o == null) return '';
    if (typeof o !== 'object' || Array.isArray(o)) return o;
    var l = state.lang || 'sd';
    return o[l] != null ? o[l] : o.en;
  }
  function t(key, vars) {
    var s = L(UI[key]);
    if (s == null || s === '') s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  // **word** marks a key word in lesson text.
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong class="kw">$1</strong>'); }
  function paragraphs(lines) {
    var html = '', list = [];
    function flush() { if (list.length) { html += '<ul>' + list.map(function (li) { return '<li>' + rich(li) + '</li>'; }).join('') + '</ul>'; list = []; } }
    (lines || []).forEach(function (p) {
      if (p.indexOf('- ') === 0) list.push(p.slice(2)); else { flush(); html += '<p>' + rich(p) + '</p>'; }
    });
    flush();
    return html;
  }
  function sep() { return state.lang === 'en' ? ', ' : '، '; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return dateStr(new Date()); }
  function yesterdayStr() { var d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); }
  function fmtTime(sec) { return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  // Loose matching so search works across Sindhi, Urdu and Arabic letter forms.
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/\*\*/g, '')
      .replace(/[ً-ٰٟ۪-ۭ]/g, '')
      .replace(/[يى]/g, 'ی').replace(/[كڪ]/g, 'ک').replace(/[ہھۃة]/g, 'ه').replace(/[أإآ]/g, 'ا')
      .replace(/[.,،۔؟?!:;()«»"]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function allLangs(o) {
    if (o == null) return '';
    if (typeof o === 'string') return o;
    return LANGS.map(function (l) { var v = o[l]; return Array.isArray(v) ? v.join(' ') : (v || ''); }).join(' ');
  }

  /* ---------- small shared pieces of UI ---------- */

  var LEAF = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#e3f2e3"/>' +
    '<path d="M9 23 C 9 12, 16 7, 24 7 C 24 16, 19 23, 9 23 Z" fill="#43a047"/><path d="M9 23 L 19 13" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // "Dost" — the site's own friendly leaf guide.
  var DOST = '<svg class="dost" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M32 4 C 52 12, 60 32, 48 50 C 40 60, 24 60, 16 50 C 4 32, 12 12, 32 4 Z" fill="#81c784" stroke="#2e7d32" stroke-width="2"/>' +
    '<circle cx="24" cy="30" r="4" fill="#1b3a1b"/><circle cx="40" cy="30" r="4" fill="#1b3a1b"/>' +
    '<circle cx="25.4" cy="28.6" r="1.3" fill="#fff"/><circle cx="41.4" cy="28.6" r="1.3" fill="#fff"/>' +
    '<path d="M23 40 Q32 48 41 40" stroke="#1b3a1b" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="17" cy="38" r="3" fill="#f8bbd0"/><circle cx="47" cy="38" r="3" fill="#f8bbd0"/></svg>';

  function guide(msg) {
    return '<div class="guide">' + DOST + '<p><b>' + esc(t('guideName')) + ':</b> ' + esc(msg) + '</p></div>';
  }

  // Listen buttons. Urdu and English words have recorded voice files (listed in audio/index.json);
  // anything else uses the phone's own voice for that language, when the phone has one.
  var audioIndex = null, player = null;
  function phoneVoice(lang) {
    return window.speechSynthesis ? speechSynthesis.getVoices().filter(function (v) { return v.lang.toLowerCase().indexOf(lang) === 0; })[0] : null;
  }
  function sayBtn(text, lang) {
    if (!text || (lang === 'sd' && !phoneVoice('sd'))) return '';
    return '<button type="button" class="say no-print" data-say="' + esc(text) + '" data-say-lang="' + lang + '" title="' + esc(t('listen')) + '" aria-label="' + esc(t('listen')) + ': ' + esc(text) + '">🔊</button>';
  }
  function speak(btn) {
    var text = btn.getAttribute('data-say'), lang = btn.getAttribute('data-say-lang');
    var index = audioIndex ? Promise.resolve(audioIndex) : fetch('/audio/index.json').then(function (r) {
      if (!r.ok) return {};
      return r.json().then(function (j) { audioIndex = j; return j; });
    }).catch(function () { return {}; });
    index.then(function (idx) {
      var file = idx[lang] && idx[lang][text];
      if (file) {
        if (player) player.pause();
        player = new Audio('/audio/' + file);
        return player.play();
      }
      var voice = phoneVoice(lang);
      if (!voice) { btn.disabled = true; return; }
      var u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }).catch(function () { /* no sound offline before the first listen */ });
  }
  function crumbs(items) {
    return '<nav class="crumbs no-print" aria-label="breadcrumb">' + items.map(function (it, i) {
      return i < items.length - 1 ? '<a href="' + it[0] + '">' + esc(it[1]) + '</a> <span aria-hidden="true">›</span> ' : '<span>' + esc(it[1]) + '</span>';
    }).join('') + '</nav>';
  }
  function stars(pct) {
    var n = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
    return '<span class="stars" aria-label="' + n + '/3">' + '★★★'.slice(0, n) + '<span class="off">' + '★★★'.slice(n) + '</span></span>';
  }
  function setMeta(title, desc) {
    var site = t('siteName');
    document.title = title && title !== site ? title + ' | ' + site : site;
    var m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute('content', desc);
  }

  /* ---------- data ---------- */

  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function loadCatalog() {
    if (state.catalog) return Promise.resolve(state.catalog);
    return getJSON('/data/catalog.json').then(function (c) { state.catalog = c; return c; });
  }
  function findClass(id) { return state.catalog.classes.filter(function (c) { return c.id === id; })[0]; }
  function findSubject(cls, subj) {
    var c = findClass(cls);
    return c && c.subjects.filter(function (s) { return s.id === subj; })[0];
  }
  // Chapters come from the shared database, so the staff panel can edit them; the files in /data are the
  // backup copy. The last good copy is kept on the device so slow connections still open quickly.
  function dbFetch(path, opts) {
    opts = opts || {};
    var headers = { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' };
    if (opts.prefer) headers.Prefer = opts.prefer;
    return fetch(CFG.supabaseUrl + '/rest/v1/' + path, {
      method: opts.method || 'GET', headers: headers, keepalive: !!opts.keepalive,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('db ' + r.status);
      return opts.prefer === 'return=minimal' ? null : r.json();
    });
  }
  function timeout(p, ms) {
    return Promise.race([p, new Promise(function (resolve, reject) { setTimeout(function () { reject(new Error('timeout')); }, ms); })]);
  }
  function chaptersFromFiles(cls, subj) {
    return Promise.all(findSubject(cls, subj).chapters.map(function (id) {
      return getJSON('/data/class-' + cls + '/' + subj + '/' + id + '.json');
    }));
  }
  function chaptersFromDb(cls, subj) {
    return timeout(dbFetch('rpc/public_subject', { method: 'POST', body: { p_class: cls, p_subject: subj } }), 8000).then(function (list) {
      if (!Array.isArray(list) || !list.length) throw new Error('no published chapters');
      store.set('content.' + cls + '/' + subj, list);
      return list;
    });
  }
  function loadSubject(cls, subj) {
    var key = cls + '/' + subj;
    if (state.subjects[key]) return Promise.resolve(state.subjects[key]);
    var cached = store.get('content.' + key, null), p;
    if (!CFG) p = chaptersFromFiles(cls, subj);
    else if (cached && cached.length) {
      p = Promise.resolve(cached);
      chaptersFromDb(cls, subj).catch(function () { /* keep the saved copy */ }); // fresh copy for the next visit
    } else p = chaptersFromDb(cls, subj).catch(function () { return chaptersFromFiles(cls, subj); });
    return p.then(function (list) {
      state.subjects[key] = list.map(function (ch) {
        ch._key = key + '/' + ch.id; ch._cls = cls; ch._subj = subj;
        state.chapters[ch._key] = ch;
        return ch;
      });
      return state.subjects[key];
    });
  }
  function loadChapter(cls, subj, id) {
    return loadSubject(cls, subj).then(function (chs) { return chs.filter(function (c) { return c.id === id; })[0] || null; });
  }
  // Rows that could not be sent (no internet) wait on the device and go out when the connection is back.
  function send(path, row) {
    if (!CFG) return;
    dbFetch(path, { method: 'POST', body: row, prefer: 'return=minimal', keepalive: true }).catch(function () {
      var box = store.get('outbox', []);
      box.push({ path: path, row: row });
      store.set('outbox', box.slice(-100));
    });
  }
  function flushOutbox() {
    var box = store.get('outbox', []);
    if (!CFG || !box.length || navigator.onLine === false) return;
    store.set('outbox', []);
    box.forEach(function (item) { send(item.path, item.row); });
  }
  // Anonymous usage counts for the staff statistics page.
  function track(kind, extra) {
    var row = { kind: kind, lang: state.lang };
    Object.keys(extra || {}).forEach(function (k) { row[k] = extra[k]; });
    send('events', row);
  }
  function trackVisit() {
    try { if (sessionStorage.getItem('ssp.visit')) return; sessionStorage.setItem('ssp.visit', '1'); } catch (e) { return; }
    track('visit');
  }
  function activeSubjects() {
    var out = [];
    state.catalog.classes.forEach(function (c) {
      if (c.active) c.subjects.forEach(function (s) { if (s.active) out.push([c.id, s.id, s]); });
    });
    return out;
  }
  function loadAll() {
    return Promise.all(activeSubjects().map(function (x) { return loadSubject(x[0], x[1]); }))
      .then(function (lists) { return [].concat.apply([], lists); });
  }
  function activeChapterKeys() {
    var keys = [];
    activeSubjects().forEach(function (x) {
      var key = x[0] + '/' + x[1], list = state.subjects[key];
      if (list) list.forEach(function (ch) { keys.push(ch._key); });
      else x[2].chapters.forEach(function (id) { keys.push(key + '/' + id); });
    });
    return keys;
  }
  function chUrl(ch, tab) {
    return '/class-' + ch._cls + '/' + ch._subj + '/' + ch.id + (tab && tab !== 'lesson' ? '/' + tab : '');
  }
  function chLabel(ch) { return t('chapterN', { n: ch.number }) + ': ' + L(ch.title); }

  /* ---------- badges & points ---------- */

  // General badges are edited by admins in the staff panel (table "badges"). The last copy is kept on the
  // device; UI_BADGES is the built-in copy for the very first visit or when the database cannot be reached.
  var badgeList = store.get('badges', null) || window.UI_BADGES;
  function loadBadges() {
    if (!CFG) return;
    timeout(dbFetch('badges?select=id,icon,name,descr,rule,goal&order=sort.asc'), 8000).then(function (list) {
      if (!Array.isArray(list)) return;
      badgeList = list;
      store.set('badges', list);
    }).catch(function () { /* keep the saved copy */ });
  }
  function allBadges() {
    var list = badgeList.map(function (b) { return { id: b.id, icon: b.icon, name: L(b.name), desc: L(b.descr || b.desc) }; });
    Object.keys(state.chapters).forEach(function (k) {
      var ch = state.chapters[k];
      if (ch.badge) list.push({ id: ch.badge.id, icon: ch.badge.icon, name: L(ch.badge.name), desc: t('chapterBadgeDesc', { chapter: L(ch.title) }) });
    });
    return list;
  }
  function badgeById(id) { return allBadges().filter(function (b) { return b.id === id; })[0]; }

  function evaluateBadges(p) {
    var have = {}, fresh = [];
    p.badges.forEach(function (id) { have[id] = true; });
    function give(id) { if (!have[id]) { have[id] = true; fresh.push(id); } }
    var keys = activeChapterKeys();
    var scores = Object.keys(p.quiz).map(function (k) { return p.quiz[k]; });
    var games = Object.keys(p.games);
    var rules = {
      quizzes: function (n) { return scores.length >= n; },
      perfect: function (n) { return scores.some(function (q) { return q.best >= n; }); },
      all_quizzes: function () { return keys.length && keys.every(function (k) { return p.quiz[k]; }); },
      games: function (n) { return games.length >= n; },
      all_games: function () { return keys.length && keys.every(function (k) { return games.some(function (g) { return g.indexOf(k + '#') === 0; }); }); },
      streak: function (n) { return p.daily.streak >= n; },
      competitions: function (n) { return p.comps.length >= n; },
      points: function (n) { return p.points >= n; }
    };
    badgeList.forEach(function (b) { if (rules[b.rule] && rules[b.rule](b.goal || 1)) give(b.id); });
    Object.keys(state.chapters).forEach(function (k) {
      var ch = state.chapters[k];
      if (ch.badge && p.quiz[k] && p.quiz[k].best >= 80) give(ch.badge.id);
    });
    p.badges = Object.keys(have);
    return fresh;
  }
  function newBadgesHTML(ids) {
    if (!ids || !ids.length) return '';
    return '<div class="new-badges"><h3>🎉 ' + esc(t('newBadge')) + '</h3><div class="badge-row">' + ids.map(function (id) {
      var b = badgeById(id);
      return b ? '<span class="badge-chip"><span aria-hidden="true">' + b.icon + '</span> ' + esc(b.name) + '</span>' : '';
    }).join('') + '</div></div>';
  }

  /* ---------- page frame ---------- */

  function applyLang() {
    var l = state.lang || 'sd';
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
  }
  function isCurrent(href) {
    var p = location.pathname;
    if (href === '/') return p === '/';
    return p === href || p.indexOf(href + '/') === 0;
  }
  function renderFrame() {
    var links = [['/', 'home'], ['/class-5/science', 'learn'], ['/glossary', 'glossary'], ['/competition', 'competition'], ['/progress', 'progress'], ['/search', 'search']];
    var offline = state.lang && navigator.onLine === false;
    document.getElementById('top').innerHTML = (offline ? '<p class="offline-note" role="status">📴 ' + esc(t('offlineNote')) + '</p>' : '') +
      '<div class="wrap top-row">' +
        '<a class="brand" href="/">' + LEAF + '<span>' + esc(t('siteName')) + '</span></a>' +
        '<div class="langs" role="group" aria-label="Language / ٻولي / زبان">' + LANGS.map(function (l) {
          return '<button type="button" class="lang-btn" data-setlang="' + l + '" lang="' + l + '" aria-pressed="' + (state.lang === l) + '">' + LANG_NAMES[l] + '</button>';
        }).join('') + '</div>' +
      '</div>' +
      (state.lang ? '<nav class="wrap nav" aria-label="' + esc(t('menu')) + '">' + links.map(function (x) {
        return '<a href="' + x[0] + '"' + (isCurrent(x[0]) ? ' aria-current="page"' : '') + '>' + esc(t(x[1])) + '</a>';
      }).join('') + '</nav>' : '');
    document.getElementById('foot').innerHTML = state.lang ?
      '<div class="wrap">' +
        '<p>' + esc(t('footerFree')) + '</p>' +
        '<p class="foot-links"><a href="/teachers">' + esc(t('teachers')) + '</a> · <a href="/videos/">📹 ' + esc(t('videoGuide')) + '</a> · <a href="/leaderboard">' + esc(t('leaderboard')) + '</a> · <a href="/about">' + esc(t('about')) + '</a> · <a href="/admin">' + esc(t('staff')) + '</a></p>' +
        '<p>The Professional Educator · EduPulse Nexus · ' + esc(t('pilot')) + '</p>' +
      '</div>' : '';
  }

  /* ---------- router ---------- */

  var routes = [
    [/^\/$/, viewHome],
    [/^\/class-(\w+)\/?$/, viewClass],
    [/^\/class-(\w+)\/([\w-]+)\/?$/, viewSubject],
    [/^\/class-(\w+)\/([\w-]+)\/([\w-]+)(?:\/(\w+))?\/?$/, viewChapter],
    [/^\/glossary\/?$/, viewGlossary],
    [/^\/search\/?$/, viewSearch],
    [/^\/competition\/?$/, viewCompetition],
    [/^\/progress\/?$/, viewProgress],
    [/^\/leaderboard\/?$/, viewLeaderboard],
    [/^\/teachers\/?$/, viewTeachers],
    [/^\/about\/?$/, viewAbout]
  ];
  var renderId = 0;

  function clearTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  function render(scrollTop) {
    var id = ++renderId;
    clearTimer();
    applyLang();
    renderFrame();
    if (!state.lang) { viewChooseLang(); return; }
    trackVisit();
    loadCatalog().then(function () {
      if (id !== renderId) return;
      var path = location.pathname, match = null, fn = viewNotFound;
      for (var i = 0; i < routes.length; i++) {
        match = path.match(routes[i][0]);
        if (match) { fn = routes[i][1]; break; }
      }
      return Promise.resolve(fn.apply(null, [id].concat(match ? match.slice(1) : []))).then(function () {
        if (id !== renderId) return;
        if (location.hash) {
          var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (el) { el.scrollIntoView(); return; }
        }
        if (scrollTop) window.scrollTo(0, 0);
      });
    }).catch(function (e) {
      console.error(e);
      if (id === renderId) viewError();
    });
  }
  function stale(id) { return id !== renderId; }
  function go(url) { history.pushState(null, '', url); render(true); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (b) {
      state.lang = b.getAttribute('data-setlang');
      store.set('lang', state.lang);
      render(false);
      return;
    }
    var sb = e.target.closest('.say');
    if (sb) { speak(sb); return; }
    var a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^\/(data|fonts|css|js|img|audio|videos|lesson-videos)(\/|$)/.test(url.pathname) || /^\/admin/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // same-page anchor
    e.preventDefault();
    go(url.pathname + url.search + url.hash);
  });
  document.addEventListener('submit', function (e) {
    if (!e.target.classList.contains('search-form')) return;
    e.preventDefault();
    var q = e.target.querySelector('input[name="q"]').value.trim();
    go('/search' + (q ? '?q=' + encodeURIComponent(q) : ''));
  });
  window.addEventListener('popstate', function () { render(false); });
  window.addEventListener('online', function () { renderFrame(); flushOutbox(); });
  window.addEventListener('offline', renderFrame);

  /* ---------- offline app (service worker) and "install as an app" ---------- */

  var installPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;
    showInstall();
  });
  window.addEventListener('appinstalled', function () { installPrompt = null; showInstall(); });
  function showInstall() {
    var slot = document.getElementById('install-slot');
    if (!slot) return;
    if (!installPrompt) { slot.innerHTML = ''; return; }
    slot.innerHTML = '<div class="card install"><span class="quick-icon" aria-hidden="true">📲</span><div><strong>' + esc(t('install')) + '</strong>' +
      '<p class="muted">' + esc(t('installText')) + '</p><button type="button" class="btn">' + esc(t('install')) + '</button></div></div>';
    slot.querySelector('button').addEventListener('click', function () {
      installPrompt.prompt();
      installPrompt.userChoice.then(function () { installPrompt = null; showInstall(); });
    });
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () { /* offline mode unavailable */ }); });
  }

  /* ---------- views ---------- */

  function viewChooseLang() {
    document.title = 'سنڌ سائنس سکيا پورٽل | Sindh Science Learning Portal';
    main.innerHTML =
      '<section class="card choose-lang">' +
        '<h1><span lang="sd">' + esc(UI.chooseLang.sd) + '</span><span lang="ur">' + esc(UI.chooseLang.ur) + '</span><span lang="en">' + esc(UI.chooseLang.en) + '</span></h1>' +
        '<div class="lang-big">' + LANGS.map(function (l) {
          return '<button type="button" class="btn big" data-setlang="' + l + '" lang="' + l + '">' + LANG_NAMES[l] + '</button>';
        }).join('') + '</div>' +
      '</section>';
  }

  function viewNotFound() {
    setMeta(t('notFound'));
    main.innerHTML = '<section class="card center"><h1>' + esc(t('notFound')) + '</h1><p><a class="btn" href="/">' + esc(t('goHome')) + '</a></p></section>';
  }
  function viewError() {
    main.innerHTML = '<section class="card center"><h1>⚠️</h1><p>' + esc(t('loadError')) + '</p><p><a class="btn" href="/">' + esc(t('goHome')) + '</a></p></section>';
  }

  function viewHome(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      setMeta(t('siteName'), t('welcomeText'));
      var cat = state.catalog;
      main.innerHTML =
        '<section class="hero">' +
          '<h1>' + esc(t('welcomeTitle')) + '</h1>' +
          '<p>' + esc(t('welcomeText')) + '</p>' +
          '<a class="btn big" href="/class-5/science">' + esc(t('startLearning')) + '</a>' +
        '</section>' +
        guide(t('guideHome')) +
        '<div id="install-slot"></div>' +
        searchForm('') +
        '<h2>' + esc(t('chooseClass')) + '</h2>' +
        '<div class="grid classes">' + cat.classes.map(function (c) {
          return c.active
            ? '<a class="card class-card" href="/class-' + c.id + '"><span class="big-num">' + esc(c.id) + '</span><span>' + esc(L(c.name)) + '</span></a>'
            : '<div class="card class-card is-off"><span class="big-num">' + esc(c.id) + '</span><span>' + esc(L(c.name)) + '</span><small>' + esc(t('comingSoon')) + '</small></div>';
        }).join('') + '</div>' +
        '<section class="card daily" id="daily"></section>' +
        '<h2>' + esc(t('more')) + '</h2>' +
        '<div class="grid">' +
          quickLink('/competition', '🏆', 'competition', 'compShort') +
          quickLink('/glossary', '🔤', 'glossary', 'glossShort') +
          quickLink('/progress', '⭐', 'progress', 'progShort') +
          quickLink('/teachers', '👩‍🏫', 'teachers', 'teachShort') +
        '</div>';
      renderDaily(document.getElementById('daily'), chs);
      showInstall();
    });
  }
  function quickLink(href, icon, titleKey, textKey) {
    return '<a class="card quick" href="' + href + '"><span class="quick-icon" aria-hidden="true">' + icon + '</span><span><strong>' + esc(t(titleKey)) + '</strong><span class="muted">' + esc(t(textKey)) + '</span></span></a>';
  }
  function searchForm(q) {
    return '<form class="search-form" action="/search" role="search">' +
      '<input type="search" name="q" value="' + esc(q) + '" placeholder="' + esc(t('searchPlaceholder')) + '" aria-label="' + esc(t('search')) + '">' +
      '<button class="btn" type="submit">' + esc(t('searchBtn')) + '</button></form>';
  }

  /* Daily challenge: same question for everyone on the same day. */
  function dailyPick(chs) {
    var pool = [];
    chs.forEach(function (ch) { ch.quiz.forEach(function (q) { if (q.type !== 'match') pool.push({ q: q, ch: ch }); }); });
    var day = todayStr(), h = 7;
    for (var i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
    return pool[h % pool.length];
  }
  function answerText(q) { return q.type === 'mcq' ? L(q.options[q.answer]) : t(q.answer ? 'true' : 'false'); }
  function optionsHTML(q, name, order) {
    if (q.type === 'tf') {
      return [true, false].map(function (v) {
        return '<label class="opt"><input type="radio" name="' + name + '" value="' + v + '"><span>' + esc(t(String(v))) + '</span></label>';
      }).join('');
    }
    return (order || q.options.map(function (o, i) { return i; })).map(function (i) {
      return '<label class="opt"><input type="radio" name="' + name + '" value="' + i + '"><span>' + esc(L(q.options[i])) + '</span></label>';
    }).join('');
  }
  function renderDaily(el, chs) {
    var p = getProgress(), today = todayStr(), pick = dailyPick(chs), q = pick.q;
    var done = p.daily.last === today;
    var streak = (p.daily.last === today || p.daily.last === yesterdayStr()) ? p.daily.streak : 0;
    var html = '<h2>☀️ ' + esc(t('dailyTitle')) + '</h2>' +
      '<p class="muted">' + esc(chLabel(pick.ch)) + '</p>' +
      '<p class="q-text">' + esc(L(q.q)) + '</p>';
    if (done) {
      html += '<p class="result-line ' + (p.daily.ok ? 'ok' : 'bad') + '">' +
        (p.daily.ok ? '✔ ' + esc(t('correct')) : '✘ ' + esc(t('correctAnswerIs')) + ' <b>' + esc(answerText(q)) + '</b>') + '</p>' +
        '<p>' + esc(t('dailyDone')) + '</p>';
    } else {
      html += '<form class="daily-form">' + optionsHTML(q, 'daily') +
        '<button class="btn" type="submit">' + esc(t('check')) + '</button> <span class="form-msg" aria-live="polite"></span></form>';
    }
    html += '<p class="streak">🔥 ' + esc(t('streak', { n: streak })) + '</p><div class="daily-badges"></div>';
    el.innerHTML = html;
    var form = el.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sel = form.querySelector('input:checked');
      if (!sel) { form.querySelector('.form-msg').textContent = t('pickAnswer'); return; }
      var p2 = getProgress();
      var ok = sel.value === String(q.answer);
      p2.daily = { last: today, streak: p2.daily.last === yesterdayStr() ? p2.daily.streak + 1 : 1, ok: ok };
      if (ok) p2.points += 5;
      var fresh = evaluateBadges(p2);
      saveProgress(p2);
      renderDaily(el, chs);
      el.querySelector('.daily-badges').innerHTML = (ok ? '<p class="points">⭐ ' + esc(t('pointsEarned', { n: 5 })) + '</p>' : '') + newBadgesHTML(fresh);
    });
  }

  function viewClass(id, cls) {
    var c = findClass(cls);
    if (!c || !c.active) return viewNotFound();
    setMeta(L(c.name), t('welcomeText'));
    main.innerHTML = crumbs([['/', t('home')], ['', L(c.name)]]) +
      '<h1>' + esc(L(c.name)) + ' — ' + esc(t('subjects')) + '</h1>' +
      '<div class="grid">' + c.subjects.map(function (s) {
        return s.active
          ? '<a class="card subject-card" href="/class-' + c.id + '/' + s.id + '"><span class="quick-icon" aria-hidden="true">' + s.icon + '</span><strong>' + esc(L(s.name)) + '</strong></a>'
          : '<div class="card subject-card is-off"><span class="quick-icon" aria-hidden="true">' + s.icon + '</span><strong>' + esc(L(s.name)) + '</strong><small>' + esc(t('comingSoon')) + '</small></div>';
      }).join('') + '</div>';
  }

  function viewSubject(id, cls, subj) {
    var c = findClass(cls), s = findSubject(cls, subj);
    if (!c || !c.active || !s || !s.active) return viewNotFound();
    return loadSubject(cls, subj).then(function (chs) {
      if (stale(id)) return;
      var p = getProgress();
      setMeta(L(c.name) + ' ' + L(s.name), chs.map(function (ch) { return L(ch.title); }).join(' · '));
      main.innerHTML = crumbs([['/', t('home')], ['/class-' + cls, L(c.name)], ['', L(s.name)]]) +
        '<h1>' + esc(L(c.name)) + ' ' + esc(L(s.name)) + ' — ' + esc(t('chapters')) + '</h1>' +
        '<div class="ch-list">' + chs.map(function (ch) {
          var rec = p.quiz[ch._key];
          return '<a class="card ch-card" href="' + chUrl(ch) + '">' +
            '<span class="ch-icon" aria-hidden="true">' + ch.icon + '</span>' +
            '<span class="ch-body"><small class="muted">' + esc(t('chapterN', { n: ch.number })) + '</small>' +
            '<strong>' + esc(L(ch.title)) + '</strong>' +
            '<span class="muted">' + esc(L(ch.summary)) + '</span>' +
            '<span class="ch-score">' + (rec ? stars(rec.best) + ' ' + esc(t('bestScore', { n: rec.best })) : esc(t('notStarted'))) + '</span></span></a>';
        }).join('') +
        (s.upcoming || []).map(function (u, i) {
          return '<div class="card ch-card is-off"><span class="ch-icon" aria-hidden="true">🔒</span><span class="ch-body"><small>' +
            esc(t('chapterN', { n: chs.length + i + 1 })) + '</small><strong>' + esc(L(u)) + '</strong><span>' + esc(t('comingSoon')) + '</span></span></div>';
        }).join('') + '</div>';
    });
  }

  function chapterTabs(ch) {
    var tabs = ['lesson'];
    if (ch.diagram) tabs.push('diagram');
    tabs.push('quiz', 'worksheet');
    if ((ch.games && ch.games.length) || spellWords(ch).length >= 3) tabs.push('game');
    if (ch.experiment) tabs.push('experiment');
    if (ch.glossary && ch.glossary.length) tabs.push('words');
    return tabs;
  }

  function viewChapter(id, cls, subj, chId, tab) {
    var c = findClass(cls), s = findSubject(cls, subj);
    if (!c || !c.active || !s || !s.active) return viewNotFound();
    return loadChapter(cls, subj, chId).then(function (ch) {
      if (stale(id)) return;
      if (!ch) return viewNotFound();
      var tabs = chapterTabs(ch);
      tab = tab || 'lesson';
      if (tabs.indexOf(tab) < 0) return viewNotFound();
      setMeta(L(ch.title) + ' — ' + t('tab_' + tab), L(ch.summary));
      main.innerHTML = crumbs([['/', t('home')], ['/class-' + cls, L(c.name)], ['/class-' + cls + '/' + subj, L(s.name)], ['', L(ch.title)]]) +
        '<header class="ch-head"><span class="ch-icon" aria-hidden="true">' + ch.icon + '</span><div>' +
          '<p class="muted">' + esc(t('chapterN', { n: ch.number })) + ' · ' + esc(L(c.name)) + ' ' + esc(L(s.name)) + '</p>' +
          '<h1>' + esc(L(ch.title)) + ' ' + sayBtn(L(ch.title), state.lang) + '</h1></div></header>' +
        '<nav class="tabs no-print" aria-label="' + esc(L(ch.title)) + '">' + tabs.map(function (tb) {
          return '<a class="tab" href="' + chUrl(ch, tb) + '"' + (tb === tab ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + TAB_ICONS[tb] + '</span> ' + esc(t('tab_' + tb)) + '</a>';
        }).join('') + '</nav>' +
        '<div id="tab"></div>';
      var el = document.getElementById('tab');
      ({ lesson: tabLesson, diagram: tabDiagram, quiz: tabQuiz, worksheet: tabWorksheet, game: tabGame, experiment: tabExperiment, words: tabWords })[tab](el, ch, c, s);
    });
  }

  function tabLesson(el, ch) {
    var vid = (window.LESSON_VIDEOS || {})[ch.id];
    el.innerHTML = guide(t('guideLesson')) +
      (vid ? '<section class="card lesson-video"><h2>🎬 ' + esc(t('videoTitle')) + '</h2>' +
        '<video controls preload="none" playsinline width="960" height="540" poster="' + vid.poster + '" src="' + vid.src + '"></video>' +
        '<p class="small muted">' + esc(t('videoNote')) + '</p></section>' : '') +
      ch.lesson.map(function (sec) {
        return '<section class="card lesson-sec" id="' + sec.id + '"><h2>' + esc(L(sec.title)) + '</h2>' + paragraphs(L(sec.body)) + '</section>';
      }).join('') +
      '<div class="next-row">' +
        (ch.diagram ? '<a class="btn ghost" href="' + chUrl(ch, 'diagram') + '">🖼️ ' + esc(t('seeDiagram')) + '</a>' : '') +
        '<a class="btn" href="' + chUrl(ch, 'quiz') + '">✅ ' + esc(t('nextQuiz')) + '</a>' +
      '</div>';
  }

  function treeHTML(node, label) {
    return '<div class="tree-branch"><button type="button" class="tree-node" data-part="' + node.id + '">' + label(node.id) + '</button>' +
      (node.children ? '<div class="tree-down" aria-hidden="true">↓</div><div class="tree-kids">' + node.children.map(function (k) { return treeHTML(k, label); }).join('') + '</div>' : '') +
      '</div>';
  }
  function tabDiagram(el, ch) {
    var d = ch.diagram, parts = {};
    d.parts.forEach(function (p) { parts[p.id] = p; });
    function label(pid) { return esc(L(parts[pid].label)); }
    var isTree = d.type === 'tree';
    var pic = isTree ? '<div class="tree">' + treeHTML(d.tree, label) + '</div>' : window.DIAGRAMS[d.type](label);
    var photo = (window.PICTURES || {})[ch.id];
    var pw = photo && Math.round(Math.min(photo.w, 560 * photo.w / photo.h)); // tall pictures are kept to 560px high; tap opens the full size
    el.innerHTML = (photo ? '<figure class="card photo"><a href="' + photo.src + '" target="_blank"><img src="' + photo.src + '" width="' + pw + '" height="' + Math.round(pw * photo.h / photo.w) + '" alt="' + esc(L(ch.title)) + '" decoding="async"></a>' +
        '<figcaption class="small muted">' + esc(t('picCredit')) + ' ' + esc(photo.author) + ' · ' +
          (photo.licenseUrl ? '<a href="' + photo.licenseUrl + '" target="_blank" rel="noopener">' + esc(photo.license) + '</a>' : esc(photo.license)) +
          ' · <a href="' + photo.link + '" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>' +
        '<h2>' + esc(t('tapDiagram')) + '</h2>' : '') +
      '<p>👆 ' + esc(t('tapPart')) + '</p>' +
      '<div class="diagram-wrap"><div class="diagram">' + pic + '</div>' +
      '<div class="card info" aria-live="polite"><p class="muted">' + esc(t('tapPart')) + '</p></div></div>' +
      (isTree ? '' : '<h3>' + esc(t('partsList')) + '</h3><div class="chips">' + d.parts.map(function (p) {
        return '<button type="button" class="chip" data-part="' + p.id + '">' + label(p.id) + '</button>';
      }).join('') + '</div>');
    var info = el.querySelector('.info');
    function show(pid) {
      var p = parts[pid];
      el.querySelectorAll('[data-part]').forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-part') === pid); });
      info.innerHTML = '<h3>' + label(pid) + '</h3>' +
        '<p class="names">' + LANGS.map(function (l) { return '<span lang="' + l + '">' + esc(p.label[l]) + '</span>'; }).join(' · ') + '</p>' +
        '<p>' + esc(L(p.info)) + '</p>';
    }
    el.addEventListener('click', function (e) {
      var n = e.target.closest('[data-part]');
      if (n) show(n.getAttribute('data-part'));
    });
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g[data-part]')) {
        e.preventDefault();
        show(e.target.getAttribute('data-part'));
      }
    });
  }

  /* ---------- quiz engine (chapter quizzes and competition) ---------- */

  function buildAttempt(questions) {
    return questions.map(function (q) {
      var a = { q: q };
      if (q.type === 'mcq') a.order = shuffle(q.options.map(function (o, i) { return i; }));
      if (q.type === 'match') a.right = shuffle(q.pairs.map(function (p, i) { return i; }));
      return a;
    });
  }
  function questionsHTML(attempt, prefix) {
    return attempt.map(function (a, n) {
      var q = a.q, name = prefix + '-' + n, body;
      if (q.type === 'match') {
        body = '<div class="match">' + q.pairs.map(function (p, i) {
          return '<div class="match-row"><span class="match-left">' + esc(L(p.left)) + '</span>' +
            '<select name="' + name + '-' + i + '" aria-label="' + esc(L(p.left)) + '"><option value="">' + esc(t('choose')) + '</option>' +
            a.right.map(function (j) { return '<option value="' + j + '">' + esc(L(q.pairs[j].right)) + '</option>'; }).join('') +
            '</select></div>';
        }).join('') + '</div>';
      } else {
        body = optionsHTML(q, name, a.order);
      }
      return '<fieldset class="q" data-n="' + n + '"><legend><span class="qn">' + (n + 1) + '.</span> ' + esc(L(q.q)) + '</legend>' +
        body + '<p class="feedback" hidden></p></fieldset>';
    }).join('');
  }
  function markAttempt(form, attempt, prefix) {
    var score = 0, total = 0, weak = [];
    attempt.forEach(function (a, n) {
      var q = a.q, fs = form.querySelector('.q[data-n="' + n + '"]'), fb = fs.querySelector('.feedback'), ok, correctText;
      if (q.type === 'match') {
        var good = 0;
        q.pairs.forEach(function (p, i) {
          total++;
          var sel = form.querySelector('select[name="' + prefix + '-' + n + '-' + i + '"]');
          var right = sel.value === String(i);
          if (right) { good++; score++; }
          sel.disabled = true;
          sel.closest('.match-row').classList.add(right ? 'is-right' : 'is-wrong');
        });
        ok = good === q.pairs.length;
        correctText = q.pairs.map(function (p) { return L(p.left) + ' → ' + L(p.right); }).join(sep());
      } else {
        total++;
        var chosen = form.querySelector('input[name="' + prefix + '-' + n + '"]:checked');
        var ans = String(q.answer);
        ok = !!chosen && chosen.value === ans;
        if (ok) score++;
        correctText = answerText(q);
        fs.querySelectorAll('input').forEach(function (inp) {
          inp.disabled = true;
          var lab = inp.closest('.opt');
          if (inp.value === ans) lab.classList.add('is-right');
          else if (inp.checked) lab.classList.add('is-wrong');
        });
      }
      fs.classList.add(ok ? 'q-right' : 'q-wrong');
      fb.hidden = false;
      fb.innerHTML = ok ? '✔ ' + esc(t('correct')) : '✘ ' + esc(t('wrong')) + ' — ' + esc(t('correctAnswerIs')) + ' <b>' + esc(correctText) + '</b>';
      if (!ok && q.topic && weak.indexOf(q.topic) < 0) weak.push(q.topic);
    });
    return { score: score, total: total, weak: weak };
  }
  // Renders a quiz into el. The result box sits above the questions so children see it first.
  function runQuiz(el, questions, opts) {
    var attempt = buildAttempt(questions), finished = false;
    el.innerHTML = (opts.intro || '') +
      '<div class="quiz-result" aria-live="polite"></div>' +
      '<form class="quiz" novalidate>' + questionsHTML(attempt, opts.prefix) +
      '<div class="quiz-actions"><button class="btn big" type="submit">' + esc(t(opts.submitKey || 'checkAnswers')) + '</button></div></form>';
    var form = el.querySelector('form'), out = el.querySelector('.quiz-result');
    function finish() {
      if (finished) return;
      finished = true;
      var r = markAttempt(form, attempt, opts.prefix);
      form.querySelector('.quiz-actions').remove();
      opts.onDone(r, out);
      out.scrollIntoView();
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); finish(); });
    return { finish: finish };
  }

  function recordQuiz(ch, r, pct) {
    var p = getProgress();
    var prev = p.quiz[ch._key] || { best: 0, bestScore: 0, attempts: 0 };
    var gained = Math.max(0, r.score - (prev.bestScore || 0));
    p.points += gained;
    p.quiz[ch._key] = {
      best: Math.max(prev.best, pct), bestScore: Math.max(prev.bestScore || 0, r.score), total: r.total,
      attempts: prev.attempts + 1, last: pct, weak: r.weak
    };
    var fresh = evaluateBadges(p);
    saveProgress(p);
    return { gained: gained, fresh: fresh };
  }

  function tabQuiz(el, ch) {
    function start() {
      runQuiz(el, ch.quiz, {
        prefix: 'q',
        intro: guide(t('guideQuiz')) + '<p>' + esc(t('quizIntro')) + '</p>',
        onDone: function (r, out) {
          var pct = Math.round(100 * r.score / r.total);
          var rec = recordQuiz(ch, r, pct);
          track('quiz', { chapter_key: ch._key, score: r.score, total: r.total });
          var msg = pct >= 80 ? t('resultGreat') : pct >= 50 ? t('resultGood') : t('resultTry');
          out.innerHTML = '<div class="card result">' +
            '<h2>' + esc(t('yourScore')) + ': ' + r.score + ' / ' + r.total + ' (' + pct + '%)</h2>' +
            '<p>' + stars(pct) + '</p>' + guide(msg) +
            (rec.gained ? '<p class="points">⭐ ' + esc(t('pointsEarned', { n: rec.gained })) + '</p>' : '') +
            newBadgesHTML(rec.fresh) +
            (r.weak.length ? '<h3>' + esc(t('weakTopics')) + '</h3><ul>' + r.weak.map(function (sid) {
              var sec = ch.lesson.filter(function (x) { return x.id === sid; })[0];
              return sec ? '<li><a href="' + chUrl(ch) + '#' + sid + '">' + esc(L(sec.title)) + '</a></li>' : '';
            }).join('') + '</ul>' : '') +
            '<div class="next-row"><button type="button" class="btn" data-act="retry">' + esc(t('tryAgain')) + '</button>' +
            '<a class="btn ghost" href="' + chUrl(ch) + '">' + esc(t('backToLesson')) + '</a></div></div>';
          out.querySelector('[data-act="retry"]').addEventListener('click', function () { start(); el.scrollIntoView(); });
        }
      });
    }
    start();
  }

  /* ---------- worksheet (printable) ---------- */

  function tabWorksheet(el, ch, c, s) {
    var w = ch.worksheet, n = w.match.length;
    var bank = w.blanks.map(function (b) { return L(b.answer); }).sort();
    var order = w.match.map(function (m, i) { return (i + 2) % n; }); // column B is shuffled the same way every time
    el.innerHTML =
      '<div class="no-print ws-tools"><button type="button" class="btn" data-act="print">🖨️ ' + esc(t('print')) + '</button>' +
        '<p class="muted">' + esc(t('printTip')) + '</p></div>' +
      '<article class="worksheet">' +
        '<header class="ws-head"><p class="ws-site">' + esc(t('siteName')) + '</p>' +
          '<h2>' + esc(t('worksheet')) + ': ' + esc(L(ch.title)) + '</h2>' +
          '<p>' + esc(L(c.name)) + ' · ' + esc(L(s.name)) + ' · ' + esc(t('chapterN', { n: ch.number })) + '</p>' +
          '<p class="ws-fields"><span>' + esc(t('wsName')) + ': ____________________</span><span>' + esc(t('wsDate')) + ': ____________</span></p></header>' +
        '<section><h3>' + esc(t('wsBlanks')) + '</h3>' +
          '<p class="ws-bank"><b>' + esc(t('wsBank')) + '</b> ' + bank.map(esc).join(' · ') + '</p>' +
          '<ol>' + w.blanks.map(function (b) { return '<li>' + esc(L(b.text)).replace('____', '<span class="blank"></span>') + '</li>'; }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsTF')) + '</h3><ol>' + w.tf.map(function (x) {
          return '<li><span class="box" aria-hidden="true"></span> ' + esc(L(x.text)) + '</li>';
        }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsMatch')) + '</h3><table class="ws-match"><thead><tr><th>' + esc(t('colA')) + '</th><th>' + esc(t('colB')) + '</th></tr></thead><tbody>' +
          w.match.map(function (m, i) {
            return '<tr><td>' + (i + 1) + '. ' + esc(L(m.a)) + '</td><td>(&nbsp;&nbsp;&nbsp;&nbsp;) ' + esc(L(w.match[order[i]].b)) + '</td></tr>';
          }).join('') + '</tbody></table></section>' +
        '<section><h3>' + esc(t('wsShort')) + '</h3><ol>' + w.short.map(function (x) {
          return '<li>' + esc(L(x.q)) + '<span class="lines"><span></span><span></span></span></li>';
        }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsDraw')) + '</h3><p>' + esc(L(w.draw)) + '</p><div class="draw-box"></div></section>' +
      '</article>' +
      '<details class="card answer-key no-print"><summary>' + esc(t('answerKey')) + '</summary>' +
        '<h4>' + esc(t('wsBlanks')) + '</h4><ol>' + w.blanks.map(function (b) { return '<li>' + esc(L(b.answer)) + '</li>'; }).join('') + '</ol>' +
        '<h4>' + esc(t('wsTF')) + '</h4><ol>' + w.tf.map(function (x) { return '<li>' + (x.answer ? '✔' : '✘') + '</li>'; }).join('') + '</ol>' +
        '<h4>' + esc(t('wsMatch')) + '</h4><p>' + w.match.map(function (m, i) { return (i + 1) + ' → (' + (order.indexOf(i) + 1) + ')'; }).join(sep()) + '</p>' +
        '<h4>' + esc(t('wsShort')) + '</h4><ol>' + w.short.map(function (x) { return '<li>' + esc(L(x.a)) + '</li>'; }).join('') + '</ol>' +
      '</details>';
    el.querySelector('[data-act="print"]').addEventListener('click', function () {
      track('worksheet', { chapter_key: ch._key });
      window.print();
    });
  }

  /* ---------- games ---------- */

  // Every chapter also gets a spelling game made from its key words, in the reader's language.
  function spellWords(ch) {
    return (ch.glossary || []).filter(function (w) {
      var n = Array.from(L(w) || '').length;
      return n >= 3 && n <= 9 && !/[\s‌-‏-]/.test(L(w));
    });
  }
  function tabGame(el, ch) {
    var games = (ch.games || []).map(function (g, i) { return { g: g, key: ch._key + '#' + i }; });
    if (spellWords(ch).length >= 3) games.push({ g: { type: 'spell', words: spellWords(ch) }, key: ch._key + '#spell' });
    el.innerHTML = games.map(function (x, i) { return '<section class="card game" data-i="' + i + '"></section>'; }).join('');
    games.forEach(function (x, i) { startGame(el.querySelector('.game[data-i="' + i + '"]'), x.g, x.key); });
  }
  function startGame(box, g, key) {
    var engines = { sort: gameSort, memory: gameMemory, match: gameMatch, spell: gameSpell };
    engines[g.type](box, g, function onWin() {
      var p = getProgress(), gained = 0;
      if (!p.games[key]) { p.games[key] = true; p.points += 5; gained = 5; }
      track('game', { chapter_key: key.split('#')[0] });
      var fresh = evaluateBadges(p);
      saveProgress(p);
      var end = box.querySelector('.game-end');
      end.hidden = false;
      end.innerHTML = guide(t('gameDone')) +
        (gained ? '<p class="points">⭐ ' + esc(t('pointsEarned', { n: gained })) + '</p>' : '') + newBadgesHTML(fresh) +
        '<button type="button" class="btn" data-act="again">' + esc(t('playAgain')) + '</button>';
      end.querySelector('[data-act="again"]').addEventListener('click', function () { startGame(box, g, key); });
    });
  }
  function say(box, text, kind) {
    var m = box.querySelector('.game-msg');
    m.textContent = text;
    m.className = 'game-msg' + (kind ? ' ' + kind : '');
  }

  // Sort items into boxes: tap an item, then tap a box (drag and drop also works with a mouse).
  function gameSort(box, g, onWin) {
    var items = shuffle(g.items.map(function (it, i) { return i; }));
    var left = items.length, sel = null;
    box.innerHTML = '<h2>' + esc(L(g.title)) + '</h2><p>' + esc(t('sortHelp')) + '</p>' +
      '<div class="sort-pool">' + items.map(function (i) {
        var it = g.items[i];
        return '<button type="button" class="chip sort-item" draggable="true" data-i="' + i + '">' + (it.emoji ? '<span aria-hidden="true">' + it.emoji + '</span> ' : '') + esc(L(it.text)) + '</button>';
      }).join('') + '</div>' +
      '<div class="bins">' + g.bins.map(function (b) {
        return '<div class="bin" data-bin="' + b.id + '" role="button" tabindex="0"><h3>' + esc(L(b.name)) + '</h3><div class="bin-items"></div></div>';
      }).join('') + '</div>' +
      '<p class="game-msg" aria-live="polite"></p><div class="game-end" hidden></div>';
    function select(btn) {
      box.querySelectorAll('.sort-item.sel').forEach(function (x) { x.classList.remove('sel'); });
      sel = btn; btn.classList.add('sel');
      say(box, t('sortPick'));
    }
    function place(bin) {
      if (!sel) { say(box, t('sortHelp')); return; }
      if (g.items[+sel.getAttribute('data-i')].bin === bin.getAttribute('data-bin')) {
        sel.classList.remove('sel'); sel.classList.add('placed'); sel.disabled = true; sel.draggable = false;
        bin.querySelector('.bin-items').appendChild(sel);
        sel = null;
        say(box, t('nice'), 'ok');
        if (--left === 0) onWin();
      } else {
        say(box, t('notQuite'), 'bad');
      }
    }
    box.addEventListener('click', function (e) {
      var it = e.target.closest('.sort-item');
      if (it && !it.disabled) { select(it); return; }
      var bin = e.target.closest('.bin');
      if (bin) place(bin);
    });
    box.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('bin')) { e.preventDefault(); place(e.target); }
    });
    box.addEventListener('dragstart', function (e) {
      var it = e.target.closest('.sort-item');
      if (!it) return;
      e.dataTransfer.setData('text/plain', it.getAttribute('data-i'));
      select(it);
    });
    box.addEventListener('dragover', function (e) { if (e.target.closest('.bin')) e.preventDefault(); });
    box.addEventListener('drop', function (e) {
      var bin = e.target.closest('.bin');
      if (bin) { e.preventDefault(); place(bin); }
    });
  }

  // Memory: open two cards; a word and its job make a pair.
  function gameMemory(box, g, onWin) {
    var cards = shuffle([].concat.apply([], g.pairs.map(function (p, i) {
      return [{ pair: i, side: 'a', text: L(p.a) }, { pair: i, side: 'b', text: L(p.b) }];
    })));
    var open = [], moves = 0, matched = 0, busy = false;
    box.innerHTML = '<h2>' + esc(L(g.title)) + '</h2><p>' + esc(t('memoryHelp')) + '</p>' +
      '<p class="moves">' + esc(t('moves', { n: 0 })) + '</p>' +
      '<div class="mem-grid">' + cards.map(function (c, k) { return '<button type="button" class="mem-card" data-k="' + k + '">?</button>'; }).join('') + '</div>' +
      '<p class="game-msg" aria-live="polite"></p><div class="game-end" hidden></div>';
    function hide(b) { b.classList.remove('open', 'side-a', 'side-b'); b.textContent = '?'; }
    box.querySelector('.mem-grid').addEventListener('click', function (e) {
      var b = e.target.closest('.mem-card');
      if (!b || busy || b.classList.contains('open')) return;
      var c = cards[+b.getAttribute('data-k')];
      b.classList.add('open', 'side-' + c.side);
      b.textContent = c.text;
      open.push(b);
      if (open.length < 2) return;
      moves++;
      box.querySelector('.moves').textContent = t('moves', { n: moves });
      var x = open[0], y = open[1];
      if (cards[+x.getAttribute('data-k')].pair === cards[+y.getAttribute('data-k')].pair) {
        x.classList.add('done'); y.classList.add('done'); x.disabled = true; y.disabled = true;
        open = [];
        say(box, t('nice'), 'ok');
        if (++matched === g.pairs.length) onWin();
      } else {
        busy = true;
        say(box, t('notQuite'), 'bad');
        setTimeout(function () { hide(x); hide(y); open = []; busy = false; }, 1100);
      }
    });
  }

  // Word match: pick one item on each side.
  function gameMatch(box, g, onWin) {
    var leftOrder = shuffle(g.pairs.map(function (p, i) { return i; }));
    var rightOrder = shuffle(g.pairs.map(function (p, i) { return i; }));
    var pick = null, done = 0;
    function col(order, side) {
      return '<div class="mcol">' + order.map(function (i) {
        return '<button type="button" class="chip mg" data-side="' + side + '" data-i="' + i + '">' + esc(L(g.pairs[i][side])) + '</button>';
      }).join('') + '</div>';
    }
    box.innerHTML = '<h2>' + esc(L(g.title)) + '</h2><p>' + esc(t('matchHelp')) + '</p>' +
      '<div class="match-game">' + col(leftOrder, 'a') + col(rightOrder, 'b') + '</div>' +
      '<p class="game-msg" aria-live="polite"></p><div class="game-end" hidden></div>';
    box.querySelector('.match-game').addEventListener('click', function (e) {
      var b = e.target.closest('.mg');
      if (!b || b.disabled) return;
      if (!pick || pick.getAttribute('data-side') === b.getAttribute('data-side')) {
        if (pick) pick.classList.remove('sel');
        pick = b; b.classList.add('sel');
        return;
      }
      if (pick.getAttribute('data-i') === b.getAttribute('data-i')) {
        [pick, b].forEach(function (x) { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
        say(box, t('nice'), 'ok');
        pick = null;
        if (++done === g.pairs.length) onWin();
      } else {
        pick.classList.remove('sel');
        pick = null;
        say(box, t('notQuite'), 'bad');
      }
    });
  }

  // Spelling: read the word in the other two languages, then tap its letters in order.
  function gameSpell(box, g, onWin) {
    var words = shuffle(g.words).slice(0, 5), n = 0, letters, pos;
    box.innerHTML = '<h2>' + esc(t('spellTitle')) + '</h2><p>' + esc(t('spellHelp')) + '</p>' +
      '<p class="moves"></p><div class="spell-clue"></div>' +
      '<p class="spell-answer" aria-live="polite"></p><div class="spell-tiles"></div>' +
      '<p class="game-msg" aria-live="polite"></p><div class="game-end" hidden></div>';
    function next() {
      var w = words[n];
      letters = Array.from(L(w)); pos = 0;
      box.querySelector('.moves').textContent = t('spellCount', { n: n + 1, m: words.length });
      box.querySelector('.spell-clue').innerHTML = '<b>' + esc(t('spellClue')) + '</b> ' + LANGS.filter(function (l) { return l !== state.lang; }).map(function (l) {
        return '<span lang="' + l + '">' + esc(w[l]) + '</span> ' + sayBtn(w[l], l);
      }).join(' · ') + ' ' + sayBtn(L(w), state.lang);
      box.querySelector('.spell-answer').innerHTML = letters.map(function () { return '_'; }).join(' ');
      box.querySelector('.spell-tiles').innerHTML = shuffle(letters.map(function (c, i) { return i; })).map(function (i) {
        return '<button type="button" class="chip spell-tile">' + esc(letters[i]) + '</button>';
      }).join('');
    }
    box.querySelector('.spell-tiles').addEventListener('click', function (e) {
      var b = e.target.closest('.spell-tile');
      if (!b || b.disabled) return;
      if (b.textContent !== letters[pos]) { say(box, t('notQuite'), 'bad'); return; }
      b.disabled = true; b.classList.add('done');
      pos++;
      var ans = box.querySelector('.spell-answer');
      ans.textContent = letters.slice(0, pos).join('') + (pos < letters.length ? ' ' + letters.slice(pos).map(function () { return '_'; }).join(' ') : '');
      if (pos < letters.length) { say(box, ''); return; }
      say(box, t('nice'), 'ok');
      if (++n === words.length) { onWin(); return; }
      setTimeout(next, 900);
    });
    next();
  }

  function tabExperiment(el, ch) {
    var x = ch.experiment;
    el.innerHTML = '<section class="card">' +
      '<h2>🔬 ' + esc(L(x.title)) + '</h2>' +
      (EXP_PICTURES.indexOf(ch.id) >= 0 ? '<img class="exp-pic" src="/img/exp/' + ch.id + '.svg" width="600" height="320" alt="' + esc(L(x.title)) + '">' : '') +
      '<h3>' + esc(t('materials')) + '</h3><ul>' + x.materials.map(function (m) { return '<li>' + esc(L(m)) + '</li>'; }).join('') + '</ul>' +
      '<h3>' + esc(t('steps')) + '</h3><ol class="steps">' + x.steps.map(function (m) { return '<li>' + esc(L(m)) + '</li>'; }).join('') + '</ol>' +
      '<div class="note ok"><h3>💡 ' + esc(t('whatLearn')) + '</h3><p>' + esc(L(x.learn)) + '</p></div>' +
      '<div class="note warn"><h3>⚠️ ' + esc(t('safety')) + '</h3><p>' + esc(L(x.safety)) + '</p></div>' +
      '</section>';
  }

  function wordsTable(rows) {
    return '<div class="table-wrap"><table class="table words"><thead><tr>' +
      LANGS.map(function (l) { return '<th lang="' + l + '">' + LANG_NAMES[l] + '</th>'; }).join('') +
      (rows.length && rows[0].ch ? '<th>' + esc(t('colChapter')) + '</th>' : '') +
      '</tr></thead><tbody>' + rows.map(function (r) {
        return '<tr data-hay="' + esc(norm(allLangs(r.w))) + '">' + LANGS.map(function (l) { return '<td lang="' + l + '">' + esc(r.w[l]) + ' ' + sayBtn(r.w[l], l) + '</td>'; }).join('') +
          (r.ch ? '<td><a href="' + chUrl(r.ch) + '">' + esc(t('chapterN', { n: r.ch.number })) + '</a></td>' : '') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  function tabWords(el, ch) {
    el.innerHTML = '<p>' + esc(t('glossaryIntro')) + '</p>' + wordsTable(ch.glossary.map(function (w) { return { w: w }; }));
  }

  function viewGlossary(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      setMeta(t('glossaryTitle'), t('glossaryIntro'));
      var rows = [];
      chs.forEach(function (ch) { ch.glossary.forEach(function (w) { rows.push({ w: w, ch: ch }); }); });
      main.innerHTML = crumbs([['/', t('home')], ['', t('glossaryTitle')]]) +
        '<h1>🔤 ' + esc(t('glossaryTitle')) + '</h1><p>' + esc(t('glossaryIntro')) + '</p>' +
        '<p><input type="search" class="filter" placeholder="' + esc(t('filterWords')) + '" aria-label="' + esc(t('filterWords')) + '"></p>' +
        wordsTable(rows);
      main.querySelector('.filter').addEventListener('input', function (e) {
        var q = norm(e.target.value);
        main.querySelectorAll('tbody tr').forEach(function (tr) { tr.hidden = q && tr.getAttribute('data-hay').indexOf(q) < 0; });
      });
    });
  }

  function viewSearch(id) {
    var q = new URLSearchParams(location.search).get('q') || '';
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      setMeta(t('search') + (q ? ': ' + q : ''), t('searchPlaceholder'));
      var entries = [];
      chs.forEach(function (ch) {
        entries.push({ kind: 'kindChapter', title: L(ch.title), sub: t('chapterN', { n: ch.number }), url: chUrl(ch), hay: allLangs(ch.title) + ' ' + allLangs(ch.summary) });
        ch.lesson.forEach(function (sec) {
          entries.push({ kind: 'kindSection', title: L(sec.title), sub: chLabel(ch), url: chUrl(ch) + '#' + sec.id, hay: allLangs(sec.title) + ' ' + allLangs(sec.body) });
        });
        ch.glossary.forEach(function (w) {
          entries.push({ kind: 'kindWord', title: LANGS.map(function (l) { return w[l]; }).join(' · '), sub: chLabel(ch), url: chUrl(ch, 'words'), hay: allLangs(w) });
        });
      });
      var terms = norm(q).split(' ').filter(Boolean), found = [];
      if (terms.length) {
        found = entries.filter(function (e) {
          var hay = e._n || (e._n = norm(e.hay));
          return terms.every(function (tm) { return hay.indexOf(tm) >= 0; });
        });
      }
      main.innerHTML = crumbs([['/', t('home')], ['', t('search')]]) +
        '<h1>🔍 ' + esc(t('search')) + '</h1>' + searchForm(q) +
        (terms.length ? '<p class="muted">' + esc(t('resultsCount', { n: found.length })) + '</p>' +
          (found.length ? '<ul class="results">' + found.map(function (e) {
            return '<li class="card"><a href="' + e.url + '"><strong>' + esc(e.title) + '</strong></a><br><small class="muted">' + esc(t(e.kind)) + ' · ' + esc(e.sub) + '</small></li>';
          }).join('') + '</ul>' : '<p>' + esc(t('noResults')) + '</p>') : '');
      var input = main.querySelector('input[name="q"]');
      if (!q) input.focus();
    });
  }

  /* ---------- competition, leaderboard, progress ---------- */

  function validNick(s) {
    s = s.trim();
    try { return /^[\p{L}\p{M}\p{N} _-]{2,15}$/u.test(s) ? s : null; } catch (e) { return s.length >= 2 && s.length <= 15 ? s : null; }
  }
  function nickField(value) {
    return '<label class="field"><span>' + esc(t('nickname')) + '</span>' +
      '<input type="text" name="nick" maxlength="15" autocomplete="off" value="' + esc(value) + '"></label>' +
      '<p class="muted small">' + esc(t('nicknameHelp')) + '</p>';
  }
  function cityName(cid) {
    var c = (window.CITIES || []).filter(function (x) { return x.id === cid; })[0];
    return c ? L(c) : (cid || '—');
  }
  function citySelect(name, value, firstKey) {
    return '<select name="' + name + '"><option value="">' + esc(t(firstKey)) + '</option>' + (window.CITIES || []).map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === value ? ' selected' : '') + '>' + esc(L(c)) + '</option>';
    }).join('') + '</select>';
  }

  function viewCompetition(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      var p = getProgress();
      setMeta(t('compTitle'), t('compIntro', { n: COMP_QUESTIONS, m: COMP_SECONDS / 60 }));
      main.innerHTML = crumbs([['/', t('home')], ['', t('compTitle')]]) +
        '<h1>🏆 ' + esc(t('compTitle')) + '</h1>' +
        '<p>' + esc(t('compIntro', { n: COMP_QUESTIONS, m: COMP_SECONDS / 60 })) + '</p>' +
        '<form class="card nick-form">' + nickField(p.nick) +
          '<label class="field"><span>' + esc(t('city')) + '</span>' + citySelect('city', p.city, 'cityNone') + '</label>' +
          '<button class="btn big" type="submit">' + esc(t('startComp')) + '</button> <span class="form-msg" aria-live="polite"></span></form>' +
        '<p><a href="/leaderboard">🏅 ' + esc(t('leaderboard')) + '</a></p>';
      main.querySelector('.nick-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var nick = validNick(e.target.querySelector('input[name="nick"]').value);
        var city = e.target.querySelector('select[name="city"]').value;
        if (!nick) { e.target.querySelector('.form-msg').textContent = t('nicknameBad'); return; }
        var p2 = getProgress(); p2.nick = nick; p2.city = city; saveProgress(p2);
        startCompetition(chs, nick, city);
      });
    });
  }
  function startCompetition(chs, nick, city) {
    var pool = [];
    chs.forEach(function (ch) { ch.quiz.forEach(function (q) { if (q.type !== 'match') pool.push(q); }); });
    var qs = shuffle(pool).slice(0, COMP_QUESTIONS);
    var left = COMP_SECONDS, started = Date.now(), timedOut = false;
    main.innerHTML = '<h1>🏆 ' + esc(t('compTitle')) + '</h1>' +
      '<div class="timer no-print" role="timer">⏱️ ' + esc(t('timeLeft')) + ': <b id="clock">' + fmtTime(left) + '</b></div>' +
      '<div id="comp"></div>';
    window.scrollTo(0, 0);
    var clock = document.getElementById('clock');
    var runner = runQuiz(document.getElementById('comp'), qs, {
      prefix: 'c',
      submitKey: 'submit',
      onDone: function (r, out) {
        clearTimer();
        main.querySelector('.timer').hidden = true;
        var secs = Math.min(COMP_SECONDS, Math.round((Date.now() - started) / 1000));
        var p = getProgress();
        p.comps.push({ nick: nick, score: r.score, total: r.total, secs: secs, date: todayStr(), city: city || '' });
        p.comps = p.comps.slice(-50);
        p.points += r.score;
        var fresh = evaluateBadges(p);
        saveProgress(p);
        send('leaderboard', { nickname: nick, score: r.score, total: r.total, secs: Math.max(1, secs), class_id: '5', city: city || null });
        track('competition', { score: r.score, total: r.total });
        out.innerHTML = (timedOut ? '<p class="result-line bad">⏰ ' + esc(t('timeUp')) + '</p>' : '') +
          '<div class="certificate">' +
            '<p class="cert-site">' + esc(t('siteName')) + '</p>' +
            '<h2>' + esc(t('certHead')) + '</h2>' +
            '<p class="cert-text">' + esc(t('certText', { name: nick })) + '</p>' +
            '<p class="cert-score">' + esc(t('score')) + ': <b>' + r.score + ' / ' + r.total + '</b> · ' + esc(t('timeTaken')) + ': <b>' + fmtTime(secs) + '</b></p>' +
            '<p class="muted">' + esc(t('date')) + ': ' + todayStr() + '</p>' +
            '<p class="cert-org">The Professional Educator · EduPulse Nexus</p>' +
          '</div>' +
          '<div class="no-print">' +
            '<p class="points">⭐ ' + esc(t('pointsEarned', { n: r.score })) + '</p>' + newBadgesHTML(fresh) +
            '<div class="next-row"><button type="button" class="btn" data-act="cert">🖨️ ' + esc(t('printCert')) + '</button>' +
            '<a class="btn ghost" href="/competition">' + esc(t('newComp')) + '</a>' +
            '<a class="btn ghost" href="/leaderboard">🏅 ' + esc(t('leaderboard')) + '</a></div>' +
          '</div>';
        out.querySelector('[data-act="cert"]').addEventListener('click', function () {
          document.body.classList.add('print-cert');
          window.print();
          document.body.classList.remove('print-cert');
        });
      }
    });
    state.timer = setInterval(function () {
      left--;
      clock.textContent = fmtTime(Math.max(0, left));
      if (left <= 0) { timedOut = true; clearTimer(); runner.finish(); }
    }, 1000);
  }

  // Shared leaderboard for all of Sindh (nicknames only); falls back to this device's scores when offline.
  function viewLeaderboard(id) {
    var city = new URLSearchParams(location.search).get('city') || '';
    setMeta(t('leaderboard'), t('lbNoteShared'));
    function local() {
      var rows = getProgress().comps.filter(function (r) { return !city || r.city === city; })
        .sort(function (a, b) { return (b.score / b.total) - (a.score / a.total) || a.secs - b.secs; }).slice(0, 20);
      return { rows: rows, shared: false };
    }
    var load = CFG
      ? timeout(dbFetch('leaderboard?select=nickname,score,total,secs,city,created_at&order=score.desc,secs.asc,created_at.asc&limit=20' +
          (city ? '&city=eq.' + encodeURIComponent(city) : '')), 8000).then(function (rows) {
          return { shared: true, rows: rows.map(function (r) {
            return { nick: r.nickname, score: r.score, total: r.total, secs: r.secs, city: r.city, date: String(r.created_at).slice(0, 10) };
          }) };
        }).catch(local)
      : Promise.resolve(local());
    return load.then(function (res) {
      if (stale(id)) return;
      var medals = ['🥇', '🥈', '🥉'];
      main.innerHTML = crumbs([['/', t('home')], ['', t('leaderboard')]]) +
        '<h1>🏅 ' + esc(t('leaderboard')) + '</h1><p class="muted">' + esc(t(res.shared ? 'lbNoteShared' : 'lbNote')) + '</p>' +
        '<p><label class="field"><span>' + esc(t('city')) + '</span>' + citySelect('lbcity', city, 'allSindh') + '</label></p>' +
        (res.rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('rank')) + '</th><th>' + esc(t('nickname')) + '</th><th>' + esc(t('score')) + '</th><th>' + esc(t('timeTaken')) + '</th><th>' + esc(t('city')) + '</th><th>' + esc(t('date')) + '</th></tr></thead><tbody>' +
          res.rows.map(function (r, i) {
            return '<tr><td>' + (medals[i] || i + 1) + '</td><td>' + esc(r.nick) + '</td><td>' + r.score + ' / ' + r.total + '</td><td>' + fmtTime(r.secs) + '</td><td>' + esc(cityName(r.city)) + '</td><td>' + esc(r.date) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<p>' + esc(t('noScores')) + '</p>') +
        '<p><a class="btn" href="/competition">🏆 ' + esc(t('startComp')) + '</a></p>';
      main.querySelector('select[name="lbcity"]').addEventListener('change', function (e) {
        go('/leaderboard' + (e.target.value ? '?city=' + encodeURIComponent(e.target.value) : ''));
      });
    });
  }

  function viewProgress(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      var p = getProgress();
      setMeta(t('progress'), t('deviceNote'));
      var streak = (p.daily.last === todayStr() || p.daily.last === yesterdayStr()) ? p.daily.streak : 0;
      var weakRows = [];
      chs.forEach(function (ch) {
        var rec = p.quiz[ch._key];
        if (rec && rec.weak) rec.weak.forEach(function (sid) {
          var sec = ch.lesson.filter(function (x) { return x.id === sid; })[0];
          if (sec) weakRows.push('<li><a href="' + chUrl(ch) + '#' + sid + '">' + esc(L(sec.title)) + '</a> <small class="muted">(' + esc(L(ch.title)) + ')</small></li>');
        });
      });
      main.innerHTML = crumbs([['/', t('home')], ['', t('progress')]]) +
        '<h1>⭐ ' + esc(t('progress')) + '</h1>' +
        '<form class="card nick-form">' + nickField(p.nick) + '<button class="btn" type="submit">' + esc(t('save')) + '</button> <span class="form-msg" aria-live="polite"></span></form>' +
        '<div class="stats">' +
          '<div class="card stat"><span class="stat-num">' + p.points + '</span><span>' + esc(t('points')) + '</span></div>' +
          '<div class="card stat"><span class="stat-num">' + streak + '</span><span>🔥 ' + esc(t('dayStreak')) + '</span></div>' +
          '<div class="card stat"><span class="stat-num">' + p.badges.length + '</span><span>🏅 ' + esc(t('badges')) + '</span></div>' +
        '</div>' +
        '<h2>' + esc(t('badges')) + '</h2><div class="grid badges">' + allBadges().map(function (b) {
          var got = p.badges.indexOf(b.id) >= 0;
          return '<div class="card badge' + (got ? '' : ' locked') + '"><span class="badge-icon" aria-hidden="true">' + (got ? b.icon : '🔒') + '</span><strong>' + esc(b.name) + '</strong><small>' + esc(got ? b.desc : t('locked') + ' — ' + b.desc) + '</small></div>';
        }).join('') + '</div>' +
        '<h2>' + esc(t('chapterScores')) + '</h2><div class="scores">' + chs.map(function (ch) {
          var rec = p.quiz[ch._key];
          return '<div class="card score-row"><a href="' + chUrl(ch, 'quiz') + '">' + ch.icon + ' ' + esc(L(ch.title)) + '</a>' +
            (rec ? '<div class="bar" role="img" aria-label="' + rec.best + '%"><span style="width:' + rec.best + '%"></span></div><small>' + esc(t('bestScore', { n: rec.best })) + ' · ' + esc(t('attempts', { n: rec.attempts })) + '</small>'
              : '<small class="muted">' + esc(t('notStarted')) + '</small>') + '</div>';
        }).join('') + '</div>' +
        '<h2>' + esc(t('weakTitle')) + '</h2>' + (weakRows.length ? '<ul>' + weakRows.join('') + '</ul>' : '<p>' + esc(t('noWeak')) + '</p>') +
        '<p class="muted">🔒 ' + esc(t('deviceNote')) + '</p>' +
        '<p><button type="button" class="btn ghost danger" data-act="reset">' + esc(t('reset')) + '</button></p>';
      main.querySelector('.nick-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var nick = validNick(e.target.querySelector('input[name="nick"]').value), msg = e.target.querySelector('.form-msg');
        if (!nick) { msg.textContent = t('nicknameBad'); return; }
        var p2 = getProgress(); p2.nick = nick; saveProgress(p2);
        msg.textContent = '✔ ' + t('saved');
      });
      main.querySelector('[data-act="reset"]').addEventListener('click', function () {
        if (window.confirm(t('resetConfirm'))) { store.set('progress', {}); render(false); }
      });
    });
  }

  function viewTeachers(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      setMeta(t('teachers'), t('teachersIntro'));
      main.innerHTML = crumbs([['/', t('home')], ['', t('teachers')]]) +
        '<h1>👩‍🏫 ' + esc(t('teachers')) + '</h1><p>' + esc(t('teachersIntro')) + '</p>' +
        '<ul class="tips">' + ['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map(function (k) { return '<li>' + esc(t(k)) + '</li>'; }).join('') + '</ul>' +
        '<div class="table-wrap"><table class="table"><tbody>' + chs.map(function (ch) {
          return '<tr><td>' + ch.icon + ' ' + esc(chLabel(ch)) + '</td>' +
            '<td><a href="' + chUrl(ch) + '">' + esc(t('tab_lesson')) + '</a></td>' +
            '<td><a href="' + chUrl(ch, 'quiz') + '">' + esc(t('tab_quiz')) + '</a></td>' +
            '<td><a href="' + chUrl(ch, 'worksheet') + '">📝 ' + esc(t('tab_worksheet')) + '</a></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="card note"><p>🔐 ' + esc(t('staffIntro')) + '</p><p><a class="btn" href="/admin">' + esc(t('staffLogin')) + '</a></p></div>';
    });
  }

  function viewAbout() {
    setMeta(t('about'), t('aboutP1'));
    main.innerHTML = crumbs([['/', t('home')], ['', t('about')]]) +
      '<h1>' + esc(t('about')) + '</h1>' +
      '<section class="card">' + ['aboutP1', 'aboutP2', 'aboutP3', 'aboutP4', 'aboutP5'].map(function (k) { return '<p>' + esc(t(k)) + '</p>'; }).join('') + '</section>';
  }

  render(false);
  flushOutbox();
  loadBadges();
})();
