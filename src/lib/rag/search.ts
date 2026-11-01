import type { Doc } from "../corpus";
import type { HistoryItem } from "../agent";
import type { SessionMemory } from "../session";
import { asksForLimitations, isDetailRequest, isLinkRequest, isSimplificationRequest, isWorkflowRequest, retrieveConversation } from "../agent";
import { createBm25Index, isBlockedQuestion, searchBm25, type EvidenceChunk } from "./core";
import type { QueryPlan } from "./planning";

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

function fingerprint(text: string): string {
  return text.toLowerCase().replace(/https?:\/\/\S+/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Expansion is a request for breadth, not a literal keyword search for "more". */
function expansionSections(candidates: EvidenceChunk[], history: HistoryItem[]) {
  const previous = history.filter(h => h.role === "assistant").flatMap(h => h.citations);
  const seen = new Set(candidates.filter(c => previous.some(p => p.href === c.href && p.label === c.title)).map(c => fingerprint(c.text)));
  const pool = candidates.filter(c => c.text.length >= 60 && fingerprint(c.heading) !== fingerprint(c.title.split("·")[0]) && !/^(?:[^a-z0-9]*)(?:overview|introduction|installation|terminal output|license|clone repository|install development dependencies)\b/i.test(c.heading) && !/^\w+\.\w+\(.*\)$/.test(c.heading));
  const fresh = pool.filter(c => !seen.has(fingerprint(c.text)));
  const available = fresh.length >= 2 ? fresh : pool;
  const ranks = searchBm25("architecture pipeline design detection data splitting input formats CLI interfaces API outputs reports evaluation", createBm25Index(available), available.length);
  const ordered = [...ranks.map(r => r.chunk), ...available].filter((c, i, all) => all.findIndex(x => x.id === c.id) === i);
  const selected: EvidenceChunk[] = [];
  const bodies = new Set<string>();
  const add = (chunk: EvidenceChunk) => {
    const body = fingerprint(chunk.text);
    if (bodies.has(body)) return false;
    bodies.add(body); selected.push(chunk); return true;
  };
  // Cover distinct aspects instead of taking six near-identical search hits.
  for (const aspect of [/architecture|pipeline|design|detection engines|workflow/i, /leak.free splitting|split|preprocess/i, /CLI usage|interfaces|integration|endpoint|gateway/i, /interactive.*reports|reports|outputs|delivery/i, /input formats|match records|evaluation|testing/i]) {
    const match = ordered.find(c => aspect.test(c.heading) && !bodies.has(fingerprint(c.text)));
    if (match) add(match);
  }
  for (const chunk of ordered) { if (selected.length >= 6) break; add(chunk); }
  return selected.slice(0, 6);
}

export function retrieveEvidence(question: string, approved: Doc[], chunks: EvidenceChunk[], history: HistoryItem[], budget = 12_000, plan?: QueryPlan | null, memory?: SessionMemory) {
  if (isBlockedQuestion(question)) return { docs: [], scores: [], aliasHit: false, offTopic: true };
  const expandedHistory = history.map(h => ({ ...h, citations: h.citations.flatMap(c => {
    const chunk = chunks.find(d => d.href === c.href && d.title === c.label);
    const project = chunk && approved.find(d => d.project?.slug === chunk.projectSlug);
    return project ? [c, { label: project.title, href: project.href }] : [c];
  }) }));
  let initial = retrieveConversation(question, approved, expandedHistory, memory);
  if (initial.offTopic || initial.needsClarification) return initial;
  const planned = plan?.ids.flatMap(id => approved.filter(d => d.id === id)) ?? [];
  if (planned.length && !initial.contextual) initial = { docs: planned, scores: planned.map(() => 30), aliasHit: false, offTopic: false };
  const searchQuestion = [question, ...(plan?.queries ?? [])].join(" ");
  if (!initial.docs.length) {
    // Technical terms newly learned from documentation need not appear in the
    // short portfolio summary. Require multiple matching terms to avoid
    // turning a single generic word into an unrelated project answer.
    const discoveries = searchBm25(searchQuestion, createBm25Index(chunks), 4).filter(r => r.matched >= 2 && r.score >= 1.5);
    const discovered = new Set(discoveries.map(r => r.chunk.projectSlug).filter(Boolean));
    const anchors = approved.filter(d => d.project && discovered.has(d.project.slug)).slice(0, 2);
    if (!anchors.length) return initial;
    initial = { docs: anchors, scores: anchors.map(() => 30), aliasHit: true, offTopic: false };
  }
  const slugs = new Set(initial.docs.flatMap(d => d.project ? [d.project.slug] : []));
  // Generic profile questions do not acquire unrelated README claims.
  // Canonical records already contain approved destinations. A URL-only request
  // needs those records, not unrelated README passages competing for tokens.
  const linksOnly = isLinkRequest(question) && !isDetailRequest(question) && !isWorkflowRequest(question) && !asksForLimitations(question);
  const candidates = linksOnly ? [] : chunks.filter(c => (slugs.size ? slugs.has(c.projectSlug ?? "") : !c.projectSlug && /resume|education|experience|skills|linkedin|profile/i.test(searchQuestion)) && (asksForLimitations(question) || !/limitations?|drawbacks?|weakness|shortcomings|caveats?/i.test(c.heading)));
  let focus = searchQuestion.toLowerCase();
  for (const doc of initial.docs) {
    if (!doc.project) continue;
    for (const name of [doc.project.name, doc.project.slug]) focus = focus.replaceAll(name.toLowerCase(), " ");
  }
  focus = focus.replace(/\b(i|said|please|can|you|could|would|tell|me|more|much|details?|detailed|depth|in|go|deeper|expand|elaborate|about|it|its|this|that|the|project|package|app|system|really|not|again|explain|give|want|need|a|an|some|very|and|on|how|does|work|works)\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  const index = createBm25Index(candidates);
  const workflow = isWorkflowRequest(question);
  const simple = isSimplificationRequest(question);
  const detail = !simple && (isDetailRequest(question) || workflow || plan?.intent === "detail");
  const focused = detail && focus ? searchBm25(focus, index, 8) : [];
  // Conversational words such as "provide" need not match a README. Without
  // technical matches, expand the known project rather than lose its evidence.
  const broadExpansion = workflow || simple || (detail && !focused.length);
  const expanded = broadExpansion ? expansionSections(candidates, simple ? [] : history) : [];
  if (simple) {
    const priority = (chunk: EvidenceChunk) => /detection|workflow|matching|how.*works/i.test(chunk.heading) ? 0 : /reports?|outputs?|input formats?|match records/i.test(chunk.heading) ? 1 : 2;
    expanded.sort((a,b) => priority(a) - priority(b));
  }
  const ranked = asksForLimitations(question)
    ? [...candidates.filter(c => /limitations?|drawbacks?|caveats?|trade.?offs?|risks?/i.test(c.heading)), ...searchBm25(searchQuestion, index, 8).map(r => r.chunk)]
    : slugs.size > 1
    ? [...slugs].flatMap(slug => {
      const own = candidates.filter(c => c.projectSlug === slug);
      const hits = searchBm25(searchQuestion, createBm25Index(own), 2).map(r => r.chunk);
      return hits.length ? hits : expansionSections(own, history).slice(0, 2);
    })
    : broadExpansion ? expanded : (detail ? focused : searchBm25(searchQuestion, index, 8)).map(r => r.chunk);
  const unique = ranked.filter((chunk, i, all) => all.findIndex(c => fingerprint(c.text) === fingerprint(chunk.text)) === i).slice(0, slugs.size > 1 ? 2 * slugs.size : simple ? 2 : workflow ? 4 : broadExpansion ? 6 : 4);
  const extras = evidenceDocs(unique, approved);
  const docs: Doc[] = [];
  let used = 0;
  for (const doc of [...initial.docs, ...extras]) {
    if (used + doc.text.length > budget) continue;
    if (docs.some(d => d.id === doc.id)) continue;
    docs.push(doc); used += doc.text.length;
  }
  return { ...initial, docs, scores: docs.map(() => 30) };
}
