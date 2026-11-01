# Certificate navigation and conversational RAG — 2026-11-01

The desktop header now links directly to Certificates. The section starts with Featured 12 / All 45 tabs, global title/issuer/ID search, an issuer filter and result counts. Twelve matching cards mount per page. Original proof documents and verification destinations are unchanged. The command palette and assistant can open the full or filtered catalogue.

The reported conversation exposed two failures: the plural “Certificates?” did not route to a category overview, and generation could continue discussing the previous IIM Mumbai certificate despite receiving the catalogue. Direct category/issuer routing, source-title-aware history resolution, scoped generation context and a catalogue-count check now cover this case. Every issuer in the canonical data gets a derived group; issuer comparisons retain both groups and issuer-specific current-study questions retain their scope.

Open-ended questions use a bounded Groq query planner to select approved sources and search terms. Request-local compact IDs map back to canonical source IDs. Dates and expiry are retained in routing hints; mixed certificate/project questions retain both source categories. General questions select at most three complementary source records; explicit comparisons can select up to six. The planner cannot create facts, URLs, external fetches or executable actions. Invalid output, provider failure or timeout falls back to local retrieval. Exact names/categories avoid the additional model request. BM25 retrieves implementation passages, with separate evidence reserved for each project in a comparison. There is no embedding model or vector database.

Generation still uses structured paragraphs with explicit source IDs, per-source number/URL/claim checks and one bounded rewrite. Certificate counts cannot borrow citation-marker numbers. Pending-status checks handle DeepLearning.AI punctuation and negative completion wording while rejecting earned claims. Benchmark guard failures now give the rewrite the exact missing qualification, including CertiRoute's 12.12% regret and missed 5% target. Unsafe drafts remain withheld. No guard was removed.

Trusted certificate actions are derived from approved metadata. A real browser regression reproduced a reduced-motion focus-restoration jump back to the hero; restoring focus with preventScroll fixes the action without changing the site's scrolling implementation.

## Verification

| Check | Result |
| --- | --- |
| Production build | Compilation, lint/type validation and static generation passed; no separate lint script exists |
| Assistant deterministic checks | 73 passed |
| Query planner checks | 7 groups passed, including mixed categories, bounded breadth, compact-ID mapping, invalid output, cancellation and provider fallback |
| RAG checks | 26 passed, including evidence for both comparison projects |
| Credential provenance | All 45 unique records and original/public SHA-256 hashes passed |
| Factual guards | 5 passed |
| RAG index | 25 source hashes, 17 repositories and 396 reproducible passages verified |
| Certificate navigation browser checks | 9 groups passed, including actual assistant action in both motion modes |
| Certificate browser checks | 9 groups passed, 319/375/768/1440px, light/dark, all 45 proof files served |
| Existing header/assistant browser checks | 14 groups passed |
| Existing full-site checks | 54 passed, including resume download, social destinations and project links |
| Live conversational API | 7 turns passed with generated Groq answers: exact complaint, issuer/status/proof follow-ups, semantic routing and comparison |
| Live VeraScan detail regression | Both turns passed with generated Groq answers (192 and 193 words), multiple implementation citations and new source sections |
| Live credential API | 7 groups passed; 6 generated Groq answers, exact proofs/status/counts, plus private-secret refusal |
| Live adversarial API checks | All 10 groups passed: override/secret/URL refusals, forged history, unsupported metrics, personal achievements, source coverage and immutable repository citations |

Independent review identified issuer scope, cross-issuer comparison, mixed planner categories, citation/count confusion and a regression-test assertion swallowed by fallback. Each received a fix and regression check; final production review found no further material issue.

The source snapshot and original proof assets are unchanged. BackgroundMotion.tsx, Providers.tsx, motion.tsx and globals.css remain byte-identical to restored checkpoint 56c42abbcb45397aa52c2a4d136fce625c53038c. Navigation scroll/animation logic is unchanged. No dependencies, project facts/order/metrics, resume or social URLs changed. No push, merge or deployment.

## File-by-file changes

| File | Change |
| --- | --- |
| src/components/Nav.tsx | Certificates in desktop links and mobile menu |
| src/components/Certifications.tsx | Top-level tabs, global search, issuer filter, result counts, pagination and catalogue event handling |
| src/components/CommandPalette.tsx | Direct certificate catalogue command |
| src/components/ui.tsx | Typed-by-consumer catalogue navigation event |
| src/components/Assistant.tsx | Trusted catalogue buttons, source navigation and focus restoration without scroll jumps |
| src/lib/corpus.ts | Derived issuer groups, counts and canonical group membership |
| src/lib/retrieve.ts | Plural/category/issuer routing, comparisons and scoped study status |
| src/lib/agent.ts | Citation-aware follow-ups, overview coverage, pending-status parsing and explicit benchmark rewrite feedback |
| src/lib/answer.ts | Source-scoped certificate generation history |
| src/lib/rag/planning.ts | Bounded structured semantic query planning with validated source selection |
| src/lib/rag/search.ts | Planned anchors/queries and balanced comparison evidence |
| src/lib/rag/server.ts | Accurate retrieval capability label |
| src/app/api/chat/route.ts | Planning orchestration, retrieval metadata, contextual prompts and trusted catalogue actions |
| src/app/page.tsx | Grounded Architecture description reflects the implemented retrieval |
| scripts/assistant-test.mjs | Category, issuer, history, status and guard regressions |
| scripts/rag-test.mjs | Planned source selection and comparison coverage regression |
| scripts/query-planner-test.mjs | Planner contract, safety, cancellation and fallback tests |
| scripts/assistant-conversation-e2e.mjs | Exact complaint plus follow-ups, proof, semantic question and comparison against live Groq |
| scripts/certificate-navigation-e2e.mjs | Header, catalogue controls, palette, keyboard and real assistant navigation checks |
| scripts/credentials-e2e.mjs | Adapt existing proof/responsive checks to the visible tabs and pagination |
| scripts/credentials-api-e2e.mjs | Completed-count answer must cite the catalogue even when the question excludes ongoing study |
| README.md | Accurate workflow, retrieval behavior and reproducible commands |
| artifacts/certificates-375.png, -768.png, -1280.png, -1440.png | Reviewed responsive certificate layout screenshots |
| docs/RAG_NAVIGATION_REVIEW.md | This report |

## Backups and remaining owner input

Pre-change branch backup/pre-rag-navigation-2026-11-01 and tag backup-pre-rag-navigation-2026-11-01 point to 8317b67d96ded42893eb239da7b49f7272f4513f. The verified full folder A:\balamuruganpg-certificates-backup-2026-11-01 preserves that source and local configuration. The post-change full backup is A:\balamuruganpg-rag-navigation-final-backup-2026-11-01, with branch backup/rag-navigation-2026-11-01 and tag backup-rag-navigation-2026-11-01. Its BACKUP.md records the completed commit, verification and exact rollback commands.

The original redesign backups remain: branch backup/pre-redesign-2026-10-31 at cb198eddaf3db1e0a29a25c5d1abb6655f4bb32a (including the original dirty state), tag backup-2026-10-31-pre-redesign at cf553fdee56f91fab03fd941f7cb26885514d314, and folder A:\balamuruganpg-backup-2026-10-31. Main remains at cf553fdee56f91fab03fd941f7cb26885514d314.

Rollback from A:\Portfolio while preserving newer work:

```powershell
git stash push --include-untracked -m before-rag-navigation-rollback
git switch backup/pre-rag-navigation-2026-11-01
```

No new TODO comments. LinkedIn content remains unavailable until the owner supplies the promised About/Experience text; the assistant discloses this. Deep Learning Specialization is current study and requires completion proof only when earned. Groq quotas and availability can cause the labelled original-facts fallback; the configured model currently has an 8,000-token/minute quota, so live regression cases are paced. This work does not claim unrestricted browsing, autonomous external actions or guaranteed model correctness.
