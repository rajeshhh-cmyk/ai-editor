import React from "react";
import { Img, staticFile } from "remotion";
import { goldRgba } from "../theme";

/** The White & Gold AI Solutions Inc. badge (public/logo.png). `size` is its diameter in px. */
export const LogoLockup: React.FC<{
  size?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ size = 400, glow = 1, style }) => (
  <Img
    src={staticFile("logo.png")}
    style={{
      width: size,
      height: size,
      display: "block",
      filter: glow > 0 ? `drop-shadow(0 0 ${Math.round(40 * glow)}px ${goldRgba(Math.min(0.35 * glow, 0.7))})` : undefined,
      ...style,
    }}
  />
);
