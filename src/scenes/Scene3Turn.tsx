import { Bot, Sparkles } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, progress, smooth } from "../anim";
import { IconRing } from "../components/IconRing";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, GOLD_GRADIENT, HEADLINE_STYLE, ICON_STROKE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

const Line: React.FC<{ text: string; delay: number; size: number }> = ({ text, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = smooth(frame, fps, delay, 16);
  return (
    <div
      style={{
        ...HEADLINE_STYLE,
        fontSize: size,
        color: COLORS.white,
        opacity: t,
        transform: `translateY(${(1 - t) * 40}px)`,
        clipPath: `inset(0 0 ${(1 - t) * 100}% 0)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export const Scene3Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { s, stage } = useLayout();

  // Hold black for a beat, then a thin gold line draws across the centre.
  const lineDraw = smooth(frame, fps, 6, 22);
  const rise = pop(frame, fps, local("turn", CUES.aiPowered) - 4);
  const iconSize = 230 * s;

  // Light sweep on "change everything".
  const sweep = progress(frame, local("turn", CUES.change), local("turn", CUES.everything) + 18);

  const lineY = stage.height * 0.42;

  return (
    <>
      <Stage>
        <div style={{ position: "relative", width: "100%", height: stage.height }}>
          {/* Icon rising out of the line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: lineY - iconSize - 60 * s,
              height: iconSize + 60 * s,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                marginTop: 20 * s,
                transform: `translateY(${interpolate(rise, [0, 1], [iconSize + 60 * s, 0]) + float(frame, 5)}px)`,
              }}
            >
              <IconRing icon={Bot} size={iconSize} progress={rise} lit={1} iconScale={0.48}>
                <Sparkles
                  size={iconSize * 0.24}
                  color={COLORS.goldLight}
                  strokeWidth={ICON_STROKE}
                  style={{
                    position: "absolute",
                    right: -iconSize * 0.04,
                    top: -iconSize * 0.04,
                    transform: `rotate(${Math.sin(frame / 10) * 12}deg) scale(${1 + Math.sin(frame / 7) * 0.08})`,
                  }}
                />
              </IconRing>
            </div>
          </div>

          {/* Gold line */}
          <div
            style={{
              position: "absolute",
              top: lineY,
              left: "50%",
              width: `${lineDraw * 100}%`,
              height: 2,
              transform: "translateX(-50%)",
              background: `linear-gradient(90deg, transparent, ${COLORS.gold} 15%, ${COLORS.goldLight} 50%, ${COLORS.gold} 85%, transparent)`,
              boxShadow: `0 0 24px ${goldRgba(0.6)}`,
            }}
          />

          {/* Words */}
          <div
            style={{
              position: "absolute",
              top: lineY + 70 * s,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18 * s,
            }}
          >
            <Line text="AI VOICE AGENTS" delay={local("turn", CUES.voiceAgents) - 4} size={80 * s} />
            <Line text="PROCESS AUTOMATION" delay={local("turn", CUES.processAutomation) - 4} size={80 * s} />
          </div>
        </div>
      </Stage>

      {/* Full-frame shimmer sweep */}
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
        <div
          style={{
            position: "absolute",
            top: "-20%",
            bottom: "-20%",
            width: width * 0.45,
            left: interpolate(sweep, [0, 1], [-width * 0.6, width * 1.15]),
            background: `linear-gradient(90deg, transparent, ${goldRgba(0.08)} 30%, rgba(245,210,122,0.38) 50%, ${goldRgba(0.08)} 70%, transparent)`,
            transform: "skewX(-18deg)",
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        />
      </AbsoluteFill>
      {/* Brief gold wash so the frame "lifts" as everything changes */}
      <AbsoluteFill
        style={{
          backgroundImage: GOLD_GRADIENT,
          opacity: interpolate(sweep, [0, 0.4, 1], [0, 0.08, 0]),
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};
