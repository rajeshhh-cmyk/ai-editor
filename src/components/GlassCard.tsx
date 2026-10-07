import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, Direction, directionalTransform, exitProgress, glide } from "../lib/anim";

type Props = {
  delay?: number;
  from?: Direction;
  exitAt?: number;
  exitTo?: Direction;
  tint?: "light" | "dark" | "gold" | "blue";
  radius?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const TINTS = {
  light: { background: "rgba(255,255,255,0.12)", border: "rgba(255,255,255,0.32)" },
  dark: { background: "rgba(10,10,10,0.55)", border: "rgba(255,255,255,0.16)" },
  gold: { background: "rgba(245,184,46,0.18)", border: "rgba(245,184,46,0.7)" },
  blue: { background: "rgba(18,61,145,0.55)", border: "rgba(120,160,255,0.35)" },
};

/** Translucent card with the CardPunch entrance: scale 0.85 → 1.08 → 1. */
export const GlassCard: React.FC<Props> = ({
  delay = 0,
  from = "center",
  exitAt,
  exitTo = "left",
  tint = "light",
  radius = 36,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const cardPunch = interpolate(local, [0, 5, 11], [0.85, 1.08, 1], CLAMP);
  const travel = from === "center" ? "" : directionalTransform(from, 1 - glide(frame, fps, delay, 10), 700);
  const exit = exitProgress(frame, exitAt, 8);
  const t = TINTS[tint];
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: radius,
        background: t.background,
        border: `2px solid ${t.border}`,
        backdropFilter: "blur(22px) saturate(140%)",
        WebkitBackdropFilter: "blur(22px) saturate(140%)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
        opacity: interpolate(local, [0, 3], [0, 1], CLAMP) * (1 - exit),
        transform: `${travel} ${directionalTransform(exitTo, exit, 1300)} scale(${cardPunch})`,
        filter: exit > 0 ? `blur(${exit * 16}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
