"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FILTERS, projects, type Category } from "@/data/site";
import { onSpot } from "./motion";
import { Arrow, EV, Ext, emit } from "./ui";

type Filter = "All" | Category;

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: projects.length };
    for (const f of FILTERS) if (f !== "All") c[f] = projects.filter((p) => p.categories.includes(f)).length;
    return c;
  }, []);

  const shown = filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter));

  // Jump-to-project from the command palette or a citation: reset filter, scroll, flash.
  useEffect(() => {
    const onFocus = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      setFilter("All");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = document.getElementById(`p-${slug}`);
          if (!el) return;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.remove("flash");
          void el.offsetWidth;
          el.classList.add("flash");
        }),
      );
    };
    window.addEventListener(EV.focusProject, onFocus);
    return () => window.removeEventListener(EV.focusProject, onFocus);
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="Filter projects" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              data-filter={f}
              onClick={() => setFilter(f)}
              className={`relative rounded-full px-3.5 py-1.5 font-mono text-xs transition duration-300 ${
                active ? "text-bg font-semibold" : "border border-line text-muted hover:border-faint hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[0_0_16px_rgba(61,220,132,0.5)]"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {f} <span className={active ? "text-bg/75" : "text-faint"}>{counts[f]}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="label flex items-center gap-2" aria-live="polite" data-testid="project-count">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Showing {shown.length} of {projects.length} repositories
        </p>
        <span className="hidden font-mono text-xs text-faint sm:inline">
          hover for spotlight · click ask to query
        </span>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <motion.li
            key={p.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            id={`p-${p.slug}`}
            data-project={p.slug}
            onMouseMove={onSpot}
            className="spot group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-accent/40"
          >
            <div>
              <div className="mb-2.5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-accent transition-colors duration-200">
                    {p.name}
                  </h3>
                  {p.authors && (
                    <p className="mt-0.5 font-mono text-[10.5px] text-accent/90">
                      {p.authors}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {p.status === "Ongoing" && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Ongoing
                    </span>
                  )}
                  {p.featured && (
                    <span className="rounded-full border border-line bg-raised px-2 py-0.5 font-mono text-[10px] text-muted">
                      featured
                    </span>
                  )}
                  {(p.live || p.pypi) && (
                    <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      {p.live ? "live" : "pypi"}
                    </span>
                  )}
                </div>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-muted line-clamp-3">
                {p.summary}
              </p>

              <div className="mb-5 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="rounded border border-line/60 bg-raised/80 px-2 py-0.5 font-mono text-[10.5px] text-muted transition hover:border-accent/30 hover:text-ink"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line/60 pt-3 text-xs">
              <Ext href={p.repo} data-kind="repo" className="group/arrow link text-muted hover:text-accent">
                GitHub <Arrow className="h-3 w-3" />
              </Ext>
              {p.live && (
                <Ext href={p.live} data-kind="live" className="group/arrow link text-accent font-medium">
                  Live app <Arrow className="h-3 w-3" />
                </Ext>
              )}
              {p.pypi && (
                <Ext href={p.pypi} data-kind="pypi" className="group/arrow link text-accent font-medium">
                  PyPI <Arrow className="h-3 w-3" />
                </Ext>
              )}
              <button
                type="button"
                onClick={() => emit(EV.ask, `What is ${p.name}?`)}
                className="ml-auto rounded px-2 py-1 font-mono text-[11px] text-faint transition hover:bg-accent/10 hover:text-accent"
              >
                ask ai →
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
