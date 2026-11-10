"""Keep the heard timings of a .vtt but put the real narration words in: each heard cue gets the stretch of the
script at the same share of all the letters, cut at a space. Usage: python fix_vtt_text.py <narration.json> <id> <file.vtt>"""
import json, re, sys
narr = json.load(open(sys.argv[1], encoding='utf-8-sig'))[sys.argv[2]]
vtt = open(sys.argv[3], encoding='utf-8').read()
cues = re.findall(r'(\d+)\n([\d:.]+ --> [\d:.]+)\n(.+?)\n\n', vtt, re.S)
script = ' '.join(narr)
heard = [c[2].strip() for c in cues]
total_h = sum(len(h) for h in heard) or 1
pos, acc, out = 0, 0, []
for i, (n, times, h) in enumerate(cues):
    acc += len(h.strip())
    end = len(script) if i == len(cues) - 1 else round(len(script) * acc / total_h)
    if end < len(script):
        sp = script.find(' ', end)
        back = script.rfind(' ', pos, end)
        end = back if back > pos and (sp < 0 or end - back <= sp - end) else (sp if sp > 0 else len(script))
    out.append((times, script[pos:end].strip()))
    pos = end
with open(sys.argv[3], 'w', encoding='utf-8', newline='\n') as f:
    f.write('WEBVTT\n\n')
    for i, (times, text) in enumerate([o for o in out if o[1]], 1):
        f.write('%d\n%s\n%s\n\n' % (i, times, text))
print('ok', sys.argv[3].split('\\')[-1], len(out))
