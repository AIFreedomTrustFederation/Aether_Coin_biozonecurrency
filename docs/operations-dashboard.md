# Operations Dashboard

This document defines the operating truth layer for Aether Coin Biozoecurrency.

The dashboard is not a marketing page. It is a status surface that helps Federation stewards understand what is implemented, what needs review, and what remains blocked.

## Canonical Status Contract

The typed contract lives at:

```text
shared/types/operational-status.ts
```

## Current Dashboard Categories

| Category | Purpose |
|---|---|
| repo health | Required files, docs, package scripts, and structure. |
| local QA | Dependency-light local gate. |
| TypeScript check | Static type health. |
| build status | App build health. |
| dependency review | Dependency and package review. |
| secret scan | Public repository safety check. |
| DynastyLink local | Local-first onboarding app status. |
| Biozoecurrency taxonomy | Token taxonomy and status-label integrity. |
| Consent Ledger | Human-consent record contract status. |
| Federation manifest | Machine-readable federation integration handshake. |
| Federation events | App-to-federation event vocabulary. |
| deployment status | Hosting and deployment readiness. |

## Public Claim Boundary

The operations dashboard should never turn partial implementation into production marketing.

Use `needs_review`, `prototype`, or `planned` when evidence is incomplete.

Only use `implemented` when the surface is present and locally verifiable.

Only use `audited` when a named review artifact exists.

## Near-Term Dashboard MVP

The first usable version should show:

- manifest present
- taxonomy present
- consent ledger present
- DynastyLink bridge guide present
- federation event contract present
- local QA status
- TypeScript status
- build status
- known blockers
- next actions

## Future Work

- Generate a JSON status snapshot from local scripts.
- Render a local dashboard page.
- Add status badges after local checks are reliable.
- Emit `operations_status_updated` federation events.
