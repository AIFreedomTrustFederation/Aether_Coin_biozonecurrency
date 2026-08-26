import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceEpoch,
  assertSupplyInvariant,
  claimUniversal,
  configureBudget,
  createState,
  isEligibleAtEpoch,
  mintBudgeted,
  registerIdentity,
  setIdentityStatus,
  transferBetween,
} from './aetherion-state-machine.mjs';
import { applyDemurrage } from './biozoe-policy.mjs';

const ATC = 10n ** 18n;
const config = {
  universalIssuancePerEpoch: ATC.toString(),
  demurragePpmPerEpoch: 192,
};

test('genesis starts with zero money until an eligible entitlement is settled', () => {
  const state = createState({ config });
  assert.equal(state.totalIssued, 0n);
  assert.equal(state.balances.size, 0);
  assertSupplyInvariant(state);
});

test('a person can settle missed baseline epochs after being offline without escaping demurrage', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a', eligibleFromEpoch: 0 });

  advanceEpoch(state);
  const settled = claimUniversal(state, 'alice');
  const expected = applyDemurrage(ATC, config.demurragePpmPerEpoch) + ATC;

  assert.equal(settled, expected);
  assert.equal(state.totalIssued, 2n * ATC);
  assert.equal(state.totalRetired, 2n * ATC - expected);
  assert.equal(claimUniversal(state, 'alice'), 0n);
  assertSupplyInvariant(state);
});

test('different join dates receive the same entitlement for the same eligible epoch', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a', eligibleFromEpoch: 0 });
  claimUniversal(state, 'alice');
  advanceEpoch(state);

  registerIdentity(state, { personId: 'bob', attestationId: 'att-b', eligibleFromEpoch: 1 });
  const aliceEpochOne = claimUniversal(state, 'alice');
  const bobEpochOne = claimUniversal(state, 'bob');

  assert.equal(aliceEpochOne, ATC);
  assert.equal(bobEpochOne, ATC);
  assertSupplyInvariant(state);
});

test('suspension stops new entitlements without erasing earlier earned epochs', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a', eligibleFromEpoch: 0 });

  advanceEpoch(state); // epoch 1
  setIdentityStatus(state, { personId: 'alice', suspended: true });
  assert.equal(isEligibleAtEpoch(state, 'alice', 0), true);
  assert.equal(isEligibleAtEpoch(state, 'alice', 1), false);
  assert.equal(claimUniversal(state, 'alice'), 0n);

  advanceEpoch(state); // epoch 2, still suspended
  setIdentityStatus(state, { personId: 'alice', suspended: false });
  assert.equal(isEligibleAtEpoch(state, 'alice', 2), true);

  const settled = claimUniversal(state, 'alice');
  let expected = ATC;
  expected = applyDemurrage(expected, config.demurragePpmPerEpoch); // 0 -> 1
  expected = applyDemurrage(expected, config.demurragePpmPerEpoch); // 1 -> 2
  expected += ATC; // epoch 2 entitlement

  assert.equal(settled, expected);
  assert.equal(state.totalIssued, 2n * ATC);
  assertSupplyInvariant(state);
});

test('suspension before a future eligibility date cannot accidentally create historical entitlement', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'future', attestationId: 'att-f', eligibleFromEpoch: 3 });
  setIdentityStatus(state, { personId: 'future', suspended: true });

  advanceEpoch(state); // 1
  setIdentityStatus(state, { personId: 'future', suspended: false });
  assert.equal(isEligibleAtEpoch(state, 'future', 1), false);
  assert.equal(isEligibleAtEpoch(state, 'future', 2), false);
  assert.equal(isEligibleAtEpoch(state, 'future', 3), true);
});

test('budgeted issuance is impossible without a governed budget and accepted evidence', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a' });
  assert.throws(
    () => mintBudgeted(state, {
      kind: 'contribution', programId: 'care', recipientId: 'alice', amount: ATC, evidenceAccepted: true, evidenceId: 'e1',
    }),
    /exceeds governed epoch budget/,
  );

  configureBudget(state, { kind: 'contribution', programId: 'care', epoch: 0, amount: 2n * ATC });
  assert.equal(mintBudgeted(state, {
    kind: 'contribution', programId: 'care', recipientId: 'alice', amount: ATC, evidenceAccepted: false, evidenceId: 'e2',
  }), 0n);
  assert.equal(mintBudgeted(state, {
    kind: 'contribution', programId: 'care', recipientId: 'alice', amount: ATC, evidenceAccepted: true, evidenceId: 'e3',
  }), ATC);
  assertSupplyInvariant(state);
});

test('evidence receipts cannot mint twice and spent budgets cannot be reset', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a' });
  configureBudget(state, { kind: 'regenerative', programId: 'watershed', epoch: 0, amount: 2n * ATC });

  assert.equal(mintBudgeted(state, {
    kind: 'regenerative', programId: 'watershed', recipientId: 'alice', amount: ATC, evidenceAccepted: true, evidenceId: 'watershed-proof-1',
  }), ATC);

  assert.throws(
    () => mintBudgeted(state, {
      kind: 'regenerative', programId: 'watershed', recipientId: 'alice', amount: ATC, evidenceAccepted: true, evidenceId: 'watershed-proof-1',
    }),
    /already used/,
  );
  assert.throws(
    () => configureBudget(state, { kind: 'regenerative', programId: 'watershed', epoch: 0, amount: 99n * ATC }),
    /already configured/,
  );
  assertSupplyInvariant(state);
});

test('stewardship is an explicit budgeted issuance class rather than a validator wealth reward', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'operator', attestationId: 'att-o' });
  configureBudget(state, { kind: 'stewardship', programId: 'public-rpc', epoch: 0, amount: ATC });

  const minted = mintBudgeted(state, {
    kind: 'stewardship',
    programId: 'public-rpc',
    recipientId: 'operator',
    amount: ATC,
    evidenceAccepted: true,
    evidenceId: 'service-receipt-1',
  });

  assert.equal(minted, ATC);
  assertSupplyInvariant(state);
});

test('transfers conserve and epoch settlement retires rather than redistributes demurrage', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a' });
  registerIdentity(state, { personId: 'bob', attestationId: 'att-b' });
  claimUniversal(state, 'alice');
  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: ATC / 4n });
  const issuedBefore = state.totalIssued;
  advanceEpoch(state);
  assert.equal(state.totalIssued, issuedBefore);
  assert(state.totalRetired > 0n);
  assertSupplyInvariant(state);
});
