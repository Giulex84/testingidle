# Idle Realm Testnet

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

## Payment safety

Payment actions are serialized and verified on the server. Recovery paths are designed to handle interrupted or incomplete Pi payment flows without intentionally issuing duplicate rewards or applying the same purchase twice. Test-Pi has no real-world value.

## Gameplay principles

The game is designed around visible trade-offs, resource pressure, persistent progress and clear next-move guidance. Optional monetization must not be required to complete an era. Hidden progression costs should not block a player after all displayed era objectives are complete.

## Testnet vs Mainnet

This repository is the Testnet laboratory. Mainnet configuration, production Pi payments, review requirements and final compliance work are handled separately before release.

## Legal

See `privacy.html` and `terms.html` for the current Testnet privacy policy and terms of service.

Last updated: September 8, 2026.
