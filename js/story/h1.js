// Hoofdstuk 1 – De Geheime Hut
// Leerdoelen: tellen tot 5-12, optellen tot 5-12, geheugen/ruimte (klimroute),
// vragen stellen + logisch uitsluiten (talk), logica (voetafdruk), klankzuiver mkm-woord 'bos'.
export default {
  id: 'h1',
  title: 'De Geheime Hut',
  sticker: '🗺️',
  steps: [
    // --- Intro: zaterdag in het bos bij het ven ---
    { t: 'scene', bg: 'ven', chars: ['olivier', 'florine'] },
    { t: 'say', who: 'verteller', text: 'Het is zaterdag in Oisterwijk. {HELD} heeft een hele week groep 3 gedaan op De Kikkenduut.', sfx: 'wind' },
    { t: 'say', who: 'verteller', text: 'Nu is het tijd voor avontuur. Samen met zusje Florine loopt {HELD} naar het ven.' },
    { t: 'say', who: 'florine', text: 'Kijk, eendjes! Ik ben ook een eendje, kwak!', mood: 'lacht' },
    { t: 'say', who: 'olivier', text: 'Weet je wat, Florine? Wij gaan een geheime hut bouwen!', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Een hut! Met een deur en een koekjeskast!', mood: 'blij' },
    {
      t: 'choice',
      q: 'Waar bouwen we de hut?',
      options: [
        { label: 'Onder de grote eik', icon: '🌳', say: 'Goed plan! Onder de eik is het lekker droog.' },
        { label: 'Naast het ven', icon: '💧', say: 'Mooi! Dan kunnen we de eendjes zien.' },
        { label: 'Tussen de struiken', icon: '🌿', say: 'Slim! Daar vindt niemand onze hut.' }
      ]
    },

    // --- Hut bouwen ---
    { t: 'scene', bg: 'bos', chars: ['olivier', 'florine'] },
    { t: 'say', who: 'olivier', text: 'Eerst hebben we takken nodig. Heel veel takken!', mood: 'denkt' },
    { t: 'say', who: 'florine', text: 'Ik heb er een! O nee, dat is een regenworm.', mood: 'verbaasd' },
    {
      t: 'game', game: 'count', skill: 'tellen',
      intro: 'Kijk naar het getal. Tik zoveel takken aan en tel hardop mee!',
      success: 'Top geteld! Dat zijn genoeg takken voor de muren.',
      hint: 'Tik elke tak maar één keer. Zeg bij elke tik het volgende getal.',
      params: {
        1: { mode: 'tap', n: 4, total: 6, item: '🪵' },
        2: { mode: 'tap', n: 7, total: 9, item: '🪵' },
        3: { mode: 'tap', n: 11, total: 14, item: '🪵' }
      }
    },
    { t: 'say', who: 'verteller', text: 'Krak, krak, de muren staan! Nu nog een dak van bladeren.', sfx: 'pop' },
    { t: 'say', who: 'florine', text: 'Ik help! Ik gooi bladeren op jouw hoofd!', mood: 'lacht', sfx: 'whoosh' },
    {
      t: 'game', game: 'sum', skill: 'rekenen',
      intro: 'Florine heeft bladeren en {HELD} vindt er nog meer. Hoeveel zijn het samen?',
      success: 'Precies goed! Het dak is klaar.',
      hint: 'Tel eerst de bladeren van Florine. Tel dan verder met de bladeren van {HELD}.',
      params: {
        1: { a: 2, b: 3, op: '+', item: '🍂' },
        2: { a: 4, b: 4, op: '+', item: '🍂' },
        3: { a: 7, b: 5, op: '+', item: '🍂' }
      }
    },
    { t: 'scene', bg: 'hut', chars: ['olivier', 'florine'] },
    { t: 'say', who: 'verteller', text: 'Kijk eens, een echte geheime hut! Met een deur van takken.', sfx: 'goed' },
    { t: 'say', who: 'florine', text: 'Waar is de koekjeskast? O, hier, in mijn zak!', mood: 'lacht' },

    // --- Klimmen in de boom ---
    { t: 'scene', bg: 'boom', chars: ['olivier', 'florine'] },
    { t: 'say', who: 'olivier', text: 'Ik klim in de boom. Dan kan ik ver kijken!', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Ik pas op de hut. En vooral op de koekjes!', mood: 'denkt' },
    {
      t: 'game', game: 'memory', skill: 'ruimte',
      intro: 'Kijk goed welke kant de takken op gaan. Doe de klimroute daarna na!',
      success: 'Knap geklommen! Je bent bijna boven.',
      hint: 'Kijk nog eens rustig. Wijs met je vinger mee: links, omhoog of rechts.',
      params: {
        1: { length: 3, items: ['⬅️', '⬆️', '➡️'] },
        2: { length: 4, items: ['⬅️', '⬆️', '➡️'] },
        3: { length: 5, items: ['⬅️', '⬆️', '➡️'] }
      }
    },
    { t: 'scene', bg: 'boomtop', chars: ['olivier'] },
    { t: 'say', who: 'verteller', text: 'Wauw, vanaf hier zie je het hele bos! En het ven glinstert.', sfx: 'klim' },

    // --- Kwebbel verschijnt ---
    { t: 'say', who: 'verteller', text: 'Opeens klinkt er gefladder. Er landt iemand op de tak!', sfx: 'papegaai' },
    { t: 'scene', bg: 'boomtop', chars: ['olivier', 'kwebbel'] },
    { t: 'say', who: 'kwebbel', text: 'Hallo, hallo, ik ben Kwebbel de papegaai! Ik praat in rijm, dat is zo fijn!', mood: 'lacht' },
    { t: 'say', who: 'olivier', text: 'Een pratende papegaai? In Oisterwijk?', mood: 'verbaasd' },
    { t: 'say', who: 'kwebbel', text: 'Ik heb een toverkaart, opgerold en rond. Ik vond hem hier in het bos, op de grond!', mood: 'blij' },
    { t: 'say', who: 'kwebbel', text: 'Maar eerst een raadsel, ja, dat moet! In mijn zak zit iets, raad jij het goed?', mood: 'denkt' },

    // --- Praatpuzzel: wat zit er in de zak? ---
    {
      t: 'talk', puzzle: 'h1-zak', who: 'kwebbel',
      intro: 'Stel mij maar vragen, groot of klein. Ik zeg ja of nee, dat is toch fijn!',
      ask: 'Wat heb ik in mijn zak?',
      minQuestions: 2,
      answers: [
        { pic: '🗝️', label: 'Een sleuteltje', correct: true },
        { pic: '🪙', label: 'Een muntje', correct: false },
        { pic: '🍪', label: 'Een koekje', correct: false },
        { pic: '🐸', label: 'Een kikker', correct: false }
      ],
      // Tikvragen als spraak niet kan of het kind liever tikt.
      fallbackQs: [
        { q: 'Is het een dier?', a: 'Nee, nee, het kwaakt niet en het blaft niet. Het ligt heel stil, het slaapt niet!' },
        { q: 'Kun je het opeten?', a: 'Nee hoor, dat zou niet fijn zijn. Je tanden zouden dan in de pijn zijn!' },
        { q: 'Is het groot?', a: 'Nee, het is klein, het past in je hand. Zo klein als een schelp op het strand!' },
        { q: 'Glimt het?', a: 'Ja, het glimt als goud, zo mooi! Het is van metaal, niet van hooi.' },
        { q: 'Wat kun je ermee doen?', a: 'Daarmee maak je iets open, klik! Een deur of een kist, in één tik.' },
        { q: 'Staat er iets op?', a: 'Ja, er staat een ster op, klein en fijn. Die zal vast heel belangrijk zijn!' }
      ],
      // Lokale trefwoordherkenning: eerste intent met een passende key wint.
      intents: [
        { id: 'hint', hint: true,
          keys: ['hint', 'help', 'helpen', 'ik weet het niet', 'weet niet', 'geen idee', 'moeilijk', 'tip', 'zeg het maar', 'zeg het',
            'vertel het', 'verklap', 'verklappen', 'antwoord', 'snap het niet', 'snap niet', 'wat is het nou', 'ik geef het op', 'geef het op'],
          a: 'Een tip? Die krijg je van mij!', a2: 'Niet getreurd, denk maar mee!' },
        { id: 'groet', keys: ['hallo', 'hoi', 'hey', 'goedemorgen', 'goedemiddag', 'dag kwebbel', 'hoe gaat het'],
          a: 'Hallo, hallo, wat leuk dat je praat! Stel je een vraag? Ik zit al klaar!', a2: 'Hoi hoi, met mij gaat het top! Vraag maar raak, ik zeg geen stop!' },
        { id: 'stoppen', keys: ['stoppen', 'stop', 'ik wil weg', 'ik wil niet meer', 'doei', 'klaar mee', 'ophouden'],
          a: 'Wil je stoppen? Tik dan op het huisje. Of raad nog even mee, dat vind ik fijn!', a2: 'Even pauze mag altijd, hoor! Tik op het huisje, of vraag nog iets, ga maar door.' },
        { id: 'grap', keys: ['grapje', 'mop', 'poep', 'poepie', 'scheet', 'scheten', 'plas', 'pies', 'drol', 'boertje', 'gek', 'lol', 'haha', 'hihi'],
          a: 'Hihi, wat grappig, ik lach me krom! Maar welk ding zit er in mijn zak? Kom!', a2: 'Ha, daar moet ik om lachen, hoor! Maar nu weer raden, ga maar door!' },
        { id: 'kwebbel', keys: ['wie ben jij', 'waar woon jij', 'woon jij', 'hoe heet jij', 'wat eet jij', 'ben jij een papegaai', 'lievelingseten', 'lievelingskleur', 'jouw veren'],
          a: 'Ik ben Kwebbel, ik woon hoog in een boom. Maar nu gaat het om mijn zak, dat is mijn droom!', a2: 'Ik eet het liefst zaadjes, knabbel knabbel knap. Nu weer over mijn zak, stap voor stap!' },
        { id: 'bijna', keys: ['sleutelhanger', 'hangslot', 'slotje'],
          a: 'Oeh, je bent heel dichtbij, echt waar! Denk nog even na, dan heb je het haast klaar!', a2: 'Warm, warm, bijna heet! Wat is het ding dat je nu bijna weet?' },
        { id: 'dier', keys: ['dier', 'dieren', 'beest', 'leeft het', 'leeft', 'levend', 'beestje', 'muis', 'vogel', 'poes', 'hond', 'vis', 'slang', 'spin', 'beer'],
          a: 'Nee, het is geen dier, het leeft niet, hoor. Het piept niet, het kruipt niet, het ligt maar stil, zo gaat het door.', a2: 'Een beestje? Nee, dat is het niet. Het zingt ook niet, zoals ik een lied!' },
        { id: 'eten', keys: ['eten', 'opeten', 'eet je', 'lekker', 'koek', 'drinken', 'smaakt', 'proeven', 'bijten', 'appel', 'banaan'],
          a: 'Opeten? Nee, dat is geen goed plan. Je bijt op iets hards, au, wat een pan!', a2: 'Het is niet om te eten, echt niet, nee. Je tanden doen dan pijn, oh wee!' },
        { id: 'kleur', keys: ['kleur', 'welke kleur', 'rood', 'blauw', 'groen', 'geel', 'goud', 'gouden', 'zilver', 'zwart', 'wit', 'roze', 'paars', 'oranje', 'bruin', 'grijs'],
          a: 'De kleur is goud, zo mooi en zo fijn. Net als de zon in de zonneschijn!', a2: 'Goudkleurig is het, dat zie je meteen. Het glinstert en blinkt, zo mooi als een steen!' },
        { id: 'groot', keys: ['groot', 'klein', 'hoe groot', 'grootte', 'lang', 'kort', 'dik', 'dun', 'past het in', 'in mijn hand', 'in je hand', 'handje', 'reus', 'reuzegroot'],
          a: 'Het is klein, het past in je hand. Zo klein als een schelp op het strand!', a2: 'Klein is het, zo lang als je vinger maar. In je broekzak past het, zo klaar!' },
        { id: 'glimt', keys: ['glimt', 'glimmen', 'glimmend', 'glanst', 'blinkt', 'glinstert', 'schijnt', 'licht het op', 'mooi'],
          a: 'Ja, het glimt, dat klopt precies! Het blinkt nog meer dan een glaasje fris.', a2: 'Het glinstert en het glanst, zo fijn. Net als de sterren in de maneschijn!' },
        { id: 'zwaar', keys: ['zwaar', 'licht', 'hoe zwaar', 'weegt'],
          a: 'Zwaar? Nee hoor, je tilt het zo op. Met één vinger zelfs, hop hop hop!', a2: 'Het is niet zwaar, het is licht en klein. In je zak zal het nooit te zwaar zijn!' },
        { id: 'materiaal', keys: ['metaal', 'ijzer', 'hout', 'houten', 'plastic', 'papier', 'stof', 'steen', 'glas', 'waar is het van', 'waarvan gemaakt', 'hard', 'zacht'],
          a: 'Het is van metaal, hard en koud. Niet van hout, maar kleurig als goud!', a2: 'Zacht? Nee hoor, het is hard als een spijker. Van metaal, dat maakt het alleen maar rijker!' },
        { id: 'vorm', keys: ['rond', 'vierkant', 'vorm', 'bolletje', 'plat', 'puntig', 'recht', 'gaatje', 'ringetje', 'ring', 'tandjes'],
          a: 'Rond? Een stukje wel, met een gaatje erin. De rest is lang en recht, dat is zijn zin!', a2: 'Bovenaan een rondje, onderaan wat tandjes. Het past heel fijn in kleine handjes!' },
        { id: 'oud', keys: ['oud', 'nieuw', 'hoe oud'],
          a: 'Het is heel oud, wel honderd jaar! Maar het glimt nog steeds, echt waar.', a2: 'Nieuw? Nee hoor, het is al heel oud. Maar nog steeds zo mooi, als glimmend goud!' },
        { id: 'geluid', keys: ['geluid', 'lawaai', 'maakt het geluid', 'piept', 'rinkelt', 'klinkt', 'muziek', 'zingt', 'praat'],
          a: 'Geluid? Het zegt alleen heel zacht: klik! Als je het omdraait, in één tik.', a2: 'Het zingt niet en het praat niet, zoals ik. Maar soms hoor je rinkel, of een klik!' },
        { id: 'vliegen', keys: ['vliegen', 'vliegt', 'zwemmen', 'zwemt', 'lopen', 'loopt', 'rijdt', 'beweegt', 'rollen', 'rolt'],
          a: 'Vliegen? Nee, dat kan het niet, niet één keer. Dat doe ik wel, kijk maar, ik fladder heen en weer!', a2: 'Het loopt niet, het zwemt niet, het ligt maar stil. Het doet alleen iets als jij het wil!' },
        { id: 'speelgoed', keys: ['speelgoed', 'spelen', 'speel', 'bal', 'knuffel', 'auto', 'lego', 'pop', 'robot', 'blokje'],
          a: 'Speelgoed? Nee, dat is het niet. Maar het is wel heel belangrijk, zoals je ziet!', a2: 'Je speelt er niet mee, het is geen bal. Maar je hebt het nodig, bij de deur en de stal!' },
        { id: 'gebruik', keys: ['wat kun je ermee', 'wat doe je ermee', 'waarvoor', 'waar is het voor', 'gebruiken', 'wat doet het', 'openmaken', 'open', 'dicht',
            'sluiten', 'dichtdoen', 'op slot', 'slot', 'deur', 'kist', 'schatkist', 'draaien', 'omdraaien'],
          a: 'Daarmee maak je iets open, klik! Een deur of een kist, in één tik.', a2: 'Zit er iets op slot, heel stevig dicht? Dan helpt dit ding, dan gaat het licht!' },
        { id: 'waar', keys: ['waar vind je', 'waar komt', 'waar heb je', 'gevonden', 'waar ligt', 'in huis', 'bos', 'buiten'],
          a: 'Ik vond het in het bos, heel stil en klein. Mensen hebben er vaak een paar, aan een ring, dat is fijn!', a2: 'Bij de voordeur, of in een la, daar vind je dit ding vaak, ja ja!' },
        { id: 'plaatje', keys: ['ster', 'sterretje', 'staat er iets op', 'plaatje', 'tekening', 'versiering', 'teken'],
          a: 'Ja, er staat een ster op, klein en fijn. Die zal vast heel belangrijk zijn!', a2: 'Er staat een sterretje op, zo leuk. Net als een sticker in je boek!' },
        { id: 'vanjou', keys: ['van jou', 'is het van jou', 'van wie', 'gekregen', 'gestolen', 'gepikt', 'cadeau'],
          a: 'Van mij? Ik pas er alleen op, heel trouw. En straks, wie weet, is het van jou!', a2: 'Het is niet van mij, ik bewaar het maar. Voor een echte held, en die is nu daar!' },
        { id: 'watals-water', keys: ['water', 'ven', 'gooi', 'gooien', 'zinkt', 'drijft', 'nat'],
          a: 'In het ven gooien? Plons, weg is het, oh nee! Het zinkt naar de bodem, het drijft niet mee.', a2: 'Nat worden vindt het niet erg, dat is waar. Maar het zinkt als een steen, dus pas op, daar!' },
        { id: 'watals-kwijt', keys: ['kwijt', 'kwijtraak', 'kwijtraakt', 'verlies', 'verliezen', 'verloren'],
          a: 'Wat als je het kwijtraakt? Oei, wat een pech! Dan blijft er iets dicht, en de pret is weg!', a2: 'Kwijt? Dan krijg je die deur niet meer open. Dus hou het goed vast, en blijf maar hopen!' },
        { id: 'aantal', keys: ['hoeveel', 'meer dan een', 'twee', 'veel'],
          a: 'Hoeveel? Maar één, één klein ding maar. Alleen in mijn zak, daar ligt het klaar!', a2: 'Het is er één, niet twee, niet drie. Eentje maar, zie je, zie je, zie!' }
      ],
      // Alleen echte woorden die spraakherkenning geeft. Geen 'sluitel': dat ligt 1 letter van 'sluiten'.
      secretKeys: ['sleutel', 'sleuteltje', 'sleutels', 'sleuteltjes', 'sleutelbos'],
      win: 'Ja, ja, ja, jij raadt het goed! Wat ben jij slim, dat doe je heel goed!',
      wrongGuess: 'Nee, dat is het niet, maar goed geprobeerd! Stel nog een vraag, dan kom je er, gegarandeerd!',
      wrongGuess2: 'Hmm, nee, dat zit er niet in, hoor. Vraag nog iets, dan kom je er, ga maar door!',
      guessKeys: {
        munt: ['munt', 'muntje', 'geld', 'euro', 'centje', 'schat'],
        koekje: ['koekje', 'koek', 'snoep', 'snoepje', 'chocola', 'chocolade'],
        kikker: ['kikker', 'kikkertje', 'kwak']
      },
      hints: [
        'Het is klein en het glimt als goud. Het past in je hand, en het is best oud!',
        'Het is van metaal, met een ster erop. Je stopt het in een gaatje en dan draai je, hop!',
        'Zit een deur of een kist op slot, heel stevig dicht? Dan heb je dit nodig, klik, open en licht!'
      ]
    },
    { t: 'say', who: 'kwebbel', text: 'Goed geraden, jij komt ver! Het is van goud, met een ster!', mood: 'lacht', sfx: 'ster' },
    { t: 'say', who: 'olivier', text: 'Een gouden sleuteltje! Waar is dat voor?', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Bewaar het goed, het is voor later. Net als een zwembandje voor het water!', mood: 'blij' },

    // --- Belletje lellen ---
    { t: 'scene', bg: 'hut', chars: ['olivier', 'florine', 'kwebbel'] },
    { t: 'say', who: 'verteller', text: '{HELD} klimt weer naar beneden. Kwebbel fladdert mee naar de hut.', sfx: 'whoosh' },
    { t: 'say', who: 'verteller', text: 'Tring, tring! Iemand belt aan bij de hut!', sfx: 'bel' },
    { t: 'say', who: 'florine', text: 'Wie is daar? Is het de pizza?', mood: 'verbaasd' },
    { t: 'say', who: 'verteller', text: '{HELD} kijkt naar buiten, maar er is niemand. Alleen voetafdrukken in het zand!' },
    { t: 'say', who: 'kwebbel', text: 'Belletje lellen, wat een grap! Wie het was, zie je aan de stap.', mood: 'denkt' },
    {
      t: 'game', game: 'pick', skill: 'logica',
      intro: 'Kijk goed naar de afdrukken in het zand. Wie heeft er aangebeld?',
      success: 'Goed gespeurd! Kleine handjes, dat is geen vogel en geen hond.',
      hint: 'Een vogel heeft dunne streepjes. Een hond heeft ronde kussentjes.',
      params: {
        1: {
          q: 'De afdruk heeft kleine vingertjes. Welke is het?',
          options: [
            { pic: '🖐️', label: 'handjes', correct: true },
            { pic: '🐾', label: 'hond', correct: false },
            { pic: '👢', label: 'laars', correct: false }
          ]
        },
        2: {
          q: 'De afdruk is klein en heeft vingertjes. Welke is het?',
          options: [
            { pic: '🖐️', label: 'handjes', correct: true },
            { pic: '🐾', label: 'hond', correct: false },
            { pic: '🐦', label: 'vogel', correct: false },
            { pic: '👢', label: 'laars', correct: false }
          ]
        },
        3: {
          q: 'De afdruk is klein en heeft vingertjes. Het is geen voet. Welke is het?',
          options: [
            { pic: '🖐️', label: 'handjes', correct: true },
            { pic: '👣', label: 'voeten', correct: false },
            { pic: '🐾', label: 'hond', correct: false },
            { pic: '🐦', label: 'vogel', correct: false },
            { pic: '👢', label: 'laars', correct: false }
          ]
        }
      }
    },
    { t: 'say', who: 'verteller', text: 'Ritsel, ritsel, in de struiken zwiept een staart. Een staart met strepen!', sfx: 'whoosh' },
    { t: 'say', who: 'florine', text: 'Een zebra! Een hele kleine zebra!', mood: 'lacht' },
    { t: 'say', who: 'olivier', text: 'Hmm, dat is geen zebra. Maar wie was het dan?', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Een staart met strepen, zwart en grijs. Dat raadsel lossen we later op, heel wijs!', mood: 'denkt' },

    // --- De kaart met het toverwoord ---
    { t: 'say', who: 'kwebbel', text: 'Nu de kaart, maar let goed op. Hij gaat alleen open met een toverwoord erop!', mood: 'blij' },
    { t: 'say', who: 'florine', text: 'Met het sleuteltje?', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Nee, dat sleuteltje is voor later. Deze kaart luistert alleen naar woorden!', mood: 'lacht' },
    { t: 'say', who: 'kwebbel', text: 'Het woord is de plek waar wij nu zijn. Vol bomen, groot en klein!', mood: 'denkt' },
    {
      t: 'game', game: 'word', skill: 'woorden',
      intro: 'Luister goed naar de klanken. Welk woord is het toverwoord?',
      success: 'Bos! Het toverwoord klopt. De kaart gaat open!',
      hint: 'Zeg de klanken langzaam na. Plak ze dan aan elkaar.',
      params: {
        1: {
          mode: 'listen', word: 'bos', pic: '🌲',
          options: [
            { w: 'bos', pic: '🌲' },
            { w: 'vos', pic: '🦊' },
            { w: 'bal', pic: '⚽' }
          ]
        },
        2: {
          mode: 'build', word: 'bos', pic: '🌲',
          options: [
            { w: 'vos', pic: '🦊' },
            { w: 'sok', pic: '🧦' },
            { w: 'bal', pic: '⚽' }
          ]
        },
        3: {
          mode: 'missing', word: 'bos', pic: '🌲',
          options: [
            { w: 'bes', pic: '🫐' },
            { w: 'vos', pic: '🦊' },
            { w: 'bus', pic: '🚌' },
            { w: 'sok', pic: '🧦' }
          ]
        }
      }
    },

    // --- De kaart: het Sterrenkompas is weg ---
    { t: 'say', who: 'verteller', text: 'De kaart rolt open. Er staat heel Oisterwijk op, met bossen en vennen.', sfx: 'ster' },
    { t: 'say', who: 'verteller', text: 'In het midden is een lege plek. Daar hoort het Sterrenkompas.' },
    { t: 'say', who: 'kwebbel', text: 'Het Sterrenkompas wijst de weg naar huis. Voor elke sok, elk dier en elke muis!', mood: 'denkt' },
    { t: 'say', who: 'kwebbel', text: 'Maar het is weg, dat is een ramp. Nu raakt alles kwijt, van knuffel tot lamp!', mood: 'verbaasd' },
    { t: 'say', who: 'florine', text: 'Mijn knuffel mag niet kwijt! Die heet Konijn.', mood: 'verbaasd' },
    { t: 'say', who: 'olivier', text: 'Wij gaan het Sterrenkompas zoeken. Toch, Kwebbel?', mood: 'blij' },
    { t: 'say', who: 'kwebbel', text: 'Ja, samen zoeken, dat is pas een feest. Jij bent een held met een slimme geest!', mood: 'lacht' },

    // --- Beloning ---
    { t: 'reward', stars: 3, sticker: '🗺️', text: 'Super, {HELD}! Je bouwde een hut, klom in de boom en opende de toverkaart.' },

    // --- Cliffhanger ---
    { t: 'say', who: 'verteller', text: 'Opeens trilt de grond. Boem, boem!', sfx: 'dreun' },
    { t: 'say', who: 'florine', text: 'Is dat mijn buik? Ik heb honger.', mood: 'verbaasd' },
    { t: 'cliff', text: 'Naast de hut staat opeens een reuzenschoen. Zo groot als een auto! Wordt vervolgd…' }
  ]
};
