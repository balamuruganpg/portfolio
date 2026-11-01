import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const failures = [];
async function check(name, run) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
}
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await check(`Certificates is directly reachable in the ${width}px desktop navigation`, async () => {
      const link = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Certificates", exact: true });
      assert.equal(await link.isVisible(), true);
      await link.click();
      assert.equal(await page.locator("#certs").evaluate(e => e.getBoundingClientRect().top < 200), true);
      const overflow = await page.locator("nav").evaluate(e => [...e.querySelectorAll("a, button")].filter(n => { const r = n.getBoundingClientRect(); return r.width && (r.left < 0 || r.right > innerWidth); }).map(n => n.textContent));
      assert.deepEqual(overflow, []);
      const overlaps = await page.locator("nav").evaluate(e => {
        const [brand, links, actions] = [...e.children].map(n => n.getBoundingClientRect());
        return brand.right > links.left || links.right > actions.left;
      });
      assert.equal(overlaps, false);
    });
  }
  await check("search and all certificates are available before the first card", async () => {
    const search = page.getByRole("searchbox", { name: "Search credentials" });
    assert.equal(await search.isVisible(), true);
    assert.equal(await page.getByRole("tab", { name: "Featured 12", exact: true }).getAttribute("aria-selected"), "true");
    const searchTop = await search.evaluate(e => e.getBoundingClientRect().top);
    const firstCardTop = await page.locator("[data-featured-credential]").first().evaluate(e => e.getBoundingClientRect().top);
    assert.ok(searchTop < firstCardTop);
    await page.getByRole("tab", { name: "All 45", exact: true }).click();
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 12);
    await page.getByRole("button", { name: /Load more certificates/ }).click();
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 24);
    while (await page.getByRole("button", { name: /Load more certificates/ }).count()) await page.getByRole("button", { name: /Load more certificates/ }).click();
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 45);
    const ids = await page.locator("#credential-section [id]").evaluateAll(nodes => nodes.map(n => n.id));
    assert.equal(ids.length, new Set(ids).size);
    assert.equal(await page.locator("[data-catalogue-credential] a[aria-label^='Verify ']").count(), 41);
    assert.equal(await page.locator("[data-catalogue-credential] a[aria-label^='View certificate:']").count(), 45);
  });
  await check("search automatically finds records outside the featured selection", async () => {
    await page.getByRole("tab", { name: "Featured 12", exact: true }).click({ timeout: 1500 });
    await page.getByRole("searchbox", { name: "Search credentials" }).fill("DJK8QTWJJAF6", { timeout: 1500 });
    assert.equal(await page.getByRole("tab", { name: "All 45", exact: true }).getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 1);
    assert.match(await page.locator("[data-catalogue-credential]").innerText(), /Machine Learning with Python/);
  });
  await check("assistant navigation selects the requested issuer and scrolls to certificates", async () => {
    await page.evaluate(() => { scrollTo(0, 0); window.dispatchEvent(new CustomEvent("bpg:focus-credentials", { detail: { issuer: "Oracle", view: "all" } })); });
    await page.waitForTimeout(100);
    assert.equal(await page.getByRole("combobox", { name: "Filter by issuer" }).inputValue({ timeout: 1500 }), "Oracle");
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 4);
    assert.match(await page.getByTestId("credential-results").innerText(), /4 of 45/);
    assert.equal(await page.locator("#certs").evaluate(e => e.getBoundingClientRect().top < 200), true);
    assert.match(await page.locator("#learning-deep-learning-specialization").innerText(), /In progress/);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("bpg:focus-credentials", { detail: { query: "DJK8QTWJJAF6" } })));
    assert.equal(await page.getByRole("combobox", { name: "Filter by issuer" }).inputValue(), "");
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 1);
    assert.match(await page.locator("[data-catalogue-credential]").innerText(), /Machine Learning with Python/);
  });
  await check("collection tabs support keyboard navigation", async () => {
    const all = page.getByRole("tab", { name: "All 45", exact: true });
    await all.focus({ timeout: 1500 });
    await all.press("ArrowLeft");
    const featured = page.getByRole("tab", { name: "Featured 12", exact: true });
    assert.equal(await featured.getAttribute("aria-selected"), "true");
    assert.equal(await featured.evaluate(e => e === document.activeElement), true);
    assert.equal(await page.locator("[data-featured-credential]").count(), 12);
    await featured.press("End");
    assert.equal(await all.getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("[data-catalogue-credential]").count(), 12);
  });
  await check("command palette exposes the Certificates catalogue", async () => {
    await page.getByRole("button", { name: "Open command palette" }).click();
    await page.getByRole("textbox", { name: "Command palette search" }).fill("certificates");
    await page.getByRole("option", { name: /Certificates/ }).first().click({ timeout: 1500 });
    assert.equal(await page.getByRole("tab", { name: "All 45", exact: true }).getAttribute("aria-selected"), "true");
  });
  for (const reducedMotion of ["reduce", "no-preference"]) {
    await check(`Assistant Oracle catalogue action keeps certificates visible after closing (${reducedMotion})`, async () => {
      const actionPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion });
      actionPage.on("pageerror", error => errors.push(error.message));
      try {
        await actionPage.route("**/api/chat", async route => {
          if (route.request().method() !== "POST") return route.continue();
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
            answer: "Balamurugan has four completed Oracle certifications. [1]",
            mode: "llm",
            citations: [{ index: 1, label: "Oracle Data Science Professional", href: "/credentials/oci-data-science-2025.pdf", section: "certs" }],
            actions: [{ type: "credentials", label: "Browse Oracle credentials", query: "Oracle" }],
          }) });
        });
        await actionPage.goto(base, { waitUntil: "networkidle" });
        await actionPage.locator("#top").getByRole("button", { name: "Ask about it", exact: false }).click();
        const assistant = actionPage.getByRole("dialog", { name: "Portfolio assistant" });
        await assistant.getByRole("button", { name: "Browse Oracle credentials", exact: false }).waitFor();
        const input = assistant.getByRole("textbox", { name: "Ask the portfolio assistant" });
        await input.fill("Show me Oracle certificates");
        await input.press("Enter");
        await assistant.getByRole("button", { name: "Browse Oracle credentials", exact: false }).nth(1).waitFor();
        await assistant.getByRole("button", { name: "Browse Oracle credentials", exact: false }).last().click();
        await assistant.waitFor({ state: "detached" });
        // Includes both the modal exit and native smooth-scroll settling time.
        await actionPage.waitForTimeout(1200);
        assert.equal(await actionPage.getByRole("searchbox", { name: "Search credentials" }).inputValue(), "Oracle");
        assert.equal(await actionPage.locator("[data-catalogue-credential]").count(), 4);
        const position = await actionPage.locator("#certs").evaluate(e => ({ top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom, scrollY }));
        assert.ok(position.top >= 0 && position.top < 200 && position.bottom > 0, `Certificates should remain visible after the Assistant closes; got ${JSON.stringify(position)}`);
      } finally { await actionPage.close(); }
    });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, [], `${failures.length} certificate navigation checks failed`);
} finally { await browser.close(); }
