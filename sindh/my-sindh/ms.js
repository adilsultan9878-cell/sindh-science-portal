/* Sindh Science Learning Portal — My Sindh (/sindh/my-sindh/).
   Each finished chapter (quiz, worksheet and experiment all done, as on the chapter page) colours its districts of
   Sindh in ajrak. When all 13 are done the whole map glows and the student gets a certificate with a QR check.
   Progress is read from this device ('ssp1.progress'); district shapes come from tools/sindh-map/districts.js. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var CFG = window.PORTAL_CONFIG || null;

  // Chapters in book order and the districts each one lights up.
  var CHAPTERS = [
    { id: 'living-things', d: ['Karachi', 'Badin'], sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' },
    { id: 'microorganisms', d: ['Hyderabad', 'Tando Allahyar'], sd: 'خوردبيني جاندار', ur: 'خوردبینی جاندار', en: 'Microorganisms' },
    { id: 'seeds', d: ['Khairpur', 'Naushahro Feroze'], sd: 'ٻج: بناوت ۽ ڦٽڻ', ur: 'بیج: ساخت اور اگنا', en: 'Seeds: Structure and Germination' },
    { id: 'pollution', d: ['Jamshoro', 'Dadu'], sd: 'ماحولياتي آلودگي', ur: 'ماحولیاتی آلودگی', en: 'Environmental Pollution' },
    { id: 'matter', d: ['Larkana', 'Kambar Shahdadkot'], sd: 'مادو ۽ ان ۾ تبديليون', ur: 'مادہ اور اس میں تبدیلیاں', en: 'Matter and Its Changes' },
    { id: 'force-machines', d: ['Sukkur', 'Ghotki'], sd: 'قوت ۽ سادا مشينون', ur: 'قوت اور سادہ مشینیں', en: 'Force and Simple Machines' },
    { id: 'light-sound', d: ['Kashmore', 'Shikarpur'], sd: 'روشني ۽ آواز', ur: 'روشنی اور آواز', en: 'Light and Sound' },
    { id: 'electricity-magnets', d: ['Thatta', 'Sujawal'], sd: 'بجلي ۽ مقناطيس', ur: 'بجلی اور مقناطیس', en: 'Electricity and Magnets' },
    { id: 'soils', d: ['Tharparkar', 'Umerkot'], sd: 'مٽي', ur: 'مٹی', en: 'Soils' },
    { id: 'earth-space', d: ['Jacobabad'], sd: 'زمين ۽ خلا', ur: 'زمین اور خلا', en: 'Earth and Space' },
    { id: 'plants', d: ['Mirpurkhas', 'Sanghar'], sd: 'ٻوٽا: حصا ۽ کاڌو ٺاهڻ', ur: 'پودے: حصے اور غذا بنانا', en: 'Plants: Parts and Making Food' },
    { id: 'digestion', d: ['Shaheed Benazirabad', 'Matiari'], sd: 'اسان جو جسم: هاضمي جو نظام', ur: 'ہمارا جسم: نظامِ انہضام', en: 'Our Body: The Digestive System' },
    { id: 'water-cycle', d: ['Tando Muhammad Khan'], sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' }
  ];

  // Simplified district shapes (a teaching sketch, not survey boundaries), from tools/sindh-map/districts.js.
  var DISTRICTS = {"Karachi":{"d":"M104.1 361.3L71.5 432.1L69 425L50.6 395L23 390L18.4 370L46 330L54.7 321.9Z","c":[61,371]},"Thatta":{"d":"M161.8 402.9L103.9 474.8L82.8 465L71.5 432.1L104.1 361.3L126.3 358L147.4 375.2Z","c":[114,414]},"Sujawal":{"d":"M200.4 458.2L161 505L115 480L103.9 474.8L161.8 402.9L179.4 412.5Z","c":[157,457]},"Badin":{"d":"M291.8 452.2L243.8 447L211.6 445L200.4 458.2L179.4 412.5L232.5 374.1L237.7 373.7L276.9 388.7L287 402.5Z","c":[239,417]},"Tando Muhammad Khan":{"d":"M232.5 374.1L179.4 412.5L161.8 402.9L147.4 375.2L195.5 345.4Z","c":[187,379]},"Hyderabad":{"d":"M195.5 322.5L195.5 345.4L147.4 375.2L126.3 358L145.1 306.9Z","c":[160,340]},"Tando Allahyar":{"d":"M237.7 373.7L232.5 374.1L195.5 345.4L195.5 322.5L223.3 292.3L227.4 295.4Z","c":[218,334]},"Matiari":{"d":"M223.3 292.3L195.5 322.5L145.1 306.9L143.6 279.1L216.1 271.3Z","c":[183,294]},"Jamshoro":{"d":"M145.1 306.9L126.3 358L104.1 361.3L54.7 321.9L78.2 300L81.3 262.5L133.1 262.5L143.6 279.1Z","c":[107,309]},"Dadu":{"d":"M133.1 262.5L81.3 262.5L82.8 245L87.4 190L94.1 168L120 175.8L144.6 229.3Z","c":[110,222]},"Kambar Shahdadkot":{"d":"M154.8 97.3L137 165L120 175.8L94.1 168L101.2 145L115 90L129 77.3Z","c":[125,129]},"Larkana":{"d":"M137 165L154.8 97.3L175 101.4L202.7 134.6L207.4 165Z","c":[172,138]},"Jacobabad":{"d":"M162.8 28L211.6 15L211.7 15L216.7 40.9L175 101.4L154.8 97.3L129 77.3L142.6 65Z","c":[176,58]},"Shikarpur":{"d":"M202.7 134.6L175 101.4L216.7 40.9L251.1 82Z","c":[212,89]},"Kashmore":{"d":"M211.7 15L266.8 13L303.6 23L305.8 25.5L263.2 85.1L251.1 82L216.7 40.9Z","c":[256,41]},"Ghotki":{"d":"M305.8 25.5L331.2 55L335.8 90L326.6 145L327.4 148.5L300.9 138.4L263.2 85.1Z","c":[306,88]},"Sukkur":{"d":"M207.4 165L202.7 134.6L251.1 82L263.2 85.1L300.9 138.4L213.9 174.8Z","c":[247,130]},"Khairpur":{"d":"M327.4 148.5L340.4 205L348.6 240.5L346.1 241.4L226.1 225.1L213.9 204.2L213.9 174.8L300.9 138.4Z","c":[283,193]},"Naushahro Feroze":{"d":"M144.6 229.3L120 175.8L137 165L207.4 165L213.9 174.8L213.9 204.2Z","c":[169,191]},"Shaheed Benazirabad":{"d":"M216.1 271.3L143.6 279.1L133.1 262.5L144.6 229.3L213.9 204.2L226.1 225.1Z","c":[182,245]},"Sanghar":{"d":"M282.4 305.3L227.4 295.4L223.3 292.3L216.1 271.3L226.1 225.1L346.1 241.4Z","c":[270,263]},"Mirpurkhas":{"d":"M276.9 388.7L237.7 373.7L227.4 295.4L282.4 305.3Z","c":[256,339]},"Umerkot":{"d":"M348.6 240.5L354.2 265L354.2 305L379.7 332.7L287 402.5L276.9 388.7L282.4 305.3L346.1 241.4Z","c":[321,326]},"Tharparkar":{"d":"M379.7 332.7L386.4 340L418.6 375L429.6 405L391 440L317.4 455L291.8 452.2L287 402.5Z","c":[357,402]}};

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    progress: { sd: 'منهنجي ترقي', ur: 'میری پیش رفت', en: 'My progress' },
    title: { sd: 'منهنجو سنڌ', ur: 'میرا سندھ', en: 'My Sindh' },
    eyebrow: { sd: 'ڪلاس 5 سائنس · اجرڪ نقشو', ur: 'جماعت پنجم سائنس · اجرک نقشہ', en: 'Class 5 Science · the ajrak map' },
    lead: {
      sd: 'هر باب جو ڪوئز، ورڪ شيٽ ۽ تجربو پورو ڪريو ته سنڌ جا ضلعا اجرڪ جي رنگن ۾ رنگجي ويندا. سڀ 13 باب پورا ڪريو ته سڄو سنڌ اجرڪ ۾ چمڪندو ۽ توهان کي QR وارو سرٽيفڪيٽ ملندو.',
      ur: 'ہر باب کا کوئز، ورک شیٹ اور تجربہ مکمل کریں تو سندھ کے اضلاع اجرک کے رنگوں میں رنگ جائیں گے۔ تمام 13 ابواب مکمل کریں تو پورا سندھ اجرک میں چمکے گا اور آپ کو QR والا سرٹیفکیٹ ملے گا۔',
      en: 'Finish the quiz, worksheet and experiment of a chapter and its districts of Sindh turn into ajrak. Finish all 13 chapters and the whole of Sindh shines in ajrak, and you get a certificate with a QR code.'
    },
    count: { sd: '13 مان {n} باب پورا', ur: '13 میں سے {n} ابواب مکمل', en: '{n} of 13 chapters done' },
    mapTitle: { sd: 'منهنجي سنڌ جو نقشو', ur: 'میرے سندھ کا نقشہ', en: 'My map of Sindh' },
    mapNote: { sd: 'ضلعن جون حدون سادي خاڪي ۾ آهن، ماپ مطابق نه.', ur: 'اضلاع کی حدیں سادہ خاکے میں ہیں، پیمانے کے مطابق نہیں۔', en: 'District borders are a simple sketch, not to scale.' },
    preview: { sd: 'ڏسو پورو سنڌ ڪيئن لڳندو', ur: 'دیکھیں پورا سندھ کیسا لگے گا', en: 'See how all of Sindh will look' },
    back: { sd: 'منهنجو نقشو', ur: 'میرا نقشہ', en: 'My map' },
    chaptersTitle: { sd: 'باب ۽ انهن جا ضلعا', ur: 'ابواب اور ان کے اضلاع', en: 'Chapters and their districts' },
    steps: { sd: '3 مان {n}', ur: '3 میں سے {n}', en: '{n} of 3' },
    done: { sd: 'پورو', ur: 'مکمل', en: 'Done' },
    open: { sd: 'باب کوليو', ur: 'باب کھولیں', en: 'Open chapter' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    allDone: { sd: 'مبارڪون! سڄو سنڌ اجرڪ ۾ چمڪي رهيو آهي!', ur: 'مبارک ہو! پورا سندھ اجرک میں چمک رہا ہے!', en: 'Congratulations! All of Sindh is shining in ajrak!' },
    certHead: { sd: 'منهنجو سنڌ: سائنس سرٽيفڪيٽ', ur: 'میرا سندھ: سائنس سرٹیفکیٹ', en: 'My Sindh: Science Certificate' },
    certText: {
      sd: 'هي سرٽيفڪيٽ {name} کي ڪلاس 5 سائنس جا سڀ 13 باب پورا ڪري سڄي سنڌ کي اجرڪ ۾ رنگڻ تي ڏنو وڃي ٿو.',
      ur: 'یہ سرٹیفکیٹ {name} کو جماعت پنجم سائنس کے تمام 13 ابواب مکمل کر کے پورے سندھ کو اجرک میں رنگنے پر دیا جاتا ہے۔',
      en: 'This certificate is given to {name} for finishing all 13 chapters of Class 5 Science and colouring all of Sindh in ajrak.'
    },
    date: { sd: 'تاريخ', ur: 'تاریخ', en: 'Date' },
    askName: { sd: 'سرٽيفڪيٽ تي ڪهڙو نالو لکجي؟', ur: 'سرٹیفکیٹ پر کون سا نام لکھا جائے؟', en: 'Which name should go on the certificate?' },
    printCert: { sd: 'سرٽيفڪيٽ پرنٽ ڪريو', ur: 'سرٹیفکیٹ پرنٹ کریں', en: 'Print certificate' },
    share: { sd: 'واٽس ايپ تي ونڊيو', ur: 'واٹس ایپ پر شیئر کریں', en: 'Share on WhatsApp' },
    shareText: { sd: 'مون ڪلاس 5 سائنس جا سڀ 13 باب پورا ڪري سڄو سنڌ اجرڪ ۾ رنگيو! سرٽيفڪيٽ ڏسو:', ur: 'میں نے جماعت پنجم سائنس کے تمام 13 ابواب مکمل کر کے پورا سندھ اجرک میں رنگ دیا! سرٹیفکیٹ دیکھیں:', en: 'I finished all 13 chapters of Class 5 Science and coloured all of Sindh in ajrak! See my certificate:' },
    certCheck: { sd: 'هي سرٽيفڪيٽ اصلي آهي يا نه، QR ڪوڊ اسڪين ڪري ڏسو. ڪوڊ:', ur: 'یہ سرٹیفکیٹ اصلی ہے یا نہیں، QR کوڈ اسکین کر کے دیکھیں۔ کوڈ:', en: 'Scan the QR code to check that this certificate is real. Code:' },
    keepGoing: { sd: 'اڳيان: {ch}. ان سان {d} رنگبا.', ur: 'اگلا: {ch}۔ اس سے {d} رنگے جائیں گے۔', en: 'Next: {ch}. It will colour {d}.' },
    deviceNote: { sd: 'توهان جي ترقي هن فون/ڪمپيوٽر تي محفوظ آهي.', ur: 'آپ کی پیش رفت اس فون/کمپیوٹر پر محفوظ ہے۔', en: 'Your progress is saved on this phone or computer.' }
  };

  var main = document.getElementById('main');
  var state = { lang: 'sd', preview: false };
  try { var sl = JSON.parse(localStorage.getItem('ssp1.lang')); if (LANGS.indexOf(sl) >= 0) state.lang = sl; } catch (e) { /* Sindhi */ }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) { return o == null ? '' : typeof o === 'object' ? (o[state.lang] != null ? o[state.lang] : o.en) : String(o); }
  function t(key, vars) {
    var s = L(T[key]);
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function get(k, d) { try { var v = localStorage.getItem('ssp1.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem('ssp1.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  function district(en) {
    var c = (window.CITIES || []).filter(function (x) { return x.en === en; })[0];
    return c ? L(c) : en;
  }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // Same rule as the chapter page: quiz, worksheet and experiment each count once.
  function status() {
    var p = get('progress', {}) || {};
    return CHAPTERS.map(function (ch) {
      var k = '5/science/' + ch.id;
      var n = (p.quiz && p.quiz[k] ? 1 : 0) + (p.ws && p.ws[k] ? 1 : 0) + (p.exp && p.exp[k] ? 1 : 0);
      return { ch: ch, steps: n, done: n === 3 };
    });
  }

  function mapSvg(st) {
    var lit = {};
    st.forEach(function (s, i) { if (s.done || state.preview) s.ch.d.forEach(function (d) { lit[d] = i + 1; }); });
    var all = Object.keys(lit).length === Object.keys(DISTRICTS).length;
    var shapes = Object.keys(DISTRICTS).map(function (name) {
      var g = DISTRICTS[name];
      return '<path class="ms-d' + (lit[name] ? ' lit' : '') + '" d="' + g.d + '"><title>' + esc(district(name)) + '</title></path>';
    }).join('');
    var nums = CHAPTERS.map(function (ch, i) {
      var c = DISTRICTS[ch.d[0]].c;
      return '<g class="ms-num' + (lit[ch.d[0]] ? ' lit' : '') + '"><circle cx="' + c[0] + '" cy="' + c[1] + '" r="10"/><text x="' + c[0] + '" y="' + (c[1] + 4) + '" text-anchor="middle">' + (i + 1) + '</text></g>';
    }).join('');
    return '<svg class="ms-map' + (all ? ' all' : '') + '" viewBox="0 0 445 525" role="img" aria-labelledby="ms-map-title">' +
      '<defs><pattern id="ajrak" width="28" height="28" patternUnits="userSpaceOnUse">' +
        '<rect width="28" height="28" fill="#8e1b1f"/>' +
        '<path d="M14 3 L25 14 L14 25 L3 14 Z" fill="#1d2a5b"/>' +
        '<path d="M14 8 L20 14 L14 20 L8 14 Z" fill="#8e1b1f"/>' +
        '<circle cx="14" cy="14" r="2.6" fill="#f7efe2"/>' +
        '<circle cx="0" cy="0" r="3" fill="#f7efe2"/><circle cx="28" cy="0" r="3" fill="#f7efe2"/><circle cx="0" cy="28" r="3" fill="#f7efe2"/><circle cx="28" cy="28" r="3" fill="#f7efe2"/>' +
        '<circle cx="14" cy="0.5" r="1.3" fill="#1d2a5b"/><circle cx="14" cy="27.5" r="1.3" fill="#1d2a5b"/><circle cx="0.5" cy="14" r="1.3" fill="#1d2a5b"/><circle cx="27.5" cy="14" r="1.3" fill="#1d2a5b"/>' +
      '</pattern></defs>' + shapes + nums + '</svg>';
  }

  function nextHint(st) {
    var nx = st.filter(function (s) { return !s.done; })[0];
    if (!nx) return '';
    return '<p class="note">' + esc(t('keepGoing', { ch: t('chapterN', { n: CHAPTERS.indexOf(nx.ch) + 1 }) + ': ' + L(nx.ch), d: nx.ch.d.map(district).join('، ') })) +
      ' <a href="/class-5/science/' + nx.ch.id + '">' + esc(t('open')) + ' →</a></p>';
  }

  function certHtml() {
    var p = get('progress', {}) || {};
    return '<section class="card ms-done"><h2>' + esc(t('allDone')) + '</h2><div class="btn-row no-print">' +
      '<button type="button" class="btn" data-act="cert">' + esc(t('printCert')) + '</button>' +
      '<button type="button" class="btn ghost" data-act="share">' + esc(t('share')) + '</button></div>' +
      '<div class="certificate ms-cert"><div class="ms-band" aria-hidden="true"></div><p class="cert-site">' + esc(t('siteName')) + '</p>' +
        '<h2>' + esc(t('certHead')) + '</h2><div class="ms-cert-map">' + mapSvg(status()) + '</div>' +
        '<p class="cert-text">' + esc(t('certText', { name: p.nick || '________________' })) + '</p>' +
        '<p class="muted">' + esc(t('date')) + ': ' + today() + '</p><p class="cert-org">The Professional Educator · EduPulse Nexus</p>' +
        '<div class="cert-verify"></div></div></section>';
  }

  function render() {
    var st = status(), n = st.filter(function (s) { return s.done; }).length;
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/progress">' + esc(t('progress')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="sp-hero no-print"><div class="sp-band ms-ajrak-band" aria-hidden="true"></div><div class="sp-hero-in">' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p>' +
        '<p class="ms-count"><b>' + esc(t('count', { n: n })) + '</b></p><div class="ms-bar" role="progressbar" aria-valuemin="0" aria-valuemax="13" aria-valuenow="' + n + '"><span style="width:' + Math.round(100 * n / 13) + '%"></span></div>' +
      '</div></section>' +
      (n === 13 ? certHtml() : '') +
      '<section class="card ms-mapcard no-print"><div class="ms-maphead"><h2 id="ms-map-title">' + esc(t('mapTitle')) + '</h2>' +
        (n < 13 ? '<button type="button" class="btn ghost small" data-act="preview" aria-pressed="' + state.preview + '">' + esc(t(state.preview ? 'back' : 'preview')) + '</button>' : '') + '</div>' +
        '<div class="ms-grid"><div class="ms-mapbox">' + mapSvg(st) + '<p class="muted small">' + esc(t('mapNote')) + '</p></div>' +
        '<div><h3>' + esc(t('chaptersTitle')) + '</h3><ol class="ms-list">' + st.map(function (s, i) {
          return '<li class="' + (s.done ? 'done' : '') + '"><a href="/class-5/science/' + s.ch.id + '"><span class="ms-lnum">' + (i + 1) + '</span><span>' + esc(L(s.ch)) +
            '<small>' + esc(s.ch.d.map(district).join('، ')) + '</small></span><b class="ms-state">' + esc(s.done ? '✓ ' + t('done') : t('steps', { n: s.steps })) + '</b></a></li>';
        }).join('') + '</ol></div></div>' + (n < 13 ? nextHint(st) : '') + '<p class="muted small">' + esc(t('deviceNote')) + '</p></section>';
  }

  /* certificate with a QR check, using the site's issue_certificate / verify_certificate (kind 'mera-sindh') */
  function loadQr() {
    if (window.qrcode) return Promise.resolve();
    return new Promise(function (ok, bad) { var s = document.createElement('script'); s.src = '/js/qrcode.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  }
  function certCode(name) {
    var key = 'cert.mera-sindh|' + name;
    var saved = get(key, null);
    if (saved) return Promise.resolve(saved);
    if (!CFG) return Promise.reject(new Error('no database'));
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/issue_certificate', {
      method: 'POST', headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_kind: 'mera-sindh', p_name: name })
    }).then(function (r) { if (!r.ok) throw new Error('db ' + r.status); return r.json(); })
      .then(function (code) { set(key, code); return code; });
  }
  function withCode(fn) {
    var p = get('progress', {}) || {};
    if (!p.nick) {
      var name = (window.prompt(t('askName')) || '').trim().slice(0, 40);
      if (!name) return;
      p.nick = name; set('progress', p); render();
    }
    var slot = main.querySelector('.ms-cert .cert-verify');
    Promise.all([certCode(p.nick), loadQr()]).then(function (res) {
      var code = res[0], url = location.origin + '/verify/' + code;
      var qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
      if (slot) slot.innerHTML = '<div class="cert-qr">' + qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true, alt: url }) + '</div>' +
        '<p class="cert-code">' + esc(t('certCheck')) + ' <b dir="ltr">' + esc(code) + '</b><br><small dir="ltr">' + esc(url.replace(/^https?:\/\//, '')) + '</small></p>';
      fn(url);
    }).catch(function () { fn(location.origin + '/sindh/my-sindh/'); });   // offline: still prints, without the check
  }

  function applyLang() {
    var l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.title = t('title') + ' | ' + t('siteName');
    document.getElementById('site-name').textContent = t('siteName');
    [].forEach.call(document.querySelectorAll('[data-setlang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === l)); });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (b) {
      var l = b.getAttribute('data-setlang');
      if (LANGS.indexOf(l) < 0 || l === state.lang) return;
      state.lang = l; set('lang', l); applyLang(); render();
      return;
    }
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'preview') { state.preview = !state.preview; render(); }
    if (act === 'cert') withCode(function () { document.body.classList.add('print-cert'); window.print(); document.body.classList.remove('print-cert'); });
    if (act === 'share') withCode(function (url) { window.open('https://wa.me/?text=' + encodeURIComponent(t('shareText') + ' ' + url), '_blank', 'noopener'); });
  });

  applyLang();
  render();
})();
