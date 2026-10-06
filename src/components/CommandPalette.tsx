"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { profile, projects } from "@/data/site";
import { EV, emit } from "./ui";

interface Item {
  id: string;
  group: "Ask" | "Projects" | "Sections" | "Links";
  label: string;
  hint?: string;
  run: () => void;
}

const SECTIONS = [
  ["Featured work", "featured"],
  ["All projects", "projects"],
  ["Experience & education", "experience"],
  ["Skills", "skills"],
  ["Certifications", "certs"],
  ["How the assistant works", "how"],
  ["Contact", "contact"],
] as const;

const openExt = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(EV.openPalette, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EV.openPalette, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const all: Item[] = useMemo(
    () => [
      ...projects.map<Item>((p) => ({
        id: `p-${p.slug}`,
        group: "Projects",
        label: p.name,
        hint: p.live ? "live" : p.pypi ? "pypi" : p.categories[0],
        run: () => emit(EV.focusProject, p.slug),
      })),
      ...SECTIONS.map<Item>(([label, id]) => ({
        id: `s-${id}`,
        group: "Sections",
        label,
        run: () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      })),
      {
        id: "l-resume",
        group: "Links",
        label: "Download resume (PDF)",
        run: () => {
          const a = document.createElement("a");
          a.href = profile.resume;
          a.download = "BalamuruganPG_Resume.pdf";
          a.click();
        },
      },
      { id: "l-github", group: "Links", label: "GitHub profile", run: () => openExt(profile.github) },
      { id: "l-linkedin", group: "Links", label: "LinkedIn profile", run: () => openExt(profile.linkedin) },
      { id: "l-email", group: "Links", label: `Email ${profile.email}`, run: () => (window.location.href = `mailto:${profile.email}`) },
    ],
    [],
  );

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = s ? all.filter((i) => `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(s)) : all;
    const askItem: Item = {
      id: "ask",
      group: "Ask",
      label: s ? `Ask AI: “${q.trim()}”` : "Ask the portfolio assistant…",
      run: () => (s ? emit(EV.ask, q.trim()) : emit(EV.openAssistant)),
    };
    return s && filtered.length > 0 ? [...filtered, askItem] : [askItem, ...filtered];
  }, [q, all]);

  useEffect(() => setActive(0), [q]);

  const choose = (i: Item) => {
    setOpen(false);
    setTimeout(i.run, 10);
  };

  let lastGroup = "";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/75 px-4 pt-[12vh] backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Command palette"
            data-testid="palette"
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(61,220,132,0.15)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3.5 3.5" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, items.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && items[active]) {
                    e.preventDefault();
                    choose(items[active]);
                  }
                }}
                placeholder="Jump to a project, or type a question…"
                aria-label="Command palette search"
                className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {items.map((it, idx) => {
                const header = it.group !== lastGroup ? it.group : null;
                lastGroup = it.group;
                const isSelected = idx === active;
                return (
                  <li key={it.id}>
                    {header && header !== "Ask" && (
                      <p className="label px-3 pt-3 pb-1.5 !text-[10px] text-faint">{header}</p>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => choose(it)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        isSelected
                          ? "bg-accent/15 text-ink shadow-[inset_0_0_0_1px_rgba(61,220,132,0.3)]"
                          : "text-muted hover:text-ink"
                      } ${it.group === "Ask" ? "text-accent font-medium" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        {it.group === "Ask" && <span className="text-accent">✦</span>}
                        {it.label}
                      </span>
                      {it.hint && (
                        <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-faint">
                          {it.hint}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-line/80 px-4 py-2.5 font-mono text-[11px] text-faint bg-raised/30">
              <span>↑↓ navigate</span>
              <span>Enter select</span>
              <span>Esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
