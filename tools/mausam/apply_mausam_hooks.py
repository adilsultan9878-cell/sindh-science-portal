"""Hooks the Sindh digital weather lab (/mausam/) into the site:
- ui-text.js: the card's title and short text
- app.js: a card on the home page "more" grid, and real page loads for /mausam
- sindh/sindh.js: a link to the lab next to "Print" on /sindh/
- sw.js: leaves /mausam to the network (it is its own page)
- vercel.json: /mausam is not rewritten to the app
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_mausam_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv


def read(f):
    return open(os.path.join(site, f), encoding='utf-8').read()


EDITS = [
    ('js/ui-text.js', "mausamShort:",
     "  sindhShort: {",
     "  mausamLab: { sd: 'ڊجيٽل موسم ليب', ur: 'ڈیجیٹل موسمی لیب', en: 'Digital weather lab' },\n"
     "  mausamShort: { sd: 'سلائيڊر ۽ اينيميشن: گرمي، سنڌو جو ڇوڙ ۽ هوا جي بجلي.', ur: 'سلائیڈر اور اینیمیشن: گرمی، سندھ ڈیلٹا اور ہوا کی بجلی۔', en: 'Animated sliders: heat, the Indus delta and wind power.' },\n"
     "  sindhShort: {"),
    # home page: card right after "Science in Sindh"
    ('js/app.js', "quickLink('/mausam/'",
     "          quickLink('/sindh/', 'map', 'sindhScience', 'sindhShort') +\n",
     "          quickLink('/sindh/', 'map', 'sindhScience', 'sindhShort') +\n"
     "          quickLink('/mausam/', 'sun', 'mausamLab', 'mausamShort') +\n"),
    # links to the separate /mausam/ page are real page loads, not routes of the app
    ('js/app.js', "|lok|mausam|",
     "|sindh|school|lok|", "|sindh|school|lok|mausam|"),
    ('sindh/sindh.js', "href=\"/mausam/\"",
     "'<button type=\"button\" class=\"btn ghost\" data-act=\"print\">'",
     "'<a class=\"btn ghost\" href=\"/mausam/\">' + esc(L({ sd: 'ڊجيٽل موسم ليب', ur: 'ڈیجیٹل موسمی لیب', en: 'Digital weather lab' })) + '</a>' +\n"
     "            '<button type=\"button\" class=\"btn ghost\" data-act=\"print\">'"),
    ('sw.js', "\\/mausam(",
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;",
     "  if (/^\\/mausam(\\/|$)/.test(url.pathname)) return;                               // the digital weather lab is its own page\n"
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;"),
    ('vercel.json', "mausam(?:/|$)|",
     "sindh(?:/|$)|", "sindh(?:/|$)|mausam(?:/|$)|"),
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
