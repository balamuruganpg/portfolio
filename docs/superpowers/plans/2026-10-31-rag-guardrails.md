# Separate portfolio RAG and guardrail audit

Goal: Preserve the approved design while improving source depth, evidence boundaries and subtle background motion. The user request dated 2026-10-31 authorizes implementation and saving the approved state first.

- [x] Commit approved state, create backup branch/tag, copy the whole project excluding node_modules/.git to A:, verify every copied file with SHA-256 and record rollback commands.
- [x] Add adversarial regression cases for source/citation injection, unit substitution, negated benchmark claims, known metric conflicts, secret requests and fabricated URLs before fixes.
- [x] Create a separate server-only RAG module and reproducible sync script. Snapshot the 17 explicitly listed GitHub repositories at immutable commits; include their README and bounded relevant documentation, local resume PDF text, approved site facts and package metadata. Record source hashes, revisions, fetch outcomes and exclusions. LinkedIn remains unavailable unless actual account content can be retrieved or an owner export is supplied; never substitute another profile.
- [x] Use heading-aware chunks and BM25 retrieval with explicit entity selection, trusted citation follow-ups, evidence precedence and context budgets. Preserve original page facts and results. Do not claim embeddings or a vector database; add no dependencies.
- [x] Add external source citation handling and source availability details to the assistant without exposing local paths, credentials or arbitrary URL fetching.
- [x] Add an understated animated constellation behind the hero and a page-wide pointer-responsive accent field using existing tokens, pausing when hidden/offscreen and honoring reduced motion. Preserve the approved layout.
- [x] Run deterministic RAG/guardrail tests, source integrity checks, API adversarial tests, build, typecheck and existing browser suites; visually inspect motion at desktop/mobile sizes. Report limits and exact source coverage. Do not push, merge or deploy.

Architecture: content/rag contains versioned source snapshots/index; scripts/rag-sync.mjs performs owner-controlled ingestion. src/lib/rag owns chunking, validation, ranking and server loading. The chat route never crawls URLs at request time. src/lib/agent.ts remains the output guard boundary; approved site facts override supplementary source snapshots for metrics/credentials.

Final verification: build and TypeScript pass; 36 assistant checks, five original guard checks, 18 RAG checks, 10 adversarial API groups, 54 existing e2e checks and 14 responsive/browser groups pass. All 25 source snapshot hashes and 17 repositories verified, with 396 reproducible passages and 96 recorded exclusions. The user will provide LinkedIn text; no profile content has been inferred.
