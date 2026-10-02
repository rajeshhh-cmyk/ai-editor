import { parseMedia } from "@remotion/media-parser";
import React from "react";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { FALLBACK_DURATION, FPS } from "./scenes.config";
import { WhiteGoldAvatar } from "./WhiteGoldAvatar";

// Duration comes from the avatar video itself (61.44s → 1843 frames).
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  const { durationInSeconds } = await parseMedia({
    src: staticFile("avatar.mp4"),
    fields: { durationInSeconds: true },
    acknowledgeRemotionLicense: true,
  });
  return { durationInFrames: durationInSeconds ? Math.floor(durationInSeconds * FPS) : FALLBACK_DURATION };
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WhiteGoldAvatar"
    component={WhiteGoldAvatar}
    durationInFrames={FALLBACK_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
    calculateMetadata={calculateMetadata}
  />
);
