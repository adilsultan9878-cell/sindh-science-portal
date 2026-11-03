"""Makes the ready book PDFs smaller for phones: pictures re-saved as JPEG at 150 dpi, unused objects removed.
Usage: python shrink_pdfs.py <folder with PDFs>"""
import glob, os, sys
import pymupdf

folder = sys.argv[1]
before = after = 0
for f in sorted(glob.glob(os.path.join(folder, '*.pdf'))):
    a = os.path.getsize(f)
    doc = pymupdf.open(f)
    doc.rewrite_images(dpi_threshold=170, dpi_target=150, quality=72, lossy=True, lossless=True, bitonal=False, color=True, gray=True)
    tmp = f + '.tmp'
    doc.save(tmp, garbage=4, deflate=True, use_objstms=1)
    doc.close()
    os.replace(tmp, f)
    b = os.path.getsize(f)
    before += a; after += b
    print('%-34s %6.2f MB -> %6.2f MB' % (os.path.basename(f), a / 1048576, b / 1048576))
print('all: %.1f MB -> %.1f MB' % (before / 1048576, after / 1048576))
