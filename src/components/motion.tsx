"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ Reveal */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: Math.min(y, 16) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, delay: Math.min(delay, 0.2), ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- SplitText */
/** Word-by-word mask reveal. Real text stays in the DOM (readable by screen readers / search). */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  onView = false,
  highlight = [],
  highlightClass = "text-accent",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  onView?: boolean;
  highlight?: string[];
  highlightClass?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span className={className}>{text}</span>;
  }
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span className="inline-block overflow-hidden pb-[0.14em] align-bottom [margin-bottom:-0.14em]">
            <motion.span
              className={`inline-block will-change-transform ${highlight.includes(w) ? highlightClass : ""}`}
              initial={{ y: "115%", rotate: 2, opacity: 0 }}
              {...(onView
                ? { whileInView: { y: 0, rotate: 0, opacity: 1 }, viewport: { once: true, margin: "-40px" } }
                : { animate: { y: 0, rotate: 0, opacity: 1 } })}
              transition={{ duration: 0.7, delay: delay + i * stagger, ease: EASE }}
            >
              {w}
            </motion.span>
          </span>
        </React.Fragment>
      ))}
    </span>
  );
}

/* ----------------------------------------------------------------- CountUp */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setV(to);
      return;
    }
    const c = animate(0, to, { duration, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------- Magnetic */
export function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 14, mass: 0.4 });
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------- Tilt */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const rx = useSpring(0, { stiffness: 140, damping: 16 });
  const ry = useSpring(0, { stiffness: 140, damping: 16 });
  return (
    <div
      className={className}
      style={{ perspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------- Spot */
/** Put className="spot" on the element and onMouseMove={onSpot}: a green light follows the cursor along its border. */
export function onSpot(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/* ----------------------------------------------------------------- Marquee */
export function Marquee({
  items,
  reverse = false,
  duration = 60,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const row = [...items, ...items];
  return (
    <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div
        className={`marquee-track ${reverse ? "reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {row.map((t, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-6 pr-6 font-mono text-sm whitespace-nowrap text-muted"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-accent/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- ScrollProgress */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
            ref.current.style.transform = `scaleX(${p})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed top-0 right-0 left-0 z-[80] h-[2px] origin-left bg-accent shadow-[0_0_12px_rgba(61,220,132,0.8)] will-change-transform"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

/* -------------------------------------------------------------- CursorGlow */
export function CursorGlow() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 90, damping: 20 });
  const sy = useSpring(y, { stiffness: 90, damping: 20 });
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX - 320);
      y.set(e.clientY - 320);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 h-[640px] w-[640px] rounded-full"
      style={{ x: sx, y: sy, background: "radial-gradient(circle, rgba(61,220,132,0.075), transparent 62%)" }}
    />
  );
}

/* ----------------------------------------------------------- ParticleField */
/** A tiny neural-net-style constellation that reacts to the cursor. Pauses off-screen and for reduced motion. */
export function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // On screens under 768px or reduced motion, do not run the canvas at all.
    if (typeof window === "undefined" || window.innerWidth < 768) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let isScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    const resize = () => {
      if (window.innerWidth < 768) {
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(75, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150 && d2 > 1) {
          const f = (1 - Math.sqrt(d2) / 150) * 0.6;
          p.x += (dx / Math.sqrt(d2)) * f;
          p.y += (dy / Math.sqrt(d2)) * f;
        }
      }
      const isLight =
        document.documentElement.classList.contains("light") ||
        (!document.documentElement.classList.contains("dark") &&
          window.matchMedia("(prefers-color-scheme: light)").matches);

      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 125) {
            ctx.strokeStyle = isLight
              ? `rgba(5,150,105,${(1 - d / 125) * 0.22})`
              : `rgba(61,220,132,${(1 - d / 125) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 190) {
          ctx.strokeStyle = isLight
            ? `rgba(5,150,105,${(1 - md / 190) * 0.6})`
            : `rgba(61,220,132,${(1 - md / 190) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
        ctx.fillStyle =
          md < 190
            ? isLight
              ? "rgba(5,150,105,0.95)"
              : "rgba(61,220,132,0.95)"
            : isLight
              ? "rgba(15,23,16,0.25)"
              : "rgba(232,235,231,0.35)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (visible && !isScrolling && window.innerWidth >= 768) {
        draw();
        raf = requestAnimationFrame(loop);
      }
    };

    const onScroll = () => {
      isScrolling = true;
      document.documentElement.dataset.scrolling = "true";
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        delete document.documentElement.dataset.scrolling;
        if (visible && window.innerWidth >= 768) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      }, 150);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !isScrolling && window.innerWidth >= 768) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      if (scrollTimer) clearTimeout(scrollTimer);
      delete document.documentElement.dataset.scrolling;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`hidden md:block h-full w-full ${className}`} />;
}
