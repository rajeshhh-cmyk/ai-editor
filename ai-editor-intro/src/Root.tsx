import "./index.css";
import { Composition, Folder } from "remotion";
import { AiEditorIntro } from "./AiEditorIntro";
import { FeaturesScene } from "./FeaturesScene";
import { OutroScene } from "./OutroScene";
import { TitleScene } from "./TitleScene";

const video = { width: 1920, height: 1080, fps: 30 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="AiEditorIntro-Scenes">
        <Composition
          id="Title"
          component={TitleScene}
          durationInFrames={120}
          {...video}
        />
        <Composition
          id="Features"
          component={FeaturesScene}
          durationInFrames={150}
          {...video}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          durationInFrames={105}
          {...video}
        />
      </Folder>
      {/* 120 + 150 + 105 - 2 × 15 transition overlap */}
      <Composition
        id="AiEditorIntro"
        component={AiEditorIntro}
        durationInFrames={345}
        {...video}
      />
    </>
  );
};
