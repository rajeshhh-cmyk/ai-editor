import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { WhipOverlay } from "../components/WhipTransition";
import { assets } from "../data/assets";
import type { AdData, SceneId } from "../data/hornbill";
import { SceneProvider } from "../lib/scene";
import { COLORS, FONT_FAMILY } from "../lib/theme";
import { AllInclusive } from "../scenes/AllInclusive";
import { BuildingReveal } from "../scenes/BuildingReveal";
import { CompleteCity } from "../scenes/CompleteCity";
import { EndCard } from "../scenes/EndCard";
import { HomeOffice } from "../scenes/HomeOffice";
import { Hook } from "../scenes/Hook";
import { Location } from "../scenes/Location";
import { PhaseOne } from "../scenes/PhaseOne";
import { PriceReveal } from "../scenes/PriceReveal";
import { Township } from "../scenes/Township";
import { Walkthrough } from "../scenes/Walkthrough";

// Story order: HOOK → 3D BUILDING → LOCATION → TOWNSHIP → WALKTHROUGH → PRICE → PROOF → CTA.
// `streak` lays a WhipOverlay over the cut INTO that scene.
const SCENES: { id: SceneId; Component: React.FC; streak?: "left" | "right" }[] = [
  { id: "hook", Component: Hook },
  { id: "buildingReveal", Component: BuildingReveal },
  { id: "location", Component: Location, streak: "left" },
  { id: "township", Component: Township },
  { id: "completeCity", Component: CompleteCity },
  { id: "walkthrough", Component: Walkthrough, streak: "left" },
  { id: "homeOffice", Component: HomeOffice },
  { id: "priceReveal", Component: PriceReveal },
  { id: "allInclusive", Component: AllInclusive },
  { id: "phaseOne", Component: PhaseOne, streak: "left" },
  { id: "endCard", Component: EndCard },
];

export const HornbillHeights: React.FC<AdData> = (data) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ background: COLORS.black, fontFamily: FONT_FAMILY }}>
      {SCENES.map(({ id, Component }) => {
        const [start, end] = data.scenes[id];
        return (
          <Sequence key={id} name={id} from={f(start)} durationInFrames={f(end) - f(start)}>
            <SceneProvider data={data} startSec={start} endSec={end}>
              <Component />
            </SceneProvider>
          </Sequence>
        );
      })}
      {SCENES.filter((s) => s.streak).map(({ id, streak }) => (
        <Sequence key={`streak-${id}`} name={`whip→${id}`} from={f(data.scenes[id][0]) - 4} durationInFrames={12}>
          <WhipOverlay dir={streak} seed={id} />
        </Sequence>
      ))}
      <Audio src={staticFile(data.audio.vo)} volume={data.audio.voVolume} />
      {assets.music ? <Audio src={staticFile(assets.music)} volume={data.audio.musicVolume} loop /> : null}
    </AbsoluteFill>
  );
};
