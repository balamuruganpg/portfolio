"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { STARTER_QUESTIONS } from "@/data/site";
import { EV, emit } from "./ui";

interface Citation {
  label: string;
  href: string;
  section: string;
}
interface Msg {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  mode?: "llm" | "offline" | "guarded" | "refused" | "error";
  note?: string;
}

const MODE_LABEL: Record<string, string> = {
  llm: "⚡ retrieved → cited → generated",
  offline: "model offline · retrieval only",
  guarded: "guard tripped · retrieval only",
  refused: "out of scope",
};

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [hasKey, setHasKey] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keySaving, setKeySaving] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_gemini_key") || "";
    if (saved) {
      setKeyInput(saved);
      setHasKey(true);
    }
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        if (d.hasKey) setHasKey(true);
      })
      .catch(() => {});
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    setKeySaving(true);
    setKeyStatusMsg("");
    try {
      const res = await fetch("/api/save-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save key");
      localStorage.setItem("portfolio_gemini_key", trimmed);
      setHasKey(true);
      setKeyStatusMsg("✓ Key activated and saved to .env.local!");
      setTimeout(() => setShowKeyConfig(false), 1600);
    } catch (err) {
      setKeyStatusMsg(err instanceof Error ? err.message : "Error saving key");
    } finally {
      setKeySaving(false);
    }
  };

  const msgsRef = useRef<Msg[]>([]);
  msgsRef.current = msgs;

  const ask = useCallback(async (q: string) => {
    const question = q.trim();
    if (!question || busyRef.current) return;
    busyRef.current = true;
    setOpen(true);
    setBusy(true);
    setInput("");
    const history = msgsRef.current.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
      citations: m.citations,
    }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("portfolio_gemini_key") || "" : "";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-gemini-key": storedKey } : {}),
        },
        body: JSON.stringify({ question, apiKey: storedKey, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: data.answer, citations: data.citations, mode: data.mode, note: data.note },
      ]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: e instanceof Error ? e.message : "Something went wrong.", mode: "error" },
      ]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const onAsk = (e: Event) => ask((e as CustomEvent<string>).detail);
    const onOpen = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener(EV.ask, onAsk);
    window.addEventListener(EV.openAssistant, onOpen);
    return () => {
      window.removeEventListener(EV.ask, onAsk);
      window.removeEventListener(EV.openAssistant, onOpen);
    };
  }, [ask]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onCite = (c: Citation, e: React.MouseEvent) => {
    if (c.href.startsWith("#p-")) {
      e.preventDefault();
      emit(EV.focusProject, c.href.slice(3));
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="fixed right-5 bottom-5 z-40 flex items-center gap-2.5 rounded-full border border-accent/60 bg-surface/95 px-5 py-3 text-sm font-medium text-ink shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(61,220,132,0.25)] backdrop-blur-md transition-all hover:border-accent hover:shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_36px_rgba(61,220,132,0.4)]"
            aria-label="Open portfolio assistant"
            data-testid="assistant-launcher"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span>Ask about my work</span>
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            key="dialog"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            role="dialog"
            aria-label="Portfolio assistant"
            data-testid="assistant"
            className="fixed right-3 bottom-3 z-50 flex h-[min(640px,calc(100vh-1.5rem))] w-[min(440px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(61,220,132,0.15)] backdrop-blur-xl"
          >
            {/* Header */}
            <header className="flex items-start justify-between border-b border-line/80 bg-raised/40 px-5 py-3.5 backdrop-blur">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <p className="text-sm font-semibold tracking-tight text-ink">Portfolio Assistant</p>
                </div>
                <p className="font-mono text-[11px] text-accent mt-0.5">
                  Grounded on this site, not the open web.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] border transition ${
                    hasKey
                      ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  }`}
                  title={hasKey ? "Gemini API key connected · Click to view/edit" : "Connect Gemini API Key"}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${hasKey ? "bg-accent" : "bg-amber-500 animate-pulse"}`} />
                  <span>{hasKey ? "AI Active" : "Connect Key"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted transition hover:bg-raised hover:text-ink"
                  aria-label="Close assistant"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Key configuration drawer */}
            <AnimatePresence>
              {showKeyConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-line/80 bg-surface/98 p-4 text-xs transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      AI Provider API Key
                    </span>
                    <div className="flex gap-2">
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-accent underline hover:brightness-125"
                      >
                        Gemini ↗
                      </a>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-accent underline hover:brightness-125"
                      >
                        Groq (Fast) ↗
                      </a>
                    </div>
                  </div>
                  <p className="text-muted text-[11px] mb-2.5 leading-relaxed">
                    Paste your Gemini (<code className="text-accent font-mono">AIzaSy…</code>) or Groq (<code className="text-accent font-mono">gsk_…</code>) key. Saved to <code className="text-accent font-mono">.env.local</code> and activated instantly.
                  </p>
                  <form onSubmit={handleSaveKey} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="AIzaSy... or gsk_..."
                        aria-label="Gemini API Key"
                        className="flex-1 rounded-lg border border-line bg-bg/90 px-3 py-1.5 font-mono text-xs text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={keySaving || !keyInput.trim()}
                        className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-bg transition hover:brightness-110 disabled:opacity-50"
                      >
                        {keySaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                    {keyStatusMsg && (
                      <p className={`font-mono text-[11px] ${keyStatusMsg.startsWith("✓") ? "text-accent" : "text-amber-500"}`}>
                        {keyStatusMsg}
                      </p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages list */}
            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4 scroll-smooth" aria-live="polite">
              {msgs.length === 0 && (
                <div className="space-y-3 pt-2 text-xs text-muted">
                  <p className="leading-relaxed">
                    Ask anything about Balamurugan&apos;s AI/ML projects, architectures, benchmarks, internships or hiring status.
                  </p>
                  <div className="rounded-lg border border-line bg-raised/50 p-3 font-mono text-[11px] text-faint">
                    <span className="text-accent">i</span> Answers are synthesized exclusively from verified data on this portfolio with zero hallucination.
                  </div>
                </div>
              )}

              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-8 rounded-xl bg-accent/15 border border-accent/20 px-3.5 py-2.5 text-sm text-ink font-medium"
                  >
                    {m.text}
                  </motion.div>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 text-sm"
                    data-testid="assistant-answer"
                  >
                    {m.note && (
                      <div className="flex items-center justify-between gap-2 rounded border border-line/60 bg-raised/60 px-2.5 py-1.5 font-mono text-[11px] text-muted">
                        <span>{m.note}</span>
                        {!hasKey && (
                          <button
                            type="button"
                            onClick={() => setShowKeyConfig(true)}
                            className="text-accent underline font-mono text-[10.5px] whitespace-nowrap hover:brightness-125"
                          >
                            + Connect Key
                          </button>
                        )}
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap text-ink/90 bg-raised/40 rounded-xl p-3 border border-line/50">
                      {m.text}
                    </p>

                    {m.citations && m.citations.length > 0 && (
                      <div className="pt-1" data-testid="citations">
                        <p className="label !text-[10px] mb-1.5 flex items-center gap-1.5 text-faint">
                          <span>SOURCES ON THIS PAGE</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.citations.map((c) => (
                            <a
                              key={c.label}
                              href={c.href}
                              onClick={(e) => onCite(c, e)}
                              data-citation={c.label}
                              className="group inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent transition hover:bg-accent hover:text-bg hover:shadow-[0_0_12px_rgba(61,220,132,0.5)]"
                            >
                              <span>{c.label}</span>
                              <span className="opacity-60 transition group-hover:translate-x-0.5">↗</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.mode && MODE_LABEL[m.mode] && (
                      <p className="font-mono text-[10px] text-faint flex items-center gap-1">
                        {MODE_LABEL[m.mode]}
                      </p>
                    )}
                  </motion.div>
                ),
              )}

              {busy && (
                <div className="flex items-center gap-2 text-xs font-mono text-muted py-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  <span>retrieving & verifying…</span>
                </div>
              )}
            </div>

            {/* Footer with starter chips & form */}
            <div className="border-t border-line/80 bg-raised/30 px-4 pt-3 pb-4">
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy}
                    onClick={() => ask(q)}
                    className="rounded-full border border-line bg-surface/70 px-2.5 py-1 text-[11.5px] text-muted transition hover:border-accent hover:text-ink hover:bg-surface disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={400}
                  placeholder="Ask about a project, skill or role…"
                  aria-label="Ask the portfolio assistant"
                  className="flex-1 rounded-xl border border-line bg-bg/80 px-3.5 py-2.5 text-xs text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-bg transition hover:brightness-110 disabled:opacity-40 shadow-[0_0_16px_rgba(61,220,132,0.3)]"
                >
                  Ask
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
