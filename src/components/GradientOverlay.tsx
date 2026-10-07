import React from "react";
import { AbsoluteFill } from "remotion";

type Props = {
  bottom?: number; // 0..1 strength of the bottom gradient
  top?: number;
  dim?: number; // flat darkening over everything
  color?: string; // rgb triplet "11,11,11"
  vignette?: boolean;
};

export const GradientOverlay: React.FC<Props> = ({ bottom = 0.85, top = 0.5, dim = 0, color = "11,11,11", vignette = true }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {dim > 0 ? <AbsoluteFill style={{ background: `rgba(${color},${dim})` }} /> : null}
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(${color},${top}) 0%, rgba(${color},0) 30%, rgba(${color},0) 48%, rgba(${color},${bottom}) 100%)`,
      }}
    />
    {vignette ? (
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    ) : null}
  </AbsoluteFill>
);
