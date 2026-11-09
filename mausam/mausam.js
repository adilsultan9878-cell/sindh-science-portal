/* Sindh Science Learning Portal — "Sindh digital weather lab" (/mausam/).
   Three animated simulations, each a drawing and a slider, in Sindhi, Urdu and English:
   1. Jacobabad heat: how fast water dries from an open pan (approximate evaporation model).
   2. Indus delta: river water reaching the sea, mangroves, salt water and palla fish (picture model, cause and effect).
   3. Jhimpir wind: one wind turbine, power from the cube law up to rated power, cut-in and cut-out speeds.
   Animations stop when the reader asks for reduced motion; every slider works with the keyboard. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var SVGNS = 'http://www.w3.org/2000/svg';

  // Chapter numbers and titles as in /data/class-5/science (links go to /class-5/science/<id>).
  var CHAPTERS = {
    'living-things': { n: 1, sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' },
    pollution: { n: 4, sd: 'ماحولياتي آلودگي', ur: 'ماحولیاتی آلودگی', en: 'Environmental Pollution' },
    matter: { n: 5, sd: 'مادو ۽ ان ۾ تبديليون', ur: 'مادہ اور اس میں تبدیلیاں', en: 'Matter and Its Changes' },
    'force-machines': { n: 6, sd: 'قوت ۽ سادا مشينون', ur: 'قوت اور سادہ مشینیں', en: 'Force and Simple Machines' },
    'electricity-magnets': { n: 8, sd: 'بجلي ۽ مقناطيس', ur: 'بجلی اور مقناطیس', en: 'Electricity and Magnets' },
    'water-cycle': { n: 13, sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' }
  };

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    sindh: { sd: 'سنڌ ۾ سائنس', ur: 'سندھ میں سائنس', en: 'Science in Sindh' },
    title: { sd: 'سنڌ جي ڊجيٽل موسم ليب', ur: 'سندھ کی ڈیجیٹل موسمی لیب', en: 'Sindh digital weather lab' },
    eyebrow: { sd: 'سميوليشن · ڪلاس 5 سائنس', ur: 'سمیولیشن · جماعت پنجم سائنس', en: 'Simulations · Class 5 Science' },
    lead: {
      sd: 'سلائيڊر هلايو ۽ ڏسو: گرمي وڌي ته پاڻي ڪيترو جلدي سڪي ٿو، درياءَ جو پاڻي گهٽجي ته ڇوڙ تي ڇا ٿو ٿئي، ۽ هوا تيز ٿئي ته ڪيتري بجلي ٺهي ٿي. هر تجربو توهان جي ڪتاب جي هڪ باب سان جڙيل آهي.',
      ur: 'سلائیڈر ہلائیں اور دیکھیں: گرمی بڑھے تو پانی کتنی جلدی سوکھتا ہے، دریا کا پانی کم ہو تو ڈیلٹا پر کیا ہوتا ہے، اور ہوا تیز ہو تو کتنی بجلی بنتی ہے۔ ہر تجربہ آپ کی کتاب کے ایک باب سے جڑا ہے۔',
      en: 'Move the sliders and see: how fast water dries when it gets hotter, what happens to the delta when the river runs low, and how much electricity the wind makes. Each one is linked to a chapter of your book.'
    },
    jump: { sd: 'سڌو وڃو:', ur: 'سیدھا جائیں:', en: 'Go to:' },
    tryThis: { sd: 'هي ڪري ڏسو', ur: 'یہ کر کے دیکھیں', en: 'Try this' },
    inBook: { sd: 'ڪتاب ۾', ur: 'کتاب میں', en: 'In your book' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    play: { sd: 'وقت هلايو', ur: 'وقت چلائیں', en: 'Run time' },
    pause: { sd: 'روڪيو', ur: 'روکیں', en: 'Pause' },
    reset: { sd: 'شروع کان', ur: 'شروع سے', en: 'Start again' },
    motionOff: { sd: 'توهان جي فون ۾ "گهٽ حرڪت" چالو آهي، تنهنڪري تصويرون بيٺل آهن. انگ اڃا به بدلجن ٿا.', ur: 'آپ کے فون میں "کم حرکت" چالو ہے، اس لیے تصویریں رکی ہوئی ہیں۔ نمبر پھر بھی بدلتے ہیں۔', en: 'Reduced motion is on, so the pictures stay still. The numbers still change.' },
    teacherTitle: { sd: 'استادن لاءِ', ur: 'اساتذہ کے لیے', en: 'For teachers' },
    teacherSteps: {
      sd: ['هڪ سلائيڊر بورڊ يا فون تي ڏيکاريو ۽ ٻارن کان پهريان اندازو پڇو.', 'سلائيڊر هلايو ۽ ڏسو ته اندازو صحيح هو يا نه.', 'پڇو: "ڇو؟" ۽ ڪتاب جو باب کولي جواب ڳوليو.', 'ياد ڏياريو: هي سادا نمونا آهن، اصل انگ موسم ۽ جاءِ سان بدلجن ٿا.'],
      ur: ['ایک سلائیڈر بورڈ یا فون پر دکھائیں اور بچوں سے پہلے اندازہ پوچھیں۔', 'سلائیڈر ہلائیں اور دیکھیں کہ اندازہ درست تھا یا نہیں۔', 'پوچھیں: "کیوں؟" اور کتاب کا باب کھول کر جواب ڈھونڈیں۔', 'یاد دلائیں: یہ سادہ ماڈل ہیں، اصل نمبر موسم اور جگہ کے ساتھ بدلتے ہیں۔'],
      en: ['Show one slider on the board or a phone and ask the children to guess first.', 'Move the slider and check whether the guess was right.', 'Ask "why?" and open the book chapter to find the answer.', 'Remind them: these are simple models; real numbers change with weather and place.']
    },

    /* 1. Jacobabad heat */
    heatTitle: { sd: 'جيڪب آباد جي گرمي: پاڻي ڪيترو جلدي سڪي ٿو؟', ur: 'جیکب آباد کی گرمی: پانی کتنی جلدی سوکھتا ہے؟', en: 'Jacobabad heat: how fast does water dry?' },
    heatText: {
      sd: 'جيڪب آباد پاڪستان جي سڀ کان گرم شهرن مان هڪ آهي؛ اونهاري ۾ گرمي 50 ڊگريءَ تائين پهچي ٿي. گرمي پاڻيءَ کي بخار (وانپ) ۾ بدلائي ٿي، جنهن کي بخاري عمل (evaporation) چوندا آهن. جيتري گرمي وڌيڪ، اوترو پاڻي تيزيءَ سان سڪي ٿو.',
      ur: 'جیکب آباد پاکستان کے سب سے گرم شہروں میں سے ایک ہے؛ گرمیوں میں درجۂ حرارت 50 ڈگری تک پہنچ جاتا ہے۔ گرمی پانی کو بخارات میں بدل دیتی ہے، اسے عملِ تبخیر (evaporation) کہتے ہیں۔ جتنی زیادہ گرمی، اتنی جلدی پانی سوکھتا ہے۔',
      en: 'Jacobabad is one of the hottest cities in Pakistan; in summer it can reach 50 °C. Heat turns water into water vapour. This is called evaporation. The hotter it is, the faster water dries up.'
    },
    tempLabel: { sd: 'گرمي (درجه حرارت)', ur: 'گرمی (درجۂ حرارت)', en: 'Temperature' },
    hoursLabel: { sd: 'گذريل وقت', ur: 'گزرا ہوا وقت', en: 'Time passed' },
    hoursVal: { sd: '{h} ڪلاڪ', ur: '{h} گھنٹے', en: '{h} hours' },
    dryIn: { sd: 'پاڻي سڪڻ ۾ لڳ ڀڳ', ur: 'پانی سوکھنے میں تقریباً', en: 'Water dries in about' },
    dryVal: { sd: '{h} ڪلاڪ (اٽڪل {d} ڏينهن)', ur: '{h} گھنٹے (تقریباً {d} دن)', en: '{h} hours (about {d} days)' },
    leftNow: { sd: 'باقي پاڻي', ur: 'باقی پانی', en: 'Water left' },
    leftVal: { sd: '{mm} مليميٽر ({p}٪)', ur: '{mm} ملی میٹر ({p}٪)', en: '{mm} mm ({p}%)' },
    rate: { sd: 'سڪڻ جي رفتار', ur: 'سوکھنے کی رفتار', en: 'Drying speed' },
    rateVal: { sd: 'هڪ ڏينهن ۾ {mm} مليميٽر', ur: 'ایک دن میں {mm} ملی میٹر', en: '{mm} mm a day' },
    dryNow: { sd: 'پاڻي سڪي ويو!', ur: 'پانی سوکھ گیا!', en: 'The water has dried up!' },
    heatNote: {
      sd: 'اندازو (approximate): ڇانوَ ۾ رکيل کليل ٿالهه، جنهن ۾ 5 سينٽي ميٽر پاڻي آهي، هلڪي هوا ۽ سڪل هوا. اصل وقت هوا، ڇانوَ ۽ نمي سان بدلجي ٿو.',
      ur: 'اندازہ (approximate): سائے میں رکھا کھلا تھال، جس میں 5 سینٹی میٹر پانی ہے، ہلکی ہوا اور خشک ہوا۔ اصل وقت ہوا، سائے اور نمی کے ساتھ بدلتا ہے۔',
      en: 'Approximate: an open pan in the shade with 5 cm of water, a light breeze and dry air. Real times change with wind, shade and humidity.'
    },
    heatTry: {
      sd: 'گرمي 25 تي رکو، پوءِ 50 تي. پاڻي ڪيترا ڀيرا تيزيءَ سان سڪي ٿو؟ جيڪب آباد ۾ ماڻهو پاڻي ڍڪيل دلي (مٽيءَ جي گهڙي) ۾ ڇو رکندا آهن؟',
      ur: 'گرمی 25 پر رکیں، پھر 50 پر۔ پانی کتنے گنا جلدی سوکھتا ہے؟ جیکب آباد میں لوگ پانی ڈھکے ہوئے مٹکے میں کیوں رکھتے ہیں؟',
      en: 'Set 25 °C, then 50 °C. How many times faster does the water dry? Why do people in Jacobabad keep water in a covered clay pot (matka)?'
    },
    heatAlt: { sd: 'سج هيٺ پاڻيءَ جو ٿالهه. گرمي {t} ڊگري، {p}٪ پاڻي باقي.', ur: 'دھوپ تلے پانی کا تھال۔ گرمی {t} ڈگری، {p}٪ پانی باقی۔', en: 'A pan of water under the sun. {t} °C, {p}% of the water left.' },

    /* 2. Indus delta */
    deltaTitle: { sd: 'سنڌو جو ڇوڙ: پاڻي گهٽ ته تمر ۽ پلو ڪٿي؟', ur: 'دریائے سندھ کا ڈیلٹا: پانی کم تو تمر اور پلا کہاں؟', en: 'The Indus delta: less water, then what for mangroves and palla?' },
    deltaText: {
      sd: 'سنڌو درياءُ جتي سمنڊ ۾ ڇوڙ ڪري ٿو، اتي تمر (mangroves) جا ٻيلا آهن. انهن کي مٺي پاڻيءَ ۽ لٽ (مٽي) جي ضرورت آهي. پلو مڇي سمنڊ مان درياءَ ۾ مٺي پاڻيءَ ۾ آنا ڏيڻ اچي ٿي. جڏهن درياءَ جو پاڻي سمنڊ تائين گهٽ پهچي ٿو، ته سمنڊ جو کارو پاڻي زمين اندر گهڙي اچي ٿو.',
      ur: 'دریائے سندھ جہاں سمندر میں گرتا ہے، وہاں تمر (mangroves) کے جنگل ہیں۔ انہیں میٹھے پانی اور مٹی (گاد) کی ضرورت ہوتی ہے۔ پلا مچھلی سمندر سے دریا کے میٹھے پانی میں انڈے دینے آتی ہے۔ جب دریا کا پانی سمندر تک کم پہنچتا ہے تو سمندر کا کھارا پانی زمین کے اندر گھس آتا ہے۔',
      en: 'Where the Indus meets the sea there are mangrove forests. They need fresh water and silt (mud) from the river. Palla fish swim from the sea up into the river\'s fresh water to lay eggs. When less river water reaches the sea, salty sea water pushes inland.'
    },
    flowLabel: { sd: 'سمنڊ تائين پهچندڙ درياءَ جو پاڻي', ur: 'سمندر تک پہنچنے والا دریا کا پانی', en: 'River water reaching the sea' },
    flowLevels: {
      sd: ['تمام گهٽ', 'گهٽ', 'پورو', 'گهڻو (ٻوڏ جي مُند)'],
      ur: ['بہت کم', 'کم', 'پورا', 'بہت زیادہ (سیلابی موسم)'],
      en: ['Very little', 'Little', 'Enough', 'A lot (flood season)']
    },
    flowVal: { sd: '{v} مان 100: {w}', ur: '100 میں سے {v}: {w}', en: '{v} out of 100: {w}' },
    mangroves: { sd: 'تمر جا ٻيلا', ur: 'تمر کے جنگل', en: 'Mangroves' },
    mangroveSays: {
      sd: ['تيزيءَ سان سُڪي ختم ٿي رهيا آهن', 'سُسي رهيا آهن', 'صحتمند آهن', 'وڌي رهيا آهن'],
      ur: ['تیزی سے سوکھ کر ختم ہو رہے ہیں', 'سکڑ رہے ہیں', 'صحت مند ہیں', 'بڑھ رہے ہیں'],
      en: ['Dying back fast', 'Shrinking', 'Healthy', 'Growing']
    },
    salt: { sd: 'کارو (لوڻياٺو) پاڻي', ur: 'کھارا پانی', en: 'Salt water' },
    saltSays: {
      sd: ['گهڻو اندر اچي ويو: کوهه ۽ ٻنيون کاريون', 'ڪجهه اندر اچي رهيو آهي', 'سمنڊ ۾ ئي آهي', 'سمنڊ ڏانهن پوئتي ڌڪجي ويو'],
      ur: ['بہت اندر آ گیا: کنویں اور کھیت کھارے', 'کچھ اندر آ رہا ہے', 'سمندر ہی میں ہے', 'سمندر کی طرف پیچھے دھکیل دیا گیا'],
      en: ['Far inland: wells and fields turn salty', 'Creeping in', 'Stays in the sea', 'Pushed back out to sea']
    },
    palla: { sd: 'پلو مڇي', ur: 'پلا مچھلی', en: 'Palla fish' },
    pallaSays: {
      sd: ['لڳ ڀڳ ڪونهي', 'گهٽ', 'چڱي تعداد ۾', 'گهڻي'],
      ur: ['تقریباً نہیں', 'کم', 'اچھی تعداد میں', 'بہت زیادہ'],
      en: ['Almost none', 'Few', 'A good number', 'Plenty']
    },
    deltaNote: {
      sd: 'هي تصويري نمونو آهي: سبب ۽ نتيجو ڏيکاري ٿو، ماپيل انگ ناهن.',
      ur: 'یہ تصویری ماڈل ہے: سبب اور نتیجہ دکھاتا ہے، ناپے ہوئے نمبر نہیں۔',
      en: 'A picture model: it shows cause and effect, not measured numbers.'
    },
    deltaTry: {
      sd: 'سلائيڊر کي "تمام گهٽ" تي آڻيو. پلي ۽ تمر کي ڇا ٿيو؟ درياءَ جو ڪجهه پاڻي سمنڊ تائين پهچڻ ڇو ضروري آهي؟',
      ur: 'سلائیڈر کو "بہت کم" پر لائیں۔ پلا اور تمر کو کیا ہوا؟ دریا کا کچھ پانی سمندر تک پہنچنا کیوں ضروری ہے؟',
      en: 'Move the slider to "Very little". What happened to the palla and the mangroves? Why must some river water reach the sea?'
    },
    deltaAlt: { sd: 'سنڌو جو ڇوڙ: {w} پاڻي، {f} پلو مڇيون.', ur: 'دریائے سندھ کا ڈیلٹا: {w} پانی، {f} پلا مچھلیاں۔', en: 'The Indus delta: {w} water, {f} palla fish.' },

    /* 3. Jhimpir wind */
    windTitle: { sd: 'جهمپير جي هوا: ڪيتري بجلي ٺهي ٿي؟', ur: 'جھمپیر کی ہوا: کتنی بجلی بنتی ہے؟', en: 'Jhimpir wind: how much electricity?' },
    windText: {
      sd: 'ٺٽي ضلعي ۾ جهمپير وٽ تيز هوا لڳاتار گهلندي آهي، تنهنڪري اتي ڪيترائي وڏا پن چڪيون (wind turbines) لڳل آهن. هوا پرن کي ڦيرائي ٿي ۽ اندر جنريٽر بجلي ٺاهي ٿو. هوا ٻيڻي تيز ٿئي ته بجلي اٺوڻ (2×2×2) ٿي وڃي ٿي!',
      ur: 'ضلع ٹھٹھہ میں جھمپیر کے پاس تیز ہوا مسلسل چلتی ہے، اس لیے وہاں بہت سی بڑی ہوائی چکیاں (wind turbines) لگی ہیں۔ ہوا پروں کو گھماتی ہے اور اندر جنریٹر بجلی بناتا ہے۔ ہوا دگنی تیز ہو تو بجلی آٹھ گنا (2×2×2) ہو جاتی ہے!',
      en: 'Near Jhimpir in Thatta district a strong wind blows almost all the time, so many big wind turbines stand there. The wind turns the blades and a generator inside makes electricity. Twice the wind speed gives eight times (2×2×2) the power!'
    },
    windLabel: { sd: 'هوا جي رفتار', ur: 'ہوا کی رفتار', en: 'Wind speed' },
    windVal: { sd: '{v} ميٽر في سيڪنڊ ({k} ڪلوميٽر في ڪلاڪ)', ur: '{v} میٹر فی سیکنڈ ({k} کلومیٹر فی گھنٹہ)', en: '{v} m/s ({k} km/h)' },
    power: { sd: 'بجلي', ur: 'بجلی', en: 'Power' },
    kw: { sd: '{n} ڪلوواٽ', ur: '{n} کلوواٹ', en: '{n} kW' },
    spin: { sd: 'پرن جي ڦيري', ur: 'پروں کی گردش', en: 'Blade speed' },
    rpm: { sd: 'هڪ منٽ ۾ {n} چڪر', ur: 'ایک منٹ میں {n} چکر', en: '{n} turns a minute' },
    homes: { sd: 'گهر روشن', ur: 'گھر روشن', en: 'Homes lit' },
    homesVal: { sd: 'لڳ ڀڳ {n} گهر', ur: 'تقریباً {n} گھر', en: 'about {n} homes' },
    windState: {
      sd: ['هوا گهٽ آهي: 3 ميٽر في سيڪنڊ کان گهٽ تي پن چڪي نٿي هلي (cut-in).', 'بجلي ٺهي رهي آهي: هوا وڌي ته بجلي گهڻي تيزيءَ سان وڌي ٿي.', 'پوري طاقت: اٽڪل 10 ميٽر في سيڪنڊ کان پوءِ هيءَ پن چڪي 2,000 ڪلوواٽ کان وڌيڪ نٿي ٺاهي.', 'طوفان! 25 ميٽر في سيڪنڊ تي حفاظت لاءِ پن چڪي بند ٿي وڃي ٿي (cut-out).'],
      ur: ['ہوا کم ہے: 3 میٹر فی سیکنڈ سے کم پر ہوائی چکی نہیں چلتی (cut-in)۔', 'بجلی بن رہی ہے: ہوا بڑھے تو بجلی بہت تیزی سے بڑھتی ہے۔', 'پوری طاقت: تقریباً 10 میٹر فی سیکنڈ کے بعد یہ ہوائی چکی 2,000 کلوواٹ سے زیادہ نہیں بناتی۔', 'طوفان! 25 میٹر فی سیکنڈ پر حفاظت کے لیے ہوائی چکی بند ہو جاتی ہے (cut-out)۔'],
      en: ['Too little wind: below 3 m/s the turbine does not turn (cut-in speed).', 'Making electricity: as the wind grows, power grows very fast.', 'Full power: from about 10 m/s this turbine makes no more than 2,000 kW (rated power).', 'Storm! At 25 m/s the turbine stops to keep itself safe (cut-out speed).']
    },
    windNote: {
      sd: 'هڪ پن چڪي، 100 ميٽر پرن جو گهيرو: بجلي = ½ × هوا جي ڳراڻ × پرن جو ايراضي × رفتار³ × 0.4. گهر جو اندازو: هڪ گهر ۾ پنکا ۽ بتيون لڳ ڀڳ 1 ڪلوواٽ. سڀ انگ اندازو آهن.',
      ur: 'ایک ہوائی چکی، 100 میٹر پروں کا گھیرا: بجلی = ½ × ہوا کی کثافت × پروں کا رقبہ × رفتار³ × 0.4۔ گھر کا اندازہ: ایک گھر میں پنکھے اور بتیاں تقریباً 1 کلوواٹ۔ سب نمبر اندازہ ہیں۔',
      en: 'One turbine with 100 m wide blades: power = ½ × air density × blade area × speed³ × 0.4. Homes are a rough guess: fans and lights in one home use about 1 kW. All numbers are approximate.'
    },
    windTry: {
      sd: 'هوا 5 تي رکو ۽ بجلي لکو. پوءِ 10 تي رکو. هوا ٻيڻي ٿي، بجلي ڪيترا ڀيرا وڌي؟ 15 تي بجلي ڇو وڌيڪ نٿي وڌي؟',
      ur: 'ہوا 5 پر رکیں اور بجلی لکھیں۔ پھر 10 پر رکیں۔ ہوا دگنی ہوئی، بجلی کتنے گنا بڑھی؟ 15 پر بجلی مزید کیوں نہیں بڑھتی؟',
      en: 'Set the wind to 5 and write down the power. Then set 10. The wind doubled; how many times did the power grow? Why does it not grow more at 15?'
    },
    windAlt: { sd: 'جهمپير ۾ پن چڪي. هوا {v} ميٽر في سيڪنڊ، بجلي {p} ڪلوواٽ.', ur: 'جھمپیر میں ہوائی چکی۔ ہوا {v} میٹر فی سیکنڈ، بجلی {p} کلوواٹ۔', en: 'A wind turbine at Jhimpir. Wind {v} m/s, power {p} kW.' }
  };

  var ICONS = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/>',
    map: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20"/>'
  };
  function icon(name) {
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- models ---------- */

  // 1. Evaporation from an open pan: rate grows with how much vapour warm air can hold (Tetens formula)
  // times how dry the air is. K is chosen so 45 °C gives about 14 mm a day, close to summer pan readings in upper Sindh.
  var DEPTH = 50, RH = 0.35, K = 2.25;
  function evapPerDay(tc) {
    var es = 0.6108 * Math.exp(17.27 * tc / (tc + 237.3));   // kPa
    return K * es * (1 - RH);                                 // mm a day
  }

  // 2. Indus delta: 0–100 is "how much of the water the delta needs reaches the sea".
  function flowLevel(f) { return f < 20 ? 0 : f < 50 ? 1 : f < 80 ? 2 : 3; }

  // 3. Wind turbine: 100 m rotor, power coefficient 0.4, rated 2,000 kW, cut-in 3 m/s, cut-out 25 m/s.
  var RHO = 1.2, AREA = Math.PI * 50 * 50, CP = 0.4, RATED = 2000, CUT_IN = 3, CUT_OUT = 25;
  function windKw(v) {
    if (v < CUT_IN || v >= CUT_OUT) return 0;
    return Math.min(RATED, 0.5 * RHO * AREA * v * v * v * CP / 1000);
  }
  function windRpm(v) {
    if (v < CUT_IN || v >= CUT_OUT) return 0;
    return Math.min(16, v * 7 / 50 * 60 / (2 * Math.PI));     // tip speed 7 × wind, at most 16 turns a minute
  }
  function windStage(v) { return v < CUT_IN ? 0 : v >= CUT_OUT ? 3 : windKw(v) >= RATED ? 2 : 1; }

  /* ---------- page ---------- */

  var main = document.getElementById('main');
  var state = { lang: 'sd', temp: 45, hours: 24, flow: 60, wind: 8, playing: false };
  try {
    var saved = JSON.parse(localStorage.getItem('ssp1.lang'));
    if (LANGS.indexOf(saved) >= 0) state.lang = saved;
  } catch (e) { /* storage blocked: Sindhi */ }

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(motionQuery && motionQuery.matches); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(o) { return o == null ? '' : typeof o === 'object' && !Array.isArray(o) ? (o[state.lang] != null ? o[state.lang] : o.en) : o; }
  function t(key, vars) {
    var s = L(T[key]);
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function num(n, digits) {
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: digits || 0, minimumFractionDigits: 0 });
  }
  function $(id) { return document.getElementById(id); }
  function attr(el, a, v) { if (el) el.setAttribute(a, v); }

  function applyLang() {
    var l = state.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? 'rtl' : 'ltr';
    document.title = t('title') + ' | ' + t('siteName');
    $('site-name').textContent = t('siteName');
    [].forEach.call(document.querySelectorAll('[data-setlang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-setlang') === l));
    });
  }

  function chapterLinks(ids) {
    return '<div class="ms-chaps">' + ids.map(function (id) {
      var ch = CHAPTERS[id];
      return '<a class="ms-chap" href="/class-5/science/' + id + '">' + icon('book') +
        '<span><span class="ms-label">' + esc(t('inBook')) + '</span> ' + esc(t('chapterN', { n: ch.n })) + ': ' + esc(L(ch)) + '</span></a>';
    }).join('') + '</div>';
  }
  function slider(id, labelKey, min, max, step, value) {
    return '<div class="ms-control"><label for="' + id + '">' + esc(t(labelKey)) + '</label>' +
      '<div class="ms-range"><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">' +
      '<output id="' + id + '-out" for="' + id + '"' + (id === 'heat-temp' ? ' dir="ltr"' : '') + '></output></div></div>';
  }
  function stat(id, labelKey) {
    return '<div class="ms-stat"><span class="ms-label">' + esc(t(labelKey)) + '</span><strong id="' + id + '"></strong></div>';
  }
  function section(id, titleKey, textKey, scene, controls, stats, noteKey, tryKey, chapters) {
    return '<section class="card ms-sim" id="' + id + '" aria-labelledby="' + id + '-h">' +
      '<h2 id="' + id + '-h">' + esc(t(titleKey)) + '</h2>' +
      '<p>' + esc(t(textKey)) + '</p>' +
      '<div class="ms-body"><div class="ms-scene">' + scene + '</div>' +
        '<div class="ms-side">' + controls + '<div class="ms-stats" aria-live="polite">' + stats + '</div>' +
        '<p class="ms-note">' + esc(t(noteKey)) + '</p></div></div>' +
      '<div class="ms-try"><p class="ms-label">' + icon('bulb') + esc(t('tryThis')) + '</p><p>' + esc(t(tryKey)) + '</p></div>' +
      chapterLinks(chapters) +
    '</section>';
  }

  /* ---------- drawings (SVG, fixed left-to-right so they do not flip in Sindhi and Urdu) ---------- */

  function heatScene() {
    return '<svg id="heat-svg" class="ms-svg" viewBox="0 0 320 210" role="img" dir="ltr">' +
      '<rect id="heat-sky" width="320" height="150" fill="#dff1ff"/>' +
      '<rect y="150" width="320" height="60" fill="#e9d7b0"/>' +
      '<g id="heat-sun"><circle cx="262" cy="44" r="22" fill="#fbbf24"/>' +
        '<g class="ms-rays" stroke="#f59e0b" stroke-width="3" stroke-linecap="round">' +
        [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
          var r = a * Math.PI / 180;
          return '<line x1="' + (262 + Math.cos(r) * 28).toFixed(1) + '" y1="' + (44 + Math.sin(r) * 28).toFixed(1) +
            '" x2="' + (262 + Math.cos(r) * 37).toFixed(1) + '" y2="' + (44 + Math.sin(r) * 37).toFixed(1) + '"/>';
        }).join('') + '</g></g>' +
      // the pan and its water (water height is set by the script)
      '<clipPath id="pan-clip"><path d="M80 120 L240 120 L224 172 Q160 182 96 172 Z"/></clipPath>' +
      '<path d="M80 120 L240 120 L224 172 Q160 182 96 172 Z" fill="#f3e3cf"/>' +
      '<rect id="heat-water" x="70" y="120" width="180" height="60" fill="#5aa9e6" clip-path="url(#pan-clip)"/>' +
      '<path d="M74 118 L246 118 L240 124 L80 124 Z" fill="#b5651d"/>' +
      '<path d="M80 124 L240 124 L224 172 Q160 184 96 172 Z" fill="none" stroke="#9a4f12" stroke-width="4"/>' +
      '<g id="heat-steam" fill="none" stroke="#9fb7c9" stroke-width="3" stroke-linecap="round">' +
        '<path class="ms-steam" d="M120 108 q-8 -12 0 -24 q8 -12 0 -24"/>' +
        '<path class="ms-steam ms-s2" d="M160 108 q-8 -12 0 -24 q8 -12 0 -24"/>' +
        '<path class="ms-steam ms-s3" d="M200 108 q-8 -12 0 -24 q8 -12 0 -24"/></g>' +
      // thermometer
      '<rect x="22" y="40" width="16" height="104" rx="8" fill="#fff" stroke="#8a9a8c" stroke-width="2"/>' +
      '<rect id="heat-merc" x="27" y="60" width="6" height="80" rx="3" fill="#dc2626"/>' +
      '<circle cx="30" cy="150" r="12" fill="#dc2626" stroke="#8a9a8c" stroke-width="2"/>' +
      '<text id="heat-temp-txt" x="48" y="48" font-size="15" font-weight="700" fill="#7f1d1d"></text>' +
      '<text id="heat-clock" x="160" y="200" font-size="14" text-anchor="middle" fill="#5b4a2a"></text>' +
    '</svg>';
  }

  // the delta drawn from above: land, a river coming down, the sea at the bottom
  var FISH_SPOTS = [[150, 40], [170, 62], [146, 84], [166, 104], [150, 124], [170, 140], [148, 70], [164, 30]];
  var TREE_SPOTS = [];
  (function () { for (var i = 0; i < 14; i++) TREE_SPOTS.push([14 + i * 22 + (i % 2) * 4, 152 + (i % 3) * 7]); })();
  function deltaScene() {
    return '<svg id="delta-svg" class="ms-svg" viewBox="0 0 320 210" role="img" dir="ltr">' +
      '<rect width="320" height="210" fill="#cfe8b8"/>' +
      '<path d="M0 172 Q80 160 160 170 T320 168 L320 210 L0 210 Z" fill="#2b7bb9"/>' +
      '<path id="delta-salt" d="" fill="#7fd1c7" opacity="0.75"/>' +
      '<path id="delta-river" d="M160 0 C150 50 172 90 156 130 S150 160 160 175" fill="none" stroke="#3d8fd1" stroke-linecap="round"/>' +
      '<path id="delta-flowline" class="ms-flow" d="M160 0 C150 50 172 90 156 130 S150 160 160 175" fill="none" stroke="#bfe3ff" stroke-width="2" stroke-dasharray="6 10"/>' +
      '<g id="delta-trees">' + TREE_SPOTS.map(function (p, i) {
        return '<g class="ms-tree" data-i="' + i + '" transform="translate(' + p[0] + ' ' + p[1] + ')">' +
          '<rect x="-1.5" y="0" width="3" height="8" fill="#6b4423"/><path d="M-1 8 l-4 5 M1 8 l4 5" stroke="#6b4423" stroke-width="1.5"/>' +
          '<circle cx="0" cy="-3" r="7" fill="#2f7d32"/></g>';
      }).join('') + '</g>' +
      '<g id="delta-fish">' + FISH_SPOTS.map(function (p, i) {
        return '<g class="ms-fishpos" data-i="' + i + '" transform="translate(' + p[0] + ' ' + p[1] + ')"><g class="ms-fish' + (i % 2 ? ' ms-f2' : '') + '">' +
          '<ellipse cx="0" cy="0" rx="7" ry="3.2" fill="#d9e2ea" stroke="#6b7d8c" stroke-width="1"/>' +
          '<path d="M0 -6 l-3 -5 l6 0 z" fill="#d9e2ea" stroke="#6b7d8c" stroke-width="1" transform="rotate(90) translate(-14 -3)"/></g></g>';
      }).join('') + '</g>' +
      '<text x="8" y="202" font-size="11" fill="#e8f4ff" id="delta-sea"></text>' +
    '</svg>';
  }

  function windScene() {
    var blade = '<path d="M0 0 C 5 -20 4 -50 0 -64 C -3 -50 -4 -20 0 0 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>';
    var houses = '';
    for (var i = 0; i < 10; i++) {
      var x = 18 + i * 29;
      houses += '<g class="ms-house" data-i="' + i + '" transform="translate(' + x + ' 182)"><path d="M0 8 L10 0 L20 8 Z" fill="#9a6b47"/>' +
        '<rect x="2" y="8" width="16" height="12" fill="#e7d3b5"/><rect class="ms-win" x="7" y="11" width="6" height="6" fill="#475569"/></g>';
    }
    return '<svg id="wind-svg" class="ms-svg" viewBox="0 0 320 210" role="img" dir="ltr">' +
      '<rect width="320" height="210" fill="#e6f4ff"/>' +
      '<g id="wind-lines" stroke="#9cc3e4" stroke-width="2" stroke-linecap="round">' +
        '<line class="ms-gust" x1="0" y1="40" x2="40" y2="40"/><line class="ms-gust ms-g2" x1="0" y1="80" x2="30" y2="80"/>' +
        '<line class="ms-gust ms-g3" x1="0" y1="120" x2="44" y2="120"/></g>' +
      '<path d="M0 168 Q80 156 160 166 T320 162 L320 210 L0 210 Z" fill="#d9c79c"/>' +
      '<path d="M156 168 L158 74 L162 74 L164 168 Z" fill="#e2e8f0" stroke="#94a3b8"/>' +
      '<rect x="150" y="66" width="22" height="12" rx="4" fill="#e2e8f0" stroke="#94a3b8"/>' +
      '<g transform="translate(160 72)"><g id="wind-rotor">' + blade + '<g transform="rotate(120)">' + blade + '</g><g transform="rotate(240)">' + blade + '</g></g>' +
        '<circle r="5" fill="#cbd5e1" stroke="#64748b"/></g>' +
      // power meter
      '<rect x="252" y="40" width="20" height="110" rx="4" fill="#fff" stroke="#94a3b8"/>' +
      '<rect id="wind-meter" x="255" y="147" width="14" height="0" fill="#16a34a"/>' +
      '<text x="262" y="34" font-size="11" text-anchor="middle" fill="#334155">kW</text>' +
      houses +
    '</svg>';
  }

  function render() {
    stopPlay();
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/sindh/">' + esc(t('sindh')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="ms-hero"><div class="ms-band" aria-hidden="true"></div><div class="ms-hero-in">' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p>' +
        '<p class="ms-jump no-print"><span>' + esc(t('jump')) + '</span> <a href="#heat">' + esc(L({ sd: 'جيڪب آباد', ur: 'جیکب آباد', en: 'Jacobabad' })) + '</a>' +
          '<a href="#delta">' + esc(L({ sd: 'سنڌو جو ڇوڙ', ur: 'ڈیلٹا', en: 'Indus delta' })) + '</a>' +
          '<a href="#wind">' + esc(L({ sd: 'جهمپير', ur: 'جھمپیر', en: 'Jhimpir' })) + '</a></p>' +
        (reduced() ? '<p class="ms-note">' + esc(t('motionOff')) + '</p>' : '') +
      '</div></section>' +
      section('heat', 'heatTitle', 'heatText', heatScene(),
        slider('heat-temp', 'tempLabel', 25, 50, 1, state.temp) + slider('heat-hours', 'hoursLabel', 0, 240, 3, state.hours) +
        '<div class="btn-row ms-btns no-print"><button type="button" class="btn" id="heat-play" aria-pressed="false"></button>' +
        '<button type="button" class="btn ghost" id="heat-reset">' + icon('reset') + esc(t('reset')) + '</button></div>',
        stat('heat-dry', 'dryIn') + stat('heat-left', 'leftNow') + stat('heat-rate', 'rate'),
        'heatNote', 'heatTry', ['water-cycle', 'matter']) +
      section('delta', 'deltaTitle', 'deltaText', deltaScene(),
        slider('delta-flow', 'flowLabel', 0, 100, 5, state.flow),
        stat('delta-mang', 'mangroves') + stat('delta-saltv', 'salt') + stat('delta-palla', 'palla'),
        'deltaNote', 'deltaTry', ['living-things', 'pollution']) +
      section('wind', 'windTitle', 'windText', windScene(),
        slider('wind-speed', 'windLabel', 0, 25, 0.5, state.wind) + '<p class="ms-state" id="wind-state"></p>',
        stat('wind-power', 'power') + stat('wind-rpm', 'spin') + stat('wind-homes', 'homes'),
        'windNote', 'windTry', ['electricity-magnets', 'force-machines']) +
      '<section class="card ms-teach"><h2>' + esc(t('teacherTitle')) + '</h2><ol>' +
        L(T.teacherSteps).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>';

    $('heat-temp').addEventListener('input', function (e) { state.temp = +e.target.value; updateHeat(); });
    $('heat-hours').addEventListener('input', function (e) { state.hours = +e.target.value; stopPlay(); updateHeat(); });
    $('heat-play').addEventListener('click', function () { if (state.playing) stopPlay(); else startPlay(); });
    $('heat-reset').addEventListener('click', function () { stopPlay(); state.hours = 0; $('heat-hours').value = 0; updateHeat(); });
    $('delta-flow').addEventListener('input', function (e) { state.flow = +e.target.value; updateDelta(); });
    $('wind-speed').addEventListener('input', function (e) { state.wind = +e.target.value; updateWind(); });
    updateHeat(); updateDelta(); updateWind(); updatePlayButton();
    loop();
  }

  /* ---------- updates ---------- */

  function updateHeat() {
    var tc = state.temp, rate = evapPerDay(tc), dryHours = DEPTH / rate * 24;
    var left = Math.max(0, DEPTH - rate / 24 * state.hours), pct = Math.round(left / DEPTH * 100);
    var tOut = num(tc) + ' °C';
    $('heat-temp-out').textContent = tOut;
    attr($('heat-temp'), 'aria-valuetext', tOut);
    var hOut = t('hoursVal', { h: num(state.hours) });
    $('heat-hours-out').textContent = hOut;
    attr($('heat-hours'), 'aria-valuetext', hOut);
    $('heat-dry').textContent = t('dryVal', { h: num(Math.round(dryHours)), d: num(dryHours / 24, 1) });
    $('heat-left').textContent = left <= 0 ? t('dryNow') : t('leftVal', { mm: num(left, 1), p: pct });
    $('heat-rate').textContent = t('rateVal', { mm: num(rate, 1) });
    // drawing
    var top = 124, bottom = 176, wy = bottom - (bottom - top) * left / DEPTH;
    attr($('heat-water'), 'y', wy.toFixed(1));
    attr($('heat-water'), 'height', (bottom + 8 - wy).toFixed(1));
    var hot = (tc - 25) / 25;   // 0 at 25 °C, 1 at 50 °C
    attr($('heat-sky'), 'fill', mix([223, 241, 255], [255, 214, 165], hot));
    attr($('heat-sun'), 'transform', 'translate(262 44) scale(' + (0.8 + hot * 0.5).toFixed(2) + ') translate(-262 -44)');
    var mh = 20 + hot * 76;
    attr($('heat-merc'), 'y', (140 - mh).toFixed(1));
    attr($('heat-merc'), 'height', mh.toFixed(1));
    $('heat-temp-txt').textContent = tOut;
    $('heat-clock').textContent = '⏱ ' + hOut;
    var steam = $('heat-steam');
    steam.style.opacity = left > 0 ? (0.35 + hot * 0.65).toFixed(2) : '0';
    steam.style.setProperty('--steam-time', (3.2 - hot * 2).toFixed(2) + 's');
    attr($('heat-svg'), 'aria-label', t('heatAlt', { t: num(tc), p: pct }));
  }

  function updateDelta() {
    var f = state.flow, lv = flowLevel(f), words = L(T.flowLevels)[lv];
    var out = t('flowVal', { v: f, w: words });
    $('delta-flow-out').textContent = out;
    attr($('delta-flow'), 'aria-valuetext', out);
    $('delta-mang').textContent = L(T.mangroveSays)[lv];
    $('delta-saltv').textContent = L(T.saltSays)[lv];
    var fishCount = Math.round(f / 100 * FISH_SPOTS.length);
    $('delta-palla').textContent = L(T.pallaSays)[lv] + ' (' + fishCount + ')';
    // river width, salt wedge, trees and fish
    attr($('delta-river'), 'stroke-width', (3 + f / 100 * 17).toFixed(1));
    var saltTop = 168 - (1 - f / 100) * 120;    // salt water reaches higher up the river when the flow is low
    attr($('delta-salt'), 'd', 'M140 172 Q150 ' + (saltTop + 20).toFixed(0) + ' 158 ' + saltTop.toFixed(0) + ' Q166 ' + (saltTop + 20).toFixed(0) + ' 178 172 Z');
    var trees = Math.round(2 + f / 100 * (TREE_SPOTS.length - 2));
    [].forEach.call(document.querySelectorAll('#delta-trees .ms-tree'), function (g) {
      var i = +g.getAttribute('data-i'), alive = Math.abs(i - (TREE_SPOTS.length - 1) / 2) < trees / 2;
      g.setAttribute('class', 'ms-tree' + (alive ? '' : ' ms-dead'));
    });
    [].forEach.call(document.querySelectorAll('#delta-fish .ms-fishpos'), function (g) {
      g.style.display = +g.getAttribute('data-i') < fishCount ? '' : 'none';
    });
    $('delta-flowline').style.setProperty('--flow-time', (f ? (6 - f / 100 * 5) : 0).toFixed(2) + 's');
    $('delta-flowline').style.opacity = f ? '1' : '0';
    $('delta-sea').textContent = L({ sd: 'عربي سمنڊ', ur: 'بحیرۂ عرب', en: 'Arabian Sea' });
    attr($('delta-svg'), 'aria-label', t('deltaAlt', { w: words, f: fishCount }));
  }

  function updateWind() {
    var v = state.wind, kw = windKw(v), rpm = windRpm(v), stage = windStage(v);
    var out = t('windVal', { v: num(v, 1), k: num(v * 3.6) });
    $('wind-speed-out').textContent = out;
    attr($('wind-speed'), 'aria-valuetext', out);
    $('wind-power').textContent = t('kw', { n: num(Math.round(kw)) });
    $('wind-rpm').textContent = t('rpm', { n: num(rpm, 1) });
    var homes = Math.round(kw / 10) * 10;   // about 1 kW a home, rounded to tens
    $('wind-homes').textContent = t('homesVal', { n: num(homes) });
    var st = $('wind-state');
    st.textContent = L(T.windState)[stage];
    st.className = 'ms-state ms-stage' + stage;
    var mh = kw / RATED * 104;
    attr($('wind-meter'), 'y', (147 - mh).toFixed(1));
    attr($('wind-meter'), 'height', mh.toFixed(1));
    var lit = Math.round(kw / RATED * 10);   // each house in the picture stands for 200 homes
    [].forEach.call(document.querySelectorAll('#wind-svg .ms-house'), function (g) {
      g.querySelector('.ms-win').setAttribute('fill', +g.getAttribute('data-i') < lit ? '#facc15' : '#475569');
    });
    var lines = $('wind-lines');
    lines.style.opacity = v ? '1' : '0';
    lines.style.setProperty('--gust-time', (v ? Math.max(0.35, 4 - v * 0.15) : 0).toFixed(2) + 's');
    attr($('wind-svg'), 'aria-label', t('windAlt', { v: num(v, 1), p: num(Math.round(kw)) }));
  }

  function mix(a, b, k) {
    return 'rgb(' + a.map(function (x, i) { return Math.round(x + (b[i] - x) * k); }).join(',') + ')';
  }

  /* ---------- time: the turbine turns at its real speed, and "Run time" moves the clock for the pan ---------- */

  var rotorAngle = 0, lastTs = 0, frame = 0, playAcc = 0;
  function loop() {
    if (frame) cancelAnimationFrame(frame);
    lastTs = 0;
    frame = requestAnimationFrame(tick);
  }
  function tick(ts) {
    var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    var rotor = $('wind-rotor');
    if (!rotor) { frame = 0; return; }
    if (!reduced()) {
      rotorAngle = (rotorAngle + windRpm(state.wind) * 6 * dt) % 360;   // rpm × 360° / 60 s
      rotor.setAttribute('transform', 'rotate(' + rotorAngle.toFixed(2) + ')');
    }
    if (state.playing) {
      playAcc += dt;
      if (playAcc >= 0.2) {   // 3 hours of pan time every 0.2 s
        playAcc = 0;
        state.hours = Math.min(240, state.hours + 3);
        $('heat-hours').value = state.hours;
        var left = DEPTH - evapPerDay(state.temp) / 24 * state.hours;
        if (left <= 0 || state.hours >= 240) stopPlay();
        updateHeat();
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function startPlay() {
    if (DEPTH - evapPerDay(state.temp) / 24 * state.hours <= 0 || state.hours >= 240) state.hours = 0;
    state.playing = true; playAcc = 0;
    if (reduced()) {   // no moving clock: jump straight to the moment the water is gone
      state.hours = Math.min(240, Math.ceil(DEPTH / evapPerDay(state.temp) * 24 / 3) * 3);
      $('heat-hours').value = state.hours;
      state.playing = false;
      updateHeat();
    }
    updatePlayButton();
  }
  function stopPlay() {
    state.playing = false;
    updatePlayButton();
  }
  function updatePlayButton() {
    var b = $('heat-play');
    if (!b) return;
    b.innerHTML = icon(state.playing ? 'pause' : 'play') + esc(t(state.playing ? 'pause' : 'play'));
    b.setAttribute('aria-pressed', String(state.playing));
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-setlang]');
    if (!b) return;
    var l = b.getAttribute('data-setlang');
    if (LANGS.indexOf(l) < 0 || l === state.lang) return;
    state.lang = l;
    try { localStorage.setItem('ssp1.lang', JSON.stringify(l)); } catch (err) { /* this visit only */ }
    applyLang();
    render();
  });
  if (motionQuery) {
    var onMotion = function () { render(); };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
    else if (motionQuery.addListener) motionQuery.addListener(onMotion);
  }

  applyLang();
  render();
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
