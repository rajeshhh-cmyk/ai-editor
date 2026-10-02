import { ArrowDown, MessageSquare } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, smooth } from "../anim";
import { ScanLine } from "../components/ScanLine";
import { CUES, local } from "../scenes.config";
import { COLORS, FONTS, GLASS, GOLD_GRADIENT, ICON_STROKE, goldRgba } from "../theme";

const L = (cue: number) => local("cta", cue);
const WORD = "GROW";
const BURST = 40;
const FACE = { x: 540, y: 500 };

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Soft gold particle burst around her on "this naturally".
  const burstAt = L(CUES.thisNaturally);
  const bt = progress(frame, burstAt, burstAt + 40);

  // Final comment box.
  const boxAt = L(CUES.comment) - 4;
  const box = smooth(frame, fps, boxAt, 16);
  const typeStart = boxAt + 12;
  const chars = Math.floor(interpolate(frame, [typeStart, typeStart + 16], [0, WORD.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const cursor = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;
  const glow = 30 + Math.sin(frame / 5) * 16;
  const arrowIn = progress(frame, boxAt + 16, boxAt + 26);
  const bounce = Math.abs(Math.sin(frame / 6)) * 22;

  return (
    <AbsoluteFill>
      {/* particle burst */}
      {bt > 0 && bt < 1
        ? new Array(BURST).fill(0).map((_, i) => {
            const a = random(`ba${i}`) * Math.PI * 2;
            // Start on a ring around her head so the burst never covers her face.
            const r = 300 + bt * (180 + random(`bd${i}`) * 320);
            const size = 4 + random(`bs${i}`) * 8;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: FACE.x + Math.cos(a) * r,
                  top: FACE.y + Math.sin(a) * r * 1.3,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: COLORS.goldLight,
                  opacity: Math.sin(bt * Math.PI) * 0.8,
                  boxShadow: `0 0 ${size * 3}px ${goldRgba(0.9)}`,
                }}
              />
            );
          })
        : null}
      <ScanLine frame={frame} from={burstAt + 2} to={burstAt + 28} />

      {/* Comment box */}
      <div
        style={{
          position: "absolute",
          left: 70,
          width: 940,
          top: interpolate(box, [0, 1], [1920, 1000]),
          opacity: box,
        }}
      >
        <div
          style={{
            ...GLASS,
            padding: "30px 36px",
            display: "flex",
            alignItems: "center",
            gap: 26,
            boxShadow: `0 0 ${glow}px ${goldRgba(0.35)}, 0 30px 80px rgba(0,0,0,0.6)`,
          }}
        >
          <MessageSquare size={64} color={COLORS.gold} strokeWidth={ICON_STROKE} />
          <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 54, color: COLORS.white }}>Comment</span>
          <div
            style={{
              marginLeft: "auto",
              minWidth: 300,
              padding: "16px 36px",
              borderRadius: 999,
              backgroundImage: GOLD_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.headline,
              fontWeight: 800,
              fontSize: 64,
              letterSpacing: "0.04em",
              color: COLORS.black,
              boxShadow: `0 0 ${glow + 10}px ${goldRgba(0.6)}`,
            }}
          >
            {WORD.slice(0, chars)}
            <span style={{ width: 5, height: 60, marginLeft: 6, background: COLORS.black, opacity: cursor }} />
          </div>
        </div>
      </div>

      {/* Bouncing arrow toward Instagram's comment area */}
      <div
        style={{
          position: "absolute",
          left: 540 - 36,
          top: 1560 + bounce,
          opacity: arrowIn,
          filter: `drop-shadow(0 0 16px ${goldRgba(0.8)})`,
        }}
      >
        <ArrowDown size={72} color={COLORS.gold} strokeWidth={2} />
      </div>
    </AbsoluteFill>
  );
};
