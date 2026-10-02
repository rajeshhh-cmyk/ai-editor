import { Flame, Mail, RefreshCw, User, Workflow } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { hold, lerp, pop, progress, smooth } from "../anim";
import { ChapterCard, SectionLabel } from "../components/ChapterCard";
import { GlassCard } from "../components/GlassCard";
import { Zone, ZONE } from "../components/Zone";
import { CUES, local, MODES } from "../scenes.config";
import { COLORS, FONTS, GLASS, GOLD_GRADIENT, ICON_STROKE, LABEL, goldRgba } from "../theme";

const L = (cue: number) => local("crm", cue);
const BACK = L(CUES.crmEnd + 2);
const HIDE = L(MODES.find((m) => m.from === CUES.followUps - 3)!.from);
const RETURN = L(MODES.find((m) => m.from === CUES.andRepetitive - 2)!.from);

const COLUMNS = ["New", "Follow-up", "Ready to Buy"];
const LEADS = ["Priya S.", "Rahul M.", "Anita K.", "Vikram R.", "Neha J."];
/** Final column / row for each lead. */
const FINAL: { col: number; row: number }[] = [
  { col: 2, row: 0 },
  { col: 2, row: 1 },
  { col: 1, row: 0 },
  { col: 1, row: 1 },
  { col: 0, row: 0 },
];

type Timing = { flyIn: number; slide1: number; slide2: number; mails: number; ready: number };

const T: Timing = {
  flyIn: L(CUES.onePlace) - 10,
  slide1: HIDE + 14,
  mails: HIDE + 18,
  slide2: L(CUES.readyToBuy) - 26,
  ready: L(CUES.readyToBuy) - 2,
};

/** 3-column pipeline board; geometry scales with width/height. */
const Board: React.FC<{ width: number; height: number; compact: boolean }> = ({ width, height, compact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gap = compact ? 12 : 22;
  const colW = (width - gap * 2) / 3;
  const header = compact ? 40 : 76;
  const cardH = compact ? 34 : 108;
  const rowGap = compact ? 6 : 18;
  const pad = compact ? 8 : 16;

  const pos = (col: number, row: number) => ({
    x: col * (colW + gap) + pad,
    y: header + pad + row * (cardH + rowGap),
  });

  return (
    <div style={{ position: "relative", width, height }}>
      {COLUMNS.map((c, i) => (
        <div
          key={c}
          style={{
            ...GLASS,
            borderRadius: compact ? 16 : 28,
            position: "absolute",
            left: i * (colW + gap),
            top: 0,
            width: colW,
            height,
          }}
        >
          <div
            style={{
              ...LABEL,
              fontSize: compact ? 16 : 24,
              letterSpacing: "0.2em",
              height: header,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: `1px solid ${goldRgba(0.35)}`,
              color: i === 2 ? COLORS.gold : COLORS.white,
            }}
          >
            {c.toUpperCase()}
          </div>
        </div>
      ))}

      {LEADS.map((name, k) => {
        // Fly in from a different edge into "New".
        const fly = smooth(frame, fps, T.flyIn + k * 4, 16);
        const edge = [
          { x: -width * 0.6, y: -200 },
          { x: width * 1.2, y: -120 },
          { x: -width * 0.5, y: height + 200 },
          { x: width * 1.1, y: height + 160 },
          { x: width * 0.5, y: -400 },
        ][k];
        const start = pos(0, k);
        const mid = FINAL[k].col >= 1 ? pos(1, FINAL[k].col === 1 ? FINAL[k].row : k % 2) : start;
        const end = pos(FINAL[k].col, FINAL[k].row);
        const s1 = FINAL[k].col >= 1 ? smooth(frame, fps, T.slide1 + k * 5, 18) : 0;
        const s2 = FINAL[k].col === 2 ? smooth(frame, fps, T.slide2 + k * 6, 18) : 0;
        let x = lerp(edge.x, start.x, fly);
        let y = lerp(edge.y, start.y, fly);
        x = lerp(x, mid.x, s1);
        y = lerp(y, mid.y, s1);
        x = lerp(x, end.x, s2);
        y = lerp(y, end.y, s2);

        const ready = k === 0 ? pop(frame, fps, T.ready) : 0;
        const glow = k === 0 ? progress(frame, T.ready, T.ready + 8) : 0;
        const inFollowUp = s1 > 0.9 && s2 < 0.1;

        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: colW - pad * 2,
              height: cardH,
              borderRadius: compact ? 8 : 18,
              display: "flex",
              alignItems: "center",
              gap: compact ? 6 : 14,
              padding: compact ? "0 8px" : "0 18px",
              background: glow > 0.5 ? undefined : COLORS.panel,
              backgroundImage: glow > 0.5 ? GOLD_GRADIENT : undefined,
              border: `1px solid ${goldRgba(0.5 + glow * 0.5)}`,
              boxShadow: glow > 0 ? `0 0 ${50 * glow}px ${goldRgba(0.6)}` : "0 8px 24px rgba(0,0,0,0.4)",
              transform: `scale(${1 + ready * 0.06 - (k === 0 ? 0 : 0)})`,
              opacity: fly,
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: compact ? 15 : 28,
              color: glow > 0.5 ? COLORS.black : COLORS.white,
              whiteSpace: "nowrap",
              overflow: "visible",
            }}
          >
            {k === 0 && glow > 0.5 ? (
              <Flame size={compact ? 16 : 40} color={COLORS.black} strokeWidth={ICON_STROKE} />
            ) : (
              <User size={compact ? 14 : 32} color={glow > 0.5 ? COLORS.black : COLORS.gold} strokeWidth={ICON_STROKE} />
            )}
            {name}
            {/* Automatic follow-up mails firing off */}
            {!compact && inFollowUp
              ? [0, 1].map((m) => {
                  const t0 = T.mails + k * 5 + m * 22;
                  const t = progress(frame, t0, t0 + 20);
                  if (t <= 0 || t >= 1) return null;
                  return (
                    <div
                      key={m}
                      style={{
                        position: "absolute",
                        right: 10 - t * 90,
                        top: 10 - t * 110 + random(`m${k}${m}`) * 10,
                        opacity: Math.sin(t * Math.PI),
                        transform: `rotate(${-20 + t * 10}deg) scale(${0.8 + t * 0.4})`,
                        filter: `drop-shadow(0 0 10px ${goldRgba(0.8)})`,
                      }}
                    >
                      <Mail size={44} color={COLORS.gold} strokeWidth={ICON_STROKE} />
                    </div>
                  );
                })
              : null}
          </div>
        );
      })}
    </div>
  );
};

export const Scene6CRM: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const miniWin = hold(frame, BACK, HIDE + 6, 6);
  const fullIn = smooth(frame, fps, HIDE, 12);
  const fullWin = hold(frame, HIDE - 2, RETURN + 8, 8);
  const endWin = hold(frame, RETURN, durationInFrames + 8, 8);
  const spin = (frame - RETURN) * 3;
  const chip = pop(frame, fps, L(CUES.runsOnItsOwn) - 4);

  return (
    <AbsoluteFill>
      {frame < BACK + 10 ? <ChapterCard num="03" title="AI AUTOMATION & CRM" icon={Workflow} out={BACK} /> : null}

      {frame >= BACK && frame < HIDE + 6 ? (
        <AbsoluteFill style={{ opacity: miniWin }}>
          <SectionLabel text="03 · AUTOMATION & CRM" start={BACK + 4} />
          <Zone>
            <Board width={ZONE.width} height={ZONE.height} compact />
          </Zone>
        </AbsoluteFill>
      ) : null}

      {/* Hidden moment 5 — full-screen pipeline */}
      {fullWin > 0 ? (
        <AbsoluteFill
          style={{
            opacity: fullWin,
            transform: `scale(${interpolate(fullIn, [0, 1], [0.92, 1])})`,
          }}
        >
          <div style={{ position: "absolute", left: 70, top: 300 }}>
            <Board width={940} height={1040} compact={false} />
          </div>
        </AbsoluteFill>
      ) : null}

      {frame >= RETURN ? (
        <AbsoluteFill style={{ opacity: endWin * out }}>
          <SectionLabel text="03 · AUTOMATION & CRM" start={RETURN} />
          {/* slow-spinning automation icon in the card corner */}
          <div style={{ position: "absolute", right: 116, top: 214, display: "flex", padding: 12, borderRadius: "50%", background: "rgba(10,10,10,0.6)" }}>
            <RefreshCw size={54} color={COLORS.gold} strokeWidth={ICON_STROKE} style={{ transform: `rotate(${spin}deg)` }} />
          </div>
          <Zone style={{ flexDirection: "column", gap: 18 }}>
            <GlassCard
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "22px 34px",
                transform: `scale(${chip})`,
                opacity: chip > 0.01 ? 1 : 0,
              }}
            >
              <Workflow size={52} color={COLORS.gold} strokeWidth={ICON_STROKE} />
              <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 38, color: COLORS.white }}>
                Repetitive work <span style={{ color: COLORS.gold }}>runs on its own</span>
              </div>
            </GlassCard>
            <div style={{ display: "flex", gap: 14, opacity: chip }}>
              {["Leads captured", "Follow-ups sent", "Pipeline updated"].map((t, i) => (
                <div
                  key={t}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: `1px solid ${goldRgba(0.5)}`,
                    background: "rgba(10,10,10,0.7)",
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 22,
                    color: COLORS.muted,
                    transform: `scale(${pop(frame, fps, L(CUES.runsOnItsOwn) + i * 5)})`,
                  }}
                >
                  ✓ {t}
                </div>
              ))}
            </div>
          </Zone>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
