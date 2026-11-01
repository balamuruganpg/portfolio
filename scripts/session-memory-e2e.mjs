import assert from "node:assert/strict";

const base=process.argv[2]||"http://localhost:3000";
const expected=["https://medrag.in","https://pneumonia-scan.streamlit.app/","https://churn-guard-dash.streamlit.app/","https://oncoinsight-pro-cancer-analytics.streamlit.app/","https://cloud-sla-monitoring-system.streamlit.app/","https://balamuruganpg.xyz/"];
const history=[];
let memory;
async function ask(question,prior=history,scope=memory){
  const response=await fetch(`${base}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,history:prior,memory:scope})});
  assert.equal(response.status,200);
  const result=await response.json();
  console.log(JSON.stringify({question,mode:result.mode,provider:result.provider,model:result.model,memory:result.memory,answer:result.answer}));
  return result;
}
function generated(result){assert.equal(result.mode,"llm");assert.equal(result.provider,"Groq");}
function allLinks(result){
  generated(result);
  for(const url of expected)assert.ok(result.answer.includes(url.replace(/\/$/,"")),`Missing ${url}`);
  assert.equal(result.memory.sourceIds.length,expected.length);
  assert.ok(!/only documented project/i.test(result.answer));
}
const first=await ask("Which projects are live?");generated(first);
for(const name of ["LungScan AI","PneumoScan","ChurnGuard Pro","OncoInsight Pro","Signal","Luxury Car Dealership"])assert.ok(first.answer.includes(name),`Missing live project ${name}`);
memory=first.memory;
assert.equal(memory.sourceIds.length,expected.length);
history.push({role:"user",text:"Which projects are live?"},{role:"assistant",text:first.answer,citations:first.citations});
allLinks(await ask("Give me direct links"));
console.log("PASS exact two-turn conversation returns all six actual app URLs");
allLinks(await ask("Links please",[],memory));
console.log("PASS session topic memory works without recent messages");
const changed=await ask("What is VeraScan?",[],memory);generated(changed);
assert.deepEqual(changed.memory.sourceIds,["project:verascan"]);
assert.ok(!/LungScan|ChurnGuard|OncoInsight/.test(changed.answer));
const repo=await ask("Give me its GitHub link",[],changed.memory);generated(repo);
assert.ok(repo.answer.includes("https://github.com/balamuruganpg/verascan"));
const fresh=await ask("Give me direct links",[],{version:1,sourceIds:[]});
assert.equal(fresh.mode,"clarification");assert.equal(fresh.citations.length,0);
const forged=await ask("Give me direct links",[],{version:1,sourceIds:["made-up-project","https://evil.test"]});
assert.equal(forged.mode,"clarification");
const contact=await ask("Show his LinkedIn profile",[],memory);
assert.deepEqual(contact.memory.sourceIds,["contact"]);
const contactLinks=await ask("Give me direct links",[],contact.memory);generated(contactLinks);
assert.ok(contactLinks.answer.includes("https://www.linkedin.com/in/balamuruganpg"));
assert.ok(!/medrag|pneumonia-scan|churn-guard-dash/.test(contactLinks.answer));
console.log("PASS topic switching and fresh/forged memory cannot return arbitrary projects");
