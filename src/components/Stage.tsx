import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { slowZoom } from "../anim";
import { useLayout } from "../layout";

/**
 * Positions scene visuals inside the safe "stage" box (above the captions)
 * and applies a gentle 1.0 → 1.03 push-in across the scene.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  zoom?: boolean;
  /** Pixel offset, e.g. for screen shake. */
  offset?: { x: number; y: number };
}> = ({ children, style, zoom = true, offset = { x: 0, y: 0 } }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { stage } = useLayout();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: stage.top,
          left: stage.left,
          width: stage.width,
          height: stage.height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom ? slowZoom(frame, durationInFrames) : 1})`,
          ...style,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
