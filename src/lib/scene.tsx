import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import type { AdData, CueName } from "../data/hornbill";

type SceneCtx = { data: AdData; startSec: number; endSec: number };

const Ctx = createContext<SceneCtx | null>(null);

export const SceneProvider: React.FC<SceneCtx & { children: React.ReactNode }> = ({ children, ...value }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

/**
 * Timing helpers for a scene: `at("bank")` converts an absolute VO cue into a
 * frame number local to the current scene's <Sequence>.
 */
export const useScene = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useScene() must be used inside <SceneProvider>");
  const { fps } = useVideoConfig();
  const { data, startSec, endSec } = ctx;
  const at = (cue: CueName, offsetSec = 0) => Math.round((data.cues[cue] + offsetSec - startSec) * fps);
  const sec = (s: number) => Math.round(s * fps);
  const duration = Math.round((endSec - startSec) * fps);
  return { data, at, sec, duration, fps, copy: data.copy, property: data.property };
};
