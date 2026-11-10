"""Urdu subtitles for a narrated video by listening to it (faster-whisper); for videos whose slide files are gone.
Usage: python vtt_from_audio.py <video.mp4> [more videos]  -> writes <video>.vtt next to each (name-ur.mp4 -> name-ur.vtt)"""
import sys
from faster_whisper import WhisperModel

def stamp(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return '%02d:%02d:%06.3f' % (h, m, s)

model = WhisperModel('small', device='cpu', compute_type='int8')
for f in sys.argv[1:]:
    segs, info = model.transcribe(f, language='ur', beam_size=5, vad_filter=True)
    out = f[:-4] + '.vtt'
    n = 0
    with open(out, 'w', encoding='utf-8', newline='\n') as w:
        w.write('WEBVTT\n\n')
        for s in segs:
            text = s.text.strip()
            if not text:
                continue
            n += 1
            w.write('%d\n%s --> %s\n%s\n\n' % (n, stamp(s.start), stamp(s.end), text))
    print('ok', out.split('\\')[-1], n, 'cues')
