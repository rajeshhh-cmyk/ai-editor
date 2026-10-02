import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { FPS, FALLBACK_DURATION_IN_FRAMES } from "./timeline";
import { WhiteGoldAd } from "./WhiteGoldAd";

// Duration always matches the voiceover exactly.
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  const seconds = await getAudioDurationInSeconds(staticFile("voiceover.mp3"));
  return { durationInFrames: Math.ceil(seconds * FPS) };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WhiteGoldAd"
        component={WhiteGoldAd}
        durationInFrames={FALLBACK_DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="WhiteGoldAd16x9"
        component={WhiteGoldAd}
        durationInFrames={FALLBACK_DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
