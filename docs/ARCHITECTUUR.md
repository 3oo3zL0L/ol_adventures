# Architectuur – De Sterrenkompas-Avonturen

Statische web-app zonder build (ES modules, Safari/iPadOS 16+), gehost op Vercel.
Geen serverless functies en geen externe API-calls: alles draait in de browser.
Praatpuzzels gebruiken een lokaal personagebrein (`js/brain.js`) met trefwoordherkenning.

## Bestanden
| Bestand | Eigenaar | Inhoud |
|---|---|---|
| `index.html`, `css/style.css`, `js/app.js`, `js/games.js` | Frontend | engine, UI, minigames, ouder-PIN, timer |
| `js/art.js` | Art | SVG-achtergronden en personages |
| `js/sfx.js` | Audio | gegenereerde geluiden (WebAudio, geen bestanden) |
| `js/speech.js`, `js/brain.js` | Voice & AI | TTS, STT, dicteer-fallback, lokaal personagebrein |
| `js/story/h1.js` … `h5.js` | Schrijver/Onderwijs/Design | verhaaldata en praatpuzzels |
| `manifest.webmanifest`, `sw.js`, `icons/` | Frontend | PWA |

## Privacy-afspraak
De naam van het kind staat alleen in localStorage. In verhaaltekst en in Claude-antwoorden staat `{HELD}`;
de client vervangt dat vlak voor tonen/voorlezen. De naam wordt nooit naar de server gestuurd.
Florine (zusje) staat wel in de verhaaltekst (door ouder aangeleverd, alleen voornaam).

## Interfaces
### art.js
- `background(id) -> string` SVG, viewBox `0 0 1600 900`, `preserveAspectRatio="xMidYMid slice"`.
- `character(id, mood='blij') -> string` SVG, viewBox `0 0 300 400`, figuur staat onderaan-midden.
  ids: `held, florine, kwebbel, brom, rommel, piep, verteller(null)`; moods: `blij, verbaasd, denkt, lacht`.
- Onbekende id → eenvoudige placeholder, nooit een exception.

### sfx.js
`export const sfx = { unlock(), play(name), music(on) }` – names: `tap, goed, fout, ster, whoosh, dreun, bel, pop, klim, sprong, fanfare, papegaai, piep, wind`.

### speech.js
- `unlock()` – aanroepen bij eerste tik (iOS vereist gebruikersgebaar).
- `speak(text, who) -> Promise` – resolve als klaar; stem/pitch/rate per personage; `cancel()`.
- `canListen() -> boolean` (false in standalone-PWA op iOS of zonder API).
- `startListening() / stopListening() -> Promise<string>` voor vasthouden-om-te-praten (nl-NL).

### brain.js
`answer(talkStep, question, state) -> {reply, matched, solvedGuess, kind}` – lokaal, trefwoorden + fuzzy matching,
veiligheidsfilter (enge/ongepaste woorden, persoonlijke info, verdriet). Zie `docs/SPRAAK.md`.

## Hoofdstukdata (`js/story/hN.js`)
```js
export default { id:'h1', title:'…', sticker:'🗺️', steps:[ … ] }
```
Stappen (`t`):
- `{t:'scene', bg:'bos', chars:['held','florine']}`
- `{t:'say', who:'verteller'|'held'|'florine'|'kwebbel'|…, text:'max 2 korte zinnen, {HELD}', mood?, sfx?}`
- `{t:'choice', q, options:[{label, icon:'emoji', say?:'reactie'}]}` – kosmetische keuze
- `{t:'game', game, skill, intro, success, hint, params:{1:{…},2:{…},3:{…}}}` – params per niveau
  - `count`: `{mode:'tap'|'howmany', n, total, item:'emoji'}`
  - `sum`: `{a, b, op:'+'|'-', item}`
  - `memory`: `{length, items:['emoji',…]}` (ook voor klimroute met ⬅️⬆️➡️)
  - `word`: `{mode:'listen'|'build'|'missing', word:'bos', pic:'🌲', options:[{w:'vis',pic:'🐟'},…]}`
  - `pick`: `{q, options:[{pic, label, correct:true|false}]}`
  - `jump`: `{blocks, coins}` – springen op blokken
- `{t:'talk', puzzle:'h1-zak', who:'kwebbel', intro, ask:'wat heb ik in mijn zak?', minQuestions:2,
   answers:[{pic, label, correct}], fallbackQs:[{q:'Is het een dier?', a:'…'}],
   intents:[{id, keys:[…], a, a2}], secretKeys:[…], win, wrongGuess, guessKeys:{…}, hints:[…]}`
- `{t:'reward', stars:3, sticker:'emoji', text}`
- `{t:'cliff', text}` – einde hoofdstuk, "Wordt vervolgd…"

Skills: `tellen, rekenen, woorden, geheugen, logica, ruimte`. Niveau 1–3 per skill;
2× goed op rij → omhoog, 2× fout → omlaag + hint.
