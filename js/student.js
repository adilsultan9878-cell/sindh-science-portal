/* Student account: a username and a 4-6 digit PIN (no email, no phone number). When a student is signed in,
   everything the site keeps on the phone (progress, points, badges, worksheet and experiment drafts) is also
   saved to their account, so it comes back on any other phone or computer after signing in there.
   Loaded on every page of the main site; Student.mount(el) draws the sign-in page (/login/).
   Database: student_signup / student_login / student_get / student_save / student_logout (token based). */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var KEY = 'ssp1.student';
  // settings of this phone, caches of site files and waiting uploads are not part of the student's record
  var SKIP = { 'ssp1.lang': 1, 'ssp1.zoom': 1, 'ssp1.student': 1, 'ssp1.studentSynced': 1, 'ssp1.outbox': 1, 'ssp1.classOutbox': 1,
    'ssp1.starsOutbox': 1, 'ssp1.starsCache': 1, 'ssp1.badges': 1, 'ssp1.schools': 1, 'ssp1.teacherClasses': 1 };
  function skip(k) { return !k || k.indexOf('ssp1.') !== 0 || SKIP[k] || k.indexOf('ssp1.content.') === 0; }

  var TEXT = {
    title: { sd: 'شاگرد لاگ ان', ur: 'طالب علم لاگ ان', en: 'Student login' },
    first: { sd: 'سائيٽ استعمال ڪرڻ لاءِ پهريان لاگ ان ڪريو. نئين آهيو؟ "نئون اڪائونٽ" دٻايو.', ur: 'سائٹ استعمال کرنے کے لیے پہلے لاگ ان کریں۔ نئے ہیں؟ "نیا اکاؤنٹ" دبائیں۔', en: 'Please log in first to use the site. New here? Tap "New account".' },
    intro: {
      sd: 'لاگ ان ڪريو ته توهان جي پيش رفت، پوائنٽس ۽ بيج محفوظ رهندا، ۽ ڪنهن به فون يا ڪمپيوٽر تي واپس ملندا.',
      ur: 'لاگ ان کریں تو آپ کی پیش رفت، پوائنٹس اور بیج محفوظ رہیں گے، اور کسی بھی فون یا کمپیوٹر پر واپس مل جائیں گے۔',
      en: 'Log in and your progress, points and badges are saved, and come back on any phone or computer.'
    },
    login: { sd: 'لاگ ان', ur: 'لاگ ان', en: 'Log in' },
    signup: { sd: 'نئون اڪائونٽ', ur: 'نیا اکاؤنٹ', en: 'New account' },
    username: { sd: 'يوزر نالو', ur: 'یوزر نیم', en: 'Username' },
    userHelp: { sd: '3 کان 20 انگريزي اکر يا انگ، مثال: ali_5b', ur: '3 سے 20 انگریزی حروف یا ہندسے، مثال: ali_5b', en: '3 to 20 English letters or numbers, e.g. ali_5b' },
    pin: { sd: 'پن (4 کان 6 انگ)', ur: 'پن (4 سے 6 ہندسے)', en: 'PIN (4 to 6 digits)' },
    pinHelp: { sd: 'پن ڪنهن کي نه ٻڌايو. استاد يا گهر وارن وٽ لکي رکو.', ur: 'پن کسی کو نہ بتائیں۔ استاد یا گھر والوں کے پاس لکھ کر رکھیں۔', en: 'Keep your PIN secret. Ask a parent or teacher to write it down.' },
    name: { sd: 'پهريون نالو', ur: 'پہلا نام', en: 'First name' },
    nameHelp: { sd: 'رڳو پهريون نالو، فون نمبر نه.', ur: 'صرف پہلا نام، فون نمبر نہیں۔', en: 'First name only, no phone number.' },
    create: { sd: 'اڪائونٽ ٺاهيو', ur: 'اکاؤنٹ بنائیں', en: 'Create account' },
    hello: { sd: 'السلام عليڪم', ur: 'السلام علیکم', en: 'Hello' },
    saved: { sd: 'توهان جي پيش رفت توهان جي اڪائونٽ ۾ محفوظ ٿي رهي آهي.', ur: 'آپ کی پیش رفت آپ کے اکاؤنٹ میں محفوظ ہو رہی ہے۔', en: 'Your progress is being saved to your account.' },
    lastSaved: { sd: 'آخري ڀيرو محفوظ:', ur: 'آخری بار محفوظ:', en: 'Last saved:' },
    points: { sd: 'پوائنٽس', ur: 'پوائنٹس', en: 'Points' },
    quizzes: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quizzes' },
    lessons: { sd: 'سبق', ur: 'اسباق', en: 'Lessons' },
    badges: { sd: 'بيج', ur: 'بیج', en: 'Badges' },
    myProgress: { sd: 'منهنجي پيش رفت ڏسو', ur: 'میری پیش رفت دیکھیں', en: 'See my progress' },
    classHint: {
      sd: 'استاد کي توهان جا نتيجا ڏسڻا آهن؟ "منهنجي پيش رفت" تي استاد جو ڪلاس ڪوڊ لکو.',
      ur: 'استاد آپ کے نتائج دیکھیں؟ "میری پیش رفت" پر استاد کا کلاس کوڈ لکھیں۔',
      en: 'Want your teacher to see your results? Type your teacher\'s class code on "My progress".'
    },
    logout: { sd: 'لاگ آئوٽ', ur: 'لاگ آؤٹ', en: 'Log out' },
    logoutNote: { sd: 'لاگ آئوٽ کان پوءِ هن فون تان توهان جي پيش رفت هٽي ويندي، پر اڪائونٽ ۾ محفوظ رهندي.', ur: 'لاگ آؤٹ کے بعد اس فون سے آپ کی پیش رفت ہٹ جائے گی، لیکن اکاؤنٹ میں محفوظ رہے گی۔', en: 'After logging out your progress is removed from this phone, but stays in your account.' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    err_wrong: { sd: 'يوزر نالو يا پن غلط آهي.', ur: 'یوزر نیم یا پن غلط ہے۔', en: 'Wrong username or PIN.' },
    err_locked: { sd: 'گهڻيون غلط ڪوششون. 15 منٽن کان پوءِ ٻيهر ڪوشش ڪريو.', ur: 'بہت زیادہ غلط کوششیں۔ 15 منٹ بعد دوبارہ کوشش کریں۔', en: 'Too many wrong tries. Try again in 15 minutes.' },
    err_taken: { sd: 'هي يوزر نالو اڳ ۾ ئي ورتل آهي. ٻيو چونڊيو.', ur: 'یہ یوزر نیم پہلے سے لیا جا چکا ہے۔ کوئی اور چنیں۔', en: 'That username is taken. Choose another.' },
    err_bad_username: { sd: 'يوزر نالو 3 کان 20 انگريزي اکر يا انگ هجي.', ur: 'یوزر نیم 3 سے 20 انگریزی حروف یا ہندسے ہو۔', en: 'Username must be 3 to 20 English letters or numbers.' },
    err_bad_pin: { sd: 'پن ۾ 4 کان 6 انگ هجن.', ur: 'پن میں 4 سے 6 ہندسے ہوں۔', en: 'The PIN must be 4 to 6 digits.' },
    err_bad_name: { sd: 'پنهنجو پهريون نالو لکو.', ur: 'اپنا پہلا نام لکھیں۔', en: 'Write your first name.' },
    err_offline: { sd: 'لاگ ان لاءِ انٽرنيٽ گهرجي.', ur: 'لاگ ان کے لیے انٹرنیٹ چاہیے۔', en: 'You need the internet to log in.' },
    err_other: { sd: 'ڪجهه غلط ٿيو. ٿوري دير بعد ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔', en: 'Something went wrong. Please try again a little later.' }
  };

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return TEXT.title[l] ? l : 'sd'; } catch (e) { return 'sd'; }
  }
  function T(k) { var o = TEXT[k]; return o ? (o[lang()] || o.en) : k; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  function rpc(fn, args, keepalive) {
    if (!CFG) return Promise.reject(new Error('no config'));
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', keepalive: !!keepalive,
      headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    }).then(function (r) {
      return r.text().then(function (txt) {
        var d = null;
        try { d = txt ? JSON.parse(txt) : null; } catch (e) { d = txt; }
        if (!r.ok) { var err = new Error((d && d.message) || ('Error ' + r.status)); err.status = r.status; throw err; }
        return d;
      });
    });
  }

  function session() { return load(KEY, null); }
  // the page the student wanted before being sent to log in (only paths on this site)
  function next() {
    var n = new URLSearchParams(location.search).get('next') || '';
    return /^\/(?![\/\\])/.test(n) && !/^\/login/.test(n) ? n : '';
  }

  /* ---------- what is saved: every ssp1.* key the site keeps on this phone ---------- */

  function snapshot() {
    var keys = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!skip(k)) keys[k] = localStorage.getItem(k);
      }
    } catch (e) { /* storage blocked */ }
    return { v: 1, keys: keys };
  }
  // Joins two copies of the same record: numbers keep the larger value, lists keep every item, objects join key by key.
  function merge(a, b) {
    if (a == null) return b;
    if (b == null) return a;
    if (Array.isArray(a) && Array.isArray(b)) {
      var seen = {}, out = [];
      a.concat(b).forEach(function (x) { var s = JSON.stringify(x); if (!seen[s]) { seen[s] = 1; out.push(x); } });
      return out;
    }
    if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      var o = {};
      Object.keys(a).forEach(function (k) { o[k] = a[k]; });
      Object.keys(b).forEach(function (k) { o[k] = k in o ? merge(o[k], b[k]) : b[k]; });
      return o;
    }
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    return a; // text and the like: keep this phone's copy
  }
  // Puts the account's copy on this phone, joined with whatever the phone already has.
  function restore(data) {
    var keys = (data && data.keys) || {};
    Object.keys(keys).forEach(function (k) {
      if (skip(k)) return;
      var mine = null, theirs, raw = false;
      try { mine = JSON.parse(localStorage.getItem(k)); } catch (e) { mine = localStorage.getItem(k); }
      try { theirs = JSON.parse(keys[k]); } catch (e) { theirs = keys[k]; raw = true; }   // a value that was not saved as JSON
      var joined = mine == null ? theirs : merge(mine, theirs);
      try { localStorage.setItem(k, raw && typeof joined === 'string' ? joined : JSON.stringify(joined)); } catch (e) { /* full */ }
    });
  }

  /* ---------- saving in the background ---------- */

  var lastSent = '', busy = false;
  function push(keepalive) {
    var s = session();
    if (!s || !s.token || busy || navigator.onLine === false) return Promise.resolve();
    var snap = snapshot(), str = JSON.stringify(snap);
    if (str === lastSent) return Promise.resolve();
    busy = true;
    return rpc('student_save', { p_token: s.token, p_data: snap }, keepalive).then(function (at) {
      lastSent = str;
      var cur = session(); if (cur) { cur.savedAt = at || new Date().toISOString(); save(KEY, cur); }
    }).catch(function (e) {
      if (/signed_out/.test(e.message)) save(KEY, null);
    }).then(function () { busy = false; });
  }
  // Once per visit, bring in what was saved from another phone, then keep saving changes.
  function startSync() {
    var s = session();
    if (!s || !s.token) return;
    var fresh = false;
    try { fresh = sessionStorage.getItem('ssp1.studentPulled') === '1'; } catch (e) { /* ignore */ }
    var first = fresh ? Promise.resolve() : rpc('student_get', { p_token: s.token }).then(function (d) {
      restore(d && d.data);
      try { sessionStorage.setItem('ssp1.studentPulled', '1'); } catch (e) { /* ignore */ }
    }).catch(function (e) { if (/signed_out/.test(e.message)) save(KEY, null); });
    first.then(function () { push(); });
    setInterval(function () { push(); }, 20000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') push(true); });
    window.addEventListener('pagehide', function () { push(true); });
  }

  /* ---------- the sign-in page ---------- */

  function stats() {
    var p = load('ssp1.progress', {}) || {};
    function n(o) { return o && typeof o === 'object' ? Object.keys(o).length : 0; }
    return { points: p.points || 0, quizzes: n(p.quiz), lessons: n(p.lessons), badges: n(p.badges) };
  }
  function errText(e) {
    if (navigator.onLine === false) return T('err_offline');
    var m = (e && e.message) || '';
    var code = (m.match(/wrong|locked|taken|bad_username|bad_pin|bad_name/) || [])[0];
    return code ? T('err_' + code) : T('err_other');
  }

  function mount(el) {
    var mode = 'login';
    function draw() {
      var s = session();
      if (s && s.token) {
        var st = stats();
        el.innerHTML = '<section class="card stu-card"><h2>' + esc(T('hello')) + (lang() === 'en' ? ', ' : '، ') + esc(s.name) + '</h2>' +
          '<p class="muted ltr">@' + esc(s.username) + '</p><p>' + esc(T('saved')) + '</p>' +
          (s.savedAt ? '<p class="muted small">' + esc(T('lastSaved')) + ' <span class="ltr">' + esc(new Date(s.savedAt).toLocaleString()) + '</span></p>' : '') +
          '<div class="stu-stats">' +
            [['points', st.points], ['quizzes', st.quizzes], ['lessons', st.lessons], ['badges', st.badges]].map(function (x) {
              return '<div><b>' + x[1] + '</b><span>' + esc(T(x[0])) + '</span></div>';
            }).join('') + '</div>' +
          '<p class="btn-row"><a class="btn" href="/progress">' + esc(T('myProgress')) + '</a></p>' +
          '<p class="muted small">' + esc(T('classHint')) + '</p>' +
          '<hr><p class="muted small">' + esc(T('logoutNote')) + '</p><button type="button" class="btn ghost" data-act="logout">' + esc(T('logout')) + '</button></section>';
        return;
      }
      var up = mode === 'signup';
      el.innerHTML = '<section class="card stu-card"><h2>' + esc(T('title')) + '</h2>' + (next() ? '<p class="stu-first">' + esc(T('first')) + '</p>' : '') + '<p>' + esc(T('intro')) + '</p>' +
        '<div class="stu-tabs" role="tablist"><button type="button" role="tab" class="tab' + (up ? '' : ' on') + '" aria-selected="' + !up + '" data-mode="login">' + esc(T('login')) + '</button>' +
        '<button type="button" role="tab" class="tab' + (up ? ' on' : '') + '" aria-selected="' + up + '" data-mode="signup">' + esc(T('signup')) + '</button></div>' +
        '<form class="stu-form" novalidate>' +
          (up ? '<label>' + esc(T('name')) + '<input name="name" maxlength="30" autocomplete="off"><small class="muted">' + esc(T('nameHelp')) + '</small></label>' : '') +
          '<label>' + esc(T('username')) + '<input name="user" dir="ltr" maxlength="20" autocapitalize="none" autocomplete="username" spellcheck="false">' +
            (up ? '<small class="muted">' + esc(T('userHelp')) + '</small>' : '') + '</label>' +
          '<label>' + esc(T('pin')) + '<input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" dir="ltr" autocomplete="' + (up ? 'new-password' : 'current-password') + '">' +
            (up ? '<small class="muted">' + esc(T('pinHelp')) + '</small>' : '') + '</label>' +
          '<button type="submit" class="btn">' + esc(up ? T('create') : T('login')) + '</button>' +
          '<p class="form-msg" aria-live="polite"></p></form></section>';
    }
    el.addEventListener('click', function (e) {
      var m = e.target.closest('[data-mode]');
      if (m) { mode = m.getAttribute('data-mode'); draw(); return; }
      if (e.target.closest('[data-act="logout"]')) {
        var s = session();
        push().then(function () { return s && s.token ? rpc('student_logout', { p_token: s.token }).catch(function () {}) : null; }).then(function () {
          try {
            Object.keys(snapshot().keys).forEach(function (k) { localStorage.removeItem(k); });
            sessionStorage.removeItem('ssp1.studentPulled');
          } catch (err) { /* ignore */ }
          save(KEY, null); lastSent = ''; location.reload();   // the menu and every page now show the phone without the account
        });
      }
    });
    el.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, msg = f.querySelector('.form-msg');
      var user = f.user.value.trim().toLowerCase(), pin = f.pin.value.trim();
      msg.textContent = T('wait');
      var call = mode === 'signup'
        ? rpc('student_signup', { p_username: user, p_pin: pin, p_name: f.name.value.trim() })
        : rpc('student_login', { p_username: user, p_pin: pin });
      call.then(function (d) {
        if (!d || d.error || !d.token) { throw new Error((d && d.error) || 'other'); }
        restore(d.data);
        save(KEY, { token: d.token, username: d.username, name: d.name });
        try { sessionStorage.setItem('ssp1.studentPulled', '1'); } catch (err) { /* ignore */ }
        lastSent = '';
        return push();
      }).then(function () { if (next()) location.replace(next()); else location.reload(); }).catch(function (err) { msg.textContent = errText(err); });   // reload: the menu shows the name, pages show the joined progress
    });
    draw();
  }

  // Small card for the progress page: who is signed in, or a link to sign in.
  function status(el) {
    if (!el) return;
    var s = session();
    el.innerHTML = '<section class="card stu-status">' + (s && s.token
      ? '<p><strong>' + esc(s.name) + '</strong> <span class="muted ltr">@' + esc(s.username) + '</span></p><p class="muted small">' + esc(T('saved')) + '</p>'
      : '<p>' + esc(T('intro')) + '</p><p><a class="btn" href="/login">' + esc(T('login')) + '</a></p>') + '</section>';
  }
  function current() { var s = session(); return s && s.token ? { name: s.name, username: s.username } : null; }

  window.Student = { mount: mount, status: status, current: current, session: session, save: push, merge: merge };
  startSync();
})();
