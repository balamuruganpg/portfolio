# Certificate Proof Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give every published completed credential its exact document-backed identity and a usable proof destination.

**Architecture:** A typed canonical credential catalogue drives the visible cards, completed count, verification links and assistant source documents. Original documents remain unchanged; byte-identical copies under public/credentials are opened on demand. A native disclosure contains the full catalogue after 12 highlighted records.

**Tech Stack:** Existing Next.js, React, TypeScript, Tailwind and Playwright; no new application dependencies. Existing pypdf/OpenCV tools are used only to inspect the supplied documents.

**Spec:** Owner's request to use Certificates/ and its IDs/links as proof; owner confirms Deep Learning Specialization by Andrew Ng is in progress.

## Global constraints

- Work on feat/portfolio-overhaul-v2. No push, merge or deploy.
- Preserve original Certificates/ files and restored scrolling behavior.
- 46 PDFs plus one certificate PNG contain 45 unique completed credentials; two PDF pairs are duplicates. The TXT file supplies the Masai verification URL.
- Use exact course/program distinctions. AI For Everyone is a completed course; Deep Learning Specialization is in progress, with no completed claim or proof ID. Remove the unsupported Tableau certificate label while preserving existing skills.
- Never infer verification URLs for Oracle: display its printed ID and local document. Decode existing QR links for NPTEL and IITM Pravatak/BodhBridge.

## Review focus

- Duplicate PDFs and IBM programme component courses must not inflate the unique-record count or be misrepresented as professional certifications.
- In-progress learning stays outside the completed count.
- Google Cloud's Coursera Generative AI Leader programme must not be called an exam certification.
- Local files, IDs and issuer links must correspond to the same document; no invented destinations or IDs.
- Long titles and IDs must wrap at 319/375px, and catalogue proof links must remain keyboard accessible.

### Task 1: Document-backed data and assets

Files: src/data/credentials.ts; public/credentials/*; scripts/credentials-test.mjs; existing three transpile-based test loaders.

- [x] Write/run a failing invariant test for 45 unique records, original/public SHA256 agreement, exact known IDs, 12 highlights, duplicate mapping and in-progress exclusion.
- [x] Transcribe/extract fields, deduplicate by SHA256 and copy original assets byte-for-byte. Add owner-confirmed in-progress record separately.
- [x] Run deterministic proof tests and inspect the image-only documents visually.

### Task 2: Portfolio and assistant proof

Files: src/components/Certifications.tsx; src/components/Hero.tsx; src/app/page.tsx; src/data/site.ts; src/lib/corpus.ts; src/lib/retrieve.ts; src/lib/agent.ts; relevant browser tests.

- [x] Add failing assistant tests for exact credential lookup, proof citations, unsupported credential refusal and in-progress distinction.
- [x] Render 12 highlighted cards plus the full native disclosure, preserving the current design tokens. Link every record to its certificate and external verification when supplied.
- [x] Update the hero to the unique completed credential count and accurate terminology. Add individual credential source docs and an in-progress source; preserve project retrieval and factual guardrails.
- [x] Update stale fixed-count assertions and run build, assistant/RAG/guard/proof/browser checks. No scrolling changes.
- [x] Record external availability limitations, file list, diff stat and TODOs; save a local checkpoint and verified backup for owner review.

Ruling: Oracle entries use the neutral category “Certification”; exact titles preserve three Professional-level and one Associate-level credential. “Professional Certificate” denotes the separate IBM/Google Coursera programmes, not a claim of passing a vendor exam.

Review ledger: public “show credentials” requests were initially mistaken for secret extraction, and mixed citations initially bypassed pending-status protection. Regression tests failed before fixes and passed afterward. Source-text injection quarantine remains unchanged; private authentication requests remain refused. Independent review reran 62 assistant, 25 RAG and credential provenance checks and found no remaining actionable issues.
