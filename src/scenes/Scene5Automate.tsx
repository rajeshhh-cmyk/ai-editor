import { Database, MailCheck, Receipt, type LucideIcon } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { IconRing } from "../components/IconRing";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, FONTS, HEADLINE_STYLE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

const NODES: { icon: LucideIcon; label: string; cue: number }[] = [
  { icon: Database, label: "Data Entry", cue: CUES.dataEntry },
  { icon: Receipt, label: "Invoicing", cue: CUES.invoicing },
  { icon: MailCheck, label: "Follow-ups", cue: CUES.followUps },
];

export const Scene5Automate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, portrait } = useLayout();

  const rowWidth = portrait ? 940 : 1300 * s;
  const ringSize = 190 * s;
  const step = rowWidth / NODES.length;
  const centers = NODES.map((_, i) => step * (i + 0.5));
  const rowHeight = ringSize + 120 * s;

  const head1 = smooth(frame, fps, local("automate", CUES.automate) - 2, 16);
  const head2 = smooth(frame, fps, local("automate", CUES.automate) + 4, 16);

  return (
    <Stage>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 110 * s }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 26 * s,
            letterSpacing: "0.4em",
            color: COLORS.gold,
            marginBottom: 22 * s,
            opacity: head1,
          }}
        >
          WORKFLOW AUTOMATION
        </div>
        <div style={{ ...HEADLINE_STYLE, fontSize: 96 * s, color: COLORS.white, opacity: head1, transform: `translateY(${(1 - head1) * 30}px)` }}>
          AUTOMATE THE
        </div>
        <div style={{ ...HEADLINE_STYLE, fontSize: 96 * s, opacity: head2, transform: `translateY(${(1 - head2) * 30}px)` }}>
          <GoldText>REPETITIVE.</GoldText>
        </div>
      </div>

      <div style={{ position: "relative", width: rowWidth, height: rowHeight }}>
        {/* Connectors + travelling dots */}
        <svg width={rowWidth} height={rowHeight} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {NODES.slice(0, -1).map((node, i) => {
            const x1 = centers[i] + ringSize / 2 + 10;
            const x2 = centers[i + 1] - ringSize / 2 - 10;
            const y = ringSize / 2;
            const start = local("automate", node.cue) + 4;
            const end = local("automate", NODES[i + 1].cue);
            const draw = progress(frame, start, end);
            const dotX = interpolate(draw, [0, 1], [x1, x2]);
            return (
              <g key={i}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={goldRgba(0.18)} strokeWidth={2} strokeDasharray="6 8" />
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={COLORS.gold}
                  strokeWidth={3}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - draw}
                />
                {draw > 0 && draw < 1 ? (
                  <circle cx={dotX} cy={y} r={9 * s} fill={COLORS.goldLight} style={{ filter: `drop-shadow(0 0 12px ${goldRgba(0.9)})` }} />
                ) : null}
              </g>
            );
          })}
        </svg>

        {NODES.map((node, i) => {
          const appear = pop(frame, fps, 8 + i * 5);
          const litAt = local("automate", node.cue) - 2;
          const lit = smooth(frame, fps, litAt, 10);
          const flash = pop(frame, fps, litAt);
          return (
            <div
              key={node.label}
              style={{
                position: "absolute",
                left: centers[i] - step / 2,
                width: step,
                top: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${appear * interpolate(flash, [0, 0.5, 1], [1, 1.1, 1])}) translateY(${float(frame, 4, 80, i)}px)`,
              }}
            >
              <IconRing
                icon={node.icon}
                size={ringSize}
                progress={interpolate(lit, [0, 1], [0.25, 1])}
                lit={lit}
                iconColor={lit > 0.5 ? COLORS.gold : COLORS.muted}
              />
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 36 * s,
                  marginTop: 26 * s,
                  color: lit > 0.5 ? COLORS.gold : COLORS.muted,
                  opacity: interpolate(lit, [0, 1], [0.55, 1]),
                  whiteSpace: "nowrap",
                }}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
