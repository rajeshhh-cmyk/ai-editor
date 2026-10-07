import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { GradientOverlay } from "../components/GradientOverlay";
import { KineticText } from "../components/KineticText";
import { Media } from "../components/Media";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { CLAMP, punch } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY, SAFE } from "../lib/theme";

const SoldOut: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch(frame, fps, delay, 14, 300);
  return (
    <div
      style={{
        padding: "18px 50px",
        border: `12px solid ${COLORS.red}`,
        borderRadius: 24,
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize: 150,
        letterSpacing: "0.02em",
        color: COLORS.red,
        background: "rgba(255,255,255,0.92)",
        whiteSpace: "nowrap",
        transform: `scale(${2.6 - 1.6 * p}) rotate(-9deg)`,
        opacity: interpolate(frame - delay, [0, 2], [0, 1], CLAMP),
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
};

/** 10 — "Phase 1 के towers already sold out हो चुके हैं।" */
export const PhaseOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { at, duration, copy } = useScene();
  const c = copy.phaseOne;
  const so = at("soldOut");
  const shake = frame >= so + 3 && frame < so + 11 ? (random(`po${frame}`) - 0.5) * 34 : 0;
  return (
    <SceneShell duration={duration} enter="whip-left" exit="zoom">
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <Media asset={assets.droneClose} duration={duration} playbackRate={0.7} from={{ scale: 1.05 }} to={{ scale: 1.25 }} filter="brightness(0.8) saturate(0.85)" />
        <GradientOverlay top={0.85} bottom={0.8} />
        <AbsoluteFill style={{ top: SAFE.top + 20, alignItems: "center" }}>
          <KineticText text={c.phase} delay={at("phaseOne")} from="left" size={210} />
          <KineticText text={c.towers} delay={at("towers")} from="right" size={100} weight={800} tracking={0.2} />
        </AbsoluteFill>
        <AbsoluteFill style={{ top: 1080, alignItems: "center" }}>
          <SoldOut text={c.soldOut} delay={so} />
        </AbsoluteFill>
      </AbsoluteFill>
    </SceneShell>
  );
};
