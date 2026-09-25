"""Spreekt alle zinnen uit lines.json in met Microsoft-neurale stemmen (edge-tts).

Gebruik:  pip install edge-tts
          HELD_NAAM=Olivier node tools/voice/lines.mjs
          python tools/voice/build.py
Maakt audio/<wie>/<hash>.mp3 (alleen ontbrekende) en audio/index.json; verwijdert oude clips.
"""
import asyncio, json, os, pathlib, sys
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parents[2]
AUDIO = ROOT / 'audio'

# Stem per personage: (stem, tempo, toonhoogte)
VOICES = {
    'verteller': ('nl-NL-FennaNeural', '-5%', '+0Hz'),
    'kwebbel':   ('nl-NL-MaartenNeural', '+8%', '+25Hz'),
    'florine':   ('nl-NL-ColetteNeural', '+0%', '+40Hz'),
    'held':      ('nl-NL-MaartenNeural', '+0%', '+10Hz'),
    'brom':      ('nl-NL-MaartenNeural', '-12%', '-25Hz'),
    'piep':      ('nl-NL-FennaNeural', '+5%', '+35Hz'),
    'rommel':    ('nl-NL-ColetteNeural', '+5%', '+15Hz'),
}


async def make(sem, line):
    path = AUDIO / line['file']
    if path.exists() and path.stat().st_size > 0:
        return False
    voice, rate, pitch = VOICES.get(line['who'], VOICES['verteller'])
    path.parent.mkdir(parents=True, exist_ok=True)
    async with sem:
        for attempt in range(4):
            try:
                data = b''
                async for ch in edge_tts.Communicate(line['text'], voice, rate=rate, pitch=pitch).stream():
                    if ch['type'] == 'audio':
                        data += ch['data']
                if not data:
                    raise RuntimeError('lege audio')
                path.write_bytes(data)
                return True
            except Exception as e:  # netwerkhik: opnieuw proberen
                if attempt == 3:
                    print('MISLUKT', line['file'], line['text'], e, file=sys.stderr)
                    return False
                await asyncio.sleep(2 ** attempt)


async def main():
    lines = json.loads((ROOT / 'tools/voice/lines.json').read_text())
    sem = asyncio.Semaphore(6)
    made = await asyncio.gather(*(make(sem, l) for l in lines))
    wanted = {l['file'] for l in lines}
    removed = 0
    for f in AUDIO.glob('*/*.mp3'):
        if str(f.relative_to(AUDIO)) not in wanted:
            f.unlink(); removed += 1
    clips = sorted(f[:-4] for f in wanted if (AUDIO / f).exists())
    (AUDIO / 'index.json').write_text(json.dumps({'clips': clips}, separators=(',', ':')))
    size = sum(f.stat().st_size for f in AUDIO.glob('*/*.mp3'))
    print(f'{sum(made)} nieuw, {removed} verwijderd, {len(clips)} clips, {size/1e6:.1f} MB')

asyncio.run(main())
