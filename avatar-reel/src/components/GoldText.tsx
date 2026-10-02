import React from "react";
import { GOLD_GRADIENT, goldRgba } from "../theme";

export const GoldText: React.FC<{ children: React.ReactNode; glow?: number; style?: React.CSSProperties }> = ({
  children,
  glow = 1,
  style,
}) => (
  <span
    style={{
      backgroundImage: GOLD_GRADIENT,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      WebkitTextFillColor: "transparent",
      filter: glow > 0 ? `drop-shadow(0 0 ${Math.round(40 * glow)}px ${goldRgba(Math.min(0.35 * glow, 0.8))})` : undefined,
      ...style,
    }}
  >
    {children}
  </span>
);
