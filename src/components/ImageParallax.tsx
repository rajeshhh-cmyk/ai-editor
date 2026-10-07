import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP } from "../lib/anim";

export type Move = { scale?: number; x?: number; y?: number; rotate?: number };

type Props = {
  src: string;
  duration: number;
  from?: Move;
  to?: Move;
  fit?: "cover" | "contain";
  position?: string;
  filter?: string;
  style?: React.CSSProperties;
};

/** Digital camera move over a still: push-in, pan and drift so stills never sit dead. */
export const ImageParallax: React.FC<Props> = ({
  src,
  duration,
  from = { scale: 1.05 },
  to = { scale: 1.18 },
  fit = "cover",
  position = "center",
  filter,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, Math.max(1, duration)], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.sin) });
  const lerp = (a = 0, b = 0) => a + (b - a) * t;
  const s = lerp(from.scale ?? 1, to.scale ?? 1);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          objectPosition: position,
          transform: `translate(${lerp(from.x, to.x)}px, ${lerp(from.y, to.y)}px) scale(${s}) rotate(${lerp(from.rotate, to.rotate)}deg)`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};
