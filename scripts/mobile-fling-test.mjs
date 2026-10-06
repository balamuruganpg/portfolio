// Mobile fling performance test
// Emulates a mobile phone (390x844), flings from hero to contact,
// measures requestAnimationFrame timestamps, and reports frame times.

import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});

const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// 1. Verify canvas is not running on mobile screen (< 768px)
const canvasDisplay = await page.$eval("canvas", (el) => window.getComputedStyle(el).display).catch(() => "none");
console.log(`Mobile canvas display: ${canvasDisplay}`);
if (canvasDisplay !== "none") {
  console.error("FAIL: Canvas should be hidden on mobile (< 768px)");
} else {
  console.log("PASS: Canvas is hidden on mobile (< 768px)");
}

// 2. Install FPS and frame-time recorder
await page.evaluate(() => {
  window.__frameDeltas = [];
  let lastTime = performance.now();
  window.__recording = true;

  function measureFrame(now) {
    if (!window.__recording) return;
    const delta = now - lastTime;
    window.__frameDeltas.push(delta);
    lastTime = now;
    requestAnimationFrame(measureFrame);
  }
  requestAnimationFrame(measureFrame);
});

// Take initial hero screenshot
await page.screenshot({ path: "scripts/mobile-hero.png" });

// 3. Fling from hero to contact using smooth fast touch-flings
console.log("Flinging from hero to contact...");
const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(`Document scroll height: ${scrollHeight}px`);

// Simulate touch fling downward
for (let y = 0; y < scrollHeight; y += 450) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(16);
}

// Scroll smoothly directly to #contact
await page.evaluate(() => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
});
await page.waitForTimeout(1200);

// Stop recording
const stats = await page.evaluate(() => {
  window.__recording = false;
  const deltas = window.__frameDeltas.slice(5); // drop initial frame
  if (deltas.length === 0) return { count: 0, avg: 0, max: 0, p95: 0, over33ms: 0 };
  deltas.sort((a, b) => a - b);
  const sum = deltas.reduce((a, b) => a + b, 0);
  const avg = sum / deltas.length;
  const max = deltas[deltas.length - 1];
  const p95 = deltas[Math.floor(deltas.length * 0.95)];
  const over33ms = deltas.filter((d) => d > 33.3).length;
  return { count: deltas.length, avg, max, p95, over33ms };
});

console.log("\n=== Mobile Fling Performance Results ===");
console.log(`Frames Captured: ${stats.count}`);
console.log(`Average Frame Duration: ${stats.avg.toFixed(2)} ms (~${(1000 / stats.avg).toFixed(1)} FPS)`);
console.log(`95th Percentile Frame Time: ${stats.p95.toFixed(2)} ms`);
console.log(`Max Frame Time: ${stats.max.toFixed(2)} ms`);
console.log(`Frames over 33ms (dropped < 30fps): ${stats.over33ms} of ${stats.count}`);

// Screenshot at contact
await page.screenshot({ path: "scripts/mobile-contact.png" });

// Also test desktop fling
const desktopCtx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const desktopPage = await desktopCtx.newPage();
await desktopPage.goto("http://localhost:3000", { waitUntil: "networkidle" });

await desktopPage.evaluate(() => {
  window.__frameDeltas = [];
  let lastTime = performance.now();
  window.__recording = true;

  function measureFrame(now) {
    if (!window.__recording) return;
    const delta = now - lastTime;
    window.__frameDeltas.push(delta);
    lastTime = now;
    requestAnimationFrame(measureFrame);
  }
  requestAnimationFrame(measureFrame);
});

// Fast fling desktop
await desktopPage.evaluate(() => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
});
await desktopPage.waitForTimeout(1200);

const desktopStats = await desktopPage.evaluate(() => {
  window.__recording = false;
  const deltas = window.__frameDeltas.slice(5);
  deltas.sort((a, b) => a - b);
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const p95 = deltas[Math.floor(deltas.length * 0.95)];
  return { count: deltas.length, avg, p95 };
});

console.log("\n=== Desktop Fling Performance Results ===");
console.log(`Average Frame Duration: ${desktopStats.avg.toFixed(2)} ms (~${(1000 / desktopStats.avg).toFixed(1)} FPS)`);
console.log(`95th Percentile Frame Time: ${desktopStats.p95.toFixed(2)} ms`);

await browser.close();
console.log("\nVerification complete!");
