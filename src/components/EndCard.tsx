import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { assets } from "../data/assets";
import type { AdData } from "../data/hornbill";
import { CLAMP, punch } from "../lib/anim";
import { COLORS, FONT_FAMILY, SAFE } from "../lib/theme";
import { CTAButton } from "./CTAButton";
import { GlassCard } from "./GlassCard";
import { KineticText } from "./KineticText";
import { LegalStrip } from "./LegalStrip";

type Timing = { logoAt: number; configAt: number; possessionAt: number; ctaAt: number; pressAt: number; swapAt: number; legalAt: number };

/** Reusable legal/CTA end card: logo, config, possession, CTA, QR + RERA + T&C. */
export const EndCard: React.FC<{ data: AdData; t: Timing }> = ({ data, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = data.copy.endCard;
  const logo = punch(frame, fps, t.logoAt, 11, 180);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 10,
          left: 540,
          width: 470,
          height: 300,
          marginLeft: -235,
          borderRadius: 34,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `scale(${logo}) rotate(${(1 - Math.min(logo, 1)) * -8}deg)`,
          opacity: interpolate(frame - t.logoAt, [0, 3], [0, 1], CLAMP),
        }}
      >
        <Img src={staticFile(assets.logoCard.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%", transform: "scale(1.25)" }} />
      </div>

      <div style={{ position: "absolute", top: SAFE.top + 340, width: "100%", display: "flex", justifyContent: "center" }}>
        <KineticText text={`${data.property.configurations} APARTMENTS`} delay={t.configAt} from="bottom" distance={140} size={50} weight={800} tracking={0.08} />
      </div>

      <GlassCard delay={t.possessionAt} tint="gold" style={{ top: SAFE.top + 440, left: 140, width: 800, height: 150, display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ fontFamily: FONT_FAMILY, color: COLORS.white, fontWeight: 700, fontSize: 32, letterSpacing: "0.1em", textAlign: "right", lineHeight: 1.15 }}>
          {c.possessionLabel.split(" ").map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div style={{ width: 3, height: 90, background: COLORS.gold }} />
        <div style={{ fontFamily: FONT_FAMILY, color: COLORS.gold, fontWeight: 900, fontSize: 76, letterSpacing: "-0.01em" }}>{data.property.possession}</div>
      </GlassCard>

      <div style={{ position: "absolute", top: SAFE.top + 650, width: "100%", display: "flex", justifyContent: "center" }}>
        <CTAButton label={c.button} label2={c.button2} swapAt={t.swapAt} delay={t.ctaAt} pressAt={t.pressAt} width={860} />
      </div>
      <div style={{ position: "absolute", top: SAFE.top + 935, width: "100%", display: "flex", justifyContent: "center" }}>
        <KineticText text={c.hint} delay={t.ctaAt + 8} from="bottom" distance={80} size={30} weight={700} tracking={0.14} color={COLORS.offWhite} />
      </div>

      <LegalStrip rera={data.property.rera} delay={t.legalAt} qrSize={170} extra={c.tnc} style={{ left: 90, top: 1920 - SAFE.bottom - 300 }} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1920 - SAFE.bottom - 80,
          height: 70,
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
          opacity: interpolate(frame - t.legalAt - 6, [0, 6], [0, 1], CLAMP),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img src={staticFile(assets.developerStrip.src)} style={{ height: 64 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1920 - SAFE.bottom + 6,
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          opacity: interpolate(frame - t.legalAt - 6, [0, 6], [0, 1], CLAMP),
        }}
      >
        {c.disclaimer}
      </div>
    </>
  );
};
