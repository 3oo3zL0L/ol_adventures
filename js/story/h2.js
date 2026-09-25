// Hoofdstuk 2 – Het Reuzenbos
// Leerdoelen: hoeveel zie je (tot 10-12), optellen tot 5-12, geheugen (judo-volgorde 4-6 stappen),
// vragen stellen aan getuigen (2× talk), logica met 2 kenmerken + uitsluiten (pick),
// klankzuivere mkm-woorden 'sok' en 'pen' (afleider 'zeep').
// De dader (Rommel) wordt NIET bij naam genoemd: alleen snoeppapiertjes, strepen en kleine handjes.
export default {
  id: 'h2',
  title: 'Het Reuzenbos',
  sticker: '🕵️',
  steps: [
    // --- Intro: de reuzenschoen naast de hut ---
    { t: 'scene', bg: 'hut', chars: ['held', 'florine', 'schoen'] },
    { t: 'say', who: 'verteller', text: 'Naast de geheime hut staat een reuzenschoen. Hij is zo groot als een auto!', sfx: 'dreun' },
    { t: 'say', who: 'florine', text: 'Misschien woont er een kabouter in! Hallo, kabouter?', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Kijk, voetstappen naar het bos! Kom op, Flo, we pakken de mountainbikes.', mood: 'denkt' },
    { t: 'say', who: 'verteller', text: 'Florine zit achterop in haar fietsstoeltje. Helmen op, en daar gaan ze!', sfx: 'bel' },
    {
      t: 'choice',
      q: 'Welke kleur heeft jouw mountainbike?',
      options: [
        { label: 'Rood', icon: '🔴', say: 'Rood als een brandweerauto. Zoef!' },
        { label: 'Blauw', icon: '🔵', say: 'Blauw als het ven. Mooi hoor!' },
        { label: 'Groen', icon: '🟢', say: 'Groen als het bos. Dan zie je hem bijna niet!' }
      ]
    },

    // --- Mountainbiken over het bospad ---
    { t: 'scene', bg: 'bos', chars: ['held', 'florine'] },
    { t: 'say', who: 'verteller', text: 'Het bospad zit vol hobbels. Hup, hop, hup!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'Wiebel, wiebel! Mijn buik is een pudding!', mood: 'lacht' },
    {
      t: 'game', game: 'count', skill: 'tellen',
      intro: 'Er liggen stenen op het pad. Hoeveel zie je er? Tel ze met je vinger.',
      success: 'Goed geteld! {HELD} fietst er netjes omheen.',
      hint: 'Wijs elke steen één keer aan. Zeg bij elke steen het volgende getal.',
      params: {
        1: { mode: 'howmany', n: 5, item: '🪨' },
        2: { mode: 'howmany', n: 9, item: '🪨' },
        3: { mode: 'howmany', n: 12, item: '🪨' }
      }
    },
    { t: 'say', who: 'verteller', text: 'De bomen worden groter en groter. Dit is het Reuzenbos!', sfx: 'wind' },

    // --- Judo-oefening bij het ven ---
    { t: 'scene', bg: 'ven', chars: ['held', 'florine'] },
    { t: 'say', who: 'florine', text: 'Ik wil judo doen! Hiiija!', mood: 'lacht', sfx: 'sprong' },
    { t: 'say', who: 'held', text: 'Bij judo buig je eerst. Dan balans op één been, en dan rollen!', mood: 'blij' },
    {
      t: 'game', game: 'memory', skill: 'geheugen',
      intro: 'Kijk goed naar de judo-oefening: buigen, rollen of op één been. Doe het daarna na!',
      success: 'Knap onthouden! Jij bent een echte judoka.',
      hint: 'Zeg het zachtjes mee: buigen, rollen, been. Dan onthoud je het beter.',
      params: {
        1: { length: 4, items: ['🙇', '🤸', '🦩'] },
        2: { length: 5, items: ['🙇', '🤸', '🦩'] },
        3: { length: 6, items: ['🙇', '🤸', '🦩'] }
      }
    },
    { t: 'say', who: 'florine', text: 'Ik rol in de bladeren! Kijk, ik ben een boom met laarsjes.', mood: 'lacht', sfx: 'pop' },

    // --- Reus Brom ---
    { t: 'say', who: 'verteller', text: 'Boem, boem! De grond trilt weer.', sfx: 'dreun' },
    { t: 'scene', bg: 'reuzenbos', chars: ['held', 'florine', 'brom'] },
    { t: 'say', who: 'verteller', text: 'Tussen de bomen staat een reus. Met een groene trui en één blote voet!' },
    { t: 'say', who: 'brom', text: 'Hmmm, hallo, ik ben Brom. Hebben jullie mijn schoen gezien?', mood: 'verbaasd' },
    { t: 'say', who: 'held', text: 'Ja! Die staat naast onze hut.', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Ben jij een boom met een trui?', mood: 'lacht' },
    { t: 'say', who: 'brom', text: 'Hmmm, hihi, nee. Ik ben een reus, en ik ben alleen bang voor muizen.', mood: 'lacht' },
    { t: 'say', who: 'brom', text: 'Sinds het Sterrenkompas weg is, raak ik alles kwijt. Nu ook mijn sok!', mood: 'denkt' },
    { t: 'say', who: 'verteller', text: 'Aan de waslijn hangen kaartjes met woorden. Welk kaartje hoort bij de sok?' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Luister goed naar de klanken. Welk woord hoort bij de sok van Brom?',
      success: 'Sok! Daar hangt hij, achter de zeep.',
      hint: 'Zeg de klanken langzaam na. Plak ze dan aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'sok', pic: '🧦',
          options: [
            { w: 'zeep', pic: '🧼' },
            { w: 'pen', pic: '🖊️' }
          ]
        },
        2: {
          mode: 'build', word: 'sok', pic: '🧦',
          options: [
            { w: 'zeep', pic: '🧼' },
            { w: 'pen', pic: '🖊️' },
            { w: 'bos', pic: '🌲' }
          ]
        },
        3: {
          mode: 'missing', word: 'sok', pic: '🧦',
          options: [
            { w: 'zak', pic: '🛍️' },
            { w: 'zeep', pic: '🧼' },
            { w: 'pen', pic: '🖊️' },
            { w: 'bos', pic: '🌲' }
          ]
        }
      }
    },
    { t: 'say', who: 'verteller', text: 'Brom trekt zijn sok aan. Die sok is zo groot als een slaapzak!', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Mag ik erin slapen? Met Konijn?', mood: 'lacht' },
    { t: 'say', who: 'verteller', text: 'Met één grote stap haalt Brom zijn schoen bij de hut. Nu heeft hij weer twee schoenen aan!', sfx: 'dreun' },

    // --- Picknick bij Broms huis ---
    { t: 'say', who: 'brom', text: 'Hmmm, dank je wel. Kom, we gaan picknicken bij mijn huis.', mood: 'blij' },
    { t: 'say', who: 'verteller', text: 'Brom zet zijn broodtrommel op het kleed. Er zitten appels in!' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Brom heeft appels in zijn trommel. Florine vindt er nog meer. Hoeveel zijn het samen?',
      success: 'Precies goed! Wat een lekkere picknick.',
      hint: 'Tel eerst de appels van Brom. Tel dan verder met de appels van Florine.',
      params: {
        1: { a: 2, b: 3, op: '+', item: '🍎' },
        2: { a: 5, b: 4, op: '+', item: '🍎' },
        3: { a: 7, b: 5, op: '+', item: '🍎' }
      }
    },

    // --- Belletje lellen: de trommel is leeg ---
    { t: 'say', who: 'verteller', text: 'Tring, tring! Iemand belt aan bij het huis van Brom.', sfx: 'bel' },
    { t: 'say', who: 'verteller', text: 'Er is niemand bij de deur. En de broodtrommel is ineens helemaal leeg!', sfx: 'whoosh' },
    { t: 'say', who: 'brom', text: 'Mijn appels en mijn boterhammen! Alles is op.', mood: 'verbaasd' },
    { t: 'say', who: 'florine', text: 'Ik was het niet! Mijn buik rommelt nog.', mood: 'denkt' },
    { t: 'scene', bg: 'reuzenbos', chars: ['held', 'brom', 'kwebbel'] },
    { t: 'say', who: 'kwebbel', text: 'Hallo, hallo, ik kom eraan! Een lege trommel, wie heeft dat gedaan?', mood: 'verbaasd', sfx: 'papegaai' },
    { t: 'say', who: 'held', text: 'We gaan speuren en de getuigen verhoren! Brom, wat lag er naast je trommel?', mood: 'blij' },

    // --- Praatpuzzel 1: getuige Brom ---
    {
      t: 'talk', puzzle: 'h2-brom', who: 'brom',
      intro: 'Hmmm. Stel mij maar vragen. Dan vertel ik wat ik gezien heb.',
      ask: 'Wat lag er naast de lege trommel?',
      minQuestions: 2,
      answers: [
        { pic: '🍬', label: 'Papiertjes', correct: true },
        { pic: '🍂', label: 'Blaadjes', correct: false },
        { pic: '🪶', label: 'Veertjes', correct: false },
        { pic: '🌰', label: 'Nootjes', correct: false }
      ],
      fallbackQs: [
        { q: 'Is het een dier?', a: 'Hmmm, nee. Het leeft niet, het ligt heel stil in het gras.' },
        { q: 'Welke kleur heeft het?', a: 'Hmmm, allemaal kleuren. Rood, geel en blauw, en het glimt een beetje.' },
        { q: 'Is het groot?', a: 'Nee, heel klein en heel dun. Nog kleiner dan mijn nagel!' },
        { q: 'Kun je het opeten?', a: 'Nee, niet opeten. Maar er zat eerst wel iets lekkers in!' },
        { q: 'Maakt het geluid?', a: 'Als je erop stapt, hoor je krrrts. Het ritselt en het kraakt.' },
        { q: 'Is het plakkerig?', a: 'Hmmm, ja, een beetje. Van iets zoets, denk ik.' }
      ],
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'moeilijk', 'tip', 'zeg het maar', 'zeg het',
            'vertel het', 'verklap', 'verklappen', 'antwoord', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Hmmm, een tip? Die krijg je van mij.', a2: 'Geen zorgen, ik help je graag.' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'goedemorgen', 'goedemiddag', 'dag brom', 'hoe gaat het'],
          a: 'Hmmm, hallo! Met mij gaat het wel. Alleen mijn buik is een beetje leeg.', a2: 'Hoi hoi. Vraag maar raak, ik denk rustig na.' },
        { id: 'stoppen', keys: ['stoppen', 'stop', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of vraag nog iets, dat vind ik fijn.', a2: 'Even pauze mag altijd. Tik op het huisje, of vraag nog maar iets.' },
        { id: 'grap', keys: ['grapje', 'mop', 'poep', 'poepie', 'scheet', 'scheten', 'plas', 'pies', 'drol', 'boertje', 'gek', 'lol', 'haha', 'hihi'],
          a: 'Hmmm, hihi, jij bent grappig! Maar wat lag er nou naast mijn trommel?', a2: 'Ho ho ho, wat moet ik lachen! Kom, we speuren weer verder.' },
        { id: 'brom', keys: ['wie ben jij', 'hoe heet jij', 'waar woon jij', 'woon jij', 'hoe oud ben jij', 'ben jij bang', 'bang', 'reus', 'reuzen', 'lievelingseten', 'jouw schoen', 'jouw sok'],
          a: 'Ik ben Brom, de reus van het Reuzenbos. Ik ben lief, maar een beetje bang voor muizen.', a2: 'Hmmm, ik eet het liefst appels. Maar die zijn nu allemaal op.' },
        { id: 'muis', keys: ['muis', 'muizen', 'muisje', 'rat'],
          a: 'Een muis?! Waar, waar? Oef, het was geen muis, hoor.', a2: 'Hmmm, zeg dat woord niet zo hard. Nee, het was geen muis!' },
        { id: 'bijna', keys: ['snoep', 'snoepje', 'snoepjes', 'lolly', 'drop', 'dropje', 'zuurtje', 'chocola', 'chocolade', 'toffee', 'kauwgom', 'spekje'],
          a: 'Hmmm, warm, heel warm! Maar het lekkers zelf is op. Wat bleef er dan liggen?', a2: 'Bijna! Het zoete is weg. Wat zit er om een snoepje heen?' },
        { id: 'dier', keys: ['dier', 'dieren', 'beest', 'beestje', 'leeft', 'leeft het', 'levend', 'vogel', 'hond', 'poes', 'kat', 'eekhoorn', 'kriebelt'],
          a: 'Hmmm, nee. Het leeft niet, het ligt heel stil in het gras.', a2: 'Geen beestje, hoor. Het kruipt niet en het vliegt niet.' },
        { id: 'eten', keys: ['eten', 'opeten', 'eet je', 'lekker', 'eetbaar', 'smaakt', 'proeven', 'bijten', 'kauwen'],
          a: 'Nee, niet opeten. Maar er zat eerst wel iets lekkers in!', a2: 'Hmmm, je kunt het niet eten. Het is wat overblijft als het lekkers op is.' },
        { id: 'kleur', keys: ['kleur', 'welke kleur', 'kleuren', 'rood', 'blauw', 'groen', 'geel', 'goud', 'zilver', 'zwart', 'wit', 'roze', 'paars', 'oranje', 'bruin', 'grijs'],
          a: 'Hmmm, allemaal kleuren. Rood, geel en blauw, en het glimt een beetje.', a2: 'Heel vrolijk van kleur. Niet bruin zoals de grond, maar fel!' },
        { id: 'glimt', keys: ['glimt', 'glimmen', 'glimmend', 'glanst', 'blinkt', 'glinstert', 'schijnt'],
          a: 'Ja, het glimt een beetje in de zon. Heel vrolijk.', a2: 'Hmmm, het glanst, net als een cadeautje.' },
        { id: 'groot', keys: ['groot', 'klein', 'hoe groot', 'grootte', 'lang', 'kort', 'past het in', 'in mijn hand', 'in je hand'],
          a: 'Nee, heel klein en heel dun. Nog kleiner dan mijn nagel!', a2: 'Hmmm, voor mij piepklein. In jouw hand past het makkelijk.' },
        { id: 'materiaal', keys: ['plastic', 'hout', 'houten', 'metaal', 'ijzer', 'steen', 'stof', 'glas', 'waar is het van', 'waarvan gemaakt', 'hard', 'zacht', 'dun', 'dik'],
          a: 'Het is heel dun en licht. Je kunt het kreukelen tot een propje.', a2: 'Niet hard, niet zacht. Gewoon heel dun, en het kraakt een beetje.' },
        { id: 'vorm', keys: ['rond', 'vierkant', 'vorm', 'plat', 'gedraaid', 'kreukel', 'gekreukeld', 'propje', 'puntig'],
          a: 'Plat en een beetje vierkant. Met twee gedraaide puntjes aan de zijkant.', a2: 'Hmmm, het is helemaal gekreukeld. Iemand heeft het snel opengemaakt.' },
        { id: 'geluid', keys: ['geluid', 'lawaai', 'maakt het geluid', 'ritselt', 'ritselen', 'kraakt', 'knispert', 'klinkt', 'piept'],
          a: 'Als je erop stapt, hoor je krrrts. Het ritselt en het kraakt.', a2: 'Hmmm, het knispert. Net als bladeren, maar dan vrolijker.' },
        { id: 'ruikt', keys: ['ruikt', 'ruiken', 'geur', 'stinkt', 'stinken', 'ruik'],
          a: 'Hmmm, snuffel snuffel. Het ruikt naar aardbei en een beetje naar drop.', a2: 'Het ruikt zoet. Heel lekker, eigenlijk!' },
        { id: 'plakt', keys: ['plakt', 'plakkerig', 'kleverig', 'kleeft', 'vies'],
          a: 'Hmmm, ja, een beetje plakkerig. Van iets zoets, denk ik.', a2: 'Een beetje plakkerig. Alsof er net iets zoets uit is gegeten.' },
        { id: 'licht', keys: ['zwaar', 'licht', 'weegt', 'wind', 'waait', 'waaien', 'vliegt', 'vliegen'],
          a: 'Heel licht! Als het waait, dwarrelt het zo weg.', a2: 'Zwaar? Nee hoor, het weegt bijna niks.' },
        { id: 'waar', keys: ['waar lag', 'waar ligt', 'waar lagen', 'naast', 'op de grond', 'gras', 'tafel', 'kleed', 'overal'],
          a: 'Overal! Naast de trommel, in het gras en op mijn kleed.', a2: 'Hmmm, er lag een heel spoor van. Richting de struiken.' },
        { id: 'aantal', keys: ['hoeveel', 'veel', 'een paar', 'twee', 'drie', 'meer dan een'],
          a: 'Hmmm, heel veel. Wel tien, of misschien twintig!', a2: 'Een hele hoop. Iemand heeft flink gesmuld.' },
        { id: 'bel', keys: ['bel', 'belletje', 'aangebeld', 'deurbel', 'tring', 'deur', 'belde'],
          a: 'Tring, tring, iemand belde aan. Maar toen we keken, was er niemand.', a2: 'Hmmm, op de bel zaten kleine vingertjes. Piepkleine handjes!' },
        { id: 'trommel', keys: ['trommel', 'broodtrommel', 'boterham', 'boterhammen', 'appel', 'appels', 'klokhuis', 'leeg', 'kruimels', 'kruimeltjes'],
          a: 'Mijn trommel is helemaal leeg. Zelfs de kruimels zijn op!', a2: 'Hmmm, alles is op. De appels, de boterhammen, en ook mijn toetje.' },
        { id: 'wie', keys: ['wie was het', 'wie heeft', 'wie deed', 'wie', 'dief', 'dader', 'gedaan', 'gepikt', 'gestolen', 'opgegeten'],
          a: 'Hmmm, dat zag ik niet. Ik stond bij de deur, weet je nog?', a2: 'Ik weet het niet. Misschien weet Kwebbel meer, die zat hoog in de boom.' },
        { id: 'speelgoed', keys: ['speelgoed', 'spelen', 'bal', 'knuffel', 'auto', 'lego', 'pop', 'robot'],
          a: 'Nee, geen speelgoed. Meestal gooi je het weg.', a2: 'Hmmm, nee. Eigenlijk hoort het in de prullenbak.' },
        { id: 'afval', keys: ['afval', 'prullenbak', 'vuilnis', 'vuilnisbak', 'weggooien', 'rommelig', 'troep'],
          a: 'Ja, het hoort in de prullenbak. Iemand heeft het zomaar laten vallen!', a2: 'Hmmm, wat een troep. Straks ruim ik het netjes op.' },
        { id: 'vanwie', keys: ['van jou', 'is het van jou', 'van wie'],
          a: 'Hmmm, niet van mij. Ik eet alleen appels en boterhammen.', a2: 'Van mij is het niet. Ik weet nog niet van wie.' },
        { id: 'watals-water', keys: ['water', 'nat', 'regen', 'regent', 'ven', 'rivier'],
          a: 'Als het regent, wordt het nat. Maar het smelt niet.', a2: 'Hmmm, in het water blijft het drijven. Het is heel licht.' }
      ],
      // Alleen echte woorden; geen 'wikkel' (1 letter van 'winkel') en geen 'zakje' (stam 'zak').
      secretKeys: ['snoeppapiertjes', 'snoeppapiertje', 'snoeppapier', 'papiertjes', 'papiertje', 'papier',
        'snoepwikkel', 'snoepwikkels', 'verpakking', 'verpakkingen', 'snoepverpakking'],
      win: 'Hmmm, ja! Snoeppapiertjes, overal. Wat ben jij een goede speurder!',
      wrongGuess: 'Hmmm, nee, dat lag er niet. Goed geprobeerd! Vraag nog maar iets.',
      wrongGuess2: 'Nee hoor, dat was het niet. Stel nog een vraag, ik help je.',
      guessKeys: {
        blaadjes: ['blad', 'blaadje', 'blaadjes', 'bladeren', 'bladje'],
        veertjes: ['veer', 'veertje', 'veertjes', 'veren'],
        nootjes: ['noot', 'nootje', 'nootjes', 'noten', 'dennenappel'],
        anders: ['steentjes', 'steentje', 'takjes', 'takje', 'bloemen', 'bloemetjes', 'schelpjes']
      },
      hints: [
        'Het is klein en dun, en het ritselt als je erop stapt.',
        'Er zat eerst iets zoets in. Nu is het leeg en een beetje plakkerig.',
        'Als je een snoepje uitpakt, wat houd je dan over in je hand?'
      ]
    },
    { t: 'say', who: 'held', text: 'Snoeppapiertjes! De dief houdt van snoep.', mood: 'denkt', sfx: 'ster' },
    { t: 'say', who: 'florine', text: 'Ik hou ook van snoep! Maar ik was het niet, echt niet.', mood: 'lacht' },
    { t: 'say', who: 'kwebbel', text: 'Ik zag iets in de struik, dat was best raar. Een staart zwiepte heen en weer, hier en daar!', mood: 'denkt' },

    // --- Praatpuzzel 2: getuige Kwebbel ---
    {
      t: 'talk', puzzle: 'h2-kwebbel', who: 'kwebbel',
      intro: 'Stel mij maar vragen over die staart. Ik vertel je alles, dat is mijn aard!',
      ask: 'Hoe zag de staart eruit?',
      minQuestions: 2,
      answers: [
        { pic: '🦓', label: 'Strepen', correct: true },
        { pic: '🐆', label: 'Stippen', correct: false },
        { pic: '🐀', label: 'Kaal', correct: false },
        { pic: '🌈', label: 'Regenboog', correct: false }
      ],
      fallbackQs: [
        { q: 'Welke kleur had de staart?', a: 'Zwart en grijs, twee kleuren maar. Heel netjes om en om, echt waar!' },
        { q: 'Was de staart lang?', a: 'Best lang en lekker dik, zo zag ik hem gaan. Zo lang als jouw arm, daar kun je op aan!' },
        { q: 'Was de staart zacht?', a: 'Zacht en pluizig, als een knuffel zo fijn. Het moet een heel warme staart zijn!' },
        { q: 'Waar ging hij heen?', a: 'Hij verdween in de struiken, bij de rivier. Ritsel, ritsel, weg was het dier!' },
        { q: 'Zag je zijn gezicht?', a: 'Zijn gezicht zag ik niet, dat zat achter een blad. Alleen zijn staart, en dat was dat!' },
        { q: 'Hoe zag de staart eruit?', a: 'Heel netjes getekend, net een pyjama zo fijn. Wat zou dat voor staart kunnen zijn?' }
      ],
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'moeilijk', 'tip', 'zeg het maar', 'zeg het',
            'vertel het', 'verklap', 'verklappen', 'antwoord', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Een tip? Die krijg je van mij!', a2: 'Geen nood, ik help je, ik sta aan je zij!' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'goedemorgen', 'goedemiddag', 'dag kwebbel', 'hoe gaat het'],
          a: 'Hallo, hallo, daar ben je weer! Vraag maar over de staart, keer op keer!', a2: 'Hoi hoi, met mij gaat het goed! Vraag maar raak, jij hebt moed!' },
        { id: 'stoppen', keys: ['stoppen', 'stop', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of vraag nog iets, dan zing ik een liedje!', a2: 'Even pauze mag altijd, hoor! Tik op het huisje, of vraag maar door.' },
        { id: 'grap', keys: ['grapje', 'mop', 'poep', 'poepie', 'scheet', 'scheten', 'plas', 'pies', 'drol', 'boertje', 'gek', 'lol', 'haha', 'hihi'],
          a: 'Hihi, wat grappig, ik lach me krom! Maar hoe zag die staart eruit? Kom!', a2: 'Ha, daar moet ik om lachen, hoor! Maar nu weer speuren, ga maar door!' },
        { id: 'kwebbel', keys: ['wie ben jij', 'waar woon jij', 'woon jij', 'hoe heet jij', 'wat eet jij', 'lievelingseten', 'lievelingskleur', 'jouw veren', 'waar was jij', 'zat jij'],
          a: 'Ik ben Kwebbel, ik zat hoog in de boom. Ik zag alles, net als in een droom!', a2: 'Ik zat op een tak, heel stil en heel klein. Vanaf daar kon ik alles zien, wat fijn!' },
        { id: 'bijna', keys: ['zebra', 'zebraatje', 'tijger', 'tijgertje', 'pyjama'],
          a: 'Een zebra? Hihi, die woont hier niet! Maar zijn staart leek er wel op, als je goed ziet.', a2: 'Zo groot als een tijger was hij niet, o nee. Maar zijn staart leek erop, denk maar mee!' },
        { id: 'kleur', keys: ['kleur', 'welke kleur', 'kleuren', 'zwart', 'grijs', 'wit', 'rood', 'blauw', 'groen', 'geel', 'bruin', 'oranje', 'roze', 'paars'],
          a: 'Zwart en grijs, twee kleuren maar. Heel netjes om en om, echt waar!', a2: 'Geen rood, geen blauw, geen groen erbij. Alleen zwart en grijs, geloof het van mij!' },
        { id: 'lang', keys: ['lang', 'kort', 'groot', 'klein', 'dik', 'dun', 'hoe lang', 'hoe groot'],
          a: 'Best lang en lekker dik, zo zag ik hem gaan. Zo lang als jouw arm, daar kun je op aan!', a2: 'Niet heel groot, niet heel klein. Zo groot als een kat, dat zal het zijn!' },
        { id: 'zacht', keys: ['zacht', 'pluizig', 'pluis', 'harig', 'haren', 'haar', 'vacht', 'veren', 'glad', 'borstel', 'wollig'],
          a: 'Zacht en pluizig, als een knuffel zo fijn. Het moet een heel warme staart zijn!', a2: 'Harig was hij, niet glad als een vis. Zacht als een kussen, dat weet ik gewis!' },
        { id: 'beweegt', keys: ['bewegen', 'beweegt', 'zwiepen', 'zwiept', 'kwispelen', 'kwispelt', 'rennen', 'rende', 'snel', 'langzaam', 'springen', 'sprong'],
          a: 'Zwiep, zwiep, en weg was hij, heel snel! Hij rende het bos in, dat weet ik wel.', a2: 'Hij sprong over een tak, hop, hop, hop. Zo vlug als een bal, en toen was hij op!' },
        { id: 'waar', keys: ['waar', 'struik', 'struiken', 'welke kant', 'heen', 'waar ging', 'verdween', 'verstopt'],
          a: 'Hij verdween in de struiken, bij de rivier. Ritsel, ritsel, weg was het dier!', a2: 'Richting het water ging hij, heel vlug. Misschien komt hij straks wel terug!' },
        { id: 'wie', keys: ['wie was het', 'wie heeft', 'wie deed', 'wie', 'dader', 'dief', 'naam', 'hoe heet hij', 'hoe heet het'],
          a: 'Wie het was? Dat zag ik niet, o nee! Alleen zijn staart, die ging met hem mee.', a2: 'Zijn naam weet ik niet, dat is nog geheim. Maar zijn staart zag ik wel, heel duidelijk en fijn!' },
        { id: 'gezicht', keys: ['gezicht', 'hoofd', 'ogen', 'oogjes', 'oren', 'snuit', 'neus', 'masker', 'snor', 'bek'],
          a: 'Zijn gezicht zag ik niet, dat zat achter een blad. Alleen zijn staart, en dat was dat!', a2: 'Zijn kopje bleef verstopt, heel stil in het groen. Vraag naar de staart, dat is slim om te doen!' },
        { id: 'handjes', keys: ['handjes', 'handen', 'hand', 'pootjes', 'poten', 'vingers', 'vingertjes', 'voeten', 'klauwen', 'nagels'],
          a: 'Zijn pootjes zag ik niet, die zaten in het groen. Vraag naar de staart, dat is slim om te doen!', a2: 'Handjes of pootjes, die bleven uit het zicht. Maar die staart zag ik goed, in het zonnelicht!' },
        { id: 'eekhoorn', keys: ['eekhoorn', 'eekhoorntje'],
          a: 'Een eekhoorn? Die heeft een rode staart, dat weet je wel. Deze was anders, dat zag ik snel!', a2: 'Nee, geen eekhoorn, die is rood en klein. Deze staart moet van iemand anders zijn!' },
        { id: 'vos', keys: ['vos', 'vosje'],
          a: 'Een vos heeft een oranje staart, heel fel. Deze was anders, dat zag ik wel!', a2: 'Geen vos, hoor, geen oranje in de wei. Zwart en grijs was hij, geloof het van mij!' },
        { id: 'dier', keys: ['dier', 'dieren', 'beest', 'beestje', 'welk dier', 'kat', 'poes', 'hond', 'muis', 'konijn', 'wasbeer', 'das', 'rat', 'aap'],
          a: 'Welk dier? Dat weet ik nog niet, nee nee. Maar over zijn staart, daar denk ik graag mee!', a2: 'Dat dier heb ik nooit eerder gezien, echt waar. Maar zijn staart, die ken ik, vraag maar, ik sta klaar!' },
        { id: 'geluid', keys: ['geluid', 'hoorde', 'horen', 'hoor je', 'lawaai', 'zei hij', 'praten', 'praatte', 'riep', 'piepen'],
          a: 'Ik hoorde ritsel, en een zacht oeps. Daarna was hij weg, heel snel, floeps!', a2: 'Een klein stemmetje zei oeps, heel zacht. Dat had ik van een dief niet verwacht!' },
        { id: 'snoep', keys: ['snoep', 'snoepjes', 'papiertjes', 'snoeppapiertjes', 'trommel', 'broodtrommel', 'appels', 'gegeten', 'opgegeten'],
          a: 'Die trommel is leeg, tot de allerlaatste hap. Maar let op die staart, dat is de volgende stap!', a2: 'Hij smulde en smulde, dat zag ik van hier. Maar vraag naar de staart, dat geeft plezier!' },
        { id: 'patroon', keys: ['hoe zag', 'eruit', 'uiterlijk', 'patroon', 'mooi', 'versiering', 'tekening', 'bijzonder', 'getekend'],
          a: 'Zwart, dan grijs, dan weer zwart, steeds om en om. Wat voor staart is dat? Jij weet het vast, kom!', a2: 'Heel netjes getekend, net een pyjama zo fijn. Wat zou dat voor staart kunnen zijn?' },
        { id: 'aantal', keys: ['hoeveel', 'twee', 'drie', 'meer dan een'],
          a: 'Eén staart maar, niet twee of drie. Maar wel een hele mooie, zie je, zie!', a2: 'Eentje maar, dat weet ik zeker. Net zo zeker als koffie in een beker!' },
        { id: 'bang', keys: ['bang', 'ben je bang', 'schrok', 'schrikken', 'geschrokken'],
          a: 'Bang? Welnee, het was maar een staart! Hij was eerder verlegen, heel zacht van aard.', a2: 'Ik schrok een klein beetje, dat is waar. Maar hij was heel lief, dat zag ik daar!' },
        { id: 'watals', keys: ['wat als', 'zoeken', 'vangen', 'pakken', 'terugkomt', 'terug', 'achterna'],
          a: 'Wat als we hem zoeken? Dat doen we heel zacht. Misschien is hij lief, dat had je niet verwacht!', a2: 'Eerst alle sporen, dan gaan we op pad. Stap voor stap, zo doen speurders dat!' },
        { id: 'brom', keys: ['brom', 'reus', 'was het brom'],
          a: 'Brom was het niet, die stond bij de deur. Hij heeft geen staart, en ook niet die kleur!', a2: 'Brom is lief, al is hij groot en zwaar. Hij deed het niet, dat is echt waar!' }
      ],
      // Geen 'staart' als geheim: 'staat' en 'start' liggen 1 letter ervan af.
      secretKeys: ['strepen', 'streepjes', 'streep', 'streepje', 'gestreept', 'gestreepte', 'streepjesstaart', 'streepstaart',
        'zebrastaart', 'zebrastrepen', 'lijntjes'],
      win: 'Ja, ja, ja, strepen, zwart en grijs! Jij bent een speurder, slim en wijs!',
      wrongGuess: 'Nee, dat zag ik niet, maar goed geprobeerd! Stel nog een vraag, dan kom je er, gegarandeerd!',
      wrongGuess2: 'Hmm, nee, zo zag die staart er niet uit. Vraag nog iets, dan kom je eruit!',
      guessKeys: {
        stippen: ['stip', 'stippen', 'stippeltjes', 'stippels', 'bolletjes', 'vlekken', 'vlekjes', 'noppen'],
        kaal: ['kaal', 'kale', 'zonder haar'],
        regenboog: ['regenboog', 'regenboogstaart', 'alle kleuren'],
        anders: ['ruitjes', 'ruiten', 'sterretjes', 'hartjes', 'bloemetjes']
      },
      hints: [
        'Twee kleuren had hij, zwart en grijs. Kijk hoe ze liepen, wees maar wijs!',
        'Zwart, dan grijs, dan weer zwart, zo ging het maar door. Net als een pyjama, of een zebra, hoor!',
        'Een zebra heeft ze ook, lang en smal. Hoe heten die lijnen? Jij weet het al!'
      ]
    },
    { t: 'scene', bg: 'reuzenbos', chars: ['held', 'florine', 'brom', 'kwebbel'] },
    { t: 'say', who: 'florine', text: 'Een snoepzebra! Dat zei ik toch al!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'En op de bel zitten kleine vingertjes. Net als bij onze hut!', mood: 'denkt' },

    // --- Conclusie: twee kenmerken, uitsluiten ---
    {
      t: 'game', game: 'pick', skill: 'logica',
      intro: 'De dader heeft strepen op zijn staart. En hij heeft kleine handjes. Wie past bij allebei?',
      success: 'Goed uitgesloten! Geen zebra en geen eekhoorn. Het is iemand die we nog niet kennen!',
      hint: 'Kijk bij elk dier: heeft het strepen? En heeft het handjes? Het moet allebei kloppen.',
      params: {
        1: {
          q: 'Strepen én handjes. Een zebra heeft geen handjes. Wie kan het zijn?',
          options: [
            { pic: '🦓', label: 'zebra', correct: false },
            { pic: '🐿️', label: 'eekhoorn', correct: false },
            { pic: '❓', label: 'een ander', correct: true }
          ]
        },
        2: {
          q: 'Strepen én handjes. Wie past bij allebei?',
          options: [
            { pic: '🦓', label: 'zebra', correct: false },
            { pic: '🐿️', label: 'eekhoorn', correct: false },
            { pic: '🦜', label: 'Kwebbel', correct: false },
            { pic: '❓', label: 'een ander', correct: true }
          ]
        },
        3: {
          q: 'Strepen op de staart én kleine handjes. Wie past bij allebei?',
          options: [
            { pic: '🦓', label: 'zebra', correct: false },
            { pic: '🐿️', label: 'eekhoorn', correct: false },
            { pic: '🦜', label: 'Kwebbel', correct: false },
            { pic: '🐭', label: 'muis', correct: false },
            { pic: '❓', label: 'een ander', correct: true }
          ]
        }
      }
    },
    { t: 'say', who: 'kwebbel', text: 'Een streepjesstaart en handjes klein. Wie zou die snoepdief toch zijn?', mood: 'denkt' },
    { t: 'say', who: 'brom', text: 'Hmmm, ik schrijf alle sporen op. Waar is mijn reuzenpen?', mood: 'denkt' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Brom zoekt zijn pen tussen zijn spullen. Welk woord is het?',
      success: 'Pen! Brom kan alles opschrijven.',
      hint: 'Zeg de klanken langzaam na. Plak ze dan aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'pen', pic: '🖊️',
          options: [
            { w: 'sok', pic: '🧦' },
            { w: 'zeep', pic: '🧼' }
          ]
        },
        2: {
          mode: 'build', word: 'pen', pic: '🖊️',
          options: [
            { w: 'sok', pic: '🧦' },
            { w: 'zeep', pic: '🧼' },
            { w: 'pet', pic: '🧢' }
          ]
        },
        3: {
          mode: 'missing', word: 'pen', pic: '🖊️',
          options: [
            { w: 'pan', pic: '🍳' },
            { w: 'pet', pic: '🧢' },
            { w: 'sok', pic: '🧦' },
            { w: 'zeep', pic: '🧼' }
          ]
        }
      }
    },
    { t: 'say', who: 'verteller', text: 'Brom schrijft met grote letters: snoeppapier, strepen, handjes. Nu weten ze al veel meer!', sfx: 'pop' },

    // --- Brom en de "muis" ---
    { t: 'say', who: 'verteller', text: 'Opeens ritselt er iets bij de voet van Brom.', sfx: 'wind' },
    { t: 'say', who: 'brom', text: 'Hmmm, een muis! Help, help!', mood: 'verbaasd', sfx: 'sprong' },
    {
      t: 'game', game: 'pick', skill: 'logica',
      intro: 'Is het echt een muis? Luister goed naar de aanwijzingen.',
      success: 'Het is maar een blaadje! Het is plat en het heeft geen staart.',
      hint: 'Een muis heeft een staart en oortjes. Wat is plat en waait in de wind?',
      params: {
        1: {
          q: 'Het is bruin en plat. Het heeft geen staart. Wat is het?',
          options: [
            { pic: '🍂', label: 'blaadje', correct: true },
            { pic: '🐭', label: 'muis', correct: false },
            { pic: '🐿️', label: 'eekhoorn', correct: false }
          ]
        },
        2: {
          q: 'Het is plat en het heeft geen staart. Het ritselt in de wind. Wat is het?',
          options: [
            { pic: '🍂', label: 'blaadje', correct: true },
            { pic: '🐭', label: 'muis', correct: false },
            { pic: '🌰', label: 'nootje', correct: false },
            { pic: '🐌', label: 'slak', correct: false }
          ]
        },
        3: {
          q: 'Het is plat, zonder staart. Het groeit aan een boom. Wat is het?',
          options: [
            { pic: '🍂', label: 'blaadje', correct: true },
            { pic: '🐭', label: 'muis', correct: false },
            { pic: '🌰', label: 'nootje', correct: false },
            { pic: '🪶', label: 'veer', correct: false },
            { pic: '🐌', label: 'slak', correct: false }
          ]
        }
      }
    },
    { t: 'say', who: 'florine', text: 'Het is maar een blaadje! Kijk, ik gooi het op, wiiie!', mood: 'lacht', sfx: 'whoosh' },
    { t: 'say', who: 'brom', text: 'Hmmm, hihi, oeps. Dank je wel, jullie zijn echte vrienden.', mood: 'lacht' },

    // --- Beloning ---
    { t: 'reward', stars: 3, sticker: '🕵️', text: 'Knap gespeurd, {HELD}! Je fietste door het Reuzenbos, deed judo en verhoorde de getuigen.' },

    // --- Cliffhanger: het bootje drijft weg ---
    { t: 'scene', bg: 'rivier', chars: ['held', 'florine', 'brom', 'boot'] },
    { t: 'say', who: 'verteller', text: 'Het spoor van snoeppapiertjes gaat naar de rivier. Daar ligt een klein bootje!', sfx: 'wind' },
    { t: 'say', who: 'florine', text: 'Ik ben een kapitein! Kijk, mijn zwemvest is al aan.', mood: 'lacht', sfx: 'pop' },
    { t: 'say', who: 'verteller', text: 'Maar het touw is niet vast. Het bootje drijft heel langzaam weg!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'Hihi, dag dag! Ik ga varen, net als een eendje!', mood: 'lacht' },
    { t: 'say', who: 'held', text: 'Kom op, Brom! We gaan haar achterna.', mood: 'verbaasd' },
    { t: 'cliff', chars: ['held', 'brom', 'boot'], text: 'Het bootje met Florine drijft vrolijk de rivier af, richting de zee. Wordt vervolgd…' }
  ]
};
