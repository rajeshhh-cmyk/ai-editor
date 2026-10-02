import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, goldRgba } from "../theme";

const PARTICLE_COUNT = 36;

/**
 * Global backdrop: #0A0A0A + faint gold radial vignette, a slowly panning
 * diagonal gold grid at 4% opacity, and seeded drifting gold particles.
 * `glow` (0–1) lets a scene temporarily brighten the backdrop.
 */
export const Background: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(
    () =>
      new Array(PARTICLE_COUNT).fill(0).map((_, i) => ({
        x: random(`px-${i}`) * width,
        y: random(`py-${i}`) * height,
        size: 2 + random(`ps-${i}`) * 5,
        opacity: 0.15 + random(`po-${i}`) * 0.25,
        speed: 0.25 + random(`pv-${i}`) * 0.55,
        sway: 10 + random(`pw-${i}`) * 30,
        phase: random(`pp-${i}`) * Math.PI * 2,
      })),
    [width, height],
  );

  const gridSize = 90;
  const pan = (frame * 0.35) % gridSize;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, overflow: "hidden" }}>
      {/* Radial gold vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${goldRgba(
            0.08 + glow * 0.14,
          )} 0%, ${goldRgba(0)} 62%)`,
        }}
      />

      {/* Diagonal grid, slowly panning */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          inset: -gridSize * 2,
          backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.gold} 0 1px, transparent 1px ${gridSize}px), repeating-linear-gradient(-45deg, ${COLORS.gold} 0 1px, transparent 1px ${gridSize}px)`,
          transform: `translate(${pan}px, ${-pan}px)`,
        }}
      />

      {/* Drifting particles */}
      {particles.map((p, i) => {
        const travel = frame * p.speed;
        const y = ((p.y - travel) % (height + 40) + height + 40) % (height + 40) - 20;
        const x = p.x + Math.sin(frame / 45 + p.phase) * p.sway;
        const twinkle = 0.75 + 0.25 * Math.sin(frame / 20 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: COLORS.gold,
              opacity: p.opacity * twinkle,
              boxShadow: `0 0 ${p.size * 3}px ${goldRgba(0.6)}`,
            }}
          />
        );
      })}

      {/* Edge darkening for depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
