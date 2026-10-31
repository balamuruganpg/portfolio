import assert from "node:assert/strict";
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
let checks = 0;
const pass = name => { checks++; console.log(`PASS ${name}`); };
try {
  for (const colorScheme of ["dark", "light"]) {
    for (const width of [375, 768, 1440]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 950 });
      await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
      assert.ok((await page.locator('#top').innerText()).includes("First Rank in CSE, NIT"));
      assert.ok((await page.locator('#achievements').innerText()).includes("330+"));
      assert.equal(await page.locator('h1').innerText(), "Balamurugan P G");
      const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
        const r = e.getBoundingClientRect();
        return !e.closest('[aria-hidden="true"]') && r.width > 0 && (r.right > innerWidth + 2 || r.left < -2) && getComputedStyle(e).position !== 'fixed';
      }).map(e=>e.tagName));
      assert.deepEqual(overflow, []);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.equal(await page.locator('#hero-title').evaluate(e=>getComputedStyle(e).opacity), "1");
      await page.getByRole('button', { name: 'CertiRoute', exact: true }).click();
      await page.locator('#hero-evidence').getByText('32.77%',{exact:true}).waitFor();
      const evidence = await page.locator('#hero-evidence').innerText();
      for (const fact of ['15.96%', '12.12%', 'missed 5% target']) assert.ok(evidence.includes(fact));
      if (width < 1280) {
        await page.getByRole('button',{name:'Menu',exact:true}).click();
        assert.equal(await page.locator('#mobile-navigation a').count(),9);
        await page.keyboard.press('Escape');
        await page.locator('#mobile-navigation').waitFor({state:'detached'});
        assert.equal(await page.getByRole('button',{name:'Menu',exact:true}).evaluate(e=>e===document.activeElement),true);
      }
      await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `scripts/header-v3-${colorScheme}-${width}.png`, fullPage: false });
      pass(`${width}px ${colorScheme}: rank, achievement, reduced motion, layout, proof explorer, keyboard menu`);
    }
  }
  await page.setViewportSize({width:1440,height:950});
  await page.locator('#experience').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-130,behavior:'instant'}));
  await page.waitForTimeout(350);
  assert.equal(await page.locator('nav a[href="#experience"]').getAttribute('aria-current'),'location');
  pass('navigation tracks current section while scrolling');

  let lastBody;
  await page.route('**/api/chat', async route => {
    if(route.request().method()==='GET') return route.fulfill({json:{hasKey:true,provider:'Groq'}});
    lastBody=route.request().postDataJSON();
    await route.fulfill({json:{answer:'VeraScan is a Python package published on PyPI. [1]',citations:[{label:'VeraScan',href:'#p-verascan',section:'project',index:1}],mode:'llm',suggestions:['How does VeraScan work?']}});
  });
  await page.evaluate(()=>localStorage.setItem('portfolio_gemini_key','legacy-test-key'));
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio_gemini_key')),null);
  await page.getByTestId('assistant-launcher').click();
  assert.equal(await page.locator('input[type=password]').count(),0);
  await page.getByRole('button',{name:'What is VeraScan?',exact:true}).click();
  await page.getByTestId('assistant-answer').waitFor();
  assert.ok(!('apiKey' in lastBody));
  assert.ok(!JSON.stringify(lastBody).includes('legacy-test-key'));
  await page.getByRole('link',{name:'Source 1: VeraScan'}).waitFor();
  assert.equal(await page.locator('[data-citation="VeraScan"]').count(),1);
  pass('assistant has inline evidence, source chips, follow-up prompts and no browser key flow');
  await page.getByRole('button',{name:'How does VeraScan work?',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="assistant-answer"]').length===2);
  assert.ok(lastBody.history.some(m=>m.citations?.some(c=>c.href==='#p-verascan')));
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedAnswer=text;}}});});
  await page.getByRole('button',{name:'Copy answer',exact:true}).last().click();
  assert.match(await page.evaluate(()=>window.__copiedAnswer),/VeraScan/);
  pass('answer copy control copies readable answer text');
  await page.getByRole('button',{name:'Clear conversation',exact:true}).click();
  assert.equal(await page.getByTestId('assistant-answer').count(),0);
  await page.keyboard.press('Escape');
  await page.getByTestId('assistant-launcher').waitFor();
  pass('assistant supports cited follow-up history, clear and Escape');

  await page.unroute('**/api/chat');
  await page.route('**/api/chat',async route=>{
    if(route.request().method()==='GET')return route.fulfill({json:{hasKey:true,provider:'Groq'}});
    await new Promise(resolve=>setTimeout(resolve,1000));
    await route.fulfill({json:{answer:'Unused slow answer',citations:[],mode:'offline'}}).catch(()=>{});
  });
  await page.getByTestId('assistant-launcher').click();
  await page.getByRole('button',{name:'What is VeraScan?',exact:true}).click();
  await page.getByRole('button',{name:'Stop response',exact:true}).click();
  await page.getByTestId('assistant-answer').getByText("Stopped. Ask another question whenever you're ready.",{exact:true}).waitFor();
  pass('Stop cancels an in-flight browser request');
  await page.unroute('**/api/chat');
  let requests=0;
  await page.route('**/api/chat',route=>{
    requests++;
    return requests===1?route.fulfill({status:503,json:{error:'Temporary connection failure.'}}):route.fulfill({json:{answer:'VeraScan is on PyPI. [1]',citations:[{label:'VeraScan',href:'#p-verascan',section:'project',index:1}],mode:'llm'}});
  });
  await page.getByRole('button',{name:'Clear conversation',exact:true}).click();
  await page.getByRole('button',{name:'What is VeraScan?',exact:true}).click();
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="assistant-answer"]').length===2);
  assert.equal(requests,2);
  pass('request failure offers a working retry');

  await page.unroute('**/api/chat');
  for (const [body, status] of [[{},400],[{question:8},400],[{question:'x'.repeat(601)},400],[{question:'x'.repeat(25_000)},413]]) {
    const response = await ctx.request.post('http://localhost:3000/api/chat',{data:body,headers:{'x-forwarded-for':'validation-test'}});
    assert.equal(response.status(),status);
  }
  const wrongType=await ctx.request.post('http://localhost:3000/api/chat',{data:'hello',headers:{'content-type':'text/plain'}});
  assert.equal(wrongType.status(),415);
  pass('API validates malformed, oversized and non-JSON requests');
  assert.deepEqual(errors,[]);
  pass('no page errors');
  console.log(`${checks}/${checks} browser groups passed`);
} finally { await browser.close(); }
