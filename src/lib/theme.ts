// Design system: brochure is the brand source of truth (royal blue + gold),
// the reference ad drives the motion language (black + gold + white).
export const COLORS = {
  gold: "#F5B82E",
  goldLight: "#FFD877",
  goldDeep: "#D98A00",
  white: "#FFFFFF",
  offWhite: "#EDEDED",
  black: "#0B0B0B",
  charcoal: "#171717",
  blue: "#123D91",
  blueDeep: "#071C47",
  red: "#E5372B",
} as const;

export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDeep} 100%)`;

// Inter has no Devanagari glyphs, so Hindi falls through to Noto per glyph.
export const FONT_FAMILY = "'Inter', 'InterExt', 'Noto Sans Devanagari', sans-serif";

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// Important information stays out of the top/bottom 14% (platform UI).
export const SAFE = {
  top: Math.round(VIDEO.height * 0.14),
  bottom: Math.round(VIDEO.height * 0.14),
  side: 72,
} as const;
