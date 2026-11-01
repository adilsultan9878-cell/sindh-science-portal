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
  // Order of the parts of a chapter; the Back / Next buttons follow it.
  var TAB_ORDER = ['lesson', 'diagram', 'quiz', 'worksheet', 'experiment', 'game', 'words'];

  // Line icons (24×24, drawn in the text colour) used in menus, tabs and buttons instead of emoji.
  var ICON_PATHS = {
    lesson: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    diagram: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    quiz: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    worksheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    experiment: '<path d="M9 3h6M10 3v6l-5.6 9.6A2 2 0 0 0 6.1 21h11.8a2 2 0 0 0 1.7-2.4L14 9V3"/><path d="M7.5 15h9"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 12.5h4M9 10.5v4"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="13.5" r="1"/>',
    words: '<path d="M4 7V5h11v2M9.5 5v14M7 19h5M15 13h6M18 13v6"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    next: '<path d="m9 6 6 6-6 6"/>',
    prev: '<path d="m15 6-6 6 6 6"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5z"/>',
    check: '<path d="M5 12.5 10 17 19 7"/>',
    cross: '<path d="M6 6l12 12M18 6 6 18"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    flame: '<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    medal: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    offline: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.3-1.7M12 20h.01"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICON_PATHS[name] || '') + '</svg>';
  }

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
      city: p.city || '',
      lessons: p.lessons || {},   // chapter key -> true when the lesson was finished
      labels: p.labels || {},     // chapter key -> best % in "label the diagram"
      ws: p.ws || {},             // chapter key -> { score, total, at } when the worksheet was submitted
      exp: p.exp || {},           // chapter key -> { at } when the experiment was finished
      last: p.last || null        // url of the last chapter page opened
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

  var LEAF = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1e7a3c"/>' +
    '<path d="M9 23C9 13.5 15.5 8 24 8c0 9.5-5.5 15-15 15z" fill="#fff"/><path d="M9.5 22.5 18 14" stroke="#1e7a3c" stroke-width="1.8" stroke-linecap="round"/></svg>';

  // A short tip line (encouragement or a hint) shown above lessons, quizzes and results.
  function guide(msg) {
    return '<div class="guide" role="note">' + icon('bulb') + '<p>' + esc(msg) + '</p></div>';
  }

  // Listen buttons. Urdu and English words have recorded voice files (listed in audio/index.json);
  // anything else uses the phone's own voice for that language, when the phone has one.
  var audioIndex = null, player = null;
  function phoneVoice(lang) {
    return window.speechSynthesis ? speechSynthesis.getVoices().filter(function (v) { return v.lang.toLowerCase().indexOf(lang) === 0; })[0] : null;
  }
  function sayBtn(text, lang) {
    if (!text || (lang === 'sd' && !phoneVoice('sd'))) return '';
    return '<button type="button" class="say no-print" data-say="' + esc(text) + '" data-say-lang="' + lang + '" title="' + esc(t('listen')) + '" aria-label="' + esc(t('listen')) + ': ' + esc(text) + '">' + icon('volume') + '</button>';
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

  // Spoken lesson parts (Urdu and English, made by tools/make_lesson_audio.py and listed in audio/lessons/index.json).
  // Sindhi readers hear the Urdu voice, as there is no Sindhi computer voice.
  var lessonAudio = null;
  function loadLessonAudio() {
    if (lessonAudio) return Promise.resolve(lessonAudio);
    return fetch('/audio/lessons/index.json').then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; }).then(function (j) { lessonAudio = j; return j; });
  }
  function fillListenButtons(box, ch) {
    loadLessonAudio().then(function (idx) {
      var lang = state.lang === 'en' ? 'en' : 'ur', secs = idx[ch.id] || {};
      box.querySelectorAll('.listen-slot').forEach(function (slot) {
        var a = secs[slot.getAttribute('data-sec')];
        if (!a || !a[lang]) return;
        var len = a[lang + 'Secs'];
        slot.innerHTML = '<button type="button" class="btn ghost small listen-part" data-src="/audio/lessons/' + esc(a[lang]) + '">' + icon('volume') +
          '<span>' + esc(t('listenPart')) + '</span>' + (len ? '<small class="muted">' + fmtTime(len) + '</small>' : '') + '</button>';
      });
    });
  }
  function playPart(btn) {
    var src = btn.getAttribute('data-src'), playing = player && !player.paused && player.getAttribute('data-src') === src;
    if (player) player.pause();
    document.querySelectorAll('.listen-part.on').forEach(function (b) { b.classList.remove('on'); b.querySelector('span').textContent = t('listenPart'); });
    if (playing) return;
    player = new Audio(src);
    player.setAttribute('data-src', src);
    btn.classList.add('on');
    btn.querySelector('span').textContent = t('stopListening');
    player.addEventListener('ended', function () { btn.classList.remove('on'); btn.querySelector('span').textContent = t('listenPart'); });
    player.play().catch(function () { btn.classList.remove('on'); btn.querySelector('span').textContent = t('listenPart'); });
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
    return '<div class="new-badges"><h3>' + icon('medal') + ' ' + esc(t('newBadge')) + '</h3><div class="badge-row">' + ids.map(function (id) {
      var b = badgeById(id);
      return b ? '<span class="badge-chip"><span aria-hidden="true">' + b.icon + '</span> ' + esc(b.name) + '</span>' : '';
    }).join('') + '</div></div>';
  }

  /* ---------- page frame ---------- */

  function applyLang() {
    var l = state.lang || 'sd';
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-zoom', store.get('zoom', 0));
  }
  function isCurrent(href) {
    var p = location.pathname;
    if (href === '/') return p === '/';
    return p === href || p.indexOf(href + '/') === 0;
  }
  function renderFrame() {
    var links = [['/', 'home'], ['/class-5/science', 'learn'], ['/glossary', 'glossary'], ['/competition', 'competition'], ['/progress', 'progress'], ['/search', 'search']];
    var offline = state.lang && navigator.onLine === false;
    document.getElementById('top').innerHTML = (offline ? '<p class="offline-note" role="status">' + icon('offline') + ' ' + esc(t('offlineNote')) + '</p>' : '') +
      '<div class="wrap top-row">' +
        '<a class="brand" href="/">' + LEAF + '<span>' + esc(t('siteName')) + '</span></a>' +
        '<div class="top-tools">' +
        (state.lang ? '<div class="zoom" role="group" aria-label="' + esc(t('textSize')) + '">' +
          '<button type="button" class="zoom-btn" data-zoom="-1" aria-label="' + esc(t('smaller')) + '" title="' + esc(t('smaller')) + '">A−</button>' +
          '<button type="button" class="zoom-btn" data-zoom="1" aria-label="' + esc(t('bigger')) + '" title="' + esc(t('bigger')) + '">A+</button></div>' : '') +
        '<div class="langs" role="group" aria-label="Language / ٻولي / زبان">' + LANGS.map(function (l) {
          return '<button type="button" class="lang-btn" data-setlang="' + l + '" lang="' + l + '" aria-pressed="' + (state.lang === l) + '">' + LANG_NAMES[l] + '</button>';
        }).join('') + '</div></div>' +
      '</div>' +
      (state.lang ? '<nav class="wrap nav" aria-label="' + esc(t('menu')) + '">' + links.map(function (x) {
        return '<a href="' + x[0] + '"' + (isCurrent(x[0]) ? ' aria-current="page"' : '') + '>' + esc(t(x[1])) + '</a>';
      }).join('') + '</nav>' : '');
    document.getElementById('foot').innerHTML = state.lang ?
      '<div class="wrap foot-grid">' +
        '<div><p class="foot-brand">' + LEAF + '<span>' + esc(t('siteName')) + '</span></p><p>' + esc(t('footerFree')) + '</p></div>' +
        '<nav class="foot-links" aria-label="' + esc(t('more')) + '"><a href="/teachers">' + esc(t('teachers')) + '</a><a href="/videos/">' + esc(t('videoGuide')) + '</a>' +
          '<a href="/leaderboard">' + esc(t('leaderboard')) + '</a><a href="/about">' + esc(t('about')) + '</a><a href="/admin">' + esc(t('staff')) + '</a></nav>' +
      '</div>' +
      '<div class="wrap foot-base"><p>© The Professional Educator · EduPulse Nexus · ' + esc(t('pilot')) + '</p></div>' : '';
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
    var zb = e.target.closest('[data-zoom]');
    if (zb) {
      var z = Math.max(-1, Math.min(3, store.get('zoom', 0) + (+zb.getAttribute('data-zoom'))));
      store.set('zoom', z);
      document.documentElement.setAttribute('data-zoom', z);
      return;
    }
    var lp = e.target.closest('.listen-part');
    if (lp) { playPart(lp); return; }
    var a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^\/(data|fonts|css|js|img|audio|videos|lesson-videos|paper)(\/|$)/.test(url.pathname) || /^\/admin/.test(url.pathname)) return;
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
    slot.innerHTML = '<div class="card install"><span class="icon-tile">' + icon('phone') + '</span><div><strong>' + esc(t('install')) + '</strong>' +
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
    main.innerHTML = '<section class="card center"><h1>' + icon('alert') + '</h1><p>' + esc(t('loadError')) + '</p><p><a class="btn" href="/">' + esc(t('goHome')) + '</a></p></section>';
  }

  function viewHome(id) {
    return loadAll().then(function (chs) {
      if (stale(id)) return;
      setMeta(t('siteName'), t('welcomeText'));
      var cat = state.catalog, p = getProgress();
      var qCount = chs.reduce(function (n, ch) { return n + ch.quiz.length; }, 0);
      var last = p.last && chs.filter(function (ch) { return p.last === chUrl(ch) || p.last.indexOf(chUrl(ch) + '/') === 0; })[0];
      var pics = chs.filter(function (ch) { return (window.PICTURES || {})[ch.id]; }).slice(0, 4);
      main.innerHTML =
        '<section class="hero">' +
          '<div class="hero-text">' +
            '<p class="eyebrow">' + esc(t('heroStats', { c: chs.length, q: qCount })) + '</p>' +
            '<h1>' + esc(t('welcomeTitle')) + '</h1>' +
            '<p class="lead">' + esc(t('welcomeText')) + '</p>' +
            '<div class="btn-row"><a class="btn big" href="/class-5/science">' + esc(t('startLearning')) + '</a>' +
              '<a class="btn ghost big" href="/teachers">' + esc(t('forTeachers')) + '</a></div>' +
          '</div>' +
          (pics.length === 4 ? '<div class="hero-pics" aria-hidden="true">' + pics.map(function (ch) {
            return '<img src="' + window.PICTURES[ch.id].src + '" alt="" width="200" height="200" decoding="async">';
          }).join('') + '</div>' : '') +
        '</section>' +
        (last ? '<a class="card continue" href="' + esc(p.last) + '">' + thumb(last) +
          '<span class="continue-body"><small class="muted">' + esc(t('continueLearning')) + '</small><strong>' + esc(chLabel(last)) + '</strong>' +
          progressBar(chapterStatus(last, p).pct) + '</span>' + icon('next', 'flip') + '</a>' : '') +
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
          quickLink('/competition', 'trophy', 'competition', 'compShort') +
          quickLink('/glossary', 'words', 'glossary', 'glossShort') +
          quickLink('/progress', 'star', 'progress', 'progShort') +
          quickLink('/teachers', 'users', 'teachers', 'teachShort') +
        '</div>';
      renderDaily(document.getElementById('daily'), chs);
      showInstall();
    });
  }
  function quickLink(href, iconName, titleKey, textKey) {
    return '<a class="card quick" href="' + href + '"><span class="icon-tile">' + icon(iconName) + '</span><span><strong>' + esc(t(titleKey)) + '</strong><span class="muted">' + esc(t(textKey)) + '</span></span></a>';
  }
  // Chapter picture (or its emoji when it has no picture) as a small square.
  function thumb(ch, size) {
    var pic = (window.PICTURES || {})[ch.id];
    return '<span class="thumb' + (size ? ' thumb-' + size : '') + '" aria-hidden="true">' +
      (pic ? '<img src="' + pic.src + '" alt="" width="96" height="96" loading="lazy" decoding="async">' : '<span class="thumb-emoji">' + esc(ch.icon || '') + '</span>') + '</span>';
  }
  function progressBar(pct, label) {
    return '<span class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"' +
      (label ? ' aria-label="' + esc(label) + '"' : '') + '><span style="width:' + pct + '%"></span></span>';
  }
  // Quiz, worksheet and experiment status of one chapter (the three parts that count as "done").
  function chapterStatus(ch, p) {
    p = p || getProgress();
    var k = ch._key, q = p.quiz[k], w = p.ws[k], x = p.exp[k];
    var items = [
      { tab: 'quiz', state: q ? 'done' : 'none', note: q ? q.best + '%' : '' },
      { tab: 'worksheet', state: w ? 'done' : store.get('wsdraft.' + k, null) ? 'draft' : 'none', note: w && w.total ? w.score + ' / ' + w.total : '' },
      { tab: 'experiment', state: x ? 'done' : store.get('expdraft.' + k, null) ? 'draft' : 'none', note: '' }
    ];
    var done = items.filter(function (it) { return it.state === 'done'; }).length;
    return { items: items, done: done, pct: Math.round(100 * done / items.length) };
  }
  function statusHTML(ch, links) {
    var st = chapterStatus(ch);
    return '<div class="ch-status">' +
      '<div class="ch-status-top"><strong>' + esc(t('chapterProgress')) + '</strong><span class="muted">' + esc(t('doneOf', { n: st.done, m: st.items.length })) + '</span></div>' +
      progressBar(st.pct, t('chapterProgress')) +
      '<div class="st-row">' + st.items.map(function (it) {
        var inner = icon(it.tab) + '<span class="st-name">' + esc(t('tab_' + it.tab)) + '</span>' +
          '<span class="st-val">' + (it.state === 'done' ? icon('check') + esc(it.note || t('stDone')) : esc(t(it.state === 'draft' ? 'stDraft' : 'stNone'))) + '</span>';
        return links ? '<a class="st st-' + it.state + '" href="' + chUrl(ch, it.tab) + '">' + inner + '</a>' : '<span class="st st-' + it.state + '">' + inner + '</span>';
      }).join('') + '</div></div>';
  }
  function refreshStatus(ch) {
    var box = document.querySelector('.ch-status'), done = document.querySelector('.ch-done-slot');
    if (box) box.outerHTML = statusHTML(ch, true);
    if (done) done.innerHTML = chapterDoneHTML(ch);
  }
  // When the quiz, worksheet and experiment are all done: a note with a printable chapter certificate.
  function chapterDoneHTML(ch) {
    if (chapterStatus(ch).done < 3) return '';
    var p = getProgress();
    return '<div class="card note ok ch-done no-print"><p><strong>' + icon('medal') + ' ' + esc(t('chapterDoneTitle')) + '</strong></p>' +
      '<p>' + esc(t('chapterDoneText')) + '</p><button type="button" class="btn small" data-act="chapter-cert">' + icon('printer') + esc(t('printCert')) + '</button></div>' +
      '<div class="certificate cert-chapter">' +
        '<p class="cert-site">' + esc(t('siteName')) + '</p><h2>' + esc(t('chapterCertHead')) + '</h2>' +
        '<p class="cert-text">' + esc(t('chapterCertText', { name: p.nick || '________________', chapter: chLabel(ch) })) + '</p>' +
        '<p class="muted">' + esc(t('date')) + ': ' + todayStr() + '</p><p class="cert-org">The Professional Educator · EduPulse Nexus</p></div>';
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-act="chapter-cert"]')) return;
    document.body.classList.add('print-cert');
    window.print();
    document.body.classList.remove('print-cert');
  });
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
    var html = '<h2>' + icon('sun') + ' ' + esc(t('dailyTitle')) + '</h2>' +
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
    html += '<p class="streak">' + icon('flame') + ' ' + esc(t('streak', { n: streak })) + '</p><div class="daily-badges"></div>';
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
      el.querySelector('.daily-badges').innerHTML = (ok ? '<p class="points">' + icon('star') + ' ' + esc(t('pointsEarned', { n: 5 })) + '</p>' : '') + newBadgesHTML(fresh);
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
          var st = chapterStatus(ch, p);
          return '<a class="card ch-card" href="' + chUrl(ch) + '">' + thumb(ch) +
            '<span class="ch-body"><small class="eyebrow">' + esc(t('chapterN', { n: ch.number })) + '</small>' +
            '<strong>' + esc(L(ch.title)) + '</strong>' +
            '<span class="muted ch-sum">' + esc(L(ch.summary)) + '</span>' +
            '<span class="ch-score">' + progressBar(st.pct) + '<small class="muted">' + esc(t('doneOf', { n: st.done, m: st.items.length })) +
              (p.quiz[ch._key] ? ' · ' + esc(t('bestScore', { n: p.quiz[ch._key].best })) : '') + '</small></span></span></a>';
        }).join('') +
        (s.upcoming || []).map(function (u, i) {
          return '<div class="card ch-card is-off"><span class="thumb" aria-hidden="true"><span class="thumb-emoji">' + icon('lock') + '</span></span><span class="ch-body"><small>' +
            esc(t('chapterN', { n: chs.length + i + 1 })) + '</small><strong>' + esc(L(u)) + '</strong><span>' + esc(t('comingSoon')) + '</span></span></div>';
        }).join('') + '</div>';
    });
  }

  function chapterTabs(ch) {
    return TAB_ORDER.filter(function (tb) {
      if (tb === 'diagram') return !!ch.diagram;
      if (tb === 'worksheet') return !!ch.worksheet;
      if (tb === 'experiment') return !!ch.experiment;
      if (tb === 'game') return (ch.games && ch.games.length) || spellWords(ch).length >= 3;
      if (tb === 'words') return !!(ch.glossary && ch.glossary.length);
      return true;
    });
  }

  // Back / Next buttons under every part of a chapter: they walk through the parts in order,
  // then on to the next chapter.
  function flowNav(ch, chs, tabs, tab) {
    var i = tabs.indexOf(tab), at = chs.indexOf(ch), list = '/class-' + ch._cls + '/' + ch._subj, prev, next;
    prev = i > 0 ? [chUrl(ch, tabs[i - 1]), t('prevTo', { x: t('tab_' + tabs[i - 1]) })] : [list, t('allChapters')];
    if (i < tabs.length - 1) next = [chUrl(ch, tabs[i + 1]), t('nextTo', { x: t('tab_' + tabs[i + 1]) })];
    else if (chs[at + 1]) next = [chUrl(chs[at + 1]), t('nextChapter') + ': ' + L(chs[at + 1].title)];
    else next = [list, t('allChapters')];
    return '<nav class="flow no-print" aria-label="' + esc(L(ch.title)) + '">' +
      '<a class="btn ghost flow-prev" href="' + prev[0] + '">' + icon('prev', 'flip') + '<span>' + esc(prev[1]) + '</span></a>' +
      '<a class="btn flow-next" href="' + next[0] + '"><span>' + esc(next[1]) + '</span>' + icon('next', 'flip') + '</a></nav>';
  }

  function viewChapter(id, cls, subj, chId, tab) {
    var c = findClass(cls), s = findSubject(cls, subj);
    if (!c || !c.active || !s || !s.active) return viewNotFound();
    return loadSubject(cls, subj).then(function (chs) {
      if (stale(id)) return;
      var ch = chs.filter(function (x) { return x.id === chId; })[0];
      if (!ch) return viewNotFound();
      var tabs = chapterTabs(ch);
      tab = tab || 'lesson';
      if (tabs.indexOf(tab) < 0) return viewNotFound();
      var p = getProgress();
      p.last = location.pathname;
      saveProgress(p);
      setMeta(L(ch.title) + ' — ' + t('tab_' + tab), L(ch.summary));
      main.innerHTML = crumbs([['/', t('home')], ['/class-' + cls, L(c.name)], ['/class-' + cls + '/' + subj, L(s.name)], ['', L(ch.title)]]) +
        '<header class="ch-head">' + thumb(ch, 'lg') + '<div class="ch-head-text">' +
          '<p class="eyebrow">' + esc(t('chapterN', { n: ch.number })) + ' · ' + esc(L(c.name)) + ' ' + esc(L(s.name)) + '</p>' +
          '<h1>' + esc(L(ch.title)) + ' ' + sayBtn(L(ch.title), state.lang) + '</h1>' +
          '<p class="muted">' + esc(L(ch.summary)) + '</p>' +
          '<a class="share-link no-print" href="https://wa.me/?text=' + encodeURIComponent(t('shareText') + ' ' + L(ch.title) + ' — ' + location.origin + chUrl(ch)) +
            '" target="_blank" rel="noopener">' + icon('next', 'flip') + esc(t('share')) + '</a></div></header>' +
        statusHTML(ch, true) + '<div class="ch-done-slot">' + chapterDoneHTML(ch) + '</div>' +
        '<nav class="tabs no-print" aria-label="' + esc(L(ch.title)) + '">' + tabs.map(function (tb, i) {
          return '<a class="tab" href="' + chUrl(ch, tb) + '"' + (tb === tab ? ' aria-current="page"' : '') + '>' +
            '<span class="tab-n">' + (i + 1) + '</span>' + icon(tb) + '<span>' + esc(t('tab_' + tb)) + '</span></a>';
        }).join('') + '</nav>' +
        '<div id="tab" class="tab-body"></div>' + flowNav(ch, chs, tabs, tab);
      var el = document.getElementById('tab');
      ({ lesson: tabLesson, diagram: tabDiagram, quiz: tabQuiz, worksheet: tabWorksheet, game: tabGame, experiment: tabExperiment, words: tabWords })[tab](el, ch, c, s);
    });
  }

  /* ---------- lesson: one part at a time, each with a quick check ---------- */

  // The picture that belongs to one lesson section (topic), with a link to its diagram.
  function topicFigure(ch, sid) {
    var photo = (window.PICTURES || {})[ch.id], hasDiagram = ch.diagram && (window.DIAGRAM_TOPICS || {})[ch.id] === sid;
    var hasPhoto = photo && photo.topic === sid;
    if (!hasPhoto && !hasDiagram) return '';
    return '<figure class="topic-fig">' +
      (hasPhoto ? '<img src="' + photo.src + '" alt="' + esc(L(ch.title)) + '" width="' + photo.w + '" height="' + photo.h + '" loading="lazy" decoding="async">' : '') +
      '<figcaption><a class="btn ghost small" href="' + chUrl(ch, 'diagram') + '#topic-' + sid + '">' + icon('diagram') + ' ' + esc(t('openDiagram')) + '</a></figcaption></figure>';
  }
  function quickCheckHTML(q) {
    var opts = q.type === 'tf' ? [['true', t('true')], ['false', t('false')]] : q.options.map(function (o, i) { return [String(i), L(o)]; });
    return '<div class="quick-check" data-ans="' + esc(String(q.answer)) + '" data-right="' + esc(answerText(q)) + '">' +
      '<p class="qc-head">' + icon('quiz') + ' ' + esc(t('quickCheck')) + '</p>' +
      '<p class="qc-q">' + esc(L(q.q)) + '</p>' +
      '<div class="qc-opts">' + opts.map(function (o) { return '<button type="button" class="qc-opt" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>' +
      '<p class="qc-msg" aria-live="polite"></p></div>';
  }
  function tabLesson(el, ch) {
    var vid = (window.LESSON_VIDEOS || {})[ch.id], secs = ch.lesson, all = false;
    var cur = Math.max(0, secs.map(function (x) { return x.id; }).indexOf(location.hash.slice(1)));
    el.innerHTML = (vid ? '<section class="card lesson-video"><h2>' + icon('video') + ' ' + esc(t('videoTitle')) + '</h2>' +
        '<video controls preload="none" playsinline width="960" height="540" poster="' + vid.poster + '" src="' + vid.src + '"></video>' +
        '<p class="small muted">' + esc(t('videoNote')) + '</p></section>' : '') +
      guide(t('guideLesson')) + '<div class="lesson-body"></div>';
    var body = el.querySelector('.lesson-body');
    function section(sec, n) {
      var q = ch.quiz.filter(function (x) { return x.topic === sec.id && x.type !== 'match'; })[0];
      return '<section class="card lesson-sec" id="' + sec.id + '">' +
        '<p class="eyebrow">' + esc(t('partOf', { n: n + 1, m: secs.length })) + '</p>' +
        '<h2>' + esc(L(sec.title)) + ' ' + sayBtn(L(sec.title), state.lang) + '</h2>' +
        '<p class="listen-slot no-print" data-sec="' + sec.id + '"></p>' + paragraphs(L(sec.body)) +
        topicFigure(ch, sec.id) + (q ? quickCheckHTML(q) : '') + '</section>';
    }
    function draw(scroll) {
      body.innerHTML = '<div class="lesson-bar no-print"><div class="dots">' + secs.map(function (x, i) {
          return '<button type="button" class="dot' + (!all && i === cur ? ' on' : '') + (!all && i < cur ? ' seen' : '') + '" data-go="' + i + '"' +
            ' aria-label="' + esc(t('partOf', { n: i + 1, m: secs.length }) + ': ' + L(x.title)) + '"' + (!all && i === cur ? ' aria-current="step"' : '') + '>' + (i + 1) + '</button>';
        }).join('') + '</div>' +
        '<button type="button" class="linkish" data-act="all">' + esc(t(all ? 'showSteps' : 'showAll')) + '</button></div>' +
        (all ? secs.map(section).join('') : section(secs[cur], cur)) +
        '<div class="part-nav no-print">' +
          (!all && cur > 0 ? '<button type="button" class="btn ghost" data-go="' + (cur - 1) + '">' + icon('prev', 'flip') + esc(t('previous')) + '</button>' : '<span></span>') +
          (!all && cur < secs.length - 1 ? '<button type="button" class="btn" data-go="' + (cur + 1) + '">' + esc(t('next')) + icon('next', 'flip') + '</button>'
            : '<button type="button" class="btn" data-act="finish">' + icon('check') + esc(t('finishLesson')) + '</button>') +
        '</div><div class="lesson-done" aria-live="polite"></div>';
      fillListenButtons(body, ch);
      if (scroll) body.scrollIntoView({ block: 'start' });
    }
    body.addEventListener('click', function (e) {
      var go = e.target.closest('[data-go]');
      if (go) { all = false; cur = +go.getAttribute('data-go'); draw(true); return; }
      var act = e.target.closest('[data-act]');
      if (act && act.getAttribute('data-act') === 'all') { all = !all; draw(true); return; }
      if (act && act.getAttribute('data-act') === 'finish') {
        var p = getProgress();
        p.lessons[ch._key] = true;
        saveProgress(p);
        body.querySelector('.lesson-done').innerHTML = '<div class="card note ok">' + icon('check') + ' ' + esc(t('lessonDone')) + '</div>';
        return;
      }
      var opt = e.target.closest('.qc-opt');
      if (opt) {
        var box = opt.closest('.quick-check');
        if (box.classList.contains('answered')) return;
        var ok = opt.getAttribute('data-v') === box.getAttribute('data-ans');
        box.classList.add('answered');
        box.querySelectorAll('.qc-opt').forEach(function (b) {
          if (b.getAttribute('data-v') === box.getAttribute('data-ans')) b.classList.add('is-right');
          else if (b === opt) b.classList.add('is-wrong');
          b.disabled = true;
        });
        var msg = box.querySelector('.qc-msg');
        msg.className = 'qc-msg ' + (ok ? 'ok' : 'bad');
        msg.textContent = ok ? t('correct') : t('correctAnswerIs') + ' ' + box.getAttribute('data-right');
      }
    });
    draw(false);
  }

  /* ---------- diagram: pictures grouped by lesson topic, explore, and a labelling question ---------- */

  function treeHTML(node, label) {
    return '<div class="tree-branch"><button type="button" class="tree-node" data-part="' + node.id + '">' + label(node.id) + '</button>' +
      (node.children ? '<div class="tree-down" aria-hidden="true">↓</div><div class="tree-kids">' + node.children.map(function (k) { return treeHTML(k, label); }).join('') + '</div>' : '') +
      '</div>';
  }
  function photoFigure(ch, photo) {
    var pw = Math.round(Math.min(photo.w, 520 * photo.w / photo.h)); // tall pictures are kept to 520px high; tap opens the full size
    return '<figure class="card photo"><a href="' + photo.src + '" target="_blank"><img src="' + photo.src + '" width="' + pw + '" height="' + Math.round(pw * photo.h / photo.w) + '" alt="' + esc(L(ch.title)) + '" decoding="async"></a>' +
      '<figcaption class="small muted">' + esc(t('picCredit')) + ' ' + esc(photo.author) + ' · ' +
        (photo.licenseUrl ? '<a href="' + photo.licenseUrl + '" target="_blank" rel="noopener">' + esc(photo.license) + '</a>' : esc(photo.license)) +
        ' · <a href="' + photo.link + '" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>';
  }
  function tabDiagram(el, ch) {
    var d = ch.diagram, parts = {};
    d.parts.forEach(function (p) { parts[p.id] = p; });
    function label(pid) { return esc(L(parts[pid].label)); }
    var isTree = d.type === 'tree';
    function drawing(lbl) { return isTree ? '<div class="tree">' + treeHTML(d.tree, lbl) + '</div>' : window.DIAGRAMS[d.type](lbl); }
    var photo = (window.PICTURES || {})[ch.id];
    var dTopic = (window.DIAGRAM_TOPICS || {})[ch.id], ids = ch.lesson.map(function (x) { return x.id; });
    if (ids.indexOf(dTopic) < 0) dTopic = ids[0];
    var pTopic = photo && ids.indexOf(photo.topic) >= 0 ? photo.topic : dTopic;

    // numbers for the labelling question, in the order the parts are listed
    var num = {};
    d.parts.forEach(function (p, i) { num[p.id] = i + 1; });
    var labelDrawing = drawing(function (pid) { return String(num[pid]); }).replace(/data-part=/g, 'data-lpart=');

    var explore = '<div class="dg-block dg-explore"><h3>' + icon('eye') + ' ' + esc(t('exploreTitle')) + '</h3><p>' + esc(t('tapPart')) + '</p>' +
      '<div class="diagram-wrap"><div class="diagram">' + drawing(label) + '</div>' +
      '<div class="card info" aria-live="polite"><p class="muted">' + esc(t('tapPart')) + '</p></div></div>' +
      (isTree ? '' : '<div class="chips">' + d.parts.map(function (p) {
        return '<button type="button" class="chip" data-part="' + p.id + '">' + label(p.id) + '</button>';
      }).join('') + '</div>') + '</div>';
    var labelling = '<div class="dg-block dg-label"><h3>' + icon('tag') + ' ' + esc(t('labelTitle')) + '</h3><p>' + esc(t('labelHelp')) + '</p>' +
      '<div class="diagram-wrap"><div class="diagram label-mode">' + labelDrawing + '</div><div class="lbl-list"></div></div>' +
      '<div class="lbl-actions"><button type="button" class="btn" data-act="check-labels">' + icon('check') + esc(t('check')) + '</button>' +
      '<p class="lbl-result" aria-live="polite"></p></div></div>';

    el.innerHTML = ch.lesson.map(function (sec, i) {
      var parts2 = (photo && sec.id === pTopic ? photoFigure(ch, photo) : '') + (sec.id === dTopic ? explore + labelling : '');
      if (!parts2) return '';
      return '<section class="topic-block" id="topic-' + sec.id + '"><p class="eyebrow">' + esc(t('topicN', { n: i + 1 })) + '</p>' +
        '<h2>' + esc(L(sec.title)) + '</h2>' + parts2 +
        '<p><a href="' + chUrl(ch) + '#' + sec.id + '">' + icon('lesson') + ' ' + esc(t('tab_lesson')) + ': ' + esc(L(sec.title)) + '</a></p></section>';
    }).join('');

    var info = el.querySelector('.info'), exploreBox = el.querySelector('.dg-explore');
    function show(pid) {
      var p = parts[pid];
      exploreBox.querySelectorAll('[data-part]').forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-part') === pid); });
      info.innerHTML = '<h3>' + label(pid) + '</h3>' +
        '<p class="names">' + LANGS.map(function (l) { return '<span lang="' + l + '">' + esc(p.label[l]) + '</span>'; }).join(' · ') + '</p>' +
        '<p>' + esc(L(p.info)) + '</p>';
    }
    exploreBox.addEventListener('click', function (e) {
      var n = e.target.closest('[data-part]');
      if (n) show(n.getAttribute('data-part'));
    });
    exploreBox.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g[data-part]')) {
        e.preventDefault();
        show(e.target.getAttribute('data-part'));
      }
    });

    // labelling question
    var lbox = el.querySelector('.dg-label'), list = lbox.querySelector('.lbl-list'), result = lbox.querySelector('.lbl-result');
    function setupLabels() {
      var names = shuffle(d.parts.map(function (p) { return p.id; }));
      list.innerHTML = d.parts.map(function (p) {
        return '<label class="lbl-row"><span class="lbl-n">' + num[p.id] + '</span><select data-pid="' + p.id + '" aria-label="' + num[p.id] + '">' +
          '<option value="">' + esc(t('choose')) + '</option>' + names.map(function (id) { return '<option value="' + id + '">' + label(id) + '</option>'; }).join('') +
          '</select></label>';
      }).join('');
      result.innerHTML = '';
      lbox.querySelector('[data-act="check-labels"]').hidden = false;
    }
    lbox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'retry-labels') { setupLabels(); return; }
      var good = 0;
      list.querySelectorAll('select').forEach(function (s) {
        var ok = s.value === s.getAttribute('data-pid');
        if (ok) good++;
        s.disabled = true;
        s.closest('.lbl-row').classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) s.closest('.lbl-row').insertAdjacentHTML('beforeend', '<small class="lbl-fix">' + label(s.getAttribute('data-pid')) + '</small>');
      });
      var pct = Math.round(100 * good / d.parts.length), p = getProgress();
      p.labels[ch._key] = Math.max(p.labels[ch._key] || 0, pct);
      saveProgress(p);
      b.hidden = true;
      result.innerHTML = '<strong>' + esc(t('labelScore', { n: good, m: d.parts.length })) + '</strong> ' +
        '<button type="button" class="btn ghost small" data-act="retry-labels">' + icon('refresh') + esc(t('tryAgain')) + '</button>';
    });
    setupLabels();
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
  // Renders a quiz into el, one question at a time with Back / Next. At the end every question is shown
  // again with its marking, under the result box.
  function runQuiz(el, questions, opts) {
    var attempt = buildAttempt(questions), finished = false, cur = 0, total = attempt.length;
    el.innerHTML = (opts.intro || '') +
      '<div class="quiz-result" aria-live="polite"></div>' +
      '<form class="quiz paged" novalidate>' +
        '<div class="q-progress no-print"><span class="q-count"></span>' + progressBar(0) + '</div>' +
        questionsHTML(attempt, opts.prefix) +
        '<p class="form-msg q-msg" aria-live="polite"></p>' +
        '<div class="quiz-actions">' +
          '<button type="button" class="btn ghost" data-q="back">' + icon('prev', 'flip') + esc(t('previous')) + '</button>' +
          '<button type="button" class="btn" data-q="next">' + esc(t('next')) + icon('next', 'flip') + '</button>' +
          '<button type="submit" class="btn" data-q="submit">' + icon('check') + esc(t(opts.submitKey || 'checkAnswers')) + '</button>' +
        '</div></form>';
    var form = el.querySelector('form'), out = el.querySelector('.quiz-result');
    var sets = [].slice.call(form.querySelectorAll('fieldset.q')), msg = form.querySelector('.q-msg');
    var back = form.querySelector('[data-q="back"]'), next = form.querySelector('[data-q="next"]'), submit = form.querySelector('[data-q="submit"]');
    function answered(n) {
      var sel = sets[n].querySelectorAll('select');
      if (sel.length) return [].every.call(sel, function (s) { return s.value !== ''; });
      return !!sets[n].querySelector('input:checked');
    }
    function show(n) {
      cur = n;
      sets.forEach(function (fs, i) { fs.hidden = i !== n; });
      form.querySelector('.q-count').textContent = t('questionOf', { n: n + 1, m: total });
      form.querySelector('.q-progress .pbar span').style.width = Math.round(100 * (n + 1) / total) + '%';
      back.disabled = n === 0;
      next.hidden = n === total - 1;
      submit.hidden = n !== total - 1;
      msg.textContent = '';
    }
    function needAnswer() {
      if (answered(cur)) return false;
      msg.textContent = t(sets[cur].querySelector('select') ? 'matchAll' : 'pickAnswer');
      return true;
    }
    function finish() {
      if (finished) return;
      finished = true;
      sets.forEach(function (fs) { fs.hidden = false; });
      form.querySelector('.q-progress').remove();
      form.querySelector('.quiz-actions').remove();
      msg.remove();
      sets[0].insertAdjacentHTML('beforebegin', '<h2 class="review-h">' + esc(t('reviewAnswers')) + '</h2>');
      var r = markAttempt(form, attempt, opts.prefix);
      opts.onDone(r, out);
      out.scrollIntoView();
    }
    back.addEventListener('click', function () { if (cur > 0) show(cur - 1); });
    next.addEventListener('click', function () {
      if (needAnswer()) return;
      show(cur + 1);
      sets[cur].scrollIntoView({ block: 'nearest' });
    });
    form.addEventListener('change', function () { msg.textContent = ''; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (needAnswer()) return;
      finish();
    });
    show(0);
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
          refreshStatus(ch);
          track('quiz', { chapter_key: ch._key, score: r.score, total: r.total });
          var msg = pct >= 80 ? t('resultGreat') : pct >= 50 ? t('resultGood') : t('resultTry');
          out.innerHTML = '<div class="card result">' +
            '<h2>' + esc(t('yourScore')) + ': ' + r.score + ' / ' + r.total + ' (' + pct + '%)</h2>' +
            '<p>' + stars(pct) + '</p>' + guide(msg) +
            (rec.gained ? '<p class="points">' + icon('star') + ' ' + esc(t('pointsEarned', { n: rec.gained })) + '</p>' : '') +
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

  /* ---------- worksheet: filled in on the screen (draft saved on this device), then submitted; still printable ---------- */

  function timeNow() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function sameWord(a, b) { return norm(a) !== '' && norm(a) === norm(b); }

  function tabWorksheet(el, ch, c, s) {
    var w = ch.worksheet, n = w.match.length, key = ch._key, dkey = 'wsdraft.' + key;
    var bank = w.blanks.map(function (b) { return L(b.answer); }).sort();
    var order = w.match.map(function (m, i) { return (i + 2) % n; }); // column B is shuffled the same way every time
    el.innerHTML =
      '<div class="no-print ws-tools">' + guide(t('wsDigitalHelp')) +
        '<div class="btn-row"><button type="button" class="btn ghost" data-act="print">' + icon('printer') + esc(t('printMine')) + '</button>' +
        '<button type="button" class="btn ghost" data-act="print-blank">' + icon('printer') + esc(t('printBlank')) + '</button></div>' +
        '<p class="ws-saved muted small" aria-live="polite"></p></div>' +
      '<form class="worksheet ws-live" autocomplete="off" novalidate>' +
        '<header class="ws-head"><p class="ws-site">' + esc(t('siteName')) + '</p>' +
          '<h2>' + esc(t('worksheet')) + ': ' + esc(L(ch.title)) + '</h2>' +
          '<p>' + esc(L(c.name)) + ' · ' + esc(L(s.name)) + ' · ' + esc(t('chapterN', { n: ch.number })) + '</p>' +
          '<div class="ws-fields"><label>' + esc(t('wsName')) + ': <input type="text" name="name" maxlength="40"></label>' +
          '<label>' + esc(t('wsDate')) + ': <input type="text" name="date" maxlength="20"></label></div></header>' +
        '<section><h3>' + esc(t('wsBlanks')) + '</h3>' +
          '<p class="ws-bank"><b>' + esc(t('wsBank')) + '</b> ' + bank.map(esc).join(' · ') + '</p>' +
          '<ol>' + w.blanks.map(function (b, i) {
            return '<li class="ws-item" data-k="b' + i + '">' + esc(L(b.text)).replace('____', '<input type="text" class="ws-blank" name="b' + i + '" aria-label="' + (i + 1) + '">') + '</li>';
          }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsTF')) + '</h3><ol>' + w.tf.map(function (x, i) {
          return '<li class="ws-item" data-k="t' + i + '"><span>' + esc(L(x.text)) + '</span><span class="tf-pick">' +
            '<label><input type="radio" name="t' + i + '" value="true"> ' + esc(t('tfTrue')) + '</label>' +
            '<label><input type="radio" name="t' + i + '" value="false"> ' + esc(t('tfFalse')) + '</label></span></li>';
        }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsMatch')) + '</h3><div class="table-wrap"><table class="ws-match"><thead><tr><th>' + esc(t('colA')) + '</th><th>' + esc(t('colB')) + '</th></tr></thead><tbody>' +
          w.match.map(function (m, i) {
            return '<tr class="ws-item" data-k="m' + i + '"><td>' + (i + 1) + '. ' + esc(L(m.a)) + '</td><td><select name="m' + i + '" aria-label="' + esc(L(m.a)) + '">' +
              '<option value="">' + esc(t('choose')) + '</option>' + order.map(function (j) { return '<option value="' + j + '">' + esc(L(w.match[j].b)) + '</option>'; }).join('') +
              '</select></td></tr>';
          }).join('') + '</tbody></table></div></section>' +
        '<section><h3>' + esc(t('wsShort')) + '</h3><ol>' + w.short.map(function (x, i) {
          return '<li class="ws-item" data-k="s' + i + '"><span>' + esc(L(x.q)) + '</span>' +
            '<textarea name="s' + i + '" rows="3" placeholder="' + esc(t('typeAnswer')) + '"></textarea>' +
            '<p class="model" hidden><b>' + esc(t('modelAnswer')) + ':</b> ' + esc(L(x.a)) + '</p></li>';
        }).join('') + '</ol></section>' +
        '<section><h3>' + esc(t('wsDraw')) + '</h3><p>' + esc(L(w.draw)) + '</p>' +
          '<div class="draw-box"><canvas class="draw" width="900" height="380" aria-label="' + esc(t('wsDraw')) + '"></canvas></div>' +
          '<p class="no-print draw-tools"><span class="muted small">' + esc(t('drawHere')) + '</span> <button type="button" class="btn ghost small" data-act="clear">' + icon('refresh') + esc(t('clearDraw')) + '</button></p></section>' +
        '<div class="ws-submit no-print"><button type="submit" class="btn big">' + icon('save') + esc(t('submitWs')) + '</button>' +
          '<div class="ws-result" aria-live="polite"></div></div>' +
      '</form>' +
      '<details class="card answer-key no-print"><summary>' + esc(t('answerKey')) + '</summary>' +
        '<h4>' + esc(t('wsBlanks')) + '</h4><ol>' + w.blanks.map(function (b) { return '<li>' + esc(L(b.answer)) + '</li>'; }).join('') + '</ol>' +
        '<h4>' + esc(t('wsTF')) + '</h4><ol>' + w.tf.map(function (x) { return '<li>' + (x.answer ? '✔' : '✘') + '</li>'; }).join('') + '</ol>' +
        '<h4>' + esc(t('wsMatch')) + '</h4><ol>' + w.match.map(function (m) { return '<li>' + esc(L(m.a)) + ' → ' + esc(L(m.b)) + '</li>'; }).join('') + '</ol>' +
        '<h4>' + esc(t('wsShort')) + '</h4><ol>' + w.short.map(function (x) { return '<li>' + esc(L(x.a)) + '</li>'; }).join('') + '</ol>' +
      '</details>';

    var form = el.querySelector('form'), saved = el.querySelector('.ws-saved'), resultBox = el.querySelector('.ws-result');
    var canvas = form.querySelector('canvas'), ctx = canvas.getContext('2d'), drawing = null;
    function fld(nm) { return form.elements.namedItem(nm); }

    function collect() {
      var d = { name: fld('name').value, date: fld('date').value, b: [], t: [], m: [], s: [], draw: canvas.getAttribute('data-has') ? canvas.toDataURL('image/png') : '' };
      w.blanks.forEach(function (x, i) { d.b.push(fld('b' + i).value); });
      w.tf.forEach(function (x, i) { var c2 = form.querySelector('input[name="t' + i + '"]:checked'); d.t.push(c2 ? c2.value : ''); });
      w.match.forEach(function (x, i) { d.m.push(fld('m' + i).value); });
      w.short.forEach(function (x, i) { d.s.push(fld('s' + i).value); });
      return d;
    }
    function fill(d) {
      fld('name').value = d.name || '';
      fld('date').value = d.date || todayStr();
      (d.b || []).forEach(function (v, i) { if (fld('b' + i)) fld('b' + i).value = v; });
      (d.t || []).forEach(function (v, i) { var r = v && form.querySelector('input[name="t' + i + '"][value="' + v + '"]'); if (r) r.checked = true; });
      (d.m || []).forEach(function (v, i) { if (fld('m' + i)) fld('m' + i).value = v; });
      (d.s || []).forEach(function (v, i) { if (fld('s' + i)) fld('s' + i).value = v; });
      if (d.draw) {
        var img = new Image();
        img.onload = function () { ctx.drawImage(img, 0, 0); canvas.setAttribute('data-has', '1'); };
        img.src = d.draw;
      }
    }
    var timer = null;
    function saveDraft() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        store.set(dkey, collect());
        saved.textContent = t('draftSaved', { time: timeNow() });
        refreshStatus(ch);
      }, 400);
    }

    // drawing box: finger, pen or mouse
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
    }
    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#17231a';
    canvas.addEventListener('pointerdown', function (e) {
      if (form.classList.contains('locked')) return;
      drawing = pos(e);
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p2 = pos(e);
      ctx.beginPath(); ctx.moveTo(drawing[0], drawing[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      drawing = p2;
      canvas.setAttribute('data-has', '1');
    });
    function stop() { if (drawing) { drawing = null; saveDraft(); } }
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);

    function lock(on) {
      form.classList.toggle('locked', on);
      [].forEach.call(form.querySelectorAll('input, select, textarea'), function (x) { x.disabled = on; });
    }
    function clearMarks() {
      form.querySelectorAll('.ws-item').forEach(function (it) {
        it.classList.remove('is-right', 'is-wrong');
        var fix = it.querySelector('.ws-fix'); if (fix) fix.remove();
      });
      form.querySelectorAll('.model').forEach(function (m) { m.hidden = true; });
    }
    // Marks the parts that have one right answer; short answers show the model answer for self-checking.
    function mark(d) {
      clearMarks();
      var good = 0, total = 0;
      function res(k, ok, right) {
        var it = form.querySelector('[data-k="' + k + '"]');
        total++; if (ok) good++;
        it.classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) it.insertAdjacentHTML('beforeend', '<small class="ws-fix">' + icon('check') + ' ' + esc(right) + '</small>');
      }
      w.blanks.forEach(function (b, i) { res('b' + i, LANGS.some(function (l) { return sameWord(d.b[i], b.answer[l]); }), L(b.answer)); });
      w.tf.forEach(function (x, i) { res('t' + i, d.t[i] === String(x.answer), t(x.answer ? 'tfTrue' : 'tfFalse')); });
      w.match.forEach(function (m, i) { res('m' + i, d.m[i] === String(i), L(m.b)); });
      form.querySelectorAll('.model').forEach(function (m) { m.hidden = false; });
      return { score: good, total: total };
    }
    function showResult(r) {
      resultBox.innerHTML = '<div class="card note ok"><p><strong>' + icon('check') + ' ' + esc(t('wsDoneMsg')) + '</strong></p>' +
        '<p>' + esc(t('wsScore', { n: r.score, m: r.total })) + '</p>' +
        '<button type="button" class="btn ghost small" data-act="edit">' + icon('pencil') + esc(t('editAgain')) + '</button></div>';
    }

    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = collect();
      var empty = d.b.concat(d.t, d.m, d.s).filter(function (v) { return !String(v).trim(); }).length;
      if (empty && !window.confirm(t('missingAnswers', { n: empty }))) return;
      store.set(dkey, d);
      var r = mark(d), p = getProgress(), first = !p.ws[key];
      p.ws[key] = { score: r.score, total: r.total, at: todayStr() };
      if (first) p.points += 5;
      var fresh = evaluateBadges(p);
      saveProgress(p);
      lock(true);
      showResult(r);
      if (first) resultBox.insertAdjacentHTML('beforeend', '<p class="points">' + icon('star') + ' ' + esc(t('pointsEarned', { n: 5 })) + '</p>' + newBadgesHTML(fresh));
      refreshStatus(ch);
      resultBox.scrollIntoView({ block: 'center' });
    });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'clear') { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.removeAttribute('data-has'); saveDraft(); }
      if (act === 'edit') { lock(false); clearMarks(); resultBox.innerHTML = ''; }
      if (act === 'print' || act === 'print-blank') {
        track('worksheet', { chapter_key: key });
        if (act === 'print-blank') document.body.classList.add('print-blank');
        window.print();
        document.body.classList.remove('print-blank');
      }
    });

    var draft = store.get(dkey, null);
    fill(draft || {});
    if (draft) saved.textContent = t('draftSaved', { time: '✓' });
    var done = getProgress().ws[key];
    if (done && draft) { lock(true); showResult(mark(draft)); }
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
        (gained ? '<p class="points">' + icon('star') + ' ' + esc(t('pointsEarned', { n: gained })) + '</p>' : '') + newBadgesHTML(fresh) +
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

  // Experiment, step by step: get ready (safety + tick the things needed), guess, do each step, write what you saw, result.
  // Notes are kept on this device; finishing marks the experiment as done.
  function tabExperiment(el, ch) {
    var x = ch.experiment, key = ch._key, dkey = 'expdraft.' + key, S = x.steps.length;
    var OBSERVE = 2 + S, RESULT = 3 + S;
    var d = store.get(dkey, null) || { stage: getProgress().exp[key] ? RESULT : 0, have: [], predict: '', observe: '' };
    var pic = EXP_PICTURES.indexOf(ch.id) >= 0 ? '<img class="exp-pic" src="/img/exp/' + ch.id + '.svg" width="600" height="320" alt="' + esc(L(x.title)) + '">' : '';
    var phases = [['expReady', 0], ['expYourGuess', 1], ['steps', 2], ['expYourObs', OBSERVE], ['whatLearn', RESULT]];

    function save() { store.set(dkey, d); refreshStatus(ch); }
    function stepper() {
      return '<ol class="exp-steps no-print">' + phases.map(function (ph, i) {
        var from = ph[1], to = i < phases.length - 1 ? phases[i + 1][1] : RESULT + 1;
        var cls = d.stage >= to ? 'done' : d.stage >= from ? 'on' : '';
        return '<li class="' + cls + '"><span class="n">' + (i + 1) + '</span><span>' + esc(t(ph[0])) + '</span></li>';
      }).join('') + '</ol>';
    }
    function nav(backTo, nextLabel, nextAct) {
      return '<div class="part-nav">' +
        (backTo != null ? '<button type="button" class="btn ghost" data-stage="' + backTo + '">' + icon('prev', 'flip') + esc(t('previous')) + '</button>' : '<span></span>') +
        '<button type="button" class="btn" data-act="' + nextAct + '">' + esc(nextLabel) + icon('next', 'flip') + '</button></div>';
    }
    function draw() {
      var body = '';
      if (d.stage === 0) {
        body = '<div class="note warn"><h3>' + icon('alert') + ' ' + esc(t('safety')) + '</h3><p>' + esc(L(x.safety)) + '</p></div>' + pic +
          '<h3>' + icon('list') + ' ' + esc(t('materials')) + '</h3><p class="muted">' + esc(t('expHave')) + '</p>' +
          '<ul class="checklist">' + x.materials.map(function (m, i) {
            return '<li><label><input type="checkbox" data-have="' + i + '"' + (d.have.indexOf(i) >= 0 ? ' checked' : '') + '> ' + esc(L(m)) + '</label></li>';
          }).join('') + '</ul>' + nav(null, t('expStart'), 'go');
      } else if (d.stage === 1) {
        body = '<h3>' + icon('bulb') + ' ' + esc(t('expPredict')) + '</h3><p class="muted">' + esc(t('expPredictHelp')) + '</p>' +
          '<textarea class="exp-note" data-note="predict" rows="4" placeholder="' + esc(t('writeHere')) + '">' + esc(d.predict) + '</textarea>' + nav(0, t('next'), 'go');
      } else if (d.stage < OBSERVE) {
        var k = d.stage - 2;
        body = '<p class="eyebrow">' + esc(t('expStepOf', { n: k + 1, m: S })) + '</p>' +
          '<div class="exp-now"><span class="exp-num">' + (k + 1) + '</span><p>' + esc(L(x.steps[k])) + '</p></div>' +
          '<ol class="steps-mini">' + x.steps.map(function (st, i) { return '<li class="' + (i < k ? 'done' : i === k ? 'on' : '') + '">' + esc(L(st)) + '</li>'; }).join('') + '</ol>' +
          nav(d.stage - 1, t('expStepDone'), 'go');
      } else if (d.stage === OBSERVE) {
        body = '<h3>' + icon('eye') + ' ' + esc(t('expObserve')) + '</h3><p class="muted">' + esc(t('expObserveHelp')) + '</p>' +
          '<textarea class="exp-note" data-note="observe" rows="4" placeholder="' + esc(t('writeHere')) + '">' + esc(d.observe) + '</textarea>' +
          nav(d.stage - 1, t('expFinish'), 'finish');
      } else {
        body = '<div class="note ok"><p><strong>' + icon('check') + ' ' + esc(t('expDoneMsg')) + '</strong></p></div>' + pic +
          '<div class="note"><h3>' + icon('bulb') + ' ' + esc(t('whatLearn')) + '</h3><p>' + esc(L(x.learn)) + '</p></div>' +
          (d.predict ? '<div class="exp-saved"><h4>' + esc(t('expYourGuess')) + '</h4><p>' + esc(d.predict) + '</p></div>' : '') +
          (d.observe ? '<div class="exp-saved"><h4>' + esc(t('expYourObs')) + '</h4><p>' + esc(d.observe) + '</p></div>' : '') +
          '<p><button type="button" class="btn ghost" data-act="again">' + icon('refresh') + esc(t('expAgain')) + '</button></p>';
      }
      el.innerHTML = '<section class="card exp"><h2>' + icon('experiment') + ' ' + esc(L(x.title)) + '</h2>' + stepper() + '<div class="exp-body">' + body + '</div></section>';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-stage], [data-act]');
      if (!b) return;
      if (b.hasAttribute('data-stage')) d.stage = +b.getAttribute('data-stage');
      else if (b.getAttribute('data-act') === 'go') d.stage++;
      else if (b.getAttribute('data-act') === 'again') d = { stage: 0, have: [], predict: '', observe: '' };
      else if (b.getAttribute('data-act') === 'finish') {
        d.stage = RESULT;
        var p = getProgress(), first = !p.exp[key];
        p.exp[key] = { at: todayStr() };
        if (first) p.points += 5;
        evaluateBadges(p);
        saveProgress(p);
      }
      save();
      draw();
      el.scrollIntoView({ block: 'start' });
    });
    el.addEventListener('change', function (e) {
      var h = e.target.getAttribute('data-have');
      if (h == null) return;
      d.have = d.have.filter(function (v) { return v !== +h; });
      if (e.target.checked) d.have.push(+h);
      save();
    });
    el.addEventListener('input', function (e) {
      var n2 = e.target.getAttribute('data-note');
      if (n2) { d[n2] = e.target.value; store.set(dkey, d); }
    });
    draw();
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
        '<h1>' + icon('words') + ' ' + esc(t('glossaryTitle')) + '</h1><p>' + esc(t('glossaryIntro')) + '</p>' +
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
        '<h1>' + icon('search') + ' ' + esc(t('search')) + '</h1>' + searchForm(q) +
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
        '<h1>' + icon('trophy') + ' ' + esc(t('compTitle')) + '</h1>' +
        '<p>' + esc(t('compIntro', { n: COMP_QUESTIONS, m: COMP_SECONDS / 60 })) + '</p>' +
        '<form class="card nick-form">' + nickField(p.nick) +
          '<label class="field"><span>' + esc(t('city')) + '</span>' + citySelect('city', p.city, 'cityNone') + '</label>' +
          '<button class="btn big" type="submit">' + esc(t('startComp')) + '</button> <span class="form-msg" aria-live="polite"></span></form>' +
        '<p><a href="/leaderboard">' + icon('medal') + ' ' + esc(t('leaderboard')) + '</a></p>';
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
    main.innerHTML = '<h1>' + icon('trophy') + ' ' + esc(t('compTitle')) + '</h1>' +
      '<div class="timer no-print" role="timer">' + icon('clock') + ' ' + esc(t('timeLeft')) + ': <b id="clock">' + fmtTime(left) + '</b></div>' +
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
        out.innerHTML = (timedOut ? '<p class="result-line bad">' + icon('clock') + ' ' + esc(t('timeUp')) + '</p>' : '') +
          '<div class="certificate">' +
            '<p class="cert-site">' + esc(t('siteName')) + '</p>' +
            '<h2>' + esc(t('certHead')) + '</h2>' +
            '<p class="cert-text">' + esc(t('certText', { name: nick })) + '</p>' +
            '<p class="cert-score">' + esc(t('score')) + ': <b>' + r.score + ' / ' + r.total + '</b> · ' + esc(t('timeTaken')) + ': <b>' + fmtTime(secs) + '</b></p>' +
            '<p class="muted">' + esc(t('date')) + ': ' + todayStr() + '</p>' +
            '<p class="cert-org">The Professional Educator · EduPulse Nexus</p>' +
          '</div>' +
          '<div class="no-print">' +
            '<p class="points">' + icon('star') + ' ' + esc(t('pointsEarned', { n: r.score })) + '</p>' + newBadgesHTML(fresh) +
            '<div class="next-row"><button type="button" class="btn" data-act="cert">' + icon('printer') + ' ' + esc(t('printCert')) + '</button>' +
            '<a class="btn ghost" href="/competition">' + esc(t('newComp')) + '</a>' +
            '<a class="btn ghost" href="/leaderboard">' + icon('medal') + ' ' + esc(t('leaderboard')) + '</a></div>' +
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
      var medals = [1, 2, 3].map(function (n) { return '<span class="rank r' + n + '">' + n + '</span>'; });
      main.innerHTML = crumbs([['/', t('home')], ['', t('leaderboard')]]) +
        '<h1>' + icon('medal') + ' ' + esc(t('leaderboard')) + '</h1><p class="muted">' + esc(t(res.shared ? 'lbNoteShared' : 'lbNote')) + '</p>' +
        '<p><label class="field"><span>' + esc(t('city')) + '</span>' + citySelect('lbcity', city, 'allSindh') + '</label></p>' +
        (res.rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('rank')) + '</th><th>' + esc(t('nickname')) + '</th><th>' + esc(t('score')) + '</th><th>' + esc(t('timeTaken')) + '</th><th>' + esc(t('city')) + '</th><th>' + esc(t('date')) + '</th></tr></thead><tbody>' +
          res.rows.map(function (r, i) {
            return '<tr><td>' + (medals[i] || i + 1) + '</td><td>' + esc(r.nick) + '</td><td>' + r.score + ' / ' + r.total + '</td><td>' + fmtTime(r.secs) + '</td><td>' + esc(cityName(r.city)) + '</td><td>' + esc(r.date) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<p>' + esc(t('noScores')) + '</p>') +
        '<p><a class="btn" href="/competition">' + icon('trophy') + ' ' + esc(t('startComp')) + '</a></p>';
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
        '<h1>' + icon('star') + ' ' + esc(t('progress')) + '</h1>' +
        '<form class="card nick-form">' + nickField(p.nick) + '<button class="btn" type="submit">' + esc(t('save')) + '</button> <span class="form-msg" aria-live="polite"></span></form>' +
        '<div class="stats">' +
          '<div class="card stat"><span class="stat-num">' + p.points + '</span><span>' + esc(t('points')) + '</span></div>' +
          '<div class="card stat"><span class="stat-num">' + streak + '</span><span>' + icon('flame') + ' ' + esc(t('dayStreak')) + '</span></div>' +
          '<div class="card stat"><span class="stat-num">' + p.badges.length + '</span><span>' + icon('medal') + ' ' + esc(t('badges')) + '</span></div>' +
        '</div>' +
        '<h2>' + esc(t('badges')) + '</h2><div class="grid badges">' + allBadges().map(function (b) {
          var got = p.badges.indexOf(b.id) >= 0;
          return '<div class="card badge' + (got ? '' : ' locked') + '"><span class="badge-icon" aria-hidden="true">' + (got ? b.icon : icon('lock')) + '</span><strong>' + esc(b.name) + '</strong><small>' + esc(got ? b.desc : t('locked') + ' — ' + b.desc) + '</small></div>';
        }).join('') + '</div>' +
        '<h2>' + esc(t('chapterScores')) + '</h2><div class="scores">' + chs.map(function (ch) {
          return '<div class="card score-row"><a class="score-title" href="' + chUrl(ch) + '">' + thumb(ch) + '<span>' + esc(chLabel(ch)) + '</span></a>' +
            statusHTML(ch, true) + '</div>';
        }).join('') + '</div>' +
        '<h2>' + esc(t('weakTitle')) + '</h2>' + (weakRows.length ? '<ul>' + weakRows.join('') + '</ul>' : '<p>' + esc(t('noWeak')) + '</p>') +
        '<p class="muted">' + icon('lock') + ' ' + esc(t('deviceNote')) + '</p>' +
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
        '<h1>' + icon('users') + ' ' + esc(t('teachers')) + '</h1><p>' + esc(t('teachersIntro')) + '</p>' +
        '<ul class="tips">' + ['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map(function (k) { return '<li>' + esc(t(k)) + '</li>'; }).join('') + '</ul>' +
        '<div class="table-wrap"><table class="table"><tbody>' + chs.map(function (ch) {
          return '<tr><td>' + ch.icon + ' ' + esc(chLabel(ch)) + '</td>' +
            '<td><a href="' + chUrl(ch) + '">' + esc(t('tab_lesson')) + '</a></td>' +
            '<td><a href="' + chUrl(ch, 'quiz') + '">' + esc(t('tab_quiz')) + '</a></td>' +
            '<td><a href="' + chUrl(ch, 'worksheet') + '">' + icon('worksheet') + ' ' + esc(t('tab_worksheet')) + '</a></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="card note"><p>' + icon('lock') + ' ' + esc(t('staffIntro')) + '</p><p><a class="btn" href="/admin">' + esc(t('staffLogin')) + '</a></p></div>';
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
