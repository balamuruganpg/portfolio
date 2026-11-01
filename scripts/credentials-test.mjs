import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const folder = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-credentials-test-"));
try {
  const source = await fs.readFile("src/data/credentials.ts", "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const file = path.join(folder, "credentials.mjs");
  await fs.writeFile(file, output);
  const { completedCredentials, inProgressCredentials } = await import(pathToFileURL(file));
  assert.equal(completedCredentials.length, 45);
  assert.equal(new Set(completedCredentials.map(c => c.id)).size, 45);
  assert.equal(new Set(completedCredentials.map(c => c.sha256)).size, 45);
  assert.equal(completedCredentials.filter(c => c.featured).length, 12);
  assert.equal(completedCredentials.flatMap(c => c.sourceFiles).length, 47);
  assert.equal(completedCredentials.filter(c => c.sourceFiles.length === 2).length, 2);
  const allowed = new Set(["coursera.org", "verify.masaischool.com", "nptel.ac.in", "digitalskills.iitmpravartak.org.in"]);
  const hash = data => crypto.createHash("sha256").update(data).digest("hex");
  for (const c of completedCredentials) {
    assert.ok(c.title && c.issuer && c.kind && c.dateLabel && c.sourceFiles.length);
    assert.match(c.file, /^\/credentials\/[a-z0-9-]+\.(pdf|png)$/);
    assert.equal(hash(await fs.readFile(path.join("public", c.file))), c.sha256, `${c.title}: public proof bytes`);
    for (const original of c.sourceFiles) assert.equal(hash(await fs.readFile(original)), c.sha256, `${c.title}: original bytes`);
    if (c.verificationUrl) {
      const url = new URL(c.verificationUrl);
      assert.equal(url.protocol, "https:"); assert.ok(allowed.has(url.hostname));
    }
    assert.ok(c.credentialId || c.verificationUrl, `${c.title}: needs a real ID or verification link`);
    if (c.parentId) assert.ok(completedCredentials.some(p => p.id === c.parentId && p.kind === "Professional certificate"));
  }
  assert.equal(completedCredentials.find(c => c.id === "oci-data-science-2025").credentialId, "102569553OCI25DSOCP");
  assert.equal(completedCredentials.find(c => c.id === "ibm-data-science").verificationUrl, "https://coursera.org/verify/professional-cert/47733K92TZFX");
  assert.equal(completedCredentials.find(c => c.id === "generative-ai-leader").kind, "Professional certificate");
  assert.equal(completedCredentials.find(c => c.id === "ai-for-everyone").title, "AI For Everyone");
  assert.ok(!completedCredentials.some(c => /deep learning specialization|tableau/i.test(c.title)));
  assert.equal(inProgressCredentials.length, 1);
  assert.equal(inProgressCredentials[0].title, "Deep Learning Specialization");
  assert.equal(inProgressCredentials[0].status, "In progress");
  assert.ok(!inProgressCredentials[0].credentialId && !inProgressCredentials[0].verificationUrl);
  console.log("PASS 45 unique completed credentials; 47 original documents; 12 highlights; all proof hashes/IDs/URLs match");
  console.log("PASS in-progress Deep Learning stays outside the completed count; duplicate PDFs counted once");
} finally { await fs.rm(folder, { recursive: true, force: true }); }
