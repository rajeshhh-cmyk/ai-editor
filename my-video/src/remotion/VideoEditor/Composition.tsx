import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  Video,
  staticFile,
  useVideoConfig,
} from "remotion";
import segmentsData from "./segments.json";

type Segment = { start: number; end: number };

type Props = {
  /** Filename relative to /public, e.g. "C0859.MP4" */
  src: string;
};

export const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  const { fps, segments } = segmentsData;
  const totalFrames = (segments as Segment[]).reduce(
    (sum, seg) => sum + Math.round((seg.end - seg.start) * fps),
    0
  );
  return {
    fps,
    durationInFrames: Math.max(totalFrames, 1),
  };
};

export const VideoEditorComposition: React.FC<Props> = ({ src }) => {
  const { fps } = useVideoConfig();

  const { sequences } = (segmentsData.segments as Segment[]).reduce<{
    sequences: React.ReactNode[];
    offset: number;
  }>(
    (acc, seg, i) => {
      const durationInFrames = Math.round((seg.end - seg.start) * fps);
      acc.sequences.push(
        <Sequence key={i} from={acc.offset} durationInFrames={durationInFrames}>
          <Video
            src={staticFile(src)}
            trimBefore={Math.round(seg.start * fps)}
            trimAfter={Math.round(seg.end * fps)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Sequence>
      );
      return { sequences: acc.sequences, offset: acc.offset + durationInFrames };
    },
    { sequences: [], offset: 0 }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>{sequences}</AbsoluteFill>
  );
};
