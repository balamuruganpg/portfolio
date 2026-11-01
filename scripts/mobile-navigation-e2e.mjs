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
  for (const width of [375, 390, 768]) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({ viewport: { width, height: 812 }, isMobile: true, hasTouch: true, reducedMotion });
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(baseURL, { waitUntil: "networkidle" });

      // Reproduce focus-related viewport restoration cancelling a separate smooth scroll.
      // Use a real competing browser scroll, rather than replacing the scroll APIs.
      await page.evaluate(() => {
        const restoreViewport = event => {
          if (event.target.id !== "experience") return;
          document.removeEventListener("focusin", restoreViewport);
          const previousTop = scrollY;
          queueMicrotask(() => window.scrollTo({ top: previousTop, behavior: "instant" }));
        };
        document.addEventListener("focusin", restoreViewport);
      });
      await page.getByRole("button", { name: "Menu", exact: true }).tap();
      await page.locator('#mobile-navigation a[href="#experience"]').tap();
      await arrived(page, "experience");
      pass(`${width}px ${reducedMotion}: Experience arrives despite competing focus scroll`);

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
