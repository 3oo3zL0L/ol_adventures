// Hoofdstuk 4 – Het Ruimteschip
// Leerdoelen: aftellen/aftrekken tot 10, optellen tot 15, geheugen (knoppenreeks), ruimte (springen op blokken),
// wat-als / oorzaak-gevolg (talk), klankzuiver mkm-woord 'kip'.
export default {
  id: 'h4',
  title: 'Het Ruimteschip',
  sticker: '🚀',
  steps: [
    // --- Intro: de raket op het strand (vervolg van H3) ---
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'kwebbel', 'raket'] },
    { t: 'say', who: 'verteller', text: 'Op het strand staat een echte raket. Er komt nog een wolkje rook uit, pfff.', sfx: 'wind' },
    { t: 'say', who: 'florine', text: 'Een raket! Mag ik erin, met mijn laarsjes aan?', mood: 'blij' },
    { t: 'say', who: 'kwebbel', text: 'Een raket op het zand, wat een gek bezoek! Wie zit daar toch in, in welke hoek?', mood: 'verbaasd' },
    { t: 'say', who: 'verteller', text: 'Sssss, het deurtje gaat open. Er rolt iemand naar buiten!', sfx: 'piep' },
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'piep', 'raket'] },
    { t: 'say', who: 'piep', text: 'Bliep, hallo aardbewoners! Ik ben Piep, de robot van dit ruimteschip.', mood: 'blij' },
    { t: 'say', who: 'held', text: 'Een echte robot! Wat kom je hier doen, Piep?', mood: 'verbaasd' },
    { t: 'say', who: 'piep', text: 'Mijn kijker zag iets glimmen in de ruimte. Een kompas met een ster erop, bliep!', mood: 'denkt' },
    { t: 'say', who: 'held', text: 'Het Sterrenkompas! Dat zoeken wij al het hele avontuur.', mood: 'blij' },
    { t: 'say', who: 'piep', text: 'Dan gaan we samen. Er is plek voor twee aardbewoners en één papegaai.', mood: 'lacht' },
    { t: 'say', who: 'piep', text: 'Wat is dat pluizige ding, Florine? Een zachte ruimtehelm?', mood: 'denkt' },
    { t: 'say', who: 'florine', text: 'Nee gekke robot, dat is Konijn! Konijn gaat ook mee.', mood: 'lacht' },
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'brom', 'raket'] },
    { t: 'say', who: 'brom', text: 'Hmmmm, ik pas daar niet in. Mijn schoen is al groter dan die raket.', mood: 'denkt' },
    { t: 'say', who: 'brom', text: 'Ik blijf hier en pas op het strand. Dag vrienden, goede reis!', mood: 'blij', sfx: 'wind' },
    { t: 'say', who: 'florine', text: 'Dag Brom! Pas op voor muizen!', mood: 'lacht' },
    {
      t: 'choice',
      q: 'Wat neem je mee de ruimte in?',
      options: [
        { label: 'Een zaklamp', icon: '🔦', say: 'Slim! Dan kun je in het donker alles zien.' },
        { label: 'Een boterham', icon: '🥪', say: 'Lekker! Een ruimteboterham, die zweeft vanzelf naar je mond.' },
        { label: 'Een verrekijker', icon: '🔭', say: 'Goed plan! Daarmee zie je de sterren van heel dichtbij.' }
      ]
    },

    // --- In het ruimteschip: aftellen ---
    { t: 'scene', bg: 'ruimteschip', chars: ['held', 'florine', 'kwebbel', 'piep'] },
    { t: 'say', who: 'verteller', text: 'Binnen zijn overal lampjes en knoppen. Het piept en het knippert.', sfx: 'piep' },
    { t: 'say', who: 'florine', text: 'Ik druk op alle knoppen! Mag dat?', mood: 'blij' },
    { t: 'say', who: 'piep', text: 'Bliep, nee, eerst gordels om! Dan tellen we af, van tien naar nul.', mood: 'verbaasd' },
    { t: 'say', who: 'kwebbel', text: 'Tien, negen, acht, wat een kracht! Nu jij, dan gaan we met volle macht!', mood: 'lacht' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Op het aftelbord branden lampjes. Er gaan er een paar uit. Hoeveel blijven er aan?',
      success: 'Goed afgeteld! De raket begint te brommen.',
      hint: 'Tel eerst alle lampjes. Haal de lampjes met een kruisje weg en tel wat er over is.',
      params: {
        1: { a: 5, b: 2, op: '-', item: '💡' },
        2: { a: 10, b: 4, op: '-', item: '💡' },
        3: { a: 10, b: 7, op: '-', item: '💡' }
      }
    },
    { t: 'say', who: 'verteller', text: 'Drie, twee, een, nul… Wroooom!', sfx: 'dreun' },
    { t: 'say', who: 'florine', text: 'Mijn buik kriebelt! Is dat de raket of mijn ontbijt?', mood: 'lacht' },

    // --- Startknoppen: geheugen ---
    { t: 'say', who: 'piep', text: 'Nu de motorknoppen. Ik druk ze voor, jij drukt ze na, bliep!', mood: 'blij' },
    {
      t: 'game', game: 'memory', skill: 'geheugen',
      intro: 'Kijk goed welke knoppen Piep indrukt. Druk ze daarna in dezelfde volgorde in!',
      success: 'Bliep bliep! Alle motoren draaien. Wat een knap geheugen!',
      hint: 'Zeg de kleuren zachtjes mee terwijl Piep drukt. Dan onthoud je ze beter.',
      params: {
        1: { length: 3, items: ['🔴', '🔵', '🟡'] },
        2: { length: 4, items: ['🔴', '🔵', '🟡', '🟢'] },
        3: { length: 5, items: ['🔴', '🔵', '🟡', '🟢'] }
      }
    },

    // --- De ruimte: gewichtloos zweven ---
    { t: 'scene', bg: 'ruimte', chars: ['held', 'florine', 'kwebbel', 'piep'] },
    { t: 'say', who: 'verteller', text: 'Door het raam zie je de aarde. Zo klein als een knikker!', sfx: 'whoosh' },
    { t: 'say', who: 'verteller', text: 'Opeens gaan de gordels los. Iedereen zweeft door het schip!', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Kijk, ik zwem in de lucht! Ik ben een vis!', mood: 'lacht' },
    { t: 'say', who: 'kwebbel', text: 'Ik vlieg zonder fladderen, hoe kan dat nou? Mijn petje zweeft weg, petje, ik zie jou!', mood: 'verbaasd' },
    { t: 'say', who: 'piep', text: 'Dat heet gewichtloos. Bliep, mijn schroefje zweeft ook weg!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Kijk daar, zwevende blokken! En bovenop liggen sterren.', mood: 'blij' },
    {
      t: 'game', game: 'jump', skill: 'ruimte',
      intro: 'Spring van blok naar blok, net als in een spelletje. Tel de sterren die je pakt!',
      success: 'Boing, boing, allemaal gepakt! Wat spring jij goed.',
      hint: 'Tik steeds op het blok met de gele rand. Eén voor één.',
      params: {
        1: { blocks: 3, coins: 3, hero: '🧑‍🚀' },
        2: { blocks: 5, coins: 5, hero: '🧑‍🚀' },
        3: { blocks: 7, coins: 7, hero: '🧑‍🚀' }
      }
    },
    { t: 'say', who: 'piep', text: 'Sterren gevonden, maar geen Sterrenkompas. Bliep, mijn kijker zegt: verder!', mood: 'denkt', sfx: 'ster' },

    // --- Brandstof tanken ---
    { t: 'scene', bg: 'ruimteschip', chars: ['held', 'florine', 'kwebbel', 'piep'] },
    { t: 'say', who: 'piep', text: 'Oei, de tank is bijna leeg. We moeten brandstof bijdoen, bliep!', mood: 'verbaasd', sfx: 'piep' },
    { t: 'say', who: 'florine', text: 'Ik help! Ik doe er appelsap in.', mood: 'blij' },
    { t: 'say', who: 'piep', text: 'Nee Flo, geen appelsap. Deze raket drinkt alleen sterrenblikjes.', mood: 'lacht' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Piep heeft blikjes brandstof, en {HELD} vindt er nog meer. Hoeveel zijn het samen?',
      success: 'Precies goed! De tank is vol. Glug, glug, bliep!',
      hint: 'Tel eerst de blikjes van Piep. Tel dan verder met de blikjes van {HELD}.',
      params: {
        1: { a: 2, b: 3, op: '+', item: '🥫' },
        2: { a: 5, b: 4, op: '+', item: '🥫' },
        3: { a: 8, b: 7, op: '+', item: '🥫' }
      }
    },

    // --- Praatpuzzel: welke knop gaat naar de planeet met de karts? ---
    { t: 'say', who: 'piep', text: 'Mijn kijker ziet het kompas nu bij een planeet met racebanen. Met kartjes!', mood: 'blij' },
    { t: 'say', who: 'piep', text: 'Er zijn vier reisknoppen: rood, blauw, geel en groen. Maar welke gaat daarheen?', mood: 'denkt' },
    { t: 'say', who: 'piep', text: 'Bliep, ik ben het vergeten. Mijn computer weet wel wat elke knop doet!', mood: 'verbaasd' },
    {
      t: 'talk', puzzle: 'h4-knop', who: 'piep',
      // Verkenpuzzel: 'wat als ik op rood druk?' is nooit een gok, en alleen "rood" noemen geeft het gevolg.
      explore: true,
      intro: 'Vraag maar: wat als ik op een knop druk? Mijn computer vertelt wat er dan gebeurt, bliep!',
      ask: 'Welke knop gaat naar de planeet met de karts?',
      minQuestions: 2,
      answers: [
        { pic: '🟢', label: 'Groen', correct: true },
        { pic: '🔴', label: 'Rood', correct: false },
        { pic: '🔵', label: 'Blauw', correct: false },
        { pic: '🟡', label: 'Geel', correct: false }
      ],
      // Tikvragen als spraak niet kan of het kind liever tikt.
      fallbackQs: [
        { q: 'Wat als ik op de rode knop druk?', a: 'Dan gaat de grote toeter: TOETOET! En dan komen er zeepbellen uit het plafond, bliep.' },
        { q: 'Wat als ik op de blauwe knop druk?', a: 'Dan vliegen we naar de ijsplaneet. Brrr, mijn schroefjes worden ijsjes!' },
        { q: 'Wat als ik op de gele knop druk?', a: 'Dan vliegen we naar de zon. Veel te warm, dan smelt mijn antenne als een ijsje!' },
        { q: 'Wat als ik op de groene knop druk?', a: 'Dan vliegen we naar een planeet vol wegen met bochten. En daar rijden kleine autootjes, vroem!' },
        { q: 'Wat als we op alle knoppen drukken?', a: 'Dan draait het schip rondjes als een tol. Bliep, ik word draaierig!' },
        { q: 'Wat als we niks doen?', a: 'Dan zweven we hier maar wat. Dan vinden we het kompas nooit, bliep.' }
      ],
      // Lokale trefwoordherkenning: beste score wint, bij gelijkspel de eerste.
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'weet ik nie', 'weet nie', 'moeilijk', 'tip', 'zeg het maar', 'zeg het',
            'vertel het', 'verklap', 'verklappen', 'antwoord', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Een tip? Mijn computer rekent even, bliep bloep…', a2: 'Geen zorgen, we doen het samen. Bliep!' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'goedemorgen', 'goedemiddag', 'dag piep', 'hoe gaat het'],
          a: 'Bliep, hallo! Met mij gaat het top, al mijn lampjes branden.', a2: 'Hoi hoi! Vraag maar wat een knop doet, bliep.' },
        { id: 'stoppen', keys: ['stoppen', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of vraag nog iets, bliep!', a2: 'Even pauze mag altijd. Tik op het huisje, of vraag wat een knop doet.' },
        { id: 'grap', keys: ['grapje', 'mop', 'poep', 'poepie', 'scheet', 'drol', 'boertje', 'haha', 'hihi', 'gek'],
          a: 'Bliep bliep, hahaha! Mijn lampjes knipperen van het lachen. Nu weer een knop?', a2: 'Hihi, mijn antenne wiebelt ervan. Vraag nu wat een knop doet!' },
        { id: 'rood', keys: ['rode', 'rode knop', 'roodje', 'rood'],
          a: 'Dan gaat de grote toeter: TOETOET! En dan komen er zeepbellen uit het plafond, bliep.',
          a2: 'De rode knop? Toeter en zeepbellen! Leuk, maar we komen er geen stap verder mee.' },
        { id: 'blauw', keys: ['blauwe', 'blauwe knop', 'ijs', 'ijsplaneet', 'blauw'],
          a: 'Dan vliegen we naar de ijsplaneet. Brrr, mijn schroefjes worden ijsjes!',
          a2: 'De blauwe knop gaat naar ijs en sneeuw. Daar rijdt niemand, alleen pinguïns glijden er.' },
        { id: 'geel', keys: ['gele', 'gele knop', 'zon', 'zonnetje', 'geel'],
          a: 'Dan vliegen we naar de zon. Veel te warm, dan smelt mijn antenne als een ijsje!',
          a2: 'De gele knop gaat naar de zon. Pfoe, daar heb je wel tien zonnebrillen nodig!' },
        { id: 'groen', keys: ['groene', 'groene knop', 'groen'],
          a: 'Dan vliegen we naar een planeet vol wegen met bochten. En daar rijden kleine autootjes, vroem!',
          a2: 'Wegen, bochten en autootjes, bliep! Weet je het al? Zeg dan: ik kies de…, en dan de kleur.' },
        { id: 'alles', keys: ['alle knoppen', 'allemaal', 'tegelijk', 'alles tegelijk', 'alle'],
          a: 'Dan draait het schip rondjes als een tol. Bliep, ik word draaierig!', a2: 'Alles tegelijk? Dan maakt de computer een koprol. Liever één knop, hoor!' },
        { id: 'niks', keys: ['niks', 'niets', 'geen knop', 'niet drukken', 'wachten', 'blijven'],
          a: 'Dan zweven we hier maar wat. Dan vinden we het kompas nooit, bliep.', a2: 'Niks doen? Dan gaat Kwebbel snurken. Liever op een knop drukken!' },
        { id: 'anderekleur', keys: ['paars', 'paarse', 'oranje', 'roze', 'wit', 'witte', 'zwart', 'zwarte', 'bruin', 'bruine', 'grijs', 'grijze', 'regenboog'],
          a: 'Die kleur knop heb ik niet, bliep. Ik heb er maar vier!', a2: 'Hmm, die zit niet op mijn bord. Vraag eens naar een van de vier knoppen.' },
        { id: 'kart', keys: ['kart', 'karts', 'kartje', 'kartplaneet', 'race', 'racen', 'racebaan', 'racebanen', 'auto', 'autootje', 'raceauto', 'wedstrijd'],
          a: 'Ja, daar moeten we heen! Maar welke kleur knop gaat daarheen? Vraag wat de knoppen doen.', a2: 'Vroem vroem, daar wil ik heen, bliep! Welke knop brengt ons naar de autootjes?' },
        { id: 'maan', keys: ['maan', 'landen op de maan', 'kaas'],
          a: 'Op de maan spring je superhoog, boing! Maar er is geen kaas, bliep, dat heb ik gecheckt.', a2: 'De maan is leuk om te springen. Maar het kompas ligt daar niet.' },
        { id: 'sterren', keys: ['ster', 'sterren', 'sterretje', 'melkweg'],
          a: 'Sterren zijn heel ver weg en heel warm. We zwaaien alleen even: hallo sterren!', a2: 'Een ster pakken? Die is te heet, bliep. De blokjessterren waren wel lekker koel.' },
        { id: 'aarde', keys: ['huis', 'naar huis', 'aarde', 'oisterwijk', 'terug', 'terugvliegen', 'strand', 'brom'],
          a: 'Naar huis? Dat kan straks, bliep. Eerst het Sterrenkompas, dan vindt alles de weg terug.', a2: 'Brom wacht op het strand. Maar eerst gaan we het kompas halen!' },
        { id: 'zweven', keys: ['zweven', 'zweef', 'gewichtloos', 'vallen', 'ondersteboven', 'omdraaien'],
          a: 'Als je zweeft, kun je op het plafond zitten. Flo eet haar koekje nu ondersteboven!', a2: 'Zweven is net zwemmen zonder water, bliep. Kijk, Kwebbel draait een rondje!' },
        { id: 'snel', keys: ['sneller', 'snel', 'hard', 'harder', 'turbo', 'gas', 'gas geven'],
          a: 'Sneller? Dan waaien Kwebbels veren recht naar achter. Zoef!', a2: 'Turbo aan en je wangen gaan wiebelen, bliep! Maar welke knop kies je?' },
        { id: 'rem', keys: ['rem', 'remmen', 'stoppen met vliegen', 'langzaam', 'langzamer'],
          a: 'Als we remmen, glijdt iedereen naar voren. Florine landt dan in de koekjeskast!', a2: 'Remmen kan altijd, bliep. Maar dan komen we nergens.' },
        { id: 'toeter', keys: ['toeter', 'toeteren', 'toet', 'claxon', 'lawaai', 'geluid'],
          a: 'Een toeter? Die zit op één van de knoppen. TOETOET, dan wordt iedereen wakker!', a2: 'Geluid maken vind ik leuk, bliep bloep! Welke knop wil je nog proberen?' },
        { id: 'raam', keys: ['raam', 'deur', 'uitstappen', 'naar buiten', 'buiten'],
          a: 'Naar buiten? Nee hoor, daar is geen lucht. We kijken lekker door het raam.', a2: 'Het deurtje blijft dicht tot we landen, bliep. Dat is de regel van Piep.' },
        { id: 'eten', keys: ['eten', 'honger', 'snoep', 'snoepje', 'lekker', 'drinken', 'koekje', 'boterham'],
          a: 'Eten? Ik eet alleen batterijen, bliep. Die smaken naar prik!', a2: 'Mijn buik rammelt niet, ik ben een robot. Maar ik hoor wel knorren bij Flo!' },
        { id: 'piep', keys: ['wie ben jij', 'hoe heet jij', 'ben jij een robot', 'robot', 'antenne', 'lampje', 'batterij', 'bliep', 'piep'],
          a: 'Ik ben Piep, een robot met een antenne. Als ik blij ben, gaat mijn lampje knipperen!', a2: 'Bliep! Ik ben een beetje verstrooid, maar mijn computer weet alles van de knoppen.' },
        { id: 'computer', keys: ['computer', 'scherm', 'kaart', 'kijker', 'kompas', 'sterrenkompas', 'waar is het kompas'],
          a: 'Mijn computer zegt: het kompas is bij de planeet met de racebanen. Welke knop gaat daarheen?', a2: 'Op mijn scherm knippert het kompas, bliep. Vraag wat elke knop doet!' },
        { id: 'knop', keys: ['knop', 'knopje', 'drukken', 'druk', 'gebeurt', 'welke knop'],
          a: 'Er zijn vier knoppen, allemaal een andere kleur. Vraag maar: wat als ik op de rode druk?', a2: 'Noem maar een kleur, bliep. Dan zegt mijn computer wat die knop doet.' }
      ],
      // Alleen een echte keuze wint ("ik kies de groene"). Alleen "groen" noemen geeft het gevolg (intent 'groen').
      secretKeys: ['kies groen', 'kies de groene', 'kies groene', 'druk op groen', 'druk op de groene', 'denk groen',
        'denk de groene', 'denk groene', 'het is groen', 'het is de groene', 'de groene is het', 'nemen we groen', 'nemen we de groene',
        'neem groen', 'neem de groene', 'wil groen', 'wil de groene', 'moet groen', 'moet de groene', 'groen is het', 'groene is het',
        'gaan voor groen', 'drukken op groen', 'drukken op de groene', 'groene knop drukken', 'groene knop indrukken'],
      win: 'Bliep bliep, ja! Die knop gaat naar de planeet met de karts. Wat ben jij slim!',
      wrongGuess: 'Bliep, nee, die knop gaat niet naar de racebanen. Vraag eens wat een andere knop doet!',
      wrongGuess2: 'Bliep bloep, die is het niet. Vraag nog eens: wat als ik op een knop druk?',
      guessKeys: {
        rood: ['kies rood', 'kies de rode', 'kies rode', 'denk rood', 'denk de rode', 'het is rood', 'het is de rode', 'neem rood', 'neem de rode'],
        blauw: ['kies blauw', 'kies de blauwe', 'kies blauwe', 'denk blauw', 'denk de blauwe', 'het is blauw', 'het is de blauwe', 'neem blauw', 'neem de blauwe'],
        geel: ['kies geel', 'kies de gele', 'kies gele', 'denk geel', 'denk de gele', 'het is geel', 'het is de gele', 'neem geel', 'neem de gele']
      },
      hints: [
        'Op de planeet met de karts zijn veel wegen. Welke knop gaat naar een planeet met wegen?',
        'De toeter, het ijs en de zon zijn het niet. Welke knop blijft er dan over?',
        'De goede knop heeft de kleur van gras. En van een kikker, kwak!'
      ]
    },
    { t: 'say', who: 'piep', text: 'Bliep bliep, knop ingedrukt! Koers: de kartplaneet.', mood: 'lacht', sfx: 'piep' },
    { t: 'say', who: 'kwebbel', text: 'Wat een slimme keus, wat een slimme kop! Op naar de karts, hop hop hop!', mood: 'lacht' },

    // --- Rommel-spoor: de voorraadkast ---
    { t: 'say', who: 'florine', text: 'Ik heb honger. Waar is het ruimtesnoep?', mood: 'denkt' },
    { t: 'say', who: 'piep', text: 'In de voorraadkast, achterin het schip. Zweef maar mee!', mood: 'blij' },
    { t: 'scene', bg: 'ruimte', chars: ['held', 'florine', 'piep'] },
    { t: 'say', who: 'verteller', text: 'De gang naar de kast zweeft vol losse blokken. Je moet eroverheen springen!', sfx: 'whoosh' },
    {
      t: 'game', game: 'jump', skill: 'ruimte',
      intro: 'Spring over de zwevende blokken naar de voorraadkast. Pak onderweg de sterren!',
      success: 'Hop, je bent bij de kast! En je hebt sterren in je zak.',
      hint: 'Rustig aan. Tik op het blok met de gele rand, dan spring je vanzelf.',
      params: {
        1: { blocks: 4, coins: 2, hero: '🧑‍🚀' },
        2: { blocks: 6, coins: 4, hero: '🧑‍🚀' },
        3: { blocks: 8, coins: 6, hero: '🧑‍🚀' }
      }
    },
    { t: 'scene', bg: 'ruimteschip', chars: ['held', 'florine', 'piep'] },
    { t: 'say', who: 'verteller', text: 'Piep doet de kast open. Hij is leeg, alleen maar snoeppapiertjes!', sfx: 'pop' },
    { t: 'say', who: 'piep', text: 'Bliep, al het ruimtesnoep is op! Ik was het niet, ik eet batterijen.', mood: 'verbaasd' },
    { t: 'say', who: 'verteller', text: 'Achter een doos flitst iets weg. Een staart met strepen!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'Een ruimtezebra! Hij heeft mijn snoep!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Weer die gestreepte staart. Wie is dat toch?', mood: 'denkt' },

    // --- Woordje op de doos ---
    { t: 'say', who: 'piep', text: 'Er zweeft nog één doos rond. Er staat een woord op, maar ik lees alleen robottaal.', mood: 'denkt' },
    { t: 'say', who: 'florine', text: 'Ik weet het, er staat snoep! Toch?', mood: 'blij' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Luister goed naar de klanken. Wat staat er op de doos?',
      success: 'Kip! Er zit een rubberen ruimtekip in de doos. Tok tok!',
      hint: 'Zeg de klanken langzaam na: k… i… p. Plak ze dan aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'kip', pic: '🐔',
          options: [
            { w: 'vis', pic: '🐟' },
            { w: 'pen', pic: '🖊️' }
          ]
        },
        2: {
          mode: 'build', word: 'kip', pic: '🐔',
          options: [
            { w: 'vis', pic: '🐟' },
            { w: 'pen', pic: '🖊️' },
            { w: 'pet', pic: '🧢' }
          ]
        },
        3: {
          mode: 'missing', word: 'kip', pic: '🐔',
          options: [
            { w: 'kop', pic: '☕' },
            { w: 'vis', pic: '🐟' },
            { w: 'pet', pic: '🧢' },
            { w: 'pen', pic: '🖊️' }
          ]
        }
      }
    },
    { t: 'say', who: 'florine', text: 'Een kip in de ruimte, hij zweeft! Tok tok!', mood: 'lacht' },
    { t: 'say', who: 'piep', text: 'Bliep, een kip is en blijft een kip. Ook zonder zwaartekracht!', mood: 'lacht' },

    // --- Beloning ---
    { t: 'reward', stars: 3, sticker: '🚀', text: 'Super, {HELD}! Je telde af, sprong over sterrenblokken en koos de goede knop.' },

    // --- Cliffhanger: zachte noodlanding ---
    { t: 'scene', bg: 'ruimte', chars: ['held', 'florine', 'kwebbel', 'piep'] },
    { t: 'say', who: 'verteller', text: 'Opeens sputtert de motor. Put, put, pruttel…', sfx: 'dreun' },
    { t: 'say', who: 'piep', text: 'Bliep, iemand heeft aan de snoertjes geknabbeld! We gaan heel zacht landen, hou je vast.', mood: 'verbaasd' },
    { t: 'say', who: 'kwebbel', text: 'Wiebel, wiebel, daar gaan we dan! Hou Konijn goed vast, zo goed als je kan!', mood: 'verbaasd' },
    { t: 'scene', bg: 'planeet', chars: ['held', 'florine', 'kwebbel', 'piep'] },
    { t: 'say', who: 'verteller', text: 'Boing, boing! Het schip stuitert als een bal op een zachte heuvel.', sfx: 'sprong' },
    { t: 'say', who: 'florine', text: 'Nog een keer! Nog een keer!', mood: 'lacht' },
    { t: 'say', who: 'verteller', text: 'Overal zijn racebanen, met bochten en bruggen. En daar, heel in de verte…', sfx: 'wind' },
    { t: 'cliff', chars: ['held', 'florine', 'kwebbel', 'piep'], text: 'Toet toet, daar toetert een kart! Wie rijdt daar? Wordt vervolgd…' }
  ]
};
