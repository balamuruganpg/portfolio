"use client";

/** Tiny event bus so the hero, palette, cards and assistant can talk without a state library. */
export const EV = {
  ask: "bpg:ask", // detail: string question
  openAssistant: "bpg:open-assistant",
  openPalette: "bpg:open-palette",
  focusProject: "bpg:focus-project", // detail: slug
} as const;

export function emit(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function Ext({
  href,
  children,
  className = "link",
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}

export function AskButton({ q, className, children }: { q?: string; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => (q ? emit(EV.ask, q) : emit(EV.openAssistant))}>
      {children}
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`inline-block h-3.5 w-3.5 transition-transform duration-300 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5 ${className}`} aria-hidden>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
