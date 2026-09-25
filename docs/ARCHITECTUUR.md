# Architectuur – De Sterrenkompas-Avonturen

Statische web-app zonder build (ES modules, Safari/iPadOS 16+), gehost op Vercel.
Eén serverless functie `/api/chat` praat met Claude (`claude-haiku-4-5`).

## Bestanden
| Bestand | Eigenaar | Inhoud |
|---|---|---|
| `index.html`, `css/style.css`, `js/app.js`, `js/games.js` | Frontend | engine, UI, minigames, ouder-PIN, timer |
| `js/art.js` | Art | SVG-achtergronden en personages |
| `js/sfx.js` | Audio | gegenereerde geluiden (WebAudio, geen bestanden) |
| `js/speech.js`, `js/chat.js`, `api/chat.js` | Voice & AI | TTS, STT, dicteer-fallback, Claude-client en -server |
| `js/story/h1.js` … `h5.js`, `api/_puzzles.js` | Schrijver/Onderwijs/Design | verhaaldata en praatpuzzels |
| `manifest.webmanifest`, `sw.js`, `icons/` | Frontend | PWA |

## Privacy-afspraak
De naam van het kind staat alleen in localStorage. In verhaaltekst en in Claude-antwoorden staat `{HELD}`;
de client vervangt dat vlak voor tonen/voorlezen. De naam wordt nooit naar de server gestuurd.
Florine (zusje) staat wel in de verhaaltekst (door ouder aangeleverd, alleen voornaam).

## Interfaces
### art.js
- `background(id) -> string` SVG, viewBox `0 0 1600 900`, `preserveAspectRatio="xMidYMid slice"`.
- `character(id, mood='blij') -> string` SVG, viewBox `0 0 300 400`, figuur staat onderaan-midden.
  ids: `olivier, florine, kwebbel, brom, rommel, piep, verteller(null)`; moods: `blij, verbaasd, denkt, lacht`.
- Onbekende id → eenvoudige placeholder, nooit een exception.

### sfx.js
`export const sfx = { unlock(), play(name), music(on) }` – names: `tap, goed, fout, ster, whoosh, dreun, bel, pop, klim, sprong, fanfare, papegaai, piep, wind`.

### speech.js
- `unlock()` – aanroepen bij eerste tik (iOS vereist gebruikersgebaar).
- `speak(text, who) -> Promise` – resolve als klaar; stem/pitch/rate per personage; `cancel()`.
- `canListen() -> boolean` (false in standalone-PWA op iOS of zonder API).
- `startListening() / stopListening() -> Promise<string>` voor vasthouden-om-te-praten (nl-NL).

### chat.js
`askCharacter({puzzle, history, question, level}) -> Promise<{reply, ok}>`; `ok:false` bij fout/offline → engine gebruikt fallback.

### api/chat.js (POST JSON)
In: `{puzzle, history:[{role:'user'|'assistant', content}], question, level}`. Uit: `{reply}`.
Persona/geheim komen uit `api/_puzzles.js` (server-side), nooit uit de client.

## Hoofdstukdata (`js/story/hN.js`)
```js
export default { id:'h1', title:'…', sticker:'🗺️', steps:[ … ] }
```
Stappen (`t`):
- `{t:'scene', bg:'bos', chars:['olivier','florine']}`
- `{t:'say', who:'verteller'|'olivier'|'florine'|'kwebbel'|…, text:'max 2 korte zinnen, {HELD}', mood?, sfx?}`
- `{t:'choice', q, options:[{label, icon:'emoji', say?:'reactie'}]}` – kosmetische keuze
- `{t:'game', game, skill, intro, success, hint, params:{1:{…},2:{…},3:{…}}}` – params per niveau
  - `count`: `{mode:'tap'|'howmany', n, total, item:'emoji'}`
  - `sum`: `{a, b, op:'+'|'-', item}`
  - `memory`: `{length, items:['emoji',…]}` (ook voor klimroute met ⬅️⬆️➡️)
  - `word`: `{mode:'listen'|'build'|'missing', word:'bos', pic:'🌲', options:[{w:'vis',pic:'🐟'},…]}`
  - `pick`: `{q, options:[{pic, label, correct:true|false}]}`
  - `jump`: `{blocks, coins}` – springen op blokken
- `{t:'talk', puzzle:'h1-zak', who:'kwebbel', intro, ask:'wat heb ik in mijn zak?', minQuestions:2,
   answers:[{pic, label, correct}], fallbackQs:[{q:'Is het een dier?', a:'…'}]}`
- `{t:'reward', stars:3, sticker:'emoji', text}`
- `{t:'cliff', text}` – einde hoofdstuk, "Wordt vervolgd…"

Skills: `tellen, rekenen, woorden, geheugen, logica, ruimte`. Niveau 1–3 per skill;
2× goed op rij → omhoog, 2× fout → omlaag + hint.

### api/_puzzles.js
```js
export const PUZZLES = { 'h1-zak': { who:'Kwebbel de papegaai', persona:'…', secret:'…', allowed:'wat je wel mag verklappen', hintLadder:['…','…'] } }
```
