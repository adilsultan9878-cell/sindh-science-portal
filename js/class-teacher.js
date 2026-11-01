/* Teacher class page (/class/): make a class, give students its code, and see their results.
   The class code is for students; the teacher key (shown once, kept on this device) opens the results.
   All data goes through the class functions in Supabase; the tables themselves are closed. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var MINE = 'ssp1.teacherClasses';
  var main = document.getElementById('main');
  var chapters = [];          // from the database, in book order
  var openClass = null;       // { code, key, name }
  var data = null;            // last results from the database

  var TEXT = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    title: { sd: 'استاد جو ڪلاس', ur: 'استاد کی کلاس', en: 'Teacher class' },
    intro: {
      sd: 'پنهنجو ڪلاس ٺاهيو ۽ ٻارن کي ڪلاس ڪوڊ ڏيو. ٻار «منهنجي ترقي» صفحي تي ڪوڊ لکن، پوءِ انهن جا ڪوئز، ورڪ شيٽ ۽ تجربي جا نتيجا هتي نظر ايندا.',
      ur: 'اپنی کلاس بنائیں اور بچوں کو کلاس کوڈ دیں۔ بچے «میری پیش رفت» صفحے پر کوڈ لکھیں، پھر ان کے کوئز، ورک شیٹ اور تجربے کے نتائج یہاں نظر آئیں گے۔',
      en: 'Make your class and give your students the class code. Students type it on the "My progress" page; their quiz, worksheet and experiment results then appear here.'
    },
    myClasses: { sd: 'منهنجا ڪلاس', ur: 'میری کلاسیں', en: 'My classes' },
    noClasses: { sd: 'هن فون تي اڃا ڪو ڪلاس ناهي.', ur: 'اس فون پر ابھی کوئی کلاس نہیں۔', en: 'No classes on this device yet.' },
    newClass: { sd: 'نئون ڪلاس ٺاهيو', ur: 'نئی کلاس بنائیں', en: 'Make a new class' },
    className: { sd: 'ڪلاس جو نالو', ur: 'کلاس کا نام', en: 'Class name' },
    classNameHint: { sd: 'مثال: ڪلاس 5-الف', ur: 'مثال: جماعت پنجم الف', en: 'For example: Class 5-A' },
    school: { sd: 'اسڪول (اختياري)', ur: 'اسکول (اختیاری)', en: 'School (optional)' },
    district: { sd: 'ضلعو (اختياري)', ur: 'ضلع (اختیاری)', en: 'District (optional)' },
    choose: { sd: 'چونڊيو', ur: 'منتخب کریں', en: 'Choose' },
    make: { sd: 'ڪلاس ٺاهيو', ur: 'کلاس بنائیں', en: 'Make class' },
    openOther: { sd: 'ٻئي فون تي ٺهيل ڪلاس کوليو', ur: 'دوسرے فون پر بنی کلاس کھولیں', en: 'Open a class made on another device' },
    code: { sd: 'ڪلاس ڪوڊ', ur: 'کلاس کوڈ', en: 'Class code' },
    key: { sd: 'استاد جي ڪنجي', ur: 'استاد کی کلید', en: 'Teacher key' },
    open: { sd: 'کوليو', ur: 'کھولیں', en: 'Open' },
    made: { sd: 'ڪلاس ٺهي ويو!', ur: 'کلاس بن گئی!', en: 'Your class is ready!' },
    madeHelp: {
      sd: 'ڪلاس ڪوڊ ٻارن کي ڏيو. استاد جي ڪنجي رڳو توهان لاءِ آهي — ان کي لکي محفوظ رکو. ٻئي فون تي نتيجا ڏسڻ لاءِ ٻنهي جي ضرورت پوندي.',
      ur: 'کلاس کوڈ بچوں کو دیں۔ استاد کی کلید صرف آپ کے لیے ہے — اسے لکھ کر محفوظ رکھیں۔ دوسرے فون پر نتائج دیکھنے کے لیے دونوں کی ضرورت ہوگی۔',
      en: 'Give the class code to your students. The teacher key is only for you — write it down and keep it safe. You need both to see the results on another device.'
    },
    printCode: { sd: 'ڪوڊ ڇاپيو (ڪلاس لاءِ)', ur: 'کوڈ پرنٹ کریں (کلاس کے لیے)', en: 'Print the code for the class' },
    printTitle: { sd: 'اسان جي ڪلاس جو ڪوڊ', ur: 'ہماری کلاس کا کوڈ', en: 'Our class code' },
    printHow: { sd: 'ويب سائيٽ کوليو ← منهنجي ترقي ← منهنجو ڪلاس ← هي ڪوڊ ۽ پنهنجو نالو لکو', ur: 'ویب سائٹ کھولیں ← میری پیش رفت ← میری کلاس ← یہ کوڈ اور اپنا نام لکھیں', en: 'Open the website → My progress → My class → type this code and your name' },
    showKey: { sd: 'ڪنجي ڏيکاريو', ur: 'کلید دکھائیں', en: 'Show key' },
    refresh: { sd: 'تازو ڪريو', ur: 'تازہ کریں', en: 'Refresh' },
    csv: { sd: 'Excel (CSV) ڊائونلوڊ', ur: 'Excel (CSV) ڈاؤن لوڈ', en: 'Download for Excel (CSV)' },
    print: { sd: 'رپورٽ ڇاپيو', ur: 'رپورٹ پرنٹ کریں', en: 'Print report' },
    forget: { sd: 'هن فون مان هٽايو', ur: 'اس فون سے ہٹائیں', en: 'Remove from this device' },
    forgetConfirm: { sd: 'ڪلاس رڳو هن فون مان هٽندو، نتيجا محفوظ رهندا. پڪ آهي؟', ur: 'کلاس صرف اس فون سے ہٹے گی، نتائج محفوظ رہیں گے۔ یقین ہے؟', en: 'The class is only removed from this device; results stay saved. Are you sure?' },
    students: { sd: 'ٻار', ur: 'بچے', en: 'Students' },
    results: { sd: 'نتيجا', ur: 'نتائج', en: 'Results' },
    avgQuiz: { sd: 'ڪوئز جو اوسط', ur: 'کوئز کا اوسط', en: 'Average quiz score' },
    worksheets: { sd: 'ورڪ شيٽون', ur: 'ورک شیٹس', en: 'Worksheets' },
    experiments: { sd: 'تجربا', ur: 'تجربے', en: 'Experiments' },
    byStudent: { sd: 'هر ٻار جو بهترين ڪوئز اسڪور (هر باب)', ur: 'ہر بچے کا بہترین کوئز اسکور (ہر باب)', en: 'Best quiz score of each student (by chapter)' },
    student: { sd: 'ٻار', ur: 'بچہ', en: 'Student' },
    lastActive: { sd: 'آخري ڀيرو', ur: 'آخری بار', en: 'Last active' },
    remove: { sd: 'هٽايو', ur: 'ہٹائیں', en: 'Remove' },
    removeConfirm: { sd: 'هن ٻار جا سڀ نتيجا ختم ٿيندا. پڪ آهي؟', ur: 'اس بچے کے تمام نتائج ختم ہو جائیں گے۔ یقین ہے؟', en: 'All results of this student will be deleted. Are you sure?' },
    legend80: { sd: '80% يا وڌيڪ', ur: '80% یا زیادہ', en: '80% or more' },
    legend50: { sd: '50–79%', ur: '50–79%', en: '50–79%' },
    legendLow: { sd: '50% کان گهٽ', ur: '50% سے کم', en: 'below 50%' },
    recent: { sd: 'تازو ڪم', ur: 'حالیہ کام', en: 'Recent activity' },
    none: { sd: 'اڃا ڪو نتيجو ناهي. ٻارن کي ڪلاس ڪوڊ ڏيو.', ur: 'ابھی کوئی نتیجہ نہیں۔ بچوں کو کلاس کوڈ دیں۔', en: 'No results yet. Give your students the class code.' },
    kind_quiz: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quiz' },
    kind_worksheet: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' },
    kind_experiment: { sd: 'تجربو', ur: 'تجربہ', en: 'Experiment' },
    kind_game: { sd: 'راند', ur: 'کھیل', en: 'Game' },
    kind_competition: { sd: 'مقابلو', ur: 'مقابلہ', en: 'Competition' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Ch {n}' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    needName: { sd: 'ڪلاس جو نالو لکو.', ur: 'کلاس کا نام لکھیں۔', en: 'Write a class name.' },
    wrong: { sd: 'ڪوڊ يا ڪنجي غلط آهي.', ur: 'کوڈ یا کلید غلط ہے۔', en: 'The code or key is wrong.' },
    error: { sd: 'ڪجهه غلط ٿيو. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Something went wrong. Check the internet and try again.' },
    privacy: {
      sd: 'نتيجا رڳو اهو ڏسي سگهي ٿو جنهن وٽ ڪلاس ڪوڊ ۽ استاد جي ڪنجي ٻئي هجن. ٻارن کي رڳو پهريون نالو يا رول نمبر لکڻ لاءِ چئو.',
      ur: 'نتائج صرف وہی دیکھ سکتا ہے جس کے پاس کلاس کوڈ اور استاد کی کلید دونوں ہوں۔ بچوں سے صرف پہلا نام یا رول نمبر لکھوائیں۔',
      en: 'Only someone with both the class code and the teacher key can see the results. Ask students to use only a first name or roll number.'
    }
  };

  function lang() {
    try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return LANGS.indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; }
  }
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
  function remember(c) {
    var list = mine().filter(function (x) { return x.code !== c.code; });
    list.unshift({ code: c.code, key: c.key, name: c.name });
    saveMine(list.slice(0, 20));
  }
  function day(iso) { return iso ? String(iso).slice(0, 10) : ''; }

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

  /* ---------- pages ---------- */

  function render() {
    if (openClass) return renderClass();
    var list = mine();
    var districts = (window.CITIES || []).map(function (c) { return '<option value="' + esc(c.en) + '">' + esc(L(c)) + '</option>'; }).join('');
    main.innerHTML =
      '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › ' + esc(T('title')) + '</p>' +
      '<h1>' + esc(T('title')) + '</h1><p>' + esc(T('intro')) + '</p>' +
      '<section class="card"><h2>' + esc(T('myClasses')) + '</h2>' +
        (list.length ? '<div class="tc-classes">' + list.map(function (c) {
          return '<button type="button" class="chip" data-open="' + esc(c.code) + '"><strong>' + esc(c.name) + '</strong> <span class="ltr">' + esc(c.code) + '</span></button>';
        }).join('') + '</div>' : '<p class="muted">' + esc(T('noClasses')) + '</p>') +
      '</section>' +
      '<div class="tc-grid">' +
        '<form class="card tc-form" id="new-class" novalidate><h2>' + esc(T('newClass')) + '</h2>' +
          '<label class="field"><span>' + esc(T('className')) + '</span><input type="text" name="name" maxlength="60" placeholder="' + esc(T('classNameHint')) + '"></label>' +
          '<label class="field"><span>' + esc(T('school')) + '</span><input type="text" name="school" maxlength="80"></label>' +
          '<label class="field"><span>' + esc(T('district')) + '</span><select name="district"><option value="">' + esc(T('choose')) + '</option>' + districts + '</select></label>' +
          '<button type="submit" class="btn">' + esc(T('make')) + '</button><span class="form-msg" aria-live="polite"></span></form>' +
        '<form class="card tc-form" id="open-class" novalidate><h2>' + esc(T('openOther')) + '</h2>' +
          '<label class="field"><span>' + esc(T('code')) + '</span><input type="text" name="code" maxlength="6" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>' +
          '<label class="field"><span>' + esc(T('key')) + '</span><input type="text" name="key" maxlength="10" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>' +
          '<button type="submit" class="btn ghost">' + esc(T('open')) + '</button><span class="form-msg" aria-live="polite"></span></form>' +
      '</div>' +
      '<p class="muted small">' + esc(T('privacy')) + '</p>';

    main.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = mine().filter(function (x) { return x.code === b.getAttribute('data-open'); })[0];
        if (c) { openClass = c; data = null; render(); }
      });
    });
    var nf = document.getElementById('new-class');
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = nf.querySelector('.form-msg'), name = nf.name.value.trim();
      if (!name) { msg.textContent = T('needName'); return; }
      msg.textContent = T('wait');
      rpc('create_classroom', { p_name: name, p_school: nf.school.value.trim() || null, p_district: nf.district.value || null }).then(function (r) {
        var c = { code: r.code, key: r.key, name: name };
        remember(c);
        openClass = c; data = null;
        renderMade(c);
      }).catch(function () { msg.textContent = T('error'); });
    });
    var of = document.getElementById('open-class');
    of.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = of.querySelector('.form-msg');
      var code = of.code.value.replace(/\s+/g, '').toUpperCase(), key = of.key.value.replace(/\s+/g, '').toUpperCase();
      msg.textContent = T('wait');
      rpc('class_results', { p_code: code, p_key: key }).then(function (d) {
        var c = { code: d.class.code, key: key, name: d.class.name };
        remember(c);
        openClass = c; data = d;
        render();
      }).catch(function (err) { msg.textContent = err.status && err.status < 500 ? T('wrong') : T('error'); });
    });
  }

  // Shown once, right after a class is made: the code for students and the key for the teacher.
  function renderMade(c) {
    main.innerHTML =
      '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › <a href="#" data-home>' + esc(T('title')) + '</a></p>' +
      '<section class="card note ok"><h1>' + esc(T('made')) + '</h1>' +
        '<p>' + esc(T('code')) + ':</p><p class="bigcode">' + esc(c.code) + '</p>' +
        '<p>' + esc(T('key')) + ': <span class="keycode">' + esc(c.key) + '</span></p>' +
        '<p>' + esc(T('madeHelp')) + '</p>' +
        '<div class="btn-row"><button type="button" class="btn" data-act="print-code">' + esc(T('printCode')) + '</button>' +
        '<button type="button" class="btn ghost" data-act="go">' + esc(T('open')) + ' →</button></div></section>' +
      printCard(c);
    main.querySelector('[data-home]').addEventListener('click', function (e) { e.preventDefault(); openClass = null; render(); });
    main.querySelector('[data-act="go"]').addEventListener('click', function () { render(); });
    main.querySelector('[data-act="print-code"]').addEventListener('click', printCode);
  }
  function printCard(c) {
    return '<div class="print-card"><h1>' + esc(T('printTitle')) + '</h1><p>' + esc(c.name) + '</p><p class="bigcode">' + esc(c.code) + '</p>' +
      '<p>' + esc(T('printHow')) + '</p><p class="ltr">sindh-science-portal.vercel.app</p></div>';
  }
  function printCode() {
    document.body.classList.add('print-code');
    window.print();
    document.body.classList.remove('print-code');
  }

  function renderClass() {
    var c = openClass;
    main.innerHTML = '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › <a href="#" data-home>' + esc(T('title')) + '</a> › ' + esc(c.name) + '</p>' +
      '<p class="loading">' + esc(T('wait')) + '</p>';
    main.querySelector('[data-home]').addEventListener('click', function (e) { e.preventDefault(); openClass = null; render(); });
    var need = data ? Promise.resolve(data) : rpc('class_results', { p_code: c.code, p_key: c.key });
    Promise.all([need, loadChapters()]).then(function (res) {
      data = res[0];
      drawClass();
    }).catch(function (err) {
      main.insertAdjacentHTML('beforeend', '<p class="form-msg">' + esc(err.status && err.status <500 ? T('wrong') : T('error')) + '</p>');
    });
  }

  function loadChapters() {
    if (chapters.length) return Promise.resolve(chapters);
    return rpc('public_subject', { p_class: '5', p_subject: 'science' }).then(function (list) {
      chapters = (list || []).map(function (ch) { return { key: '5/science/' + ch.id, number: ch.number, title: ch.title }; });
      return chapters;
    }).catch(function () { return []; });
  }

  // Per student: best quiz % per chapter, worksheets and experiments done, last activity.
  function summarise(rows) {
    var students = {}, quizSum = 0, quizN = 0, ws = 0, ex = 0;
    rows.forEach(function (r) {
      var s = students[r.student] || (students[r.student] = { name: r.student, best: {}, ws: 0, ex: 0, last: '' });
      if (r.at > s.last) s.last = r.at;
      if (r.kind === 'quiz' && r.total) {
        var pct = Math.round(100 * r.score / r.total);
        if (s.best[r.chapter] == null || pct > s.best[r.chapter]) s.best[r.chapter] = pct;
        quizSum += pct; quizN++;
      }
      if (r.kind === 'worksheet') { s.ws++; ws++; }
      if (r.kind === 'experiment') { s.ex++; ex++; }
    });
    return { students: Object.keys(students).sort().map(function (k) { return students[k]; }), avg: quizN ? Math.round(quizSum / quizN) : null, ws: ws, ex: ex };
  }

  function drawClass() {
    var c = openClass, rows = data.results || [], sum = summarise(rows), info = data.class;
    var chs = chapters.length ? chapters : [];
    var head = '<div class="tc-head"><div><h1>' + esc(info.name) + '</h1><p class="muted">' + esc([info.school, info.district].filter(Boolean).join(' · ')) + '</p></div>' +
      '<div><p>' + esc(T('code')) + ': <span class="keycode">' + esc(info.code) + '</span></p>' +
      '<p class="no-print"><button type="button" class="btn ghost small" data-act="key">' + esc(T('showKey')) + '</button> <span class="keycode" data-keyval hidden>' + esc(c.key) + '</span></p></div></div>';
    var tools = '<div class="btn-row no-print">' +
      '<button type="button" class="btn small" data-act="refresh">' + esc(T('refresh')) + '</button>' +
      '<button type="button" class="btn ghost small" data-act="csv">' + esc(T('csv')) + '</button>' +
      '<button type="button" class="btn ghost small" data-act="print">' + esc(T('print')) + '</button>' +
      '<button type="button" class="btn ghost small" data-act="print-code">' + esc(T('printCode')) + '</button>' +
      '<button type="button" class="btn ghost small danger" data-act="forget">' + esc(T('forget')) + '</button></div>';
    var tiles = '<div class="tc-tiles">' +
      tile(sum.students.length, T('students')) + tile(rows.length, T('results')) +
      tile(sum.avg == null ? '—' : sum.avg + '%', T('avgQuiz')) + tile(sum.ws, T('worksheets')) + tile(sum.ex, T('experiments')) + '</div>';
    var table;
    if (!sum.students.length) table = '<p class="card">' + esc(T('none')) + '</p>';
    else {
      table = '<h2>' + esc(T('byStudent')) + '</h2>' +
        '<p class="tc-legend"><span class="g">' + esc(T('legend80')) + '</span><span class="o">' + esc(T('legend50')) + '</span><span class="l">' + esc(T('legendLow')) + '</span></p>' +
        '<div class="table-wrap"><table class="table tc-table"><thead><tr><th>' + esc(T('student')) + '</th>' +
        chs.map(function (ch) { return '<th title="' + esc(L(ch.title)) + '">' + esc(T('chapterN', { n: ch.number })) + '</th>'; }).join('') +
        '<th>' + esc(T('worksheets')) + '</th><th>' + esc(T('experiments')) + '</th><th>' + esc(T('lastActive')) + '</th><th class="no-print"></th></tr></thead><tbody>' +
        sum.students.map(function (s) {
          return '<tr><td><strong>' + esc(s.name) + '</strong></td>' +
            chs.map(function (ch) {
              var v = s.best[ch.key];
              var cls = v == null ? 'none' : v >= 80 ? 'good' : v >= 50 ? 'ok' : 'low';
              return '<td class="' + cls + '">' + (v == null ? '—' : v + '%') + '</td>';
            }).join('') +
            '<td>' + s.ws + '</td><td>' + s.ex + '</td><td class="ltr">' + esc(day(s.last)) + '</td>' +
            '<td class="no-print"><button type="button" class="btn ghost small danger" data-remove="' + esc(s.name) + '">' + esc(T('remove')) + '</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    var titles = {};
    chs.forEach(function (ch) { titles[ch.key] = T('chapterN', { n: ch.number }) + ': ' + L(ch.title); });
    var recent = rows.length ? '<h2>' + esc(T('recent')) + '</h2><ul class="tc-recent">' + rows.slice(0, 25).map(function (r) {
      return '<li><span class="ltr muted">' + esc(day(r.at)) + '</span> · <strong>' + esc(r.student) + '</strong> · ' + esc(T('kind_' + r.kind)) +
        (r.chapter ? ' · ' + esc(titles[r.chapter] || r.chapter) : '') + (r.total ? ' · <span class="ltr">' + r.score + '/' + r.total + '</span>' : '') + '</li>';
    }).join('') + '</ul>' : '';
    main.innerHTML = '<p class="crumbs no-print"><a href="/">' + esc(T('siteName')) + '</a> › <a href="#" data-home>' + esc(T('title')) + '</a> › ' + esc(info.name) + '</p>' +
      head + tools + tiles + table + recent + printCard({ code: info.code, name: info.name });

    main.querySelector('[data-home]').addEventListener('click', function (e) { e.preventDefault(); openClass = null; render(); });
  }
  function tile(n, label) { return '<div class="card"><b>' + esc(n) + '</b><span>' + esc(label) + '</span></div>'; }

  function onClassClick(e) {
    var b = e.target.closest('[data-act], [data-remove]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'key') { var k = main.querySelector('[data-keyval]'); k.hidden = !k.hidden; }
    if (act === 'refresh') { data = null; renderClass(); }
    if (act === 'print') window.print();
    if (act === 'print-code') printCode();
    if (act === 'csv') downloadCsv();
    if (act === 'forget' && window.confirm(T('forgetConfirm'))) {
      saveMine(mine().filter(function (x) { return x.code !== openClass.code; }));
      openClass = null; data = null; render();
    }
    var who = b.getAttribute('data-remove');
    if (who && window.confirm(T('removeConfirm') + '\n' + who)) {
      rpc('class_remove_student', { p_code: openClass.code, p_key: openClass.key, p_student: who }).then(function () {
        data = null; renderClass();
      }).catch(function () { window.alert(T('error')); });
    }
  }

  function downloadCsv() {
    var titles = {};
    chapters.forEach(function (ch) { titles[ch.key] = 'Ch ' + ch.number + ' ' + (ch.title && ch.title.en || ''); });
    var lines = [['date', 'student', 'activity', 'chapter', 'score', 'total', 'percent']];
    (data.results || []).forEach(function (r) {
      lines.push([String(r.at).slice(0, 16).replace('T', ' '), r.student, r.kind, titles[r.chapter] || r.chapter || '', r.score == null ? '' : r.score,
        r.total == null ? '' : r.total, r.total ? Math.round(100 * r.score / r.total) : '']);
    });
    var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'class-' + openClass.code + '-results.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  main.addEventListener('click', function (e) { if (openClass && data) onClassClick(e); });
  applyLang();
  render();
})();
