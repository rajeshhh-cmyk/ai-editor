import { CheckCircle2, Rocket } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, smooth } from "../anim";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, GOLD_GLOW_FILTER, HEADLINE_STYLE, ICON_STROKE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

const ROWS = [
  { text: "No call missed", cue: CUES.noCallMissed },
  { text: "No hour wasted", cue: CUES.noHourWasted },
  { text: "Runs on autopilot", cue: CUES.runsOnAutopilot },
];

const TRAIL = 6;

export const Scene7Outcomes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const { s } = useLayout();

  const rocketIn = pop(frame, fps, 4);
  const launchAt = local("outcomes", CUES.autopilot) - 2;
  const launchY = (t: number) => {
    const p = Math.max(0, t - launchAt);
    return -(p * p) * 3.2; // accelerates upward
  };
  const rocketSize = 170 * s;
  const shakeX = frame < launchAt && frame > launchAt - 14 ? Math.sin(frame * 3) * 2 : 0;

  return (
    <Stage>
      {/* Rocket with gold motion trail */}
      <div style={{ position: "relative", width: rocketSize, height: rocketSize, marginBottom: 90 * s }}>
        {/* exhaust streak */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: rocketSize * 0.75 + launchY(frame),
            width: rocketSize * 0.16,
            height: Math.min(height, Math.max(0, frame - launchAt) * 34),
            transform: "translateX(-50%)",
            background: `linear-gradient(180deg, ${COLORS.goldLight}, ${goldRgba(0.6)} 25%, transparent)`,
            borderRadius: 999,
            filter: "blur(2px)",
            opacity: frame > launchAt ? 0.9 : 0,
          }}
        />
        {frame > launchAt
          ? new Array(TRAIL).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateY(${launchY(frame - (i + 1) * 1.5)}px) rotate(-45deg)`,
                  opacity: 0.35 * (1 - i / TRAIL),
                }}
              >
                <Rocket size={rocketSize} color={COLORS.gold} strokeWidth={ICON_STROKE} />
              </div>
            ))
          : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${shakeX}px, ${launchY(frame) + (frame < launchAt ? float(frame, 8, 60) : 0)}px) rotate(-45deg) scale(${rocketIn})`,
            filter: GOLD_GLOW_FILTER,
          }}
        >
          <Rocket size={rocketSize} color={COLORS.gold} strokeWidth={ICON_STROKE} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 * s, alignItems: "flex-start" }}>
        {ROWS.map((row, i) => {
          const at = local("outcomes", row.cue) - 3;
          const check = pop(frame, fps, at);
          const slide = smooth(frame, fps, at + 2, 14);
          const isLast = i === ROWS.length - 1;
          return (
            <div key={row.text} style={{ display: "flex", alignItems: "center", gap: 34 * s }}>
              <div
                style={{
                  transform: `scale(${check})`,
                  borderRadius: "50%",
                  boxShadow: `0 0 ${36 * check}px ${goldRgba(0.45)}`,
                  display: "flex",
                }}
              >
                <CheckCircle2 size={92 * s} color={COLORS.gold} strokeWidth={ICON_STROKE} />
              </div>
              <div
                style={{
                  ...HEADLINE_STYLE,
                  fontSize: 76 * s,
                  color: isLast ? COLORS.gold : COLORS.white,
                  opacity: slide,
                  transform: `translateX(${interpolate(slide, [0, 1], [-50, 0])}px)`,
                  whiteSpace: "nowrap",
                  textShadow: isLast ? `0 0 40px ${goldRgba(0.35)}` : undefined,
                }}
              >
                {row.text}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
