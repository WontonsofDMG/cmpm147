const fillers = {
    pre: ["Fra", "Tro", "Gre", "Pan", "Ast", "Ara", "Snor", "Yeet", "Borb", "Zib","San","Fre","Santa"],
    post: ["gria", "ston", "gott", "-on-the-lee", "ora", "Ara", "uwu", "opolis", "burg", "vania","-Jose","mont","-Cruz"],
    people: ["kindly", "meek", "brave", "honored", "forgotten", "mystic", "orca", "slightly damp", "extremely loud", "sentient", "confused"],
    item: ["axe™", "staff™", "book™", "cloak™", "shield™", "club™", "sword™", "magic gloves™", "enchanted potato™", "USB of destiny™", "spork of truth™", "ham and cheese Sand-Witch™"],
    photoDesc: [
      "a majestic duck in a hat",
      "a blurry selfie taken mid-sneeze",
      "a cursed AI-generated image of Shrek in a tux",
      "a potato with sunglasses",
      "a glamour shot of my keyboard",
      "my router eating cat",
      "just vibes",
      "a renaissance painting of a cheeseburger",
      "a tacobell addict",
      "a shower selfie taken with my submerged toaster",
      "a potato",
      "a ham and cheese Sand-Witch™"
    ],
    mine: [
      "s"
      ],
    introLine: [
      "Hail, I come from $pre$post where the $people folk raised me with $photoDesc and unstable Wi-Fi.",
      "Greetings! I was born under a full moon in $pre$post and trained in $item combat and interpretive dance.",
      "Hello. I was banished from $pre$post for asking too many tech support questions, I now roam the digital plains of $pre$post.",
      "Behold! A survivor of $pre$post, where the $people live by the code of the sacred $item.",
      "Hey! They call me the $item whisperer of $pre$post. Don’t ask why. It involves soup.",
      "Sup. I once ruled over $pre$post, but was overthrown by a council of $people $techTitle $techClass$mine powered by $people memes.",
    ],
    techTitle: [
      "Bluetooth",
      "Excel",
      "HTML",
      "Wi-Fi",
      "spaghetti code",
      "runtime",
      "JavaScript",
      "tech support",
      "email",
      "404",
      "AI",
      "Zoom",
      "DNS",
      "Cloud",
      "RAM",
      "debug",
      "RGB",
      "deep-fried",
      "crypto",
      "LAN party",
      "ChatGPT",
      "Deepseek",
      "Python",
      "Cobol"
    ],
    techClass: [
      "barbarian",
      "necromancer",
      "warlock",
      "shaman",
      "cleric",
      "gremlin",
      "demon",
      "bard",
      "paladin",
      "monk",
      "whisperer",
      "wizard",
      "druid",
      "cultist",
      "rogue",
      "sage",
      "berserker",
      "janitor",
      "hacker",
      "alchemist",
      "idiot",
      "jester",
      "ham sandwich"
    ]
  };
  
  const template = `
  $introLine
  
  As for my level of tech experience, I am a $techTitle $techClass and a $techTitle $techClass.
  
  Here is a photo of me: $photoDesc
  `;
  
  
  // STUDENTS: You don't need to edit code below this line.
  
  const slotPattern = /\$(\w+)/;
  
  function replacer(match, name) {
    let options = fillers[name];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    } else {
      return `<UNKNOWN:${name}>`;
    }
  }
  
  function generate() {
    let story = template;
    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, replacer);
    }
  
    /* global box */
    box.innerText = story;
  }
  
  /* global clicker */
  clicker.onclick = generate;
  
  generate();
  