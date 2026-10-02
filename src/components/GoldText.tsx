import React from "react";
import { GOLD_GRADIENT, goldRgba } from "../theme";

/** Text filled with the gold gradient, with an optional soft gold glow. */
export const GoldText: React.FC<{
  children: React.ReactNode;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ children, glow = 1, style }) => {
  return (
    <span
      style={{
        backgroundImage: GOLD_GRADIENT,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        filter:
          glow > 0
            ? `drop-shadow(0 0 ${Math.round(40 * glow)}px ${goldRgba(0.35 * Math.min(glow, 2))})`
            : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
