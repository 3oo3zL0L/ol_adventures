# Het Sterrenkompas

Een Nederlandse voorlees- en praatgame voor groep 3 (6-7 jaar), gemaakt voor de iPad in Safari (landscape).
Alles draait in de browser: geen server, geen API-calls, geen tracking. Voortgang en instellingen blijven op de iPad.

## Spelen
1. Open de link in **Safari** op de iPad.
2. Eerste keer: vul als ouder de naam van de held, een PIN van 4 cijfers en de speeltijd in.
3. Optioneel: Deel → **Zet op beginscherm**. Let op: in die modus werkt de microfoonknop niet (iOS-beperking),
   dan gebruikt de game het dicteren van het toetsenbord en tikknoppen.

Instellingen: houd ⚙️ rechtsboven 1,5 seconde vast en voer de PIN in.

## Ontwikkelen
- Geen build. Serveer de map statisch, bijv. `python3 -m http.server 8080`.
- `npm test`: unit-tests van het personagebrein.
- Stem: alle zinnen zijn vooraf ingesproken met Microsoft-neurale stemmen (edge-tts) en staan in `audio/`.
  Na het wijzigen van verhaaltekst: `pip install edge-tts` en dan `HELD_NAAM=Olivier npm run voice`
  (maakt alleen ontbrekende clips). `npm test` faalt als er een zin zonder clip is.
  Ontbreekt een clip toch, dan leest de iPad-stem die zin voor.
- Deploy: Vercel, statische site (`vercel.json` zet een strikte CSP: alleen eigen bestanden).

Zie `docs/` voor architectuur, verhaal en spraak.
