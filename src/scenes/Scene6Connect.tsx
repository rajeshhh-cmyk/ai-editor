import { Database, LayoutDashboard, PhoneCall, Receipt, Send, type LucideIcon } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, pop, progress, smooth } from "../anim";
import { GoldText } from "../components/GoldText";
import { IconRing } from "../components/IconRing";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, HEADLINE_STYLE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

const SATELLITES: LucideIcon[] = [PhoneCall, Database, Receipt, Send];

export const Scene6Connect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, portrait } = useLayout();

  const box = 700 * s;
  const c = box / 2;
  const hubSize = 230 * s;
  const satSize = 128 * s;

  const hubIn = pop(frame, fps, 2);
  const hubRing = progress(frame, 2, 24);

  // Satellites orbit, then decelerate and snap onto the diagonals.
  const snapStart = 4;
  const snapAt = local("connect", CUES.customSoftware) + 2;
  const snap = smooth(frame, fps, snapStart, snapAt - snapStart);
  const radius = interpolate(snap, [0, 1], [330 * s, 270 * s]);
  const lines = progress(frame, snapAt - 4, snapAt + 14);

  const text1 = smooth(frame, fps, local("connect", CUES.customSoftware) - 4, 16);
  const text2 = smooth(frame, fps, local("connect", CUES.built) - 4, 16);
  const youPop = pop(frame, fps, local("connect", CUES.yourBusiness) - 2);

  const positions = SATELLITES.map((_, i) => {
    const target = -Math.PI * 0.75 + (i * Math.PI) / 2; // top-left, top-right, bottom-right, bottom-left
    const angle = target - (1 - snap) * Math.PI * 2.4;
    return { x: c + Math.cos(angle) * radius, y: c + Math.sin(angle) * radius };
  });

  return (
    <Stage>
      <div
        style={{
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          alignItems: "center",
          gap: portrait ? 30 * s : 120 * s,
        }}
      >
        <div style={{ position: "relative", width: box, height: box, transform: `translateY(${float(frame, 5)}px)` }}>
          <svg width={box} height={box} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* faint orbit */}
            <circle cx={c} cy={c} r={radius} fill="none" stroke={goldRgba(0.12)} strokeWidth={1.5} strokeDasharray="4 10" />
            {positions.map((p, i) => (
              <line
                key={i}
                x1={c}
                y1={c}
                x2={p.x}
                y2={p.y}
                stroke={COLORS.gold}
                strokeWidth={2.5}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - lines}
                style={{ filter: `drop-shadow(0 0 8px ${goldRgba(0.6)})` }}
              />
            ))}
          </svg>

          {positions.map((p, i) => {
            const appear = pop(frame, fps, 4 + i * 5);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: p.x - satSize / 2,
                  top: p.y - satSize / 2,
                  transform: `scale(${appear})`,
                }}
              >
                <IconRing
                  icon={SATELLITES[i]}
                  size={satSize}
                  progress={1}
                  lit={lines}
                  iconColor={lines > 0.5 ? COLORS.gold : COLORS.white}
                  iconStyle={{ backgroundColor: COLORS.panel, borderRadius: "50%" }}
                />
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: c - hubSize / 2,
              top: c - hubSize / 2,
              transform: `scale(${hubIn})`,
            }}
          >
            <IconRing
              icon={LayoutDashboard}
              size={hubSize}
              progress={hubRing}
              lit={0.6 + lines * 0.6}
              iconStyle={{ backgroundColor: COLORS.panel, borderRadius: "50%" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: portrait ? "center" : "flex-start", gap: 8 * s }}>
          <div style={{ ...HEADLINE_STYLE, fontSize: 84 * s, color: COLORS.white, opacity: text1, transform: `translateY(${(1 - text1) * 30}px)` }}>
            Custom software.
          </div>
          <div style={{ ...HEADLINE_STYLE, fontSize: 84 * s, color: COLORS.white, opacity: text2, transform: `translateY(${(1 - text2) * 30}px)` }}>
            Built for{" "}
            <span style={{ display: "inline-block", transform: `scale(${interpolate(youPop, [0, 0.6, 1], [1, 1.15, 1])})` }}>
              <GoldText glow={1.2}>YOU.</GoldText>
            </span>
          </div>
        </div>
      </div>
    </Stage>
  );
};
