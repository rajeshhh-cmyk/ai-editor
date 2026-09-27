import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Outro Scene"
      style={{
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <Interactive.Div
        name="Call To Action"
        style={{
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: -3,
          color: "white",
          scale: interpolate(frame, [0, 1 * fps], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Start creating.
      </Interactive.Div>
      <Interactive.Div
        name="Subline"
        style={{
          marginTop: 32,
          fontSize: 56,
          color: "#ffffffdd",
          opacity: interpolate(frame, [0.7 * fps, 1.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        AI Editor — your footage, your words.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
