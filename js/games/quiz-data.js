/** BuzzFeed-parody quiz: questions + pope personality results */
export const QUIZ_META = {
  title: "Which Pope Are You?",
  subtitle: "A completely scientific 12-question diagnosis from PopeCount Labs™",
  disclaimer: "Not affiliated with the Holy See, BuzzFeed, or science.",
};

export const RESULTS = {
  francis: {
    id: "francis",
    name: "Pope Francis",
    popeNumber: 266,
    directoryQuery: "Francis",
    wikiTitle: "Pope Francis",
    tagline: "You're the pope who texts the group chat \"thoughts?\"",
    blurb:
      "You'd rather hug the problem than tweet about it. Your toxic trait is mercy. You own one nice pair of shoes and morally oppose the other 40. People underestimate you; then you reorganize the entire curia between lunch and a nap.",
    share: "I'm Pope Francis according to PopeCount and I will not be taking questions at this time. 🕊️",
  },
  benedict: {
    id: "benedict",
    name: "Pope Benedict XVI",
    popeNumber: 265,
    directoryQuery: "Benedict XVI",
    wikiTitle: "Pope Benedict XVI",
    tagline: "You're the pope with 400 tabs open — all in Latin",
    blurb:
      "Introvert royalty. You'd rather write a book than go viral. Red shoes were a lifestyle. You retire when everyone else is still posting LinkedIn hustle culture. Your brain is a cathedral and your small talk is a footnote.",
    share: "I'm Pope Benedict XVI on the PopeCount quiz — intellectual, shy, red shoes. 📚",
  },
  jpi: {
    id: "jpi",
    name: "Pope John Paul II",
    popeNumber: 264,
    directoryQuery: "John Paul II",
    wikiTitle: "Pope John Paul II",
    tagline: "You're the pope who does parkour in your soul",
    blurb:
      "Main character energy. You ski, you travel, you kiss the tarmac like it's your brand deal. You believe in youth and also in extremely long flights. If life were a movie you'd be the training montage AND the speech at the end.",
    share: "PopeCount says I'm John Paul II and honestly the charisma tracks. ⛷️",
  },
  leo: {
    id: "leo",
    name: "Pope Leo XIV",
    popeNumber: 267,
    directoryQuery: "Leo XIV",
    wikiTitle: "Pope Leo XIV",
    tagline: "You're the pope who just walked in with fresh spreadsheets",
    blurb:
      "New hire energy but make it apostolic. You're here to unify the group chat after three years of reply-all drama. Chicago roots, Vatican dreams. Your motto is basically \"can't we all get along in this one holy and apostolic Slack?\"",
    share: "I'm Pope Leo XIV according to PopeCount — new pope, unity era, let's go. ♛",
  },
  pius: {
    id: "pius",
    name: "Pope Pius IX",
    popeNumber: 255,
    directoryQuery: "Pius IX",
    wikiTitle: "Pope Pius IX",
    tagline: "You're the pope who will die on this hill (for decades)",
    blurb:
      "You have opinions and they are stored in a vault. Longest reign energy: you're still arguing about the same thread from 1870. Stubborn? No — \"theologically consistent.\" You would absolutely bring a lawn chair to a debate.",
    share: "I'm Pope Pius IX on PopeCount — stubborn legend, long reign, no notes. 🏛️",
  },
  celestine: {
    id: "celestine",
    name: "Pope Celestine V",
    popeNumber: 193,
    directoryQuery: "Celestine V",
    wikiTitle: "Pope Celestine V",
    tagline: "You're the pope who peaces out when it's not your vibe",
    blurb:
      "You said yes to the job then read the job description. Respect for boundaries icon. You're not flaky — you're \"called to a different ministry (my couch).\" History will call it controversial; you'll call it self-care.",
    share: "PopeCount crowned me Celestine V — I would simply resign. ✌️",
  },
  alexander: {
    id: "alexander",
    name: "Pope Alexander VI",
    popeNumber: 214,
    directoryQuery: "Alexander VI",
    wikiTitle: "Pope Alexander VI",
    tagline: "You're the pope your group chat pretends not to know",
    blurb:
      "Chaotic neutral with a family group chat that could be a HBO show. You throw parties, you make headlines, you are NEVER boring at Thanksgiving. Ethics are a spectrum and your spectrum has fireworks. (This quiz is a parody. Calm down.)",
    share: "I'm Alexander VI on PopeCount and my PR team is sweating. 🍷",
  },
  stephen: {
    id: "stephen",
    name: "Pope-elect Stephen (II)",
    popeNumber: null,
    directoryQuery: "Stephen II",
    wikiTitle: "Pope-elect Stephen",
    tagline: "You're the pope Wikipedia can't agree exists",
    blurb:
      "Schrodinger's pontiff. You were elected, you were maybe not counted, you are a footnote with main character energy. You show up to the party listed as \"+1 guest.\" The Stephen II debate is your entire personality and honestly? Valid.",
    share: "I'm Pope-elect Stephen II on PopeCount — count me or don't. Wikipedia isn't sure. ＋１",
  },
};

export const QUESTIONS = [
  {
    id: "friday",
    text: "It's Friday night. You are:",
    options: [
      { label: "Feeding strangers and judging my shoe collection", scores: { francis: 3, leo: 1 } },
      { label: "Reading in silence. Loud silence.", scores: { benedict: 3, pius: 1 } },
      { label: "At a concert. I might crowd-surf spiritually.", scores: { jpi: 3, francis: 1 } },
      { label: "Hosting. The drama is the entertainment.", scores: { alexander: 3, stephen: 1 } },
    ],
  },
  {
    id: "hat",
    text: "Pick a hat:",
    options: [
      { label: "Simple zucchetto. Humble king.", scores: { francis: 3, celestine: 1 } },
      { label: "The tall one. Respect the silhouette.", scores: { benedict: 2, pius: 2 } },
      { label: "Whatever looks good wind-sailing", scores: { jpi: 3 } },
      { label: "Two hats. One might not count.", scores: { stephen: 3, alexander: 1 } },
    ],
  },
  {
    id: "groupchat",
    text: "Your role in the group chat is:",
    options: [
      { label: "\"Everyone breathe\" + prayer hands emoji", scores: { francis: 2, leo: 2 } },
      { label: "Long thoughtful voice notes nobody finishes", scores: { benedict: 3, pius: 1 } },
      { label: "GIFs and hype for everyone's birthday", scores: { jpi: 3, francis: 1 } },
      { label: "Left the group. It's called boundaries.", scores: { celestine: 3, stephen: 1 } },
    ],
  },
  {
    id: "snack",
    text: "Vatican break room snack:",
    options: [
      { label: "Leftover pasta someone blessed", scores: { francis: 2, jpi: 1, leo: 1 } },
      { label: "Tea. Only tea. Judging you for coffee.", scores: { benedict: 3 } },
      { label: "Energy bar before kayaking", scores: { jpi: 3 } },
      { label: "Wine. It's for a documentary.", scores: { alexander: 3 } },
    ],
  },
  {
    id: "argument",
    text: "How do you settle an argument?",
    options: [
      { label: "Mercy first, receipts later", scores: { francis: 3, leo: 1 } },
      { label: "A 40-page PDF with citations", scores: { benedict: 3, pius: 1 } },
      { label: "Outdoor speech. Mic optional.", scores: { jpi: 3 } },
      { label: "I don't. I outlast everyone.", scores: { pius: 3, stephen: 1 } },
    ],
  },
  {
    id: "toxic",
    text: "Your toxic trait (papal edition):",
    options: [
      { label: "Caring too much at 11pm", scores: { francis: 3, leo: 1 } },
      { label: "Correcting people's Latin pronunciation", scores: { benedict: 3 } },
      { label: "Making everything a comeback story", scores: { jpi: 3 } },
      { label: "Nepotism but make it family dinner", scores: { alexander: 3 } },
    ],
  },
  {
    id: "ride",
    text: "Pick a ride to the basilica:",
    options: [
      { label: "Bus. Sit with the people.", scores: { francis: 3 } },
      { label: "Walking. Slowly. Thinking.", scores: { benedict: 2, celestine: 2 } },
      { label: "Popemobile with the top down", scores: { jpi: 3 } },
      { label: "I ordered an Uber XL for the whole curia", scores: { leo: 2, alexander: 2 } },
    ],
  },
  {
    id: "email",
    text: "Your email sign-off:",
    options: [
      { label: "Sent with love and mild concern", scores: { francis: 3, leo: 1 } },
      { label: "In caritate Christi (and I mean it)", scores: { benedict: 3 } },
      { label: "Be not afraid!!! (three exclamation marks)", scores: { jpi: 3 } },
      { label: "Per my last bull — please read", scores: { pius: 3, stephen: 1 } },
    ],
  },
  {
    id: "popeName",
    text: "If you had to pick a regnal name today:",
    options: [
      { label: "Something humble that makes cardinals nervous", scores: { francis: 3, celestine: 1 } },
      { label: "A classic. Very numbered.", scores: { benedict: 2, pius: 2 } },
      { label: "The most athletic-sounding saint", scores: { jpi: 3 } },
      { label: "Leo. Because lions are branding.", scores: { leo: 3 } },
    ],
  },
  {
    id: "wifi",
    text: "WiFi is down during a conclave:",
    options: [
      { label: "We talk. Like humans. Terrifying.", scores: { francis: 2, leo: 2 } },
      { label: "I have books. Many books.", scores: { benedict: 3 } },
      { label: "I fix the router AND inspire a nation", scores: { jpi: 3 } },
      { label: "I quit. This isn't what I signed up for.", scores: { celestine: 3 } },
    ],
  },
  {
    id: "miracle",
    text: "Pick a miracle:",
    options: [
      { label: "Healing through listening", scores: { francis: 3, leo: 1 } },
      { label: "Turning confusion into a footnote", scores: { benedict: 2, stephen: 3 } },
      { label: "Surviving 1981 and still doing tours", scores: { jpi: 3 } },
      { label: "Making a party Vatican-compliant", scores: { alexander: 3 } },
    ],
  },
  {
    id: "vacation",
    text: "Your Roman vacation must-include:",
    options: [
      { label: "Secret gelato with nonna energy", scores: { francis: 2, jpi: 1, leo: 1 } },
      { label: "Library. No photos.", scores: { benedict: 3 } },
      { label: "Stadium. Chanting optional.", scores: { jpi: 3 } },
      { label: "Leaving early. Iconic.", scores: { celestine: 3, stephen: 1 } },
    ],
  },
];
