# Aetherion Computer Design

## 1. Design goal

Aetherion is an application-specific sovereign Layer 1 whose economic rules are deterministic, testable, and independent from token-weighted consensus. The system is engineered as a set of narrow modules with explicit authority boundaries rather than one monolithic application that mixes wallets, identity, AI, governance, exchange, and blockchain state.

The target architecture is:

```text
Wallets / AIFT Runtime / DynastyLink / APIs
                |
        Transaction Gateway
                |
        Authentication Layer
                |
      Aetherion State Machine
   |        |         |         |
Identity  Economy  Circulation  Governance
   |        |         |         |
   |     Budgets   QCE Receipts |
   |        |         |         |
   +--------+---------+---------+
                |
        Persistent Merkle State
                |
       CometBFT-compatible BFT
                |
         P2P / finality
                |
      +---------+----------+
      |                    |
Anchor Adapter      Canonical Exchange Adapter
      |                    |
Bitcoin / proofs    External settlement / reserves
```

The consensus engine determines ordered final state transitions. It does not decide monetary philosophy. The application state machine rejects any transition that violates the monetary constitution.

The canonical exchange adapter is not part of consensus liveness. Aetherion must continue producing valid blocks if the exchange service is unavailable, unlicensed, out of liquidity, or intentionally disabled.

---

## 2. Canonical state

The canonical application state should include at minimum the following domains.

### Identity registry

- opaque person identifier,
- attestation references,
- eligibility intervals,
- active/suspended state,
- recovery metadata references,
- duplicate-challenge state,
- privacy-preserving uniqueness proof references.

Raw civil identity should remain off-chain unless an explicit legal or operational requirement justifies otherwise.

### Account state

- ATC balance in integer base units,
- last normalized epoch where lazy demurrage is used,
- universal entitlement settlement cursor,
- sequence/nonce,
- optional local trust membership references.

### Monetary state

- cumulative authorized issuance,
- cumulative retirement,
- active policy version,
- universal issuance rate,
- demurrage parameter,
- governed budgets by epoch and program,
- issuance receipts,
- canonical retirement receipts.

### Circulation state

- authorized circulation pool by epoch,
- qualified transfer identifiers,
- used circulation receipt identifiers,
- pairwise directional qualified flow by epoch,
- circulation settlement status,
- sender/receiver score weights,
- per-identity reward cap,
- circulation issuance receipts.

Raw itemized purchase detail is not required in canonical circulation state. Production receipt systems should expose only the proof material needed to validate qualification.

### Canonical conversion state

Consensus-critical conversion policy may include:

- whether canonical conversion is enabled,
- maturity-friction schedule,
- bounded authenticated stress parameter,
- patient-exit discount schedule,
- minimum friction,
- hard friction cap,
- accepted conversion receipt identifiers,
- ATC retirement receipts,
- reference-value metadata required to reproduce a quote.

External reserve balances, bank accounts, fiat settlement, ETH/BTC custody, licensing records, and customer-compliance files are operator systems, not invented on-chain facts. Where cryptographic reserve commitments exist, the chain may record attestations or roots without pretending they prove complete solvency.

### Governance state

- proposals,
- chamber eligibility snapshots,
- votes,
- timelocks,
- execution status,
- constitutional version,
- emergency actions and expiry.

### Validator registry

- operator identity,
- validator public key,
- authorization state,
- equal unit voting power assignment,
- independence metadata,
- activation/deactivation epochs.

### Resource state

- Pulse quotas,
- replenishment epoch,
- abuse/rate-limit state,
- service-class metadata.

---

## 3. Determinism rules

Consensus state must never depend on `Math.random()`, validator-local wall-clock time, external HTTP responses during state transition, floating-point balance arithmetic, local filesystem state, AI model output, nondeterministic database ordering, symbolic spiritual metrics, or unauthenticated client claims.

All monetary values use integer base units. Rates use integer rationals such as parts per million or basis points. Circulation scoring uses integer arithmetic; the reference implementation uses deterministic integer square root rather than floating-point logarithms.

External evidence, price references, stress-state inputs, reserve attestations, and circulation receipts are admitted only through authenticated transactions or consensus-recognized evidence whose payload becomes deterministic input. Validators do not call a price API while executing a block.

---

## 4. Transaction envelope

A production transaction should include:

```text
version
chain_id
account_id
sequence
message_type
message_body
authorization_proof
fee_or_resource_proof
expiration
```

The application verifies chain ID, sequence, message schema, authorization, resource limits, and applicable policy before execution.

AI-generated transactions are only proposals until a human or separately authorized machine principal signs under an explicit policy.

---

## 5. Core message types

### Identity

- `RegisterEligibility`
- `SuspendEligibility`
- `RestoreEligibility`
- `RotateCredential`
- `ChallengeDuplicate`
- `ResolveChallenge`

### Money

- `SettleUniversalIssuance`
- `TransferATC`
- `CreateProgramBudget`
- `IssueContribution`
- `IssueRegenerative`
- `IssueStewardship`
- `RetireATC`

### Circulation

- `CreateCirculationPool`
- `QualifyCirculationTransfer`
- `SettleCirculationEpoch`

### Canonical conversion

- `SetCanonicalConversionPolicy`
- `SetBoundedLiquidityStressState`
- `RecordAcceptedExternalSettlement`
- `ExecuteCanonicalExitRetirement`

The reference implementation combines accepted-settlement verification and exit retirement into one function for testing, but a production distributed system may use a staged state machine with explicit timeout and recovery semantics.

### Governance

- `SubmitProposal`
- `CastHumanVote`
- `CastTrustVote`
- `QueueConstitutionalChange`
- `ExecuteTimelockedChange`

### Validator operations

- `RegisterValidatorCandidate`
- `AuthorizeValidator`
- `DeactivateValidator`
- `RotateValidatorKey`

### Resource accounting

- `ConsumePulse`
- `ReplenishPulse`
- `RequestServiceQuota`

No generic `Mint(amount)` transaction exists. No `DepositETHAndMintATC(amount)` shortcut exists.

---

## 6. Monetary execution

### Universal issuance

The state machine verifies the identity's historical eligibility intervals and last settled entitlement epoch. Every previously unsettled eligible epoch contributes exactly the configured baseline amount, while historical portions are aged through the same demurrage path they would have experienced if settled when earned.

Connectivity is therefore not the source of the right.

### Budgeted issuance

The state machine verifies that the program exists, the recipient is eligible, the evidence receipt is authenticated, the evidence has not been used, the requested issuance does not exceed remaining epoch budget, and the configured budget cannot be silently reset after spending.

### Demurrage

A production implementation should prefer lazy settlement rather than iterating through every account each epoch. Each account stores the epoch at which its balance was last normalized. On account access or transfer, deterministic decay for elapsed epochs is applied using integer arithmetic.

A network-wide aggregate accounting method must still prove:

`circulating = issued - retired`.

---

## 7. Circulation execution

Ordinary ATC transfer and circulation qualification are separate operations.

### Transfer

`TransferATC` changes balances and conserves supply. It does not apply canonical exit friction and does not mint a reward merely because the transaction exists.

### Qualification

A circulation qualification references a finalized transfer identifier and a unique authenticated circulation receipt. The state machine verifies:

1. the referenced transfer exists,
2. qualification occurs under the active epoch rule,
3. sender and receiver are distinct eligible principals,
4. the transfer has not already qualified,
5. the receipt has not been replayed,
6. the transferred amount is positive.

The reference model aggregates directional flow for each unordered identity pair during the epoch.

### Pairwise netting

At settlement:

`Q_pair = abs(flow_A_to_B - flow_B_to_A)`.

An exact direct round trip therefore contributes zero score.

### Diminishing-return score

The reference pair score is:

`floor(sqrt(Q_pair))`.

Role weights may then differentiate the net sender and net receiver. The design-devnet reference uses 40% sender weight and 60% receiver weight, but those are governance parameters.

### Bounded pool

The sum of actual circulation issuance may never exceed the authorized epoch pool. Each identity also has a configured maximum reward. If caps or integer rounding leave budget unused, the reference implementation leaves that remainder unissued.

A production implementation may add stronger graph-level anti-wash analysis, but any consensus-affecting method must remain deterministic and must not depend directly on opaque AI judgments.

---

## 8. Canonical exchange execution

The native chain does not attempt to detect every private sale of ATC. Canonical conversion is an explicit service boundary.

ATC retirement requires a previously recorded authenticated settlement record from the separately authorized exchange adapter. The record is single-use and binds the settlement identifier, person, ATC amount, reference external value in integer base units, conversion receipt, quoted net external proceeds, accountable operator, and authentication proof. A caller-provided boolean is never settlement evidence. The state machine rejects missing, replayed, or field-mismatched records before changing balances or retirement totals.

### Quote inputs

A deterministic exit quote consumes authenticated inputs including:

- ATC amount to be surrendered,
- reference external value,
- current epoch,
- maturity-friction parameters,
- bounded stress state,
- selected delay,
- delay-discount parameters,
- minimum friction,
- hard friction cap.

### Quote output

The output records:

- unchanged reference external value,
- applied canonical friction,
- expected net external proceeds,
- expected reserve retention.

The spread never rewrites the reference value.

### Maturity component

The reference design uses bounded linear interpolation from a configured starting friction toward a configured mature friction across a fixed number of epochs. Production parameters must be governance-ratified after simulation.

### Stress component

The reference state machine accepts only a stress value at or below the governed maximum. A production stress-state transition requires an authenticated and reviewable source. An AI prediction cannot silently become a consensus-level surcharge.

### Patient exit

A selected delay reduces friction according to a public capped schedule while respecting a minimum friction floor. Delay selection must be visible in the signed request.

### Retirement

ATC is retired only after the external settlement path reaches its defined acceptance point. A production implementation must specify atomicity, escrow, timeout, dispute, and recovery semantics so an external settlement failure cannot leave the user without either ATC or the external asset.

### Reserve separation

The reference state machine records reserve-retention mathematics but does not custody the external asset. The reserve operator must maintain its own auditable asset/liability, custody, compliance, and solvency systems.

---

## 9. Consensus and validator power

The target consensus engine is CometBFT-compatible BFT.

Aetherion intentionally does not derive validator voting power from ATC stake. Authorized validators receive equal unit voting power unless a future security review establishes a different non-wealth-based weighting that passes constitutional governance.

The validator registry is itself a high-risk governance surface. Production policy should require independent operators, disclosed control relationships, key rotation, double-sign protection, sentry topology where appropriate, monitoring, geographic and infrastructure diversity, and removal procedure with due process except during objectively defined emergency faults.

---

## 10. Identity architecture

Identity is a federated attestation graph rather than a public identity database.

AIFT-Genesis supplies constitutional identity patterns. Independent attesters may issue eligibility credentials. The chain needs proof that a credential is valid and unique enough for the requested right; it does not necessarily need underlying civil data.

Circulation adds another privacy requirement: proving that two distinct eligible principals completed a qualifying settlement should not automatically reveal the complete commercial context of that settlement.

Long-term research targets include zero-knowledge uniqueness proofs, unlinkable credentials, selective disclosure, threshold recovery, privacy-preserving settlement receipts, and multi-attester duplicate resistance.

---

## 11. Pulse resource system

ATC is not the anti-spam mechanism.

Pulse is a non-transferable resource allowance used to price or rate-limit execution. A basic Pulse allowance can replenish for eligible persons and validators. High-volume applications may receive additional governed or purchased service capacity, but purchased capacity cannot create human governance weight.

Pulse state should be localizable where possible so every low-level resource event does not burden global consensus.

---

## 12. Storage

Production state requires an authenticated persistent store. Consensus-critical keys must have documented prefixes and migration rules.

Recommended logical namespaces:

```text
identity/
account/
monetary/
budget/
evidence/
circulation/
conversion/
governance/
validator/
resource/
anchor/
protocol/
```

Every migration must be deterministic and versioned.

External reserve/custody databases are not silently treated as canonical chain state. If they produce on-chain attestations, the scope and limitations of those attestations must be explicit.

---

## 13. API boundary

Public APIs expose queries and transaction submission, not direct database mutation.

Suggested services include node status, account balance and entitlement status, issuance receipts, program budgets, circulation pool and settlement status, governance proposals, validator registry, canonical conversion policy, quote simulation, anchor receipts, and protocol parameters.

Sensitive identity evidence, detailed purchase information, compliance files, private reserve credentials, and signing secrets should not be returned through generic public endpoints.

---

## 14. Wallet and exchange interface design

Wallets must display network name and chain ID, devnet/testnet/mainnet status, exact amount and recipient, message type, resource impact, signer identity, and whether an operation mints, transfers, retires, votes, changes identity state, changes validator state, qualifies circulation, or enters a canonical conversion.

Before canonical conversion authorization, the interface must additionally display ATC surrendered, reference external value, reference source/age where relevant, maturity friction, stress surcharge, patient-exit discount, total friction, constitutional maximum, net expected proceeds, reserve retention, selected delay, retirement behavior, and external operator fees.

AI assistance may explain these fields but cannot hide or replace them.

---

## 15. Anchor adapter

The anchor interface is asynchronous and failure-isolated:

```text
submit(state_commitment) -> pending receipt
query(receipt_id) -> pending | confirmed | failed
verify(receipt) -> boolean
```

Aetherion block production never waits on Bitcoin or BitcoinOS-like infrastructure. The adapter must not custody bridge funds unless a separately audited bridge protocol is intentionally deployed.

---

## 16. External exchange adapter

The canonical exchange adapter is also asynchronous and failure-isolated. A production interface should separate quote, authorization, external settlement, and final ATC retirement.

Conceptually:

```text
quote(request) -> signed quote
accept(quote, user_authorization) -> pending settlement
query(settlement_id) -> pending | accepted | failed | disputed
finalize(accepted settlement) -> ATC retirement receipt
```

The operator may be legally unable to offer the service in some jurisdictions. That condition disables the adapter; it does not halt Layer 1 consensus or ordinary ATC transfers.

---

## 17. Legacy code migration

The repository contains historical browser-side blockchain demonstrations with local proof-of-work, simulated signatures, hard-coded network endpoints, and symbolic Biozoe metrics. These are educational/prototype artifacts, not the canonical Layer 1.

Migration rule:

1. new consensus-critical code goes under `protocol/` or the future dedicated node implementation,
2. legacy UI code consumes the canonical API rather than inventing balances locally,
3. random symbolic metrics remain visualization-only,
4. placeholder signatures never enter a production transaction path,
5. old chain IDs and RPC strings are not evidence that a mainnet exists,
6. no legacy transfer-tax pattern becomes the canonical exchange policy,
7. no browser-side heuristic decides that a transfer is a sale for consensus purposes.

---

## 18. Language and implementation split

Aetherion uses four engineering status labels:

- **implemented** — present in code and exercised by tests,
- **prototype** — implemented but not production-hardened,
- **planned** — specified but not implemented,
- **audited** — independently reviewed within a named scope.

No component becomes audited merely by being open source. No conversion service becomes lawful merely because the protocol can calculate a quote.

---

## 19. Minimum production properties

A production candidate must demonstrate deterministic state execution, authenticated transactions, reproducible genesis, persistent state and recovery, consensus fault testing, supply invariants, identity duplicate resistance, governance timelocks, no privileged mint path, bounded circulation issuance, anti-replay protection, wallet key safety, independent security review, operational monitoring, and public incident response.

If circulation issuance is active, production must additionally demonstrate anti-wash testing and privacy-preserving qualification appropriate to the threat model.

If canonical conversion is active, production must additionally demonstrate quote integrity, hard-cap enforcement, reserve reconciliation, safe external settlement, disclosure, operator security, and the required legal/operational launch approval.

The architecture is intentionally conservative in consensus and radical in monetary separation. Innovation belongs where it can be reasoned about and tested without unnecessarily multiplying foundational failure modes.
