Class EVOLVING  ·  Owner Sushma  ·  Writers all five roles append within their credential scope  ·  Read standing in Sushma's rundown  ·  Cadence per rotation  ·  Budget —  ·  v3.8 (2026-09-16)

- Append-only metadata ledger. Each role may append only non-secret records for access it owns or directly verifies; no role rewrites another role's entry. Aarti records technical rotation, Sushma records protected-environment binding and closure.
- Entry ID: `YYYY-MM-DDTHHMMSSZ-<role>-<credential-slug>`. Never include a credential value.

- Answers a repeated real failure: the same Vercel token / API key conflict was rediscovered and re-fixed multiple times because no durable record existed.
- Not a new agent role — record-keeping is already Aarti (technical rotation) + Sushma (protected-environment binding, closure). What was missing is a required file to write into.
- Each entry: credential name/type, scope/resource IDs, update time, owner, triggering reason, exact workflow run, result, next rotation date. Never the credential value itself.
- Sushma cannot close a credential incident without a CREDENTIALS.md entry.

## v3.8: Required service/access inventory

Maintain a non-secret inventory of every service the project depends on, so access dependencies are known before work starts rather than discovered mid-task. Runtime browser permissions must correspond to an entry here — a permission with no inventory entry is a v3.8 compliance gap, not a routine grant.

| Service | Permitted access level | Owner | Access state | Verification date |
|---|---|---|---|---|
| Vercel (prj_9VHD0AhhQnuml8frfNDsmFLHXcq1) | Deploy + env vars | Sushma | Active | 2026-09-16 |
| Shopify (Production store) | Read + Flow config | Aarti | Active | 2026-09-16 |
| Shopify (dev/staging store) | Full test-mode | Aarti | Active | 2026-09-16 |
| GitHub (carlophillips-site) | Write + PR | Sushma | Active | 2026-09-16 |
| Apliiq | Read + fulfillment API | Aarti | Unverified — pending confirmation | — |

*(Table seeded from known active integrations; roles append/correct entries as verified — see v3.8 Proposal 11.)*
