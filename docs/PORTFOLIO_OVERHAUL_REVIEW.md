# Portfolio overhaul review — 2026-10-31

Current branch: `feat/portfolio-overhaul-v2`. All redesign/revision changes are uncommitted for review. No push, merge or deployment. Main remains at `cf553fdee56f91fab03fd941f7cb26885514d314`.

## Current result

- Rank label is now **First Rank in CSE, NIT**, with Nehru Institute of Technology identified in the adjacent education/About evidence.
- Added the user-confirmed **330+ LeetCode DSA problems** achievement to the hero, dedicated Achievements section and assistant corpus. The separate AI LeetCode Agent project still has **230+ accepted**; its evidence and metrics were not changed.
- Rebuilt navigation with identity/role, a compact-on-scroll layout, current-section indicator, animated hover state, reading progress, search, theme, resume, assistant entry and an animated keyboard-accessible mobile menu.
- Rebuilt the hero with staggered entrances, an ambient accent field, an orbiting BPG avatar, hover/lift feedback and a project proof explorer. The explorer uses existing VeraScan, Bull/Bear and CertiRoute results, including the live miss. On mobile, the proof strip precedes the larger explorer panel. Reduced motion renders content immediately.
- Kept the factual About story, clear section hierarchy, project order, complete summaries/caveats, internship details from the supplied resume, academic prominence, 12 certifications, contact links, SEO metadata, robots and sitemap.
- The assistant now has inline source links, citation chips, follow-up prompts, Stop, retry, copy, clear, keyboard focus handling and an accessible conversation log. The broken public key-saving form was removed.
- Retrieval prioritizes named projects, separates personal DSA achievements from the agent project, returns only deployed apps for live-app questions, resolves follow-ups from validated citations and respects explicit topic changes.
- Server validation bounds request size, question length, history and citation destinations. Guards check unsupported numbers (including small values), URLs, citation indices and numbers against their cited source. Explicit safeguards preserve the SPY tie and CertiRoute's live miss. Failed validation returns original source facts with citations.
- Groq is preferred, with bounded model/provider fallback, cancellation and a total provider budget of 12 seconds. Keys remain server-side. A working Groq key was already configured locally and was exercised without displaying or changing it. Public status says configured, rather than claiming that availability is guaranteed.
- No dependencies, fonts, stock images or new colours were added. The logo uses an existing dark palette colour behind it for light-theme contrast.

## Backup and rollback

Original HEAD/tag `backup-2026-10-31-pre-redesign`:
`cf553fdee56f91fab03fd941f7cb26885514d314`

Backup branch `backup/pre-redesign-2026-10-31`:
`cb198eddaf3db1e0a29a25c5d1abb6655f4bb32a`

The initial dirty resume replacement was committed only to the backup branch before the feature branch was created. Original folder backup: `A:\balamuruganpg-backup-2026-10-31`. Its `BACKUP.md` records both SHAs and rollback commands. All 190 copied project files were SHA-256 verified with zero mismatches; node_modules and .git were excluded.

An additional filesystem snapshot of the first review state was saved before this revision at `A:\balamuruganpg-backup-before-header-agent-2026-10-31` (excluding node_modules, .git and .next).

Run in `A:\Portfolio` to preserve all review work and return to the original backed-up working state:

```powershell
git stash push --include-untracked -m before-rollback
git switch backup/pre-redesign-2026-10-31
```

To inspect the original committed state after preserving changes:

```powershell
git switch --detach backup-2026-10-31-pre-redesign
```

## File-by-file changes

| File | Final change |
| --- | --- |
| .env.example | Documents server-only Groq configuration and optional alternate providers. No secret values. |
| README.md | Correct resume URL, provider setup, fallback behavior and assistant/browser test commands. |
| content/resume.md | Requested rank wording and user-confirmed personal DSA achievement for grounding. |
| package.json | Adds test:assistant and test:guards commands; dependencies unchanged. |
| src/components/Hero.tsx | Animated identity-led hero, exact requested statement, availability, existing actions, BPG avatar, interactive evidence and linked proof strip. |
| src/components/About.tsx (new) | Four factual first-person paragraphs, six quick facts and explicit rank wording. |
| src/app/page.tsx | Section hierarchy, legibility, academic rank, factual internship bullets, achievements, readable certification cards, architecture and complete contact/footer. |
| src/components/Nav.tsx | Full navigation redesign, scroll behavior, hover/current states, responsive animated menu and keyboard controls. |
| src/components/CommandPalette.tsx | About and Achievements destinations. |
| src/components/Assistant.tsx | Redesigned conversation interface, inline citations, suggestions, cancellation/retry/copy/clear and focus handling; removes browser key storage/form. |
| src/components/Projects.tsx | Accessible pressed-state filters, selected background, wrapping badges and unclipped descriptions; order and citation IDs preserved. |
| src/components/SkillsSection.tsx | Readable descriptions, heading hierarchy and accessible selected controls. |
| src/components/motion.tsx | Static shared Reveal avoids the reduced-motion hydration bug that could leave evidence transparent. Hero/nav use their own bounded motion. |
| src/app/globals.css | Shared finishing, wrapping, contrast, skip link, hero entrance, orbit and ambient animations with reduced-motion overrides. |
| src/app/layout.tsx | Author/robots/social metadata and keyboard skip link; canonical and Person schema retained. |
| src/app/robots.ts (new) | Crawler rules and sitemap discovery. |
| src/app/sitemap.ts (new) | Canonical homepage sitemap. |
| src/app/api/chat/route.ts | Bounded JSON validation, rate limiting, grounded retrieval, validated generation and honest extractive fallbacks; no public key-writing route. |
| src/data/site.ts | Requested rank label, personal achievements, exact hero line, corrected resume path and resume-backed internship bullets. Existing project data remains unchanged. |
| src/lib/corpus.ts | Grounded achievements and internship detail with existing citation destinations. |
| src/lib/retrieve.ts | Explicit-project and live-app retrieval, personal DSA distinction and strict numeric checking. |
| src/lib/agent.ts (new) | Validated history/follow-ups, source-marker/URL/numeric/caveat validation and assistant instructions. |
| src/lib/providers.ts (new) | Server-only provider selection, Groq model fallback, total deadline and cancellation; sanitized failures. |
| scripts/e2e.mjs | Updated PDF assertions and a SPY-tie/holdout assertion that recognizes explicit denials of beating buy-and-hold. |
| scripts/assistant-test.mjs (new) | Deterministic retrieval, guard, history and provider regression checks, without a key or network. |
| scripts/header-agent-e2e.mjs (new) | Six viewport/theme checks, proof interaction, current navigation, keyboard menu and assistant copy/clear/follow-up/stop/retry/API validation. |
| scripts/overhaul-qa.mjs (new) | Original responsive/content/anchor/PDF/crawler checks, updated to exclude clipped aria-hidden decorations from overflow checks. |
| docs/superpowers/plans/2026-10-31-portfolio-overhaul.md (new) | Implementation plan and revision scope. |
| docs/PORTFOLIO_OVERHAUL_REVIEW.md (new) | This complete handoff. |

## Validation

- `npm run build`: PASS. Homepage 34.1 kB; first-load JS 180 kB. Eight routes, including robots and sitemap.
- `npx tsc --noEmit`: PASS.
- `npm run test:assistant`: 24/24 PASS, including deterministic provider failures/cancellation with mocked fetch.
- `npm run test:guards`: 5/5 PASS.
- `node scripts/header-agent-e2e.mjs`: 14/14 browser groups PASS at 375, 768 and 1440 px in light/dark. No horizontal document overflow, no page errors; reduced motion, proof explorer and keyboard/conversation controls passed.
- Final `npm run test:e2e`: 54/54 PASS on the production build, including live answers and citation jumps, with no browser console errors.
- `git diff --check`: PASS. No standalone lint script/configuration exists; build's configured checks and TypeScript were run.
- Actual Groq smoke tests returned cited generated answers for VeraScan and CertiRoute. The latter retains offline and live figures and the missed target. Guarded responses return original facts rather than unchecked prose.
- All project records, project order, numeric results, skill facts and the 12-item certification list remain unchanged, checked against the backup branch.
- Resume controls serve the supplied local PDF; actual browser download filename is verified. Existing account/social/mail links are retained. GitHub responded successfully; LinkedIn (999) and LeetCode (403) blocked automated checks in the initial audit, so their remote page contents were not independently confirmed.

Preview: `http://localhost:3000/`. Latest screenshots are in ignored `scripts/header-v3-*.png` files. Keys are configured in ignored `.env.local`; restart the server after changing them. Model choices and request fields were checked against https://console.groq.com/docs/models and https://console.groq.com/docs/api-reference. Gemini fallback configuration was checked against https://ai.google.dev/gemini-api/docs/models.

## TODOs and limits

No TODO comments were left. Generative accuracy is not provable from a finite suite; the assistant returns original cited facts when verification fails. Rate limiting is in memory per server instance.

Pre-existing evidence discrepancies remain for owner review: content/resume.md describes four thoracic classes while the project record and supplied PDF describe five; the supplied PDF lists 13 certifications while the required site list contains 12. The PDF itself was not edited. The new personal DSA count comes from the user's latest explicit update and is distinct from the agent project's metric.

The comparison website could not be fetched in the original audit. No wording or assets were copied from it.

## Git diff --stat

This tracked-file output excludes the ten new untracked files listed above.

```text
 .env.example                      |  12 +-
 README.md                         |  18 +-
 content/resume.md                 |   6 +-
 package.json                      |   4 +-
 scripts/e2e.mjs                   |   6 +-
 src/app/api/chat/route.ts         | 400 ++++---------------------------
 src/app/globals.css               |  42 ++++
 src/app/layout.tsx                |   6 +
 src/app/page.tsx                  | 100 ++++----
 src/components/Assistant.tsx      | 493 ++++++++------------------------------
 src/components/CommandPalette.tsx |   2 +
 src/components/Hero.tsx           | 342 +++++---------------------
 src/components/Nav.tsx            | 140 +++++------
 src/components/Projects.tsx       |  18 +-
 src/components/SkillsSection.tsx  |  12 +-
 src/components/motion.tsx         |  20 +-
 src/data/site.ts                  |  15 +-
 src/lib/corpus.ts                 |  18 +-
 src/lib/retrieve.ts               |  18 +-
 19 files changed, 453 insertions(+), 1219 deletions(-)
```
