import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { KineticText } from "../components/KineticText";
import { Media } from "../components/Media";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { CLAMP } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, SAFE } from "../lib/theme";

/** Laptop whose lid swings open, screen glowing — a graphic, not fake architecture. */
const Laptop: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const lid = interpolate(frame - delay, [4, 14], [90, 0], CLAMP);
  const glow = interpolate(frame - delay, [10, 18], [0, 1], CLAMP);
  return (
    <svg width="300" height="220" viewBox="0 0 300 220">
      <g style={{ transformOrigin: "150px 170px", transform: `perspective(400px) rotateX(${lid}deg)` }}>
        <rect x="50" y="20" width="200" height="140" rx="10" fill="#1d1d1d" stroke={COLORS.gold} strokeWidth="6" />
        <rect x="64" y="34" width="172" height="112" rx="4" fill={`rgba(245,184,46,${0.15 + 0.55 * glow})`} />
        <path d="M84 64 H180 M84 86 H210 M84 108 H160" stroke={`rgba(11,11,11,${0.7 * glow})`} strokeWidth="9" strokeLinecap="round" />
      </g>
      <path d="M20 172 H280 L264 196 H36 Z" fill={COLORS.gold} />
    </svg>
  );
};

/** 07 — "Extra half room, मतलब आपका home office।" */
export const HomeOffice: React.FC = () => {
  const { at, duration, copy } = useScene();
  const c = copy.homeOffice;
  const ho = at("homeOffice");
  return (
    <SceneShell duration={duration} enter="zoom" exit="zoom">
      <Media asset={assets.masterBedroom} trimBefore={3.2} duration={duration} from={{ scale: 1.1, x: 30 }} to={{ scale: 1.3, x: -30 }} filter="brightness(0.6)" />
      <GradientOverlay top={0.9} bottom={0.9} dim={0.2} />
      <AbsoluteFill style={{ top: SAFE.top + 20, alignItems: "center" }}>
        <KineticText text={c.line1} delay={at("extraHalf")} from="left" stagger={3} size={150} lineHeight={0.98} />
        <KineticText text={c.equals} delay={ho - 10} from="center" size={140} color={COLORS.gold} style={{ marginTop: 6 }} />
        <KineticText text={c.hindi} delay={ho - 6} from="bottom" distance={100} size={60} weight={800} />
        <KineticText text={c.line2} delay={ho} from="drop" size={150} />
      </AbsoluteFill>
      <GlassCard delay={ho + 2} from="bottom" tint="dark" style={{ left: 330, top: 1280, width: 420, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Laptop delay={ho + 2} />
      </GlassCard>
    </SceneShell>
  );
};
