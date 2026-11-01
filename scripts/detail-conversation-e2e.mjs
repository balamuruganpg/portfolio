import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
const history = [];
let previousSources = new Set();
for (const question of ["Tell me more about VeraScan", "I said more details"]) {
  const response = await fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "detail-conversation-regression" }, body: JSON.stringify({ question, history }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.mode, "llm", `${question}: expected a verified model answer, got ${result.mode}`);
  assert.equal(result.provider, "Groq");
  assert.ok(result.model?.startsWith("openai/gpt-oss-"));
  const words = result.answer.split(/\s+/).length;
  assert.ok(words >= 120, `expected substantive detail, got ${words} words`);
  const external = result.citations.filter(c => c.href.startsWith("https://github.com/balamuruganpg/verascan/blob/"));
  assert.ok(external.length >= 2, "expected citations to distinct implementation sections");
  if (history.length) assert.ok(external.some(c => !previousSources.has(c.href)), "follow-up must use new evidence rather than repeating every cited section");
  previousSources = new Set(external.map(c => c.href));
  console.log(`PASS ${JSON.stringify({question,provider:result.provider,model:result.model,mode:result.mode,words,generationMs:result.generationMs,sources:external.map(c=>c.label)})}`);
  console.log(result.answer);
  history.push({role:"user",text:question},{role:"assistant",text:result.answer,citations:result.citations});
}
console.log("2/2 exact conversation turns passed with live Groq generation and new source evidence");
