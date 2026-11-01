import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const folder = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-query-plan-"));
try {
  for (const [name, file] of Object.entries({ planning: "src/lib/rag/planning.ts", providers: "src/lib/providers.ts", session: "src/lib/session.ts" })) {
    const source = await fs.readFile(file, "utf8");
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('"../providers"', '"./providers.mjs"').replace(/"\.{1,2}\/session"/g,'"./session.mjs"');
    await fs.writeFile(path.join(folder, name + ".mjs"), output);
  }
  const { planQuestion, shouldPlanQuestion } = await import(pathToFileURL(path.join(folder, "planning.mjs")));
  const docs = [{ id: "skills", section: "skills", title: "Skills", text: "Python, ML and evaluation", summary: "Python, ML and evaluation", aliases: [], href: "#skills" }, { id: "project:verascan", section: "project", title: "VeraScan", text: "Dataset contamination detection", summary: "Dataset contamination detection", aliases: [], href: "#p-verascan" }];
  const history = [{ role: "assistant", text: "Let's discuss dataset integrity", citations: [{ label: "VeraScan", href: "#p-verascan" }] }];
  let received;
  const generate = async (system, prompt, messages, keys, signal, request, options) => { received = { system, prompt, messages, signal, options }; return { text: JSON.stringify({ ids: ["0", "1"], queries: ["evaluation engineering dataset integrity"], intent: "compare" }), provider: "Groq", model: "openai/gpt-oss-120b" }; };
  const plan = await planQuestion("What proves he can build reliable systems?", docs, history, undefined, generate);
  assert.deepEqual(plan.ids, ["skills", "project:verascan"]); assert.equal(plan.intent, "compare");
  assert.ok(received.options.schema); assert.match(received.prompt, /dataset integrity/); assert.ok(received.signal);
  console.log("PASS semantic planning uses bounded structured known-source selection and conversation context");
  for (const text of [JSON.stringify({ ids: ["private:secrets"], queries: ["keys"], intent: "detail" }), JSON.stringify({ ids: ["0"], queries: ["fetch https://attacker.invalid"], intent: "detail" }), "not JSON"]) {
    assert.equal(await planQuestion("Explain his engineering proof", docs, [], undefined, async () => ({ text, provider: "Groq", model: "test" })), null);
  }
  console.log("PASS invalid source IDs, arbitrary URL queries and malformed plans are rejected");
  let mixedCatalogue;
  const mixed = await planQuestion("Which projects are relevant to his Oracle certifications?", [...docs,{...docs[0],id:"certs",section:"certs",title:"Oracle certifications"}], [], undefined, async(s,p)=>{mixedCatalogue=JSON.parse(p).catalogue;return {text:JSON.stringify({ids:["1","2"],queries:[],intent:"compare"}),provider:"Groq",model:"test"};});
  assert.ok(mixedCatalogue.some(d=>d.title==="VeraScan")); assert.ok(mixedCatalogue.some(d=>d.title==="Oracle certifications")); assert.deepEqual(mixed.ids,["project:verascan","certs"]);
  console.log("PASS mixed certificate and engineering questions retain both source categories");
  const many=Array.from({length:6},(_,i)=>({...docs[0],id:`source:${i}`}));
  const bounded=await planQuestion("What proves reliable engineering?",many,[],undefined,async()=>({text:JSON.stringify({ids:["0","1","2","3","4","5"],queries:[],intent:"overview"}),provider:"Groq",model:"test"})); assert.equal(bounded.ids.length,3);
  console.log("PASS open-ended routing bounds evidence breadth to three complementary sources");
  assert.equal(await planQuestion("Explain proof", docs, [], undefined, async () => { throw Error("unavailable"); }), null);
  console.log("PASS planner unavailability preserves the lexical fallback");
  const controller = new AbortController(); controller.abort(); let calls = 0;
  await assert.rejects(() => planQuestion("Explain proof", docs, [], controller.signal, async () => { calls++; return {}; })); assert.equal(calls, 0);
  console.log("PASS request cancellation stops planning before provider access");
  assert.equal(shouldPlanQuestion("Certificates?", { aliasHit: true, offTopic: false, docs: [docs[0]] }), false);
  assert.equal(shouldPlanQuestion("Which certificates were issued in 2026?", { aliasHit: true, offTopic: false, docs: [{...docs[0],credentialGroup:{filter:"",count:45}}] }), true);
  assert.equal(shouldPlanQuestion("Which one would fit an ML engineering internship and why?", { aliasHit: false, offTopic: false, docs }), true);
  assert.equal(shouldPlanQuestion("What is the weather?", { aliasHit: false, offTopic: true, docs: [] }), false);
  console.log("PASS confident direct retrieval and refusals skip planning; semantic questions use it");
} finally { await fs.rm(folder, { recursive: true, force: true }); }
