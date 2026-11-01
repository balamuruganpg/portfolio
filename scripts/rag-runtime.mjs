import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export async function loadRagRuntime() {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-rag-sync-"));
  const paths = { site: "src/data/site.ts", corpus: "src/lib/corpus.ts", retrieve: "src/lib/retrieve.ts", core: "src/lib/rag/core.ts" };
  try {
    for (const [name, file] of Object.entries(paths)) {
      const source = await fs.readFile(file, "utf8");
      const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
        .replaceAll('"@/data/site"', '"./site.mjs"').replace(/"\.{1,2}\/(corpus|retrieve|core)"/g, '"./$1.mjs"');
      await fs.writeFile(path.join(folder, `${name}.mjs`), output);
    }
    return {
      site: await import(pathToFileURL(path.join(folder, "site.mjs"))),
      corpus: await import(pathToFileURL(path.join(folder, "corpus.mjs"))),
      core: await import(pathToFileURL(path.join(folder, "core.mjs"))),
      close: () => fs.rm(folder, { recursive: true, force: true }),
    };
  } catch (error) { await fs.rm(folder, { recursive: true, force: true }); throw error; }
}
