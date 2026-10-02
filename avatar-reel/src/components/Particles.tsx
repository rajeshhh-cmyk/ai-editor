import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { COLORS, H, W, goldRgba } from "../theme";

/** Hidden-mode backdrop: #0A0A0A, faint gold grid (4%), centre radial gold vignette (8%). */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const grid = 90;
  const pan = (frame * 0.3) % grid;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          inset: -grid * 2,
          opacity: 0.04,
          backgroundImage: `linear-gradient(${COLORS.gold} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gold} 1px, transparent 1px)`,
          backgroundSize: `${grid}px ${grid}px`,
          transform: `translate(${pan}px, ${pan}px)`,
        }}
      />
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at 50% 45%, ${goldRgba(0.08)} 0%, transparent 60%)` }}
      />
    </AbsoluteFill>
  );
};

/** Deterministic floating gold dust. */
export const Particles: React.FC<{ count?: number; opacity?: number }> = ({ count = 34, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const ps = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: random(`px${i}`) * W,
        y: random(`py${i}`) * H,
        size: 2 + random(`ps${i}`) * 5,
        o: 0.15 + random(`po${i}`) * 0.25,
        speed: 0.25 + random(`pv${i}`) * 0.5,
        sway: 10 + random(`pw${i}`) * 25,
        phase: random(`pp${i}`) * Math.PI * 2,
      })),
    [count],
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {ps.map((p, i) => {
        const span = H + 40;
        const y = ((((p.y - frame * p.speed) % span) + span) % span) - 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + Math.sin(frame / 45 + p.phase) * p.sway,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: COLORS.gold,
              opacity: p.o * (0.75 + 0.25 * Math.sin(frame / 18 + p.phase)),
              boxShadow: `0 0 ${p.size * 3}px ${goldRgba(0.6)}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
