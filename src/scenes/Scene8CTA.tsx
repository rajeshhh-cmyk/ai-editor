import { ArrowRight, TrendingUp } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { LogoLockup } from "../components/LogoLockup";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, FONTS, GOLD_GRADIENT, HEADLINE_STYLE, ICON_STROKE, goldRgba } from "../theme";
import { CONTACT, CUES, END_CARD_FRAMES, local } from "../timeline";

/** Upward-trending line chart that draws itself behind the headline. */
const TrendChart: React.FC<{ draw: number }> = ({ draw }) => {
  const { stage } = useLayout();
  const w = stage.width;
  const h = stage.height * 0.7;
  const pts = [
    [0, 0.92], [0.12, 0.8], [0.22, 0.86], [0.34, 0.66], [0.46, 0.72],
    [0.58, 0.5], [0.7, 0.56], [0.82, 0.3], [1, 0.06],
  ].map(([x, y]) => `${x * w},${y * h}`);
  return (
    <svg
      width={w}
      height={h}
      style={{ position: "absolute", left: 0, top: (stage.height - h) / 2, opacity: 0.2, overflow: "visible" }}
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={COLORS.gold}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
      <polygon
        points={`${pts.join(" ")} ${w},${h} 0,${h}`}
        fill={goldRgba(0.25)}
        style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }}
      />
    </svg>
  );
};

export const Scene8CTA: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, stage } = useLayout();

  const stopAt = local("cta", CUES.stop);
  const startAt = local("cta", CUES.start);
  const endAt = durationInFrames - END_CARD_FRAMES;

  const stopIn = smooth(frame, fps, stopAt - 2, 12);
  const stopWipe = progress(frame, startAt - 10, startAt);

  const startIn = pop(frame, fps, startAt - 2);
  const chartDraw = progress(frame, startAt, startAt + 36);
  const pulse = 1 + Math.sin(frame / 6) * 0.25;

  const end = smooth(frame, fps, endAt, 18);
  const logoIn = pop(frame, fps, endAt + 2);
  const pillIn = pop(frame, fps, endAt + 8);
  const contactIn = smooth(frame, fps, endAt + 14, 12);
  const pillPulse = 1 + Math.sin(Math.max(0, frame - endAt) / 5) * 0.025;

  const headSize = 118 * s;
  // During the end card the headline glides to the top of the stage.
  const headY = interpolate(end, [0, 1], [0, -stage.height * 0.36]);
  const headScale = interpolate(end, [0, 1], [1, 0.52]);

  return (
    <>
      <Stage>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - end * 0.6 }}>
          <TrendChart draw={chartDraw} />
          <TrendingUp
            size={90 * s}
            color={COLORS.gold}
            strokeWidth={ICON_STROKE}
            style={{
              position: "absolute",
              right: 0,
              top: (stage.height - stage.height * 0.7) / 2 - 110 * s,
              opacity: chartDraw > 0.95 ? 0.5 : 0,
            }}
          />
        </div>

        {/* STOP RUNNING MANUALLY. — wipes away left → right */}
        <div
          style={{
            ...HEADLINE_STYLE,
            position: "absolute",
            fontSize: headSize * 0.92,
            color: COLORS.white,
            textAlign: "center",
            opacity: stopIn,
            transform: `translateY(${(1 - stopIn) * 40}px)`,
            clipPath: `inset(0 0 0 ${stopWipe * 100}%)`,
          }}
        >
          STOP RUNNING
          <br />
          MANUALLY.
        </div>
        {stopWipe > 0 && stopWipe < 1 ? (
          <div
            style={{
              position: "absolute",
              top: "30%",
              bottom: "30%",
              left: `${stopWipe * 100}%`,
              width: 4,
              background: GOLD_GRADIENT,
              boxShadow: `0 0 30px ${goldRgba(0.8)}`,
            }}
          />
        ) : null}

        {/* START SCALING WITH AI. */}
        <div
          style={{
            ...HEADLINE_STYLE,
            position: "absolute",
            fontSize: headSize,
            textAlign: "center",
            opacity: startIn > 0.01 ? 1 : 0,
            transform: `translateY(${headY}px) scale(${interpolate(startIn, [0, 1], [0.7, 1]) * headScale})`,
          }}
        >
          <GoldText glow={pulse * 1.3}>START SCALING</GoldText>
          <br />
          <GoldText glow={pulse * 1.3}>WITH AI.</GoldText>
        </div>

        {/* End card */}
        <div
          style={{
            position: "absolute",
            top: stage.height * 0.33,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 54 * s,
          }}
        >
          <div style={{ transform: `scale(${interpolate(logoIn, [0, 1], [0.8, 1])})`, opacity: logoIn > 0.01 ? Math.min(1, logoIn) : 0 }}>
            <LogoLockup size={124 * s} glow={1.4} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18 * s,
              padding: `${26 * s}px ${58 * s}px`,
              borderRadius: 999,
              backgroundImage: GOLD_GRADIENT,
              color: COLORS.black,
              fontFamily: FONTS.headline,
              fontWeight: 800,
              fontSize: 44 * s,
              letterSpacing: "-0.01em",
              boxShadow: `0 0 ${40 + Math.sin(frame / 5) * 16}px ${goldRgba(0.45)}`,
              transform: `scale(${pillIn * pillPulse})`,
              opacity: pillIn > 0.01 ? 1 : 0,
            }}
          >
            Book a Free Demo
            <ArrowRight size={46 * s} color={COLORS.black} strokeWidth={2} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8 * s,
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 32 * s,
              color: COLORS.muted,
              letterSpacing: "0.06em",
              opacity: contactIn,
            }}
          >
            <span>{CONTACT.website}</span>
            <span>{CONTACT.phone}</span>
          </div>
        </div>
      </Stage>
    </>
  );
};
