/* Parents' page (/parent/?c=CODE): a read-only report card of one child, made from the code on the child's
   login slip. It can be printed or sent on WhatsApp. Database: parent_view (gives nothing without a valid code). */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || {};
  var LANGS = ['sd', 'ur', 'en'], RTL = { sd: 1, ur: 1 };
  var main = document.getElementById('main');
  var code = (new URLSearchParams(location.search).get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  var chapters = [], data = null;

  var TEXT = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    title: { sd: 'والدين لاءِ رپورٽ', ur: 'والدین کے لیے رپورٹ', en: 'Report for parents' },
    note: { sd: 'هي صفحو رڳو ڏسڻ لاءِ آهي.', ur: 'یہ صفحہ صرف دیکھنے کے لیے ہے۔', en: 'This page is for viewing only.' },
    askCode: { sd: 'ٻار جي پرچي تي لکيل والدين جو ڪوڊ لکو.', ur: 'بچے کی پرچی پر لکھا والدین کا کوڈ لکھیں۔', en: 'Type the parents\' code from the child\'s slip.' },
    code: { sd: 'ڪوڊ', ur: 'کوڈ', en: 'Code' },
    open: { sd: 'رپورٽ ڏسو', ur: 'رپورٹ دیکھیں', en: 'See the report' },
    bad: { sd: 'هي ڪوڊ نه مليو.', ur: 'یہ کوڈ نہیں ملا۔', en: 'This code was not found.' },
    error: { sd: 'ڪجهه غلط ٿيو. ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', en: 'Something went wrong. Please try again.' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    points: { sd: 'پوائنٽس', ur: 'پوائنٹس', en: 'Points' },
    quizzes: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quizzes' },
    avg: { sd: 'ڪوئز جو اوسط', ur: 'کوئز کا اوسط', en: 'Quiz average' },
    hw: { sd: 'گهر جو ڪم', ur: 'ہوم ورک', en: 'Homework' },
    week: { sd: 'هن هفتي', ur: 'اس ہفتے', en: 'This week' },
    recent: { sd: 'تازو ڪم', ur: 'حالیہ کام', en: 'Recent work' },
    none: { sd: 'اڃا ڪجهه ناهي.', ur: 'ابھی کچھ نہیں۔', en: 'Nothing yet.' },
    done: { sd: 'ٿي ويو', ur: 'ہو گیا', en: 'Done' },
    notDone: { sd: 'اڃا نه', ur: 'ابھی نہیں', en: 'Not yet' },
    due: { sd: 'آخري تاريخ', ur: 'آخری تاریخ', en: 'Due' },
    k_quiz: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quiz' },
    k_worksheet: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' },
    k_experiment: { sd: 'تجربو', ur: 'تجربہ', en: 'Experiment' },
    k_game: { sd: 'راند', ur: 'کھیل', en: 'Game' },
    k_competition: { sd: 'مقابلو', ur: 'مقابلہ', en: 'Competition' },
    print: { sd: 'ڇاپيو', ur: 'پرنٹ کریں', en: 'Print' },
    wa: { sd: 'واٽس ايپ تي موڪليو', ur: 'واٹس ایپ پر بھیجیں', en: 'Send on WhatsApp' },
    waText: { sd: '{n} جي سائنس رپورٽ: پوائنٽس {p}، ڪوئز {q} (اوسط {a})، گهر جو ڪم {h}.', ur: '{n} کی سائنس رپورٹ: پوائنٹس {p}، کوئز {q} (اوسط {a})، ہوم ورک {h}۔', en: '{n}\'s science report: points {p}, quizzes {q} (average {a}), homework {h}.' }
  };
  function lang() { try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return LANGS.indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; } }
  function T(k, vars) {
    var o = TEXT[k], s = (o && (o[lang()] || o.en)) || k;
    Object.keys(vars || {}).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function L(o) { return o && typeof o === 'object' ? (o[lang()] || o.en || '') : (o || ''); }
  function day(iso) { return iso ? new Date(iso).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'ur-PK', { day: 'numeric', month: 'short' }) : ''; }
  function rpc(fn, args) {
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(args) })
      .then(function (r) { if (!r.ok) throw new Error('Error ' + r.status); return r.json(); });
  }
  function chTitle(key) { var c = chapters.filter(function (x) { return x.key === key; })[0]; return c ? c.number + '. ' + L(c.title) : (key || ''); }

  function applyLang() {
    var l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    var n = document.getElementById('site-name'); if (n) n.textContent = T('siteName');
    document.title = T('title') + ' | ' + T('siteName');
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
  }

  function draw() {
    applyLang();
    var top = '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › ' + esc(T('title')) + '</p>';
    if (!code || data === false) {
      main.innerHTML = top + '<form class="card pr-ask"><h1>' + esc(T('title')) + '</h1><p>' + esc(T('askCode')) + '</p>' +
        '<label class="field"><span>' + esc(T('code')) + '</span><input name="c" dir="ltr" maxlength="8" autocapitalize="characters" value="' + esc(code) + '"></label>' +
        '<p><button class="btn" type="submit">' + esc(T('open')) + '</button> <span class="form-msg">' + (data === false ? esc(T('bad')) : '') + '</span></p></form>';
      return;
    }
    if (!data) { main.innerHTML = top + '<p class="loading">' + esc(T('wait')) + '</p>'; return; }
    var d = data, q = d.results.filter(function (r) { return r.kind === 'quiz' && r.total; });
    var avg = q.length ? Math.round(q.reduce(function (n, r) { return n + 100 * r.score / r.total; }, 0) / q.length) : null;
    var weekAgo = Date.now() - 7 * 864e5, week = d.results.filter(function (r) { return new Date(r.at).getTime() > weekAgo; }).length;
    var hwDone = d.homework.filter(function (h) { return h.done; }).length, hwText = hwDone + ' / ' + d.homework.length;
    var wa = T('waText', { n: d.name, p: d.points, q: q.length, a: avg == null ? '–' : avg + '%', h: hwText }) + ' ' + location.href;
    main.innerHTML = top + '<section class="card pr-card"><h1>' + esc(d.name) + '</h1>' +
      (d.class ? '<p class="muted">' + esc(d.class.name) + (d.class.school ? ' · ' + esc(d.class.school) : '') + '</p>' : '') +
      '<div class="pr-tiles">' + [[d.points, T('points')], [q.length, T('quizzes')], [avg == null ? '–' : avg + '%', T('avg')], [hwText, T('hw')], [week, T('week')]].map(function (x) {
        return '<div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
      }).join('') + '</div>' +
      (d.homework.length ? '<h2>' + esc(T('hw')) + '</h2><ul class="pr-list">' + d.homework.map(function (h) {
        return '<li><span>' + esc(T('k_' + h.kind)) + ' · ' + esc(chTitle(h.chapter)) + (h.due ? ' <small class="muted">(' + esc(T('due')) + ': ' + esc(day(h.due + 'T00:00:00')) + ')</small>' : '') + '</span>' +
          '<b class="' + (h.done ? 'pr-yes' : 'pr-no') + '">' + esc(h.done ? '✓ ' + T('done') : T('notDone')) + '</b></li>';
      }).join('') + '</ul>' : '') +
      '<h2>' + esc(T('recent')) + '</h2>' + (d.results.length ? '<ul class="pr-list">' + d.results.slice(0, 15).map(function (r) {
        return '<li><span>' + esc(T('k_' + r.kind)) + ' · ' + esc(chTitle(r.chapter)) + ' <small class="muted">' + esc(day(r.at)) + '</small></span><b>' + (r.total ? esc(r.score + ' / ' + r.total) : '✓') + '</b></li>';
      }).join('') + '</ul>' : '<p class="muted">' + esc(T('none')) + '</p>') +
      '<p class="muted small">' + esc(T('note')) + '</p>' +
      '<p class="no-print"><button type="button" class="btn ghost" data-act="print">' + esc(T('print')) + '</button> ' +
      '<a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(wa) + '">' + esc(T('wa')) + '</a></p></section>';
  }

  function load() {
    if (!code) return draw();
    draw();
    Promise.all([rpc('parent_view', { p_code: code }), rpc('public_subject', { p_class: '5', p_subject: 'science' }).catch(function () { return []; })]).then(function (res) {
      chapters = (res[1] || []).map(function (ch) { return { key: '5/science/' + ch.id, number: ch.number, title: ch.title }; });
      data = res[0] || false;
      draw();
    }).catch(function () { main.innerHTML = '<p class="form-msg card">' + esc(T('error')) + '</p>'; });
  }

  main.addEventListener('submit', function (e) {
    e.preventDefault();
    code = e.target.c.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    history.replaceState(null, '', '/parent/?c=' + code);
    data = null; load();
  });
  main.addEventListener('click', function (e) { if (e.target.closest('[data-act="print"]')) window.print(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (!b) return;
    try { localStorage.setItem('ssp1.lang', JSON.stringify(b.getAttribute('data-lang'))); } catch (err) { /* storage blocked */ }
    draw();
  });
  load();
})();
