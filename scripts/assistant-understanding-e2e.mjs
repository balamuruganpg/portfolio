import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
const delay = Number(process.env.CASE_DELAY_MS ?? 20_000);
const history = [];
let workflowWords;
async function ask(question, context = history, generated = true) {
  if (generated && delay) await new Promise(resolve => setTimeout(resolve, delay));
  const response = await fetch(base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "understanding-regression" }, body: JSON.stringify({ question, history: context }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  console.log(JSON.stringify({ question, mode: result.mode, provider: result.provider, model: result.model, answer: result.answer, sources: result.citations.map(c => c.label), suggestions: result.suggestions }));
  if (generated) {
    assert.equal(result.mode, "llm", "Expected Groq to compose the answer from retrieved evidence");
    assert.equal(result.provider, "Groq");
    assert.ok(result.citations.length);
    assert.ok(result.citations.every(c => c.href === "#p-verascan" || c.href.startsWith("https://github.com/balamuruganpg/verascan/") || c.href.startsWith("https://pypi.org/project/verascan/")));
    assert.doesNotMatch(result.answer, /\bSignal\b|explanation.{0,40}not documented/i);
    assert.ok(!result.suggestions.some(q => /limitations|drawbacks|weakness/i.test(q)));
  }
  context.push({ role: "user", text: question }, { role: "assistant", text: result.answer, citations: result.citations });
  return result;
}
const overview = await ask("What is VeraScan?");
assert.doesNotMatch(overview.answer, /limitations|drawbacks|shortcomings/i);
const workflow = await ask("How does VeraScan work?");
workflowWords = workflow.answer.split(/\s+/).length;
assert.ok(workflowWords >= 80);
assert.ok(workflow.citations.filter(c => c.href.includes("/blob/")).length >= 2);
assert.doesNotMatch(workflow.answer, /limitations|drawbacks|shortcomings/i);
const simple = await ask("I didnt understand your explanation");
assert.ok(simple.answer.split(/\s+/).length <= 130, "Clarification should be brief");
assert.doesNotMatch(simple.answer, /MinHash|FAISS|SHA.?256|cosine|13[ -](?:word|gram)|fuzzy|semantic/i);
assert.doesNotMatch(simple.answer, /limitations|drawbacks|shortcomings/i);
const limitations = await ask("What are VeraScan's limitations?");
assert.ok(limitations.citations.some(c => /Limitations/i.test(c.label)));
const info = await ask("What AI model you are?", [], false);
assert.equal(info.mode, "assistant-info"); assert.match(info.answer, /Groq/); assert.deepEqual(info.citations, []);
const clarification = await ask("I didnt understand your explanation", [], false);
assert.equal(clarification.mode, "clarification"); assert.deepEqual(clarification.citations, []);
console.log("PASS exact three-turn RAG + Groq conversation, requested limitations, truthful identity and context-free clarification");
