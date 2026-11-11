# Aetherion Threat Model

## Scope

This document models threats to the proposed sovereign Aetherion Layer 1, Biozoe issuance, identity eligibility, circulation rewards, canonical exchange, governance, validator operations, wallets, resource accounting, and optional external anchoring.

A spiritual commitment to truth and stewardship does not reduce the adversarial assumptions. The system is designed on the expectation that some participants, operators, attackers, governments, companies, bots, insiders, market actors, and compromised machines will attempt to exploit it.

## Protected properties

Aetherion aims to preserve:

- deterministic final state,
- no unauthorized issuance,
- no hidden private genesis allocation,
- one universal baseline stream per eligible person,
- ordinary transfer conservation,
- bounded circulation issuance,
- no reward from raw transaction count alone,
- replay-safe circulation qualification,
- no canonical exit friction on ordinary ATC transfer,
- truthful separation of reference value from net exit proceeds,
- canonical exit friction below the constitutional hard cap,
- no ATC retirement before accepted external settlement,
- correct cumulative issuance/retirement accounting,
- non-token-weighted governance,
- non-wealth-weighted validator power,
- privacy of unnecessary identity and purchase data,
- informed transaction and conversion consent,
- recoverable operation after minority faults,
- continued Layer 1 liveness without external anchors or exchange services.

## Trust boundaries

### Consensus engine

Trusted only within its documented Byzantine fault assumptions. Validator keys and software can be compromised.

### Application state machine

Trusted only if deterministic code matches the reviewed protocol version. Bugs can mint, destroy, freeze, misroute, over-reward, or improperly retire value even when consensus itself works perfectly.

### Identity attesters

Not globally trusted. Individual attesters can be corrupt, mistaken, coerced, unavailable, or discriminatory.

### Circulation receipt issuers

Not globally trusted. They may collude with users, replay or manufacture settlement evidence, leak private purchase information, or create reward farms. Production policy must define who can attest circulation and how those attestations are challenged.

### Governance

Not inherently benevolent. Majorities and institutions can collude, panic, capture procedure, inflate circulation pools, manipulate exchange parameters, or attempt to alter rights.

### Wallets

User devices can contain malware. Interfaces can be deceptive. AI can hallucinate. Browser extensions can be compromised.

### Canonical exchange operator

Independently fallible and legally constrained. The operator may become insolvent, misstate reserves, fail settlement, manipulate quotes, mis-handle customer data, or be forced to suspend service. Aetherion consensus must not depend on operator availability.

### Reference-price and stress inputs

Not inherently truthful. External market data can be stale, manipulated, unavailable, or inconsistent across venues. A stress-state source can be captured or overreact to market noise. Validators must consume authenticated deterministic inputs rather than calling live APIs during execution.

### External anchors/bridges

Assumed independently fallible. Aetherion must not depend on them for internal liveness.

## Threat classes

### Sybil issuance attack

An attacker creates many identities and claims universal issuance repeatedly.

Mitigations:

- plural uniqueness attestations,
- credential replay prevention,
- duplicate challenge process,
- privacy-preserving uniqueness research,
- rate limits,
- attester accountability,
- anomaly monitoring without making anomaly scores final judgments.

Residual risk: personhood is a difficult social/technical problem. No identity system should be represented as perfect.

### Circulation identity splitting

A single actor creates many eligible identities so each one receives a separate circulation reward cap or appears to provide independent counterparty diversity.

Mitigations:

- the same strong uniqueness layer used for baseline issuance,
- receipt issuer diversity,
- capped total circulation pool,
- per-identity caps,
- graph-level anomaly analysis outside consensus,
- challenge and review procedures,
- delayed activation of circulation issuance until identity costs make trivial splitting uneconomic.

Residual risk: if personhood is cheap to fake, per-person circulation caps are cheap to evade.

### Attester cartel

Multiple attesters collude to manufacture eligible identities or exclude a population.

Mitigations:

- diverse attesters,
- threshold or cross-domain evidence for higher-risk rights,
- public attester performance/accountability,
- appeal paths,
- governance separation between attester accreditation and individual eligibility decisions,
- no single permanent identity oracle.

### Founder/admin mint backdoor

A privileged actor creates ATC outside constitutional issuance classes.

Mitigations:

- no generic mint transaction,
- machine-readable genesis checks,
- supply invariant checks,
- code review,
- no production superuser database balance edits,
- independent state indexers monitoring issuance receipts.

### Budget capture

A governance coalition creates enormous contribution, stewardship, regenerative, or circulation budgets for insiders.

Mitigations:

- public budgets,
- epoch bounds,
- deliberation periods,
- multi-chamber approval for high-impact monetary expansion,
- simulation requirements,
- conflict-of-interest disclosure,
- public issuance receipts,
- caps on program or participant concentration where governance adopts them.

### Evidence forgery/replay

One contribution receipt is forged or used repeatedly.

Mitigations:

- authenticated evidence issuers,
- unique evidence IDs,
- replay state,
- scoped program rules,
- challenge process,
- signed issuance receipts.

### Circulation receipt replay

One qualified transfer or circulation receipt is used repeatedly to obtain rewards.

Mitigations:

- unique transfer identifiers,
- unique circulation receipt identifiers,
- transfer double-qualification state,
- receipt replay state,
- epoch-bounded settlement,
- deterministic audit events.

### Direct wash trading

Two participants repeatedly send ATC back and forth to manufacture reward volume.

Mitigation: qualified directional flow is netted by unordered pair before scoring. Exact direct round trips contribute zero net pair score.

### Ring wash trading

Several distinct identities create a cycle such as `A -> B -> C -> A` so pairwise netting does not erase the apparent flow.

Mitigations:

- fixed circulation epoch pool,
- diminishing-return scoring,
- per-identity caps,
- strong unique-person controls,
- receipt authentication,
- graph-level off-chain monitoring and red-team simulation,
- potential future deterministic graph rules only after privacy and false-positive analysis.

Residual risk: no privacy-preserving economic protocol can perfectly distinguish all real circular commerce from collusive wash activity. Bounded issuance is therefore a primary safety control rather than an admission of perfect classification.

### Micro-transaction farming

An attacker splits one economic exchange into thousands of tiny transfers hoping transaction count itself increases rewards.

Mitigation: raw transaction count has no reward authority. Pair scoring is based on qualified net value, not number of transfers.

### Whale circulation dominance

Large holders attempt to consume most of the circulation pool through large transactions.

Mitigations:

- integer square-root diminishing-return score,
- per-identity reward cap,
- fixed epoch pool,
- independent counterparty breadth rather than linear volume rebate.

### Validator cartel

A threshold of validators colludes to censor, halt, or finalize invalid transitions.

Mitigations:

- sufficient validator count,
- independent operators,
- infrastructure/jurisdictional diversity,
- equal unit voting power rather than wealth concentration,
- monitoring and public liveness data,
- key rotation,
- governance removal process,
- client-side verification of application rules where practical.

Equal validator voting power does not solve operator collusion if one entity controls many validator identities. Operator-independence verification is therefore essential.

### Governance identity stuffing

Attackers manufacture civic identities to capture human-chamber votes.

Mitigations overlap with universal-issuance Sybil resistance, but governance may require stronger eligibility age, participation, challenge, or snapshot rules that do not depend on token wealth.

### Institutional chamber capture

A small set of trusts or organizations collude in the second governance chamber.

Mitigations:

- transparent accreditation,
- diversity constraints,
- term/renewal rules,
- disclosed control relationships,
- constitutional requirement for consent from multiple chambers,
- inability of the institutional chamber alone to reduce individual standing.

### Circulation-pool governance attack

Governance expands future circulation pools so aggressively that reward-seeking activity becomes the dominant source of ATC issuance.

Mitigations:

- public simulation,
- epoch-bounded pools,
- monetary impact reports,
- timelocks for material changes,
- constitutional prohibition on automatic volume-driven expansion,
- multi-chamber thresholds for high-impact issuance changes.

### Exit-friction governance capture

Governance or an emergency operator attempts to raise canonical exit friction until holders are effectively trapped.

Mitigations:

- constitutional hard cap below 100%,
- verifier checks,
- ordinary ATC transfers excluded from canonical exit friction,
- patient-exit discount rules,
- signed quote disclosure,
- constitutional amendment rather than ordinary parameter change required to weaken the right to exit.

### Reference-price manipulation

An attacker manipulates the oracle or venue selection so the canonical service quotes an unfair reference value.

Mitigations:

- authenticated reference inputs,
- multi-source methodology where appropriate,
- freshness limits,
- outlier handling,
- quote source disclosure,
- deterministic aggregation,
- circuit breakers for missing/incoherent data,
- independent monitoring.

The exit spread must remain a separate field and cannot be hidden by manipulating the reference-value definition.

### Liquidity-stress oracle attack

An attacker or captured operator falsely declares severe stress to increase the canonical exit spread.

Mitigations:

- bounded maximum stress surcharge,
- transparent objective trigger methodology,
- authenticated state transition,
- expiry/review requirements,
- hard total friction cap,
- public event history,
- no AI-only authority to set consensus surcharge.

### Bank-run / correlated exit

Many users seek external conversion simultaneously and the canonical reserve cannot satisfy obligations.

Mitigations:

- explicit reserve/liability model,
- liquidity stress testing,
- patient-exit queues,
- transparent settlement delays,
- reserve diversification appropriate to legal design,
- external custody safeguards,
- rate-limited conversion capacity where disclosed,
- protocol independence so ordinary ATC ownership/transfer continues if the exchange suspends.

Residual risk: exchange liquidity cannot be guaranteed by Layer 1 consensus alone.

### Reserve insolvency or false reserve claim

The exchange operator lacks the external assets necessary to settle promised conversions or publishes misleading proof-of-reserve information.

Mitigations:

- segregated/defined custody structure,
- asset/liability reconciliation,
- independent audit or attestation appropriate to the claim,
- no statement of full backing based solely on wallet balances,
- public reserve policy,
- solvency monitoring,
- operator legal/accounting controls.

### Pre-settlement ATC burn

A bug retires ATC before the external asset transfer is accepted, leaving the user without either side of the exchange.

Mitigations:

- explicit settlement state machine,
- no retirement before accepted settlement,
- conversion receipt replay protection,
- timeout/recovery semantics,
- property tests,
- independent cross-asset settlement review.

### Double external settlement

A conversion receipt or settlement state is processed twice.

Mitigations:

- unique conversion receipt IDs,
- idempotent external settlement identifiers,
- finalized state transitions,
- replay protection in both protocol and operator systems.

### Quote/UI deception

A wallet or exchange UI hides the reference price, friction, delay, or reserve retention, making an unfavorable conversion appear to be the market value.

Mitigations:

- signed quote payload,
- mandatory plain-language fields,
- deterministic client verification,
- explicit user authorization,
- no dark-pattern consent,
- independent wallet implementations where possible.

### Canonical-service regulatory failure

An operator activates exchange/redemption without required licensing, sanctions controls, consumer safeguards, or other applicable obligations.

Mitigations:

- disabled-by-default service,
- regulatory launch gate,
- identified accountable operator,
- jurisdiction-specific legal review,
- governance cannot override external legal obligations,
- ability to disable the exchange service without halting Layer 1.

### Wallet key theft

An attacker steals signing authority.

Mitigations:

- hardware wallet support,
- secure key generation,
- local signing,
- transaction previews,
- optional multisig/threshold custody,
- recovery paths,
- no AI transmission of private keys or seed phrases.

### AI-induced transaction harm

An AI invents an address, misunderstands a transaction, falsely classifies commerce, or persuades a person to sign a harmful action.

Mitigations:

- AI outputs are proposals only,
- deterministic wallet transaction decoding,
- recipient/amount/network display,
- explicit human authorization,
- no hidden tool signing,
- policy limits for automated agents,
- AI does not set circulation eligibility or exchange stress state by itself.

### Demurrage implementation bug

Rounding, epoch handling, or lazy settlement creates inconsistent balances.

Mitigations:

- integer arithmetic,
- canonical rate representation,
- property tests,
- cross-implementation test vectors,
- explicit rounding direction,
- invariant accounting,
- deterministic migration tests.

### Resource-exhaustion attack

An attacker exploits unbounded monetary philosophy to submit unlimited computation.

Mitigations:

- Pulse non-transferable quotas,
- connection and transaction rate limits,
- per-message resource costs,
- bounded block resources,
- mempool controls,
- abuse throttling,
- service-class isolation.

### Demurrage avoidance through account splitting

Users split balances across many accounts hoping to evade carrying cost.

Mitigation: demurrage applies to balances by canonical monetary state independent of account count; splitting does not change the rate.

### Identity/account separation abuse

One identity controls many accounts and attempts multiple universal claims or circulation caps.

Mitigation: universal entitlement and circulation reward caps are keyed to unique eligibility identity rather than wallet address in the target architecture.

### Censorship of universal settlement or circulation qualification

Validators refuse to include valid entitlement or circulation transactions from a population.

Mitigations:

- diverse validators,
- public relay paths,
- censorship evidence,
- governance sanctions,
- ability to submit through multiple nodes,
- accrued universal entitlement so censorship cannot permanently destroy an earned baseline right,
- review path for circulation qualification where an external receipt issuer is implicated.

### External anchor censorship or failure

Bitcoin fees spike, anchor transactions are censored, or BitcoinOS-like infrastructure fails.

Mitigation: anchoring is asynchronous and not required for Aetherion liveness or internal validity.

### Bridge theft

A bridge claiming to connect ATC or BTC is compromised.

Mitigations:

- no bridge implied by the anchor adapter,
- independent bridge audit,
- minimized custody,
- caps and circuit breakers,
- explicit trust model,
- never call an unaudited bridge trustless.

### Software supply-chain compromise

Dependencies or build infrastructure inject malicious code.

Mitigations:

- lockfiles,
- reproducible builds,
- dependency review,
- signed releases,
- CI provenance,
- minimal consensus dependencies,
- independent binary reproduction.

The repository currently lacks a root `package-lock.json`; this remains an application reproducibility gap even though the reference protocol tests are dependency-light.

### Upgrade attack

Governance or maintainers deploy code that changes protected rules without informed consent.

Mitigations:

- protocol versioning,
- machine-readable invariant verifier,
- constitutional timelock,
- reproducible upgrade binaries,
- pre-upgrade migration simulation,
- node operator visibility,
- emergency powers unable to silently bypass protected amendments.

## Privacy threats

Public ledgers can reveal financial graphs even when names are hidden. Circulation incentives increase this risk because reward systems naturally seek more behavioral information.

Aetherion should not mistake pseudonymity for privacy. Future privacy design should examine address rotation, selective disclosure, shielded transfer options where legally and technically appropriate, private uniqueness credentials, privacy-preserving circulation receipts, off-chain storage of sensitive evidence, metadata minimization, and privacy-preserving governance participation.

A reward system that requires universal purchase surveillance may be economically clever but constitutionally unacceptable.

## Economic threats

Unbounded issuance can still produce harmful inflation if issuance expands faster than real economic capacity and willingness to hold/use the currency. Circulation rewards can worsen this if pools are too large or easy to game. Demurrage can be set too high, causing avoidance or reducing legitimate saving utility. Canonical exit friction can reduce liquidity and adoption if it becomes punitive, while a weak reserve can create a run even if Layer 1 itself remains healthy.

Mitigations are empirical rather than purely cryptographic:

- simulation,
- transparent parameters,
- slow bounded changes,
- fixed/authorized circulation pools,
- stress testing,
- multiple real-resource indicators,
- local economic experimentation,
- published uncertainty,
- reserve/liability modeling where exchange is operated,
- no appreciation promises,
- no assumption that higher exit friction automatically creates higher ATC value.

## Social threats

A system designed around contribution can drift into paternalism. A circulation system can drift into purchase surveillance. A religiously inspired system can drift into exclusion. A decentralized system can drift into invisible elite coordination. A currency seeking strong internal gravity can drift into coercive exit restrictions.

Mitigations are constitutional:

- baseline rights independent of contribution or circulation score,
- freedom of conscience,
- no universal social-credit score,
- plural attestation,
- public conflicts of interest,
- due process,
- transparent governance,
- right to ordinary transfer,
- bounded disclosed canonical exit,
- freedom from trapped-liquidity economics,
- right to local exit.

## Security posture

Aetherion should be assumed unsafe for production value until the implementation—not merely these documents—has passed independent review, public testing, operational rehearsal, economic attack simulation, and the launch gates in `FLIGHTPAPER.md`.

Circulation issuance and canonical conversion are especially sensitive because their failure modes can create direct incentives to attack the protocol. Both remain disabled by default in the design seed until the evidence required by their flight gates exists.
