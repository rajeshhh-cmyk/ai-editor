import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { BrandLogo } from "./components/BrandLogo";
import { Captions } from "./components/Captions";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Pain } from "./scenes/Scene2Pain";
import { Scene3Turn } from "./scenes/Scene3Turn";
import { Scene4Brand } from "./scenes/Scene4Brand";
import { Scene5Automate } from "./scenes/Scene5Automate";
import { Scene6Connect } from "./scenes/Scene6Connect";
import { Scene7Outcomes } from "./scenes/Scene7Outcomes";
import { Scene8CTA } from "./scenes/Scene8CTA";
import { CUES, SCENES, TRANSITION_FRAMES, type SceneKey } from "./timeline";

type TransitionPresentation = ReturnType<typeof fade>;

const ORDER: { key: SceneKey; render: (duration: number) => React.ReactNode }[] = [
  { key: "hook", render: () => <Scene1Hook /> },
  { key: "pain", render: () => <Scene2Pain /> },
  { key: "turn", render: () => <Scene3Turn /> },
  { key: "brand", render: () => <Scene4Brand /> },
  { key: "automate", render: () => <Scene5Automate /> },
  { key: "connect", render: () => <Scene6Connect /> },
  { key: "outcomes", render: () => <Scene7Outcomes /> },
  { key: "cta", render: (d) => <Scene8CTA durationInFrames={d} /> },
];

/** Transition used to enter each scene (index = incoming scene). */
const ENTER: Record<number, () => TransitionPresentation> = {
  1: () => slide({ direction: "from-right" }) as TransitionPresentation,
  4: () => wipe({ direction: "from-left" }) as TransitionPresentation,
  6: () => slide({ direction: "from-bottom" }) as TransitionPresentation,
};

export const WhiteGoldAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Backdrop brightens briefly on "change everything".
  const glow = interpolate(
    frame,
    [CUES.change, CUES.everything + 6, CUES.everything + 40, CUES.everything + 70],
    [0, 1, 1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Each scene starts exactly on its SCENES.from frame; the outgoing scene is
  // extended by TRANSITION_FRAMES so the transition overlaps the cut.
  const items = ORDER.map((scene, i) => {
    const from = SCENES[scene.key].from;
    const isLast = i === ORDER.length - 1;
    const nextFrom = isLast ? durationInFrames : SCENES[ORDER[i + 1].key].from;
    const duration = nextFrom - from + (isLast ? 0 : TRANSITION_FRAMES);
    return { ...scene, duration };
  });

  return (
    <AbsoluteFill>
      <Audio src={staticFile("voiceover.mp3")} />
      <Background glow={glow} />

      <TransitionSeries>
        {items.flatMap((item, i) => {
          const nodes: React.ReactNode[] = [];
          if (i > 0) {
            nodes.push(
              <TransitionSeries.Transition
                key={`t-${item.key}`}
                presentation={(ENTER[i] ?? fade)()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />,
            );
          }
          nodes.push(
            <TransitionSeries.Sequence key={item.key} durationInFrames={item.duration} name={item.key}>
              {item.render(item.duration)}
            </TransitionSeries.Sequence>,
          );
          return nodes;
        })}
      </TransitionSeries>

      <BrandLogo />
      <Captions />
    </AbsoluteFill>
  );
};
