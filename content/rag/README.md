# Separate RAG knowledge base

This directory is the assistant's source index, separate from the page's approved facts in src/data/site.ts. It is server-only and not imported by browser components.

Run from the repository root:

- npm run rag:sync fetches only the repositories already listed on the portfolio, their README and bounded relevant docs at an immutable Git commit, GitHub profile metadata and VeraScan's PyPI description. It extracts selected career/skills/experience passages from the existing local PDF using the already installed Python pypdf tool.
- npm run rag:rebuild rebuilds chunks from saved snapshots without network access.
- npm run rag:verify checks every source SHA-256, reproduces all index chunks and confirms every listed repository has an indexed source.
- npm run test:rag runs deterministic chunking, ranking, source policy and retrieval regressions without network or credentials.
- npm run test:guardrails:e2e probes the running chat API with adversarial requests and checks actual source coverage.

The current snapshot contains 25 indexed sources from all 17 portfolio repositories, four additional documentation files, GitHub profile metadata, PyPI documentation and two resume pages. It contains 396 heading-aware passages. GitHub citations point to source lines at the saved commit, so later README edits cannot silently change an answer's evidence.

BM25 ranks passages with heading weighting and limited query expansion. Explicit project names and verified citation history scope retrieval. New documentation terms can discover a project even if those terms are absent from its short portfolio summary. Context has a fixed size budget. This is sparse retrieval: it does not claim embeddings or a vector database, and requires no additional API or runtime dependency.

Evidence precedence:

1. The owner's approved site facts define project results, metrics, rank, certification list and personal achievements.
2. GitHub README/docs, the supplied resume and PyPI enrich implementation explanations with linked evidence.
3. Source sections containing unmatched performance numbers, instruction overrides or credential-shaped strings are excluded from retrieval and recorded in index.json's excluded list. Exclusion is conservative; it does not assert that the excluded source is false.

The PDF's personal information, declaration, duplicate project metrics and certification/achievement lists are not imported. This prevents private biographical details and known stale counts from displacing approved facts. The raw public PDF itself remains unchanged.

LinkedIn's exact profile returned HTTP 999. Its content is not indexed, search snippets are not treated as verified profile content, and similarly named profiles are not substituted. imports/README.md explains the optional owner-export format. Until such an export is supplied, the assistant returns the verified existing profile URL and explicitly says that the profile content is unavailable.

Credential-shaped strings are redacted before a snapshot is stored; the stored-snapshot SHA-256 covers the sanitized content, and its immutable repository revision records the upstream source.

Source snapshots and hashes are frozen until the owner runs sync/rebuild. No chat message can trigger a URL fetch, follow a link in a README, access local configuration or edit this index. Do not add secrets or private material to snapshots. Keys remain only in the ignored environment configuration.

Snapshot line endings are canonical LF, enforced by .gitattributes. After committing a source refresh, `node scripts/rag-verify.mjs --git` checks that Git stores exactly the bytes covered by each snapshot hash.
