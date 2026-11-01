/* Sindh Science Learning Portal — exam paper maker for teachers (/paper/).
   Builds a printable A4 question paper and its answer key from the chapters' quiz and worksheet questions.
   The paper code seeds every shuffle: the same code with the same chapters and numbers gives the same paper,
   in any of the three languages. Stand-alone page: it does not load the main app. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var TYPES = ['mcq', 'tf', 'match', 'blanks', 'short'];
  var DEFAULTS = { n: { mcq: 10, tf: 5, match: 5, blanks: 5, short: 5 }, m: { mcq: 1, tf: 1, match: 1, blanks: 1, short: 3 } };
  var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0 or 1: easy to read back from a printed paper
  var PINNED = /^(none|all|both)\b|\b(of these|of them|of the above|above)\.?$/i; // "None of these" stays the last option

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    teachers: { sd: 'استادن لاءِ', ur: 'اساتذہ کے لیے', en: 'For Teachers' },
    title: { sd: 'امتحاني پرچو ٺاهيو', ur: 'امتحانی پرچہ بنائیں', en: 'Make an exam paper' },
    intro: {
      sd: 'باب ۽ سوالن جو تعداد چونڊيو. هن ويب سائيٽ جي سوالن مان هڪ نئون پرچو ٺهندو، جيڪو A4 ڪاغذ تي پرنٽ ٿي سگهي ٿو. جوابن جي ڪنجي الڳ صفحي تي پرنٽ ٿيندي.',
      ur: 'ابواب اور سوالات کی تعداد منتخب کریں۔ اس ویب سائٹ کے سوالات سے ایک نیا پرچہ بنے گا جو A4 کاغذ پر پرنٹ ہو سکتا ہے۔ جوابی کلید الگ صفحے پر پرنٹ ہوگی۔',
      en: 'Choose the chapters and how many questions you want. A new paper is made from the questions on this website, ready to print on A4 paper. The answer key prints on a separate page.'
    },
    stepChapters: { sd: 'باب چونڊيو', ur: 'ابواب منتخب کریں', en: 'Choose chapters' },
    selectAll: { sd: 'سڀ چونڊيو', ur: 'سب منتخب کریں', en: 'Select all' },
    selectNone: { sd: 'سڀ هٽايو', ur: 'سب ہٹائیں', en: 'Select none' },
    chosen: { sd: '{total} مان {n} باب چونڊيل', ur: '{total} میں سے {n} ابواب منتخب', en: '{n} of {total} chapters chosen' },
    stepQuestions: { sd: 'سوال ۽ مارڪس', ur: 'سوالات اور نمبر', en: 'Questions and marks' },
    type_mcq: { sd: 'گهڻ-جوابي سوال (MCQs)', ur: 'کثیر الانتخابی سوالات (MCQs)', en: 'Multiple choice (MCQs)' },
    type_tf: { sd: 'صحيح يا غلط', ur: 'درست یا غلط', en: 'True or false' },
    type_match: { sd: 'ڪالم ملايو', ur: 'کالم ملائیں', en: 'Matching' },
    type_blanks: { sd: 'خالي جايون ڀريو', ur: 'خالی جگہیں پُر کریں', en: 'Fill in the blanks' },
    type_short: { sd: 'مختصر سوال', ur: 'مختصر سوالات', en: 'Short questions' },
    howMany: { sd: 'ڪيترا سوال', ur: 'کتنے سوالات', en: 'How many' },
    howManyPairs: { sd: 'ڪيترا جوڙا', ur: 'کتنے جوڑے', en: 'How many pairs' },
    marksEach: { sd: 'هر هڪ جا مارڪس', ur: 'ہر ایک کے نمبر', en: 'Marks each' },
    marks: { sd: 'مارڪس', ur: 'نمبر', en: 'Marks' },
    available: { sd: '{n} موجود', ur: '{n} دستیاب', en: '{n} available' },
    onlyAvailable: { sd: 'رڳو {n} موجود', ur: 'صرف {n} دستیاب', en: 'Only {n} available' },
    totalMarks: { sd: 'ڪل مارڪس', ur: 'کل نمبر', en: 'Total marks' },
    stepDetails: { sd: 'پرچي جي معلومات', ur: 'پرچے کی معلومات', en: 'Paper details' },
    school: { sd: 'اسڪول جو نالو', ur: 'اسکول کا نام', en: 'School name' },
    examName: { sd: 'امتحان جو نالو (اختياري)', ur: 'امتحان کا نام (اختیاری)', en: 'Exam name (optional)' },
    examPh: { sd: 'مثال: پهرين ٽرم جو امتحان', ur: 'مثلاً: پہلی ٹرم کا امتحان', en: 'e.g. First term exam' },
    classLabel: { sd: 'ڪلاس', ur: 'جماعت', en: 'Class' },
    timeLabel: { sd: 'وقت', ur: 'وقت', en: 'Time allowed' },
    timePh: { sd: 'مثال: 2 ڪلاڪ', ur: 'مثلاً: 2 گھنٹے', en: 'e.g. 2 hours' },
    dateLabel: { sd: 'تاريخ', ur: 'تاریخ', en: 'Date' },
    stepMake: { sd: 'پرچو ٺاهيو', ur: 'پرچہ بنائیں', en: 'Make the paper' },
    code: { sd: 'پرچي جو ڪوڊ', ur: 'پرچے کا کوڈ', en: 'Paper code' },
    codeHelp: {
      sd: 'نئين پرچي لاءِ خالي ڇڏيو. ساڳيو پرچو ٻيهر ٺاهڻ لاءِ ان جو ڪوڊ لکو ۽ ساڳيا باب ۽ تعداد چونڊيو.',
      ur: 'نئے پرچے کے لیے خالی چھوڑ دیں۔ وہی پرچہ دوبارہ بنانے کے لیے اس کا کوڈ لکھیں اور وہی ابواب اور تعداد منتخب کریں۔',
      en: 'Leave it empty for a new paper. To make the same paper again, type its code and choose the same chapters and numbers.'
    },
    make: { sd: 'پرچو ٺاهيو', ur: 'پرچہ بنائیں', en: 'Make paper' },
    newPaper: { sd: 'نئون پرچو', ur: 'نیا پرچہ', en: 'New paper' },
    printPaper: { sd: 'پرچو پرنٽ ڪريو', ur: 'پرچہ پرنٹ کریں', en: 'Print paper' },
    printKey: { sd: 'جوابن جي ڪنجي پرنٽ ڪريو', ur: 'جوابی کلید پرنٹ کریں', en: 'Print answer key' },
    printTip: {
      sd: 'PDF لاءِ پرنٽ واري ونڊو ۾ «Save as PDF» چونڊيو. مٿي ٻولي بدلايو ته ساڳيو پرچو ٻي ٻوليءَ ۾ ملندو.',
      ur: 'PDF کے لیے پرنٹ ونڈو میں «Save as PDF» منتخب کریں۔ اوپر زبان تبدیل کریں تو یہی پرچہ دوسری زبان میں مل جائے گا۔',
      en: 'To get a PDF, choose "Save as PDF" in the print window. Change the language at the top to get the same paper in another language.'
    },
    loading: { sd: 'باب کلي رهيا آهن…', ur: 'ابواب لوڈ ہو رہے ہیں…', en: 'Loading chapters…' },
    loadFail: {
      sd: 'باب کلي نه سگهيا. انٽرنيٽ ڏسو ۽ صفحو ٻيهر کوليو.',
      ur: 'ابواب لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کریں اور صفحہ دوبارہ کھولیں۔',
      en: 'The chapters could not be loaded. Check the internet connection and open the page again.'
    },
    needChapter: { sd: 'گهٽ ۾ گهٽ هڪ باب چونڊيو.', ur: 'کم از کم ایک باب منتخب کریں۔', en: 'Choose at least one chapter.' },
    needQuestion: { sd: 'گهٽ ۾ گهٽ هڪ سوال رکو.', ur: 'کم از کم ایک سوال رکھیں۔', en: 'Ask for at least one question.' },
    ready: { sd: 'پرچو تيار آهي. هيٺ ڏسو.', ur: 'پرچہ تیار ہے۔ نیچے دیکھیں۔', en: 'The paper is ready. See below.' },

    subject: { sd: 'سائنس', ur: 'سائنس', en: 'Science' },
    nameLabel: { sd: 'شاگرد جو نالو', ur: 'طالب علم کا نام', en: 'Student’s name' },
    rollLabel: { sd: 'رول نمبر', ur: 'رول نمبر', en: 'Roll No.' },
    syllabusOne: { sd: 'نصاب: باب {list}', ur: 'نصاب: باب {list}', en: 'Syllabus: chapter {list}' },
    syllabusMany: { sd: 'نصاب: باب {list}', ur: 'نصاب: ابواب {list}', en: 'Syllabus: chapters {list}' },
    general: { sd: 'سڀ سوال حل ڪريو.', ur: 'تمام سوالات حل کریں۔', en: 'Answer all questions.' },
    section: { sd: 'حصو', ur: 'حصہ', en: 'Section' },
    sec_mcq: { sd: 'گهڻ-جوابي سوال', ur: 'کثیر الانتخابی سوالات', en: 'Multiple choice questions' },
    sec_tf: { sd: 'صحيح يا غلط', ur: 'درست یا غلط', en: 'True or false' },
    sec_match: { sd: 'ڪالم ملايو', ur: 'کالم ملائیں', en: 'Matching' },
    sec_blanks: { sd: 'خالي جايون ڀريو', ur: 'خالی جگہیں پُر کریں', en: 'Fill in the blanks' },
    sec_short: { sd: 'مختصر سوال', ur: 'مختصر سوالات', en: 'Short questions' },
    ins_mcq: { sd: 'هر سوال جي صحيح جواب جي چوڌاري دائرو ٺاهيو.', ur: 'ہر سوال کے درست جواب کے گرد دائرہ لگائیں۔', en: 'Circle the correct answer to each question.' },
    ins_tf: { sd: 'صحيح جملي اڳيان قوس ۾ ✔ ۽ غلط جملي اڳيان ✘ لڳايو.', ur: 'درست جملے کے سامنے قوسین میں ✔ اور غلط جملے کے سامنے ✘ لگائیں۔', en: 'Put ✔ in the brackets if the sentence is true and ✘ if it is false.' },
    ins_match: { sd: 'ڪالم الف کي ڪالم ب سان ملايو. قوس ۾ ڪالم الف جو صحيح نمبر لکو.', ur: 'کالم الف کو کالم ب سے ملائیں۔ قوسین میں کالم الف کا درست نمبر لکھیں۔', en: 'Match column A with column B. Write the correct number from column A in the brackets.' },
    ins_blanks: { sd: 'هر خالي جاءِ ۾ صحيح لفظ لکو.', ur: 'ہر خالی جگہ میں درست لفظ لکھیں۔', en: 'Write the correct word in each blank.' },
    ins_short: { sd: 'هيٺين سوالن جا مختصر جواب لکو.', ur: 'درج ذیل سوالات کے مختصر جوابات لکھیں۔', en: 'Write short answers to these questions.' },
    colA: { sd: 'ڪالم الف', ur: 'کالم الف', en: 'Column A' },
    colB: { sd: 'ڪالم ب', ur: 'کالم ب', en: 'Column B' },
    tTrue: { sd: '✔ صحيح', ur: '✔ درست', en: '✔ True' },
    tFalse: { sd: '✘ غلط', ur: '✘ غلط', en: '✘ False' },
    endPaper: { sd: '— پرچو پورو ٿيو —', ur: '— پرچہ ختم —', en: '— End of paper —' },
    answerKey: { sd: 'جوابن جي ڪنجي (استادن لاءِ)', ur: 'جوابی کلید (اساتذہ کے لیے)', en: 'Answer key (for teachers)' },
    modelAnswer: { sd: 'نمونو جواب', ur: 'نمونہ جواب', en: 'Model answer' },
    secLetters: { sd: ['الف', 'ب', 'ج', 'د', 'هه'], ur: ['الف', 'ب', 'ج', 'د', 'ہ'], en: ['A', 'B', 'C', 'D', 'E'] },
    optLetters: { sd: ['الف', 'ب', 'ج', 'د', 'ه', 'و'], ur: ['الف', 'ب', 'ج', 'د', 'ہ', 'و'], en: ['a', 'b', 'c', 'd', 'e', 'f'] },
    comma: { sd: '، ', ur: '، ', en: ', ' }
  };

  var main = document.getElementById('main');

  /* ---------- storage (same "ssp1." keys as the main site) ---------- */

  var PREFIX = 'ssp1.';
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* storage blocked: page still works */ }
    }
  };

  var savedLang = store.get('lang', null);
  var state = {
    lang: LANGS.indexOf(savedLang) >= 0 ? savedLang : 'sd', // page and paper language, shared with the main site
    chapters: [],
    settings: null,
    code: null,      // code of the paper on screen
    draft: '',       // what is typed in the code box
    timer: null
  };

  /* ---------- text helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Pick the paper language from a {sd, ur, en} record (English when a translation is missing).
  function L(o) {
    if (o == null) return '';
    if (typeof o !== 'object') return String(o);
    var v = o[state.lang];
    return v != null && v !== '' ? String(v) : String(o.en || o.ur || o.sd || '');
  }
  function t(key, vars) {
    var s = T[key] ? L(T[key]) : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function list(key) { return T[key][state.lang] || T[key].en; }
  function hasText(o) { return typeof o === 'string' ? !!o.trim() : !!(o && typeof o === 'object' && (o.sd || o.ur || o.en)); }
  // Same question in any language: compare the English text (or the first one present).
  function sameKey(o) { return String(typeof o === 'object' && o ? o.en || o.ur || o.sd || '' : o || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function fmt(n) { return String(Math.round(n * 100) / 100); }
  function ltr(s) { return '<bdi dir="ltr">' + esc(s) + '</bdi>'; }
  // Text the teacher typed keeps its own direction (an English school name on an Urdu paper, "2 hours", …).
  function own(s) { return '<bdi>' + esc(s) + '</bdi>'; }

  /* ---------- seeded shuffles ---------- */

  function hash(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function rng(seed) { // mulberry32
    var a = hash(seed);
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var x = Math.imul(a ^ a >>> 15, 1 | a);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), x = arr[i];
      arr[i] = arr[j]; arr[j] = x;
    }
    return arr;
  }
  function newCode() {
    var buf = new Uint32Array(6), out = '';
    try { crypto.getRandomValues(buf); } catch (e) { for (var i = 0; i < 6; i++) buf[i] = Math.floor(Math.random() * 4294967296); }
    for (var j = 0; j < 6; j++) out += CODE_CHARS.charAt(buf[j] % CODE_CHARS.length);
    return out;
  }
  function cleanCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); }

  /* ---------- data: database first, the files in /data as backup ---------- */

  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function chapterIds(catalog) {
    var cls = catalog && (catalog.classes || []).filter(function (c) { return c.id === '5'; })[0];
    var subj = cls && (cls.subjects || []).filter(function (s) { return s.id === 'science'; })[0];
    return subj && Array.isArray(subj.chapters) ? subj.chapters : [];
  }
  function fromDb() {
    if (!CFG || !CFG.supabaseUrl || !CFG.supabaseKey) return Promise.reject(new Error('no config'));
    var ctl = typeof AbortController === 'function' ? new AbortController() : null, timer;
    var req = fetch(CFG.supabaseUrl + '/rest/v1/rpc/public_subject', {
      method: 'POST',
      headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_class: '5', p_subject: 'science' }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('db ' + r.status);
      return r.json();
    }).then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) throw new Error('no published chapters');
      return rows;
    });
    var limit = new Promise(function (resolve, reject) {
      timer = setTimeout(function () { if (ctl) ctl.abort(); reject(new Error('timeout')); }, 8000);
    });
    return Promise.race([req, limit]).then(function (rows) { clearTimeout(timer); return rows; }, function (e) { clearTimeout(timer); throw e; });
  }
  function fromFiles(catalog) {
    return Promise.all(chapterIds(catalog).map(function (id) {
      return getJSON('/data/class-5/science/' + encodeURIComponent(id) + '.json').catch(function () { return null; });
    })).then(function (rows) {
      rows = rows.filter(Boolean);
      if (!rows.length) throw new Error('no chapter files');
      return rows;
    });
  }
  function loadChapters() {
    var catalog = getJSON('/data/catalog.json').catch(function () { return null; });
    return fromDb().catch(function () {
      return catalog.then(function (c) { if (!c) throw new Error('no catalog'); return fromFiles(c); });
    }).catch(function () {
      var saved = store.get('content.5/science', null); // the main site's last good copy on this device
      if (Array.isArray(saved) && saved.length) return saved;
      throw new Error('no chapters');
    }).then(function (rows) {
      return catalog.then(function (c) {
        var ids = chapterIds(c);
        var chs = rows.filter(function (ch) { return ch && typeof ch.id === 'string' && hasText(ch.title); });
        // Catalog order first; anything the catalog does not list yet goes last, by chapter number.
        chs.sort(function (a, b) {
          var ia = ids.indexOf(a.id), ib = ids.indexOf(b.id);
          if (ia < 0) ia = 1000 + (+a.number || 0);
          if (ib < 0) ib = 1000 + (+b.number || 0);
          return ia - ib;
        });
        chs.forEach(function (ch, i) { ch._n = ch.number != null && ch.number !== '' ? ch.number : i + 1; });
        return chs;
      });
    });
  }

  /* ---------- settings (kept on this device) ---------- */

  function num(v, d, max) {
    var n = parseFloat(v);
    return isFinite(n) && n >= 0 ? Math.min(n, max) : d;
  }
  function str(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }
  function loadSettings() {
    var saved = store.get('paper', null) || {}, ids = state.chapters.map(function (c) { return c.id; });
    var s = { n: {}, m: {} };
    s.chapters = Array.isArray(saved.chapters) ? saved.chapters.filter(function (id) { return ids.indexOf(id) >= 0; }) : ids.slice();
    TYPES.forEach(function (type) {
      s.n[type] = Math.floor(num(saved.n && saved.n[type], DEFAULTS.n[type], 200));
      s.m[type] = num(saved.m && saved.m[type], DEFAULTS.m[type], 100);
    });
    s.school = str(saved.school, 80);
    s.exam = str(saved.exam, 80);
    s.cls = typeof saved.cls === 'string' ? saved.cls.slice(0, 20) : '5';
    s.time = str(saved.time, 30);
    s.date = /^\d{4}-\d{2}-\d{2}$/.test(saved.date || '') ? saved.date : '';
    return s;
  }
  function readForm() {
    var f = document.getElementById('maker'), s = state.settings;
    if (!f) return;
    s.chapters = [].slice.call(f.querySelectorAll('input[name="ch"]:checked')).map(function (x) { return x.value; });
    TYPES.forEach(function (type) {
      s.n[type] = Math.floor(num(f.elements['n-' + type].value, 0, 200));
      s.m[type] = num(f.elements['m-' + type].value, 0, 100);
    });
    s.school = f.elements.school.value.slice(0, 80);
    s.exam = f.elements.exam.value.slice(0, 80);
    s.cls = f.elements.cls.value.slice(0, 20);
    s.time = f.elements.time.value.slice(0, 30);
    s.date = f.elements.date.value;
    state.draft = f.elements.code.value;
    store.set('paper', s);
  }

  /* ---------- question bank of the chosen chapters ---------- */

  function chosenChapters() {
    var sel = state.settings.chapters;
    return state.chapters.filter(function (ch) { return sel.indexOf(ch.id) >= 0; });
  }
  // One list per chapter for each question type. True/false and matching come from both the quiz and the worksheet,
  // so repeats are dropped; a matching pair whose column B text is already used is dropped too, so every row has one answer.
  function bank(chs) {
    var out = {}, seenTf = {}, seenA = {}, seenB = {};
    TYPES.forEach(function (type) { out[type] = []; });
    chs.forEach(function (ch) {
      var p = { mcq: [], tf: [], match: [], blanks: [], short: [] }, w = ch.worksheet || {};
      function addTf(key, text, answer) {
        var k = sameKey(text);
        if (!hasText(text) || typeof answer !== 'boolean' || seenTf[k]) return;
        seenTf[k] = true;
        p.tf.push({ key: key, q: text, answer: answer });
      }
      function addPair(key, a, b) {
        var ka = sameKey(a), kb = sameKey(b);
        if (!hasText(a) || !hasText(b) || seenA[ka] || seenB[kb]) return;
        seenA[ka] = seenB[kb] = true;
        p.match.push({ key: key, a: a, b: b });
      }
      (Array.isArray(ch.quiz) ? ch.quiz : []).forEach(function (q, i) {
        if (!q || !hasText(q.q) && q.type !== 'match') return;
        var key = ch.id + ':q' + i;
        if (q.type === 'mcq') {
          var ok = Array.isArray(q.options) && q.options.length >= 2 && q.options.every(hasText) &&
            q.answer === Math.floor(q.answer) && q.answer >= 0 && q.answer < q.options.length;
          if (ok) p.mcq.push({ key: key, q: q.q, options: q.options, answer: q.answer });
        } else if (q.type === 'tf') addTf(key, q.q, q.answer);
        else if (q.type === 'match' && Array.isArray(q.pairs)) {
          q.pairs.forEach(function (x, j) { if (x) addPair(key + '.' + j, x.left, x.right); });
        }
      });
      (w.tf || []).forEach(function (x, i) { if (x) addTf(ch.id + ':wt' + i, x.text, x.answer); });
      (w.match || []).forEach(function (x, i) { if (x) addPair(ch.id + ':wm' + i, x.a, x.b); });
      (w.blanks || []).forEach(function (x, i) {
        if (x && hasText(x.text) && hasText(x.answer)) p.blanks.push({ key: ch.id + ':wb' + i, text: x.text, answer: x.answer });
      });
      (w.short || []).forEach(function (x, i) {
        if (x && hasText(x.q)) p.short.push({ key: ch.id + ':ws' + i, q: x.q, a: x.a });
      });
      TYPES.forEach(function (type) { out[type].push(p[type]); });
    });
    return out;
  }
  function size(lists) { return lists.reduce(function (n, l) { return n + l.length; }, 0); }
  // Take n questions spread evenly over the chapters, then mix them.
  function pick(lists, n, rnd) {
    lists = lists.map(function (l) { return shuffle(l.slice(), rnd); }).filter(function (l) { return l.length; });
    var order = shuffle(lists.map(function (l, i) { return i; }), rnd), out = [], took = true;
    while (out.length < n && took) {
      took = false;
      order.forEach(function (i) {
        if (out.length < n && lists[i].length) { out.push(lists[i].shift()); took = true; }
      });
    }
    return shuffle(out, rnd);
  }
  function optionOrder(q, rnd) {
    var idx = q.options.map(function (o, i) { return i; });
    var free = idx.filter(function (i) { return !PINNED.test(String(q.options[i].en || q.options[i]).trim()); });
    var mixed = shuffle(free.slice(), rnd);
    return idx.map(function (i) { return free.indexOf(i) >= 0 ? mixed.shift() : i; });
  }
  // How many of each type the chosen chapters can give, and the marks that come from them.
  function plan() {
    var s = state.settings, chs = chosenChapters(), b = bank(chs), p = { chapters: chs, bank: b, rows: {}, total: 0, count: 0 };
    TYPES.forEach(function (type) {
      var avail = size(b[type]), n = Math.min(s.n[type], avail);
      p.rows[type] = { avail: avail, n: n, each: s.m[type], marks: n * s.m[type] };
      p.total += n * s.m[type];
      p.count += n;
    });
    return p;
  }
  function makeModel(code) {
    var p = plan(), base = code + '|' + p.chapters.map(function (ch) { return ch.id; }).join(',');
    p.sections = [];
    TYPES.forEach(function (type) {
      var row = p.rows[type];
      if (!row.n) return;
      var sec = { type: type, n: row.n, each: row.each, marks: row.marks, items: pick(p.bank[type], row.n, rng(base + '|' + type)) };
      if (type === 'mcq') sec.items.forEach(function (q) { q.order = optionOrder(q, rng(code + '|' + q.key)); });
      if (type === 'match') {
        sec.bOrder = shuffle(sec.items.map(function (x, i) { return i; }), rng(base + '|column-b'));
        if (sec.n > 1 && sec.bOrder.every(function (v, i) { return v === i; })) sec.bOrder.push(sec.bOrder.shift());
      }
      p.sections.push(sec);
    });
    return p;
  }

  /* ---------- page ---------- */

  function applyLang() {
    var l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.title = t('title') + ' | ' + t('siteName');
    document.getElementById('site-name').textContent = t('siteName');
    [].forEach.call(document.querySelectorAll('[data-setlang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === l));
    });
  }
  function field(name, label, value, ph, max, cls) {
    return '<label class="field' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) + '</span>' +
      '<input type="text" name="' + name + '" value="' + esc(value) + '" maxlength="' + max + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></label>';
  }
  function renderForm() {
    var s = state.settings;
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/teachers">' + esc(t('teachers')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<form id="maker" class="no-print" novalidate autocomplete="off">' +
        '<div class="pm-intro"><p class="eyebrow">' + esc(t('teachers')) + '</p><h1>' + esc(t('title')) + '</h1>' +
          '<p class="lead">' + esc(t('intro')) + '</p></div>' +

        '<fieldset class="card pm-step"><legend><span class="pm-num">1</span>' + esc(t('stepChapters')) + '</legend>' +
          '<div class="pm-sel"><button type="button" class="btn ghost small" data-act="all">' + esc(t('selectAll')) + '</button>' +
            '<button type="button" class="btn ghost small" data-act="none">' + esc(t('selectNone')) + '</button>' +
            '<span class="muted small" id="ch-count"></span></div>' +
          '<ul class="checklist pm-chapters">' + state.chapters.map(function (ch) {
            return '<li><label><input type="checkbox" name="ch" value="' + esc(ch.id) + '"' + (s.chapters.indexOf(ch.id) >= 0 ? ' checked' : '') + '>' +
              '<span><span class="pm-chn">' + esc(ch._n) + '.</span> ' + esc(L(ch.title)) + '</span></label></li>';
          }).join('') + '</ul></fieldset>' +

        '<fieldset class="card pm-step"><legend><span class="pm-num">2</span>' + esc(t('stepQuestions')) + '</legend>' +
          '<div class="pm-qs">' + TYPES.map(function (type) {
            return '<div class="pm-q">' +
              '<p class="pm-q-name"><b>' + esc(t('type_' + type)) + '</b><span class="small pm-avail" id="avail-' + type + '"></span></p>' +
              '<label class="pm-in"><span class="small">' + esc(t(type === 'match' ? 'howManyPairs' : 'howMany')) + '</span>' +
                '<input type="number" name="n-' + type + '" value="' + s.n[type] + '" min="0" max="200" step="1" inputmode="numeric"></label>' +
              '<label class="pm-in"><span class="small">' + esc(t('marksEach')) + '</span>' +
                '<input type="number" name="m-' + type + '" value="' + fmt(s.m[type]) + '" min="0" max="100" step="0.5" inputmode="decimal"></label>' +
              '<p class="pm-sum"><span class="small">' + esc(t('marks')) + '</span><b id="sum-' + type + '"></b></p></div>';
          }).join('') + '</div>' +
          '<p class="pm-total">' + esc(t('totalMarks')) + ': <b id="total"></b></p></fieldset>' +

        '<fieldset class="card pm-step"><legend><span class="pm-num">3</span>' + esc(t('stepDetails')) + '</legend><div class="pm-fields">' +
          field('school', t('school'), s.school, '', 80, 'wide') +
          field('exam', t('examName'), s.exam, t('examPh'), 80, 'wide') +
          field('cls', t('classLabel'), s.cls, '', 20) +
          field('time', t('timeLabel'), s.time, t('timePh'), 30) +
          '<label class="field"><span>' + esc(t('dateLabel')) + '</span><input type="date" name="date" value="' + esc(s.date) + '"></label>' +
        '</div></fieldset>' +

        '<fieldset class="card pm-step"><legend><span class="pm-num">4</span>' + esc(t('stepMake')) + '</legend>' +
          '<label class="field"><span>' + esc(t('code')) + '</span><input type="text" name="code" class="pm-code-in" value="' + esc(state.draft) + '" maxlength="12" ' +
            'placeholder="K7P3QX" dir="ltr" spellcheck="false" autocapitalize="characters"></label>' +
          '<p class="muted small">' + esc(t('codeHelp')) + '</p>' +
          '<div class="btn-row"><button type="submit" class="btn big">' + esc(t('make')) + '</button>' +
            '<button type="button" class="btn ghost big" data-act="new">' + esc(t('newPaper')) + '</button></div>' +
          '<p id="msg" class="pm-msg" role="status" aria-live="polite"></p>' +
        '</fieldset>' +
      '</form>' +
      '<div id="out"></div>';
    updateSums();
  }
  function updateSums() {
    var p = plan();
    document.getElementById('ch-count').textContent = t('chosen', { n: p.chapters.length, total: state.chapters.length });
    TYPES.forEach(function (type) {
      var row = p.rows[type], av = document.getElementById('avail-' + type), short = state.settings.n[type] > row.avail;
      av.textContent = t(short ? 'onlyAvailable' : 'available', { n: row.avail });
      av.classList.toggle('over', short);
      document.getElementById('sum-' + type).textContent = fmt(row.marks);
    });
    document.getElementById('total').textContent = fmt(p.total);
    return p;
  }
  function say(text, isError) {
    var m = document.getElementById('msg');
    if (!m) return;
    m.textContent = text;
    m.classList.toggle('err', !!isError);
  }

  /* ---------- the paper ---------- */

  function blankify(s) {
    var h = esc(s);
    return /_{3,}/.test(h) ? h.replace(/_{3,}/g, '<span class="p-blank"></span>') : h + ' <span class="p-blank"></span>';
  }
  function marksNote(sec) { return '<span class="p-marks">' + ltr('(' + sec.n + ' × ' + fmt(sec.each) + ' = ' + fmt(sec.marks) + ')') + '</span>'; }
  function secHead(sec, i) {
    return '<div class="p-sec-head"><h3>' + esc(t('section') + ' ' + list('secLetters')[i] + ': ' + t('sec_' + sec.type)) + '</h3>' + marksNote(sec) + '</div>';
  }
  function optCols(q) {
    var longest = q.options.reduce(function (n, o) { return Math.max(n, L(o).length); }, 0);
    return longest <= 16 ? 4 : longest <= 38 ? 2 : 1;
  }
  function matchTable(sec, withKey) {
    return '<table class="p-match"><thead><tr><th>' + esc(t('colA')) + '</th><th>' + esc(t('colB')) + '</th></tr></thead><tbody>' +
      sec.items.map(function (x, i) {
        var j = sec.bOrder[i];
        return '<tr><td><span class="p-n">' + (i + 1) + '.</span> ' + esc(L(x.a)) + '</td>' +
          '<td><span class="p-br">(<span>' + (withKey ? j + 1 : '') + '</span>)</span> ' + esc(L(sec.items[j].b)) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }
  function sectionBody(sec) {
    var letters = list('optLetters');
    if (sec.type === 'mcq') {
      return '<ol class="p-list">' + sec.items.map(function (q) {
        return '<li class="p-q"><p>' + esc(L(q.q)) + '</p><ol class="p-opts cols-' + optCols(q) + '">' + q.order.map(function (oi, k) {
          return '<li><span class="p-let">(' + esc(letters[k] || k + 1) + ')</span> ' + esc(L(q.options[oi])) + '</li>';
        }).join('') + '</ol></li>';
      }).join('') + '</ol>';
    }
    if (sec.type === 'tf') {
      return '<ol class="p-list">' + sec.items.map(function (q) {
        return '<li class="p-q"><div class="p-row"><span>' + esc(L(q.q)) + '</span><span class="p-br">(<span></span>)</span></div></li>';
      }).join('') + '</ol>';
    }
    if (sec.type === 'match') return matchTable(sec, false);
    if (sec.type === 'blanks') {
      return '<ol class="p-list">' + sec.items.map(function (q) { return '<li class="p-q">' + blankify(L(q.text)) + '</li>'; }).join('') + '</ol>';
    }
    var lines = Math.max(2, Math.min(6, Math.round(sec.each) + 1));
    return '<ol class="p-list">' + sec.items.map(function (q) {
      return '<li class="p-q"><p>' + esc(L(q.q)) + '</p><div class="p-lines" aria-hidden="true">' + new Array(lines + 1).join('<span></span>') + '</div></li>';
    }).join('') + '</ol>';
  }
  function keyBody(sec) {
    var letters = list('optLetters');
    if (sec.type === 'mcq') {
      return '<ol class="k-list k-cols">' + sec.items.map(function (q) {
        var k = q.order.indexOf(q.answer);
        return '<li><b>(' + esc(letters[k] || k + 1) + ')</b> ' + esc(L(q.options[q.answer])) + '</li>';
      }).join('') + '</ol>';
    }
    if (sec.type === 'tf') {
      return '<ol class="k-list k-cols">' + sec.items.map(function (q) { return '<li>' + esc(t(q.answer ? 'tTrue' : 'tFalse')) + '</li>'; }).join('') + '</ol>';
    }
    if (sec.type === 'match') return matchTable(sec, true);
    if (sec.type === 'blanks') {
      return '<ol class="k-list k-cols">' + sec.items.map(function (q) { return '<li>' + esc(L(q.answer)) + '</li>'; }).join('') + '</ol>';
    }
    return '<ol class="k-list">' + sec.items.map(function (q) {
      return '<li><p class="k-q">' + esc(L(q.q)) + '</p><p><b>' + esc(t('modelAnswer')) + ':</b> ' + esc(L(q.a)) + '</p></li>';
    }).join('') + '</ol>';
  }
  function fillLine(label, value, cls) {
    return '<span class="p-fl' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) + ':</span><span class="p-line">' + (value || '') + '</span></span>';
  }
  function niceDate(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || '');
    return m ? ltr(m[3] + '-' + m[2] + '-' + m[1]) : '';
  }
  function subjectLine() {
    var cls = state.settings.cls.trim();
    return esc(t('subject')) + (cls ? ' · ' + esc(t('classLabel')) + ' ' + own(cls) : '');
  }
  function paperHtml(model, code) {
    var s = state.settings, school = s.school.trim(), exam = s.exam.trim(), time = s.time.trim();
    var nums = model.chapters.map(function (ch) { return ch._n; }).join(t('comma'));
    var codeLine = '<p class="p-code">' + esc(t('code')) + ': ' + ltr(code) + '</p>';
    return '<article class="sheet paper">' +
      '<header class="p-head">' + codeLine +
        (school ? '<p class="p-school">' + own(school) + '</p>' : '') +
        (exam ? '<p class="p-exam">' + own(exam) + '</p>' : '') +
        '<h2 class="p-title">' + subjectLine() + '</h2>' +
        '<div class="p-meta"><span>' + esc(t('timeLabel')) + ': ' + (time ? own(time) : '<span class="p-line p-inline"></span>') + '</span>' +
          '<span>' + esc(t('totalMarks')) + ': ' + ltr(fmt(model.total)) + '</span></div>' +
        '<div class="p-fill">' + fillLine(t('nameLabel'), '', 'wide') + fillLine(t('rollLabel')) + fillLine(t('dateLabel'), niceDate(s.date)) + '</div>' +
        '<p class="p-syl">' + esc(t(model.chapters.length > 1 ? 'syllabusMany' : 'syllabusOne', { list: nums })) + '</p>' +
      '</header>' +
      '<p class="p-general">' + esc(t('general')) + '</p>' +
      model.sections.map(function (sec, i) {
        return '<section class="p-sec">' + secHead(sec, i) + '<p class="p-ins">' + esc(t('ins_' + sec.type)) + '</p>' + sectionBody(sec) + '</section>';
      }).join('') +
      '<p class="p-end">' + esc(t('endPaper')) + '</p>' +
    '</article>' +
    '<article class="sheet key">' +
      '<header class="p-head">' + codeLine +
        '<h2 class="p-title">' + esc(t('answerKey')) + '</h2>' +
        '<p class="p-sub">' + [school && own(school), exam && own(exam), subjectLine(), esc(t('totalMarks')) + ': ' + ltr(fmt(model.total))].filter(Boolean).join(' · ') + '</p>' +
      '</header>' +
      model.sections.map(function (sec, i) { return '<section class="p-sec">' + secHead(sec, i) + keyBody(sec) + '</section>'; }).join('') +
    '</article>';
  }
  function renderPaper(scroll) {
    var out = document.getElementById('out');
    if (!out || !state.code) return;
    var model = makeModel(state.code);
    if (!model.chapters.length || !model.count) {
      out.innerHTML = '';
      say(t(model.chapters.length ? 'needQuestion' : 'needChapter'), true);
      return;
    }
    out.innerHTML =
      '<div class="pm-tools no-print">' +
        '<p class="pm-code">' + esc(t('code')) + ': <b>' + ltr(state.code) + '</b></p>' +
        '<div class="btn-row"><button type="button" class="btn" data-act="print-paper">' + esc(t('printPaper')) + '</button>' +
          '<button type="button" class="btn ghost" data-act="print-key">' + esc(t('printKey')) + '</button>' +
          '<button type="button" class="btn ghost" data-act="new">' + esc(t('newPaper')) + '</button></div>' +
        '<p class="muted small">' + esc(t('printTip')) + '</p>' +
      '</div>' +
      paperHtml(model, state.code);
    if (scroll) {
      say(t('ready'));
      out.scrollIntoView();
    } else say('');
  }
  function makePaper(code) {
    readForm();
    var p = plan();
    if (!p.chapters.length || !p.count) {
      say(t(p.chapters.length ? 'needQuestion' : 'needChapter'), true);
      return;
    }
    state.code = cleanCode(code) || newCode();
    state.draft = state.code;
    document.getElementById('maker').elements.code.value = state.code;
    renderPaper(true);
  }
  function printPart(part) {
    document.body.setAttribute('data-print', part);
    window.print();
  }

  /* ---------- events ---------- */

  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === state.lang) return;
    if (state.settings) readForm();
    state.lang = l;
    store.set('lang', l);
    applyLang();
    if (!state.settings) { renderStart(); return; }
    renderForm();
    renderPaper(false);
  }
  function onInput(e) {
    if (!state.settings || !e.target.closest('#maker')) return;
    readForm();
    updateSums();
    if (e.target.name === 'code' || !state.code) return;
    clearTimeout(state.timer);
    state.timer = setTimeout(function () { renderPaper(false); }, 250); // keep the paper on screen in step with the form
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (b) { setLang(b.getAttribute('data-setlang')); return; }
    var a = e.target.closest('[data-act]');
    if (!a || !state.settings) return;
    var act = a.getAttribute('data-act');
    if (act === 'all' || act === 'none') {
      [].forEach.call(document.querySelectorAll('#maker input[name="ch"]'), function (x) { x.checked = act === 'all'; });
      onInput({ target: a });
    } else if (act === 'new') makePaper('');
    else if (act === 'print-paper') printPart('paper');
    else if (act === 'print-key') printPart('key');
  });
  main.addEventListener('input', onInput);
  main.addEventListener('change', onInput);
  main.addEventListener('submit', function (e) {
    e.preventDefault();
    makePaper(document.getElementById('maker').elements.code.value);
  });
  window.addEventListener('afterprint', function () { document.body.removeAttribute('data-print'); });

  /* ---------- start ---------- */

  var failed = false;
  function renderStart() {
    main.innerHTML = '<p class="' + (failed ? 'pm-msg err' : 'loading') + '" role="status">' + esc(t(failed ? 'loadFail' : 'loading')) + '</p>';
  }
  applyLang();
  renderStart();
  loadChapters().then(function (chs) {
    state.chapters = chs;
    state.settings = loadSettings();
    renderForm();
  }, function () {
    failed = true;
    renderStart();
  });
})();
