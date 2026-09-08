# Idle Realm v2 — Playtest-driven redesign

## Product goal
Turn the current Pi Testnet gameplay lab into a compact mobile idle-strategy game that is understandable without coaching, gives the player meaningful decisions every few minutes, and tests monetization without making payment mandatory for progression.

## Findings from the completed playtest
- The full Foundations → Bronze → Iron path is completable.
- Server progress/restoration works in the tested path.
- Era Test-π reward flow completed successfully in the tested path.
- The largest gameplay failure is passive waiting: the Iron Age stability objective could become a long period where the optimal action is to do nothing.
- Food reaching zero was not sufficiently consequential or clearly communicated.
- The single long mobile page makes the next useful action hard to identify.
- Building removal is too easy to trigger accidentally because occupied city tiles act directly as remove controls.
- Events and policies need clearer predicted consequences.
- Council Patronage is technically optional but currently feels detached from the core decision loop.

## V2 acceptance criteria
### 1. No dead waiting
If an objective is projected to take more than ~90 seconds through passive regeneration, expose at least one free strategic action that can materially accelerate it, with an explicit cost/trade-off.

### 2. Clear next move
At the top of the game show a `Next move` card containing:
- nearest incomplete objective;
- current progress / target;
- estimated passive completion time when meaningful;
- one recommended action and its trade-off.

### 3. Resource pressure must matter
Food at or below zero must have a visible gameplay consequence and warning before the player enters a failure spiral. Do not create an unrecoverable state.

### 4. Decisions show consequences
Building, policy and event buttons must preview their principal effects before confirmation, e.g. `+food/s`, `-production/s`, `+stability/s`.

### 5. Safer city editing
Tapping an occupied city tile must not instantly destroy it. Use a selected-tile state with an explicit Remove/Replace action.

### 6. Mobile information architecture
Reduce the long-scroll problem. Prioritize:
1. realm status + next move;
2. era objectives;
3. current event;
4. city/actions;
5. policy;
6. optional patronage;
7. chronicle/history.
Chronicle can be collapsed by default.

### 7. Monetization principle
Council Patronage remains optional. It may provide convenience/tempo or cosmetic/status value, but the free route must remain reasonably playable. Never manufacture a long boring wait solely to sell the removal of that wait.

### 8. Payment/reward integrity
Keep approve/complete and reward verification server-side and idempotent. UI must disable duplicate submissions while pending and clearly distinguish pending/success/failure.

## First implementation slice
Implement before adding any new era:
- Next Move / objective guidance card.
- ETA calculation for passive objectives.
- A free stability-recovery decision with a real cost (example: `Emergency council session`: immediate stability gain or temporary stability-rate boost in exchange for production/bronze/food).
- Explicit food-zero warning/consequence and recovery route.
- Effect previews on policy/build/event controls.
- Safe building removal confirmation.
- Collapsible Chronicle and more compact mobile layout.
- Keep existing Testnet payment and A2U reward paths intact unless a change is required for correctness.

## Playtest target
A fresh player should be able to reach the current Iron frontier without external instructions. During a 20-minute observed session there should be no period longer than ~90 seconds where the best available interaction is simply waiting with no meaningful alternative.

## Metrics to prepare for later instrumentation
- session duration;
- era completion time;
- time spent with no actionable recommendation;
- event choice distribution;
- policy changes per era;
- buildings constructed/removed;
- food-zero occurrences and recovery time;
- stability recovery time;
- patronage view → purchase conversion;
- era reward claim success/pending/failure.
