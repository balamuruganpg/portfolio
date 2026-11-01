import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base=process.argv[2]||"http://localhost:3000";
const results=[];
let history=[],historyOffset=0,memory;
async function ask(question){
  const response=await fetch(`${base}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json","x-forwarded-for":"recall-acceptance"},body:JSON.stringify({question,history,historyOffset,memory})});
  assert.equal(response.status,200);const result=await response.json();results.push({question,...result});
  history.push({role:"user",text:question},{role:"assistant",text:result.answer,citations:result.citations});
  if(history.length>12){history=history.slice(-12);historyOffset++;}if(result.memory)memory=result.memory;
  console.log(JSON.stringify({question,mode:result.mode,citations:result.citations?.map(c=>c.label),answer:result.mode==="conversation"?result.answer:undefined}));
  if(process.env.RECALL_RESULTS_FILE)await fs.writeFile(process.env.RECALL_RESULTS_FILE,JSON.stringify(results,null,2));return result;
}
function noProof(result){assert.deepEqual(result.citations,[]);assert.equal(result.actions?.length??0,0);assert.ok(!/not documented in the provided source/i.test(result.answer));}
function detection(result){assert.equal(result.mode,"llm");assert.match(result.answer,/four|4/i);for(const mode of [/exact/i,/(?:13|n).?gram/i,/fuzzy/i,/semantic/i])assert.match(result.answer,mode);assert.ok(result.citations.some(c=>c.label==="VeraScan"));}
const first="Which of his projects is published on PyPI?";
const published=await ask(first);assert.equal(published.mode,"llm");assert.ok(published.citations.some(c=>c.label==="VeraScan"));
detection(await ask("How many detection modes does it have, and what are they?"));
const recalled=await ask("What was the first thing I asked you in this conversation?");assert.equal(recalled.mode,"conversation");assert.ok(recalled.answer.includes(first));noProof(recalled);
console.log("PASS acceptance 1: exact first question recalled without portfolio evidence UI");
const food=await ask("What is his favourite food?");assert.equal(food.mode,"refused");noProof(food);
console.log("PASS acceptance 2: favourite food still refused without citations");
history=[];historyOffset=0;memory=undefined;
for(const q of [first,"How many detection modes does it have?","What is his CGPA?","Where is he based?","What degree is he studying?","What is his college?","What is his email?"])await ask(q);
assert.equal(history.length,12);assert.equal(historyOffset,1);
const expired=await ask("What was the first thing I asked you in this conversation?");assert.equal(expired.mode,"conversation");assert.match(expired.answer,/outside.*remember/i);noProof(expired);assert.ok(!expired.answer.includes(first));
console.log("PASS acceptance 3: first exchange expires after seven actual portfolio exchanges");
history=[];historyOffset=0;memory=undefined;
await ask("What is VeraScan?");detection(await ask("How many detection modes does it have?"));
console.log("PASS acceptance 4: standalone pronoun follow-up retains VeraScan and supported detection modes");
if(process.env.RECALL_RESULTS_FILE)await fs.writeFile(process.env.RECALL_RESULTS_FILE,JSON.stringify(results,null,2));
