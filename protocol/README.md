# Aetherion Protocol

This directory is the canonical home for consensus-relevant Aetherion design work.

## Status

Current status: **deterministic executable specification / prototype**.

Nothing in this directory should be described as a production Layer 1 until a real BFT node, authenticated transaction path, persistent state, operational network, and independent security review exist.

## Files

- `genesis.seed.json` — machine-readable design genesis with zero private allocation and no terminal supply cap.
- `protocol.manifest.json` — machine-readable protocol purpose and protected invariants.
- `reference/biozoe-policy.mjs` — pure monetary-policy functions.
- `reference/aetherion-state-machine.mjs` — deterministic reference economic state transitions.
- `reference/*.test.mjs` — dependency-light invariant tests.

## Authority boundary

The reference implementation specifies economic legality. It intentionally does not pretend to implement:

- production signatures,
- validator networking,
- BFT finality,
- private personhood proofs,
- audited key custody,
- bridge custody,
- production governance execution.

Those responsibilities belong in separate reviewed modules.

## Monetary base unit

AetherCoin uses integer base units:

`1 ATC = 10^18 aatc`.

Balances must not use floating-point arithmetic in consensus-critical code.

## Minting rule

There is no generic mint endpoint.

Every increase in cumulative issuance must name one of the constitutional issuance classes:

- universal,
- contribution,
- regenerative,
- stewardship.

Budgeted classes require governed epoch budgets and evidence receipts. Universal issuance requires unique-person eligibility and one claim per epoch.

## Supply invariant

At all valid states:

`circulating supply = cumulative authorized issuance - cumulative retirement`.

Ordinary transfers change ownership but not supply.

## Consensus rule

ATC balance is never an input to validator voting power in the canonical design.

The target node architecture is CometBFT-compatible BFT with equal unit voting power for authorized active validators. The production validator registry must add independent-operator and anti-capture safeguards around that simple voting-power rule.

## Governance rule

ATC balance is never an input to human constitutional vote weight.

Production governance is planned as multi-chamber and timelocked. The protocol reference code does not yet implement governance execution.

## Resource rule

ATC is not the spam budget. Pulse is the planned non-transferable resource-accounting primitive for fair-use quotas and congestion controls.

## Spiritual/epistemic rule

Spiritual and philosophical concepts may shape purpose and ethics. They do not enter deterministic monetary state as unmeasured physical facts.

No `Math.random()`, AI output, sacred-number generator, or symbolic quantum metric belongs in canonical monetary execution.

## Verify

```bash
npm run protocol:verify
npm run protocol:test
```

The verifier protects static constitutional invariants. The tests protect deterministic executable invariants. Neither is a formal security audit.
