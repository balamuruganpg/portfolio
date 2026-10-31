import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const failures=[];
const check=(name,pass)=>{console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failures.push(name);};
for (const colorScheme of ['light','dark']) {
  await page.emulateMedia({colorScheme});
  for (const width of [375,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('http://localhost:3000', {waitUntil:'networkidle'});
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{ const r=e.getBoundingClientRect();return !e.closest('[aria-hidden="true"]') && r.width>0 && (r.right>innerWidth+2 || r.left < -2) && getComputedStyle(e).position !== 'fixed';}).map(e=>({tag:e.tagName,cls:e.className})).slice(0,10));
    check('identity and About',await page.locator('#hero-title').innerText()==='Balamurugan P G' && await page.locator('#about dd').count()===6);
    check('required hero line',await page.locator('#top').innerText().then(t=>t.includes('I build AI systems with verified results - and I publish the misses too')));
    check('certification count',await page.locator('#certs + div > div').count()===12);
    check('section headings and evidence remain opaque with reduced motion',await page.locator('h2, article').evaluateAll(es=>es.every(e=>{for(let n=e;n;n=n.parentElement){if(getComputedStyle(n).opacity==='0')return false;}return true;})));
    const h1=await page.locator('h1').allTextContents();
    const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash));
    if(overflow.length||anchors.length||h1.length!==1) failures.push({width,colorScheme,overflow,anchors,h1});
    console.log(JSON.stringify({width,colorScheme,overflow,brokenAnchors:anchors,h1}));
    if(width<1024){ await page.getByRole('button',{name:'Menu',exact:true}).click(); await page.locator('#mobile-navigation a[href="#about"]').click(); check('mobile navigation closes after selection',await page.locator('#mobile-navigation').count()===0); }
    await page.screenshot({path:`scripts/overhaul-${colorScheme}-${width}.png`,fullPage:true});
  }
}
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
const download=page.waitForEvent('download');await page.locator('[data-testid=resume-download]').click();check('PDF download filename',(await download).suggestedFilename()==='BalamuruganPG_Resume.pdf');
await page.keyboard.press('Control+Home');await page.keyboard.press('Tab');await page.locator('.skip-link').focus();check('keyboard skip link',await page.locator('.skip-link').evaluate(e=>e===document.activeElement));
check('canonical URL',await page.locator('link[rel=canonical]').getAttribute('href')==='https://balamuruganpg.in');
for(const endpoint of ['/robots.txt','/sitemap.xml'])check(endpoint,(await page.request.get('http://localhost:3000'+endpoint)).ok());
for(const [name,url] of [['GitHub','https://github.com/balamuruganpg'],['LinkedIn','https://www.linkedin.com/in/balamuruganpg'],['LeetCode','https://leetcode.com/u/balamurugan_pg/']]){
 const res=await page.request.get(url,{timeout:20000}).catch(e=>({status:()=>e.message}));console.log(name+': '+res.status());
}
await browser.close();
if(failures.length){console.error(JSON.stringify(failures));process.exit(1);}
