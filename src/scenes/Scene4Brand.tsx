import { PhoneCall } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { IconRing } from "../components/IconRing";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, FONTS, HEADLINE_STYLE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

/** Three gold arcs radiating from the phone. */
const SoundWaves: React.FC<{ size: number; frame: number; side: 1 | -1 }> = ({ size, frame, side }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      position: "absolute",
      top: "50%",
      [side === 1 ? "left" : "right"]: "100%",
      transform: `translateY(-50%) scaleX(${side})`,
      overflow: "visible",
    }}
  >
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 9) % 27) / 27;
      const r = 18 + i * 16;
      return (
        <path
          key={i}
          d={`M ${r * Math.cos(-0.8)} ${50 + r * Math.sin(-0.8)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.8)} ${50 + r * Math.sin(0.8)}`}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.25 + 0.75 * Math.sin(t * Math.PI)}
          transform={`translate(${6 + t * 6} 0)`}
        />
      );
    })}
  </svg>
);

export const Scene4Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useLayout();

  // The logo itself is the global <BrandLogo/>; this scene shows service #1
  // once the logo has moved into the corner.
  const phoneAt = local("brand", CUES.logoShrink) + 14;
  const ringAt = local("brand", CUES.answerEveryCall) - 4;
  const phoneIn = pop(frame, fps, phoneAt);
  const ring = progress(frame, ringAt, ringAt + 22);
  const ringing = frame > ringAt ? Math.sin((frame - ringAt) * 1.6) * 6 * Math.max(0, Math.sin((frame - ringAt) / 9)) : 0;

  const badgeAt = local("brand", CUES.twentyFourSeven) - 3;
  const badgeIn = pop(frame, fps, badgeAt);
  const hours = Math.round(interpolate(frame, [badgeAt, badgeAt + 14], [0, 24], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sevenIn = pop(frame, fps, badgeAt + 14);

  const labelIn = smooth(frame, fps, local("brand", CUES.withAiVoiceAgents) - 2, 16);
  const iconSize = 250 * s;

  return (
    <Stage>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 64 * s,
          marginTop: 60 * s,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${phoneIn}) translateY(${float(frame, 6)}px)`,
            opacity: phoneIn > 0.01 ? 1 : 0,
          }}
        >
          <IconRing
            icon={PhoneCall}
            size={iconSize}
            progress={ring}
            lit={ring}
            iconStyle={{ transform: `rotate(${ringing}deg)` }}
          />
          {frame > ringAt + 6 ? (
            <>
              <SoundWaves size={iconSize * 0.7} frame={frame - ringAt} side={1} />
              <SoundWaves size={iconSize * 0.7} frame={frame - ringAt} side={-1} />
            </>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: `${18 * s}px ${70 * s}px ${24 * s}px`,
            borderRadius: 999,
            border: `1.5px solid ${COLORS.gold}`,
            background: `linear-gradient(180deg, ${goldRgba(0.12)}, ${goldRgba(0.02)})`,
            boxShadow: `0 0 ${40 + Math.sin(frame / 8) * 12}px ${goldRgba(0.3)}`,
            transform: `scale(${badgeIn})`,
            opacity: badgeIn > 0.01 ? 1 : 0,
          }}
        >
          <div style={{ ...HEADLINE_STYLE, fontSize: 150 * s, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            <GoldText glow={1.3}>{String(hours).padStart(2, "0")}</GoldText>
            <span style={{ display: "inline-block", transform: `scale(${sevenIn})`, opacity: sevenIn > 0.01 ? 1 : 0 }}>
              <GoldText glow={1.3}>/7</GoldText>
            </span>
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 24 * s,
              letterSpacing: "0.4em",
              color: COLORS.muted,
              marginTop: 6 * s,
            }}
          >
            EVERY CALL ANSWERED
          </div>
        </div>

        <div
          style={{
            ...HEADLINE_STYLE,
            fontSize: 64 * s,
            color: COLORS.white,
            opacity: labelIn,
            transform: `translateY(${(1 - labelIn) * 30}px)`,
            letterSpacing: "0.02em",
          }}
        >
          AI VOICE AGENTS
        </div>
      </div>
    </Stage>
  );
};
