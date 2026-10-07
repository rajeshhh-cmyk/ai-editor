import React from "react";
import { AbsoluteFill } from "remotion";
import { GradientOverlay } from "../components/GradientOverlay";
import { ImageParallax } from "../components/ImageParallax";
import { KineticText } from "../components/KineticText";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { useScene } from "../lib/scene";
import { COLORS, SAFE } from "../lib/theme";

/** 05 — "एक पूरा शहर, एक गेट के अंदर।" — the giant typography moment. */
export const CompleteCity: React.FC = () => {
  const { at, duration, copy } = useScene();
  const c = copy.completeCity;
  return (
    <SceneShell duration={duration} enter="zoom" exit="whip-left">
      {/* push towards the entrance gate in the render */}
      <ImageParallax src={assets.towerGate.src} duration={duration} from={{ scale: 1.1, y: 0 }} to={{ scale: 1.55, y: -520 }} filter="brightness(0.75)" />
      <GradientOverlay top={0.9} bottom={0.75} dim={0.25} />
      <AbsoluteFill style={{ top: SAFE.top + 30, alignItems: "center" }}>
        <KineticText text={c.line1} delay={at("puraShehar")} from="bottom" stagger={3} size={150} lineHeight={0.95} />
        <KineticText text={c.line2} delay={at("ekGate")} from="center" size={170} lineHeight={0.95} style={{ marginTop: 40 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1500, alignItems: "center" }}>
        <KineticText text={c.hindi} delay={at("ekGate") + 6} from="bottom" distance={100} size={50} weight={700} color={COLORS.offWhite} />
      </AbsoluteFill>
    </SceneShell>
  );
};
