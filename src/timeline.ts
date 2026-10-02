/**
 * Every scene boundary and word cue lives here, in absolute frames (30fps),
 * derived from the word timestamps in public/captions.json.
 * Adjust these to retime the video — scenes read their cues from here.
 */
export const FPS = 30;

/** Seconds → frame. */
const f = (seconds: number) => Math.round(seconds * FPS);

/** Used until calculateMetadata reads the real audio length (44.12s). */
export const FALLBACK_DURATION_IN_FRAMES = 1324;

/** Crossfade / slide length between scenes. */
export const TRANSITION_FRAMES = 9;

export const SCENES = {
  hook: { from: 0, to: f(5.0) },
  pain: { from: f(5.0), to: f(11.6) },
  turn: { from: f(11.6), to: f(16.4) },
  brand: { from: f(16.4), to: f(24.6) },
  automate: { from: f(24.6), to: f(29.2) },
  connect: { from: f(29.2), to: f(33.85) },
  outcomes: { from: f(33.85), to: f(40.25) },
  /** `to` is replaced by the composition's real duration. */
  cta: { from: f(40.25), to: FALLBACK_DURATION_IN_FRAMES },
} as const;

export type SceneKey = keyof typeof SCENES;

/** Absolute frames of the spoken words each visual is locked to. */
export const CUES = {
  // Scene 1 — "…because of bad products, but because of broken processes."
  bad: f(1.91),
  but: f(2.96),
  broken: f(3.52),
  processes: f(3.94),
  // Scene 2
  calls: f(5.17),
  tasks: f(6.39),
  yourTeam: f(8.13),
  hours: f(8.97),
  painDim: f(10.9),
  // Scene 3
  thatsWhere: f(11.8),
  aiPowered: f(12.23),
  voiceAgents: f(13.04),
  processAutomation: f(13.95),
  change: f(15.16),
  everything: f(15.6),
  // Scene 4
  white: f(16.79),
  logoShrink: f(18.7),
  answerEveryCall: f(20.5),
  twentyFourSeven: f(21.72),
  withAiVoiceAgents: f(22.86),
  // Scene 5
  automate: f(24.81),
  dataEntry: f(26.78),
  invoicing: f(27.57),
  followUps: f(28.36),
  // Scene 6
  connect: f(29.51),
  customSoftware: f(30.26),
  built: f(31.14),
  yourBusiness: f(31.92),
  // Scene 7
  noCallMissed: f(34.22),
  noHourWasted: f(35.51),
  runsOnAutopilot: f(38.7),
  autopilot: f(39.41),
  // Scene 8
  stop: f(40.4),
  start: f(42.25),
  withAi: f(43.19),
} as const;

/** Final end-card (full logo + CTA button) length. */
export const END_CARD_FRAMES = 45;

/** Cue relative to a scene's first frame (what useCurrentFrame() returns inside it). */
export const local = (scene: SceneKey, cue: number) => cue - SCENES[scene].from;

/** Website / phone shown on the end card — replace with real details. */
export const CONTACT = {
  website: "www.yourwebsite.com",
  phone: "+00 00000 00000",
};
