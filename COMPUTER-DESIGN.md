# Aetherion Computer Design

## 1. Design goal

Aetherion is an application-specific sovereign Layer 1 whose economic rules are deterministic, testable, and independent from token-weighted consensus. The system should be engineered as a set of narrow modules with explicit authority boundaries rather than one monolithic application that mixes wallets, identity, AI, governance, and blockchain state.

The target architecture is:

```text
Wallets / AIFT Runtime / DynastyLink / APIs
                |
        Transaction Gateway
                |
        Authentication Layer
                |
      Aetherion State Machine
        |       |       |
    Identity  Economy  Governance
        |       |       |
        Evidence / Budget Modules
                |
        Persistent Merkle State
                |
       CometBFT-compatible BFT
                |
     P2P / blocks / finality
                |
       Optional Anchor Adapter
                |
       Bitcoin / BitcoinOS-like proof rail
```

The consensus engine determines ordered final state transitions. It does not decide monetary philosophy. The application state machine rejects any transition that violates the monetary constitution.

---

## 2. Canonical state

The canonical application state should include at minimum:

### Identity registry

- opaque person identifier,
- attestation references,
- eligibility start epoch,
- active/suspended state,
- recovery metadata references,
- duplicate-challenge state,
- privacy-preserving uniqueness proof references.

Raw civil identity should remain off-chain unless an explicit legal or operational requirement justifies otherwise.

### Account state

- ATC balance in integer base units,
- last settled epoch where lazy demurrage is used,
- universal issuance claim epoch,
- sequence/nonce,
- optional local trust membership references.

### Monetary state

- cumulative authorized issuance,
- cumulative retirement,
- active policy version,
- universal issuance rate,
- demurrage parameter,
- active governed budgets by epoch and program,
- issuance receipts.

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

Consensus state must never depend on:

- `Math.random()`,
- wall-clock time read independently by validators,
- external HTTP responses during state transition,
- floating-point arithmetic for balances,
- local filesystem state,
- AI model output,
- nondeterministic database ordering,
- symbolic spiritual metrics,
- client-provided claims that have not been authenticated.

All monetary arithmetic uses integer base units. Any rate is represented as an integer rational such as parts per million or numerator/denominator pairs.

External evidence and oracles are admitted only through signed/attested transactions whose payload becomes deterministic consensus input.

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

- `ClaimUniversalIssuance`
- `TransferATC`
- `CreateProgramBudget`
- `IssueContribution`
- `IssueRegenerative`
- `IssueStewardship`
- `RetireATC`

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

No generic `Mint(amount)` transaction exists.

---

## 6. Monetary execution

### Universal issuance

The state machine verifies:

1. account is linked to an eligible identity,
2. identity is active and not suspended,
3. current epoch is at or after eligibility start,
4. universal issuance has not already been claimed this epoch.

It then credits exactly the configured baseline amount.

### Budgeted issuance

The state machine verifies:

1. program exists,
2. program is active,
3. recipient is eligible under the program's published rules,
4. evidence receipt is authenticated by an authorized evidence path,
5. requested issuance does not exceed remaining epoch budget,
6. the same evidence cannot be replayed.

### Demurrage

A production implementation should prefer lazy settlement rather than iterating through every account each epoch. Each account stores the epoch at which its balance was last normalized. On account access or transfer, the deterministic decay for elapsed epochs is applied using integer arithmetic.

A network-wide aggregate accounting method must still prove:

`circulating = issued - retired`.

---

## 7. Consensus and validator power

The target consensus engine is CometBFT-compatible BFT.

Aetherion intentionally does not derive validator voting power from ATC stake. Authorized validators receive equal unit voting power unless a future security review establishes a different non-wealth-based weighting that passes constitutional governance.

The validator registry is itself a high-risk governance surface. Production policy should require:

- independent operators,
- disclosed control relationships,
- key rotation,
- double-sign protection,
- sentry topology where appropriate,
- monitoring,
- geographic and infrastructure diversity,
- removal procedure with due process except during objectively defined emergency faults.

---

## 8. Identity architecture

Identity is a federated attestation graph rather than a public identity database.

AIFT-Genesis supplies constitutional identity patterns. Independent attesters may issue eligibility credentials. The chain needs proof that a credential is valid and unique enough for the requested right; it does not necessarily need the underlying civil data.

Long-term research targets include zero-knowledge uniqueness proofs, unlinkable credentials, selective disclosure, threshold recovery, and multi-attester duplicate resistance.

Identity design must assume that biometric systems, government IDs, social graphs, and institutional attestations all have failure modes. No one evidence source becomes metaphysically authoritative.

---

## 9. Pulse resource system

ATC is not the anti-spam mechanism.

Pulse is a non-transferable resource allowance used to price or rate-limit execution. A basic Pulse allowance can replenish for eligible persons and validators. High-volume applications may receive additional governed or purchased service capacity, but purchased capacity cannot create human governance weight.

Pulse state should be localizable where possible so every low-level resource event does not burden global consensus.

---

## 10. Storage

Production state requires an authenticated persistent store. The initial implementation may use the storage abstraction provided by the chosen application framework, but all consensus-critical keys must have documented prefixes and migration rules.

Recommended logical namespaces:

```text
identity/
account/
monetary/
budget/
evidence/
governance/
validator/
resource/
anchor/
protocol/
```

Every migration must be deterministic and versioned.

---

## 11. API boundary

Public APIs expose queries and transaction submission, not direct database mutation.

Suggested services:

- node status,
- account balance and claim status,
- issuance receipts,
- program budgets,
- governance proposals,
- validator registry,
- anchor receipts,
- protocol parameters.

Sensitive identity evidence should not be returned through generic public endpoints.

---

## 12. Wallet design

Wallets must display:

- network name and chain ID,
- devnet/testnet/mainnet status,
- exact amount and recipient,
- message type,
- estimated resource/fee impact,
- whether an operation mints, transfers, retires, votes, changes identity state, or changes validator state,
- the signer actually being used.

AI assistance may explain these fields but cannot hide or replace them.

---

## 13. Anchor adapter

The anchor interface is asynchronous and failure-isolated.

```text
submit(state_commitment) -> pending receipt
query(receipt_id) -> pending | confirmed | failed
verify(receipt) -> boolean
```

The state machine may record a confirmed external receipt, but Aetherion block production never waits on Bitcoin or BitcoinOS-like infrastructure.

The adapter must not custody bridge funds unless a separately audited bridge protocol is intentionally deployed.

---

## 14. Legacy code migration

The repository contains historical browser-side blockchain demonstrations with local proof-of-work, simulated signatures, hard-coded network endpoints, and symbolic Biozoe metrics. These are educational/prototype artifacts, not the canonical Layer 1.

Migration rule:

1. new consensus-critical code goes under `protocol/` or the future dedicated node implementation,
2. legacy UI code consumes the canonical API rather than inventing balances locally,
3. random symbolic metrics remain visualization-only,
4. placeholder signatures never enter a production transaction path,
5. old chain IDs and RPC strings are not treated as evidence that a mainnet exists.

---

## 15. Language and implementation split

Aetherion uses four epistemic labels in engineering surfaces:

- **implemented** — present in code and exercised by tests,
- **prototype** — implemented but not production-hardened,
- **planned** — specified but not implemented,
- **audited** — independently reviewed within a named scope.

No component becomes audited merely by being open source.

---

## 16. Minimum production properties

A production candidate must demonstrate:

- deterministic state execution,
- authenticated transactions,
- reproducible genesis,
- persistent state and recovery,
- consensus fault testing,
- supply invariant checks,
- identity duplicate resistance,
- governance timelocks,
- no privileged mint path,
- wallet key safety,
- independent security review,
- operational monitoring,
- public incident-response procedure.

The architecture is intentionally conservative in consensus and radical in monetary separation. Innovation belongs where it can be reasoned about and tested without unnecessarily multiplying foundational failure modes.
