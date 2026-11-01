import type { Doc } from "../corpus";
import { unsupportedNumbers } from "../retrieve";

export interface EvidenceSource {
  id: string;
  kind: "github" | "resume" | "pypi" | "profile" | "linkedin";
  title: string;
  url: string;
  projectSlug?: string;
  revision: string;
  sha256: string;
  fetchedAt: string;
  status: "indexed" | "blocked" | "missing" | "error";
  file?: string;
  detail?: string;
  redactions?: number;
}
export interface EvidenceChunk {
  id: string;
  sourceId: string;
  title: string;
  heading: string;
  text: string;
  href: string;
  projectSlug?: string;
  kind: EvidenceSource["kind"];
  revision: string;
  fetchedAt: string;
  sourceUrl: string;
}
export interface EvidenceIndex {
  schemaVersion: 1;
  generatedAt: string;
  sources: EvidenceSource[];
  chunks: EvidenceChunk[];
  excluded: { sourceId: string; heading: string; reason: string }[];
}

const INJECTION = /ignore\s+(?:(?:all|any|the|previous|earlier|above)\s+)*(?:instructions|rules|system)|(?:reveal|print|expose|show|output)\b.{0,45}\b(?:system prompt|api.?key|credentials|secrets?|\.env)|\b(?:gsk_|sk-or-|AIza)[a-z0-9_-]{12,}|REDACTED_CREDENTIAL|\[INST\]|<\|(?:system|im_start)\|>/i;
export function isBlockedQuestion(question: string): boolean {
  const text = question.normalize("NFKC").replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, "");
  // In this portfolio, unqualified credentials means educational proof. Keep
  // the stricter source-text quarantine unchanged and protect private access.
  const privateContext = /\b(?:private|hidden|secret|server|system|api|access|login|auth|authentication|authorization|passwords?|tokens?|keys?|database|environment|configuration)\b|\.env|process\.env/i.test(text);
  const policyText = privateContext ? text : text.replace(/\bcredentials\b/gi, "certificates");
  return INJECTION.test(policyText) || /\b(?:fetch|browse|open|visit|request|curl)\b.{0,45}https?:\/\//i.test(text) || /\b(?:process\.env|GROQ_API_KEY(?:_2)?|GEMINI_API_KEY|OPENROUTER_API_KEY)\b/i.test(text);
}

function cleanMarkdown(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/```[^\n]*\n/g, "\n").replace(/```/g, "")
    .replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
export function buildEvidenceChunks(source: EvidenceSource, raw: string, approved: Doc[]) {
  const chunks: EvidenceChunk[] = [], excluded: EvidenceIndex["excluded"] = [];
  const authority = approved.find(d => d.project?.slug === source.projectSlug)?.text;
  let heading = "Overview", lines: string[] = [];
  let headingLine = 1;
  const originalHeadings = new Map<string, number[]>();
  raw.split(/\r?\n/).forEach((line, i) => {
    const match = cleanMarkdown(line).match(/^#{1,6}\s+(.+)/);
    if (!match) return;
    const key = match[1].replace(/[*`]/g, "").trim();
    originalHeadings.set(key, [...(originalHeadings.get(key) ?? []), i + 1]);
  });
  const flush = () => {
    const text = lines.join("\n").trim(); lines = [];
    if (text.length < 25) return;
    if (INJECTION.test(text)) { excluded.push({ sourceId: source.id, heading, reason: "instruction-or-credential-content" }); return; }
    if (/^(?:license|contributing|contributors|badges|acknowledgments|acknowledgements)$/i.test(heading)) return;
    if (authority && /accuracy|savings|regret|\btests\b|accepted|performance|results|benchmark/i.test(`${heading}\n${text}`) && unsupportedNumbers(text, authority).length) {
      excluded.push({ sourceId: source.id, heading, reason: "numbers-outside-approved-project-evidence" }); return;
    }
    // Keep chunks and their overlap bounded, retaining the heading on each.
    for (let start = 0; start < text.length; start += 1400) {
      let end = Math.min(start + 1580, text.length);
      if (end < text.length) { const boundary = text.lastIndexOf(" ", end); if (boundary > start + 1200) end = boundary; }
      const body = text.slice(start, end).trim();
      chunks.push({ id: `${source.id}:${chunks.length}`, sourceId: source.id, title: `${source.title} · ${heading}`.slice(0, 130), heading, text: `${heading}\n${body}`, href: source.url + (source.kind === "github" ? `#L${headingLine}` : ""), projectSlug: source.projectSlug, kind: source.kind, revision: source.revision, fetchedAt: source.fetchedAt, sourceUrl: source.url });
      if (end === text.length) break;
    }
  };
  for (const line of cleanMarkdown(raw).split("\n")) {
    const match = line.match(/^#{1,6}\s+(.+)/);
    if (match) { flush(); heading = match[1].replace(/[*`]/g, "").trim(); headingLine = originalHeadings.get(heading)?.shift() ?? 1; }
    else lines.push(line);
  }
  flush();
  return { chunks, excluded };
}

const STOP = new Set("a an the and or is are of to for in on with what how does do it its his he she they them this that which can tell me about use using explain works work project projects balamurugan pg".split(" "));
const EXPAND: Record<string, string[]> = { installation: ["install", "pip"], splitting: ["split", "purify", "purification"], split: ["splitting", "purify"], architecture: ["pipeline", "design", "flow"], limitations: ["limitation", "caveat", "risk"], contamination: ["leakage", "overlap"], leak: ["leakage", "contamination"], deployment: ["deploy", "hosting"] };
function words(text: string): string[] { return text.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(t => t.length > 1 && !STOP.has(t)); }
export function createBm25Index(chunks: EvidenceChunk[]) {
  const rows = chunks.map(chunk => { const tokens = words(`${chunk.heading} ${chunk.heading} ${chunk.text}`); const frequencies: Record<string, number> = {}; for (const token of tokens) frequencies[token] = (frequencies[token] ?? 0) + 1; return { chunk, length: tokens.length, frequencies }; });
  const df: Record<string, number> = {};
  for (const row of rows) for (const term of Object.keys(row.frequencies)) df[term] = (df[term] ?? 0) + 1;
  return { rows, df, average: rows.reduce((n, r) => n + r.length, 0) / Math.max(1, rows.length) };
}
export function searchBm25(question: string, index: ReturnType<typeof createBm25Index>, limit = 4) {
  const original = words(question);
  const terms = [...new Set(original.flatMap(t => [t, ...(EXPAND[t] ?? [])]))];
  return index.rows.map(row => {
    let score = 0, matched = 0;
    for (const term of terms) {
      const tf = row.frequencies[term] ?? 0;
      if (!tf) continue;
      if (original.includes(term)) matched++;
      const df = index.df[term] ?? 0;
      const idf = Math.log(1 + (index.rows.length - df + 0.5) / (df + 0.5));
      score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * row.length / Math.max(1, index.average)));
    }
    return { chunk: row.chunk, score, matched };
  }).filter(r => r.score > 0.3 && r.matched > 0).sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)).slice(0, limit);
}
