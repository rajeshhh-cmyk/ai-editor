import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, Direction, directionalTransform, exitProgress, punch } from "../lib/anim";

type Props = {
  src: string;
  delay?: number;
  from?: Direction;
  exitAt?: number;
  exitTo?: Direction;
  tilt?: number; // starting rotateY in degrees
  rotate?: number; // resting z-rotation
  /** inner camera move: scale 1.0 → 1.15 plus pan */
  pan?: { from: number; to: number; x?: number; y?: number };
  duration?: number;
  position?: string;
  style?: React.CSSProperties;
  label?: string;
};

/**
 * A brochure page treated as a physical object: it slides in on a 3D tilt,
 * unmasks from the bottom, and the camera pans across it while it rests.
 */
export const BrochurePage: React.FC<Props> = ({
  src,
  delay = 0,
  from = "right",
  exitAt,
  exitTo = "left",
  tilt = 28,
  rotate = 0,
  pan = { from: 1, to: 1.15 },
  duration = 60,
  position = "center",
  style,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const p = punch(frame, fps, delay, 15, 160);
  const exit = exitProgress(frame, exitAt, 8);
  const reveal = interpolate(local, [0, 9], [100, 0], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const t = interpolate(local, [0, duration], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.sin) });
  const sign = from === "left" ? -1 : 1;

  return (
    <div style={{ position: "absolute", perspective: 1800, ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 22,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.18)",
          opacity: interpolate(local, [0, 3], [0, 1], CLAMP) * (1 - exit),
          transform: `${directionalTransform(from, 1 - p, 900)} ${directionalTransform(exitTo, exit, 1400)} rotateY(${sign * tilt * (1 - p)}deg) rotate(${rotate * p}deg)`,
          clipPath: `inset(${reveal}% 0 0 0 round 22px)`,
          filter: exit > 0 ? `blur(${exit * 14}px)` : undefined,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: position,
            transform: `scale(${pan.from + (pan.to - pan.from) * t}) translate(${(pan.x ?? 0) * t}px, ${(pan.y ?? 0) * t}px)`,
          }}
        />
        {label ? (
          <div
            style={{
              position: "absolute",
              left: 18,
              bottom: 16,
              padding: "6px 14px",
              borderRadius: 10,
              background: "rgba(11,11,11,0.75)",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
};
