"use client";

import { MotionConfig } from "framer-motion";
import { CursorGlow, ScrollProgress } from "./motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <CursorGlow />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[70]" />
      {children}
    </MotionConfig>
  );
}
