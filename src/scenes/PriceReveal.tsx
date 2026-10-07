import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame } from "remotion";
import { GradientOverlay } from "../components/GradientOverlay";
import { KineticText } from "../components/KineticText";
import { LegalStrip } from "../components/LegalStrip";
import { Media } from "../components/Media";
import { PriceCard } from "../components/PriceCard";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { CLAMP } from "../lib/anim";
import { useScene } from "../lib/scene";
import { SAFE } from "../lib/theme";

const GoldBurst: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 2, at + 4, at + 40], [0, 0.85, 0.35], CLAMP);
  const s = interpolate(frame, [at - 2, at + 10], [0.4, 1.1], CLAMP);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        transform: `scale(${s})`,
        background: "radial-gradient(circle at 50% 50%, rgba(245,184,46,0.55) 0%, rgba(245,184,46,0.12) 30%, rgba(0,0,0,0) 55%)",
      }}
    />
  );
};

/** 08 — "Price? 2BHK 81.15 lakh से, 2.5BHK 1.02 crore से।" */
export const PriceReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { at, duration, copy, property } = useScene();
  const c = copy.priceReveal;
  const ask = at("price");
  const second = at("price25Bhk") - 3;
  const shake = frame >= ask && frame < ask + 8 ? (random(`pr${frame}`) - 0.5) * 30 : 0;
  // footage dims to near-black as the price takes over
  const dim = interpolate(frame, [0, 10], [0.15, 0.78], CLAMP);

  return (
    <SceneShell duration={duration} enter="zoom" exit="cut">
      <Sequence durationInFrames={second} layout="none">
        <AbsoluteFill>
          <Media asset={assets.living} trimBefore={1.0} duration={second} from={{ scale: 1.1 }} to={{ scale: 1.3 }} filter="blur(4px)" />
          <AbsoluteFill style={{ background: `rgba(11,11,11,${dim})` }} />
          <GoldBurst at={at("price2BhkValue")} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
            <KineticText text={c.ask} delay={ask} from="drop" size={230} exitAt={at("price2Bhk") - 4} exitTo="center" />
          </AbsoluteFill>
          <AbsoluteFill style={{ top: 700, alignItems: "center" }}>
            <PriceCard unit={property.units[0]} labelAt={at("price2Bhk")} priceAt={at("price2BhkValue")} sub={c.onwards} subAt={at("price2BhkValue") + 16} exitAt={second - 7} size={250} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={second} layout="none">
        <SceneShell duration={duration - second} enter="zoom">
          <Media asset={assets.hall} duration={duration - second} from={{ scale: 1.25 }} to={{ scale: 1.1 }} filter="blur(4px) brightness(0.3)" />
          <GoldBurst at={at("price25BhkValue") - second} />
          <AbsoluteFill style={{ top: 700, alignItems: "center" }}>
            <PriceCard
              unit={property.units[1]}
              labelAt={at("price25Bhk") - second}
              priceAt={at("price25BhkValue") - second}
              sub={c.onwards}
              subAt={at("price25BhkValue") - second + 14}
              size={250}
            />
          </AbsoluteFill>
        </SceneShell>
      </Sequence>
      <GradientOverlay top={0.6} bottom={0.6} />
      <LegalStrip rera={property.rera} delay={at("price2Bhk")} qrSize={140} style={{ left: 90, top: 1920 - SAFE.bottom - 210 }} />
    </SceneShell>
  );
};
