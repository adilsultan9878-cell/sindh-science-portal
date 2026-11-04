"""Hooks the quick games page (/play/) and Science Stars of the Week (js/stars.js, css/stars.css) into the site:
- ui-text.js: texts for the games page links
- app.js: "Quick games" cards on /games, the stars card on the home page, real page loads for /play
- index.html: loads css/stars.css and js/stars.js (same ?v= as the other files)
- sw.js: keeps stars.js and stars.css for offline use, leaves /play to the network
- vercel.json: /play is not rewritten to the app
- classroom.js: every finished activity also goes to Stars.report()
- admin.js: hide or show a star's nickname under Leaderboard
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Works before or after tools/book/apply_book_hooks.py.
Usage: python apply_extras_hooks.py <site folder> [--check]"""
import os, re, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv


def read(f):
    return open(os.path.join(site, f), encoding='utf-8').read()


version = re.search(r"var VERSION = '([^']+)'", read('sw.js')).group(1)
index = read('index.html')
css_tag = re.search(r'<link rel="stylesheet" href="/css/style\.css\?v=[^"]*">', index)
cls_tag = re.search(r'<script src="/js/classroom\.js\?v=([^"]*)" defer></script>', index)
if not css_tag or not cls_tag:
    sys.exit('index.html: style.css or classroom.js tag not found')
v = cls_tag.group(1)

EDITS = [
    ('js/ui-text.js', "quickGames:",
     "  sindhScience: { sd: 'سنڌ ۾ سائنس',",
     "  quickGames: { sd: 'تڪڙيون رانديون', ur: 'فوری کھیل', en: 'Quick games' },\n"
     "  chapterGames: { sd: 'باب جون رانديون', ur: 'ابواب کے کھیل', en: 'Chapter games' },\n"
     "  picGame: { sd: 'تصوير سڃاڻو', ur: 'تصویر پہچانو', en: 'Picture puzzle' },\n"
     "  picGameText: { sd: 'تصوير ڏسو ۽ ٻڌايو ته هي ڪهڙي باب جي آهي.', ur: 'تصویر دیکھیں اور بتائیں کہ یہ کس باب کی ہے۔', en: 'Look at a picture and say which chapter it is from.' },\n"
     "  tfGame: { sd: 'صحيح يا غلط: 30 سيڪنڊ', ur: 'سچ یا جھوٹ: 30 سیکنڈ', en: 'True or false: 30 seconds' },\n"
     "  tfGameText: { sd: '30 سيڪنڊن ۾ جيترا وڌيڪ جواب ڏئي سگهو، ڏيو.', ur: '30 سیکنڈ میں جتنے زیادہ جواب دے سکیں، دیں۔', en: 'Answer as many as you can in 30 seconds.' },\n"
     "  sindhScience: { sd: 'سنڌ ۾ سائنس',"),
    # /games: the two quick games above the chapter games
    ('js/app.js', "'/play/?g=picture'",
     "'<h1>' + icon('game') + ' ' + esc(t('gamesTitle')) + '</h1><p>' + esc(t('gamesIntro')) + '</p>' +",
     "'<h1>' + icon('game') + ' ' + esc(t('gamesTitle')) + '</h1><p>' + esc(t('gamesIntro')) + '</p>' +\n"
     "        '<h2>' + esc(t('quickGames')) + '</h2><div class=\"grid quick-games\">' + quickLink('/play/?g=picture', 'eye', 'picGame', 'picGameText') +\n"
     "          quickLink('/play/?g=tf', 'clock', 'tfGame', 'tfGameText') + '</div>' +\n"
     "        '<h2>' + esc(t('chapterGames')) + '</h2>' +"),
    # links to the separate /play/ page are real page loads, not routes of the app
    ('js/app.js', "|paper|play|",
     "exp-videos|class|paper|", "exp-videos|class|paper|play|"),
    # home page: Science Stars of the Week under the daily question
    ('js/app.js', "id=\"stars-slot\"",
     "'<section class=\"card daily\" id=\"daily\"></section>' +",
     "'<section class=\"card daily\" id=\"daily\"></section>' +\n        '<div id=\"stars-slot\"></div>' +"),
    ('js/app.js', "window.Stars.mount(",
     "renderDaily(document.getElementById('daily'), chs);",
     "renderDaily(document.getElementById('daily'), chs);\n      if (window.Stars) window.Stars.mount(document.getElementById('stars-slot'));"),
    ('index.html', "/css/stars.css",
     css_tag.group(0), css_tag.group(0) + '\n<link rel="stylesheet" href="/css/stars.css?v=' + v + '">'),
    ('index.html', "/js/stars.js",
     cls_tag.group(0), cls_tag.group(0) + '\n<script src="/js/stars.js?v=' + v + '" defer></script>'),
    ('sw.js', "'/js/stars.js?v='",
     "  '/js/classroom.js?v=' + VERSION,", "  '/js/classroom.js?v=' + VERSION,\n  '/js/stars.js?v=' + VERSION,"),
    ('sw.js', "'/css/stars.css?v='",
     "  '/css/style.css?v=' + VERSION,", "  '/css/style.css?v=' + VERSION,\n  '/css/stars.css?v=' + VERSION,"),
    ('sw.js', "\\/play(",
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;",
     "  if (/^\\/play(\\/|$)/.test(url.pathname)) return;                                 // the quick games page is its own page\n"
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;"),
    ('vercel.json', "play(?:/|$)|",
     "paper(?:/|$)|", "paper(?:/|$)|play(?:/|$)|"),
    ('js/classroom.js', "window.Stars.report(",
     "  function report(kind, chapterKey, score, total) {\n    var c = current();",
     "  function report(kind, chapterKey, score, total) {\n"
     "    if (window.Stars) window.Stars.report(kind, chapterKey, score, total);   // Science Stars of the Week (stars.js), if the student joined\n"
     "    var c = current();"),
    ('js/admin.js', "star_staff_list",
     "    main.appendChild(rows.length ? h('div', { class: 'table-wrap' }, [table]) : h('p', { text: 'No scores yet.' }));\n",
     "    main.appendChild(rows.length ? h('div', { class: 'table-wrap' }, [table]) : h('p', { text: 'No scores yet.' }));\n"
     "\n"
     "    // Science Stars of the Week (home page): nicknames of this week and last week\n"
     "    main.appendChild(h('h2', { text: 'Science Stars of the Week' }));\n"
     "    main.appendChild(h('p', { class: 'muted', text: 'These nicknames can appear on the home page. Hide any that is rude or looks like a real full name; it stays hidden in later weeks too.' }));\n"
     "    var stars = [];\n"
     "    try { stars = (await rpc('star_staff_list')) || []; } catch (e) { main.appendChild(h('p', { text: e.message })); }\n"
     "    var stable = h('table', { class: 'table', html: '<thead><tr><th>Last active</th><th>Nickname</th><th>District</th><th>Points (2 weeks)</th><th>Shown</th><th>Actions</th></tr></thead>' });\n"
     "    var sbody = h('tbody');\n"
     "    stars.forEach(function (s) {\n"
     "      var tr = h('tr', { html: '<td>' + esc(when(s.last_at)) + '</td><td>' + esc(s.nickname) + '</td><td>' + esc(s.city || '—') + '</td><td>' + s.points + '</td><td>' +\n"
     "        (s.hidden ? pill('draft').replace('Draft', 'Hidden') : pill('published').replace('Published', 'Visible')) + '</td>' });\n"
     "      var td = h('td');\n"
     "      td.appendChild(btn(s.hidden ? 'Show' : 'Hide', async function () {\n"
     "        try { await rpc('star_hide', { p_nick: s.nickname, p_hide: !s.hidden }); viewLeaderboard(); } catch (e) { alert(e.message); }\n"
     "      }));\n"
     "      tr.appendChild(td);\n"
     "      sbody.appendChild(tr);\n"
     "    });\n"
     "    stable.appendChild(sbody);\n"
     "    main.appendChild(stars.length ? h('div', { class: 'table-wrap' }, [stable]) : h('p', { text: 'No stars yet.' }));\n"),
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
