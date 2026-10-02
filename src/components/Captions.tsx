import type { Caption, TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { useLayout } from "../layout";
import { COLORS, FONTS, GOLD_GRADIENT, SPRINGS, goldRgba } from "../theme";

/** How long words are grouped together on one caption page. */
const COMBINE_MS = 1200;
/** Small gaps between pages are bridged so captions don't flicker off. */
const BRIDGE_GAP_MS = 700;
const HOLD_AFTER_PAGE_MS = 250;

const KEYWORDS = new Set([
  "BROKEN",
  "HOURS",
  "HOUR",
  "EVERYTHING",
  "24/7",
  "247",
  "24X7",
  "AUTOPILOT",
  "AI",
]);

export const isKeyword = (word: string) => {
  const cleaned = word
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9/\-]/g, "");
  if (KEYWORDS.has(cleaned)) return true;
  // "AI-powered" → ["AI", "POWERED"]
  return cleaned.split("-").some((part) => KEYWORDS.has(part));
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = useLayout();
  const nowMs = page.startMs + (frame / fps) * 1000;

  // Page pop: scale 0.9 → 1, opacity 0 → 1 over ~6 frames.
  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 260 },
    durationInFrames: 8,
  });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `${layout.captionY * 100}%`,
          width: layout.captionMaxWidth,
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontWeight: 800,
          fontSize: layout.captionFontSize,
          lineHeight: 1.2,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.2em",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}
      >
        {page.tokens.map((token, i) => {
          const isActive = token.fromMs <= nowMs && token.toMs > nowMs;
          const isPast = token.toMs <= nowMs;
          const keyword = isKeyword(token.text);

          const activeFrame = Math.round(((nowMs - token.fromMs) / 1000) * fps);
          const pop = isActive
            ? spring({ frame: activeFrame, fps, config: SPRINGS.pop })
            : 0;
          const wordScale = isActive ? interpolate(pop, [0, 1], [1, 1.08]) : 1;

          const word = token.text.trim();

          const goldFill = keyword || isActive;
          const base: React.CSSProperties = {
            display: "inline-block",
            transform: `scale(${wordScale})`,
            opacity: isActive || isPast ? 1 : 0.6,
          };

          const style: React.CSSProperties = goldFill
            ? {
                ...base,
                backgroundImage: keyword
                  ? GOLD_GRADIENT
                  : `linear-gradient(${COLORS.gold}, ${COLORS.gold})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 3px 0 rgba(0,0,0,0.85)) drop-shadow(0 0 ${
                  isActive ? 30 : 18
                }px ${goldRgba(isActive ? 0.55 : 0.3)})`,
              }
            : {
                ...base,
                color: COLORS.white,
                WebkitTextStroke: "2px rgba(0,0,0,0.9)",
                paintOrder: "stroke fill",
                textShadow: "0 4px 18px rgba(0,0,0,0.85)",
              };

          return (
            // The hidden copy reserves the word's popped (1.08x) width so the
            // active word never collides with its neighbours.
            <span key={`${token.fromMs}-${i}`} style={{ display: "inline-grid" }}>
              <span style={{ gridArea: "1 / 1", visibility: "hidden", fontSize: "1.08em", lineHeight: 1.1 }}>
                {word}
              </span>
              <span style={{ gridArea: "1 / 1", justifySelf: "center", alignSelf: "center", ...style }}>
                {word}
              </span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Loads public/captions.json and renders karaoke-style TikTok caption pages. */
export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading captions.json"));

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("captions.json"));
      setCaptions((await response.json()) as Caption[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: COMBINE_MS,
    }).pages;
  }, [captions]);

  if (!captions) return null;

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const pageEnd = page.startMs + page.durationMs;
        const endMs =
          next && next.startMs - pageEnd < BRIDGE_GAP_MS
            ? next.startMs
            : Math.min(next ? next.startMs : Infinity, pageEnd + HOLD_AFTER_PAGE_MS);
        const from = Math.round((page.startMs / 1000) * fps);
        const to = Math.round((endMs / 1000) * fps);
        if (to - from <= 0) return null;
        return (
          <Sequence key={index} from={from} durationInFrames={to - from} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
