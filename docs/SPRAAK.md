# Spraak en personagebrein

Alles draait lokaal in de browser. Er zijn geen API-calls en er is geen eigen server; de game zelf stuurt niets weg (een strikte CSP blokkeert externe verbindingen). Let op: de spraakherkenning en het dicteren van Safari/iOS zelf kunnen audio naar Apple sturen om het om te zetten naar tekst. Wie dat niet wil, zet in het oudermenu "Praten" op "Alleen tikknoppen".

## Voorlezen (`js/speech.js`)
- `unlock()` bij de eerste tik: spreekt een stille utterance (iOS geeft pas spraak vrij na een gebruikersgebaar) en laadt de stemmen (`voiceschanged`, max 1,5 s).
- Stemkeuze: eerst nl-NL met Xander/Claire/Ellen of Enhanced/Premium, dan elke andere `nl-*`-stem, anders de standaardstem met `lang='nl-NL'`.
  Tip voor ouders: installeer via Instellingen › Toegankelijkheid › Gesproken materiaal › Stemmen › Nederlands een "Verbeterde" stem.
- `speak(text, who)` roept eerst `cancel()` aan (iOS-bug), haalt emoji weg, splitst in zinnen van max. ±160 tekens (iOS kapt lange zinnen af) en speelt ze na elkaar af.
  Elk stuk heeft een veiligheids-timeout op basis van de lengte, want iOS vuurt soms geen `end`. Rate en pitch hangen af van het personage (verteller 0,95/1,0, Brom 0,85/0,6, Piep 1,0/1,8, enz.).
- Latency: er is geen netwerk, dus het voorlezen begint direct. Alleen de eerste zin wacht misschien even (max 0,8 s) op het laden van de stemmen.

## Praten: drie lagen
1. **Vasthouden-om-te-praten** (`canListen()` true): Web Speech API in een Safari-tab, `nl-NL`, met tussenresultaten. `stopListening()` wacht max 1,5 s op het laatste resultaat.
   Bij `not-allowed` of `no-speech` krijg je `''` terug. `listenError()` geeft de foutcode, zodat de UI kan vragen: "Mag ik je microfoon gebruiken?"
2. **Dicteren via het toetsenbord**: als beginscherm-app (standalone PWA) werkt spraakherkenning niet op de iPad, dus dan is `canListen()` false.
   De UI laat dan een tekstveld zien. Het kind tikt daar op de microfoonknop van het iOS-toetsenbord om te dicteren.
3. **Tikknoppen**: de vaste voorbeeldvragen (`fallbackQs`) en de antwoordplaatjes werken altijd, ook zonder microfoon of toetsenbord.

## Personagebrein (`js/brain.js`)
`answer(talkStep, question, state) -> {reply, matched, solvedGuess, kind}`. `state` is een leeg object per talk-stap en blijft alleen in het geheugen.
- Normaliseren: kleine letters, leestekens en accenten weg, eenvoudige stemming (meervoud -en/-s, verkleinwoord -je/-tje/-jes). Vulwoorden zoals "is het" en "kan het" tellen niet mee.
- Matching gebeurt op trefwoorden (`intents[].keys`), ook als een trefwoord uit meer woorden bestaat. Er is fuzzy matching (Levenshtein ≤ 1 bij woorden van 5+ letters) voor fouten van de spraakherkenning.
  De beste score wint. Wordt een intent nog een keer gevraagd, dan komt `a2`.
- Volgorde: veiligheid, dan het geheim (`secretKeys` → `win`, `solvedGuess: true`), dan een fout geraden plaatje (`wrongGuess`), dan de intents, dan `smalltalk`, en anders een fallback.
- Is er geen match, dan komt een kindvriendelijke reactie. Die rouleren zodat dezelfde zin niet twee keer achter elkaar komt. Na 2 missers volgt een hint uit `hints`, telkens een duidelijkere.
- Zonder `intents` bouwt het brein intents uit `fallbackQs`. Zonder `secretKeys` gebruikt het het label van het juiste plaatje.

## Veiligheid
- Enge of ongepaste woorden en scheldwoorden: het brein stuurt vriendelijk terug naar het verhaal en herhaalt de vraag niet.
- Lijkt het kind persoonlijke gegevens te geven ("ik woon", "ik heet", een telefoonnummer, een postcode, "ik ben 6", e-mail)? Dan herhaalt het brein niets en gaat het terug naar het verhaal.
- Verdriet of pijn ("ik heb pijn", "ik ben bang"): "Vraag even papa of mama om hulp."
- Alle antwoorden zijn vaste teksten van de schrijver of van het brein. Het brein maakt dus nooit vrije tekst.
- `{HELD}` blijft in de antwoorden staan. De frontend vult de naam pas in bij het tonen. De naam staat alleen in `localStorage`.

## Testen
- `npm test` draait `node --test` op `tests/brain.test.mjs`. Dat test matching, stemming, fuzzy matching, raden, hints en veiligheid.
- Op de iPad in Safari: vraag de microfoon toe, houd de knop vast en zeg "Is het een dier?". Je hoort het antwoord met de stem van het personage.
  Weiger daarna de microfoon en controleer de melding.
- Als beginscherm-app: de praatknop is weg, het tekstveld met dicteren werkt, en de tikknoppen werken.
- Vliegtuigmodus: alles blijft werken, want er is geen netwerk nodig.
