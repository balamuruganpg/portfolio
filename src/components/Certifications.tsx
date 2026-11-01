"use client";

import { useEffect, useState } from "react";
import { completedCredentials, inProgressCredentials, type Credential } from "@/data/credentials";
import { EV } from "./ui";

const PAGE_SIZE = 12;
const featured = completedCredentials.filter(c => c.featured);
const issuers = [...new Set(completedCredentials.map(c => c.issuer))].sort((a, b) => a.localeCompare(b));

function ProofLinks({ credential: c }: { credential: Credential }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
    {c.verificationUrl && <a href={c.verificationUrl} target="_blank" rel="noopener noreferrer" className="link text-accent" aria-label={`Verify ${c.title}`}>Verify credential ↗</a>}
    <a href={c.file} target="_blank" rel="noopener noreferrer" className="link text-muted" aria-label={`View certificate: ${c.title}`}>View certificate ↗</a>
  </div>;
}

function CredentialDetails({ credential: c }: { credential: Credential }) {
  return <>
    <p className="text-xs leading-relaxed text-muted">{c.issuer}{c.platform && <span> · {c.platform}</span>}</p>
    <p className="font-mono text-[10px] leading-relaxed text-muted">{c.dateLabel}{c.expiresOn && ` · Valid until ${c.expiresOn}`}</p>
    {c.credentialId && <p className="text-[11px] leading-relaxed text-muted">{c.idLabel ?? "Credential ID"}: <span className="break-all font-mono text-ink">{c.credentialId}</span></p>}
    {c.parentId && <p className="text-xs text-muted">Part of IBM Data Science</p>}
    {c.note && <p className="text-xs leading-relaxed text-muted">{c.note}</p>}
  </>;
}

export default function Certifications() {
  const [view, setView] = useState<"featured" | "all">("featured");
  const [query, setQuery] = useState("");
  const [issuer, setIssuer] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const needle = query.trim().toLowerCase();
  const matches = (view === "featured" ? featured : completedCredentials).filter(c => (!issuer || c.issuer === issuer) && [c.title, c.issuer, c.platform, c.kind, c.credentialId, c.dateLabel, c.note].filter(Boolean).join(" ").toLowerCase().includes(needle));
  const visible = matches.slice(0, visibleCount);

  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string; issuer?: string; view?: "all" | "featured" }>).detail;
      const nextQuery = typeof detail?.query === "string" ? detail.query : "";
      const nextIssuer = typeof detail?.issuer === "string" ? issuers.find(i => i.toLowerCase() === detail.issuer?.trim().toLowerCase()) ?? "" : "";
      setQuery(nextQuery);
      setIssuer(nextIssuer);
      setView(nextQuery.trim() || nextIssuer ? "all" : detail?.view === "featured" ? "featured" : "all");
      setVisibleCount(PAGE_SIZE);
      document.getElementById("certs")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    window.addEventListener(EV.focusCredentials, onFocus);
    return () => window.removeEventListener(EV.focusCredentials, onFocus);
  }, []);

  const selectView = (next: "featured" | "all") => {
    setView(next);
    setQuery("");
    setIssuer("");
    setVisibleCount(PAGE_SIZE);
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <p><span className="font-mono text-accent">{featured.length} selected</span> · Professional certifications, programmes and course completions</p>
      <p>Original documents + issuer links where available</p>
    </div>
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div role="tablist" aria-label="Certificate collections" className="flex w-fit max-w-full gap-1 rounded-xl border border-line bg-bg p-1" onKeyDown={e => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const next = e.key === "Home" ? "featured" : e.key === "End" ? "all" : view === "featured" ? "all" : "featured";
        selectView(next);
        e.currentTarget.querySelector<HTMLButtonElement>(`#credential-tab-${next}`)?.focus();
      }}>
        {(["featured", "all"] as const).map(tab => <button key={tab} type="button" role="tab" id={`credential-tab-${tab}`} aria-selected={view === tab} aria-controls="credential-cards" tabIndex={view === tab ? 0 : -1} onClick={() => selectView(tab)} className={`rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${view === tab ? "bg-raised text-ink" : "text-muted hover:text-ink"}`}>{tab === "featured" ? `Featured ${featured.length}` : `All ${completedCredentials.length}`}</button>)}
      </div>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0"><label htmlFor="credential-search" className="mb-2 block text-xs text-muted">Search all {completedCredentials.length} completed certificates</label>
          <input id="credential-search" type="search" aria-label="Search credentials" value={query} onChange={e => { setQuery(e.target.value); setView("all"); setVisibleCount(PAGE_SIZE); }} placeholder="Title, issuer or credential ID" className="w-full min-w-0 rounded-xl border border-line bg-bg px-3 py-3 text-sm text-ink placeholder:text-muted" />
        </div>
        <div className="min-w-0"><label htmlFor="credential-issuer" className="mb-2 block text-xs text-muted">Filter by issuer</label>
          <select id="credential-issuer" value={issuer} onChange={e => { setIssuer(e.target.value); setView("all"); setVisibleCount(PAGE_SIZE); }} className="w-full min-w-0 truncate rounded-xl border border-line bg-bg px-3 py-3 text-sm text-ink">
            <option value="">All issuers</option>{issuers.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p data-testid="credential-results" role="status" aria-live="polite" className="font-mono text-[10px] leading-relaxed text-muted">{matches.length} of {completedCredentials.length} completed credentials · Showing {visible.length}{view === "featured" ? " featured" : ""}</p>
        {(query || issuer) && <button type="button" onClick={() => { setQuery(""); setIssuer(""); setVisibleCount(PAGE_SIZE); }} className="link text-xs text-accent">Clear filters</button>}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">Includes programme certificates and individual course completions. In-progress learning is listed separately and is not included in the count.</p>
    </div>
    <div id="credential-cards" role="tabpanel" aria-labelledby={`credential-tab-${view}`} tabIndex={0} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map(c => <article key={c.id} id={`credential-${c.id}`} data-featured-credential={view === "featured" ? c.id : undefined} data-catalogue-credential={view === "all" ? c.id : undefined} className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-accent">{c.kind}</p>
        <h3 className="mt-3 text-sm font-semibold leading-relaxed text-ink">{c.title}</h3>
        <div className="mt-3 space-y-2"><CredentialDetails credential={c} /></div>
        <div className="mt-auto pt-5"><ProofLinks credential={c} /></div>
      </article>)}
    </div>
    {!matches.length && <p className="py-5 text-sm text-muted">No matching credentials. Try another title, issuer or ID.</p>}
    {visible.length < matches.length && <div className="flex justify-center"><button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)} className="rounded-xl border border-line bg-surface px-5 py-3 text-xs font-medium text-ink transition-colors hover:border-accent/40">Load more certificates ({matches.length - visible.length} remaining)</button></div>}

    {inProgressCredentials.map(c => <aside key={c.id} id={`learning-${c.id}`} aria-label="Current learning" className="flex flex-col gap-3 rounded-xl border border-line bg-raised/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="label mb-2 !text-[10px]">Currently learning</p><h3 className="text-sm font-semibold">{c.title}</h3><p className="mt-1 text-xs text-muted">{c.issuer}</p><p className="mt-2 text-xs leading-relaxed text-muted">{c.note}</p></div>
      <span className="w-fit shrink-0 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[10px] text-accent">{c.status}</span>
    </aside>)}

  </div>;
}
