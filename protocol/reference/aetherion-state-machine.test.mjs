import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceEpoch,
  assertSupplyInvariant,
  claimUniversal,
  configureBudget,
  createState,
  mintBudgeted,
  registerIdentity,
  transferBetween,
} from './aetherion-state-machine.mjs';

const ATC = 10n ** 18n;
const config = {
  universalIssuancePerEpoch: ATC.toString(),
  demurragePpmPerEpoch: 192,
};

test('genesis starts with zero money until an eligible person claims', () => {
  const state = createState({ config });
  assert.equal(state.totalIssued, 0n);
  assert.equal(state.balances.size, 0);
  assertSupplyInvariant(state);
});

test('equal baseline rights survive different join dates', () => {
  const state = createState({ config });
  registerIdentity(state, { personId: 'alice', attestationId: 'att-a', eligibleFromEpoch: 0 });
  assert.equal(claimUniversal(state, 'alice'), ATC);
  advanceEpoch(state);
  registerIdentity(state, { personId: 'bob', attestationId: 'att-b', eligibleFromEpoch: 1 });
  assert.equal(claimUniversal(state, 'alice'), ATC);
  assert.equal(claimUniversal(state, 'bob'), ATC);
  assertSupplyInvariant(state);
});

test('contribution issuance is impossible without a governed budget and accepted evidence', () => {
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
