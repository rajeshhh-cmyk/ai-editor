import type React from "react";
import { Easing, interpolate } from "remotion";
import { CLAMP } from "../lib/anim";

/** Diagonal soft-edged reveal of the incoming scene (map line → wipe). */
export const blurWipeIn = (frame: number, angle = 115, dur = 12): React.CSSProperties => {
  const p = interpolate(frame, [0, dur], [-25, 125], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  if (p >= 125) return {};
  const mask = `linear-gradient(${angle}deg, black ${p - 18}%, transparent ${p + 18}%)`;
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    filter: `blur(${interpolate(frame, [0, dur], [10, 0], CLAMP)}px)`,
  };
};
