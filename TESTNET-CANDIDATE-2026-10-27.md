# Idle Realm Testnet — candidate for review

Status: prepared locally, not pushed, deployed or verified in Pi Browser.
Source: Giulex84/testingidle at 7cca17a5e183f46266b3632a0333687e58868689.

## Change

Compare the raw stored snapshot immediately before a write in a Lua operation.
Both login and gameplay endpoints pass their original snapshot. A concurrent
poll or action cannot overwrite a newer realm. Missing keys can create a realm;
corrupted JSON and unsupported versions cannot. A retry of the identical saved
payload returns success. No request is automatically replayed after a conflict.
Game action metrics are attempted only after the state commit succeeds.

## Validation and remaining gates

- `npm test`: isolated persistence and handler tests, including request races,
  initialization, corrupted data, restart and response loss.
- The Lua source runs on a local Lua interpreter using a minimal Redis model.
  A real Redis server was unavailable in the preparation environment.
- Before publishing: run equivalent scenarios against an isolated Redis test
  instance, including real Lua semantics, request timeouts and connection loss.
- Then verify two tabs, login, restart, background polling and action conflicts
  in Pi Browser Testnet. Confirm 409 prompts recovery without losing progress.
- Check the upstream commit again before applying; do not overwrite newer work.

## Release and rollback

Do not push to the connected main branch until Testnet deployment is approved.
No Mainnet code or cloud setting was changed. Data keys and schema are unchanged.
Rolling back code preserves saved JSON, but restores the old stale-write risk.
No database reset, restore or automatic historical repair belongs in this change.
Polling frequency and payment/reward recovery remain separate follow-up items.

## Activity and approval log

- 26 October 2026: initial inventory and audit readings authorized by Giuliano;
  subsequent readings authorized autonomously. No external changes authorized.
- 27 October 2026: “Procedi con ciò che è fattibile” used for isolated candidate
  development and local checks. No GitHub push, deployment, credential changes,
  cloud reconfiguration, messages, payments or live data writes were performed.
- Decision: prepare the Testnet correction only, preserve existing product rules
  and network separation, and retain explicit real-Redis/Pi-Browser release gates.
- Verification: local regression suite passed; syntax checks passed. Actual Redis,
  Upstash fault testing and authenticated Pi Browser checks remain outstanding.
- Deployment and Mainnet promotion: not approved or performed by this work.

## Testnet deployment authorization — 27 October 2026

Giuliano explicitly approved publishing both Testnet candidates and will perform
the authenticated Pi Browser checks with his own account. Mainnet is excluded.
Before assigning the regular Testnet domain, an isolated Vercel deployment runs
`scripts/test-redis-isolated.cjs` against random audit:testnet:* keys only.
The validation does not call Pi APIs, read user records, change credentials or
reset any database. It deletes only its own temporary test keys.
The previous deployment and source commit remain the code rollback reference.
Final deployment status and manual acceptance are recorded separately.
