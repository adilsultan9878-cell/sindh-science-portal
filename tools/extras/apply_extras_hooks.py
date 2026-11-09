"""Hooks the quick games page (/play/) into the site (Science Stars of the Week was removed on 2026-11-09):
- ui-text.js: texts for the games page links
- app.js: "Quick games" cards on /games, real page loads for /play
- sw.js: leaves /play to the network
- vercel.json: /play is not rewritten to the app
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
    ('sw.js', "\\/play(",
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;",
     "  if (/^\\/play(\\/|$)/.test(url.pathname)) return;                                 // the quick games page is its own page\n"
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;"),
    ('vercel.json', "play(?:/|$)|",
     "paper(?:/|$)|", "paper(?:/|$)|play(?:/|$)|"),
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
