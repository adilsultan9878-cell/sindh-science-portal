"""Make Urdu and English voice files for every key word and chapter title.
Usage: python make_audio.py <site_dir>
Writes <site_dir>/audio/{ur,en}/<hash>.mp3 and <site_dir>/audio/index.json ({lang: {text: file}}).
"""
import asyncio, glob, hashlib, json, os, sys
import edge_tts

sys.stdout.reconfigure(encoding='utf-8')
site = sys.argv[1]
VOICES = {'ur': 'ur-PK-UzmaNeural', 'en': 'en-US-JennyNeural'}

texts = {'ur': set(), 'en': set()}
for f in glob.glob(os.path.join(site, 'data', 'class-*', '*', '*.json')):
    ch = json.load(open(f, encoding='utf-8'))
    for lang in texts:
        texts[lang].add(ch['title'][lang])
        for w in ch.get('glossary', []):
            texts[lang].add(w[lang])

index_path = os.path.join(site, 'audio', 'index.json')
index = json.load(open(index_path, encoding='utf-8')) if os.path.exists(index_path) else {'ur': {}, 'en': {}}

async def one(lang, text, sem):
    name = hashlib.sha1((lang + '|' + text).encode('utf-8')).hexdigest()[:12] + '.mp3'
    path = os.path.join(site, 'audio', lang, name)
    if not os.path.exists(path):
        async with sem:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text, VOICES[lang], rate='-10%').save(path)
                    break
                except Exception as e:
                    print('retry', lang, text, e)
                    await asyncio.sleep(2)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        index[lang][text] = lang + '/' + name

async def main():
    sem = asyncio.Semaphore(4)
    for lang in texts:
        os.makedirs(os.path.join(site, 'audio', lang), exist_ok=True)
    await asyncio.gather(*[one(lang, t, sem) for lang in texts for t in sorted(texts[lang])])
    json.dump(index, open(index_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(site, 'audio', '*', '*.mp3')))
    print({l: len(index[l]) for l in index}, 'of', {l: len(texts[l]) for l in texts}, 'total KB', total // 1024)

asyncio.run(main())
