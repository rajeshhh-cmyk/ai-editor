import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, pop, smooth } from "../anim";
import { LOGO } from "../scenes.config";
import { W, goldRgba } from "../theme";

/** The White & Gold AI Solutions Inc. badge (public/logo.png). `size` is its diameter in px. */
export const LogoLockup: React.FC<{ size?: number; glow?: number; style?: React.CSSProperties }> = ({
  size = 400,
  glow = 1,
  style,
}) => (
  <Img
    src={staticFile("logo.png")}
    style={{
      width: size,
      height: size,
      display: "block",
      filter: glow > 0 ? `drop-shadow(0 0 ${Math.round(40 * glow)}px ${goldRgba(Math.min(0.35 * glow, 0.7))})` : undefined,
      ...style,
    }}
  />
);

/** Badge diameter: centred reveal → top-centre watermark. */
const BIG = 560;
const SMALL = 100;
const CENTER_Y = 820;
const WATERMARK_Y = 128;

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
                  }}
      >
        <LogoLockup size={BIG} glow={lerp(1.8, 0.8, shrink)} />
      </div>
    </AbsoluteFill>
  );
};
