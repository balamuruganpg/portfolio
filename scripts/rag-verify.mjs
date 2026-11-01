import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { loadRagRuntime } from "./rag-runtime.mjs";

const root = path.resolve("content/rag");
const index = JSON.parse(await fs.readFile(path.join(root,"index.json"),"utf8"));
const runtime = await loadRagRuntime();
try {
  const rebuilt = [];
  const excluded = [];
  for(const source of index.sources.filter(s=>s.status==="indexed")) {
    const file=path.resolve(root,source.file);
    assert.ok(file.startsWith(root+path.sep),"snapshot path escapes RAG directory");
    const text=await fs.readFile(file,"utf8");
    assert.ok(!/\b(?:gsk_|sk-or-|AIza)[a-z0-9_-]{12,}/i.test(text),`${source.id}: credential-shaped content must be redacted before storage`);
    assert.equal(crypto.createHash("sha256").update(text).digest("hex"),source.sha256,`${source.id} snapshot hash mismatch`);
    const built = runtime.core.buildEvidenceChunks(source,text,runtime.corpus.buildSiteDocs());
    rebuilt.push(...built.chunks); excluded.push(...built.excluded);
  }
  rebuilt.sort((a,b)=>a.id.localeCompare(b.id));
  if(process.argv.includes("--rebuild")) { index.chunks=rebuilt;index.excluded=excluded;await fs.writeFile(path.join(root,"index.json"),JSON.stringify(index,null,2)+"\n"); }
  assert.equal(crypto.createHash("sha256").update(JSON.stringify(rebuilt)).digest("hex"),crypto.createHash("sha256").update(JSON.stringify(index.chunks)).digest("hex"),"index differs from deterministic source rebuild");
  assert.equal(new Set(index.chunks.map(c=>c.id)).size,index.chunks.length,"duplicate chunk IDs");
  const repositories=new Set(index.sources.filter(s=>s.status==="indexed"&&s.kind==="github").map(s=>s.projectSlug));
  assert.equal(repositories.size,runtime.site.projects.length,"not every portfolio repository was indexed");
  console.log(`PASS ${index.sources.filter(s=>s.status==='indexed').length} source hashes, ${repositories.size} repositories, ${index.chunks.length} reproducible chunks`);
  console.log(`Excluded sections: ${index.excluded.length}. Unavailable: ${index.sources.filter(s=>s.status!=='indexed').map(s=>s.title+': '+s.status).join(', ')||'none'}`);
} finally { await runtime.close(); }
