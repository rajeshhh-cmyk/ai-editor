import { Package, Settings, X } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, float, pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, GOLD_GLOW_FILTER, HEADLINE_STYLE, ICON_STROKE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

const BAD_TEXT = "BAD PRODUCTS?";

/** Gold-X'd package that gives way to a cog cracking in two. */
const HookIcon: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pkgIn = pop(frame, fps, 6);
  const xDraw = progress(frame, local("hook", CUES.but) - 4, local("hook", CUES.but) + 6);
  const pkgOut = fadeOut(frame, local("hook", CUES.broken) - 8, local("hook", CUES.broken));

  const cogIn = pop(frame, fps, local("hook", CUES.broken));
  const split = smooth(frame, fps, local("hook", CUES.processes) + 4, 20);
  const crackDraw = progress(frame, local("hook", CUES.processes) - 2, local("hook", CUES.processes) + 8);
  const spin = frame * 1.2 * (1 - split);

  const half = (side: "left" | "right") => {
    const dir = side === "left" ? -1 : 1;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath:
            side === "left"
              ? "polygon(0 0, 52% 0, 44% 35%, 56% 55%, 46% 100%, 0 100%)"
              : "polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 56% 55%, 44% 35%)",
          transform: `translate(${dir * split * size * 0.22}px, ${split * size * 0.06}px) rotate(${dir * split * 14}deg)`,
        }}
      >
        <Settings
          size={size}
          color={COLORS.gold}
          strokeWidth={ICON_STROKE}
          style={{ transform: `rotate(${spin}deg)`, filter: GOLD_GLOW_FILTER }}
        />
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width: size, height: size, transform: `translateY(${float(frame, 6)}px)` }}>
      {/* Package with gold X */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: pkgOut,
          transform: `scale(${pkgIn})`,
        }}
      >
        <Package size={size} color={COLORS.white} strokeWidth={ICON_STROKE} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            clipPath: `inset(0 ${100 - xDraw * 100}% 0 0)`,
          }}
        >
          <X size={size * 1.15} color={COLORS.gold} strokeWidth={ICON_STROKE * 1.4} style={{ filter: GOLD_GLOW_FILTER }} />
        </div>
      </div>

      {/* Cog cracking into two halves */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cogIn})`, opacity: cogIn > 0.01 ? 1 : 0 }}>
        {half("left")}
        {half("right")}
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0, opacity: 1 - split * 0.4 }}
        >
          <polyline
            points="52,0 44,35 56,55 46,100"
            fill="none"
            stroke={COLORS.goldLight}
            strokeWidth={1.2}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - crackDraw}
          />
        </svg>
      </div>
    </div>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useLayout();

  // "BAD PRODUCTS?" types in so it completes as "products" is spoken.
  const typeStart = local("hook", CUES.bad) - 26;
  const typeEnd = local("hook", CUES.bad) + 12;
  const chars = Math.floor(interpolate(frame, [typeStart, typeEnd], [0, BAD_TEXT.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const caretOn = frame < typeEnd + 6 && Math.floor(frame / 8) % 2 === 0;
  const strike = smooth(frame, fps, local("hook", CUES.but) - 2, 12);
  const badOut = fadeOut(frame, local("hook", CUES.broken) - 8, local("hook", CUES.broken));

  // "BROKEN PROCESSES." slams in on "broken".
  const slamAt = local("hook", CUES.broken);
  const slam = pop(frame, fps, slamAt);
  const slamScale = interpolate(slam, [0, 1], [1.9, 1]);
  const shakeT = frame - slamAt - 3;
  const shaking = shakeT >= 0 && shakeT < 6;
  const shakeX = shaking ? Math.sin(shakeT * 2.7) * 3 : 0;
  const shakeY = shaking ? Math.cos(shakeT * 3.3) * 2 : 0;

  const fontSize = 104 * s;

  return (
    <Stage offset={{ x: shakeX, y: shakeY }}>
      <HookIcon size={240 * s} />
      <div style={{ position: "relative", marginTop: 90 * s, height: fontSize * 2.2, width: "100%" }}>
        {/* BAD PRODUCTS? */}
        <div
          style={{
            ...HEADLINE_STYLE,
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            color: COLORS.white,
            opacity: badOut,
            whiteSpace: "pre",
          }}
        >
          <span style={{ position: "relative" }}>
            {BAD_TEXT.slice(0, chars)}
            <span style={{ opacity: caretOn ? 1 : 0, color: COLORS.gold }}>|</span>
            <span style={{ visibility: "hidden" }}>{BAD_TEXT.slice(chars)}</span>
            <span
              style={{
                position: "absolute",
                left: -12,
                top: "50%",
                height: 10 * s,
                width: `calc(${strike * 100}% + 24px)`,
                background: COLORS.gold,
                borderRadius: 6,
                boxShadow: `0 0 30px ${goldRgba(0.6)}`,
                transform: "translateY(-50%) rotate(-3deg)",
                opacity: strike > 0.01 ? 1 : 0,
              }}
            />
          </span>
        </div>

        {/* BROKEN PROCESSES. */}
        <div
          style={{
            ...HEADLINE_STYLE,
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize * 1.02,
            opacity: interpolate(frame, [slamAt, slamAt + 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `scale(${slamScale})`,
          }}
        >
          <GoldText glow={1.4}>BROKEN</GoldText>
          <GoldText glow={1.4}>PROCESSES.</GoldText>
        </div>
      </div>
    </Stage>
  );
};
