import type React from "react";
import { Easing, interpolate } from "remotion";
import { CLAMP } from "../lib/anim";

/** Footage pushed up into frame from below, smeared vertically. */
export const swipeUpIn = (frame: number, dur = 8): React.CSSProperties => {
  const t = interpolate(frame, [0, dur], [1, 0], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  if (t <= 0) return {};
  return { transform: `translateY(${t * 1920}px) scaleY(${1 + t * 0.2})`, filter: `blur(${t * 24}px)` };
};

export const swipeUpOut = (frame: number, duration: number, dur = 8): React.CSSProperties => {
  const t = interpolate(frame, [duration - dur, duration], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  if (t <= 0) return {};
  return { transform: `translateY(${-t * 1920}px) scaleY(${1 + t * 0.2})`, filter: `blur(${t * 24}px)` };
};
