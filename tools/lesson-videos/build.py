"""Turn rendered slides + Urdu narration into one MP4.
Usage: python build.py <steps_dir> <out.mp4>
Each step: picture shown while its sentence is spoken, plus a short pause.
"""
import asyncio, json, os, re, subprocess, sys
import edge_tts

FFMPEG = r'C:\Users\adils\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
VOICE = 'ur-PK-UzmaNeural'
d, out = sys.argv[1], sys.argv[2]
steps = json.load(open(os.path.join(d, 'steps.json'), encoding='utf-8'))

def duration(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)

async def tts():
    for i, s in enumerate(steps):
        mp3 = os.path.join(d, 'say%02d.mp3' % i)
        if not os.path.exists(mp3):
            await edge_tts.Communicate(s['say'], VOICE, rate='-8%').save(mp3)
        s['mp3'] = mp3
asyncio.run(tts())

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
subprocess.run([FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', out], check=True)
print(out, round(duration(out), 1), 's', os.path.getsize(out) // 1024, 'KB')
