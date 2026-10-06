"use client";

import { useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(stored);
    applyTheme(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = (localStorage.getItem("theme") as Theme) || "system";
      if (current === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  };

  const cycleTheme = () => {
    const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full border border-line bg-surface/60" />
    );
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
      title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
      className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-muted transition hover:border-accent hover:text-ink hover:shadow-[0_0_12px_rgba(61,220,132,0.25)]"
    >
      {theme === "system" && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 transition group-hover:scale-110 text-accent"
        >
          <rect x="2" y="3" width="16" height="11" rx="2" />
          <path d="M7 17h6M10 14v3" strokeLinecap="round" />
        </svg>
      )}
      {theme === "light" && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 transition group-hover:scale-110 text-amber-500"
        >
          <circle cx="10" cy="10" r="4" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.34 4.34l1.42 1.42M14.24 14.24l1.42 1.42M4.34 15.66l1.42-1.42M14.24 5.76l1.42-1.42" strokeLinecap="round" />
        </svg>
      )}
      {theme === "dark" && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="h-4 w-4 transition group-hover:scale-110 text-accent"
        >
          <path
            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
