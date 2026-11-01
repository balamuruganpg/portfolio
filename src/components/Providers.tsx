"use client";

import { MotionConfig } from "framer-motion";
import { ScrollProgress } from "./motion";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const pause = () => {
      if (document.documentElement.dataset.scrolling !== "true") document.documentElement.dataset.scrolling = "true";
      clearTimeout(timer);
      timer = setTimeout(() => { delete document.documentElement.dataset.scrolling; }, 180);
    };
    // Capture nested scrolls too, including the assistant's conversation log.
    document.addEventListener("scroll", pause, { passive: true, capture: true });
    return () => { clearTimeout(timer); document.removeEventListener("scroll", pause, true); delete document.documentElement.dataset.scrolling; };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[70]" />
      {children}
    </MotionConfig>
  );
}
