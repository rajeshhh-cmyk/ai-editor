import { AlertTriangle, Clock, Heart, MessageCircle, User } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { float, hold, pop, progress, smooth } from "../anim";
import { GlassCard } from "../components/GlassCard";
import { GoldText } from "../components/GoldText";
import { IconRing } from "../components/IconRing";
import { Zone, ZONE } from "../components/Zone";
import { CUES, MODES, local } from "../scenes.config";
import { COLORS, FONTS, GOLD_GRADIENT, HEADLINE, ICON_STROKE, LABEL, goldRgba } from "../theme";

const L = (cue: number) => local("problem", cue);
const BACK_TO_HER = L(MODES.find((m) => m.from === CUES.most + 9)!.from);

/** Hidden moment 1 — full-black "THE PROBLEM". */
const ProblemTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = smooth(frame, fps, 0, 12);
  const slash = smooth(frame, fps, L(CUES.problem) - 2, 10);
  const ring = pop(frame, fps, 3);
  const exit = interpolate(frame, [BACK_TO_HER - 2, BACK_TO_HER + 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const st = frame - L(CUES.problem) - 2;
  const shaking = st >= 0 && st < 7;
  const sx = shaking ? Math.sin(st * 2.6) * 7 : 0;
  const sy = shaking ? Math.cos(st * 3.1) * 4 : 0;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 420,
        opacity: exit,
        transform: `translate(${sx}px, ${sy}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
      }}
    >
      <div style={{ transform: `scale(${ring})`, marginBottom: 60 }}>
        <IconRing icon={AlertTriangle} size={190} progress={progress(frame, 3, 20)} lit={1} />
      </div>
      <div style={{ ...HEADLINE, fontSize: 168, color: COLORS.white, textAlign: "center", lineHeight: 0.95 }}>
        THE
        <br />
        PROBLEM
      </div>
      <div
        style={{
          marginTop: 34,
          height: 14,
          width: 760 * slash,
          background: GOLD_GRADIENT,
          borderRadius: 8,
          transform: "skewX(-24deg) rotate(-2deg)",
          boxShadow: `0 0 40px ${goldRgba(0.6)}`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Instagram post with a like counter stuck at 12, next to a sales counter stuck at $0. */
const PostAndSales: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const postIn = pop(frame, fps, L(CUES.post) - 4);
  const likes = Math.round(interpolate(frame, [L(CUES.likes) - 4, L(CUES.likes) + 14], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const salesIn = pop(frame, fps, L(CUES.sales) - 8);
  const shakeT = frame - L(CUES.sales);
  const shake = shakeT > 0 ? Math.sin(shakeT * 2.4) * 4 * Math.max(0.25, 1 - shakeT / 20) : 0;
  const heartBeat = 1 + Math.max(0, Math.sin((frame - L(CUES.likes)) / 4)) * 0.12 * (frame > L(CUES.likes) ? 1 : 0);

  return (
    <div style={{ display: "flex", gap: 26, width: "100%" }}>
      <GlassCard
        style={{
          flex: 1.45,
          padding: 24,
          transform: `scale(${postIn}) translateY(${float(frame, 3)}px)`,
          opacity: postIn > 0.01 ? 1 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: `2px solid ${COLORS.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={26} color={COLORS.muted} strokeWidth={ICON_STROKE} />
          </div>
          <div style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 26, color: COLORS.white }}>your_business</div>
          <div style={{ marginLeft: "auto", fontFamily: FONTS.body, fontSize: 22, fontWeight: 600, color: COLORS.muted }}>
            Posted randomly
          </div>
        </div>
        <div
          style={{
            height: 70,
            margin: "18px 0",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${COLORS.panel}, #1d1d1d)`,
            border: `1px solid ${goldRgba(0.15)}`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Heart size={38} color={COLORS.white} strokeWidth={ICON_STROKE} style={{ transform: `scale(${heartBeat})` }} />
          <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 30, color: COLORS.white }}>{likes} likes</span>
        </div>
      </GlassCard>
      <GlassCard
        style={{
          flex: 1,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${salesIn}) translateX(${shake}px)`,
          opacity: salesIn > 0.01 ? 1 : 0,
        }}
      >
        <div style={{ ...LABEL, fontSize: 22 }}>SALES</div>
        <div style={{ ...HEADLINE, fontSize: 110, marginTop: 6 }}>
          <GoldText glow={0.6}>$0</GoldText>
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, color: COLORS.muted }}>this month</div>
      </GlassCard>
    </div>
  );
};

/** Chat bubble whose typing indicator never resolves. */
const Unanswered: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const at = L(CUES.nobody) - 4;
  const inA = pop(frame, fps, at);
  const inB = pop(frame, fps, at + 6);
  const inC = pop(frame, fps, at + 12);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <GlassCard
        style={{
          alignSelf: "flex-start",
          padding: "18px 26px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          transform: `scale(${inA})`,
          transformOrigin: "left center",
          borderRadius: "28px 28px 28px 8px",
        }}
      >
        <MessageCircle size={36} color={COLORS.gold} strokeWidth={ICON_STROKE} />
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 32, color: COLORS.white }}>
          Hi! What's the price?
        </span>
      </GlassCard>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <GlassCard
          style={{
            padding: "22px 30px",
            display: "flex",
            gap: 12,
            transform: `scale(${inB})`,
            transformOrigin: "left center",
            borderRadius: "28px 28px 28px 8px",
          }}
        >
          {[0, 1, 2].map((d) => (
            <div
              key={d}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: COLORS.muted,
                transform: `translateY(${Math.max(0, Math.sin((frame - d * 4) / 4)) * -10}px)`,
                opacity: 0.5 + 0.5 * Math.max(0, Math.sin((frame - d * 4) / 4)),
              }}
            />
          ))}
        </GlassCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: `scale(${inC})`,
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 26,
            color: COLORS.muted,
          }}
        >
          <Clock size={30} color={COLORS.gold} strokeWidth={ICON_STROKE} />
          Seen 3 days ago
        </div>
      </div>
    </div>
  );
};

const ROWS = ["Rahul M.", "Sneha K.", "New Lead", "Amit P.", "Kavya R.", "Rohan D.", "Meera S.", "Arjun T."];
const ROW_H = 54;

/** Spreadsheet grid with endlessly scrolling rows; the "New Lead" row turns gold and falls out. */
const LostInSpreadsheet: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const at = L(CUES.andItGets) - 4;
  const zoom = smooth(frame, fps, at, 14);
  const scroll = (frame - at) * 1.6;
  const gold = progress(frame, L(CUES.lost) - 4, L(CUES.lost) + 4);
  const fall = progress(frame, L(CUES.lost) + 6, L(CUES.lost) + 30);
  const flicker = fall > 0 && fall < 0.6 ? (random(`fl-${frame}`) > 0.5 ? 0.35 : 1) : 1;
  const stamp = pop(frame, fps, L(CUES.somewhere) + 2);
  const cols = ["NAME", "SOURCE", "STATUS"];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: ZONE.height,
        transform: `scale(${interpolate(zoom, [0, 1], [0.85, 1])})`,
        opacity: zoom,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 20,
          border: `1px solid ${goldRgba(0.6)}`,
          background: "rgba(10,10,10,0.75)",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", height: ROW_H, borderBottom: `1px solid ${goldRgba(0.6)}`, background: COLORS.panel }}>
          {cols.map((c) => (
            <div key={c} style={{ ...LABEL, flex: 1, fontSize: 20, display: "flex", alignItems: "center", paddingLeft: 22, borderRight: `1px solid ${goldRgba(0.35)}` }}>
              {c}
            </div>
          ))}
        </div>
        {/* scrolling rows */}
        <div style={{ position: "absolute", top: ROW_H, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          {new Array(24).fill(0).map((_, i) => {
            const name = ROWS[i % ROWS.length];
            const isLead = name === "New Lead" && i === 2;
            const y = i * ROW_H - (scroll % (ROW_H * ROWS.length)) + (isLead ? 0 : 0);
            if (isLead) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: y,
                  left: 0,
                  right: 0,
                  height: ROW_H,
                  display: "flex",
                  borderBottom: `1px solid ${goldRgba(0.25)}`,
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 24,
                  color: COLORS.muted,
                }}
              >
                {[name, i % 2 ? "Instagram" : "WhatsApp", "—"].map((v, j) => (
                  <div key={j} style={{ flex: 1, paddingLeft: 22, display: "flex", alignItems: "center", borderRight: `1px solid ${goldRgba(0.2)}` }}>
                    {v}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* The lead that gets lost */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ROW_H * 2 + fall * 420,
          height: ROW_H,
          display: "flex",
          alignItems: "center",
          paddingLeft: 22,
          gap: 16,
          background: interpolate(gold, [0, 1], [0, 1]) > 0.5 ? goldRgba(0.25) : "rgba(20,20,20,0.95)",
          border: `1px solid ${goldRgba(0.3 + gold * 0.7)}`,
          borderRadius: 6,
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: 26,
          color: gold > 0.5 ? COLORS.goldLight : COLORS.white,
          boxShadow: gold > 0.5 ? `0 0 30px ${goldRgba(0.5)}` : undefined,
          filter: `blur(${fall * 10}px)`,
          opacity: (1 - fall) * flicker,
          transform: `rotate(${fall * 9}deg)`,
        }}
      >
        New Lead · Instagram DM · Not contacted
      </div>

      {/* LEAD LOST ghost stamp */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: stamp > 0.01 ? 0.4 : 0,
          transform: `scale(${interpolate(stamp, [0, 1], [1.6, 1])}) rotate(-8deg)`,
        }}
      >
        <div
          style={{
            ...HEADLINE,
            fontSize: 110,
            color: COLORS.white,
            border: `6px solid ${COLORS.white}`,
            borderRadius: 18,
            padding: "6px 30px",
          }}
        >
          LEAD LOST
        </div>
      </div>
    </div>
  );
};

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const postWin = hold(frame, L(CUES.post) - 6, L(CUES.nobody) - 2, 8);
  const chatWin = hold(frame, L(CUES.nobody) - 6, L(CUES.andItGets) - 2, 8);
  const sheetWin = hold(frame, L(CUES.andItGets) - 6, durationInFrames + 8, 8);
  const label = smooth(frame, fps, BACK_TO_HER + 4, 14);
  const underline = progress(frame, BACK_TO_HER + 8, BACK_TO_HER + 26);
  const labelOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      {frame < BACK_TO_HER + 10 ? <ProblemTitle /> : null}

      {/* "THE PROBLEM" label on the card */}
      {frame >= BACK_TO_HER ? (
        <div style={{ position: "absolute", left: 116, top: 214, opacity: label * labelOut }}>
          <div
            style={{
              ...LABEL,
              fontSize: 26,
              padding: "10px 18px",
              background: "rgba(10,10,10,0.6)",
              borderRadius: 12,
            }}
          >
            THE PROBLEM
            <div style={{ height: 2, marginTop: 8, width: `${underline * 100}%`, background: COLORS.gold, boxShadow: `0 0 10px ${goldRgba(0.7)}` }} />
          </div>
        </div>
      ) : null}

      {postWin > 0 ? (
        <Zone style={{ opacity: postWin }}>
          <PostAndSales frame={frame} fps={fps} />
        </Zone>
      ) : null}
      {chatWin > 0 ? (
        <Zone style={{ opacity: chatWin }}>
          <Unanswered frame={frame} fps={fps} />
        </Zone>
      ) : null}
      {sheetWin > 0 ? (
        <Zone style={{ opacity: sheetWin * labelOut }}>
          <LostInSpreadsheet frame={frame} fps={fps} />
        </Zone>
      ) : null}
    </AbsoluteFill>
  );
};
