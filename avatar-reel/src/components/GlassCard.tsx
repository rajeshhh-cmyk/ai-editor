import React from "react";
import { GLASS } from "../theme";

export const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ ...GLASS, boxShadow: "0 20px 60px rgba(0,0,0,0.45)", ...style }}>{children}</div>
);
