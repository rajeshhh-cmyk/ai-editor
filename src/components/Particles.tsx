import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/** Ambient gold dust so graphic-only moments never sit perfectly still. */
export const Particles: React.FC<{ count?: number; seed?: string; opacity?: number }> = ({ count = 40, seed = "p", opacity = 0.7 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r = (k: string) => random(`${seed}${k}${i}`);
        const size = 3 + r("s") * 9;
        const x = r("x") * 1080 + Math.sin((frame + r("p") * 200) / (30 + r("w") * 40)) * 30;
        const y = ((r("y") * 1920 - frame * (0.6 + r("v") * 2.2)) % 1920 + 1920) % 1920;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin((frame + r("t") * 100) / 14));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: "#FFD877",
              opacity: opacity * tw * (0.3 + r("o") * 0.7),
              filter: `blur(${size > 8 ? 2 : 0}px)`,
              boxShadow: "0 0 12px rgba(245,184,46,0.9)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
