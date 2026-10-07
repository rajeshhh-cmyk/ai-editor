import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, exitProgress, punch } from "../lib/anim";
import { COLORS, FONT_FAMILY } from "../lib/theme";
import { Icon } from "./icons";

type Props = {
  kind: string;
  label: string;
  delay: number;
  x: number;
  y: number;
  size?: number;
  exitAt?: number;
  /** where to fly on exit (e.g. the centre of the frame) */
  exitTarget?: { x: number; y: number };
};

/** IconPop: scale 0 → 1.15 → 1 with a twist, label snaps underneath. */
export const AmenityIcon: React.FC<Props> = ({ kind, label, delay, x, y, size = 190, exitAt, exitTarget }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch(frame, fps, delay, 9, 230);
  const labelP = punch(frame, fps, delay + 3, 14, 220);
  const exit = exitProgress(frame, exitAt, 9);
  const ex = exitTarget ? (exitTarget.x - x) * exit : 0;
  const ey = exitTarget ? (exitTarget.y - y) * exit : 0;
  const flash = interpolate(frame - delay, [0, 4, 12], [0, 1, 0], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: `translate(${ex}px, ${ey}px) scale(${1 - exit * 0.8})`,
        opacity: frame < delay ? 0 : 1 - exit,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          background: `rgba(11,11,11,0.62)`,
          border: `4px solid ${COLORS.gold}`,
          backdropFilter: "blur(14px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${p}) rotate(${(1 - Math.min(p, 1)) * -25}deg)`,
          boxShadow: `0 0 ${20 + flash * 70}px rgba(245,184,46,${0.35 + flash * 0.6})`,
        }}
      >
        <Icon kind={kind} size={size * 0.52} />
      </div>
      <div
        style={{
          position: "absolute",
          top: size / 2 + 14,
          left: 0,
          transform: `translateX(-50%) translateY(${(1 - labelP) * 30}px)`,
          opacity: interpolate(frame - delay - 3, [0, 4], [0, 1], CLAMP),
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: 38,
          color: COLORS.white,
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
          textShadow: "0 4px 18px rgba(0,0,0,0.8)",
        }}
      >
        {label}
      </div>
    </div>
  );
};
