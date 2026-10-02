import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { lerp, progress } from "../anim";
import { MODES, modeIndexAt, type Mode } from "../scenes.config";
import { COLORS, GOLD_GLOW, H, SPRINGS, W, goldRgba } from "../theme";
import { Glitch } from "./Glitch";

type Box = { x: number; y: number; w: number; h: number; r: number; border: number };

const BOXES: Record<Exclude<Mode, "hidden">, Box> = {
  full: { x: 0, y: 0, w: W, h: H, r: 0, border: 0 },
  top: { x: 80, y: 180, w: 920, h: 1050, r: 32, border: 2 },
};

/** Caption centre line per mode. */
export const CAPTION_Y: Record<Mode, number> = {
  full: H * 0.74,
  top: BOXES.top.y + BOXES.top.h + 64,
  hidden: H * 0.78,
};

/** Where the presenter's face sits in the source video (px). */
const FACE = { x: 540, y: 460 };
const LAYOUT_FRAMES = 15;
const HIDE_FRAMES = 10;
const REVEAL_FRAMES = 16;

const lerpBox = (a: Box, b: Box, t: number): Box => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
  border: lerp(a.border, b.border, t),
});

export type AvatarState = {
  box: Box;
  opacity: number;
  scale: number;
  blur: number;
  /** Circular reveal radius (px) when coming back from hidden, else null. */
  revealR: number | null;
  /** 0 = not full, 1 = fully in "full" mode (bottom gradient strength). */
  fullness: number;
  /** 1 = card styling (border + glow). */
  cardness: number;
  captionY: number;
  mode: Mode;
};

/** Layout state of the avatar at an absolute frame. */
export const getAvatarState = (frame: number, fps: number): AvatarState => {
  const i = modeIndexAt(frame);
  const cur = MODES[i];
  const prev = i > 0 ? MODES[i - 1] : null;
  const t = frame - cur.from;

  const layoutT = prev ? spring({ frame: t, fps, config: SPRINGS.smooth, durationInFrames: LAYOUT_FRAMES }) : 1;
  const captionY = lerp(prev ? CAPTION_Y[prev.mode] : CAPTION_Y[cur.mode], CAPTION_Y[cur.mode], layoutT);

  if (cur.mode === "hidden") {
    const base = BOXES[(prev?.mode ?? "full") as Exclude<Mode, "hidden">] ?? BOXES.full;
    const q = progress(t, 0, HIDE_FRAMES);
    return {
      box: base,
      opacity: 1 - q,
      scale: lerp(1, 1.15, q),
      blur: lerp(0, 20, q),
      revealR: null,
      fullness: prev?.mode === "full" ? 1 - q : 0,
      cardness: prev?.mode === "top" ? 1 - q : 0,
      captionY,
      mode: cur.mode,
    };
  }

  const target = BOXES[cur.mode];
  if (prev?.mode === "hidden") {
    const q = progress(t, 0, REVEAL_FRAMES);
    const eased = 1 - Math.pow(1 - q, 3);
    const maxR = Math.hypot(target.w, target.h);
    return {
      box: target,
      opacity: 1,
      scale: lerp(1.08, 1, eased),
      blur: lerp(8, 0, eased),
      revealR: q < 1 ? eased * maxR : null,
      fullness: cur.mode === "full" ? 1 : 0,
      cardness: cur.mode === "top" ? 1 : 0,
      captionY,
      mode: cur.mode,
    };
  }

  const from = prev ? BOXES[prev.mode as Exclude<Mode, "hidden">] : target;
  return {
    box: lerpBox(from, target, layoutT),
    opacity: 1,
    scale: 1,
    blur: 0,
    revealR: null,
    fullness: cur.mode === "full" ? layoutT : 1 - layoutT,
    cardness: cur.mode === "top" ? layoutT : 1 - layoutT,
    captionY,
    mode: cur.mode,
  };
};

/** The presenter video, cover-fitted into a box and anchored on her face. */
const VideoLayer: React.FC<{ box: Box; zoom: number; filter: string; muted?: boolean; style?: React.CSSProperties }> = ({
  box,
  zoom,
  filter,
  muted,
  style,
}) => {
  const s = Math.max(box.w / W, box.h / H);
  const vw = W * s;
  const vh = H * s;
  const ox = (box.w - vw) / 2;
  const oy = Math.min(0, Math.max(box.h - vh, box.h * 0.4 - FACE.y * s));
  return (
    <OffthreadVideo
      src={staticFile("avatar.mp4")}
      muted={muted}
      style={{
        position: "absolute",
        left: ox,
        top: oy,
        width: vw,
        height: vh,
        maxWidth: "none",
        transformOrigin: `${FACE.x * s}px ${FACE.y * s}px`,
        transform: `scale(${zoom})`,
        filter,
        ...style,
      }}
    />
  );
};

/**
 * The presenter. Its <OffthreadVideo> is always mounted (it carries the
 * voiceover); modes only change its box, opacity and blur.
 */
export const AvatarFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = getAvatarState(frame, fps);
  const { box } = st;

  // Slow, continuous 1.00 → 1.04 breathing zoom.
  const zoom = 1.02 + 0.02 * Math.sin(frame / 160);
  // Warm + contrast grade.
  const grade = `contrast(1.08) saturate(1.06) sepia(0.1) brightness(1.02)`;
  const filter = `${grade}${st.blur > 0.1 ? ` blur(${st.blur}px)` : ""}`;

  const clip =
    st.revealR !== null ? `circle(${st.revealR}px at 50% ${(FACE.y / H) * 100 + 4}%)` : undefined;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          borderRadius: box.r,
          overflow: "hidden",
          opacity: st.opacity,
          transform: `scale(${st.scale})`,
          clipPath: clip,
          boxShadow: st.cardness > 0.01 ? `${GOLD_GLOW}, 0 30px 80px rgba(0,0,0,0.6)` : undefined,
          backgroundColor: COLORS.black,
        }}
      >
        <Glitch
          frame={frame}
          end={9}
          layer={(muted, style) => <VideoLayer box={box} zoom={zoom} filter={filter} muted={muted} style={style} />}
        />
        {/* Soft vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 38%, transparent 50%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {/* Bottom readability gradient (full mode) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: st.fullness,
            background: "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Gold card border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: box.r,
            border: `${box.border}px solid ${COLORS.gold}`,
            opacity: st.cardness,
          }}
        />
      </div>

      {/* Circular gold-ring reveal */}
      {st.revealR !== null ? (
        <div
          style={{
            position: "absolute",
            left: box.x + box.w / 2 - st.revealR,
            top: box.y + box.h * ((FACE.y / H) + 0.04) - st.revealR,
            width: st.revealR * 2,
            height: st.revealR * 2,
            borderRadius: "50%",
            border: `4px solid ${COLORS.goldLight}`,
            boxShadow: `0 0 40px ${goldRgba(0.7)}, inset 0 0 40px ${goldRgba(0.4)}`,
            opacity: interpolate(st.revealR, [0, 200, Math.hypot(box.w, box.h)], [1, 1, 0]),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
