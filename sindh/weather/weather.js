/* Sindh Science Learning Portal — "Sindh weather lab" (/sindh/weather/).
   Three sliders, each with a simple model and a drawing that is redrawn as the slider moves (no animation):
   heat and drying water (Jacobabad), river water reaching the Indus delta, and wind power at Jhimpir. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };

  var CHAPTERS = {
    'water-cycle': { n: 13, sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' },
    plants: { n: 11, sd: 'ٻوٽا: حصا ۽ کاڌو ٺاهڻ', ur: 'پودے: حصے اور غذا بنانا', en: 'Plants: Parts and Making Food' },
    'living-things': { n: 1, sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' },
    'electricity-magnets': { n: 8, sd: 'بجلي ۽ مقناطيس', ur: 'بجلی اور مقناطیس', en: 'Electricity and Magnets' }
  };

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    sindh: { sd: 'سنڌ ۾ سائنس', ur: 'سندھ میں سائنس', en: 'Science in Sindh' },
    title: { sd: 'سنڌ جي موسم ليب', ur: 'سندھ کی موسمی لیب', en: 'Sindh weather lab' },
    eyebrow: { sd: 'سنڌ ۾ سائنس · تجربا', ur: 'سندھ میں سائنس · تجربے', en: 'Science in Sindh · Experiments' },
    lead: {
      sd: 'سلائيڊر هلايو ۽ ڏسو ته گرمي، درياءَ جو پاڻي ۽ هوا سنڌ ۾ ڇا ٿا ڪن. هي سادا نمونا آهن، جيڪي ڪتاب جي سبقن کي سمجهڻ ۾ مدد ڪن ٿا.',
      ur: 'سلائیڈر ہلائیں اور دیکھیں کہ گرمی، دریا کا پانی اور ہوا سندھ میں کیا کرتے ہیں۔ یہ سادہ ماڈل ہیں جو کتاب کے اسباق سمجھنے میں مدد کرتے ہیں۔',
      en: 'Move the sliders and see what heat, river water and wind do in Sindh. These are simple models that help you understand the lessons in your book.'
    },
    think: { sd: 'سوچيو ۽ ڳالهايو', ur: 'سوچیں اور بات کریں', en: 'Think and talk' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    simple: { sd: 'سادو نمونو، پورو حساب ناهي.', ur: 'سادہ ماڈل، پورا حساب نہیں۔', en: 'A simple model, not an exact calculation.' },

    h_title: { sd: 'گرمي ۽ پاڻيءَ جو سڪڻ', ur: 'گرمی اور پانی کا سوکھنا', en: 'Heat and drying water' },
    h_place: { sd: 'جيڪب آباد', ur: 'جیکب آباد', en: 'Jacobabad' },
    h_intro: {
      sd: 'جڏهن پاڻي گرم ٿئي ٿو ته ان جو وڌيڪ حصو ٻاڦ بڻجي هوا ۾ هليو وڃي ٿو. ان کي ٻاڦ ٿيڻ چئبو آهي. سلائيڊر هلائي ڏسو ته مختلف گرمي پد تي پاڻيءَ جو هڪ ننڍو پيالو ڪيترو جلدي سڪي ٿو.',
      ur: 'جب پانی گرم ہوتا ہے تو اس کا زیادہ حصہ بھاپ بن کر ہوا میں چلا جاتا ہے۔ اسے تبخیر کہتے ہیں۔ سلائیڈر ہلا کر دیکھیں کہ مختلف درجۂ حرارت پر پانی کا ایک چھوٹا پیالہ کتنی جلدی سوکھتا ہے۔',
      en: 'When water gets warm, more of it turns into water vapour and goes into the air. This is called evaporation. Move the slider to see how fast a small bowl of water dries at different temperatures.'
    },
    h_slider: { sd: 'گرمي پد', ur: 'درجۂ حرارت', en: 'Temperature' },
    h_p1: { sd: 'سياري جي صبح', ur: 'سردیوں کی صبح', en: 'Winter morning' },
    h_p2: { sd: 'بهار جو ڏينهن', ur: 'بہار کا دن', en: 'Spring day' },
    h_p3: { sd: 'جيڪب آباد، جون', ur: 'جیکب آباد، جون', en: 'Jacobabad in June' },
    h_res: { sd: 'پاڻيءَ جو ننڍو پيالو لڳ ڀڳ {h} ڪلاڪن ۾ سڪي وڃي ٿو.', ur: 'پانی کا چھوٹا پیالہ تقریباً {h} گھنٹوں میں سوکھ جاتا ہے۔', en: 'A small bowl of water dries in about {h} hours.' },
    h_res2: { sd: '4 ڪلاڪن کان پوءِ {p}% پاڻي هوا ۾ هليو وڃي ٿو.', ur: '4 گھنٹے بعد {p}% پانی ہوا میں جا چکا ہوتا ہے۔', en: 'After 4 hours, {p}% of the water has gone into the air.' },
    h_res3: { sd: '{t} ڊگريءَ تي پاڻي 15 ڊگريءَ جي ڀيٽ ۾ لڳ ڀڳ {x} ڀيرا جلدي سڪي ٿو.', ur: '{t} ڈگری پر پانی 15 ڈگری کے مقابلے میں تقریباً {x} گنا جلدی سوکھتا ہے۔', en: 'At {t} °C water dries about {x} times faster than at 15 °C.' },
    h_note: { sd: 'ڇانوَ ۾ رکيل پيالو، ٿوري هوا سان. سج، هوا ۽ نمي سان وقت بدلجي ٿو.', ur: 'سائے میں رکھا پیالہ، ہلکی ہوا کے ساتھ۔ دھوپ، ہوا اور نمی سے وقت بدل جاتا ہے۔', en: 'A bowl in the shade with a light breeze. Sun, wind and damp air change the time.' },
    h_think: {
      sd: 'جيڪب آباد جا ماڻهو اونهاري ۾ پيئڻ جو پاڻي مٽيءَ جي مٽڪي ۾ ڇو رکندا آهن؟ (اشارو: ٻاڦ ٿيڻ ٿڌ ڪري ٿو.)',
      ur: 'جیکب آباد کے لوگ گرمیوں میں پینے کا پانی مٹی کے مٹکے میں کیوں رکھتے ہیں؟ (اشارہ: تبخیر ٹھنڈک پیدا کرتی ہے۔)',
      en: 'Why do people in Jacobabad keep drinking water in a clay pot (matka) in summer? (Hint: evaporation cools.)'
    },

    d_title: { sd: 'درياءَ جو پاڻي ۽ ڇوڙ', ur: 'دریا کا پانی اور ڈیلٹا', en: 'River water and the delta' },
    d_place: { sd: 'سنڌو درياءَ جو ڇوڙ، ٺٽو ۽ ڪيٽي بندر', ur: 'دریائے سندھ کا ڈیلٹا، ٹھٹہ اور کیٹی بندر', en: 'The Indus delta, Thatta and Keti Bandar' },
    d_intro: {
      sd: 'سمنڊ ويجهو درياءَ ۽ سمنڊ جو پاڻي پاڻ ۾ ملن ٿا. درياءَ جو مٺو پاڻي سمنڊ جي کاري پاڻيءَ کي پوئتي رکي ٿو ۽ مٽي آڻي ٿو جنهن سان زمين ٺهي ٿي. سلائيڊر سان بدلايو ته سنڌو درياءَ جو ڪيترو پاڻي سمنڊ تائين پهچي ٿو.',
      ur: 'سمندر کے قریب دریا اور سمندر کا پانی آپس میں ملتے ہیں۔ دریا کا میٹھا پانی کھارے سمندری پانی کو پیچھے رکھتا ہے اور مٹی لاتا ہے جس سے زمین بنتی ہے۔ سلائیڈر سے بدلیں کہ دریائے سندھ کا کتنا پانی سمندر تک پہنچتا ہے۔',
      en: 'Near the sea, river water and sea water meet. Fresh river water keeps the salty sea water back and brings mud that builds the land. Move the slider to change how much Indus water reaches the sea.'
    },
    d_slider: { sd: 'سمنڊ تائين پهچندڙ درياءَ جو پاڻي', ur: 'سمندر تک پہنچنے والا دریا کا پانی', en: 'River water reaching the sea' },
    d_levels: { sd: ['تمام ٿورو', 'ٿورو', 'ڪجهه', 'چڱو', 'گهڻو'], ur: ['بہت کم', 'کم', 'کچھ', 'اچھا خاصا', 'بہت زیادہ'], en: ['Very little', 'Little', 'Some', 'Good', 'Plenty'] },
    d_text: {
      sd: ['سمنڊ جو پاڻي ڇوڙ ۾ تمام گهڻو اندر اچي وڃي ٿو. کوهه ۽ ٻنيون کاريون ٿي وڃن ٿيون، تمر سڪڻ لڳن ٿا ۽ تمام ٿورا پلا آنا ڏيڻ لاءِ درياءَ ۾ اچن ٿا.',
        'سمنڊ جو پاڻي اڃا به ڪافي اندر اچي ٿو. گهڻا تمر ڪمزور آهن ۽ مهاڻن کي ٿوري مڇي ملي ٿي.',
        'درياءَ ۽ سمنڊ جو پاڻي ڪجهه برابر آهي. ڪجهه تمر صحتمند آهن ۽ ڪجهه پلا درياءَ ۾ اچن ٿا.',
        'مٺو پاڻي سمنڊ کي پوئتي رکي ٿو. تمر سٺا ٿين ٿا، زمين کي نئين مٽي ملي ٿي ۽ گهڻا پلا درياءَ ۾ مٿي اچن ٿا.',
        'ڇوڙ تائين گهڻو مٺو پاڻي ۽ مٽي پهچي ٿي. تمر جا ٻيلا گهاٽا آهن، ٻنيون مٺيون رهن ٿيون ۽ پلو گهڻو ملي ٿو.'],
      ur: ['سمندر کا پانی ڈیلٹا میں بہت اندر تک آ جاتا ہے۔ کنویں اور کھیت کھارے ہو جاتے ہیں، تمر سوکھنے لگتے ہیں اور بہت کم پلا مچھلیاں انڈے دینے دریا میں آتی ہیں۔',
        'سمندر کا پانی اب بھی کافی اندر تک آتا ہے۔ بہت سے تمر کمزور ہیں اور ماہی گیروں کو کم مچھلی ملتی ہے۔',
        'دریا اور سمندر کا پانی کچھ برابر ہے۔ کچھ تمر صحت مند ہیں اور کچھ پلا مچھلیاں دریا میں آتی ہیں۔',
        'میٹھا پانی سمندر کو پیچھے رکھتا ہے۔ تمر اچھے اگتے ہیں، زمین کو نئی مٹی ملتی ہے اور بہت سی پلا مچھلیاں دریا میں اوپر آتی ہیں۔',
        'ڈیلٹا تک بہت سا میٹھا پانی اور مٹی پہنچتی ہے۔ تمر کے جنگل گھنے ہیں، کھیت میٹھے رہتے ہیں اور پلا مچھلی بہت ملتی ہے۔'],
      en: ['Sea water pushes far into the delta. Wells and farms turn salty, mangroves dry up and very few palla fish come up the river to lay eggs.',
        'Sea water still comes a long way in. Many mangroves are weak and fishing families catch less fish.',
        'River water and sea water are more balanced. Some mangroves are healthy and some palla come up the river.',
        'Fresh water keeps the sea back. Mangroves grow well, the land gets new mud and many palla swim up the river.',
        'Plenty of fresh water and mud reach the delta. The mangrove forests are thick, the farms stay sweet and palla fish are plentiful.']
    },
    d_mangroves: { sd: 'صحتمند تمر', ur: 'صحت مند تمر', en: 'Healthy mangroves' },
    d_palla: { sd: 'درياءَ ۾ ايندڙ پلا', ur: 'دریا میں آنے والی پلا', en: 'Palla coming up the river' },
    d_salt: { sd: 'کارو پاڻي', ur: 'کھارا پانی', en: 'Salty water' },
    d_farm: { sd: 'ٻني', ur: 'کھیت', en: 'Farm' },
    d_think: {
      sd: 'پلو مڇي سمنڊ ۾ رهي ٿي پر آنا درياءَ ۾ ڏئي ٿي. ان کي درياءَ جو مٺو پاڻي ڇو گهرجي؟',
      ur: 'پلا مچھلی سمندر میں رہتی ہے لیکن انڈے دریا میں دیتی ہے۔ اسے دریا کا میٹھا پانی کیوں چاہیے؟',
      en: 'Palla fish live in the sea but lay their eggs in the river. Why do they need fresh river water?'
    },

    w_title: { sd: 'هوا ۽ بجلي', ur: 'ہوا اور بجلی', en: 'Wind and electricity' },
    w_place: { sd: 'جهمپير، ٺٽو', ur: 'جھمپیر، ٹھٹہ', en: 'Jhimpir, Thatta' },
    w_intro: {
      sd: 'هوائي چڪي هوا جي ڌڪ کي بجلي ۾ بدلائي ٿي. ان جي اندر مقناطيس تار جي ويڙهن ويجهو ڦرن ٿا. سلائيڊر سان هوا جي رفتار بدلايو ۽ ڏسو ته هڪ وڏي هوائي چڪي ڪيتري بجلي ٺاهي ٿي.',
      ur: 'ہوائی چکی ہوا کے دھکے کو بجلی میں بدلتی ہے۔ اس کے اندر مقناطیس تار کے لچھوں کے پاس گھومتے ہیں۔ سلائیڈر سے ہوا کی رفتار بدلیں اور دیکھیں کہ ایک بڑی ہوائی چکی کتنی بجلی بناتی ہے۔',
      en: 'A wind turbine turns the push of the wind into electricity. Inside it, magnets spin near coils of wire. Move the slider to change the wind speed and see how much electricity one big turbine makes.'
    },
    w_slider: { sd: 'هوا جي رفتار', ur: 'ہوا کی رفتار', en: 'Wind speed' },
    w_unit: { sd: 'ڪلوميٽر في ڪلاڪ', ur: 'کلومیٹر فی گھنٹہ', en: 'km/h' },
    w_p1: { sd: 'هلڪي هوا', ur: 'ہلکی ہوا', en: 'Light breeze' },
    w_p2: { sd: 'جهمپير جي عام هوا', ur: 'جھمپیر کی عام ہوا', en: 'Usual wind at Jhimpir' },
    w_p3: { sd: 'طوفان', ur: 'طوفان', en: 'Storm' },
    w_calm: { sd: 'هوا تمام ٿوري آهي. پر نٿا ڦرن ۽ بجلي نٿي ٺهي.', ur: 'ہوا بہت کم ہے۔ پنکھے نہیں گھومتے اور بجلی نہیں بنتی۔', en: 'Too little wind. The blades do not turn and no electricity is made.' },
    w_some: { sd: 'هڪ هوائي چڪي لڳ ڀڳ {kw} ڪلوواٽ بجلي ٺاهي ٿي: لڳ ڀڳ {homes} گهرن لاءِ ڪافي.', ur: 'ایک ہوائی چکی تقریباً {kw} کلوواٹ بجلی بناتی ہے: تقریباً {homes} گھروں کے لیے کافی۔', en: 'One turbine makes about {kw} kilowatts: enough for about {homes} homes.' },
    w_full: { sd: 'هوائي چڪي پوري طاقت تي آهي: لڳ ڀڳ {kw} ڪلوواٽ، لڳ ڀڳ {homes} گهرن لاءِ ڪافي.', ur: 'ہوائی چکی پوری طاقت پر ہے: تقریباً {kw} کلوواٹ، تقریباً {homes} گھروں کے لیے کافی۔', en: 'The turbine is at full power: about {kw} kilowatts, enough for about {homes} homes.' },
    w_storm: { sd: 'هوا تمام تيز آهي. هوائي چڪي ٽٽڻ کان بچڻ لاءِ پاڻ بند ٿي وڃي ٿي.', ur: 'ہوا بہت تیز ہے۔ ہوائی چکی ٹوٹنے سے بچنے کے لیے خود بند ہو جاتی ہے۔', en: 'The wind is too strong. The turbine stops itself so that it does not break.' },
    w_fact: {
      sd: 'جڏهن هوا ٻيڻي تيز لڳي ٿي ته هوائي چڪي لڳ ڀڳ اٺ ڀيرا وڌيڪ بجلي ٺاهي ٿي، جيستائين اها پوري طاقت تي نه پهچي.',
      ur: 'جب ہوا دو گنا تیز چلتی ہے تو ہوائی چکی تقریباً آٹھ گنا زیادہ بجلی بناتی ہے، جب تک وہ پوری طاقت تک نہ پہنچ جائے۔',
      en: 'When the wind blows twice as fast, the turbine makes about eight times more electricity, until it reaches full power.'
    },
    w_note: { sd: 'هڪ 2.5 ميگاواٽ هوائي چڪيءَ جو سادو نمونو؛ هر گهر لڳ ڀڳ اڌ ڪلوواٽ استعمال ڪري ٿو.', ur: 'ایک 2.5 میگاواٹ ہوائی چکی کا سادہ ماڈل؛ ہر گھر تقریباً آدھا کلوواٹ استعمال کرتا ہے۔', en: 'A simple model of one 2.5 megawatt turbine; each home is counted as using about half a kilowatt.' },
    w_homes: { sd: 'هر گهر جي نشاني = 500 گهر', ur: 'ہر گھر کا نشان = 500 گھر', en: 'Each house = 500 homes' },
    w_think: {
      sd: 'جهمپير ۽ گهاري ۾ سمنڊ ويجهو، سنڌ جي وچ واري علائقي کان وڌيڪ هوائي چڪيون ڇو آهن؟',
      ur: 'جھمپیر اور گھارو میں، سمندر کے قریب، سندھ کے بیچ والے علاقوں سے زیادہ ہوائی چکیاں کیوں ہیں؟',
      en: 'Why are there more wind turbines near the sea at Jhimpir and Gharo than in the middle of Sindh?'
    }
  };

  var main = document.getElementById('main');
  var state = { lang: 'sd', heat: 30, river: 1, wind: 27 };
  try {
    var saved = JSON.parse(localStorage.getItem('ssp1.lang'));
    if (LANGS.indexOf(saved) >= 0) state.lang = saved;
  } catch (e) { /* storage blocked: Sindhi */ }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) { return o == null ? '' : typeof o === 'object' && !Array.isArray(o) ? (o[state.lang] != null ? o[state.lang] : o.en) : o; }
  function t(key, vars) {
    var s = String(L(T[key]));
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function chapterLink(id) {
    var ch = CHAPTERS[id];
    return '<a class="sp-chap" href="/class-5/science/' + id + '"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>' +
      '<span><span class="sp-label">' + esc(t('chapterN', { n: ch.n })) + ':</span> ' + esc(L(ch)) + '</span></a>';
  }

  /* ---------- the three models ---------- */

  // Evaporation roughly doubles for every 11 °C warmer; a small bowl in the shade takes about two days at 15 °C.
  function dryHours(tc) { return 48 * Math.exp(-0.063 * (tc - 15)); }
  // One 2.5 MW turbine: starts at 3 m/s, full power from 12 m/s, stops itself at 25 m/s; power grows with speed³ in between.
  function windKw(kmh) {
    var v = kmh / 3.6;
    if (v < 3 || v >= 25) return 0;
    if (v >= 12) return 2500;
    return 2500 * (v * v * v - 27) / (1728 - 27);
  }
  var HEALTHY = [1, 3, 5, 7, 8], PALLA = [1, 2, 4, 6, 8], SALT_REACH = [150, 115, 85, 60, 40]; // per river level

  /* ---------- drawings ---------- */

  function heatSvg(tc, left) {
    var fill = Math.max(4, Math.min(100, (tc / 55) * 100)), water = 40 * left;
    return '<svg class="wl-pic" viewBox="0 0 240 150" aria-hidden="true">' +
      '<rect x="22" y="12" width="16" height="104" rx="8" fill="#fff" stroke="#8a9a8d" stroke-width="2"/>' +
      '<rect x="26" y="' + (112 - fill) + '" width="8" height="' + fill + '" rx="4" fill="#d84315"/>' +
      '<circle cx="30" cy="124" r="13" fill="#d84315" stroke="#8a9a8d" stroke-width="2"/>' +
      '<text x="30" y="146" text-anchor="middle" class="wl-num">' + tc + ' °C</text>' +
      '<circle cx="200" cy="34" r="' + (10 + tc / 5) + '" fill="#f9a825" opacity="' + (0.25 + tc / 80) + '"/>' +
      '<defs><clipPath id="wl-bowl"><path d="M88 78h120l-12 46a8 8 0 0 1-8 6h-80a8 8 0 0 1-8-6z"/></clipPath></defs>' +
      '<path d="M88 78h120l-12 46a8 8 0 0 1-8 6h-80a8 8 0 0 1-8-6z" fill="#e7d3b5"/>' +
      (water > 0.5 ? '<rect x="80" y="' + (130 - water) + '" width="140" height="' + water + '" fill="#4a90c2" opacity="0.85" clip-path="url(#wl-bowl)"/>' : '') +
      '<path d="M88 78h120l-12 46a8 8 0 0 1-8 6h-80a8 8 0 0 1-8-6z" fill="none" stroke="#9c7a4d" stroke-width="2"/>' +
      (left < 1 ? '<path d="M118 66c-4-8 4-12 0-20M148 64c-4-8 4-12 0-20M178 66c-4-8 4-12 0-20" fill="none" stroke="#90a4ae" stroke-width="2.5" stroke-linecap="round" opacity="' + (1 - left) + '"/>' : '') +
      '</svg>';
  }
  function tree(x, y, ok) {
    var leaf = ok ? '#2e7d32' : '#a1887f';
    return '<g><path d="M' + x + ' ' + (y + 14) + 'v-12M' + (x - 6) + ' ' + (y + 18) + 'l6-6 6 6" stroke="#6d4c41" stroke-width="2" fill="none"/>' +
      '<circle cx="' + x + '" cy="' + (y - 4) + '" r="9" fill="' + leaf + '"/></g>';
  }
  function fish(x, y) {
    return '<path d="M' + x + ' ' + y + 'c4-5 10-6 15-3l5-3v11l-5-3c-5 3-11 2-15-2z" fill="#e8a33c"/>';
  }
  function deltaSvg(level) {
    var reach = SALT_REACH[level], trees = '', fishes = '', i;
    for (i = 0; i < 8; i++) trees += tree(36 + i * 24 + (i > 3 ? 70 : 0), 182 - (i % 2) * 6, i < HEALTHY[level]);
    for (i = 0; i < PALLA[level]; i++) fishes += fish(150 + (i % 2) * 14, 164 - i * 17);
    var farmSalty = level < 2;
    return '<svg class="wl-pic" viewBox="0 0 360 230" aria-hidden="true">' +
      '<rect width="360" height="230" fill="#efe6d2"/>' +
      '<rect x="0" y="196" width="360" height="34" fill="#4a7fb0"/>' +
      '<path d="M0 ' + (196 - reach) + 'C90 ' + (206 - reach) + ' 270 ' + (206 - reach) + ' 360 ' + (196 - reach) + 'V196H0z" fill="#9cc8d6" opacity="0.55"/>' +
      '<path d="M150 0C150 60 168 110 156 160C150 180 160 190 156 200h26c-6-14 4-30 0-46C170 110 172 60 176 0z" fill="#5c9fd1"/>' +
      fishes + trees +
      '<rect x="250" y="40" width="90" height="56" rx="4" fill="' + (farmSalty ? '#eceff1' : '#9ccc65') + '" stroke="#8a9a8d"/>' +
      (farmSalty ? '<path d="M262 56h66M262 70h66M262 84h66" stroke="#cfd8dc" stroke-width="3"/>' : '<path d="M262 56h66M262 70h66M262 84h66" stroke="#7cb342" stroke-width="3"/>') +
      '<text x="295" y="112" text-anchor="middle" class="wl-lbl">' + esc(t('d_farm')) + '</text>' +
      '<text x="70" y="' + Math.max(22, 190 - reach) + '" text-anchor="middle" class="wl-lbl salt">' + esc(t('d_salt')) + '</text>' +
      '</svg>';
  }
  function windSvg(kw) {
    var homes = Math.round(kw / 0.5), icons = Math.min(10, Math.round(homes / 500)), house = '', bar = 150 * kw / 2500;
    for (var i = 0; i < icons; i++) {
      var x = 150 + (i % 5) * 30, y = 92 + Math.floor(i / 5) * 32;
      house += '<path d="M' + x + ' ' + (y + 10) + 'l11-10 11 10v12h-22z" fill="#1e7a3c"/>';
    }
    return '<svg class="wl-pic" viewBox="0 0 320 170" aria-hidden="true">' +
      '<path d="M64 160 70 62h6l6 98z" fill="#cfd8dc" stroke="#90a4ae"/>' +
      '<circle cx="73" cy="58" r="6" fill="#eceff1" stroke="#90a4ae" stroke-width="2"/>' +
      '<path d="M73 52 70 8l6-2zM78 61l40 22-4 5zM68 61 30 86l-2-6z" fill="#eceff1" stroke="#90a4ae" stroke-width="1.5"/>' +
      '<rect x="150" y="20" width="150" height="18" rx="9" fill="#e6ece7"/>' +
      '<rect x="150" y="20" width="' + bar + '" height="18" rx="9" fill="#f9a825"/>' +
      '<text x="225" y="58" text-anchor="middle" class="wl-num">' + Math.round(kw / 10) * 10 + ' kW</text>' +
      house + '</svg>';
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
  function presets(lab, list) {
    return '<div class="wl-presets">' + list.map(function (p) {
      return '<button type="button" class="chip" data-lab="' + lab + '" data-value="' + p[1] + '">' + esc(t(p[0])) + '</button>';
    }).join('') + '</div>';
  }
  function labCard(id, chapters, controls) {
    return '<section class="card wl-lab" id="lab-' + id + '">' +
      '<div class="wl-text"><h2>' + esc(t(id + '_title')) + '</h2><p class="sp-where">' + esc(t(id + '_place')) + '</p>' +
        '<p>' + esc(t(id + '_intro')) + '</p>' + controls +
        '<div class="sp-think"><p class="sp-label">' + esc(t('think')) + '</p><p>' + esc(t(id + '_think')) + '</p></div>' +
        '<div class="wl-chaps">' + chapters.map(chapterLink).join('') + '</div></div>' +
      '<div class="wl-view"><div id="' + id + '-pic"></div><div id="' + id + '-out" class="wl-out" aria-live="polite"></div></div>' +
    '</section>';
  }
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/sindh/">' + esc(t('sindh')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="sp-hero"><div class="sp-band" aria-hidden="true"></div><div class="sp-hero-in">' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div></section>' +
      labCard('h', ['water-cycle'],
        '<label class="wl-slider"><span>' + esc(t('h_slider')) + ': <b id="h-val" dir="ltr"></b></span>' +
          '<input type="range" min="15" max="50" step="1" value="' + state.heat + '" data-lab="h"></label>' +
        presets('h', [['h_p1', 15], ['h_p2', 30], ['h_p3', 46]])) +
      labCard('d', ['plants', 'living-things'],
        '<label class="wl-slider"><span>' + esc(t('d_slider')) + ': <b id="d-val"></b></span>' +
          '<input type="range" min="0" max="4" step="1" value="' + state.river + '" data-lab="d"></label>') +
      labCard('w', ['electricity-magnets'],
        '<label class="wl-slider"><span>' + esc(t('w_slider')) + ': <b id="w-val" dir="ltr"></b></span>' +
          '<input type="range" min="0" max="100" step="1" value="' + state.wind + '" data-lab="w"></label>' +
        presets('w', [['w_p1', 8], ['w_p2', 27], ['w_p3', 95]]));
    update('h'); update('d'); update('w');
  }
  function update(lab) {
    var out = document.getElementById(lab + '-out'), pic = document.getElementById(lab + '-pic'), input = document.querySelector('input[data-lab="' + lab + '"]');
    if (lab === 'h') {
      var tc = state.heat, hrs = dryHours(tc), left = Math.max(0, 1 - 4 / hrs);
      document.getElementById('h-val').textContent = tc + ' °C';
      input.setAttribute('aria-valuetext', tc + ' °C');
      pic.innerHTML = heatSvg(tc, left);
      out.innerHTML = '<p><b>' + esc(t('h_res', { h: hrs < 10 ? Math.round(hrs * 2) / 2 : Math.round(hrs) })) + '</b></p>' +
        '<p>' + esc(t('h_res2', { p: Math.round((1 - left) * 100) })) + '</p>' +
        (tc > 15 ? '<p>' + esc(t('h_res3', { t: tc, x: Math.round(48 / hrs * 10) / 10 })) + '</p>' : '') +
        '<p class="muted small">' + esc(t('simple')) + ' ' + esc(t('h_note')) + '</p>';
    } else if (lab === 'd') {
      var lv = state.river, name = L(T.d_levels)[lv];
      document.getElementById('d-val').textContent = name;
      input.setAttribute('aria-valuetext', name);
      pic.innerHTML = deltaSvg(lv);
      out.innerHTML = '<p><b>' + esc(L(T.d_text)[lv]) + '</b></p>' +
        '<div class="wl-stats"><p><span class="muted small">' + esc(t('d_mangroves')) + '</span><b>' + HEALTHY[lv] + ' / 8</b></p>' +
        '<p><span class="muted small">' + esc(t('d_palla')) + '</span><b>' + PALLA[lv] + '</b></p></div>' +
        '<p class="muted small">' + esc(t('simple')) + '</p>';
    } else {
      var kmh = state.wind, kw = windKw(kmh), homes = Math.round(kw / 0.5 / 50) * 50, v = kmh / 3.6;
      document.getElementById('w-val').textContent = kmh + ' ' + t('w_unit');
      input.setAttribute('aria-valuetext', kmh + ' ' + t('w_unit'));
      pic.innerHTML = windSvg(kw);
      var key = v >= 25 ? 'w_storm' : v < 3 ? 'w_calm' : v >= 12 ? 'w_full' : 'w_some';
      out.innerHTML = '<p><b>' + esc(t(key, { kw: Math.round(kw / 10) * 10, homes: homes })) + '</b></p>' +
        '<p>' + esc(t('w_fact')) + '</p>' +
        '<p class="muted small">' + esc(t('w_homes')) + ' · ' + esc(t('w_note')) + '</p>';
    }
  }
  function setValue(lab, value) {
    if (lab === 'h') state.heat = +value;
    else if (lab === 'd') state.river = +value;
    else state.wind = +value;
    var input = document.querySelector('input[data-lab="' + lab + '"]');
    if (input && +input.value !== +value) input.value = value;
    update(lab);
  }

  document.addEventListener('input', function (e) {
    var r = e.target.closest && e.target.closest('input[type="range"][data-lab]');
    if (r) setValue(r.getAttribute('data-lab'), r.value);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (b) {
      var l = b.getAttribute('data-setlang');
      if (LANGS.indexOf(l) < 0 || l === state.lang) return;
      state.lang = l;
      try { localStorage.setItem('ssp1.lang', JSON.stringify(l)); } catch (err) { /* this visit only */ }
      applyLang();
      render();
      return;
    }
    var p = e.target.closest('button[data-lab][data-value]');
    if (p) setValue(p.getAttribute('data-lab'), p.getAttribute('data-value'));
  });

  applyLang();
  render();
})();
