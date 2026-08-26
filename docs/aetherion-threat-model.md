# Aetherion Threat Model

## Scope

This document models threats to the proposed sovereign Aetherion Layer 1, Biozoe issuance, identity eligibility, governance, validator operations, wallets, resource accounting, and optional external anchoring.

A spiritual commitment to truth and stewardship does not reduce the adversarial assumptions. The system is designed on the expectation that some participants, operators, attackers, governments, companies, bots, insiders, and compromised machines will attempt to exploit it.

## Protected properties

Aetherion aims to preserve:

- deterministic final state,
- no unauthorized issuance,
- no hidden private genesis allocation,
- one universal baseline stream per eligible person,
- ordinary transfer conservation,
- correct cumulative issuance/retirement accounting,
- non-token-weighted governance,
- non-wealth-weighted validator power,
- privacy of unnecessary identity data,
- informed transaction consent,
- recoverable operation after minority faults,
- continued liveness without external anchors.

## Trust boundaries

### Consensus engine

Trusted only within its documented Byzantine fault assumptions. Validator keys and software can be compromised.

### Application state machine

Trusted only if deterministic code matches the reviewed protocol version. Bugs can mint, destroy, freeze, or misroute value even when consensus itself works perfectly.

### Identity attesters

Not globally trusted. Individual attesters can be corrupt, mistaken, coerced, unavailable, or discriminatory.

### Governance

Not inherently benevolent. Majorities and institutions can collude, panic, capture procedure, or attempt to alter rights.

### Wallets

User devices can contain malware. Interfaces can be deceptive. AI can hallucinate. Browser extensions can be compromised.

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

A governance coalition creates enormous contribution budgets for insiders.

Mitigations:

- public budgets,
- epoch bounds,
- deliberation periods,
- multi-chamber approval for high-impact monetary expansion,
- simulation requirements,
- conflict-of-interest disclosure,
- public issuance receipts,
- caps on program concentration where governance adopts them.

### Evidence forgery/replay

One contribution receipt is forged or used repeatedly.

Mitigations:

- authenticated evidence issuers,
- unique evidence IDs,
- replay set/state,
- scoped program rules,
- challenge process,
- signed issuance receipts.

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

Equal validator voting power does not solve operator collusion if one entity controls many identities. Operator-independence verification is therefore essential.

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

An AI invents an address, misunderstands a transaction, or persuades a person to sign a harmful action.

Mitigations:

- AI outputs are proposals only,
- deterministic wallet transaction decoding,
- recipient/amount/network display,
- explicit human authorization,
- no hidden tool signing,
- policy limits for automated agents,
- simulation and warnings.

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

One identity controls many accounts and attempts multiple universal claims.

Mitigation: universal claim state is keyed to the unique eligibility identity, not wallet address.

### Censorship of universal claims

Validators refuse to include valid baseline claims from a population.

Mitigations:

- diverse validators,
- public mempool/relay paths,
- censorship evidence,
- governance sanctions,
- ability to submit through multiple nodes,
- protocol-level delayed-claim policy may be considered so censorship cannot permanently destroy an accrued right.

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

Public ledgers can reveal financial graphs even when names are hidden. Aetherion should not mistake pseudonymity for privacy.

Future privacy design should examine:

- address rotation,
- selective disclosure,
- shielded transfer options where legally and technically appropriate,
- private uniqueness credentials,
- off-chain storage of sensitive evidence,
- metadata minimization,
- privacy-preserving governance participation.

## Economic threats

Unbounded issuance can still produce harmful inflation if issuance expands faster than real economic capacity and willingness to hold/use the currency. Demurrage can also be set too high, causing excessive avoidance or reduced saving utility.

Mitigations are empirical rather than purely cryptographic:

- simulation,
- transparent parameters,
- slow bounded changes,
- multiple real-resource indicators,
- local economic experimentation,
- published uncertainty,
- no appreciation promises.

## Social threats

A system designed around contribution can drift into paternalism or surveillance. A religiously inspired system can drift into exclusion. A decentralized system can drift into invisible elite coordination.

Mitigations are constitutional:

- baseline rights independent of contribution,
- freedom of conscience,
- no universal social-credit score,
- plural attestation,
- public conflicts of interest,
- due process,
- transparent governance,
- right to local exit.

## Security posture

Aetherion should be assumed unsafe for production value until the implementation—not merely these documents—has passed independent review, public testing, operational rehearsal, and the launch gates in `FLIGHTPAPER.md`.
