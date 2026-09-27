import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Title Scene"
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <Interactive.Div
        name="Glow"
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}55 0%, transparent 65%)`,
          scale: interpolate(frame, [0, 3 * fps], [0.6, 1.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Headline"
        style={{
          fontSize: 180,
          fontWeight: 800,
          letterSpacing: -4,
          color: colors.text,
          opacity: interpolate(frame, [0, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 1 * fps], ["0px 60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
          }),
        }}
      >
        AI{" "}
        <span
          style={{
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Editor
        </span>
      </Interactive.Div>
      <Interactive.Div
        name="Tagline"
        style={{
          marginTop: 24,
          fontSize: 64,
          color: colors.muted,
          opacity: interpolate(frame, [0.8 * fps, 1.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0.8 * fps, 1.8 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
            },
          ),
        }}
      >
        Edit videos by just describing them.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
