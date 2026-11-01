"use client";

import { useEffect, useRef, useState } from "react";
import { ParticleField } from "./motion";

/** Decoration only: no layout, pointer capture or per-frame React updates. */
export default function BackgroundMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (document.documentElement.dataset.scrolling === "true") return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
        root.dataset.hover = "true";
      });
    };
    const leave = () => { root.dataset.hover = "false"; };
    const configure = () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame); leave();
      if (!reduced.matches && fine.matches && !document.hidden) {
        window.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerleave", leave);
      }
      root.dataset.paused = String(reduced.matches || document.hidden);
    };
    configure();
    reduced.addEventListener("change", configure); fine.addEventListener("change", configure); document.addEventListener("visibilitychange", configure);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); reduced.removeEventListener("change", configure); fine.removeEventListener("change", configure); document.removeEventListener("visibilitychange", configure); };
  }, []);
  return <div ref={ref} aria-hidden="true" id="ambient-background" className="ambient-background pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="ambient-mesh absolute inset-0" />
    <div className="ambient-orb ambient-orb-one" />
    <div className="ambient-orb ambient-orb-two" />
    <div className="ambient-pointer absolute top-0 left-0" />
  </div>;
}

export function HeroParticles() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 768px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(desktop.matches && !reduced.matches && !document.hidden);
    sync(); desktop.addEventListener("change", sync); reduced.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    return () => { desktop.removeEventListener("change", sync); reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return enabled ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40"><ParticleField className="absolute inset-0" /></div> : null;
}
