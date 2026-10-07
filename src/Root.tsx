import React from "react";
import { Composition } from "remotion";
import { HornbillHeights } from "./compositions/HornbillHeights";
import { AdData, hornbill, totalSeconds } from "./data/hornbill";
import { fontsReady } from "./lib/fonts";
import { VIDEO } from "./lib/theme";

void fontsReady;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HornbillHeights"
      component={HornbillHeights as React.FC<Record<string, unknown>>}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={Math.ceil(totalSeconds(hornbill) * VIDEO.fps)}
      defaultProps={hornbill as unknown as Record<string, unknown>}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.ceil(totalSeconds(props as unknown as AdData) * VIDEO.fps),
      })}
    />
  </>
);
