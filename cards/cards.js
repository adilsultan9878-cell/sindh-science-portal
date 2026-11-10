/* Flash cards (/cards/): the key words of each chapter. The front shows the word in the reader's language; a tap
   turns the card and shows it in all three languages, with its recorded voice (audio/index.json) when there is one.
   "I know it" puts the card aside, "Again" sends it to the back of the pile. Known words are kept on the phone. */
(function () {
  'use strict';

  var K = window.Kit, esc = K.esc, L = K.L;
  var T = {
    title: { sd: 'فليش ڪارڊ', ur: 'فلیش کارڈز', en: 'Flash cards' },
    lead: {
      sd: 'هر باب جا اهم لفظ. ڪارڊ تي ٽيپ ڪريو ته ٽنهي ٻولين ۾ لفظ ڏسو ۽ ٻڌو.',
      ur: 'ہر باب کے اہم الفاظ۔ کارڈ پر ٹیپ کریں اور تینوں زبانوں میں لفظ دیکھیں اور سنیں۔',
      en: 'The key words of each chapter. Tap a card to see and hear the word in all three languages.'
    },
    pick: { sd: 'باب چونڊيو', ur: 'باب چنیں', en: 'Choose a chapter' },
    words: { sd: '{n} لفظ', ur: '{n} الفاظ', en: '{n} words' },
    known: { sd: '{n} ياد', ur: '{n} یاد', en: '{n} known' },
    tap: { sd: 'ڪارڊ ڦيرائڻ لاءِ ٽيپ ڪريو', ur: 'کارڈ پلٹنے کے لیے ٹیپ کریں', en: 'Tap to turn the card' },
    turn: { sd: 'ڪارڊ ڦيرايو', ur: 'کارڈ پلٹیں', en: 'Turn the card' },
    know: { sd: 'مون کي اچي ٿو', ur: 'مجھے آتا ہے', en: 'I know it' },
    again: { sd: 'ٻيهر ڏيکاريو', ur: 'دوبارہ دکھائیں', en: 'Show again' },
    left: { sd: '{n} ڪارڊ باقي', ur: '{n} کارڈ باقی', en: '{n} cards left' },
    allDone: { sd: 'شاباس! هن باب جا سڀ لفظ ياد ٿي ويا.', ur: 'شاباش! اس باب کے سب الفاظ یاد ہو گئے۔', en: 'Well done! You know all the words of this chapter.' },
    restart: { sd: 'ٻيهر شروع ڪريو', ur: 'دوبارہ شروع کریں', en: 'Start again' },
    others: { sd: 'ٻيو باب', ur: 'دوسرا باب', en: 'Another chapter' },
    listen: { sd: 'ٻڌو', ur: 'سنیں', en: 'Listen' },
    toLesson: { sd: 'سبق ۾ ڏسو', ur: 'سبق میں دیکھیں', en: 'See it in the lesson' },
    loadError: { sd: 'لفظ لوڊ نه ٿي سگهيا. انٽرنيٽ چيڪ ڪري ٻيهر ڪوشش ڪريو.', ur: 'الفاظ لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کر کے دوبارہ کوشش کریں۔', en: 'Could not load the words. Check the internet and try again.' }
  };
  function t(k, v) { return K.text(T, k, v); }
  var LANG_NAME = { sd: 'سنڌي', ur: 'اردو', en: 'English' };

  var main = document.getElementById('main');
  var chs = [], deck = null, audio = null, player = null;
  fetch('/audio/index.json').then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) { audio = j; }).catch(function () { audio = {}; });

  function icon(d) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>'; }
  var I = { cards: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>', vol: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    check: '<path d="M5 12l4 4 10-10"/>', again: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/>', flip: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>' };
  function crumbs(extra) {
    return '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(K.text(null, 'home')) + '</a> <span aria-hidden="true">›</span> ' +
      (extra ? '<a href="/cards/">' + esc(t('title')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(extra) + '</span>' : '<span>' + esc(t('title')) + '</span>') + '</nav>';
  }
  function knownOf(ch) { var all = K.load('cards', {}) || {}; return all[ch._key] || []; }
  function setKnown(ch, list) { var all = K.load('cards', {}) || {}; all[ch._key] = list; K.save('cards', all); }
  function wordId(w) { return (w.en || w.ur || w.sd || '').toLowerCase(); }

  /* ---------- chapter list ---------- */

  function list() {
    deck = null;
    K.applyLang(t('title'));
    main.innerHTML = crumbs() +
      '<section class="card fc-hero"><span class="icon-tile fc-icon">' + icon(I.cards) + '</span><div><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p></div></section>' +
      '<h2>' + esc(t('pick')) + '</h2><div class="fc-chs">' + chs.filter(function (c) { return (c.glossary || []).length; }).map(function (c) {
        var n = c.glossary.length, k = knownOf(c).length;
        return '<button type="button" class="card fc-ch" data-ch="' + esc(c.id) + '"><span class="eyebrow">' + esc(K.text(null, 'chapterN', { n: c._n })) + '</span>' +
          '<strong>' + esc(L(c.title)) + '</strong><span class="muted small">' + esc(t('words', { n: n })) + ' · ' + esc(t('known', { n: k })) + '</span>' +
          '<span class="pbar"><span style="width:' + Math.round(100 * k / n) + '%"></span></span></button>';
      }).join('') + '</div>';
  }

  /* ---------- one chapter's pile ---------- */

  function open(ch) {
    var known = knownOf(ch);
    var pile = K.shuffle((ch.glossary || []).filter(function (w) { return known.indexOf(wordId(w)) < 0; }));
    deck = { ch: ch, pile: pile, flipped: false, total: ch.glossary.length };
    draw();
  }
  function say(lang, text) {
    var file = audio && audio[lang] && audio[lang][text];
    if (player) player.pause();
    if (file) { player = new Audio('/audio/' + file); player.play().catch(function () {}); return; }
    if (window.speechSynthesis) {
      var v = speechSynthesis.getVoices().filter(function (x) { return x.lang.toLowerCase().indexOf(lang) === 0; })[0];
      if (!v) return;
      var u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; speechSynthesis.speak(u);
    }
  }
  function canSay(lang, text) {
    if (audio && audio[lang] && audio[lang][text]) return true;
    return !!(window.speechSynthesis && speechSynthesis.getVoices().some(function (x) { return x.lang.toLowerCase().indexOf(lang) === 0; }));
  }
  function draw() {
    var ch = deck.ch, lang = K.state.lang, k = knownOf(ch).length;
    K.applyLang(t('title') + ' · ' + L(ch.title));
    var head = crumbs(L(ch.title)) + '<div class="fc-top"><h1>' + esc(L(ch.title)) + '</h1><span class="muted">' + esc(t('known', { n: k })) + ' / ' + deck.total + '</span></div>' +
      '<span class="pbar fc-bar"><span style="width:' + Math.round(100 * k / deck.total) + '%"></span></span>';
    if (!deck.pile.length) {
      main.innerHTML = head + '<section class="card fc-done"><p class="fc-big">🎉</p><h2>' + esc(t('allDone')) + '</h2><div class="btn-row">' +
        '<button type="button" class="btn" data-restart>' + icon(I.again) + esc(t('restart')) + '</button>' +
        '<button type="button" class="btn ghost" data-list>' + esc(t('others')) + '</button></div></section>';
      return;
    }
    var w = deck.pile[0], other = ['sd', 'ur', 'en'].filter(function (l) { return l !== lang; });
    main.innerHTML = head +
      '<p class="muted small fc-left">' + esc(t('left', { n: deck.pile.length })) + '</p>' +
      '<div class="fc-card' + (deck.flipped ? ' flipped' : '') + '" role="button" tabindex="0" aria-label="' + esc(t('turn')) + '" data-flip>' +
        '<div class="fc-face fc-front"><span class="fc-word" lang="' + lang + '">' + esc(w[lang] || w.ur || w.en) + '</span><span class="muted small">' + esc(t('tap')) + '</span></div>' +
        '<div class="fc-face fc-back">' + [lang].concat(other).map(function (l) {
          var word = w[l];
          if (!word) return '';
          return '<div class="fc-row"><span class="fc-lang">' + LANG_NAME[l] + '</span><span class="fc-word small" lang="' + l + '" dir="' + (l === 'en' ? 'ltr' : 'rtl') + '">' + esc(word) + '</span>' +
            (canSay(l, word) ? '<button type="button" class="btn ghost small fc-say" data-say="' + l + '" aria-label="' + esc(t('listen')) + '">' + icon(I.vol) + '</button>' : '') + '</div>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="fc-actions">' +
        (deck.flipped
          ? '<button type="button" class="btn ghost big" data-again>' + icon(I.again) + esc(t('again')) + '</button><button type="button" class="btn big" data-know>' + icon(I.check) + esc(t('know')) + '</button>'
          : '<button type="button" class="btn big" data-flip>' + icon(I.flip) + esc(t('turn')) + '</button>') +
      '</div>' +
      '<p class="fc-links"><a href="' + K.chapterUrl(ch, 'words') + '">' + esc(t('toLesson')) + '</a> · <a href="/cards/" data-list>' + esc(t('others')) + '</a></p>';
  }

  main.addEventListener('click', function (e) {
    var c = e.target.closest('[data-ch]');
    if (c) { open(chs.filter(function (x) { return x.id === c.getAttribute('data-ch'); })[0]); window.scrollTo(0, 0); return; }
    if (e.target.closest('[data-list]')) { e.preventDefault(); list(); return; }
    if (!deck) return;
    var s = e.target.closest('[data-say]');
    if (s) { e.stopPropagation(); say(s.getAttribute('data-say'), deck.pile[0][s.getAttribute('data-say')]); return; }
    if (e.target.closest('[data-flip]')) { deck.flipped = !deck.flipped; draw(); return; }
    if (e.target.closest('[data-know]')) {
      var w = deck.pile.shift(), known = knownOf(deck.ch);
      if (known.indexOf(wordId(w)) < 0) known.push(wordId(w));
      setKnown(deck.ch, known); deck.flipped = false; draw(); return;
    }
    if (e.target.closest('[data-again]')) { deck.pile.push(deck.pile.shift()); deck.flipped = false; draw(); return; }
    if (e.target.closest('[data-restart]')) { setKnown(deck.ch, []); open(deck.ch); }
  });
  main.addEventListener('keydown', function (e) {
    if (!deck || !e.target.closest('.fc-card')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deck.flipped = !deck.flipped; draw(); var c = main.querySelector('.fc-card'); if (c) c.focus(); }
  });

  K.onLang(function () { if (deck) draw(); else list(); });
  K.applyLang(t('title'));
  K.chapters().then(function (l) {
    chs = l;
    var want = (location.search.match(/[?&]ch=([\w-]+)/) || [])[1], ch = want && chs.filter(function (x) { return x.id === want; })[0];
    if (ch) open(ch); else list();
  }).catch(function () { main.innerHTML = crumbs() + '<p class="card note">' + esc(t('loadError')) + '</p>'; });
})();
