# Aetherion Regulatory Launch Gate

## Purpose

Aetherion may research monetary policy, circulation incentives, exchange mathematics, reserve architecture, and conversion state transitions before any Federation-operated exchange or redemption service exists. Research code does not itself authorize a person or entity to operate a regulated financial service.

This document establishes a conservative launch boundary: **canonical ATC conversion remains disabled until the responsible operator has completed legal and operational review for the actual jurisdictions, counterparties, custody model, assets, and transaction flows involved.**

This is an engineering control, not legal advice.

---

## 1. Why the boundary exists

The Biozoe protocol can define ATC issuance and transfer rules without automatically making every developer or user a financial intermediary. The regulatory analysis changes materially when a person or organization operates a business that accepts, exchanges, redeems, transmits, custodies, or settles convertible virtual currency on behalf of others.

In the United States, FinCEN guidance has long distinguished users from administrators and exchangers of convertible virtual currency and states that an administrator or exchanger engaged in qualifying acceptance, transmission, buying, or selling activity may be a money transmitter unless an exemption or limitation applies.

Official reference:

- FinCEN, *Application of FinCEN's Regulations to Persons Administering, Exchanging, or Using Virtual Currencies*: https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-persons-administering

The precise result depends on the actual service design and current law. The project must not infer a license status from protocol vocabulary alone.

---

## 2. Securities-law marketing boundary

As of March 2026, the U.S. Securities and Exchange Commission published an interpretation addressing when crypto assets and transactions involving them implicate the federal securities laws, including circumstances in which a non-security crypto asset may be offered or sold as part of an investment contract.

Official references:

- SEC Release No. 33-11412 / 34-105020, *Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets*: https://www.sec.gov/rules-regulations/2026/03/s7-2026-09
- SEC press release, March 17, 2026: https://www.sec.gov/newsroom/press-releases/2026-30-sec-clarifies-application-federal-securities-laws-crypto-assets

Aetherion therefore treats the following public claims as prohibited unless a future qualified legal review specifically authorizes them in context:

- guaranteed appreciation,
- guaranteed profit,
- guaranteed purchasing-power increase,
- risk-free return,
- "infinite value" as an investment promise,
- a promise that protocol managers will engineer a particular secondary-market price,
- a representation that exit friction itself creates investment value.

The protocol may describe its actual monetary mechanics, intended utility, circulation incentives, and governance goals. It must not convert those mechanics into an assurance of financial return.

---

## 3. Canonical conversion remains disabled by default

The machine-readable genesis seed sets the Federation-operated canonical conversion facility to disabled design status.

Activation requires, at minimum:

1. identified legal operator,
2. jurisdiction map,
3. money-transmission and money-services analysis,
4. state licensing analysis where applicable,
5. securities and commodities analysis,
6. sanctions and OFAC controls appropriate to the operator,
7. AML/KYC policy appropriate to the service and jurisdiction,
8. consumer-disclosure review,
9. custody and safeguarding analysis,
10. reserve and solvency accounting,
11. tax reporting analysis,
12. data-protection and privacy review,
13. complaints, errors, refunds, disputes, and appeals process,
14. incident response and suspicious-activity escalation where legally required,
15. qualified counsel sign-off for the production design.

A protocol governance vote cannot substitute for a license or legal obligation imposed on the actual service operator.

---

## 4. Protocol versus operator

The Layer 1 protocol and the exchange operator should remain architecturally distinct.

The protocol may provide deterministic rules such as:

- maximum canonical friction,
- quote disclosure fields,
- ATC retirement rules,
- conversion receipt replay protection,
- timelocked governance parameters.

The operator is responsible for external-world functions such as:

- custody of ETH, BTC, stablecoins, fiat, or other reserves,
- banking relationships,
- identity checks where required,
- sanctions screening,
- external settlement,
- customer funds safeguarding,
- tax and regulatory reporting,
- licensing,
- legal notices,
- customer support.

Keeping these roles distinct prevents a protocol design document from pretending to solve regulatory and custody obligations it cannot perform on-chain.

---

## 5. Reserve claims

No interface may describe a reserve as fully backed, solvent, segregated, audited, insured, guaranteed, or bankruptcy remote unless evidence for that exact claim exists.

A production reserve system should publish, where lawful and safe:

- asset types,
- custody structure,
- liabilities covered,
- reconciliation frequency,
- governance authority,
- withdrawal obligations,
- operating-cost policy,
- audit or attestation scope,
- known limitations.

On-chain proof of asset balances does not by itself prove complete liabilities, legal ownership, solvency, or recoverability.

---

## 6. Consumer conversion disclosure

Before a canonical exit is authorized, the interface should disclose in plain language:

- ATC amount surrendered,
- reference external value,
- source and timestamp/epoch of the reference input,
- maturity friction,
- stress surcharge if any,
- delayed-exit discount if any,
- total applied friction,
- constitutional maximum,
- expected external proceeds,
- expected reserve retention,
- selected delay period,
- ATC retirement behavior,
- whether the external settlement is reversible,
- fees outside the protocol spread,
- identity or reporting information required by the operator.

The user must explicitly authorize the quote. Silence, dark patterns, prechecked boxes, AI inference, or acceptance of unrelated terms do not constitute authorization.

---

## 7. No emergency legal bypass

A liquidity emergency does not suspend law, disclosure, or constitutional rights.

Emergency governance may only operate inside the pre-authorized parameter envelope. It cannot:

- exceed the canonical exit hard cap,
- invent a hidden spread,
- seize balances,
- falsify the reference value,
- activate an unlicensed exchange service,
- ignore sanctions or safeguarding duties,
- convert a temporary stress control into an indefinite exit lock.

If lawful operation is impossible, the correct failure mode may be to suspend the operator's conversion service while preserving ordinary ATC ownership and transfers, rather than operating outside the legal boundary.

---

## 8. Jurisdiction and update discipline

Crypto regulation changes. This document therefore records a launch gate rather than declaring a permanent legal classification.

Before production activation, counsel must verify the then-current rules for every intended jurisdiction and service. Material legal changes after launch should trigger a documented review of the operator, disclosures, licensing, reserve structure, and user flows.

The constitutional principle remains stable even when law changes:

**Aetherion should tell the truth about what it is offering, who operates it, what rights the user has, what risks remain, and what claims have actually been verified.**
