"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { STARTER_QUESTIONS } from "@/data/site";
import { EV, emit } from "./ui";
import AssistantMark from "./AssistantMark";

interface Citation { label: string; href: string; section: string; index?: number }
interface Msg {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  mode?: "llm" | "offline" | "guarded" | "refused" | "error" | "greeting" | "cancelled" | "source-unavailable";
  note?: string;
  suggestions?: string[];
  provider?: string;
  model?: string;
  actions?: { type: "credentials"; label: string; query: string }[];
}
const modes: Record<string, string> = { llm: "Source-checked answer", offline: "Original portfolio facts", guarded: "Original facts · generated answer withheld", refused: "Outside portfolio scope", greeting: "Ready to explore", cancelled: "Stopped", "source-unavailable": "Source unavailable · verified profile link", error: "Request interrupted" };

export default function Assistant() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [knowledge, setKnowledge] = useState<{ sourceCount: number; credentialCount?: number; repositoryCount: number; chunkCount: number; updatedAt?: string; unavailable?: { title: string; status: string }[] } | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const msgsRef = useRef(msgs);
  const busyRef = useRef(false);
  msgsRef.current = msgs;

  useEffect(() => {
    // Retire the old browser key flow; credentials belong only on the server.
    try { localStorage.removeItem("portfolio_gemini_key"); } catch {}
    fetch("/api/chat").then(r => r.json()).then(d => {setProvider(d.hasKey ? d.provider : null);if(d.knowledge)setKnowledge(d.knowledge);}).catch(() => {});
    return () => controller.current?.abort();
  }, []);

  const ask = useCallback(async (q: string) => {
    const question = q.trim();
    if (!question || busyRef.current || question.length > 600) return;
    busyRef.current = true;
    setOpen(true); setBusy(true); setInput("");
    const history = msgsRef.current.filter(m => m.mode !== "error" && m.mode !== "cancelled").slice(-6).map(m => ({ role: m.role, text: m.text, citations: m.citations }));
    setMsgs(m => [...m, { role: "user", text: question }]);
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort("timeout"), 20_000);
    try {
      const response = await fetch("/api/chat", { method: "POST", signal: abort.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, history }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "I couldn't complete that request. Please try again.");
      if (typeof data.answer !== "string") throw new Error("The response was incomplete. Please try again.");
      const actions = Array.isArray(data.actions) ? data.actions.filter((a: { type?: string; label?: unknown; query?: unknown }) => a.type === "credentials" && typeof a.label === "string" && typeof a.query === "string").slice(0, 2) : [];
      setMsgs(m => [...m, { role: "assistant", text: data.answer, citations: data.citations, mode: data.mode, note: data.note, suggestions: data.suggestions, provider: data.provider, model: data.model, actions }]);
    } catch (error) {
      const stopped = abort.signal.aborted && abort.signal.reason !== "timeout";
      setMsgs(m => [...m, { role: "assistant", text: stopped ? "Stopped. Ask another question whenever you're ready." : abort.signal.aborted ? "That took too long. Please try again." : error instanceof Error ? error.message : "Connection interrupted. Please try again.", mode: stopped ? "cancelled" : "error" }]);
    } finally {
      clearTimeout(timer); controller.current = null; busyRef.current = false; setBusy(false);
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const onAsk = (event: Event) => { const q = (event as CustomEvent).detail; if (typeof q === "string") ask(q); };
    const onOpen = () => setOpen(true);
    window.addEventListener(EV.ask, onAsk); window.addEventListener(EV.openAssistant, onOpen);
    return () => { window.removeEventListener(EV.ask, onAsk); window.removeEventListener(EV.openAssistant, onOpen); };
  }, [ask]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? "instant" : "smooth" }); }, [msgs, busy, reduce]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab" || !dialogRef.current?.contains(document.activeElement)) return;
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", onKey); if (previous?.isConnected) previous.focus({ preventScroll: true }); else launcherRef.current?.focus({ preventScroll: true }); };
  }, [open]);

  const cite = (c: Citation, event: React.MouseEvent) => {
    if (c.href.startsWith("#p-")) { event.preventDefault(); emit(EV.focusProject, c.href.slice(3)); }
    if (c.href === "#certs") { event.preventDefault(); setOpen(false); emit(EV.focusCredentials, { view: "all" }); }
  };
  const opensProofTab = (href: string) => href.startsWith("https:") || href.startsWith("/credentials/");
  const answerBody = (message: Msg) => message.text.split(/(\[\d+\])/g).map((part, i) => {
    const number = part.match(/^\[(\d+)\]$/)?.[1];
    const citation = number && message.citations?.find(c => c.index === Number(number));
    return citation ? <a key={i} href={citation.href} target={opensProofTab(citation.href) ? "_blank" : undefined} rel={opensProofTab(citation.href) ? "noopener noreferrer" : undefined} onClick={e => cite(citation, e)} aria-label={`Source ${number}: ${citation.label}`} className="mx-0.5 inline-flex rounded border border-accent/30 px-1 font-mono text-xs text-accent hover:bg-accent/10">{number}</a> : part;
  });
  const lastAnswer = [...msgs].reverse().find(m => m.role === "assistant");
  const suggestions = lastAnswer?.suggestions ?? STARTER_QUESTIONS;
  const lastQuestion = [...msgs].reverse().find(m => m.role === "user")?.text;

  return <>
    <AnimatePresence>
      {!open && <motion.button ref={launcherRef} key="launcher" initial={false} animate={{ opacity: 1, scale: 1 }} whileHover={reduce ? undefined : { y: -3 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => setOpen(true)} className="assistant-launcher fixed right-5 bottom-5 z-40 flex items-center gap-3 rounded-full border border-accent/50 bg-surface px-5 py-3 text-sm font-medium text-ink shadow-xl" aria-label="Open portfolio assistant" data-testid="assistant-launcher"><AssistantMark className="h-6 w-6 text-accent" />Ask about my work <span className="font-mono text-xs text-accent">↗</span></motion.button>}
    </AnimatePresence>
    <AnimatePresence>
      {open && <motion.section ref={dialogRef} key="assistant" initial={{ opacity: 0, y: reduce ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : 12 }} transition={{ duration: reduce ? 0 : 0.25 }} role="dialog" aria-label="Portfolio assistant" data-testid="assistant" className="fixed right-3 bottom-3 z-[60] flex h-[min(710px,calc(100dvh-1.5rem))] w-[min(470px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <header className="border-b border-line bg-raised/50 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent"><AssistantMark className="h-7 w-7" /></span><div><h2 className="text-sm font-semibold">Portfolio Assistant</h2><p className="mt-0.5 font-mono text-[10px] text-muted">{provider ? `${provider} configured · evidence checked` : "Evidence mode · no model required"}</p></div></div>
            <div className="flex items-center gap-1"><button type="button" disabled={busy || !msgs.length} onClick={() => {setMsgs([]);setInput("");inputRef.current?.focus();}} aria-label="Clear conversation" title="New conversation" className="rounded-lg p-2 text-muted hover:bg-raised disabled:opacity-30">↺</button><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-2 text-muted hover:bg-raised">✕</button></div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted">Grounded on this site, not the open web.</p>{knowledge && <button type="button" onClick={()=>setShowSources(v=>!v)} aria-expanded={showSources} aria-controls="assistant-source-coverage" className="rounded px-2 py-1 font-mono text-[10px] text-accent hover:bg-raised">{knowledge.sourceCount} indexed sources {showSources?"−":"+"}</button>}</div>
          {showSources && knowledge && <div id="assistant-source-coverage" className="mt-3 rounded-xl border border-line bg-bg/50 p-3 text-xs leading-relaxed text-muted"><p>{knowledge.repositoryCount} repositories · {knowledge.chunkCount} indexed passages</p>{knowledge.credentialCount && <p className="mt-1">{knowledge.credentialCount} document-backed completed credentials in the approved portfolio facts.</p>}<p className="mt-1">Approved facts + versioned GitHub docs, resume and package documentation. Sources are refreshed by the owner; answers do not browse the web.</p>{knowledge.updatedAt&&<p className="mt-2 font-mono text-[10px]">Snapshot: {new Date(knowledge.updatedAt).toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata"})}</p>}{knowledge.unavailable?.map(s=><p key={s.title} className="mt-1">{s.title}: {s.status}. No content inferred.</p>)}</div>}

        </header>
        <div ref={listRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" aria-busy={busy} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
          {!msgs.length && <div><p className="label text-accent">Meet the work behind the claims</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">What would you like to explore?</h3><p className="mt-3 text-sm leading-relaxed text-muted">Ask about a project, compare the results, or explore Balamurugan’s experience. Every factual answer links back to this portfolio.</p><div className="mt-5 grid gap-2">{STARTER_QUESTIONS.map((q,i) => <button key={q} type="button" onClick={() => ask(q)} className="group flex items-center justify-between rounded-xl border border-line bg-raised/40 px-4 py-3 text-left text-sm transition hover:border-accent/40 hover:bg-raised"><span><span aria-hidden="true" className="mr-3 font-mono text-xs text-accent">0{i+1}</span>{q}</span><span aria-hidden="true" className="text-accent transition group-hover:translate-x-1">↗</span></button>)}</div><p className="mt-5 text-xs leading-relaxed text-muted">I’ll say when something isn’t documented. If a model is unavailable, you’ll still get the original facts with citations.</p></div>}
          {msgs.map((message,i) => <motion.div key={i} initial={false} animate={{opacity:1}} className={message.role === "user" ? "ml-8 rounded-2xl rounded-tr-sm border border-accent/20 bg-accent/10 px-4 py-3 text-sm" : "space-y-3"} data-testid={message.role === "assistant" ? "assistant-answer" : undefined}>
            {message.role === "user" ? message.text : <>
              {message.note && <p className="rounded-lg border border-line bg-raised/50 px-3 py-2 text-xs leading-relaxed text-muted">{message.note}</p>}
              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-ink">{answerBody(message)}</div>
              {!!message.citations?.length && <div data-testid="citations"><p className="label mb-2 !text-[10px]">Sources</p><div className="flex flex-wrap gap-2">{message.citations.map(c => <a key={`${c.href}-${c.index}`} href={c.href} target={opensProofTab(c.href) ? "_blank" : undefined} rel={opensProofTab(c.href) ? "noopener noreferrer" : undefined} onClick={e=>cite(c,e)} data-citation={c.label} className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1.5 text-xs text-accent hover:bg-accent/15">{c.label} ↗</a>)}</div></div>}
              {!!message.actions?.length && <div className="flex flex-wrap gap-2">{message.actions.map(action => <button key={action.label} type="button" onClick={() => { setOpen(false); emit(EV.focusCredentials, { view: "all", query: action.query }); }} className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20">{action.label} →</button>)}</div>}
              <div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-muted">{message.provider && (message.mode === "llm" || message.mode === "guarded") ? `${message.provider}${message.model ? ` · ${message.model}` : ""} · ` : ""}{modes[message.mode ?? ""]}</span><button type="button" aria-label="Copy answer" onClick={async()=>{try{await navigator.clipboard.writeText(message.text.replace(/\[\d+\]/g,""));setCopied(i);setTimeout(()=>setCopied(null),1800);}catch{setCopied(null);}}} className="shrink-0 rounded px-2 py-1 text-xs text-muted hover:bg-raised">{copied===i?"Copied ✓":"Copy"}</button></div>
              {message.mode === "error" && lastQuestion && <button type="button" disabled={busy} onClick={()=>ask(lastQuestion)} aria-label="Try again" className="link text-sm text-accent">Try again ↗</button>}
            </>}
          </motion.div>)}
          {busy && <div role="status" className="flex items-center gap-3 py-2 text-xs text-muted"><span className="flex gap-1" aria-hidden="true">{[0,1,2].map(i=><span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{animationDelay:`${i*140}ms`}} />)}</span>Finding sources and checking the answer…</div>}
        </div>
        <div className="border-t border-line bg-raised/30 p-4">
          {!!msgs.length && <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map(q=><button key={q} type="button" disabled={busy} onClick={()=>ask(q)} className="shrink-0 rounded-full border border-line bg-surface px-3 py-2 text-xs text-muted hover:border-accent/40 disabled:opacity-40">{q}</button>)}</div>}
          <form onSubmit={e=>{e.preventDefault();ask(input);}} className="flex items-center gap-2"><input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} maxLength={600} placeholder="Ask about Balamurugan’s work…" aria-label="Ask the portfolio assistant" className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-3 text-sm text-ink placeholder:text-muted focus-visible:border-accent" />{busy?<button type="button" onClick={()=>controller.current?.abort()} aria-label="Stop response" className="rounded-xl border border-line px-4 py-3 text-sm">Stop</button>:<button type="submit" disabled={!input.trim()} className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg disabled:opacity-40">Ask</button>}</form>
          <p className="mt-2 text-center font-mono text-[9px] text-muted">Portfolio facts only · check the linked evidence · Esc to close</p>
        </div>
      </motion.section>}
    </AnimatePresence>
  </>;
}
