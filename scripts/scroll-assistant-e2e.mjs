import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const measureOnly = process.argv.includes("--measure-only");
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: "no-preference", colorScheme: "dark" });
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
try {
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const measurement = await page.evaluate(async () => {
    const ids = new Set(["about", "featured", "projects", "experience", "skills", "contact", "achievements", "certs", "how"]);
    const original = Element.prototype.getBoundingClientRect;
    let reads = 0;
    Element.prototype.getBoundingClientRect = function () { if (ids.has(this.id)) reads++; return original.call(this); };
    const gaps = [];
    let last = performance.now();
    for (let i = 0; i < 90; i++) {
      await new Promise(requestAnimationFrame);
      const now = performance.now(); gaps.push(now - last); last = now;
      window.scrollTo({ top: i * 45, behavior: "instant" });
    }
    Element.prototype.getBoundingClientRect = original;
    gaps.sort((a, b) => a - b);
    return { sectionGeometryReads: reads, frameP95Ms: Math.round(gaps[Math.floor(gaps.length * .95)] * 10) / 10, framesOver50ms: gaps.filter(g => g > 50).length };
  });
  console.log(`SCROLL MEASUREMENT ${JSON.stringify(measurement)}`);
  if (measureOnly) process.exitCode = 0;
  else {
    await check("scroll navigation avoids measuring every section on every frame", () => assert.ok(measurement.sectionGeometryReads < 40, `${measurement.sectionGeometryReads} geometry reads`));
    await page.mouse.move(700, 500); await page.mouse.wheel(0, 450);
    await check("page scrolling pauses decoration and costly header blur", async () => {
      await page.waitForFunction(() => document.documentElement.dataset.scrolling === "true", undefined, { timeout: 1000 });
      assert.equal(await page.locator(".ambient-orb").first().evaluate(e => getComputedStyle(e).animationPlayState), "paused");
      assert.equal(await page.locator(".nav-shell").evaluate(e => getComputedStyle(e).backdropFilter), "none");
    });
    await page.waitForFunction(() => !document.documentElement.dataset.scrolling);
    await check("decoration resumes after page scrolling settles", async () => assert.equal(await page.locator(".ambient-orb").first().evaluate(e => getComputedStyle(e).animationPlayState), "running"));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Work", exact: true }).click();
    await check("section links use native smooth scrolling with the header offset", async () => {
      await page.waitForTimeout(100);
      const progress = await page.evaluate(() => ({ current: window.scrollY, target: document.getElementById("featured").getBoundingClientRect().top + window.scrollY - 88 }));
      assert.ok(progress.current > 0 && progress.current < progress.target - 10);
      await page.waitForFunction(() => Math.abs(document.getElementById("featured").getBoundingClientRect().top - 88) < 3);
    });
    await page.getByTestId("assistant-launcher").click();
    await check("new assistant emblem replaces initials in the dialog", async () => {
      assert.equal(await page.getByTestId("assistant").locator("header svg[data-assistant-emblem]").count(), 1);
      assert.ok(!(await page.getByTestId("assistant").locator("header").innerText()).includes("BPG"));
    });
    await page.route("**/api/chat", async route => {
      if (route.request().method() === "GET") return route.fulfill({ json: { hasKey: true, provider: "Groq" } });
      await route.fulfill({ json: { answer: ("VeraScan compares training and evaluation data and links its results to the source. ".repeat(35) + " [1]"), citations: [{ label: "VeraScan", href: "#p-verascan", section: "project", index: 1 }], mode: "llm", provider: "Groq", model: "openai/gpt-oss-120b" } });
    });
    const input = page.getByRole("textbox", { name: "Ask the portfolio assistant" });
    await input.fill("What is VeraScan?"); await input.press("Enter");
    await page.getByTestId("assistant-answer").waitFor();
    const log = page.getByRole("log", { name: "Conversation" });
    await page.waitForTimeout(750);
    await log.hover(); await page.mouse.wheel(0, -450);
    await check("nested conversation scrolling pauses background decoration", async () => {
      await page.waitForFunction(() => document.documentElement.dataset.scrolling === "true", undefined, { timeout: 1000 });
      assert.equal(await page.locator(".ambient-orb").first().evaluate(e => getComputedStyle(e).animationPlayState), "paused");
    });
    await page.getByRole("button", { name: "Clear conversation" }).click();
    await page.getByTestId("assistant").screenshot({ path: "scripts/assistant-scroll-review.png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await check("reduced motion retains instant anchor navigation", async () => assert.equal(await page.locator("html").evaluate(e => getComputedStyle(e).scrollBehavior), "auto"));
  }
} finally { await browser.close(); }
if (failures) process.exitCode = 1;
