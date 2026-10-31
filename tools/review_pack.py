"""Make a printable review pack: every text of every chapter in Sindhi, Urdu and English side by side,
with an empty column where the reviewing teacher marks mistakes.
Usage: python tools/review_pack.py <site_dir> <out.html>
Then print the HTML to PDF (any browser: Print > Save as PDF).
"""
import glob, html, json, os, re, sys

site, out = sys.argv[1], sys.argv[2]
cat = json.load(open(os.path.join(site, 'data', 'catalog.json'), encoding='utf-8'))
font = 'file:///' + os.path.join(site, 'fonts').replace('\\', '/')

def e(s):
    return html.escape(s or '')

def strip_md(s):
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', e(s))

def row(label, o, rich=False):
    def text(l):
        v = o.get(l, '')
        return '\n'.join(v) if isinstance(v, list) else v        # lesson text is stored one paragraph per line
    cells = ''.join('<td lang="%s">%s</td>' % (l, (strip_md if rich else e)(text(l)).replace('\n', '<br>')) for l in ('sd', 'ur', 'en'))
    return '<tr><th>%s</th>%s<td class="mark"></td></tr>' % (e(label), cells)

def table(title, rows):
    return ('<h3>%s</h3><table><colgroup><col class="c0"><col><col><col><col class="cm"></colgroup>'
            '<thead><tr><th></th><th>Sindhi · سنڌي</th><th>Urdu · اردو</th><th>English</th><th class="mark">✔ / ✘</th></tr></thead><tbody>%s</tbody></table>') % (e(title), ''.join(rows))

def join3(items, sep=' · '):
    return {l: sep.join(x.get(l, '') for x in items) for l in ('sd', 'ur', 'en')}

chapters = []
for c in cat['classes']:
    for s in c['subjects']:
        if c.get('active') and s.get('active'):
            for cid in s['chapters']:
                chapters.append(json.load(open(os.path.join(site, 'data', 'class-' + c['id'], s['id'], cid + '.json'), encoding='utf-8')))

parts = []
for ch in chapters:
    h = ['<section class="chapter"><h2>%s %d · %s</h2>' % (ch.get('icon', ''), ch['number'], e(ch['title']['en']))]
    h.append(table('Title and summary', [row('Title', ch['title']), row('Summary', ch.get('summary', {}))]))
    h.append(table('Lesson', sum([[row(sec['id'] + ' title', sec['title']), row(sec['id'] + ' text', sec['body'], True)] for sec in ch['lesson']], [])))
    h.append(table('Key words (glossary)', [row(str(i + 1), w) for i, w in enumerate(ch.get('glossary', []))]))
    d = ch.get('diagram')
    if d:
        h.append(table('Picture parts', sum([[row(p['id'] + ' name', p['label']), row(p['id'] + ' job', p.get('info', {}))] for p in d['parts']], [])))
    q_rows = []
    for i, q in enumerate(ch.get('quiz', [])):
        q_rows.append(row('Q%d (%s)' % (i + 1, q['type']), q['q']))
        if q['type'] == 'mcq':
            opts = [dict(o) for o in q['options']]
            for k, o in enumerate(opts):
                mark = ' ✔' if k == q['answer'] else ''
                for l in o:
                    o[l] = '%s) %s%s' % ('abcd'[k], o[l], mark)
            q_rows.append(row('options', join3(opts, '\n')))
        elif q['type'] == 'tf':
            q_rows.append(row('answer', {'sd': 'صحيح' if q['answer'] else 'غلط', 'ur': 'درست' if q['answer'] else 'غلط', 'en': 'True' if q['answer'] else 'False'}))
        else:
            q_rows.append(row('pairs', join3([{l: p['left'][l] + ' ⟷ ' + p['right'][l] for l in ('sd', 'ur', 'en')} for p in q['pairs']], '\n')))
    h.append(table('Quiz (%d questions, ✔ = correct answer)' % len(ch.get('quiz', [])), q_rows))
    w = ch.get('worksheet', {})
    w_rows = [row('Blank %d' % (i + 1), {l: b['text'][l] + '  →  ' + b['answer'][l] for l in ('sd', 'ur', 'en')}) for i, b in enumerate(w.get('blanks', []))]
    w_rows += [row('True/false %d (%s)' % (i + 1, 'T' if t['answer'] else 'F'), t['text']) for i, t in enumerate(w.get('tf', []))]
    w_rows += [row('Match %d' % (i + 1), {l: m['a'][l] + ' ⟷ ' + m['b'][l] for l in ('sd', 'ur', 'en')}) for i, m in enumerate(w.get('match', []))]
    w_rows += sum([[row('Short Q%d' % (i + 1), x['q']), row('model answer', x['a'])] for i, x in enumerate(w.get('short', []))], [])
    if w.get('draw'):
        w_rows.append(row('Draw', w['draw']))
    h.append(table('Worksheet', w_rows))
    g_rows = []
    for g in ch.get('games', []):
        g_rows.append(row(g['type'] + ' game title', g['title']))
        for b in g.get('bins', []):
            g_rows.append(row('box', b['name']))
        for it in g.get('items', []):
            g_rows.append(row('item → ' + it['bin'], it['text']))
        for p in g.get('pairs', []):
            g_rows.append(row('pair', {l: p['a'][l] + ' ⟷ ' + p['b'][l] for l in ('sd', 'ur', 'en')}))
    h.append(table('Games', g_rows))
    x = ch.get('experiment')
    if x:
        h.append(table('Home experiment', [row('Title', x['title'])] + [row('Thing %d' % (i + 1), m) for i, m in enumerate(x['materials'])] +
                       [row('Step %d' % (i + 1), m) for i, m in enumerate(x['steps'])] + [row('What we learn', x['learn']), row('Safety', x['safety'])]))
    h.append('<p class="sign">Science teacher: ____________________ &nbsp; Sindhi teacher: ____________________ &nbsp; Urdu teacher: ____________________ &nbsp; Date: __________</p></section>')
    parts.append(''.join(h))

doc = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Review pack · Sindh Science Class 5</title><style>
@font-face { font-family: Naskh; src: url("%s/noto-naskh-arabic-arabic-400-normal.woff2"); }
@font-face { font-family: Naskh; src: url("%s/noto-naskh-arabic-arabic-700-normal.woff2"); font-weight: 700; }
@page { size: A4 landscape; margin: 10mm; }
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #1f2a1f; }
h1 { color: #1b5e20; } h2 { color: #1b5e20; border-bottom: 2px solid #2e7d32; padding-bottom: 4px; }
h3 { margin: 14px 0 4px; color: #2e7d32; }
.chapter { break-before: page; }
table { width: 100%%; border-collapse: collapse; table-layout: fixed; }
th, td { border: 1px solid #b7cbb7; padding: 4px 6px; vertical-align: top; text-align: left; }
thead th { background: #e8f5e9; }
tbody th { background: #f6fbf6; font-weight: 600; font-size: 9pt; }
col.c0 { width: 11%%; } col.cm { width: 7%%; }
td[lang="sd"], td[lang="ur"] { font-family: Naskh, "Segoe UI", sans-serif; direction: rtl; text-align: right; font-size: 11.5pt; line-height: 1.8; }
tr { break-inside: avoid; }
.mark { background: #fffdf3; }
.sign { margin-top: 18px; }
.intro li { margin: 4px 0; }
</style></head><body>
<h1>Sindh Science Learning Portal · Class 5 Science · Review pack</h1>
<ul class="intro">
<li>Every text on the website for each chapter, in Sindhi, Urdu and English side by side (%d chapters).</li>
<li>Please read each row. In the last column put ✔ if it is correct, or ✘ and write the correction next to the text.</li>
<li>Science teacher: check that the science is correct and suits Class 5. Sindhi and Urdu teachers: check spelling, grammar and the science words.</li>
<li>In the quiz, ✔ marks the correct option. Corrections are then made in the staff panel: sindh-science-portal.vercel.app/admin</li>
</ul>
%s
</body></html>''' % (font, font, len(chapters), ''.join(parts))
open(out, 'w', encoding='utf-8').write(doc)
print('chapters', len(chapters), 'html KB', len(doc) // 1024)
