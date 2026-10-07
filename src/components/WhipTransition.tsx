import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { CLAMP } from "../lib/anim";

const WHIP = 7;

/** Incoming scene arrives sideways with a heavy horizontal smear. */
export const whipIn = (frame: number, dir: "left" | "right"): React.CSSProperties => {
  const t = interpolate(frame, [0, WHIP], [1, 0], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  if (t <= 0) return {};
  const sign = dir === "left" ? -1 : 1;
  return { transform: `translateX(${sign * t * 1080}px) scaleX(${1 + t * 0.25})`, filter: `blur(${t * 28}px)` };
};

/** Outgoing scene is thrown sideways in its last frames. */
export const whipOut = (frame: number, duration: number, dir: "left" | "right"): React.CSSProperties => {
  const t = interpolate(frame, [duration - WHIP, duration], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  if (t <= 0) return {};
  const sign = dir === "left" ? -1 : 1;
  return { transform: `translateX(${sign * t * 1080}px) scaleX(${1 + t * 0.25})`, filter: `blur(${t * 28}px)` };
};

/** Streak burst laid over a cut — sells the whip even on hard cuts. */
export const WhipOverlay: React.FC<{ dir?: "left" | "right"; seed?: string }> = ({ dir = "left", seed = "w" }) => {
  const frame = useCurrentFrame();
  const sign = dir === "left" ? -1 : 1;
  const flash = interpolate(frame, [0, 3, 10], [0, 0.35, 0], CLAMP);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `rgba(255,236,190,${flash})` }} />
      {Array.from({ length: 9 }).map((_, i) => {
        const y = random(`${seed}y${i}`) * 1920;
        const h = 10 + random(`${seed}h${i}`) * 70;
        const speed = 0.7 + random(`${seed}s${i}`) * 0.6;
        const x = interpolate(frame * speed, [0, 10], [-sign * 1400, sign * 1400]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: 540 - 700 + x,
              width: 1400,
              height: h,
              background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,${200 + i * 5},120,0.55), rgba(255,255,255,0))`,
              filter: "blur(10px)",
              opacity: interpolate(frame, [0, 2, 9, 11], [0, 1, 1, 0], CLAMP),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
