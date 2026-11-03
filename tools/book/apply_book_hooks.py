"""Hooks the chapter book (/book/) into the site: menu texts, a link on every chapter page, a card on /teachers,
a footer link, real page loads for /book in app.js and sw.js, and the vercel.json rewrite exclusion.
Each change is applied once; running it again changes nothing. Stops without writing if an anchor is missing.
Usage: python apply_book_hooks.py <site folder> [--check]"""
import os, sys

site = sys.argv[1]
CHECK = '--check' in sys.argv

EDITS = [
    ('js/ui-text.js', "bookPdf:",
     "  sindhScience: { sd: 'سنڌ ۾ سائنس',",
     "  bookPdf: { sd: 'باب جو ڪتاب (PDF)', ur: 'باب کی کتاب (PDF)', en: 'Chapter book (PDF)' },\n"
     "  bookPdfText: { sd: 'سبق، تصويرون، اهم لفظ، تجربو، مشق جا سوال، ورڪ شيٽ ۽ جواب — A4 ڪتاب جي صورت ۾. پرنٽ ڪريو يا PDF ڊائونلوڊ ڪري واٽس ايپ تي موڪليو.', ur: 'سبق، تصویریں، اہم الفاظ، تجربہ، مشق کے سوالات، ورک شیٹ اور جوابات — A4 کتاب کی صورت میں۔ پرنٹ کریں یا PDF ڈاؤن لوڈ کر کے واٹس ایپ پر بھیجیں۔', en: 'Lesson, pictures, key words, experiment, practice questions, worksheet and answers as an A4 book. Print it, or download the PDF and send it on WhatsApp.' },\n"
     "  sindhScience: { sd: 'سنڌ ۾ سائنس',"),
    # links to the separate /book/ page are real page loads, not routes of the app
    ('js/app.js', "|paper|book|",
     "|class|paper|", "|class|paper|book|"),
    # chapter header: this chapter's book, in the language chosen
    ('js/app.js', "href=\"/book/?ch=",
     "icon('next', 'flip') + esc(t('share')) + '</a></div></header>' +",
     "icon('next', 'flip') + esc(t('share')) + '</a>' +\n"
     "          '<a class=\"share-link no-print\" href=\"/book/?ch=' + encodeURIComponent(ch.id) + '&amp;lang=' + state.lang + '\">' + icon('printer') + esc(t('bookPdf')) + '</a></div></header>' +"),
    ('js/app.js', "<a href=\"/book/\">' + esc(t('bookPdf'))",
     "'<a href=\"/paper/\">' + esc(t('questionPaper')) + '</a>",
     "'<a href=\"/paper/\">' + esc(t('questionPaper')) + '</a><a href=\"/book/\">' + esc(t('bookPdf')) + '</a>"),
    # /teachers: a card next to the question paper card
    ('js/app.js', "esc(t('bookPdfText'))",
     "'<p class=\"muted\">' + esc(t('questionPaperText')) + '</p><a class=\"btn\" href=\"/paper/\">' + icon('printer') + esc(t('questionPaper')) + '</a></div></div>' +",
     "'<p class=\"muted\">' + esc(t('questionPaperText')) + '</p><a class=\"btn\" href=\"/paper/\">' + icon('printer') + esc(t('questionPaper')) + '</a></div></div>' +\n"
     "        '<div class=\"card install\"><span class=\"icon-tile\">' + icon('lesson') + '</span><div><strong>' + esc(t('bookPdf')) + '</strong>' +\n"
     "          '<p class=\"muted\">' + esc(t('bookPdfText')) + '</p><a class=\"btn\" href=\"/book/\">' + icon('printer') + esc(t('bookPdf')) + '</a></div></div>' +"),
    ('sw.js', "\\/book(",
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;",
     "  if (/^\\/book(\\/|$)/.test(url.pathname)) return;                                 // the chapter book page and its PDFs are their own pages\n"
     "  if (/^\\/paper(\\/|$)/.test(url.pathname)) return;"),
    ('vercel.json', "book(?:/|$)|",
     "paper(?:/|$)|", "paper(?:/|$)|book(?:/|$)|"),
]

texts, todo = {}, []
for f, done_mark, old, new in EDITS:
    p = os.path.join(site, f)
    s = texts.get(f) or open(p, encoding='utf-8').read()
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
