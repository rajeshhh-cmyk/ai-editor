import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { EndCard as EndCardLayout } from "../components/EndCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { ImageParallax } from "../components/ImageParallax";
import { KineticText } from "../components/KineticText";
import { Particles } from "../components/Particles";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { CLAMP } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, SAFE } from "../lib/theme";

/** 11 — "Phase 2 में घर अभी पक्का कीजिए। नीचे Get Quote पर click करिए, form भरिए और अपनी free site visit schedule कीजिए।" */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { at, duration, copy, data } = useScene();
  const c = copy.endCard;
  const card = at("getQuote") - 8;
  const dim = interpolate(frame, [card - 4, card + 6], [0.1, 0.62], CLAMP);
  return (
    <SceneShell duration={duration} enter="zoom">
      <ImageParallax src={assets.towerPair.src} duration={duration} from={{ scale: 1.2, y: 60 }} to={{ scale: 1.02, y: 0 }} filter="brightness(0.85)" />
      <AbsoluteFill style={{ background: `rgba(11,11,11,${dim})` }} />
      <GradientOverlay top={0.7} bottom={0.95} />
      <Particles seed="end" count={30} opacity={0.5} />

      <Sequence durationInFrames={card + 2} layout="none">
        <AbsoluteFill style={{ top: SAFE.top + 30, alignItems: "center" }}>
          <KineticText text={c.phase} delay={at("phaseTwo")} from="drop" size={230} exitAt={card - 6} exitTo="top" />
          <KineticText text={c.open} delay={at("phaseTwo") + 10} from="bottom" size={104} exitAt={card - 6} exitTo="top" />
        </AbsoluteFill>
        <AbsoluteFill style={{ top: 1380, alignItems: "center" }}>
          <KineticText text={c.urgency} delay={at("pakka")} from="left" size={74} weight={800} color={COLORS.white} exitAt={card - 6} exitTo="bottom" />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={card} layout="none">
        <EndCardLayout
          data={data}
          t={{
            logoAt: 0,
            configAt: 6,
            possessionAt: 12,
            ctaAt: at("getQuote") - card,
            pressAt: at("click") - card,
            swapAt: at("siteVisit") - card - 14,
            legalAt: 18,
          }}
        />
      </Sequence>
    </SceneShell>
  );
};
