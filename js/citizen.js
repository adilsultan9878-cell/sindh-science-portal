/* Sindh Citizen Science (/citizen/): children collect real data themselves — rain from a bottle rain gauge, trees
   they plant, birds they spot and the day's temperature — and put it on the map of Sindh in their own district.
   Nickname only (no names, phones or photos). Readings go through citizen_add / citizen_summary in Supabase;
   the table is closed. A class code is optional; the school dashboard then shows that class's readings. */
(function () {
  'use strict';

  var CFG = window.PORTAL_CONFIG;
  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var MINE = 'ssp1.citizen';          // { nick, district, cls } remembered on this phone
  var main = document.getElementById('main');
  var project = 'rain';
  var metric = 'entries';
  var selected = '';
  var summary = null;

  var TEXT = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    title: { sd: 'سنڌ سٽيزن سائنس', ur: 'سندھ سٹیزن سائنس', en: 'Sindh Citizen Science' },
    intro: {
      sd: 'سائنسدان وانگر پاڻ ڊيٽا گڏ ڪريو! مينهن ماپيو، وڻ پوکيو، پکي ڳڻيو يا گرمي لکو، ۽ پنهنجو ماپ سنڌ جي نقشي تي پنهنجي ضلعي ۾ وجهو.',
      ur: 'سائنس دان کی طرح خود ڈیٹا جمع کریں! بارش ناپیں، درخت لگائیں، پرندے گنیں یا گرمی لکھیں، اور اپنی پیمائش سندھ کے نقشے پر اپنے ضلع میں ڈالیں۔',
      en: 'Collect real data like a scientist! Measure rain, plant trees, count birds or record the heat, and put your reading on the map of Sindh in your district.'
    },
    pick: { sd: '1. هڪ منصوبو چونڊيو', ur: '1. ایک منصوبہ چنیں', en: '1. Pick a project' },
    how: { sd: '2. ڪيئن ڪجي', ur: '2. کیسے کریں', en: '2. How to do it' },
    send: { sd: '3. پنهنجو ماپ موڪليو', ur: '3. اپنی پیمائش بھیجیں', en: '3. Send your reading' },
    chapter: { sd: 'ڪتاب جو باب پڙهو', ur: 'کتاب کا باب پڑھیں', en: 'Read the book chapter' },
    nick: { sd: 'ننڍو نالو (نڪ نيم)', ur: 'مختصر نام (نک نیم)', en: 'Nickname' },
    nickHelp: { sd: 'پورو نالو، فون نمبر يا تصوير نه لکو.', ur: 'پورا نام، فون نمبر یا تصویر نہ دیں۔', en: 'No full name, phone number or photo.' },
    district: { sd: 'ضلعو', ur: 'ضلع', en: 'District' },
    choose: { sd: 'چونڊيو', ur: 'منتخب کریں', en: 'Choose' },
    date: { sd: 'تاريخ', ur: 'تاریخ', en: 'Date' },
    species: { sd: 'ڪهڙو پکي؟', ur: 'کون سا پرندہ؟', en: 'Which bird?' },
    source: { sd: 'ڪٿان پڙهيو؟', ur: 'کہاں سے پڑھا؟', en: 'Where did you read it?' },
    srcThermo: { sd: 'ٿرماميٽر', ur: 'تھرمامیٹر', en: 'Thermometer' },
    srcPhone: { sd: 'فون جو موسم', ur: 'فون کا موسم', en: "Phone's weather" },
    cls: { sd: 'ڪلاس ڪوڊ (اختياري)', ur: 'کلاس کوڈ (اختیاری)', en: 'Class code (optional)' },
    clsHelp: { sd: 'استاد کان وٺو، ته توهان جو اسڪول به ڏسي سگهي.', ur: 'استاد سے لیں، تاکہ آپ کا اسکول بھی دیکھ سکے۔', en: 'Ask your teacher, so your school can see it too.' },
    submit: { sd: 'نقشي تي وجهو', ur: 'نقشے پر ڈالیں', en: 'Put it on the map' },
    wait: { sd: 'ٿورو انتظار ڪريو…', ur: 'تھوڑا انتظار کریں…', en: 'Please wait…' },
    thanks: { sd: 'شاباس! توهان جو ماپ نقشي تي آهي.', ur: 'شاباش! آپ کی پیمائش نقشے پر ہے۔', en: 'Well done! Your reading is on the map.' },
    mapTitle: { sd: 'سنڌ جو نقشو: گذريل 30 ڏينهن', ur: 'سندھ کا نقشہ: پچھلے 30 دن', en: 'Map of Sindh: last 30 days' },
    mapHelp: { sd: 'گول تي ٽيپ ڪريو ته ان ضلعي جو حساب ڏسو. وڌيڪ ڳاڙهو سائو = وڌيڪ.', ur: 'دائرے پر ٹیپ کریں تو اس ضلع کا حساب دیکھیں۔ گہرا سبز = زیادہ۔', en: 'Tap a circle to see that district. Darker green = more.' },
    all: { sd: 'سڀ ماپ', ur: 'تمام پیمائشیں', en: 'All readings' },
    entries: { sd: 'ماپ', ur: 'پیمائشیں', en: 'Readings' },
    rainMm: { sd: 'مينهن (mm)', ur: 'بارش (mm)', en: 'Rain (mm)' },
    trees: { sd: 'وڻ', ur: 'درخت', en: 'Trees' },
    birds: { sd: 'پکي', ur: 'پرندے', en: 'Birds' },
    tempAvg: { sd: 'اوسط °C', ur: 'اوسط °C', en: 'Avg °C' },
    none: { sd: 'اڃا ڪو ماپ ناهي. پهريون توهان موڪليو!', ur: 'ابھی کوئی پیمائش نہیں۔ پہلی آپ بھیجیں!', en: 'No readings yet. Be the first!' },
    recent: { sd: 'تازا ماپ', ur: 'تازہ پیمائشیں', en: 'Latest readings' },
    topBirds: { sd: 'سڀ کان گهڻا ڏٺل پکي', ur: 'سب سے زیادہ دیکھے گئے پرندے', en: 'Birds seen most' },
    total: { sd: 'ڪل ماپ: {n}', ur: 'کل پیمائشیں: {n}', en: 'Total readings: {n}' },
    loadErr: { sd: 'نقشو نه کليو. انٽرنيٽ چيڪ ڪريو.', ur: 'نقشہ نہیں کھلا۔ انٹرنیٹ چیک کریں۔', en: 'Could not load the map. Check the internet.' },
    safety: {
      sd: 'حفاظت: وڏي جي اجازت سان ٻاهر وڃو. مينهن ۾ ڇت يا بجلي جي تارن ويجهو نه وڃو، گرمي ۾ ڇانو ۾ رهو ۽ پاڻي پيئو.',
      ur: 'حفاظت: بڑے کی اجازت سے باہر جائیں۔ بارش میں چھت یا بجلی کی تاروں کے قریب نہ جائیں، گرمی میں سائے میں رہیں اور پانی پئیں۔',
      en: 'Safety: go outside only with an adult’s permission. Keep away from roofs and electric wires in rain; stay in the shade and drink water in the heat.'
    },
    privacy: {
      sd: 'هتي رڳو ننڍو نالو، ضلعو ۽ ماپ رکيو وڃي ٿو. ڪو پورو نالو، فون يا تصوير نه.',
      ur: 'یہاں صرف مختصر نام، ضلع اور پیمائش رکھی جاتی ہے۔ کوئی پورا نام، فون یا تصویر نہیں۔',
      en: 'Only a nickname, district and the reading are kept. No full names, phones or photos.'
    },
    err_bad_project: { sd: 'منصوبو چونڊيو.', ur: 'منصوبہ چنیں۔', en: 'Pick a project.' },
    err_bad_district: { sd: 'ضلعو چونڊيو.', ur: 'ضلع منتخب کریں۔', en: 'Choose your district.' },
    err_bad_nickname: { sd: 'ننڍو نالو لکو (گهٽ ۾ گهٽ 2 اکر، فون نمبر نه).', ur: 'مختصر نام لکھیں (کم از کم 2 حروف، فون نمبر نہیں)۔', en: 'Write a nickname (at least 2 letters, no phone number).' },
    err_bad_date: { sd: 'تاريخ اڄ يا گذريل 30 ڏينهن مان هجي.', ur: 'تاریخ آج یا پچھلے 30 دنوں کی ہو۔', en: 'The date must be today or in the last 30 days.' },
    err_bad_value: { sd: 'هي ماپ صحيح حد ۾ ناهي. ٻيهر ڏسو.', ur: 'یہ پیمائش درست حد میں نہیں۔ دوبارہ دیکھیں۔', en: 'That number is outside the allowed range. Check it again.' },
    err_bad_species: { sd: 'پکي چونڊيو.', ur: 'پرندہ منتخب کریں۔', en: 'Choose the bird.' },
    err_bad_source: { sd: 'ٻڌايو ته ٿرماميٽر يا فون؟', ur: 'بتائیں تھرمامیٹر یا فون؟', en: 'Say thermometer or phone.' },
    err_bad_class: { sd: 'ڪلاس ڪوڊ غلط آهي. خالي ڇڏي سگهو ٿا.', ur: 'کلاس کوڈ غلط ہے۔ خالی چھوڑ سکتے ہیں۔', en: 'The class code is wrong. You can leave it empty.' },
    err_already: { sd: 'اڄ هن ضلعي جو هي ماپ توهان اڳ ئي موڪليو آهي.', ur: 'آج اس ضلع کی یہ پیمائش آپ پہلے ہی بھیج چکے ہیں۔', en: 'You already sent this reading for this day and district.' },
    err_too_many: { sd: 'اڄ لاءِ ڪافي ماپ ٿي ويا. سڀاڻي ٻيهر!', ur: 'آج کے لیے کافی پیمائشیں ہو گئیں۔ کل دوبارہ!', en: 'That is enough readings for today. Come back tomorrow!' },
    err_busy: { sd: 'هن وقت گهڻا ٻار موڪلي رهيا آهن. هڪ منٽ پوءِ ڪوشش ڪريو.', ur: 'اس وقت بہت سے بچے بھیج رہے ہیں۔ ایک منٹ بعد کوشش کریں۔', en: 'Many children are sending right now. Try again in a minute.' },
    err_other: { sd: 'ڪجهه غلط ٿيو. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'کچھ غلط ہو گیا۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Something went wrong. Check the internet and try again.' }
  };

  // The four projects: what is measured, its range, the book chapter it belongs to and the steps.
  var PROJECTS = {
    rain: {
      emoji: '🌧️', unit: 'mm', min: 0, max: 500, step: 0.5, chapter: '/class-5/science/water-cycle',
      name: { sd: 'بوتل وارو مينهن ماپ', ur: 'بوتل سے بارش ناپنے کا آلہ', en: 'Bottle rain gauge' },
      short: { sd: 'مينهن ڪيترو پيو؟ (mm)', ur: 'کتنی بارش ہوئی؟ (mm)', en: 'How much rain fell? (mm)' },
      value: { sd: 'مينهن (mm ملي ميٽر)', ur: 'بارش (mm ملی میٹر)', en: 'Rain (mm, millimetres)' },
      steps: {
        sd: ['پلاسٽڪ جي خالي بوتل جو مٿيون ٽيون حصو ڪاٽيو (وڏي جي مدد سان).', 'هيٺ ڪجهه پٿر رکو ۽ پاڻي وجهو جيستائين بوتل جو سڌو حصو شروع ٿئي — هي "صفر" ليڪ آهي.', 'ڪاٽيل مٿيون حصو اونڌو ڪري قيف وانگر رکو ۽ صفر کان ملي ميٽر وارو ماپ (فوٽو) چنبڙايو.', 'بوتل کليل جاءِ تي رکو، وڻن ۽ ڇتين کان پري.', 'هر صبح ساڳئي وقت صفر کان پاڻي جي اوچائي mm ۾ پڙهو، لکو، پوءِ صفر تائين خالي ڪريو.'],
        ur: ['پلاسٹک کی خالی بوتل کا اوپری تہائی حصہ کاٹیں (بڑے کی مدد سے)۔', 'نیچے کچھ پتھر رکھیں اور پانی ڈالیں جب تک بوتل کا سیدھا حصہ شروع ہو — یہ "صفر" لکیر ہے۔', 'کٹا ہوا اوپری حصہ الٹا کر کے قیف کی طرح لگائیں اور صفر سے ملی میٹر والا پیمانہ (فٹا) چپکائیں۔', 'بوتل کھلی جگہ پر رکھیں، درختوں اور چھتوں سے دور۔', 'ہر صبح ایک ہی وقت صفر سے پانی کی اونچائی mm میں پڑھیں، لکھیں، پھر صفر تک خالی کریں۔'],
        en: ['Cut off the top third of an empty plastic bottle (with an adult’s help).', 'Put a few stones in the bottom and add water up to where the straight part starts — this is your "zero" line.', 'Turn the cut top upside down as a funnel and stick a ruler (mm) from the zero line up.', 'Put the bottle in an open place, away from trees and roofs.', 'Every morning at the same time read the water height above zero in mm, write it down, then empty it back to zero.']
      }
    },
    tree: {
      emoji: '🌳', unit: '', min: 1, max: 20, step: 1, chapter: '/class-5/science/plants',
      name: { sd: 'وڻ پوکيو', ur: 'درخت لگائیں', en: 'Plant a tree' },
      short: { sd: 'ڪيترا وڻ پوکيا؟', ur: 'کتنے درخت لگائے؟', en: 'How many trees did you plant?' },
      value: { sd: 'ڪيترا وڻ پوکيا', ur: 'کتنے درخت لگائے', en: 'Trees planted' },
      steps: {
        sd: ['مقامي وڻ چونڊيو: نم، ٻير، سهانجڙو يا ديسي ٻٻر.', 'گهر يا اسڪول جي وڏي کان جاءِ جي اجازت وٺو.', 'هڪ فوٽ اونهو کڏو کوٽيو، ٻوٽو رکو ۽ مٽي سان ڍڪيو.', 'پهرين مهيني هر روز صبح يا شام پاڻي ڏيو ۽ ٻڪرين کان بچائڻ لاءِ ڪنڊن جي واڙ ڪريو.', 'جيترا وڻ پوکيا، اهو انگ موڪليو.'],
        ur: ['مقامی درخت چنیں: نیم، بیر، سہانجنا یا دیسی ببول۔', 'گھر یا اسکول کے بڑے سے جگہ کی اجازت لیں۔', 'ایک فٹ گہرا گڑھا کھودیں، پودا رکھیں اور مٹی سے ڈھانپیں۔', 'پہلے مہینے روز صبح یا شام پانی دیں اور بکریوں سے بچانے کے لیے کانٹوں کی باڑ لگائیں۔', 'جتنے درخت لگائے، وہ تعداد بھیجیں۔'],
        en: ['Choose a local tree: neem, ber, moringa (sohanjna) or desi kikar.', 'Ask an adult at home or school for a place to plant it.', 'Dig a hole one foot deep, put in the sapling and cover the roots with soil.', 'In the first month water it every morning or evening and put a thorny fence around it against goats.', 'Send the number of trees you planted.']
      }
    },
    bird: {
      emoji: '🐦', unit: '', min: 1, max: 50, step: 1, chapter: '/class-5/science/living-things',
      name: { sd: 'پکين کي ڏسو', ur: 'پرندے دیکھیں', en: 'Bird spotting' },
      short: { sd: 'ڪهڙا پکي، ڪيترا؟', ur: 'کون سے پرندے، کتنے؟', en: 'Which birds, how many?' },
      value: { sd: 'ڪيترا ڏٺا', ur: 'کتنے دیکھے', en: 'How many you saw' },
      steps: {
        sd: ['صبح جو سوير 10 منٽ لاءِ هڪ جاءِ تي خاموش ويهو.', 'هيٺ ڏنل لسٽ مان پکي سڃاڻو.', 'هر قسم جا پکي الڳ ڳڻيو. ساڳيو پکي ٻه ڀيرا نه ڳڻيو.', 'آکيرن کي هٿ نه لايو ۽ پکين کي نه ڊيڄاريو.', 'هر قسم لاءِ الڳ ماپ موڪليو.'],
        ur: ['صبح سویرے 10 منٹ کے لیے ایک جگہ خاموش بیٹھیں۔', 'نیچے دی گئی فہرست سے پرندے پہچانیں۔', 'ہر قسم کے پرندے الگ گنیں۔ ایک ہی پرندہ دو بار نہ گنیں۔', 'گھونسلوں کو ہاتھ نہ لگائیں اور پرندوں کو نہ ڈرائیں۔', 'ہر قسم کے لیے الگ پیمائش بھیجیں۔'],
        en: ['Early in the morning sit quietly in one place for 10 minutes.', 'Find the birds in the list below.', 'Count each kind of bird separately. Do not count the same bird twice.', 'Never touch nests or scare the birds.', 'Send one reading for each kind of bird.']
      }
    },
    temp: {
      emoji: '🌡️', unit: '°C', min: 0, max: 55, step: 0.5, chapter: '/class-5/science/water-cycle',
      name: { sd: 'روزانو گرمي پد', ur: 'روزانہ درجۂ حرارت', en: 'Daily temperature' },
      short: { sd: 'اڄ ڪيتري گرمي؟ (°C)', ur: 'آج کتنی گرمی؟ (°C)', en: 'How hot is it today? (°C)' },
      value: { sd: 'گرمي پد (°C)', ur: 'درجۂ حرارت (°C)', en: 'Temperature (°C)' },
      steps: {
        sd: ['هر روز ساڳئي وقت ماپيو، بهتر آهي منجهند 2 وڳي.', 'ٿرماميٽر ڇانو ۾ رکو، زمين کان اٽڪل 1 ميٽر مٿي، سج ۾ نه.', '5 منٽ پوءِ انگ پڙهو.', 'جيڪڏهن ٿرماميٽر ناهي ته فون جي موسم واري ايپ ۾ پنهنجي شهر جو گرمي پد ڏسو ۽ "فون" چونڊيو.', 'هفتي ۾ ڏسو: ڪهڙو ڏينهن سڀ کان گرم هو؟'],
        ur: ['ہر روز ایک ہی وقت ناپیں، بہتر ہے دوپہر 2 بجے۔', 'تھرمامیٹر سائے میں رکھیں، زمین سے تقریباً 1 میٹر اوپر، دھوپ میں نہیں۔', '5 منٹ بعد عدد پڑھیں۔', 'اگر تھرمامیٹر نہیں تو فون کی موسم والی ایپ میں اپنے شہر کا درجۂ حرارت دیکھیں اور "فون" چنیں۔', 'ہفتے میں دیکھیں: کون سا دن سب سے گرم تھا؟'],
        en: ['Measure at the same time every day, best at 2 pm.', 'Keep the thermometer in the shade, about 1 metre above the ground, not in the sun.', 'Read the number after 5 minutes.', "No thermometer? Look up your town in the phone's weather app and choose \"Phone\".", 'At the end of the week: which day was the hottest?']
      }
    }
  };

  // Common birds of Sindh (the database accepts only these ids).
  var BIRDS = [
    ['house_sparrow', 'جهرڪي', 'چڑیا', 'House sparrow'],
    ['house_crow', 'ڪانءُ', 'کوا', 'House crow'],
    ['common_myna', 'مينا', 'مینا', 'Common myna'],
    ['rock_pigeon', 'ڪبوتر', 'کبوتر', 'Pigeon'],
    ['rose_ringed_parakeet', 'طوطو', 'طوطا', 'Parakeet'],
    ['black_kite', 'چيل', 'چیل', 'Black kite'],
    ['red_vented_bulbul', 'بلبل', 'بلبل', 'Bulbul'],
    ['indian_peafowl', 'مور', 'مور', 'Peacock'],
    ['cattle_egret', 'اڇو بگلو', 'سفید بگلا', 'Cattle egret'],
    ['white_throated_kingfisher', 'مڇي مار پکي', 'کلکلیا (مچھیرا)', 'Kingfisher'],
    ['black_drongo', 'ڪوتوال', 'کوتوال', 'Black drongo'],
    ['hoopoe', 'هُد هُد', 'ہُدہُد', 'Hoopoe'],
    ['laughing_dove', 'گيرو', 'فاختہ', 'Dove'],
    ['house_swift', 'اٻابيل', 'ابابیل', 'Swift'],
    ['purple_sunbird', 'شڪر خورو', 'شکر خورا', 'Sunbird']
  ];

  // District positions on the map (longitude, latitude of the main town) — a simple sketch, not exact borders.
  var PLACES = {
    'Karachi': [67.05, 24.9], 'Hyderabad': [68.37, 25.39], 'Sukkur': [68.86, 27.7], 'Larkana': [68.21, 27.56],
    'Mirpurkhas': [69.01, 25.53], 'Shaheed Benazirabad': [68.41, 26.24], 'Jacobabad': [68.44, 28.28], 'Shikarpur': [68.64, 27.96],
    'Khairpur': [69.1, 27.05], 'Dadu': [67.72, 26.73], 'Thatta': [67.92, 24.75], 'Badin': [68.84, 24.66], 'Sanghar': [68.95, 26.05],
    'Umerkot': [69.74, 25.36], 'Tharparkar': [70.1, 24.75], 'Jamshoro': [67.6, 25.75], 'Ghotki': [69.32, 28.0], 'Kashmore': [69.58, 28.43],
    'Matiari': [68.45, 25.62], 'Naushahro Feroze': [68.12, 26.84], 'Kambar Shahdadkot': [67.75, 27.6], 'Tando Allahyar': [68.72, 25.46],
    'Tando Muhammad Khan': [68.54, 25.12], 'Sujawal': [68.15, 24.55]
  };
  var OUTLINE = [[68.0, 28.45], [68.9, 28.65], [69.6, 28.55], [69.95, 28.05], [70.5, 27.4], [70.1, 26.6], [70.6, 25.7], [71.1, 24.7], [70.75, 24.25],
    [70.0, 24.2], [69.0, 24.25], [68.7, 23.85], [68.2, 23.7], [67.5, 24.05], [67.2, 24.5], [66.7, 24.85], [66.65, 25.4], [67.15, 25.8], [67.3, 26.1],
    [67.4, 26.6], [67.15, 27.0], [67.3, 27.6], [67.7, 28.1]];
  var INDUS = [[69.6, 28.45], [69.0, 27.9], [68.86, 27.7], [68.3, 27.25], [68.0, 26.8], [67.95, 26.2], [68.2, 25.7], [68.37, 25.39], [68.2, 24.9], [67.8, 24.2]];

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
  function mine() { try { return JSON.parse(localStorage.getItem(MINE)) || {}; } catch (e) { return {}; } }
  function saveMine(o) { try { localStorage.setItem(MINE, JSON.stringify(o)); } catch (e) { /* storage blocked */ } }
  function districts() { return (window.CITIES || []).filter(function (c) { return PLACES[c.id]; }); }
  function districtName(id) { var c = (window.CITIES || []).filter(function (x) { return x.id === id; })[0]; return c ? L(c) : id; }
  function birdName(id) { var b = BIRDS.filter(function (x) { return x[0] === id; })[0]; return b ? b[LANGS.indexOf(lang()) + 1] : id; }
  function num(v) { return v == null ? '—' : String(Math.round(v * 10) / 10); }
  function karachiDay(offset) {
    var d = new Date(Date.now() + 5 * 3600 * 1000 - (offset || 0) * 86400000);   // Pakistan time, UTC+5
    return d.toISOString().slice(0, 10);
  }

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

  /* ---------- page ---------- */

  function render() {
    var p = PROJECTS[project], me = mine();
    var dist = districts().map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (me.district === c.id ? ' selected' : '') + '>' + esc(L(c)) + '</option>';
    }).join('');
    main.innerHTML =
      '<p class="crumbs"><a href="/">' + esc(T('siteName')) + '</a> › ' + esc(T('title')) + '</p>' +
      '<h1>🔬 ' + esc(T('title')) + '</h1><p>' + esc(T('intro')) + '</p>' +
      '<h2>' + esc(T('pick')) + '</h2><div class="cz-projects" role="group">' + Object.keys(PROJECTS).map(function (k) {
        var q = PROJECTS[k];
        return '<button type="button" class="cz-proj" data-proj="' + k + '" aria-pressed="' + (k === project) + '"><span class="em" aria-hidden="true">' + q.emoji + '</span>' +
          '<strong>' + esc(L(q.name)) + '</strong><small class="muted">' + esc(L(q.short)) + '</small></button>';
      }).join('') + '</div>' +
      '<section class="card"><h2>' + esc(T('how')) + ': ' + esc(L(p.name)) + '</h2><ol class="cz-steps">' +
        (p.steps[lang()] || p.steps.en).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<p><a class="btn ghost small" href="' + p.chapter + '">📖 ' + esc(T('chapter')) + '</a></p>' +
        '<p class="muted small">' + esc(T('safety')) + '</p></section>' +
      '<form class="card" id="cz-form" novalidate><h2>' + esc(T('send')) + '</h2><div class="cz-form">' +
        '<label class="field"><span>' + esc(T('nick')) + '</span><input name="nick" maxlength="20" autocomplete="off" value="' + esc(me.nick || '') + '"><small class="muted">' + esc(T('nickHelp')) + '</small></label>' +
        '<label class="field"><span>' + esc(T('district')) + '</span><select name="district"><option value="">' + esc(T('choose')) + '</option>' + dist + '</select></label>' +
        (project === 'bird' ? '<label class="field"><span>' + esc(T('species')) + '</span><select name="species"><option value="">' + esc(T('choose')) + '</option>' +
          BIRDS.map(function (b) { return '<option value="' + b[0] + '">' + esc(birdName(b[0])) + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="field"><span>' + esc(L(p.value)) + '</span><input name="value" type="number" inputmode="decimal" dir="ltr" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '"></label>' +
        (project === 'temp' ? '<div class="field"><span>' + esc(T('source')) + '</span><div class="cz-radio">' +
          '<label><input type="radio" name="source" value="thermometer"> ' + esc(T('srcThermo')) + '</label>' +
          '<label><input type="radio" name="source" value="phone"> ' + esc(T('srcPhone')) + '</label></div></div>' : '') +
        '<label class="field"><span>' + esc(T('date')) + '</span><input name="date" type="date" dir="ltr" value="' + karachiDay() + '" max="' + karachiDay() + '" min="' + karachiDay(30) + '"></label>' +
        '<label class="field"><span>' + esc(T('cls')) + '</span><input name="cls" maxlength="6" dir="ltr" autocapitalize="characters" autocomplete="off" spellcheck="false" value="' + esc(me.cls || '') + '"><small class="muted">' + esc(T('clsHelp')) + '</small></label>' +
        '<div class="full"><button type="submit" class="btn">' + esc(T('submit')) + '</button> <span class="form-msg" aria-live="polite"></span></div>' +
      '</div><p class="muted small">' + esc(T('privacy')) + '</p></form>' +
      '<section class="card" id="cz-results"><h2>' + esc(T('mapTitle')) + '</h2><p class="loading">' + esc(T('wait')) + '</p></section>';

    main.querySelectorAll('[data-proj]').forEach(function (b) {
      b.addEventListener('click', function () { project = b.getAttribute('data-proj'); keepForm(); render(); });
    });
    document.getElementById('cz-form').addEventListener('submit', submit);
    if (summary) drawResults(); else loadSummary();
  }

  // remember nickname, district and class code when switching projects
  function keepForm() {
    var f = document.getElementById('cz-form');
    if (f) saveMine({ nick: f.nick.value.trim(), district: f.district.value, cls: f.cls.value.trim().toUpperCase() });
  }

  function submit(e) {
    e.preventDefault();
    var f = e.target, msg = f.querySelector('.form-msg');
    var src = f.querySelector('input[name="source"]:checked');
    var args = {
      p_project: project, p_district: f.district.value, p_value: f.value.value === '' ? null : Number(f.value.value),
      p_date: f.date.value || null, p_nickname: f.nick.value.trim(),
      p_species: f.species ? f.species.value || null : null, p_source: src ? src.value : null,
      p_class: f.cls.value.replace(/\s+/g, '').toUpperCase() || null
    };
    if (!args.p_district) { msg.textContent = T('err_bad_district'); return; }
    if (args.p_value == null || isNaN(args.p_value)) { msg.textContent = T('err_bad_value'); return; }
    keepForm();
    msg.textContent = T('wait');
    rpc('citizen_add', args).then(function (r) {
      if (!r || r.error) { msg.textContent = T('err_' + ((r && r.error) || 'other')); return; }
      msg.textContent = '✅ ' + T('thanks');
      f.value.value = '';
      selected = args.p_district;
      summary = null;
      loadSummary();
    }).catch(function () { msg.textContent = T('err_other'); });
  }

  function loadSummary() {
    rpc('citizen_summary').then(function (d) { summary = d || { districts: [], birds: [], recent: [], total: 0 }; drawResults(); })
      .catch(function () {
        var box = document.getElementById('cz-results');
        if (box) box.innerHTML = '<h2>' + esc(T('mapTitle')) + '</h2><p class="form-msg">' + esc(T('loadErr')) + '</p>';
      });
  }

  /* ---------- map and table ---------- */

  var METRICS = [['entries', 'all'], ['rain_total', 'rainMm'], ['trees', 'trees'], ['birds', 'birds'], ['temp_avg', 'tempAvg']];
  function xy(p) { return [Math.round((p[0] - 66.5) * 78 + 8), Math.round((28.75 - p[1]) * 78 + 8)]; }

  function shade(v, max) {
    if (!v) return '#c9d6cb';
    var t = Math.max(0.15, Math.min(1, v / (max || 1)));
    var a = [200, 230, 201], b = [27, 94, 32];                 // light green → dark green
    return 'rgb(' + a.map(function (c, i) { return Math.round(c + (b[i] - c) * t); }).join(',') + ')';
  }

  function mapSvg(byD) {
    var vals = Object.keys(byD).map(function (k) { return byD[k][metric] || 0; });
    var max = Math.max.apply(null, vals.concat([0]));
    var land = OUTLINE.map(function (p) { return xy(p).join(','); }).join(' ');
    var river = INDUS.map(function (p) { return xy(p).join(','); }).join(' ');
    var dots = Object.keys(PLACES).map(function (id) {
      var p = xy(PLACES[id]), row = byD[id], v = row ? row[metric] : null;
      var label = districtName(id) + ': ' + (v == null ? '—' : num(v));
      return '<g><circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="' + shade(v, max) + '" data-d="' + esc(id) + '"' + (id === selected ? ' class="sel"' : '') + '>' +
        '<title>' + esc(label) + '</title></circle>' + (v ? '<text class="n" x="' + p[0] + '" y="' + (p[1] + 3) + '" text-anchor="middle">' + esc(num(v)) + '</text>' : '') + '</g>';
    }).join('');
    return '<svg class="cz-map" viewBox="0 0 390 420" role="img" aria-label="' + esc(T('mapTitle')) + '">' +
      '<rect class="sea" x="0" y="300" width="390" height="120"/>' +
      '<polygon class="land" points="' + land + '"/><polyline class="river" points="' + river + '"/>' + dots + '</svg>';
  }

  function drawResults() {
    var box = document.getElementById('cz-results');
    if (!box) return;
    var rows = summary.districts || [], byD = {};
    rows.forEach(function (r) { byD[r.district] = r; });
    var html = '<h2>' + esc(T('mapTitle')) + '</h2><p class="muted small">' + esc(T('mapHelp')) + '</p>' +
      '<div class="cz-tabs" role="group">' + METRICS.map(function (m) {
        return '<button type="button" class="chip" data-metric="' + m[0] + '" aria-pressed="' + (metric === m[0]) + '">' + esc(T(m[1])) + '</button>';
      }).join('') + '</div>' + mapSvg(byD) +
      (selected ? '<p class="center" aria-live="polite"><strong>📍 ' + esc(districtName(selected)) + '</strong>: ' +
        esc(num(byD[selected] ? byD[selected][metric] : null)) + ' (' + esc(T((METRICS.filter(function (m) { return m[0] === metric; })[0] || [])[1] || 'all')) + ')</p>' : '') +
      '<p class="cz-legend"><span><i style="background:#c9d6cb"></i>0</span><span><i style="background:rgb(176,213,178)"></i>' + esc(T('entries')) + ' ↑</span><span><i style="background:#1b5e20"></i>↑↑</span></p>' +
      '<p class="muted">' + esc(T('total', { n: summary.total || 0 })) + '</p>';
    if (!rows.length) html += '<p>' + esc(T('none')) + '</p>';
    else {
      html += '<div class="table-wrap"><table class="table cz-table"><thead><tr><th>' + esc(T('district')) + '</th><th>' + esc(T('entries')) + '</th><th>' + esc(T('rainMm')) +
        '</th><th>' + esc(T('trees')) + '</th><th>' + esc(T('birds')) + '</th><th>' + esc(T('tempAvg')) + '</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr' + (r.district === selected ? ' class="sel"' : '') + ' id="cz-row-' + esc(r.district.replace(/\s+/g, '-')) + '"><td><strong>' + esc(districtName(r.district)) + '</strong></td><td>' + r.entries + '</td><td>' + num(r.rain_total) +
            '</td><td>' + num(r.trees) + '</td><td>' + num(r.birds) + '</td><td>' + num(r.temp_avg) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    if ((summary.birds || []).length) {
      html += '<h3>' + esc(T('topBirds')) + '</h3><p>' + summary.birds.slice(0, 6).map(function (b) {
        return '<span class="chip">🐦 ' + esc(birdName(b.species)) + ' × ' + esc(num(b.count)) + '</span>';
      }).join(' ') + '</p>';
    }
    if ((summary.recent || []).length) {
      html += '<h3>' + esc(T('recent')) + '</h3><ul class="cz-recent">' + summary.recent.map(function (r) {
        var p = PROJECTS[r.project] || {};
        var what = r.project === 'bird' ? birdName(r.species) + ' × ' + num(r.value) :
          num(r.value) + (p.unit ? ' ' + p.unit : '') + (r.project === 'tree' ? ' ' + T('trees') : '') +
          (r.source ? ' (' + T(r.source === 'phone' ? 'srcPhone' : 'srcThermo') + ')' : '');
        return '<li>' + (p.emoji || '') + ' <strong>' + esc(r.nickname) + '</strong> · ' + esc(districtName(r.district)) + ' · ' + esc(what) +
          ' · <span class="ltr muted">' + esc(r.date) + '</span></li>';
      }).join('') + '</ul>';
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-metric]').forEach(function (b) {
      b.addEventListener('click', function () { metric = b.getAttribute('data-metric'); drawResults(); });
    });
    box.querySelectorAll('circle[data-d]').forEach(function (c) {
      c.addEventListener('click', function () {
        selected = c.getAttribute('data-d');
        var sel = document.querySelector('#cz-form select[name="district"]');
        if (sel) sel.value = selected;
        drawResults();
        var row = document.getElementById('cz-row-' + selected.replace(/\s+/g, '-'));
        if (row) row.scrollIntoView({ block: 'nearest' });
      });
    });
  }

  applyLang();
  render();
})();
