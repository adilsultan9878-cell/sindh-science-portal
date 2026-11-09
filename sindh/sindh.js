/* Sindh Science Learning Portal — "Science in Sindh" (/sindh/).
   Twelve places of Sindh on a simple map, each tied to a Class 5 Science chapter, in Sindhi, Urdu and English.
   To add or change a place, edit PLACES below: lon/lat put its number on the map, chapter links it to the book. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };

  // Chapter numbers and titles as in /data/class-5/science (links go to /class-5/science/<id>).
  var CHAPTERS = {
    'living-things': { n: 1, sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' },
    seeds: { n: 3, sd: 'ٻج: بناوت ۽ ڦٽڻ', ur: 'بیج: ساخت اور اگنا', en: 'Seeds: Structure and Germination' },
    pollution: { n: 4, sd: 'ماحولياتي آلودگي', ur: 'ماحولیاتی آلودگی', en: 'Environmental Pollution' },
    matter: { n: 5, sd: 'مادو ۽ ان ۾ تبديليون', ur: 'مادہ اور اس میں تبدیلیاں', en: 'Matter and Its Changes' },
    'force-machines': { n: 6, sd: 'قوت ۽ سادا مشينون', ur: 'قوت اور سادہ مشینیں', en: 'Force and Simple Machines' },
    'light-sound': { n: 7, sd: 'روشني ۽ آواز', ur: 'روشنی اور آواز', en: 'Light and Sound' },
    'electricity-magnets': { n: 8, sd: 'بجلي ۽ مقناطيس', ur: 'بجلی اور مقناطیس', en: 'Electricity and Magnets' },
    soils: { n: 9, sd: 'مٽي', ur: 'مٹی', en: 'Soils' },
    'earth-space': { n: 10, sd: 'زمين ۽ خلا', ur: 'زمین اور خلا', en: 'Earth and Space' },
    plants: { n: 11, sd: 'ٻوٽا: حصا ۽ کاڌو ٺاهڻ', ur: 'پودے: حصے اور غذا بنانا', en: 'Plants: Parts and Making Food' },
    'water-cycle': { n: 13, sd: 'پاڻي ۽ پاڻيءَ جو چڪر', ur: 'پانی اور آبی چکر', en: 'Water and the Water Cycle' }
  };

  var PLACES = [
    {
      id: 'indus', icon: 'river', lon: 68.17, lat: 25.85, chapter: 'water-cycle',
      name: { sd: 'سنڌو درياءُ', ur: 'دریائے سندھ', en: 'The River Indus' },
      where: { sd: 'اتر کان ڏکڻ تائين سڄي سنڌ مان وهي ٿو', ur: 'شمال سے جنوب تک پورے سندھ سے گزرتا ہے', en: 'Flows through all of Sindh, from north to south' },
      text: {
        sd: 'سنڌو درياءُ سنڌ جي زندگي آهي. اهو تبت جي برفاني جبلن مان نڪري ٿو ۽ لڳ ڀڳ 3,000 ڪلوميٽر وهي عربي سمنڊ ۾ ڇوڙ ڪري ٿو. اونهاري ۾ ڳرندڙ برف ۽ مون سون جو مينهن ان کي پاڻيءَ سان ڀري ڇڏين ٿا. واهه اهو پاڻي ٻنين تائين پهچائين ٿا ۽ شهرن کي پيئڻ جو پاڻي به ان مان ملي ٿو.',
        ur: 'دریائے سندھ، سندھ کی زندگی ہے۔ یہ تبت کے برفانی پہاڑوں سے نکلتا ہے اور تقریباً 3,000 کلومیٹر بہہ کر بحیرۂ عرب میں گرتا ہے۔ گرمیوں میں پگھلتی برف اور مون سون کی بارش اسے پانی سے بھر دیتی ہیں۔ نہریں یہ پانی کھیتوں تک لے جاتی ہیں اور شہروں کو پینے کا پانی بھی اسی سے ملتا ہے۔',
        en: 'The Indus is the lifeline of Sindh. It starts in the snowy mountains of Tibet and flows about 3,000 km to the Arabian Sea. In summer, melting snow and monsoon rain fill it with water. Canals take this water to the farms, and towns get their drinking water from it too.'
      },
      think: {
        sd: 'سنڌو درياءَ جو پاڻي ڪٿان اچي ٿو؟ جبلن کان سمنڊ تائين ان جي سفر جي تصوير ٺاهيو.',
        ur: 'دریائے سندھ کا پانی کہاں سے آتا ہے؟ پہاڑوں سے سمندر تک اس کے سفر کی تصویر بنائیں۔',
        en: 'Where does the water of the Indus come from? Draw its journey from the mountains to the sea.'
      }
    },
    {
      id: 'dolphin', icon: 'sound', lon: 69.25, lat: 28.05, chapter: 'light-sound',
      name: { sd: 'سنڌو درياءَ جي ڊولفن (ٻلڻ)', ur: 'دریائے سندھ کی ڈولفن (بُلھن)', en: 'Indus river dolphin (bhulan)' },
      where: { sd: 'گڊو ۽ سکر بئراج جي وچ ۾', ur: 'گڈو اور سکھر بیراج کے درمیان', en: 'Between the Guddu and Sukkur barrages' },
      text: {
        sd: 'هيءَ ڊولفن سنڌو درياءَ جي مٽيءَ ڀريل پاڻيءَ ۾ رهي ٿي ۽ لڳ ڀڳ ڏسي نٿي سگهي. اها آواز جي مدد سان رستو ڳولي ٿي: اها ڪلڪ جهڙا آواز ڪڍي ٿي ۽ مڇين ۽ پٿرن سان ٽڪرائجي موٽندڙ پڙاڏو ٻڌي ٿي. اهي ناياب ڊولفنون گهڻو ڪري سنڌ ۾ گڊو ۽ سکر بئراج جي وچ ۾ رهن ٿيون.',
        ur: 'یہ ڈولفن دریائے سندھ کے گدلے پانی میں رہتی ہے اور تقریباً دیکھ نہیں سکتی۔ یہ آواز کی مدد سے راستہ تلاش کرتی ہے: یہ کلک جیسی آوازیں نکالتی ہے اور مچھلیوں اور پتھروں سے ٹکرا کر واپس آنے والی گونج سنتی ہے۔ یہ نایاب ڈولفنیں زیادہ تر سندھ میں گڈو اور سکھر بیراج کے درمیان رہتی ہیں۔',
        en: 'This dolphin lives in the muddy water of the Indus and can hardly see. It finds its way with sound: it makes clicking sounds and listens to the echoes that come back from fish and rocks. Most of these rare dolphins live in Sindh, between the Guddu and Sukkur barrages.'
      },
      think: {
        sd: 'چمڙو به پڙاڏي سان رستو ڳولي ٿو. مٽيءَ ڀريل پاڻيءَ ۾ اکين کان وڌيڪ آواز ڇو ڪم اچي ٿو؟',
        ur: 'چمگادڑ بھی گونج سے راستہ تلاش کرتی ہے۔ گدلے پانی میں آنکھوں سے زیادہ آواز کیوں کام آتی ہے؟',
        en: 'Bats also find their way with echoes. Why is sound more useful than eyes in muddy water?'
      }
    },
    {
      id: 'jacobabad', icon: 'sun', lon: 68.44, lat: 28.28, chapter: 'earth-space',
      name: { sd: 'جيڪب آباد جي گرمي', ur: 'جیکب آباد کی گرمی', en: 'The heat of Jacobabad' },
      where: { sd: 'جيڪب آباد', ur: 'جیکب آباد', en: 'Jacobabad' },
      text: {
        sd: 'جيڪب آباد دنيا جي سڀ کان گرم شهرن مان هڪ آهي. جون ۾ گرمي پد 50 ڊگريءَ کان به مٿي وڃي سگهي ٿو. اونهاري ۾ منجهند جو سج لڳ ڀڳ مٿي تي هوندو آهي، تنهن ڪري ان جا ڪرڻا زمين کي ڏاڍو گرم ڪن ٿا. ماڻهو گهڻو پاڻي پيئن ٿا ۽ منجهند جو ڇانوَ ۾ رهن ٿا.',
        ur: 'جیکب آباد دنیا کے گرم ترین شہروں میں سے ایک ہے۔ جون میں درجۂ حرارت 50 ڈگری سے بھی اوپر جا سکتا ہے۔ گرمیوں میں دوپہر کا سورج تقریباً سر کے اوپر ہوتا ہے، اس لیے اس کی شعاعیں زمین کو بہت گرم کرتی ہیں۔ لوگ خوب پانی پیتے ہیں اور دوپہر کو سائے میں رہتے ہیں۔',
        en: 'Jacobabad is one of the hottest cities in the world. In June the temperature can go above 50 °C. In summer the noon sun is almost straight overhead, so its rays heat the ground strongly. People drink plenty of water and stay in the shade at midday.'
      },
      think: {
        sd: 'اونهاري ۾ سياري کان وڌيڪ گرمي ڇو ٿيندي آهي؟ جواب ۾ سج، ڌرتي ۽ سال جا لفظ استعمال ڪريو.',
        ur: 'گرمیوں میں سردیوں سے زیادہ گرمی کیوں ہوتی ہے؟ جواب میں سورج، زمین اور سال کے الفاظ استعمال کریں۔',
        en: 'Why is it hotter in summer than in winter? Use the words sun, Earth and year in your answer.'
      }
    },
    {
      id: 'sukkur', icon: 'gate', lon: 68.86, lat: 27.68, chapter: 'force-machines',
      name: { sd: 'سکر بئراج', ur: 'سکھر بیراج', en: 'Sukkur Barrage' },
      where: { sd: 'سکر', ur: 'سکھر', en: 'Sukkur' },
      text: {
        sd: 'سکر بئراج 1932ع ۾ سنڌو درياءَ تي کوليو ويو. مشينون ان جا ڳرا فولادي دروازا مٿي هيٺ ڪن ٿيون ته جيئن درياءَ جو پاڻي روڪي يا ڇڏي سگهجي. هي بئراج ستن واهن ۾ پاڻي موڪلي ٿو، جيڪي سنڌ جي وڏي حصي جي ٻنين کي پاڻي ڏين ٿا.',
        ur: 'سکھر بیراج 1932ء میں دریائے سندھ پر کھولا گیا۔ مشینیں اس کے بھاری فولادی دروازوں کو اوپر نیچے کرتی ہیں تاکہ دریا کا پانی روکا یا چھوڑا جا سکے۔ یہ بیراج سات نہروں میں پانی بھیجتا ہے جو سندھ کے بڑے حصے کے کھیتوں کو سیراب کرتی ہیں۔',
        en: 'Sukkur Barrage was opened across the Indus in 1932. Machines lift and lower its heavy steel gates to hold back the river water or let it go. The barrage sends water into seven canals that water the farms of a large part of Sindh.'
      },
      think: {
        sd: 'پاڻي دروازن تي زور سان ڌڪ هڻي ٿو. انهن کي مٿي کڻڻ لاءِ مشينن جي ضرورت ڇو پوي ٿي؟',
        ur: 'پانی دروازوں پر زور سے دھکا لگاتا ہے۔ انہیں اٹھانے کے لیے مشینوں کی ضرورت کیوں پڑتی ہے؟',
        en: 'The water pushes hard on the gates. Why do people need machines to lift them?'
      }
    },
    {
      id: 'dates', icon: 'palm', lon: 68.76, lat: 27.45, chapter: 'seeds',
      name: { sd: 'خيرپور جون کجيون', ur: 'خیرپور کی کھجوریں', en: 'The dates of Khairpur' },
      where: { sd: 'خيرپور', ur: 'خیرپور', en: 'Khairpur' },
      text: {
        sd: 'خيرپور پنهنجين کجين سبب مشهور آهي. کجيءَ جا وڻ گرم ۽ سڪي موسم کي پسند ڪن ٿا ۽ هتي تمام سٺا ٿين ٿا. هر کجيءَ اندر هڪ سخت ٻج هوندو آهي. هن ٻج مان نئون وڻ ڦٽي سگهي ٿو، پر هاري گهڻو ڪري اهي ننڍڙا ٻوٽا پوکيندا آهن جيڪي وڏي وڻ جي پاڙ وٽ نڪرندا آهن.',
        ur: 'خیرپور اپنی کھجوروں کی وجہ سے مشہور ہے۔ کھجور کے درخت گرم اور خشک موسم پسند کرتے ہیں اور یہاں بہت اچھے اگتے ہیں۔ ہر کھجور کے اندر ایک سخت بیج ہوتا ہے۔ اس بیج سے نیا درخت اگ سکتا ہے، لیکن کسان عموماً وہ ننھے پودے لگاتے ہیں جو بڑے درخت کی جڑ کے پاس نکلتے ہیں۔',
        en: 'Khairpur is famous for its dates. Date palms love hot, dry weather and grow very well here. Each date has one hard seed inside. A new palm can grow from this seed, but farmers usually plant the young shoots that grow at the foot of a big palm.'
      },
      think: {
        sd: 'هڪ کجي کولي ان جو ٻج ڏسو. کجيءَ جو ٻج هڪ پني ٻج آهي يا ٻه پني ٻج؟',
        ur: 'ایک کھجور کھول کر اس کا بیج دیکھیں۔ کھجور کا بیج یک دالا بیج ہے یا دو دالا بیج؟',
        en: 'Open a date and look at its seed. Is a date seed a monocot seed or a dicot seed?'
      }
    },
    {
      id: 'mohenjo', icon: 'bricks', lon: 68.14, lat: 27.33, chapter: 'matter',
      name: { sd: 'موئن جو دڙو', ur: 'موہنجو داڑو', en: 'Mohenjo-daro' },
      where: { sd: 'لاڙڪاڻي ضلعي ۾', ur: 'ضلع لاڑکانہ', en: 'Larkana district' },
      text: {
        sd: 'لڳ ڀڳ 4,500 سال اڳ ماڻهن هتي رٿابنديءَ سان هڪ شهر ٺاهيو، جنهن ۾ سڌيون گهٽيون، کوهه ۽ ڍڪيل ناليون هيون. اهي مٽيءَ جون سِرون باهه ۾ پچائيندا هئا. گرميءَ نرم مٽيءَ کي هميشه لاءِ سخت سِر بڻائي ڇڏيو: اها ڪيميائي تبديلي آهي جيڪا واپس نٿي ٿي سگهي. انهن مان گهڻيون سِرون اڄ به موجود آهن.',
        ur: 'تقریباً 4,500 سال پہلے لوگوں نے یہاں ایک منصوبہ بند شہر بنایا، جس میں سیدھی گلیاں، کنویں اور ڈھکی ہوئی نالیاں تھیں۔ وہ مٹی کی اینٹیں آگ میں پکاتے تھے۔ حرارت نے نرم مٹی کو ہمیشہ کے لیے سخت اینٹ بنا دیا: یہ کیمیائی تبدیلی ہے جو واپس نہیں ہو سکتی۔ ان میں سے بہت سی اینٹیں آج بھی موجود ہیں۔',
        en: 'About 4,500 years ago, people built a planned city here, with straight streets, wells and covered drains. They baked clay bricks in fire. The heat changed soft clay into hard brick for ever: a chemical change that cannot be undone. Many of those bricks are still standing today.'
      },
      think: {
        sd: 'ماني پچائڻ به اهڙي تبديلي آهي جيڪا واپس نٿي ٿي سگهي. اهڙين ٻن ٻين تبديلين جا نالا ٻڌايو.',
        ur: 'روٹی پکانا بھی ایسی تبدیلی ہے جو واپس نہیں ہو سکتی۔ ایسی دو اور تبدیلیوں کے نام بتائیں۔',
        en: 'Cooking a roti is also a change that cannot be undone. Name two more changes like this.'
      }
    },
    {
      id: 'manchar', icon: 'drop', lon: 67.67, lat: 26.42, chapter: 'pollution',
      name: { sd: 'منڇر ڍنڍ', ur: 'منچھر جھیل', en: 'Manchar Lake' },
      where: { sd: 'سيوهڻ ويجهو، ڄامشوري ضلعي ۾', ur: 'سیہون کے قریب، ضلع جامشورو', en: 'Near Sehwan, Jamshoro district' },
      text: {
        sd: 'منڇر پاڪستان ۾ مٺي پاڻيءَ جي سڀ کان وڏي ڍنڍ آهي. سوين سالن کان مهاڻا خاندان هن ڍنڍ تي ٻيڙين ۾ رهندا آيا آهن. اڄ ٻنين ۽ شهرن جو گندو پاڻي نالن ذريعي ان ۾ ڪري ٿو، ۽ مڇيون ۽ پکي اڳ کان گهٽ ٿي ويا آهن.',
        ur: 'منچھر پاکستان میں میٹھے پانی کی سب سے بڑی جھیل ہے۔ سینکڑوں سال سے ماہی گیر خاندان اس جھیل پر کشتیوں میں رہتے آئے ہیں۔ آج کھیتوں اور شہروں کا گندا پانی نالوں کے ذریعے اس میں گرتا ہے، اور مچھلیاں اور پرندے پہلے سے کم ہو گئے ہیں۔',
        en: 'Manchar is the largest freshwater lake in Pakistan. For hundreds of years, fishing families have lived on boats on the lake. Today, dirty drain water from farms and towns flows into it, and there are fewer fish and birds than before.'
      },
      think: {
        sd: 'ماڻهو ڇا ڪري سگهن ٿا ته جيئن گندو پاڻي اسان جي ڍنڍن ۽ دريائن تائين نه پهچي؟',
        ur: 'لوگ کیا کر سکتے ہیں تاکہ گندا پانی ہماری جھیلوں اور دریاؤں تک نہ پہنچے؟',
        en: 'What can people do so that dirty water does not reach our lakes and rivers?'
      }
    },
    {
      id: 'jhimpir', icon: 'turbine', lon: 67.95, lat: 25.15, chapter: 'electricity-magnets',
      name: { sd: 'جهمپير جون هوائي چڪيون', ur: 'جھمپیر کی ہوائی چکیاں', en: 'The wind turbines of Jhimpir' },
      where: { sd: 'جهمپير ۽ گهارو، ٺٽي ضلعي ۾', ur: 'جھمپیر اور گھارو، ضلع ٹھٹہ', en: 'Jhimpir and Gharo, Thatta district' },
      text: {
        sd: 'جهمپير ۽ گهاري ۾ سمنڊ پاسي کان تيز هوائون لڳن ٿيون، تنهن ڪري هتي ڪيتريون ئي ڊگهيون هوائي چڪيون لڳل آهن. جڏهن هوا انهن جي پرن کي ڦيرائي ٿي ته اندر هڪ جنريٽر ڦري ٿو. مقناطيس تار جي ويڙهن ويجهو ڦرن ٿا ۽ ائين گهرن ۽ ڪارخانن لاءِ دونهين کان سواءِ بجلي ٺهي ٿي.',
        ur: 'جھمپیر اور گھارو میں سمندر کی طرف سے تیز ہوائیں چلتی ہیں، اس لیے یہاں بہت سی اونچی ہوائی چکیاں لگی ہیں۔ جب ہوا ان کے پروں کو گھماتی ہے تو اندر ایک جنریٹر گھومتا ہے۔ مقناطیس تار کے لچھوں کے پاس گھومتے ہیں اور یوں گھروں اور کارخانوں کے لیے دھوئیں کے بغیر بجلی بنتی ہے۔',
        en: 'Strong winds from the sea blow across Jhimpir and Gharo, so many tall wind turbines stand here. When the wind turns the blades, a generator inside spins. Magnets turn near coils of wire, and this makes electricity for homes and factories, without any smoke.'
      },
      think: {
        sd: 'ٻارڻ ساڙڻ کان سواءِ بجلي ٺاهڻ جا ٻه ٻيا طريقا ٻڌايو.',
        ur: 'ایندھن جلائے بغیر بجلی بنانے کے دو اور طریقے بتائیں۔',
        en: 'Name two other ways to make electricity without burning fuel.'
      }
    },
    {
      id: 'keenjhar', icon: 'bird', lon: 68.05, lat: 24.9, chapter: 'water-cycle',
      name: { sd: 'ڪينجهر ڍنڍ', ur: 'کینجھر جھیل', en: 'Keenjhar Lake' },
      where: { sd: 'ٺٽي ويجهو', ur: 'ٹھٹہ کے قریب', en: 'Near Thatta' },
      text: {
        sd: 'ڪينجهر مٺي پاڻيءَ جي هڪ وڏي ڍنڍ آهي. هڪ واهه سنڌو درياءَ مان پاڻي آڻي ان کي ڀري ٿو، ۽ پائيپ اهو پاڻي پيئڻ لاءِ ڪراچيءَ تائين پهچائين ٿا. سياري ۾ هزارين پکي پري جي ٿڌن ملڪن مان هتي اچن ٿا.',
        ur: 'کینجھر میٹھے پانی کی ایک بڑی جھیل ہے۔ ایک نہر دریائے سندھ سے پانی لا کر اسے بھرتی ہے، اور پائپ یہ پانی پینے کے لیے کراچی تک لے جاتے ہیں۔ سردیوں میں ہزاروں پرندے دور کے ٹھنڈے ملکوں سے یہاں آتے ہیں۔',
        en: 'Keenjhar is a big freshwater lake. A canal brings water from the Indus to fill it, and pipes carry this water all the way to Karachi for people to drink. In winter, thousands of birds fly here from cold countries far away.'
      },
      think: {
        sd: 'هڪ سڄو شهر هن ڍنڍ جو پاڻي پيئي ٿو. ٽي طريقا ٻڌايو جن سان توهان جو گهر پاڻي بچائي سگهي ٿو.',
        ur: 'ایک پورا شہر اس جھیل کا پانی پیتا ہے۔ تین طریقے بتائیں جن سے آپ کا گھرانہ پانی بچا سکتا ہے۔',
        en: 'A whole city drinks water from this lake. Name three ways your family can save water.'
      }
    },
    {
      id: 'thar', icon: 'dune', lon: 70.25, lat: 24.85, chapter: 'soils',
      name: { sd: 'ٿر جو ريگستان', ur: 'صحرائے تھر', en: 'The Thar desert' },
      where: { sd: 'ٿرپارڪر، مٺي', ur: 'تھرپارکر، مٹھی', en: 'Tharparkar, Mithi' },
      text: {
        sd: 'ٿر سنڌ جي اوڀر ۾ واريءَ وارو ريگستان آهي. واريءَ جا ذرڙا وڏا ٿين ٿا ۽ انهن جي وچ ۾ خالي جاءِ هوندي آهي، تنهن ڪري مينهن جو پاڻي جلدي هيٺ لهي وڃي ٿو ۽ زمين سال جو گهڻو حصو سڪل رهي ٿي. مون سون جي مينهن کان پوءِ گاهه ڦٽي ٿو، تلاءَ ڀرجي وڃن ٿا ۽ ريگستان سائو ٿي وڃي ٿو. ان جي ڳوٺن ۾ مور آزاديءَ سان گهمن ٿا.',
        ur: 'تھر سندھ کے مشرق میں ایک ریتیلا صحرا ہے۔ ریت کے ذرات بڑے ہوتے ہیں اور ان کے درمیان خالی جگہ ہوتی ہے، اس لیے بارش کا پانی جلدی نیچے چلا جاتا ہے اور زمین سال کا زیادہ حصہ خشک رہتی ہے۔ مون سون کی بارش کے بعد گھاس اگتی ہے، تالاب بھر جاتے ہیں اور صحرا ہرا بھرا ہو جاتا ہے۔ اس کے گاؤں میں مور آزادی سے گھومتے ہیں۔',
        en: 'Thar is a sandy desert in the east of Sindh. Sand has big grains with spaces between them, so rainwater sinks through it quickly and the land stays dry for most of the year. After the monsoon rain, grass grows, ponds fill up and the desert turns green. Peacocks walk freely in its villages.'
      },
      think: {
        sd: 'هڪ ڪوپ پاڻي واريءَ تي ۽ ٻيو چيڪي مٽيءَ تي وجهو. ڪهڙي مٽي پاڻيءَ کي جلدي لنگهڻ ڏئي ٿي؟ ڇو؟',
        ur: 'ایک کپ پانی ریت پر اور ایک چکنی مٹی پر ڈالیں۔ کون سی مٹی پانی کو جلدی گزرنے دیتی ہے؟ کیوں؟',
        en: 'Pour a cup of water on sand and another on clay soil. Which one lets the water through faster? Why?'
      }
    },
    {
      id: 'turtles', icon: 'turtle', lon: 66.8, lat: 24.98, chapter: 'living-things',
      name: { sd: 'سائا سامونڊي ڪڇون', ur: 'سبز سمندری کچھوے', en: 'Green sea turtles' },
      where: { sd: 'هاڪس بي ۽ سينڊس پٽ، ڪراچي', ur: 'ہاکس بے اور سینڈز پٹ، کراچی', en: 'Hawkes Bay and Sandspit, Karachi' },
      text: {
        sd: 'هاڪس بي ۽ سينڊس پٽ جي ڪنارن تي سائا ڪڇون رات جو سمنڊ مان نڪري واريءَ ۾ آنا ڏين ٿا. لڳ ڀڳ ٻن مهينن کان پوءِ ٻچا آنن مان نڪري هلندا سمنڊ ڏانهن وڃن ٿا. ڪڇون رينگڻ وارا جانور آهن: اهي هوا ۾ ساهه کڻن ٿا، انهن جي جسم تي سخت چانئا هوندا آهن ۽ اهي آنا ڏين ٿا.',
        ur: 'ہاکس بے اور سینڈز پٹ کے ساحلوں پر سبز کچھوے رات کو سمندر سے نکل کر ریت میں انڈے دیتے ہیں۔ تقریباً دو مہینے بعد بچے انڈوں سے نکل کر چلتے ہوئے سمندر میں چلے جاتے ہیں۔ کچھوے رینگنے والے جانور ہیں: یہ ہوا میں سانس لیتے ہیں، ان کے جسم پر سخت چھلکے ہوتے ہیں اور یہ انڈے دیتے ہیں۔',
        en: 'On the beaches of Hawkes Bay and Sandspit, green turtles come out of the sea at night and lay their eggs in the sand. About two months later, the baby turtles hatch and walk to the sea. Turtles are reptiles: they breathe air, have hard scales and lay eggs.'
      },
      think: {
        sd: 'سمنڊ ۾ پلاسٽڪ جي ٿيلهي ڪڇونءَ کي کائڻ واري جيلي فش جهڙي لڳي ٿي. اسين پنهنجا سمنڊ ڪنارا صاف ڪيئن رکي سگهون ٿا؟',
        ur: 'سمندر میں پلاسٹک کا تھیلا کچھوے کو کھانے والی جیلی فش جیسا لگتا ہے۔ ہم اپنے ساحل صاف کیسے رکھ سکتے ہیں؟',
        en: 'To a turtle, a plastic bag in the sea looks like a jellyfish to eat. How can we keep our beaches clean?'
      }
    },
    {
      id: 'mangroves', icon: 'mangrove', lon: 67.55, lat: 24.12, chapter: 'plants',
      name: { sd: 'تمر جا ٻيلا', ur: 'تمر کے جنگلات', en: 'Mangrove forests' },
      where: { sd: 'سنڌو درياءَ جو ڇوڙ، ڪيٽي بندر', ur: 'دریائے سندھ کا ڈیلٹا، کیٹی بندر', en: 'The Indus delta, Keti Bandar' },
      text: {
        sd: 'جتي سنڌو درياءُ سمنڊ سان ملي ٿو، اتي تمر جا وڻ کاري پاڻيءَ ۾ ٿين ٿا. انهن جون پاڙون مٽيءَ کي جهلي رکن ٿيون ۽ ڪناري کي تيز لهرن کان بچائين ٿيون. ننڍيون مڇيون، ڪيڪڙا ۽ جهينگا انهن پاڙن جي وچ ۾ محفوظ رهي وڏا ٿين ٿا، تنهن ڪري مهاڻن جو گذر انهن ٻيلن تي آهي.',
        ur: 'جہاں دریائے سندھ سمندر سے ملتا ہے، وہاں تمر کے درخت کھارے پانی میں اگتے ہیں۔ ان کی جڑیں مٹی کو جکڑ کر رکھتی ہیں اور ساحل کو تیز لہروں سے بچاتی ہیں۔ ننھی مچھلیاں، کیکڑے اور جھینگے ان جڑوں کے بیچ محفوظ رہ کر بڑے ہوتے ہیں، اس لیے ماہی گیروں کا گزارا ان جنگلات پر ہے۔',
        en: 'Where the Indus meets the sea, mangrove trees grow in salty water. Their roots hold the mud together and protect the coast from strong waves. Young fish, crabs and shrimp grow up safely among the roots, so fishing families depend on these forests.'
      },
      think: {
        sd: 'گهڻا ٻوٽا کاري پاڻيءَ ۾ مري وڃن ٿا. توهان جي خيال ۾ تمر جي وڻن ۾ ڪهڙي خاص ڳالهه آهي؟',
        ur: 'زیادہ تر پودے کھارے پانی میں مر جاتے ہیں۔ آپ کے خیال میں تمر کے درختوں میں کیا خاص بات ہے؟',
        en: 'Most plants die in salty water. What do you think is special about mangroves?'
      }
    }
  ];

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    title: { sd: 'سنڌ ۾ سائنس', ur: 'سندھ میں سائنس', en: 'Science in Sindh' },
    eyebrow: { sd: 'ڪلاس 5 سائنس', ur: 'جماعت پنجم سائنس', en: 'Class 5 Science' },
    lead: {
      sd: 'ڪتاب جا سبق اسان جي چوڌاري آهن. سنڌ جي درياءَ، ڍنڍن، ريگستان، ٻوٽن ۽ جانورن ۾ سائنس ڳوليو. هر جاءِ سان گڏ ڪتاب جو باب ۽ ڪلاس ۾ ڳالهائڻ لاءِ هڪ سوال ڏنل آهي.',
      ur: 'کتاب کے اسباق ہمارے چاروں طرف ہیں۔ سندھ کے دریا، جھیلوں، صحرا، پودوں اور جانوروں میں سائنس تلاش کریں۔ ہر جگہ کے ساتھ کتاب کا باب اور کلاس میں بات کرنے کے لیے ایک سوال دیا گیا ہے۔',
      en: 'The lessons in your book are all around you. Find science in the river, lakes, desert, plants and animals of Sindh. Each place comes with its chapter in the book and a question to talk about in class.'
    },
    seeMap: { sd: 'نقشو ڏسو', ur: 'نقشہ دیکھیں', en: 'See the map' },
    print: { sd: 'هي صفحو پرنٽ ڪريو', ur: 'یہ صفحہ پرنٹ کریں', en: 'Print this page' },
    mapTitle: { sd: 'سنڌ جو نقشو', ur: 'سندھ کا نقشہ', en: 'Map of Sindh' },
    mapNote: {
      sd: 'سادو نقشو، ماپ مطابق ناهي. ڪنهن نمبر تي ٽيپ ڪري ان جاءِ بابت پڙهو.',
      ur: 'سادہ نقشہ، پیمانے کے مطابق نہیں۔ کسی نمبر پر ٹیپ کر کے اس جگہ کے بارے میں پڑھیں۔',
      en: 'A simple map, not to scale. Tap a number to read about that place.'
    },
    placesTitle: { sd: 'سنڌ جون 12 جايون', ur: 'سندھ کی 12 جگہیں', en: '12 places in Sindh' },
    think: { sd: 'سوچيو ۽ ڳالهايو', ur: 'سوچیں اور بات کریں', en: 'Think and talk' },
    inBook: { sd: 'ڪتاب ۾', ur: 'کتاب میں', en: 'In your book' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' },
    toMap: { sd: 'نقشي ڏانهن', ur: 'نقشے پر واپس', en: 'Back to the map' },
    teacherTitle: { sd: 'استادن لاءِ: ڪلاس جي سرگرمي', ur: 'اساتذہ کے لیے: کلاس کی سرگرمی', en: 'For teachers: a class activity' },
    teacherSteps: {
      sd: ['شاگردن جي هر گروپ کي هن صفحي مان هڪ جاءِ ڏيو.', 'هر گروپ ان بابت پڙهي، ڪتاب ۾ ان جو باب ڳولي ۽ تصوير سان گڏ هڪ ننڍو پوسٽر ٺاهي.', 'گروپ پنهنجا پوسٽر سڀني کي ڏيکارين. پڇو: ڇا ڪنهن هي جاءِ ڏٺي آهي؟ اتي ڇا ڏٺو؟'],
      ur: ['طلبہ کے ہر گروپ کو اس صفحے سے ایک جگہ دیں۔', 'ہر گروپ اس کے بارے میں پڑھے، کتاب میں اس کا باب تلاش کرے اور تصویر کے ساتھ ایک چھوٹا پوسٹر بنائے۔', 'گروپ اپنے پوسٹر سب کو دکھائیں۔ پوچھیں: کیا کسی نے یہ جگہ دیکھی ہے؟ وہاں کیا دیکھا؟'],
      en: ['Give each group of students one place from this page.', 'Each group reads about it, finds its chapter in the book and makes a small poster with a drawing.', 'Groups show their posters to the class. Ask: has anyone visited this place? What did you see there?']
    },
    sea: { sd: 'عربي سمنڊ', ur: 'بحیرۂ عرب', en: 'Arabian Sea' },
    river: { sd: 'سنڌو درياءُ', ur: 'دریائے سندھ', en: 'River Indus' },
    north: { sd: 'اتر', ur: 'شمال', en: 'N' },
    karachi: { sd: 'ڪراچي', ur: 'کراچی', en: 'Karachi' },
    hyderabad: { sd: 'حيدرآباد', ur: 'حیدرآباد', en: 'Hyderabad' },
    larkana: { sd: 'لاڙڪاڻو', ur: 'لاڑکانہ', en: 'Larkana' },
    mithi: { sd: 'مٺي', ur: 'مٹھی', en: 'Mithi' }
  };

  // Line icons drawn like the site's own (24 × 24, stroke only).
  var ICONS = {
    river: '<path d="M3 7c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 12c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 17c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/>',
    sound: '<circle cx="6" cy="12" r="2"/><path d="M11 8.5a5 5 0 0 1 0 7M14.5 6a8.5 8.5 0 0 1 0 12M18 3.5a12 12 0 0 1 0 17"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    gate: '<path d="M3 20h18M5 20V6M19 20V6M5 6h14M9 6v7h6V6M3 16.5c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0"/>',
    palm: '<path d="M12 21V10M12 10C10.5 6.5 7 5 3.5 6M12 10c1.5-3.5 5-5 8.5-4M12 10C10 7 9.5 4.5 10.5 3M12 10c2-3 2.5-5.5 1.5-7M9 21h6"/>',
    bricks: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    drop: '<path d="M12 3c3 4 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-7 6-11z"/><path d="M9.5 15.5l5-5M14.5 15.5l-5-5"/>',
    turbine: '<path d="M12 21.5V11M9 21.5h6"/><circle cx="12" cy="9" r="1.6"/><path d="M12 7.4V2.5M13.4 9.8l4.3 2.5M10.6 9.8l-4.3 2.5"/>',
    bird: '<path d="M2.5 10c2.5-2.5 5-2.5 7 0 2-2.5 4.5-2.5 7 0M10 16c1.7-1.8 3.5-1.8 5 0 1.5-1.8 3.3-1.8 5 0M3 20h18"/>',
    dune: '<circle cx="17" cy="6" r="2.5"/><path d="M2 19c3.5-6 8-6 11.5 0M9.5 19c3-4.5 6.5-4.5 10 0M2 19h20"/>',
    turtle: '<path d="M4.5 14a7.5 5.5 0 0 1 15 0z"/><path d="M19.5 13h2.2M7 14l-1.6 3M17 14l1.6 3M9 10.5l3 3.5 3-3.5"/>',
    mangrove: '<circle cx="12" cy="7.5" r="4.5"/><path d="M12 12v4.5M12 16.5L8 21M12 16.5l4 4.5M12 16.5V21M3 21h18"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    printer: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7"/>',
    map: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- the map: a plain drawing from longitude and latitude ---------- */

  // Sindh's outline, coast and the Indus, simplified (longitude, latitude).
  var OUTLINE = [[68.22, 28.47], [68.75, 28.6], [69.35, 28.62], [69.75, 28.52], [70.05, 28.2], [70.1, 27.85], [70.0, 27.3],
    [70.15, 26.7], [70.3, 26.1], [70.3, 25.7], [70.65, 25.35], [71.0, 25.0], [71.12, 24.7], [70.7, 24.35], [69.9, 24.2], [69.1, 24.28], [68.75, 24.3],
    [68.2, 23.7], [67.7, 23.95], [67.35, 24.1], [67.2, 24.5], [67.0, 24.8], [66.7, 24.85], [66.65, 25.05], [66.95, 25.45],
    [67.3, 25.75], [67.35, 26.3], [67.4, 26.85], [67.55, 27.3], [67.7, 27.85], [68.0, 28.1]];
  var SEA = [[66.45, 25.15], [66.65, 25.05], [66.7, 24.85], [67.0, 24.8], [67.2, 24.5], [67.35, 24.1], [67.7, 23.95], [68.2, 23.7],
    [68.2, 23.55], [66.45, 23.55]];
  var INDUS = [[70.0, 28.75], [69.72, 28.45], [69.4, 28.2], [69.05, 27.95], [68.88, 27.7], [68.6, 27.45], [68.28, 27.2], [68.0, 26.85],
    [67.92, 26.45], [68.05, 26.1], [68.25, 25.7], [68.33, 25.37], [68.28, 25.0], [68.1, 24.65], [67.8, 24.35], [67.5, 24.05]];
  var CITIES = [['karachi', 67.01, 24.86, 0, 16], ['hyderabad', 68.37, 25.39, 0, 16], ['larkana', 68.21, 27.56, 18, -6], ['mithi', 69.8, 24.74, -4, 18]];

  function px(p) { return [Math.round((p[0] - 66.45) * 92 * 10) / 10, Math.round((28.75 - p[1]) * 100 * 10) / 10]; }
  function points(list) { return list.map(function (p) { return px(p).join(','); }).join(' '); }

  function mapSvg() {
    var cities = CITIES.map(function (c) {
      var p = px([c[1], c[2]]);
      return '<circle class="sm-city" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>' +
        '<text class="sm-city-name" x="' + (p[0] + c[3]) + '" y="' + (p[1] + c[4]) + '" text-anchor="middle">' + esc(t(c[0])) + '</text>';
    }).join('');
    var marks = PLACES.map(function (pl, i) {
      var p = px([pl.lon, pl.lat]);
      return '<a href="#place-' + pl.id + '" class="sm-mark"><title>' + esc((i + 1) + '. ' + L(pl.name)) + '</title>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 4.2) + '" text-anchor="middle">' + (i + 1) + '</text></a>';
    }).join('');
    var label = px([68.62, 26.95]), sea = px([67.0, 23.82]), nx = 412;
    return '<svg class="sm-map" viewBox="0 0 445 525" role="img" aria-labelledby="map-title">' +
      '<polygon class="sm-sea" points="' + points(SEA) + '"/>' +
      '<polygon class="sm-land" points="' + points(OUTLINE) + '"/>' +
      '<polyline class="sm-river" points="' + points(INDUS) + '"/>' +
      '<text class="sm-river-name" x="' + label[0] + '" y="' + label[1] + '" text-anchor="middle">' + esc(t('river')) + '</text>' +
      '<text class="sm-sea-name" x="' + sea[0] + '" y="' + sea[1] + '" text-anchor="middle">' + esc(t('sea')) + '</text>' +
      '<g class="sm-north"><path d="M' + nx + ' 18l-7 16h14z"/><text x="' + nx + '" y="50" text-anchor="middle">' + esc(t('north')) + '</text></g>' +
      cities + marks + '</svg>';
  }

  /* ---------- page ---------- */

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
  function L(o) { return o == null ? '' : typeof o === 'object' ? (o[state.lang] != null ? o[state.lang] : o.en) : String(o); }
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
  function placeCard(pl, i) {
    var ch = CHAPTERS[pl.chapter];
    return '<article class="card sp-place" id="place-' + pl.id + '">' +
      '<div class="sp-head"><span class="icon-tile sp-icon">' + icon(pl.icon) + '<span class="sp-num">' + (i + 1) + '</span></span>' +
        '<div><h3>' + esc(L(pl.name)) + '</h3><p class="sp-where">' + icon('pin') + '<span>' + esc(L(pl.where)) + '</span></p></div></div>' +
      '<p>' + esc(L(pl.text)) + '</p>' +
      '<div class="sp-think"><p class="sp-label">' + icon('chat') + esc(t('think')) + '</p><p>' + esc(L(pl.think)) + '</p></div>' +
      '<div class="sp-foot"><a class="sp-chap" href="/class-5/science/' + pl.chapter + '">' + icon('book') +
        '<span><span class="sp-label">' + esc(t('inBook')) + '</span> ' + esc(t('chapterN', { n: ch.n })) + ': ' + esc(L(ch)) + '</span></a>' +
        '<a class="sp-up no-print" href="#map">' + icon('up') + esc(t('toMap')) + '</a></div>' +
    '</article>';
  }
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="sp-hero">' +
        '<div class="sp-band" aria-hidden="true"></div>' +
        '<div class="sp-hero-in"><p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1>' +
          '<p class="lead">' + esc(t('lead')) + '</p>' +
          '<div class="btn-row no-print"><a class="btn" href="#map">' + icon('map') + esc(t('seeMap')) + '</a>' +
            '<a class="btn ghost" href="/mausam/">' + esc(L({ sd: 'ڊجيٽل موسم ليب', ur: 'ڈیجیٹل موسمی لیب', en: 'Digital weather lab' })) + '</a>' +
            '<button type="button" class="btn ghost" data-act="print">' + icon('printer') + esc(t('print')) + '</button></div></div>' +
      '</section>' +
      '<section class="card sp-mapcard" id="map" tabindex="-1">' +
        '<h2 id="map-title">' + esc(t('mapTitle')) + '</h2><p class="muted small">' + esc(t('mapNote')) + '</p>' +
        '<div class="sp-mapgrid"><div class="sp-mapbox">' + mapSvg() + '</div>' +
          '<ol class="sp-legend">' + PLACES.map(function (pl, i) {
            return '<li><a href="#place-' + pl.id + '"><span class="sp-lnum">' + (i + 1) + '</span><span>' + esc(L(pl.name)) +
              '<span class="sp-lwhere">' + esc(L(pl.where)) + '</span></span></a></li>';
          }).join('') + '</ol></div>' +
      '</section>' +
      '<h2 class="sp-title">' + esc(t('placesTitle')) + '</h2>' +
      '<div class="sp-grid">' + PLACES.map(placeCard).join('') + '</div>' +
      '<section class="card sp-teach"><h2>' + esc(t('teacherTitle')) + '</h2><ol>' +
        L(T.teacherSteps).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>';
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
    if (e.target.closest('[data-act="print"]')) window.print();
  });

  applyLang();
  render();
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
