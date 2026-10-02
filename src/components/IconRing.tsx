import type { LucideIcon } from "lucide-react";
import React from "react";
import { COLORS, ICON_STROKE, goldRgba } from "../theme";

/**
 * Circle with a gold ring that draws itself (stroke-dashoffset) and a lucide
 * icon in the middle. `progress` 0→1 controls how much of the ring is drawn.
 */
export const IconRing: React.FC<{
  icon: LucideIcon;
  size?: number;
  progress: number;
  iconColor?: string;
  iconScale?: number;
  /** 0–1: extra gold glow + fill tint when the node is "lit". */
  lit?: number;
  iconStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  icon: Icon,
  size = 120,
  progress,
  iconColor = COLORS.gold,
  iconScale = 0.46,
  lit = 0,
  iconStyle,
  children,
}) => {
  const stroke = Math.max(2, size / 50);
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: goldRgba(0.04 + lit * 0.1),
        boxShadow: lit > 0 ? `0 0 ${40 + lit * 30}px ${goldRgba(0.35 * lit)}` : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={goldRgba(0.15)}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - p)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...iconStyle,
        }}
      >
        <Icon
          size={size * iconScale}
          color={iconColor}
          strokeWidth={ICON_STROKE}
          fill="none"
        />
      </div>
      {children}
    </div>
  );
};
