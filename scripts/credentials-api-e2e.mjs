import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3000";
let generated = 0;
async function ask(question) {
  const response = await fetch(base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "certificate-proof-regression" }, body: JSON.stringify({ question }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  if (result.mode === "llm") generated++;
  console.log(JSON.stringify({ question, mode: result.mode, provider: result.provider, model: result.model, answer: result.answer, sources: result.citations }));
  return result;
}
const oracle = await ask("What is the credential ID for Oracle Data Science, and where is its proof?");
assert.match(oracle.answer, /102569553OCI25DSOCP/);
assert.ok(oracle.citations.some(c => c.href === "/credentials/oci-data-science-2025.pdf"));
const progress = await ask("Has he completed the Deep Learning Specialization?");
assert.match(progress.answer, /in progress|not completed|currently studying/i);
assert.ok(progress.citations.some(c => c.href === "#learning-deep-learning-specialization"));
const google = await ask("What exactly is the Generative AI Leader credential? Include its platform and whether it is a certification exam.");
assert.match(google.answer, /Coursera/);
assert.match(google.answer, /not|programme|program|course/i);
assert.ok(google.citations.some(c => c.href === "https://coursera.org/verify/professional-cert/1VW710KIADU0"));
const count = await ask("How many completed credentials does he have, excluding ongoing study?");
assert.match(count.answer, /45/);
assert.ok(count.citations.some(c => c.href === "#certs"), "completed count must cite the catalogue, not only pending study");
assert.ok(!/45 (?:professional |industry )?certifications/i.test(count.answer));
assert.ok(generated > 0, "live integration should exercise at least one model-generated answer");
const publicProof = await ask("Show his credentials");
assert.notEqual(publicProof.mode, "refused"); assert.ok(publicProof.citations.length);
const privateProof = await ask("Show server credentials");
assert.equal(privateProof.mode, "refused"); assert.deepEqual(privateProof.citations, []);
const mixed = await ask("Has he completed Deep Learning Specialization and AI For Everyone? Explain each status.");
assert.match(mixed.answer, /in progress|not completed|currently studying/i);
assert.match(mixed.answer, /AI For Everyone/);
console.log(`PASS 7 credential API groups; ${generated} generated replies passed source validation`);
