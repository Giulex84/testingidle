# Idle Realm Testnet

## Prepared persistence correction — 27 October 2026

Testnet correction based on upstream `7cca17a5e183f46266b3632a0333687e58868689`.
Publication authorized on 27 October 2026; isolated real Redis validation passed
on Vercel. Authenticated Pi Browser acceptance remains pending. Login, polling and actions save against the exact snapshot they
read. An obsolete request receives HTTP 409 instead of replacing newer progress.
Unreadable or unsupported saved data receives HTTP 503 and is preserved for review.
New realms are created only when the key is absent. Identical commit retries
are accepted without rewriting a later, different state. Prices, gameplay rules,
payment/reward routes, Testnet namespaces and SDK mode are unchanged.

Run `npm test` with Node.js 24, Python 3 and a local Lua 5.3/5.4 shared library.
The tests intercept every HTTP request and execute the production Lua script
against a small in-memory command model. They use dummy credentials only;
this is not a real Redis or Upstash integration test. No package installation
or live connection is required. See `TESTNET-CANDIDATE-2026-10-27.md` for gates.

Idle Realm Testnet is the gameplay and payment laboratory for the future Mainnet version of Idle Realm on Pi Network.

## Current campaign

Playable eras currently include Foundations, Bronze Age, Iron Age, Medieval Age and Renaissance. Progress is server-authoritative and persisted per verified Pi user. The Testnet build is used to validate gameplay pacing, era progression, recovery behaviour and Pi payment flows before Mainnet review.

## Architecture

- **Frontend:** single-page web app in `index.html`, using Pi SDK v2.0 in sandbox mode.
- **Hosting / API runtime:** Vercel, including the serverless handlers in `api/`.
- **Persistent store:** Upstash Redis, connected through server-side environment variables.
- **Authentication:** Pi SDK authentication followed by server-side token verification.
- **Game state:** server-authoritative state stored per Pi user; the browser is not trusted as the source of truth.
- **Payments:** User-to-App purchases and App-to-User Test-Pi rewards are approved, completed, recovered and deduplicated server-side.
- **Private telemetry:** `/admin.html` is owner-only and reports pseudonymous daily users plus aggregate logins, game actions, era advances, verified boost sales and rewards.

## Payment safety

Payment actions are serialized and verified on the server. Recovery paths are designed to handle interrupted or incomplete Pi payment flows without intentionally issuing duplicate rewards or applying the same purchase twice. Test-Pi has no real-world value.

## Gameplay principles

The game is designed around visible trade-offs, resource pressure, persistent progress and clear next-move guidance. Optional monetization must not be required to complete an era. Hidden progression costs should not block a player after all displayed era objectives are complete.

## Testnet vs Mainnet

This repository is the Testnet laboratory. Mainnet configuration, production Pi payments, review requirements and final compliance work are handled separately before release.

## Legal

See `privacy.html` and `terms.html` for the current Testnet privacy policy and terms of service.

Last updated: September 22, 2026.
