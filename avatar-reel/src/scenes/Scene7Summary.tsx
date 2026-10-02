import { Magnet, Repeat, Rocket, type LucideIcon } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { IconRing } from "../components/IconRing";
import { CUES, local } from "../scenes.config";
import { COLORS, FONTS, HEADLINE, goldRgba } from "../theme";

const L = (cue: number) => local("summary", cue);

const NODES: { icon: LucideIcon; label: string; cue: number; x: number; y: number }[] = [
  { icon: Magnet, label: "Attracts", cue: CUES.content3, x: 540, y: 470 },
  { icon: Repeat, label: "Converts", cue: CUES.systems, x: 250, y: 1000 },
  { icon: Rocket, label: "Scales", cue: CUES.automation2, x: 830, y: 1000 },
];
const CENTER = { x: 540, y: (470 + 1000 + 1000) / 3 };

/** Hidden moment 6 — Attracts / Converts / Scales triangle with a pulsing 24x7 core. */
export const Scene7Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const size = 210;

  const enter = smooth(frame, fps, 0, 12);
  const linkAt = L(CUES.workingTogether) - 2;
  const link = progress(frame, linkAt, linkAt + 18);
  const badge = pop(frame, fps, L(CUES.twentyFourSeven) - 3);
  const pulse = 1 + Math.sin(frame / 5) * 0.04 * (badge > 0.9 ? 1 : 0);
  const exit = interpolate(frame, [durationInFrames - 4, durationInFrames + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exit, transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {NODES.map((a, i) => {
          const b = NODES[(i + 1) % NODES.length];
          const d = progress(frame, linkAt + i * 5, linkAt + i * 5 + 14);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={COLORS.gold}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - d}
              style={{ filter: `drop-shadow(0 0 10px ${goldRgba(0.7)})` }}
            />
          );
        })}
        {NODES.map((n, i) => (
          <line
            key={`c${i}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={n.x}
            y2={n.y}
            stroke={goldRgba(0.35)}
            strokeWidth={1.5}
            strokeDasharray="6 10"
            opacity={link}
          />
        ))}
      </svg>

      {NODES.map((n, i) => {
        const at = L(n.cue) - 3;
        const slam = pop(frame, fps, at);
        const s = interpolate(slam, [0, 1], [2.2, 1]);
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: n.x - size / 2,
              top: n.y - size / 2,
              width: size,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${s}) translateY(${float(frame, 4, 80, i)}px)`,
              opacity: interpolate(frame, [at, at + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <IconRing icon={n.icon} size={size} progress={progress(frame, at, at + 16)} lit={0.7 + link * 0.5} />
            <div style={{ ...HEADLINE, fontSize: 52, color: COLORS.white, marginTop: 18 }}>{n.label}</div>
          </div>
        );
      })}

      {/* 24x7 core */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y,
          transform: `translate(-50%, -50%) scale(${badge * pulse})`,
          opacity: badge > 0.01 ? 1 : 0,
          padding: "18px 40px",
          borderRadius: 999,
          border: `2px solid ${COLORS.gold}`,
          background: "rgba(10,10,10,0.85)",
          boxShadow: `0 0 ${40 + Math.sin(frame / 5) * 20}px ${goldRgba(0.5)}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ ...HEADLINE, fontSize: 96, lineHeight: 1 }}>
          <GoldText glow={1.3}>24x7</GoldText>
        </div>
        <div style={{ fontFamily: FONTS.headline, fontWeight: 700, fontSize: 18, letterSpacing: "0.4em", color: COLORS.muted, marginTop: 6 }}>
          ALWAYS ON
        </div>
      </div>
    </AbsoluteFill>
  );
};
