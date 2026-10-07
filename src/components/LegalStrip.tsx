import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { assets } from "../data/assets";
import { CLAMP } from "../lib/anim";
import { COLORS, FONT_FAMILY } from "../lib/theme";

/** MahaRERA number + QR. Required on every price / end screen. */
export const LegalStrip: React.FC<{ rera: string; delay?: number; qrSize?: number; extra?: string; style?: React.CSSProperties }> = ({
  rera,
  delay = 0,
  qrSize = 150,
  extra,
  style,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 6], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: 16,
        paddingRight: 30,
        borderRadius: 22,
        background: "rgba(11,11,11,0.72)",
        border: "1.5px solid rgba(255,255,255,0.18)",
        opacity: o,
        transform: `translateY(${(1 - o) * 30}px)`,
        ...style,
      }}
    >
      <div style={{ background: "#fff", padding: 8, borderRadius: 10, lineHeight: 0 }}>
        <Img src={staticFile(assets.reraQr.src)} style={{ width: qrSize, height: qrSize * (352 / 380) }} />
      </div>
      <div style={{ fontFamily: FONT_FAMILY, color: COLORS.white }}>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: "0.1em", color: COLORS.gold }}>MahaRERA NO.</div>
        <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: "0.02em" }}>{rera}</div>
        <div style={{ fontWeight: 500, fontSize: 20, opacity: 0.8, marginTop: 4 }}>maharera.maharashtra.gov.in</div>
        {extra ? <div style={{ fontWeight: 700, fontSize: 22, opacity: 0.9, marginTop: 4 }}>{extra}</div> : null}
      </div>
    </div>
  );
};
