/* Science Stars of the Week. A student who joins (a nickname only, never a full name) collects points for
   finished work: quiz score, worksheet score, experiment 5, chapter game 3, the picture game and the
   true/false game. The best result of each activity per day counts. The home page shows this week's top five.
   classroom.js passes every finished activity to Stars.report(); the /play/ games call it too.
   app.js calls Stars.mount(el) on the home page. Nothing is sent before a student joins. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var ME_KEY = 'ssp1.stars';
  var OUTBOX_KEY = 'ssp1.starsOutbox';
  var CACHE_KEY = 'ssp1.starsCache';
  var KINDS = ['quiz', 'worksheet', 'experiment', 'game', 'competition', 'picture', 'truefalse'];

  var TEXT = {
    title: { sd: 'هن هفتي جا سائنس اسٽار', ur: 'اس ہفتے کے سائنس اسٹار', en: 'Science Stars of the Week' },
    week: { sd: 'هفتو {d} کان', ur: 'ہفتہ {d} سے', en: 'Week from {d}' },
    intro: {
      sd: 'سڄي هفتي ۾ سڀ کان وڌيڪ سکڻ وارا ٻار. ڪوئز، ورڪ شيٽ، تجربا ۽ رانديون پوريون ڪري پوائنٽس گڏ ڪريو. هر سومر تي نئون هفتو شروع ٿئي ٿو.',
      ur: 'پورے ہفتے میں سب سے زیادہ سیکھنے والے بچے۔ کوئز، ورک شیٹ، تجربے اور کھیل مکمل کر کے پوائنٹس جمع کریں۔ ہر پیر کو نیا ہفتہ شروع ہوتا ہے۔',
      en: 'The children who learned the most this week. Finish quizzes, worksheets, experiments and games to collect points. A new week starts every Monday.'
    },
    none: { sd: 'هن هفتي اڃا ڪو اسٽار ناهي. پهريون اسٽار توهان بڻجو!', ur: 'اس ہفتے ابھی کوئی اسٹار نہیں۔ پہلے اسٹار آپ بنیں!', en: 'No stars yet this week. Be the first star!' },
    points: { sd: '{n} پوائنٽس', ur: '{n} پوائنٹس', en: '{n} points' },
    lastWeek: { sd: 'پوئين هفتي جا اسٽار', ur: 'پچھلے ہفتے کے اسٹار', en: "Last week's stars" },
    you: { sd: 'توهان', ur: 'آپ', en: 'You' },
    yourWeek: { sd: 'هن هفتي: {n} پوائنٽس', ur: 'اس ہفتے: {n} پوائنٹس', en: 'This week: {n} points' },
    yourRank: { sd: 'نمبر {r}', ur: 'نمبر {r}', en: 'Place {r}' },
    yourNone: { sd: 'اڄ ڪجهه پورو ڪريو ۽ پوائنٽس گڏ ڪريو.', ur: 'آج کچھ مکمل کریں اور پوائنٹس جمع کریں۔', en: 'Finish something today to collect points.' },
    how: { sd: 'پوائنٽس ڪيئن ملن ٿا؟', ur: 'پوائنٹس کیسے ملتے ہیں؟', en: 'How do I get points?' },
    howList: {
      sd: ['ڪوئز: هر صحيح جواب = 1 پوائنٽ', 'ورڪ شيٽ: جيترا صحيح، اوترا پوائنٽس', 'تجربو پورو ڪرڻ = 5 پوائنٽس', 'باب جي راند کٽڻ = 3 پوائنٽس', 'تصوير سڃاڻو ۽ صحيح يا غلط راند: هر صحيح جواب = 1 پوائنٽ', 'هر ڪم جو اڄ جو بهترين نتيجو ڳڻيو وڃي ٿو.'],
      ur: ['کوئز: ہر درست جواب = 1 پوائنٹ', 'ورک شیٹ: جتنے درست، اتنے پوائنٹس', 'تجربہ مکمل کرنا = 5 پوائنٹس', 'باب کا کھیل جیتنا = 3 پوائنٹس', 'تصویر پہچانو اور سچ یا جھوٹ کھیل: ہر درست جواب = 1 پوائنٹ', 'ہر کام کا آج کا بہترین نتیجہ گنا جاتا ہے۔'],
      en: ['Quiz: 1 point for each right answer', 'Worksheet: as many points as right answers', 'Finish an experiment: 5 points', 'Win a chapter game: 3 points', 'Picture game and true-or-false game: 1 point for each right answer', 'The best result of each activity today counts.']
    },
    join: { sd: 'اسٽار مقابلي ۾ شامل ٿيو', ur: 'اسٹار مقابلے میں شامل ہوں', en: 'Join the Star contest' },
    nick: { sd: 'ڪو مزيدار نالو (نِڪ نيم)', ur: 'کوئی مزے دار نام (نک نیم)', en: 'A fun nickname' },
    nickHelp: {
      sd: 'گهر واري صفحي تي رڳو هي نالو ڏيکاريو ويندو. پنهنجو پورو نالو يا فون نمبر نه لکو.',
      ur: 'ہوم پیج پر صرف یہی نام دکھایا جائے گا۔ اپنا پورا نام یا فون نمبر نہ لکھیں۔',
      en: 'Only this name is shown on the home page. Do not write your full name or a phone number.'
    },
    district: { sd: 'ضلعو', ur: 'ضلع', en: 'District' },
    districtNone: { sd: 'نه ٻڌايو', ur: 'نہ بتائیں', en: 'Not saying' },
    badNick: { sd: 'نالي ۾ 2 کان 15 اکر هجن، رڳو اکر، انگ ۽ خالي جاءِ. فون نمبر نه.', ur: 'نام میں 2 سے 15 حروف ہوں، صرف حروف، اعداد اور خالی جگہ۔ فون نمبر نہیں۔', en: 'Use 2 to 15 letters, numbers or spaces. No phone numbers.' },
    joined: { sd: 'توهان شامل ٿي ويا! هاڻي جيڪو پورو ڪندا، ان جا پوائنٽس ملندا.', ur: 'آپ شامل ہو گئے! اب جو مکمل کریں گے، اس کے پوائنٹس ملیں گے۔', en: 'You have joined! You now get points for everything you finish.' },
    leave: { sd: 'مقابلو ڇڏيو', ur: 'مقابلہ چھوڑیں', en: 'Leave the contest' },
    leaveConfirm: { sd: 'ڇا توهان اسٽار مقابلو ڇڏڻ چاهيو ٿا؟ پوءِ پوائنٽس نه موڪليا ويندا.', ur: 'کیا آپ اسٹار مقابلہ چھوڑنا چاہتے ہیں؟ پھر پوائنٹس نہیں بھیجے جائیں گے۔', en: 'Leave the Star contest? Your points will no longer be sent.' },
    saved: { sd: 'اڳ ۾ محفوظ ٿيل فهرست (انٽرنيٽ ناهي)', ur: 'پہلے سے محفوظ فہرست (انٹرنیٹ نہیں)', en: 'Saved list (no internet)' },
    loading: { sd: 'لوڊ ٿي رهيو آهي…', ur: 'لوڈ ہو رہا ہے…', en: 'Loading…' }
  };

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return TEXT.title[l] ? l : 'sd'; } catch (e) { return 'sd'; }
  }
  function T(k, vars) {
    var o = TEXT[k], s = o[lang()] || o.en;
    if (vars && typeof s === 'string') Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
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

  // Same rule as the database: 2-15 letters, numbers, spaces, _ or -; no long numbers (phone numbers)
  function validNick(s) {
    s = String(s || '').trim().replace(/\s+/g, ' ');
    var ok;
    try { ok = /^[\p{L}\p{M}\p{N} _-]{2,15}$/u.test(s); } catch (e) { ok = s.length >= 2 && s.length <= 15 && !/[<>@\/\\:;{}()=+*&%$#!?"'`~^|,.\[\]]/.test(s); }
    return ok && !/[0-9]{4,}/.test(s) && !/(http|www)/i.test(s) ? s : null;
  }
  function newPlayer() {
    var a = new Uint8Array(18), s = '';
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2);
    return s;
  }
  function me() { var m = load(ME_KEY, null); return m && m.player && m.nick ? m : null; }

  // Results made offline wait on the phone and go out when the internet is back.
  function sendRow(row) {
    return rpc('star_report', row).catch(function (e) {
      if (e.status && e.status < 500) return;            // bad data: drop it
      var box = load(OUTBOX_KEY, []);
      box.push(row);
      save(OUTBOX_KEY, box.slice(-100));
    });
  }
  function flush() {
    var box = load(OUTBOX_KEY, []);
    if (!CFG || !box.length || navigator.onLine === false) return;
    save(OUTBOX_KEY, []);
    box.forEach(sendRow);
  }

  function report(kind, chapterKey, score, total) {
    var m = me();
    if (!m || !CFG || KINDS.indexOf(kind) < 0) return;
    sendRow({ p_player: m.player, p_nick: m.nick, p_city: m.city || null, p_kind: kind, p_chapter: chapterKey || null,
      p_score: score == null ? null : score, p_total: total == null ? null : total });
  }

  /* ---------- home page card ---------- */

  function cityName(id) {
    var c = (window.CITIES || []).filter(function (x) { return x.id === id; })[0];
    return c ? (c[lang()] || c.en) : '';
  }
  function weekLabel(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    return T('week', { d: '<bdi dir="ltr">' + p[2] + '/' + p[1] + '/' + p[0] + '</bdi>' });
  }
  var MEDALS = ['🥇', '🥈', '🥉'];
  function starRow(s) {
    var city = cityName(s.city);
    return '<li class="star-row' + (s.rank <= 3 ? ' top' : '') + '"><span class="star-place" aria-hidden="true">' + (MEDALS[s.rank - 1] || s.rank) + '</span>' +
      '<span class="star-name"><bdi>' + esc(s.nickname) + '</bdi>' + (city ? '<small class="muted">' + esc(city) + '</small>' : '') + '</span>' +
      '<span class="star-pts">' + esc(T('points', { n: s.points })) + '</span></li>';
  }
  function cityOptions(value) {
    return '<option value="">' + esc(T('districtNone')) + '</option>' + (window.CITIES || []).map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === value ? ' selected' : '') + '>' + esc(c[lang()] || c.en) + '</option>';
    }).join('');
  }

  function draw(el, data, note) {
    var m = me(), stars = (data && data.stars) || [], last = (data && data.last) || [];
    var html = '<section class="card stars-card" aria-labelledby="stars-title">' +
      '<div class="stars-head"><span class="stars-badge" aria-hidden="true">⭐</span><div>' +
        '<h2 id="stars-title">' + esc(T('title')) + '</h2>' +
        '<p class="muted small">' + (data ? weekLabel(data.week_start) : esc(T('loading'))) + (note ? ' · ' + esc(note) : '') + '</p></div></div>' +
      '<p class="stars-intro">' + esc(T('intro')) + '</p>' +
      (data ? (stars.length ? '<ol class="stars-list">' + stars.map(starRow).join('') + '</ol>' : '<p class="stars-none">' + esc(T('none')) + '</p>') : '') +
      (last.length ? '<p class="stars-last"><strong>' + esc(T('lastWeek')) + ':</strong> ' + last.map(function (s) {
        return (MEDALS[s.rank - 1] || s.rank) + ' <bdi>' + esc(s.nickname) + '</bdi>';
      }).join(' · ') + '</p>' : '');
    if (m) {
      var mine = data && data.me;
      html += '<div class="stars-me"><p><strong>' + esc(T('you')) + ': <bdi>' + esc(m.nick) + '</bdi></strong> · ' +
        (mine ? esc(T('yourWeek', { n: mine.points })) + ' · ' + esc(T('yourRank', { r: mine.rank })) : esc(T('yourNone'))) + '</p>' +
        '<button type="button" class="btn ghost small" data-star-act="leave">' + esc(T('leave')) + '</button></div>';
    } else {
      var p = load('ssp1.progress', {}) || {};
      html += '<form class="stars-join" novalidate>' +
        '<div class="stars-fields"><label class="field"><span>' + esc(T('nick')) + '</span><input type="text" name="nick" maxlength="15" autocomplete="off" value="' + esc(p.nick || '') + '"></label>' +
        '<label class="field"><span>' + esc(T('district')) + '</span><select name="city">' + cityOptions(p.city || '') + '</select></label></div>' +
        '<p class="muted small">' + esc(T('nickHelp')) + '</p>' +
        '<button type="submit" class="btn">' + esc(T('join')) + '</button> <span class="form-msg" aria-live="polite"></span></form>';
    }
    html += '<details class="stars-how"><summary>' + esc(T('how')) + '</summary><ul>' + T('howList').map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details></section>';
    el.innerHTML = html;

    var form = el.querySelector('.stars-join');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nick = validNick(form.nick.value), msg = form.querySelector('.form-msg');
      if (!nick) { msg.textContent = T('badNick'); return; }
      save(ME_KEY, { player: newPlayer(), nick: nick, city: form.city.value || '' });
      mount(el, T('joined'));
    });
    var leave = el.querySelector('[data-star-act="leave"]');
    if (leave) leave.addEventListener('click', function () {
      if (!window.confirm(T('leaveConfirm'))) return;
      save(ME_KEY, null);
      mount(el);
    });
  }

  function mount(el, note) {
    if (!el) return;
    var cached = load(CACHE_KEY, null), m = me();
    draw(el, cached && cached.data, note);
    if (!CFG) return;
    rpc('week_stars', { p_player: m ? m.player : null }).then(function (data) {
      save(CACHE_KEY, { data: data, at: Date.now() });
      if (document.body.contains(el)) draw(el, data, note);
    }).catch(function () {
      if (cached && document.body.contains(el)) draw(el, cached.data, T('saved'));
    });
  }

  window.addEventListener('online', flush);
  window.addEventListener('load', flush);
  window.Stars = { report: report, mount: mount, joined: function () { return !!me(); } };
})();
