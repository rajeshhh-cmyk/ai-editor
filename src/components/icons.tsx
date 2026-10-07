import React from "react";

// Simple line icons (stroke-only) so they read at small sizes on footage.
const P: Record<string, React.ReactNode> = {
  school: (
    <>
      <path d="M8 58 V30 L32 16 L56 30 V58 Z" />
      <path d="M26 58 V44 H38 V58" />
      <path d="M32 16 V4 L44 8 L32 12" />
      <circle cx="32" cy="31" r="5" />
    </>
  ),
  hospital: (
    <>
      <rect x="8" y="8" width="48" height="48" rx="10" />
      <path d="M32 18 V46 M18 32 H46" strokeWidth="7" />
    </>
  ),
  office: (
    <>
      <path d="M14 58 V8 H40 V58" />
      <path d="M40 24 H52 V58" />
      <path d="M22 18 H32 M22 28 H32 M22 38 H32 M22 48 H32 M46 34 V36 M46 44 V46" />
      <path d="M6 58 H58" />
    </>
  ),
  mall: (
    <>
      <path d="M12 22 H52 L48 58 H16 Z" />
      <path d="M22 26 V18 A10 10 0 0 1 42 18 V26" />
    </>
  ),
  bank: (
    <>
      <path d="M6 24 L32 8 L58 24 Z" />
      <path d="M12 30 V50 M24 30 V50 M40 30 V50 M52 30 V50" />
      <path d="M6 56 H58" />
    </>
  ),
  police: (
    <>
      <path d="M32 6 L54 14 V32 C54 46 44 54 32 58 C20 54 10 46 10 32 V14 Z" />
      <path d="M32 20 L35.5 28 L44 28.5 L37.5 34 L39.5 42 L32 37.5 L24.5 42 L26.5 34 L20 28.5 L28.5 28 Z" />
    </>
  ),
  fire: (
    <>
      <path d="M32 58 C18 58 12 48 12 40 C12 28 22 22 24 10 C30 16 32 22 32 28 C36 24 38 20 38 16 C46 24 52 32 52 40 C52 50 44 58 32 58 Z" />
      <path d="M32 58 C26 58 24 52 24 48 C24 42 30 40 32 34 C36 40 40 44 40 48 C40 54 36 58 32 58 Z" />
    </>
  ),
  road: (
    <>
      <path d="M22 6 L8 58 M42 6 L56 58" />
      <path d="M32 10 V18 M32 28 V36 M32 46 V54" />
    </>
  ),
  laptop: (
    <>
      <rect x="12" y="12" width="40" height="28" rx="3" />
      <path d="M4 50 H60 L56 44 H8 Z" />
    </>
  ),
  check: <path d="M14 34 L27 46 L50 20" strokeWidth="8" />,
};

export type IconKind = keyof typeof P;

export const Icon: React.FC<{ kind: string; size?: number; color?: string; strokeWidth?: number }> = ({
  kind,
  size = 64,
  color = "#F5B82E",
  strokeWidth = 4.5,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {P[kind] ?? null}
  </svg>
);
