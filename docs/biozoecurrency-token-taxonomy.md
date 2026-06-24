# Biozoecurrency Token Taxonomy

Biozoecurrency is the regenerative value taxonomy for Aetherion and the AI Freedom Trust Federation stewardship lane.

This document is a doctrine and engineering boundary for token concepts. It does not claim production token issuance, investment utility, exchange value, audited custody, or legal validity.

## Purpose

Biozoecurrency tokens should coordinate:

- stewardship
- contribution
- consent
- trust
- identity
- covenant memory
- regenerative exchange
- AI-human co-creation
- federation coherence

They should not be reduced to extraction-first speculation.

## Canonical Status Labels

Use only these status labels:

| Label | Meaning |
|---|---|
| `implemented` | Present in code and locally verifiable. |
| `prototype` | Partially working but not production-ready. |
| `experimental` | Research path that may change or be removed. |
| `planned` | Intended but not implemented. |
| `blocked` | Known dependency or review gap prevents progress. |
| `needs_review` | Requires human, technical, legal, financial, or security review. |
| `audited` | A named review artifact exists and supports the claim. |

## Initial Token Primitives

| Symbol | Name | Federation Role | Current Status |
|---|---|---|---|
| ATC | Aether Trust Coin | Stewardship value unit | `planned` |
| FTC | Freedom Trust Coin | Federated settlement reference | `planned` |
| ICON | Iconic Covenant Token | Identity and contribution marker | `planned` |
| SING | Singularity Grace Note | Coherence and achievement marker | `planned` |

## Boundary Rules

1. Do not describe planned tokens as live production assets.
2. Do not imply guaranteed value, yield, liquidity, exchange listing, custody safety, or legal status.
3. Do not allow AI to authorize transfers or custody changes.
4. Do not merge symbolic doctrine with financial claims without review evidence.
5. Do not use `audited` unless a named review artifact exists.

## Typed Contract

The canonical TypeScript contract lives at:

```text
shared/types/biozoecurrency-token.ts
```

Every future token feature should use this typed contract or a reviewed replacement.

## Future Work

- Add local test coverage for token definitions.
- Add token status display components in the Aetherion UI.
- Connect token definitions to Federation events.
- Connect Biozoecurrency eligibility to DynastyLink trust profile status.
- Keep all claims status-labeled before any public launch language.
