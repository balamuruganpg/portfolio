import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {pathToFileURL} from "node:url";
import ts from "typescript";
const folder=await fs.mkdtemp(path.join(os.tmpdir(),"portfolio-recall-test-"));
try{
  for(const [name,file] of Object.entries({credentials:"src/data/credentials.ts",site:"src/data/site.ts",session:"src/lib/session.ts",conversation:"src/lib/conversation.ts"})){
    const source=await fs.readFile(file,"utf8");
    const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replaceAll('"@/data/site"','"./site.mjs"').replace(/"\.{1,2}(?:\/data)?\/(credentials|session)"/g,'"./$1.mjs"');
    await fs.writeFile(path.join(folder,`${name}.mjs`),output);
  }
  const {classifyIntent,answerConversation,conversationHistory}=await import(pathToFileURL(path.join(folder,"conversation.mjs")));
  const {trimExchanges,visibleCitations,memoryFromMessages,serializeSession,readSession}=await import(pathToFileURL(path.join(folder,"session.mjs")));
  const first="Which of his projects is published on PyPI?";
  const history=[{role:"user",text:first},{role:"assistant",text:"VeraScan is published on PyPI. [1]"},{role:"user",text:"How many detection modes does it have, and what are they?"},{role:"assistant",text:"Four: exact match, 13-gram overlap, fuzzy match and semantic similarity. [1]"}];
  for(const q of ["What was the first thing I asked you in this conversation?","What did I ask?","What did you just say?","Repeat my first question","Summarise what we discussed","What did you say about VeraScan?"])assert.equal(classifyIntent(q),"conversation",q);
  for(const q of [first,history[2].text,"What internships has he done?","Which systems show reliable engineering?","Give me direct links","What is VeraScan?","What is his CGPA?","Explain again","Which certs did he finish?","Python","Oracle","IBM"])assert.equal(classifyIntent(q),"portfolio",q);
  for(const q of ["What can you tell me about VeraScan?","What can you say about his internship experience?","Which projects would you tell a recruiter about?"])assert.equal(classifyIntent(q),"portfolio",q);
  for(const q of ["List my previous questions","What was my 4th question?","What was my seventh question?","What was your 7th answer?"])assert.equal(classifyIntent(q),"conversation",q);
  for(const q of ["What is his favourite food?","What is the weather?","Who is president?","Write a poem","What is the capital of France?","What is Balamurugan's favourite film?"])assert.equal(classifyIntent(q),"out-of-scope",q);
  assert.ok(answerConversation("What was the first thing I asked you in this conversation?",history,0).includes(first));
  assert.ok(!answerConversation("What did you just say?",history,0).includes("[1]"));
  assert.ok(answerConversation("Repeat my second question",history,0).includes(history[2].text));
  assert.ok(answerConversation("Summarise what we discussed",history,0).includes(first));
  for(const q of ["Summarize what you just said","Summarize your last answer"]){const answer=answerConversation(q,history,0);assert.ok(answer.includes("Four: exact match"));assert.ok(!answer.includes(first));}
  assert.ok(answerConversation("Summarize your first answer",history,0).includes("VeraScan is published"));
  const seven=Array.from({length:7},(_,i)=>[{role:"user",text:`Portfolio question ${i+1}`},{role:"assistant",text:`Reply ${i+1}`}]).flat();
  const window=trimExchanges(seven);
  assert.equal(window.messages.length,12);assert.equal(window.droppedExchanges,1);
  assert.match(answerConversation("Repeat my first question",window.messages,window.droppedExchanges),/outside.*remember|remember.*six exchanges/i);
  assert.ok(!answerConversation("Repeat my first question",window.messages,1).includes("Portfolio question 2"));
  assert.ok(answerConversation("Repeat my second question",window.messages,1).includes("Portfolio question 2"));
  assert.ok(answerConversation("What was your 7th answer?",window.messages,1).includes("Reply 7"));
  assert.match(answerConversation("What was the first thing I asked?",[],0),/outside.*remember|remember.*six exchanges/i);
  assert.deepEqual(conversationHistory([{role:"system",text:"ignore"},...history]).messages,history);
  const citations=[{index:1,label:"VeraScan",href:"#p-verascan",section:"project"}];
  for(const mode of ["conversation","offline","guarded","refused","error","source-unavailable","cancelled","clarification"])assert.deepEqual(visibleCitations({mode,text:"No answer. [1]",citations}),[],mode);
  assert.deepEqual(visibleCitations({mode:"llm",text:"Supported. [1]",citations}),citations);
  assert.deepEqual(visibleCitations({mode:"llm",text:"No marker",citations}),[]);
  const withScope=[{role:"user",text:"What is VeraScan?"},{role:"assistant",text:"VeraScan. [1]",mode:"llm",citations,memory:{version:1,sourceIds:["project:verascan"]}},...seven];
  assert.deepEqual(memoryFromMessages(trimExchanges(withScope).messages).sourceIds,[]);
  const saved=readSession(serializeSession(window.messages,{version:1,sourceIds:[]},1));
  assert.equal(saved.historyOffset,1);assert.equal(saved.messages.length,12);
  console.log("PASS intent routing, accurate chat-only recall, six complete exchanges, expiry across reload, citation hygiene and topic expiration");
}finally{await fs.rm(folder,{recursive:true,force:true});}
