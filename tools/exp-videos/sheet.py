"""Contact sheet of one video's slides, for checking them at a glance.
Usage: python sheet.py <work_dir>/<chapter id> <out.png> [columns] [thumb width]"""
import glob, os, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 480
files = sorted(glob.glob(os.path.join(d, 'step*.png')))
th = tw * 9 // 16
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6), rows * (th + 6)), 'white')
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * (tw + 6), (i // cols) * (th + 6)
    sheet.paste(im, (x, y))
    ImageDraw.Draw(sheet).rectangle([x, y, x + tw - 1, y + th - 1], outline='#999')
sheet.save(out)
print(out, len(files))
