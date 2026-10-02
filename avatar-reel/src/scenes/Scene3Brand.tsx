import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { progress } from "../anim";
import { CUES, LOGO, local } from "../scenes.config";
import { W, goldRgba } from "../theme";

const L = (cue: number) => local("brand", cue);

/**
 * Hidden moment 3 — brand reveal. A gold light sweep crosses the black frame,
 * then the global <BrandLogo/> springs in and later shrinks to the watermark.
 */
export const Scene3Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = progress(frame, L(LOGO.sweep), L(LOGO.sweep) + 18);
  const halo = interpolate(
    frame,
    [L(LOGO.reveal), L(LOGO.reveal) + 10, L(LOGO.shrink), L(LOGO.shrink) + 16],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const pulse = 0.85 + 0.15 * Math.sin(frame / 8);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Light sweep */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-20%",
            bottom: "-20%",
            width: W * 0.55,
            left: interpolate(sweep, [0, 1], [-W * 0.7, W * 1.15]),
            background: `linear-gradient(90deg, transparent, ${goldRgba(0.1)} 30%, rgba(245,210,122,0.55) 50%, ${goldRgba(0.1)} 70%, transparent)`,
            transform: "skewX(-18deg)",
          }}
        />
      </AbsoluteFill>
      {/* Halo behind the logo */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 520,
          top: 820 - 360,
          width: 1040,
          height: 720,
          background: `radial-gradient(ellipse at center, ${goldRgba(0.22 * pulse)} 0%, transparent 65%)`,
          opacity: halo,
        }}
      />
      {/* Thin gold rule under the logo */}
      <div
        style={{
          position: "absolute",
          left: W / 2,
          top: 960,
          height: 2,
          width: 600 * progress(frame, L(CUES.white) + 6, L(CUES.white) + 26),
          transform: "translateX(-50%)",
          background: `linear-gradient(90deg, transparent, ${goldRgba(0.9)}, transparent)`,
          opacity: halo,
        }}
      />
    </AbsoluteFill>
  );
};
