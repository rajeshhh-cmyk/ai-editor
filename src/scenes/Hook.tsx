import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { assets } from "../data/assets";
import { GlassCard } from "../components/GlassCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { Icon } from "../components/icons";
import { ImageParallax } from "../components/ImageParallax";
import { KineticText } from "../components/KineticText";
import { Particles } from "../components/Particles";
import { SceneShell } from "../components/SceneShell";
import { CLAMP, punch } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY } from "../lib/theme";

const CityCard: React.FC<{ name: string; img: string; delay: number; top: number; from: "left" | "right"; exitAt: number }> = ({
  name,
  img,
  delay,
  top,
  from,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tick = punch(frame, fps, delay + 9, 8, 260);
  return (
    <GlassCard delay={delay} from={from} exitAt={exitAt} exitTo={from} tint="dark" style={{ left: 70, top, width: 940, height: 230, display: "flex", alignItems: "center", padding: 24, gap: 30 }}>
      <Img src={staticFile(img)} style={{ width: 182, height: 182, borderRadius: 24, objectFit: "cover" }} />
      <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 66, color: COLORS.white, lineHeight: 1, flex: 1, letterSpacing: "-0.02em" }}>{name}</div>
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          background: COLORS.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${tick})`,
          opacity: frame >= delay + 9 ? 1 : 0,
          boxShadow: "0 0 40px rgba(245,184,46,0.8)",
        }}
      >
        <Icon kind="check" size={78} color={COLORS.black} />
      </div>
    </GlassCard>
  );
};

/** 01 — "Magarpatta City देखी, Nanded City देखी।" → NEXT? */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { at, duration, copy } = useScene();
  const c = copy.hook;
  const next = at("next");
  const shake = frame >= next && frame < next + 8 ? (random(`hk${frame}`) - 0.5) * 26 : 0;
  const flash = interpolate(frame, [0, 2, 7], [0.9, 0.5, 0], CLAMP);
  return (
    <SceneShell duration={duration} exit="zoom">
      <ImageParallax
        src={assets.towerFull.src}
        duration={duration}
        from={{ scale: 1.35 }}
        to={{ scale: 1.08 }}
        filter="brightness(0.32) saturate(0.6) contrast(1.2)"
      />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(18,61,145,0.35), rgba(0,0,0,0.85) 70%)" }} />
      <Particles seed="hook" count={36} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${-shake * 0.6}px)` }}>
        <CityCard name={c.cities[0]} img={assets.magarpattaCity.src} delay={at("magarpatta")} top={600} from="left" exitAt={next - 5} />
        <CityCard name={c.cities[1]} img={assets.nandedCity.src} delay={at("nanded")} top={880} from="right" exitAt={next - 5} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <KineticText text={c.next} delay={next} from="drop" size={250} />
        </AbsoluteFill>
      </AbsoluteFill>
      <GradientOverlay bottom={0.5} top={0.4} />
      <AbsoluteFill style={{ background: `rgba(255,240,210,${flash})` }} />
    </SceneShell>
  );
};
