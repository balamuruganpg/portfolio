<h1 align="center">Bull/Bear Autopilot</h1>

<p align="center">
  <strong>An unattended research analyst for Indian IPOs.</strong><br>
  It finds every live issue, reads the prospectus, argues both sides with page
  citations,<br>fact-checks its own arguments against the document, and delivers a
  verdict to Telegram — with no human in the loop.
</p>

<p align="center">
  <img alt="tests: 568 passed" src="https://img.shields.io/badge/tests-568%20passed-brightgreen">
  <img alt="Python 3.11+" src="https://img.shields.io/badge/python-3.11%2B-blue">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green">
  <img alt="LLM providers: 7" src="https://img.shields.io/badge/LLM%20providers-7%2C%20cascading-8957e5">
</p>

---

**Why this is different from the other LLM-reads-a-PDF projects:**

- **Not a chatbot.** Nothing to prompt. It wakes on a schedule, decides what is
  worth reading, and reports.
- **Not plain RAG.** No similarity search over chunks — the prospectus becomes a
  numbered, page-cited `Fact[]` that every later stage must argue *from*.
- **Two adversaries, not one narrator.** A bull and a bear build cases from the
  same facts, so a weakness has to survive an advocate trying to bury it.
- **The eval layer is deterministic and the model cannot overrule it.** A figure
  that appears in no cited fact is `unsupported`, full stop — and confidence is
  *arithmetic* over those outcomes, never the model's own self-report.

The most important component is the one that **rejects its own output**. In the
committed sample run, the claim it threw out was the *bull's* — and the argument
was arithmetically correct. [See why](#a-sample-verdict-explained).

```bash
python scripts/demo_dry_run.py --offline
```

No API key, no network, no credential. Shows the whole pipeline's shape in about
two seconds. **Start there.**

> ⚠️ **Not investment advice.** This is a software engineering portfolio project.
> Verdicts come from a language model reading a fraction of a prospectus. See the
> [full disclaimer](#disclaimer).

---

### If you only read one section

| | |
|---|---|
| [**Why this is not plain RAG**](#why-this-is-not-plain-rag) | the six structural differences, as a table |
| [**A sample verdict, explained**](#a-sample-verdict-explained) | a real run, and the honest cost of a strict fact-checker |

---

## Contents

- [Demo](#demo)
- [Architecture](#architecture)
- [Why this is not plain RAG](#why-this-is-not-plain-rag)
- [Key design choices](#key-design-choices)
- [Quickstart](#quickstart)
- [Example commands](#example-commands)
- [A sample verdict, explained](#a-sample-verdict-explained)
- [Multi-provider LLM access](#multi-provider-llm-access)
- [Discovery](#discovery)
- [Analysis](#analysis)
- [Run unattended](#run-unattended)
- [Layout](#layout)
- [Design notes](#design-notes)
- [Known limitations](#known-limitations)
- [Security](#security)
- [Disclaimer](#disclaimer)

**Status: complete and verified end to end (P0–P4).** Discovery, ranking,
offer-document retrieval, fact extraction, the bull and bear agents, the
fact-checker, the judge, Telegram delivery, and scheduling with day-level dedup.
568 tests, fully offline. One command runs the whole thing.

---

## Demo

### What lands on your phone

> Real output from the run of 21 Aug 2026 — one IPO, `AVOID`, read off a full
> DRHP. Nothing here is a mockup. The delivered memo in full, and what each shot
> has to contain, are in
> [`docs/screenshots/README.md`](docs/screenshots/README.md).

| | |
|---|---|
| ![Digest header](docs/screenshots/01-digest-header.png) | ![Per-IPO verdict](docs/screenshots/02-verdict-summary.png) |
| **1. The digest header** — universe size, how many were analysed, evidence quality, any sources that were down. | **2. One IPO's verdict** — rank, verdict, confidence, bull/bear scores, top positives and risks. |
| ![Memo and prospectus attached](docs/screenshots/03-attachments.png) | ![Evidence block from the memo](docs/screenshots/Evidence.png) |
| **3. The evidence, attached** — the full memo *and* the actual DRHP that was read, in the same thread. | **4. What the verdict rests on** — evidence grade, facts extracted, the fact-check tally for each side, and the NSE URL the document came from. |

#### The debate, fact-checked claim by claim

Every claim either side made is tagged with what the extracted facts could actually
support, and carries the fact ids it leaned on. `[UNSUPPORTED]` is the interesting
one: the bull's central argument is tagged that way and held against it, which is
how the top-ranked IPO of the run (shortlist score `64.77`) ends up an `AVOID`.

<details>
<summary><b>Bull case</b> — 4 <code>[supported]</code>, 1 <code>[partial]</code>, 1 <code>[UNSUPPORTED]</code> (material: BULL002)</summary>

![Bull case claims, fact-checked](docs/screenshots/04-memo-claims/bull_case.png)

</details>

<details>
<summary><b>Bear case</b> — 5 <code>[supported]</code>, 1 <code>[partial]</code>, 0 unsupported</summary>

![Bear case claims, fact-checked](docs/screenshots/04-memo-claims/bear_case.png)

</details>

Both are full-length captures of the delivered memo, so the tags, the reasoning and
the `cites F00xx` footers are all readable end to end — nothing selected, nothing
cropped away.

### What it looks like with no key at all

`scripts/demo_dry_run.py` runs the credential-free parts live and reads a
committed sample artifact for the parts that need a provider, so the whole chain
is visible before you decide whether to go find a key:

```
1. Ranking is deterministic and needs no LLM
--------------------------------------------
  1.  74.77  Mainboard Pharma Limited
          score 74.77 — ₹1,851cr issue; opens 24 Aug; NSE + BSE; offer document linked; symbol MBPHARMA; confirmed by 2 sources
  2.  62.28  Open Instruments Limited
          score 62.28 — ₹455cr issue; open now, closes 23 Aug; NSE; symbol OPENINST; confirmed by 2 sources
  3.  16.00  Dashboard Only Private Limited  (not selected)
  4.  54.77  Huge But Closed Limited  (not selected)

  Note the ₹20,000cr issue ranking last despite being the largest: it
  is closed, so it sorts below every actionable listing regardless of
  size. The same input always gives this same order — no model runs.

3. The provider cascade your .env configures
--------------------------------------------
  1. tabitoken:claude-opus-5
  2. openrouter:google/gemini-2.5-flash
  ...

4. What a real run produced (committed sample, no tokens spent)
---------------------------------------------------------------
  AVOID    conf 45%   bull 3.5 / bear 6.5   Symbiotec Pharmalab Limited
    full_drhp, 12 of 574 pages read, 24 facts extracted
    fact-check: {'supported': 9, 'unsupported': 1, 'partial': 2}
```

Ranks 3 and 4 are worth a second look: the ₹20,000cr issue scores 54.77 and still
places *below* a listing scoring 16.00, because it is closed and a closed issue is
worth nothing to a subscriber no matter how large it is.

Add `--offline` to skip the live discovery step. Nothing is written to disk and
no model is called, so it costs nothing.

---

## Architecture

```
                    ┌──────────────────────────────────────────┐
   scheduler ──────▶│ 1. SCOUT      discover Indian IPOs        │
                    │               (NSE APIs + HTML dashboard) │
                    └───────────────────┬──────────────────────┘
                                        │  IPOListing[]
                    ┌───────────────────▼──────────────────────┐
                    │ 2. RANK       score the universe,         │  no LLM
                    │               keep Top N (TOP_N = 3 or 5) │  deterministic
                    └───────────────────┬──────────────────────┘
                                        │  per IPO
                    ┌───────────────────▼──────────────────────┐
                    │ 2a. DEDUP     drop anything already       │
                    │               analysed today (IST)        │
                    └───────────────────┬──────────────────────┘
                    ┌───────────────────▼──────────────────────┐
                    │ 2b. FETCH     hunt the offer document,    │
                    │               grade the evidence found    │
                    └───────────────────┬──────────────────────┘
                    ┌───────────────────▼──────────────────────┐
                    │ 3. DOCUMENT   DRHP/RHP ──▶ Fact[]         │
                    │               grounded, page-cited        │
                    └───────────────────┬──────────────────────┘
                              ┌─────────┴─────────┐
                    ┌─────────▼───────┐ ┌─────────▼───────┐
                    │ 4a. BULL agent  │ │ 4b. BEAR agent  │
                    │     Claim[]     │ │     Claim[]     │
                    └─────────┬───────┘ └─────────┬───────┘
                              └─────────┬─────────┘
                    ┌───────────────────▼──────────────────────┐
                    │ 5. FACT-CHECKER  every claim vs Fact[]    │  the eval layer
                    │    supported / partial / unsupported      │  arithmetic first
                    └───────────────────┬──────────────────────┘
                    ┌───────────────────▼──────────────────────┐
                    │ 6. JUDGE      JudgeMemo: verdict,         │  confidence is
                    │               confidence, scores, risks   │  derived, not asked
                    └───────────────────┬──────────────────────┘
                    ┌───────────────────▼──────────────────────┐
                    │ 7. DELIVER    summary + memo + offer doc  │
                    │                        ──▶ Telegram       │
                    └──────────────────────────────────────────┘
```

Every claim in the final report traces back to a page in the offer document.
That citation chain — `Fact.id` → `Claim.citation_ids` → `FactCheckResult` — is
the reason the debate can be trusted without a human reading the DRHP.

The `scheduler` at the top is a real OS-level task, not a placeholder — see
[Run unattended](#run-unattended). Stage 2a is what keeps a schedule that fires
twice from paying twice.

---

## Why this is not plain RAG

A retrieval-augmented chatbot over a prospectus does one thing: finds passages
that look like your question and asks a model to write about them. Ask it "is
this IPO a good buy?" and you get fluent prose whose relationship to the document
is unverified — and unverifiable, because nothing in the design distinguishes a
grounded sentence from a plausible one.

Six differences, each of them structural rather than a prompt instruction:

| Plain RAG | This system |
|---|---|
| Retrieves passages similar to a query | **Extracts a numbered, page-cited `Fact[]`** — an addressable evidence base, built once and reused by every downstream stage |
| One model writes one answer | **Two adversarial agents** argue opposite sides from the *same* facts, so a weakness has to survive an advocate who is trying to bury it |
| Citations are decorative, and often unchecked | **Citations are enforced.** A claim citing an id the extractor never issued is dropped before the fact-checker sees it |
| "Grounded" means the model said so | **Every figure is re-derived mechanically.** A number in a claim that appears in no cited fact's `numbers` *or* text is `unsupported`, and no model can overrule that |
| Confidence is the model's self-report | **Confidence is arithmetic** over evidence quality and fact-check outcomes — a testable promise, not a vibe |
| A failure looks like a confident answer | **Degradation is explicit and typed.** `partial` says *what* broke — a dead source, a failed IPO, a dropped page window, thin evidence |

The last one matters most for an unattended system. A pipeline that runs at 09:15
with nobody watching must never let silence look like success — which is why a
run where every page window failed raises instead of writing an empty report, and
why a `metadata_only` memo says outright that it is **not an analysis**.

The honest version of the claim: the LLM is still doing the reading and the
arguing, and it is still fallible. What is different is that its output is
*audited* — by a layer it cannot influence — and the audit result is carried
through to the number a human reads. When the extractor is sloppy, confidence
falls. That is visible in the [sample verdict](#a-sample-verdict-explained).

---

## Key design choices

### 1. The ranker uses no LLM

Scoring the universe is bookkeeping, not judgement. A model cannot be relied on
to order the same 23 listings the same way twice, and "why did this make the
cut?" has to be answerable in arithmetic. Every listing carries the points it
earned and a human-readable reason, and the artifact records the reasoning for
the **whole** universe — not just the shortlist — so a near-miss can be audited
without re-running discovery. Weights and the closed-issue rule are in
[Ranking](#ranking).

### 2. The bull and bear are citation-grounded

Both agents see the same `Fact[]` and are held to the same contract: every claim
must cite `Fact.id`s, and a claim citing an id that was never issued is dropped
before it can be scored. A fabricated citation is worse than no claim. Every
figure in a claim's *text* is unioned with its declared `numbers`, so omitting a
number from the array cannot exempt it from being checked.

### 3. The fact-checker is the eval layer, and it is deterministic first

Arithmetic runs before any model gets a say, and no model may overrule it. An
unmatched figure is `unsupported`, full stop. Digit boundaries are respected, so
`1250` is not "found" inside `12500` — an order-of-magnitude error is exactly the
kind of thing that must not slip through. The LLM adjudicates only the residual
qualitative band, and if it is unavailable the claim settles at `partial` rather
than being waved through. Full status table in
[The fact-checker](#the-fact-checker-is-the-eval-layer).

### 4. Confidence is arithmetic, not asked for

A model asked "how confident are you?" answers with a number that tracks its own
fluency. This one is derived:

```
confidence = base × evidence_factor × unsupported_factor × material_penalty
```

The judge proposes `base`; the pipeline applies the rest and clamps to
`[0.05, 1.0]`. That is what makes "thin evidence lowers confidence" a property
covered by tests instead of a hope. Worked example
[below](#a-sample-verdict-explained).

### 5. Seven providers, one function, no vendor SDKs

Agents call `chat(messages, temperature=0.2) -> str` and never learn which
provider answered. The router cascades through whatever has a key, retries
transient failures in place and fails permanent ones over immediately. Plain REST
over `httpx`, so there is no SDK to pin. See
[Multi-provider LLM access](#multi-provider-llm-access).

### 6. Autopilot with day-level dedup

One command is the whole system, and it remembers what it already did. Dedup is
keyed on the **Indian** calendar date, because IST is UTC+5:30 and a UTC-keyed
autopilot would treat a 19:00 UTC run and the next morning's 06:00 UTC run as
different days when they are the same Indian day. Only *successes* are recorded,
so an IPO whose prospectus 404s at 06:00 is retried at noon rather than written
off. Details in [Dedup](#dedup-what-already-done-today-means).

---

## Quickstart

Python 3.11+ (the code uses `StrEnum`).

```bash
git clone https://github.com/balamuruganpg/bull-bear-autopilot.git
cd bull-bear-autopilot
```

```bash
python3 -m venv .venv && source .venv/bin/activate    # Linux / macOS
```

```bash
python -m venv .venv && .venv\Scripts\activate        # Windows
```

On Linux and macOS the interpreter is usually `python3`; `python` may be absent or
still be 2.7. Inside the activated venv, `python` is the right one either way, so
every command below works unchanged on all three platforms. If `python3 -m venv`
fails on Debian or Ubuntu, install the module first:
`sudo apt install python3-venv`.

```bash
pip install -r requirements.txt
```

See the whole pipeline immediately, with no credential of any kind:

```bash
python scripts/demo_dry_run.py --offline
```

Discovery and ranking also need no key — this hits public NSE endpoints:

```bash
python -m app.pipeline scout-rank
```

For the LLM stages, copy the template and add **one** provider key:

```bash
cp .env.example .env
```

Blank means "skip this provider", so a single key is enough to run everything.
Never edit `.env.example` itself — it is committed. See [Security](#security).

On a **free-tier key**, also set the token-ceiling overrides at the bottom of
`.env.example` (`DOC_PAGES_PER_CHUNK=1`); a full-size extraction window will
otherwise be rejected outright. See [Known limitations](#known-limitations).

Verify the install:

```bash
python -m pytest -q
```

568 tests, fully offline — no key required, and none can leak into a test.

---

## Example commands

| Command | Needs | What it does |
|---|---|---|
| `python scripts/demo_dry_run.py --offline` | nothing | the whole pipeline's shape in ~2s |
| `python -m app.pipeline scout-rank` | nothing | discover every live/upcoming IPO, rank, write the artifact |
| `python -m app.pipeline document data/samples/acme-industries-drhp-sample.pdf --name "Acme Industries Ltd"` | 1 LLM key | prospectus ──▶ page-cited `Fact[]` |
| `python -m app.pipeline analyze-topn --top-n 3` | 1 LLM key | the full chain for the shortlist, memos to `reports/` |
| `python -m app.pipeline analyze-topn --top-n 3 --notify` | + Telegram | same, delivered to your phone |
| `python -m app.pipeline notify-last` | Telegram only | re-send the most recent run, nothing re-analysed |
| `python -m app.pipeline autopilot` | 1 LLM key + Telegram | everything, with dedup — this is the one to schedule |
| `python -m app.pipeline autopilot --dry-run` | nothing | scout + rank + the skip plan, then stop |
| `python scripts/probe_provider.py --models` | 1 LLM key | which providers answer, and what models they publish |

Flags worth knowing: `--top-n N`, `--max-pages N` (depth vs. free-tier token
ceilings), `--force` (ignore dedup), `--json`, `--no-write`,
`--log-level DEBUG` (every provider decision).

Exit codes are the ones a scheduler can act on:

| Code | Meaning |
|---|---|
| `0` | did what it should have — **including** a run that correctly found nothing new |
| `1` | tried and failed: discovery collapsed, every shortlisted IPO failed, or delivery failed |
| `2` | misconfigured — no provider key, or `--notify` without Telegram credentials. Fix `.env`. |

Both credential checks happen *before* the analysis starts. An unattended run
that spends fifteen minutes and twenty-odd model calls per IPO only to discover it
cannot deliver is the most expensive possible way to learn about a missing token.

Everything a run produced lands in three places: `data/runs/<ts>-*.json` (the
full audit trail), `reports/<ts>-<symbol>-memo.md` (what a human reads), and
`data/cache/` (the prospectus that was actually downloaded). All three are
gitignored.

---

## A sample verdict, explained

Committed under [`data/samples/`](data/samples/) is a real run, sanitized for
publication: the [full artifact](data/samples/sample-topn-analysis.json) and the
[rendered memo](data/samples/sample-memo.md). No key needed to read either.

```
AVOID    conf 45%   bull 3.5 / bear 6.5   Symbiotec Pharmalab Limited
  full_drhp, 12 of 574 pages read, 24 facts extracted
  fact-check: {'supported': 9, 'unsupported': 1, 'partial': 2}
```

**The interesting part is the single unsupported claim, and it is the bull's.**
Arguing that the promoters were staying invested, the bull wrote that "₹18,500.00
million comes from the two Investor Selling Shareholders." The prospectus states
each investor's sale separately — ₹12,500m and ₹6,000m — but never their sum. So:

```
cites F0001, F0003, F0004, F0005, F0014, F0015, F0016
      — figure(s) 18500 appear in no cited fact
```

The arithmetic is correct. The claim is still `unsupported`, because 18,500 is
the *model's* addition and not the document's statement, and the checker has no
way to distinguish a sound inference from a hallucinated total. That strictness is
the design: it is what stops a fabricated figure from arriving with a citation
stapled to it. It also cost a defensible argument, which is the honest trade.

Because the figure was a *number* rather than a vague sentence, it was recorded in
`material_unsupported_ids` and penalised harder. The judge proposed a base
confidence of **0.58**; the pipeline derived what a human sees:

| Factor | Value | Why |
|---|---|---|
| base (judge's own) | 0.58 | |
| evidence quality | × 1.00 | `full_drhp` — the real prospectus was downloaded and read |
| share unsupported | × 0.92 | 1 of 12 claims failed |
| material penalty | × 0.85 | one ungrounded *figure*, not merely loose wording |
| **confidence** | **0.45** | clamped to `[0.05, 1.0]` |

Reproduce it from the committed artifact:

```bash
python -c "import json; from app.agents.judge import adjust_confidence; from app.models import FactCheckReport; a=json.load(open('data/samples/sample-topn-analysis.json',encoding='utf-8')); print(adjust_confidence(0.58, evidence_quality='full_drhp', reports=[FactCheckReport(**s) for s in a['memos'][0]['fact_check']]))"
```

That prints `0.45`.

Two things this verdict is *not*. It is **not** a considered opinion about that
company: the run read 12 of 574 pages, which the memo discloses on its own face,
and the judge's own prose says the material is "genuinely thin on fundamentals."
And 45% is **not** "the IPO is 45% good" — it is how much weight the system thinks
its own reading can bear. A low number often means the extractor was sloppy at
least as much as it means the issue is weak. See
[Known limitations](#known-limitations).

---

## Multi-provider LLM access

The router cascades through providers in a fixed order and the first one that
answers wins. **Providers without a key are skipped**, so one key is enough.

| # | Provider | Default model | Env key |
|---|---|---|---|
| 1 | **Tabitoken** (third-party Claude proxy) | `claude-opus-5` | `TABITOKEN_API_KEY` |
| 2 | OpenRouter | `google/gemini-2.5-flash` | `OPENROUTER_API_KEY` |
| 3 | Google Cloud Agent Platform | `gemini-2.5-flash` | `AGENT_PLATFORM_API_KEY` + `GOOGLE_CLOUD_PROJECT` |
| 4 | Groq | `openai/gpt-oss-120b` | `GROQ_API_KEY` |
| 5 | Gemini (AI Studio) | `gemini-2.5-flash` | `GEMINI_API_KEY` |
| 6 | OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` |
| 7 | OpenRouter free tier | `…gemini-2.0-flash-exp:free`, `…llama-3.3-70b-instruct:free`, `…deepseek-chat-v3-0324:free` | `OPENROUTER_API_KEY` |

Tier 1 is first because it is the strongest model in the cascade, and analysis
quality is the whole point. It is an **OpenAI-compatible proxy at
`https://tabitoken.com`** — set the host without a path and the router appends
`/v1` itself; the domain is never rewritten. The proxy publishes four Claude
models (`claude-opus-5`, `claude-opus-5-thinking`, `claude-opus-4-8`,
`claude-opus-4-8-thinking`); the default is the strongest non-thinking one,
because this pipeline asks for JSON far more often than prose. Override with
`TABITOKEN_MODEL=` — no code change.

**Anthropic's own API is not in the cascade and `ANTHROPIC_API_KEY` is never
read.** Claude is reached only through that proxy, which is a different vendor,
host and credential. Prompts leave your machine for a third party, so treat it
accordingly — [SECURITY.md](SECURITY.md#a-note-on-what-leaves-your-machine) says
what that means in practice. Tier 3 is likewise distinct from tier 5: enterprise
Gemini on your own GCP project, with its own key, endpoint and quota.

Behaviour:

- **Transient failures** (429, 5xx, timeouts) retry inside the same provider with
  exponential backoff; **permanent ones** (bad key, unknown model, malformed
  request) fail that provider immediately and move the cascade on.
- **Every served call is logged** with the provider and model that answered —
  `served by tabitoken:claude-opus-5 in 1946ms` — and each run records a
  `providers_used` tally. Never the credential.
- **Model IDs are env-overridable.** Availability differs per account, so if a
  provider 404s, set `GROQ_MODEL=` in `.env` rather than editing code.
- A model that rejects JSON mode is transparently retried without it.
- The router sends an honest `User-Agent` (`Bull-Bear-Autopilot/1.0`). Some hosts
  sit behind a WAF that serves an HTML 403 to a default `python-httpx/…` agent.

Agents call exactly one function and never see a provider:

```python
from app.llm.client import chat

answer = chat(messages, temperature=0.2)   # -> str
```

`chat_json()` (parsed JSON, tolerant of code fences and chatty preambles) and
`chat_verbose()` (returns provider, model, latency) are also available.

Check what your `.env` actually configures, without spending a token:

```bash
python scripts/probe_provider.py --models
```

---

## Discovery

### Sources

| Source | Kind | Contributes |
|--------|------|-------------|
| `nse-current-issue` | JSON API | live issues: symbol, price band, share count, dates |
| `nse-upcoming-ipo` | JSON API | forthcoming mainboard issues |
| `nse-upcoming-sme` | JSON API | forthcoming SME issues |
| `chittorgarh-dashboard` | HTML table | breadth — issues NSE hasn't published yet |

Each source is an adapter behind a `Protocol`, so one can be added, reordered or
dropped without touching the discovery loop. Notes:

- **A dead source degrades the run, it never ends it.** Failures land in
  `sources_failed` and the universe is built from whatever answered. Only a total
  wipe-out (or zero listings) raises `ScoutError`.
- **Sources span two hosts** deliberately, so an NSE outage still yields a
  universe.
- **NSE's `issueSize` is a share count, not rupees.** The value in crore is
  derived as `shares × top of price band ÷ 10⁷`, which is what makes sizes
  comparable across IPOs.
- **Records are merged, not just de-duplicated.** Matching is by symbol, then by
  a normalised name (`"Tempsens Instruments (India) Limited"` and
  `"Tempsens Instruments IPO"` both key to `tempsensinstruments`). A thin record
  donates dates to a rich one, a rich one donates the symbol and size back, and
  an IPO seen on both venues becomes `Exchange.BOTH`.
- **No BSE adapter.** Every BSE endpoint probed returns an HTML block page to a
  non-browser client. Shipping a source that can't be reached would just be a
  permanent entry in `sources_failed`.

### Ranking

Transparent, LLM-free and deterministic — the same universe always produces the
same order:

| Signal | Weight | Rationale |
|--------|--------|-----------|
| Issue size | 0–50, log-scaled | primary signal; log keeps one mega-IPO from drowning the rest |
| Status | open 20, upcoming 16, unknown 6 | an open issue is the most urgent |
| Exchange | both 6, single 4, unknown 0 | dual-listing implies a mainboard issue |
| Offer document linked | 8 | unlocks the whole downstream pipeline |
| Symbol known | 3 | confirmed by an exchange, not just a dashboard |
| Dates known | 3 | schedulable |
| Corroboration | 4 | reported independently by more than one source |

An IPO that can no longer be subscribed to (`closed` / `listed` / `withdrawn`) is
**sorted below every actionable listing regardless of size** — a ₹20,000cr closed
issue is worth nothing to a subscriber. Ties break on size, then the sooner
deadline, then name, so the order is total and reproducible.

---

## Analysis

### Finding the offer document

`IPOListing.drhp_url` is almost always `None` — no discovery source publishes a
machine-readable prospectus link. So the fetch agent hunts for one, degrading in
steps rather than failing, and records every step it tried:

| Step | Source | Evidence quality |
|------|--------|------------------|
| 1 | `drhp_url` on the listing, if discovery happened to find one | `full_drhp` |
| 2 | **NSE offer-document indices** — the machine-readable index of every DRHP / RHP / prospectus NSE has received, matched by symbol then exact name | `full_drhp` |
| 3 | **Structured summary pages** — issue structure and live subscription demand, when no prospectus exists yet | `limited_source` |
| 4 | The listing itself, restated and nothing more | `metadata_only` |

Step 2 is what makes the autopilot work unattended: in the sample run it found and
downloaded a 574-page DRHP for an IPO whose `drhp_url` was `None`. Notes:

- **Zipped filings are unwrapped** — NSE serves some documents as archives.
- **Downloads are size-capped** (`FETCH_MAX_BYTES`) and a truncated document is
  refused rather than analysed, since a half-read DRHP silently loses risk factors.
- **The metadata fallback invents nothing.** It restates the discovery record and
  stops, which is why it is labelled as evidence rather than as analysis.
- **One IPO's fetch failure never ends the run.** It lands in `failures` with its
  stage, and the rest of the shortlist proceeds.

### The debate

Both agents see the same `Fact[]` and are held to the same contract:

- **Every claim must cite `Fact.id`s.** A claim citing an id the document agent
  never issued is dropped before the fact-checker ever sees it.
- **Every figure in a claim's text is exposed for checking.** The declared
  `numbers` are unioned with the numbers parsed out of the claim's own text, so
  omitting a figure from `numbers` cannot exempt it from being verified.
- **Fiscal period labels are not figures.** `FY26`, `Q3 FY26` and `fiscal 2026`
  are stripped first, or a perfectly grounded claim would be marked unsupported
  for citing a fact that doesn't contain the number 26.
- **The prompt advertises only figures the source text contains.** `Fact.numbers`
  is model output and sometimes glues two adjacent figures into one; reprinting
  that would invite a debater to argue a number the page never stated.
- The bear is explicitly pointed at concentration, litigation, leverage,
  offer-for-sale share, valuation and risk density — the surfaces that actually
  sink Indian IPOs — rather than being asked to be negative.
- Facts are selected to keep **every category represented** in the prompt. Plain
  truncation would hand the bear a window with no risk factors in it.

### The fact-checker is the eval layer

Deterministic first, and no model may overrule arithmetic:

| Condition | Status |
|-----------|--------|
| A figure in the claim appears in no cited fact's `numbers` **or** text | `unsupported` |
| `citation_ids` missing, empty, or naming an unknown fact | `unsupported` |
| Figures all trace, wording tracks the cited facts | `supported` |
| Qualitative claim loosely grounded in its citations | `partial` |
| Qualitative claim unrelated to its citations | `unsupported` |

Details that matter:

- **Digit boundaries are respected**, so `1250` is not "found" inside `12500`.
- **A number only in a fact's prose still counts.** `Fact.numbers` is model output
  too and routinely misses a figure.
- **One bad figure condemns the whole claim** — a claim is not partly true.
- An ungrounded *number* is recorded separately from a vague sentence, in
  `material_unsupported_ids`; the judge penalises it harder.
- The LLM adjudicates only the residual qualitative band, and if it is
  unavailable or replies unusably the claim settles at `partial`.

### The judge

The model rules on the verdict, scores and prose. Confidence is **not** left to
it — `adjust_confidence` derives it:

```
confidence = base × evidence_factor × unsupported_factor × material_penalty
```

| Input | Effect |
|-------|--------|
| `full_drhp` / `limited_source` / `metadata_only` | × 1.0 / 0.6 / 0.3 |
| Share of claims unsupported | × (1 − share), floored at 0.25 |
| Each ungrounded figure | × 0.85, up to four |
| A debate with nothing to check | × 0.4 |

Clamped to `[0.05, 1.0]` — never 0.00, which would read as a confident "nothing
here" rather than "we could not tell". Weak evidence also adds a caveat to the top
of `key_risks`, and a `metadata_only` memo says outright that it is **not an
analysis**.

### The artifact

`data/runs/<ts>-topn-analysis.json` carries the whole audit trail, and each IPO
also gets `reports/<ts>-<symbol>-memo.md` with every claim tagged by its
fact-check status. A [real one is committed](data/samples/sample-topn-analysis.json):

```json
{
  "run": { "stage": "analyze_topn", "analysed": 1, "failed": 0 },
  "universe_count": 23,
  "top_n": 1,
  "selected": [{ "rank": 1, "score": 64.77, "symbol": "SYMBIOTEC", "reason": "…" }],
  "fetch_stats": { "full_drhp": 1, "limited_source": 0, "metadata_only": 0, "failed": 0 },
  "providers_used": { "tabitoken:claude-opus-5": 8 },
  "partial": { "any": false, "universe": false, "analyses": false, "documents": false, "evidence": false },
  "failures": [],
  "memos": [
    {
      "rank": 1, "symbol": "SYMBIOTEC", "evidence_quality": "full_drhp",
      "memo": { "verdict": "avoid", "confidence": 0.45, "bull_score": 3.5, "bear_score": 6.5 },
      "fetch": { "attempts": ["nse-offerdocs-equities: downloaded …DRHP…pdf"] },
      "document": { "page_count": 574, "pages_analyzed": 12, "fact_count": 24 },
      "fact_check": [{ "side": "bull", "results": [{ "claim_id": "BULL002", "status": "unsupported" }],
                       "material_unsupported_ids": ["BULL002"] }]
    }
  ]
}
```

A failed IPO appears in `failures` with the stage that broke it, never as a
missing memo:

```json
{ "rank": 2, "name": "…", "symbol": "AUGMONT", "stage": "fetch", "error": "FetchError: no source found for …" }
```

`partial` distinguishes *what* degraded: a dead discovery source, a failed IPO, a
dropped page window, or thin evidence. An unattended system has to be able to say
which.

### Delivery to Telegram

Set both of these in `.env` and delivery works with no further setup:

| Variable | How to get it |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Create a bot with [@BotFather](https://t.me/BotFather); it replies with the token. |
| `TELEGRAM_CHAT_ID` | Message your own bot once, then read `result[0].message.chat.id` from `https://api.telegram.org/bot<TOKEN>/getUpdates`. |

The bot cannot open a conversation with you, which is why you have to message it
first. The token is redacted in all log output — see [Security](#security).

Telegram gets the mobile summary **plus the detailed memo file, plus the company
offer document when one was fetched** — the reading and the evidence in the same
thread, so nothing has to be looked up on a laptop later. You receive one header
message (universe size, Top N, analysed ok/failed, evidence-quality counts,
sources down), then per IPO a summary message followed by its files:

| File | Comes from | Sent as |
| --- | --- | --- |
| Bull/bear memo | the memo this run generated | `SYMBIOTEC-bull-bear-memo.md` |
| Offer document | the DRHP/RHP that was actually read | `SYMBIOTEC-offer-document.pdf` |

Then a footer naming the artifact — basename only, never a local path — and any
partial-run flags in plain language.

Files are best-effort and the summary never waits on them. If no document was
recorded you get one line saying so; if one is over Telegram's 50 MB bot limit you
get one line and the upload is skipped. Either way the text is already delivered,
and a failed upload is reported rather than swallowed.

Summaries are sent as HTML — three characters need escaping instead of
MarkdownV2's eighteen, so a missed one cannot turn into a rejected message. Long
content is chunked below Telegram's 4096-character limit, breaking only at line
boundaries. If Telegram rejects the markup anyway the message is re-sent as plain
text rather than dropped.

---

## Run unattended

One command is the whole system — scout → rank → dedup → fetch → document →
bull/bear → fact-check → judge → Telegram:

```bash
python -m app.pipeline autopilot
```

That is `analyze-topn --notify` with defaults worth scheduling: `TOP_N` from
`.env`, delivery always on, and a memory of what it already did today.

Look before you leap — this needs neither a provider key nor a Telegram token:

```bash
python -m app.pipeline autopilot --dry-run
```

```
Dedup plan for 2026-08-21 (IST):
  1. SKIP     Symbiotec Pharmalab Limited [SYMBIOTEC] - analysed today (verdict: avoid)
  2. ANALYSE  Augmont Enterprises Limited [AUGMONT]

1 of 2 would be analysed and delivered.
(dry run: no LLM calls, no Telegram, no state written.)
```

### Dedup: what "already done today" means

`data/state/last_runs.json` records every IPO that was **successfully** analysed,
keyed by symbol and by normalised name, with the calendar date **in IST**:

- **Scout and rank always re-run.** They are cheap, they are the only way to
  notice a new listing, and a stale shortlist is worse than a redundant one.
- **A symbol with a memo from today is skipped**, and the reason is printed, put in
  the run artifact, and counted in the Telegram header (`Skipped: 1`) so a short
  digest explains itself instead of looking like silent failure.
- **Tomorrow it is eligible again.** The key is a date, not a flag, so nothing can
  be skipped forever. Records older than 30 days are pruned.
- **`--force` ignores all of it.**

Two details that are load-bearing:

- **The day is the Indian one.** IST is UTC+5:30, so the day flips at 18:30 UTC. A
  UTC-keyed autopilot would treat a 19:00 UTC run and a 06:00 UTC run the next
  morning as different days when they are the same Indian day — and as the same day
  when they are not. Both directions are covered by tests.
- **Only successes are recorded.** An IPO whose prospectus 404s at 06:00 is retried
  at noon rather than written off for the day.

A digest is sent when there is at least one fresh memo. What is left over is a
shortlist that has merely been *reordered* while containing no new research, and
sending that is how a useful bot becomes a muted one. When a digest is withheld the
reason is printed:

```
autopilot: 2026-08-21 IST
  analysed : 0
  skipped  : 1
             already analysed today (verdict: avoid)
  telegram : not sent - this shortlist was already delivered today
```

State is written *before* delivery, deliberately: if Telegram is down, the analyses
are still on disk, and a retried run an hour later must not pay for them a second
time — `notify-last` sends the existing artifact for free. A corrupt or missing
state file logs a warning and starts fresh; it never stops a run, because losing
the memory costs one redundant analysis while raising would cost every scheduled
run from then on, silently.

### Scheduling it

`scripts/autopilot.py` is the portable entrypoint every scheduler runs. It puts the
project root on `sys.path`, forwards your arguments to the `autopilot` subcommand,
and exits with that subcommand's code — `0` ran as intended (including "nothing new
today"), `1` tried and failed, `2` is misconfigured.

It needs no working directory set: `.env`, `data/`, `reports/` and the state file
are all resolved from the package location, not the cwd (`app/config.py:16`). Only
a log redirect is relative, so use an absolute path for that.

#### Windows — Task Scheduler

`scripts\autopilot.cmd` is the thing to schedule. It finds the
project's own `.venv` interpreter (falling back to `python`), forces UTF-8 output,
forwards your arguments, and returns the exit code so the task history shows a
failure as a failure.

**Task Scheduler** → *Create Task*:

| Tab | Setting |
| --- | --- |
| General | name it; *Run only when user is logged on* is simplest — *whether user is logged on or not* needs the account password stored |
| Triggers | *New* → Daily → 09:15, recur every 1 day |
| Actions | *New* → *Start a program* → Program: `<repo>\scripts\autopilot.cmd` → **Start in: `<repo>`** |
| Settings | tick *Run task as soon as possible after a scheduled start is missed* |
| Conditions | on a laptop, untick *Start the task only if the computer is on AC power*; tick *Wake the computer to run this task* |

The trigger time is the machine's local clock. On an IST machine 09:15 is early
enough to beat the 10:00 IST open; elsewhere, pick the wall-clock time that lands
in the Indian morning.

**Start in** is belt and braces: every path the project reads or writes derives
from the package location, not the working directory, so the run is already
independent of where it was launched — the entrypoint does no `chdir`.

To keep a transcript of every run instead of losing it to a closed window, set
Program to `cmd.exe` and Arguments to (one line, quotes included):

```
/c "<repo>\scripts\autopilot.cmd >> <repo>\logs\autopilot.log 2>&1"
```

`logs\` is committed but its contents are gitignored, so the redirect works on day
one and never lands a run transcript in version control.

Verify the task without waiting for tomorrow:

```bat
schtasks /run /tn "Bull-Bear Autopilot"
```

`Last Result: 0` is success. `2` means credentials — check `.env`.

#### Linux and macOS — cron

Run it by hand once from the activated venv before you schedule anything:

```bash
python scripts/autopilot.py --top-n 3
```

Then open your crontab:

```bash
crontab -e
```

And add one line — 09:15 daily, absolute paths throughout, output appended to the
log:

```cron
15 9 * * * /path/to/bull-bear/.venv/bin/python /path/to/bull-bear/scripts/autopilot.py --top-n 3 >> /path/to/bull-bear/logs/autopilot.log 2>&1
```

Three things about cron that bite people:

- **cron's `PATH` is almost empty and no venv is active**, so naming
  `.venv/bin/python` explicitly is not optional. There is no `activate` step in a
  cron job — that is why the line above uses absolute paths and no `cd`.
- **`%` is special in crontab.** Everything after the first unescaped `%` is fed to
  the command as stdin, not run as part of it. No `%` appears above; if you add one
  (a `date +%F` in the log name, say), escape it as `\%`.
- **cron does not set a locale**, so a UTF-8 stream is not guaranteed. The pipeline
  reconfigures its own streams, but a crash during import would report itself in the
  wrong encoding — the one thing the line above does *not* already handle. Add
  `PYTHONIOENCODING=utf-8` on its own line above the schedule.

`logs/` is committed but its contents are gitignored, so the redirect works on day
one and never lands a run transcript in version control.

Check it is registered, and watch the next run:

```bash
crontab -l
```

```bash
tail -f /path/to/bull-bear/logs/autopilot.log
```

The schedule uses the machine's local clock. On an IST machine 09:15 beats the
10:00 IST open; elsewhere pick the wall-clock time that lands in the Indian
morning. To pin it to Indian time instead of recomputing after every DST change,
put `CRON_TZ=Asia/Kolkata` on its own line above the schedule (Linux; macOS's cron
reads `TZ=`).

**macOS** ships cron and the line above works as-is, with two caveats. A cron job
touching files under `Documents` or `Desktop` needs *Full Disk Access* granted to
`/usr/sbin/cron` in *System Settings → Privacy & Security*; keeping the repo
elsewhere avoids that entirely. And cron does not wake a sleeping Mac — for that,
use a launchd agent with `StartCalendarInterval`, or leave `pmset repeat` to wake
the machine a few minutes before the job.

#### systemd timer

If you would rather have journald keep the transcript, drop the redirect and let
`journalctl --user -u bull-bear` do it:

```ini
# ~/.config/systemd/user/bull-bear.service
[Unit]
Description=Bull/Bear Autopilot

[Service]
Type=oneshot
Environment=PYTHONIOENCODING=utf-8
ExecStart=/path/to/bull-bear/.venv/bin/python /path/to/bull-bear/scripts/autopilot.py --top-n 3
```

```ini
# ~/.config/systemd/user/bull-bear.timer
[Unit]
Description=Run Bull/Bear Autopilot every morning

[Timer]
OnCalendar=*-*-* 09:15:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl --user daemon-reload && systemctl --user enable --now bull-bear.timer
```

`Persistent=true` is the equivalent of Task Scheduler's *run as soon as possible
after a missed start* — a laptop that was asleep at 09:15 runs the job when it
wakes. A **user** timer only fires while that user is logged in unless you enable
lingering (`sudo loginctl enable-linger $USER`).

```bash
systemctl --user list-timers bull-bear.timer
```

No extra infrastructure, paid or otherwise: the OS scheduler is more reliable than
an in-process timer that dies with the terminal, so there is deliberately no
long-running daemon to babysit.

---

## Layout

```
bull-bear/
├── app/
│   ├── config.py            typed settings from .env (single source of truth)
│   ├── models.py            Pydantic domain models — the contracts between agents
│   ├── pipeline.py          stage orchestration + CLI
│   ├── state.py             what the autopilot remembers between runs (dedup)
│   ├── llm/
│   │   ├── router.py        provider cascade, retries, failover, logging
│   │   └── client.py        the one entry point agents may use
│   ├── agents/
│   │   ├── scout.py         public sources ──▶ merged IPOListing[]
│   │   ├── ranker.py        transparent scoring ──▶ Top N + reasons
│   │   ├── fetch.py         hunt the offer document ──▶ graded FetchedSource
│   │   ├── document.py      offer document ──▶ grounded Fact[]
│   │   ├── debate.py        shared claim contract for both sides
│   │   ├── bull.py          the case FOR subscribing ──▶ AgentBrief
│   │   ├── bear.py          the case AGAINST ──▶ AgentBrief
│   │   ├── fact_checker.py  every claim vs its cited facts (the eval layer)
│   │   └── judge.py         the ruling + arithmetic confidence ──▶ JudgeMemo
│   ├── utils/
│   │   ├── pdf_extract.py   page-ranged text + table extraction
│   │   ├── html_table.py    stdlib-only <table> reader
│   │   └── normalize.py     messy source text ──▶ dates, money, dedup keys
│   └── delivery/
│       ├── markdown.py      JudgeMemo ──▶ the cited memo file
│       └── telegram.py      analysis ──▶ escaped, chunked Bot API messages
├── data/samples/            committed fixtures: a sample DRHP, a real run, its memo
├── data/cache/              downloaded offer documents (gitignored)
├── data/runs/               run artifacts (gitignored)
├── data/state/              last_runs.json — the dedup memory (gitignored)
├── docs/screenshots/        README images
├── logs/                    scheduled-run transcripts (gitignored)
├── reports/                 rendered memos (gitignored)
├── scripts/
│   ├── autopilot.py         portable scheduler entrypoint (exits nonzero on failure)
│   ├── autopilot.cmd        Windows Task Scheduler wrapper
│   ├── demo_dry_run.py      the whole pipeline's shape, no credential needed
│   └── probe_provider.py    which providers answer, and what they publish
└── tests/                   568 tests, fully offline
```

### Data model

| Model | Role |
|-------|------|
| `IPOListing` | one discovered IPO, pre-analysis |
| `FetchedSource` | what the fetch agent found, and how good it is |
| `Fact` | grounded statement from the document, with page + numbers |
| `DocumentExtraction` | all facts from one PDF, plus how much of it succeeded |
| `Claim` | an argument, citing `Fact.id`s |
| `AgentBrief` | one side's full case (`bull` \| `bear`) |
| `FactCheckResult` | supported / partial / unsupported / contradicted / unverifiable |
| `FactCheckReport` | one side's results, plus which failures were *material* |
| `JudgeMemo` | verdict, confidence, bull & bear scores, risks, positives |
| `DailyDigest` | one autopilot run, ready to deliver |

Models use `extra="forbid"`, so an LLM inventing a field fails loudly instead of
smuggling junk downstream. `Fact.numbers` and `Claim.numbers` normalise messy model
output (`"1,234.5"`, `"12%"`, `"₹450"`) to floats, which is what lets the
fact-checker compare a claim's figures against its cited facts. Several figures
packed into one string (`"1500,20300,21800"`) are read as a list rather than as one
number with thousands separators — Indian grouping (`14,20,00,000`) still parses as
a single figure.

`models.py` holds only the contracts that cross agent boundaries. A stage's own
result type lives with the stage — `ScoutResult` in `scout.py`, `RankedIPO` and
`RankingResult` in `ranker.py`.

`state.py` is the deliberate exception: `RunState`, `SymbolRecord` and
`DigestRecord` use `extra="ignore"`, because they describe a *file on disk* that a
future version will add fields to. A strict model there would turn a
forward-compatible file into a crashed scheduled run.

---

## Design notes

- **Agents never import a provider.** Only `app.llm.client` knows providers exist,
  so swapping models or reordering the cascade never touches agent code.
- **Settings are injected, not ambient.** Every entry point takes `settings=`;
  ambient environment keys can't silently override a caller's configuration.
- **Grounding over fluency.** The document agent is told to extract only what the
  text literally supports, and a page number the model never saw is rejected rather
  than recorded as a citation.
- **DRHPs are huge**, so extraction is page-ranged (`DOC_MAX_PAGES`) and analysed in
  windows (`DOC_PAGES_PER_CHUNK`); one failed window degrades the run to `partial`
  instead of killing it.
- **Partial beats absent, but silence is never success.** A single dead source or
  page window degrades a run; a total failure raises. The distinction is the whole
  point of an unattended system.
- **The eval layer never defers to a model on arithmetic.** An unmatched figure is
  `unsupported`, and no adjudicating LLM can overrule that.
- **Prompts advertise only what the source says.** Numbers the extractor produced
  that don't appear in the fact's own text are left out of the debate prompt — a
  model that sees a glued figure will happily argue it.
- **No vendor SDKs.** Seven providers, all plain REST over `httpx`, so there is no
  SDK version to pin and no client library between the code and the wire.
- **Tests are hermetic.** `conftest.py` strips every credential from the environment
  and disables `.env` loading for the whole session, because pytest prints fixture
  values verbatim in failure dumps and a leaked key in a CI log is a real incident.

## Known limitations

Written down rather than smoothed over, because most of them bound how much the
verdicts are worth:

- **Only the first N pages of a DRHP are read.** The sample run read 12 of 574
  pages: the cover, capital structure and the start of the risk factors. The
  financial statements and the bulk of the litigation sections are hundreds of pages
  deeper. Verdicts from a shallow run reflect what was read, which is why the memo
  prints `pages_analyzed` alongside the ruling.
- **Weak extractors glue adjacent figures, and the eval layer charges for it.** On
  free models, `"₹1,500.00 million … face value of ₹2 each"` comes back as
  `1500.002`, and across three live runs on the same DRHP, 24% / 43% / 80% of
  declared fact numbers did not appear in the fact's own text. Glued figures are
  kept out of the debate prompt, and the parser no longer creates them itself, but a
  figure the model declares and never writes down is still checked — so confidence
  lands low on evidence that is mostly sound. **Read a low-confidence verdict as
  "the extractor was sloppy" at least as much as "the IPO is weak."** The fix is a
  stronger model, not a laxer checker.
- **A correct inference can still be marked unsupported.** If the document states
  ₹12,500m and ₹6,000m separately, a claim citing their ₹18,500m sum fails, because
  the checker cannot distinguish sound arithmetic from a hallucinated total. That is
  the intended trade — see [the sample verdict](#a-sample-verdict-explained) — but it
  does mean `unsupported` sometimes means "unstated" rather than "wrong".
- **Free-tier token ceilings, not code, are the practical cap on depth.** Groq's
  free tier allows 8,000 tokens/minute, so a 6-page window (~19k tokens) is rejected
  with HTTP 413 — which is *not* retryable, so that window is lost rather than
  delayed. `DOC_PAGES_PER_CHUNK=1` fits the ceiling. Depth here is a billing
  question, not an engineering one.
- **No BSE**, so a BSE-only issue is invisible. Every BSE endpoint probed blocks
  non-browser clients.
- **The HTML dashboard is a scraped layout**, not an API. A redesign shows up as that
  source contributing zero listings, not as a crash — but the breadth is lost until
  the adapter is updated.
- **Issue size for dashboard-only records is unknown**, so those listings score 0 on
  the primary signal and sit below anything NSE has confirmed. Honest, but it does
  mean a large IPO ranks low until NSE publishes it.
- **No prospectus for an IPO NSE hasn't indexed yet.** Those degrade to
  `limited_source` or `metadata_only`, and confidence is discounted accordingly
  rather than the IPO being skipped.
- **No OCR**: scanned, image-only PDFs are rejected with a clear error. Table
  extraction is heuristic, and a fact spanning a page-window boundary can be missed.
- **The scheduler only fires while the machine is awake.** There is no cloud
  component by design. Dedup makes a late run harmless: it does the day's work once,
  whenever it happens.
- **Dedup is per day, not per document.** An IPO analysed at 09:15 on
  `metadata_only` evidence is not re-read if its DRHP appears at 14:00 the same day
  — `--force` is the escape hatch. Keying on evidence quality would fix it, and would
  also be a way to spend money on the same IPO five times.

---

## Security

**Never commit a real credential.** All secrets live in `.env`, which is
gitignored. `.env.example` is the committed template and contains no values — only
variable names and comments describing the shape of what goes there.

```bash
cp .env.example .env      # then fill in .env, never .env.example
```

Before your first push:

```bash
git check-ignore -v .env
```

If that prints nothing, **stop** — `.env` is not being ignored and a push would
publish it.

Assignments in `.env.example` are deliberately left **blank** rather than filled
with dummy values. Blank is how the router is told to skip a provider; a
placeholder string like `your-key-here` would make that provider fail on every
call instead of being skipped.

What the code does, enforced by tests rather than intentions:

- **Keys travel in headers, never in URLs**, because `httpx` logs every request URL
  at `INFO` and a key in a query string would land in `logs/autopilot.log`.
- **The Telegram token is redacted in log output.** It appears in the Bot API's URL
  path by design, so it is rewritten to `bot<redacted>` before anything is logged.
- **Failures never print the credential** — only the status and a truncated body.
- **Run artifacts contain no credentials.** `data/runs/*.json` and `reports/*.md`
  record which provider *name and model* served each call, never the key.
- **The test suite is hermetic**, and the guard keys off field-name suffixes, so a
  newly added `*_api_key` setting is covered automatically.

Full detail, including a rotation table for every credential and a note on what
leaves your machine, is in **[SECURITY.md](SECURITY.md)**.

---

## Disclaimer

**This is not investment advice.** It is a software engineering portfolio project
that demonstrates an autonomous, self-auditing research pipeline.

- Nothing it produces is a recommendation to buy, sell or subscribe to any
  security. Verdicts are the output of a language model reading a fraction of a
  prospectus, and they are wrong in ways the confidence score only partly captures.
- The author is not a registered investment adviser or research analyst under SEBI
  regulations or any other regime, and this software is not a research report.
- Sample outputs under `data/samples/` name a real issuer and reach an `avoid`
  verdict on 12 of 574 pages of its public filing. That is a demonstration of the
  pipeline, not a considered opinion about that company.
- Data comes from public sources that can be stale, incomplete or wrong, and the
  pipeline can misread even correct data.
- Do your own research and consult a qualified adviser before investing. Use at
  your own risk.

## License

[MIT](LICENSE).
