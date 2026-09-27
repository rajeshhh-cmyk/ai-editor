import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { FeaturesScene } from "./FeaturesScene";
import { OutroScene } from "./OutroScene";
import { TitleScene } from "./TitleScene";

export const AiEditorIntro: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Title" durationInFrames={120}>
      <TitleScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Features" durationInFrames={150}>
      <FeaturesScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence name="Outro" durationInFrames={105}>
      <OutroScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
