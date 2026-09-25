// Controleert dat elke zin die de game kan uitspreken een ingesproken clip heeft.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('alle zinnen hebben een clip', () => {
  execFileSync(process.execPath, ['tools/voice/lines.mjs']); // ververst lines.json uit de huidige verhalen
  const lines = JSON.parse(readFileSync('tools/voice/lines.json', 'utf8'));
  const index = new Set(JSON.parse(readFileSync('audio/index.json', 'utf8')).clips);
  const missing = lines.filter((l) => !index.has(l.file.replace(/\.mp3$/, '')) || !existsSync(`audio/${l.file}`));
  assert.deepEqual(missing.map((l) => `${l.who}: ${l.text}`), [], 'draai: npm run voice');
});
