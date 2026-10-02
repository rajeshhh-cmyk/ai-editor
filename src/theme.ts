import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import type { SpringConfig } from "remotion";

// ── Colors ─────────────────────────────────────────────────────────────
// Black, white and gold only.
export const COLORS = {
  black: "#0A0A0A",
  panel: "#141414",
  white: "#FFFFFF",
  muted: "#BDBDBD",
  gold: "#D4AF37",
  goldLight: "#F5D27A",
  goldDark: "#B8860B",
} as const;

export const GOLD_GRADIENT =
  "linear-gradient(135deg, #F5D27A 0%, #D4AF37 50%, #B8860B 100%)";

export const goldRgba = (alpha: number) => `rgba(212,175,55,${alpha})`;

export const GOLD_GLOW = `0 0 40px ${goldRgba(0.35)}`;
export const GOLD_GLOW_FILTER = `drop-shadow(0 0 40px ${goldRgba(0.35)})`;

// ── Fonts ──────────────────────────────────────────────────────────────
const montserrat = loadMontserrat("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});
const inter = loadInter("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
const playfair = loadPlayfair("italic", {
  weights: ["700"],
  subsets: ["latin"],
});

export const FONTS = {
  headline: montserrat.fontFamily,
  body: inter.fontFamily,
  brand: playfair.fontFamily,
} as const;

export const HEADLINE_STYLE = {
  fontFamily: FONTS.headline,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  lineHeight: 1.02,
} as const;

// ── Motion ─────────────────────────────────────────────────────────────
export const SPRINGS = {
  /** UI pops */
  pop: { damping: 14, stiffness: 120 } satisfies Partial<SpringConfig>,
  /** Smooth slides */
  smooth: { damping: 200 } satisfies Partial<SpringConfig>,
} as const;

export const STAGGER = 5;
export const ICON_STROKE = 1.5;
