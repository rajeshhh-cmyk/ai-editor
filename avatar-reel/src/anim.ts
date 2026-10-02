import { interpolate, spring } from "remotion";
import { SPRINGS } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);

export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: SPRINGS.pop });

export const smooth = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps, config: SPRINGS.smooth, durationInFrames });

/** 1 while inside [start, end], easing in/out over `fade` frames. */
export const hold = (frame: number, start: number, end: number, fade = 8) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], clamp);

export const float = (frame: number, amp = 8, period = 70, phase = 0) =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amp;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
