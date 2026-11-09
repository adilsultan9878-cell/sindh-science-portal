/* Sindh Science Learning Portal — District Science League (/league/).
   No second contest: every result of the timed competition (/competition, table "leaderboard") counts for the
   district the child chose. Database: league_month(p_month) works out the weekly matches, the monthly table and
   last month's winner of the Sindh Science Ajrak Trophy (see tools/league/league_month.sql). */
(function () {
  'use strict';

  var LANGS = ['sd', 'ur', 'en'];
  var RTL = { sd: true, ur: true, en: false };
  var CFG = window.PORTAL_CONFIG || null;

  var T = {
    siteName: { sd: 'سنڌ سائنس سکيا پورٽل', ur: 'سندھ سائنس لرننگ پورٹل', en: 'Sindh Science Learning Portal' },
    home: { sd: 'گهر', ur: 'ہوم', en: 'Home' },
    title: { sd: 'ضلعن جي سائنس ليگ', ur: 'اضلاع کی سائنس لیگ', en: 'District Science League' },
    eyebrow: { sd: 'هر مهيني · سڄي سنڌ', ur: 'ہر مہینے · پورا سندھ', en: 'Every month · all of Sindh' },
    lead: {
      sd: 'هر هفتي هڪ ضلعو ٻئي ضلعي سان مقابلو ڪري ٿو، جيئن لاڙڪاڻو بمقابلو حيدرآباد. مقابلي ۾ پنهنجو ضلعو چونڊي کيڏو ۽ پنهنجي ضلعي کي کٽايو!',
      ur: 'ہر ہفتے ایک ضلع دوسرے ضلع کے مقابلے میں آتا ہے، جیسے لاڑکانہ بمقابلہ حیدرآباد۔ مقابلے میں اپنا ضلع چن کر کھیلیں اور اپنے ضلع کو جتوائیں!',
      en: 'Every week one district takes on another, like Larkana vs Hyderabad. Choose your district in the competition, play, and help your district win!'
    },
    play: { sd: 'مقابلو کيڏو', ur: 'مقابلہ کھیلیں', en: 'Play the competition' },
    leaderboard: { sd: 'ليڊر بورڊ', ur: 'لیڈر بورڈ', en: 'Leaderboard' },
    trophy: { sd: 'سنڌ سائنس اجرڪ ٽرافي', ur: 'سندھ سائنس اجرک ٹرافی', en: 'Sindh Science Ajrak Trophy' },
    winnerOf: { sd: '{m} جو فاتح ضلعو', ur: '{m} کا فاتح ضلع', en: 'Winning district of {m}' },
    winnerLine: { sd: '{p} پوائنٽس · سراسري اسڪور {s}%', ur: '{p} پوائنٹس · اوسط اسکور {s}%', en: '{p} points · average score {s}%' },
    noWinner: {
      sd: 'هن مهيني جي آخر ۾ سڀ کان وڌيڪ پوائنٽس وارو ضلعو هيءَ ٽرافي کٽيندو. ڇا اهو توهان جو ضلعو هوندو؟',
      ur: 'اس مہینے کے آخر میں سب سے زیادہ پوائنٹس والا ضلع یہ ٹرافی جیتے گا۔ کیا وہ آپ کا ضلع ہوگا؟',
      en: 'At the end of this month the district with the most points wins this trophy. Will it be yours?'
    },
    matchesTitle: { sd: 'هن هفتي جا مقابلا', ur: 'اس ہفتے کے مقابلے', en: 'This week\'s matches' },
    roundN: { sd: 'رائونڊ {n}', ur: 'راؤنڈ {n}', en: 'Round {n}' },
    roundDates: { sd: '{a} کان {b} تائين', ur: '{a} سے {b} تک', en: '{a} to {b}' },
    vs: { sd: 'بمقابلو', ur: 'بمقابلہ', en: 'vs' },
    players: { sd: '{n} ٻار', ur: '{n} بچے', en: '{n} players' },
    needMore: { sd: 'گهٽ ۾ گهٽ 5 ٻار گهرجن', ur: 'کم از کم 5 بچے چاہئیں', en: 'needs at least 5 players' },
    live: { sd: 'هاڻي هلندڙ', ur: 'ابھی جاری', en: 'Live now' },
    done: { sd: 'پورو ٿيو', ur: 'مکمل', en: 'Finished' },
    soon: { sd: 'اڃا شروع نه ٿيو', ur: 'ابھی شروع نہیں ہوا', en: 'Not started yet' },
    leading: { sd: '{x} اڳيان آهي', ur: '{x} آگے ہے', en: '{x} is ahead' },
    won: { sd: '{x} کٽيو', ur: '{x} جیت گیا', en: '{x} won' },
    drawLive: { sd: 'هن وقت برابر', ur: 'ابھی برابر', en: 'Level right now' },
    draw: { sd: 'برابر', ur: 'برابر', en: 'Draw' },
    noPlay: { sd: 'اڃا ڪنهن ضلعي جا 5 ٻار نه کيڏيا', ur: 'ابھی کسی ضلع کے 5 بچے نہیں کھیلے', en: 'Neither side has 5 players yet' },
    showAll: { sd: 'سڀ {n} مقابلا ڏسو', ur: 'تمام {n} مقابلے دیکھیں', en: 'See all {n} matches' },
    tableTitle: { sd: '{m} جي ليگ ٽيبل', ur: '{m} کی لیگ ٹیبل', en: 'League table for {m}' },
    tableNote: { sd: 'پوائنٽس پورن ٿيل هفتن جا آهن. اسڪور = مهيني جي بهترين 20 ٻارن جو سراسري.', ur: 'پوائنٹس مکمل ہفتوں کے ہیں۔ اسکور = مہینے کے بہترین 20 بچوں کا اوسط۔', en: 'Points are from finished weeks. Score = average of the month\'s best 20 players.' },
    noTable: { sd: 'هن مهيني اڃا ڪو نتيجو ناهي. پهريون نتيجو توهان جو ٿي سگهي ٿو!', ur: 'اس مہینے ابھی کوئی نتیجہ نہیں۔ پہلا نتیجہ آپ کا ہو سکتا ہے!', en: 'No results this month yet. The first one could be yours!' },
    rank: { sd: 'نمبر', ur: 'نمبر', en: '#' },
    district: { sd: 'ضلعو', ur: 'ضلع', en: 'District' },
    pl: { sd: 'کيڏيا', ur: 'کھیلے', en: 'P' },
    w: { sd: 'کٽيا', ur: 'جیتے', en: 'W' },
    d: { sd: 'برابر', ur: 'برابر', en: 'D' },
    l: { sd: 'هارايا', ur: 'ہارے', en: 'L' },
    pts: { sd: 'پوائنٽس', ur: 'پوائنٹس', en: 'Pts' },
    score: { sd: 'اسڪور', ur: 'اسکور', en: 'Score' },
    kids: { sd: 'ٻار', ur: 'بچے', en: 'Players' },
    rulesTitle: { sd: 'ليگ جا اصول (سادا لفظن ۾)', ur: 'لیگ کے اصول (آسان الفاظ میں)', en: 'League rules (in simple words)' },
    rules: {
      sd: [
        'ڪو الڳ مقابلو ناهي. /competition تي مقابلو کيڏيو ۽ پنهنجو ضلعو چونڊيو. توهان جو اسڪور توهان جي ضلعي لاءِ ڳڻبو.',
        'هر مهيني 4 رائونڊ ٿين ٿا: تاريخ 1 کان 7، 8 کان 14، 15 کان 21 ۽ 22 کان مهيني جي آخر تائين. هر رائونڊ ۾ هر ضلعو ڪنهن ٻئي ضلعي سان مقابلو ڪري ٿو.',
        'ضلعي جو اسڪور = ان رائونڊ ۾ ضلعي جي بهترين 20 ٻارن جي اسڪورن جو سراسري. هر ٻار جو رڳو سڀ کان سٺو اسڪور ڳڻجي ٿو.',
        'مقابلي لاءِ ضلعي جا گهٽ ۾ گهٽ 5 ٻار کيڏڻ گهرجن. جيڪڏهن رڳو هڪ ضلعي جا 5 ٻار هجن ته اهو ضلعو کٽي ٿو.',
        'کٽڻ تي 3 پوائنٽس، برابر تي 1 پوائنٽ (اسڪور ۾ اڌ سيڪڙو يا گهٽ فرق) ۽ هارڻ تي 0.',
        'مهيني جي آخر ۾ سڀ کان وڌيڪ پوائنٽس وارو ضلعو "سنڌ سائنس اجرڪ ٽرافي" کٽي ٿو. پوائنٽس برابر هجن ته مهيني جو اسڪور ڏٺو وڃي ٿو.'
      ],
      ur: [
        'کوئی الگ مقابلہ نہیں۔ /competition پر مقابلہ کھیلیں اور اپنا ضلع چنیں۔ آپ کا اسکور آپ کے ضلع کے لیے گنا جائے گا۔',
        'ہر مہینے 4 راؤنڈ ہوتے ہیں: تاریخ 1 سے 7، 8 سے 14، 15 سے 21 اور 22 سے مہینے کے آخر تک۔ ہر راؤنڈ میں ہر ضلع کسی دوسرے ضلع کے مقابلے میں آتا ہے۔',
        'ضلع کا اسکور = اس راؤنڈ میں ضلع کے بہترین 20 بچوں کے اسکور کا اوسط۔ ہر بچے کا صرف سب سے اچھا اسکور گنا جاتا ہے۔',
        'مقابلے کے لیے ضلع کے کم از کم 5 بچوں کا کھیلنا ضروری ہے۔ اگر صرف ایک ضلع کے 5 بچے ہوں تو وہی ضلع جیتتا ہے۔',
        'جیت پر 3 پوائنٹس، برابری پر 1 پوائنٹ (اسکور میں آدھا فیصد یا کم فرق) اور ہار پر 0۔',
        'مہینے کے آخر میں سب سے زیادہ پوائنٹس والا ضلع "سندھ سائنس اجرک ٹرافی" جیتتا ہے۔ پوائنٹس برابر ہوں تو مہینے کا اسکور دیکھا جاتا ہے۔'
      ],
      en: [
        'There is no extra contest. Play the competition at /competition and choose your district. Your score counts for your district.',
        'Each month has 4 rounds: days 1 to 7, 8 to 14, 15 to 21, and 22 to the end of the month. In every round each district meets another district.',
        'A district\'s score = the average of its best 20 players in that round. Only each player\'s best score counts.',
        'A district needs at least 5 players to take part in a match. If only one side has 5 players, that side wins.',
        'A win gets 3 points, a draw 1 point (scores half a percent or less apart), a loss 0.',
        'At the end of the month the district with the most points wins the "Sindh Science Ajrak Trophy". If points are level, the month\'s score decides.'
      ]
    },
    offline: { sd: 'ليگ ڏسڻ لاءِ انٽرنيٽ گهرجي. انٽرنيٽ چيڪ ڪري صفحو ٻيهر کوليو.', ur: 'لیگ دیکھنے کے لیے انٹرنیٹ چاہیے۔ انٹرنیٹ چیک کر کے صفحہ دوبارہ کھولیں۔', en: 'You need the internet to see the league. Check your internet and open the page again.' },
    retry: { sd: 'ٻيهر ڪوشش ڪريو', ur: 'دوبارہ کوشش کریں', en: 'Try again' }
  };
  var MONTHS = {
    sd: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
    ur: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  var main = document.getElementById('main');
  var state = { lang: 'sd', data: null, error: false, round: null, all: false };
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
  function city(id) {
    var c = (window.CITIES || []).filter(function (x) { return x.id === id; })[0];
    return c ? (c[state.lang] || c.en) : (id || '');
  }
  function monthName(ym) {
    if (!ym) return '';
    var p = ym.split('-');
    return MONTHS[state.lang][Number(p[1]) - 1] + ' ' + p[0];
  }
  function dayLabel(iso) {
    var p = String(iso).split('-');
    return Number(p[2]) + ' ' + MONTHS[state.lang][Number(p[1]) - 1];
  }
  function pct(n) { return n == null ? '—' : (Math.round(Number(n) * 10) / 10).toString(); }

  function rpc(fn, args) {
    return fetch(CFG.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: CFG.supabaseKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      if (!r.ok) throw new Error('Error ' + r.status);
      return r.json();
    });
  }

  /* ---------- the trophy: an original cup wrapped in an ajrak pattern (crimson, indigo, white stars) ---------- */

  function trophySvg() {
    return '<svg class="lg-trophy" viewBox="0 0 200 230" role="img" aria-label="' + esc(t('trophy')) + '">' +
      '<defs>' +
        '<pattern id="lg-ajrak" width="24" height="24" patternUnits="userSpaceOnUse">' +
          '<rect width="24" height="24" fill="#a3161c"/>' +
          '<path d="M12 2 22 12 12 22 2 12z" fill="#1d2a5c"/>' +
          '<path d="M12 6.5 17.5 12 12 17.5 6.5 12z" fill="#a3161c"/>' +
          '<circle cx="12" cy="12" r="2.2" fill="#fff"/>' +
          '<circle cx="0" cy="0" r="1.6" fill="#fff"/><circle cx="24" cy="0" r="1.6" fill="#fff"/>' +
          '<circle cx="0" cy="24" r="1.6" fill="#fff"/><circle cx="24" cy="24" r="1.6" fill="#fff"/>' +
          '<path d="M12 0v2.5M12 21.5V24M0 12h2.5M21.5 12H24" stroke="#111" stroke-width="1.2"/>' +
        '</pattern>' +
        '<linearGradient id="lg-gold" x1="0" x2="1"><stop offset="0" stop-color="#b8860b"/><stop offset=".5" stop-color="#f2c94c"/><stop offset="1" stop-color="#b8860b"/></linearGradient>' +
      '</defs>' +
      // handles
      '<path d="M48 40C14 40 14 98 58 104" fill="none" stroke="url(#lg-gold)" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M152 40C186 40 186 98 142 104" fill="none" stroke="url(#lg-gold)" stroke-width="9" stroke-linecap="round"/>' +
      // cup with ajrak
      '<path d="M44 26h112v30c0 38-25 64-56 64S44 94 44 56z" fill="url(#lg-ajrak)" stroke="url(#lg-gold)" stroke-width="5"/>' +
      '<path d="M44 26h112" stroke="url(#lg-gold)" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M50 44h100" stroke="#fff" stroke-width="2" stroke-dasharray="3 4" opacity=".8"/>' +
      // a leaf for science, the site's own mark
      '<circle cx="100" cy="70" r="17" fill="#fff" stroke="url(#lg-gold)" stroke-width="3"/>' +
      '<path d="M91 79c0-11 7-17 18-17 0 11-6 17-18 17z" fill="#1e7a3c"/><path d="M92 78 101 69" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' +
      // stem and base
      '<path d="M90 120h20l-4 30H94z" fill="url(#lg-gold)"/>' +
      '<rect x="66" y="150" width="68" height="12" rx="4" fill="url(#lg-gold)"/>' +
      '<rect x="54" y="162" width="92" height="40" rx="6" fill="url(#lg-ajrak)" stroke="url(#lg-gold)" stroke-width="4"/>' +
      '<rect x="68" y="173" width="64" height="18" rx="3" fill="#fff8e1" stroke="#b8860b" stroke-width="1.5"/>' +
      '<path d="M76 182h48" stroke="#b8860b" stroke-width="2" stroke-linecap="round"/>' +
      '<rect x="44" y="202" width="112" height="10" rx="4" fill="url(#lg-gold)"/>' +
    '</svg>';
  }

  /* ---------- page parts ---------- */

  function trophyCard(d) {
    var w = d.last_winner;
    return '<section class="card lg-cup">' + trophySvg() +
      '<div class="lg-cup-text"><p class="eyebrow">' + esc(t('trophy')) + '</p>' +
      (w ? '<p class="lg-cup-label">' + esc(t('winnerOf', { m: monthName(d.last_month) })) + '</p>' +
           '<p class="lg-cup-name">' + esc(city(w.city)) + '</p>' +
           '<p class="muted">' + esc(t('winnerLine', { p: w.points, s: pct(w.score) })) + '</p>'
         : '<p>' + esc(t('noWinner')) + '</p>') +
      '</div></section>';
  }

  function side(name, score, players, isWin) {
    return '<div class="lg-side' + (isWin ? ' win' : '') + '"><span class="lg-dist">' + esc(city(name)) + '</span>' +
      '<span class="lg-score">' + (players >= 5 ? pct(score) + '%' : '—') + '</span>' +
      '<span class="lg-kids">' + esc(players >= 5 ? t('players', { n: players }) : (players ? t('players', { n: players }) + ' · ' : '') + t('needMore')) + '</span></div>';
  }

  function matchCard(m) {
    var res;
    if (m.status === 'soon') res = t('soon');
    else if (!m.winner) res = t('noPlay');
    else if (m.winner === 'draw') res = m.status === 'live' ? t('drawLive') : t('draw');
    else res = t(m.status === 'live' ? 'leading' : 'won', { x: city(m.winner) });
    return '<article class="lg-match ' + m.status + '">' +
      '<div class="lg-sides">' + side(m.a, m.a_score, m.a_players, m.winner === m.a) +
        '<span class="lg-vs">' + esc(t('vs')) + '</span>' + side(m.b, m.b_score, m.b_players, m.winner === m.b) + '</div>' +
      '<p class="lg-res"><span class="lg-pill">' + esc(t(m.status)) + '</span> ' + esc(res) + '</p></article>';
  }

  function matchesSection(d) {
    var r = state.round || d.round || 4;
    var info = d.rounds[r - 1];
    var list = d.matches.filter(function (m) { return m.round === r; });
    // matches with players first, so children see the real contests at the top
    list.sort(function (x, y) { return (y.a_players + y.b_players) - (x.a_players + x.b_players); });
    var active = list.filter(function (m) { return m.a_players + m.b_players > 0; });
    var shown = state.all ? list : (active.length ? active : list.slice(0, 4));
    return '<section class="lg-matches" id="matches"><h2>' + esc(t('matchesTitle')) + '</h2>' +
      '<div class="lg-rounds no-print" role="group">' + d.rounds.map(function (x) {
        return '<button type="button" class="lg-round" data-round="' + x.round + '" aria-pressed="' + (x.round === r) + '">' + esc(t('roundN', { n: x.round })) + '</button>';
      }).join('') + '</div>' +
      '<p class="muted small">' + esc(t('roundN', { n: r })) + ': ' + esc(t('roundDates', { a: dayLabel(info.from), b: dayLabel(info.to) })) + '</p>' +
      '<div class="lg-grid">' + shown.map(matchCard).join('') + '</div>' +
      (shown.length < list.length ? '<p><button type="button" class="btn ghost" data-act="all">' + esc(t('showAll', { n: list.length })) + '</button></p>' : '') +
      '</section>';
  }

  function tableSection(d) {
    var rows = d.table.filter(function (x) { return x.players > 0 || x.points > 0; });
    return '<section class="card lg-table"><h2>' + esc(t('tableTitle', { m: monthName(d.month) })) + '</h2>' +
      '<p class="muted small">' + esc(t('tableNote')) + '</p>' +
      (rows.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>' + esc(t('rank')) + '</th><th>' + esc(t('district')) + '</th><th>' +
        esc(t('pl')) + '</th><th>' + esc(t('w')) + '</th><th>' + esc(t('d')) + '</th><th>' + esc(t('l')) + '</th><th>' + esc(t('pts')) + '</th><th>' +
        esc(t('score')) + '</th><th>' + esc(t('kids')) + '</th></tr></thead><tbody>' +
        rows.map(function (x, i) {
          return '<tr' + (i === 0 && x.points > 0 ? ' class="lg-top"' : '') + '><td>' + (i + 1) + '</td><td>' + esc(city(x.city)) + '</td><td>' + x.played + '</td><td>' + x.won +
            '</td><td>' + x.drawn + '</td><td>' + x.lost + '</td><td><b>' + x.points + '</b></td><td>' + pct(x.score) + '</td><td>' + x.players + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<p>' + esc(t('noTable')) + '</p>') +
      '</section>';
  }

  function rulesSection() {
    return '<section class="card lg-rules"><h2>' + esc(t('rulesTitle')) + '</h2><ol>' +
      L(T.rules).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>';
  }

  function render() {
    var d = state.data;
    var html =
      '<nav class="crumbs no-print" aria-label="breadcrumb"><a href="/">' + esc(t('home')) + '</a> <span aria-hidden="true">›</span> <span>' + esc(t('title')) + '</span></nav>' +
      '<section class="lg-hero"><div class="lg-band" aria-hidden="true"></div>' +
        '<p class="eyebrow">' + esc(t('eyebrow')) + '</p><h1>' + esc(t('title')) + '</h1><p class="lead">' + esc(t('lead')) + '</p>' +
        '<div class="btn-row no-print"><a class="btn" href="/competition">' + esc(t('play')) + '</a><a class="btn ghost" href="/leaderboard">' + esc(t('leaderboard')) + '</a></div>' +
      '</section>';
    if (state.error) {
      html += '<section class="card"><p>' + esc(t('offline')) + '</p><button type="button" class="btn" data-act="retry">' + esc(t('retry')) + '</button></section>';
    } else if (!d) {
      html += '<p class="loading">…</p>';
    } else {
      html += trophyCard(d) + matchesSection(d) + tableSection(d);
    }
    main.innerHTML = html + rulesSection();
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

  function load() {
    state.error = false;
    if (!CFG) { state.error = true; render(); return; }
    rpc('league_month', {}).then(function (d) {
      state.data = d;
      render();
    }).catch(function () { state.error = true; render(); });
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
    var r = e.target.closest('[data-round]');
    if (r) { state.round = Number(r.getAttribute('data-round')); state.all = false; render(); return; }
    if (e.target.closest('[data-act="all"]')) { state.all = true; render(); return; }
    if (e.target.closest('[data-act="retry"]')) { render(); load(); }
  });

  applyLang();
  render();
  load();
})();
