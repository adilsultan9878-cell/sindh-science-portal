/* School dashboard (/school/) for head teachers and principals: make a school, give teachers its code so they can
   link their classes, then see totals for every class and chapter. The principal never sees student names; those
   stay with each class teacher. Data goes through the school functions in Supabase; the tables are closed. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var MINE = 'ssp1.schools';
  var main = document.getElementById('main');
  var chapters = [];
  var openSchool = null;      // { code, key, name }
  var data = null;

  var TEXT = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    title: { sd: 'اسڪول ڊيش بورڊ', ur: 'اسکول ڈیش بورڈ', en: 'School dashboard' },
    intro: {
      sd: 'هيڊ ماستر ۽ پرنسپل لاءِ: پنهنجو اسڪول ٺاهيو ۽ اسڪول ڪوڊ استادن کي ڏيو. استاد پنهنجي ڪلاس کي اسڪول سان ڳنڍين، پوءِ هتي هر ڪلاس ۽ هر باب جو اوسط نظر ايندو.',
      ur: 'ہیڈ ماسٹر اور پرنسپل کے لیے: اپنا اسکول بنائیں اور اسکول کوڈ اساتذہ کو دیں۔ اساتذہ اپنی کلاس کو اسکول سے جوڑیں، پھر یہاں ہر کلاس اور ہر باب کا اوسط نظر آئے گا۔',
      en: 'For head teachers and principals: make your school and give the school code to your teachers. When they link their classes, you see the average for every class and chapter here.'
    },
    mySchools: { sd: 'منهنجا اسڪول', ur: 'میرے اسکول', en: 'My schools' },
    none: { sd: 'هن فون تي اڃا ڪو اسڪول ناهي.', ur: 'اس فون پر ابھی کوئی اسکول نہیں۔', en: 'No schools on this device yet.' },
    newSchool: { sd: 'نئون اسڪول ٺاهيو', ur: 'نیا اسکول بنائیں', en: 'Make a school' },
    schoolName: { sd: 'اسڪول جو نالو', ur: 'اسکول کا نام', en: 'School name' },
    district: { sd: 'ضلعو (اختياري)', ur: 'ضلع (اختیاری)', en: 'District (optional)' },
    choose: { sd: 'چونڊيو', ur: 'منتخب کریں', en: 'Choose' },
    make: { sd: 'اسڪول ٺاهيو', ur: 'اسکول بنائیں', en: 'Make school' },
    openOther: { sd: 'ٻئي فون تي ٺهيل اسڪول کوليو', ur: 'دوسرے فون پر بنا اسکول کھولیں', en: 'Open a school made on another device' },
    code: { sd: 'اسڪول ڪوڊ', ur: 'اسکول کوڈ', en: 'School code' },
    key: { sd: 'پرنسپل جي ڪنجي', ur: 'پرنسپل کی کلید', en: 'Principal key' },
    open: { sd: 'کوليو', ur: 'کھولیں', en: 'Open' },
    made: { sd: 'اسڪول ٺهي ويو!', ur: 'اسکول بن گیا!', en: 'Your school is ready!' },
    madeHelp: {
      sd: 'اسڪول ڪوڊ استادن کي ڏيو. پرنسپل جي ڪنجي رڳو توهان لاءِ آهي — ان کي لکي محفوظ رکو.',
      ur: 'اسکول کوڈ اساتذہ کو دیں۔ پرنسپل کی کلید صرف آپ کے لیے ہے — اسے لکھ کر محفوظ رکھیں۔',
      en: 'Give the school code to your teachers. The principal key is only for you — write it down and keep it safe.'
    },
    howLink: {
      sd: 'استاد ڪيئن ڳنڍين: ويب سائيٽ ← استادن لاءِ ← استاد جو ڪلاس ← پنهنجو ڪلاس کوليو ← «اسڪول سان ڳنڍيو» ۾ هي ڪوڊ لکو.',
      ur: 'اساتذہ کیسے جوڑیں: ویب سائٹ ← اساتذہ کے لیے ← استاد کی کلاس ← اپنی کلاس کھولیں ← «اسکول سے جوڑیں» میں یہ کوڈ لکھیں۔',
      en: 'How teachers link: website → For teachers → Your class → open the class → type this code under "Link to a school".'
    },
    printCode: { sd: 'استادن لاءِ ڪوڊ ڇاپيو', ur: 'اساتذہ کے لیے کوڈ پرنٹ کریں', en: 'Print the code for teachers' },
    printTitle: { sd: 'اسان جي اسڪول جو ڪوڊ', ur: 'ہمارے اسکول کا کوڈ', en: 'Our school code' },
    showKey: { sd: 'ڪنجي ڏيکاريو', ur: 'کلید دکھائیں', en: 'Show key' },
    refresh: { sd: 'تازو ڪريو', ur: 'تازہ کریں', en: 'Refresh' },
    csv: { sd: 'Excel (CSV) ڊائونلوڊ', ur: 'Excel (CSV) ڈاؤن لوڈ', en: 'Download for Excel (CSV)' },
    print: { sd: 'رپورٽ ڇاپيو', ur: 'رپورٹ پرنٹ کریں', en: 'Print report' },
    forget: { sd: 'هن فون مان هٽايو', ur: 'اس فون سے ہٹائیں', en: 'Remove from this device' },
    forgetConfirm: { sd: 'اسڪول رڳو هن فون مان هٽندو. پڪ آهي؟', ur: 'اسکول صرف اس فون سے ہٹے گا۔ یقین ہے؟', en: 'The school is only removed from this device. Are you sure?' },
    classes: { sd: 'ڪلاس', ur: 'کلاسیں', en: 'Classes' },
    students: { sd: 'ٻار', ur: 'بچے', en: 'Students' },
    quizzes: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quizzes' },
    avgQuiz: { sd: 'ڪوئز جو اوسط', ur: 'کوئز کا اوسط', en: 'Average quiz score' },
    worksheets: { sd: 'ورڪ شيٽون', ur: 'ورک شیٹس', en: 'Worksheets' },
    experiments: { sd: 'تجربا', ur: 'تجربے', en: 'Experiments' },
    byClass: { sd: 'هر ڪلاس', ur: 'ہر کلاس', en: 'Each class' },
    className: { sd: 'ڪلاس', ur: 'کلاس', en: 'Class' },
    lastActive: { sd: 'آخري ڀيرو', ur: 'آخری بار', en: 'Last active' },
    byChapter: { sd: 'هر ڪلاس ۽ باب جو ڪوئز اوسط', ur: 'ہر کلاس اور باب کا کوئز اوسط', en: 'Average quiz score by class and chapter' },
    schoolAvg: { sd: 'سڄو اسڪول', ur: 'پورا اسکول', en: 'Whole school' },
    weak: { sd: 'جن بابن تي وڌيڪ ڌيان گهرجي', ur: 'جن ابواب پر زیادہ توجہ چاہیے', en: 'Chapters that need more attention' },
    weakNone: { sd: 'اڃا ڪافي نتيجا ناهن.', ur: 'ابھی کافی نتائج نہیں۔', en: 'Not enough results yet.' },
    noClasses: { sd: 'اڃا ڪو ڪلاس ڳنڍيل ناهي. اسڪول ڪوڊ استادن کي ڏيو.', ur: 'ابھی کوئی کلاس جڑی نہیں۔ اسکول کوڈ اساتذہ کو دیں۔', en: 'No classes are linked yet. Give the school code to your teachers.' },
    legend80: { sd: '80% يا وڌيڪ', ur: '80% یا زیادہ', en: '80% or more' },
    legend50: { sd: '50–79%', ur: '50–79%', en: '50–79%' },
    legendLow: { sd: '50% کان گهٽ', ur: '50% سے کم', en: 'below 50%' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Ch {n}' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    needName: { sd: 'اسڪول جو نالو لکو.', ur: 'اسکول کا نام لکھیں۔', en: 'Write the school name.' },
    wrong: { sd: 'ڪوڊ يا ڪنجي غلط آهي.', ur: 'کوڈ یا کلید غلط ہے۔', en: 'The code or key is wrong.' },
    error: { sd: 'ڪجهه غلط ٿيو. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Something went wrong. Check the internet and try again.' },
    privacy: {
      sd: 'هتي رڳو ڪلاسن ۽ بابن جا اوسط آهن، ڪنهن ٻار جو نالو ناهي. هر ٻار جا نتيجا رڳو ان جو استاد ڏسي سگهي ٿو.',
      ur: 'یہاں صرف کلاسوں اور ابواب کے اوسط ہیں، کسی بچے کا نام نہیں۔ ہر بچے کے نتائج صرف اس کا استاد دیکھ سکتا ہے۔',
      en: 'Only class and chapter averages are shown here, never student names. Each student\'s results are seen only by their teacher.'
    }
  };

  function lang() { try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return LANGS.indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; } }
  function T(k, vars) {
    var o = TEXT[k], s = (o && (o[lang()] || o.en)) || k;
    Object.keys(vars || {}).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function L(o) { return o && typeof o === 'object' ? (o[lang()] || o.en || '') : (o || ''); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mine() { try { return JSON.parse(localStorage.getItem(MINE)) || []; } catch (e) { return []; } }
  function saveMine(list) { try { localStorage.setItem(MINE, JSON.stringify(list)); } catch (e) { /* storage blocked */ } }
  function remember(s) {
    saveMine([{ code: s.code, key: s.key, name: s.name }].concat(mine().filter(function (x) { return x.code !== s.code; })).slice(0, 10));
  }
  function day(iso) { return iso ? String(iso).slice(0, 10) : '—'; }
  function cityName(en) { var c = (window.CITIES || []).filter(function (x) { return x.en === en; })[0]; return c ? L(c) : (en || ''); }
  function pctClass(v) { return v == null ? 'none' : v >= 80 ? 'good' : v >= 50 ? 'ok' : 'low'; }

  function rpc(fn, args) {
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.text().then(function (txt) {
        var d = null;
        try { d = txt ? JSON.parse(txt) : null; } catch (e) { d = txt; }
        if (!r.ok) { var err = new Error((d && d.message) || ('Error ' + r.status)); err.status = r.status; throw err; }
        return d;
      });
    });
  }

  function applyLang() {
    var l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.getElementById('site-name').textContent = T('siteName');
    document.title = T('title') + ' | ' + T('siteName');
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (!b) return;
    try { localStorage.setItem('ssp1.lang', JSON.stringify(b.getAttribute('data-lang'))); } catch (err) { /* storage blocked */ }
    applyLang();
    render();
  });

  function crumbs(last) {
    return '<p class="crumbs no-print"><a href="/">' + esc(T('siteName')) + '</a> › <a href="/teachers">' + esc((window.UI_TEXT && L(window.UI_TEXT.teachers)) || 'Teachers') + '</a> › ' +
      (last ? '<a href="#" data-home>' + esc(T('title')) + '</a> › ' + esc(last) : esc(T('title'))) + '</p>';
  }
  function bindHome() {
    var h = main.querySelector('[data-home]');
    if (h) h.addEventListener('click', function (e) { e.preventDefault(); openSchool = null; data = null; render(); });
  }

  function render() {
    if (openSchool) return renderSchool();
    var list = mine();
    var districts = (window.CITIES || []).map(function (c) { return '<option value="' + esc(c.en) + '">' + esc(L(c)) + '</option>'; }).join('');
    main.innerHTML = crumbs() + '<h1>' + esc(T('title')) + '</h1><p>' + esc(T('intro')) + '</p>' +
      '<section class="card"><h2>' + esc(T('mySchools')) + '</h2>' +
        (list.length ? '<div class="sc-list">' + list.map(function (s) {
          return '<button type="button" class="chip" data-open="' + esc(s.code) + '"><strong>' + esc(s.name) + '</strong> <span class="ltr">' + esc(s.code) + '</span></button>';
        }).join('') + '</div>' : '<p class="muted">' + esc(T('none')) + '</p>') + '</section>' +
      '<div class="sc-grid">' +
        '<form class="card sc-form" id="new-school" novalidate><h2>' + esc(T('newSchool')) + '</h2>' +
          '<label class="field"><span>' + esc(T('schoolName')) + '</span><input type="text" name="name" maxlength="80"></label>' +
          '<label class="field"><span>' + esc(T('district')) + '</span><select name="district"><option value="">' + esc(T('choose')) + '</option>' + districts + '</select></label>' +
          '<button type="submit" class="btn">' + esc(T('make')) + '</button><span class="form-msg" aria-live="polite"></span></form>' +
        '<form class="card sc-form" id="open-school" novalidate><h2>' + esc(T('openOther')) + '</h2>' +
          '<label class="field"><span>' + esc(T('code')) + '</span><input type="text" name="code" maxlength="6" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>' +
          '<label class="field"><span>' + esc(T('key')) + '</span><input type="text" name="key" maxlength="10" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>' +
          '<button type="submit" class="btn ghost">' + esc(T('open')) + '</button><span class="form-msg" aria-live="polite"></span></form>' +
      '</div><p class="muted small">' + esc(T('privacy')) + '</p>';

    main.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = mine().filter(function (x) { return x.code === b.getAttribute('data-open'); })[0];
        if (s) { openSchool = s; data = null; render(); }
      });
    });
    var nf = document.getElementById('new-school');
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = nf.querySelector('.form-msg'), name = nf.name.value.trim();
      if (!name) { msg.textContent = T('needName'); return; }
      msg.textContent = T('wait');
      rpc('create_school', { p_name: name, p_district: nf.district.value || null }).then(function (r) {
        var s = { code: r.code, key: r.key, name: name };
        remember(s);
        openSchool = s; data = null;
        renderMade(s);
      }).catch(function () { msg.textContent = T('error'); });
    });
    var of = document.getElementById('open-school');
    of.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = of.querySelector('.form-msg');
      var code = of.code.value.replace(/\s+/g, '').toUpperCase(), key = of.key.value.replace(/\s+/g, '').toUpperCase();
      msg.textContent = T('wait');
      rpc('school_results', { p_school: code, p_key: key }).then(function (d) {
        var s = { code: d.school.code, key: key, name: d.school.name };
        remember(s);
        openSchool = s; data = d;
        render();
      }).catch(function (err) { msg.textContent = err.status && err.status < 500 ? T('wrong') : T('error'); });
    });
  }

  function printCard(s) {
    return '<div class="print-card"><h1>' + esc(T('printTitle')) + '</h1><p>' + esc(s.name) + '</p><p class="bigcode">' + esc(s.code) + '</p>' +
      '<p>' + esc(T('howLink')) + '</p><p class="ltr">sindh-science-portal.vercel.app/class/</p></div>';
  }
  function printCode() {
    document.body.classList.add('print-code');
    window.print();
    document.body.classList.remove('print-code');
  }

  function renderMade(s) {
    main.innerHTML = crumbs(s.name) +
      '<section class="card note ok"><h1>' + esc(T('made')) + '</h1>' +
        '<p>' + esc(T('code')) + ':</p><p class="bigcode">' + esc(s.code) + '</p>' +
        '<p>' + esc(T('key')) + ': <span class="keycode">' + esc(s.key) + '</span></p>' +
        '<p>' + esc(T('madeHelp')) + '</p><p class="muted">' + esc(T('howLink')) + '</p>' +
        '<div class="btn-row"><button type="button" class="btn" data-act="print-code">' + esc(T('printCode')) + '</button>' +
        '<button type="button" class="btn ghost" data-act="go">' + esc(T('open')) + ' →</button></div></section>' + printCard(s);
    bindHome();
    main.querySelector('[data-act="go"]').addEventListener('click', function () { render(); });
    main.querySelector('[data-act="print-code"]').addEventListener('click', printCode);
  }

  function loadChapters() {
    if (chapters.length) return Promise.resolve(chapters);
    return rpc('public_subject', { p_class: '5', p_subject: 'science' }).then(function (list) {
      chapters = (list || []).map(function (ch) { return { key: '5/science/' + ch.id, number: ch.number, title: ch.title }; });
      return chapters;
    }).catch(function () { return []; });
  }

  function renderSchool() {
    main.innerHTML = crumbs(openSchool.name) + '<p class="loading">' + esc(T('wait')) + '</p>';
    bindHome();
    var need = data ? Promise.resolve(data) : rpc('school_results', { p_school: openSchool.code, p_key: openSchool.key });
    Promise.all([need, loadChapters()]).then(function (res) { data = res[0]; drawSchool(); }).catch(function (err) {
      main.insertAdjacentHTML('beforeend', '<p class="form-msg">' + esc(err.status && err.status < 500 ? T('wrong') : T('error')) + '</p>');
    });
  }

  function drawSchool() {
    var sc = data.school, classes = data.classes || [], rows = data.chapters || [];
    var students = classes.reduce(function (n, c) { return n + c.students; }, 0);
    var quizzes = classes.reduce(function (n, c) { return n + c.quizzes; }, 0);
    var sumQ = rows.reduce(function (n, r) { return n + r.avg * r.quizzes; }, 0), cntQ = rows.reduce(function (n, r) { return n + r.quizzes; }, 0);
    var cell = {}, perChapter = {};
    rows.forEach(function (r) {
      cell[r.class + '|' + r.chapter] = r.avg;
      var p = perChapter[r.chapter] || (perChapter[r.chapter] = { sum: 0, n: 0 });
      p.sum += r.avg * r.quizzes; p.n += r.quizzes;
    });
    function chAvg(key) { var p = perChapter[key]; return p && p.n ? Math.round(p.sum / p.n) : null; }
    var weak = chapters.filter(function (ch) { var a = chAvg(ch.key); return a != null && a < 70; })
      .sort(function (a, b) { return chAvg(a.key) - chAvg(b.key); }).slice(0, 5);

    var html = crumbs(sc.name) +
      '<div class="tc-head"><h1>' + esc(sc.name) + '</h1><p class="muted">' + esc(cityName(sc.district)) + '</p>' +
      '<p>' + esc(T('code')) + ': <span class="keycode">' + esc(sc.code) + '</span> <span class="no-print"><button type="button" class="btn ghost small" data-act="key">' + esc(T('showKey')) + '</button> <span class="keycode" data-keyval hidden>' + esc(openSchool.key) + '</span></span></p>' +
      '<p class="muted small no-print">' + esc(T('howLink')) + '</p></div>' +
      '<div class="btn-row no-print">' +
        '<button type="button" class="btn small" data-act="refresh">' + esc(T('refresh')) + '</button>' +
        '<button type="button" class="btn ghost small" data-act="csv">' + esc(T('csv')) + '</button>' +
        '<button type="button" class="btn ghost small" data-act="print">' + esc(T('print')) + '</button>' +
        '<button type="button" class="btn ghost small" data-act="print-code">' + esc(T('printCode')) + '</button>' +
        '<button type="button" class="btn ghost small danger" data-act="forget">' + esc(T('forget')) + '</button></div>' +
      '<div class="sc-tiles">' + tile(classes.length, T('classes')) + tile(students, T('students')) + tile(quizzes, T('quizzes')) +
        tile(cntQ ? Math.round(sumQ / cntQ) + '%' : '—', T('avgQuiz')) +
        tile(classes.reduce(function (n, c) { return n + c.worksheets; }, 0), T('worksheets')) +
        tile(classes.reduce(function (n, c) { return n + c.experiments; }, 0), T('experiments')) + '</div>';

    if (!classes.length) html += '<p class="card">' + esc(T('noClasses')) + '</p>';
    else {
      html += '<h2>' + esc(T('byClass')) + '</h2><div class="table-wrap"><table class="table sc-table"><thead><tr><th>' + esc(T('className')) + '</th><th>' + esc(T('students')) + '</th><th>' + esc(T('quizzes')) +
        '</th><th>' + esc(T('avgQuiz')) + '</th><th>' + esc(T('worksheets')) + '</th><th>' + esc(T('experiments')) + '</th><th>' + esc(T('lastActive')) + '</th></tr></thead><tbody>' +
        classes.map(function (c) {
          return '<tr><td><strong>' + esc(c.name) + '</strong></td><td>' + c.students + '</td><td>' + c.quizzes + '</td><td class="' + pctClass(c.avg_quiz) + '">' + (c.avg_quiz == null ? '—' : c.avg_quiz + '%') +
            '</td><td>' + c.worksheets + '</td><td>' + c.experiments + '</td><td class="ltr">' + esc(day(c.last)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      html += '<h2>' + esc(T('byChapter')) + '</h2>' +
        '<p class="sc-legend"><span class="g">' + esc(T('legend80')) + '</span><span class="o">' + esc(T('legend50')) + '</span><span class="l">' + esc(T('legendLow')) + '</span></p>' +
        '<div class="table-wrap"><table class="table sc-table"><thead><tr><th>' + esc(T('className')) + '</th>' +
        chapters.map(function (ch) { return '<th title="' + esc(L(ch.title)) + '">' + esc(T('chapterN', { n: ch.number })) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        classes.map(function (c) {
          return '<tr><td><strong>' + esc(c.name) + '</strong></td>' + chapters.map(function (ch) {
            var v = cell[c.code + '|' + ch.key];
            return '<td class="' + pctClass(v) + '">' + (v == null ? '—' : v + '%') + '</td>';
          }).join('') + '</tr>';
        }).join('') +
        '<tr><td><strong>' + esc(T('schoolAvg')) + '</strong></td>' + chapters.map(function (ch) {
          var v = chAvg(ch.key);
          return '<td class="' + pctClass(v) + '">' + (v == null ? '—' : v + '%') + '</td>';
        }).join('') + '</tr></tbody></table></div>';
      html += '<h2>' + esc(T('weak')) + '</h2>' + (weak.length ? '<ul class="sc-weak">' + weak.map(function (ch) {
        return '<li><strong>' + esc(T('chapterN', { n: ch.number })) + ': ' + esc(L(ch.title)) + '</strong> — ' + chAvg(ch.key) + '%</li>';
      }).join('') + '</ul>' : '<p class="muted">' + esc(T('weakNone')) + '</p>');
    }
    html += '<p class="muted small">' + esc(T('privacy')) + '</p>' + printCard(sc);
    main.innerHTML = html;
    bindHome();
  }
  function tile(n, label) { return '<div class="card"><b>' + esc(n) + '</b><span>' + esc(label) + '</span></div>'; }

  main.addEventListener('click', function (e) {
    if (!openSchool || !data) return;
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'key') { var k = main.querySelector('[data-keyval]'); k.hidden = !k.hidden; }
    if (act === 'refresh') { data = null; renderSchool(); }
    if (act === 'print') window.print();
    if (act === 'print-code') printCode();
    if (act === 'csv') downloadCsv();
    if (act === 'forget' && window.confirm(T('forgetConfirm'))) {
      saveMine(mine().filter(function (x) { return x.code !== openSchool.code; }));
      openSchool = null; data = null; render();
    }
  });

  function downloadCsv() {
    var names = {}, titles = {};
    (data.classes || []).forEach(function (c) { names[c.code] = c.name; });
    chapters.forEach(function (ch) { titles[ch.key] = 'Ch ' + ch.number + ' ' + (ch.title && ch.title.en || ''); });
    var lines = [['class', 'students', 'quizzes', 'average quiz %', 'worksheets', 'experiments', 'last active']];
    (data.classes || []).forEach(function (c) { lines.push([c.name, c.students, c.quizzes, c.avg_quiz == null ? '' : c.avg_quiz, c.worksheets, c.experiments, day(c.last)]); });
    lines.push([]);
    lines.push(['class', 'chapter', 'average quiz %', 'quizzes', 'students']);
    (data.chapters || []).forEach(function (r) { lines.push([names[r.class] || r.class, titles[r.chapter] || r.chapter, r.avg, r.quizzes, r.students]); });
    var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'school-' + openSchool.code + '-results.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  applyLang();
  render();
})();
