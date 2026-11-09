"""Hooks Sindh Citizen Science (/citizen/, js/citizen.js) into the site:
- ui-text.js: texts for the home page card
- app.js: a "Citizen Science" tile on the home Sindh shelf and in the More menu, real page loads for /citizen
- sw.js: leaves /citizen to the network
- vercel.json: /citizen is not rewritten to the app
- school.js: the school dashboard shows the Citizen Science readings of its classes (RPC citizen_school)
Database: migration citizen_science (table citizen_entries, RPCs citizen_add / citizen_summary / citizen_school).
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_citizen_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv


def read(f):
    return open(os.path.join(site, f), encoding='utf-8').read()


SCHOOL_PART = r"""
  // Sindh Citizen Science (/citizen/): rain, trees, birds and temperature that this school's classes sent with their class code
  var CZ = {
    title: { sd: 'سٽيزن سائنس: اسان جي ڪلاسن جو ڊيٽا', ur: 'سٹیزن سائنس: ہماری کلاسوں کا ڈیٹا', en: 'Citizen Science: data from our classes' },
    help: { sd: 'ٻار /citizen/ تي ماپ موڪليندي ڪلاس ڪوڊ لکن ته اهو هتي ايندو.', ur: 'بچے /citizen/ پر پیمائش بھیجتے وقت کلاس کوڈ لکیں تو یہاں نظر آئے گا۔', en: 'When children send a reading on /citizen/ with their class code, it shows here.' },
    rain: { sd: 'مينهن جا ماپ', ur: 'بارش کی پیمائشیں', en: 'Rain readings' },
    tree: { sd: 'وڻ پوکيا', ur: 'درخت لگائے', en: 'Trees planted' },
    bird: { sd: 'پکي ڏٺا', ur: 'پرندے دیکھے', en: 'Birds seen' },
    temp: { sd: 'گرمي جا ماپ', ur: 'درجۂ حرارت کی پیمائشیں', en: 'Temperature readings' },
    recent: { sd: 'تازا ماپ', ur: 'تازہ پیمائشیں', en: 'Latest readings' },
    open: { sd: 'سٽيزن سائنس کوليو', ur: 'سٹیزن سائنس کھولیں', en: 'Open Citizen Science' }
  };
  function citizenPart() {
    var shown = openSchool;
    rpc('citizen_school', { p_school: shown.code, p_key: shown.key }).then(function (d) {
      if (openSchool !== shown || !d || !(d.classes || []).length) return;
      var units = { rain: ' mm', temp: ' °C', tree: '', bird: '' }, icons = { rain: '🌧️', tree: '🌳', bird: '🐦', temp: '🌡️' };
      var html = '<section class="card" id="cz-school"><h2>🔬 ' + esc(L(CZ.title)) + '</h2><p class="muted small">' + esc(L(CZ.help)) + '</p>' +
        '<div class="table-wrap"><table class="table sc-table"><thead><tr><th>' + esc(T('className')) + '</th><th>' + esc(L(CZ.rain)) + '</th><th>' + esc(L(CZ.tree)) +
        '</th><th>' + esc(L(CZ.bird)) + '</th><th>' + esc(L(CZ.temp)) + '</th><th>' + esc(T('lastActive')) + '</th></tr></thead><tbody>' +
        d.classes.map(function (c) {
          return '<tr><td><strong>' + esc(c.name) + '</strong></td><td>' + c.rain + '</td><td>' + c.tree + '</td><td>' + c.bird + '</td><td>' + c.temp + '</td><td class="ltr">' + esc(day(c.last)) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<h3>' + esc(L(CZ.recent)) + '</h3><ul class="sc-weak">' + (d.recent || []).slice(0, 10).map(function (r) {
          return '<li>' + icons[r.project] + ' <strong>' + esc(r.class) + '</strong> · ' + esc(r.nickname) + ' · ' + esc(cityName(r.district)) + ' · <span class="ltr">' +
            esc(r.value + (units[r.project] || '')) + (r.species ? ' ' + esc(r.species.replace(/_/g, ' ')) : '') + ' · ' + esc(r.date) + '</span></li>';
        }).join('') + '</ul><p class="no-print"><a class="btn ghost small" href="/citizen/">' + esc(L(CZ.open)) + '</a></p></section>';
      var pc = main.querySelector('.print-card');
      if (pc) pc.insertAdjacentHTML('beforebegin', html); else main.insertAdjacentHTML('beforeend', html);
    }).catch(function () { /* the dashboard works without this part */ });
  }
"""

EDITS = [
    ('js/ui-text.js', "citizenTitle:",
     "  goHome: {",
     "  citizenTitle: { sd: 'سٽيزن سائنس', ur: 'سٹیزن سائنس', en: 'Citizen Science' },\n"
     "  citizenShort: { sd: 'مينهن، وڻ، پکي ۽ گرمي ماپيو ۽ سنڌ جي نقشي تي وجهو', ur: 'بارش، درخت، پرندے اور گرمی ناپیں اور سندھ کے نقشے پر ڈالیں', en: 'Measure rain, trees, birds and heat and put them on the map of Sindh' },\n"
     "  goHome: {"),
    # home page: a tile on the Sindh shelf, after the weather lab; and a link in the "More" menu
    ('js/app.js', "shelfTile('/citizen/'",
     "shelfTile('/mausam/', 'sun', 'mausamLab') +",
     "shelfTile('/mausam/', 'sun', 'mausamLab') + shelfTile('/citizen/', 'map', 'citizenTitle') +"),
    ('js/app.js', "['/citizen/', 'citizenTitle']",
     "['/sindh/', 'sindhScience'],",
     "['/sindh/', 'sindhScience'], ['/citizen/', 'citizenTitle'],"),
    # links to the separate /citizen/ page are real page loads, not routes of the app
    ('js/app.js', "|sindh|citizen|",
     "|sindh|", "|sindh|citizen|"),
    ('sw.js', "\\/citizen(",
     "  if (/^\\/(sindh|school|",
     "  if (/^\\/citizen(\\/|$)/.test(url.pathname)) return;                              // Citizen Science is its own page and needs fresh data\n"
     "  if (/^\\/(sindh|school|"),
    ('vercel.json', "citizen(?:/|$)|",
     "sindh(?:/|$)|", "sindh(?:/|$)|citizen(?:/|$)|"),
    ('js/school.js', "citizen_school",
     "    main.innerHTML = html;\n    bindHome();\n  }\n  function tile(n, label)",
     "    main.innerHTML = html;\n    bindHome();\n    citizenPart();\n  }\n" + SCHOOL_PART + "  function tile(n, label)"),
]

texts, todo = {}, []
for f, done_mark, old, new in EDITS:
    s = texts.get(f) or read(f)
    if done_mark in s:
        print('already there: %s (%s)' % (f, done_mark)); texts[f] = s; continue
    n = s.count(old)
    if n != 1:
        sys.exit('anchor found %d times in %s: %s' % (n, f, old[:80]))
    texts[f] = s.replace(old, new); todo.append(f)
    print('will change: %s (%s)' % (f, done_mark))
if CHECK or not todo:
    sys.exit(0)
for f in sorted(set(todo)):
    open(os.path.join(site, f), 'w', encoding='utf-8', newline='').write(texts[f])
    print('written', f)
