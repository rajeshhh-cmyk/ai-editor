import React from "react";

/** Lower graphics zone used in "top" mode (below the card and captions, above Instagram's UI). */
export const ZONE = { top: 1385, height: 270, left: 70, width: 940 } as const;

export const Zone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      top: ZONE.top,
      left: ZONE.left,
      width: ZONE.width,
      height: ZONE.height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);
