"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { profile, projects } from "@/data/site";
import { AskButton, Ext } from "./ui";
import { CountUp, EASE, Magnetic, ParticleField, SplitText, Tilt } from "./motion";

const CHECKS = ["exact match", "13-gram overlap", "fuzzy match", "semantic similarity"];
const CMD = "pip install verascan";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Loops through VeraScan's four detection modes. Illustrative only: it shows modes, never results. */
function VeraTerminal() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? CMD.length : 0);
  const [stage, setStage] = useState(reduce ? 2 : 0); // 0 typing, 1 installed, 2 checks
  const [done, setDone] = useState(reduce ? 4 : 0);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    (async () => {
      await sleep(900);
      while (!cancelled) {
        setTyped(0);
        setStage(0);
        setDone(0);
        for (let i = 1; i <= CMD.length; i++) {
          if (cancelled) return;
          setTyped(i);
          await sleep(55);
        }
        await sleep(350);
        if (cancelled) return;
        setStage(1);
        await sleep(650);
        if (cancelled) return;
        setStage(2);
        for (let i = 1; i <= CHECKS.length; i++) {
          await sleep(1000);
          if (cancelled) return;
          setDone(i);
        }
        await sleep(3200);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0a0c0a]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(61,220,132,0.25)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2a302a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2a302a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
        <span className="ml-3 font-mono text-[11px] text-faint">verascan · train/eval contamination</span>
      </div>
      <div className="min-h-[250px] p-5 font-mono text-[13px] leading-relaxed">
        <p>
          <span className="text-accent">$</span> {CMD.slice(0, typed)}
          {stage === 0 && <span className="caret" />}
        </p>
        {stage >= 1 && (
          <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="mt-1 text-muted">
            <span className="text-accent">✓</span> installed from PyPI
          </motion.p>
        )}
        {stage >= 2 && (
          <div className="mt-4 space-y-3">
            <p className="label !text-[10px]">4 detection modes</p>
            {CHECKS.map((c, i) => {
              const complete = i < done;
              const scanning = i === done;
              return (
                <div key={c}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={complete || scanning ? "text-ink" : "text-faint"}>{c}</span>
                    <span className={complete ? "text-accent" : "text-faint"}>
                      {complete ? "✓ ready" : scanning ? "scanning…" : "queued"}
                    </span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent shadow-[0_0_10px_rgba(61,220,132,0.9)]"
                      style={{
                        width: complete || scanning ? "100%" : "0%",
                        transition: scanning ? "width 1s linear" : complete ? "none" : "width 0.2s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FloatChip({
  children,
  className,
  delay = 0,
  dur = 5,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
  dur?: number;
}) {
  return (
    <div
      className={`float-pill absolute z-10 hidden rounded-xl border border-line bg-surface/90 px-3 py-2 font-mono text-[11px] shadow-lg shadow-black/40 lg:block ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}
    >
      {children}
    </div>
  );
}

const featuredNum = (slug: string) => parseInt(projects.find((p) => p.slug === slug)?.caseStudy?.result ?? "0", 10);
const liveCount = projects.filter((p) => p.live).length;

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (contentRef.current) {
            const sy = window.scrollY;
            if (sy <= 700) {
              const yVal = Math.min(sy * 0.16, 60);
              const opacityVal = Math.max(1 - sy / 550, 0);
              contentRef.current.style.transform = `translate3d(0, ${yVal}px, 0)`;
              contentRef.current.style.opacity = `${opacityVal}`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stats: { n: number; suffix?: string; label: string }[] = [
    { n: projects.length, label: "public repos" },
    { n: liveCount, label: "live apps" },
    { n: featuredNum("bull-bear-autopilot"), label: "tests · Bull/Bear Autopilot" },
    { n: featuredNum("ai-leetcode-agent"), suffix: "+", label: "accepted · LeetCode Agent" },
  ];

  return (
    <>
      <section id="top" className="relative flex min-h-[92svh] items-center overflow-hidden pt-24 pb-14">
        {/* background layers */}
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_20%,transparent_80%)]"
          aria-hidden
        >
          <ParticleField />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full [background:radial-gradient(circle,rgba(61,220,132,0.11)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-12rem] bottom-[-8rem] h-[520px] w-[520px] rounded-full [background:radial-gradient(circle,rgba(61,220,132,0.07)_0%,transparent_70%)]"
        />

        <div ref={contentRef} className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-12 will-change-transform">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pr-4 pl-2 text-xs text-muted backdrop-blur"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              {profile.availability}
            </motion.p>

            <h1 className="text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-balance">
              <SplitText text={profile.hero} delay={0.45} stagger={0.04} highlight={["receipts:"]} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8, ease: EASE }}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted"
            >
              <span className="text-ink">{profile.name}</span>
              <span className="text-faint">/</span>
              <span>{profile.role}</span>
              <span className="text-faint">/</span>
              <span>{profile.location}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8, ease: EASE }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <a
                  href={profile.resume}
                  download="BalamuruganPG_Resume.pdf"
                  data-testid="resume-download"
                  className="sheen group/arrow inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-bg shadow-[0_0_24px_rgba(61,220,132,0.35)] transition hover:shadow-[0_0_36px_rgba(61,220,132,0.6)]"
                >
                  Download resume
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover/arrow:translate-y-0.5" fill="none" aria-hidden>
                    <path d="M8 2.5v8m0 0L4.5 7M8 10.5L11.5 7M3 13.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Magnetic>
              <Magnetic>
                <AskButton className="rounded-full border border-accent/60 bg-accent/5 px-5 py-2.5 text-xs text-ink transition hover:bg-accent/15 hover:shadow-[0_0_24px_rgba(61,220,132,0.2)]">
                  Ask the assistant
                </AskButton>
              </Magnetic>
              <Ext href={profile.github} className="group/arrow rounded-full border border-line px-4 py-2.5 text-xs text-muted transition hover:border-faint hover:text-ink">
                GitHub <span className="ml-0.5">↗</span>
              </Ext>
              <Ext href={profile.linkedin} className="group/arrow rounded-full border border-line px-4 py-2.5 text-xs text-muted transition hover:border-faint hover:text-ink">
                LinkedIn <span className="ml-0.5">↗</span>
              </Ext>
              <a href={`mailto:${profile.email}`} className="rounded-full border border-line px-4 py-2.5 text-xs text-muted transition hover:border-faint hover:text-ink">
                Email
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.9, duration: 1.1, ease: EASE }}
            className="relative lg:col-span-5"
          >
            <Tilt>
              <VeraTerminal />
            </Tilt>
            <FloatChip className="-top-4 -left-6" delay={0} dur={5.2}>
              <span className="text-accent">●</span> LungScan AI · 86–88% test acc
            </FloatChip>
            <FloatChip className="top-1/2 -right-4" delay={0.3} dur={6.1}>
              <span className="text-accent">●</span> PneumoScan · 92.5% test acc
            </FloatChip>
            <FloatChip className="-bottom-5 left-4" delay={0.6} dur={5.6}>
              <span className="text-accent">●</span> Bull/Bear · {featuredNum("bull-bear-autopilot")} tests
            </FloatChip>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-5 mb-14">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: EASE }}
              className="bg-bg px-6 py-6 transition hover:bg-surface"
            >
              <dt className="font-mono text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                <CountUp to={s.n} suffix={s.suffix} />
              </dt>
              <dd className="mt-1 text-xs text-muted">{s.label}</dd>
            </motion.div>
          ))}
        </dl>
      </section>
    </>
  );
}
