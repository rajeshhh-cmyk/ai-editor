import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrochurePage } from "../components/BrochurePage";
import { GradientOverlay } from "../components/GradientOverlay";
import { KineticText } from "../components/KineticText";
import { Media } from "../components/Media";
import { NumberReveal } from "../components/NumberReveal";
import { SceneShell } from "../components/SceneShell";
import { assets, MediaAsset } from "../data/assets";
import type { CueName, Unit } from "../data/hornbill";
import { CLAMP, punch } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY, SAFE } from "../lib/theme";

const UnitBeat: React.FC<{ unit: Unit; footage: MediaAsset; start: number; length: number; labelCue: CueName; numberCue: CueName; enter: "whip-left" | "whip-right" }> = ({
  unit,
  footage,
  start,
  length,
  labelCue,
  numberCue,
  enter,
}) => {
  const { at, copy } = useScene();
  const label = at(labelCue) - start;
  const num = at(numberCue) - start;
  return (
    <SceneShell duration={length} enter={enter} exit="cut">
      <Media asset={footage} duration={length} from={{ scale: 1.05 }} to={{ scale: 1.22, x: -30 }} filter="brightness(0.8)" />
      <GradientOverlay top={0.92} bottom={0.85} />
      <AbsoluteFill style={{ top: SAFE.top + 10, alignItems: "center" }}>
        <KineticText text={unit.config} delay={label} from="left" size={124} />
        <NumberReveal value={unit.areaSqFt} delay={num} countFrames={14} size={340} pulseAt={num + 18} style={{ marginTop: -10 }} />
        <KineticText text={copy.walkthrough.carpet} delay={num + 10} from="bottom" distance={120} size={58} weight={800} tracking={0.12} />
      </AbsoluteFill>
      {/* floor plan from the brochure as proof */}
      <BrochurePage
        src={assets[unit.plan].src}
        delay={label + 6}
        from={enter === "whip-left" ? "right" : "left"}
        rotate={enter === "whip-left" ? -2 : 2}
        pan={{ from: 1.02, to: 1.18 }}
        duration={length}
        style={{ left: 110, top: 1010, width: 860, height: 560 }}
      />
      <div
        style={{
          position: "absolute",
          top: 1592,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 24,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {unit.areaFootnote}
      </div>
    </SceneShell>
  );
};

const LogoMoment: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch(frame, fps, delay, 10, 190);
  return (
    <div
      style={{
        position: "absolute",
        left: 215,
        top: 640,
        width: 650,
        height: 420,
        borderRadius: 40,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
        transform: `scale(${p}) rotate(${(1 - Math.min(1, p)) * 10}deg)`,
        opacity: interpolate(frame - delay, [0, 3], [0, 1], CLAMP),
      }}
    >
      <Img src={staticFile(assets.logoCard.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%", transform: "scale(1.2)" }} />
    </div>
  );
};

/** 06 — "यहाँ के Hornbill Heights में 2BHK के 900 sq ft carpet और 2.5BHK के 1100 sq ft। इस budget में इतना carpet बहुत कम मिलता है।" */
export const Walkthrough: React.FC = () => {
  const { at, duration, copy, property } = useScene();
  const c = copy.walkthrough;
  const b = at("bhk2") - 4;
  const c2 = at("bhk25") - 4;
  const d = at("isBudget") - 4;
  return (
    <SceneShell duration={duration} enter="whip-left" exit="zoom">
      <Sequence durationInFrames={b} layout="none">
        <SceneShell duration={b}>
          <Media asset={assets.living} duration={b} from={{ scale: 1.0 }} to={{ scale: 1.15 }} />
          <GradientOverlay top={0.8} bottom={0.6} />
          <AbsoluteFill style={{ top: SAFE.top + 60, alignItems: "center" }}>
            <KineticText text={c.intro} delay={at("yahan")} from="top" distance={150} size={84} weight={800} />
          </AbsoluteFill>
          <LogoMoment delay={at("hornbill") - 6} />
        </SceneShell>
      </Sequence>
      <Sequence from={b} durationInFrames={c2 - b} layout="none">
        <UnitBeat unit={property.units[0]} footage={assets.bedroom} start={b} length={c2 - b} labelCue="bhk2" numberCue="sqft900" enter="whip-left" />
      </Sequence>
      <Sequence from={c2} durationInFrames={d - c2} layout="none">
        <UnitBeat unit={property.units[1]} footage={assets.masterBedroom} start={c2} length={d - c2} labelCue="bhk25" numberCue="sqft1100" enter="whip-right" />
      </Sequence>
      <Sequence from={d} layout="none">
        <SceneShell duration={duration - d} enter="swipe-up">
          <Media asset={assets.balcony} duration={duration - d} from={{ scale: 1.25, y: 40 }} to={{ scale: 1.05 }} filter="brightness(0.7)" />
          <GradientOverlay top={0.85} bottom={0.9} dim={0.15} />
          <AbsoluteFill style={{ top: 560, alignItems: "center" }}>
            <KineticText text={c.rare1} delay={at("isBudget") - d} from="left" size={90} weight={800} />
            <KineticText text={c.rare2} delay={at("itnaCarpet") - d} from="center" size={200} lineHeight={0.95} style={{ marginTop: 10 }} />
            <KineticText text={c.rare3} delay={at("bahutKam") - d} from="right" size={90} weight={800} color={COLORS.white} style={{ marginTop: 20 }} />
          </AbsoluteFill>
        </SceneShell>
      </Sequence>
    </SceneShell>
  );
};
