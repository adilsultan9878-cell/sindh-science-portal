/* Sindh Science Learning Portal — Mohenjo-daro Science Lab (/sindh/mohenjo-daro/).
   A drawn view of the old city with five spots to tap, then four small labs: build the drains, bake a brick,
   seal the Great Bath and balance the weights. Each one is tied to a Class 5 Science chapter, in Sindhi, Urdu and English. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };

  var CHAPTERS = {
    microorganisms: { n: 2, sd: 'خوردبيني جاندار', ur: 'خوردبینی جاندار', en: 'Microorganisms' },
    pollution: { n: 4, sd: 'ماحولياتي آلودگي', ur: 'ماحولیاتی آلودگی', en: 'Environmental Pollution' },
    matter: { n: 5, sd: 'مادو ۽ ان ۾ تبديليون', ur: 'مادہ اور اس میں تبدیلیاں', en: 'Matter and Its Changes' },
    'force-machines': { n: 6, sd: 'قوت ۽ سادا مشينون', ur: 'قوت اور سادہ مشینیں', en: 'Force and Simple Machines' },
    soils: { n: 9, sd: 'مٽي', ur: 'مٹی', en: 'Soils' },
    'water-cycle': { n: 13, sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' }
  };

  // The five spots on the city view. lab: the lab section it leads to (none for the well).
  var SPOTS = [
    {
      id: 'drains', lab: 'lab-drains', chapters: ['pollution', 'microorganisms', 'force-machines'],
      name: { sd: 'ڍڪيل ناليون', ur: 'ڈھکی ہوئی نالیاں', en: 'Covered drains' },
      text: {
        sd: 'موئن جي دڙي جي گهڻن گهرن ۾ وهنجڻ جي جاءِ هئي. گندو پاڻي مٽيءَ جي پائيپن ذريعي گهٽيءَ جي نالين ۾ ويندو هو. ناليون ٿوري لاهيءَ سان ٺهيل هيون، تنهن ڪري ڪشش ثقل پاڻيءَ کي پاڻمرادو هيٺ وهائيندي هئي. ناليون پڪين سِرن سان ٺهيل هيون ۽ مٿان سِرن يا پٿرن سان ڍڪيل هيون، ۽ صفائيءَ لاءِ وچ وچ ۾ کڏا رکيل هئا. گندو پاڻي ڍڪيل رهي ته مڇر ۽ جراثيم نٿا وڌن ۽ ماڻهو بيمار ڪونه ٿين.',
        ur: 'موہنجو داڑو کے بہت سے گھروں میں نہانے کی جگہ تھی۔ گندا پانی مٹی کے پائپوں کے ذریعے گلی کی نالیوں میں جاتا تھا۔ نالیاں ہلکی ڈھلوان کے ساتھ بنی تھیں، اس لیے کششِ ثقل پانی کو خود بخود نیچے بہا دیتی تھی۔ نالیاں پکی اینٹوں سے بنی تھیں اور اوپر سے اینٹوں یا پتھروں سے ڈھکی تھیں، اور صفائی کے لیے بیچ بیچ میں گڑھے رکھے گئے تھے۔ گندا پانی ڈھکا رہے تو مچھر اور جراثیم نہیں پھیلتے اور لوگ بیمار نہیں ہوتے۔',
        en: 'Many houses in Mohenjo-daro had a bathing area. Dirty water ran through clay pipes into the street drains. The drains were laid on a gentle slope, so gravity made the water flow downhill on its own. They were made of baked bricks and covered with bricks or stones, with pits along the way for cleaning. When dirty water stays covered, mosquitoes and germs do not spread and people stay healthy.'
      }
    },
    {
      id: 'bricks', lab: 'lab-bricks', chapters: ['matter'],
      name: { sd: 'پڪيون سِرون ۽ ڀٽو', ur: 'پکی اینٹیں اور بھٹا', en: 'Baked bricks and the kiln' },
      text: {
        sd: 'شهر جون ديوارون، ناليون ۽ کوهه پڪين سِرن سان ٺهيل هئا. مٽيءَ جي سِر کي ڀٽي جي تيز باهه ۾ پچايو ويندو هو. گرمي مٽيءَ کي هميشه لاءِ پٿر جهڙو سخت بڻائي ڇڏي ٿي: هيءَ ڪيميائي تبديلي آهي، جيڪا واپس نٿي ٿي سگهي. سِرن جي ڊيگهه، ويڪر ۽ ٿولهه جو تناسب لڳ ڀڳ 4 : 2 : 1 هوندو هو، تنهن ڪري اهي هڪٻئي سان چڱيءَ طرح جڙي وينديون هيون.',
        ur: 'شہر کی دیواریں، نالیاں اور کنویں پکی اینٹوں سے بنے تھے۔ مٹی کی اینٹ کو بھٹے کی تیز آگ میں پکایا جاتا تھا۔ حرارت مٹی کو ہمیشہ کے لیے پتھر جیسا سخت بنا دیتی ہے: یہ کیمیائی تبدیلی ہے، جو واپس نہیں ہو سکتی۔ اینٹوں کی لمبائی، چوڑائی اور موٹائی کا تناسب تقریباً 4 : 2 : 1 ہوتا تھا، اس لیے یہ ایک دوسرے کے ساتھ اچھی طرح جڑ جاتی تھیں۔',
        en: 'The walls, drains and wells of the city were built with baked bricks. A clay brick was baked in the hot fire of a kiln. The heat turns clay into hard brick for ever: a chemical change that cannot be undone. The bricks had length, width and thickness in the ratio of about 4 : 2 : 1, so they fitted together well.'
      }
    },
    {
      id: 'bath', lab: 'lab-bath', chapters: ['soils', 'matter'],
      name: { sd: 'وڏو حمام', ur: 'عظیم حمام', en: 'The Great Bath' },
      text: {
        sd: 'وڏو حمام اٽڪل 12 ميٽر ڊگهو، 7 ميٽر ويڪرو ۽ 2.4 ميٽر اونهو تلاءُ هو. پاڻي مٽيءَ ۾ جذب ٿي وڃي ٿو، تنهن ڪري ٺاهيندڙن ان جي تري ۽ ديوارن ۾ سِرون ڪنڌيءَ ڀر سوڙهيون جوڙيون، وچ ۾ جپسم جو پلستر لڳايو ۽ پٺيان ڊامر (بِٽومن) جو تهه ڏنو. ائين پاڻي ٻاهر نه نڪتو.',
        ur: 'عظیم حمام تقریباً 12 میٹر لمبا، 7 میٹر چوڑا اور 2.4 میٹر گہرا تالاب تھا۔ پانی مٹی میں جذب ہو جاتا ہے، اس لیے بنانے والوں نے اس کے فرش اور دیواروں میں اینٹیں کنارے کے بل گھنی جوڑیں، بیچ میں جپسم کا پلستر لگایا اور پیچھے ڈامر (بِٹومن) کی تہہ لگائی۔ یوں پانی باہر نہیں رِسا۔',
        en: 'The Great Bath was a pool about 12 metres long, 7 metres wide and 2.4 metres deep. Water soaks into soil, so the builders set bricks tightly on their edges in the floor and walls, joined them with gypsum plaster and put a layer of bitumen (natural tar) behind them. This kept the water from leaking out.'
      }
    },
    {
      id: 'weights', lab: 'lab-weights', chapters: ['force-machines'],
      name: { sd: 'وزن ۽ ترازي', ur: 'باٹ اور ترازو', en: 'Weights and the balance' },
      text: {
        sd: 'موئن جي دڙي جا واپاري پٿر جا ننڍا چورس وزن استعمال ڪندا هئا. هر وزن پوئين کان ٻيڻو هوندو هو: 1، 2، 4، 8، 16، 32 ۽ 64. ترازي هڪ ليور آهي: وچ ۾ ٽيڪ (fulcrum) ۽ ٻنهي پاسن تي پلڙا. جڏهن ٻنهي پلڙن ۾ وزن برابر هجي ته ڏنڊي سڌي بيهي ٿي.',
        ur: 'موہنجو داڑو کے تاجر پتھر کے چھوٹے چوکور باٹ استعمال کرتے تھے۔ ہر باٹ پچھلے سے دگنا ہوتا تھا: 1، 2، 4، 8، 16، 32 اور 64۔ ترازو ایک لیور ہے: بیچ میں ٹیک (fulcrum) اور دونوں طرف پلڑے۔ جب دونوں پلڑوں میں وزن برابر ہو تو ڈنڈی سیدھی رہتی ہے۔',
        en: 'Traders in Mohenjo-daro used small cube-shaped stone weights. Each weight was double the one before: 1, 2, 4, 8, 16, 32 and 64. A balance is a lever: a fulcrum in the middle and a pan on each side. When both pans hold the same weight, the beam stays level.'
      }
    },
    {
      id: 'well', lab: null, chapters: ['water-cycle'],
      name: { sd: 'سِرن وارا کوهه', ur: 'اینٹوں والے کنویں', en: 'Brick-lined wells' },
      text: {
        sd: 'شهر ۾ سوين کوهه هئا ۽ گهڻن گهرن جو پنهنجو کوهه هوندو هو. مينهن ۽ سنڌو درياءَ جو پاڻي زمين ۾ جذب ٿي هيٺ گڏ ٿئي ٿو، جنهن کي زير زمين پاڻي چئبو آهي. کوهه کوٽي ماڻهو اهو پاڻي ڪڍندا هئا. کوهن جي اندر گول سِرون لڳل هيون ته جيئن ديوارون ڪري نه پون.',
        ur: 'شہر میں سینکڑوں کنویں تھے اور بہت سے گھروں کا اپنا کنواں ہوتا تھا۔ بارش اور دریائے سندھ کا پانی زمین میں جذب ہو کر نیچے جمع ہو جاتا ہے، جسے زیرِ زمین پانی کہتے ہیں۔ کنواں کھود کر لوگ یہ پانی نکالتے تھے۔ کنوؤں کے اندر گول اینٹیں لگی تھیں تاکہ دیواریں نہ گریں۔',
        en: 'The city had hundreds of wells, and many houses had a well of their own. Rain and water from the Indus soak into the ground and collect below it as groundwater. People dug wells to reach this water. The wells were lined with curved bricks so that the sides would not fall in.'
      }
    }
  ];

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    sindh: { sd: 'سنڌ ۾ سائنس', ur: 'سندھ میں سائنس', en: 'Science in Sindh' },
    title: { sd: 'موئن جو دڙو سائنس ليب', ur: 'موہنجو داڑو سائنس لیب', en: 'Mohenjo-daro Science Lab' },
    eyebrow: { sd: 'لاڙڪاڻو · 4,500 سال پراڻو شهر', ur: 'لاڑکانہ · 4,500 سال پرانا شہر', en: 'Larkana · a city 4,500 years old' },
    lead: {
      sd: 'موئن جو دڙو دنيا جي سڀ کان پراڻن رٿابنديءَ سان ٺهيل شهرن مان هڪ آهي، ۽ اهو اسان جي سنڌ ۾ آهي. هتي ان جي ماڻهن جي سائنس پاڻ آزمايو: ناليون ٺاهيو، سِر پچايو، حمام ۾ پاڻي روڪيو ۽ ترازي برابر ڪريو.',
      ur: 'موہنجو داڑو دنیا کے سب سے پرانے منصوبہ بند شہروں میں سے ایک ہے، اور یہ ہمارے سندھ میں ہے۔ یہاں اس کے لوگوں کی سائنس خود آزمائیں: نالیاں بنائیں، اینٹ پکائیں، حمام میں پانی روکیں اور ترازو برابر کریں۔',
      en: 'Mohenjo-daro is one of the oldest planned cities in the world, and it is here in Sindh. Try the science of its people yourself: build the drains, bake a brick, keep water in the bath and balance the scales.'
    },
    toCity: { sd: 'شهر ڏسو', ur: 'شہر دیکھیں', en: 'See the city' },
    print: { sd: 'هي صفحو پرنٽ ڪريو', ur: 'یہ صفحہ پرنٹ کریں', en: 'Print this page' },
    cityTitle: { sd: 'شهر ۾ گهمو', ur: 'شہر میں گھومیں', en: 'Walk through the city' },
    cityNote: { sd: 'ڪنهن نمبر تي ٽيپ ڪريو ۽ ڏسو ته ان جي پويان ڪهڙي سائنس آهي. (تصوير سادي آهي، ماپ مطابق ناهي.)', ur: 'کسی نمبر پر ٹیپ کریں اور دیکھیں کہ اس کے پیچھے کون سی سائنس ہے۔ (تصویر سادہ ہے، پیمانے کے مطابق نہیں۔)', en: 'Tap a number to see the science behind it. (A simple drawing, not to scale.)' },
    tryLab: { sd: 'ليب ۾ آزمايو', ur: 'لیب میں آزمائیں', en: 'Try it in the lab' },
    inBook: { sd: 'ڪتاب ۾', ur: 'کتاب میں', en: 'In your book' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    toTop: { sd: 'شهر ڏانهن واپس', ur: 'شہر پر واپس', en: 'Back to the city' },
    labN: { sd: 'ليب {n}', ur: 'لیب {n}', en: 'Lab {n}' },

    drainsTitle: { sd: 'گهرن کان وڏي نالي تائين ناليون ٺاهيو', ur: 'گھروں سے بڑے نالے تک نالیاں بنائیں', en: 'Build drains from the houses to the main drain' },
    drainsHow: {
      sd: 'نالي جو ٽڪرو ڇڪي ڪنهن خاني تي آڻيو (يا ٽڪرو چونڊي خاني تي ٽيپ ڪريو). رکيل ٽڪري تي ٻيهر ٽيپ ڪرڻ سان اهو ڦري ٿو. ٽنهي گهرن جو گندو پاڻي هيٺ وڏي نالي تائين پهچايو ۽ ڪٿي به پاڻي ٻاهر نه هارجي. کوهن واري خاني ۾ نالو نٿو ٺهي.',
      ur: 'نالی کا ٹکڑا گھسیٹ کر کسی خانے پر لائیں (یا ٹکڑا چن کر خانے پر ٹیپ کریں)۔ رکھے ہوئے ٹکڑے پر دوبارہ ٹیپ کرنے سے وہ گھومتا ہے۔ تینوں گھروں کا گندا پانی نیچے بڑے نالے تک پہنچائیں اور کہیں بھی پانی باہر نہ گرے۔ کنویں والے خانے میں نالی نہیں بنتی۔',
      en: 'Drag a drain piece onto a square (or pick a piece, then tap a square). Tap a placed piece again to turn it. Bring the dirty water from all three houses down to the main drain, without spilling any. You cannot build on the squares with wells.'
    },
    kbHint: { sd: 'ڪي بورڊ: تير وارن بٽڻن سان خانن ۾ هلو، Enter سان ٽڪرو رکو يا ڦيرايو.', ur: 'کی بورڈ: تیر والے بٹنوں سے خانوں میں چلیں، Enter سے ٹکڑا رکھیں یا گھمائیں۔', en: 'Keyboard: arrow keys move between squares, Enter places or turns a piece.' },
    slopeNote: { sd: 'زمين لاهيءَ واري آهي: گهر مٿاهين تي آهن، وڏو نالو هيٺ آهي.', ur: 'زمین ڈھلوان ہے: گھر اونچائی پر ہیں، بڑا نالا نیچے ہے۔', en: 'The ground slopes down: the houses are high, the main drain is low.' },
    high: { sd: 'مٿاهون', ur: 'اونچا', en: 'High' },
    low: { sd: 'هيٺاهون', ur: 'نیچا', en: 'Low' },
    drainsUphill: { sd: 'هتي پاڻيءَ کي مٿي چڙهڻو پوندو (نارنگي نشاني ڏسو). پاڻي پاڻمرادو مٿي نٿو چڙهي سگهي: ڪشش ثقل ان کي هيٺ ڇڪي ٿي. ناليون گهرن کان وڏي نالي تائين سڌيون يا لاهيءَ ڏانهن هئڻ گهرجن.', ur: 'یہاں پانی کو اوپر چڑھنا پڑتا (نارنجی نشان دیکھیں)۔ پانی خود اوپر نہیں چڑھ سکتا: کششِ ثقل اسے نیچے کھینچتی ہے۔ نالیاں گھروں سے بڑے نالے تک برابر یا ڈھلوان کی طرف ہونی چاہئیں۔', en: 'Here the water would have to flow uphill (see the orange mark). Water cannot climb by itself: gravity pulls it down. Drains must run level or downhill, from the houses to the main drain.' },
    pStraight: { sd: 'سڌو', ur: 'سیدھا', en: 'Straight' },
    pCorner: { sd: 'موڙ', ur: 'موڑ', en: 'Bend' },
    pTee: { sd: 'ٽي-جوڙ', ur: 'تین راہہ', en: 'T-joint' },
    pErase: { sd: 'هٽايو', ur: 'ہٹائیں', en: 'Remove' },
    runWater: { sd: 'پاڻي ڇڏيو', ur: 'پانی چھوڑیں', en: 'Let the water run' },
    clearGrid: { sd: 'نئين سر', ur: 'نئے سرے سے', en: 'Start again' },
    mainDrain: { sd: 'وڏو نالو', ur: 'بڑا نالا', en: 'Main drain' },
    house: { sd: 'گهر', ur: 'گھر', en: 'House' },
    well: { sd: 'کوهه', ur: 'کنواں', en: 'Well' },
    drainsOk: { sd: 'شاباس! ٽنهي گهرن جو گندو پاڻي ڍڪيل نالين مان وڏي نالي تائين پهتو. گهٽي صاف ۽ سڪل رهي، تنهن ڪري مڇر ۽ جراثيم نه وڌندا.', ur: 'شاباش! تینوں گھروں کا گندا پانی ڈھکی ہوئی نالیوں سے بڑے نالے تک پہنچ گیا۔ گلی صاف اور خشک رہی، اس لیے مچھر اور جراثیم نہیں پھیلیں گے۔', en: 'Well done! The dirty water from all three houses reached the main drain through covered drains. The street stays clean and dry, so mosquitoes and germs will not spread.' },
    drainsLeak: { sd: 'پاڻي گهٽيءَ ۾ هارجي ويو (ڳاڙهي نشاني ڏسو). اتي بيٺل گندو پاڻي مڇرن ۽ جراثيمن جي جاءِ بڻجي ٿو. نالو ٺيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'پانی گلی میں گر گیا (سرخ نشان دیکھیں)۔ وہاں کھڑا گندا پانی مچھروں اور جراثیم کی جگہ بن جاتا ہے۔ نالی ٹھیک کر کے دوبارہ کوشش کریں۔', en: 'Water spilled into the street (see the red mark). Standing dirty water there becomes a home for mosquitoes and germs. Fix the drain and try again.' },
    drainsShort: { sd: 'اڃا سڀني گهرن جو پاڻي وڏي نالي تائين نه پهتو. نالين کي هيٺ تائين ملايو.', ur: 'ابھی سب گھروں کا پانی بڑے نالے تک نہیں پہنچا۔ نالیوں کو نیچے تک ملائیں۔', en: 'Not all the houses reach the main drain yet. Join the drains all the way down.' },

    bricksTitle: { sd: 'سِر پچايو: ڪچي ۽ پڪي سِر ۾ فرق', ur: 'اینٹ پکائیں: کچی اور پکی اینٹ کا فرق', en: 'Bake a brick: raw brick or baked brick' },
    bricksHow: {
      sd: 'سلائيڊر سان ڀٽي جي گرمي چونڊيو، پوءِ سِر کي پاڻيءَ ۾ وجهو. ڏسو ته ڪهڙي سِر پاڻيءَ ۾ ڳري ٿي ۽ ڪهڙي سخت رهي ٿي.',
      ur: 'سلائیڈر سے بھٹے کی گرمی چنیں، پھر اینٹ کو پانی میں ڈالیں۔ دیکھیں کہ کون سی اینٹ پانی میں گھل جاتی ہے اور کون سی سخت رہتی ہے۔',
      en: 'Choose the heat of the kiln with the slider, then put the brick in water. See which brick falls apart in water and which one stays hard.'
    },
    heat: { sd: 'ڀٽي جي گرمي', ur: 'بھٹے کی گرمی', en: 'Kiln heat' },
    sunDried: { sd: 'رڳو اُس ۾ سُڪل (ڪچي سِر)', ur: 'صرف دھوپ میں سوکھی (کچی اینٹ)', en: 'Only dried in the sun (raw brick)' },
    dunk: { sd: 'سِر پاڻيءَ ۾ وجهو', ur: 'اینٹ پانی میں ڈالیں', en: 'Put the brick in water' },
    brickRaw: { sd: 'ڪچي سِر پاڻيءَ ۾ ڳري مٽي ٿي وئي! اُس رڳو پاڻي سڪائي ٿي (طبعي تبديلي): پاڻي ملڻ سان مٽي وري نرم ٿي وڃي ٿي.', ur: 'کچی اینٹ پانی میں گھل کر مٹی بن گئی! دھوپ صرف پانی سکھاتی ہے (طبعی تبدیلی): پانی ملنے سے مٹی پھر نرم ہو جاتی ہے۔', en: 'The raw brick fell apart into mud! The sun only dries out the water (a physical change): add water and the clay turns soft again.' },
    brickWeak: { sd: 'سِر ٿوري پڪي آهي پر ڪنارا ڀڄي ويا. گرمي اڃا گهٽ هئي. وڌيڪ گرمي ڏيو.', ur: 'اینٹ تھوڑی پکی ہے لیکن کنارے ٹوٹ گئے۔ گرمی ابھی کم تھی۔ زیادہ گرمی دیں۔', en: 'The brick is partly baked, but its edges crumbled. The heat was still too low. Give it more heat.' },
    brickGood: { sd: 'پڪي سِر پاڻيءَ ۾ سخت ۽ ڳاڙهي رهي! تيز گرميءَ مٽيءَ کي نئين، سخت شيءِ ۾ بدلائي ڇڏيو: هيءَ ڪيميائي تبديلي آهي، جيڪا واپس نٿي ٿئي. ان ڪري موئن جي دڙي جون سِرون 4,500 سالن کان پوءِ به موجود آهن.', ur: 'پکی اینٹ پانی میں سخت اور سرخ رہی! تیز گرمی نے مٹی کو نئی، سخت چیز میں بدل دیا: یہ کیمیائی تبدیلی ہے، جو واپس نہیں ہوتی۔ اسی لیے موہنجو داڑو کی اینٹیں 4,500 سال بعد بھی موجود ہیں۔', en: 'The baked brick stayed hard and red in the water! The strong heat changed the clay into a new, hard material: a chemical change that cannot be undone. That is why Mohenjo-daro\'s bricks still stand after 4,500 years.' },

    bathTitle: { sd: 'وڏي حمام ۾ پاڻي روڪيو', ur: 'عظیم حمام میں پانی روکیں', en: 'Keep the water in the Great Bath' },
    bathHow: {
      sd: 'چونڊيو ته حمام ۾ ڇا لڳائجي، پوءِ پاڻي ڀريو ۽ 10 ڏينهن ڏسو. ڪهڙي حالت ۾ پاڻي سڀ کان گهٽ گهٽجي ٿو؟',
      ur: 'چنیں کہ حمام میں کیا لگایا جائے، پھر پانی بھریں اور 10 دن دیکھیں۔ کس حالت میں پانی سب سے کم گھٹتا ہے؟',
      en: 'Choose what the bath is lined with, then fill it and watch for 10 days. When does the water go down the least?'
    },
    lineBricks: { sd: 'سوڙهيون جڙيل پڪيون سِرون ۽ جپسم جو پلستر', ur: 'گھنی جڑی پکی اینٹیں اور جپسم کا پلستر', en: 'Tightly fitted baked bricks with gypsum plaster' },
    lineBitumen: { sd: 'سِرن پٺيان ڊامر (بِٽومن) جو تهه', ur: 'اینٹوں کے پیچھے ڈامر (بِٹومن) کی تہہ', en: 'A layer of bitumen (natural tar) behind the bricks' },
    fill: { sd: 'پاڻي ڀريو ۽ ڏسو', ur: 'پانی بھریں اور دیکھیں', en: 'Fill it and watch' },
    dayN: { sd: 'ڏينهن {n}', ur: 'دن {n}', en: 'Day {n}' },
    waterLeft: { sd: 'باقي پاڻي: {n}%', ur: 'باقی پانی: {n}%', en: 'Water left: {n}%' },
    bathMud: { sd: 'رڳو مٽيءَ جو تلاءُ: پاڻي مٽيءَ جي ذرڙن جي وچ واري خالي جاءِ ۾ جذب ٿي ويو ۽ ٽن ڏينهن ۾ تلاءُ لڳ ڀڳ خالي ٿي ويو.', ur: 'صرف مٹی کا تالاب: پانی مٹی کے ذرات کے بیچ کی خالی جگہ میں جذب ہو گیا اور تین دن میں تالاب تقریباً خالی ہو گیا۔', en: 'A pool of bare soil: the water soaked into the spaces between the soil grains, and in three days the pool was almost empty.' },
    bathBricks: { sd: 'سِرن ۽ پلستر سان پاڻي گهڻو بچيو، پر سِرن جي وچ مان ڪجهه پاڻي اڃا به رسيو.', ur: 'اینٹوں اور پلستر سے پانی کافی بچا، لیکن اینٹوں کے بیچ سے کچھ پانی اب بھی رِسا۔', en: 'With bricks and plaster much more water stayed, but some still seeped between the bricks.' },
    bathTar: { sd: 'ڊامر ۾ پاڻي لنگهڻ لاءِ ڪا جاءِ ئي ناهي (اهو واٽر پروف آهي). ڊامر وارو حمام سڄو ڀريل رهيو، بلڪل موئن جي دڙي جي ماڻهن وانگر!', ur: 'ڈامر میں پانی گزرنے کی کوئی جگہ ہی نہیں (یہ واٹر پروف ہے)۔ ڈامر والا حمام پورا بھرا رہا، بالکل موہنجو داڑو کے لوگوں کی طرح!', en: 'Bitumen has no gaps for water to pass through (it is waterproof). The bath with bitumen stayed full, just as the people of Mohenjo-daro made it!' },
    bathTarOnly: { sd: 'ڊامر گهڻو پاڻي روڪيو، پر سِرن کان سواءِ اهو نرم تهه ڦاٽي پيو ۽ ڪجهه پاڻي نڪري ويو. ٻئي گڏ بهترين ڪم ڪن ٿا.', ur: 'ڈامر نے کافی پانی روکا، لیکن اینٹوں کے بغیر یہ نرم تہہ پھٹ گئی اور کچھ پانی نکل گیا۔ دونوں مل کر بہترین کام کرتے ہیں۔', en: 'Bitumen held back a lot of water, but without bricks the soft layer cracked and some water got out. The two work best together.' },

    weightsTitle: { sd: 'ترازي برابر ڪريو', ur: 'ترازو برابر کریں', en: 'Balance the scales' },
    weightsHow: {
      sd: 'کاٻي پلڙي ۾ هڪ شيءِ رکيل آهي. موئن جي دڙي جا وزن (1، 2، 4، 8، 16) ٽيپ ڪري ساڄي پلڙي ۾ وجهو يا ڪڍو، جيستائين ڏنڊي سڌي ٿي وڃي.',
      ur: 'بائیں پلڑے میں ایک چیز رکھی ہے۔ موہنجو داڑو کے باٹ (1، 2، 4، 8، 16) ٹیپ کر کے دائیں پلڑے میں ڈالیں یا نکالیں، یہاں تک کہ ڈنڈی سیدھی ہو جائے۔',
      en: 'Something is in the left pan. Tap the Mohenjo-daro weights (1, 2, 4, 8, 16) to put them in the right pan or take them out, until the beam is level.'
    },
    goods: [
      { sd: 'ڪڻڪ جي ٿيلهي', ur: 'گندم کی تھیلی', en: 'A bag of wheat' },
      { sd: 'ٽامي جو ٽڪرو', ur: 'تانبے کا ٹکڑا', en: 'A lump of copper' },
      { sd: 'ڪپهه جو ڳٺڙ', ur: 'کپاس کی گٹھڑی', en: 'A bundle of cotton' },
      { sd: 'مڻڪن جو هار', ur: 'موتیوں کا ہار', en: 'A bead necklace' }
    ],
    inPan: { sd: 'ساڄي پلڙي ۾: {n}', ur: 'دائیں پلڑے میں: {n}', en: 'In the right pan: {n}' },
    heavier: { sd: 'شيءِ وڌيڪ ڳري آهي. وزن وڌايو.', ur: 'چیز زیادہ بھاری ہے۔ باٹ بڑھائیں۔', en: 'The goods are heavier. Add weights.' },
    lighter: { sd: 'وزن وڌيڪ ٿي ويو. ڪجهه ڪڍو.', ur: 'باٹ زیادہ ہو گئے۔ کچھ نکالیں۔', en: 'Too much weight. Take some out.' },
    balanced: { sd: 'برابر! هن شيءِ جو وزن {n} آهي. 1، 2، 4، 8 ۽ 16 مان هر هڪ وزن رڳو هڪ ڀيرو استعمال ڪري 1 کان 31 تائين ڪو به وزن ٺاهي سگهجي ٿو.', ur: 'برابر! اس چیز کا وزن {n} ہے۔ 1، 2، 4، 8 اور 16 میں سے ہر باٹ صرف ایک بار استعمال کر کے 1 سے 31 تک کوئی بھی وزن بنایا جا سکتا ہے۔', en: 'Balanced! These goods weigh {n}. Using each of 1, 2, 4, 8 and 16 only once, you can make any weight from 1 to 31.' },
    nextGoods: { sd: 'ٻي شيءِ', ur: 'اگلی چیز', en: 'Next goods' },

    quizTitle: { sd: 'پاڻ کي آزمايو', ur: 'خود کو آزمائیں', en: 'Test yourself' },
    check: { sd: 'جواب چيڪ ڪريو', ur: 'جواب چیک کریں', en: 'Check answers' },
    score: { sd: '{n} مان {m} صحيح', ur: '{n} میں سے {m} درست', en: '{m} of {n} correct' },
    right: { sd: 'صحيح', ur: 'درست', en: 'Correct' },
    wrongAns: { sd: 'صحيح جواب: {a}', ur: 'درست جواب: {a}', en: 'Right answer: {a}' },
    teacherTitle: { sd: 'استادن لاءِ: ڪلاس جي سرگرمي', ur: 'اساتذہ کے لیے: کلاس کی سرگرمی', en: 'For teachers: a class activity' },
    teacherSteps: {
      sd: ['ڪلاس کي چئن گروپن ۾ ورهايو: ناليون، سِرون، حمام ۽ وزن.', 'هر گروپ پنهنجي ليب کيڏي ۽ ٻڌائي ته موئن جي دڙي جي ماڻهن اهو مسئلو ڪيئن حل ڪيو.', 'پوءِ پڇو: اسان جي ڳوٺ يا شهر ۾ اڄ اهو ئي مسئلو ڪيئن حل ٿئي ٿو؟ ڇا اسان جون ناليون ڍڪيل آهن؟'],
      ur: ['کلاس کو چار گروپوں میں بانٹیں: نالیاں، اینٹیں، حمام اور باٹ۔', 'ہر گروپ اپنی لیب کھیلے اور بتائے کہ موہنجو داڑو کے لوگوں نے یہ مسئلہ کیسے حل کیا۔', 'پھر پوچھیں: ہمارے گاؤں یا شہر میں آج یہی مسئلہ کیسے حل ہوتا ہے؟ کیا ہماری نالیاں ڈھکی ہوئی ہیں؟'],
      en: ['Split the class into four groups: drains, bricks, bath and weights.', 'Each group plays its lab and explains how the people of Mohenjo-daro solved that problem.', 'Then ask: how is the same problem solved in our village or town today? Are our drains covered?']
    },
    sourceNote: {
      sd: 'سائيز ۽ تعداد آثار قديمه جي ماهرن جي اندازن مطابق آهن. موئن جو دڙو يونيسڪو جي عالمي ورثي ۾ شامل آهي.',
      ur: 'پیمائشیں اور تعداد ماہرینِ آثارِ قدیمہ کے اندازوں کے مطابق ہیں۔ موہنجو داڑو یونیسکو کے عالمی ورثے میں شامل ہے۔',
      en: 'Sizes and numbers follow archaeologists\' estimates. Mohenjo-daro is a UNESCO World Heritage Site.'
    }
  };

  var QUIZ = [
    {
      q: { sd: 'موئن جي دڙي جون ناليون ڇو ڍڪيل هيون؟', ur: 'موہنجو داڑو کی نالیاں کیوں ڈھکی ہوئی تھیں؟', en: 'Why were Mohenjo-daro\'s drains covered?' },
      a: [
        { sd: 'ته جيئن گندو پاڻي مڇر ۽ جراثيم نه وڌائي', ur: 'تاکہ گندا پانی مچھر اور جراثیم نہ پھیلائے', en: 'So dirty water would not spread mosquitoes and germs' },
        { sd: 'ته جيئن پاڻي گرم رهي', ur: 'تاکہ پانی گرم رہے', en: 'To keep the water warm' },
        { sd: 'ته جيئن ٻار ان ۾ کيڏي سگهن', ur: 'تاکہ بچے اس میں کھیل سکیں', en: 'So children could play in them' }
      ], ok: 0
    },
    {
      q: { sd: 'مٽيءَ جي سِر کي باهه ۾ پچائڻ ڪهڙي تبديلي آهي؟', ur: 'مٹی کی اینٹ کو آگ میں پکانا کون سی تبدیلی ہے؟', en: 'What kind of change is baking a clay brick in fire?' },
      a: [
        { sd: 'طبعي تبديلي، جيڪا واپس ٿي سگهي ٿي', ur: 'طبعی تبدیلی، جو واپس ہو سکتی ہے', en: 'A physical change that can be undone' },
        { sd: 'ڪيميائي تبديلي، جيڪا واپس نٿي ٿي سگهي', ur: 'کیمیائی تبدیلی، جو واپس نہیں ہو سکتی', en: 'A chemical change that cannot be undone' },
        { sd: 'ڪا تبديلي ناهي', ur: 'کوئی تبدیلی نہیں', en: 'No change at all' }
      ], ok: 1
    },
    {
      q: { sd: 'وڏي حمام ۾ پاڻي روڪڻ لاءِ سِرن پٺيان ڇا لڳايو ويو؟', ur: 'عظیم حمام میں پانی روکنے کے لیے اینٹوں کے پیچھے کیا لگایا گیا؟', en: 'What was put behind the bricks of the Great Bath to keep the water in?' },
      a: [
        { sd: 'واري', ur: 'ریت', en: 'Sand' },
        { sd: 'ڪاٺ', ur: 'لکڑی', en: 'Wood' },
        { sd: 'ڊامر (بِٽومن)', ur: 'ڈامر (بِٹومن)', en: 'Bitumen (natural tar)' }
      ], ok: 2
    },
    {
      q: { sd: 'ترازي ڪهڙي سادي مشين آهي؟', ur: 'ترازو کون سی سادہ مشین ہے؟', en: 'Which simple machine is a balance?' },
      a: [
        { sd: 'ليور', ur: 'لیور', en: 'A lever' },
        { sd: 'ڦيٿو', ur: 'پہیہ', en: 'A wheel' },
        { sd: 'ڍلوان', ur: 'ڈھلوان', en: 'A ramp' }
      ], ok: 0
    },
    {
      q: { sd: 'کوهي جو پاڻي ڪٿان اچي ٿو؟', ur: 'کنویں کا پانی کہاں سے آتا ہے؟', en: 'Where does well water come from?' },
      a: [
        { sd: 'سمنڊ جي لهرن مان', ur: 'سمندر کی لہروں سے', en: 'From sea waves' },
        { sd: 'زمين ۾ جذب ٿيل مينهن ۽ درياءَ جي پاڻيءَ مان', ur: 'زمین میں جذب ہوئے بارش اور دریا کے پانی سے', en: 'From rain and river water that soaked into the ground' },
        { sd: 'جبلن جي هوا مان', ur: 'پہاڑوں کی ہوا سے', en: 'From mountain air' }
      ], ok: 1
    }
  ];

  var ICONS = {
    bricks: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    printer: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7.5 15h9"/>',
    drop: '<path d="M12 3c3 4 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-7 6-11z"/>',
    city: '<path d="M3 21h18M5 21V10l4-3v14M9 21V4h6v17M15 21V9l4 3v9"/>'
  };
  function icon(name) {
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  var main = document.getElementById('main');
  var state = { lang: 'sd', spot: null };
  try {
    var saved = JSON.parse(localStorage.getItem('ssp1.lang'));
    if (LANGS.indexOf(saved) >= 0) state.lang = saved;
  } catch (e) { /* storage blocked: Sindhi */ }

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
  function chapterLink(id) {
    var ch = CHAPTERS[id];
    return '<a class="sp-chap" href="/class-5/science/' + id + '">' + icon('book') +
      '<span><span class="sp-label">' + esc(t('inBook')) + '</span> ' + esc(t('chapterN', { n: ch.n })) + ': ' + esc(L(ch)) + '</span></a>';
  }

  /* ---------- the city, drawn in a simple 3D (isometric) view ---------- */

  var K = 22, OX = 318, OY = 46;
  function iso(x, y, z) { return [Math.round((OX + (x - y) * 0.866 * K) * 10) / 10, Math.round((OY + (x + y) * 0.5 * K - (z || 0) * K) * 10) / 10]; }
  function poly(pts, cls) { return '<polygon class="' + cls + '" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>'; }
  // A box from (x, y) with width w (along x), depth d (along y) and height h; shows top, front-left and front-right faces.
  function box(x, y, w, d, h, cls, z) {
    z = z || 0;
    var top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
    var left = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
    var right = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
    return '<g class="' + cls + '">' + poly(left, 'f-l') + poly(right, 'f-r') + poly(top, 'f-t') + '</g>';
  }
  function house(x, y, w, d, h) {
    var door = [iso(x + w * 0.35, y + d, 0), iso(x + w * 0.6, y + d, 0), iso(x + w * 0.6, y + d, h * 0.55), iso(x + w * 0.35, y + d, h * 0.55)];
    var court = [iso(x + 0.8, y + 0.8, h), iso(x + w - 0.8, y + 0.8, h), iso(x + w - 0.8, y + d - 0.8, h), iso(x + 0.8, y + d - 0.8, h)];
    return box(x, y, w, d, h, 'md-house') + poly(door, 'md-door') + poly(court, 'md-court');
  }
  // Where each numbered spot sits on the drawing (x, y, z in city units).
  var SPOT_AT = { drains: [8.5, 8.6, 0.2], bricks: [17.3, 2.6, 2.4], bath: [11.5, 2.7, 1.6], weights: [14.8, 11, 1.9], well: [17.6, 9.7, 1.3] };

  function citySvg() {
    var s = '';
    s += poly([iso(0, 0), iso(20, 0), iso(20, 14), iso(0, 14)], 'md-ground');
    // street with its covered drain
    s += poly([iso(0, 7), iso(20, 7), iso(20, 8.4), iso(0, 8.4)], 'md-street');
    for (var i = 0; i < 20; i += 1) s += poly([iso(i + 0.1, 7.95), iso(i + 0.9, 7.95), iso(i + 0.9, 8.3), iso(i + 0.1, 8.3)], 'md-cover');
    // citadel mound with the stupa and the Great Bath
    s += box(0.6, 0.6, 7, 5.4, 1.2, 'md-mound');
    var st = iso(4.1, 3.3, 1.2);
    s += '<path class="md-stupa" d="M' + (st[0] - 30) + ' ' + st[1] + ' Q ' + st[0] + ' ' + (st[1] - 62) + ' ' + (st[0] + 30) + ' ' + st[1] + ' Z"/>';
    s += '<rect class="md-stupa-top" x="' + (st[0] - 5) + '" y="' + (st[1] - 52) + '" width="10" height="9" rx="2"/>';
    s += box(9, 1, 5.4, 3.6, 0.9, 'md-bathwall');
    s += poly([iso(9.7, 1.6, 0.9), iso(13.7, 1.6, 0.9), iso(13.7, 4, 0.9), iso(9.7, 4, 0.9)], 'md-water');
    for (var b = 0; b < 4; b++) s += poly([iso(9.7 + b * 0.3, 3.2, 0.9 - b * 0.15), iso(9.7 + b * 0.3 + 0.3, 3.2, 0.9 - b * 0.15), iso(9.7 + b * 0.3 + 0.3, 4, 0.9 - b * 0.15), iso(9.7 + b * 0.3, 4, 0.9 - b * 0.15)], 'md-step');
    // kiln with fire
    s += box(16, 1.2, 2.6, 2.6, 1.4, 'md-kiln');
    var k = iso(17.3, 3.8, 0.5);
    s += '<path class="md-fire" d="M' + (k[0] - 7) + ' ' + (k[1] + 4) + ' q 7 -16 7 -22 q 7 10 7 22 z"/>';
    var sm = iso(17.3, 2.5, 1.4);
    s += '<path class="md-smoke" d="M' + sm[0] + ' ' + sm[1] + ' q -10 -14 0 -26 q 10 -12 0 -24"/>';
    // houses north of the street
    s += house(14.5, 4.4, 2.8, 2.2, 1.2);
    // houses south of the street, with a well and a market stall
    s += house(0.8, 9.2, 3.4, 3.2, 1.8) + house(4.8, 9.2, 3.2, 3.2, 1.5) + house(8.6, 9.2, 3.4, 3.2, 2);
    var w = iso(17.6, 9.7, 0), wt = iso(17.6, 9.7, 0.9);
    s += '<path class="md-well" d="M' + (w[0] - 17) + ' ' + w[1] + ' V ' + wt[1] + ' A 17 9 0 0 1 ' + (w[0] + 17) + ' ' + wt[1] + ' V ' + w[1] + ' A 17 9 0 0 1 ' + (w[0] - 17) + ' ' + w[1] + ' Z"/>';
    s += '<ellipse class="md-well-top" cx="' + wt[0] + '" cy="' + wt[1] + '" rx="17" ry="9"/><ellipse class="md-water" cx="' + wt[0] + '" cy="' + (wt[1] + 1) + '" rx="11" ry="5.5"/>';
    s += box(13.4, 10, 2.8, 2, 0.9, 'md-stall');
    var bal = iso(14.8, 11, 0.9);
    s += '<g class="md-mini-bal"><path d="M' + bal[0] + ' ' + bal[1] + ' v -16 M' + (bal[0] - 13) + ' ' + (bal[1] - 16) + ' h 26"/>' +
      '<path d="M' + (bal[0] - 13) + ' ' + (bal[1] - 16) + ' l -5 9 h 10 z M' + (bal[0] + 13) + ' ' + (bal[1] - 16) + ' l -5 9 h 10 z"/></g>';
    // numbered spots
    s += SPOTS.map(function (sp, n) {
      var p = iso(SPOT_AT[sp.id][0], SPOT_AT[sp.id][1], SPOT_AT[sp.id][2]);
      return '<a href="#spot" class="md-spot' + (state.spot === sp.id ? ' on' : '') + '" data-spot="' + sp.id + '" role="button"><title>' + esc((n + 1) + '. ' + L(sp.name)) + '</title>' +
        '<circle class="md-pulse" cx="' + p[0] + '" cy="' + p[1] + '" r="15"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="13"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 4.5) + '" text-anchor="middle">' + (n + 1) + '</text></a>';
    }).join('');
    return '<svg class="md-city" viewBox="0 0 640 440" role="img" aria-labelledby="city-title">' + s + '</svg>';
  }

  function spotPanel() {
    var sp = SPOTS.filter(function (x) { return x.id === state.spot; })[0];
    if (!sp) return '<p class="muted">' + esc(t('cityNote')) + '</p>';
    var n = SPOTS.indexOf(sp) + 1;
    return '<h3><span class="sp-lnum">' + n + '</span> ' + esc(L(sp.name)) + '</h3><p>' + esc(L(sp.text)) + '</p>' +
      '<div class="md-links">' + sp.chapters.map(chapterLink).join('') + '</div>' +
      (sp.lab ? '<p><a class="btn small" href="#' + sp.lab + '">' + icon('flask') + esc(t('tryLab')) + '</a></p>' : '');
  }

  /* ---------- lab 1: drains ---------- */

  // Pipe ends as bits: N 1, E 2, S 4, W 8. Turning a piece moves each end one step clockwise.
  var ROWS = 5, COLS = 6, HOUSES = [0, 2, 4], EXIT = 3, WELLS = { '1,1': 1, '2,3': 1, '1,5': 1 };
  var PIECES = { straight: 5, corner: 3, tee: 7 };
  var DIRS = [[1, -1, 0, 4], [2, 0, 1, 8], [4, 1, 0, 1], [8, 0, -1, 2]]; // bit, row step, col step, opposite bit
  var drains = { grid: [], tool: 'straight', result: null, wet: {}, leaks: {}, ups: {} };
  function clearDrains() {
    drains.grid = [];
    for (var r = 0; r < ROWS; r++) { drains.grid.push([]); for (var c = 0; c < COLS; c++) drains.grid[r].push(0); }
    drains.result = null; drains.wet = {}; drains.leaks = {}; drains.ups = {};
  }
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Redraws a lab box and gives keyboard focus back to the same control, so Enter can be pressed again.
  function fill(box, html) {
    var a = document.activeElement, sel = null;
    if (a && box.contains(a)) {
      ['data-cell', 'data-tool', 'data-act', 'data-w', 'data-line', 'data-heat'].some(function (k) {
        if (a.hasAttribute(k)) { sel = '[' + k + '="' + a.getAttribute(k) + '"]'; return true; }
        return false;
      });
    }
    box.innerHTML = html;
    if (sel) { var n = box.querySelector(sel); if (n && !n.disabled) n.focus(); }
  }
  clearDrains();
  function rot(m) { return ((m << 1) | (m >> 3)) & 15; }
  function pipeSvg(m) {
    var arms = { 1: 'M20 20V0', 2: 'M20 20H40', 4: 'M20 20V40', 8: 'M20 20H0' }, d = '';
    [1, 2, 4, 8].forEach(function (b) { if (m & b) d += arms[b]; });
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="pipe-out" d="' + d + '"/><path class="pipe-in" d="' + d + '"/>' +
      (m ? '<circle class="pipe-joint" cx="20" cy="20" r="5.5"/>' : '') + '</svg>';
  }
  // Follows the water from each house. Row 0 is the high ground by the houses and the last row is the low ground,
  // so water only moves down or sideways (gravity); it never climbs to a row above.
  // Returns the order cells get wet, the leak cells, the uphill cells and how many houses reach the exit.
  function flow() {
    var order = [], wet = {}, leaks = {}, ups = {}, reached = 0;
    HOUSES.forEach(function (hc) {
      if (!(drains.grid[0][hc] & 1)) { leaks['h' + hc] = 1; return; }
      var ok = false, queue = [[0, hc]], local = {};
      while (queue.length) {
        var cell = queue.shift(), r = cell[0], c = cell[1], key = r + ',' + c;
        if (local[key]) continue;
        local[key] = 1;
        if (!wet[key]) { wet[key] = 1; order.push(key); }
        var m = drains.grid[r][c];
        DIRS.forEach(function (d) {
          if (!(m & d[0]) || d[1] < 0) return;
          var nr = r + d[1], nc = c + d[2];
          if (nr >= ROWS) { if (nc === EXIT) ok = true; return; }
          if (nc < 0 || nc >= COLS || !(drains.grid[nr][nc] & d[3])) return;
          queue.push([nr, nc]);
        });
      }
      if (ok) reached++;
    });
    // every open end of a wet pipe must lead somewhere
    order.forEach(function (key) {
      var rc = key.split(','), r = +rc[0], c = +rc[1], m = drains.grid[r][c];
      DIRS.forEach(function (d) {
        if (!(m & d[0])) return;
        var nr = r + d[1], nc = c + d[2];
        if (nr < 0) { if (HOUSES.indexOf(nc) < 0) leaks[key] = 1; return; }
        if (nr >= ROWS) { if (nc !== EXIT) leaks[key] = 1; return; }
        if (nc < 0 || nc >= COLS || !(drains.grid[nr][nc] & d[3])) { leaks[key] = 1; return; }
        if (d[1] < 0 && !wet[nr + ',' + nc]) { ups[key] = 1; ups[nr + ',' + nc] = 1; }   // the pipe goes up to a dry part
      });
    });
    return { order: order, leaks: leaks, ups: ups, reached: reached };
  }
  function drainsGrid() {
    var top = '<div class="dr-row dr-houses">' + Array.apply(null, Array(COLS)).map(function (x, c) {
      return '<span class="dr-edge">' + (HOUSES.indexOf(c) >= 0 ? '<span class="dr-house' + (drains.leaks['h' + c] ? ' leak' : '') + '">' + esc(t('house')) + '</span>' : '') + '</span>';
    }).join('') + '</div>';
    var rows = '';
    for (var r = 0; r < ROWS; r++) {
      rows += '<div class="dr-row">';
      for (var c = 0; c < COLS; c++) {
        var key = r + ',' + c;
        if (WELLS[key]) { rows += '<span class="dr-cell dr-well" title="' + esc(t('well')) + '"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="6"/></svg></span>'; continue; }
        rows += '<button type="button" class="dr-cell' + (drains.wet[key] ? ' wet' : '') + (drains.leaks[key] ? ' leak' : drains.ups[key] ? ' up' : '') + '" data-cell="' + key + '" aria-label="' + (r + 1) + ', ' + (c + 1) + '">' + pipeSvg(drains.grid[r][c]) + '</button>';
      }
      rows += '</div>';
    }
    var bottom = '<div class="dr-row">' + Array.apply(null, Array(COLS)).map(function (x, c) {
      return '<span class="dr-edge">' + (c === EXIT ? '<span class="dr-exit">' + esc(t('mainDrain')) + ' ↓</span>' : '') + '</span>';
    }).join('') + '</div>';
    return '<p class="dr-slope muted small">' + esc(t('slopeNote')) + '</p>' +
      '<div class="dr-wrap" dir="ltr"><div class="dr-grid">' + top + rows + bottom + '</div>' +
      '<div class="dr-hill" aria-hidden="true"><span>' + esc(t('high')) + '</span><svg viewBox="0 0 20 100" preserveAspectRatio="none"><path d="M10 4V92M4 84l6 10 6-10"/></svg><span>' + esc(t('low')) + '</span></div></div>';
  }
  function drainsTools() {
    return '<div class="dr-tools" role="group">' + ['straight', 'corner', 'tee'].map(function (p) {
      var label = t(p === 'straight' ? 'pStraight' : p === 'corner' ? 'pCorner' : 'pTee');
      return '<button type="button" class="dr-tool" data-tool="' + p + '" aria-pressed="' + (drains.tool === p) + '">' + pipeSvg(PIECES[p]) + '<span>' + esc(label) + '</span></button>';
    }).join('') + '<button type="button" class="dr-tool" data-tool="erase" aria-pressed="' + (drains.tool === 'erase') + '"><svg viewBox="0 0 40 40" aria-hidden="true"><path class="pipe-x" d="M12 12l16 16M28 12 12 28"/></svg><span>' + esc(t('pErase')) + '</span></button></div>';
  }
  function drainsMsg() {
    if (!drains.result) return '';
    if (drains.result === 'ok') return '<p class="note ok">' + esc(t('drainsOk')) + '</p>';
    var out = '';
    if (drains.result.leak) out += '<p class="note warn">' + esc(t('drainsLeak')) + '</p>';
    if (drains.result.up) out += '<p class="note warn">' + esc(t('drainsUphill')) + '</p>';
    return out || '<p class="note warn">' + esc(t('drainsShort')) + '</p>';
  }
  function drawDrains() {
    var box = document.getElementById('dr-box');
    if (box) fill(box, drainsTools() + drainsGrid() + '<p class="muted small dr-kb">' + esc(t('kbHint')) + '</p>' +
      '<div class="btn-row"><button type="button" class="btn" data-act="run">' + icon('drop') + esc(t('runWater')) + '</button>' +
      '<button type="button" class="btn ghost" data-act="clear">' + esc(t('clearGrid')) + '</button></div><div aria-live="polite">' + drainsMsg() + '</div>');
  }
  function resetRun() { drains.result = null; drains.wet = {}; drains.leaks = {}; drains.ups = {}; }
  function place(r, c, tool) {
    if (running || WELLS[r + ',' + c]) return;
    var m = drains.grid[r][c];
    if (tool === 'erase') drains.grid[r][c] = 0;
    else if (m && tool == null) drains.grid[r][c] = rot(m);
    else drains.grid[r][c] = m && PIECES[tool] === m ? rot(m) : PIECES[tool];
    resetRun();
    drawDrains();
  }
  var running = false;
  function runWater() {
    if (running) return;
    var f = flow();
    resetRun();
    running = true;
    var i = 0;
    (function step() {
      if (REDUCE) { f.order.forEach(function (k) { drains.wet[k] = 1; }); i = f.order.length; }
      if (i < f.order.length) { drains.wet[f.order[i++]] = 1; drawDrains(); setTimeout(step, 110); return; }
      drains.leaks = f.leaks; drains.ups = f.ups;
      var leak = Object.keys(f.leaks).length > 0, up = Object.keys(f.ups).length > 0;
      drains.result = !leak && !up && f.reached === HOUSES.length ? 'ok' : { leak: leak, up: up };
      running = false;
      drawDrains();
    })();
  }

  // Drag a piece from the tool row onto a square, with a finger, a pen or the mouse.
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    var tool = e.target.closest && e.target.closest('.dr-tool');
    if (!tool || running || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { tool: tool.getAttribute('data-tool'), x: e.clientX, y: e.clientY, ghost: null, moved: false };
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 8) return;
    if (!drag.moved) {
      drag.moved = true;
      var g = document.createElement('div');
      g.className = 'dr-ghost';
      g.innerHTML = drag.tool === 'erase' ? '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="pipe-x" d="M12 12l16 16M28 12 12 28"/></svg>' : pipeSvg(PIECES[drag.tool]);
      document.body.appendChild(g);
      drag.ghost = g;
    }
    e.preventDefault();
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    var over = document.elementFromPoint(e.clientX, e.clientY), cell = over && over.closest('[data-cell]');
    [].forEach.call(document.querySelectorAll('.dr-cell.drop'), function (n) { if (n !== cell) n.classList.remove('drop'); });
    if (cell) cell.classList.add('drop');
  }, { passive: false });
  function endDrag(e, cancel) {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (!d.moved) return;   // a plain tap: the click handler picks the tool
    if (d.ghost) d.ghost.remove();
    var over = !cancel && document.elementFromPoint(e.clientX, e.clientY), cell = over && over.closest('[data-cell]');
    drains.tool = d.tool;
    if (cell) { var rc = cell.getAttribute('data-cell').split(','); place(+rc[0], +rc[1], d.tool); }
    else drawDrains();
  }
  document.addEventListener('pointerup', function (e) { endDrag(e, false); });
  document.addEventListener('pointercancel', function (e) { endDrag(e, true); });

  // Arrow keys move between the squares (the grid is always left to right).
  document.addEventListener('keydown', function (e) {
    var cell = e.target.closest && e.target.closest('[data-cell]');
    var step = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (!cell || !step) return;
    e.preventDefault();
    var rc = cell.getAttribute('data-cell').split(','), r = +rc[0], c = +rc[1];
    for (var i = 0; i < ROWS * COLS; i++) {
      r += step[0]; c += step[1];
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      var next = document.querySelector('[data-cell="' + r + ',' + c + '"]');
      if (next) { next.focus(); return; }   // wells are skipped
    }
  });

  /* ---------- lab 2: bricks ---------- */

  var brick = { heat: 0, result: null, busy: false };
  function brickColor(h) {
    var k = Math.min(1, h / 900);   // grey-brown clay to red brick
    var r = Math.round(150 + (183 - 150) * k), g = Math.round(125 + (74 - 125) * k), b = Math.round(100 + (40 - 100) * k);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function brickSvg(stage) {
    // stage: 0 dry, 1 in water, 2 result
    var water = stage ? '<rect class="bk-water' + (stage === 2 && brick.result === 'raw' ? ' muddy' : '') + '" x="30" y="70" width="200" height="80" rx="4"/>' : '';
    var shape;
    if (stage === 2 && brick.result === 'raw') shape = '<ellipse cx="130" cy="142" rx="56" ry="7" fill="' + brickColor(brick.heat) + '"/>';
    else if (stage === 2 && brick.result === 'weak') shape = '<path d="M86 104 l8 -6 h70 l10 8 v30 l-8 6 h-72 l-8 -8 z" fill="' + brickColor(brick.heat) + '"/><circle cx="84" cy="142" r="4" fill="' + brickColor(brick.heat) + '"/><circle cx="178" cy="144" r="3" fill="' + brickColor(brick.heat) + '"/>';
    else shape = '<rect x="84" y="' + (stage ? 104 : 40) + '" width="92" height="40" rx="3" fill="' + brickColor(brick.heat) + '" stroke="rgba(0,0,0,.25)"/>';
    return '<svg class="bk-svg" viewBox="0 0 260 160" aria-hidden="true"><path class="bk-tub" d="M26 66 h208 l-8 88 h-192 z"/>' + water + shape + '</svg>';
  }
  function drawBricks(stage) {
    var box = document.getElementById('bk-box');
    if (!box) return;
    var label = brick.heat === 0 ? t('sunDried') : brick.heat + ' °C';
    var msg = stage === 2 ? '<p class="note ' + (brick.result === 'good' ? 'ok' : 'warn') + '">' + esc(t(brick.result === 'good' ? 'brickGood' : brick.result === 'weak' ? 'brickWeak' : 'brickRaw')) + '</p>' : '';
    fill(box, '<div class="bk-row"><div class="bk-pic">' + brickSvg(stage || 0) + '</div><div class="bk-ctrl">' +
      '<label class="field"><span>' + esc(t('heat')) + ': <b class="bk-val" dir="ltr">' + esc(label) + '</b></span>' +
      '<input type="range" min="0" max="1000" step="100" value="' + brick.heat + '" data-heat></label>' +
      '<p><button type="button" class="btn" data-act="dunk"' + (brick.busy ? ' disabled' : '') + '>' + icon('drop') + esc(t('dunk')) + '</button></p></div></div>' +
      '<div aria-live="polite">' + msg + '</div>');
  }
  function dunk() {
    if (brick.busy) return;
    brick.busy = true;
    brick.result = brick.heat < 500 ? 'raw' : brick.heat < 700 ? 'weak' : 'good';
    drawBricks(1);
    setTimeout(function () { brick.busy = false; drawBricks(2); }, REDUCE ? 200 : 1200);
  }

  /* ---------- lab 3: the Great Bath ---------- */

  var bath = { bricks: false, tar: false, day: 0, level: 0, busy: false, done: false };
  function bathSvg() {
    var top = 40, bottom = 140, h = (bottom - top - 6) * bath.level / 100;
    var drips = bath.busy && (!bath.bricks || !bath.tar) ? '<g class="bh-drip"><circle cx="40" cy="150" r="3"/><circle cx="220" cy="146" r="3"/><circle cx="130" cy="152" r="3"/></g>' : '';
    return '<svg class="bh-svg" viewBox="0 0 260 170" aria-hidden="true">' +
      '<rect class="bh-soil" x="0" y="20" width="260" height="150"/>' +
      (bath.tar ? '<path class="bh-tar" d="M44 30 V146 H216 V30" fill="none"/>' : '') +
      (bath.bricks ? '<path class="bh-brick" d="M52 30 V138 H208 V30" fill="none"/>' : '') +
      '<rect class="bh-hole" x="56" y="' + top + '" width="148" height="' + (bottom - top) + '"/>' +
      '<rect class="bh-water" x="56" y="' + (bottom - h) + '" width="148" height="' + h + '"/>' +
      drips + '</svg>';
  }
  function drawBath() {
    var box = document.getElementById('bh-box');
    if (!box) return;
    var msg = '';
    if (bath.done) {
      var key = bath.bricks && bath.tar ? 'bathTar' : bath.bricks ? 'bathBricks' : bath.tar ? 'bathTarOnly' : 'bathMud';
      msg = '<p class="note ' + (bath.bricks && bath.tar ? 'ok' : 'warn') + '">' + esc(t(key)) + '</p>';
    }
    fill(box, '<div class="bk-row"><div class="bk-pic">' + bathSvg() +
      '<p class="bh-stat"><b>' + esc(t('dayN', { n: bath.day })) + '</b> · ' + esc(t('waterLeft', { n: Math.round(bath.level) })) + '</p></div><div class="bk-ctrl">' +
      '<label class="md-check"><input type="checkbox" data-line="bricks"' + (bath.bricks ? ' checked' : '') + (bath.busy ? ' disabled' : '') + '> ' + esc(t('lineBricks')) + '</label>' +
      '<label class="md-check"><input type="checkbox" data-line="tar"' + (bath.tar ? ' checked' : '') + (bath.busy ? ' disabled' : '') + '> ' + esc(t('lineBitumen')) + '</label>' +
      '<p><button type="button" class="btn" data-act="fill"' + (bath.busy ? ' disabled' : '') + '>' + icon('drop') + esc(t('fill')) + '</button></p></div></div>' +
      '<div aria-live="polite">' + msg + '</div>');
  }
  function fillBath() {
    if (bath.busy) return;
    var loss = bath.bricks && bath.tar ? 0.3 : bath.bricks ? 4 : bath.tar ? 6 : 45;   // % of the water lost each day
    bath.busy = true; bath.done = false; bath.day = 0; bath.level = 100;
    drawBath();
    (function day() {
      if (bath.day >= 10) { bath.busy = false; bath.done = true; drawBath(); return; }
      bath.day++;
      bath.level = Math.max(0, bath.level * (1 - loss / 100) - (loss > 20 ? 4 : 0));
      drawBath();
      setTimeout(day, REDUCE ? 40 : 380);
    })();
  }

  /* ---------- lab 4: weights ---------- */

  var GOODS_WEIGHT = [13, 22, 7, 27], WEIGHTS = [1, 2, 4, 8, 16];
  var bal = { goods: 0, on: {} };
  function panTotal() { return WEIGHTS.reduce(function (s, w) { return s + (bal.on[w] ? w : 0); }, 0); }
  function balanceSvg() {
    var goods = GOODS_WEIGHT[bal.goods], put = panTotal(), diff = goods - put;
    var ang = Math.max(-14, Math.min(14, diff * 1.4)); // positive: left side down
    var rad = ang * Math.PI / 180, L1 = 95;
    var lx = 140 - L1 * Math.cos(rad), ly = 50 + L1 * Math.sin(rad), rx = 140 + L1 * Math.cos(rad), ry = 50 - L1 * Math.sin(rad);
    var cubes = WEIGHTS.filter(function (w) { return bal.on[w]; }).map(function (w, i) {
      var s = 8 + Math.sqrt(w) * 3.2;
      return '<rect class="wt-cube" x="' + (rx - 34 + i * 15) + '" y="' + (ry + 36 - s) + '" width="' + s + '" height="' + s + '" rx="1.5"/>';
    }).join('');
    return '<svg class="wt-svg" viewBox="0 0 280 170" aria-hidden="true">' +
      '<path class="wt-stand" d="M140 50 V156 M110 158 h60"/><circle class="wt-pivot" cx="140" cy="50" r="5"/>' +
      '<line class="wt-beam" x1="' + lx + '" y1="' + ly + '" x2="' + rx + '" y2="' + ry + '"/>' +
      '<path class="wt-string" d="M' + lx + ' ' + ly + ' l -26 36 M' + lx + ' ' + ly + ' l 26 36 M' + rx + ' ' + ry + ' l -26 36 M' + rx + ' ' + ry + ' l 26 36"/>' +
      '<path class="wt-pan" d="M' + (lx - 32) + ' ' + (ly + 36) + ' h64 q -6 10 -32 10 q -26 0 -32 -10 z"/>' +
      '<path class="wt-pan" d="M' + (rx - 32) + ' ' + (ry + 36) + ' h64 q -6 10 -32 10 q -26 0 -32 -10 z"/>' +
      '<path class="wt-goods" d="M' + (lx - 18) + ' ' + (ly + 36) + ' q 0 -24 18 -26 q 18 2 18 26 z"/>' + cubes +
      (diff === 0 ? '<path class="wt-ok" d="M128 24 l8 8 16 -16"/>' : '') + '</svg>';
  }
  function drawWeights() {
    var box = document.getElementById('wt-box');
    if (!box) return;
    var goods = GOODS_WEIGHT[bal.goods], put = panTotal(), diff = goods - put;
    var msg = diff === 0 ? '<p class="note ok">' + esc(t('balanced', { n: goods })) + '</p>' : '<p class="muted">' + esc(t(diff > 0 ? 'heavier' : 'lighter')) + '</p>';
    fill(box, '<div class="bk-row"><div class="bk-pic">' + balanceSvg() + '<p class="bh-stat"><b>' + esc(L(T.goods[bal.goods])) + '</b> · ' + esc(t('inPan', { n: put })) + '</p></div>' +
      '<div class="bk-ctrl"><div class="wt-set">' + WEIGHTS.map(function (w) {
        return '<button type="button" class="wt-btn" data-w="' + w + '" aria-pressed="' + !!bal.on[w] + '"><span class="wt-mini" style="width:' + (10 + Math.sqrt(w) * 4) + 'px;height:' + (10 + Math.sqrt(w) * 4) + 'px"></span><b dir="ltr">' + w + '</b></button>';
      }).join('') + '</div>' +
      (diff === 0 ? '<p><button type="button" class="btn" data-act="next-goods">' + esc(t('nextGoods')) + ' →</button></p>' : '') + '</div></div>' +
      '<div aria-live="polite">' + msg + '</div>');
  }

  /* ---------- quiz ---------- */

  var quiz = { answers: {}, checked: false };
  function quizHtml() {
    var right = 0;
    var items = QUIZ.map(function (q, i) {
      var pick = quiz.answers[i], fb = '';
      if (quiz.checked) {
        if (pick === q.ok) { right++; fb = '<p class="md-fb ok">✓ ' + esc(t('right')) + '</p>'; }
        else fb = '<p class="md-fb bad">' + esc(t('wrongAns', { a: L(q.a[q.ok]) })) + '</p>';
      }
      return '<fieldset class="md-q"><legend>' + (i + 1) + '. ' + esc(L(q.q)) + '</legend>' + q.a.map(function (a, j) {
        return '<label class="opt"><input type="radio" name="mq' + i + '" value="' + j + '"' + (pick === j ? ' checked' : '') + (quiz.checked ? ' disabled' : '') + '> <span>' + esc(L(a)) + '</span></label>';
      }).join('') + fb + '</fieldset>';
    }).join('');
    return items + (quiz.checked ? '<p class="note ' + (right === QUIZ.length ? 'ok' : 'warn') + '"><b>' + esc(t('score', { n: QUIZ.length, m: right })) + '</b></p>' +
      '<p><button type="button" class="btn ghost" data-act="quiz-again">' + esc(t('clearGrid')) + '</button></p>' :
      '<p><button type="button" class="btn" data-act="quiz-check">' + esc(t('check')) + '</button></p>');
  }

  /* ---------- page ---------- */

  function labSection(n, id, titleKey, howKey, boxId, chapters) {
    return '<section class="card md-lab" id="' + id + '" tabindex="-1"><p class="eyebrow">' + esc(t('labN', { n: n })) + '</p>' +
      '<h2>' + esc(t(titleKey)) + '</h2><p>' + esc(t(howKey)) + '</p><div id="' + boxId + '"></div>' +
      '<div class="sp-foot">' + chapters.map(chapterLink).join('') + '<a class="sp-up no-print" href="#city">' + icon('up') + esc(t('toTop')) + '</a></div></section>';
  }
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
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/sindh/">' + esc(t('sindh')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="sp-hero md-hero"><div class="sp-band" aria-hidden="true"></div>' +
        '<div class="sp-hero-in"><p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p>' +
        '<div class="btn-row no-print"><a class="btn" href="#city">' + icon('city') + esc(t('toCity')) + '</a>' +
        '<button type="button" class="btn ghost" data-act="print">' + icon('printer') + esc(t('print')) + '</button></div></div></section>' +
      '<section class="card md-citycard" id="city" tabindex="-1"><h2 id="city-title">' + esc(t('cityTitle')) + '</h2>' +
        '<div class="md-citygrid"><div class="md-citybox">' + citySvg() + '</div><div class="md-spotinfo" id="spot" tabindex="-1" aria-live="polite">' + spotPanel() + '</div></div></section>' +
      labSection(1, 'lab-drains', 'drainsTitle', 'drainsHow', 'dr-box', ['pollution', 'microorganisms']) +
      labSection(2, 'lab-bricks', 'bricksTitle', 'bricksHow', 'bk-box', ['matter']) +
      labSection(3, 'lab-bath', 'bathTitle', 'bathHow', 'bh-box', ['soils', 'matter']) +
      labSection(4, 'lab-weights', 'weightsTitle', 'weightsHow', 'wt-box', ['force-machines']) +
      '<section class="card md-quiz" id="quiz"><h2>' + esc(t('quizTitle')) + '</h2><div id="quiz-box">' + quizHtml() + '</div></section>' +
      '<section class="card sp-teach"><h2>' + esc(t('teacherTitle')) + '</h2><ol>' +
        L(T.teacherSteps).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<p class="muted small">' + esc(t('sourceNote')) + '</p></section>';
    drawDrains(); drawBricks(brick.result ? 2 : 0); drawBath(); drawWeights();
  }
  function redrawCity() {
    var c = main.querySelector('.md-citybox'), info = document.getElementById('spot');
    if (c) c.innerHTML = citySvg();
    if (info) info.innerHTML = spotPanel();
  }

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
    var s = e.target.closest('[data-spot]');
    if (s) {
      e.preventDefault();
      state.spot = s.getAttribute('data-spot');
      redrawCity();
      var info = document.getElementById('spot');
      if (info && window.matchMedia('(max-width: 760px)').matches) info.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    var tool = e.target.closest('[data-tool]');
    if (tool) { drains.tool = tool.getAttribute('data-tool'); drawDrains(); return; }
    var cell = e.target.closest('[data-cell]');
    if (cell) {
      var rc = cell.getAttribute('data-cell').split(','), r = +rc[0], c = +rc[1];
      place(r, c, drains.grid[r][c] && drains.tool !== 'erase' ? null : drains.tool);   // a placed piece turns
      return;
    }
    var w = e.target.closest('[data-w]');
    if (w) { var v = +w.getAttribute('data-w'); bal.on[v] = !bal.on[v]; drawWeights(); return; }
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'print') window.print();
    if (act === 'run') runWater();
    if (act === 'clear' && !running) { clearDrains(); drawDrains(); }
    if (act === 'dunk') dunk();
    if (act === 'fill') fillBath();
    if (act === 'next-goods') { bal.goods = (bal.goods + 1) % GOODS_WEIGHT.length; bal.on = {}; drawWeights(); }
    if (act === 'quiz-check') {
      QUIZ.forEach(function (q, i) { var el = main.querySelector('input[name="mq' + i + '"]:checked'); if (el) quiz.answers[i] = +el.value; });
      quiz.checked = true;
      document.getElementById('quiz-box').innerHTML = quizHtml();
    }
    if (act === 'quiz-again') { quiz = { answers: {}, checked: false }; document.getElementById('quiz-box').innerHTML = quizHtml(); }
  });
  document.addEventListener('input', function (e) {
    if (!e.target.hasAttribute('data-heat')) return;
    brick.heat = +e.target.value;
    brick.result = null;
    var v = main.querySelector('.bk-val'), pic = main.querySelector('#bk-box .bk-pic');
    if (v) v.textContent = brick.heat === 0 ? t('sunDried') : brick.heat + ' °C';
    if (pic) pic.innerHTML = brickSvg(0);
    var live = main.querySelector('#bk-box [aria-live]');
    if (live) live.innerHTML = '';
  });
  document.addEventListener('change', function (e) {
    var line = e.target.getAttribute && e.target.getAttribute('data-line');
    if (!line) return;
    bath[line] = e.target.checked;
    bath.done = false; bath.day = 0; bath.level = 0;
    drawBath();
  });

  applyLang();
  render();
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
