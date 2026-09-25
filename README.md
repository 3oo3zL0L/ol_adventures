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
- Deploy: Vercel, statische site (`vercel.json` zet een strikte CSP: alleen eigen bestanden).

Zie `docs/` voor architectuur, verhaal en spraak.
