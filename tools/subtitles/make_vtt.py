"""Make Urdu subtitles (WebVTT) for the narrated videos from the files the video tools leave behind:
steps.json (what each slide says) and segNN.mp4 (each slide's clip, so its length).
Usage: python make_vtt.py <work folder> <out folder> [name map like seeds=seeds,plants=photosynthesis]
Writes <out folder>/<name>-ur.vtt for every <work folder>/<id>/ that has steps.json and as many clips as steps.
Long sentences are split into cues of about 90 letters, timed by their share of the clip."""
import glob, json, os, re, subprocess, sys

FFMPEG = r'C:\Users\adils\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'


def duration(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def stamp(t):
    h, rest = divmod(t, 3600)
    m, s = divmod(rest, 60)
    return '%02d:%02d:%06.3f' % (h, m, s)


def pieces(text, size=90):
    # split at sentence ends first, then at commas, so each cue is short enough to read
    parts = [p.strip() for p in re.split(r'(?<=[۔.!؟?])\s+', text) if p.strip()]
    out = []
    for p in parts:
        while len(p) > size:
            cut = max(p.rfind('،', 0, size), p.rfind(',', 0, size), p.rfind(' ', 0, size))
            cut = cut if cut > 20 else size
            out.append(p[:cut + 1].strip())
            p = p[cut + 1:].strip()
        if p:
            out.append(p)
    return out


def main():
    work, out = sys.argv[1], sys.argv[2]
    names = dict(x.split('=') for x in sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else {}
    os.makedirs(out, exist_ok=True)
    done = 0
    for d in sorted(glob.glob(os.path.join(work, '*', 'steps.json'))):
        folder = os.path.dirname(d)
        cid = os.path.basename(folder)
        steps = json.load(open(d, encoding='utf-8'))
        segs = sorted(glob.glob(os.path.join(folder, 'seg[0-9][0-9].mp4')))
        if len(segs) != len(steps):
            print('skip', cid, 'steps', len(steps), 'clips', len(segs))
            continue
        cues, t = [], 0.0
        for st, seg in zip(steps, segs):
            length = duration(seg)
            say = (st.get('say') or '').strip()
            if say:
                parts = pieces(say)
                speak = max(0.5, length - float(st.get('pause') or 0) - 0.3)
                total = sum(len(p) for p in parts) or 1
                a = t + 0.3   # the voice starts a moment after the slide
                for p in parts:
                    b = a + speak * len(p) / total
                    cues.append((a, min(b, t + length), p))
                    a = b
            t += length
        name = names.get(cid, cid)
        with open(os.path.join(out, name + '-ur.vtt'), 'w', encoding='utf-8', newline='\n') as f:
            f.write('WEBVTT\n\n')
            for i, (a, b, p) in enumerate(cues, 1):
                f.write('%d\n%s --> %s\n%s\n\n' % (i, stamp(a), stamp(b), p))
        done += 1
        print('ok', name, len(cues), 'cues', '%.1f s' % t)
    print('files:', done)


if __name__ == '__main__':
    main()
