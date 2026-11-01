"""Make spoken Urdu and English narration for every lesson part of every chapter.
Usage: python make_lesson_audio.py <site_dir> [--force]
Writes <site_dir>/audio/lessons/<chapterId>-<sectionId>-{ur,en}.mp3 (section title, a short pause, then the body)
and <site_dir>/audio/lessons/index.json ({chapterId: {sectionId: {ur, en, urSecs, enSecs}}}).
A file is made again only when its spoken text, voice or rate changed (a hash of them is kept in the MP3's
comment tag), or for every file with --force. MP3s for lesson parts that no longer exist are removed.
"""
import asyncio, glob, hashlib, json, os, re, subprocess, sys, tempfile
import edge_tts

sys.stdout.reconfigure(encoding='utf-8')
site = sys.argv[1]
force = '--force' in sys.argv
VOICES = {'ur': ('ur-PK-UzmaNeural', '-5%'), 'en': ('en-GB-SoniaNeural', '-5%')}
FULL_STOP = {'ur': '۔', 'en': '.'}
PAUSE_SECS = 0.8
out_dir = os.path.join(site, 'audio', 'lessons')

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = 'ffmpeg'


def clean(line, lang):
    line = re.sub(r'\*+', '', line).strip()
    if line.startswith('- '):
        line = line[2:].strip()
    if line and line[-1] not in '.!?:;۔؟':
        line += FULL_STOP[lang]
    return line


def spoken(section, lang):
    title = re.sub(r'\*+', '', section['title'][lang]).strip()
    body = ' '.join(l for l in (clean(x, lang) for x in section['body'][lang]) if l)
    return title, body


def ffmpeg_info(path):
    err = subprocess.run([FFMPEG, '-hide_banner', '-i', path], capture_output=True, text=True, encoding='utf-8').stderr
    d = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    secs = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else 0
    tag = re.search(r'^\s*comment\s*:\s*(\S+)', err, re.M)
    return round(secs), tag.group(1) if tag else None


async def tts(text, lang, path):
    voice, rate = VOICES[lang]
    for attempt in range(6):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(path)
            if os.path.getsize(path) > 0:
                return
        except Exception as e:
            print('retry', attempt + 1, lang, text[:40], repr(e))
        await asyncio.sleep(2 ** attempt)
    raise RuntimeError('edge-tts failed: ' + text[:60])


async def make(chapter, section, lang, tmp, silence, sem, failed):
    name = f'{chapter}-{section["id"]}-{lang}.mp3'
    path = os.path.join(out_dir, name)
    title, body = spoken(section, lang)
    digest = hashlib.sha1('|'.join([*VOICES[lang], str(PAUSE_SECS), title, body]).encode('utf-8')).hexdigest()[:16]
    if os.path.exists(path) and not force:
        secs, tag = ffmpeg_info(path)
        if tag == digest:
            return name, secs
    async with sem:
        try:
            parts = [os.path.join(tmp, f'{name}.{p}.mp3') for p in ('title', 'body', 'joined')]
            await tts(title, lang, parts[0])
            await tts(body, lang, parts[1])
            with open(parts[2], 'wb') as joined:
                for p in (parts[0], silence, parts[1]):
                    joined.write(open(p, 'rb').read())
            # Re-mux without re-encoding so the file gets a proper header (exact duration, seeking) and the hash tag.
            await asyncio.to_thread(subprocess.run, [FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', parts[2],
                                                     '-c', 'copy', '-map_metadata', '-1', '-metadata', 'comment=' + digest, path], check=True)
        except Exception as e:
            failed.append(f'{name}: {e!r}')
            return (name, ffmpeg_info(path)[0]) if os.path.exists(path) else (None, 0)
    secs = ffmpeg_info(path)[0]
    print('made', name, secs, 's')
    return name, secs


async def main():
    os.makedirs(out_dir, exist_ok=True)
    catalog = json.load(open(os.path.join(site, 'data', 'catalog.json'), encoding='utf-8'))
    sections = []
    for cls in catalog['classes']:
        for subject in cls.get('subjects', []):
            if not (cls.get('active') and subject.get('active')):
                continue
            for chapter in subject.get('chapters', []):
                data = json.load(open(os.path.join(site, 'data', f'class-{cls["id"]}', subject['id'], chapter + '.json'), encoding='utf-8'))
                sections += [(chapter, s) for s in data.get('lesson', [])]
    failed, sem = [], asyncio.Semaphore(4)
    with tempfile.TemporaryDirectory() as tmp:
        silence = os.path.join(tmp, 'silence.mp3')
        # Same format as edge-tts output (24 kHz mono 48 kbit/s) and no header, so the frames join cleanly.
        subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', str(PAUSE_SECS),
                        '-c:a', 'libmp3lame', '-b:a', '48k', '-write_xing', '0', '-id3v2_version', '0', '-f', 'mp3', silence], check=True)
        jobs = [make(chapter, s, lang, tmp, silence, sem, failed) for chapter, s in sections for lang in VOICES]
        results = await asyncio.gather(*jobs)
    index, kept = {}, set()
    for (chapter, s), i in zip(sections, range(0, len(results), len(VOICES))):
        entry = {}
        for lang, (name, secs) in zip(VOICES, results[i:i + len(VOICES)]):
            if name:
                entry[lang], entry[lang + 'Secs'] = name, secs
                kept.add(name)
        if entry:
            index.setdefault(chapter, {})[s['id']] = {k: entry[k] for k in ('ur', 'en', 'urSecs', 'enSecs') if k in entry}
    for old in glob.glob(os.path.join(out_dir, '*.mp3')):
        if os.path.basename(old) not in kept:
            os.remove(old)
            print('removed', os.path.basename(old))
    json.dump(index, open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    files = glob.glob(os.path.join(out_dir, '*.mp3'))
    total = sum(os.path.getsize(f) for f in files)
    print(len(files), 'files of', len(jobs), '| total MB', round(total / 1048576, 1))
    if failed:
        print('FAILED:', *failed, sep='\n  ')
        sys.exit(1)

asyncio.run(main())
