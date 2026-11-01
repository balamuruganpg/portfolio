// Owner-run ingestion only. Chat requests never fetch arbitrary web pages.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { loadRagRuntime } from "./rag-runtime.mjs";

const root = path.resolve("content/rag");
const snapshots = path.join(root, "snapshots");
const runtime = await loadRagRuntime();
const { projects, profile } = runtime.site;
const approved = runtime.corpus.buildSiteDocs();
const { buildEvidenceChunks } = runtime.core;
const generatedAt = new Date().toISOString();
const sources = [], chunks = [], excluded = [];
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
await fs.mkdir(snapshots, { recursive: true });

async function get(url, json = false) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !["api.github.com", "raw.githubusercontent.com", "pypi.org"].includes(parsed.hostname)) throw Error("Fetch host is not approved");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(12_000), headers: { "User-Agent": "balamuruganpg-portfolio-source-sync", Accept: json ? "application/json" : "text/plain" } });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > 2_000_000) throw Error("Source exceeds size budget");
  const text = await response.text();
  if (text.length > 2_000_000) throw Error("Source exceeds size budget");
  return json ? JSON.parse(text) : text;
}
async function store(source, text) {
  // Even example credentials in public READMEs are redacted before writing.
  const redactions = [...text.matchAll(/\b(?:gsk_|sk-or-|AIza)[a-z0-9_-]{12,}/gi)].length;
  text = text.replace(/\b(?:gsk_|sk-or-|AIza)[a-z0-9_-]{12,}/gi, "[REDACTED_CREDENTIAL]");
  const sha256 = hash(text);
  const file = `snapshots/${source.id.replace(/[^a-z0-9-]/gi, "_")}-${sha256.slice(0, 12)}.txt`;
  await fs.writeFile(path.join(root, file), text);
  const record = { ...source, sha256, fetchedAt: generatedAt, status: "indexed", file, ...(redactions ? { redactions } : {}) };
  const built = buildEvidenceChunks(record, text, approved);
  sources.push(record); chunks.push(...built.chunks); excluded.push(...built.excluded);
  console.log(`INDEXED ${source.title}: ${built.chunks.length} chunks, ${built.excluded.length} excluded sections`);
}
function unavailable(source, error) {
  const detail = error instanceof Error ? error.message : String(error);
  sources.push({ ...source, status: detail.includes("404") ? "missing" : "error", revision: "", sha256: "", fetchedAt: generatedAt, detail });
  console.log(`UNAVAILABLE ${source.title}: ${detail}`);
}

try {
  // Each listed repository is fetched at an immutable commit. The allowlist
  // comes from approved portfolio data, never from the visitor's question.
  const jobs = [...projects];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (jobs.length) {
      const project = jobs.shift();
      const match = project.repo.match(/^https:\/\/github\.com\/(balamuruganpg|axiom-sim2real)\/([a-z0-9_.-]+)$/i);
      if (!match) { unavailable({ id: project.slug, kind: "github", title: project.name, url: project.repo }, Error("Unapproved repository")); continue; }
      const [, owner, repo] = match;
      const base = { kind: "github", projectSlug: project.slug };
      try {
        const commits = await get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, true);
        const revision = commits[0]?.sha;
        if (!/^[a-f0-9]{40}$/.test(revision)) throw Error("Missing immutable revision");
        const tree = await get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${revision}?recursive=1`, true);
        const files = (tree.tree ?? []).filter(f => f.type === "blob" && (!f.size || f.size < 100_000));
        const readme = files.find(f => /^readme\.(md|rst|txt)$/i.test(f.path));
        const docs = files.filter(f => /^(?:docs\/|)(?:architecture|design|usage|quickstart|limitations|evaluation|axiom_audit_summary|programmed_primitives)[a-z0-9_-]*\.md$/i.test(f.path)).slice(0, 2);
        if (!readme) throw Error("No root README found");
        for (const file of [readme, ...docs]) {
          const encoded = file.path.split("/").map(encodeURIComponent).join("/");
          const source = { ...base, id: `github:${project.slug}:${file.path}`, title: `${project.name} · ${file.path}`, revision, url: `${project.repo}/blob/${revision}/${encoded}` };
          try { await store(source, await get(`https://raw.githubusercontent.com/${owner}/${repo}/${revision}/${encoded}`)); }
          catch (error) { unavailable(source, error); }
        }
      } catch (error) { unavailable({ ...base, id: `github:${project.slug}`, title: `${project.name} · README`, url: project.repo }, error); }
    }
  }));

  try {
    const data = await get("https://api.github.com/users/balamuruganpg", true);
    await store({ id: "github-profile", kind: "profile", title: "GitHub profile", url: profile.github, revision: generatedAt }, `# GitHub profile\nName: ${data.name || profile.name}\nAccount: ${data.login}\n${data.bio || ""}\nLocation: ${data.location || profile.location}\nWebsite: ${profile.site}`);
  } catch (error) { unavailable({ id: "github-profile", kind: "profile", title: "GitHub profile", url: profile.github }, error); }

  try {
    const data = await get("https://pypi.org/pypi/verascan/json", true);
    await store({ id: "pypi-verascan", kind: "pypi", title: "VeraScan · PyPI", projectSlug: "verascan", url: "https://pypi.org/project/verascan/", revision: data.info.version }, data.info.description);
  } catch (error) { unavailable({ id: "pypi-verascan", kind: "pypi", title: "VeraScan · PyPI", url: "https://pypi.org/project/verascan/" }, error); }

  // Python/pypdf is an existing authoring tool, not a runtime dependency.
  const pdf = path.resolve("public/Updated Resume/BALAMURUGAN_PG_NIT_CSE.pdf");
  try {
    const pages = JSON.parse(execFileSync("python", ["-c", "import json,sys; from pypdf import PdfReader; print(json.dumps([p.extract_text() for p in PdfReader(sys.argv[1]).pages],ensure_ascii=True))", pdf], { encoding: "utf8", maxBuffer: 2_000_000 }));
    const revision = hash(await fs.readFile(pdf));
    let keep = false;
    for (let i = 0; i < pages.length; i++) {
      const selected = [];
      for (const line of pages[i].split("\n")) {
        if (/^(Career Objective|Educational Qualification|Skills|Projects|Experience|Certifications|Achievements|Personal Information|Declaration)\s*$/.test(line.trim())) {
          keep = /^(Career Objective|Skills|Experience)$/.test(line.trim());
          if (keep) selected.push(`## ${line.trim()}`);
        } else if (keep) selected.push(line);
      }
      if (selected.join("\n").trim()) await store({ id: `resume-page-${i + 1}`, kind: "resume", title: `Resume · page ${i + 1}`, url: `${profile.site}${profile.resume}#page=${i + 1}`, revision }, selected.join("\n"));
    }
  } catch (error) { unavailable({ id: "resume-pdf", kind: "resume", title: "Resume PDF", url: `${profile.site}${profile.resume}` }, error); }

  // Only an owner-supplied export can fill an access-blocked LinkedIn source.
  // Never substitute similarly named accounts or crawl an authenticated site.
  const linkedin = path.join(root, "imports", "linkedin.json");
  try {
    const data = JSON.parse(await fs.readFile(linkedin, "utf8"));
    if (data.url !== profile.linkedin || typeof data.text !== "string" || !data.exportedAt) throw Error("LinkedIn export must identify the exact profile and export date");
    await store({ id: "linkedin-owner-export", kind: "linkedin", title: "LinkedIn · owner export", url: profile.linkedin, revision: data.exportedAt }, data.text);
  } catch (error) {
    sources.push({ id: "linkedin-profile", kind: "linkedin", title: "LinkedIn profile", url: profile.linkedin, revision: "", sha256: "", fetchedAt: generatedAt, status: "blocked", detail: "Exact public profile returned HTTP 999 during audit. No profile facts inferred. Optional owner export not present or invalid." });
    console.log("BLOCKED LinkedIn: no verified profile content indexed");
  }

  sources.sort((a, b) => a.id.localeCompare(b.id)); chunks.sort((a, b) => a.id.localeCompare(b.id));
  const index = { schemaVersion: 1, generatedAt, sources, chunks, excluded };
  await fs.writeFile(path.join(root, "index.json.tmp"), JSON.stringify(index, null, 2) + "\n");
  await fs.rename(path.join(root, "index.json.tmp"), path.join(root, "index.json"));
  console.log(`RAG snapshot: ${sources.filter(s => s.status === "indexed").length}/${sources.length} sources indexed; ${chunks.length} chunks; ${excluded.length} excluded sections.`);
} finally { await runtime.close(); }
