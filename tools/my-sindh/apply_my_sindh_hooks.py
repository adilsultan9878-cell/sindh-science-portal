"""Hooks My Sindh (/sindh/my-sindh/, the ajrak map of finished chapters) into the site:
- ui-text.js: texts for the links and for the certificate check page
- app.js: a "My Sindh" card on /progress, a link in the chapter-done box, and the 'mera-sindh' certificate name on /verify
/sindh/ is already its own page in vercel.json, sw.js and app.js, so nothing else is needed.
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_my_sindh_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv

EDITS = [
    ('js/ui-text.js', "mySindh:",
     "  certCheck:",
     "  mySindh: { sd: 'منهنجو سنڌ: اجرڪ نقشو', ur: 'میرا سندھ: اجرک نقشہ', en: 'My Sindh: the ajrak map' },\n"
     "  mySindhText: { sd: 'هر پورو باب سنڌ جا ضلعا اجرڪ ۾ رنگي ٿو. سڀ 13 پورا ڪريو ۽ سرٽيفڪيٽ وٺو.', ur: 'ہر مکمل باب سندھ کے اضلاع اجرک میں رنگتا ہے۔ تمام 13 مکمل کریں اور سرٹیفکیٹ لیں۔', en: 'Each finished chapter colours districts of Sindh in ajrak. Finish all 13 for a certificate.' },\n"
     "  verifyKindSindh: { sd: 'منهنجو سنڌ: سڀ 13 باب پورا', ur: 'میرا سندھ: تمام 13 ابواب مکمل', en: 'My Sindh: all 13 chapters finished' },\n"
     "  certCheck:"),
    ('js/app.js', "quickLink('/sindh/my-sindh/'",
     "'<div id=\"class-slot\"></div>' +",
     "'<div id=\"class-slot\"></div>' +\n        '<div class=\"grid\">' + quickLink('/sindh/my-sindh/', 'map', 'mySindh', 'mySindhText') + '</div>' +"),
    ('js/app.js', "href=\"/sindh/my-sindh/\" class=\"btn ghost small\"",
     "esc(t('printCert')) + '</button></div>' +",
     "esc(t('printCert')) + '</button> <a href=\"/sindh/my-sindh/\" class=\"btn ghost small\">' + icon('map') + esc(t('mySindh')) + '</a></div>' +"),
    ('js/app.js', "'verifyKindSindh'",
     "t(c.kind === 'chapter' ? 'verifyKindChapter' : 'verifyKindComp')",
     "t(c.kind === 'chapter' ? 'verifyKindChapter' : c.kind === 'mera-sindh' ? 'verifyKindSindh' : 'verifyKindComp')"),
]

texts, changed = {}, []
for f, done_mark, anchor, new in EDITS:
    if f not in texts:
        texts[f] = open(os.path.join(site, f), encoding='utf-8').read()
    s = texts[f]
    if done_mark in s:
        continue
    if s.count(anchor) != 1:
        sys.exit('%s: anchor found %d times: %s' % (f, s.count(anchor), anchor[:60]))
    texts[f] = s.replace(anchor, new)
    changed.append(f)

if not changed:
    print('nothing to change (already applied)')
elif CHECK:
    print('would change: ' + ', '.join(sorted(set(changed))))
else:
    for f in set(changed):
        open(os.path.join(site, f), 'w', encoding='utf-8', newline='').write(texts[f])
    print('changed: ' + ', '.join(sorted(set(changed))))
