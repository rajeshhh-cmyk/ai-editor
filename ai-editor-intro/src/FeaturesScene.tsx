import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";

const Feature: React.FC<{ index: number; title: string; body: string }> = ({
  index,
  title,
  body,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = 0.4 * fps + index * 0.5 * fps;

  return (
    <Interactive.Div
      name={`Feature ${index + 1}`}
      style={{
        width: 500,
        padding: 48,
        borderRadius: 32,
        backgroundColor: "#151b2e",
        border: `2px solid ${index === 1 ? colors.accent2 : colors.accent}66`,
        opacity: interpolate(frame, [start, start + 0.6 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(
          frame,
          [start, start + 0.8 * fps],
          ["0px 80px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
          },
        ),
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: index === 1 ? colors.accent2 : colors.accent,
        }}
      >
        0{index + 1}
      </div>
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: colors.text,
          marginTop: 16,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 40,
          color: colors.muted,
          marginTop: 16,
          lineHeight: 1.3,
        }}
      >
        {body}
      </div>
    </Interactive.Div>
  );
};

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Features Scene"
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        gap: 80,
      }}
    >
      <Interactive.Div
        name="Heading"
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: colors.text,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        How it works
      </Interactive.Div>
      <div style={{ display: "flex", gap: 48 }}>
        <Feature index={0} title="Upload" body="Drop in your raw footage." />
        <Feature
          index={1}
          title="Describe"
          body="Say what you want in plain words."
        />
        <Feature
          index={2}
          title="Export"
          body="Get a polished cut in minutes."
        />
      </div>
    </AbsoluteFill>
  );
};
