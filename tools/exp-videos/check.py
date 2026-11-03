"""Check finished experiment videos: duration, streams, size, and that frames are not blank.
Usage: python check.py <site_dir> <out_dir> [chapter ids...]
Saves a strip of frames (one per 10 s) per video as <out_dir>/<id>-frames.png and prints one line per video.
"""
import glob, os, re, subprocess, sys
from PIL import Image, ImageStat

FFMPEG = r'C:\Users\adils\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
site, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
vids = sys.argv[3:] or sorted(os.path.basename(f)[:-7] for f in glob.glob(os.path.join(site, 'exp-videos', '*-ur.mp4')))
for vid in vids:
    mp4 = os.path.join(site, 'exp-videos', vid + '-ur.mp4')
    info = subprocess.run([FFMPEG, '-hide_banner', '-i', mp4], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info).groups()
    dur = int(h) * 3600 + int(m) * 60 + float(s)
    v = re.search(r'Video: (\w+).*?(\d{3,4}x\d{3,4})', info)
    a = re.search(r'Audio: (\w+)', info)
    with open(mp4, 'rb') as f:
        head = f.read(64 * 1024)
    faststart = head.find(b'moov') >= 0 and (head.find(b'mdat') < 0 or head.find(b'moov') < head.find(b'mdat'))
    tmp = os.path.join(out_dir, vid + '-f%02d.png')
    subprocess.run([FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-i', mp4, '-vf', 'fps=1/10,scale=384:216', tmp], check=True)
    frames = sorted(glob.glob(os.path.join(out_dir, vid + '-f*.png')))
    blank = 0
    strip = Image.new('RGB', (len(frames) * 388, 216), 'white')
    for i, f in enumerate(frames):
        im = Image.open(f).convert('RGB')
        if max(ImageStat.Stat(im).stddev) < 8:
            blank += 1
        strip.paste(im, (i * 388, 0))
        os.remove(f)
    strip.save(os.path.join(out_dir, vid + '-frames.png'))
    print('%-22s %6.1f s  %5d KB  video %s %s  audio %s  faststart %s  frames %d (blank %d)' % (
        vid, dur, os.path.getsize(mp4) // 1024, v.group(1) if v else '?', v.group(2) if v else '?', a.group(1) if a else 'none',
        'yes' if faststart else 'NO', len(frames), blank))
