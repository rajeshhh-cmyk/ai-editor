import type React from "react";
import { Easing, interpolate } from "remotion";
import { CLAMP } from "../lib/anim";

const DUR = 9;

/** Outgoing: scale 1 → 1.15 (+ blur) right before the hard cut. */
export const zoomOut = (frame: number, duration: number): React.CSSProperties => {
  const t = interpolate(frame, [duration - DUR, duration], [0, 1], { ...CLAMP, easing: Easing.in(Easing.quad) });
  if (t <= 0) return {};
  return { transform: `scale(${1 + 0.15 * t})`, filter: `blur(${t * 14}px) brightness(${1 + t * 0.4})` };
};

/** Incoming: lands from 1.3x with blur — the other half of a zoom cut. */
export const zoomIn = (frame: number): React.CSSProperties => {
  const t = interpolate(frame, [0, DUR], [1, 0], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  if (t <= 0) return {};
  return { transform: `scale(${1 + 0.3 * t})`, filter: `blur(${t * 16}px) brightness(${1 + t * 0.5})` };
};
