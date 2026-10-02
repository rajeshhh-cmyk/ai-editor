/**
 * Keyword-anchored timeline. Every boundary is derived from the word
 * timestamps in public/captions.json, so re-transcribing (or a new voiceover
 * with the same script) retimes the whole video automatically.
 */
import type { Caption } from "@remotion/captions";
import captionsJson from "../public/captions.json";

export const FPS = 30;
/** Used until calculateMetadata reads the real video length. */
export const FALLBACK_DURATION = 1843;

export const CAPTIONS = captionsJson as Caption[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9&]/g, "");

/** Start frame of the nth (1-based) occurrence of `text` (one or more words). */
export const word = (text: string, nth = 1): number => {
  const parts = text.split(/\s+/).map(norm);
  let seen = 0;
  for (let i = 0; i <= CAPTIONS.length - parts.length; i++) {
    if (parts.every((p, j) => norm(CAPTIONS[i + j].text) === p)) {
      seen++;
      if (seen === nth) return Math.round((CAPTIONS[i].startMs / 1000) * FPS);
    }
  }
  throw new Error(`Cue "${text}" (#${nth}) not found in captions.json`);
};

/** End frame of the nth occurrence of a single word. */
export const wordEnd = (text: string, nth = 1): number => {
  const target = norm(text);
  let seen = 0;
  for (const c of CAPTIONS) {
    if (norm(c.text) === target && ++seen === nth) return Math.round((c.endMs / 1000) * FPS);
  }
  throw new Error(`Cue "${text}" (#${nth}) not found in captions.json`);
};

// ── Word cues (absolute frames) ───────────────────────────────────────
export const CUES = {
  // 1 Hook
  imAnAi: word("I'm an AI"),
  ai: word("AI"),
  grow: word("grow"),
  leads: word("leads"),
  autopilot: word("autopilot"),
  // 2 Problem
  heres: word("Here's"),
  problem: word("problem"),
  most: word("Most"),
  post: word("post"),
  likes: word("likes"),
  sales: word("sales"),
  nobody: word("nobody"),
  andItGets: word("and it gets"),
  lost: word("lost"),
  somewhere: word("somewhere"),
  // 3 Brand
  thats: word("That's exactly"),
  white: word("White"),
  fixes: word("fixes"),
  fixesEnd: wordEnd("fixes"),
  // 4 Content
  first: word("First"),
  contentEnd: wordEnd("content", 1),
  we1: word("We plan"),
  plan: word("plan"),
  create: word("create"),
  post2: word("post", 2),
  notJustViews: word("Not just views"),
  but: word("but"),
  theRightPeople: word("the right people"),
  // 5 Leads
  second: word("Second"),
  generationEnd: wordEnd("generation"),
  weRun: word("We run"),
  withAi: word("with AI that"),
  replies: word("replies", 2),
  instantly: word("instantly"),
  qualifies: word("qualifies"),
  booksCalls: word("books calls"),
  // 6 CRM
  third: word("Third"),
  crmEnd: wordEnd("CRM"),
  every: word("Every lead"),
  onePlace: word("one place"),
  followUps: word("Follow-ups"),
  readyToBuy: word("ready to buy"),
  andRepetitive: word("and repetitive"),
  runsOnItsOwn: word("runs on its own"),
  // 7 Summary
  content3: word("Content that attracts", 2),
  systems: word("Systems"),
  automation2: word("Automation that scales"),
  workingTogether: word("working together"),
  twentyFourSeven: word("24x7"),
  // 8 CTA
  ifAnAi: word("If an AI"),
  thisNaturally: word("this naturally"),
  comment: word("Comment", 2),
  grow2: word("GROW", 2),
} as const;

// ── Scenes ────────────────────────────────────────────────────────────
export const SCENES = {
  hook: { from: 0, to: CUES.heres - 4 },
  problem: { from: CUES.heres - 4, to: CUES.thats },
  brand: { from: CUES.thats, to: CUES.first - 2 },
  content: { from: CUES.first - 2, to: CUES.second - 4 },
  leads: { from: CUES.second - 4, to: CUES.third - 4 },
  crm: { from: CUES.third - 4, to: CUES.content3 - 4 },
  summary: { from: CUES.content3 - 4, to: CUES.ifAnAi - 6 },
  /** `to` is replaced by the real duration. */
  cta: { from: CUES.ifAnAi - 6, to: FALLBACK_DURATION },
} as const;

export type SceneKey = keyof typeof SCENES;
export const local = (scene: SceneKey, cue: number) => cue - SCENES[scene].from;

// ── Avatar layout modes ───────────────────────────────────────────────
export type Mode = "full" | "top" | "hidden";

/**
 * Mode switches, in order. Hidden (graphics-only) segments:
 *  1 "Here's the problem."                 ~1.5s
 *  2 brand reveal + chapter 01             (sentence + chapter card)
 *  3 chapter 02                            ~1.5s
 *  4 chapter 03                            ~2s
 *  5 CRM board "Follow-ups … ready to buy" ~3.7s
 *  6 summary "Content that attracts … 24x7"
 */
export const MODES: { from: number; mode: Mode }[] = [
  { from: 0, mode: "full" },
  { from: CUES.heres - 4, mode: "hidden" },
  { from: CUES.most + 9, mode: "top" },
  { from: CUES.thats + 6, mode: "hidden" },
  { from: CUES.we1 - 4, mode: "top" },
  { from: CUES.second - 4, mode: "hidden" },
  { from: CUES.weRun - 4, mode: "top" },
  { from: CUES.third - 4, mode: "hidden" },
  { from: CUES.crmEnd + 2, mode: "top" },
  { from: CUES.followUps - 3, mode: "hidden" },
  { from: CUES.andRepetitive - 2, mode: "top" },
  { from: CUES.content3 - 4, mode: "hidden" },
  { from: CUES.ifAnAi - 6, mode: "full" },
];

export const modeIndexAt = (frame: number) => {
  let i = 0;
  while (i + 1 < MODES.length && MODES[i + 1].from <= frame) i++;
  return i;
};

/** Brand logo: big reveal on "White", shrinks to the top-centre watermark after "fixes". */
export const LOGO = {
  sweep: CUES.thats + 6,
  reveal: CUES.white - 4,
  shrink: CUES.fixesEnd + 2,
} as const;
