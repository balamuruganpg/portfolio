import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("#skills").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: "scripts/skills-snapshot.png" });
await browser.close();
console.log("Skills snapshot captured successfully");
