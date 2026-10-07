import React from "react";
import { AbsoluteFill } from "remotion";
import { BuildingReveal as Reveal } from "../components/BuildingReveal";
import { GradientOverlay } from "../components/GradientOverlay";
import { KineticText } from "../components/KineticText";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { useScene } from "../lib/scene";
import { COLORS, SAFE } from "../lib/theme";

/** 02 — "अब Magarpatta Group की तीसरी township, आपके budget में।" */
export const BuildingReveal: React.FC = () => {
  const { at, duration, copy } = useScene();
  const c = copy.buildingReveal;
  // Drop the 3D model render into assets.model3d and it replaces the still render.
  const model = assets.model3d ?? assets.towerFull;
  const out = at("budget") - 3;
  return (
    <SceneShell duration={duration} enter="zoom" exit="whip-left">
      <Reveal asset={model} duration={duration} pushAt={3} />
      <GradientOverlay top={0.75} bottom={0.9} />
      <AbsoluteFill style={{ top: SAFE.top + 10, alignItems: "center" }}>
        <KineticText text={c.kicker} delay={at("ab")} from="left" size={66} weight={800} tracking={0.02} exitAt={out} exitTo="top" />
        <KineticText text={c.big} delay={at("teesri")} from="center" size={250} exitAt={out} exitTo="top" style={{ marginTop: 10 }} />
        <KineticText text={c.big2} delay={at("townshipWord")} from="right" size={168} exitAt={out} exitTo="top" style={{ marginTop: -30 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1250, alignItems: "center" }}>
        <KineticText text={c.budget} delay={at("budget")} from="drop" size={116} color={COLORS.white} />
      </AbsoluteFill>
    </SceneShell>
  );
};
