"""Adds the two texts the student login needs (the menu link and the /login page): loginTitle and loginText.
app.js, index.html and sw.js already load js/student.js. Applied once; running it again changes nothing.
Usage: python apply_login_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
f = os.path.join(site, 'js', 'ui-text.js')
s = open(f, encoding='utf-8').read()
if 'loginTitle:' in s:
    print('already there: js/ui-text.js (loginTitle)'); sys.exit(0)
anchor = "  sindhScience: { sd: 'سنڌ ۾ سائنس',"
if s.count(anchor) != 1:
    sys.exit('anchor not found once in js/ui-text.js')
add = ("  loginTitle: { sd: 'لاگ ان', ur: 'لاگ ان', en: 'Log in' },\n"
       "  loginText: { sd: 'يوزر نالي ۽ پن سان لاگ ان ڪريو ته توهان جي پيش رفت هر فون تي ساڳي رهي.', ur: 'یوزر نیم اور پن سے لاگ ان کریں تاکہ آپ کی پیش رفت ہر فون پر ایک جیسی رہے۔', en: 'Log in with a username and PIN so your progress is the same on every phone.' },\n")
print('will change: js/ui-text.js (loginTitle)')
if '--check' in sys.argv: sys.exit(0)
open(f, 'w', encoding='utf-8', newline='').write(s.replace(anchor, add + anchor))
print('written js/ui-text.js')
