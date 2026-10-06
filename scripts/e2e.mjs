// End-to-end check in a real browser (installed Microsoft Edge via playwright-core).
// Usage: npm run dev (or start) in one terminal, then: node scripts/e2e.mjs [baseUrl]
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:3000";
const results = [];
const ok = (name, pass, info = "") => {
  results.push({ name, pass, info });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? `  —  ${info}` : ""}`);
};

const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });
ok("page loads", (await page.title()).includes("Balamurugan"), await page.title());

// --- all external links open in a new tab
const badTargets = await page.$$eval('a[href^="http"]', (as) =>
  as.filter((a) => a.target !== "_blank" || !a.rel.includes("noopener")).map((a) => a.href),
);
ok("every external link has target=_blank + noopener", badTargets.length === 0, badTargets.join(", "));

// --- resume buttons point to the local PDF, never GitHub
const resumeHrefs = await page.$$eval("a[download]", (as) => as.map((a) => a.getAttribute("href")));
const resumeRes = await page.request.get(`${BASE}/BalamuruganPG_Resume.pdf`);
ok(
  "resume download serves local PDF",
  resumeHrefs.length >= 2 && resumeHrefs.every((h) => h === "/BalamuruganPG_Resume.pdf") && resumeRes.ok() && (resumeRes.headers()["content-type"] || "").includes("pdf"),
  `${resumeHrefs.length} buttons, status ${resumeRes.status()}, ${resumeRes.headers()["content-type"]}`,
);

// --- filters
const expected = { All: 15, Agents: 2, "Computer Vision": 2, Dashboards: 2, "Deep Learning": 5, Clustering: 3, EDA: 1, Web: 2 };
for (const [f, n] of Object.entries(expected)) {
  await page.click(`[data-filter="${f}"]`);
  const count = await page.locator("[data-project]").count();
  ok(`filter "${f}" shows ${n}`, count === n, `got ${count}`);
}
await page.click('[data-filter="All"]');

// --- click helper: click a link, capture the new tab, report final URL + status
async function clickExternal(locator, label, expectHost) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const [popup] = await Promise.all([ctx.waitForEvent("page", { timeout: 25000 }), locator.click()]);
  try {
    await popup.waitForLoadState("domcontentloaded", { timeout: 45000 });
  } catch {}
  const url = popup.url();
  const title = await popup.title().catch(() => "");
  const status = await ctx.request
    .get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/129.0" }, timeout: 30000 })
    .then((r) => r.status())
    .catch(() => 0);
  const pass = url.includes(expectHost) && status > 0 && status < 400;
  ok(`click ${label}`, pass, `${status} ${url} · "${title.slice(0, 70)}"`);
  await popup.close();
}

const feat = page.locator("#featured ~ div article");
const featuredRepos = ["verascan", "bull-bear-autopilot", "LungScan-AI-Chest-Xray-Detection", "ai-leetcode-agent"];
for (const r of featuredRepos) {
  await clickExternal(page.locator(`article a[data-kind="repo"][href$="/${r}"]`).first(), `repo ${r}`, `github.com/balamuruganpg/${r}`);
}
await clickExternal(page.locator('article a[data-kind="repo"][href*="axiom-sim2real/RAI-Axiom"]').first(), "repo RAI-Axiom", "github.com/axiom-sim2real/RAI-Axiom");
await clickExternal(page.locator('a[data-kind="live"][href="https://medrag.in"]').first(), "live LungScan (medrag.in)", "medrag.in");
await clickExternal(page.locator('a[data-kind="live"][href^="https://pneumonia-scan.streamlit.app"]').first(), "live PneumoScan (Streamlit)", "streamlit.app");
await clickExternal(page.locator('a[data-kind="pypi"]').first(), "PyPI verascan", "pypi.org/project/verascan");

// --- command palette: Ctrl+K → jump to project
await page.keyboard.press("Control+k");
await page.locator('[data-testid="palette"] input').fill("pneumo");
await page.keyboard.press("Enter");
await page.waitForTimeout(900);
const flashed = await page.locator("#p-pneumoscan").getAttribute("class");
ok("Ctrl+K jumps to PneumoScan", (flashed || "").includes("flash"));

// --- assistant
async function askAssistant(q) {
  const before = await page.locator('[data-testid="assistant-answer"]').count();
  const input = page.locator('input[aria-label="Ask the portfolio assistant"]');
  if (!(await input.isVisible())) await page.click('[data-testid="assistant-launcher"]');
  await input.fill(q);
  await input.press("Enter");
  await page.waitForFunction((n) => document.querySelectorAll('[data-testid="assistant-answer"]').length > n, before, { timeout: 30000 });
  const last = page.locator('[data-testid="assistant-answer"]').last();
  const text = await last.innerText();
  const cites = await last.locator("[data-citation]").evaluateAll((els) => els.map((e) => e.getAttribute("data-citation")));
  return { text, cites };
}

const label = await (async () => {
  await page.click('[data-testid="assistant-launcher"]');
  return page.locator('[data-testid="assistant"]').innerText();
})();
ok('assistant labelled "Grounded on this site, not the open web."', label.includes("Grounded on this site, not the open web."));
for (const chip of ["What is VeraScan?", "Which projects are live?", "What stack for LungScan?", "Is he open to roles?"]) {
  ok(`starter chip "${chip}" present`, label.includes(chip));
}

const v = await askAssistant("What did VeraScan ship?");
console.log("\n--- Assistant answer: What did VeraScan ship? ---\n" + v.text + "\n---\n");
ok("VeraScan answer cites VeraScan", v.cites.includes("VeraScan"), `citations: ${v.cites.join(", ")}`);
ok("VeraScan answer does not invent a paper", !/\b(paper|arxiv|publication|journal|conference)\b/i.test(v.text));
ok("VeraScan answer mentions PyPI", /pypi|pip install/i.test(v.text));

const live = await askAssistant("Which projects are live?");
ok("live question cites LungScan AI + PneumoScan", live.cites.includes("LungScan AI") && live.cites.includes("PneumoScan"), `citations: ${live.cites.join(", ")}`);

const stack = await askAssistant("What stack for LungScan?");
ok("LungScan stack cites LungScan AI only", stack.cites[0] === "LungScan AI", `citations: ${stack.cites.join(", ")}`);

const roles = await askAssistant("Is he open to roles?");
ok("roles answer mentions internships/junior roles", /intern|junior/i.test(roles.text), `citations: ${roles.cites.join(", ")}`);

const off = await askAssistant("What's the weather in Paris today?");
ok("off-topic question refused with no citations", off.cites.length === 0 && /only answer/i.test(off.text), off.text.slice(0, 80));

// RAI-Axiom assistant test
const rai = await askAssistant("What is RAI-Axiom?");
console.log("\n--- Assistant answer: What is RAI-Axiom? ---\n" + rai.text + "\n---\n");
ok("RAI-Axiom answer cites RAI-Axiom", rai.cites.includes("RAI-Axiom"), `citations: ${rai.cites.join(", ")}`);
ok("RAI-Axiom mentions repo or org", /axiom-sim2real\/RAI-Axiom/i.test(rai.text) || /axiom-sim2real/i.test(rai.text), rai.text);
ok("RAI-Axiom mentions Balamurugan", /balamurugan/i.test(rai.text), rai.text);
ok("RAI-Axiom mentions Jason Pandian", /jason pandian/i.test(rai.text), rai.text);
ok("RAI-Axiom does not claim to beat buy-and-hold", !/beats? buy-and-hold/i.test(rai.text));

// citation chip jumps to RAI-Axiom card
await page.locator('[data-testid="assistant-answer"]').last().locator('[data-citation="RAI-Axiom"]').click();
await page.waitForTimeout(900);
ok("citation chip jumps to RAI-Axiom card", ((await page.locator("#p-rai-axiom").getAttribute("class")) || "").includes("flash"));

// citation chip jumps to the project card
await askAssistant("What is VeraScan?");
await page.locator('[data-testid="assistant-answer"]').last().locator('[data-citation="VeraScan"]').click();
await page.waitForTimeout(900);
ok("citation chip jumps to VeraScan card", ((await page.locator("#p-verascan").getAttribute("class")) || "").includes("flash"));

await page.screenshot({ path: "scripts/e2e-final.png" });
ok("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
