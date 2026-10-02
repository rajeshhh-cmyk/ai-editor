import { CalendarDays, Eye, PenTool, Send, Target, type LucideIcon } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { float, hold, pop, progress, smooth } from "../anim";
import { ChapterCard, SectionLabel } from "../components/ChapterCard";
import { GlassCard } from "../components/GlassCard";
import { IconRing } from "../components/IconRing";
import { Zone } from "../components/Zone";
import { CUES, local } from "../scenes.config";
import { COLORS, FONTS, HEADLINE, goldRgba } from "../theme";

const L = (cue: number) => local("content", cue);
const BACK = L(CUES.we1 - 4);

const STEPS: { icon: LucideIcon; label: string; cue: number }[] = [
  { icon: CalendarDays, label: "Plan", cue: CUES.plan },
  { icon: PenTool, label: "Create", cue: CUES.create },
  { icon: Send, label: "Post", cue: CUES.post2 },
];

const Steps: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const size = 140;
  const step = 300;
  return (
    <div style={{ position: "relative", width: step * 3, height: 230 }}>
      <svg width={step * 3} height={230} style={{ position: "absolute", inset: 0 }}>
        {[0, 1].map((i) => {
          const x1 = step * (i + 0.5) + size / 2 + 8;
          const x2 = step * (i + 1.5) - size / 2 - 8;
          const d = progress(frame, L(STEPS[i].cue), L(STEPS[i + 1].cue));
          return (
            <g key={i}>
              <line x1={x1} y1={size / 2} x2={x2} y2={size / 2} stroke={goldRgba(0.2)} strokeWidth={2} strokeDasharray="6 8" />
              <line
                x1={x1}
                y1={size / 2}
                x2={x2}
                y2={size / 2}
                stroke={COLORS.gold}
                strokeWidth={3}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - d}
              />
            </g>
          );
        })}
      </svg>
      {STEPS.map((s, i) => {
        const appear = pop(frame, fps, BACK + 4 + i * 5);
        const lit = smooth(frame, fps, L(s.cue) - 3, 10);
        return (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left: step * i,
              width: step,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${appear * (1 + 0.1 * Math.sin(Math.min(1, lit) * Math.PI))}) translateY(${float(frame, 3, 80, i)}px)`,
            }}
          >
            <IconRing icon={s.icon} size={size} progress={0.25 + lit * 0.75} lit={lit} iconColor={lit > 0.5 ? COLORS.gold : COLORS.muted} />
            <div
              style={{
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: 32,
                marginTop: 16,
                color: lit > 0.5 ? COLORS.gold : COLORS.muted,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DOTS = 9;

const ViewsVsPeople: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const viewsIn = pop(frame, fps, L(CUES.notJustViews) - 4);
  const views = Math.round(
    interpolate(frame, [L(CUES.notJustViews), L(CUES.but) + 6], [1200, 48200], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const cross = progress(frame, L(CUES.but), L(CUES.but) + 8);
  const targetIn = pop(frame, fps, L(CUES.theRightPeople) - 4);
  const gather = smooth(frame, fps, L(CUES.theRightPeople) + 2, 22);

  return (
    <div style={{ display: "flex", gap: 26, width: "100%", height: 250 }}>
      <GlassCard
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: 26,
          position: "relative",
          transform: `scale(${viewsIn})`,
          opacity: interpolate(cross, [0, 1], [1, 0.55]),
        }}
      >
        <Eye size={70} color={COLORS.white} strokeWidth={1.5} />
        <div>
          <div style={{ ...HEADLINE, fontSize: 64, color: COLORS.white, fontVariantNumeric: "tabular-nums" }}>
            {(views / 1000).toFixed(1)}K
          </div>
          <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 24, color: COLORS.muted }}>views</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            height: 8,
            width: `calc(${cross * 100}% - 40px)`,
            background: COLORS.gold,
            borderRadius: 4,
            transform: "rotate(-12deg)",
            boxShadow: `0 0 20px ${goldRgba(0.7)}`,
          }}
        />
      </GlassCard>
      <GlassCard
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: 26,
          transform: `scale(${targetIn})`,
          opacity: targetIn > 0.01 ? 1 : 0,
          boxShadow: `0 0 ${30 + gather * 30}px ${goldRgba(0.25 + gather * 0.25)}`,
        }}
      >
        <div style={{ position: "relative", width: 170, height: 170 }}>
          <Target size={170} color={COLORS.gold} strokeWidth={1.5} />
          {new Array(DOTS).fill(0).map((_, i) => {
            const a = random(`ta${i}`) * Math.PI * 2;
            const r0 = 140 + random(`tr${i}`) * 60;
            const r1 = random(`tf${i}`) * 18;
            const r = interpolate(gather, [0, 1], [r0, r1]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 85 + Math.cos(a) * r - 7,
                  top: 85 + Math.sin(a) * r - 7,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: COLORS.goldLight,
                  boxShadow: `0 0 12px ${goldRgba(0.9)}`,
                  opacity: interpolate(gather, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 30, color: COLORS.white, lineHeight: 1.2 }}>
          The right
          <br />
          <span style={{ color: COLORS.gold }}>people</span>
        </div>
      </GlassCard>
    </div>
  );
};

export const Scene4Content: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const stepsWin = hold(frame, BACK, L(CUES.notJustViews) - 2, 8);
  const vpWin = hold(frame, L(CUES.notJustViews) - 6, durationInFrames + 8, 8);
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      {frame < BACK + 10 ? <ChapterCard num="01" title="CONTENT" icon={CalendarDays} out={BACK} /> : null}
      {frame >= BACK ? (
        <AbsoluteFill style={{ opacity: out }}>
          <SectionLabel text="01 · CONTENT" start={BACK + 4} />
          {stepsWin > 0 ? (
            <Zone style={{ opacity: stepsWin }}>
              <Steps frame={frame} fps={fps} />
            </Zone>
          ) : null}
          {vpWin > 0 ? (
            <Zone style={{ opacity: vpWin }}>
              <ViewsVsPeople frame={frame} fps={fps} />
            </Zone>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
