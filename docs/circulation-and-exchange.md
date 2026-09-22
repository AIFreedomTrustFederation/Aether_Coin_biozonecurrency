# Biozoe Circulation and Canonical Exchange

## Purpose

Aetherion is designed to make ATC useful as money rather than attractive merely as a scarce object to hoard. That requires two complementary pressures. Productive internal circulation should receive a bounded positive incentive, while canonical conversion from ATC into external assets may carry transparent friction that discourages panic extraction without making exit impossible.

The design can be summarized as:

`easy entry -> rewarded internal circulation -> patient, transparent exit`

This is called **asymmetric monetary permeability**. It does not mean that Aetherion controls every market or that it can decree an infinite ATC price. It means the protocol may define the terms offered by its own canonical exchange facilities while leaving ordinary ATC transfers intact.

---

## 1. Circulation issuance

Circulation issuance is the fifth authorized Biozoe issuance class. It does not mint a percentage of every purchase and does not pay merely because a transaction exists. Instead, governance authorizes a maximum circulation pool for an epoch:

`B_V(e)`.

All circulation rewards issued for epoch `e` must satisfy:

`sum(V_i(e)) <= B_V(e)`.

If qualified activity increases one hundredfold, the epoch pool does not automatically increase one hundredfold. More participants compete for the same governed pool unless governance explicitly changes the next authorized budget.

This preserves the Biozoe principle:

`unbounded long-run monetary possibility + bounded present issuance authority`.

---

## 2. Qualified circulation events

An ordinary finalized ATC transfer does not automatically earn new ATC. A transfer becomes eligible for circulation scoring only when it is linked to a unique authenticated circulation receipt or equivalent proof satisfying the active qualification policy.

The minimum reference rules are:

- the ATC transfer must already exist,
- sender and receiver must be distinct eligible principals,
- self-transfers do not qualify,
- a transfer cannot qualify twice,
- a circulation receipt cannot be replayed,
- zero-value transfers do not qualify,
- qualification must occur in the transfer epoch under the reference model,
- the receipt should disclose no more information than is needed to establish qualification.

A production implementation may use signed merchant receipts, privacy-preserving settlement credentials, application attestations, zero-knowledge claims, or other reviewed evidence paths. The architecture deliberately does not require a public ledger of what every person bought.

---

## 3. Netting defeats the easiest wash trade

Suppose Alice sends Bob 100 ATC and Bob sends Alice 90 ATC during the same epoch. Rewarding 190 ATC of gross volume would make circular churn profitable.

The reference model therefore calculates pairwise net flow:

`Q_AB = |A_to_B - B_to_A|`.

In this example:

`Q_AB = |100 - 90| = 10 ATC`.

An exact direct round trip produces:

`Q_AB = 0`

and therefore earns no circulation score.

Pairwise netting does not solve every possible wash-trading structure. A coordinated ring such as `A -> B -> C -> A` can still imitate economic movement. That is why netting is only one layer alongside identity uniqueness, receipt authentication, fixed issuance pools, diminishing returns, per-identity caps, anomaly review, and adversarial simulation.

---

## 4. Diminishing returns and economic breadth

The reference score for one net pair relationship uses integer square root:

`q = floor(sqrt(Q_pair))`.

Square-root scoring means larger economic flows can earn greater weight, but reward weight grows more slowly than money moved. One hundred times more net flow creates roughly ten times the base score rather than one hundred times the score.

Each independent pair contributes separately. This means genuine economic breadth can matter more than concentrating the same value through one counterparty. For example, ten independent modest relationships can produce more aggregate score than one relationship carrying the same total value.

This is intentional. A monetary network becomes stronger when more independent people accept and use the currency.

---

## 5. Sender and receiver roles

Both sides of qualified exchange help ATC circulate. The sender chooses to spend ATC rather than extracting into another unit. The receiver chooses to accept ATC rather than demanding another unit.

The design-devnet reference weighting is:

- sender: 40%,
- receiver: 60%.

These are score weights, not direct rebates. They divide a fixed epoch pool and therefore cannot create unlimited issuance.

The receiver receives somewhat more weight because broad willingness to accept ATC is one of the strongest network effects a currency can develop. These weights are experimental governance parameters, not constitutional constants.

---

## 6. Per-identity reward ceiling

A participant cannot consume the entire circulation pool merely because they control large economic volume. Every epoch therefore has a per-identity circulation reward cap.

The design seed uses a prototype cap of 5 ATC per identity per daily epoch while circulation issuance itself remains disabled. The number is only a test value. Production calibration requires population modeling, transaction-distribution analysis, anti-Sybil testing, and governance ratification.

If proportional allocation would exceed the cap, the excess remains unissued under the reference design rather than silently expanding another participant's entitlement. A future audited implementation may use a deterministic capped redistribution algorithm if simulations show it improves fairness without creating gaming opportunities.

---

## 7. Circulation is not a social-credit system

The circulation score answers one narrow question: how much qualified net monetary movement should contribute to this epoch's bounded circulation pool?

It does not determine:

- human worth,
- citizenship,
- governance voting weight,
- validator voting power,
- religious standing,
- access to due process,
- creditworthiness,
- employment eligibility,
- health status,
- political reputation.

The protocol must resist the temptation to turn a useful anti-wash scoring mechanism into a universal behavioral rank.

---

## 8. Ordinary transfer remains free of exit friction

The native transfer primitive is deliberately simple:

`Alice --ATC--> Bob`.

No canonical exit spread is applied merely because ATC changes owners.

This protects commerce, gifts, payroll, peer-to-peer settlement, local cooperative exchange, family transfers, and other ordinary circulation. It also avoids unreliable attempts to classify a wallet address as a DEX, exchange, merchant, friend, or prohibited destination.

The asymmetric conversion rule exists only at an explicitly designated canonical boundary where ATC is being redeemed or exchanged for an external asset through that service.

---

## 9. Reference value and exit proceeds are different quantities

For an outbound canonical conversion, let:

`R = reference external value of the surrendered ATC before canonical friction`

and:

`f = applied canonical exit friction`.

Then:

`net proceeds = R * (1 - f)`.

The service records all three quantities separately:

- reference value,
- applied friction,
- net proceeds.

The service must not rewrite `R` merely to conceal the friction. A 5% canonical spread does not prove that the market price of ATC fell by 5%, and the existence of a spread does not prove that ATC became more valuable either.

This distinction is essential for honest accounting.

---

## 10. Progressive maturity component

The canonical outbound spread may increase gradually as the Aetherion economy matures. The reference policy uses a transparent bounded interpolation:

`f_maturity(e) = start + progress(e) * (target - start)`

where progress is capped when the configured ramp is complete.

The disabled design seed currently models:

- starting maturity friction: 2%,
- target maturity friction: 8%,
- ramp: 1,825 daily epochs, approximately five years.

The numbers are scenario values for simulation, not a production promise. They are deliberately far below 100% because an exit rule that approaches 100% makes canonical realizable proceeds approach zero and turns monetary preference into economic confinement.

---

## 11. Bounded stress component

A future production exchange may include a temporary stress component during objectively defined liquidity pressure, provided the input is deterministic, authenticated, publicly visible, and constitutionally bounded.

The design seed permits at most a 7% stress surcharge and applies a 15% total hard cap across maturity and stress components.

No oracle, administrator, emergency committee, AI model, or exchange operator may exceed the hard cap by changing labels. A stress event cannot secretly transform a 15% ceiling into a 60%, 90%, or 100% exit barrier.

The stress mechanism is not yet implemented as autonomous governance state. The reference state machine accepts a bounded deterministic stress input solely so the quote and cap behavior can be tested.

---

## 12. Patient exit

Aetherion can discourage panic without punishing a person for ever leaving. A user may choose an orderly delayed conversion in exchange for reduced friction.

The disabled design seed models:

- discount: 0.1 percentage point per daily epoch of chosen delay,
- maximum discount: 7 percentage points,
- minimum canonical friction: 1%.

Under the mature 8% ordinary spread, a sufficiently patient exit could therefore approach the 1% floor. During high liquidity stress, the same patience schedule reduces the applicable friction from the stressed level while remaining inside the constitutional range.

A delay must be disclosed before authorization and may not become an indefinite discretionary lock.

---

## 13. Canonical exit retires ATC

The reference design retires ATC surrendered through an executed canonical exit:

`circulating_supply_after = circulating_supply_before - ATC_exited`.

The state machine performs retirement only after the external settlement path has accepted the conversion. If the external leg rejects or fails before the defined acceptance point, the reference design does not burn the user's ATC.

A production implementation needs an audited atomic, escrowed, threshold, or otherwise failure-safe settlement design. Recording a burn while an external payment silently failed would violate the purpose of the rule.

---

## 14. Reserve retention

When canonical exit friction causes the service to pay less external value than the pre-friction reference amount, the difference is called reserve retention in the reference quote.

For example:

`R = 1,000 external units`

`f = 5%`

`net proceeds = 950`

`reserve retention = 50`.

The reference state machine records this number but does not pretend to custody the external reserve asset. Production reserve accounting belongs to the regulated exchange/liquidity implementation and must specify custody, segregation, operating costs, audits, legal obligations, solvency policy, and governance.

Reserve retention cannot become an undisclosed founder or validator dividend.

---

## 15. Inbound conversion does not authorize a generic mint

A person bringing ETH, BTC, a stablecoin, or fiat to a canonical exchange does not automatically create protocol authority to mint arbitrary ATC.

Inbound exchange should normally source already circulating ATC from a transparent liquidity facility, market maker, cooperative reserve, or other lawful holder. If the community ever wants reserve-backed issuance as a new issuance class, that requires a separate constitutional amendment with supply, custody, redemption, and governance rules.

Keeping inbound exchange separate from mint authority prevents the exchange operator from becoming an accidental central bank with an unrestricted `deposit external asset -> mint ATC` function.

---

## 16. Canonical exchange cannot control every market

People can trade privately. Independent exchanges can list ATC. Contracts can represent claims. Other networks can build wrappers if technically possible. A decentralized monetary protocol cannot honestly guarantee one universal exchange rate without imposing broad transfer controls and surveillance.

Aetherion therefore governs only its canonical facilities. The constitutional goal is not to prohibit every external sale. It is to make internal ATC utility sufficiently valuable, circulation sufficiently rewarding, and orderly canonical exit sufficiently predictable that the rational preference increasingly favors remaining in and using the ATC economy.

---

## 17. Value objective

The protocol does not target infinite nominal price.

The stronger objective is increasing real usefulness:

`ATC -> more useful exchange relationships, productive capacity, goods, services, infrastructure, knowledge, care, energy, housing access, transportation, computation, and stewardship`.

If people prefer ATC because it is more useful to them, monetary gravity emerges from adoption rather than coercion.

The desired sentence is not:

`You cannot leave.`

It is:

`Why would I exchange a more useful monetary relationship for a less useful one?`

---

## 18. Reference implementation status

Implemented in the deterministic reference specification:

- fixed circulation epoch budgets,
- unique circulation receipts,
- transfer double-qualification protection,
- pairwise direct-round-trip netting,
- integer square-root diminishing-return scoring,
- configurable sender/receiver score weights,
- per-identity reward caps,
- unissued remainder accounting,
- ordinary ATC transfers with no exit friction,
- progressive maturity exit quote,
- bounded stress surcharge input,
- delayed-exit discount,
- hard friction ceiling,
- separate reference value and net proceeds,
- replay-protected conversion receipt,
- ATC retirement after accepted external settlement,
- supply-invariant verification.

Not yet implemented as production infrastructure:

- cryptographic circulation-receipt verification,
- privacy-preserving merchant/economic settlement proofs,
- graph-level anti-wash defenses beyond direct-pair netting,
- governed stress-state oracle,
- external reserve custody,
- atomic cross-asset settlement,
- licensed exchange operation,
- production liquidity management,
- public mainnet activation.

The implementation status must remain visible because a correct equation is not the same thing as a safe financial service.
