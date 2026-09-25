// Hoofdstuk 3 – De Kleine Kapitein
// Leerdoelen: optellen en aftrekken tot 5/10/12, tellen (hoeveel zie je), route op de kaart
// met pijlen (ruimte), aanwijzingen combineren (logica), klankzuivere woorden boot/maan/roos,
// vragen stellen om een plek te vinden (talk: speurtocht).
export default {
  id: 'h3',
  title: 'De Kleine Kapitein',
  sticker: '⛵',
  steps: [
    // --- Intro: het bootje met Florine drijft naar zee ---
    { t: 'scene', bg: 'zee', chars: ['held', 'kwebbel', 'brom'] },
    { t: 'say', who: 'verteller', text: 'Het bootje met Florine is de rivier af gedreven. Helemaal tot aan de zee!', sfx: 'wind' },
    { t: 'say', who: 'verteller', text: 'Florine heeft een zwemvest aan en ze giechelt. Ze vindt het een groot feest.' },
    { t: 'say', who: 'florine', text: 'Joehoe! Ik ben een bootjes-meisje!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Florine, blijf lekker zitten. Wij komen eraan!', mood: 'blij' },
    { t: 'say', who: 'brom', text: 'Hmmm, de zee komt maar tot mijn knieën. Ik loop gewoon mee.', mood: 'blij', sfx: 'dreun' },
    { t: 'say', who: 'verteller', text: 'Aan de kant ligt een klein zeilbootje. Er ligt zelfs een piratenhoed in!', sfx: 'pop' },
    { t: 'scene', bg: 'zee', chars: ['held', 'kwebbel', 'boot'] },
    { t: 'say', who: 'kwebbel', text: 'Ahoi, ahoi, jij bent de kapitein! En ik ben je piratenpapegaai, hoe fijn!', mood: 'lacht', sfx: 'papegaai' },
    { t: 'say', who: 'held', text: 'Ik ben de Kleine Kapitein! Kom op, zeil omhoog!', mood: 'blij' },
    {
      t: 'choice',
      q: 'Hoe noemen we ons bootje?',
      options: [
        { label: 'De Zeemeeuw', icon: '🐦', say: 'De Zeemeeuw! Die vliegt net zo snel als een vogel.' },
        { label: 'De Snelle Vis', icon: '🐟', say: 'De Snelle Vis! Blub blub, daar gaan we.' },
        { label: 'De Sterrenboot', icon: '⭐', say: 'De Sterrenboot! Die past bij het Sterrenkompas.' }
      ]
    },

    // --- Zeilen: vissen tellen ---
    { t: 'say', who: 'verteller', text: 'Whoosh, het zeiltje bolt op. Naast de boot springen vissen uit het water!', sfx: 'whoosh' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Er zwemmen vissen naast de boot. Er komen er nog meer bij! Hoeveel vissen zijn het samen?',
      success: 'Goed gerekend! Wat een vrolijke vissenclub.',
      hint: 'Tel eerst de eerste groep vissen. Tel dan verder met de nieuwe vissen.',
      params: {
        1: { a: 3, b: 2, op: '+', item: '🐟' },
        2: { a: 6, b: 4, op: '+', item: '🐟' },
        3: { a: 8, b: 4, op: '+', item: '🐟' }
      }
    },
    { t: 'say', who: 'kwebbel', text: 'Vissen links en vissen rechts, ze zwemmen mee! Wat een parade in de grote zee!', mood: 'blij' },

    // --- Welk eilandje? Aanwijzingen combineren ---
    { t: 'say', who: 'verteller', text: 'Daar, in de verte! Op een eilandje zwaait iemand met een knuffel.', sfx: 'bel' },
    { t: 'say', who: 'held', text: 'Er zijn een heleboel eilandjes. Op welke zit Florine?', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Ik zag haar zitten bij een kist en een palm. Heel vrolijk en blij, en heel erg kalm!', mood: 'denkt' },
    {
      t: 'game', game: 'pick', skill: 'logica',
      intro: 'Kijk goed naar de eilandjes. Welke past bij alles wat Kwebbel zag?',
      success: 'Goed gespeurd! Palmboom en kist, daar zit Florine.',
      hint: 'Zoek eerst een palmboom. Kijk dan of er ook een kist staat.',
      params: {
        1: {
          q: 'Florine zit bij een palmboom en een kist. Welk eilandje is het?',
          options: [
            { pic: '🌴🧰', label: 'palm, kist', correct: true },
            { pic: '🌴', label: 'palm', correct: false },
            { pic: '🦀', label: 'krab', correct: false }
          ]
        },
        2: {
          q: 'Florine zit bij een palmboom en een kist. Welk eilandje is het?',
          options: [
            { pic: '🌴🧰', label: 'palm, kist', correct: true },
            { pic: '🌴🦀', label: 'palm, krab', correct: false },
            { pic: '🧰🦀', label: 'kist, krab', correct: false },
            { pic: '🌴', label: 'palm', correct: false }
          ]
        },
        3: {
          q: 'Florine zit bij een palmboom en een kist. Er is geen krab. Welk eilandje is het?',
          options: [
            { pic: '🌴🧰', label: 'palm, kist', correct: true },
            { pic: '🌴🧰🦀', label: 'met krab', correct: false },
            { pic: '🌴🦀', label: 'palm, krab', correct: false },
            { pic: '🧰🦀', label: 'kist, krab', correct: false },
            { pic: '🧰', label: 'kist', correct: false }
          ]
        }
      }
    },

    // --- Florine op het eilandje met de kist ---
    { t: 'scene', bg: 'eiland', chars: ['held', 'florine', 'kwebbel', 'kist'] },
    { t: 'say', who: 'florine', text: 'Hoi! Ik ben een piraat en Konijn ook, arrr!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Gelukkig, Flo! Je zwemvest zit nog goed vast.', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Ik heb een kist gevonden. Er zat een kaart in!', mood: 'blij' },
    { t: 'say', who: 'verteller', text: 'Het is een echte schatkaart. Maar midden op het kruisje zit een konijnensticker!', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Die heb ik erop geplakt. Mooi hè?', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'O, Flo! Nu zien we niet meer waar de schat ligt.', mood: 'denkt' },

    // --- Rommel-spoor ---
    { t: 'say', who: 'verteller', text: 'Achter een oude ton wiebelt iets. Een gestreepte staart, zwiep, weg!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'De kleine zebra! Die gaat ook op vakantie!', mood: 'verbaasd' },
    { t: 'say', who: 'verteller', text: 'Naast de ton ligt een snoeppapiertje. {HELD} stopt het in de rugzak.' },
    { t: 'say', who: 'kwebbel', text: 'Een staart met strepen, alweer, oh jee! Wie reist er toch stiekem met ons mee?', mood: 'denkt' },

    // --- Woord op de schatkaart ---
    { t: 'say', who: 'kwebbel', text: 'Op de kaart staat een woordje, klein en fijn. Lees jij het, dan weten we waar we moeten zijn!', mood: 'blij' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Luister goed naar de klanken. Welk woord staat er op de schatkaart?',
      success: 'Knap gelezen! De kaart wijst naar het grote eiland.',
      hint: 'Zeg de klanken langzaam na. Plak ze dan aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'boot', pic: '⛵',
          options: [
            { w: 'maan', pic: '🌙' },
            { w: 'roos', pic: '🌹' }
          ]
        },
        2: {
          mode: 'build', word: 'maan', pic: '🌙',
          options: [
            { w: 'boot', pic: '⛵' },
            { w: 'roos', pic: '🌹' },
            { w: 'vis', pic: '🐟' }
          ]
        },
        3: {
          mode: 'missing', word: 'roos', pic: '🌹',
          options: [
            { w: 'boot', pic: '⛵' },
            { w: 'maan', pic: '🌙' },
            { w: 'vis', pic: '🐟' },
            { w: 'bos', pic: '🌲' }
          ]
        }
      }
    },

    // --- Route op de kaart ---
    { t: 'say', who: 'held', text: 'Kijk, op de kaart staan pijltjes. Dat is de route naar het grote eiland!', mood: 'blij' },
    {
      t: 'game', game: 'memory', skill: 'ruimte',
      intro: 'Kijk goed naar de pijltjes op de kaart. Stuur het bootje daarna precies zo!',
      success: 'Goed gestuurd, kapitein! Daar is het grote eiland.',
      hint: 'Kijk nog eens rustig. Wijs met je vinger mee: links, omhoog, rechts of omlaag.',
      params: {
        1: { length: 3, items: ['⬅️', '⬆️', '➡️', '⬇️'] },
        2: { length: 4, items: ['⬅️', '⬆️', '➡️', '⬇️'] },
        3: { length: 5, items: ['⬅️', '⬆️', '➡️', '⬇️'] }
      }
    },
    { t: 'scene', bg: 'zee', chars: ['held', 'florine', 'brom', 'boot'] },
    { t: 'say', who: 'verteller', text: 'Brom loopt voor het bootje uit. Plons, plons, het water komt maar tot zijn knieën!', sfx: 'dreun' },
    { t: 'say', who: 'brom', text: 'Hmmm, ik ben een reuzensleepboot. Hup, hup!', mood: 'lacht' },
    { t: 'say', who: 'florine', text: 'Brom is een grote eend! Kwak, kwak!', mood: 'lacht' },

    // --- Op het grote eiland ---
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'kwebbel', 'brom'] },
    { t: 'say', who: 'verteller', text: 'Het bootje glijdt zacht het zand op. Ze zijn op het grote eiland!', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Schelpen! Ik neem ze allemaal mee naar huis.', mood: 'blij' },
    {
      t: 'game', game: 'count', skill: 'tellen',
      intro: 'Florine heeft schelpen gevonden. Hoeveel schelpen zie je?',
      success: 'Goed geteld! Florine stopt ze in haar zakken.',
      hint: 'Wijs elke schelp één keer aan. Tel hardop mee.',
      params: {
        1: { mode: 'howmany', n: 5, item: '🐚' },
        2: { mode: 'howmany', n: 8, item: '🐚' },
        3: { mode: 'howmany', n: 12, item: '🐚' }
      }
    },
    { t: 'say', who: 'brom', text: 'Hmmm, er loopt iets over mijn schoen. Is dat een muis?', mood: 'verbaasd' },
    { t: 'say', who: 'held', text: 'Nee Brom, dat zijn krabbetjes. Die lopen gewoon zijwaarts!', mood: 'lacht' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Er zitten krabbetjes op het strand. Een paar lopen weg naar de zee. Hoeveel blijven er over?',
      success: 'Precies goed! Brom is weer gerust.',
      hint: 'Tel eerst alle krabbetjes. Haal dan de weggelopen krabbetjes eraf.',
      params: {
        1: { a: 5, b: 2, op: '-', item: '🦀' },
        2: { a: 9, b: 3, op: '-', item: '🦀' },
        3: { a: 12, b: 5, op: '-', item: '🦀' }
      }
    },

    // --- Praatpuzzel: speurtocht naar de schat ---
    { t: 'scene', bg: 'eiland', chars: ['held', 'florine', 'kwebbel'] },
    { t: 'say', who: 'kwebbel', text: 'Ik zag die kaart al lang geleden, echt waar. Ik weet waar het kruisje zit, precies en klaar!', mood: 'lacht' },
    { t: 'say', who: 'kwebbel', text: 'Maar een piraat verklapt dat niet zomaar. Stel mij vragen, dan kom je er wel, hoor!', mood: 'denkt' },
    { t: 'say', who: 'held', text: 'Dan ga ik speuren. Ik stel slimme vragen!', mood: 'blij' },
    {
      t: 'talk', puzzle: 'h3-schat', who: 'kwebbel',
      intro: 'Vraag maar raak, over links of rechts of een boom. Dan vind jij de schat, zo snel als een stroom!',
      ask: 'Bij welke plek ligt de schat?',
      minQuestions: 2,
      answers: [
        { pic: '🪨', label: 'De rots', correct: true },
        { pic: '🐚', label: 'De schelp', correct: false },
        { pic: '🌺', label: 'De bloem', correct: false },
        { pic: '🥥', label: 'Kokosnoot', correct: false }
      ],
      // Tikvragen als spraak niet kan of het kind liever tikt.
      fallbackQs: [
        { q: 'Is het bij de palmboom?', a: 'Bij de palmboom begin je, dat is waar. Maar de schat ligt er niet, hij ligt verderop, daar!' },
        { q: 'Moet ik naar links of rechts?', a: 'Links? Nee hoor, daar is alleen gras. Ga naar rechts, dat is de goede pas!' },
        { q: 'Hoeveel stappen?', a: 'Drie grote stappen, dat is genoeg. Een, twee, drie, niet te laat en niet te vroeg!' },
        { q: 'Welke kleur heeft het?', a: 'Het is grijs, zo grijs als een olifant. Het ligt heel stil, vlak naast het zand!' },
        { q: 'Is het groot?', a: 'Groot is het, zo groot als een stoel. Je kunt erop zitten, dat is het doel!' },
        { q: 'Is het zacht?', a: 'Zacht? Nee hoor, het is heel erg hard. Klop je erop, dan doet je knokkel au, apart!' }
      ],
      // Lokale trefwoordherkenning: beste score wint, bij gelijkspel de eerste intent.
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'weet ik nie', 'weet nie', 'moeilijk', 'tip', 'aanwijzing', 'aanwijzingen',
            'zeg het maar', 'zeg het', 'vertel het', 'verklap', 'verklappen', 'antwoord', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Een aanwijzing? Die krijg je van mij!', a2: 'Niet getreurd, ik help je erbij!' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'ahoi', 'ahoy', 'goedemorgen', 'goedemiddag', 'dag kwebbel', 'hoe gaat het'],
          a: 'Ahoi, ahoi, wat fijn dat je praat! Stel mij een vraag, ik sta paraat!', a2: 'Hoi kapitein, met mij gaat het top! Vraag maar raak, ik zeg geen stop!' },
        { id: 'stoppen', keys: ['stoppen', 'stop', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of speur nog even mee, dan krijg je een kruisje!', a2: 'Even pauze mag altijd, hoor! Tik op het huisje, of vraag nog iets, ga maar door.' },
        { id: 'grap', keys: ['grapje', 'mop', 'poep', 'poepie', 'scheet', 'plas', 'pies', 'drol', 'boertje', 'gek', 'lol', 'haha', 'hihi'],
          a: 'Hihi, wat grappig, ik lach me krom! Maar waar ligt de schat? Kom, vraag nog eens, kom!', a2: 'Ha, daar moet ik om lachen, hoor! Maar nu weer speuren, ga maar door!' },
        { id: 'kwebbel', keys: ['wie ben jij', 'ben jij een piraat', 'ben jij een papegaai', 'hoe heet jij', 'wat eet jij', 'jouw hoed', 'jouw petje', 'lievelingseten', 'jouw veren'],
          a: 'Ik ben Kwebbel, piratenpapegaai, arrr! Maar nu gaat het om de schat, ben je klaar?', a2: 'Ik eet het liefst zaadjes, knabbel en knap. Nu weer over de schat, stap voor stap!' },
        { id: 'bijna', keys: ['grot', 'berg', 'heuvel', 'muur', 'klif', 'tegel', 'baksteen'],
          a: 'Oeh, je bent warm, heel warm, echt waar! Het is iets kleiners, dan ben je klaar!', a2: 'Warm, warm, bijna heet! Nog een klein stukje, wie weet wat je weet!' },
        { id: 'palmboom', keys: ['palmboom', 'palmbomen', 'palm', 'palmen', 'boom', 'onder de boom', 'bij de boom'],
          a: 'Bij de palmboom begin je, dat is waar. Maar de schat ligt er niet, hij ligt verderop, daar!',
          a2: 'Niet onder de palmboom, daar valt soms iets, bonk! Begin daar met lopen, dan vind je de schat heel vlug!' },
        { id: 'richting', keys: ['links', 'rechts', 'linksaf', 'rechtsaf', 'welke kant', 'kant', 'richting', 'rechtdoor', 'welke kant op'],
          a: 'Links? Nee hoor, daar is alleen gras. Ga naar rechts, dat is de goede pas!',
          a2: 'Vanaf de palmboom ga je naar rechts, hoera! Daar ligt de schat, en ik vlieg erachteraan, ha!' },
        { id: 'stappen', keys: ['hoeveel stappen', 'stappen', 'stap', 'hoe ver', 'ver', 'ver weg', 'dichtbij', 'lopen', 'hoe lang lopen', 'meters'],
          a: 'Drie grote stappen, dat is genoeg. Een, twee, drie, niet te laat en niet te vroeg!',
          a2: 'Tel maar mee: een, twee, drie, heel groot. Dan sta je er vlak naast, wat een geluk, zo groot!' },
        { id: 'water', keys: ['zee', 'water', 'nat', 'golven', 'golf', 'zwemmen', 'onder water', 'duiken', 'in de zee'],
          a: 'In de zee? Nee hoor, dan wordt alles nat. De schat ligt op het droge, dat is wat!',
          a2: 'Niet in het water, niet tussen de vis. De schat ligt op het droge, dat is gewis!' },
        { id: 'zand', keys: ['zand', 'graven', 'begraven', 'onder de grond', 'onder', 'diep', 'schep', 'scheppen', 'ingegraven', 'eronder', 'ernaast'],
          a: 'Een klein beetje graven, dat moet je wel. Vlak naast de plek, dan heb je hem snel!',
          a2: 'Niet diep, hoor, net onder het zand. Graaf met je handjes, dan heb je hem in je hand!' },
        { id: 'kleur', keys: ['kleur', 'welke kleur', 'grijs', 'bruin', 'groen', 'geel', 'rood', 'blauw', 'wit', 'zwart', 'roze', 'paars', 'oranje'],
          a: 'De plek is grijs, zo grijs als een olifant. Het ligt heel stil, vlak naast het zand!',
          a2: 'Grijs, grijs, zo grijs als een muis. Maar Brom, niet schrikken, het is echt geen muis!' },
        { id: 'groot', keys: ['groot', 'klein', 'hoe groot', 'grootte', 'reuzegroot', 'dik', 'dun', 'hoog', 'laag'],
          a: 'Groot is het, zo groot als een stoel. Je kunt erop zitten, dat is het doel!',
          a2: 'Groter dan een emmer, kleiner dan een huis. Je tilt het niet op, zelfs Brom niet, die reus!' },
        { id: 'hard', keys: ['hard', 'zacht', 'voelen', 'voelt'],
          a: 'Zacht? Nee hoor, het is heel erg hard. Klop je erop, dan doet je knokkel au, apart!',
          a2: 'Hard als een pot pindakaas die niet open wil. Voel maar, het is koel en stil!' },
        { id: 'zwaar', keys: ['zwaar', 'licht', 'optillen', 'weegt'],
          a: 'Zwaar is het, echt veel te zwaar om te tillen. Zelfs Brom zou dat niet willen!',
          a2: 'Licht? Nee hoor, het is zwaar als een olifant. Dat tilt niemand op, met geen enkele hand!' },
        { id: 'zitten', keys: ['erop zitten', 'bovenop', 'erop', 'klimmen', 'erop klimmen', 'staan'],
          a: 'Erop zitten? Ja, dat kan heel fijn. Net een stoel in de zonneschijn!',
          a2: 'Klimmen mag, heel voorzichtig, stap voor stap. Het wiebelt niet, het ligt muurvast, knap!' },
        { id: 'dier', keys: ['dier', 'dieren', 'beest', 'beestje', 'krab', 'krabbetje', 'vis', 'vogel', 'meeuw', 'schildpad', 'muis', 'leeft het', 'levend'],
          a: 'Een dier? Nee, het leeft niet, het ligt maar stil. Wel woont er een krabbetje onder, als hij wil!',
          a2: 'Het zwemt niet, het vliegt niet, het kruipt niet weg. Het ligt daar al jaren, op dezelfde plek!' },
        { id: 'boot', keys: ['boot', 'bootje', 'schip', 'steiger', 'zeil'],
          a: 'Bij het bootje? Nee, daar ligt alleen het touw. De schat ligt verderop, dat zeg ik aan jou!',
          a2: 'Het bootje ligt veilig op het strand. De schat ligt ergens anders op het land!' },
        { id: 'zon', keys: ['zon', 'schaduw', 'warm', 'koud', 'heet'],
          a: 'De zon schijnt erop, de hele dag. Het wordt er lekker warm van, zo ik zag!',
          a2: 'Geen schaduw daar, alleen zon en licht. Knijp je ogen maar een beetje dicht!' },
        { id: 'inhoud', keys: ['wat zit erin', 'wat zit er in', 'zit erin', 'goud', 'gouden', 'munten', 'juwelen', 'diamant', 'wat is de schat'],
          a: 'Wat erin zit? Dat is een verrassing, hoor! Eerst de plek vinden, ga maar door!',
          a2: 'Geen idee, ik keek er nooit in, echt niet. Maar het is iets bijzonders, dat zeg ik je, zie!' },
        { id: 'piraat', keys: ['wie heeft', 'wie verstopte', 'verstopt', 'piraat', 'piraten', 'kees', 'van wie'],
          a: 'Piraat Kees verstopte hem, mijn oude maat. Hij was heel lief en hij zong zo graag, dat was zijn daad!',
          a2: 'Kees was een piraat met een lach op zijn snuit. Hij verstopte de schat, en toen zeilde hij uit!' },
        { id: 'kaart', keys: ['kaart', 'schatkaart', 'kruisje', 'kruis', 'sticker', 'konijnensticker'],
          a: 'Het kruisje zit onder de sticker, oh wee! Maar ik weet het nog, dus vraag maar mee!',
          a2: 'De kaart helpt niet, want die sticker zit dwars. Vraag het aan mij, ik weet het nog, ga maar door!' },
        { id: 'brom', keys: ['brom', 'reus'],
          a: 'Brom weet het niet, hij keek naar een krab. Hij dacht dat het een muis was, wat een grap!',
          a2: 'Brom is lief, maar hij zoekt veel te hoog. Kijk naar beneden, dan heb je het in je oog!' },
        { id: 'florine', keys: ['florine', 'flo', 'zusje', 'konijn', 'knuffel'],
          a: 'Florine graaft al, met zand in haar schoen. Maar waar moet ze graven? Dat moet jij nu doen!',
          a2: 'Florine en Konijn helpen je graag. Stel nog een vraag, dat is mijn vraag!' },
        { id: 'staart', keys: ['staart', 'strepen', 'gestreept', 'zebra', 'ton', 'snoep', 'snoeppapiertje', 'papiertje'],
          a: 'Die staart met strepen? Die was opeens weg! Wie dat was, weet ik niet, wat een pech!',
          a2: 'Dat raadsel lossen we later op, heel fijn. Nu eerst de schat, dat moet het zijn!' },
        { id: 'waar', keys: ['waar', 'welke plek', 'plek'],
          a: 'Waar hij ligt? Dat zeg ik niet zomaar, hoor! Vraag naar de palmboom, of links of rechts, ga door!',
          a2: 'Dat verklap ik niet, ik ben een piraat! Vraag hoeveel stappen, dan kom je er, kameraad!' }
      ],
      // Alleen echte woorden die spraakherkenning geeft.
      // Geen losse 'kei': "kei leuk" is geen gok.
      secretKeys: ['rots', 'rotsen', 'rotsje', 'rotsblok', 'steen', 'stenen', 'steentje', 'grote kei'],
      win: 'Ja, ja, ja, bij de grote rots, hoera! Jij bent een echte speurder, ik vlieg er al na!',
      wrongGuess: 'Nee, daar ligt hij niet, maar goed geprobeerd! Stel nog een vraag, dan kom je er, gegarandeerd!',
      wrongGuess2: 'Hmm, nee, daar is het niet, hoor. Vraag nog iets, dan kom je er, ga maar door!',
      guessKeys: {
        schelp: ['schelp', 'schelpen', 'schelpje'],
        bloem: ['bloem', 'bloemen', 'bloemetje', 'roos'],
        kokosnoot: ['kokosnoot', 'kokosnoten', 'kokos', 'noot', 'noten']
      },
      hints: [
        'Begin bij de palmboom en ga naar rechts. Dan drie grote stappen, en kijk goed om je heen, echt!',
        'Het is grijs en hard, en het ligt daar al lang. Je kunt erop zitten, de hele dag lang!',
        'Het is groot en grijs, en keihard, echt waar. Een krabbetje woont eronder, lekker koel daar!'
      ]
    },

    // --- De schat opgraven ---
    { t: 'say', who: 'verteller', text: '{HELD} loopt drie grote stappen naar rechts. Daar ligt de grote grijze rots!', sfx: 'goed' },
    { t: 'say', who: 'florine', text: 'Ik graaf! Nu zit er zand in mijn laarsjes, hihi!', mood: 'lacht', sfx: 'whoosh' },
    { t: 'say', who: 'verteller', text: 'Tok, daar zit een houten kist! Er zit een slotje op, met een ster.', sfx: 'pop' },
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'kwebbel', 'kist'] },
    { t: 'say', who: 'held', text: 'Een ster! Net als op mijn gouden sleuteltje van Kwebbel.', mood: 'verbaasd' },
    {
      t: 'choice',
      q: 'Wie draait het sleuteltje om?',
      options: [
        { label: 'Ik zelf', icon: '🧢', say: 'De kapitein doet het zelf. Klik, het past precies!' },
        { label: 'Florine', icon: '🐰', say: 'Florine draait heel voorzichtig. Klik, samen met Konijn!' },
        { label: 'Brom', icon: '👢', say: 'Brom zijn vinger is veel te dik, hihi. Met een beetje hulp: klik!' }
      ]
    },
    { t: 'say', who: 'verteller', text: 'Krrrr… langzaam gaat de deksel open.', sfx: 'ster' },
    { t: 'say', who: 'verteller', text: 'Geen goud en geen munten. Er zit maar één ding in: een grote knop met een ster!' },
    { t: 'say', who: 'kwebbel', text: 'Een knop in een kist, wat raar en wat fijn! Waar zou die knop nou toch voor zijn?', mood: 'denkt' },
    { t: 'say', who: 'held', text: 'Niet zomaar op drukken, hoor. Eerst goed nadenken.', mood: 'denkt' },

    // --- Beloning ---
    { t: 'reward', stars: 3, sticker: '⛵', text: 'Ahoi, {HELD}! Jij was de Kleine Kapitein, je vond Florine en de schat.' },

    // --- Cliffhanger ---
    { t: 'say', who: 'florine', text: 'Ik help! Ik druk op de knop!', mood: 'lacht', sfx: 'tap' },
    { t: 'say', who: 'verteller', text: 'Klik! Hoog in de lucht klinkt een zacht gezoem.', sfx: 'piep' },
    { t: 'say', who: 'kwebbel', text: 'Daar komt iets aan met lichtjes, zoem zoem! Heel zacht, zonder boem!', mood: 'verbaasd' },
    { t: 'scene', bg: 'strand', chars: ['held', 'florine', 'raket'] },
    { t: 'say', who: 'verteller', text: 'Whoooosh! Iets zakt heel zacht naar beneden, op het strand.', sfx: 'whoosh' },
    { t: 'cliff', chars: ['held', 'florine', 'raket'], text: 'Op het strand staat opeens een echte raket! Het deurtje gaat langzaam open… Wordt vervolgd…' }
  ]
};
