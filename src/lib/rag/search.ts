import type { Doc } from "../corpus";
import type { HistoryItem } from "../agent";
import { retrieveConversation } from "../agent";
import { createBm25Index, isBlockedQuestion, searchBm25, type EvidenceChunk } from "./core";

export function evidenceDocs(chunks: EvidenceChunk[], approved: Doc[]): Doc[] {
  return chunks.map(chunk => ({
    id: `evidence:${chunk.id}`, section: "resume", title: chunk.title,
    text: `${chunk.text}\nSource: ${chunk.sourceUrl}`,
    summary: `${chunk.text.slice(0, 800)}\nSource: ${chunk.sourceUrl}`,
    href: chunk.href, aliases: [], projectSlug: chunk.projectSlug,
    authorityText: approved.find(d => d.project?.slug === chunk.projectSlug)?.text,
    provenance: { sourceId: chunk.sourceId, kind: chunk.kind, revision: chunk.revision, fetchedAt: chunk.fetchedAt, url: chunk.sourceUrl },
  }));
}

export function retrieveEvidence(question: string, approved: Doc[], chunks: EvidenceChunk[], history: HistoryItem[], budget = 12_000) {
  if (isBlockedQuestion(question)) return { docs: [], scores: [], aliasHit: false, offTopic: true };
  const expandedHistory = history.map(h => ({ ...h, citations: h.citations.flatMap(c => {
    const chunk = chunks.find(d => d.href === c.href && d.title === c.label);
    const project = chunk && approved.find(d => d.project?.slug === chunk.projectSlug);
    return project ? [c, { label: project.title, href: project.href }] : [c];
  }) }));
  let initial = retrieveConversation(question, approved, expandedHistory);
  if (initial.offTopic) return initial;
  if (!initial.docs.length) {
    // Technical terms newly learned from documentation need not appear in the
    // short portfolio summary. Require multiple matching terms to avoid
    // turning a single generic word into an unrelated project answer.
    const discoveries = searchBm25(question, createBm25Index(chunks), 4).filter(r => r.matched >= 2 && r.score >= 1.5);
    const discovered = new Set(discoveries.map(r => r.chunk.projectSlug).filter(Boolean));
    const anchors = approved.filter(d => d.project && discovered.has(d.project.slug)).slice(0, 2);
    if (!anchors.length) return initial;
    initial = { docs: anchors, scores: anchors.map(() => 30), aliasHit: true, offTopic: false };
  }
  const slugs = new Set(initial.docs.flatMap(d => d.project ? [d.project.slug] : []));
  // Generic profile questions do not acquire unrelated README claims.
  const candidates = chunks.filter(c => slugs.size ? slugs.has(c.projectSlug ?? "") : !c.projectSlug && /resume|education|experience|skills|linkedin|profile/i.test(question));
  const ranked = searchBm25(question, createBm25Index(candidates), 4);
  const extras = evidenceDocs(ranked.map(r => r.chunk), approved);
  const docs: Doc[] = [];
  let used = 0;
  for (const doc of [...initial.docs, ...extras]) {
    if (used + doc.text.length > budget) continue;
    if (docs.some(d => d.id === doc.id)) continue;
    docs.push(doc); used += doc.text.length;
  }
  return { ...initial, docs, scores: docs.map(() => 30) };
}
