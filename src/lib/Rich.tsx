import React from "react";
import { COLORS, GOLD_GRADIENT } from "./theme";

/** Splits "आपके [BUDGET] में" into tokens; bracketed words get the accent. */
export const parseRich = (text: string) =>
  text.split("\n").map((line) =>
    line
      .split(/(\[[^\]]+\])/g)
      .filter(Boolean)
      .flatMap((chunk) => {
        const accent = chunk.startsWith("[");
        const clean = accent ? chunk.slice(1, -1) : chunk;
        return clean
          .split(/(\s+)/)
          .filter((w) => w.length > 0)
          .map((w) => ({ text: w, accent, space: /^\s+$/.test(w) }));
      }),
  );

export const accentStyle = (accent: "gold" | "solid" | string = "gold"): React.CSSProperties =>
  accent === "gold"
    ? {
        backgroundImage: GOLD_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }
    : { color: accent === "solid" ? COLORS.gold : accent };
