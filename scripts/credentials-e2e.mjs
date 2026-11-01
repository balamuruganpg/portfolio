import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { loadRagRuntime } from "./rag-runtime.mjs";

const runtime = await loadRagRuntime();
const browser = await chromium.launch({ channel: "msedge", headless: true });
let passed = 0;
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  for (const colorScheme of ["dark", "light"]) for (const width of [319, 375, 768, 1440]) {
    await page.emulateMedia({ colorScheme }); await page.setViewportSize({ width, height: 900 });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    assert.match(await page.locator("#certs").innerText(), /Certifications & learning/);
    assert.match(await page.locator("#top").innerText(), /45 credentials/);
    assert.equal(await page.locator("[data-featured-credential]").count(), 12);
    assert.match(await page.locator("#learning-deep-learning-specialization").innerText(), /In progress/);
    await page.getByText("Explore all 45 completed credentials", { exact: true }).click();
    await page.locator("[data-catalogue-credential]").first().waitFor();
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 45);
    const input = page.getByRole("searchbox", { name: "Search credentials" });
    await input.fill("DJK8QTWJJAF6");
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 1);
    assert.match(await page.locator("[data-catalogue-credential]").innerText(), /Machine Learning with Python/);
    await input.fill("not-a-real-certificate"); assert.match(await page.getByTestId("credential-results").innerText(), /0 of 45/);
    await input.fill("");
    const overflow = await page.locator("#credential-section").evaluate(e => [...e.querySelectorAll("*")].filter(n => {const r=n.getBoundingClientRect();return r.width>0 && r.right>innerWidth+2;}).map(n=>n.tagName));
    assert.deepEqual(overflow, []);
    assert.equal(await page.locator("#credential-section a:not([target='_blank'])").count(), 0);
    passed++; console.log(`PASS ${width}px ${colorScheme}: counts, progress, proof links, search and layout`);
  }
  for (const c of runtime.site.completedCredentials) {
    const response = await page.request.get("http://localhost:3000" + c.file);
    assert.equal(response.status(), 200, c.file);
    assert.match(response.headers()["content-type"], c.file.endsWith(".pdf") ? /pdf/ : /image\/png/);
    assert.ok((await response.body()).length > 1000);
  }
  console.log("PASS all 45 original certificate files serve successfully"); passed++;
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.emulateMedia({ colorScheme: "dark" });
  await page.locator("#credential-section details > summary").click();
  await page.locator("#credential-section").screenshot({ path: "scripts/credentials-review.png" });
  assert.deepEqual(errors, []); console.log(`PASS ${passed} certificate browser groups; no page errors`);
} finally { await browser.close(); await runtime.close(); }
