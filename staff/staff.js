/* Teachers and staff (/staff/): the one door to every grown-ups' page, kept apart from the children's website.
   Each card says in one line what the page is for. */
(function () {
  'use strict';

  var K = window.Kit, esc = K.esc;
  var T = {
    title: { sd: 'استادن ۽ اسٽاف لاءِ', ur: 'اساتذہ اور اسٹاف کے لیے', en: 'Teachers and staff' },
    lead: {
      sd: 'هتي استادن، هيڊ ماسترن ۽ اسٽاف جا سڀ صفحا آهن. ٻارن جي ويب سائيٽ الڳ آهي.',
      ur: 'یہاں اساتذہ، ہیڈ ماسٹرز اور اسٹاف کے تمام صفحات ہیں۔ بچوں کی ویب سائٹ الگ ہے۔',
      en: 'All the pages for teachers, head teachers and staff are here. The children\'s website is separate.'
    },
    teacher: { sd: 'استاد', ur: 'استاد', en: 'Teacher' },
    teacherText: { sd: 'پنهنجو ڪلاس، ٻارن جا اڪائونٽ، هوم ورڪ ۽ هفتيوار رپورٽ.', ur: 'اپنی کلاس، بچوں کے اکاؤنٹ، ہوم ورک اور ہفتہ وار رپورٹ۔', en: 'Your class, the children\'s accounts, homework and the weekly report.' },
    school: { sd: 'هيڊ ماستر', ur: 'ہیڈ ماسٹر', en: 'Head teacher' },
    schoolText: { sd: 'سڄي اسڪول جي ڪلاسن جا نتيجا هڪ هنڌ.', ur: 'پورے اسکول کی کلاسوں کے نتائج ایک جگہ۔', en: 'Results of every class in your school in one place.' },
    paper: { sd: 'سوالن جو پرچو', ur: 'سوالیہ پرچہ', en: 'Question paper' },
    paperText: { sd: 'باب چونڊيو ۽ امتحان جو پرچو جوابن سان ٺاهيو.', ur: 'ابواب چنیں اور امتحان کا پرچہ جوابات کے ساتھ بنائیں۔', en: 'Choose chapters and make an exam paper with answers.' },
    book: { sd: 'باب جو ڪتاب (PDF)', ur: 'باب کی کتاب (PDF)', en: 'Chapter book (PDF)' },
    bookText: { sd: 'هر باب جو ڇپجڻ لائق ڪتاب، واٽس ايپ تي موڪلڻ لاءِ.', ur: 'ہر باب کی پرنٹ ہونے والی کتاب، واٹس ایپ پر بھیجنے کے لیے۔', en: 'A printable book of each chapter, to send on WhatsApp.' },
    videos: { sd: 'تربيتي وڊيوز', ur: 'تربیتی ویڈیوز', en: 'Training videos' },
    videosText: { sd: 'پورٽل ڪيئن استعمال ڪجي، اردو ۾ ننڍيون وڊيوز.', ur: 'پورٹل کیسے استعمال کریں، اردو میں چھوٹی ویڈیوز۔', en: 'Short Urdu videos on how to use the portal.' },
    stats: { sd: 'استعمال جا انگ', ur: 'استعمال کی گنتی', en: 'Usage numbers' },
    statsText: { sd: 'پورٽل ڪيترو استعمال ٿيو، رڳو انگن ۾.', ur: 'پورٹل کتنا استعمال ہوا، صرف گنتی میں۔', en: 'How much the portal is used, in numbers only.' },
    admin: { sd: 'اسٽاف پينل', ur: 'اسٹاف پینل', en: 'Staff panel' },
    adminText: { sd: 'ايڊمن: باب، سوال، استاد ۽ پرنسپل جا اڪائونٽ، ڪڍيل ٻار.', ur: 'ایڈمن: ابواب، سوالات، استاد اور پرنسپل کے اکاؤنٹ، نکالے گئے بچے۔', en: 'Admins: chapters, questions, teacher and principal accounts, struck-off students.' },
    open: { sd: 'کوليو', ur: 'کھولیں', en: 'Open' },
    kids: { sd: 'ٻارن جي ويب سائيٽ ڏانهن', ur: 'بچوں کی ویب سائٹ پر جائیں', en: 'Go to the children\'s website' }
  };
  function t(k) { return K.text(T, k); }
  var CARDS = [
    ['/class/', 'teacher', '<path d="M4 19V8l8-4 8 4v11"/><path d="M9 19v-6h6v6"/>'],
    ['/school/', 'school', '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M10 21v-5h4v5"/>'],
    ['/paper/', 'paper', '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>'],
    ['/book/', 'book', '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'],
    ['/videos/', 'videos', '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>'],
    ['/stats/', 'stats', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
    ['/admin', 'admin', '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>']
  ];
  var main = document.getElementById('main');
  function draw() {
    K.applyLang(t('title'));
    main.innerHTML =
      '<section class="card sf-hero"><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></section>' +
      '<div class="sf-grid">' + CARDS.map(function (c) {
        return '<a class="card sf-card" href="' + c[0] + '"><span class="icon-tile"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + c[2] + '</svg></span>' +
          '<span class="sf-body"><strong>' + esc(t(c[1])) + '</strong><span class="muted">' + esc(t(c[1] + 'Text')) + '</span></span></a>';
      }).join('') + '</div>' +
      '<p class="sf-kids"><a class="btn ghost" href="/">' + esc(t('kids')) + '</a></p>';
  }
  K.onLang(draw);
  draw();
})();
