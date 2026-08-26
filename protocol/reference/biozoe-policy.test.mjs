import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOZOE_INVARIANTS,
  applyDemurrage,
  calculateAccruedUniversalIssuance,
  calculateUniversalIssuance,
  calculateBudgetedIssuance,
  humanGovernanceWeight,
  validatorVotingPower,
  passiveEquilibriumApprox,
  transfer,
} from './biozoe-policy.mjs';

test('genesis economics contain no scarcity privilege', () => {
  assert.equal(BIOZOE_INVARIANTS.terminalSupplyCap, null);
  assert.equal(BIOZOE_INVARIANTS.premine, 0n);
  assert.equal(BIOZOE_INVARIANTS.founderAllocation, 0n);
  assert.equal(BIOZOE_INVARIANTS.investorAllocation, 0n);
  assert.equal(BIOZOE_INVARIANTS.tokenWeightedGovernance, false);
  assert.equal(BIOZOE_INVARIANTS.tokenWeightedConsensus, false);
  assert.equal(BIOZOE_INVARIANTS.connectivityRequiredToPreserveBaselineEntitlement, false);
});

test('eligible people receive equal baseline issuance regardless of wealth', () => {
  const amountPerEpoch = 1_000_000_000_000_000_000n;
  const poor = calculateUniversalIssuance({ eligible: true, alreadyClaimed: false, amountPerEpoch });
  const wealthy = calculateUniversalIssuance({ eligible: true, alreadyClaimed: false, amountPerEpoch });
  assert.equal(poor, wealthy);
});

test('single-epoch baseline helper rejects a duplicate settlement', () => {
  const amountPerEpoch = 1_000n;
  assert.equal(calculateUniversalIssuance({ eligible: true, alreadyClaimed: true, amountPerEpoch }), 0n);
});

test('offline participants retain accrued baseline rights with historical demurrage', () => {
  const amountPerEpoch = 1_000_000n;
  const result = calculateAccruedUniversalIssuance({
    fromEpoch: 0,
    throughEpoch: 1,
    amountPerEpoch,
    demurragePpmPerEpoch: 192,
    eligibleAtEpoch: () => true,
  });

  const epochZeroAgedOnce = applyDemurrage(amountPerEpoch, 192);
  assert.equal(result.gross, amountPerEpoch * 2n);
  assert.equal(result.net, epochZeroAgedOnce + amountPerEpoch);
  assert.equal(result.retired, result.gross - result.net);
  assert.equal(result.eligibleEpochs, 2);
});

test('ineligible epochs accrue no baseline while previously earned value keeps aging', () => {
  const amountPerEpoch = 1_000_000n;
  const result = calculateAccruedUniversalIssuance({
    fromEpoch: 0,
    throughEpoch: 3,
    amountPerEpoch,
    demurragePpmPerEpoch: 192,
    eligibleAtEpoch: (epoch) => epoch === 0 || epoch === 3,
  });

  let expected = amountPerEpoch;
  expected = applyDemurrage(expected, 192);
  expected = applyDemurrage(expected, 192);
  expected = applyDemurrage(expected, 192);
  expected += amountPerEpoch;

  assert.equal(result.gross, amountPerEpoch * 2n);
  assert.equal(result.net, expected);
  assert.equal(result.eligibleEpochs, 2);
});

test('governance weight is not a function of token balance', () => {
  assert.equal(humanGovernanceWeight({ verified: true }), 1n);
  assert.equal(humanGovernanceWeight({ verified: true, balance: 10n ** 30n }), 1n);
  assert.equal(humanGovernanceWeight({ verified: false }), 0n);
});

test('validator voting power is authorization based, not stake based', () => {
  assert.equal(validatorVotingPower({ authorized: true, stake: 0n }), 1n);
  assert.equal(validatorVotingPower({ authorized: true, stake: 10n ** 30n }), 1n);
  assert.equal(validatorVotingPower({ authorized: false, stake: 10n ** 30n }), 0n);
});

test('demurrage is deterministic and never creates supply', () => {
  const before = 1_000_000n;
  const after = applyDemurrage(before, 192);
  assert(after < before);
  assert.equal(after, 999_808n);
});

test('budgeted issuance requires evidence and cannot exceed its governed budget', () => {
  assert.equal(calculateBudgetedIssuance({ requested: 50n, remainingBudget: 100n, evidenceAccepted: false }), 0n);
  assert.equal(calculateBudgetedIssuance({ requested: 50n, remainingBudget: 100n, evidenceAccepted: true }), 50n);
  assert.throws(
    () => calculateBudgetedIssuance({ requested: 101n, remainingBudget: 100n, evidenceAccepted: true }),
    /exceeds governed epoch budget/,
  );
});

test('passive equilibrium is finite when issuance and demurrage are both positive', () => {
  const equilibrium = passiveEquilibriumApprox({
    issuancePerEpoch: 1_000_000_000_000_000_000n,
    demurragePpmPerEpoch: 192,
  });
  assert(equilibrium > 5_000n * 10n ** 18n);
  assert(equilibrium < 5_300n * 10n ** 18n);
});

test('transfers conserve supply', () => {
  const result = transfer({ fromBalance: 100n, toBalance: 10n, amount: 25n });
  assert.equal(result.fromBalance + result.toBalance, 110n);
});
