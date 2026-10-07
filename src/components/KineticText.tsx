import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, Direction, directionalTransform, exitProgress, punch, velocityBlur } from "../lib/anim";
import { accentStyle, parseRich } from "../lib/Rich";
import { COLORS, FONT_FAMILY } from "../lib/theme";

type Props = {
  text: string;
  delay?: number;
  from?: Direction;
  exitAt?: number;
  exitTo?: Direction;
  size?: number;
  weight?: number;
  color?: string;
  accent?: "gold" | "solid" | string;
  /** frames between words; 0 = the whole block moves as one */
  stagger?: number;
  distance?: number;
  lineHeight?: number;
  tracking?: number;
  align?: "left" | "center" | "right";
  damping?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
};

/**
 * Typography that never just fades: it flies in from a direction with
 * overshoot, smears with velocity-driven blur and leaves aggressively.
 */
export const KineticText: React.FC<Props> = ({
  text,
  delay = 0,
  from = "bottom",
  exitAt,
  exitTo = "top",
  size = 96,
  weight = 900,
  color = COLORS.white,
  accent = "gold",
  stagger = 0,
  distance = 520,
  lineHeight = 1.02,
  tracking = -0.02,
  align = "center",
  damping = 12,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = parseRich(text);
  const exit = exitProgress(frame, exitAt, 8);
  let wordIndex = 0;

  const piece = (d: number) => {
    const p = (f: number) => punch(f, fps, d, damping);
    const progress = p(frame);
    const blur = velocityBlur(p, frame, 70, 18) + exit * 16;
    const horizontal = from === "left" || from === "right";
    const skew = horizontal ? (from === "left" ? -1 : 1) * Math.min(14, Math.abs(p(frame) - p(frame - 1)) * 60) : 0;
    const opacity = interpolate(frame - d, [0, 3], [0, 1], CLAMP) * (1 - exit);
    const enter = directionalTransform(from, 1 - progress, distance);
    const leave = directionalTransform(exitTo, exit, distance * 1.6);
    return {
      opacity,
      filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
      transform: `${enter} ${leave} skewX(${skew}deg)`,
    };
  };

  const block = stagger === 0 ? piece(delay) : null;

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: `${tracking}em`,
        color,
        textAlign: align,
        textShadow: shadow ? "0 6px 30px rgba(0,0,0,0.55)" : undefined,
        ...block,
        ...style,
      }}
    >
      {lines.map((tokens, li) => (
        <div key={li} style={{ display: "block", whiteSpace: "nowrap" }}>
          {tokens.map((tok, ti) => {
            if (tok.space) return <span key={ti}> </span>;
            const s = stagger > 0 ? piece(delay + stagger * wordIndex++) : undefined;
            // Gradient-clipped text can't use text-shadow (it bleeds through), so
            // accent words get a drop-shadow filter instead.
            const filter = [s?.filter, tok.accent && shadow ? "drop-shadow(0 6px 24px rgba(0,0,0,0.45))" : undefined]
              .filter(Boolean)
              .join(" ");
            return (
              <span
                key={ti}
                style={{
                  display: "inline-block",
                  paddingBottom: "0.08em",
                  ...s,
                  ...(tok.accent ? { ...accentStyle(accent), textShadow: "none" } : {}),
                  filter: filter || undefined,
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
