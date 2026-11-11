# Aetherion Protocol

This directory is the canonical home for consensus-relevant Aetherion design work.

## Status

Current status: **deterministic executable specification / prototype**.

Nothing in this directory should be described as a production Layer 1 until a real BFT node, authenticated transaction path, persistent state, operational network, and independent security review exist. Likewise, the presence of canonical exchange mathematics does not mean a Federation-operated exchange service exists or is authorized to operate.

## Files

- `genesis.seed.json` — machine-readable design genesis with zero private allocation, no terminal supply cap, circulation disabled by default, and canonical conversion disabled by default.
- `protocol.manifest.json` — machine-readable protocol purpose and protected invariants.
- `reference/biozoe-policy.mjs` — pure monetary, circulation-score, and canonical-exit quote functions.
- `reference/aetherion-state-machine.mjs` — deterministic reference economic state transitions.
- `reference/biozoe-policy.test.mjs` — monetary policy invariants.
- `reference/aetherion-state-machine.test.mjs` — entitlement, budget, transfer, demurrage, and supply invariants.
- `reference/circulation-exchange.test.mjs` — circulation anti-wash and bounded canonical-exchange invariants.
- `simulation/biozoe-sim.mjs` — dependency-light economic cohort simulation.

## Authority boundary

The reference implementation specifies economic legality. It intentionally does not pretend to implement production signatures, validator networking, BFT finality, private personhood proofs, production circulation-receipt cryptography, audited key custody, external reserve custody, licensed exchange operations, bridge custody, or production governance execution.

Those responsibilities belong in separate reviewed modules.

## Monetary base unit

AetherCoin uses integer base units:

`1 ATC = 10^18 aatc`.

Balances must not use floating-point arithmetic in consensus-critical code.

## Issuance rule

There is no generic mint endpoint.

Every increase in cumulative issuance must name one of the constitutional issuance classes:

- universal,
- contribution,
- regenerative,
- stewardship,
- circulation.

Universal issuance is an accrued entitlement across eligible epochs, not a connectivity test. Contribution, regenerative, and stewardship issuance require governed program budgets and unique evidence receipts.

Circulation issuance is structurally different from the other budgeted classes. Governance authorizes one maximum circulation pool per epoch. Qualified finalized transfers contribute deterministic score, and actual issuance is distributed from that fixed pool with per-identity caps. Raw transaction count does not mint ATC.

## Circulation rule

An ordinary transfer does not automatically qualify for circulation reward.

A qualifying transfer must be linked to a unique circulation receipt or equivalent authenticated proof. The reference state machine prevents receipt replay and transfer double qualification, rejects self-transfers, and nets direct pairwise round trips before scoring.

For pair `A,B`:

`Q_AB = |A_to_B - B_to_A|`.

The reference pair score uses deterministic integer square root of qualified net flow. This creates diminishing returns and lets breadth of independent counterparties matter without making reward linear in wealth.

The reference implementation uses configurable sender and receiver score weights and a per-identity reward cap. Any unused pool authority remains unissued.

The reference model does not claim to defeat every coordinated wash-trading graph. Production still requires stronger anti-Sybil, receipt-authentication, privacy, and adversarial-economic work.

## Ordinary transfer rule

Native ATC-to-ATC transfer conserves supply and does not receive the canonical external-exit spread.

The protocol does not attempt to infer that a transfer is a sale merely from the destination address.

## Canonical conversion rule

Canonical conversion is disabled in the design seed and is not required for Layer 1 liveness.

The reference quote keeps these values separate:

- reference external value,
- applied canonical friction,
- net external proceeds,
- reserve retention.

The reference price is not rewritten by the exit spread.

The disabled design seed models a bounded maturity curve, bounded liquidity-stress surcharge, delayed-exit discount, minimum friction, and a total hard friction ceiling. The hard cap is below 100% and is constitutionally protected.

The state-machine reference retires surrendered ATC only after the external settlement path is accepted. It does not pretend to custody or deliver the external asset.

An inbound deposit of ETH, BTC, stablecoin, fiat, or another external asset is not generic ATC mint authority.

## Supply invariant

At all valid states:

`circulating supply = cumulative authorized issuance - cumulative retirement`.

Ordinary transfers change ownership but not supply. Demurrage and executed canonical exits may retire ATC under their typed rules.

## Consensus rule

ATC balance is never an input to validator voting power in the canonical design.

The target node architecture is CometBFT-compatible BFT with equal unit voting power for authorized active validators. The production validator registry must add independent-operator and anti-capture safeguards around that simple voting-power rule.

## Governance rule

ATC balance is never an input to human constitutional vote weight.

Production governance is planned as multi-chamber and timelocked. Ordinary governance may tune future circulation pools or exchange parameters only inside the constitutional envelope. It cannot remove the exit hard cap, tax ordinary ATC transfer as canonical exit, or authorize unbounded circulation minting.

## Resource rule

ATC is not the spam budget. Pulse is the planned non-transferable resource-accounting primitive for fair-use quotas and congestion controls.

## Spiritual/epistemic rule

Spiritual and philosophical concepts may shape purpose and ethics. They do not enter deterministic monetary state as unmeasured physical facts.

No `Math.random()`, AI output, sacred-number generator, symbolic quantum metric, or promise of infinite monetary value belongs in canonical monetary execution.

## Regulatory boundary

Research code may calculate canonical exchange quotes while the service remains disabled. A Federation-operated exchange/redemption system must separately pass the technical, reserve, governance, and legal/operational gates described in `../docs/regulatory-launch-gate.md` before activation.

## Verify

```bash
npm run protocol:verify
npm run protocol:test
npm run protocol:simulate
```

The verifier protects static constitutional invariants. The tests protect deterministic executable invariants. The simulator explores economic behavior under explicit assumptions. None of them is a formal security, financial, reserve, or legal audit.
