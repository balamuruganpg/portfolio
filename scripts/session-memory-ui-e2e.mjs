import assert from "node:assert/strict";
import {chromium} from "playwright-core";

const base=process.argv[2]||"http://localhost:3000";
const browser=await chromium.launch({channel:"msedge",headless:true});
try {
  const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(base,{waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Portfolio assistant"});
  async function ask(question){
    const response=page.waitForResponse(r=>r.url().endsWith("/api/chat")&&r.request().method()==="POST",{timeout:25000});
    await page.getByRole("textbox",{name:"Ask the portfolio assistant"}).fill(question);
    await dialog.getByRole("button",{name:"Ask",exact:true}).click();
    const data=await (await response).json();
    assert.equal(data.mode,"llm");assert.equal(data.provider,"Groq");
    await page.getByRole("button",{name:"Clear conversation"}).waitFor();
    await page.waitForFunction(()=>!document.querySelector('[aria-label="Clear conversation"]')?.disabled);
    return data;
  }
  const first=await ask("Which projects are live?");
  assert.equal(first.memory.sourceIds.length,5);
  await dialog.getByRole("button",{name:"Close assistant"}).click();
  await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  assert.ok((await dialog.innerText()).includes("Which projects are live?"));
  await page.reload({waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  assert.ok((await dialog.innerText()).includes("Which projects are live?"));
  const second=await ask("Give me direct links");
  const destinations=["https://medrag.in","https://pneumonia-scan.streamlit.app/","https://churn-guard-dash.streamlit.app/","https://oncoinsight-pro-cancer-analytics.streamlit.app/","https://cloud-sla-monitoring-system.streamlit.app/"];
  for(const url of destinations){
    assert.ok(second.answer.includes(url.replace(/\/$/,"")));
    const link=dialog.locator(`a[href="${url}"],a[href="${url.replace(/\/$/,"")}"]`).first();
    assert.ok(await link.count(),`Missing clickable ${url}`);
    assert.equal(await link.getAttribute("target"),"_blank");
  }
  assert.deepEqual(second.memory.sourceIds,first.memory.sourceIds);
  console.log("PASS mobile: actual Groq+RAG list -> close/reopen -> reload -> all five clickable direct links");
  for(const width of [375,768,1440]){
    await page.setViewportSize({width,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
    const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);
  }
  const isolated=await context.newPage();await isolated.goto(base,{waitUntil:"networkidle"});
  assert.equal(await isolated.evaluate(()=>sessionStorage.getItem("portfolio_assistant_session_v1")),null);
  await isolated.close();
  await dialog.getByRole("button",{name:"Clear conversation"}).click();
  assert.ok((await dialog.innerText()).includes("What would you like to explore?"));
  assert.equal(await page.evaluate(()=>sessionStorage.getItem("portfolio_assistant_session_v1")),null);
  await page.reload({waitUntil:"networkidle"});
  await page.getByRole("button",{name:"Open portfolio assistant",exact:true}).click();
  assert.ok((await dialog.innerText()).includes("What would you like to explore?"));
  assert.deepEqual(errors,[]);
  console.log("PASS reset stays cleared after reload; fresh tab has no shared memory; 375/768/1440 fit without page errors");
} finally {await browser.close();}
