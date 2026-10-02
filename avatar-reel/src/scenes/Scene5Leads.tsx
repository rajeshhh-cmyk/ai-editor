import { BadgeCheck, CalendarCheck, Magnet, Megaphone, User, Users, Zap } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, hold, pop, progress, smooth } from "../anim";
import { ChapterCard, SectionLabel } from "../components/ChapterCard";
import { GlassCard } from "../components/GlassCard";
import { IconRing } from "../components/IconRing";
import { Zone } from "../components/Zone";
import { CUES, local } from "../scenes.config";
import { COLORS, FONTS, GOLD_GRADIENT, ICON_STROKE, LABEL, goldRgba } from "../theme";

const L = (cue: number) => local("leads", cue);
const BACK = L(CUES.weRun - 4);

/** Campaign → people flowing to you. */
const Campaign: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const a = pop(frame, fps, BACK + 4);
  const b = pop(frame, fps, BACK + 10);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 860 }}>
      <div style={{ transform: `scale(${a})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <IconRing icon={Megaphone} size={150} progress={progress(frame, BACK + 4, BACK + 22)} lit={0.6} />
        <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 28, color: COLORS.muted }}>Campaigns</div>
      </div>
      <div style={{ position: "relative", flex: 1, height: 150, margin: "0 30px" }}>
        {new Array(7).fill(0).map((_, i) => {
          const t = (((frame - BACK) * 0.03 + i / 7) % 1 + 1) % 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${t * 100}%`,
                top: 75 + Math.sin(t * Math.PI * 2 + i) * 30 - 16,
                opacity: Math.sin(t * Math.PI),
              }}
            >
              <User size={32} color={COLORS.gold} strokeWidth={ICON_STROKE} />
            </div>
          );
        })}
      </div>
      <div style={{ transform: `scale(${b})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <IconRing icon={Users} size={150} progress={progress(frame, BACK + 10, BACK + 28)} lit={1} />
        <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 28, color: COLORS.gold }}>You</div>
      </div>
    </div>
  );
};

/** DM: "Price?" → instant gold AI reply. */
const DmThread: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const askAt = L(CUES.withAi) - 2;
  const replyAt = askAt + 20; // < 1s later
  const ask = pop(frame, fps, askAt);
  const reply = pop(frame, fps, replyAt);
  const tag = pop(frame, fps, L(CUES.instantly) - 3);
  const typing = frame >= askAt + 6 && frame < replyAt;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      <GlassCard
        style={{
          alignSelf: "flex-start",
          padding: "16px 28px",
          borderRadius: "28px 28px 28px 8px",
          transform: `scale(${ask})`,
          transformOrigin: "left center",
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 34,
          color: COLORS.white,
        }}
      >
        Price?
      </GlassCard>
      <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 999,
            border: `1px solid ${goldRgba(0.6)}`,
            background: "rgba(10,10,10,0.72)",
            transform: `scale(${tag})`,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 22,
            color: COLORS.gold,
          }}
        >
          <Zap size={24} color={COLORS.gold} strokeWidth={ICON_STROKE} />
          Replied instantly
        </div>
        {typing ? (
          <GlassCard style={{ padding: "20px 28px", display: "flex", gap: 10, borderRadius: "28px 28px 8px 28px" }}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 14, height: 14, borderRadius: "50%", background: COLORS.gold, opacity: 0.4 + 0.6 * Math.max(0, Math.sin((frame - d * 3) / 3)) }} />
            ))}
          </GlassCard>
        ) : (
          <div
            style={{
              padding: "16px 28px",
              borderRadius: "28px 28px 8px 28px",
              backgroundImage: GOLD_GRADIENT,
              color: COLORS.black,
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 30,
              maxWidth: 560,
              lineHeight: 1.2,
              transform: `scale(${reply})`,
              transformOrigin: "right center",
              boxShadow: `0 0 40px ${goldRgba(0.4)}`,
            }}
          >
            Hi! Happy to share pricing. Can I book you a quick call?
          </div>
        )}
      </div>
    </div>
  );
};

/** Lead card that gets a gold QUALIFIED stamp. */
const Qualified: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const at = L(CUES.qualifies) - 3;
  const card = pop(frame, fps, at);
  const stamp = pop(frame, fps, at + 8);
  return (
    <GlassCard
      style={{
        width: 860,
        padding: 28,
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "relative",
        transform: `scale(${card})`,
      }}
    >
      <div style={{ width: 90, height: 90, borderRadius: "50%", border: `2px solid ${COLORS.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <User size={48} color={COLORS.white} strokeWidth={ICON_STROKE} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 34, color: COLORS.white }}>Priya Sharma</div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 24, color: COLORS.muted }}>Budget fits · Needs it this month</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 26,
          top: "50%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          border: `3px solid ${COLORS.gold}`,
          borderRadius: 14,
          transform: `translateY(-50%) rotate(-8deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
          opacity: stamp > 0.02 ? 1 : 0,
          boxShadow: `0 0 30px ${goldRgba(0.5)}`,
          background: "rgba(10,10,10,0.8)",
        }}
      >
        <BadgeCheck size={36} color={COLORS.gold} strokeWidth={ICON_STROKE} />
        <span style={{ ...LABEL, fontSize: 26, letterSpacing: "0.15em" }}>QUALIFIED</span>
      </div>
    </GlassCard>
  );
};

const SLOTS = ["11:00 AM", "2:00 PM", "4:30 PM"];

/** Calendar card where a slot flips gold: "Call booked". */
const Booked: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const at = L(CUES.booksCalls) - 3;
  const card = pop(frame, fps, at);
  const flip = smooth(frame, fps, at + 12, 14);
  const flipped = flip > 0.5;
  return (
    <GlassCard style={{ width: 860, padding: 26, display: "flex", alignItems: "center", gap: 28, transform: `scale(${card})` }}>
      <IconRing icon={CalendarCheck} size={130} progress={progress(frame, at, at + 18)} lit={flip} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ ...LABEL, fontSize: 20 }}>THURSDAY</div>
        <div style={{ display: "flex", gap: 12 }}>
          {SLOTS.map((s, i) => {
            const target = i === 2;
            const rot = target ? interpolate(flip, [0, 1], [0, 180]) : 0;
            return (
              <div
                key={s}
                style={{
                  flex: target ? 1.6 : 1,
                  height: 74,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.body,
                  fontWeight: 700,
                  fontSize: 24,
                  border: `1px solid ${goldRgba(0.4)}`,
                  transform: `perspective(600px) rotateX(${target && flipped ? rot - 180 : rot}deg)`,
                  backgroundImage: target && flipped ? GOLD_GRADIENT : undefined,
                  color: target && flipped ? COLORS.black : COLORS.muted,
                  boxShadow: target && flipped ? `0 0 30px ${goldRgba(0.5)}` : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                {target && flipped ? "✓ Call booked" : s}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export const Scene5Leads: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const win = {
    campaign: hold(frame, BACK, L(CUES.withAi) - 4, 8),
    dm: hold(frame, L(CUES.withAi) - 6, L(CUES.qualifies) - 4, 8),
    qualified: hold(frame, L(CUES.qualifies) - 6, L(CUES.booksCalls) - 4, 8),
    booked: hold(frame, L(CUES.booksCalls) - 6, durationInFrames + 8, 8),
  };

  return (
    <AbsoluteFill>
      {frame < BACK + 10 ? <ChapterCard num="02" title="LEAD GENERATION" icon={Magnet} out={BACK} /> : null}
      {frame >= BACK ? (
        <AbsoluteFill style={{ opacity: out }}>
          <SectionLabel text="02 · LEAD GENERATION" start={BACK + 4} />
          {win.campaign > 0 ? <Zone style={{ opacity: win.campaign }}><Campaign frame={frame} fps={fps} /></Zone> : null}
          {win.dm > 0 ? <Zone style={{ opacity: win.dm }}><DmThread frame={frame} fps={fps} /></Zone> : null}
          {win.qualified > 0 ? (
            <Zone style={{ opacity: win.qualified, transform: `translateY(${float(frame, 3)}px)` }}>
              <Qualified frame={frame} fps={fps} />
            </Zone>
          ) : null}
          {win.booked > 0 ? (
            <Zone style={{ opacity: win.booked, transform: `translateY(${float(frame, 3)}px)` }}>
              <Booked frame={frame} fps={fps} />
            </Zone>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
