import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSupplyInvariant,
  configureBudget,
  configureCirculationBudget,
  createState,
  executeCanonicalExit,
  mintBudgeted,
  recordAuthenticatedExternalSettlement,
  recordQualifiedCirculation,
  registerIdentity,
  settleCirculationRewards,
  transferBetween,
} from './aetherion-state-machine.mjs';
import {
  BIOZOE_INVARIANTS,
  calculateCanonicalExitQuote,
  calculateCirculationPairScore,
  calculateDelayDiscountPpm,
  calculateMaturityExitFriction,
} from './biozoe-policy.mjs';

const ATC = 10n ** 18n;

const config = {
  universalIssuancePerEpoch: ATC.toString(),
  demurragePpmPerEpoch: 192,
  circulationSenderWeightBps: 4_000,
  circulationReceiverWeightBps: 6_000,
  circulationRewardCapPerIdentityPerEpoch: (5n * ATC).toString(),
  canonicalConversionEnabled: true,
  canonicalExitStartEpoch: 0,
  canonicalExitStartPpm: 20_000,
  canonicalExitMaturePpm: 80_000,
  canonicalExitRampEpochs: 100,
  canonicalExitStressSurchargeMaxPpm: 70_000,
  canonicalExitDelayDiscountPpmPerEpoch: 1_000,
  canonicalExitDelayDiscountMaxPpm: 70_000,
  canonicalExitHardCapPpm: 150_000,
  canonicalExitMinimumPpm: 10_000,
};

function register(state, ...ids) {
  for (const id of ids) registerIdentity(state, { personId: id, attestationId: `att-${id}`, eligibleFromEpoch: state.epoch });
}

function issueForTest(state, personId, amount, suffix) {
  const programId = `test-liquidity-${suffix}`;
  configureBudget(state, { kind: 'contribution', programId, epoch: state.epoch, amount });
  return mintBudgeted(state, {
    kind: 'contribution',
    programId,
    recipientId: personId,
    amount,
    evidenceAccepted: true,
    evidenceId: `evidence-${suffix}`,
  });
}

test('constitution rejects raw transaction-count rewards and uncapped exit friction', () => {
  assert.equal(BIOZOE_INVARIANTS.rawTransactionCountCreatesCirculationIssuance, false);
  assert.equal(BIOZOE_INVARIANTS.circulationIssuanceHasEpochBudget, true);
  assert.equal(BIOZOE_INVARIANTS.ordinaryTransferHasExitFriction, false);
  assert.equal(BIOZOE_INVARIANTS.canonicalExitRequiresHardFrictionCap, true);
  assert.equal(BIOZOE_INVARIANTS.canonicalExitRewritesReferencePrice, false);
  assert.equal(BIOZOE_INVARIANTS.guaranteedAppreciation, false);
});

test('direct round-trip circulation nets to zero and earns no issuance', () => {
  const state = createState({ config });
  register(state, 'alice', 'bob');
  issueForTest(state, 'alice', 20n * ATC, 'roundtrip');
  configureCirculationBudget(state, { epoch: 0, amount: 10n * ATC });

  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: 10n * ATC, transferId: 't1' });
  recordQualifiedCirculation(state, { transferId: 't1', circulationReceiptId: 'c1', receiptAccepted: true });
  transferBetween(state, { fromId: 'bob', toId: 'alice', amount: 10n * ATC, transferId: 't2' });
  recordQualifiedCirculation(state, { transferId: 't2', circulationReceiptId: 'c2', receiptAccepted: true });

  const result = settleCirculationRewards(state);
  assert.equal(result.issued, 0n);
  assert.equal(result.unissued, 10n * ATC);
  assertSupplyInvariant(state);
});

test('qualified circulation is budget bounded, capped per identity, and rewards both sides', () => {
  const state = createState({ config });
  register(state, 'alice', 'bob', 'carol');
  issueForTest(state, 'alice', 200n * ATC, 'circulation');
  configureCirculationBudget(state, { epoch: 0, amount: 10n * ATC });

  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: 100n * ATC, transferId: 't1' });
  recordQualifiedCirculation(state, { transferId: 't1', circulationReceiptId: 'c1', receiptAccepted: true });
  transferBetween(state, { fromId: 'bob', toId: 'alice', amount: 90n * ATC, transferId: 't2' });
  recordQualifiedCirculation(state, { transferId: 't2', circulationReceiptId: 'c2', receiptAccepted: true });
  transferBetween(state, { fromId: 'alice', toId: 'carol', amount: 25n * ATC, transferId: 't3' });
  recordQualifiedCirculation(state, { transferId: 't3', circulationReceiptId: 'c3', receiptAccepted: true });

  const issuedBefore = state.totalIssued;
  const result = settleCirculationRewards(state);
  const circulationIssued = state.totalIssued - issuedBefore;

  assert(result.issued > 0n);
  assert(result.issued <= 10n * ATC);
  assert.equal(circulationIssued, result.issued);
  assert((state.events.filter((event) => event.type === 'CIRCULATION_ISSUANCE')).length >= 2);
  for (const event of state.events.filter((entry) => entry.type === 'CIRCULATION_ISSUANCE')) {
    assert(BigInt(event.amount) <= 5n * ATC);
  }
  assertSupplyInvariant(state);
});

test('circulation receipt replay and transfer double-qualification are rejected', () => {
  const state = createState({ config });
  register(state, 'alice', 'bob');
  issueForTest(state, 'alice', 10n * ATC, 'replay');
  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: ATC, transferId: 't1' });
  recordQualifiedCirculation(state, { transferId: 't1', circulationReceiptId: 'c1', receiptAccepted: true });

  assert.throws(
    () => recordQualifiedCirculation(state, { transferId: 't1', circulationReceiptId: 'c2', receiptAccepted: true }),
    /already qualified/,
  );

  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: ATC, transferId: 't2' });
  assert.throws(
    () => recordQualifiedCirculation(state, { transferId: 't2', circulationReceiptId: 'c1', receiptAccepted: true }),
    /receipt already used/,
  );
});

test('breadth of genuine counterparties has more score than the same value concentrated in one pair', () => {
  const concentrated = calculateCirculationPairScore({ netAmount: 100n, roleWeightBps: 10_000 });
  const diversified = 10n * calculateCirculationPairScore({ netAmount: 10n, roleWeightBps: 10_000 });
  assert(diversified > concentrated);
});

test('canonical exit changes proceeds but never rewrites the reference value', () => {
  const maturityFrictionPpm = calculateMaturityExitFriction({
    epoch: 50,
    startEpoch: 0,
    startPpm: 20_000,
    maturePpm: 80_000,
    rampEpochs: 100,
  });
  assert.equal(maturityFrictionPpm, 50_000);

  const quote = calculateCanonicalExitQuote({
    referenceValue: 1_000_000n,
    maturityFrictionPpm,
    stressFrictionPpm: 0,
    delayDiscountPpm: 0,
    hardCapPpm: 150_000,
    minimumFrictionPpm: 10_000,
  });

  assert.equal(quote.referenceValue, 1_000_000n);
  assert.equal(quote.appliedFrictionPpm, 50_000);
  assert.equal(quote.netProceeds, 950_000n);
  assert.equal(quote.reserveRetention, 50_000n);
});

test('patient exit reduces friction while the constitutional floor and hard cap remain enforceable', () => {
  const delayedDiscount = calculateDelayDiscountPpm({
    delayEpochs: 90,
    discountPpmPerEpoch: 1_000,
    maxDiscountPpm: 70_000,
  });
  assert.equal(delayedDiscount, 70_000);

  const patient = calculateCanonicalExitQuote({
    referenceValue: 1_000_000n,
    maturityFrictionPpm: 80_000,
    stressFrictionPpm: 0,
    delayDiscountPpm: delayedDiscount,
    hardCapPpm: 150_000,
    minimumFrictionPpm: 10_000,
  });
  assert.equal(patient.appliedFrictionPpm, 10_000);

  const stressed = calculateCanonicalExitQuote({
    referenceValue: 1_000_000n,
    maturityFrictionPpm: 80_000,
    stressFrictionPpm: 70_000,
    delayDiscountPpm: 0,
    hardCapPpm: 150_000,
    minimumFrictionPpm: 10_000,
  });
  assert.equal(stressed.appliedFrictionPpm, 150_000);
  assert.equal(stressed.netProceeds, 850_000n);
});

test('canonical exit requires and consumes authenticated field-bound settlement evidence', () => {
  const state = createState({ epoch: 50, config });
  register(state, 'alice');
  issueForTest(state, 'alice', 20n * ATC, 'exit');
  assert.throws(() => executeCanonicalExit(state, { personId: 'alice', atcAmount: 5n * ATC, referenceExternalValue: 500_000n, conversionReceiptId: 'x-missing', settlementId: 's-missing' }), /authenticated external settlement record is required/);
  const maturityFrictionPpm = calculateMaturityExitFriction({ epoch: state.epoch, startEpoch: config.canonicalExitStartEpoch, startPpm: config.canonicalExitStartPpm, maturePpm: config.canonicalExitMaturePpm, rampEpochs: config.canonicalExitRampEpochs });
  const expected = calculateCanonicalExitQuote({ referenceValue: 500_000n, maturityFrictionPpm, stressFrictionPpm: 0, delayDiscountPpm: 0, hardCapPpm: config.canonicalExitHardCapPpm, minimumFrictionPpm: config.canonicalExitMinimumPpm });
  recordAuthenticatedExternalSettlement(state, { settlementId: 's-accepted', personId: 'alice', atcAmount: 5n * ATC, referenceExternalValue: 500_000n, conversionReceiptId: 'x-accepted', netExternalProceeds: expected.netProceeds, operatorId: 'authorized-adapter-1', authenticationProof: 'test-proof-boundary' });
  assert.throws(() => executeCanonicalExit(state, { personId: 'alice', atcAmount: 4n * ATC, referenceExternalValue: 500_000n, conversionReceiptId: 'x-accepted', settlementId: 's-accepted' }), /does not match/);
  const retiredBefore = state.totalRetired;
  const quote = executeCanonicalExit(state, { personId: 'alice', atcAmount: 5n * ATC, referenceExternalValue: 500_000n, conversionReceiptId: 'x-accepted', settlementId: 's-accepted' });
  assert.equal(state.totalRetired - retiredBefore, 5n * ATC);
  assert.equal(quote.referenceValue, 500_000n);
  assert.equal(state.authenticatedExternalSettlements.has('s-accepted'), false);
  assert.equal(state.usedExternalSettlementIds.has('s-accepted'), true);
  assert.throws(() => executeCanonicalExit(state, { personId: 'alice', atcAmount: 5n * ATC, referenceExternalValue: 500_000n, conversionReceiptId: 'x-accepted', settlementId: 's-accepted' }), /already used|already consumed/);
  assertSupplyInvariant(state);
});

test('self-transfer is rejected without changing balances or supply accounting', () => {
  const state = createState({ config });
  register(state, 'alice');
  issueForTest(state, 'alice', 2n * ATC, 'self-transfer');
  const balanceBefore = state.balances.get('alice'), issuedBefore = state.totalIssued, retiredBefore = state.totalRetired;
  assert.throws(() => transferBetween(state, { fromId: 'alice', toId: 'alice', amount: ATC, transferId: 'self-1' }), /self transfers are not permitted/);
  assert.equal(state.balances.get('alice'), balanceBefore);
  assert.equal(state.totalIssued, issuedBefore);
  assert.equal(state.totalRetired, retiredBefore);
  assert.equal(state.transfersById.has('self-1'), false);
  assertSupplyInvariant(state);
});

test('ordinary ATC transfers have no canonical exit spread', () => {
  const state = createState({ config });
  register(state, 'alice', 'bob');
  issueForTest(state, 'alice', 2n * ATC, 'ordinary-transfer');

  const aliceBefore = state.balances.get('alice');
  const bobBefore = state.balances.get('bob');
  transferBetween(state, { fromId: 'alice', toId: 'bob', amount: ATC });

  assert.equal(state.balances.get('alice'), aliceBefore - ATC);
  assert.equal(state.balances.get('bob'), bobBefore + ATC);
  assertSupplyInvariant(state);
});
