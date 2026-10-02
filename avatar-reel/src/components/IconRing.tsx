import type { LucideIcon } from "lucide-react";
import React from "react";
import { COLORS, ICON_STROKE, goldRgba } from "../theme";

/** Gold circle whose ring draws itself (stroke-dashoffset), with a lucide icon inside. */
export const IconRing: React.FC<{
  icon: LucideIcon;
  size?: number;
  progress?: number;
  lit?: number;
  iconColor?: string;
  iconScale?: number;
  iconStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ icon: Icon, size = 120, progress = 1, lit = 0, iconColor = COLORS.gold, iconScale = 0.46, iconStyle, children }) => {
  const stroke = Math.max(2, size / 50);
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: `rgba(10,10,10,0.72)`,
        boxShadow: lit > 0 ? `0 0 ${40 + lit * 30}px ${goldRgba(0.35 * lit)}` : undefined,
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={goldRgba(0.18)} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.gold}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...iconStyle }}>
        <Icon size={size * iconScale} color={iconColor} strokeWidth={ICON_STROKE} fill="none" />
      </div>
      {children}
    </div>
  );
};
