import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, exitProgress, punch } from "../lib/anim";
import { accentStyle } from "../lib/Rich";
import { FONT_FAMILY } from "../lib/theme";

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  /** frames to count up from 0; 0 = show final value immediately */
  countFrames?: number;
  size?: number;
  suffixScale?: number;
  pulseAt?: number;
  exitAt?: number;
  color?: "gold" | string;
  style?: React.CSSProperties;
};

/** Oversized numbers: opacity 0 / scale 1.4 / blur 12 → crisp, with overshoot. */
export const NumberReveal: React.FC<Props> = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delay = 0,
  countFrames = 0,
  size = 300,
  suffixScale = 0.42,
  pulseAt,
  exitAt,
  color = "gold",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const p = punch(frame, fps, delay, 11, 170);
  const scale = 1.4 - 0.4 * p;
  const blur = interpolate(local, [0, 10], [12, 0], CLAMP);
  const opacity = interpolate(local, [0, 5], [0, 1], CLAMP);
  const count =
    countFrames > 0 ? interpolate(local, [0, countFrames], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }) : 1;
  const shown = (value * count).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const pulse =
    pulseAt === undefined ? 0 : Math.sin(Math.PI * interpolate(frame, [pulseAt, pulseAt + 12], [0, 1], CLAMP));
  const exit = exitProgress(frame, exitAt, 7);

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.045em",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        opacity: opacity * (1 - exit),
        transform: `scale(${scale * (1 + 0.07 * pulse) * (1 + exit * 0.5)})`,
        filter: `blur(${blur + exit * 18}px) drop-shadow(0 0 ${40 * pulse}px rgba(245,184,46,0.85)) drop-shadow(0 10px 30px rgba(0,0,0,0.5))`,
        ...style,
      }}
    >
      <span style={accentStyle(color)}>
        {prefix}
        {shown}
      </span>
      {suffix ? <span style={{ ...accentStyle(color), fontSize: `${suffixScale}em`, marginLeft: "0.06em" }}>{suffix}</span> : null}
    </div>
  );
};
