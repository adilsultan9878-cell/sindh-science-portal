"""Hooks the Mohenjo-daro Science Lab (sindh/mohenjo-daro/: index.html, md.js, md.css) into the site:
- sindh/sindh.js: an "Open the lab" button on the Mohenjo-daro place card of /sindh/
The page lives under /sindh/, which vercel.json, sw.js and the app.js click rule already leave to the server,
and the home page tile is already in app.js and ui-text.js; those are only checked here, not changed.
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_mohenjo_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv


def read(f):
    return open(os.path.join(site, f), encoding='utf-8').read()


# /sindh/ and everything under it must stay a real page (not the app, not the offline cache)
NEEDED = [
    ('vercel.json', 'sindh(?:/|$)'),
    ('sw.js', '/^\\/(sindh|'),
    ('js/app.js', '|sindh|'),
]
for f, mark in NEEDED:
    if mark not in read(f):
        sys.exit('%s: %s not found; /sindh/mohenjo-daro/ would not load as its own page' % (f, mark))
    print('ok: %s already leaves /sindh/ to the server' % f)

# the home page tile (app.js shelfTile + ui-text.js mohenjoLab) was added by the main session; only checked here
for f, mark in [('js/ui-text.js', 'mohenjoLab:'), ('js/app.js', "'/sindh/mohenjo-daro/'")]:
    if mark not in read(f):
        sys.exit('%s: %s not found; add the home page tile for /sindh/mohenjo-daro/ first' % (f, mark))
    print('ok: %s has the home page tile (%s)' % (f, mark))

EDITS = [
    ('sindh/sindh.js', "lab: '/sindh/mohenjo-daro/'",
     "      id: 'mohenjo', icon: 'bricks', lon: 68.14, lat: 27.33, chapter: 'matter',\n",
     "      id: 'mohenjo', icon: 'bricks', lon: 68.14, lat: 27.33, chapter: 'matter', lab: '/sindh/mohenjo-daro/',\n"),
    ('sindh/sindh.js', "    openLab:",
     "    think: { sd: 'سوچيو ۽ ڳالهايو', ur: 'سوچیں اور بات کریں', en: 'Think and talk' },\n",
     "    think: { sd: 'سوچيو ۽ ڳالهايو', ur: 'سوچیں اور بات کریں', en: 'Think and talk' },\n"
     "    openLab: { sd: 'موئن جو دڙو سائنس ليب کوليو', ur: 'موہنجو داڑو سائنس لیب کھولیں', en: 'Open the Mohenjo-daro Science Lab' },\n"),
    ('sindh/sindh.js', "(pl.lab ?",
     "      '<div class=\"sp-think\"><p class=\"sp-label\">' + icon('chat') + esc(t('think')) + '</p><p>' + esc(L(pl.think)) + '</p></div>' +\n",
     "      '<div class=\"sp-think\"><p class=\"sp-label\">' + icon('chat') + esc(t('think')) + '</p><p>' + esc(L(pl.think)) + '</p></div>' +\n"
     "      (pl.lab ? '<p class=\"no-print\"><a class=\"btn small\" href=\"' + pl.lab + '\">' + icon('bricks') + esc(t('openLab')) + '</a></p>' : '') +\n"),
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
