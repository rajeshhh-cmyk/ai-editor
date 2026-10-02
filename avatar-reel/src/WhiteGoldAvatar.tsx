import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { AvatarFrame } from "./components/AvatarFrame";
import { Captions } from "./components/Captions";
import { BrandLogo } from "./components/LogoLockup";
import { Backdrop, Particles } from "./components/Particles";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Brand } from "./scenes/Scene3Brand";
import { Scene4Content } from "./scenes/Scene4Content";
import { Scene5Leads } from "./scenes/Scene5Leads";
import { Scene6CRM } from "./scenes/Scene6CRM";
import { Scene7Summary } from "./scenes/Scene7Summary";
import { Scene8CTA } from "./scenes/Scene8CTA";
import { SCENES, type SceneKey } from "./scenes.config";

const SCENE_COMPONENTS: Record<SceneKey, React.FC> = {
  hook: Scene1Hook,
  problem: Scene2Problem,
  brand: Scene3Brand,
  content: Scene4Content,
  leads: Scene5Leads,
  crm: Scene6CRM,
  summary: Scene7Summary,
  cta: Scene8CTA,
};

export const WhiteGoldAvatar: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      {/* Graphics-only backdrop (seen when the avatar is hidden) */}
      <Backdrop />
      {/* The presenter — always mounted, carries the voiceover */}
      <AvatarFrame />
      <Particles opacity={0.8} />

      {(Object.keys(SCENES) as SceneKey[]).map((key) => {
        const { from } = SCENES[key];
        const to = key === "cta" ? durationInFrames : SCENES[key].to;
        const Scene = SCENE_COMPONENTS[key];
        return (
          <Sequence key={key} from={from} durationInFrames={to - from} name={key}>
            <Scene />
          </Sequence>
        );
      })}

      <BrandLogo />
      <Captions />
    </AbsoluteFill>
  );
};
