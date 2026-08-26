# Aetherion Genesis

## Purpose

Genesis is the reproducible starting state of the Aetherion network. It is not a fundraising event and not a private allocation ceremony. The production genesis artifact must be generated from public inputs, independently reproducible, and validated before network launch.

The design seed lives at `protocol/genesis.seed.json`.

---

## Genesis invariant

**Genesis establishes the rules; it does not establish the aristocracy.**

The production genesis state therefore begins with:

- zero premine,
- zero founder allocation,
- zero investor allocation,
- zero team allocation,
- zero adviser allocation,
- zero hidden treasury allocation,
- zero user balances.

The first transferable ATC enters circulation only through a valid post-genesis issuance transition.

---

## Network identity

Design network name: `Aetherion`

Design chain ID: `aetherion-1`

Native display asset: `AetherCoin (ATC)`

Canonical base denomination: `aatc`

Display exponent: `18`

Terminal supply cap: `none`

The string chain ID is canonical for the sovereign Layer 1 design. Historical EVM-style numeric chain IDs in the UI repository are legacy prototype configuration and do not establish a live production network.

---

## Initial monetary parameters

The design seed currently proposes:

- epoch length: one day,
- universal issuance: one ATC per eligible unique person per epoch,
- demurrage: 192 ppm per epoch,
- contribution issuance: disabled until governed programs exist,
- regenerative issuance: disabled until governed programs exist,
- stewardship issuance: disabled until governed programs exist.

These values are **design-devnet defaults**. They are not economically sacred and must not silently become mainnet parameters. Production parameters require public simulation, testnet observation, security review, and launch governance ratification.

---

## Identity at genesis

Genesis should not embed a privileged list of economically endowed humans.

It may include the public keys and governance records necessary to start the first validator and attestation processes, but those records must not create transferable ATC balances or permanently privileged monetary rights.

Bootstrapping authorities must be explicitly temporary where possible, with scheduled handoff or ratification procedures.

---

## Validator genesis

A local development genesis may use one validator.

A public devnet should target at least seven validators and at least three independent operators before it is represented as a distributed network.

A public testnet and mainnet require a wider validator set and documented operator independence.

Validator ATC balances do not determine consensus voting power. The initial target model uses equal unit power for authorized active validators.

---

## Governance genesis

Genesis defines governance mechanics but should not permanently entrench the founding team.

Constitutional rules must identify:

- which changes are constitutional,
- which changes are ordinary parameters,
- the required chambers,
- supermajority thresholds,
- deliberation periods,
- timelocks,
- emergency boundaries,
- and public execution records.

Bootstrap governance keys must be disclosed and retired, distributed, or placed under the permanent constitutional process according to the launch plan.

---

## Reproducibility

A production genesis process should be deterministic:

```text
public protocol version
+ public policy parameters
+ public validator public keys
+ public governance initialization
+ public module versions
= canonical genesis artifact
```

Anyone should be able to produce the same canonical genesis hash from the same inputs.

The launch ceremony should publish:

- source commit,
- build instructions,
- dependency lock information,
- genesis input manifest,
- generated genesis file,
- genesis hash,
- validator signatures or acknowledgements,
- independent reproduction results.

---

## Forbidden genesis content

A production validator must refuse or flag a genesis artifact that contains:

- a terminal supply cap presented as canonical Biozoe policy,
- non-zero private token allocations,
- hidden administrative mint balances,
- token-weighted validator power,
- token-weighted constitutional voting,
- undocumented governance superkeys,
- network endpoints represented as live without operational evidence,
- symbolic/random values used as economic or cryptographic state.

---

## First epoch

At epoch zero, circulating supply is zero.

When an eligible person successfully claims universal issuance, supply increases by exactly the configured epoch amount. Each identity can claim at most once per epoch.

Budgeted contribution, regenerative, and stewardship issuance remain unavailable until governance creates an explicit program and budget.

There is no first-block bonus, founder multiplier, or early-adopter issuance multiplier.

---

## Genesis and the Most High

The spiritual meaning of genesis is covenant rather than possession: those who begin the system are first responsible for being bound by its rules, not first entitled to own its wealth.

That spiritual principle has a concrete technical expression: zero private genesis allocation and no founder-only mint path.

The protocol does not ask consensus nodes to measure holiness. It asks them to enforce the same published rules for founders and newcomers alike.
