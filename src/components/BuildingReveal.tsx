import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { MediaAsset } from "../data/assets";
import { CLAMP, punch, velocityBlur } from "../lib/anim";
import { COLORS } from "../lib/theme";
import { Media } from "./Media";

type Props = {
  asset: MediaAsset; // 3D model render, PNG-sequence video or still render
  duration: number;
  /** frame at which the camera rockets in */
  pushAt?: number;
  startScale?: number;
};

/**
 * 3D building entrance: the model starts as a small glowing object in a black
 * void, then the "camera" rockets towards it until it fills the frame.
 * Remotion only composites — the model itself comes from the supplied render.
 */
export const BuildingReveal: React.FC<Props> = ({ asset, duration, pushAt = 8, startScale = 0.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (f: number) => punch(f, fps, pushAt, 16, 120);
  const progress = p(frame);
  const scale = startScale + (1 - startScale) * progress;
  const idle = interpolate(frame, [0, pushAt], [0.9, 1], CLAMP);
  const radius = interpolate(progress, [0, 1], [48, 0], CLAMP);
  const blur = velocityBlur(p, frame, 40, 10);
  const glow = interpolate(progress, [0, 1], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ background: COLORS.black }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(245,184,46,${0.35 * glow}) 0%, rgba(18,61,145,${0.25 * glow}) 30%, rgba(0,0,0,0) 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          transform: `scale(${scale * idle}) rotate(${interpolate(progress, [0, 1], [-4, 0], CLAMP)}deg)`,
          borderRadius: radius / Math.max(scale, 0.01),
          overflow: "hidden",
          filter: `blur(${blur}px)`,
          boxShadow: `0 0 ${160 * glow}px rgba(245,184,46,${0.6 * glow})`,
        }}
      >
        <Media asset={asset} duration={duration} from={{ scale: 1.25 }} to={{ scale: 1.05, y: -40 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
