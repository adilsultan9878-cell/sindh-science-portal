/* Sindh Science Learning Portal — "Save the Indus dolphin" (/sindh/dolphin/).
   A turn-based game: the nearly blind dolphin swims down a muddy river. "Click!" sends out a sound and the echoes
   show what is near; nets, plastic and dirty water hurt it, fish feed it, the green water at the bottom is the reserve.
   Every new river is checked to have at least one safe way down. No movement on screen: each turn redraws the board. */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var W = 7, H = 12, LIVES = 3, ECHO = 5; // echoes reach squares with dx² + dy² ≤ 5 (about two squares round)
  var COUNTS = { net: 7, plastic: 6, fish: 6 }, DIRTY_PATCHES = 2;

  var CHAPTERS = {
    'light-sound': { n: 7, sd: 'روشني ۽ آواز', ur: 'روشنی اور آواز', en: 'Light and Sound' },
    pollution: { n: 4, sd: 'ماحولياتي آلودگي', ur: 'ماحولیاتی آلودگی', en: 'Environmental Pollution' },
    'living-things': { n: 1, sd: 'جاندار ۽ انهن جي درجه بندي', ur: 'جاندار اور ان کی درجہ بندی', en: 'Living Things and Classification' }
  };

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    sindh: { sd: 'سنڌ ۾ سائنس', ur: 'سندھ میں سائنس', en: 'Science in Sindh' },
    title: { sd: 'ٻلڻ بچايو', ur: 'بُلھن بچاؤ', en: 'Save the Indus dolphin' },
    eyebrow: { sd: 'سنڌ ۾ سائنس · راند', ur: 'سندھ میں سائنس · کھیل', en: 'Science in Sindh · Game' },
    lead: {
      sd: 'سنڌو درياءَ جي ڊولفن مٽيءَ ڀريل پاڻيءَ ۾ لڳ ڀڳ ڏسي نٿي سگهي. اها آواز سان رستو ڳولي ٿي. ان کي مڇيءَ جي ڄارن، پلاسٽڪ ۽ گندي پاڻيءَ کان بچائي درياءَ جي هيٺان محفوظ ڊولفن رزرو تائين پهچايو.',
      ur: 'دریائے سندھ کی ڈولفن گدلے پانی میں تقریباً دیکھ نہیں سکتی۔ یہ آواز سے راستہ تلاش کرتی ہے۔ اسے مچھلی کے جال، پلاسٹک اور گندے پانی سے بچا کر دریا کے نیچے محفوظ ڈولفن ریزرو تک پہنچائیں۔',
      en: 'The Indus river dolphin can hardly see in muddy water. It finds its way with sound. Help it swim down the river to the safe dolphin reserve, away from fishing nets, plastic and dirty water.'
    },
    howTitle: { sd: 'ڪيئن کيڏجي', ur: 'کیسے کھیلیں', en: 'How to play' },
    how: {
      sd: ['«ڪلڪ!» دٻايو ته ڊولفن آواز ڪڍي. پڙاڏو ٻڌائي ٿو ته ڊولفن جي ويجهو ڇا آهي.', 'تير وارن بٽڻن، ڪي بورڊ جي تيرن، يا ڊولفن جي ڀرسان واري خاني تي ٽيپ ڪري اڳتي وڌو.', 'رستي ۾ مڇيون کائو. هر ڄار، پلاسٽڪ جي ٿيلهي يا گندو پاڻي ڊولفن کي نقصان پهچائي ٿو.', 'هيٺ سائي پاڻيءَ تائين پهچو: اهو ئي ڊولفن رزرو آهي.'],
      ur: ['«کلک!» دبائیں تاکہ ڈولفن آواز نکالے۔ گونج بتاتی ہے کہ ڈولفن کے قریب کیا ہے۔', 'تیر والے بٹنوں، کی بورڈ کے تیروں، یا ڈولفن کے ساتھ والے خانے پر ٹیپ کر کے آگے بڑھیں۔', 'راستے میں مچھلیاں کھائیں۔ ہر جال، پلاسٹک کا تھیلا یا گندا پانی ڈولفن کو نقصان پہنچاتا ہے۔', 'نیچے ہرے پانی تک پہنچیں: یہی ڈولفن ریزرو ہے۔'],
      en: ['Press "Click!" to make the dolphin send out a sound. The echoes show what is near it.', 'Move with the arrow buttons, the arrow keys, or by tapping a square next to the dolphin.', 'Eat fish on the way. Every net, plastic bag or patch of dirty water hurts the dolphin.', 'Reach the green water at the bottom: that is the dolphin reserve.']
    },
    ping: { sd: 'ڪلڪ!', ur: 'کلک!', en: 'Click!' },
    up: { sd: 'مٿي', ur: 'اوپر', en: 'Up' },
    down: { sd: 'هيٺ', ur: 'نیچے', en: 'Down' },
    left: { sd: 'کاٻي', ur: 'بائیں', en: 'Left' },
    right: { sd: 'ساڄي', ur: 'دائیں', en: 'Right' },
    newGame: { sd: 'نئين راند', ur: 'نیا کھیل', en: 'New game' },
    soundOn: { sd: 'آواز: چالو', ur: 'آواز: چالو', en: 'Sound: on' },
    soundOff: { sd: 'آواز: بند', ur: 'آواز: بند', en: 'Sound: off' },
    health: { sd: 'صحت', ur: 'صحت', en: 'Health' },
    fish: { sd: 'مڇيون', ur: 'مچھلیاں', en: 'Fish' },
    clicks: { sd: 'ڪلڪ', ur: 'کلک', en: 'Clicks' },
    moves: { sd: 'قدم', ur: 'قدم', en: 'Moves' },
    board: { sd: 'درياءُ', ur: 'دریا', en: 'The river' },
    m_start: { sd: 'پاڻي مٽيءَ ڀريل آهي. پڙاڏو ٻڌڻ لاءِ «ڪلڪ!» دٻايو.', ur: 'پانی گدلا ہے۔ گونج سننے کے لیے «کلک!» دبائیں۔', en: 'The water is muddy. Press "Click!" to hear the echoes.' },
    m_ping: { sd: 'ڪلڪ… ڪلڪ… ڊولفن جي ويجهو {n} شين مان پڙاڏو موٽيو.', ur: 'کلک… کلک… ڈولفن کے قریب {n} چیزوں سے گونج واپس آئی۔', en: 'Click… click… Echoes came back from {n} things near the dolphin.' },
    m_ping0: { sd: 'ڪلڪ… ويجهو ڪو پڙاڏو نه موٽيو. چوڌاري پاڻي صاف آهي.', ur: 'کلک… قریب سے کوئی گونج نہیں آئی۔ آس پاس پانی صاف ہے۔', en: 'Click… no echoes came back. The water nearby is clear.' },
    m_swim: { sd: 'ڊولفن اڳتي وڌي.', ur: 'ڈولفن آگے بڑھی۔', en: 'The dolphin swims on.' },
    m_net: { sd: 'اوهه! مڇيءَ جو ڄار. ڊولفن ڄار ۾ ڦاسي سگهي ٿي ۽ ساهه کڻڻ لاءِ مٿي نٿي اچي سگهي.', ur: 'اوہ! مچھلی کا جال۔ ڈولفن جال میں پھنس سکتی ہے اور سانس لینے اوپر نہیں آ سکتی۔', en: 'Ouch! A fishing net. Dolphins can get caught in nets and cannot come up to breathe.' },
    m_plastic: { sd: 'پلاسٽڪ! ڊولفن پلاسٽڪ جي ٿيلهي ڳهي سخت بيمار ٿي سگهي ٿي.', ur: 'پلاسٹک! ڈولفن پلاسٹک کا تھیلا نگل کر سخت بیمار ہو سکتی ہے۔', en: 'Plastic! A dolphin can swallow a plastic bag and become very sick.' },
    m_dirty: { sd: 'گندو پاڻي! نالن ۽ ڪارخانن جو گند درياءَ کي مڇين ۽ ڊولفن لاءِ زهريلو بڻائي ٿو.', ur: 'گندا پانی! نالوں اور کارخانوں کا گند دریا کو مچھلیوں اور ڈولفن کے لیے زہریلا بنا دیتا ہے۔', en: 'Dirty water! Waste from drains and factories makes the river poisonous for fish and dolphins.' },
    m_fish: { sd: 'مزيدار! هڪ مڇي. ڊولفن مڇيون ۽ جهينگا کائي ٿي.', ur: 'مزے دار! ایک مچھلی۔ ڈولفن مچھلیاں اور جھینگے کھاتی ہے۔', en: 'Yum! A fish. Dolphins eat fish and shrimp.' },
    m_wall: { sd: 'هي درياءَ جو ڪنارو آهي.', ur: 'یہ دریا کا کنارہ ہے۔', en: 'That is the river bank.' },
    m_won: { sd: 'شاباس! ڊولفن 3 مان {h} صحت ۽ {f} مڇين سان رزرو تائين پهچي وئي.', ur: 'شاباش! ڈولفن 3 میں سے {h} صحت اور {f} مچھلیوں کے ساتھ ریزرو تک پہنچ گئی۔', en: 'Safe! The dolphin reached the reserve with {h} of 3 health and {f} fish.' },
    m_lost: { sd: 'ڊولفن زخمي ٿي پئي آهي. ٻيهر ڪوشش ڪريو ۽ «ڪلڪ!» وڌيڪ استعمال ڪريو.', ur: 'ڈولفن زخمی ہو گئی ہے۔ دوبارہ کوشش کریں اور «کلک!» زیادہ استعمال کریں۔', en: 'The dolphin is hurt. Try again, and use "Click!" more often.' },
    c_dolphin: { sd: 'ڊولفن', ur: 'ڈولفن', en: 'Dolphin' },
    c_murky: { sd: 'مٽيءَ ڀريل پاڻي', ur: 'گدلا پانی', en: 'Muddy water' },
    c_water: { sd: 'صاف رستو', ur: 'صاف راستہ', en: 'Clear way' },
    c_net: { sd: 'ڄار', ur: 'جال', en: 'Net' },
    c_plastic: { sd: 'پلاسٽڪ', ur: 'پلاسٹک', en: 'Plastic' },
    c_dirty: { sd: 'گندو پاڻي', ur: 'گندا پانی', en: 'Dirty water' },
    c_fish: { sd: 'مڇي', ur: 'مچھلی', en: 'Fish' },
    c_reserve: { sd: 'ڊولفن رزرو', ur: 'ڈولفن ریزرو', en: 'Dolphin reserve' },
    learnTitle: { sd: 'سکو: آواز سان ڏسڻ', ur: 'سیکھیں: آواز سے دیکھنا', en: 'Learn: seeing with sound' },
    learnText: {
      sd: 'آواز پاڻيءَ ۾ به سفر ڪري ٿو. جڏهن ڊولفن ڪلڪ جو آواز ڪڍي ٿي ته آواز ڪنهن مڇيءَ يا پٿر سان ٽڪرائجي پڙاڏو بڻجي موٽي ٿو. ڊولفن اهو پڙاڏو ٻڌي ڄاڻي وٺي ٿي ته اها شيءِ ڪٿي ۽ ڪيتري پري آهي. ان کي پڙاڏي سان رستو ڳولڻ (ايڪولوڪيشن) چئبو آهي. چمڙو به ائين ڪري ٿو.',
      ur: 'آواز پانی میں بھی سفر کرتی ہے۔ جب ڈولفن کلک کی آواز نکالتی ہے تو آواز کسی مچھلی یا پتھر سے ٹکرا کر گونج بن کر واپس آتی ہے۔ ڈولفن یہ گونج سن کر جان لیتی ہے کہ وہ چیز کہاں اور کتنی دور ہے۔ اسے گونج سے راستہ معلوم کرنا (ایکولوکیشن) کہتے ہیں۔ چمگادڑ بھی یہی کرتی ہے۔',
      en: 'Sound travels through water too. When the dolphin makes a click, the sound hits a fish or a rock and bounces back as an echo. The dolphin hears the echo and knows where the thing is and how far away. This is called echolocation. Bats use it too.'
    },
    helpTitle: { sd: 'اسين ڇا ڪري سگهون ٿا؟', ur: 'ہم کیا کر سکتے ہیں؟', en: 'What can we do?' },
    help: {
      sd: ['ڪڏهن به پلاسٽڪ جون ٿيلهيون واهن يا درياءَ ۾ نه اڇلايو.', 'وڏن کي چئو ته پراڻا ڄار پاڻيءَ ۾ نه ڇڏين.', 'جيڪڏهن ڪا ڊولفن واهه ۾ ڦاٿل نظر اچي ته ڪنهن وڏي کي چئو ته جهنگلي جيوت کاتي کي ٻڌائي.'],
      ur: ['کبھی بھی پلاسٹک کے تھیلے نہروں یا دریا میں نہ پھینکیں۔', 'بڑوں سے کہیں کہ پرانے جال پانی میں نہ چھوڑیں۔', 'اگر کوئی ڈولفن نہر میں پھنسی نظر آئے تو کسی بڑے سے کہیں کہ محکمۂ جنگلی حیات کو اطلاع دے۔'],
      en: ['Never throw plastic bags into canals or the river.', 'Ask grown-ups not to leave old fishing nets in the water.', 'If you see a dolphin stuck in a canal, ask an adult to tell the wildlife department.']
    },
    inBook: { sd: 'ڪتاب ۾', ur: 'کتاب میں', en: 'In your book' },
    chapterN: { sd: 'باب {n}', ur: 'باب {n}', en: 'Chapter {n}' }
  };

  // Small pictures for the squares (32 × 32).
  var PICS = {
    dolphin: '<path d="M3 18.5c3-5 9-7.5 15-6.5l1.5-3.5 2 4c2.5 1 4.5 2.8 5.5 4.5l2.5 1.2-2.6.8c-1.5 2-6 3.6-12 3.2-5-.3-9-1.6-11.9-3.7z" fill="#7c97ab"/><circle cx="22.5" cy="16.2" r="1" fill="#1f2d38"/><path d="M8 21.5l-3 4 5.5-2.2" fill="#7c97ab"/>',
    net: '<rect x="4" y="5" width="24" height="22" rx="2" fill="none" stroke="#6b4f2a" stroke-width="1.6"/><path d="M4 12h24M4 19.5h24M11 5v22M18 5v22M25 5v22" stroke="#6b4f2a" stroke-width="1.3"/><circle cx="6" cy="5" r="1.6" fill="#d9822b"/><circle cx="26" cy="5" r="1.6" fill="#d9822b"/>',
    plastic: '<path d="M9 11h14l2 15H7z" fill="#f2f4f6" stroke="#8a96a3" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 11c0-4 2-6 4-6s4 2 4 6" fill="none" stroke="#8a96a3" stroke-width="1.5"/><path d="M10.5 17h11" stroke="#c4ccd4" stroke-width="1.2"/>',
    dirty: '<path d="M5 20c0-5 4-8 8-7 2-4 9-4 11 1 3 0 4 3 3 6-1 4-6 5-11 5S5 24 5 20z" fill="#8a6d3b"/><circle cx="12" cy="19" r="1.6" fill="#5c4522"/><circle cx="19" cy="21" r="2" fill="#5c4522"/><path d="M23 9c1 2 2 3 2 4.2a2 2 0 0 1-4 0C21 12 22 11 23 9z" fill="#8a6d3b"/>',
    fish: '<path d="M5 16c3-5 9-7 15-4l6-4v16l-6-4c-6 3-12 1-15-4z" fill="#e8a33c"/><circle cx="10.5" cy="15" r="1.2" fill="#3b2a12"/><path d="M15 12.5c1.2 2.2 1.2 4.8 0 7" fill="none" stroke="#c47f1e" stroke-width="1.2"/>'
  };

  var main = document.getElementById('main');
  var state = { lang: 'sd', sound: true, g: null, audio: null };
  try {
    var saved = JSON.parse(localStorage.getItem('ssp1.lang'));
    if (LANGS.indexOf(saved) >= 0) state.lang = saved;
    state.sound = localStorage.getItem('ssp1.dolphinSound') !== 'off';
  } catch (e) { /* storage blocked: Sindhi, sound on */ }

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
  function pic(name) { return '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' + PICS[name] + '</svg>'; }
  function arrow(d) {
    var r = { up: 0, right: 90, down: 180, left: 270 }[d];
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path transform="rotate(' + r + ' 12 12)" d="M12 19V5M6 11l6-6 6 6"/></svg>';
  }

  /* ---------- the river ---------- */

  function rand(n) { return Math.floor(Math.random() * n); }
  function idx(x, y) { return y * W + x; }
  function freeCell(cells) { // any empty square between the first and the last row
    for (;;) {
      var i = idx(rand(W), 1 + rand(H - 2));
      if (!cells[i]) return i;
    }
  }
  function hasSafeWay(cells) {
    var seen = {}, queue = [idx(3, 0)];
    seen[queue[0]] = true;
    while (queue.length) {
      var i = queue.shift(), x = i % W, y = Math.floor(i / W);
      if (y === H - 1) return true;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = x + d[0], ny = y + d[1], j = idx(nx, ny);
        if (nx < 0 || nx >= W || ny < 0 || ny >= H || seen[j]) return;
        if (cells[j] && cells[j] !== 'fish') return;
        seen[j] = true;
        queue.push(j);
      });
    }
    return false;
  }
  function newRiver() {
    var cells;
    do {
      cells = [];
      for (var p = 0; p < DIRTY_PATCHES; p++) { // a patch of dirty water two or three squares wide
        var y = 2 + rand(H - 4), x = rand(W - 2), len = 2 + rand(2);
        for (var k = 0; k < len && x + k < W; k++) cells[idx(x + k, y)] = 'dirty';
      }
      Object.keys(COUNTS).forEach(function (type) {
        for (var n = 0; n < COUNTS[type]; n++) cells[freeCell(cells)] = type;
      });
    } while (!hasSafeWay(cells));
    var seen = [];
    seen[idx(3, 0)] = true;
    state.g = { cells: cells, seen: seen, x: 3, y: 0, health: LIVES, fish: 0, moves: 0, clicks: 0, over: false, won: false, msg: 'm_start', vars: null, echo: null };
  }

  function clickSound() {
    if (!state.sound) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ac = state.audio = state.audio || new AC();
      [0, 0.16, 0.3].forEach(function (delay, i) { // the click, then two softer echoes
        var o = ac.createOscillator(), gain = ac.createGain(), at = ac.currentTime + delay;
        o.type = 'sine';
        o.frequency.value = 2600 - i * 300;
        gain.gain.setValueAtTime(0.22 / (1 + i * 2), at);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
        o.connect(gain);
        gain.connect(ac.destination);
        o.start(at);
        o.stop(at + 0.06);
      });
    } catch (e) { /* no sound on this device */ }
  }
  function ping() {
    var g = state.g, found = 0, echo = {};
    if (g.over) return;
    g.clicks++;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var dx = x - g.x, dy = y - g.y;
        if (dx * dx + dy * dy > ECHO) continue;
        var i = idx(x, y);
        echo[i] = true;
        if (g.cells[i] && !g.seen[i]) found++;
        g.seen[i] = true;
      }
    }
    g.echo = echo;
    g.msg = found ? 'm_ping' : 'm_ping0';
    g.vars = { n: found };
    clickSound();
  }
  function move(dx, dy) {
    var g = state.g;
    if (g.over) return;
    var nx = g.x + dx, ny = g.y + dy;
    g.echo = null;
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) { g.msg = 'm_wall'; g.vars = null; return; }
    var i = idx(nx, ny), what = g.cells[i];
    g.seen[i] = true;
    g.moves++;
    g.vars = null;
    if (what === 'net') { // caught: the dolphin pulls back and stays where it was
      g.health--;
      g.msg = 'm_net';
    } else {
      g.x = nx;
      g.y = ny;
      g.msg = 'm_swim';
      if (what === 'plastic') { g.health--; g.cells[i] = ''; g.msg = 'm_plastic'; }
      if (what === 'dirty') { g.health--; g.msg = 'm_dirty'; }
      if (what === 'fish') { g.fish++; g.cells[i] = ''; g.msg = 'm_fish'; }
    }
    if (g.health <= 0) { g.health = 0; g.over = true; g.msg = 'm_lost'; }
    else if (g.y === H - 1) { g.over = true; g.won = true; g.msg = 'm_won'; g.vars = { h: g.health, f: g.fish }; }
  }

  /* ---------- drawing ---------- */

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
  function chapterLink(id) {
    var ch = CHAPTERS[id];
    return '<a class="sp-chap" href="/class-5/science/' + id + '"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>' +
      '<span><span class="sp-label">' + esc(t('chapterN', { n: ch.n })) + ':</span> ' + esc(L(ch)) + '</span></a>';
  }
  function cellHtml(x, y) {
    var g = state.g, i = idx(x, y), here = x === g.x && y === g.y, what = g.cells[i];
    var cls = 'dg-cell', name, inner = '';
    if (y === H - 1) cls += ' reserve';
    if (g.echo && g.echo[i]) cls += ' echo';
    if (here) { cls += ' here'; name = 'c_dolphin'; inner = pic('dolphin'); }
    else if (!g.seen[i] && y !== H - 1) { cls += ' murky'; name = 'c_murky'; }
    else if (what) { cls += ' ' + what; name = 'c_' + what; inner = pic(what); }
    else { cls += ' clear'; name = y === H - 1 ? 'c_reserve' : 'c_water'; }
    var near = Math.abs(x - g.x) + Math.abs(y - g.y) === 1;
    return '<button type="button" class="' + cls + '" data-x="' + x + '" data-y="' + y + '"' + (near && !g.over ? '' : ' tabindex="-1"') +
      ' aria-label="' + esc(t(name)) + '">' + inner + '</button>';
  }
  function boardHtml() {
    var rows = '';
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) rows += cellHtml(x, y);
    return rows;
  }
  function statusHtml() {
    var g = state.g, hearts = '';
    for (var i = 0; i < LIVES; i++) hearts += '<span class="dg-heart' + (i < g.health ? '' : ' off') + '" aria-hidden="true">♥</span>';
    return '<div class="dg-stats">' +
        '<p><span class="muted small">' + esc(t('health')) + '</span><b>' + hearts + '<span class="sr">' + g.health + '/' + LIVES + '</span></b></p>' +
        '<p><span class="muted small">' + esc(t('fish')) + '</span><b>' + g.fish + '</b></p>' +
        '<p><span class="muted small">' + esc(t('clicks')) + '</span><b>' + g.clicks + '</b></p>' +
        '<p><span class="muted small">' + esc(t('moves')) + '</span><b>' + g.moves + '</b></p></div>' +
      '<p class="dg-msg' + (g.won ? ' won' : g.over ? ' lost' : '') + '" role="status">' + esc(t(g.msg, g.vars)) + '</p>';
  }
  function drawGame(focusCell) {
    document.getElementById('dg-board').innerHTML = boardHtml();
    document.getElementById('dg-status').innerHTML = statusHtml();
    [].forEach.call(document.querySelectorAll('[data-move], [data-act="ping"]'), function (b) { b.disabled = state.g.over; });
    if (focusCell) {
      var here = document.querySelector('.dg-cell.here');
      if (here) here.focus();
    }
  }
  function legendItem(type, name) {
    return '<li><span class="dg-cell dg-mini ' + type + '">' + (PICS[type] ? pic(type) : '') + '</span>' + esc(t(name)) + '</li>';
  }
  function render() {
    main.innerHTML =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> ' +
        '<a href="/sindh/">' + esc(t('sindh')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="sp-hero"><div class="sp-band" aria-hidden="true"></div><div class="sp-hero-in">' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div></section>' +
      '<section class="card dg-game">' +
        '<div class="dg-head"><div id="dg-status"></div>' +
          '<button type="button" class="btn big dg-ping" data-act="ping">' + esc(t('ping')) + '</button></div>' +
        '<div class="dg-board" id="dg-board" dir="ltr" role="group" aria-label="' + esc(t('board')) + '"></div>' +
        '<div class="dg-controls">' +
          '<div class="dg-pad" dir="ltr">' +
            '<button type="button" class="btn ghost" data-move="up" aria-label="' + esc(t('up')) + '">' + arrow('up') + '</button>' +
            '<button type="button" class="btn ghost" data-move="left" aria-label="' + esc(t('left')) + '">' + arrow('left') + '</button>' +
            '<button type="button" class="btn ghost" data-move="down" aria-label="' + esc(t('down')) + '">' + arrow('down') + '</button>' +
            '<button type="button" class="btn ghost" data-move="right" aria-label="' + esc(t('right')) + '">' + arrow('right') + '</button>' +
          '</div>' +
          '<div class="btn-row"><button type="button" class="btn ghost small" data-act="new">' + esc(t('newGame')) + '</button>' +
            '<button type="button" class="btn ghost small" data-act="sound" aria-pressed="' + state.sound + '">' + esc(t(state.sound ? 'soundOn' : 'soundOff')) + '</button></div>' +
          '<ul class="dg-legend">' + legendItem('here', 'c_dolphin') + legendItem('murky', 'c_murky') + legendItem('net', 'c_net') +
            legendItem('plastic', 'c_plastic') + legendItem('dirty', 'c_dirty') + legendItem('fish', 'c_fish') + legendItem('reserve', 'c_reserve') + '</ul>' +
        '</div>' +
      '</section>' +
      '<div class="dg-learn">' +
        '<section class="card"><h2>' + esc(t('howTitle')) + '</h2><ol>' + L(T.how).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>' +
        '<section class="card"><h2>' + esc(t('learnTitle')) + '</h2><p>' + esc(t('learnText')) + '</p>' +
          '<h3>' + esc(t('helpTitle')) + '</h3><ul>' + L(T.help).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
          '<p class="sp-label">' + esc(t('inBook')) + '</p><div class="dg-chaps">' + chapterLink('light-sound') + chapterLink('pollution') + chapterLink('living-things') + '</div></section>' +
      '</div>';
    drawGame(false);
  }

  /* ---------- events ---------- */

  var STEP = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
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
    var m = e.target.closest('[data-move]');
    if (m) { move(STEP[m.getAttribute('data-move')][0], STEP[m.getAttribute('data-move')][1]); drawGame(false); return; }
    var c = e.target.closest('.dg-board .dg-cell');
    if (c) {
      var dx = +c.getAttribute('data-x') - state.g.x, dy = +c.getAttribute('data-y') - state.g.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) { move(dx, dy); drawGame(true); }
      return;
    }
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'ping') { ping(); drawGame(false); }
    else if (act === 'new') { newRiver(); drawGame(false); }
    else if (act === 'sound') {
      state.sound = !state.sound;
      try { localStorage.setItem('ssp1.dolphinSound', state.sound ? 'on' : 'off'); } catch (err) { /* this visit only */ }
      a.setAttribute('aria-pressed', String(state.sound));
      a.textContent = t(state.sound ? 'soundOn' : 'soundOff');
    }
  });
  // Arrow keys move and the space bar clicks while the game has the focus.
  document.addEventListener('keydown', function (e) {
    if (!state.g || !e.target.closest || !e.target.closest('.dg-game')) return;
    var d = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
    if (d) { e.preventDefault(); move(STEP[d][0], STEP[d][1]); drawGame(!!e.target.closest('.dg-board')); }
    else if (e.key === ' ' && !e.target.closest('button[data-act], button[data-move]')) { e.preventDefault(); ping(); drawGame(true); }
  });

  applyLang();
  newRiver();
  render();
})();
