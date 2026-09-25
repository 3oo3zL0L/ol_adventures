// Hoofdstuk 5 – De Grote Kartrace (FINALE)
// Leerdoelen: + en − tot 20 (race, rugby-score), tellen (pitstop), logica (welk spoor),
// geheugen (rugby-passes), ontmaskeren met bewijs (talk), herhaling mkm-woorden (bal + bos, sok, kip, vis, roos, boot).
export default {
  id: 'h5',
  title: 'De Grote Kartrace',
  sticker: '🏆',
  steps: [
    // --- Zachte landing op de raceplaneet ---
    { t: 'scene', bg: 'planeet', chars: ['held', 'florine', 'piep', 'raket'] },
    { t: 'say', who: 'verteller', text: 'De raket staat veilig in een berg paars zand. Toet toet, er zoeft een kart voorbij!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'Dat stuiteren was leuk! Konijn wil nog een keer.', mood: 'lacht' },
    { t: 'say', who: 'piep', text: 'Bliep! Landing geslaagd, op een planeet vol racebanen.', mood: 'blij', sfx: 'piep' },
    { t: 'say', who: 'held', text: 'Racebanen? Kom op, dat wil ik zien!', mood: 'blij' },

    // --- De kartbaan ---
    { t: 'scene', bg: 'kartbaan', chars: ['held', 'florine', 'piep', 'kwebbel'] },
    { t: 'say', who: 'kwebbel', text: 'Hallo, hallo, wat een baan, wat een bocht! Hier wordt vandaag hard gerend en gezocht!', mood: 'lacht', sfx: 'papegaai' },
    { t: 'say', who: 'piep', text: 'Bliep! Wie de Grote Kartrace wint, mag één wens doen!', mood: 'verbaasd' },
    { t: 'say', who: 'verteller', text: 'Kijk, boven op de finish-toren glinstert iets. Het Sterrenkompas!', sfx: 'ster' },
    { t: 'say', who: 'held', text: 'Als ik win, wens ik het kompas terug. Ik doe mee!', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Ik doe ook mee! Met mijn loopfiets.', mood: 'blij' },
    { t: 'say', who: 'piep', text: 'Bliep! Een loopfiets heeft nul motoren, dus Florine wordt pitstop-baas.', mood: 'lacht' },
    {
      t: 'choice',
      q: 'Welke kleur krijgt jouw kart?',
      options: [
        { label: 'Rood als vuur', icon: '🔴', say: 'Vroem! Een rode kart is supersnel.' },
        { label: 'Blauw als het ven', icon: '🔵', say: 'Mooi! Net zo blauw als het ven in Oisterwijk.' },
        { label: 'Groen als het bos', icon: '🟢', say: 'Stoer! Een groene bos-kart.' }
      ]
    },

    // --- Aan de start: een geheimzinnige racer ---
    { t: 'say', who: 'verteller', text: 'Naast {HELD} staat nog één kart. De racer heeft een helm op en een zwart masker.' },
    { t: 'say', who: 'verteller', text: 'Achter uit de kart wappert een staart. Een staart met strepen!', sfx: 'wind' },
    { t: 'say', who: 'florine', text: 'Daar is de kleine zebra weer! Hallo zebra!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Wacht eens. Die staart heb ik vaker gezien.', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Er liggen sporen bij elke kart in het zand. Kijk goed, welk spoor is van die gemaskerde hand?', mood: 'denkt' },
    {
      t: 'game', game: 'pick', skill: 'logica',
      intro: 'Kijk goed naar de sporen. Welk spoor hoort bij de gemaskerde racer?',
      success: 'Goed gespeurd! Kleine handjes en snoeppapiertjes. Dat kennen we!',
      hint: 'Denk aan de hut en aan de picknick van Brom. Wat vonden we daar steeds?',
      params: {
        1: {
          q: 'Bij de kart liggen kleine afdrukjes met vingertjes. Welke is het?',
          options: [
            { pic: '🖐️', label: 'handjes', correct: true },
            { pic: '👢', label: 'laars', correct: false },
            { pic: '🐾', label: 'hond', correct: false }
          ]
        },
        2: {
          q: 'Het spoor heeft kleine vingertjes. En er ligt snoep bij. Welke is het?',
          options: [
            { pic: '🖐️🍬', label: 'handjes en snoep', correct: true },
            { pic: '🖐️🍎', label: 'handjes en appel', correct: false },
            { pic: '🐾🍬', label: 'hond en snoep', correct: false },
            { pic: '👢🍬', label: 'laars en snoep', correct: false }
          ]
        },
        3: {
          q: 'Het spoor heeft vingertjes, snoeppapier en een belletje. Welke is het?',
          options: [
            { pic: '🖐️🍬🔔', label: 'handjes, snoep, bel', correct: true },
            { pic: '🖐️🍬🥕', label: 'handjes, snoep, wortel', correct: false },
            { pic: '🐾🍬🔔', label: 'hond, snoep, bel', correct: false },
            { pic: '🖐️🍎🔔', label: 'handjes, appel, bel', correct: false },
            { pic: '👣🍬🔔', label: 'voeten, snoep, bel', correct: false }
          ]
        }
      }
    },
    { t: 'say', who: 'held', text: 'Ik weet het! De racer is de belletje-lellende snoepsmikkelaar!', mood: 'denkt' },
    { t: 'say', who: 'verteller', text: 'De gemaskerde racer zakt diep weg in zijn kart. Oeps, hoor je heel zacht.' },

    // --- De race, deel 1 ---
    { t: 'say', who: 'piep', text: 'Bliep! Drie, twee, één, race!', mood: 'blij', sfx: 'piep' },
    {
      t: 'game', game: 'race', skill: 'rekenen',
      intro: 'Elke goede som geeft gas! Reken snel, dan rijdt jouw kart vooruit.',
      success: 'Vroem! Jij ligt voor. Maar de band maakt een raar geluid…',
      hint: 'Tel verder vanaf het grootste getal. Bij min tel je terug.',
      params: {
        1: { rounds: [{ a: 2, b: 1, op: '+' }, { a: 3, b: 2, op: '+' }, { a: 4, b: 1, op: '-' }], item: '🏎️', rival: '🚙' },
        2: { rounds: [{ a: 5, b: 3, op: '+' }, { a: 9, b: 4, op: '-' }, { a: 6, b: 4, op: '+' }, { a: 10, b: 3, op: '-' }], item: '🏎️', rival: '🚙' },
        3: { rounds: [{ a: 8, b: 6, op: '+' }, { a: 15, b: 7, op: '-' }, { a: 9, b: 9, op: '+' }, { a: 20, b: 6, op: '-' }], item: '🏎️', rival: '🚙' }
      }
    },

    // --- Pitstop ---
    { t: 'say', who: 'verteller', text: 'Pssssst, een band is lek! Snel naar de pitstop!', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Ik ben de pitstop-baas! Ik pak nieuwe banden, of donuts?', mood: 'lacht' },
    {
      t: 'game', game: 'count', skill: 'tellen',
      intro: 'Florine heeft banden klaargelegd. Hoeveel banden zie je?',
      success: 'Goed geteld! Florine rolt de juiste band naar de kart.',
      hint: 'Tik met je vinger op elke band. Tel ze één voor één.',
      params: {
        1: { mode: 'howmany', n: 5, item: '🛞' },
        2: { mode: 'howmany', n: 9, item: '🛞' },
        3: { mode: 'howmany', n: 14, item: '🛞' }
      }
    },
    { t: 'say', who: 'piep', text: 'Bliep! Florine is de snelste pitstop-baas van het heelal!', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'En ik heb geen donut opgegeten. Nou ja, eentje.', mood: 'lacht' },

    // --- De race, deel 2 ---
    { t: 'say', who: 'verteller', text: 'De gemaskerde racer is vlakbij! Zijn gestreepte staart wappert in de wind.', sfx: 'wind' },
    {
      t: 'game', game: 'race', skill: 'rekenen',
      intro: 'Laatste ronde! Reken goed, dan haal jij de finish als eerste.',
      success: 'Finish! Jij hebt de Grote Kartrace gewonnen!',
      hint: 'Rustig maar. Gebruik je vingers om verder of terug te tellen.',
      params: {
        1: { rounds: [{ a: 3, b: 1, op: '+' }, { a: 5, b: 2, op: '-' }, { a: 2, b: 2, op: '+' }], item: '🏎️', rival: '🚙' },
        2: { rounds: [{ a: 7, b: 2, op: '+' }, { a: 8, b: 5, op: '-' }, { a: 4, b: 6, op: '+' }, { a: 10, b: 7, op: '-' }], item: '🏎️', rival: '🚙' },
        3: { rounds: [{ a: 7, b: 8, op: '+' }, { a: 17, b: 9, op: '-' }, { a: 11, b: 6, op: '+' }, { a: 19, b: 12, op: '-' }, { a: 13, b: 7, op: '+' }], item: '🏎️', rival: '🚙' }
      }
    },
    { t: 'say', who: 'kwebbel', text: 'Hoera, hoera, wat een race, wat een vaart! Jij bent de winnaar, dat is klaar!', mood: 'lacht', sfx: 'fanfare' },
    { t: 'say', who: 'held', text: 'Mijn wens: ik wil het Sterrenkompas terug!', mood: 'blij' },
    { t: 'say', who: 'verteller', text: 'Hoepla, de gemaskerde racer stopt het kompas in een bal. En weg rent hij!', sfx: 'whoosh' },

    // --- Rugby-finale ---
    { t: 'scene', bg: 'kartbaan', chars: ['held', 'florine', 'piep', 'racer'] },
    { t: 'say', who: 'piep', text: 'Bliep! Dat is geen gewone bal, dat is een rugbybal!', mood: 'verbaasd', sfx: 'piep' },
    { t: 'say', who: 'held', text: 'Kom op, Piep, we spelen rugby om de kompasbal. Heel vriendelijk, zonder duwen!', mood: 'blij' },
    { t: 'say', who: 'verteller', text: 'De gemaskerde racer gooit de bal per ongeluk hoog in de lucht. Nu is het team {HELD} aan de beurt!' },
    {
      t: 'game', game: 'memory', skill: 'geheugen',
      intro: 'Kijk goed wie de bal naar wie gooit. Doe de passes daarna na!',
      success: 'Wat een mooie passes! De bal gaat van hand tot hand.',
      hint: 'Kijk nog eens rustig. Zeg hardop wie de bal krijgt.',
      params: {
        1: { length: 3, items: ['🧒', '👧', '🦜'] },
        2: { length: 4, items: ['🧒', '👧', '🦜', '🤖'] },
        3: { length: 5, items: ['🧒', '👧', '🦜', '🤖', '🐰'] }
      }
    },
    { t: 'say', who: 'verteller', text: '{HELD} duikt met de bal over de lijn. Try, een punt voor het team!', sfx: 'goed' },
    { t: 'say', who: 'florine', text: 'Ik scoor ook! O nee, dat is mijn knuffel Konijn.', mood: 'lacht' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Op het scorebord staan de punten van het team. Hoeveel punten zijn het samen?',
      success: 'Goed geteld! Team {HELD} wint het rugbypotje.',
      hint: 'Begin bij het grootste getal. Tel dan de rest erbij.',
      params: {
        1: { a: 3, b: 2, op: '+', item: '🏉' },
        2: { a: 5, b: 4, op: '+', item: '🏉' },
        3: { a: 12, b: 7, op: '+', item: '🏉' }
      }
    },
    { t: 'say', who: 'piep', text: 'Bliep! Wat een mooie wedstrijd, en niemand is omgevallen.', mood: 'lacht' },
    { t: 'say', who: 'verteller', text: 'De gemaskerde racer gaat op het gras zitten. Hij houdt de bal stevig vast.' },
    { t: 'say', who: 'held', text: 'Wie ben jij eigenlijk? Heb jij het kompas?', mood: 'denkt' },

    // --- Praatpuzzel: ontmaskeren met bewijs ---
    { t: 'scene', bg: 'kartbaan', chars: ['held', 'florine', 'racer'] },
    {
      t: 'talk', puzzle: 'h5-ontmaskeren', who: 'rommel', char: 'racer', label: 'Gemaskerde racer',
      intro: 'Ik weet van niks, hoor, ik ben gewoon een racer. Vraag maar wat je wilt… oeps.',
      ask: 'Wie is de gemaskerde racer echt?',
      minQuestions: 2,
      answers: [
        { pic: '🦝', label: 'Een wasbeer', correct: true },
        { pic: '🦓', label: 'Een zebra', correct: false },
        { pic: '🦊', label: 'Een vos', correct: false },
        { pic: '🐿️', label: 'Een eekhoorn', correct: false }
      ],
      // Tikvragen als spraak niet kan: elke vraag laat de racer iets meer toegeven.
      fallbackQs: [
        { q: 'Heb jij kleine handjes?', a: 'Eh, ja, kleine handjes met vingertjes. Maar dat zegt toch niks, oeps?' },
        { q: 'Is die staart met strepen van jou?', a: 'Die staart is nep, hoor! Nou ja, hij wiebelt wel als ik blij ben.' },
        { q: 'Waarom liggen er snoeppapiertjes?', a: 'Snoeppapiertjes? Die vallen er soms uit. Ik snoep een beetje veel, oeps.' },
        { q: 'Deed jij belletje lellen bij de hut?', a: 'Tring… ik wilde alleen even hallo zeggen. En toen durfde ik niet meer.' },
        { q: 'Waarom heb jij het kompas?', a: 'Als ik het had… dan was dat omdat ik zelf de weg naar huis kwijt ben.' },
        { q: 'Mag je masker af?', a: 'Mijn maskertje gaat niet af, dat is mijn gezicht! Oeps, dat zei ik niet.' }
      ],
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'weet ik nie', 'weet nie', 'moeilijk', 'tip', 'zeg het maar', 'zeg het',
            'vertel het', 'verklap', 'verklappen', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Een tip? Oeps… goed dan, eentje.', a2: 'Nog een tip? Pfff, jij bent een echte speurneus.' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'goedemorgen', 'goedemiddag', 'hoe gaat het'],
          a: 'Eh… hoi. Ik zeg niet zoveel, ik ben een beetje verlegen.', a2: 'Hoi nog een keer. Vraag maar iets, oeps.' },
        { id: 'stoppen', keys: ['stoppen', 'stop', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of vraag nog even door, dat is ook goed.', a2: 'Even pauze mag altijd. Tik op het huisje, of stel nog een vraag.' },
        { id: 'grap', keys: ['grapje', 'mop', 'haha', 'hihi', 'lol', 'gek'],
          a: 'Hihi… ik moet lachen, maar ik mag niks verklappen. Oeps.', a2: 'Haha. Vraag nou maar iets over de sporen.' },
        { id: 'wie', keys: ['wie ben jij', 'wie ben je', 'hoe heet jij', 'hoe heet je', 'jouw naam', 'wat ben jij', 'wat voor dier', 'welk dier', 'ben jij een dier', 'dier'],
          a: 'Wie ik ben? Gewoon een racer, met een staart. Oeps.', a2: 'Ik ben een dier uit het bos, meer zeg ik niet. Nou ja, bijna niet.' },
        { id: 'handjes', keys: ['handjes', 'handen', 'hand', 'pootjes', 'poten', 'poot', 'vingertjes', 'vingers', 'voetafdruk', 'voetafdrukken',
            'afdruk', 'afdrukken', 'voetjes', 'voeten', 'sporen', 'spoor', 'handschoenen'],
          a: 'Mijn handjes? Eh, ja, ze hebben kleine vingertjes, net als die afdrukken. Oeps.', a2: 'Oké, oké. Die afdrukjes bij de hut waren van mij. Maar verder weet ik van niks!' },
        { id: 'staart', keys: ['staart', 'strepen', 'streep', 'gestreept', 'gestreepte', 'streepjes', 'gestreepte staart', 'zwart en grijs', 'ringen'],
          a: 'Die staart is van plastic! Eh, nee, hij is echt, hij wiebelt als ik zenuwachtig ben.', a2: 'Ja, die staart met strepen was in de struiken bij de hut. Dat was ik. Oeps.' },
        { id: 'snoep', keys: ['snoep', 'snoepjes', 'snoepje', 'snoeppapier', 'snoeppapiertjes', 'papiertjes', 'papier', 'lolly', 'drop', 'snoepen'],
          a: 'Snoeppapiertjes? Die vallen soms uit mijn kart. Oeps, daar valt er weer een.', a2: 'Ik snoep heel graag. Het spijt me van al die papiertjes.' },
        { id: 'picknick', keys: ['picknick', 'broodjes', 'taart', 'eten van brom', 'geplunderd', 'mand', 'boterham', 'eten', 'honger'],
          a: 'De picknick van Brom? Eh… die rook zo lekker. Ik heb maar een heel klein hapje genomen.', a2: 'Nou ja… een groot hapje. Sorry, Brom. Ik had zo’n honger.' },
        { id: 'bel', keys: ['bel', 'belletje', 'belletje lellen', 'belletje trekken', 'aanbellen', 'aangebeld', 'gebeld', 'lellen', 'tring', 'deurbel'],
          a: 'Tring, tring… ik wilde alleen even hallo zeggen bij de hut. Maar toen durfde ik niet.', a2: 'Ja, ik deed belletje lellen. Ik was te verlegen om te blijven.' },
        { id: 'dader', keys: ['dader', 'dief', 'boef', 'wie heeft het gedaan', 'wie was het', 'wie heeft het kompas', 'wie pakte', 'schuldig'],
          a: 'De dader? Eh… die heeft vast kleine handjes en een staart met strepen. Oeps.', a2: 'Wie het was? Kijk maar goed naar mij… eh, naar de sporen, bedoel ik.' },
        { id: 'waarom', keys: ['waarom', 'hoezo', 'waarvoor', 'waarom deed je', 'waarom pakte'],
          a: 'Waarom? Stel dat ik iets heb gepakt… dan was dat omdat ik zelf de weg kwijt ben.', a2: 'Ik ben al heel lang verdwaald. Het kompas wijst de weg naar huis, snap je?' },
        { id: 'kompas', keys: ['kompas', 'sterrenkompas', 'toren', 'bal', 'rugbybal', 'kompasbal', 'geef terug', 'teruggeven', 'terug'],
          a: 'Welk kompas? Deze bal is gewoon een bal. Oeps, hij tikt als een klokje.', a2: 'Oké, het kompas zit in de bal. Maar ik wilde het alleen even lenen.' },
        { id: 'masker', keys: ['masker', 'maskertje', 'zwart masker', 'ogen', 'gezicht', 'bril', 'helm', 'helm af', 'afzetten', 'zet af', 'doe af', 'verstoppen', 'verkleed'],
          a: 'Mijn helm blijft op! En mijn maskertje gaat niet af, dat is mijn gezicht… oeps.', a2: 'Onder mijn helm zitten twee ronde oren. Meer zeg ik niet!' },
        { id: 'thuis', keys: ['thuis', 'huis', 'naar huis', 'waar woon je', 'waar woon jij', 'waar kom je vandaan', 'verdwaald', 'kwijt', 'de weg', 'weg kwijt', 'familie', 'mama', 'papa'],
          a: 'Mijn huis staat in een holle boom, heel ver weg. Ik weet de weg niet meer.', a2: 'Ik ben verdwaald, al heel lang. Ik mis mijn holle boom.' },
        { id: 'eenzaam', keys: ['eenzaam', 'alleen', 'vriend', 'vrienden', 'vriendje', 'verdrietig', 'huilen', 'zielig', 'spelen', 'samen', 'blij'],
          a: 'Ik ben vaak alleen. Daarom haal ik soms kattenkwaad uit, dan zien ze me tenminste.', a2: 'Een vriendje? Dat zou ik heel fijn vinden. Maar wie wil er nou een snoepsmikkelaar als vriend?' },
        { id: 'sorry', keys: ['sorry', 'vergeven', 'vergeef', 'excuses', 'niet erg', 'geeft niet', 'ik ben niet boos', 'niet boos', 'boos', 'lief'],
          a: 'Ben je niet boos? Oh… dat is fijn. Dan durf ik misschien de waarheid te zeggen.', a2: 'Dank je. Vraag nog één ding, dan vertel ik wie ik ben.' },
        { id: 'eerlijk', keys: ['eerlijk', 'liegen', 'lieg', 'jokken', 'jok', 'waarheid', 'echt waar', 'smoesje'],
          a: 'Liegen is niet netjes, dat weet ik. Oké, ik jok een beetje. Oeps.', a2: 'De waarheid? Kijk maar naar alle sporen, dan weet jij het al.' },
        { id: 'race', keys: ['race', 'racen', 'kart', 'karten', 'auto', 'snel', 'winnen', 'gewonnen', 'tweede', 'rijden', 'vroem'],
          a: 'Jij racet supergoed! Ik wilde winnen, zodat ik het kompas mocht wensen.', a2: 'Ik werd tweede. Jij was gewoon sneller, dat is eerlijk.' },
        { id: 'florine', keys: ['florine', 'flo', 'zusje', 'konijn', 'knuffel'],
          a: 'Dat kleine meisje dacht dat ik een zebra was. Hihi, dat vond ik stiekem leuk.', a2: 'Haar knuffel Konijn heb ik niet gepakt, echt niet!' },
        { id: 'brom', keys: ['brom', 'reus', 'sok', 'sokken', 'schoen', 'muis', 'muizen'],
          a: 'Die grote reus is heel lief. Zijn sok raakte kwijt omdat het kompas weg was, oeps.', a2: 'Ik was een beetje bang voor Brom. Maar hij is bang voor muizen, dus we zijn quitte.' },
        { id: 'kwebbel', keys: ['kwebbel', 'papegaai', 'kaart', 'toverkaart', 'rijm', 'rijmen'],
          a: 'Die papegaai rijmt de hele dag. Hij zag mij vast al in het bos.', a2: 'Die kaart had een leeg gat. Daar hoort het kompas, dat weet ik wel.' },
        { id: 'piep', keys: ['piep', 'robot', 'raket', 'ruimte', 'ruimteschip', 'planeet', 'vliegen', 'bliep'],
          a: 'Die robot zegt steeds bliep. Ik kwam hier met een ruimte-kart, heel hoog door de lucht.', a2: 'Ik dacht: op deze planeet vind ik de weg wel. Maar nee hoor.' },
        { id: 'boot', keys: ['boot', 'bootje', 'water', 'ven', 'zee', 'piraat', 'schatkist', 'kist', 'sleutel', 'sleuteltje'],
          a: 'Het bootje op de rivier? Dat dreef weg omdat alles de weg kwijt raakte. Ik was het echt niet!', a2: 'Toen het kompas weg was, raakte alles zoek. Ook bootjes. Dat spijt me.' },
        { id: 'kleur', keys: ['kleur', 'welke kleur', 'grijs', 'zwart', 'wit', 'bruin'],
          a: 'Ik ben grijs, met een zwart maskertje. Heel deftig, toch?', a2: 'Grijs met zwart. Net als die strepen op mijn staart. Oeps.' },
        { id: 'beer', keys: ['beer', 'beertje', 'beren', 'ijsbeer', 'panda', 'teddybeer'],
          a: 'Een beer? Bijna! Ik ben een kleine beer die zijn eten wast.', a2: 'Warm, heel warm! Wat voor beer wast zijn snoepje in het water?' },
        { id: 'bang', keys: ['bang', 'schrik', 'spannend', 'zenuwachtig', 'trillen'],
          a: 'Ik ben een beetje zenuwachtig. Mijn staart trilt ervan.', a2: 'Als jij lief bent, ben ik niet meer bang.' }
      ],
      // Het kind wint als het de wasbeer noemt of hem eerlijk aanwijst als de kompas-pakker.
      // Geen 'rommel' (gewoon woord: "wat een rommel") en geen 'kompas gepakt' (staat ook in "wie heeft het kompas gepakt?").
      secretKeys: ['wasbeer', 'wasberen', 'wasbeertje', 'was beer', 'was beertje',
        'jij hebt het kompas', 'jij hebt het gepakt', 'jij hebt het gedaan', 'heb jij het gedaan', 'jij was het', 'was jij het',
        'jij deed het', 'jij bent het', 'jij bent de dader', 'ben jij de dader', 'jij bent de dief', 'ben jij de dief'],
      win: 'Oeps… ja. Jij hebt het goed, ik ben een wasbeer. En ik heb het kompas meegenomen.',
      wrongGuess: 'Nee, dat ben ik niet. Maar goed geprobeerd! Kijk nog eens naar de sporen.',
      wrongGuess2: 'Hihi, nee hoor. Vraag nog iets over mijn staart of mijn handjes.',
      guessKeys: {
        zebra: ['zebra', 'zebras', 'zebraatje'],
        vos: ['vos', 'vosje', 'vossen'],
        eekhoorn: ['eekhoorn', 'eekhoorntje', 'eekhoorns'],
        anders: ['kat', 'poes', 'hond', 'aap', 'aapje', 'tijger', 'muis']
      },
      hints: [
        'Kijk eens naar mijn staart met strepen. En naar mijn zwarte maskertje, oeps.',
        'Ik heb kleine handjes en ik woon in het bos. Ik was mijn eten graag in het water.',
        'Ik was mijn snoepje voor ik het eet. Was… en ik ben zo knuffelig als een beer!'
      ]
    },

    // --- Ontmaskerd: Rommel ---
    { t: 'say', who: 'verteller', text: 'De racer zet langzaam zijn helm af. Twee ronde oortjes en een zwart maskertje!', sfx: 'pop' },
    { t: 'scene', bg: 'kartbaan', chars: ['held', 'florine', 'rommel'] },
    { t: 'say', who: 'rommel', text: 'Ik heet Rommel. Rommel de wasbeer.', mood: 'verbaasd' },
    { t: 'say', who: 'rommel', text: 'Sorry voor het belletje lellen en de picknick. En sorry voor het kompas.', mood: 'denkt' },
    { t: 'say', who: 'rommel', text: 'Ik was al zo lang de weg naar huis kwijt. Ik wilde het kompas alleen even lenen.', mood: 'denkt' },
    { t: 'say', who: 'florine', text: 'Geen zebra? Nou ja, je mag toch mijn vriendje zijn.', mood: 'blij' },
    {
      t: 'choice',
      q: 'Wat zeg jij tegen Rommel?',
      options: [
        { label: 'Het is goed, ik vergeef je', icon: '🤝', say: 'Rommel krijgt een hele grote glimlach. Dank je wel!' },
        { label: 'Wil jij onze vriend zijn?', icon: '💛', say: 'Rommel springt op van blijdschap. Een vriend, echt waar?' },
        { label: 'Geef me een knuffel!', icon: '🤗', say: 'Knuffel! Rommel is zacht als een kussen.' }
      ]
    },
    { t: 'say', who: 'held', text: 'Weet je wat, Rommel? Het kompas wijst iedereen de weg naar huis, ook jou!', mood: 'blij' },
    { t: 'say', who: 'rommel', text: 'Mij ook? Oh, dank je wel, {HELD}!', mood: 'lacht' },

    // --- Het kompas wijst de weg ---
    { t: 'scene', bg: 'kartbaan', chars: ['held', 'rommel', 'piep', 'kompas'] },
    { t: 'say', who: 'verteller', text: 'Rommel geeft de bal aan {HELD}. Klik, het Sterrenkompas springt eruit en straalt!', sfx: 'ster' },
    { t: 'say', who: 'verteller', text: 'De naald draait rond. Hij wijst naar een holle boom in Oisterwijk, vlak bij het ven!' },
    { t: 'say', who: 'rommel', text: 'Mijn holle boom! Dan wonen we vlak bij elkaar!', mood: 'lacht' },
    { t: 'say', who: 'piep', text: 'Bliep! Iedereen de raket in, ook Rommel.', mood: 'blij', sfx: 'piep' },
    { t: 'say', who: 'rommel', text: 'Dank je wel, bliep! Oeps, nu zeg ik ook al bliep.', mood: 'lacht' },

    // --- Terug naar Oisterwijk ---
    { t: 'scene', bg: 'ven', chars: ['held', 'florine', 'brom', 'raket'] },
    { t: 'say', who: 'verteller', text: 'Zoef, de raket landt zacht naast het ven. Weer thuis in Oisterwijk!', sfx: 'whoosh' },
    { t: 'say', who: 'brom', text: 'Hmmm, daar zijn jullie! Ik ben van het strand helemaal naar huis gelopen.', mood: 'blij', sfx: 'dreun' },
    { t: 'say', who: 'verteller', text: 'Overal komen verdwaalde dingen terug. Sokken, eendjes en zelfs een kikker met een hoedje.' },
    { t: 'say', who: 'florine', text: 'Konijn is er ook nog! Hij was nooit weg, hij zat in mijn jas.', mood: 'lacht' },

    // --- Het feest ---
    { t: 'scene', bg: 'feest', chars: ['held', 'florine', 'kwebbel', 'rommel'] },
    { t: 'say', who: 'kwebbel', text: 'Feest, feest, wat een pret en wat een lol! De hele hut zit met vrienden vol!', mood: 'lacht', sfx: 'papegaai' },
    { t: 'say', who: 'verteller', text: 'Op de feestslinger is één woord nog niet af. Het is het ding waarmee je rugby speelt!' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Maak het feestwoord af. Waar speelden we rugby mee?',
      success: 'Bal! Het feestwoord is af. Nu kan het feest beginnen!',
      hint: 'Zeg de klanken langzaam: b… a… l. Plak ze aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'bal', pic: '🏉',
          options: [
            { w: 'bos', pic: '🌲' },
            { w: 'kip', pic: '🐔' }
          ]
        },
        2: {
          mode: 'build', word: 'bal', pic: '🏉',
          options: [
            { w: 'sok', pic: '🧦' },
            { w: 'vis', pic: '🐟' },
            { w: 'boot', pic: '⛵' }
          ]
        },
        3: {
          mode: 'missing', word: 'bal', pic: '🏉',
          options: [
            { w: 'bel', pic: '🔔' },
            { w: 'bos', pic: '🌲' },
            { w: 'roos', pic: '🌹' },
            { w: 'kip', pic: '🐔' }
          ]
        }
      }
    },
    { t: 'scene', bg: 'feest', chars: ['held', 'brom', 'piep', 'rommel'] },
    { t: 'say', who: 'brom', text: 'Hmmm, taart! En al mijn spullen zijn weer terug.', mood: 'lacht' },
    { t: 'say', who: 'piep', text: 'Bliep! Kijk, mijn feesthoedje, o wacht, dat is een sok.', mood: 'lacht' },
    { t: 'say', who: 'rommel', text: 'Ik heb nog nooit zoveel vrienden gehad. Geen belletje lellen meer, nou ja, bijna nooit!', mood: 'lacht', sfx: 'bel' },

    // --- Terug in de hut ---
    { t: 'scene', bg: 'hut', chars: ['held', 'florine', 'kompas'] },
    { t: 'say', who: 'verteller', text: 'Het Sterrenkompas hangt weer op zijn plek op de toverkaart. Het glinstert zachtjes.', sfx: 'ster' },
    { t: 'say', who: 'florine', text: 'Morgen weer een avontuur? Met Rommel en taart?', mood: 'blij' },
    { t: 'say', who: 'held', text: 'Zeker weten, Flo. Wij zijn het beste team!', mood: 'lacht' },

    // --- Beloning ---
    { t: 'reward', stars: 3, sticker: '🏆', text: 'Hoera, {HELD}! Je won de Grote Kartrace, ontmaskerde Rommel en bracht het Sterrenkompas terug.' },

    // --- Einde ---
    { t: 'say', who: 'verteller', text: 'De zon zakt achter het ven. In de holle boom zwaait Rommel welterusten.', sfx: 'wind' },
    { t: 'cliff', end: true, text: 'Einde. Maar wie weet… komt er ooit een nieuw avontuur!' }
  ]
};
