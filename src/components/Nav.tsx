"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { profile } from "@/data/site";
import ThemeToggle from "./ThemeToggle";
import { EV, emit } from "./ui";

const LINKS = [
  ["Work", "featured"],
  ["Projects", "projects"],
  ["Experience", "experience"],
  ["Skills", "skills"],
  ["Contact", "contact"],
] as const;

export default function Nav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = [...LINKS.map(([, id]) => id), "certs", "how"];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 right-0 left-0 z-50 flex justify-center px-4 pt-3.5"
    >
      <nav
        className="flex w-full max-w-5xl items-center justify-between rounded-full border border-line/80 bg-surface/85 px-3 py-2 backdrop-blur-md shadow-xl shadow-black/30"
      >
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Back to top">
          <motion.span
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
            transition={{ duration: 0.5 }}
            className="grid h-9 w-9 place-items-center rounded-full border border-accent/70 bg-accent/10 font-mono text-[11px] font-bold tracking-tight text-accent shadow-[0_0_20px_rgba(61,220,132,0.25)]"
          >
            {profile.initials}
          </motion.span>
          <span className="hidden text-sm text-muted transition group-hover:text-ink sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map(([label, id]) => (
            <li key={id}>
              <a href={`#${id}`} className="relative block rounded-full px-3.5 py-1.5 text-sm text-muted transition hover:text-ink">
                {active === id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-raised"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={active === id ? "text-ink" : ""}>{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => emit(EV.openPalette)}
            aria-label="Open command palette"
            className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 font-mono text-xs text-muted transition hover:border-accent/60 hover:text-ink"
          >
            Search
            <kbd className="rounded border border-line px-1 text-[10px]">Ctrl K</kbd>
          </button>
          <a
            href={profile.resume}
            download="BalamuruganPG_Resume.pdf"
            className="hidden rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-bg transition hover:brightness-110 sm:block"
          >
            Resume
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
