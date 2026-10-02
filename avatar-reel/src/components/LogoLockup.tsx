import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, pop, smooth } from "../anim";
import { LOGO } from "../scenes.config";
import { COLORS, FONTS, W } from "../theme";
import { GoldText } from "./GoldText";

/** "White & Gold" (Playfair 700 italic) over tracked "AI SOLUTIONS" (Montserrat). */
export const LogoLockup: React.FC<{ size?: number; glow?: number; style?: React.CSSProperties }> = ({
  size = 130,
  glow = 1,
  style,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
    <div
      style={{
        fontFamily: FONTS.brand,
        fontStyle: "italic",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.08,
        whiteSpace: "nowrap",
        color: COLORS.white,
        paddingRight: size * 0.06,
      }}
    >
      White <span style={{ color: COLORS.muted }}>&amp;</span> <GoldText glow={glow}>Gold</GoldText>
    </div>
    <div
      style={{
        fontFamily: FONTS.headline,
        fontWeight: 700,
        fontSize: size * 0.19,
        letterSpacing: "0.55em",
        marginRight: "-0.55em",
        marginTop: size * 0.1,
        color: COLORS.gold,
        whiteSpace: "nowrap",
      }}
    >
      AI SOLUTIONS
    </div>
  </div>
);

const BIG = 132;
const SMALL = 40;
const CENTER_Y = 820;
const WATERMARK_Y = 150;

/**
 * Global logo: springs in big and centred during the brand reveal, then
 * shrinks to a top-centre watermark that stays to the end.
 */
export const BrandLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < LOGO.reveal) return null;

  const enter = pop(frame, fps, LOGO.reveal);
  const shrink = smooth(frame, fps, LOGO.shrink, 20);
  const scale = interpolate(enter, [0, 1], [0.8, 1]) * lerp(1, SMALL / BIG, shrink);
  const y = lerp(CENTER_Y, WATERMARK_Y, shrink);
  const opacity = interpolate(frame, [LOGO.reveal, LOGO.reveal + 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: W / 2,
          top: y,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity: opacity * lerp(1, 0.9, shrink),
          filter: shrink > 0.5 ? "drop-shadow(0 2px 10px rgba(0,0,0,0.7))" : undefined,
        }}
      >
        <LogoLockup size={BIG} glow={lerp(1.8, 0.8, shrink)} />
      </div>
    </AbsoluteFill>
  );
};
