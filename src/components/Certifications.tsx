"use client";

import { useState } from "react";
import { completedCredentials, inProgressCredentials, type Credential } from "@/data/credentials";

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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [query, setQuery] = useState("");
  const featured = completedCredentials.filter(c => c.featured);
  const needle = query.trim().toLowerCase();
  const matches = completedCredentials.filter(c => [c.title, c.issuer, c.platform, c.kind, c.credentialId].filter(Boolean).join(" ").toLowerCase().includes(needle));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
      <p><span className="font-mono text-accent">{featured.length} selected</span> · Professional certifications, programmes and course completions</p>
      <p>Original documents + issuer links where available</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map(c => <article key={c.id} id={`credential-${c.id}`} data-featured-credential={c.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-accent">{c.kind}</p>
        <h3 className="mt-3 text-sm font-semibold leading-relaxed text-ink">{c.title}</h3>
        <div className="mt-3 space-y-2"><CredentialDetails credential={c} /></div>
        <div className="mt-auto pt-5"><ProofLinks credential={c} /></div>
      </article>)}
    </div>

    {inProgressCredentials.map(c => <aside key={c.id} id={`learning-${c.id}`} aria-label="Current learning" className="flex flex-col gap-3 rounded-xl border border-line bg-raised/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="label mb-2 !text-[10px]">Currently learning</p><h3 className="text-sm font-semibold">{c.title}</h3><p className="mt-1 text-xs text-muted">{c.issuer}</p><p className="mt-2 text-xs leading-relaxed text-muted">{c.note}</p></div>
      <span className="w-fit shrink-0 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[10px] text-accent">{c.status}</span>
    </aside>)}

    <details className="rounded-2xl border border-line bg-surface" onToggle={e => setArchiveOpen(e.currentTarget.open)}>
      <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-ink marker:text-accent">Explore all {completedCredentials.length} completed credentials</summary>
      {archiveOpen && <div className="border-t border-line p-5">
        <p className="mb-4 text-xs leading-relaxed text-muted">The full record includes programme certificates and their individual course completions. Each unique credential appears once here; duplicate PDF copies are counted once. In-progress learning is listed separately above.</p>
        <label htmlFor="credential-search" className="mb-2 block text-xs text-muted">Search by title, issuer or credential ID</label>
        <input id="credential-search" type="search" aria-label="Search credentials" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Oracle, Python, NPTEL or an ID" className="w-full rounded-xl border border-line bg-bg px-3 py-3 text-sm text-ink placeholder:text-muted" />
        <p data-testid="credential-results" role="status" className="mt-3 font-mono text-[10px] text-muted">{matches.length} of {completedCredentials.length} credentials</p>
        <ul className="mt-4 divide-y divide-line">
          {matches.map(c => <li key={c.id} id={`credential-archive-${c.id}`} data-catalogue-credential={c.id} className="grid min-w-0 gap-4 py-5 first:pt-1 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-wider text-accent">{c.kind}</p><h3 className="my-2 text-sm font-semibold leading-relaxed">{c.title}</h3><div className="space-y-1.5"><CredentialDetails credential={c} /></div></div>
            <ProofLinks credential={c} />
          </li>)}
        </ul>
        {!matches.length && <p className="py-5 text-sm text-muted">No matching credentials. Try another title, issuer or ID.</p>}
      </div>}
    </details>
  </div>;
}
