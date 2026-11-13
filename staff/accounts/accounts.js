/* Accounts and visits (/staff/accounts/), admins only: every account made on the site (staff e-mail accounts and
   children's accounts), when it was made, and charts of how often each one opens the site.
   Uses the admin's sign-in from the Staff panel (/admin), kept in this browser. */
(function () {
  'use strict';

  var K = window.Kit, esc = K.esc, CFG = window.PORTAL_CONFIG;
  var T = {
    title: { sd: 'اڪائونٽ ۽ اچڻ جا انگ', ur: 'اکاؤنٹس اور آمد کی گنتی', en: 'Accounts and visits' },
    lead: { sd: 'هر نئون اڪائونٽ هتي نظر ايندو، ۽ ڪير ڪيترا ڀيرا ويب سائيٽ تي آيو.', ur: 'ہر نیا اکاؤنٹ یہاں نظر آئے گا، اور کون کتنی بار ویب سائٹ پر آیا۔', en: 'Every new account shows here, and how many times each one came to the website.' },
    signIn: { sd: 'هي صفحو رڳو ايڊمن لاءِ آهي. پهريان اسٽاف پينل ۾ سائن ان ڪريو.', ur: 'یہ صفحہ صرف ایڈمن کے لیے ہے۔ پہلے اسٹاف پینل میں سائن ان کریں۔', en: 'This page is for admins only. Please sign in to the Staff panel first.' },
    signBtn: { sd: 'اسٽاف پينل کوليو', ur: 'اسٹاف پینل کھولیں', en: 'Open the Staff panel' },
    total: { sd: 'ڪل اڪائونٽ', ur: 'کل اکاؤنٹس', en: 'All accounts' },
    students: { sd: 'ٻار', ur: 'بچے', en: 'Children' },
    staff: { sd: 'اسٽاف (اي ميل)', ur: 'اسٹاف (ای میل)', en: 'Staff (e-mail)' },
    newWeek: { sd: 'هن هفتي نوان', ur: 'اس ہفتے نئے', en: 'New this week' },
    daily: { sd: 'روزانو اچڻ (30 ڏينهن)', ur: 'روزانہ آمد (30 دن)', en: 'Visits per day (30 days)' },
    newDaily: { sd: 'روزانو نوان اڪائونٽ', ur: 'روزانہ نئے اکاؤنٹس', en: 'New accounts per day' },
    top: { sd: 'سڀ کان گهڻو ايندڙ', ur: 'سب سے زیادہ آنے والے', en: 'Most visits' },
    list: { sd: 'سڀ اڪائونٽ', ur: 'تمام اکاؤنٹس', en: 'All accounts' },
    search: { sd: 'نالو يا اي ميل ڳوليو', ur: 'نام یا ای میل تلاش کریں', en: 'Search name or e-mail' },
    all: { sd: 'سڀ', ur: 'سب', en: 'All' },
    name: { sd: 'نالو / اي ميل', ur: 'نام / ای میل', en: 'Name / e-mail' },
    role: { sd: 'ڪردار', ur: 'کردار', en: 'Role' },
    made: { sd: 'ٺهيو', ur: 'بنا', en: 'Made' },
    visits: { sd: 'ڪل اچڻ', ur: 'کل آمد', en: 'Visits' },
    week: { sd: '7 ڏينهن', ur: '7 دن', en: '7 days' },
    last: { sd: 'آخري ڀيرو', ur: 'آخری بار', en: 'Last visit' },
    isNew: { sd: 'نئون', ur: 'نیا', en: 'New' },
    none: { sd: 'اڃا ڪجهه ناهي.', ur: 'ابھی کچھ نہیں۔', en: 'Nothing yet.' },
    fail: { sd: 'ڊيٽا نه ملي. ٻيهر ڪوشش ڪريو.', ur: 'ڈیٹا نہیں ملا۔ دوبارہ کوشش کریں۔', en: 'Could not load the data. Please try again.' },
    note: { sd: 'هڪ برائوزر جو هڪ کولڻ = هڪ ڀيرو. ٻار لاڳ ان ٿيل هجي ته ڳڻيو وڃي ٿو.', ur: 'ایک براؤزر میں ایک بار کھولنا = ایک آمد۔ بچہ لاگ ان ہو تو گنا جاتا ہے۔', en: 'One opening of the site in a browser = one visit. Counted when the person is signed in.' },
    role_student: { sd: 'ٻار', ur: 'بچہ', en: 'Child' }, role_teacher: { sd: 'استاد', ur: 'استاد', en: 'Teacher' },
    role_principal: { sd: 'هيڊ ماستر', ur: 'ہیڈ ماسٹر', en: 'Head teacher' }, role_admin: { sd: 'ايڊمن', ur: 'ایڈمن', en: 'Admin' },
    role_pending: { sd: 'انتظار ۾', ur: 'انتظار میں', en: 'Waiting' }
  };
  function t(k) { return K.text(T, k); }
  function nf(n) { return Number(n || 0).toLocaleString('en'); }
  var main = document.getElementById('main'), state = { rows: null, days: null, filter: 'all', q: '' };

  function session() { try { return JSON.parse(localStorage.getItem('ssp-staff-session')); } catch (e) { return null; } }
  function rpc(fn, args) {
    var s = session();
    if (!s || !s.access_token || s.expires_at < Date.now() / 1000) return Promise.reject(new Error('signin'));
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { apikey: CFG.supabaseKey, Authorization: 'Bearer ' + s.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (d) {
        if (r.status === 401 || (d && /admins only|JWT/i.test(d.message || ''))) throw new Error('signin');
        if (!r.ok) throw new Error('fail');
        return d;
      });
    });
  }

  // stacked daily columns: children (green) and staff (dark green)
  function chart(rows, keys, cls) {
    var W = 720, H = 190, padB = 22, padT = 10, n = rows.length || 1, rtl = document.documentElement.dir === 'rtl';
    var max = Math.max(1, Math.max.apply(null, rows.map(function (r) { return keys.reduce(function (s, k) { return s + (+r[k] || 0); }, 0); })));
    var step = W / n, bw = Math.max(2, step - 3);
    var cols = rows.map(function (r, i) {
      var x = (rtl ? n - 1 - i : i) * step + 1, y = H - padB, parts = '', tip = r.day;
      keys.forEach(function (k, j) {
        var v = +r[k] || 0, h = v ? Math.max(2, Math.round((H - padB - padT) * v / max)) : 0;
        tip += ' · ' + t(k === 'new_accounts' ? 'isNew' : k) + ': ' + v;
        if (h) { y -= h; parts += '<rect class="' + cls + ' k' + j + '" x="' + x + '" y="' + y + '" width="' + bw + '" height="' + h + '" rx="2"/>'; }
      });
      return '<g tabindex="0"><title>' + esc(tip) + '</title><rect class="ac-hit" x="' + x + '" y="' + padT + '" width="' + step + '" height="' + (H - padB - padT) + '"/>' + parts + '</g>';
    }).join('');
    var first = rows[0] ? rows[0].day : '', last = rows[n - 1] ? rows[n - 1].day : '';
    return '<svg class="ac-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img">' +
      '<line class="ac-axis" x1="0" x2="' + W + '" y1="' + (H - padB) + '" y2="' + (H - padB) + '"/>' +
      '<text class="ac-lbl" x="' + (rtl ? W - 4 : 4) + '" y="' + (padT + 8) + '" text-anchor="' + (rtl ? 'end' : 'start') + '">' + nf(max) + '</text>' + cols +
      '<text class="ac-lbl" x="' + (rtl ? W : 0) + '" y="' + (H - 5) + '" text-anchor="' + (rtl ? 'end' : 'start') + '" direction="ltr">' + esc(first) + '</text>' +
      '<text class="ac-lbl" x="' + (rtl ? 0 : W) + '" y="' + (H - 5) + '" text-anchor="' + (rtl ? 'start' : 'end') + '" direction="ltr">' + esc(last) + '</text></svg>';
  }
  function legend(items) {
    return '<p class="ac-legend">' + items.map(function (x) { return '<span><i class="' + x[0] + '"></i>' + esc(t(x[1])) + '</span>'; }).join('') + '</p>';
  }
  function day(s) { return s ? String(s).slice(0, 10) : '—'; }
  function weekAgo() { var d = new Date(Date.now() - 7 * 864e5); return d.toISOString().slice(0, 10); }

  function table() {
    var q = state.q.toLowerCase(), wk = weekAgo();
    var rows = state.rows.filter(function (r) {
      return (state.filter === 'all' || r.kind === state.filter) && (!q || String(r.name || '').toLowerCase().indexOf(q) >= 0);
    });
    if (!rows.length) return '<p class="muted">' + esc(t('none')) + '</p>';
    return '<div class="ac-tablewrap"><table class="ac-table"><thead><tr><th>' + esc(t('name')) + '</th><th>' + esc(t('role')) + '</th><th>' + esc(t('made')) + '</th><th>' +
      esc(t('visits')) + '</th><th>' + esc(t('week')) + '</th><th>' + esc(t('last')) + '</th></tr></thead><tbody>' + rows.map(function (r) {
        var fresh = day(r.created_at) >= wk;
        return '<tr' + (fresh ? ' class="ac-new"' : '') + '><td dir="auto">' + esc(r.name || '—') + (fresh ? ' <span class="ac-badge">' + esc(t('isNew')) + '</span>' : '') + (r.class_code ? ' <small class="muted">' + esc(r.class_code) + '</small>' : '') + '</td>' +
          '<td>' + esc(T['role_' + r.role] ? t('role_' + r.role) : r.role) + '</td><td dir="ltr">' + esc(day(r.created_at)) + '</td><td><b>' + nf(r.visits) + '</b></td><td>' + nf(r.week) + '</td><td dir="ltr">' + esc(day(r.last_visit || r.last_login)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function draw() {
    K.applyLang(t('title'));
    var head = '<section class="card"><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></section>';
    if (state.error === 'signin') {
      main.innerHTML = head + '<section class="card"><p>' + esc(t('signIn')) + '</p><p><a class="btn" href="/admin">' + esc(t('signBtn')) + '</a></p></section>';
      return;
    }
    if (state.error) { main.innerHTML = head + '<p class="card">' + esc(t('fail')) + '</p>'; return; }
    if (!state.rows) { main.innerHTML = head + '<p class="loading">…</p>'; return; }
    var rows = state.rows, wk = weekAgo();
    var kids = rows.filter(function (r) { return r.kind === 'student'; }).length, staff = rows.length - kids;
    var fresh = rows.filter(function (r) { return day(r.created_at) >= wk; }).length;
    var top = rows.filter(function (r) { return +r.visits > 0; }).sort(function (a, b) { return b.visits - a.visits; }).slice(0, 8);
    var maxTop = top.length ? +top[0].visits : 1;
    main.innerHTML = head +
      '<div class="ac-stats">' + [['total', rows.length], ['students', kids], ['staff', staff], ['newWeek', fresh]].map(function (x) {
        return '<div class="card ac-stat"><b>' + nf(x[1]) + '</b><span>' + esc(t(x[0])) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="ac-two"><section class="card"><h2>' + esc(t('daily')) + '</h2>' + legend([['k0', 'students'], ['k1', 'staff']]) + chart(state.days, ['students', 'staff'], 'ac-bar') + '<p class="muted small">' + esc(t('note')) + '</p></section>' +
      '<section class="card"><h2>' + esc(t('newDaily')) + '</h2>' + chart(state.days, ['new_accounts'], 'ac-bar new') +
      '<h2>' + esc(t('top')) + '</h2>' + (top.length ? '<ul class="ac-top">' + top.map(function (r) {
        return '<li><span dir="auto">' + esc(r.name) + '</span><span class="ac-track"><span style="width:' + Math.max(3, Math.round(100 * r.visits / maxTop)) + '%"></span></span><b>' + nf(r.visits) + '</b></li>';
      }).join('') + '</ul>' : '<p class="muted">' + esc(t('none')) + '</p>') + '</section></div>' +
      '<section class="card"><h2>' + esc(t('list')) + '</h2><div class="ac-tools"><input type="search" class="ac-q" placeholder="' + esc(t('search')) + '" value="' + esc(state.q) + '">' +
      ['all', 'student', 'staff'].map(function (f) {
        return '<button type="button" class="btn small' + (state.filter === f ? '' : ' ghost') + '" data-filter="' + f + '">' + esc(t(f === 'all' ? 'all' : f === 'student' ? 'students' : 'staff')) + '</button>';
      }).join('') + '</div><div class="ac-list">' + table() + '</div></section>';
  }

  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]');
    if (b) { state.filter = b.getAttribute('data-filter'); draw(); }
  });
  main.addEventListener('input', function (e) {
    if (e.target.classList.contains('ac-q')) { state.q = e.target.value; main.querySelector('.ac-list').innerHTML = table(); }
  });

  function load() {
    Promise.all([rpc('admin_accounts'), rpc('admin_visits_daily', { p_days: 30 })]).then(function (res) {
      state.rows = res[0] || []; state.days = res[1] || []; state.error = null; draw();
    }).catch(function (e) { state.error = e && e.message === 'signin' ? 'signin' : 'fail'; draw(); });
  }
  K.onLang(draw);
  draw();
  load();
})();
