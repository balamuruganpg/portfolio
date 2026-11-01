import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const suggestions = ["How does VeraScan work?", "Explain VeraScan with a simple example", "How can I try VeraScan?"];
try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: "dark", reducedMotion: "reduce" });
    let calls = 0;
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.route("**/api/chat", route => {
      if (route.request().method() === "GET") return route.fulfill({ json: { hasKey: true, provider: "Groq" } });
      calls++;
      return route.fulfill({ json: { answer: calls === 2 ? "I found relevant sources, but couldn't finish a source-checked answer just now. Please try again, or open the linked sources below." : "VeraScan detects training/evaluation data contamination and is published on PyPI. [1]", mode: calls === 2 ? "offline" : "llm", citations: [{ label: "VeraScan", href: "#p-verascan", index: 1 }], provider: calls === 2 ? undefined : "Groq", model: calls === 2 ? undefined : "openai/gpt-oss-120b", suggestions } });
    });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.getByTestId("assistant-launcher").click();
    await page.getByRole("button", { name: "What is VeraScan?", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Portfolio assistant" });
    await dialog.getByText("Groq · openai/gpt-oss-120b · RAG answer · source-checked", { exact: true }).waitFor();
    assert.equal(await dialog.getByText(/limitations|drawbacks|weakness/i).count(), 0);
    for (const text of ["How it works", "Simple example", "Try it"]) assert.equal(await dialog.getByText(text, { exact: true }).isVisible(), true);
    const footer = dialog.locator("form").locator("..");
    assert.equal(await footer.evaluate(e => e.scrollWidth <= e.clientWidth + 1), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await dialog.getByRole("button", { name: "How does VeraScan work?", exact: true }).click();
    await dialog.getByRole("button", { name: "Try again", exact: true }).waitFor();
    assert.match(await dialog.getByTestId("assistant-answer").last().innerText(), /Model unavailable · sources found/);
    await dialog.getByRole("button", { name: "Try again", exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid="assistant-answer"]').length === 3);
    assert.equal(calls, 3);
    assert.equal(await dialog.getByRole("button", { name: "Try again", exact: true }).count(), 0);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: RAG label, useful compact prompts, no unsolicited limitations, no overflow, and model-outage retry`);
    await page.close();
  }
} finally { await browser.close(); }
