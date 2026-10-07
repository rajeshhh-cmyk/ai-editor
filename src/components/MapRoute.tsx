import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, punch } from "../lib/anim";
import { COLORS, FONT_FAMILY } from "../lib/theme";

export type MapNode = { x: number; y: number; label: string; sub?: string; kind: "city" | "dest" | "poi"; labelSide?: "left" | "right" | "below" | "above" };

type Props = {
  nodes: MapNode[]; // route order, last = destination
  drawFrom: number;
  drawTo: number;
  roadLabel?: string;
  roadLabelAt?: { x: number; y: number; angle: number };
  pois?: (MapNode & { at: number })[];
  duration: number;
};

const segLen = (a: MapNode, b: MapNode) => Math.hypot(b.x - a.x, b.y - a.y);

/** Minimal schematic map: route draws itself, nodes light up as it passes, pin drops and pulses. */
export const MapRoute: React.FC<Props> = ({ nodes, drawFrom, drawTo, roadLabel, roadLabelAt, pois = [], duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lens = nodes.slice(1).map((n, i) => segLen(nodes[i], n));
  const total = lens.reduce((a, b) => a + b, 0);
  const progress = interpolate(frame, [drawFrom, drawTo], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const reachedAt = nodes.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0) / total);
  const path = nodes.map((n, i) => `${i === 0 ? "M" : "L"}${n.x},${n.y}`).join(" ");
  const dest = nodes[nodes.length - 1];
  const pinDrop = punch(frame, fps, drawTo - 2, 9, 180);
  const drift = interpolate(frame, [0, duration], [1.02, 1.12], CLAMP);

  return (
    <AbsoluteFill style={{ transform: `scale(${drift})`, transformOrigin: `${dest.x}px ${dest.y}px` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          </pattern>
          <linearGradient id="route" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={COLORS.goldLight} />
            <stop offset="1" stopColor={COLORS.gold} />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grid)" />
        {/* context: river + minor roads (schematic, not to scale) */}
        <path d="M-40 760 C 200 700, 300 900, 520 820 S 820 640, 1120 700" stroke="rgba(90,150,255,0.35)" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M120 1500 L 420 1230 L 560 980" stroke="rgba(255,255,255,0.10)" strokeWidth="10" fill="none" />
        <path d="M640 1520 L 760 1180 L 980 1020" stroke="rgba(255,255,255,0.10)" strokeWidth="10" fill="none" />
        {/* full highway faint, then drawn route on top */}
        <path d={path} stroke="rgba(255,255,255,0.18)" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={path}
          stroke="url(#route)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={total}
          strokeDashoffset={total * (1 - progress)}
          style={{ filter: "drop-shadow(0 0 14px rgba(245,184,46,0.9))" }}
        />
        {/* destination pulse rings */}
        {progress >= 1
          ? [0, 12, 24].map((o) => {
              const t = ((frame - drawTo + o) % 36) / 36;
              return <circle key={o} cx={dest.x} cy={dest.y} r={20 + t * 110} fill="none" stroke={COLORS.gold} strokeWidth={5} opacity={(1 - t) * 0.8} />;
            })
          : null}
      </svg>

      {roadLabel && roadLabelAt ? (
        <div
          style={{
            position: "absolute",
            left: roadLabelAt.x,
            top: roadLabelAt.y,
            transform: `translate(-50%,-50%) rotate(${roadLabelAt.angle}deg)`,
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.12em",
            color: COLORS.gold,
            opacity: interpolate(progress, [0.45, 0.7], [0, 1], CLAMP),
            whiteSpace: "nowrap",
          }}
        >
          {roadLabel}
        </div>
      ) : null}

      {nodes.map((n, i) => {
        const lit = interpolate(progress, [reachedAt[i] - 0.02, reachedAt[i] + 0.05], [0, 1], CLAMP);
        if (n.kind === "dest") return null;
        return <NodeDot key={i} node={n} lit={lit} />;
      })}

      {pois.map((poi, i) => {
        const p = punch(frame, fps, poi.at, 10, 200);
        return <NodeDot key={`poi${i}`} node={poi} lit={Math.min(1, p)} scale={p} color="#7FD3FF" />;
      })}

      {/* pin */}
      <div
        style={{
          position: "absolute",
          left: dest.x,
          top: dest.y,
          transform: `translate(-50%, -100%) translateY(${(1 - pinDrop) * -260}px) scale(${0.6 + 0.4 * Math.min(pinDrop, 1.2)})`,
          opacity: interpolate(frame, [drawTo - 2, drawTo + 1], [0, 1], CLAMP),
          transformOrigin: "50% 100%",
        }}
      >
        <svg width="110" height="140" viewBox="0 0 110 140">
          <path d="M55 136 C 55 136, 8 80, 8 50 A 47 47 0 1 1 102 50 C 102 80, 55 136, 55 136 Z" fill={COLORS.gold} stroke="#fff" strokeWidth="5" />
          <circle cx="55" cy="50" r="18" fill={COLORS.black} />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: dest.x,
          top: dest.y + 30,
          transform: `translateX(-62%) scale(${Math.min(1, pinDrop)})`,
          transformOrigin: "50% 0%",
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 44, color: COLORS.white }}>{dest.label}</div>
        {dest.sub ? <div style={{ fontWeight: 800, fontSize: 30, color: COLORS.gold, letterSpacing: "0.08em" }}>{dest.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

const NodeDot: React.FC<{ node: MapNode; lit: number; scale?: number; color?: string }> = ({ node, lit, scale = 1, color = COLORS.gold }) => {
  const side = node.labelSide ?? "right";
  const labelPos: React.CSSProperties =
    side === "right"
      ? { left: 34, top: -22 }
      : side === "left"
        ? { right: 34, top: -22, textAlign: "right" }
        : side === "below"
          ? { left: "50%", top: 30, transform: "translateX(-50%)", textAlign: "center" }
          : { left: "50%", bottom: 30, transform: "translateX(-50%)", textAlign: "center" };
  return (
    <div style={{ position: "absolute", left: node.x, top: node.y, transform: `scale(${scale})` }}>
      <div
        style={{
          position: "absolute",
          left: -16,
          top: -16,
          width: 32,
          height: 32,
          borderRadius: 16,
          background: lit > 0.5 ? color : "rgba(255,255,255,0.35)",
          border: "5px solid #fff",
          boxShadow: `0 0 ${30 * lit}px ${color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          ...labelPos,
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: 34,
          color: "#fff",
          opacity: 0.35 + 0.65 * lit,
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}
      >
        {node.label}
        {node.sub ? <div style={{ fontSize: 24, color }}>{node.sub}</div> : null}
      </div>
    </div>
  );
};
