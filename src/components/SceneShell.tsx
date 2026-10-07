import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../lib/theme";
import { blurWipeIn } from "./BlurWipe";
import { swipeUpIn, swipeUpOut } from "./VerticalSwipe";
import { whipIn, whipOut } from "./WhipTransition";
import { zoomIn, zoomOut } from "./ZoomCut";

export type Enter = "cut" | "whip-left" | "whip-right" | "zoom" | "blur-wipe" | "swipe-up";
export type Exit = "cut" | "whip-left" | "whip-right" | "zoom" | "swipe-up";

const merge = (a: React.CSSProperties, b: React.CSSProperties): React.CSSProperties => ({
  ...a,
  ...b,
  transform: [a.transform, b.transform].filter(Boolean).join(" ") || undefined,
  filter: [a.filter, b.filter].filter(Boolean).join(" ") || undefined,
});

/** Wraps a scene with a reusable entrance + exit so cuts are never plain. */
export const SceneShell: React.FC<{ enter?: Enter; exit?: Exit; duration: number; background?: string; children: React.ReactNode }> = ({
  enter = "cut",
  exit = "cut",
  duration,
  background = COLORS.black,
  children,
}) => {
  const frame = useCurrentFrame();
  const inStyle =
    enter === "whip-left" ? whipIn(frame, "right") : enter === "whip-right" ? whipIn(frame, "left") : enter === "zoom" ? zoomIn(frame) : enter === "blur-wipe" ? blurWipeIn(frame) : enter === "swipe-up" ? swipeUpIn(frame) : {};
  const outStyle =
    exit === "whip-left" ? whipOut(frame, duration, "left") : exit === "whip-right" ? whipOut(frame, duration, "right") : exit === "zoom" ? zoomOut(frame, duration) : exit === "swipe-up" ? swipeUpOut(frame, duration) : {};
  return (
    <AbsoluteFill style={{ background, overflow: "hidden", ...merge(inStyle, outStyle) }}>
      {children}
    </AbsoluteFill>
  );
};
