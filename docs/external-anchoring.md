# Aetherion External Anchoring

## Principle

Bitcoin may serve as an external historical witness for Aetherion. It does not define Aetherion's monetary constitution.

Aetherion must remain internally live and valid when external anchoring is unavailable.

## Commitment model

At a configured epoch or block interval, Aetherion may derive a canonical state commitment such as:

```text
commitment = H(
  chain_id ||
  protocol_version ||
  height ||
  epoch ||
  application_state_root
)
```

The exact encoding and hash function must be specified by the production protocol and covered by test vectors.

The commitment can be submitted through an adapter to an external settlement rail.

## Adapter contract

The logical interface is:

```text
submit(commitment) -> receipt_id
query(receipt_id) -> pending | confirmed | failed
verify(receipt) -> true | false
```

Adapter failure cannot invalidate an otherwise finalized Aetherion block.

## Bitcoin direct anchoring

A direct Bitcoin adapter may commit a digest using a reviewed mechanism appropriate to the target transaction format. Fees are paid externally and are not an input to Aetherion issuance policy.

The receipt should record enough information for an independent verifier to locate the Bitcoin transaction, reconstruct the commitment, and determine the intended confirmation policy.

## BitcoinOS-like anchoring

A BitcoinOS or equivalent zero-knowledge path may eventually aggregate Aetherion proofs or commitments before settlement to Bitcoin.

Aetherion should integrate such systems through the same adapter boundary rather than making their token economics or availability constitutional dependencies.

Integration claims must track actual maturity. A design target is not an audited bridge. A proof demo is not a production custody system.

## Anchor versus bridge

An **anchor** proves or timestamps a commitment.

A **bridge** moves or represents economic assets across trust domains.

Aetherion's anchor design does not automatically create a bridge.

Any bridge capable of custody, minting wrapped assets, releasing BTC, or representing ATC externally requires a separate threat model, supply-accounting model, caps/circuit breakers, and independent security review.

## Failure cases

The adapter must tolerate:

- external fee spikes,
- transaction rejection,
- network congestion,
- reorganization before the configured confirmation depth,
- API/provider outage,
- BitcoinOS-like service outage,
- malformed receipts,
- duplicate submissions,
- conflicting anchor attempts.

A failed anchor is recorded as failed/pending. It does not rewrite Aetherion state.

## Trust language

Public surfaces should say exactly what is known:

- `not anchored`,
- `anchor pending`,
- `anchored at external transaction X`,
- `receipt verified`,
- `receipt verification failed`.

Do not use `Bitcoin-secured` as a blanket claim merely because a state hash was once posted to Bitcoin. Anchoring can strengthen historical commitment evidence without inheriting all Bitcoin security properties for Aetherion consensus.

## Activation

External anchoring is disabled in the design genesis seed.

Activation requires:

- implementation,
- deterministic commitment encoding,
- adapter tests,
- failure-isolation tests,
- cost analysis,
- independent review appropriate to risk,
- governance approval.

Bridging requires an additional approval process.
