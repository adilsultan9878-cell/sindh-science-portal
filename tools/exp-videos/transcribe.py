"""Write down what an experiment video says (faster-whisper "small", Urdu) and compare it with the narration.
Usage: python transcribe.py <site_dir> <work_dir> <chapter id> <out.txt>
Prints the share of narration words Whisper heard, sentence by sentence.
"""
import json, os, re, sys
from faster_whisper import WhisperModel

site, work, vid, out = sys.argv[1:5]
mp4 = os.path.join(site, 'exp-videos', vid + '-ur.mp4')
model = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = model.transcribe(mp4, language='ur', beam_size=5)
lines = ['[%6.1f-%6.1f] %s' % (s.start, s.end, s.text.strip()) for s in segs]
heard = ' '.join(l.split('] ', 1)[1] for l in lines)
words = lambda t: re.findall(r'[\w؀-ۿ]+', t)
said = set(words(heard))
report = []
total = hit = 0
for s in json.load(open(os.path.join(work, vid, 'steps.json'), encoding='utf-8')):
    w = words(s['say'])
    k = sum(1 for x in w if x in said)
    total += len(w); hit += k
    report.append('%3d%%  %s' % (100 * k // max(1, len(w)), s['say']))
with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n\n' + '\n'.join(report) + '\n\nall: %d of %d narration words heard (%d%%)\n' % (hit, total, 100 * hit // total))
print(vid, 'narration words heard: %d of %d (%d%%)' % (hit, total, 100 * hit // total))
