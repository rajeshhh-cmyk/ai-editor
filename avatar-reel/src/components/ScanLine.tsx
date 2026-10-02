import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COLORS, goldRgba } from "../theme";

/** Gold scan line sweeping top → bottom between `from` and `to` (local frames). */
export const ScanLine: React.FC<{ frame: number; from: number; to: number; top?: number; bottom?: number }> = ({
  frame,
  from,
  to,
  top = 0,
  bottom = 1920,
}) => {
  if (frame < from || frame > to) return null;
  const y = interpolate(frame, [from, to], [top, bottom]);
  const o = interpolate(frame, [from, from + 4, to - 4, to], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 160,
          height: 160,
          background: `linear-gradient(180deg, transparent, ${goldRgba(0.16)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          height: 3,
          background: COLORS.goldLight,
          boxShadow: `0 0 24px ${goldRgba(0.9)}, 0 0 60px ${goldRgba(0.5)}`,
        }}
      />
    </AbsoluteFill>
  );
};
