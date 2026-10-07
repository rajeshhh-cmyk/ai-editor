import React from "react";
import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { BrochurePage } from "../components/BrochurePage";
import { GlassCard } from "../components/GlassCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { ImageParallax } from "../components/ImageParallax";
import { KineticText } from "../components/KineticText";
import { NumberReveal } from "../components/NumberReveal";
import { Particles } from "../components/Particles";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import { CLAMP, exitProgress, punch } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY, GOLD_GRADIENT, SAFE } from "../lib/theme";

const Stamp: React.FC<{ text: string; delay: number; exitAt?: number }> = ({ text, delay, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch(frame, fps, delay, 13, 260);
  const exit = exitProgress(frame, exitAt, 7);
  return (
    <div
      style={{
        padding: "26px 54px",
        borderRadius: 26,
        background: GOLD_GRADIENT,
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize: 120,
        color: COLORS.black,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        boxShadow: "0 30px 90px rgba(245,184,46,0.5)",
        transform: `scale(${3 - 2 * p + exit * 0.6}) rotate(${-4 * Math.min(p, 1)}deg) translateY(${-exit * 600}px)`,
        opacity: interpolate(frame - delay, [0, 2], [0, 1], CLAMP) * (1 - exit),
        filter: `blur(${interpolate(frame - delay, [0, 6], [14, 0], CLAMP) + exit * 16}px)`,
      }}
    >
      {text}
    </div>
  );
};

const PriceRecap: React.FC = () => {
  const { property } = useScene();
  return (
    <div style={{ position: "absolute", top: SAFE.top + 10, width: "100%", display: "flex", justifyContent: "center", gap: 24 }}>
      {property.units.map((u, i) => (
        <GlassCard key={u.config} delay={2 + i * 4} tint="dark" radius={22} style={{ position: "relative", padding: "18px 30px" }}>
          <div style={{ fontFamily: FONT_FAMILY, color: COLORS.white, fontWeight: 800, fontSize: 30, letterSpacing: "0.06em" }}>{u.config}</div>
          <div style={{ fontFamily: FONT_FAMILY, color: COLORS.gold, fontWeight: 900, fontSize: 58 }}>
            {u.price.prefix}
            {u.price.value.toFixed(u.price.decimals)}
            {u.price.suffix}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

/** Red strike drawn through the line it sits on. */
const Strike: React.FC<{ at: number; width: number }> = ({ at, width }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [at, at + 6], [0, width], CLAMP);
  return <div style={{ position: "absolute", left: (1080 - width) / 2, top: 860, width: w, height: 22, borderRadius: 11, background: COLORS.red, transform: "rotate(-6deg)", boxShadow: "0 0 30px rgba(229,55,43,0.7)" }} />;
};

/** 09 — "All inclusive, one-time lifetime maintenance के साथ। मतलब हर महीने maintenance भरने का झंझट ही ख़त्म।" */
export const AllInclusive: React.FC = () => {
  const frame = useCurrentFrame();
  const { at, duration, copy, property } = useScene();
  const c = copy.allInclusive;
  const b = at("oneTime") - 3;
  const cStart = at("monthly") - 3;
  const kh = at("khatam");
  const shake = frame >= kh && frame < kh + 8 ? (random(`ai${frame}`) - 0.5) * 30 : 0;
  // brochure pages flip behind the maintenance message as proof of what it covers
  const pages = [assets.amenitiesPodium, assets.openGym, assets.podium];
  const pageLen = Math.floor((cStart - b) / pages.length);

  return (
    <SceneShell duration={duration} enter="cut" exit="whip-left">
      <Sequence durationInFrames={b + 1} layout="none">
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1f1a0c 0%, #0B0B0B 65%)" }}>
          <Particles seed="ai" count={40} />
          <PriceRecap />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <Stamp text={c.stamp} delay={at("allInclusive")} exitAt={b - 6} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={b} durationInFrames={cStart - b + 1} layout="none">
        <SceneShell duration={cStart - b} enter="whip-left" background={COLORS.blueDeep}>
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 70%, #123D91 0%, #071C47 60%)" }} />
          {pages.map((p, i) => (
            <Sequence key={p.src} from={i * pageLen} durationInFrames={i === pages.length - 1 ? undefined : pageLen + 6} layout="none">
              <BrochurePage
                src={p.src}
                from={i % 2 === 0 ? "right" : "left"}
                exitAt={i === pages.length - 1 ? undefined : pageLen - 2}
                exitTo={i % 2 === 0 ? "left" : "right"}
                rotate={i % 2 === 0 ? -3 : 3}
                pan={{ from: 1.0, to: 1.15, y: -20 }}
                duration={pageLen + 6}
                position={i === 0 ? "50% 25%" : "center"}
                style={{ left: 120, top: 860, width: 840, height: 640 }}
              />
            </Sequence>
          ))}
          <AbsoluteFill style={{ top: SAFE.top + 10, alignItems: "center" }}>
            <KineticText text={c.oneTime} delay={at("oneTime") - b} from="left" size={150} />
            <KineticText text={c.lifetime} delay={at("lifetime") - b} from="right" size={104} lineHeight={1.0} />
          </AbsoluteFill>
          <GlassCard delay={at("lifetime") - b + 10} tint="gold" style={{ left: 300, top: 1530, width: 480, height: 110, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <NumberReveal value={20} suffix="+" delay={at("lifetime") - b + 12} size={78} suffixScale={1} />
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 46, color: COLORS.white }}>{c.amenities}</div>
          </GlassCard>
        </SceneShell>
      </Sequence>

      <Sequence from={cStart} layout="none">
        <SceneShell duration={duration - cStart} enter="zoom">
          <ImageParallax src={assets.masterPlan.src} duration={duration - cStart} from={{ scale: 1.15, rotate: -3 }} to={{ scale: 1.35, rotate: 0 }} filter="brightness(0.35) blur(2px)" />
          <GradientOverlay top={0.7} bottom={0.8} />
          <AbsoluteFill style={{ top: 640, alignItems: "center", transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
            <KineticText text={c.monthly} delay={at("monthly") - cStart} from="bottom" size={118} lineHeight={1.08} />
            <KineticText text={c.hassle} delay={at("monthly") - cStart + 30} from="left" size={84} weight={800} style={{ marginTop: 10 }} />
          </AbsoluteFill>
          <Strike at={at("jhanjhat") - cStart} width={860} />
          <AbsoluteFill style={{ top: 1180, alignItems: "center" }}>
            <KineticText text={c.over} delay={kh - cStart} from="drop" size={230} />
          </AbsoluteFill>
        </SceneShell>
      </Sequence>
    </SceneShell>
  );
};
