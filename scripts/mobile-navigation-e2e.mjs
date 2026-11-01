import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseURL = process.env.PORTFOLIO_TEST_URL || "http://localhost:3000";
const destinations = ["about", "featured", "projects", "experience", "skills", "certs", "contact", "achievements", "how"];
const browser = await chromium.launch({ channel: "msedge", headless: true });
let checks = 0;
const pass = label => { checks++; console.log(`PASS ${label}`); };

async function sectionAligned(page, id) {
  await page.waitForFunction(id => {
    const target = document.getElementById(id);
    if (!target || location.hash !== `#${id}`) return false;
    const top = target.getBoundingClientRect().top;
    const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
    const previous = window.__navigationPosition;
    const stable = previous?.id === id && previous.y === scrollY ? previous.stable + 1 : 0;
    window.__navigationPosition = { id, y: scrollY, stable };
    // A position near the target can still be part of an unfinished smooth scroll.
    return Math.abs(top - inset) < 3 && stable >= 6;
  }, id);
}

async function arrived(page, id) {
  await sectionAligned(page, id);
  await page.locator("#mobile-navigation").waitFor({ state: "detached" });
  assert.equal(await page.getByRole("button", { name: "Menu", exact: true }).getAttribute("aria-expanded"), "false");
  assert.equal(await page.evaluate(id => document.activeElement === document.getElementById(id), id), true, `focus follows navigation to ${id}`);
}

try {
  // Real failure: auto-height menu measurement restores the viewport while a
  // native anchor scroll is starting. Reproduce it with CPU pressure, not a
  // synthetic competing-scroll handler.
  for (const [width, rate] of [[393, 6], [393, 10], [768, 10]]) {
    const page = await browser.newPage({ viewport: { width, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark" });
    page.setDefaultTimeout(12000);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.__menuScrollCalls = [];
      const original = window.scrollTo;
      window.scrollTo = function (...args) {
        window.__menuScrollCalls.push(args);
        return original.apply(this, args);
      };
    });
    for (const id of ["experience", "featured"]) {
      await page.getByRole("button", { name: "Menu", exact: true }).tap();
      await page.evaluate(() => { window.__menuScrollCalls = []; });
      await page.locator(`#mobile-navigation a[href="#${id}"]`).tap();
      await arrived(page, id);
      const resets = await page.evaluate(() => window.__menuScrollCalls.filter(args => args[0] === 0 && typeof args[1] === "number"));
      assert.deepEqual(resets, [], "menu animation must not restore a saved viewport position over section navigation");
      pass(`${width}px ${rate}x CPU: ${id} arrives without an animation scroll reset`);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.getByRole("button", { name: "Menu", exact: true }).tap();
    await page.locator('#mobile-navigation a[href="#featured"]').tap();
    await arrived(page, "featured");
    pass(`${width}px ${rate}x CPU: repeated section selection arrives`);
    await page.close();
  }

  for (const width of [375, 390, 768]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width, height: 812 }, isMobile: true, hasTouch: true, reducedMotion });
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(baseURL, { waitUntil: "networkidle" });

      for (const id of destinations) {
        await page.getByRole("button", { name: "Menu", exact: true }).tap();
        await page.locator(`#mobile-navigation a[href="#${id}"]`).tap();
        await arrived(page, id);
      }
      pass(`${width}px ${reducedMotion}: all nine section links navigate, close and focus`);

      // A repeated hash must return to its section after the visitor scrolls away.
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.getByRole("button", { name: "Menu", exact: true }).tap();
      await page.locator('#mobile-navigation a[href="#how"]').tap();
      await arrived(page, "how");
      pass(`${width}px ${reducedMotion}: repeated section tap navigates again`);

      await page.getByRole("button", { name: "Menu", exact: true }).tap();
      await page.locator('#mobile-navigation a[href="#about"]').focus();
      await page.keyboard.press("Enter");
      await arrived(page, "about");
      await page.goBack();
      await sectionAligned(page, "how");
      await page.goForward();
      await sectionAligned(page, "about");
      pass(`${width}px ${reducedMotion}: keyboard activation and fragment history`);
      assert.deepEqual(errors, []);
      await page.close();
    }
  }
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
  await desktop.goto(baseURL, { waitUntil: "networkidle" });
  await desktop.locator('nav a[href="#certs"]').click();
  await desktop.waitForFunction(() => location.hash === "#certs" && Math.abs(document.getElementById("certs").getBoundingClientRect().top - 88) < 3);
  assert.equal(await desktop.getByRole("button", { name: "Menu", exact: true }).isVisible(), false);
  pass("1440px: desktop section links still navigate");
  console.log(`${checks} mobile navigation checks passed (${baseURL})`);
} finally {
  await browser.close();
}
