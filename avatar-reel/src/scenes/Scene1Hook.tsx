import { Magnet, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, smooth } from "../anim";
import { ScanLine } from "../components/ScanLine";
import { CUES, local } from "../scenes.config";
import { COLORS, FONTS, GLASS, ICON_STROKE, goldRgba } from "../theme";

const CHIPS: { icon: LucideIcon; label: string; cue: number }[] = [
  { icon: TrendingUp, label: "Grow", cue: CUES.grow },
  { icon: Magnet, label: "Leads", cue: CUES.leads },
  { icon: Zap, label: "Autopilot", cue: CUES.autopilot },
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagAt = local("hook", CUES.ai) - 2;
  const tag = pop(frame, fps, tagAt);
  const blink = Math.floor(frame / 9) % 2 === 0 ? 1 : 0.25;

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ScanLine frame={frame} from={local("hook", CUES.imAnAi)} to={local("hook", CUES.imAnAi) + 26} />

      {/* "● AI GENERATED" tag near her shoulder */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 930,
          transform: `scale(${tag}) translateY(${float(frame, 5, 80)}px)`,
          transformOrigin: "left center",
          opacity: tag > 0.01 ? 1 : 0,
        }}
      >
        <div
          style={{
            ...GLASS,
            borderRadius: 999,
            padding: "14px 26px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: FONTS.headline,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.22em",
            color: COLORS.gold,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: COLORS.gold,
              opacity: blink,
              boxShadow: `0 0 14px ${goldRgba(0.9)}`,
            }}
          />
          AI GENERATED
        </div>
      </div>

      {/* Grow / Leads / Autopilot chips, top-left (clear of her face) */}
      <div style={{ position: "absolute", left: 56, top: 150, display: "flex", flexDirection: "column", gap: 16 }}>
        {CHIPS.map((c, i) => {
          const at = local("hook", c.cue) - 3;
          const t = smooth(frame, fps, at, 14);
          const p = pop(frame, fps, at);
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              style={{
                ...GLASS,
                borderRadius: 22,
                padding: "14px 24px 14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: t,
                transform: `translateX(${(1 - t) * -80}px) translateY(${float(frame, 3, 90, i)}px)`,
                alignSelf: "flex-start",
              }}
            >
              <div style={{ transform: `scale(${p})`, display: "flex" }}>
                <Icon size={34} color={COLORS.gold} strokeWidth={ICON_STROKE} />
              </div>
              <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 30, color: COLORS.white }}>{c.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
