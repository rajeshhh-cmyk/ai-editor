import { interpolate, spring } from "remotion";
import { SPRINGS } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Linear 0→1 between two frames, clamped. */
export const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);

/** UI pop spring ({damping: 14, stiffness: 120}) starting at `delay`. */
export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: SPRINGS.pop });

/** Smooth slide spring ({damping: 200}) starting at `delay`. */
export const smooth = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps, config: SPRINGS.smooth, durationInFrames });

/** Fade out between two frames (1 → 0). */
export const fadeOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [1, 0], clamp);

/** Gentle 1.0 → 1.03 push-in across a scene so it never feels static. */
export const slowZoom = (frame: number, duration: number) =>
  interpolate(frame, [0, duration], [1, 1.03], clamp);

/** Subtle float offset in px. */
export const float = (frame: number, amp = 8, period = 70, phase = 0) =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amp;
