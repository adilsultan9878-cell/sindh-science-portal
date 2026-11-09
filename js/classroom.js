/* Class code for students. A student types the class code their teacher gave them (on "My progress");
   after that their quiz, worksheet, experiment, game and competition results also go to that teacher.
   app.js calls Classroom.track(row) from track(), Classroom.report(...) when a worksheet is submitted or an
   experiment is finished, and Classroom.mount(el) on the progress page. Nothing is sent before a student joins. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var CLASS_KEY = 'ssp1.class';
  var OUTBOX_KEY = 'ssp1.classOutbox';

  var TEXT = {
    title: { sd: 'منهنجو ڪلاس', ur: 'میری کلاس', en: 'My class' },
    intro: {
      sd: 'جيڪڏهن توهان جي استاد ڪلاس ڪوڊ ڏنو آهي ته اهو هتي لکو. پوءِ توهان جي ڪوئز، ورڪ شيٽ ۽ تجربي جا نتيجا توهان جي استاد کي ملندا.',
      ur: 'اگر آپ کے استاد نے کلاس کوڈ دیا ہے تو اسے یہاں لکھیں۔ پھر آپ کے کوئز، ورک شیٹ اور تجربے کے نتائج آپ کے استاد کو ملیں گے۔',
      en: 'If your teacher gave you a class code, type it here. Your quiz, worksheet and experiment results will then also go to your teacher.'
    },
    code: { sd: 'ڪلاس ڪوڊ', ur: 'کلاس کوڈ', en: 'Class code' },
    name: { sd: 'توهان جو نالو يا رول نمبر', ur: 'آپ کا نام یا رول نمبر', en: 'Your name or roll number' },
    nameHelp: { sd: 'رڳو پهريون نالو يا رول نمبر لکو، جيئن استاد چيو آهي.', ur: 'صرف پہلا نام یا رول نمبر لکھیں، جیسے استاد نے کہا ہو۔', en: 'Write only your first name or roll number, as your teacher asked.' },
    join: { sd: 'ڪلاس ۾ شامل ٿيو', ur: 'کلاس میں شامل ہوں', en: 'Join the class' },
    joined: { sd: 'توهان هن ڪلاس ۾ آهيو', ur: 'آپ اس کلاس میں ہیں', en: 'You are in this class' },
    as: { sd: 'توهان جو نالو', ur: 'آپ کا نام', en: 'Your name' },
    sends: { sd: 'هاڻي توهان جا نتيجا استاد ڏانهن به ويندا.', ur: 'اب آپ کے نتائج استاد کو بھی جائیں گے۔', en: 'Your results now also go to your teacher.' },
    leave: { sd: 'ڪلاس ڇڏيو', ur: 'کلاس چھوڑیں', en: 'Leave the class' },
    leaveConfirm: { sd: 'ڇا توهان هي ڪلاس ڇڏڻ چاهيو ٿا؟', ur: 'کیا آپ یہ کلاس چھوڑنا چاہتے ہیں؟', en: 'Do you want to leave this class?' },
    badCode: { sd: 'هي ڪوڊ نه مليو. استاد کان ڪوڊ ٻيهر پڇو.', ur: 'یہ کوڈ نہیں ملا۔ استاد سے کوڈ دوبارہ پوچھیں۔', en: 'This code was not found. Ask your teacher for the code again.' },
    needCode: { sd: 'ڪوڊ ۾ 6 اکر هجن.', ur: 'کوڈ میں 6 حروف ہوں۔', en: 'The code has 6 letters.' },
    needName: { sd: 'پنهنجو نالو يا رول نمبر لکو.', ur: 'اپنا نام یا رول نمبر لکھیں۔', en: 'Write your name or roll number.' },
    offline: { sd: 'ڪلاس ۾ شامل ٿيڻ لاءِ انٽرنيٽ گهرجي.', ur: 'کلاس میں شامل ہونے کے لیے انٹرنیٹ چاہیے۔', en: 'You need the internet to join a class.' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' }
  };

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return TEXT.title[l] ? l : 'sd'; } catch (e) { return 'sd'; }
  }
  function T(k) { var o = TEXT[k]; return o[lang()] || o.en; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  function rpc(fn, args) {
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', keepalive: true,
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

  function current() { return load(CLASS_KEY, null); }

  // Results made offline wait on the phone and go out when the internet is back.
  function sendRow(row) {
    return rpc('class_report', row).catch(function (e) {
      if (e.status && e.status < 500) return;            // class removed or bad data: drop it
      var box = load(OUTBOX_KEY, []);
      box.push(row);
      save(OUTBOX_KEY, box.slice(-200));
    });
  }
  function flush() {
    var box = load(OUTBOX_KEY, []);
    if (!CFG || !box.length || navigator.onLine === false) return;
    save(OUTBOX_KEY, []);
    box.forEach(sendRow);
  }

  function report(kind, chapterKey, score, total) {
    var c = current();
    if (!c || !CFG) return;
    sendRow({ p_code: c.code, p_student: c.name, p_kind: kind, p_chapter: chapterKey || null,
      p_score: score == null ? null : score, p_total: total == null ? null : total });
  }
  // Called with every usage row app.js sends; only finished activities count for the class.
  function track(row) {
    if (row && (row.kind === 'quiz' || row.kind === 'game' || row.kind === 'competition')) report(row.kind, row.chapter_key, row.score, row.total);
  }

  function mount(el) {
    if (!el) return;
    var c = current();
    if (c) {
      el.innerHTML = '<div class="card myclass-card">' +
        '<h2>' + esc(T('title')) + '</h2>' +
        '<p class="muted">' + esc(T('joined')) + '</p>' +
        '<p class="class-name"><strong>' + esc(c.className) + '</strong>' + (c.school ? ' · ' + esc(c.school) : '') + ' <span class="class-code" dir="ltr">' + esc(c.code) + '</span></p>' +
        '<p>' + esc(T('as')) + ': <strong>' + esc(c.name) + '</strong></p>' +
        '<p class="muted small">' + esc(T('sends')) + '</p>' +
        '<button type="button" class="btn ghost small" data-class-act="leave">' + esc(T('leave')) + '</button></div>';
      el.querySelector('[data-class-act="leave"]').addEventListener('click', function () {
        if (!window.confirm(T('leaveConfirm'))) return;
        save(CLASS_KEY, null);
        mount(el);
      });
      return;
    }
    el.innerHTML = '<form class="card myclass-card" novalidate>' +
      '<h2>' + esc(T('title')) + '</h2><p class="muted">' + esc(T('intro')) + '</p>' +
      '<div class="class-fields">' +
        '<label class="field"><span>' + esc(T('code')) + '</span><input type="text" name="code" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" dir="ltr" class="code-input" placeholder="ABC234"></label>' +
        '<label class="field"><span>' + esc(T('name')) + '</span><input type="text" name="student" maxlength="30" autocomplete="off"></label>' +
      '</div>' +
      '<p class="muted small">' + esc(T('nameHelp')) + '</p>' +
      '<button type="submit" class="btn">' + esc(T('join')) + '</button> <span class="form-msg" aria-live="polite"></span></form>';
    var form = el.querySelector('form'), msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = form.code.value.replace(/\s+/g, '').toUpperCase(), name = form.student.value.trim();
      if (!/^[A-Z2-9]{6}$/.test(code)) { msg.textContent = T('needCode'); return; }
      if (!name) { msg.textContent = T('needName'); return; }
      if (!CFG || navigator.onLine === false) { msg.textContent = T('offline'); return; }
      msg.textContent = T('wait');
      rpc('classroom_info', { p_code: code }).then(function (info) {
        if (!info) { msg.textContent = T('badCode'); return; }
        save(CLASS_KEY, { code: info.code, className: info.name, school: info.school || '', name: name.slice(0, 30) });
        mount(el);
      }).catch(function () { msg.textContent = T('offline'); });
    });
  }

  window.addEventListener('online', flush);
  window.addEventListener('load', flush);
  window.Classroom = { mount: mount, report: report, track: track, current: current };
})();
