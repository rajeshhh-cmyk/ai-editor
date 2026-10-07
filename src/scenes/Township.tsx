import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { AmenityIcon } from "../components/AmenityIcon";
import { GlassCard } from "../components/GlassCard";
import { GradientOverlay } from "../components/GradientOverlay";
import { Icon } from "../components/icons";
import { KineticText } from "../components/KineticText";
import { Media } from "../components/Media";
import { NumberReveal } from "../components/NumberReveal";
import { Particles } from "../components/Particles";
import { SceneShell } from "../components/SceneShell";
import { assets } from "../data/assets";
import type { CueName } from "../data/hornbill";
import { CLAMP } from "../lib/anim";
import { useScene } from "../lib/scene";
import { COLORS, FONT_FAMILY, SAFE } from "../lib/theme";

const CENTER = { x: 540, y: 930 };

const Ring: React.FC<{ startAt: number; exitAt: number }> = ({ startAt, exitAt }) => {
  const frame = useCurrentFrame();
  const { at, copy } = useScene();
  const list = copy.township.amenities;
  const spin = frame * 0.18;
  const R = 345;
  const ringScale = interpolate(frame, [0, 10], [0.6, 1], CLAMP);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle cx={CENTER.x} cy={CENTER.y} r={R * ringScale} fill="none" stroke="rgba(245,184,46,0.35)" strokeWidth={3} strokeDasharray="10 16" transform={`rotate(${spin} ${CENTER.x} ${CENTER.y})`} />
        <circle cx={CENTER.x} cy={CENTER.y} r={(R - 120) * ringScale} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      </svg>
      {list.map((a, i) => {
        const ang = ((-90 + (360 / list.length) * i + spin) * Math.PI) / 180;
        return (
          <AmenityIcon
            key={a.kind}
            kind={a.kind}
            label={a.label}
            delay={at(a.cue as CueName) - startAt}
            x={CENTER.x + Math.cos(ang) * R}
            y={CENTER.y + Math.sin(ang) * R - 30}
            size={165}
            exitAt={exitAt + Math.floor(i / 2)}
            exitTarget={CENTER}
          />
        );
      })}
    </>
  );
};

/** 04 — "500 acre की integrated township, highway touch. School, hospital, IT offices, mall, bank और police, fire station भी, सब township के अंदर।" */
export const Township: React.FC = () => {
  const { at, duration, copy, property } = useScene();
  const c = copy.township;
  const partB = at("school") - 8;
  const partA = at("acres");
  const ringExit = at("sabAndar") - 6 - partB;

  return (
    <SceneShell duration={duration} enter="blur-wipe" exit="zoom">
      {/* A: scale of the township */}
      <Sequence durationInFrames={partB + 2} layout="none">
        <AbsoluteFill>
          <Media asset={assets.droneAerial} trimBefore={2.6} duration={partB} from={{ scale: 1.3, x: 40 }} to={{ scale: 1.05, x: -40 }} />
          <GradientOverlay top={0.85} bottom={0.9} dim={0.15} />
          <AbsoluteFill style={{ top: SAFE.top + 20, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              <NumberReveal value={property.townshipAcres} delay={partA} countFrames={16} size={320} exitAt={partB - 8} />
              <KineticText text={c.acres} delay={partA + 8} from="right" size={90} exitAt={partB - 8} exitTo="right" style={{ marginBottom: 40 }} />
            </div>
            <KineticText text={c.integrated} delay={at("integrated")} from="left" size={118} exitAt={partB - 8} exitTo="left" style={{ marginTop: 10 }} />
          </AbsoluteFill>
          <GlassCard
            delay={at("highwayTouch")}
            from="bottom"
            tint="dark"
            exitAt={partB - 8}
            exitTo="bottom"
            style={{ left: 190, top: 1420, width: 700, height: 130, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}
          >
            <Icon kind="road" size={76} />
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 900, fontSize: 62, color: COLORS.white }}>{c.highwayTouch}</div>
          </GlassCard>
        </AbsoluteFill>
      </Sequence>

      {/* B: everything inside the township */}
      <Sequence from={partB} layout="none">
        <SceneShell duration={duration - partB} enter="whip-left">
          <Media asset={assets.towersLowAngle} duration={duration - partB} playbackRate={0.45} from={{ scale: 1.15 }} to={{ scale: 1.3 }} filter="brightness(0.4) saturate(0.5) blur(3px)" />
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 48%, rgba(18,61,145,0.55), rgba(7,28,71,0.85) 70%)" }} />
          <Particles seed="ring" count={26} opacity={0.5} />
          <Ring startAt={partB} exitAt={ringExit} />
          <AbsoluteFill style={{ top: CENTER.y - 110, alignItems: "center" }}>
            <KineticText text={c.inside} delay={at("sabAndar") - partB + 4} from="drop" size={96} lineHeight={1.15} />
          </AbsoluteFill>
        </SceneShell>
      </Sequence>
    </SceneShell>
  );
};
