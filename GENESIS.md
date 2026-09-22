# Aetherion Genesis

## Purpose

Genesis is the reproducible starting state of the Aetherion network. It is not a fundraising event and not a private allocation ceremony. The production genesis artifact must be generated from public inputs, independently reproducible, and validated before network launch.

The design seed lives at `protocol/genesis.seed.json`.

---

## Genesis invariant

**Genesis establishes the rules; it does not establish the aristocracy.**

The production genesis state therefore begins with zero premine, zero founder allocation, zero investor allocation, zero team allocation, zero adviser allocation, zero hidden treasury allocation, and zero user balances.

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

The design seed currently proposes one-day epochs, one ATC of universal entitlement per eligible unique person per epoch, and 192 ppm demurrage per epoch.

Contribution, regenerative, stewardship, and circulation issuance are all disabled until governed programs or pools exist. The circulation pool begins at zero even though the reference implementation already contains the deterministic settlement logic.

The seed also contains **disabled scenario parameters** for a future canonical conversion module. They model a maturity spread beginning at 2%, moving toward 8% over 1,825 daily epochs, a separately bounded stress component of no more than 7 percentage points, a 15% total hard exit-friction cap, a patient-exit discount, and a 1% minimum friction floor.

Those exchange values are simulation inputs, not promises and not active exchange terms. Canonical conversion is disabled at genesis and may remain disabled indefinitely until its technical, economic, reserve, governance, and regulatory launch gates are complete.

No design-devnet number is economically sacred. Production parameters require public simulation, testnet observation, security review, and launch governance ratification.

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

Constitutional rules must identify which changes are constitutional, which changes are ordinary parameters, the required chambers, supermajority thresholds, deliberation periods, timelocks, emergency boundaries, and public execution records.

Circulation pools and exchange parameters are ordinary only inside the constitutional envelope. Governance cannot use an ordinary parameter change to create raw-volume minting, remove the circulation pool ceiling, tax ordinary ATC transfer as exit, exceed the canonical exit hard cap, hide reference value, remove the right to exit, or turn an external deposit into generic ATC mint authority.

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

The launch ceremony should publish source commit, build instructions, dependency lock information, genesis input manifest, generated genesis file, genesis hash, validator signatures or acknowledgements, and independent reproduction results.

---

## Forbidden genesis content

A production validator must refuse or flag a genesis artifact that contains:

- a terminal supply cap presented as canonical Biozoe policy,
- non-zero private token allocations,
- hidden administrative mint balances,
- token-weighted validator power,
- token-weighted constitutional voting,
- raw transaction count as unlimited circulation-mint authority,
- a nonzero circulation pool that was not explicitly launch-ratified,
- an active canonical conversion service without launch authorization,
- canonical exit friction at or above 100%,
- ordinary ATC transfer treated as canonical exit,
- an external-asset deposit that silently creates generic ATC mint authority,
- undocumented governance superkeys,
- network or exchange endpoints represented as live without operational evidence,
- symbolic/random values used as economic or cryptographic state.

---

## First epoch

At epoch zero, circulating supply is zero.

Every eligible epoch creates the configured universal entitlement. A participant may settle one or many previously unsettled eligible epochs through the current epoch, with older portions aged through historical demurrage. Connectivity is therefore not the source of the right.

Budgeted contribution, regenerative, stewardship, and circulation issuance remain unavailable until governance creates explicit authority. Circulation cannot mint merely because transfers occurred while the pool is zero or disabled.

There is no first-block bonus, founder multiplier, or early-adopter issuance multiplier.

---

## Conversion at genesis

Canonical external conversion is not required for Aetherion to launch as a Layer 1 and is disabled in the design seed.

Ordinary ATC transfers remain native economic operations. External exchange may occur through independent markets outside the protocol's control, but no Federation-operated redemption path should be represented as available until it actually exists and has passed the required launch gates.

When canonical conversion is eventually enabled, its policy version and operator must be explicit, and the state machine must preserve the constitutional hard cap, reference-value truthfulness, settlement-before-retirement rule, and right to ordinary ATC transfer.

---

## Genesis and the Most High

The spiritual meaning of genesis is covenant rather than possession: those who begin the system are first responsible for being bound by its rules, not first entitled to own its wealth.

That spiritual principle has concrete technical expression in zero private genesis allocation, no founder-only mint path, no special founder circulation multiplier, and no private exception to the exchange rules.

The protocol does not ask consensus nodes to measure holiness. It asks them to enforce the same published rules for founders and newcomers alike.
