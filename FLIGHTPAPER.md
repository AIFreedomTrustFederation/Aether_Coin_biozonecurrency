# Aetherion Flight Paper

## From constitutional design to public network

The white paper defines what Aetherion is meant to become. This flight paper defines how the system is allowed to leave the ground.

Aetherion must not launch by pretending a prototype is already a sovereign Layer 1, and no monetary feature may advance faster than the evidence supporting it. A mathematically elegant reward curve or exchange formula is not permission to expose people to an untested financial system.

---

## Flight Rule 1 — Constitution before capital

Before any token sale, exchange listing, liquidity campaign, or speculative promotion, the monetary constitution must be public, versioned, machine-readable, and testable.

The founding invariants include no premine, no founder or investor allocation, no terminal supply cap, no token-weighted human governance, no balance-derived validator power, no early-adopter multiplier on universal issuance, no hidden treasury mint, no unilateral administrative balance rewrite, no raw-transaction-count mint, no uncapped canonical exit friction, no ordinary-transfer exit tax, no falsification of reference exchange value, and no spiritual or symbolic metric treated as cryptographic or economic evidence.

A public network that violates these invariants is not the Aetherion described by this repository.

---

## Flight Rule 2 — Reference state machine before consensus integration

The monetary state machine must be deterministic and independently testable before it is connected to a consensus engine.

Minimum reference transitions include identity registration, eligibility status change, accrued universal issuance settlement, ordinary ATC transfer, governed budget configuration, evidence-bound contribution issuance, evidence-bound regenerative issuance, evidence-bound stewardship issuance, circulation budget configuration, circulation qualification, circulation reward settlement, demurrage settlement, canonical exit quote and retirement, epoch transition, and supply-invariant verification.

Exit criteria:

- deterministic tests pass,
- arithmetic uses integer base units for monetary values,
- no randomness or local wall-clock input affects balances,
- every mint has a typed cause,
- every retirement has a typed cause,
- ordinary transfers conserve supply,
- issued minus retired equals circulating supply,
- rejected external settlement cannot burn a user's ATC,
- circulation or conversion receipts cannot be replayed.

---

## Flight Rule 3 — Consensus integration

The target implementation should use a mature BFT engine rather than a novel wealth-based consensus scheme.

Reference architecture:

`CometBFT-compatible consensus -> Aetherion application state machine -> persistent state -> RPC/API -> wallet/runtime`.

Validator voting power must be independent of ATC balances. The initial target is equal unit voting power among authorized active validators.

Exit criteria for a public devnet include at least seven validators, at least three independent operators, deterministic genesis, reproducible node build, peer discovery and state sync testing, and fault testing consistent with the chosen BFT assumptions.

---

## Flight Rule 4 — Identity and Sybil resistance

Universal issuance and circulation rewards cannot be safe without credible uniqueness controls.

Aetherion should not centralize global personhood in one database. The target is a plural attestation network compatible with AIFT-Genesis trust identity.

Required properties include one active baseline issuance stream per human, privacy-preserving uniqueness where practical, no requirement to publish raw government identifiers on-chain, revocation and recovery, duplicate challenge procedure, appeal and due process, multiple independent attesters, and documented handling of minors, guardianship, deceased identities, lost keys, and contested records.

Circulation rewards additionally require defenses against multiple identities controlled by the same economic actor. A per-identity reward cap is meaningless if one actor can cheaply manufacture hundreds of eligible identities.

Exit criteria include a published threat model, duplicate-identity red-team tests, recovery tests, and independent privacy review before production personhood credentials.

---

## Flight Rule 5 — Economic simulation

A mathematically valid currency can still be economically unstable.

Before production, simulations must include population growth and contraction, participation rates, lost accounts, high saving versus high circulation behavior, demurrage rates, contribution budgets, stewardship compensation, circulation pool size, sender/receiver circulation weights, per-identity reward caps, large-holder behavior, shocks to real resource supply, exchange-rate volatility, local trust migration, coordinated Sybil attacks, and program fraud.

No fixed parameter in the design seed is sacred. The invariants are constitutional; rates are empirical governance parameters.

Exit criteria include public simulation code and assumptions, sensitivity analysis, no hidden founder subsidy, understandable inflation/deflation scenarios, and production parameters ratified through governance rather than copied from the design-devnet seed.

---

## Flight Rule 6 — Circulation incentives must survive adversarial economics

Circulation issuance must prove that it rewards useful monetary breadth more than artificial churn.

At minimum, test:

- exact direct round trips,
- partial round trips,
- repeated same-pair transfers,
- self-controlled wallets,
- multi-identity wash rings,
- merchant-customer collusion,
- receipt replay,
- transfer double qualification,
- many tiny transactions,
- whale concentration,
- identity splitting,
- newly created counterparty farms,
- low-volume legitimate users,
- intermittent connectivity,
- privacy-preserving receipt failure modes.

The production design must retain a fixed or explicitly governed epoch circulation pool, diminishing-return scoring, a per-identity ceiling, receipt uniqueness, and anti-Sybil dependence. Raw transaction count may never become an unbounded mint source.

Exit criteria:

- direct pair round trips produce zero net pair score,
- issuance never exceeds the authorized epoch pool,
- no participant exceeds the configured cap,
- reward computation is deterministic,
- privacy requirements are documented,
- attack simulations show no trivial profitable wash strategy under assumed identity costs,
- residual known attacks and tradeoffs are published rather than hidden.

---

## Flight Rule 7 — Pulse resource accounting

Money must not be the only anti-spam mechanism.

Pulse is a non-transferable execution/resource quota. It should be replenished according to transparent rules and used for fair-access rate control, not speculation.

Exit criteria:

- Pulse cannot be transferred,
- Pulse cannot vote,
- Pulse cannot be staked for consensus,
- exhaustion cannot destroy economic balances,
- replenishment cannot mint ATC,
- congestion behavior is load-tested,
- commercial/high-volume users have a transparent path to additional resource allocation without purchasing governance rights.

---

## Flight Rule 8 — Wallet and custody safety

A wallet UI is not custody security.

Production wallet support requires real signature verification, secure key generation, hardware-wallet strategy where possible, explicit network and amount display before signing, transaction simulation where supported, recovery design, no seed phrase transmission to AI providers, no silent AI signing, and clear separation between recommendation and authorization.

The Federation covenant remains:

`Receive -> Inspect -> Name -> Propose -> Consent -> Act -> Verify -> Record -> Return`.

Exit criteria include external review of the signing path, secrets excluded from logs and prompts, malicious transaction tests, recovery/device-loss testing, and clear devnet/testnet/mainnet distinction.

---

## Flight Rule 9 — Governance implementation

Governance must exist in executable procedure rather than aspirational prose.

The target constitutional model uses at least a verified-human chamber and a federated trust/community chamber. ATC balances are excluded from vote weight.

Constitutional amendments require published proposal text, impact analysis, minimum deliberation period, supermajority in each required chamber, post-approval timelock, machine-readable version change, migration plan, and rollback criteria for implementation failure where technically possible.

Operational governance may tune circulation pools and canonical conversion parameters only inside the constitutional envelope. Emergency action cannot remove the exit hard cap, create a hidden spread, authorize raw-volume minting, or silently change ordinary ATC transfer semantics.

---

## Flight Rule 10 — Canonical conversion must remain failure-isolated

Canonical ATC conversion is a separate high-risk subsystem and remains disabled by default.

Before any production activation, test at minimum:

- reference-price oracle failure,
- stale reference data,
- quote manipulation,
- reserve depletion,
- bank-run-style outflows,
- large correlated exits,
- delayed-exit queues,
- stress-surcharge activation and expiry,
- hard-cap enforcement,
- conversion receipt replay,
- external settlement rejection,
- external settlement timeout,
- double settlement,
- bridge failure,
- reserve reconciliation failure,
- operator insolvency scenarios,
- customer dispute and refund paths.

The quote must always expose the reference value separately from applied friction and net proceeds. Ordinary ATC transfers must remain outside the canonical exit spread.

Exit criteria:

- hard friction cap is enforced in code and tests,
- patient exit lowers friction according to the public schedule,
- no delay becomes indefinite without fresh user authorization,
- ATC is not retired before the external settlement acceptance point,
- failed external settlement leaves supply/accounting coherent,
- reserve and liability reconciliation design is documented,
- emergency states cannot silently exceed constitutional authority.

---

## Flight Rule 11 — Exchange operation requires legal and operational readiness

A correct protocol quote does not make an operator legally ready to exchange ATC for ETH, BTC, stablecoins, fiat, or other external value.

The Federation-operated canonical conversion service remains disabled until the responsible entity completes the applicable jurisdiction, licensing, money-transmission, securities/commodities, sanctions, AML/KYC, tax, custody, reserve, consumer-protection, privacy, and accounting analysis for the actual service design.

Exit criteria are defined in `docs/regulatory-launch-gate.md` and include qualified legal review. Governance approval does not substitute for legal authority required of the operator.

Marketing review is part of the gate. No production launch may promise guaranteed appreciation, infinite nominal value, risk-free return, or a market price manufactured by restricting exit.

---

## Flight Rule 12 — External anchoring

Bitcoin or BitcoinOS-like anchoring is optional and modular.

The anchor adapter should accept a canonical Aetherion state commitment and return a verifiable external receipt. Aetherion consensus must not stop if the adapter fails.

Exit criteria include anchoring disabled by default until implemented, external fees isolated from ATC monetary policy, independent review of anchor/bridge code, failure isolation, independently verifiable receipts, and truthful UI finality language.

---

## Flight Rule 13 — Security review before mainnet

Mainnet requires independent review of consensus integration, monetary state machine, cryptographic authentication, validator operations, identity credentials, governance execution, circulation issuance, wallet signing, APIs, persistence and backups, update mechanisms, anchor adapters, supply accounting, and any conversion/reserve interfaces intended for activation.

At least one review must be performed by people who did not author the implementation. A public bug bounty should precede or accompany mainnet readiness.

If canonical conversion will launch later than mainnet, its own independent review and regulatory gate remain required before activation.

---

# Flight phases

## Phase 0 — Constitutional ground test

Status: **active design**.

Deliverables include the white paper, philosophy, monetary constitution, human-rights safeguards, computer design, genesis specification, circulation/exchange design, regulatory launch gate, machine-readable genesis and manifest, deterministic reference policy, state machine, and tests.

## Phase 1 — Local sovereign node

Build a single-node application using the future production state machine, persistent storage, real transaction signatures, deterministic genesis, circulation event storage, and disabled canonical-conversion module. No claim of decentralization.

## Phase 2 — Multi-validator devnet

Run seven or more validators under intentionally adversarial testing. Validate networking, finality, restart, state sync, governance upgrades, supply invariants, circulation settlement, and deterministic quote behavior with external settlement mocked rather than represented as real money movement.

## Phase 3 — Public testnet

Open participation under testnet economics. Enable identity pilots, Pulse, wallet integration, governance rehearsals, circulation reward experiments, monitoring, and economic simulation based on observed behavior. Canonical external-value settlement remains test-only unless separately authorized.

## Phase 4 — Audit candidate

Freeze protocol interfaces long enough for external security and economic review. Resolve findings. Re-run deterministic state, circulation, exit, and supply tests from genesis.

## Phase 5 — Mainnet genesis vote

Production genesis parameters are not copied automatically from the design seed. They are generated from the audited code version, published, independently reproduced, and ratified under the launch governance procedure.

## Phase 6 — Mainnet

Mainnet begins with zero premine and no private allocation. Eligible issuance begins under the ratified rules. Circulation issuance activates only if its production pool and anti-abuse rules have passed the flight gates. External anchoring remains optional.

Canonical conversion may remain disabled at mainnet and activate later only after its independent technical, reserve, economic, governance, and regulatory launch gates are complete.

---

# Abort conditions

A launch or feature activation must stop if any of the following remain unresolved:

- supply invariant failure,
- nondeterministic consensus state,
- administrator ability to mint outside authorized transitions,
- hidden or accidental genesis balances,
- token-weighted validator power,
- token-weighted constitutional voting,
- identity system permitting trivial duplicate issuance,
- raw transaction count creating uncapped circulation issuance,
- circulation issuance exceeding its authorized epoch pool,
- trivial profitable wash-trading path under assumed identity model,
- replayable circulation or conversion receipts,
- ordinary ATC transfer silently receiving canonical exit friction,
- canonical exit spread exceeding the constitutional hard cap,
- quote UI hiding or rewriting the reference value,
- ATC burned before rejected external settlement is safely resolved,
- unaudited bridge represented as trustless,
- placeholder signatures in the production transaction path,
- random values affecting economic state,
- unresolved critical security findings,
- inability to reproduce genesis from public inputs,
- Federation-operated conversion activated without the required legal/operational review,
- public promise of guaranteed appreciation or infinite value as a financial return.

A delay under these conditions is not failure. Launching through them would be failure.

---

# The purpose of flight

Aetherion does not exist merely to put another token on a chain. Its technical purpose is to test whether a digital economy can preserve equal human standing while enforcing real constraints, whether monetary issuance can remain open-ended without becoming arbitrary, whether useful circulation can be rewarded without rewarding wash activity, whether internal monetary gravity can grow without trapping holders, and whether consensus, governance, identity, resources, money, and exchange can be disentangled enough that wealth does not automatically become sovereignty.

The network earns the right to speak about stewardship only by practicing it in its launch discipline.
