import fs from "node:fs/promises";
import path from "node:path";
import { profile, projects } from "@/data/site";
import type { EvidenceIndex } from "./core";

type Loaded = EvidenceIndex & { state: "ready" | "missing" | "invalid" };
let cached: { mtime: number; value: Loaded } | null = null;
const empty = (state: Loaded["state"]): Loaded => ({ schemaVersion: 1, generatedAt: "", sources: [], chunks: [], excluded: [], state });

function allowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (url === profile.github || url === profile.linkedin || url === "https://pypi.org/project/verascan/") return true;
    if (url.startsWith(`${profile.site}${profile.resume}#page=`)) return /^\d+$/.test(url.split("#page=")[1]);
    return projects.some(p => url.startsWith(`${p.repo}/blob/`) && /^[a-f0-9]{40}\//.test(url.slice(`${p.repo}/blob/`.length)));
  } catch { return false; }
}

/** Only local, owner-synchronized snapshots are read. No request-time crawling. */
export async function loadRagEvidence(): Promise<Loaded> {
  const file = path.join(process.cwd(), "content", "rag", "index.json");
  try {
    const stat = await fs.stat(file);
    if (cached?.mtime === stat.mtimeMs) return cached.value;
    if (stat.size > 4_000_000) return empty("invalid");
    const data = JSON.parse(await fs.readFile(file, "utf8")) as EvidenceIndex;
    if (data.schemaVersion !== 1 || !Array.isArray(data.sources) || !Array.isArray(data.chunks)) return empty("invalid");
    const sources = data.sources.filter(s => s && typeof s.url === "string" && allowedUrl(s.url) && typeof s.id === "string");
    const indexed = new Map(sources.filter(s => s.status === "indexed" && /^[a-f0-9]{64}$/.test(s.sha256)).map(s => [s.id, s]));
    const chunks = data.chunks.filter(c => {
      const source = indexed.get(c.sourceId);
      return source && typeof c.text === "string" && c.text.length <= 1800 && typeof c.href === "string" && (c.href === source.url || c.href.startsWith(`${source.url}#`)) && c.revision === source.revision && c.sourceUrl === source.url;
    });
    const value: Loaded = { ...data, sources, chunks, state: "ready" };
    cached = { mtime: stat.mtimeMs, value };
    return value;
  } catch { return empty("missing"); }
}

export function knowledgeStatus(data: Loaded) {
  const sources = data.sources.filter(s => s.status === "indexed");
  return {
    state: data.state,
    retrieval: "BM25",
    sourceCount: sources.length,
    repositoryCount: new Set(sources.filter(s => s.kind === "github").map(s => s.projectSlug)).size,
    chunkCount: data.chunks.length,
    updatedAt: data.generatedAt || null,
    kinds: [...new Set(sources.map(s => s.kind))],
    unavailable: data.sources.filter(s => s.status !== "indexed").map(s => ({ title: s.title, url: s.url, status: s.status })),
  };
}
