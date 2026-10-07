import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { MediaAsset } from "../data/assets";
import { CLAMP } from "../lib/anim";
import { ImageParallax, Move } from "./ImageParallax";

type Props = {
  asset: MediaAsset;
  duration: number;
  /** seconds into the clip to start from */
  trimBefore?: number;
  playbackRate?: number;
  from?: Move;
  to?: Move;
  filter?: string;
  position?: string;
};

/** Renders a manifest asset — footage or still — with the same camera-move API. */
export const Media: React.FC<Props> = ({ asset, duration, trimBefore = 0, playbackRate = 1, from, to, filter, position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (asset.kind === "image") {
    return <ImageParallax src={asset.src} duration={duration} from={from} to={to} filter={filter} position={position} />;
  }
  const f = from ?? { scale: 1.0 };
  const t2 = to ?? { scale: 1.12 };
  const t = interpolate(frame, [0, Math.max(1, duration)], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.sin) });
  const lerp = (a = 0, b = 0) => a + (b - a) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${lerp(f.x, t2.x)}px, ${lerp(f.y, t2.y)}px) scale(${lerp(f.scale ?? 1, t2.scale ?? 1)}) rotate(${lerp(f.rotate, t2.rotate)}deg)`,
          filter,
        }}
      >
        <Video
          src={staticFile(asset.src)}
          muted
          trimBefore={Math.round(trimBefore * fps)}
          playbackRate={playbackRate}
          objectFit="cover"
          style={{ width: "100%", height: "100%", objectPosition: position }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
