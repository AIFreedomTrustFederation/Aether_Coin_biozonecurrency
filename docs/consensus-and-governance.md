# Aetherion Consensus and Governance

## Separation of powers

Aetherion deliberately separates three kinds of authority:

1. **Consensus authority** orders and finalizes valid state transitions.
2. **Governance authority** changes published rules within constitutional limits.
3. **Economic ownership** determines who controls transferable ATC balances.

AetherCoin ownership does not automatically create either of the first two.

---

## Consensus target

The target architecture is a CometBFT-compatible Byzantine-fault-tolerant network paired with an application-specific Aetherion state machine.

The reason for using a mature consensus family is defensive: the economic experiment is already novel enough. The network should not also depend on an untested consensus invention unless future research demonstrates a compelling security need.

## Validator power

Canonical design rule:

`voting_power(v) = 1` for each authorized active validator `v`.

ATC balance and ATC age are not inputs.

Equal-unit power only works if validator identities represent genuinely independent operators. A single actor controlling many validator identities would recreate concentration through Sybil control.

Production validator authorization therefore needs an operator-independence policy covering:

- beneficial/control relationships,
- shared signing infrastructure,
- common hosting dependencies,
- jurisdictional concentration,
- organizational affiliations,
- key custody,
- disclosure and challenge.

The target is not one-validator-one-machine theater. It is independent failure domains.

## Validator lifecycle

A validator candidate should publish:

- operator identity/attestation,
- validator public key,
- infrastructure disclosures required by policy,
- security contact,
- incident-response capability,
- software/version commitment.

Activation occurs only after governance authorization and an epoch boundary.

Removal may occur for:

- prolonged unavailability,
- equivocation/double signing,
- undisclosed common control,
- critical security compromise,
- repeated censorship supported by evidence,
- governance-defined serious misconduct.

Emergency deactivation may be faster than ordinary removal but must be narrow, recorded, and subsequently reviewed.

---

# Governance

## Why token voting is excluded

Token-weighted voting creates the direct relation:

`more money -> more constitutional voice`.

That is incompatible with the design goal that ATC is an economic medium rather than a unit of political personhood.

ATC can be spent, saved, exchanged, donated, invested, or used in contracts without buying more human constitutional weight.

## Two-chamber target

A production constitutional process should require consent from at least two differently constituted chambers.

### Human chamber

One verified eligible person receives one vote within the applicable civic scope.

Balance does not change vote weight.

Privacy-preserving voting should be preferred where it can preserve uniqueness, eligibility, and verifiability.

### Federated trust/community chamber

Recognized local trusts, cooperatives, communities, or other constitutional entities receive representation according to published accreditation rules that do not simply mirror treasury size.

This chamber exists to represent durable local institutions and prevent raw majoritarian headcount from being the only source of authority.

It must not be able to strip individuals of protected baseline rights by itself.

## Ordinary proposals

Ordinary proposals may govern:

- program budgets,
- operational service parameters,
- non-constitutional rate ranges,
- validator admissions/removals,
- attester accreditation,
- software upgrades that do not alter protected invariants.

They require public text, review period, voting window, execution record, and an activation epoch.

## Constitutional proposals

Constitutional proposals include changes to:

- zero-premine rule,
- terminal-supply-cap prohibition,
- universal baseline equality,
- non-token-weighted governance,
- non-balance-derived validator power,
- due-process rights,
- freedom-of-conscience protections,
- no-hidden-mint rule,
- supply accounting invariant.

A constitutional proposal should require:

- explicit constitutional label,
- machine-readable diff,
- plain-language impact statement,
- security review,
- economic impact analysis where applicable,
- extended deliberation,
- supermajority in every required chamber,
- post-approval timelock,
- reproducible implementation artifact.

No emergency procedure may permanently bypass these requirements.

## Suggested initial thresholds

These values are design targets, not yet ratified mainnet law:

- ordinary proposal quorum: 25% of eligible voting power in each applicable chamber,
- ordinary approval: >50% of participating eligible votes in each required chamber,
- constitutional quorum: 50% of eligible voting power in each required chamber,
- constitutional approval: >=67% in each required chamber,
- constitutional timelock: at least 14 days after final approval,
- emergency action expiry: at most 72 hours without ordinary ratification.

Thresholds require simulation and testnet rehearsal before production.

## Conflict of interest

Governance software should support disclosure when proposers, voters in institutional roles, evidence attesters, or validator operators have material interests in a budget or program.

Disclosure does not automatically invalidate participation, but undisclosed conflicts may be sanctionable under governance rules.

## AI participation

AI may:

- summarize proposals,
- generate impact comparisons,
- identify contradictions,
- model scenarios,
- translate language,
- surface security concerns.

AI does not receive human-chamber personhood merely by running an agent. AI-controlled service principals may have operational permissions explicitly delegated by humans or institutions, but those permissions are not silently converted into constitutional citizenship.

## Upgrade execution

Approved upgrades should be tied to:

- source commit,
- build hash,
- migration hash,
- activation height/epoch,
- rollback or halt plan where feasible,
- invariant verifier results.

Nodes should reject an upgrade artifact that fails protected constitutional checks unless the underlying constitutional amendment has itself completed the required process.

## Local governance

Local trusts may establish additional governance procedures for local assets and programs. Local rules may be stricter than the federation baseline, but participation in a local trust does not authorize that trust to rewrite canonical ATC history or remove federation-level protected rights without a valid wider constitutional process.
