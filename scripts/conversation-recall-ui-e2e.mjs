import assert from "node:assert/strict";
import {chromium} from "playwright-core";
const base=process.argv[2]||"http://localhost:3000";
const browser=await chromium.launch({channel:"msedge",headless:true});
try{
  const context=await browser.newContext({viewport:{width:375,height:900},reducedMotion:"reduce"});
  const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base,{waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Portfolio assistant"});
  async function ask(question){
    const response=page.waitForResponse(r=>r.url().endsWith("/api/chat")&&r.request().method()==="POST",{timeout:30000});
    await dialog.getByRole("textbox",{name:"Ask the portfolio assistant"}).fill(question);
    await dialog.getByRole("button",{name:"Ask",exact:true}).click();
    const r=await response;assert.equal(r.status(),200);const data=await r.json();
    await page.waitForFunction(()=>!document.querySelector('[aria-label="Clear conversation"]')?.disabled);
    return data;
  }
  async function noProof(){const last=dialog.locator('[data-testid="assistant-answer"]').last();assert.equal(await last.locator('[data-testid="citations"], [data-citation], a').count(),0);assert.equal(await last.getByRole("button",{name:/browse/i}).count(),0);assert.ok(!/\bSOURCES\b/.test(await last.innerText()));}
  const first="Which of his projects is published on PyPI?";
  assert.equal((await ask(first)).mode,"llm");
  const modes=await ask("How many detection modes does it have, and what are they?");assert.equal(modes.mode,"llm");assert.ok(modes.citations.some(c=>c.label==="VeraScan"));
  const recall=await ask("What was the first thing I asked you in this conversation?");assert.equal(recall.mode,"conversation");assert.ok(recall.answer.includes(first));await noProof();
  console.log("PASS live browser: exact three-turn sequence quotes first question, zero source chips/links/browse actions");
  const food=await ask("What is his favourite food?");assert.equal(food.mode,"refused");await noProof();
  await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  assert.ok((await ask("Repeat my first question")).answer.includes(first));await noProof();
  if(process.env.RECALL_SCREENSHOT)await page.screenshot({path:process.env.RECALL_SCREENSHOT});
  await dialog.getByRole("button",{name:"Clear conversation"}).click();
  const citations=[{index:1,label:"VeraScan",href:"#p-verascan",section:"project"}];
  const fixture=async route=>{const {question}=route.request().postDataJSON();if(question.startsWith("Window check "))return route.fulfill({json:{answer:"VeraScan is published on PyPI. [1]",mode:"llm",citations,memory:{version:1,sourceIds:["project:verascan"]}}});return route.continue();};
  await page.route("**/api/chat",fixture);
  for(let i=1;i<=7;i++)await ask(`Window check ${i}: What is VeraScan?`);
  await page.unroute("**/api/chat",fixture);
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem("portfolio_assistant_session_v1")));
  assert.equal(saved.messages.length,12);assert.equal(saved.messages.filter(m=>m.role==="user").length,6);assert.equal(saved.messages.filter(m=>m.role==="assistant").length,6);assert.equal(saved.historyOffset,1);assert.ok(!saved.messages.some(m=>m.text.startsWith("Window check 1:")));
  const expired=await ask("What was the first thing I asked you in this conversation?");assert.equal(expired.mode,"conversation");assert.match(expired.answer,/outside.*remember/);await noProof();
  await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  assert.match((await ask("Repeat my first question")).answer,/outside.*remember/);await noProof();
  console.log("PASS browser window fixtures: client prunes seven exchanges to six, drops text, retains expiry across reload");
  for(const mode of ["offline","guarded","refused","conversation","source-unavailable"]){
    const handler=route=>route.fulfill({json:{answer:"Controlled citation-hygiene fixture. [1]",mode,citations,actions:[{type:"credentials",label:"Browse all 45 credentials",query:""}]}});
    await page.route("**/api/chat",handler);await ask("Check presentation");await noProof();await page.unroute("**/api/chat",handler);
  }
  console.log("PASS defensive rendering: non-portfolio/fallback DTOs with stray citations never show portfolio evidence or browse buttons");
  await dialog.getByRole("button",{name:"Clear conversation"}).click();
  const fresh=await ask("Repeat my first question");assert.equal(fresh.mode,"conversation");assert.match(fresh.answer,/outside.*remember/);await noProof();
  for(const width of [375,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  assert.deepEqual(errors,[]);console.log("PASS reset clears origin counter; no page errors or overflow at 375/768/1440");
}finally{await browser.close();}
