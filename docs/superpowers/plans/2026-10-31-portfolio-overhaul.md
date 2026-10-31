# Portfolio overhaul v2 implementation plan

Goal: Make identity, availability and verified evidence immediately readable using the existing Next.js, React, Tailwind and Geist design system.
Spec: The user request dated 2026-10-31 is the binding design and execution brief. Execute in this checkout on feat/portfolio-overhaul-v2; keep main unchanged and do not publish.

- [x] Replace Hero.tsx with a static, immediate name-led hero, BPG avatar, existing contact actions and four linked proof facts. No new assets, dependencies or colours.
- [x] Add About.tsx after the hero: four factual first-person lines and six quick facts. Use current site facts; internship bullets may use the supplied resume already in public/.
- [x] Polish page.tsx section headings, case study legibility, academic prominence, certifications, architecture, contact and footer. Keep every project record, result and order intact.
- [x] Improve mobile navigation, repository and skill filter accessibility, selected states, responsive wrapping and reduced-motion support using existing tokens.
- [x] Repair resume URL to the supplied PDF, improve metadata, and preserve assistant retrieval/citation targets.
- [x] Run npm run build, npx tsc --noEmit, the documented guard check and npm run test:e2e. No lint script is defined. Check 375/768/1440 widths, light/dark, links, downloads and assistant citations in Edge. Record external failures independently from local regressions.

Review focus: Long email and status strings on narrow cards; navigation at 768px; proof and project metrics unchanged; citations reset active filters; keyboard access and reduced motion. Existing resume background says four thoracic classes while site/project and supplied PDF say five classes; preserve project records and flag the background discrepancy rather than changing evidence silently.

Final inspection found a server/client reduced-motion mismatch in the shared Reveal wrapper. It now renders evidence immediately; responsive QA explicitly asserts heading and article opacity. No new dependencies, fonts, colours or external images were added.
## Revision requested 2026-10-31
- Use the explicit label First Rank in CSE, NIT and add the user-confirmed personal achievement 330+ LeetCode DSA problems. Preserve the AI LeetCode Agent result of 230+ accepted.
- Rebuild navigation and opening hero with richer motion, active/hover states, responsive menu and interactive project proof using only existing tokens, fonts and Framer Motion. Keep content immediately visible with reduced motion.
- Harden the assistant with deterministic specific-entity retrieval, validated follow-up context, strict numeric/URL/citation guards, request validation and bounded provider fallback. Prefer Groq with server-only keys. Remove the broken public key-saving flow.
- Improve conversation controls, accessible feedback, stop/retry/copy/clear interactions, citation navigation and evidence-aware suggested follow-ups.
- Verify retrieval/guard/provider failures with deterministic tests before implementation, then run build, typecheck, e2e and responsive/keyboard checks. No push, merge or deployment.

Revision verification: production build and TypeScript pass; 24 deterministic assistant checks, five guard checks, 14 browser groups and 54 existing e2e checks pass. Groq was tested with the existing server-side key. The preview remains available for owner review. No deployment or dependency changes.
