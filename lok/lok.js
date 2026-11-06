/* Sindh Science Learning Portal — "Folk Science of Sindh" (/lok/).
   Everyday things of Sindhi homes, the science behind each, a home experiment and the book chapter, in Sindhi, Urdu and English.
   To add a card, add it to CARDS below and draw its picture with tools/lesson-pictures/make_lok.py (lok/img/<id>.svg). */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };

  var CHAPTERS = {
    'living-things': { n: 1, sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' },
    microorganisms: { n: 2, sd: 'خوردبيني جاندار', ur: 'خورد بینی جاندار', en: 'Microorganisms' },
    matter: { n: 5, sd: 'مادو ۽ ان ۾ تبديليون', ur: 'مادہ اور اس میں تبدیلیاں', en: 'Matter and Its Changes' },
    'water-cycle': { n: 13, sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' }
  };

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    title: { sd: 'سنڌ جي لوڪ سائنس', ur: 'سندھ کی لوک سائنس', en: 'Folk Science of Sindh' },
    eyebrow: { sd: 'گهر گهر جي سائنس', ur: 'گھر گھر کی سائنس', en: 'Science in every home' },
    lead: {
      sd: 'سنڌ جي گهرن ۾ روز ڪم ايندڙ شين پويان به سائنس لڪل آهي. هر ڪارڊ پڙهو، گهر ۾ ننڍو تجربو ڪريو ۽ ڏسو ته اها ڳالهه ڪتاب جي ڪهڙي باب سان جڙيل آهي.',
      ur: 'سندھ کے گھروں میں روز کام آنے والی چیزوں کے پیچھے بھی سائنس چھپی ہے۔ ہر کارڈ پڑھیں، گھر میں چھوٹا سا تجربہ کریں اور دیکھیں کہ یہ بات کتاب کے کس باب سے جڑی ہے۔',
      en: 'Everyday things in Sindhi homes hide real science. Read each card, try the small home experiment, and see which chapter of the book it belongs to.'
    },
    science: { sd: 'ان پويان سائنس', ur: 'اس کے پیچھے سائنس', en: 'The science' },
    tryIt: { sd: 'گهر ۾ ڪري ڏسو', ur: 'گھر میں کر کے دیکھیں', en: 'Try it at home' },
    ask: { sd: 'وڏن کان پڇو', ur: 'بڑوں سے پوچھیں', en: 'Ask your elders' },
    inBook: { sd: 'ڪتاب ۾', ur: 'کتاب میں', en: 'In the book' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    safety: { sd: 'تجربو ڪنهن وڏي جي موجودگيءَ ۾ ڪريو.', ur: 'تجربہ کسی بڑے کی موجودگی میں کریں۔', en: 'Do the experiment with an adult nearby.' },
    shareTitle: { sd: 'پنهنجي ڳالهه موڪليو', ur: 'اپنی بات بھیجیں', en: 'Send your own' },
    shareLead: {
      sd: 'ڇا توهان جي ڏاڏي، ناني يا ڳوٺ ۾ ڪنهن کي ڪا اهڙي ڳالهه خبر آهي؟ هيٺ لکو ۽ پنهنجي استاد کي واٽس ايپ تي موڪليو. استاد چڪاسي سٺيون ڳالهيون هن صفحي تي شامل ڪرائيندو.',
      ur: 'کیا آپ کی دادی، نانی یا گاؤں میں کسی کو ایسی کوئی بات معلوم ہے؟ نیچے لکھیں اور اپنے استاد کو واٹس ایپ پر بھیجیں۔ استاد جانچ کر اچھی باتیں اس صفحے پر شامل کروائیں گے۔',
      en: 'Does your grandmother, grandfather or someone in your village know something like this? Write it below and send it to your teacher on WhatsApp. Your teacher checks it, and the best ones are added to this page.'
    },
    fName: { sd: 'توهان جو نالو', ur: 'آپ کا نام', en: 'Your name' },
    fDistrict: { sd: 'ضلعو', ur: 'ضلع', en: 'District' },
    fThing: { sd: 'ڪهڙي شيءِ يا ڳالهه؟', ur: 'کون سی چیز یا بات؟', en: 'Which thing or custom?' },
    fStory: { sd: 'وڏن ڇا ٻڌايو، ۽ توهان جي خيال ۾ ان پويان ڪهڙي سائنس آهي؟', ur: 'بڑوں نے کیا بتایا، اور آپ کے خیال میں اس کے پیچھے کون سی سائنس ہے؟', en: 'What did your elders say, and what science do you think is behind it?' },
    send: { sd: 'واٽس ايپ تي موڪليو', ur: 'واٹس ایپ پر بھیجیں', en: 'Send on WhatsApp' },
    msgHead: { sd: 'سنڌ جي لوڪ سائنس لاءِ منهنجي ڳالهه', ur: 'سندھ کی لوک سائنس کے لیے میری بات', en: 'My story for Folk Science of Sindh' },
    needStory: { sd: 'پهريان پنهنجي ڳالهه لکو.', ur: 'پہلے اپنی بات لکھیں۔', en: 'Please write your story first.' },
    print: { sd: 'ڇاپيو', ur: 'پرنٹ کریں', en: 'Print' }
  };

  var CARDS = [
    {
      id: 'matka', chapter: 'water-cycle',
      title: { sd: 'مٽڪو پاڻي ٿڌو ڇو رکي ٿو؟', ur: 'مٹکا پانی ٹھنڈا کیوں رکھتا ہے؟', en: 'Why does a matka keep water cool?' },
      text: {
        sd: 'مٽڪي جي مٽيءَ ۾ تمام ننڍا سوراخ هوندا آهن. پاڻي انهن مان آهستي آهستي ٻاهر سمي ٿو ۽ ٻاهرين پاسي کان ٻاڦ بڻجي اڏامي ٿو. ٻاڦ بڻجڻ لاءِ پاڻيءَ کي گرمي گهرجي، ۽ اها گرمي اهو مٽڪي ۽ اندر واري پاڻيءَ مان وٺي ٿو، تنهنڪري پاڻي ٿڌو ٿي وڃي ٿو. انهيءَ کي ٻاڦ بڻجڻ (evaporation) چئجي ٿو.',
        ur: 'مٹکے کی مٹی میں بہت چھوٹے سوراخ ہوتے ہیں۔ پانی ان سے آہستہ آہستہ باہر رستا ہے اور باہر کی سطح سے بخارات بن کر اڑ جاتا ہے۔ بخارات بننے کے لیے پانی کو حرارت چاہیے، اور یہ حرارت وہ مٹکے اور اندر کے پانی سے لیتا ہے، اس لیے پانی ٹھنڈا ہو جاتا ہے۔ اسے تبخیر (evaporation) کہتے ہیں۔',
        en: 'The clay of a matka has tiny holes. Water slowly seeps through them and evaporates from the outside. To evaporate, water needs heat, and it takes that heat from the pot and the water inside, so the water gets cooler. This is called evaporation.'
      },
      steps: {
        sd: ['ٻه هڪجهڙا گلاس پاڻيءَ سان ڀريو.', 'هڪ گلاس جي چوڌاري آلو ڪپڙو ويڙهيو، ٻئي کي ائين ئي ڇڏيو.', 'ٻنهي کي هوادار ڇانوَ ۾ اڌ ڪلاڪ رکو.', 'هٿ لائي ڏسو: آلي ڪپڙي وارو پاڻي وڌيڪ ٿڌو هوندو.'],
        ur: ['دو ایک جیسے گلاس پانی سے بھریں۔', 'ایک گلاس کے گرد گیلا کپڑا لپیٹیں، دوسرے کو ویسے ہی چھوڑ دیں۔', 'دونوں کو ہوادار سائے میں آدھا گھنٹہ رکھیں۔', 'چھو کر دیکھیں: گیلے کپڑے والا پانی زیادہ ٹھنڈا ہوگا۔'],
        en: ['Fill two glasses of the same kind with water.', 'Wrap a wet cloth around one glass and leave the other bare.', 'Keep both in an airy, shady place for half an hour.', 'Touch them: the water in the glass with the wet cloth is cooler.']
      },
      ask: { sd: 'ناني يا ڏاڏيءَ کان پڇو: نئين مٽڪي کي ڪم آڻڻ کان اڳ پاڻيءَ ۾ ڇو ٻوڙيندا آهن؟', ur: 'نانی یا دادی سے پوچھیں: نئے مٹکے کو استعمال سے پہلے پانی میں کیوں بھگوتے ہیں؟', en: 'Ask your grandmother: why is a new matka soaked in water before it is used?' }
    },
    {
      id: 'ralli', chapter: 'matter',
      title: { sd: 'رلي اسان کي گرم ڪيئن رکي ٿي؟', ur: 'رلی ہمیں گرم کیسے رکھتی ہے؟', en: 'How does a ralli keep us warm?' },
      text: {
        sd: 'رلي ڪپڙي جي ڪيترين تهن کي سبي ٺاهي ويندي آهي. هر ٻن تهن جي وچ ۾ هوا قيد ٿي وڃي ٿي. بيٺل هوا گرمي کي آسانيءَ سان اڳتي نٿي وڌائي، تنهنڪري اسان جي جسم جي گرمي ٻاهر نٿي نڪري. هوا به مادو آهي ۽ جاءِ والاري ٿي.',
        ur: 'رلی کپڑے کی کئی تہوں کو سی کر بنائی جاتی ہے۔ ہر دو تہوں کے درمیان ہوا قید ہو جاتی ہے۔ رکی ہوئی ہوا حرارت کو آسانی سے آگے نہیں بڑھاتی، اس لیے ہمارے جسم کی گرمی باہر نہیں نکلتی۔ ہوا بھی مادہ ہے اور جگہ گھیرتی ہے۔',
        en: 'A ralli is made by sewing many layers of cloth together. Air gets trapped between the layers. Still air does not pass heat on easily, so the warmth of our body stays in. Air is matter too, and it takes up space.'
      },
      steps: {
        sd: ['ٻه بوتلون ڪوسي (گهڻي گرم نه) پاڻيءَ سان ڀريو.', 'هڪ بوتل کي ٽي چار ڪپڙا ويڙهيو، ٻي کي اگهاڙو ڇڏيو.', 'ويهن منٽن کانپوءِ ٻنهي کي هٿ لائي ڏسو.', 'ڪپڙن ۾ ويڙهيل بوتل وڌيڪ گرم رهندي.'],
        ur: ['دو بوتلیں نیم گرم (زیادہ گرم نہیں) پانی سے بھریں۔', 'ایک بوتل پر تین چار کپڑے لپیٹیں، دوسری کو کھلا چھوڑ دیں۔', 'بیس منٹ بعد دونوں کو چھو کر دیکھیں۔', 'کپڑوں میں لپٹی بوتل زیادہ گرم رہے گی۔'],
        en: ['Fill two bottles with warm (not hot) water.', 'Wrap one bottle in three or four cloths and leave the other bare.', 'After twenty minutes, touch both.', 'The wrapped bottle stays warmer.']
      },
      ask: { sd: 'گهر جي وڏن کان پڇو: رلي جا رنگ ۽ نمونا ڪيئن چونڊيا ويندا آهن؟', ur: 'گھر کے بڑوں سے پوچھیں: رلی کے رنگ اور نمونے کیسے چنے جاتے ہیں؟', en: 'Ask the elders at home: how are the colours and patterns of a ralli chosen?' }
    },
    {
      id: 'mangh', chapter: 'matter',
      title: { sd: 'حيدرآباد جا منگهه: ڇت تي هوا پڪڙيندڙ', ur: 'حیدرآباد کے منگھ: چھت پر ہوا پکڑنے والے', en: 'The manghs of Hyderabad: catching the wind' },
      text: {
        sd: 'پراڻي حيدرآباد جي گهرن جي ڇتين تي منگهه ٺهيل هوندا هئا. انهن جو منهن سمنڊ کان ايندڙ ٿڌي هوا ڏانهن هوندو آهي. منگهه هوا کي پڪڙي هيٺ ڪمرن ۾ آڻي ٿو، ۽ گرم هوا مٿي نڪري وڃي ٿي، ڇاڪاڻ ته گرم هوا هلڪي ٿيندي آهي. ائين بجليءَ کانسواءِ به گهر ٿڌا رهندا هئا.',
        ur: 'پرانے حیدرآباد کے گھروں کی چھتوں پر منگھ بنے ہوتے تھے۔ ان کا منہ سمندر سے آنے والی ٹھنڈی ہوا کی طرف ہوتا ہے۔ منگھ ہوا کو پکڑ کر نیچے کمروں میں لاتا ہے، اور گرم ہوا اوپر نکل جاتی ہے کیونکہ گرم ہوا ہلکی ہوتی ہے۔ یوں بجلی کے بغیر بھی گھر ٹھنڈے رہتے تھے۔',
        en: 'Old houses in Hyderabad had manghs (wind catchers) on their roofs. They face the cool wind that blows in from the sea. The mangh catches the wind and sends it down into the rooms, while warm air goes out at the top, because warm air is lighter. So houses stayed cool even without electricity.'
      },
      steps: {
        sd: ['ڪارڊ جي ننڍي ڊٻي ۾ ٻه سوراخ ڪريو: هڪ مٿي، ۽ هڪ هيٺ پاسي کان.', 'مٿي واري سوراخ تي ڪاغذ جو ڀونگو لڳايو، جنهن جو منهن پکي ڏانهن هجي.', 'پکو هلايو ۽ هيٺ واري سوراخ وٽ هٿ رکو.', 'توهان کي هٿ تي هوا محسوس ٿيندي.'],
        ur: ['گتے کے چھوٹے ڈبے میں دو سوراخ کریں: ایک اوپر، اور ایک نیچے کی طرف سے۔', 'اوپر کے سوراخ پر کاغذ کی قیف لگائیں جس کا منہ پنکھے کی طرف ہو۔', 'پنکھا چلائیں اور نیچے کے سوراخ کے پاس ہاتھ رکھیں۔', 'آپ کو ہاتھ پر ہوا محسوس ہوگی۔'],
        en: ['Make two holes in a small cardboard box: one on top, and one low on a side.', 'Fix a paper funnel over the top hole, facing a fan.', 'Turn on the fan and hold your hand near the low hole.', 'You will feel the air on your hand.']
      },
      ask: { sd: 'حيدرآباد جي ڪنهن وڏي کان پڇو: اونهاري جي رات منگهه هيٺان سمهڻ ڪيئن لڳندو هو؟', ur: 'حیدرآباد کے کسی بڑے سے پوچھیں: گرمیوں کی رات منگھ کے نیچے سونا کیسا لگتا تھا؟', en: 'Ask an elder from Hyderabad: what was it like to sleep under a mangh on a summer night?' }
    },
    {
      id: 'camel', chapter: 'living-things',
      title: { sd: 'ٿر جو اٺ گهٽ پاڻيءَ تي ڪيئن جيئي ٿو؟', ur: 'تھر کا اونٹ کم پانی پر کیسے زندہ رہتا ہے؟', en: 'How does the camel of Thar live on little water?' },
      text: {
        sd: 'اٺ هڪ ئي ڀيري تمام گهڻو پاڻي پي سگهي ٿو ۽ پوءِ ڪيترائي ڏينهن پاڻيءَ کانسواءِ گذاري سگهي ٿو. ان جي ڪوهان ۾ پاڻي نه، پر چرٻي هوندي آهي، جيڪا کاڌي جي ذخيري جو ڪم ڏئي ٿي. ان جا ڊگها پنبڻ ۽ بند ٿيندڙ نڪ واريءَ کان بچائين ٿا، ۽ ويڪرا پير گرم واريءَ ۾ نٿا ڌسن. هر جاندار وٽ پنهنجي ماحول ۾ رهڻ لاءِ اهڙيون خاصيتون هونديون آهن.',
        ur: 'اونٹ ایک ہی بار میں بہت زیادہ پانی پی سکتا ہے اور پھر کئی دن پانی کے بغیر گزار سکتا ہے۔ اس کے کوہان میں پانی نہیں بلکہ چربی ہوتی ہے، جو خوراک کے ذخیرے کا کام دیتی ہے۔ اس کی لمبی پلکیں اور بند ہونے والے نتھنے ریت سے بچاتے ہیں، اور چوڑے پاؤں گرم ریت میں نہیں دھنستے۔ ہر جاندار کے پاس اپنے ماحول میں رہنے کے لیے ایسی خصوصیات ہوتی ہیں۔',
        en: 'A camel can drink a huge amount of water at once and then go many days without water. Its hump holds fat, not water, which works as a food store. Long eyelashes and nostrils that close keep out the sand, and wide feet do not sink into hot sand. Every living thing has features like these that help it live where it lives.'
      },
      steps: {
        sd: ['ٿالهيءَ ۾ واري يا سڪل مٽي وجهو.', 'پهريان هڪ آڱر سان دٻايو، پوءِ سڄي هٿ جي تري سان.', 'ڏسو ته ڪهڙو نشان وڌيڪ اونهو آهي.', 'ويڪرو پير واريءَ ۾ گهٽ ڌسي ٿو، بلڪل اٺ جي پير وانگر.'],
        ur: ['تھالی میں ریت یا سوکھی مٹی ڈالیں۔', 'پہلے ایک انگلی سے دبائیں، پھر پوری ہتھیلی سے۔', 'دیکھیں کون سا نشان زیادہ گہرا ہے۔', 'چوڑا پاؤں ریت میں کم دھنستا ہے، بالکل اونٹ کے پاؤں کی طرح۔'],
        en: ['Put sand or dry soil in a tray.', 'Press it first with one finger, then with your whole palm.', 'See which mark is deeper.', 'A wide foot sinks less into sand, just like a camel’s foot.']
      },
      ask: { sd: 'ٿر جي ڪنهن ماڻهوءَ کان پڇو: ڏڪار ۾ ماڻهو ۽ جانور پاڻي ڪيئن بچائيندا آهن؟', ur: 'تھر کے کسی شخص سے پوچھیں: قحط میں لوگ اور جانور پانی کیسے بچاتے ہیں؟', en: 'Ask someone from Thar: how do people and animals save water in a drought?' }
    },
    {
      id: 'salt', chapter: 'matter',
      title: { sd: 'سمنڊ جي پاڻيءَ مان لوڻ ڪيئن ٺهي ٿو؟', ur: 'سمندر کے پانی سے نمک کیسے بنتا ہے؟', en: 'How is salt made from sea water?' },
      text: {
        sd: 'سنڌ جي سامونڊي ڪناري ۽ بدين جي ڀرسان ماڻهو سمنڊ جو پاڻي ننڍين ڪيارين ۾ ڀريندا آهن. سج جي گرميءَ سان پاڻي ٻاڦ بڻجي اڏامي وڃي ٿو، ۽ پاڻيءَ ۾ گهليل لوڻ اڇن ڪڻن جي صورت ۾ پٺيان رهجي وڃي ٿو. هيءَ طبعي تبديلي آهي، ڇاڪاڻ ته ڪو نئون مادو نٿو ٺهي.',
        ur: 'سندھ کے ساحل اور بدین کے قریب لوگ سمندر کا پانی چھوٹی کیاریوں میں بھرتے ہیں۔ سورج کی گرمی سے پانی بخارات بن کر اڑ جاتا ہے، اور پانی میں گھلا ہوا نمک سفید ذرّوں کی صورت میں پیچھے رہ جاتا ہے۔ یہ طبعی تبدیلی ہے، کیونکہ کوئی نیا مادہ نہیں بنتا۔',
        en: 'On the coast of Sindh and near Badin, people let sea water into small shallow beds. The heat of the sun makes the water evaporate, and the salt that was dissolved in it is left behind as white crystals. This is a physical change, because no new substance is made.'
      },
      steps: {
        sd: ['هڪ پيالي پاڻيءَ ۾ ٻه چمچا لوڻ گهوليو.', 'ان مان ٿورو پاڻي هڪ ڪاري پليٽ ۾ وجهو.', 'پليٽ کي ٻن ٽن ڏينهن لاءِ اُس ۾ رکو.', 'پاڻي سڪي ويندو ۽ پليٽ تي لوڻ جا چمڪندڙ ڪڻا رهجي ويندا.'],
        ur: ['ایک پیالی پانی میں دو چمچ نمک گھولیں۔', 'اس میں سے تھوڑا پانی ایک کالی پلیٹ میں ڈالیں۔', 'پلیٹ کو دو تین دن دھوپ میں رکھیں۔', 'پانی سوکھ جائے گا اور پلیٹ پر نمک کے چمکتے ذرّے رہ جائیں گے۔'],
        en: ['Stir two spoons of salt into a cup of water.', 'Pour a little of it onto a dark plate.', 'Leave the plate in the sun for two or three days.', 'The water dries up, and shiny salt crystals are left on the plate.']
      },
      ask: { sd: 'وڏن کان پڇو: اڳي ماڻهو کاڌي کي لوڻ سان خراب ٿيڻ کان ڪيئن بچائيندا هئا؟', ur: 'بڑوں سے پوچھیں: پہلے لوگ کھانے کو نمک سے خراب ہونے سے کیسے بچاتے تھے؟', en: 'Ask your elders: how did people use salt to keep food from spoiling?' }
    },
    {
      id: 'palla', chapter: 'living-things',
      title: { sd: 'پلو مڇي سنڌو درياءَ ۾ ڇو ايندي آهي؟', ur: 'پلا مچھلی دریائے سندھ میں کیوں آتی ہے؟', en: 'Why does the palla fish come up the Indus?' },
      text: {
        sd: 'پلو مڇي گهڻو وقت سمنڊ ۾ رهي ٿي، پر آنا ڏيڻ لاءِ مٺي پاڻيءَ ۾ اچي ٿي. مون سون جي موسم ۾ اها سمنڊ مان سنڌو درياءَ ۾ مٿي ترندي اچي ٿي. آنن مان نڪتل ننڍيون مڇيون ٻيهر سمنڊ ڏانهن وڃن ٿيون. جيڪڏهن درياءَ ۾ پاڻي گهٽ هجي يا رستو بند هجي ته پلو گهٽ ملي ٿي. جاندار پنهنجي جهڙا ٻچا پيدا ڪن ٿا، ۽ ان لاءِ کين صحيح جاءِ گهرجي.',
        ur: 'پلا مچھلی زیادہ وقت سمندر میں رہتی ہے، مگر انڈے دینے کے لیے میٹھے پانی میں آتی ہے۔ مون سون کے موسم میں یہ سمندر سے دریائے سندھ میں اوپر کی طرف تیرتی آتی ہے۔ انڈوں سے نکلی چھوٹی مچھلیاں واپس سمندر کی طرف جاتی ہیں۔ اگر دریا میں پانی کم ہو یا راستہ بند ہو تو پلا کم ملتی ہے۔ جاندار اپنے جیسے بچے پیدا کرتے ہیں، اور اس کے لیے انہیں صحیح جگہ چاہیے۔',
        en: 'The palla fish spends most of its life in the sea, but swims into fresh water to lay its eggs. In the monsoon season it swims from the sea up the River Indus. The young fish that hatch go back down to the sea. When the river has little water or the way is blocked, there are fewer palla. Living things make young ones like themselves, and they need the right place to do it.'
      },
      steps: {
        sd: ['ڪاغذ تي سمنڊ ۽ سنڌو درياءَ جو نقشو ٺاهيو.', 'تيرن سان پلي جو رستو ڏيکاريو: سمنڊ کان درياءَ ڏانهن، ۽ ننڍين مڇين جو واپسي وارو رستو.', 'بئراج جي جاءِ تي هڪ ليڪ ڪڍو ۽ سوچيو ته مڇيءَ کي ڪهڙي ڏکيائي ٿيندي.'],
        ur: ['کاغذ پر سمندر اور دریائے سندھ کا نقشہ بنائیں۔', 'تیروں سے پلا کا راستہ دکھائیں: سمندر سے دریا کی طرف، اور چھوٹی مچھلیوں کا واپسی کا راستہ۔', 'بیراج کی جگہ ایک لکیر کھینچیں اور سوچیں کہ مچھلی کو کیا مشکل ہوگی۔'],
        en: ['Draw the sea and the River Indus on paper.', 'With arrows, show the palla’s journey from the sea up the river, and the young fish going back.', 'Draw a line where a barrage is, and think about what problem it makes for the fish.']
      },
      ask: { sd: 'ڪنهن ميربحر يا وڏي کان پڇو: اڳي پلو وڌيڪ ڇو ملندي هئي؟', ur: 'کسی ماہی گیر یا بڑے سے پوچھیں: پہلے پلا زیادہ کیوں ملتی تھی؟', en: 'Ask a fisher or an elder: why was there more palla in the past?' }
    },
    {
      id: 'dahi', chapter: 'microorganisms',
      title: { sd: 'کير مان ڏهي ڪيئن ٺهي ٿو؟', ur: 'دودھ سے دہی کیسے بنتا ہے؟', en: 'How does milk become dahi?' },
      text: {
        sd: 'ڪوسي کير ۾ ٿورو پراڻو ڏهي (جاڳ) ملايو ويندو آهي. ان ۾ ڪارائتا بيڪٽيريا هوندا آهن، جيڪي ڪوسي ماحول ۾ تيزيءَ سان وڌن ٿا ۽ کير جي کنڊ کي کٽي شيءِ ۾ بدلائين ٿا. ان سان کير ڳاڙهو ٿي ڏهي بڻجي وڃي ٿو. هيءَ ڪيميائي تبديلي آهي، ڇاڪاڻ ته نئون مادو ٺهي ٿو ۽ ڏهي ٻيهر کير نٿو بڻجي سگهي.',
        ur: 'نیم گرم دودھ میں تھوڑا سا پرانا دہی (جاگ) ملایا جاتا ہے۔ اس میں مفید بیکٹیریا ہوتے ہیں، جو گرم ماحول میں تیزی سے بڑھتے ہیں اور دودھ کی شکر کو کھٹی چیز میں بدل دیتے ہیں۔ اس سے دودھ گاڑھا ہو کر دہی بن جاتا ہے۔ یہ کیمیائی تبدیلی ہے، کیونکہ نیا مادہ بنتا ہے اور دہی دوبارہ دودھ نہیں بن سکتا۔',
        en: 'A little old dahi (the starter, jaag) is mixed into warm milk. It holds useful bacteria that grow fast in the warmth and turn the sugar in milk into something sour. This makes the milk thick, and it becomes dahi. It is a chemical change, because a new substance is made and dahi cannot turn back into milk.'
      },
      steps: {
        sd: ['ٻن پيالن ۾ ڪوسو کير وجهو.', 'هڪ ۾ هڪ چمچو ڏهي ملايو، ٻئي ۾ نه.', 'ٻنهي کي ڍڪي رات ڀر ڪنهن گرم جاءِ تي رکو.', 'صبح ڏسو: جاڳ وارو کير ڏهي بڻجي ويو هوندو.'],
        ur: ['دو پیالوں میں نیم گرم دودھ ڈالیں۔', 'ایک میں ایک چمچ دہی ملائیں، دوسرے میں نہیں۔', 'دونوں کو ڈھک کر رات بھر کسی گرم جگہ پر رکھیں۔', 'صبح دیکھیں: جاگ والا دودھ دہی بن چکا ہوگا۔'],
        en: ['Pour warm milk into two bowls.', 'Stir a spoon of dahi into one, and nothing into the other.', 'Cover both and keep them somewhere warm overnight.', 'In the morning, the milk with the starter has become dahi.']
      },
      ask: { sd: 'امڙ کان پڇو: سياري ۾ ڏهي ڄمڻ ۾ وڌيڪ وقت ڇو لڳندو آهي؟', ur: 'امی سے پوچھیں: سردیوں میں دہی جمنے میں زیادہ وقت کیوں لگتا ہے؟', en: 'Ask your mother: why does dahi take longer to set in winter?' }
    },
    {
      id: 'ajrak', chapter: 'matter',
      title: { sd: 'اجرڪ جا رنگ پڪا ڪيئن ٿين ٿا؟', ur: 'اجرک کے رنگ پکے کیسے ہوتے ہیں؟', en: 'How do the colours of ajrak become fast?' },
      text: {
        sd: 'اجرڪ ٺاهيندڙ ڪاريگر ڪپڙي تي ڪاٺ جي ٺپن سان نمونا لڳائين ٿا. ڳاڙهي رنگ لاءِ ڦٽڪي ۽ ٻوٽن مان ٺهيل رنگ، ۽ نيري رنگ لاءِ نير جو ٻوٽو ڪم آڻين ٿا. ڦٽڪي رنگ کي ڪپڙي جي ڌاڳن سان جوڙي ٿي، تنهنڪري رنگ ڌوئڻ سان نٿو لهي. هتي ڪيميائي تبديلي ٿئي ٿي: رنگ ۽ ڪپڙو ملي هڪ نئين شيءِ بڻجن ٿا.',
        ur: 'اجرک بنانے والے کاریگر کپڑے پر لکڑی کے ٹھپوں سے نمونے لگاتے ہیں۔ سرخ رنگ کے لیے پھٹکری اور پودوں سے بنے رنگ، اور نیلے رنگ کے لیے نیل کا پودا استعمال کرتے ہیں۔ پھٹکری رنگ کو کپڑے کے دھاگوں سے جوڑ دیتی ہے، اس لیے رنگ دھونے سے نہیں اترتا۔ یہاں کیمیائی تبدیلی ہوتی ہے: رنگ اور کپڑا مل کر ایک نئی چیز بن جاتے ہیں۔',
        en: 'Ajrak makers print patterns on cloth with carved wooden blocks. For red they use alum and dyes made from plants, and for blue the indigo plant. Alum joins the dye to the threads of the cloth, so the colour does not wash out. A chemical change happens here: dye and cloth join to make something new.'
      },
      steps: {
        sd: ['اڇي ڪپڙي تي هلديءَ جي پاڻيءَ سان پيلو نشان ٺاهيو ۽ سڪڻ ڏيو.', 'نشان تي صابڻ وارو پاڻي لڳايو.', 'ڏسو: پيلو رنگ ڳاڙهو ٿي ويندو.', 'هاڻي ان تي ليمي جو رس لڳايو: ڇا پيلو رنگ واپس اچي ٿو؟'],
        ur: ['سفید کپڑے پر ہلدی کے پانی سے پیلا نشان بنائیں اور سوکھنے دیں۔', 'نشان پر صابن والا پانی لگائیں۔', 'دیکھیں: پیلا رنگ سرخ ہو جائے گا۔', 'اب اس پر لیموں کا رس لگائیں: کیا پیلا رنگ واپس آتا ہے؟'],
        en: ['Make a yellow mark on white cloth with turmeric water and let it dry.', 'Dab soapy water on the mark.', 'Watch: the yellow turns red.', 'Now dab lemon juice on it: does the yellow come back?']
      },
      ask: { sd: 'ڪنهن اجرڪ ٺاهيندڙ يا وڏي کان پڇو: هڪ اجرڪ ڪيترا ڀيرا ڌوئي ۽ رنگي ويندي آهي؟', ur: 'کسی اجرک بنانے والے یا بڑے سے پوچھیں: ایک اجرک کتنی بار دھوئی اور رنگی جاتی ہے؟', en: 'Ask an ajrak maker or an elder: how many times is one ajrak washed and dyed?' }
    }
  ];

  var main = document.getElementById('main');
  var state = { lang: 'sd' };
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
    var s = L(T[key]);
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
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
  function card(c) {
    var ch = CHAPTERS[c.chapter];
    return '<article class="card lk-card" id="' + c.id + '">' +
      '<img class="lk-pic" src="/lok/img/' + c.id + '.svg" alt="" width="640" height="400" loading="lazy" decoding="async">' +
      '<h2>' + esc(L(c.title)) + '</h2>' +
      '<p class="lk-label">' + esc(t('science')) + '</p><p>' + esc(L(c.text)) + '</p>' +
      '<div class="lk-try"><p class="lk-label">' + esc(t('tryIt')) + '</p><ol>' +
        L(c.steps).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<p class="small muted">' + esc(t('safety')) + '</p></div>' +
      '<div class="lk-ask"><p class="lk-label">' + esc(t('ask')) + '</p><p>' + esc(L(c.ask)) + '</p></div>' +
      '<a class="lk-chap" href="/class-5/science/' + c.chapter + '"><span class="lk-label">' + esc(t('inBook')) + '</span> ' +
        esc(t('chapterN', { n: ch.n })) + ': ' + esc(L(ch)) + '</a>' +
    '</article>';
  }
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="lk-hero"><div class="lk-band" aria-hidden="true"></div><div class="lk-hero-in">' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p>' +
        '<ul class="lk-jump no-print">' + CARDS.map(function (c) { return '<li><a href="#' + c.id + '">' + esc(L(c.title)) + '</a></li>'; }).join('') + '</ul>' +
      '</div></section>' +
      '<div class="lk-grid">' + CARDS.map(card).join('') + '</div>' +
      '<section class="card lk-share no-print" id="share"><h2>' + esc(t('shareTitle')) + '</h2><p>' + esc(t('shareLead')) + '</p>' +
        '<form class="lk-form">' +
          '<label>' + esc(t('fName')) + '<input name="name" maxlength="60" autocomplete="off"></label>' +
          '<label>' + esc(t('fDistrict')) + '<input name="district" maxlength="40" autocomplete="off"></label>' +
          '<label class="wide">' + esc(t('fThing')) + '<input name="thing" maxlength="80" autocomplete="off"></label>' +
          '<label class="wide">' + esc(t('fStory')) + '<textarea name="story" rows="5" maxlength="1200"></textarea></label>' +
          '<p class="lk-msg wide" aria-live="polite"></p>' +
          '<button type="submit" class="btn wide">' + esc(t('send')) + '</button>' +
        '</form></section>';
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
  // The story goes to the child's own teacher through WhatsApp; nothing is sent to the site.
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('.lk-form');
    if (!f) return;
    e.preventDefault();
    var v = function (n) { return f.elements[n].value.trim(); };
    if (!v('story')) { f.querySelector('.lk-msg').textContent = t('needStory'); return; }
    var text = t('msgHead') + '\n' + [v('name'), v('district')].filter(Boolean).join(' · ') + '\n' + (v('thing') ? v('thing') + '\n' : '') + v('story') + '\n' + location.origin + '/lok/';
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  applyLang();
  render();
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
