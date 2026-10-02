import { Circle, ClipboardList, PhoneMissed, type LucideIcon } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { float, progress, smooth } from "../anim";
import { IconRing } from "../components/IconRing";
import { Stage } from "../components/Stage";
import { useLayout } from "../layout";
import { COLORS, FONTS, HEADLINE_STYLE, ICON_STROKE, goldRgba } from "../theme";
import { CUES, local } from "../timeline";

/** Expanding gold rings behind the missed-call icon. */
const PulseRings: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 14) % 42) / 42;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${COLORS.gold}`,
            transform: `scale(${1 + t * 0.7})`,
            opacity: (1 - t) * 0.6,
          }}
        />
      );
    })}
  </>
);

/** Clock face with hands spinning far too fast. */
const SpinningHands: React.FC<{ size: number; frame: number }> = ({ size, frame }) => {
  const minute = frame * 24;
  const hour = frame * 2;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size * 0.46}
      height={size * 0.46}
      style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
    >
      <g stroke={COLORS.gold} strokeWidth={ICON_STROKE} strokeLinecap="round">
        <line x1="12" y1="12" x2="12" y2="5.5" transform={`rotate(${minute} 12 12)`} />
        <line x1="12" y1="12" x2="12" y2="8" transform={`rotate(${hour} 12 12)`} />
      </g>
      <circle cx="12" cy="12" r="0.9" fill={COLORS.gold} />
    </svg>
  );
};

type CardDef = {
  icon: LucideIcon;
  label: string;
  index: string;
  cue: number;
  extra: "pulse" | "wobble" | "clock";
};

const CARDS: CardDef[] = [
  { icon: PhoneMissed, label: "Calls go unanswered", index: "01", cue: CUES.calls, extra: "pulse" },
  { icon: ClipboardList, label: "Tasks done by hand", index: "02", cue: CUES.tasks, extra: "wobble" },
  { icon: Circle, label: "Hours wasted", index: "03", cue: CUES.hours - 6, extra: "clock" },
];

const PainCard: React.FC<{ card: CardDef; dim: number }> = ({ card, dim }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { s } = useLayout();

  const start = local("pain", card.cue) - 3;
  const enter = smooth(frame, fps, start, 18);
  const ring = progress(frame, start + 4, start + 24);
  const t = frame - start;
  const iconSize = 120 * s * 1.15;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 44 * s,
        width: "100%",
        maxWidth: 940 * s,
        padding: `${34 * s}px ${44 * s}px`,
        backgroundColor: COLORS.panel,
        border: `1px solid ${goldRgba(0.75)}`,
        borderRadius: 24,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 ${goldRgba(0.12)}`,
        transform: `translateX(${interpolate(enter, [0, 1], [width * 0.8, 0])}px) translateY(${float(frame, 4, 90, card.cue)}px)`,
        opacity: interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }) * dim,
      }}
    >
      <IconRing
        icon={card.icon}
        size={iconSize}
        progress={ring}
        iconColor={COLORS.gold}
        iconStyle={card.extra === "wobble" ? { transform: `rotate(${Math.sin(t / 4) * 8}deg)` } : undefined}
      >
        {card.extra === "pulse" && t > 0 ? <PulseRings size={iconSize} frame={t} /> : null}
        {card.extra === "clock" ? <SpinningHands size={iconSize} frame={Math.max(0, t)} /> : null}
      </IconRing>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 * s }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 26 * s,
            letterSpacing: "0.3em",
            color: COLORS.gold,
          }}
        >
          {card.index}
        </div>
        <div style={{ ...HEADLINE_STYLE, fontSize: 56 * s, color: COLORS.white }}>{card.label}</div>
      </div>
    </div>
  );
};

export const Scene2Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s } = useLayout();

  const dim = interpolate(
    smooth(frame, fps, local("pain", CUES.painDim), 14),
    [0, 1],
    [1, 0.3],
  );
  const eyebrow = smooth(frame, fps, 2, 16);

  return (
    <Stage>
      <div
        style={{
          fontFamily: FONTS.headline,
          fontWeight: 700,
          fontSize: 30 * s,
          letterSpacing: "0.4em",
          color: COLORS.muted,
          marginBottom: 56 * s,
          opacity: eyebrow * dim,
          transform: `translateY(${(1 - eyebrow) * 20}px)`,
        }}
      >
        THE HIDDEN COST
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36 * s, width: "100%", alignItems: "center" }}>
        {CARDS.map((card) => (
          <PainCard key={card.index} card={card} dim={dim} />
        ))}
      </div>
    </Stage>
  );
};
