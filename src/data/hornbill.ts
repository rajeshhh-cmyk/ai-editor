// All property facts, on-screen copy and VO timing live here. A Version B/C is
// a new object of this shape — the motion system does not change.
//
// Copy markup: [word] renders in the accent (gold) colour, \n breaks lines.

export type Unit = {
  config: string;
  areaSqFt: number;
  areaFootnote: string;
  price: { prefix: string; value: number; decimals: number; suffix: string };
  plan: "plan2Bhk" | "plan25Bhk";
};

export type SceneId =
  | "hook"
  | "buildingReveal"
  | "location"
  | "township"
  | "completeCity"
  | "walkthrough"
  | "homeOffice"
  | "priceReveal"
  | "allInclusive"
  | "phaseOne"
  | "endCard";

export const hornbill = {
  property: {
    name: "Hornbill Heights",
    township: "Magarpatta Riverview City",
    developer: "Magarpatta City Group",
    location: "Pune–Solapur Highway",
    nearby: "Manali Resort",
    locality: "Loni Kalbhor, Pune",
    townshipAcres: 500,
    configurations: "2 & 2.5 BHK",
    amenities: "20+",
    units: [
      {
        config: "2 BHK",
        areaSqFt: 900,
        areaFootnote: "*Total carpet area incl. balcony: 898.26 sq ft (83.45 sq m)",
        price: { prefix: "₹", value: 81.15, decimals: 2, suffix: " L*" },
        plan: "plan2Bhk",
      },
      {
        config: "2.5 BHK",
        areaSqFt: 1100,
        areaFootnote: "*Total carpet area incl. balcony: 1,096.96 sq ft (101.91 sq m)",
        price: { prefix: "₹", value: 1.02, decimals: 2, suffix: " Cr*" },
        plan: "plan25Bhk",
      },
    ] satisfies Unit[],
    rera: "P52100053795",
    possession: "DEC 2027",
  },

  copy: {
    hook: { cities: ["MAGARPATTA CITY", "NANDED CITY"], next: "NEXT[?]" },
    buildingReveal: {
      kicker: "MAGARPATTA GROUP की",
      big: "[तीसरी]",
      big2: "TOWNSHIP",
      budget: "आपके [BUDGET] में",
    },
    location: {
      intro: "ये है",
      name1: "MAGARPATTA",
      name2: "[RIVERVIEW] CITY",
      highway: "PUNE–SOLAPUR\n[HIGHWAY]",
      near: "NEAR MANALI RESORT",
      mapLabels: { pune: "PUNE", magarpatta: "MAGARPATTA CITY", dest: "RIVERVIEW CITY", destSub: "HORNBILL HEIGHTS", resort: "MANALI RESORT", road: "PUNE–SOLAPUR HWY" },
    },
    township: {
      acres: "ACRES",
      integrated: "INTEGRATED\n[TOWNSHIP]",
      highwayTouch: "HIGHWAY TOUCH",
      amenities: [
        { kind: "school", label: "SCHOOL", cue: "school" },
        { kind: "hospital", label: "HOSPITAL", cue: "hospital" },
        { kind: "office", label: "IT OFFICES", cue: "itOffices" },
        { kind: "mall", label: "MALL", cue: "mall" },
        { kind: "bank", label: "BANK", cue: "bank" },
        { kind: "police", label: "POLICE", cue: "police" },
        { kind: "fire", label: "FIRE STATION", cue: "fireStation" },
      ],
      inside: "सब TOWNSHIP\nके [अंदर]",
    },
    completeCity: { line1: "A COMPLETE\nCITY", line2: "INSIDE\n[ONE GATE]", hindi: "एक पूरा शहर, एक गेट के अंदर" },
    walkthrough: {
      intro: "यहाँ के",
      carpet: "SQ FT CARPET*",
      rare1: "इस [BUDGET] में",
      rare2: "इतना\n[CARPET]",
      rare3: "बहुत कम मिलता है",
    },
    homeOffice: { line1: "EXTRA\n[HALF] ROOM", equals: "=", line2: "[HOME OFFICE]", hindi: "मतलब आपका" },
    priceReveal: { ask: "PRICE[?]", onwards: "ONWARDS" },
    allInclusive: {
      stamp: "ALL INCLUSIVE",
      oneTime: "ONE-TIME",
      lifetime: "LIFETIME\n[MAINTENANCE]",
      amenities: "AMENITIES",
      monthly: "हर महीने\nMAINTENANCE",
      hassle: "भरने का झंझट",
      over: "[ख़त्म!]",
    },
    phaseOne: { phase: "PHASE I", towers: "TOWERS", soldOut: "SOLD OUT" },
    endCard: {
      phase: "PHASE [II]",
      open: "BOOKINGS OPEN",
      urgency: "घर अभी पक्का कीजिए",
      button: "GET QUOTE",
      button2: "BOOK FREE SITE VISIT",
      hint: "TAP BELOW · FILL THE FORM",
      possessionLabel: "RERA POSSESSION",
      tnc: "T&C APPLY",
      disclaimer: "Images are artistic impressions. Prices are all inclusive, starting, subject to change.",
    },
  },

  audio: { vo: "assets/audio/vo.mp3", voVolume: 1, musicVolume: 0.12 },

  // VO cues in absolute seconds (word-aligned from the supplied voiceover).
  // Re-time the ad for a new VO by editing these numbers only.
  cues: {
    magarpatta: 0.24,
    nanded: 2.0,
    next: 2.95,
    ab: 3.58,
    teesri: 4.96,
    townshipWord: 5.4,
    budget: 6.2,
    yehHai: 7.56,
    riverview: 8.16,
    pune: 9.98,
    highway: 10.86,
    manali: 11.66,
    acres: 13.36,
    integrated: 14.56,
    highwayTouch: 16.02,
    school: 17.18,
    hospital: 17.78,
    itOffices: 18.66,
    mall: 19.72,
    bank: 20.32,
    police: 21.22,
    fireStation: 21.52,
    sabAndar: 22.62,
    puraShehar: 24.1,
    ekGate: 25.44,
    yahan: 26.8,
    hornbill: 27.34,
    bhk2: 28.52,
    sqft900: 29.4,
    bhk25: 31.16,
    sqft1100: 32.7,
    isBudget: 34.0,
    itnaCarpet: 34.98,
    bahutKam: 36.26,
    extraHalf: 37.34,
    homeOffice: 38.96,
    price: 40.46,
    price2Bhk: 41.44,
    price2BhkValue: 42.58,
    price25Bhk: 44.44,
    price25BhkValue: 45.94,
    allInclusive: 47.88,
    oneTime: 49.0,
    lifetime: 49.64,
    monthly: 51.36,
    jhanjhat: 53.6,
    khatam: 54.0,
    phaseOne: 54.92,
    towers: 56.14,
    soldOut: 57.16,
    phaseTwo: 58.6,
    pakka: 59.8,
    getQuote: 61.12,
    click: 62.28,
    form: 63.16,
    siteVisit: 64.52,
    voEnd: 66.43,
  },

  // Scene windows [start, end) in seconds, cut on VO phrase boundaries.
  scenes: {
    hook: [0, 3.5],
    buildingReveal: [3.5, 7.4],
    location: [7.4, 13.2],
    township: [13.2, 24.0],
    completeCity: [24.0, 26.6],
    walkthrough: [26.6, 37.2],
    homeOffice: [37.2, 40.3],
    priceReveal: [40.3, 47.7],
    allInclusive: [47.7, 54.7],
    phaseOne: [54.7, 58.4],
    endCard: [58.4, 68.0],
  } satisfies Record<SceneId, [number, number]>,
};

export type AdData = typeof hornbill;
export type CueName = keyof AdData["cues"];

export const totalSeconds = (data: AdData) =>
  Math.max(...Object.values(data.scenes).map(([, end]) => end));
