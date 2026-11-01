"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/site";
import ThemeToggle from "./ThemeToggle";
import { EV, emit } from "./ui";
import AssistantMark from "./AssistantMark";

const LINKS = [["About", "about"], ["Work", "featured"], ["Projects", "projects"], ["Experience", "experience"], ["Skills", "skills"], ["Contact", "contact"]] as const;
const MENU = [...LINKS, ["Achievements", "achievements"], ["Certifications", "certs"], ["Architecture", "how"]];

export default function Nav() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const sections = MENU.map(([, id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
      sections.sort((a, b) => a.offsetTop - b.offsetTop);
      const current = sections.filter(e => e.getBoundingClientRect().top <= 180).at(-1);
      setActive(current?.id ?? "");
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) setMenuOpen(false); };
    window.addEventListener("keydown", key); window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("pointerdown", outside); };
  }, [menuOpen]);

  return <header ref={header} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
    <motion.div initial={false} animate={{ maxWidth: scrolled ? 1112 : 1152 }} transition={{ type: "spring", stiffness: 180, damping: 28 }} className={`nav-shell relative mx-auto w-full overflow-hidden rounded-2xl border bg-surface/95 backdrop-blur-xl transition-colors duration-300 ${scrolled ? "border-accent/20 shadow-xl" : "border-line"}`}>
      <nav aria-label="Main navigation" className="flex min-h-16 items-center justify-between gap-3 px-3 md:px-4">
        <a href="#top" aria-label="Back to top" className="group flex shrink-0 items-center gap-2.5 py-2">
          <motion.span whileHover={reduce ? undefined : { rotate: -8, scale: 1.06 }} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-[#070807]"><Image src="/logo.png" alt="Balamurugan P G" width={36} height={36} className="h-9 w-9 object-contain" priority /></motion.span>
          <span className="hidden md:block"><span className="block text-sm font-semibold tracking-tight text-ink">{profile.name}</span><span className="mt-0.5 block font-mono text-[10px] text-muted">AI/ML ENGINEER</span></span>
        </a>
        <ul className="hidden items-center gap-0.5 xl:flex" onMouseLeave={() => setHovered(null)}>
          {LINKS.map(([label,id])=><li key={id}><a href={`#${id}`} aria-current={active===id?"location":undefined} onMouseEnter={()=>setHovered(id)} className={`relative isolate block rounded-lg px-3 py-2.5 text-xs transition-colors ${active===id?"text-ink":"text-muted hover:text-ink"}`}>
            {hovered===id && <motion.span layoutId="nav-hover" className="absolute inset-0 -z-10 rounded-lg bg-raised" transition={{type:"spring",stiffness:400,damping:30}} />}
            {label}
            {active===id && <motion.span layoutId="nav-active" className="absolute right-3 bottom-1 left-3 h-px bg-accent" transition={{type:"spring",stiffness:300,damping:30}} />}
          </a></li>)}
        </ul>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          <button type="button" onClick={()=>emit(EV.openPalette)} aria-label="Open command palette" title="Search · Ctrl K / ⌘K" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition hover:border-accent/40 hover:text-ink"><svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
          <button type="button" onClick={()=>emit(EV.openAssistant)} className="hidden items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs text-ink transition hover:border-accent/40 lg:flex"><AssistantMark className="h-4 w-4 text-accent" />Ask AI <span className="text-accent">↗</span></button>
          <motion.a whileHover={reduce?undefined:{y:-2}} whileTap={{scale:0.97}} href={profile.resume} download="BalamuruganPG_Resume.pdf" className="sheen hidden rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-bg sm:block">Resume ↓</motion.a>
          <button ref={menuButton} type="button" aria-label={menuOpen?"Close menu":"Menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={()=>setMenuOpen(v=>!v)} className="flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-xs text-ink xl:hidden"><span>{menuOpen?"Close":"Menu"}</span><span aria-hidden="true" className="relative block h-3 w-3"><motion.span animate={{rotate:menuOpen?45:0,y:menuOpen?3:0}} className="absolute top-0.5 left-0 h-px w-3 bg-current"/><motion.span animate={{rotate:menuOpen?-45:0,y:menuOpen?-3:0}} className="absolute bottom-0.5 left-0 h-px w-3 bg-current"/></span></button>
        </div>
      </nav>
      <div inert={scrolled} aria-hidden={scrolled} className={`hidden overflow-hidden border-t border-line px-5 transition-[max-height,opacity] duration-300 md:flex md:items-center md:justify-between ${scrolled?"max-h-0 opacity-0":"max-h-9 opacity-100"}`}>
        <p className="py-2 font-mono text-[9px] tracking-wider text-muted">COIMBATORE, INDIA <span className="mx-2 text-accent">/</span> OPEN TO AI/ML OPPORTUNITIES</p><a href="#achievements" className="font-mono text-[9px] text-muted transition hover:text-ink">FIRST RANK IN CSE, NIT <span className="text-accent">↗</span></a>
      </div>
      <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent" style={{scaleX:reduce?scrollYProgress:progress}} />
    </motion.div>
    <AnimatePresence>{menuOpen && <motion.div id="mobile-navigation" initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:reduce?0:0.25}} className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-line bg-surface shadow-xl xl:hidden">
      <div className="p-4"><p className="label mb-3 text-accent">Explore the portfolio</p><div className="grid grid-cols-2 gap-1">{MENU.map(([label,id],i)=><motion.a initial={false} whileHover={reduce?undefined:{x:3}} key={id} href={`#${id}`} aria-current={active===id?"location":undefined} onClick={()=>{setMenuOpen(false);document.getElementById(id)?.focus({preventScroll:true});}} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active===id?"bg-raised text-ink":"text-muted hover:bg-raised hover:text-ink"}`}><span className="font-mono text-[10px] text-accent">0{i+1}</span>{label}</motion.a>)}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><span className="font-mono text-[10px] text-muted">330+ LeetCode DSA problems</span><button type="button" onClick={()=>{setMenuOpen(false);emit(EV.openAssistant);}} className="rounded-lg border border-accent/30 px-3 py-2 text-xs text-ink">Ask the portfolio assistant ↗</button></div></div>
    </motion.div>}</AnimatePresence>
  </header>;
}
