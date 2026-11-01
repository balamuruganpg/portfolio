# RAG and guardrail review — 2026-11-01

The approved design is preserved at commit `b30723c48a1c3de61988d4fdd4c41be49a217a12`, branch `backup/approved-design-2026-10-31`, tag `backup-approved-design-2026-10-31`. Its full filesystem backup is `A:\balamuruganpg-approved-design-backup-2026-10-31`; 252 files were SHA-256 verified with zero mismatches. Node modules and Git metadata were excluded; source, assets, configuration and build output were retained.

Restore the approved design while preserving subsequent work:

```powershell
git stash push --include-untracked -m before-approved-design-rollback
git switch backup/approved-design-2026-10-31
```

## What changed

- Separate server-only RAG in src/lib/rag and content/rag. The public page fact file is unchanged byte-for-byte from the approved commit.
- 25 indexed sources, covering all 17 portfolio repositories, their README files and four selected architecture/evaluation documents, GitHub profile metadata, VeraScan PyPI documentation and selected career/skills/experience passages from two resume pages.
- 396 heading-aware passages with BM25 ranking, heading weighting, bounded query expansion, explicit-project scoping, citation-aware follow-ups and a fixed context budget. New documentation terms can discover a project even when absent from its short page summary. This is sparse RAG, not embeddings or a vector database.
- Immutable GitHub commit and source-line citations. Snapshot hashes and revisions are recorded. The owner controls source refresh; chat requests cannot crawl URLs, execute code, write data or access configuration.
- 96 sections excluded conservatively by policy. Reasons are recorded in index.json. An excluded section is not asserted to be false: it may contain numbers outside the owner's frozen evidence, instruction-shaped content or credential-shaped text. It is held for owner review.
- Credential-shaped strings are redacted before snapshot storage. The stored snapshot hash covers sanitized text. The original upstream commit identifies the source; three matching strings in one README are redacted. No real environment key was displayed, changed or copied into the RAG index.
- LinkedIn returned HTTP 999 for the exact linked account. No search snippets, similarly named accounts, follower counts or inferred credentials were imported. The user will supply profile text; the import format is ready. Until then the assistant explicitly marks the source unavailable and supplies only the existing verified profile link.
- Assistant source coverage disclosure, original-source links alongside portfolio-card citations, snapshot date and unavailable-source status.
- Subtle idle ambient drift, pointer-following accent light and a desktop hero constellation using the existing palette/components. Mobile has no canvas. Reduced motion disables animation/pointer tracking; hidden tabs stop the effects. The approved layout and page facts remain intact.

## Guardrail audit

The audit reproduced and fixed crafted failures involving:

1. A denial masking a later affirmative SPY outperformance claim.
2. Counts relabelled as percentages.
3. Percent spelled out to evade unit checking.
4. Digits in source URLs being used as authority for metrics.
5. Unsupported counts spelled out as words.
6. A shortened URL prefix accepted as a source destination.
7. Credential-shaped output.
8. HTML output.
9. Personal 330+ LeetCode DSA count assigned to the AI LeetCode Agent.
10. The CertiRoute live miss being negated.
11. RAI-Axiom overview omitting co-author attribution.

The guards also test invalid citation indices, uncited output, cross-source numeric borrowing, forged citation history, malformed input, source injection, prompt extraction, arbitrary URL requests, provider cancellation/fallback and unavailable-source handling. RAI-Axiom overview answers must credit Balamurugan P G and Jason Pandian. Failed generated answers are withheld and replaced with original cited facts.

These are tested constraints, not a proof that every possible hallucination or paraphrase can be detected. In-memory rate limits remain per server process. Imported performance claims do not automatically supersede approved metrics. Resume education/project/certification/achievement sections with known stale or conflicting counts are not used to overwrite the approved site data; personal-information/declaration sections are not indexed.

## Files

| Path | Purpose |
| --- | --- |
| src/lib/rag/core.ts | Source policy, text normalization/chunking, query checks and BM25 index/ranking. |
| src/lib/rag/search.ts | Approved-evidence precedence, project/context scoping, follow-ups and bounded retrieval. |
| src/lib/rag/server.ts | Server-only local index loading, source URL validation and public coverage metadata. |
| content/rag/index.json | Reproducible source manifest, passage index and exclusion record. |
| content/rag/snapshots/*.txt | 25 sanitized, versioned source snapshots (inventory below). |
| content/rag/README.md | Source policy, refresh/verify commands and limitations. |
| content/rag/imports/README.md | Optional owner-provided LinkedIn import format. |
| src/lib/agent.ts | Stricter URL/output/attribution/caveat validation, valid shared-destination citations and source precedence instructions. |
| src/lib/retrieve.ts | Percent units, cardinal count words, numeric ranges and URL digit handling. |
| src/lib/corpus.ts | Evidence provenance and authority metadata. |
| src/app/api/chat/route.ts | RAG integration, pre-generation request checks, unavailable LinkedIn response, source-aware generation and fallback. |
| src/components/Assistant.tsx | Source coverage details and safe external source citation links. |
| src/components/BackgroundMotion.tsx | Passive ambient/pointer field and responsive hero constellation lifecycle. |
| src/components/Hero.tsx | Existing constellation component mounted behind the approved hero. |
| src/components/Providers.tsx | Removes the old glow that was hidden behind the page background. |
| src/app/globals.css | Subtle background animation and reduced-motion/mobile rules. |
| src/app/page.tsx | Background stacking and accurate RAG architecture explanation; approved page facts unchanged. |
| scripts/rag-runtime.mjs | Reuses installed TypeScript for owner-run sync/test tooling. |
| scripts/rag-sync.mjs | Fixed allowlist, immutable source retrieval, redaction, PDF extraction and index generation. |
| scripts/rag-verify.mjs | Snapshot hash checks, credential scan, deterministic index rebuild and repository coverage. |
| scripts/rag-test.mjs | Deterministic RAG/source-policy regressions. |
| scripts/guardrails-e2e.mjs | Adversarial live API probes and documentation-citation checks. |
| scripts/assistant-test.mjs | Expanded deterministic guard/attribution regressions. |
| package.json | Sync/rebuild/verify/RAG/API test commands; dependencies unchanged. |
| README.md | RAG usage and source policy documentation. |
| docs/superpowers/plans/2026-10-31-rag-guardrails.md | Scope and verification plan. |
| docs/RAG_GUARDRAIL_REVIEW.md | This review record. |

## Validation

- Production build: PASS. Homepage 36.1 kB, first-load JavaScript 182 kB. No new dependencies.
- TypeScript: PASS.
- Assistant deterministic checks: 36/36 PASS.
- Original answer-guard checks: 5/5 PASS.
- RAG tests: 18/18 PASS.
- Live API adversarial groups: 10/10 PASS.
- Existing end-to-end suite: 54/54 PASS, no console errors.
- Responsive/assistant browser groups: 14/14 PASS at 375/768/1440 px in both themes.
- Source integrity: 25 stored-snapshot hashes and all 17 repositories verified; all 396 passages reproduced. No credential-shaped values remain in saved snapshots.
- Background checks: desktop canvas and pointer field active; no mobile canvas or horizontal overflow; reduced motion disables effects; resizing activates/deactivates the constellation correctly. Desktop/mobile visuals inspected.
- The server deployment trace includes content/rag/index.json; the knowledge index is not imported by browser components.
- No new TODO comments. LinkedIn ingestion is pending the text the owner offered to provide.

## Source inventory

| Source | Status | Revision (short) | Original URL |
| --- | --- | --- | --- |
| GitHub profile | indexed | 2026-10-31T1 | https://github.com/balamuruganpg |
| AI LeetCode Agent · README.md | indexed | f4c93aa99254 | https://github.com/balamuruganpg/ai-leetcode-agent/blob/f4c93aa99254ec9948e7328987b069adb215dbca/README.md |
| Bull/Bear Autopilot · README.md | indexed | 5049d2086952 | https://github.com/balamuruganpg/bull-bear-autopilot/blob/5049d2086952b6a67e4b7714c8f90f475a432f7a/README.md |
| CertiRoute · ARCHITECTURE.md | indexed | 00ca7775b2cb | https://github.com/balamuruganpg/CertiRoute/blob/00ca7775b2cb1ee032b2523a5befa5bb7f1e5f4c/ARCHITECTURE.md |
| CertiRoute · EVALUATION.md | indexed | 00ca7775b2cb | https://github.com/balamuruganpg/CertiRoute/blob/00ca7775b2cb1ee032b2523a5befa5bb7f1e5f4c/EVALUATION.md |
| CertiRoute · README.md | indexed | 00ca7775b2cb | https://github.com/balamuruganpg/CertiRoute/blob/00ca7775b2cb1ee032b2523a5befa5bb7f1e5f4c/README.md |
| ChurnGuard Pro · README.md | indexed | dbb029f448f4 | https://github.com/balamuruganpg/Customer-Churn-Prediction-Dashboard/blob/dbb029f448f4f134875ee80ba5bf662ec003a276/README.md |
| DBSCAN Clustering · README.md | indexed | 1ff893ffba29 | https://github.com/balamuruganpg/DBSCAN-Height-Weight-Clustering/blob/1ff893ffba29d6cfee36177c0245e882ecdd2862/README.md |
| Hierarchical Clustering · README.md | indexed | 49fc2c78c09f | https://github.com/balamuruganpg/Hierarchical-Clustering-Height-Weight/blob/49fc2c78c09fc796334c0f9d12e1adcc6a12e867/README.md |
| Household Power RNN · README.md | indexed | 07de3b3d0858 | https://github.com/balamuruganpg/Household-Power-Consumption-RNN/blob/07de3b3d08580c335d6b0e552db66af0747a747a/README.md |
| K-Means Clustering · README.md | indexed | 561782309d8f | https://github.com/balamuruganpg/KMeans-Height-Weight-Clustering/blob/561782309d8f5ea269536e6d80e52469b06fb57a/README.md |
| LungScan AI · README.md | indexed | c3ce1fa80846 | https://github.com/balamuruganpg/LungScan-AI-Chest-Xray-Detection/blob/c3ce1fa80846d1c2e46db8c67a723b0352afc448/README.md |
| Luxury Car Dealership · README.md | indexed | 8592e4e189c0 | https://github.com/balamuruganpg/Luxury-Car-Dealership/blob/8592e4e189c0cd4cb250052813d7b06dde949408/README.md |
| OncoInsight Pro · README.md | indexed | b46809f76cdb | https://github.com/balamuruganpg/OncoInsight-Pro-Cancer-Analytics/blob/b46809f76cdbfed135f28c9c6617c0c799506fb7/README.md |
| PneumoScan · README.md | indexed | 73d77b4cc7b5 | https://github.com/balamuruganpg/Pneumonia-Xray-CNN-Detection/blob/73d77b4cc7b52b9a17f2a7f36b9c967aa366e929/README.md |
| RAI-Axiom · axiom_audit_summary.md | indexed | 275d0bfc3db1 | https://github.com/axiom-sim2real/RAI-Axiom/blob/275d0bfc3db181675c4bf8aa285c3e7615c0853b/axiom_audit_summary.md |
| RAI-Axiom · PROGRAMMED_PRIMITIVES.md | indexed | 275d0bfc3db1 | https://github.com/axiom-sim2real/RAI-Axiom/blob/275d0bfc3db181675c4bf8aa285c3e7615c0853b/PROGRAMMED_PRIMITIVES.md |
| RAI-Axiom · README.md | indexed | 275d0bfc3db1 | https://github.com/axiom-sim2real/RAI-Axiom/blob/275d0bfc3db181675c4bf8aa285c3e7615c0853b/README.md |
| Signal · README.md | indexed | df2e5c8e696d | https://github.com/balamuruganpg/cloud-sla-monitoring-system-ccv-mini-project/blob/df2e5c8e696da88bf26021913c46bb42227d5670/README.md |
| Titanic ANN · README.md | indexed | 662ac13c58cd | https://github.com/balamuruganpg/Titanic-Survival-Prediction-ANN/blob/662ac13c58cd73be1760ba3d69005ff7a5c3b6c6/README.md |
| VeraScan · README.md | indexed | 5f3c2277822e | https://github.com/balamuruganpg/verascan/blob/5f3c2277822e28d9c4af91e8f3e9118f94e5bb9c/README.md |
| Video Game Sales EDA · README.md | indexed | 841c5b60142c | https://github.com/balamuruganpg/EDA-Video-Games-Sales-Analysis/blob/841c5b60142c81fc38d1a3b780ab595ba85e28ba/README.md |
| LinkedIn profile | blocked |  | https://www.linkedin.com/in/balamuruganpg |
| VeraScan · PyPI | indexed | 0.4.1 | https://pypi.org/project/verascan/ |
| Resume · page 1 | indexed | 35862377fbfe | https://balamuruganpg.in/Updated%20Resume/BALAMURUGAN_PG_NIT_CSE.pdf#page=1 |
| Resume · page 2 | indexed | 35862377fbfe | https://balamuruganpg.in/Updated%20Resume/BALAMURUGAN_PG_NIT_CSE.pdf#page=2 |

## Saved checkpoints

The approved design checkpoint and backup listed above remain untouched. The completed RAG/background revision is saved locally on `feat/portfolio-overhaul-v2`, with branch `backup/rag-guardrails-2026-11-01`, tag `backup-rag-guardrails-2026-11-01`, and a separate filesystem backup at `A:\balamuruganpg-rag-backup-2026-11-01`. The backup folder’s BACKUP.md records its exact commit and verification count. No push, merge or deployment was performed. LinkedIn ingestion remains pending the owner-provided text.
