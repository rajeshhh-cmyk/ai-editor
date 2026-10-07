import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, punch } from "../lib/anim";
import { COLORS, FONT_FAMILY, GOLD_GRADIENT } from "../lib/theme";

type Props = {
  label: string;
  /** swap to this label at swapAt */
  label2?: string;
  swapAt?: number;
  delay?: number;
  pressAt?: number;
  width?: number;
  showArrows?: boolean;
};

/** Gold CTA pill: punches in, shine sweeps, breathes, and gets "tapped". */
export const CTAButton: React.FC<Props> = ({ label, label2, swapAt, delay = 0, pressAt, width = 820, showArrows = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch(frame, fps, delay, 10, 200);
  const local = frame - delay;
  const breathe = 1 + 0.025 * Math.sin(local / 6);
  const press = pressAt === undefined ? 0 : interpolate(frame, [pressAt, pressAt + 3, pressAt + 9], [0, 1, 0], CLAMP);
  const shineX = ((local * 22) % 1800) - 400;
  const swapped = swapAt !== undefined && frame >= swapAt;
  const swapP = swapAt === undefined ? 1 : punch(frame, fps, swapAt, 12, 220);
  const text = swapped && label2 ? label2 : label;
  const tapX = interpolate(frame, [pressAt ?? 0, (pressAt ?? 0) + 3], [40, 0], CLAMP);

  return (
    <div style={{ position: "relative", width, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width,
          height: 150,
          borderRadius: 75,
          background: GOLD_GRADIENT,
          boxShadow: `0 20px 60px rgba(245,184,46,${0.45 + 0.3 * Math.sin(local / 6)}), inset 0 3px 0 rgba(255,255,255,0.6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          transform: `scale(${p * breathe * (1 - press * 0.08)})`,
          opacity: interpolate(local, [0, 3], [0, 1], CLAMP),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: shineX,
            width: 140,
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-20deg)",
          }}
        />
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: text.length > 14 ? 54 : 66,
            color: COLORS.black,
            letterSpacing: "0.02em",
            transform: `translateY(${swapped ? (1 - Math.min(swapP, 1)) * 60 : 0}px)`,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </div>
      {pressAt !== undefined && frame >= pressAt - 6 ? (
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 70,
            transform: `translate(${tapX}px, ${tapX}px) scale(${1 - press * 0.12})`,
            opacity: interpolate(frame, [pressAt - 6, pressAt - 2], [0, 1], CLAMP),
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
          }}
        >
          <svg width="150" height="150" viewBox="0 0 100 100" style={{ position: "absolute", left: -75, top: -75 }}>
            <circle cx="50" cy="50" r={12 + 36 * interpolate(frame, [pressAt, pressAt + 12], [0, 1], CLAMP)} fill="none" stroke="#fff" strokeWidth="4" opacity={interpolate(frame, [pressAt, pressAt + 12], [0.9, 0], CLAMP)} />
          </svg>
          <svg width="80" height="100" viewBox="0 0 40 50">
            <path d="M4 2 L4 38 L13 30 L19 46 L26 43 L20 27 L32 27 Z" fill="#fff" stroke={COLORS.black} strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
      {showArrows ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 30 }}>
          {[0, 1, 2].map((i) => {
            const t = ((local - i * 4) % 24) / 24;
            return (
              <svg key={i} width="70" height="34" viewBox="0 0 70 34" style={{ opacity: local < 0 ? 0 : 0.25 + 0.75 * Math.max(0, Math.sin(t * Math.PI)), marginTop: -6 }}>
                <path d="M8 6 L35 28 L62 6" fill="none" stroke={COLORS.gold} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
