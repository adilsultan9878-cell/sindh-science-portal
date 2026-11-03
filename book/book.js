/* Chapter book (/book/): one chapter, or all of Class 5 Science, laid out as a printable A4 book —
   cover, lesson, pictures and diagrams, key words, experiment, practice questions, worksheet and an answer key.
   "Print / Save as PDF" uses the browser; ready-made PDFs (all parts) are in /book/pdf/.
   Chapters come from the database (what the staff panel publishes), with the files in /data as backup.
   Address: /book/?ch=<chapter id or all>&lang=<sd|ur|en>  (pdf=1 is used when the ready PDFs are made). */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG || null;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var LETTERS = { sd: ['الف', 'ب', 'ج', 'د', 'ه'], ur: ['الف', 'ب', 'ج', 'د', 'ہ'], en: ['a', 'b', 'c', 'd', 'e'] };
  var PARTS = ['lesson', 'pictures', 'words', 'experiment', 'questions', 'worksheet', 'answers'];
  var main = document.getElementById('main');
  var params = new URLSearchParams(location.search);
  var PDF_MODE = params.get('pdf') === '1';

  var T = {
    pageTitle: { sd: 'باب جو ڪتاب (PDF)', ur: 'باب کی کتاب (PDF)', en: 'Chapter book (PDF)' },
    intro: {
      sd: 'هڪ باب يا سڄو ڪتاب چونڊيو. سبق، تصويرون، اهم لفظ، تجربو، مشق جا سوال، ورڪ شيٽ ۽ جواب A4 صفحن تي هڪ ڪتاب جي صورت ۾ ٺهندا. «پرنٽ / PDF» دٻايو ۽ پرنٽ واري دري ۾ «Save as PDF» چونڊيو.',
      ur: 'ایک باب یا پوری کتاب منتخب کریں۔ سبق، تصویریں، اہم الفاظ، تجربہ، مشق کے سوالات، ورک شیٹ اور جوابات A4 صفحات پر کتاب کی صورت میں بن جائیں گے۔ «پرنٹ / PDF» دبائیں اور پرنٹ والی کھڑکی میں «Save as PDF» منتخب کریں۔',
      en: 'Choose one chapter or the whole book. The lesson, pictures, key words, experiment, practice questions, worksheet and answers are laid out as a book on A4 pages. Press "Print / PDF" and choose "Save as PDF" in the print window.'
    },
    chooseChapter: { sd: 'باب', ur: 'باب', en: 'Chapter' },
    wholeBook: { sd: 'سڄو ڪتاب ({n} باب)', ur: 'پوری کتاب ({n} ابواب)', en: 'Whole book ({n} chapters)' },
    include: { sd: 'ڪتاب ۾ شامل ڪريو', ur: 'کتاب میں شامل کریں', en: 'Include' },
    p_lesson: { sd: 'سبق', ur: 'سبق', en: 'Lesson' },
    p_pictures: { sd: 'تصويرون ۽ خاڪا', ur: 'تصویریں اور خاکے', en: 'Pictures and diagrams' },
    p_words: { sd: 'اهم لفظ', ur: 'اہم الفاظ', en: 'Key words' },
    p_experiment: { sd: 'تجربو', ur: 'تجربہ', en: 'Experiment' },
    p_questions: { sd: 'مشق جا سوال', ur: 'مشق کے سوالات', en: 'Practice questions' },
    p_worksheet: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' },
    p_answers: { sd: 'جواب (استادن لاءِ)', ur: 'جوابات (اساتذہ کے لیے)', en: 'Answers (for teachers)' },
    print: { sd: 'پرنٽ / PDF', ur: 'پرنٹ / PDF', en: 'Print / PDF' },
    ready: { sd: 'تيار PDF ڊائونلوڊ ڪريو', ur: 'تیار PDF ڈاؤن لوڈ کریں', en: 'Download the ready PDF' },
    readyNote: { sd: 'تيار PDF ۾ سڀ حصا آهن. واٽس ايپ تي به موڪلي سگهجي ٿي.', ur: 'تیار PDF میں تمام حصے ہیں۔ اسے واٹس ایپ پر بھی بھیجا جا سکتا ہے۔', en: 'The ready PDF has every part. You can also send it on WhatsApp.' },
    tip: { sd: 'صفحي جي ماپ: A4. «Background graphics» چالو رکو ته رنگ به ڇپجن.', ur: 'صفحے کا سائز: A4۔ «Background graphics» چالو رکھیں تاکہ رنگ بھی چھپیں۔', en: 'Paper size: A4. Keep "Background graphics" on so the colours print.' },
    loading: { sd: 'باب لوڊ ٿي رهيا آهن…', ur: 'ابواب لوڈ ہو رہے ہیں…', en: 'Loading the chapters…' },
    loadError: { sd: 'باب لوڊ نه ٿي سگهيا. انٽرنيٽ چيڪ ڪري صفحو ٻيهر کوليو.', ur: 'ابواب لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کر کے صفحہ دوبارہ کھولیں۔', en: 'The chapters could not be loaded. Check the internet and open the page again.' },
    bookTitle: { sd: 'سائنس', ur: 'سائنس', en: 'Science' },
    classLine: { sd: 'ڪلاس 5', ur: 'جماعت پنجم', en: 'Class 5' },
    curriculum: { sd: 'سنڌ ٽيڪسٽ بڪ بورڊ جي نصاب مطابق', ur: 'سندھ ٹیکسٹ بک بورڈ کے نصاب کے مطابق', en: 'Following the Sindh Textbook Board curriculum' },
    contents: { sd: 'فهرست', ur: 'فہرست', en: 'Contents' },
    inThisChapter: { sd: 'هن باب ۾', ur: 'اس باب میں', en: 'In this chapter' },
    willLearn: { sd: 'اسين ڇا سکنداسين؟', ur: 'ہم کیا سیکھیں گے؟', en: 'What we will learn' },
    diagramTitle: { sd: 'خاڪو: حصا ۽ انهن جو ڪم', ur: 'خاکہ: حصے اور ان کا کام', en: 'Diagram: the parts and what they do' },
    picture: { sd: 'تصوير', ur: 'تصویر', en: 'Picture' },
    mcq: { sd: 'صحيح جواب تي گول ڪريو', ur: 'درست جواب پر دائرہ لگائیں', en: 'Circle the correct answer' },
    tf: { sd: 'صحيح يا غلط لکو', ur: 'درست یا غلط لکھیں', en: 'Write true or false' },
    match: { sd: 'ڪالمن کي ملايو', ur: 'کالموں کو ملائیں', en: 'Match the columns' },
    quizAnswers: { sd: 'مشق جا سوال', ur: 'مشق کے سوالات', en: 'Practice questions' },
    worksheetAnswers: { sd: 'ورڪ شيٽ', ur: 'ورک شیٹ', en: 'Worksheet' },
    answerKeyTitle: { sd: 'جوابن جي ڪنجي', ur: 'جوابات کی کلید', en: 'Answer key' },
    forTeachers: { sd: 'استادن لاءِ', ur: 'اساتذہ کے لیے', en: 'For teachers' },
    trueW: { sd: 'صحيح', ur: 'درست', en: 'True' },
    falseW: { sd: 'غلط', ur: 'غلط', en: 'False' },
    madeBy: { sd: 'هي ڪتاب سنڌ سائنس سکيا پورٽل تان ٺاهيو ويو. مفت ۽ اشتهارن کان پاڪ.', ur: 'یہ کتاب سندھ سائنس لرننگ پورٹل سے بنائی گئی۔ مفت اور اشتہارات سے پاک۔', en: 'This book was made on the Sindh Science Learning Portal. Free and without ads.' },
    credits: { sd: 'تصويرن جا حوالا', ur: 'تصویروں کے حوالے', en: 'Picture credits' },
    sample: { sd: 'نوٽ: هي سبق استادن جي جاچ کانپوءِ حتمي ٿيندا.', ur: 'نوٹ: یہ اسباق اساتذہ کی جانچ کے بعد حتمی ہوں گے۔', en: 'Note: these lessons become final after review by teachers.' }
  };

  function load(k, d) { try { var v = localStorage.getItem('ssp1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('ssp1.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }

  var state = {
    lang: LANGS.indexOf(params.get('lang')) >= 0 ? params.get('lang') : (LANGS.indexOf(load('lang', null)) >= 0 ? load('lang', null) : 'sd'),
    chapters: [],
    ch: params.get('ch') || (load('book', {}) || {}).ch || 'all',
    parts: (function () {
      var saved = (load('book', {}) || {}).parts, out = {};
      PARTS.forEach(function (p) { out[p] = PDF_MODE || !saved || saved[p] !== false; });
      return out;
    })()
  };

  /* ---------- text helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) {
    if (o == null) return '';
    if (typeof o !== 'object' || Array.isArray(o)) return String(o);
    var v = o[state.lang];
    return v != null && v !== '' ? String(v) : String(o.en || o.ur || o.sd || '');
  }
  // like L(), but keeps a list of paragraphs as a list
  function LA(o) {
    if (o == null || typeof o !== 'object' || Array.isArray(o)) return o == null ? [] : o;
    var v = o[state.lang];
    return v != null && v !== '' ? v : (o.en || o.ur || o.sd || []);
  }
  function t(key, vars) {
    var src = T[key] || (window.UI_TEXT || {})[key];
    var s = src ? L(src) : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong class="kw">$1</strong>'); }
  function paragraphs(lines) {
    var html = '', list = [];
    function flush() { if (list.length) { html += '<ul>' + list.map(function (li) { return '<li>' + rich(li) + '</li>'; }).join('') + '</ul>'; list = []; } }
    (Array.isArray(lines) ? lines : [lines]).forEach(function (p) {
      if (String(p).indexOf('- ') === 0) list.push(String(p).slice(2)); else { flush(); html += '<p>' + rich(p) + '</p>'; }
    });
    flush();
    return html;
  }
  function letter(i) { return LETTERS[state.lang][i] || String(i + 1); }
  function arrow() { return RTL[state.lang] ? ' ← ' : ' → '; }
  function chapterN(ch) { return t('chapterN', { n: ch._n }); }
  function ltr(s) { return '<bdi dir="ltr">' + esc(s) + '</bdi>'; }

  /* ---------- data: database first, the files in /data as backup ---------- */

  function getJSON(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }
  function chapterIds(catalog) {
    var cls = catalog && (catalog.classes || []).filter(function (c) { return c.id === '5'; })[0];
    var subj = cls && (cls.subjects || []).filter(function (s) { return s.id === 'science'; })[0];
    return subj && Array.isArray(subj.chapters) ? subj.chapters : [];
  }
  function fromDb() {
    if (!CFG || !CFG.supabaseUrl) return Promise.reject(new Error('no config'));
    var ctl = typeof AbortController === 'function' ? new AbortController() : null, timer;
    var req = fetch(CFG.supabaseUrl + '/rest/v1/rpc/public_subject', {
      method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_class: '5', p_subject: 'science' }), signal: ctl ? ctl.signal : undefined
    }).then(function (r) { if (!r.ok) throw new Error('db ' + r.status); return r.json(); })
      .then(function (rows) { if (!Array.isArray(rows) || !rows.length) throw new Error('empty'); return rows; });
    var limit = new Promise(function (resolve, reject) { timer = setTimeout(function () { if (ctl) ctl.abort(); reject(new Error('timeout')); }, 8000); });
    return Promise.race([req, limit]).then(function (rows) { clearTimeout(timer); return rows; }, function (e) { clearTimeout(timer); throw e; });
  }
  function loadChapters() {
    var catalog = getJSON('/data/catalog.json').catch(function () { return null; });
    return fromDb().catch(function () {
      return catalog.then(function (c) {
        return Promise.all(chapterIds(c).map(function (id) { return getJSON('/data/class-5/science/' + encodeURIComponent(id) + '.json').catch(function () { return null; }); }));
      }).then(function (rows) { rows = rows.filter(Boolean); if (!rows.length) throw new Error('no files'); return rows; });
    }).catch(function () {
      var saved = load('content.5/science', null);
      if (Array.isArray(saved) && saved.length) return saved;
      throw new Error('no chapters');
    }).then(function (rows) {
      return catalog.then(function (c) {
        var ids = chapterIds(c);
        rows = rows.filter(function (ch) { return ch && ch.id && ch.title; });
        rows.sort(function (a, b) {
          var ia = ids.indexOf(a.id), ib = ids.indexOf(b.id);
          if (ia < 0) ia = 1000 + (+a.number || 0);
          if (ib < 0) ib = 1000 + (+b.number || 0);
          return ia - ib;
        });
        rows.forEach(function (ch, i) { ch._n = ch.number != null && ch.number !== '' ? ch.number : i + 1; });
        return rows;
      });
    });
  }

  /* ---------- the book ---------- */

  function picture(ch) { return (window.PICTURES || {})[ch.id] || null; }

  function cover(chs, one) {
    if (one) {
      var ch = chs[0], pic = picture(ch);
      return '<section class="sheet cover">' +
        '<p class="cover-site">' + esc(t('siteName')) + '</p>' +
        '<p class="cover-line">' + esc(t('classLine')) + ' · ' + esc(t('bookTitle')) + '</p>' +
        '<p class="cover-num">' + esc(chapterN(ch)) + '</p>' +
        '<h1 class="cover-title">' + esc(L(ch.title)) + '</h1>' +
        (pic ? '<figure class="cover-pic"><img src="' + esc(pic.src) + '" alt="" width="' + pic.w + '" height="' + pic.h + '"></figure>' : '<p class="cover-emoji">' + esc(ch.icon || '') + '</p>') +
        '<p class="cover-sum">' + esc(L(ch.summary)) + '</p>' +
        '<p class="cover-foot">' + esc(t('curriculum')) + '<br>' + ltr('sindh-science-portal.vercel.app') + '</p></section>';
    }
    var pics = chs.map(picture).filter(Boolean).slice(0, 6);
    return '<section class="sheet cover">' +
      '<p class="cover-site">' + esc(t('siteName')) + '</p>' +
      '<h1 class="cover-title big">' + esc(t('bookTitle')) + '</h1>' +
      '<p class="cover-num">' + esc(t('classLine')) + '</p>' +
      '<div class="cover-grid">' + pics.map(function (p) { return '<img src="' + esc(p.src) + '" alt="" width="200" height="200">'; }).join('') + '</div>' +
      '<p class="cover-sum">' + esc(t('curriculum')) + '</p>' +
      '<p class="cover-foot">' + ltr('sindh-science-portal.vercel.app') + '<br>The Professional Educator · EduPulse Nexus</p></section>' +
      '<section class="sheet pb toc"><h2>' + esc(t('contents')) + '</h2><ol class="toc-list">' + chs.map(function (ch) {
        return '<li><span class="toc-n">' + esc(chapterN(ch)) + '</span><span class="toc-t">' + esc(L(ch.title)) + '</span></li>';
      }).join('') + '</ol><p class="muted small">' + esc(t('sample')) + '</p></section>';
  }

  function diagramBlock(ch) {
    var d = ch.diagram;
    if (!d || !d.parts || !d.parts.length) return '';
    var parts = {};
    d.parts.forEach(function (p) { parts[p.id] = p; });
    function label(pid) { return esc(L(parts[pid] && parts[pid].label)); }
    var drawing = '';
    if (d.type === 'tree' && d.tree) {
      drawing = '<div class="b-tree">' + (function node(n) {
        return '<div class="bt-branch"><span class="bt-node">' + label(n.id) + '</span>' +
          (n.children && n.children.length ? '<div class="bt-kids">' + n.children.map(node).join('') + '</div>' : '') + '</div>';
      })(d.tree) + '</div>';
    } else if (window.DIAGRAMS && window.DIAGRAMS[d.type]) {
      drawing = '<div class="b-svg">' + window.DIAGRAMS[d.type](label) + '</div>';
    }
    return '<div class="b-diagram"><h3>' + esc(t('diagramTitle')) + '</h3>' + drawing +
      '<dl class="b-parts">' + d.parts.map(function (p) {
        return '<div class="b-part"><dt>' + label(p.id) + ' <span class="names">(' + LANGS.filter(function (l) { return l !== state.lang; }).map(function (l) { return '<span lang="' + l + '">' + esc(p.label && p.label[l]) + '</span>'; }).join(' · ') + ')</span></dt><dd>' + esc(L(p.info)) + '</dd></div>';
      }).join('') + '</dl></div>';
  }

  function photoBlock(ch) {
    var pic = picture(ch);
    if (!pic) return '';
    return '<figure class="b-photo"><img src="' + esc(pic.src) + '" alt="' + esc(L(ch.title)) + '" width="' + pic.w + '" height="' + pic.h + '">' +
      '<figcaption>' + esc(t('picture')) + ': ' + esc(pic.author) + ' · ' + esc(pic.license) + ' · Wikimedia Commons</figcaption></figure>';
  }

  function lessonPart(ch, opts) {
    var pic = picture(ch), dTopic = (window.DIAGRAM_TOPICS || {})[ch.id];
    var ids = (ch.lesson || []).map(function (s) { return s.id; });
    if (ids.indexOf(dTopic) < 0) dTopic = ids[0];
    var pTopic = pic && ids.indexOf(pic.topic) >= 0 ? pic.topic : dTopic;
    return (ch.lesson || []).map(function (sec, i) {
      var extra = '';
      if (opts.pictures && sec.id === pTopic) extra += photoBlock(ch);
      if (opts.pictures && sec.id === dTopic) extra += diagramBlock(ch);
      return '<section class="b-sec"><h3 data-n="' + (i + 1) + '">' + esc(L(sec.title)) + '</h3>' + paragraphs(LA(sec.body)) + extra + '</section>';
    }).join('');
  }

  function wordsPart(ch) {
    if (!ch.glossary || !ch.glossary.length) return '';
    var order = [state.lang].concat(LANGS.filter(function (l) { return l !== state.lang; }));
    var names = { sd: 'سنڌي', ur: 'اردو', en: 'English' };
    return '<section class="b-block"><h2>' + esc(t('p_words')) + '</h2><table class="b-table words"><thead><tr>' +
      order.map(function (l) { return '<th lang="' + l + '">' + names[l] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      ch.glossary.map(function (w) { return '<tr>' + order.map(function (l) { return '<td lang="' + l + '">' + esc(w[l]) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></section>';
  }

  function experimentPart(ch) {
    var x = ch.experiment;
    if (!x) return '';
    return '<section class="b-block b-exp"><h2>' + esc(t('p_experiment')) + ': ' + esc(L(x.title)) + '</h2>' +
      '<img class="b-exp-pic" src="/img/exp/' + encodeURIComponent(ch.id) + '.svg" alt="" width="600" height="320">' +
      '<div class="b-cols"><div><h3>' + esc(t('materials')) + '</h3><ul>' + (x.materials || []).map(function (m) { return '<li>' + esc(L(m)) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h3>' + esc(t('steps')) + '</h3><ol>' + (x.steps || []).map(function (s) { return '<li>' + esc(L(s)) + '</li>'; }).join('') + '</ol></div></div>' +
      '<div class="b-note warn"><strong>' + esc(t('safety')) + ':</strong> ' + esc(L(x.safety)) + '</div>' +
      '<div class="b-note ok"><strong>' + esc(t('whatLearn')) + '</strong> ' + esc(L(x.learn)) + '</div></section>';
  }

  // Practice questions from the chapter quiz: MCQ (circle), true/false, matching (right column turned by one).
  function questionsPart(ch) {
    var qs = ch.quiz || [];
    if (!qs.length) return '';
    var mcq = qs.filter(function (q) { return q.type === 'mcq'; }), tf = qs.filter(function (q) { return q.type === 'tf'; }), mt = qs.filter(function (q) { return q.type === 'match'; });
    var n = 0, html = '<section class="b-block b-qs"><h2>' + esc(t('p_questions')) + '</h2>';
    if (mcq.length) html += '<h3>' + esc(t('mcq')) + '</h3><ol class="b-q" start="1">' + mcq.map(function (q) {
      n++;
      return '<li><p>' + esc(L(q.q)) + '</p><ol class="b-opts">' + (q.options || []).map(function (o, i) { return '<li><span class="b-l">(' + esc(letter(i)) + ')</span> ' + esc(L(o)) + '</li>'; }).join('') + '</ol></li>';
    }).join('') + '</ol>';
    if (tf.length) html += '<h3>' + esc(t('tf')) + '</h3><ol class="b-q" start="' + (n + 1) + '">' + tf.map(function (q) {
      n++;
      return '<li><p>' + esc(L(q.q)) + ' <span class="b-line short"></span></p></li>';
    }).join('') + '</ol>';
    mt.forEach(function (q) {
      n++;
      var right = (q.pairs || []).map(function (p, i) { return i; });
      right.push(right.shift());
      html += '<h3>' + esc(t('match')) + '</h3><p class="b-qtext"><b>' + n + '.</b> ' + esc(L(q.q)) + '</p><table class="b-table match"><tbody>' +
        (q.pairs || []).map(function (p, i) {
          return '<tr><td>' + (i + 1) + '. ' + esc(L(p.left)) + '</td><td class="b-gap"></td><td>(' + esc(letter(i)) + ') ' + esc(L(q.pairs[right[i]].right)) + '</td></tr>';
        }).join('') + '</tbody></table>';
    });
    return html + '</section>';
  }

  // The same printable worksheet as on the chapter page (column B is shuffled the same way).
  function worksheetPart(ch) {
    var w = ch.worksheet;
    if (!w) return '';
    var n = (w.match || []).length, order = (w.match || []).map(function (m, i) { return (i + 2) % n; });
    var bank = (w.blanks || []).map(function (b) { return L(b.answer); }).sort();
    return '<section class="b-block b-ws pb"><h2>' + esc(t('p_worksheet')) + ': ' + esc(L(ch.title)) + '</h2>' +
      '<p class="b-fields"><span>' + esc(t('wsName')) + ': <span class="b-line"></span></span><span>' + esc(t('wsDate')) + ': <span class="b-line short"></span></span></p>' +
      ((w.blanks || []).length ? '<h3>' + esc(t('wsBlanks')) + '</h3><p class="b-bank"><b>' + esc(t('wsBank')) + '</b> ' + bank.map(esc).join(' · ') + '</p><ol>' +
        w.blanks.map(function (b) { return '<li>' + esc(L(b.text)).replace('____', '<span class="b-line"></span>') + '</li>'; }).join('') + '</ol>' : '') +
      ((w.tf || []).length ? '<h3>' + esc(t('wsTF')) + '</h3><ol>' + w.tf.map(function (x) { return '<li><span class="b-box"></span> ' + esc(L(x.text)) + '</li>'; }).join('') + '</ol>' : '') +
      (n ? '<h3>' + esc(t('wsMatch')) + '</h3><table class="b-table"><thead><tr><th>' + esc(t('colA')) + '</th><th>' + esc(t('colB')) + '</th></tr></thead><tbody>' +
        w.match.map(function (m, i) { return '<tr><td>' + (i + 1) + '. ' + esc(L(m.a)) + '</td><td>(&nbsp;&nbsp;&nbsp;&nbsp;) ' + esc(L(w.match[order[i]].b)) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
      ((w.short || []).length ? '<h3>' + esc(t('wsShort')) + '</h3><ol>' + w.short.map(function (x) { return '<li>' + esc(L(x.q)) + '<span class="b-lines"><span></span><span></span></span></li>'; }).join('') + '</ol>' : '') +
      (w.draw ? '<h3>' + esc(t('wsDraw')) + '</h3><p>' + esc(L(w.draw)) + '</p><div class="b-draw"></div>' : '') +
      '</section>';
  }

  function answersFor(ch) {
    var qs = ch.quiz || [], w = ch.worksheet || {}, n = 0, html = '<section class="b-ans-ch"><h3>' + esc(chapterN(ch)) + ': ' + esc(L(ch.title)) + '</h3>';
    var mcq = qs.filter(function (q) { return q.type === 'mcq'; }), tf = qs.filter(function (q) { return q.type === 'tf'; }), mt = qs.filter(function (q) { return q.type === 'match'; });
    if (qs.length) {
      html += '<h4>' + esc(t('quizAnswers')) + '</h4><ol class="b-ans">' +
        mcq.map(function (q) { n++; return '<li>(' + esc(letter(q.answer)) + ') ' + esc(L((q.options || [])[q.answer])) + '</li>'; }).join('') +
        tf.map(function (q) { n++; return '<li>' + esc(q.answer ? t('trueW') : t('falseW')) + '</li>'; }).join('') +
        mt.map(function (q) {
          n++;
          var right = (q.pairs || []).map(function (p, i) { return i; });
          right.push(right.shift());
          return '<li>' + (q.pairs || []).map(function (p, i) { return (i + 1) + arrow() + '(' + esc(letter(right.indexOf(i))) + ')'; }).join(RTL[state.lang] ? '، ' : ', ') + '</li>';
        }).join('') + '</ol>';
    }
    if (w.blanks || w.tf || w.match || w.short) {
      var m = (w.match || []).length, order = (w.match || []).map(function (x, i) { return (i + 2) % m; });
      html += '<h4>' + esc(t('worksheetAnswers')) + '</h4>' +
        ((w.blanks || []).length ? '<p><b>' + esc(t('wsBlanks')) + ':</b> ' + w.blanks.map(function (b, i) { return (i + 1) + '. ' + esc(L(b.answer)); }).join(' · ') + '</p>' : '') +
        ((w.tf || []).length ? '<p><b>' + esc(t('wsTF')) + ':</b> ' + w.tf.map(function (x, i) { return (i + 1) + '. ' + (x.answer ? '✔' : '✘'); }).join(' · ') + '</p>' : '') +
        // column B in the printed order, with the number from column A that goes in its brackets
        (m ? '<p><b>' + esc(t('wsMatch')) + ':</b> ' + order.map(function (k) { return '(' + (k + 1) + ') ' + esc(L(w.match[k].b)); }).join(' · ') + '</p>' : '') +
        ((w.short || []).length ? '<p><b>' + esc(t('wsShort')) + ':</b></p><ol>' + w.short.map(function (x) { return '<li>' + esc(L(x.a)) + '</li>'; }).join('') + '</ol>' : '');
    }
    return html + '</section>';
  }

  function chapterPart(ch, opts) {
    var html = '<article class="sheet pb b-chapter">' +
      '<header class="b-head"><p class="b-num">' + esc(chapterN(ch)) + '</p><h2 class="b-title">' + esc(L(ch.title)) + '</h2>' +
      '<p class="b-sum"><b>' + esc(t('willLearn')) + '</b> ' + esc(L(ch.summary)) + '</p></header>';
    if (opts.lesson) html += lessonPart(ch, opts);
    else if (opts.pictures) html += photoBlock(ch) + diagramBlock(ch);
    if (opts.words) html += wordsPart(ch);
    if (opts.experiment) html += experimentPart(ch);
    if (opts.questions) html += questionsPart(ch);
    if (opts.worksheet) html += worksheetPart(ch);
    return html + '</article>';
  }

  function creditsPart(chs) {
    var pics = chs.filter(picture);
    if (!pics.length) return '';
    return '<section class="b-credits"><h4>' + esc(t('credits')) + '</h4><ul>' + pics.map(function (ch) {
      var p = picture(ch);
      return '<li>' + esc(chapterN(ch)) + ': ' + esc(p.author) + ' · ' + esc(p.license) + ' · ' + ltr(p.link.replace('https://', '')) + '</li>';
    }).join('') + '</ul><p>' + esc(t('madeBy')) + ' ' + ltr('sindh-science-portal.vercel.app') + '</p></section>';
  }

  function bookHTML() {
    var chs = state.ch === 'all' ? state.chapters : state.chapters.filter(function (c) { return c.id === state.ch; });
    if (!chs.length) { state.ch = 'all'; chs = state.chapters; }
    var one = chs.length === 1, opts = state.parts;
    var html = cover(chs, one) + chs.map(function (ch) { return chapterPart(ch, opts); }).join('');
    if (opts.answers) html += '<section class="sheet pb b-answers"><p class="b-num">' + esc(t('forTeachers')) + '</p><h2 class="b-title">' + esc(t('answerKeyTitle')) + '</h2>' +
      chs.map(answersFor).join('') + '</section>';
    html += '<section class="sheet b-end">' + creditsPart(chs) + '</section>';
    return html;
  }

  /* ---------- page ---------- */

  function applyLang() {
    var l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    var site = document.getElementById('site-name');
    if (site) site.textContent = t('siteName');
    document.querySelectorAll('[data-setlang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === l)); });
  }
  function readyPdf() { return '/book/pdf/' + (state.ch === 'all' ? 'class5-science' : state.ch) + '-' + state.lang + '.pdf'; }

  function tools() {
    return '<section class="card book-tools no-print">' +
      '<p class="crumbs"><a href="/">' + esc(t('home')) + '</a> › <a href="/class-5/science">' + esc(t('learn')) + '</a> › ' + esc(t('pageTitle')) + '</p>' +
      '<h1>' + esc(t('pageTitle')) + '</h1><p>' + esc(t('intro')) + '</p>' +
      '<div class="bt-row"><label class="field"><span>' + esc(t('chooseChapter')) + '</span><select name="ch">' +
        '<option value="all">' + esc(t('wholeBook', { n: state.chapters.length })) + '</option>' +
        state.chapters.map(function (ch) { return '<option value="' + esc(ch.id) + '"' + (ch.id === state.ch ? ' selected' : '') + '>' + esc(chapterN(ch) + ': ' + L(ch.title)) + '</option>'; }).join('') +
      '</select></label></div>' +
      '<fieldset class="bt-parts"><legend>' + esc(t('include')) + '</legend>' + PARTS.map(function (p) {
        return '<label><input type="checkbox" name="part" value="' + p + '"' + (state.parts[p] ? ' checked' : '') + '> ' + esc(t('p_' + p)) + '</label>';
      }).join('') + '</fieldset>' +
      '<div class="btn-row"><button type="button" class="btn big" data-act="print">' + esc(t('print')) + '</button>' +
        '<a class="btn ghost big" data-ready href="' + readyPdf() + '" download>' + esc(t('ready')) + '</a></div>' +
      '<p class="muted small">' + esc(t('readyNote')) + ' ' + esc(t('tip')) + '</p></section>';
  }

  function render() {
    applyLang();
    document.title = t('pageTitle') + ' | ' + t('siteName');
    main.innerHTML = (PDF_MODE ? '' : tools()) + '<div class="book" id="book">' + bookHTML() + '</div>';
    if (state.ch === 'all') { var s = main.querySelector('select[name="ch"]'); if (s) s.value = 'all'; }
    // the ready PDFs are made after every picture has loaded
    var imgs = [].slice.call(main.querySelectorAll('#book img'));
    Promise.all(imgs.map(function (im) { return im.complete ? null : new Promise(function (ok) { im.addEventListener('load', ok); im.addEventListener('error', ok); }); }))
      .then(function () { return document.fonts ? document.fonts.ready : null; })
      .then(function () { document.body.setAttribute('data-book-ready', '1'); });
  }

  main.addEventListener('change', function (e) {
    if (e.target.name === 'ch') state.ch = e.target.value;
    if (e.target.name === 'part') state.parts[e.target.value] = e.target.checked;
    save('book', { ch: state.ch, parts: state.parts });
    var url = '/book/?ch=' + encodeURIComponent(state.ch) + '&lang=' + state.lang;
    try { history.replaceState(null, '', url); } catch (err) { /* ignore */ }
    render();
  });
  main.addEventListener('click', function (e) {
    if (e.target.closest('[data-act="print"]')) window.print();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (!b) return;
    state.lang = b.getAttribute('data-setlang');
    save('lang', state.lang);
    try { history.replaceState(null, '', '/book/?ch=' + encodeURIComponent(state.ch) + '&lang=' + state.lang); } catch (err) { /* ignore */ }
    if (state.chapters.length) render();
  });

  // the shared menu (site-nav.js) and the rest of the site follow the language of this page
  if (!PDF_MODE) save('lang', state.lang);
  if (PDF_MODE) document.body.classList.add('pdf-mode');
  applyLang();
  main.innerHTML = '<p class="loading">' + esc(t('loading')) + '</p>';
  loadChapters().then(function (chs) { state.chapters = chs; render(); })
    .catch(function () { main.innerHTML = '<p class="card">' + esc(t('loadError')) + '</p>'; });
})();
