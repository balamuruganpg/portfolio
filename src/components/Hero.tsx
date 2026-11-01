"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { certifications, profile, projects } from "@/data/site";
import { AskButton, Ext } from "./ui";
import { HeroParticles } from "./BackgroundMotion";
import { onSpot } from "./motion";

const proof = [
  { value: "First Rank in CSE, NIT", detail: "2025–2026", href: "#experience" },
  { value: "VeraScan", detail: "Published on PyPI", href: "#case-verascan" },
  { value: "568 tests", detail: "Bull/Bear Autopilot", href: "#case-bull-bear-autopilot" },
  { value: `${certifications.length} certifications`, detail: "Verified credentials", href: "#certs" },
];
const examples = ["verascan", "bull-bear-autopilot", "certiroute"].map(slug => projects.find(p => p.slug === slug)!);

export default function Hero() {
  const [selected, setSelected] = useState(0);
  const reduce = useReducedMotion();
  const example = examples[selected];
  return <section id="top" aria-labelledby="hero-title" className="hero-stage relative overflow-hidden border-b border-line pt-32 pb-10 md:pt-44 md:pb-14">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
    <div aria-hidden="true" className="hero-ambient pointer-events-none absolute -top-40 right-0 h-[700px] w-[700px] rounded-full" />
    <HeroParticles />
    <div className="relative mx-auto max-w-6xl px-5">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="hero-enter mb-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-[10px] text-muted"><span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-accent/50"/><span className="relative h-1.5 w-1.5 rounded-full bg-accent"/></span>OPEN TO INTERNSHIPS & JUNIOR ROLES</span>
            <span className="font-mono text-[10px] text-muted">COIMBATORE, INDIA</span>
          </div>
          <p className="hero-enter font-mono text-sm text-accent" style={{animationDelay:"60ms"}}>Hello, I’m</p>
          <h1 id="hero-title" className="hero-enter mt-3 text-[clamp(2.8rem,5.2vw,4.7rem)] leading-[1.04] font-semibold tracking-[-0.055em]" style={{animationDelay:"120ms"}}>{profile.name}</h1>
          <div className="hero-enter mt-5 flex items-center gap-3" style={{animationDelay:"180ms"}}><span aria-hidden="true" className="h-px w-8 bg-accent"/><p className="text-2xl font-medium tracking-tight text-muted md:text-3xl">{profile.role}</p></div>
          <p className="hero-enter mt-7 max-w-xl text-balance text-xl leading-relaxed tracking-tight text-ink md:text-2xl" style={{animationDelay:"240ms"}}>I build AI systems with <span className="hero-highlight">verified results</span> - and I publish the misses too</p>
          <p className="hero-enter mt-5 max-w-xl text-sm leading-relaxed text-muted" style={{animationDelay:"300ms"}}>Based in {profile.location}. {profile.availability}.</p>
          <div className="hero-enter mt-8 flex flex-wrap gap-3" style={{animationDelay:"360ms"}}>
            <motion.a whileHover={reduce?undefined:{y:-3}} whileTap={{scale:0.98}} href={profile.resume} download="BalamuruganPG_Resume.pdf" data-testid="resume-download" className="sheen inline-flex items-center gap-3 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg">Download resume <span aria-hidden="true">↓</span></motion.a>
            <motion.a whileHover={reduce?undefined:{y:-3}} href="#featured" className="group inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium transition hover:border-accent/40">Explore my work <span className="text-accent transition group-hover:translate-x-1" aria-hidden="true">↗</span></motion.a>
          </div>
          <div className="hero-enter mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm" style={{animationDelay:"420ms"}}><Ext href={profile.github}>GitHub ↗</Ext><Ext href={profile.linkedin}>LinkedIn ↗</Ext><Ext href={profile.leetcode}>LeetCode ↗</Ext><a href={`mailto:${profile.email}`} className="link">Email ↗</a></div>
          <a href="#achievements" className="hero-enter mt-7 inline-flex items-center gap-2 font-mono text-xs text-muted transition hover:text-ink" style={{animationDelay:"480ms"}}><span className="text-accent">↳</span> 330+ LeetCode DSA problems <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-enter order-2 lg:order-1 lg:col-span-5" style={{animationDelay:"200ms"}}>
          <motion.div whileHover={reduce?undefined:{y:-4}} onMouseMove={onSpot} className="spot relative overflow-hidden rounded-2xl border border-accent/20 bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><span className="font-mono text-[10px] tracking-widest text-muted">BPG / ENGINEERING NOTEBOOK</span><span className="flex gap-1" aria-hidden="true"><span className="h-1 w-1 rounded-full bg-accent"/><span className="h-1 w-1 rounded-full bg-muted"/><span className="h-1 w-1 rounded-full bg-line"/></span></div>
            <div className="flex items-center gap-6 px-6 py-7">
              <div role="img" aria-label="BPG initials avatar for Balamurugan P G" className="avatar-orbit relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-line bg-accent/5 font-mono text-3xl font-medium tracking-tighter text-accent">BPG<span className="text-ink">.</span><span className="orbit-path absolute -inset-2 rounded-full border border-dashed border-accent/25" aria-hidden="true"><span className="absolute top-0 left-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent"/></span></div>
              <div className="text-sm leading-relaxed text-muted"><p className="font-medium text-ink">Build. Evaluate. Publish.</p><p className="mt-2">ML & Deep Learning<br/>LLMs & Agents<br/>Evaluation & Engineering</p></div>
            </div>
            <div className="px-5 pb-5">
              <p className="label mb-3 !text-[10px]">Explore the evidence</p>
              <div role="group" aria-label="Explore project evidence" className="flex gap-1 rounded-xl border border-line bg-bg p-1">{examples.map((p,i)=><button key={p.slug} type="button" aria-pressed={selected===i} aria-controls="hero-evidence" onClick={()=>setSelected(i)} className={`relative isolate min-w-0 flex-1 rounded-lg px-2 py-2 text-xs transition ${selected===i?"text-ink":"text-muted hover:text-ink"}`}>{selected===i&&<motion.span layoutId="hero-evidence-tab" className="absolute inset-0 -z-10 rounded-lg border border-line bg-raised" transition={{type:"spring",stiffness:300,damping:28}}/>}{i===1?"Bull/Bear":p.name}</button>)}</div>
              <div id="hero-evidence" className="mt-4 min-h-[185px]" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait" initial={false}><motion.div key={example.slug} initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduce?0:-5}} transition={{duration:reduce?0:0.2}}>
                  <div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] text-muted">VERIFIED RESULT / {example.name}</p><span className="text-accent" aria-hidden="true">↗</span></div>
                  <p className="mt-3 break-words font-mono text-2xl font-semibold tracking-tight text-accent">{example.caseStudy!.result}{example.slug==="bull-bear-autopilot"?" tests":""}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{example.caseStudy!.resultLabel}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><a href={`#case-${example.slug}`} className="link text-xs text-ink">Read case study ↗</a><AskButton q={`What is ${example.name}?`} className="rounded-lg px-2 py-1 text-xs text-muted transition hover:text-accent">Ask about it →</AskButton></div>
                </motion.div></AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      <dl className="order-1 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:order-2 lg:col-span-12 md:grid-cols-4">{proof.map((p,i)=><motion.div key={p.value} whileHover={reduce?undefined:{y:-3}} className="group bg-surface p-4 md:p-5"><dt><a href={p.href} className="text-base font-semibold tracking-tight transition hover:text-accent md:text-lg">{p.value} <span className="inline-block text-accent transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">↗</span></a></dt><dd className="mt-2 font-mono text-xs leading-relaxed text-muted">{p.detail}</dd></motion.div>)}</dl>
      </div>
    </div>
  </section>;
}
