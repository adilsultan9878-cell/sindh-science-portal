/* Usage in numbers (/stats/): how much the portal is used, for EduPulse and donors. Counts only, from the database
   function public_usage_stats: no names or anything that points at one child. One green hue throughout (each chart
   shows one measure); every bar has a hover/tap label and the daily numbers are also in a table. */
(function () {
  'use strict';

  var K = window.Kit, esc = K.esc, L = K.L;
  var T = {
    title: { sd: 'پورٽل جو استعمال', ur: 'پورٹل کا استعمال', en: 'Portal usage' },
    lead: {
      sd: 'پورٽل ڪيترو استعمال ٿي رهيو آهي، رڳو انگن ۾. ڪنهن به ٻار جو نالو يا ذاتي معلومات هتي ناهي.',
      ur: 'پورٹل کتنا استعمال ہو رہا ہے، صرف گنتی میں۔ کسی بچے کا نام یا ذاتی معلومات یہاں نہیں ہے۔',
      en: 'How much the portal is used, in numbers only. No child\'s name or personal details are shown here.'
    },
    period: { sd: 'گذريل {n} ڏينهن', ur: 'پچھلے {n} دن', en: 'Last {n} days' },
    visits: { sd: 'دورا', ur: 'وزٹس', en: 'Visits' },
    activities: { sd: 'سرگرميون', ur: 'سرگرمیاں', en: 'Activities' },
    quizzes: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quizzes' },
    games: { sd: 'رانديون', ur: 'کھیل', en: 'Games' },
    competitions: { sd: 'مقابلا', ur: 'مقابلے', en: 'Competitions' },
    worksheets: { sd: 'ورڪ شيٽون', ur: 'ورک شیٹس', en: 'Worksheets' },
    students: { sd: 'شاگردن جا اڪائونٽ', ur: 'طلبہ کے اکاؤنٹ', en: 'Student accounts' },
    classes: { sd: 'ڪلاس', ur: 'کلاسیں', en: 'Classes' },
    schools: { sd: 'اسڪول', ur: 'اسکول', en: 'Schools' },
    certificates: { sd: 'سرٽيفڪيٽ', ur: 'سرٹیفکیٹ', en: 'Certificates' },
    ustad: { sd: 'سائنس استاد کان سوال', ur: 'سائنس استاد سے سوالات', en: 'Questions to Science Ustad' },
    daily: { sd: 'روزانو دورا', ur: 'روزانہ وزٹس', en: 'Visits per day' },
    langs: { sd: 'ٻولي', ur: 'زبان', en: 'Language' },
    chapters: { sd: 'سڀ کان وڌيڪ استعمال ٿيندڙ باب', ur: 'سب سے زیادہ استعمال ہونے والے ابواب', en: 'Most used chapters' },
    districts: { sd: 'ضلعا', ur: 'اضلاع', en: 'Districts' },
    accounts: { sd: 'اڪائونٽ ۽ ڪلاس', ur: 'اکاؤنٹس اور کلاسیں', en: 'Accounts and classes' },
    table: { sd: 'انگ جدول ۾', ur: 'گنتی ٹیبل میں', en: 'Numbers as a table' },
    date: { sd: 'تاريخ', ur: 'تاریخ', en: 'Date' },
    none: { sd: 'اڃا ڪجهه ناهي.', ur: 'ابھی کچھ نہیں۔', en: 'Nothing yet.' },
    since: { sd: 'شروعات کان: {v} دورا، {a} سرگرميون ({d} کان)', ur: 'شروع سے: {v} وزٹس، {a} سرگرمیاں ({d} سے)', en: 'Since the start: {v} visits, {a} activities (from {d})' },
    print: { sd: 'رپورٽ پرنٽ ڪريو', ur: 'رپورٹ پرنٹ کریں', en: 'Print the report' },
    loadError: { sd: 'انگ لوڊ نه ٿي سگهيا. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'گنتی لوڈ نہیں ہو سکی۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Could not load the numbers. Check the internet and try again.' }
  };
  function t(k, v) { return K.text(T, k, v); }
  var LANG_NAME = { sd: 'سنڌي', ur: 'اردو', en: 'English' };

  var main = document.getElementById('main');
  var days = 30, data = null, chs = [];
  function nf(n) { try { return Number(n || 0).toLocaleString(K.state.lang === 'en' ? 'en-GB' : 'ur-PK'); } catch (e) { return String(n || 0); } }
  function crumbs() { return '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(K.text(null, 'home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>'; }

  function tile(n, label) { return '<div class="card st-tile"><b>' + nf(n) + '</b><span>' + esc(label) + '</span></div>'; }
  // horizontal bars: label, bar, value (value in text ink; the bar carries no text)
  function hbars(rows) {
    if (!rows.length) return '<p class="muted">' + esc(t('none')) + '</p>';
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; })) || 1;
    return '<ul class="st-hbars">' + rows.map(function (r) {
      return '<li><span class="st-hlabel">' + esc(r.label) + '</span><span class="st-htrack"><span class="st-hbar" style="width:' + Math.max(2, Math.round(100 * r.n / max)) + '%"></span></span><b>' + nf(r.n) + '</b></li>';
    }).join('') + '</ul>';
  }
  // daily columns as inline SVG; one hue, 2px gaps, 4px rounded tops, each column has its own label for hover/tap
  function dailyChart(rows) {
    var W = 720, H = 200, padB = 22, padT = 8, n = rows.length, max = Math.max(1, Math.max.apply(null, rows.map(function (r) { return r.visits; })));
    var step = W / n, bw = Math.max(2, step - 2), rtl = document.documentElement.dir === 'rtl';
    var bars = rows.map(function (r, i) {
      var h = r.visits ? Math.max(3, Math.round((H - padB - padT) * r.visits / max)) : 0, x = (rtl ? n - 1 - i : i) * step + 1, y = H - padB - h;
      var tip = r.d + ' · ' + t('visits') + ': ' + r.visits + ' · ' + t('activities') + ': ' + r.acts;
      return '<g class="st-col" tabindex="0" aria-label="' + esc(tip) + '"><title>' + esc(tip) + '</title>' +
        '<rect class="st-hit" x="' + (x - 1) + '" y="' + padT + '" width="' + step + '" height="' + (H - padB - padT) + '"/>' +
        (h ? '<path class="st-bar" d="M' + x + ' ' + (H - padB) + 'V' + (y + Math.min(4, h)) + 'q0 -' + Math.min(4, h) + ' ' + Math.min(4, bw / 2) + ' -' + Math.min(4, h) +
          'H' + (x + bw - Math.min(4, bw / 2)) + 'q' + Math.min(4, bw / 2) + ' 0 ' + Math.min(4, bw / 2) + ' ' + Math.min(4, h) + 'V' + (H - padB) + 'z"/>' : '') + '</g>';
    }).join('');
    var first = rows[0] ? rows[0].d : '', last = rows[n - 1] ? rows[n - 1].d : '';
    return '<svg class="st-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(t('daily')) + '">' +
      '<line class="st-axis" x1="0" x2="' + W + '" y1="' + (H - padB) + '" y2="' + (H - padB) + '"/>' +
      '<text class="st-max" x="' + (rtl ? W - 4 : 4) + '" y="' + (padT + 10) + '" text-anchor="' + (rtl ? 'end' : 'start') + '">' + nf(max) + '</text>' + bars +
      '<text class="st-date" x="' + (rtl ? W : 0) + '" y="' + (H - 4) + '" text-anchor="' + (rtl ? 'end' : 'start') + '" direction="ltr">' + esc(first) + '</text>' +
      '<text class="st-date" x="' + (rtl ? 0 : W) + '" y="' + (H - 4) + '" text-anchor="' + (rtl ? 'start' : 'end') + '" direction="ltr">' + esc(last) + '</text></svg>' +
      '<p class="st-tip muted small" aria-live="polite"></p>';
  }

  function draw() {
    K.applyLang(t('title'));
    var d = data, p = d.period || {}, a = d.accounts || {}, all = d.all_time || {};
    var acts = (p.quizzes || 0) + (p.games || 0) + (p.competitions || 0) + (p.worksheets || 0);
    var chTitle = {};
    chs.forEach(function (c) { chTitle[c._key] = K.text(null, 'chapterN', { n: c._n }) + ': ' + L(c.title); });
    main.innerHTML = crumbs() +
      '<section class="card st-hero"><div><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div>' +
        '<div class="st-tools no-print"><div class="seg" role="group" aria-label="' + esc(t('title')) + '">' + [7, 30, 90].map(function (n) {
          return '<button type="button" class="btn ghost small' + (n === days ? ' on' : '') + '" aria-pressed="' + (n === days) + '" data-days="' + n + '">' + esc(t('period', { n: n })) + '</button>';
        }).join('') + '</div><button type="button" class="btn ghost small" data-print>' + esc(t('print')) + '</button></div></section>' +
      '<p class="muted small">' + esc(t('period', { n: d.days })) + ' (' + esc(d.from) + ' – ' + esc(d.to) + ')</p>' +
      '<div class="st-tiles">' + tile(p.visits, t('visits')) + tile(acts, t('activities')) + tile(p.quizzes, t('quizzes')) + tile(p.games, t('games')) +
        tile(p.competitions, t('competitions')) + tile(a.ustad_questions, t('ustad')) + '</div>' +
      '<section class="card"><h2>' + esc(t('daily')) + '</h2>' + dailyChart(d.daily || []) +
        '<details class="st-table"><summary>' + esc(t('table')) + '</summary><div class="table-wrap"><table><thead><tr><th>' + esc(t('date')) + '</th><th>' + esc(t('visits')) + '</th><th>' + esc(t('activities')) + '</th></tr></thead><tbody>' +
        (d.daily || []).slice().reverse().map(function (r) { return '<tr><td dir="ltr">' + esc(r.d) + '</td><td>' + nf(r.visits) + '</td><td>' + nf(r.acts) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details></section>' +
      '<div class="st-two">' +
        '<section class="card"><h2>' + esc(t('chapters')) + '</h2>' + hbars((d.chapters || []).map(function (c) { return { label: chTitle[c.key] || c.key, n: c.n }; })) + '</section>' +
        '<section class="card"><h2>' + esc(t('langs')) + '</h2>' + hbars(Object.keys(d.langs || {}).map(function (l) { return { label: LANG_NAME[l] || l, n: d.langs[l] }; }).sort(function (x, y) { return y.n - x.n; })) + '</section>' +
        '<section class="card"><h2>' + esc(t('districts')) + '</h2>' + hbars((d.districts || []).map(function (x) { return { label: x.district, n: x.n }; })) + '</section>' +
        '<section class="card"><h2>' + esc(t('accounts')) + '</h2><div class="st-tiles small">' + tile(a.students, t('students')) + tile(a.classes, t('classes')) + tile(a.schools, t('schools')) + tile(a.certificates, t('certificates')) + '</div></section>' +
      '</div>' +
      (all.since ? '<p class="muted small">' + esc(t('since', { v: nf(all.visits), a: nf(all.activities), d: all.since })) + '</p>' : '');
  }
  function fetchStats() {
    main.insertAdjacentHTML('afterbegin', '');
    return K.rpc('public_usage_stats', { p_days: days }).then(function (d) { data = d; draw(); }).catch(function () {
      main.innerHTML = crumbs() + '<p class="card note">' + esc(t('loadError')) + '</p>';
    });
  }
  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-days]');
    if (b) { days = +b.getAttribute('data-days'); fetchStats(); return; }
    if (e.target.closest('[data-print]')) window.print();
    var col = e.target.closest('.st-col');
    var tip = main.querySelector('.st-tip');
    if (col && tip) tip.textContent = col.getAttribute('aria-label');
  });
  main.addEventListener('mouseover', function (e) {
    var col = e.target.closest('.st-col'), tip = main.querySelector('.st-tip');
    if (col && tip) tip.textContent = col.getAttribute('aria-label');
  });
  main.addEventListener('focusin', function (e) {
    var col = e.target.closest('.st-col'), tip = main.querySelector('.st-tip');
    if (col && tip) tip.textContent = col.getAttribute('aria-label');
  });

  K.onLang(function () { if (data) draw(); });
  K.applyLang(t('title'));
  K.chapters().then(function (l) { chs = l; }).catch(function () { chs = []; }).then(fetchStats);
})();
