import type { TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS } from "../scenes.config";
import { COLORS, FONTS, GOLD_GRADIENT, SPRINGS, W, goldRgba } from "../theme";
import { getAvatarState } from "./AvatarFrame";

const COMBINE_MS = 1200;
const BRIDGE_GAP_MS = 700;
const HOLD_MS = 250;

const KEYWORDS = new Set(["AI", "AUTOPILOT", "SALES", "LOST", "CONTENT", "LEADS", "INSTANTLY", "CRM", "24X7", "GROW"]);

export const isKeyword = (w: string) => {
  const c = w.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return KEYWORDS.has(c) || KEYWORDS.has(c.replace(/S$/, "") + "S");
};

const Page: React.FC<{ page: TikTokPage; fromFrame: number }> = ({ page, fromFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  // Follow the avatar layout (full / top card / hidden).
  const y = getAvatarState(fromFrame + frame, fps).captionY;

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 260 }, durationInFrames: 6 });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);
  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: W / 2,
        top: y,
        width: 900,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.24em",
        fontFamily: FONTS.body,
        fontWeight: 700,
        fontSize: 70,
        lineHeight: 1.15,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
      }}
    >
      {page.tokens.map((token, i) => {
        const active = token.fromMs <= nowMs && token.toMs > nowMs;
        const past = token.toMs <= nowMs;
        const keyword = isKeyword(token.text);
        const word = token.text.trim();
        const pop = active
          ? spring({ frame: Math.round(((nowMs - token.fromMs) / 1000) * fps), fps, config: SPRINGS.pop })
          : 0;
        const base: React.CSSProperties = {
          gridArea: "1 / 1",
          justifySelf: "center",
          alignSelf: "center",
          transform: `scale(${active ? interpolate(pop, [0, 1], [1, 1.08]) : 1})`,
          opacity: active || past ? 1 : 0.55,
        };
        const style: React.CSSProperties =
          keyword || active
            ? {
                ...base,
                backgroundImage: keyword ? GOLD_GRADIENT : `linear-gradient(${COLORS.gold}, ${COLORS.gold})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.8)) drop-shadow(0 0 ${active ? 28 : 16}px ${goldRgba(active ? 0.6 : 0.3)})`,
              }
            : { ...base, color: COLORS.white, textShadow: "0 4px 18px rgba(0,0,0,0.85), 0 2px 4px rgba(0,0,0,0.6)" };
        return (
          // The hidden copy reserves the popped width so neighbours never collide.
          <span key={`${token.fromMs}-${i}`} style={{ display: "inline-grid" }}>
            <span style={{ gridArea: "1 / 1", visibility: "hidden", fontSize: "1.08em", lineHeight: 1.05 }}>{word}</span>
            <span style={style}>{word}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Karaoke TikTok-style captions from public/captions.json. */
export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () => createTikTokStyleCaptions({ captions: CAPTIONS, combineTokensWithinMilliseconds: COMBINE_MS }).pages,
    [],
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const end = page.startMs + page.durationMs;
        const endMs =
          next && next.startMs - end < BRIDGE_GAP_MS ? next.startMs : Math.min(next ? next.startMs : Infinity, end + HOLD_MS);
        const from = Math.round((page.startMs / 1000) * fps);
        const to = Math.round((endMs / 1000) * fps);
        if (to <= from) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} layout="none">
            <Page page={page} fromFrame={from} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
