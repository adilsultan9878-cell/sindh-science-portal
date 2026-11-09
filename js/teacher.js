/* Teacher page (/class/). The admin makes a teacher's account (email + password) in the staff panel; the teacher
   signs in here, makes a class, types the students' names and gets a username + PIN slip for each child,
   gives homework, resets forgotten PINs and sees who is behind. Same sign-in as the staff panel (ssp-staff-session).
   Database: teacher_classes, teacher_class_create, teacher_add_students, teacher_reset_pin, teacher_remove_student,
   teacher_class_data, teacher_homework_add, teacher_homework_delete. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || {};
  var SESSION_KEY = 'ssp-staff-session';
  var LANGS = ['sd', 'ur', 'en'], RTL = { sd: 1, ur: 1 };
  var main = document.getElementById('main');
  var openCode = null, data = null, chapters = [], tab = 'students', slips = null;

  var TEXT = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    title: { sd: 'استاد جو صفحو', ur: 'استاد کا صفحہ', en: 'Teacher page' },
    signIn: { sd: 'استاد لاگ ان', ur: 'استاد لاگ ان', en: 'Teacher login' },
    signInText: { sd: 'اي ميل ۽ پاسورڊ سان لاگ ان ڪريو. اهي ايڊمن ڏيندو.', ur: 'ای میل اور پاس ورڈ سے لاگ ان کریں۔ یہ ایڈمن دیتا ہے۔', en: 'Log in with the email and password the admin gave you.' },
    email: { sd: 'اي ميل', ur: 'ای میل', en: 'Email' },
    password: { sd: 'پاسورڊ', ur: 'پاس ورڈ', en: 'Password' },
    login: { sd: 'لاگ ان', ur: 'لاگ ان', en: 'Log in' },
    logout: { sd: 'لاگ آئوٽ', ur: 'لاگ آؤٹ', en: 'Log out' },
    wrongLogin: { sd: 'اي ميل يا پاسورڊ غلط آهي.', ur: 'ای میل یا پاس ورڈ غلط ہے۔', en: 'Wrong email or password.' },
    notTeacher: { sd: 'هي اڪائونٽ استاد جو ناهي. ايڊمن کان پڇو.', ur: 'یہ اکاؤنٹ استاد کا نہیں۔ ایڈمن سے پوچھیں۔', en: 'This is not a teacher account. Ask the admin.' },
    myClasses: { sd: 'منهنجا ڪلاس', ur: 'میری کلاسیں', en: 'My classes' },
    noClasses: { sd: 'اڃا ڪو ڪلاس ناهي. هيٺ ڪلاس ٺاهيو.', ur: 'ابھی کوئی کلاس نہیں۔ نیچے کلاس بنائیں۔', en: 'No class yet. Make one below.' },
    newClass: { sd: 'نئون ڪلاس', ur: 'نئی کلاس', en: 'New class' },
    className: { sd: 'ڪلاس جو نالو (مثال: پنجون الف)', ur: 'کلاس کا نام (مثال: پنجم الف)', en: 'Class name (e.g. Class 5 A)' },
    school: { sd: 'اسڪول', ur: 'اسکول', en: 'School' },
    make: { sd: 'ڪلاس ٺاهيو', ur: 'کلاس بنائیں', en: 'Make the class' },
    students: { sd: 'شاگرد', ur: 'طلبہ', en: 'Students' },
    homework: { sd: 'گهر جو ڪم', ur: 'ہوم ورک', en: 'Homework' },
    behind: { sd: 'پوئتي رهيل', ur: 'پیچھے رہ جانے والے', en: 'Who is behind' },
    back: { sd: 'سڀ ڪلاس', ur: 'سب کلاسیں', en: 'All classes' },
    addStudents: { sd: 'شاگردن جا اڪائونٽ ٺاهيو', ur: 'طلبہ کے اکاؤنٹ بنائیں', en: 'Make students\' accounts' },
    namesHelp: { sd: 'هر قطار ۾ هڪ نالو (60 تائين). سائيٽ هر ٻار لاءِ يوزر نالو ۽ پن ٺاهيندي.', ur: 'ہر لائن میں ایک نام (60 تک)۔ سائٹ ہر بچے کا یوزر نیم اور پن بنائے گی۔', en: 'One name per line (up to 60). The site makes a username and PIN for each child.' },
    makeAccounts: { sd: 'اڪائونٽ ٺاهيو', ur: 'اکاؤنٹ بنائیں', en: 'Make accounts' },
    name: { sd: 'نالو', ur: 'نام', en: 'Name' },
    username: { sd: 'يوزر نالو', ur: 'یوزر نیم', en: 'Username' },
    pin: { sd: 'پن', ur: 'پن', en: 'PIN' },
    points: { sd: 'پوائنٽس', ur: 'پوائنٹس', en: 'Points' },
    last: { sd: 'آخري ڀيرو', ur: 'آخری بار', en: 'Last active' },
    newPin: { sd: 'نئون پن', ur: 'نیا پن', en: 'New PIN' },
    newPinAsk: { sd: '{n} لاءِ نئون پن ٺاهيو؟ پراڻو پن ڪم نه ڪندو.', ur: '{n} کے لیے نیا پن بنائیں؟ پرانا پن کام نہیں کرے گا۔', en: 'Make a new PIN for {n}? The old PIN will stop working.' },
    remove: { sd: 'ڪلاس مان ڪڍو', ur: 'کلاس سے نکالیں', en: 'Remove' },
    removeAsk: { sd: '{n} کي ڪلاس مان ڪڍيو؟ ٻار جو اڪائونٽ ۽ پيش رفت رهندي.', ur: '{n} کو کلاس سے نکالیں؟ بچے کا اکاؤنٹ اور پیش رفت رہے گی۔', en: 'Remove {n} from the class? The child keeps the account and progress.' },
    report: { sd: 'رپورٽ', ur: 'رپورٹ', en: 'Report' },
    noStudents: { sd: 'اڃا ڪو شاگرد ناهي.', ur: 'ابھی کوئی طالب علم نہیں۔', en: 'No students yet.' },
    slipsTitle: { sd: 'لاگ ان پرچيون', ur: 'لاگ ان پرچیاں', en: 'Login slips' },
    slipsNote: { sd: 'هي پن هاڻي ئي ڏسي سگهجن ٿا. ڇاپيو يا لکي وٺو، پوءِ هر ٻار کي سندس پرچي ڏيو.', ur: 'یہ پن ابھی ہی نظر آئیں گے۔ پرنٹ کریں یا لکھ لیں، پھر ہر بچے کو اس کی پرچی دیں۔', en: 'These PINs are shown only now. Print or copy them, then give each child their slip.' },
    print: { sd: 'ڇاپيو', ur: 'پرنٹ کریں', en: 'Print' },
    done: { sd: 'ٺيڪ', ur: 'ٹھیک ہے', en: 'Done' },
    site: { sd: 'ويب سائيٽ', ur: 'ویب سائٹ', en: 'Website' },
    parents: { sd: 'والدين جي لنڪ', ur: 'والدین کا لنک', en: 'Parents\' link' },
    hwAdd: { sd: 'گهر جو ڪم ڏيو', ur: 'ہوم ورک دیں', en: 'Give homework' },
    chapter: { sd: 'باب', ur: 'باب', en: 'Chapter' },
    kind: { sd: 'ڪم', ur: 'کام', en: 'Work' },
    due: { sd: 'آخري تاريخ', ur: 'آخری تاریخ', en: 'Due date' },
    give: { sd: 'ڏيو', ur: 'دیں', en: 'Give' },
    noHw: { sd: 'اڃا ڪو گهر جو ڪم ناهي.', ur: 'ابھی کوئی ہوم ورک نہیں۔', en: 'No homework yet.' },
    didIt: { sd: 'ڪيو: {d} / {n}', ur: 'کیا: {d} / {n}', en: 'Done: {d} / {n}' },
    notYet: { sd: 'اڃا نه ڪيو:', ur: 'ابھی نہیں کیا:', en: 'Not done yet:' },
    allDone: { sd: 'سڀني ڪري ورتو!', ur: 'سب نے کر لیا!', en: 'Everyone has done it!' },
    del: { sd: 'هٽايو', ur: 'ہٹائیں', en: 'Delete' },
    k_quiz: { sd: 'ڪوئز', ur: 'کوئز', en: 'Quiz' },
    k_worksheet: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' },
    k_experiment: { sd: 'تجربو', ur: 'تجربہ', en: 'Experiment' },
    idle: { sd: 'هن هفتي ڪجهه نه ڪيو', ur: 'اس ہفتے کچھ نہیں کیا', en: 'Nothing this week' },
    low: { sd: 'ڪوئز جو اوسط 50% کان گهٽ', ur: 'کوئز کا اوسط 50% سے کم', en: 'Quiz average under 50%' },
    nobody: { sd: 'ڪو به ناهي. شاباس!', ur: 'کوئی نہیں۔ شاباش!', en: 'Nobody. Well done!' },
    never: { sd: 'ڪڏهن نه', ur: 'کبھی نہیں', en: 'never' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    error: { sd: 'ڪجهه غلط ٿيو. ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔', en: 'Something went wrong. Please try again.' },
    waText: { sd: '{n} جي سائنس رپورٽ ({c}): پوائنٽس {p}، ڪوئز {q} (اوسط {a})، گهر جو ڪم {h}. تفصيل:', ur: '{n} کی سائنس رپورٹ ({c}): پوائنٹس {p}، کوئز {q} (اوسط {a})، ہوم ورک {h}۔ تفصیل:', en: '{n}\'s science report ({c}): points {p}, quizzes {q} (average {a}), homework {h}. Details:' }
  };

  function lang() { try { var l = JSON.parse(localStorage.getItem('ssp1.lang')); return LANGS.indexOf(l) >= 0 ? l : 'sd'; } catch (e) { return 'sd'; } }
  function T(k, vars) {
    var o = TEXT[k], s = (o && (o[lang()] || o.en)) || k;
    Object.keys(vars || {}).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function L(o) { return o && typeof o === 'object' ? (o[lang()] || o.en || '') : (o || ''); }
  function day(iso) { return iso ? new Date(iso).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'ur-PK', { day: 'numeric', month: 'short' }) : T('never'); }

  /* ---------- sign-in (same account as the staff panel) ---------- */

  function readSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function saveSession(s) { try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ } }
  function keep(d) { saveSession({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at ? +d.expires_at : Math.floor(Date.now() / 1000) + (+d.expires_in || 3600) }); }
  function auth(path, body) {
    return fetch(CFG.supabaseUrl + '/auth/v1/' + path, { method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error_description || d.msg || 'auth'); return d; }); });
  }
  function fresh() {
    var s = readSession();
    if (!s) return Promise.reject(new Error('signed_out'));
    if (s.expires_at - Date.now() / 1000 > 60) return Promise.resolve(s);
    return auth('token?grant_type=refresh_token', { refresh_token: s.refresh_token }).then(function (d) { keep(d); return readSession(); },
      function () { saveSession(null); throw new Error('signed_out'); });
  }
  function rpc(fn, args) {
    return fresh().then(function (s) {
      return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, { method: 'POST', body: JSON.stringify(args || {}),
        headers: { apikey: CFG.supabaseKey, Authorization: 'Bearer ' + s.access_token, 'Content-Type': 'application/json' } });
    }).then(function (r) {
      return r.text().then(function (txt) {
        var d = null; try { d = txt ? JSON.parse(txt) : null; } catch (e) { d = txt; }
        if (r.status === 401) { saveSession(null); throw new Error('signed_out'); }
        if (!r.ok) throw new Error((d && d.message) || ('Error ' + r.status));
        return d;
      });
    });
  }
  function fail(e) {
    if (/signed_out/.test(e.message)) return render();
    var m = /teachers_only|not_your_class/.test(e.message) ? T('notTeacher') : T('error');
    main.insertAdjacentHTML('beforeend', '<p class="form-msg card">' + esc(m) + '</p>');
  }

  /* ---------- pages ---------- */

  function head(extra) {
    return '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › ' + (extra ? '<a href="#" data-act="home">' + esc(T('title')) + '</a> › ' + esc(extra) : esc(T('title'))) + '</p>';
  }
  function render() {
    applyLang();
    if (!readSession()) return viewLogin();
    if (slips) return viewSlips();
    if (openCode) return viewClass();
    return viewHome();
  }

  function viewLogin() {
    main.innerHTML = head() + '<form class="card tc-login" data-form="login"><h1>' + esc(T('signIn')) + '</h1><p class="muted">' + esc(T('signInText')) + '</p>' +
      '<label class="field"><span>' + esc(T('email')) + '</span><input name="email" type="email" dir="ltr" autocomplete="username" required></label>' +
      '<label class="field"><span>' + esc(T('password')) + '</span><input name="pw" type="password" dir="ltr" autocomplete="current-password" required></label>' +
      '<p><button class="btn" type="submit">' + esc(T('login')) + '</button> <span class="form-msg" aria-live="polite"></span></p></form>';
  }

  function viewHome() {
    main.innerHTML = head() + '<div class="tc-head"><h1>' + esc(T('myClasses')) + '</h1><button type="button" class="btn ghost small" data-act="logout">' + esc(T('logout')) + '</button></div>' +
      '<p class="loading">' + esc(T('wait')) + '</p>';
    rpc('teacher_classes').then(function (list) {
      main.querySelector('.loading').outerHTML = (list.length ? '<div class="tc-classes">' + list.map(function (c) {
        return '<button type="button" class="card tc-class" data-open="' + esc(c.code) + '"><b>' + esc(c.name) + '</b><span class="muted">' + esc(c.school || '') + '</span><span>' + esc(T('students')) + ': ' + c.students + '</span></button>';
      }).join('') + '</div>' : '<p class="muted">' + esc(T('noClasses')) + '</p>') +
        '<form class="card tc-form" data-form="class"><h2>' + esc(T('newClass')) + '</h2>' +
        '<label class="field"><span>' + esc(T('className')) + '</span><input name="name" maxlength="60" required></label>' +
        '<label class="field"><span>' + esc(T('school')) + '</span><input name="school" maxlength="80"></label>' +
        '<p><button class="btn" type="submit">' + esc(T('make')) + '</button> <span class="form-msg" aria-live="polite"></span></p></form>';
    }).catch(function (e) { var l = main.querySelector('.loading'); if (l) l.remove(); fail(e); });
  }

  function loadChapters() {
    if (chapters.length) return Promise.resolve(chapters);
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/public_subject', { method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class: '5', p_subject: 'science' }) })
      .then(function (r) { return r.json(); }).then(function (list) {
        chapters = (list || []).map(function (ch) { return { key: '5/science/' + ch.id, number: ch.number, title: ch.title }; }).sort(function (a, b) { return a.number - b.number; });
        return chapters;
      }).catch(function () { return []; });
  }
  function chTitle(key) { var c = chapters.filter(function (x) { return x.key === key; })[0]; return c ? c.number + '. ' + L(c.title) : key; }

  function viewClass() {
    main.innerHTML = head('…') + '<p class="loading">' + esc(T('wait')) + '</p>';
    Promise.all([rpc('teacher_class_data', { p_code: openCode }), loadChapters()]).then(function (res) { data = res[0]; drawClass(); })
      .catch(function (e) { var l = main.querySelector('.loading'); if (l) l.remove(); fail(e); });
  }
  // per student: quiz average, quizzes done, homework done, last activity
  function stats(st) {
    var rows = data.results.filter(function (r) { return r.student_id === st.id; });
    var q = rows.filter(function (r) { return r.kind === 'quiz' && r.total; });
    var avg = q.length ? Math.round(q.reduce(function (n, r) { return n + 100 * r.score / r.total; }, 0) / q.length) : null;
    var hwDone = data.homework.filter(function (h) { return (h.done || []).indexOf(st.id) >= 0; }).length;
    return { quizzes: q.length, avg: avg, hw: hwDone + '/' + data.homework.length };
  }
  function waLink(st) {
    var s = stats(st), link = location.origin + '/parent/?c=' + st.parent;
    var text = T('waText', { n: st.name, c: data.class.name, p: st.points, q: s.quizzes, a: s.avg == null ? '–' : s.avg + '%', h: s.hw }) + ' ' + link;
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }
  function drawClass() {
    var c = data.class, studs = data.students;
    var tabs = ['students', 'homework', 'behind'].map(function (k) {
      return '<button type="button" class="chip" data-tab="' + k + '" aria-current="' + (tab === k) + '">' + esc(T(k)) + '</button>';
    }).join('');
    var body = '';
    if (tab === 'students') {
      body = '<form class="card tc-form" data-form="students"><h2>' + esc(T('addStudents')) + '</h2><p class="muted small">' + esc(T('namesHelp')) + '</p>' +
        '<textarea name="names" rows="5" required></textarea><p><button class="btn" type="submit">' + esc(T('makeAccounts')) + '</button> <span class="form-msg" aria-live="polite"></span></p></form>' +
        (studs.length ? '<div class="table-wrap"><table class="table tc-table"><thead><tr><th>' + esc(T('name')) + '</th><th>' + esc(T('username')) + '</th><th>' + esc(T('points')) + '</th><th>' + esc(T('last')) + '</th><th></th></tr></thead><tbody>' +
          studs.map(function (st) {
            return '<tr><td>' + esc(st.name) + '</td><td class="ltr">' + esc(st.username) + '</td><td>' + st.points + '</td><td>' + esc(day(st.last)) + '</td><td class="tc-acts">' +
              '<button type="button" class="btn small ghost" data-pin="' + esc(st.id) + '">' + esc(T('newPin')) + '</button> ' +
              '<a class="btn small ghost" target="_blank" rel="noopener" href="' + esc(waLink(st)) + '">WhatsApp</a> ' +
              '<button type="button" class="btn small ghost" data-remove="' + esc(st.id) + '">' + esc(T('remove')) + '</button></td></tr>';
          }).join('') + '</tbody></table></div>' : '<p class="muted">' + esc(T('noStudents')) + '</p>');
    } else if (tab === 'homework') {
      var today = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
      body = '<form class="card tc-form" data-form="hw"><h2>' + esc(T('hwAdd')) + '</h2>' +
        '<label class="field"><span>' + esc(T('chapter')) + '</span><select name="chapter">' + chapters.map(function (ch) { return '<option value="' + esc(ch.key) + '">' + esc(ch.number + '. ' + L(ch.title)) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>' + esc(T('kind')) + '</span><select name="kind">' + ['quiz', 'worksheet', 'experiment'].map(function (k) { return '<option value="' + k + '">' + esc(T('k_' + k)) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>' + esc(T('due')) + '</span><input name="due" type="date" value="' + today + '"></label>' +
        '<p><button class="btn" type="submit">' + esc(T('give')) + '</button> <span class="form-msg" aria-live="polite"></span></p></form>' +
        (data.homework.length ? data.homework.map(function (h) {
          var done = h.done || [], missing = studs.filter(function (st) { return done.indexOf(st.id) < 0; });
          return '<section class="card tc-hw"><h3>' + esc(T('k_' + h.kind)) + ' · ' + esc(chTitle(h.chapter)) + '</h3>' +
            (h.due ? '<p class="muted small">' + esc(T('due')) + ': ' + esc(day(h.due + 'T00:00:00')) + '</p>' : '') +
            '<p><b>' + esc(T('didIt', { d: studs.length - missing.length, n: studs.length })) + '</b></p>' +
            (studs.length ? (missing.length ? '<p class="small">' + esc(T('notYet')) + ' ' + missing.map(function (st) { return esc(st.name); }).join('، ') + '</p>' : '<p class="small">' + esc(T('allDone')) + '</p>') : '') +
            '<button type="button" class="btn small ghost" data-hwdel="' + h.id + '">' + esc(T('del')) + '</button></section>';
        }).join('') : '<p class="muted">' + esc(T('noHw')) + '</p>');
    } else {
      var weekAgo = Date.now() - 7 * 864e5;
      var idle = studs.filter(function (st) { return !st.last || new Date(st.last).getTime() < weekAgo; });
      var low = studs.filter(function (st) { var s = stats(st); return s.avg != null && s.avg < 50; });
      function list(arr, extra) { return arr.length ? '<ul>' + arr.map(function (st) { return '<li>' + esc(st.name) + (extra ? ' — ' + esc(extra(st)) : '') + ' <a class="small" target="_blank" rel="noopener" href="' + esc(waLink(st)) + '">WhatsApp</a></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(T('nobody')) + '</p>'; }
      body = '<section class="card"><h2>' + esc(T('idle')) + '</h2>' + list(idle, function (st) { return T('last') + ': ' + day(st.last); }) + '</section>' +
        '<section class="card"><h2>' + esc(T('low')) + '</h2>' + list(low, function (st) { return stats(st).avg + '%'; }) + '</section>';
    }
    main.innerHTML = head(c.name) + '<div class="tc-head"><h1>' + esc(c.name) + '</h1><button type="button" class="btn ghost small" data-act="home">' + esc(T('back')) + '</button></div>' +
      (c.school ? '<p class="muted">' + esc(c.school) + '</p>' : '') + '<div class="tc-classes tc-tabs">' + tabs + '</div>' + body;
  }

  function viewSlips() {
    var site = location.origin;
    main.innerHTML = '<div class="no-print">' + head(T('slipsTitle')) + '<h1>' + esc(T('slipsTitle')) + '</h1><p class="note card">' + esc(T('slipsNote')) + '</p>' +
      '<p><button type="button" class="btn" data-act="print">' + esc(T('print')) + '</button> <button type="button" class="btn ghost" data-act="slipsdone">' + esc(T('done')) + '</button></p></div>' +
      '<div class="tc-slips">' + slips.map(function (k) {
        return '<div class="tc-slip"><p class="tc-slip-name">' + esc(k.name) + '</p>' +
          '<p>' + esc(T('site')) + ': <span class="ltr">' + esc(site.replace(/^https?:\/\//, '')) + '</span></p>' +
          '<p>' + esc(T('username')) + ': <b class="ltr">' + esc(k.username) + '</b></p>' +
          '<p>' + esc(T('pin')) + ': <b class="ltr">' + esc(k.pin) + '</b></p>' +
          (k.parent ? '<p class="small">' + esc(T('parents')) + ': <span class="ltr">' + esc(site.replace(/^https?:\/\//, '') + '/parent/?c=' + k.parent) + '</span></p>' : '') + '</div>';
      }).join('') + '</div>';
  }

  /* ---------- actions ---------- */

  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act],[data-open],[data-tab],[data-pin],[data-remove],[data-hwdel]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act) e.preventDefault();
    if (act === 'home') { openCode = null; data = null; tab = 'students'; render(); }
    else if (act === 'logout') { saveSession(null); openCode = null; render(); }
    else if (act === 'print') window.print();
    else if (act === 'slipsdone') { slips = null; render(); }
    else if (b.hasAttribute('data-open')) { openCode = b.getAttribute('data-open'); tab = 'students'; render(); }
    else if (b.hasAttribute('data-tab')) { tab = b.getAttribute('data-tab'); drawClass(); }
    else if (b.hasAttribute('data-pin')) {
      var st = data.students.filter(function (x) { return x.id === b.getAttribute('data-pin'); })[0];
      if (!st || !window.confirm(T('newPinAsk', { n: st.name }))) return;
      rpc('teacher_reset_pin', { p_student: st.id }).then(function (pin) {
        slips = [{ name: st.name, username: st.username, pin: pin, parent: st.parent }]; render();
      }).catch(fail);
    } else if (b.hasAttribute('data-remove')) {
      var rs = data.students.filter(function (x) { return x.id === b.getAttribute('data-remove'); })[0];
      if (!rs || !window.confirm(T('removeAsk', { n: rs.name }))) return;
      rpc('teacher_remove_student', { p_student: rs.id }).then(viewClass).catch(fail);
    } else if (b.hasAttribute('data-hwdel')) {
      rpc('teacher_homework_delete', { p_id: +b.getAttribute('data-hwdel') }).then(viewClass).catch(fail);
    }
  });

  main.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, kind = f.getAttribute('data-form'), msg = f.querySelector('.form-msg');
    if (msg) msg.textContent = T('wait');
    function err(x) { if (/signed_out/.test(x.message)) return render(); if (msg) msg.textContent = /teachers_only/.test(x.message) ? T('notTeacher') : T('error'); }
    if (kind === 'login') {
      auth('token?grant_type=password', { email: f.email.value.trim(), password: f.pw.value }).then(function (d) { keep(d); render(); })
        .catch(function () { msg.textContent = T('wrongLogin'); });
    } else if (kind === 'class') {
      rpc('teacher_class_create', { p_name: f.name.value.trim(), p_school: f.school.value.trim() || null }).then(function (code) { openCode = code; render(); }).catch(err);
    } else if (kind === 'students') {
      var names = f.names.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 60);
      if (!names.length) { msg.textContent = ''; return; }
      rpc('teacher_add_students', { p_code: openCode, p_names: names }).then(function (list) { slips = list; data = null; render(); }).catch(err);
    } else if (kind === 'hw') {
      rpc('teacher_homework_add', { p_code: openCode, p_chapter: f.chapter.value, p_kind: f.kind.value, p_due: f.due.value || null }).then(viewClass).catch(err);
    }
  });

  function applyLang() {
    var l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    var n = document.getElementById('site-name'); if (n) n.textContent = T('siteName');
    document.title = T('title') + ' | ' + T('siteName');
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]');
    if (!b) return;
    try { localStorage.setItem('ssp1.lang', JSON.stringify(b.getAttribute('data-lang'))); } catch (err) { /* storage blocked */ }
    if (data) { applyLang(); drawClass(); } else render();
  });

  render();
})();
