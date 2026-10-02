import React from "react";
import { COLORS, FONTS } from "../theme";
import { GoldText } from "./GoldText";

/**
 * "White & Gold" (Playfair Display 700 italic) over a tracked-out
 * "AI SOLUTIONS" (Montserrat). `size` is the brand-name font size.
 */
export const LogoLockup: React.FC<{
  size?: number;
  glow?: number;
  align?: "center" | "flex-start";
  style?: React.CSSProperties;
}> = ({ size = 130, glow = 1, align = "center", style }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.brand,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.05,
          whiteSpace: "nowrap",
          color: COLORS.white,
        }}
      >
        White <span style={{ color: COLORS.muted }}>&amp;</span>{" "}
        <GoldText glow={glow}>Gold</GoldText>
      </div>
      <div
        style={{
          fontFamily: FONTS.headline,
          fontWeight: 700,
          fontSize: size * 0.2,
          letterSpacing: "0.55em",
          marginTop: size * 0.12,
          marginRight: "-0.55em",
          color: COLORS.gold,
          whiteSpace: "nowrap",
        }}
      >
        AI SOLUTIONS
      </div>
    </div>
  );
};
