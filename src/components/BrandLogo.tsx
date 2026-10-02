import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeOut, pop, smooth } from "../anim";
import { useLayout } from "../layout";
import { CUES, END_CARD_FRAMES } from "../timeline";
import { LogoLockup } from "./LogoLockup";

const BIG_SIZE = 130;

/**
 * Global logo overlay (absolute timeline): reveals big and centred on
 * "White & Gold", then shrinks into the top-left corner and stays as a
 * watermark until the end card takes over.
 */
export const BrandLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();
  const { s, stage, portrait } = useLayout();

  const reveal = pop(frame, fps, CUES.white - 4);
  if (frame < CUES.white - 4) return null;

  const shrink = smooth(frame, fps, CUES.logoShrink, 22);
  const bigSize = BIG_SIZE * s;
  const cornerSize = portrait ? 44 : 34;
  const corner = portrait ? { x: 64, y: 128 } : { x: 64, y: 44 };
  const center = { x: width / 2, y: stage.top + stage.height * 0.5 };

  const x = interpolate(shrink, [0, 1], [center.x, corner.x]);
  const y = interpolate(shrink, [0, 1], [center.y, corner.y]);
  const scale = interpolate(reveal, [0, 1], [0.8, 1]) * interpolate(shrink, [0, 1], [1, cornerSize / bigSize]);
  const k = 1 - shrink; // 1 = centred on (x, y), 0 = anchored top-left at (x, y)

  const endStart = durationInFrames - END_CARD_FRAMES;
  const opacity =
    interpolate(frame, [CUES.white - 4, CUES.white + 4], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(shrink, [0, 1], [1, 0.85]) *
    fadeOut(frame, endStart - 8, endStart + 2);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(${x}px, ${y}px) scale(${scale}) translate(${-50 * k}%, ${-50 * k}%)`,
          opacity,
        }}
      >
        <LogoLockup size={bigSize} glow={interpolate(shrink, [0, 1], [1.6, 0.4])} align={shrink > 0.5 ? "flex-start" : "center"} />
      </div>
    </AbsoluteFill>
  );
};
