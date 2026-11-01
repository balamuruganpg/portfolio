# Certificate proof integration — 2026-11-01

The portfolio now has 45 unique completed credentials with original proof documents, 12 highlighted records and a searchable full catalogue. Two duplicate PDF pairs are counted once. Professional certifications, Coursera Professional Certificates, courses, a guided project, a programme and training retain distinct labels. Oracle's exact titles preserve three Professional-level credentials and one Associate-level credential.

Deep Learning Specialization by DeepLearning.AI / Andrew Ng is **in progress**, as confirmed by the owner. It has no completed claim, certificate ID or verification button and is excluded from the completed count. AI For Everyone remains a separate completed course. The unsupported Tableau certificate label was removed; the existing Tableau skill remains.

## Proof and provenance

- All 48 owner-provided files remain in Certificates/: 46 PDFs, one certificate PNG and the verification TXT.
- 47 certificate documents map to 45 unique credential records: 44 PDFs plus one PNG in public/credentials, copied byte-for-byte.
- The catalogue retains original paths and SHA-256 hashes. Duplicate PDFs with the same hashes/IDs share one canonical record.
- 41 verification URLs came from PDF annotations/text, decoded QR codes or the owner-provided Masai TXT. All 41 returned successful HTTP responses; the recorded destinations are in CERTIFICATE_LINK_CHECK.json. This is link-availability evidence, not independent issuer attestation.
- The four Oracle certificates have printed credential IDs and local PDF proof; no issuer verification URLs were invented.
- Image-only IITM Pravartak/BodhBridge and IIM Mumbai certificates were inspected visually. The IITM and NPTEL QR destinations were decoded from the original documents.
- The Google Cloud Generative AI Leader document is identified as a Coursera Professional Certificate, not a Google Cloud certification exam.

## Site and assistant behavior

The hero's count comes from the same completed catalogue as the section and assistant. The full list mounts only after its disclosure is opened; certificate assets load only when opened. Proof links open in a separate tab. Long titles and IDs wrap on narrow screens.

The assistant has individual source documents with exact IDs, titles, issuers, dates and verification/PDF destinations. Current learning has a separate source. Source coverage distinguishes indexed repository/resume snapshots from the approved certificate records. Credential ID checks reject changed letters as well as unsupported numbers. Pending-status checks remain active in mixed comparisons with completed courses. Public educational credential requests are accepted; private authentication requests remain refused. Source-text injection quarantine is unchanged.

No scrolling, navigation animation, background motion, project facts/order/metrics, social URLs or resume PDF were changed. The original scrolling files are byte-for-byte identical to the restored source checkpoint 56c42abbcb45397aa52c2a4d136fce625c53038c.

## Verification

| Check | Result |
| --- | --- |
| Production build | Compilation, lint/type validation and static generation passed; no standalone lint script exists |
| Credential provenance test | 45 unique records, 47 original documents, 12 highlights, all source/public hashes and known IDs/URLs passed |
| Assistant deterministic suite | 62 checks passed |
| RAG suite | 25 checks passed |
| Factual guard suite | 5 checks passed |
| RAG snapshot verification | 25 source hashes, 17 repositories, 396 reproducible passages; snapshots unchanged |
| Credential browser suite | 9 groups passed: 319/375/768/1440px, dark/light, search and in-progress status, plus all 45 proof files HTTP 200 |
| Existing header/assistant browser suite | 14 groups passed |
| Existing full-site suite | 54 checks passed, including resume/social destinations and protected project results |
| Credential API suite | 7 groups passed; 6 generated Groq gpt-oss-120b replies passed source checks, plus private-secret refusal |
| Existing adversarial API suite | 10 groups passed |
| External credential links | 41/41 returned successful HTTP responses |
| Whitespace | git diff --check passed |

Independent review found and rechecked fixes for two cases: generic public “show credentials” requests were refused by the secret guard, and mixed citations could disable pending-status checks. Both had failing regression cases before their fixes. No remaining actionable review findings. No TODO comments were added. Deep Learning completion proof remains a future update, not a currently missing completed credential.

## File-by-file changes

| Files | Purpose |
| --- | --- |
| Certificates/ (48 originals) | Preserve owner-provided evidence unchanged |
| public/credentials/ (45 unique originals) | Public proof documents, loaded on demand |
| src/data/credentials.ts | Typed canonical records, hashes, source paths, IDs, proof URLs and current learning |
| src/data/site.ts | Re-export canonical data and derive the legacy title/count list |
| src/components/Certifications.tsx | Twelve highlighted cards, current learning and searchable full catalogue |
| src/components/Hero.tsx; src/app/page.tsx | Accurate credential count and revised proof section |
| src/lib/corpus.ts; src/lib/retrieve.ts | Individual credential sources and exact credential retrieval |
| src/lib/agent.ts | Credential-ID and pending-status checks; precise credential-type instructions |
| src/lib/rag/core.ts | Separate public educational credentials from private authentication secrets |
| src/lib/rag/server.ts; src/components/Assistant.tsx | Credential source coverage and proof citations opening in separate tabs |
| scripts/credentials-test.mjs | Deterministic provenance, count, ID, URL and duplicate checks |
| scripts/credentials-e2e.mjs | Responsive catalogue/search and local proof-serving checks |
| scripts/credentials-api-e2e.mjs | Live proof/status/type/public-versus-private regression cases |
| scripts/assistant-test.mjs; scripts/rag-test.mjs | Credential retrieval/guard regressions and canonical-data loader |
| scripts/rag-runtime.mjs | Load canonical data for existing source tools |
| scripts/overhaul-qa.mjs | Replace obsolete fixed certificate-grid selector |
| package.json; README.md | Verification commands and evidence maintenance instructions; no dependencies added |
| docs/CERTIFICATE_LINK_CHECK.json | Timestamped HTTP link-availability record |
| docs/superpowers/plans/2026-11-01-certificate-proof.md | Implementation decisions and verification ledger |
| docs/CERTIFICATE_PROOF_REVIEW.md | Review and handoff record |

## Backups and rollback

Before editing: tag backup-pre-certificates-2026-11-01 preserves source HEAD 56c42abbcb45397aa52c2a4d136fce625c53038c. Branch backup/pre-certificates-2026-11-01 preserves the added certificate folder at d00b65015b127dc75ae41378ed50a4eb0b322365. Folder A:\balamuruganpg-pre-certificates-backup-2026-11-01 has 366 SHA-256-verified files, zero mismatches.

The completed revision is retained on feat/portfolio-overhaul-v2, backup branch backup/certificates-proof-2026-11-01 and tag backup-certificates-proof-2026-11-01. A separate verified folder A:\balamuruganpg-certificates-backup-2026-11-01 contains BACKUP.md with the exact final commit, file count, diff stat and rollback instructions.

Rollback from A:\Portfolio while preserving newer uncommitted work:

```powershell
git stash push --include-untracked -m before-certificate-rollback
git switch backup/pre-certificates-2026-11-01
```

Main remains at cf553fdee56f91fab03fd941f7cb26885514d314. No push, merge or deployment was performed.
