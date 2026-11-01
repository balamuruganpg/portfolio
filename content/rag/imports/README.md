# Optional LinkedIn owner export

LinkedIn returned HTTP 999 for the exact linked profile during this audit. No search snippets, similarly named accounts, follower counts or certifications were imported.

To include your actual profile content, save a UTF-8 file named linkedin.json in this directory with these fields:

- url: https://www.linkedin.com/in/balamuruganpg
- exportedAt: the date of your export
- text: the profile text you want included in the assistant knowledge base

Run npm run rag:sync and npm run rag:verify afterward. The export is treated as an owner-supplied snapshot, not a live LinkedIn connection. Keep private contact details and credential values out of the export. The site's approved facts and metrics continue to take precedence.
