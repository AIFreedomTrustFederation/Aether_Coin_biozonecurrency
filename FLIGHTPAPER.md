# Aetherion Flight Paper

## From constitutional design to public network

The white paper defines what Aetherion is meant to become. This flight paper defines how the system is allowed to leave the ground.

Aetherion must not launch by pretending a prototype is already a sovereign Layer 1. It must pass visible gates in sequence. The rule is simple: **no claim advances faster than the evidence supporting it.**

---

## Flight Rule 1 — Constitution before capital

Before any token sale, exchange listing, liquidity campaign, or speculative promotion, the monetary constitution must be public, versioned, machine-readable, and testable.

The founding invariants are:

- no premine,
- no founder allocation,
- no investor allocation,
- no terminal supply cap,
- no token-weighted human governance,
- no balance-derived validator power,
- no early-adopter multiplier on universal issuance,
- no hidden treasury mint,
- no unilateral administrative balance rewrite,
- no spiritual or symbolic metric treated as cryptographic evidence.

A public network that violates these invariants is not the Aetherion described by this repository.

---

## Flight Rule 2 — Reference state machine before consensus integration

The monetary state machine must be deterministic and independently testable before it is connected to a consensus engine.

Minimum reference transitions:

1. identity registration from an authenticated attestation,
2. eligibility status change,
3. universal issuance claim,
4. transfer,
5. governed budget configuration,
6. evidence-bound contribution issuance,
7. evidence-bound regenerative issuance,
8. demurrage settlement,
9. epoch transition,
10. supply-invariant verification.

The reference implementation in `protocol/reference/` is the beginning of this gate, not the end of it.

Exit criteria:

- deterministic tests pass,
- arithmetic uses integer units,
- no randomness affects balances,
- every mint has a typed cause,
- every retirement has a typed cause,
- ordinary transfers conserve supply,
- issued minus retired equals circulating supply.

---

## Flight Rule 3 — Consensus integration

The target implementation should use a mature BFT engine rather than a novel wealth-based consensus scheme.

Reference architecture:

`CometBFT-compatible consensus -> Aetherion application state machine -> persistent state -> RPC/API -> wallet/runtime`.

Validator voting power must be independent of ATC balances. The initial target is equal unit voting power among authorized active validators.

Exit criteria for a public devnet:

- at least 7 validators,
- no single operator controls more than one validator identity unless explicitly disclosed for a local-only test,
- at least 3 independent operators,
- deterministic genesis,
- reproducible node build,
- peer discovery and state sync tested,
- evidence that a minority validator outage does not halt the network below the expected BFT threshold,
- evidence that conflicting state is not finalized under the assumed fault bound.

Public testnet targets should be stricter than devnet targets.

---

## Flight Rule 4 — Identity and Sybil resistance

Universal issuance cannot be safe without a credible uniqueness system.

Aetherion should not centralize global personhood in one database. The target is a plural attestation network compatible with AIFT-Genesis trust identity.

Required properties:

- one active baseline issuance stream per human,
- privacy-preserving uniqueness where practical,
- no requirement to publish raw government identifiers on-chain,
- revocation and recovery,
- duplicate challenge procedure,
- appeal and due process,
- multiple independent attesters,
- documented handling of minors, guardianship, deceased identities, lost keys, and contested records.

Exit criteria:

- threat model published,
- duplicate-identity red-team tests completed,
- recovery tested without administrator ability to seize arbitrary balances,
- independent privacy review completed before production personhood credentials.

---

## Flight Rule 5 — Economic simulation

A mathematically valid currency can still be economically unstable.

Before production, simulate at minimum:

- population growth and contraction,
- participation rates,
- lost accounts,
- high saving vs high circulation behavior,
- demurrage rates,
- contribution budget expansion,
- validator/service compensation,
- shocks to real resource supply,
- exchange-rate volatility,
- coordinated Sybil attacks,
- large-holder behavior,
- program fraud,
- migration between local trust economies.

No fixed parameter in the design seed is sacred. The invariants are constitutional; rates are empirical governance parameters.

Exit criteria:

- simulation code and assumptions public,
- sensitivity analysis published,
- no hidden founder subsidy,
- inflation/deflation scenarios explained in plain language,
- production parameters ratified through the governance process rather than copied from the design-devnet seed.

---

## Flight Rule 6 — Pulse resource accounting

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

## Flight Rule 7 — Wallet and custody safety

A wallet UI is not custody security.

Production wallet support requires:

- real signature verification,
- secure key generation,
- hardware-wallet strategy where possible,
- explicit network and amount display before signing,
- transaction simulation where supported,
- recovery design,
- no seed phrase transmission to AI providers,
- no silent AI signing,
- clear separation between recommendation and authorization.

The Federation covenant remains:

`Receive -> Inspect -> Name -> Propose -> Consent -> Act -> Verify -> Record -> Return`.

Exit criteria:

- signing path externally reviewed,
- secrets excluded from logs and model prompts,
- malicious transaction tests completed,
- recovery and device-loss procedures tested,
- wallet clearly distinguishes devnet, testnet, and mainnet.

---

## Flight Rule 8 — Governance implementation

Governance must exist in executable procedure rather than aspirational prose.

The target constitutional model uses at least two independent forms of consent:

- a verified-human chamber,
- a federated trust/community chamber.

ATC balances are excluded from vote weight.

Constitutional amendments require:

- published proposal text,
- impact analysis,
- minimum deliberation period,
- supermajority in each required chamber,
- post-approval timelock,
- machine-readable version change,
- migration plan,
- rollback criteria for implementation failure where technically possible.

Emergency action cannot silently change constitutional monetary invariants.

---

## Flight Rule 9 — External anchoring

Bitcoin or BitcoinOS-like anchoring is optional and modular.

The anchor adapter should accept a canonical Aetherion state commitment and return a verifiable external receipt. Aetherion consensus must not stop if the adapter fails.

Exit criteria:

- anchoring disabled by default until implemented,
- external fees isolated from ATC monetary policy,
- bridge and anchor code independently reviewed,
- failures cannot corrupt Aetherion state,
- receipts can be verified independently,
- the public UI never describes an unconfirmed anchor as final.

---

## Flight Rule 10 — Security review before mainnet

Mainnet requires independent review of:

- consensus integration,
- monetary state machine,
- cryptographic authentication,
- validator operations,
- identity credentials,
- governance execution,
- wallet signing,
- APIs,
- persistence and backups,
- update mechanism,
- bridge/anchor adapters,
- supply accounting.

At least one review must be performed by people who did not author the implementation.

A public bug bounty should precede or accompany mainnet readiness.

---

# Flight phases

## Phase 0 — Constitutional ground test

Status: **active design**.

Deliverables:

- `WHITEPAPER.md`,
- `PHILOSOPHY.md`,
- `MONETARY-CONSTITUTION.md`,
- `COMPUTER-DESIGN.md`,
- `GENESIS.md`,
- `protocol/genesis.seed.json`,
- deterministic reference policy and tests.

## Phase 1 — Local sovereign node

Build a single-node application using the future production state machine, persistent storage, real transaction signatures, and deterministic genesis. No claim of decentralization.

## Phase 2 — Multi-validator devnet

Run 7+ validators under intentionally adversarial testing. Validate networking, finality, restart, state sync, governance upgrades, and supply invariants.

## Phase 3 — Public testnet

Open participation under testnet economics. Enable identity pilots, Pulse, wallet integration, governance rehearsals, monitoring, and economic simulation based on observed behavior.

## Phase 4 — Audit candidate

Freeze protocol interfaces long enough for external security review. Resolve findings. Re-run deterministic state and economic tests from genesis.

## Phase 5 — Mainnet genesis vote

Production genesis parameters are not copied automatically from the design seed. They are generated from the audited code version, published, independently reproduced, and ratified under the launch governance procedure.

## Phase 6 — Mainnet

Mainnet begins with zero premine and no private allocation. Eligible issuance begins under the ratified rules. External anchoring remains optional and may activate later through governance after independent review.

---

# Abort conditions

A launch must stop if any of the following remain unresolved:

- supply invariant failure,
- nondeterministic consensus state,
- administrator ability to mint outside authorized transitions,
- hidden or accidental genesis balances,
- token-weighted validator power,
- token-weighted constitutional voting,
- identity system permitting trivial duplicate issuance,
- unaudited bridge represented as trustless,
- placeholder signatures in the production transaction path,
- random values affecting economic state,
- unresolved critical security findings,
- inability to reproduce genesis from public inputs.

A delay under these conditions is not failure. Launching through them would be failure.

---

# The purpose of flight

Aetherion does not exist merely to put another token on a chain. Its technical purpose is to test whether a digital economy can preserve equal human standing while still enforcing real constraints, whether monetary issuance can remain open-ended without becoming arbitrary, and whether consensus, governance, identity, resources, and money can be disentangled enough that wealth does not automatically become sovereignty.

The network earns the right to speak about stewardship only by practicing it in its launch discipline.
