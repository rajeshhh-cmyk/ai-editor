import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import type React from "react";

// ── Colors: black, white and gold only ────────────────────────────────
export const COLORS = {
  black: "#0A0A0A",
  panel: "#141414",
  white: "#FFFFFF",
  muted: "#BDBDBD",
  gold: "#D4AF37",
  goldLight: "#F5D27A",
  goldDark: "#B8860B",
} as const;

export const GOLD_GRADIENT = "linear-gradient(135deg, #F5D27A, #D4AF37 50%, #B8860B)";
export const goldRgba = (a: number) => `rgba(212,175,55,${a})`;
export const GOLD_GLOW = `0 0 40px ${goldRgba(0.35)}`;
export const GOLD_GLOW_FILTER = `drop-shadow(0 0 40px ${goldRgba(0.35)})`;

// ── Fonts ─────────────────────────────────────────────────────────────
const montserrat = loadMontserrat("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const inter = loadInter("normal", { weights: ["600", "700"], subsets: ["latin"] });
const playfair = loadPlayfair("italic", { weights: ["700"], subsets: ["latin"] });

export const FONTS = {
  headline: montserrat.fontFamily,
  body: inter.fontFamily,
  brand: playfair.fontFamily,
} as const;

export const HEADLINE: React.CSSProperties = {
  fontFamily: FONTS.headline,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  lineHeight: 1.02,
};

/** Small, tracked-out gold caps label. */
export const LABEL: React.CSSProperties = {
  fontFamily: FONTS.headline,
  fontWeight: 700,
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: COLORS.gold,
};

// ── Glass cards ───────────────────────────────────────────────────────
export const GLASS: React.CSSProperties = {
  background: "rgba(10,10,10,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${goldRgba(0.6)}`,
  borderRadius: 28,
};

// ── Motion ────────────────────────────────────────────────────────────
export const SPRINGS = {
  pop: { damping: 14, stiffness: 120 },
  smooth: { damping: 200 },
} as const;

export const ICON_STROKE = 1.5;
export const STAGGER = 5;

// ── Canvas & safe areas ───────────────────────────────────────────────
export const W = 1080;
export const H = 1920;
export const SAFE = { top: 120, bottom: 260, side: 60 } as const;
