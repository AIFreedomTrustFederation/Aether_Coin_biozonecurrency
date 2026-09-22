# Decision Record — Biozoe Circulation and Asymmetric Exchange

Date: 2026-08-25  
Status: accepted for protocol specification; production activation separately gated

## Decision

Aetherion adopts two complementary economic mechanisms in its constitutional target:

1. **bounded circulation issuance** that rewards qualified net use and acceptance of ATC from a fixed governed epoch pool; and
2. **asymmetric canonical monetary permeability** in which a designated ATC-to-external-asset conversion facility may apply transparent, progressively maturing, constitutionally capped exit friction while ordinary ATC transfers remain unaffected and patient exits receive lower friction.

These mechanisms exist to encourage ATC to function as a circulating economic medium rather than a passive scarcity asset or a token held solely for external liquidation.

## Non-negotiable constraints

The decision does not authorize:

- raw transaction-count minting,
- unlimited percentage rebates,
- self-transfer rewards,
- replayed circulation receipts,
- token-weighted governance,
- ordinary ATC-transfer exit taxes,
- uncapped or 100% canonical exit friction,
- indefinite discretionary exit locks,
- falsification of reference market value,
- pre-settlement ATC burn,
- generic ATC minting from ETH/BTC/stablecoin/fiat deposits,
- guaranteed appreciation or infinite-value promises,
- generalized purchase surveillance,
- activation of a Federation-operated exchange before its technical and regulatory launch gates are satisfied.

## Rationale

Demurrage alone creates a negative incentive against long-term passive liquid holding but does not positively reinforce genuine exchange. Circulation issuance supplies the positive complement while fixed pools and diminishing returns prevent transaction volume from becoming unlimited mint authority.

External-exit friction alone could create trapped-liquidity economics. The constitutional right to ordinary transfer, a hard exit-friction ceiling, patient-exit discounts, reference-value truthfulness, and optional exchange-service architecture preserve meaningful user agency while allowing canonical liquidity policy to discourage panic extraction.

The intended monetary topology is:

```text
external value
      ↓
     ATC
      ↓
qualified circulation ↔ production ↔ stewardship ↔ regeneration
      ↓
patient canonical exit when desired
```

The long-run value objective is increasing real usefulness and purchasing relationships, not an engineered promise of infinite nominal price.

## Implementation status

The deterministic reference implementation contains circulation pool accounting, receipt replay protection, direct pair netting, integer square-root scoring, per-identity caps, canonical exit quote mathematics, hard-cap enforcement, patient-exit discounts, reference-value separation, conversion-receipt replay protection, and settlement-before-retirement logic.

The design genesis keeps circulation issuance and canonical conversion disabled. Production activation requires the gates defined in `FLIGHTPAPER.md`, `docs/circulation-and-exchange.md`, and `docs/regulatory-launch-gate.md`.

## Verification

The branch-level Aetherion Protocol QA workflow must pass before the decision is merged into the canonical branch. Runtime success demonstrates consistency of the current executable specification; it does not constitute a security audit, economic guarantee, reserve audit, or legal authorization.
