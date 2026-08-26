## Summary

Describe the change and the user/economic problem it addresses.

## Protocol impact

- [ ] No protocol impact
- [ ] Ordinary parameter change
- [ ] Monetary/economic behavior change
- [ ] Constitutional invariant change
- [ ] Genesis change
- [ ] Identity/Sybil change
- [ ] Circulation/reward change
- [ ] Canonical exchange/custody change
- [ ] Validator/consensus change

## Required evidence

- [ ] `npm run protocol:verify`
- [ ] `npm run protocol:test`
- [ ] `npm run protocol:simulate` where economics are affected
- [ ] `npm run qa:local` where applicable
- [ ] No new false mainnet, audit, price, reserve, or legal claims
- [ ] Supply/issuance/retirement impact explained
- [ ] Security and abuse impact explained
- [ ] Privacy impact explained
- [ ] Migration impact explained

## High-risk boundaries

If circulation is affected:

- [ ] reward remains epoch-bounded
- [ ] raw transaction count is not mint authority
- [ ] replay/wash/Sybil effects considered
- [ ] per-person caps and privacy effects considered

If canonical conversion is affected:

- [ ] ordinary ATC transfer remains outside exit friction
- [ ] reference value is separate from net proceeds
- [ ] hard friction cap remains enforceable
- [ ] no indefinite lock introduced
- [ ] retirement cannot precede external settlement acceptance
- [ ] no external-deposit generic mint introduced
- [ ] operator/regulatory launch impact identified

## Status claim

State whether this change is `implemented`, `prototype`, `experimental`, `planned`, `blocked`, `needs review`, or `audited` and name evidence for any status stronger than prototype.
