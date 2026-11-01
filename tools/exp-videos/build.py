"""Turn the slides made by render.js into exp-videos/<id>-ur.mp4 plus a 960x540 poster exp-videos/<id>-ur.webp.
Usage: python build.py <site_dir> <work_dir> [chapter ids...]   (no ids = every chapter render.js made)
Each slide is shown while its sentence is spoken, plus a short pause. Spoken sentences are kept as
say-<hash>.mp3 in the work folder, so only changed sentences are voiced again.
"""
import asyncio, hashlib, json, os, re, subprocess, sys
import edge_tts
from PIL import Image

FFMPEG = r'C:\Users\adils\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
VOICE = 'ur-PK-UzmaNeural'
site, work = sys.argv[1], sys.argv[2]
ids = sys.argv[3:] or sorted(d for d in os.listdir(work) if os.path.exists(os.path.join(work, d, 'steps.json')))
out_dir = os.path.join(site, 'exp-videos')
os.makedirs(out_dir, exist_ok=True)

def duration(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)

async def tts(d, steps):
    for s in steps:
        mp3 = os.path.join(d, 'say-%s.mp3' % hashlib.sha1(s['say'].encode('utf-8')).hexdigest()[:12])
        if not os.path.exists(mp3):
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(s['say'], VOICE, rate='-8%').save(mp3)
                    break
                except Exception:
                    if os.path.exists(mp3):
                        os.remove(mp3)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(3)
        s['mp3'] = mp3

for vid in ids:
    d = os.path.join(work, vid)
    steps = json.load(open(os.path.join(d, 'steps.json'), encoding='utf-8'))
    asyncio.run(tts(d, steps))
    segs = []
    for i, s in enumerate(steps):
        seg = os.path.join(d, 'seg%02d.mp4' % i)
        total = duration(s['mp3']) + 0.7 + s.get('pause', 0)
        subprocess.run([FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-framerate', '25', '-i', s['png'], '-i', s['mp3'],
                        '-filter_complex', '[0:v]scale=1920:1080,format=yuv420p[v];[1:a]adelay=300|300,apad[a]', '-map', '[v]', '-map', '[a]',
                        '-t', '%.2f' % (total + 0.3), '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '24', '-r', '25',
                        '-c:a', 'aac', '-b:a', '96k', '-ar', '44100', '-ac', '1', seg], check=True)
        segs.append(seg)
    lst = os.path.join(d, 'list.txt')
    open(lst, 'w', encoding='utf-8').write(''.join("file '%s'\n" % s.replace('\\', '/') for s in segs))
    out = os.path.join(out_dir, vid + '-ur.mp4')
    subprocess.run([FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', out], check=True)
    poster = os.path.join(out_dir, vid + '-ur.webp')
    Image.open(steps[0]['png']).convert('RGB').resize((960, 540), Image.LANCZOS).save(poster, 'WEBP', quality=82, method=6)
    print('%s  %.1f s  %d KB  (poster %d KB)' % (os.path.basename(out), duration(out), os.path.getsize(out) // 1024, os.path.getsize(poster) // 1024), flush=True)
