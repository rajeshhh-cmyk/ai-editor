import { Easing, interpolate, spring } from "remotion";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Fast entrance with slight overshoot, then settle. */
export const punch = (frame: number, fps: number, delay = 0, damping = 12, stiffness = 200) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.7 } });

/** Critically damped — no overshoot. */
export const glide = (frame: number, fps: number, delay = 0, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames });

/** Blur proportional to how fast a value is moving — fakes motion blur. */
export const velocityBlur = (fn: (f: number) => number, frame: number, k = 90, max = 22) =>
  Math.min(max, Math.abs(fn(frame) - fn(frame - 1)) * k);

/** Aggressive exit: 0 → 1 over `dur` frames, accelerating. */
export const exitProgress = (frame: number, at: number | undefined, dur = 8) =>
  at === undefined ? 0 : interpolate(frame, [at, at + dur], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) });

export type Direction = "left" | "right" | "top" | "bottom" | "center" | "drop" | "none";

/** Offset for an element entering FROM / exiting TO a direction. t: 1 = fully off. */
export const directionalTransform = (dir: Direction, t: number, distance: number) => {
  switch (dir) {
    case "left":
      return `translateX(${-distance * t}px)`;
    case "right":
      return `translateX(${distance * t}px)`;
    case "top":
      return `translateY(${-distance * t}px)`;
    case "bottom":
      return `translateY(${distance * t}px)`;
    case "center":
      return `scale(${1 + 0.6 * t})`;
    case "drop":
      return `scale(${1 + 2 * t})`;
    default:
      return "";
  }
};
