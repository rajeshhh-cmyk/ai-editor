import type { LucideIcon } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop, progress, smooth } from "../anim";
import { COLORS, FONTS, HEADLINE, goldRgba } from "../theme";
import { IconRing } from "./IconRing";

/**
 * Graphics-only chapter card: a giant gold-outline numeral draws its stroke,
 * the title slides up beneath it, and a hero icon sits in a gold ring.
 * `out` is the local frame where the avatar comes back.
 */
export const ChapterCard: React.FC<{ num: string; title: string; icon: LucideIcon; out: number }> = ({
  num,
  title,
  icon,
  out,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = smooth(frame, fps, 0, 12);
  const draw = progress(frame, 2, 24);
  const fill = progress(frame, 18, 30);
  const titleIn = smooth(frame, fps, 8, 14);
  const ring = pop(frame, fps, 4);
  const exit = interpolate(frame, [out - 2, out + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 380,
        opacity: exit,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1]) * interpolate(exit, [0, 1], [1.06, 1])})`,
      }}
    >
      <div style={{ transform: `scale(${ring})`, marginBottom: 30 }}>
        <IconRing icon={icon} size={170} progress={progress(frame, 4, 22)} lit={1} />
      </div>
      <svg width={760} height={380} viewBox="0 0 760 380" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`num-${num}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.goldLight} />
            <stop offset="50%" stopColor={COLORS.gold} />
            <stop offset="100%" stopColor={COLORS.goldDark} />
          </linearGradient>
        </defs>
        <text
          x="380"
          y="320"
          textAnchor="middle"
          fontFamily={FONTS.headline}
          fontWeight={800}
          fontSize={380}
          letterSpacing="-10"
          fill={`url(#num-${num})`}
          fillOpacity={fill * 0.12}
          stroke={`url(#num-${num})`}
          strokeWidth={4}
          strokeDasharray={2400}
          strokeDashoffset={2400 * (1 - draw)}
          style={{ filter: `drop-shadow(0 0 30px ${goldRgba(0.45)})` }}
        >
          {num}
        </text>
      </svg>
      <div
        style={{
          ...HEADLINE,
          fontSize: title.length > 12 ? 78 : 104,
          color: COLORS.white,
          textAlign: "center",
          marginTop: 10,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 60}px)`,
          clipPath: `inset(0 0 ${(1 - titleIn) * 100}% 0)`,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};

/** Small "01 · CONTENT" label pinned to the card's top-left while she explains. */
export const SectionLabel: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = smooth(frame, fps, start, 14);
  const line = progress(frame, start + 4, start + 22);
  return (
    <div style={{ position: "absolute", left: 116, top: 214, opacity: t, transform: `translateX(${(1 - t) * -30}px)` }}>
      <div
        style={{
          fontFamily: FONTS.headline,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.35em",
          color: COLORS.gold,
          padding: "10px 18px",
          background: "rgba(10,10,10,0.6)",
          borderRadius: 12,
          backdropFilter: "blur(10px)",
        }}
      >
        {text}
        <div style={{ height: 2, marginTop: 8, width: `${line * 100}%`, background: COLORS.gold, boxShadow: `0 0 10px ${goldRgba(0.7)}` }} />
      </div>
    </div>
  );
};
