import {
  applyDemurrage,
  calculateAccruedUniversalIssuance,
  calculateBudgetedIssuance,
  calculateCanonicalExitQuote,
  calculateCappedProRataReward,
  calculateCirculationPairScore,
  calculateDelayDiscountPpm,
  calculateMaturityExitFriction,
  transfer,
} from './biozoe-policy.mjs';

function cloneMap(map) {
  return new Map(map.entries());
}

function getBudgetStore(state, kind) {
  if (kind === 'contribution') return state.contributionBudgets;
  if (kind === 'regenerative') return state.regenerativeBudgets;
  if (kind === 'stewardship') return state.stewardshipBudgets;
  throw new Error('unsupported budget kind');
}

function isIdentityEligibleAtEpoch(identity, epoch) {
  if (!identity) return false;
  return identity.eligibilityIntervals.some(({ start, end }) => (
    epoch >= start && (end === null || epoch <= end)
  ));
}

function currentIdentityEligible(identity, epoch) {
  return Boolean(
    identity &&
    identity.active &&
    !identity.suspended &&
    isIdentityEligibleAtEpoch(identity, epoch)
  );
}

function closeOpenEligibilityInterval(identity, endEpoch) {
  const openIndex = identity.eligibilityIntervals.findIndex((interval) => interval.end === null);
  if (openIndex < 0) return;

  const interval = identity.eligibilityIntervals[openIndex];
  if (endEpoch < interval.start) {
    identity.eligibilityIntervals.splice(openIndex, 1);
    return;
  }
  interval.end = endEpoch;
}

function openEligibilityInterval(identity, startEpoch) {
  if (identity.eligibilityIntervals.some((interval) => interval.end === null)) return;
  identity.eligibilityIntervals.push({ start: Math.max(startEpoch, identity.eligibleFromEpoch), end: null });
}

function circulationPairKey(a, b) {
  return a < b ? JSON.stringify([a, b]) : JSON.stringify([b, a]);
}

function circulationPairsForEpoch(state, epoch) {
  if (!state.circulationPairsByEpoch.has(epoch)) {
    state.circulationPairsByEpoch.set(epoch, new Map());
  }
  return state.circulationPairsByEpoch.get(epoch);
}

function addWeight(weights, personId, amount) {
  weights.set(personId, (weights.get(personId) ?? 0n) + amount);
}

function configBigInt(config, key, fallback) {
  const value = config[key];
  if (value === undefined || value === null) return BigInt(fallback);
  return BigInt(value);
}

export function createState({ epoch = 0, config }) {
  if (!config) throw new TypeError('config is required');
  return {
    epoch,
    config,
    identities: new Map(),
    balances: new Map(),
    claimedUniversalThroughEpoch: new Map(),
    contributionBudgets: new Map(),
    regenerativeBudgets: new Map(),
    stewardshipBudgets: new Map(),
    usedEvidenceIds: new Set(),
    transfersById: new Map(),
    qualifiedTransferIds: new Set(),
    usedCirculationReceiptIds: new Set(),
    circulationBudgets: new Map(),
    circulationPairsByEpoch: new Map(),
    circulationRewardsSettledEpochs: new Set(),
    authenticatedExternalSettlements: new Map(),
    usedExternalSettlementIds: new Set(),
    usedConversionReceiptIds: new Set(),
    totalIssued: 0n,
    totalRetired: 0n,
    events: [],
  };
}

export function registerIdentity(state, { personId, attestationId, eligibleFromEpoch = state.epoch }) {
  if (!personId || !attestationId) throw new TypeError('personId and attestationId are required');
  if (!Number.isSafeInteger(eligibleFromEpoch) || eligibleFromEpoch < 0) throw new RangeError('eligibleFromEpoch must be a non-negative safe integer');
  if (state.identities.has(personId)) throw new Error('identity already registered');

  state.identities.set(personId, {
    personId,
    attestationId,
    eligibleFromEpoch,
    active: true,
    suspended: false,
    eligibilityIntervals: [{ start: eligibleFromEpoch, end: null }],
  });
  if (!state.balances.has(personId)) state.balances.set(personId, 0n);
  state.events.push({ type: 'IDENTITY_REGISTERED', epoch: state.epoch, personId, attestationId, eligibleFromEpoch });
}

/**
 * Status changes are effective at the beginning of the current epoch.
 * Previously accrued entitlements remain claimable after eligibility returns.
 */
export function setIdentityStatus(state, { personId, active, suspended }) {
  const identity = state.identities.get(personId);
  if (!identity) throw new Error('unknown identity');

  const wasAuthorized = Boolean(identity.active && !identity.suspended);
  const nextActive = active ?? identity.active;
  const nextSuspended = suspended ?? identity.suspended;
  const willBeAuthorized = Boolean(nextActive && !nextSuspended);

  if (wasAuthorized && !willBeAuthorized) {
    closeOpenEligibilityInterval(identity, state.epoch - 1);
  } else if (!wasAuthorized && willBeAuthorized) {
    openEligibilityInterval(identity, state.epoch);
  }

  identity.active = nextActive;
  identity.suspended = nextSuspended;
  state.events.push({
    type: 'IDENTITY_STATUS_CHANGED',
    epoch: state.epoch,
    personId,
    active: identity.active,
    suspended: identity.suspended,
  });
}

export function isEligible(state, personId) {
  return currentIdentityEligible(state.identities.get(personId), state.epoch);
}

export function isEligibleAtEpoch(state, personId, epoch) {
  const identity = state.identities.get(personId);
  return isIdentityEligibleAtEpoch(identity, epoch);
}

/**
 * Settle every unclaimed eligible baseline epoch through the current epoch.
 * Offline access never destroys an earned entitlement. Historical portions are
 * demurred as though settled on time.
 */
export function claimUniversal(state, personId) {
  const identity = state.identities.get(personId);
  if (!identity) throw new Error('unknown identity');
  if (!isEligible(state, personId)) return 0n;

  const lastSettledThrough = state.claimedUniversalThroughEpoch.get(personId) ?? (identity.eligibleFromEpoch - 1);
  const fromEpoch = Math.max(identity.eligibleFromEpoch, lastSettledThrough + 1);
  const throughEpoch = state.epoch;

  if (fromEpoch > throughEpoch) return 0n;

  const accrual = calculateAccruedUniversalIssuance({
    fromEpoch,
    throughEpoch,
    amountPerEpoch: BigInt(state.config.universalIssuancePerEpoch),
    demurragePpmPerEpoch: state.config.demurragePpmPerEpoch,
    eligibleAtEpoch: (epoch) => isIdentityEligibleAtEpoch(identity, epoch),
  });

  state.claimedUniversalThroughEpoch.set(personId, throughEpoch);
  if (accrual.gross === 0n) return 0n;

  state.balances.set(personId, (state.balances.get(personId) ?? 0n) + accrual.net);
  state.totalIssued += accrual.gross;
  state.totalRetired += accrual.retired;
  state.events.push({
    type: 'UNIVERSAL_ISSUANCE_SETTLED',
    epoch: state.epoch,
    personId,
    fromEpoch,
    throughEpoch,
    eligibleEpochs: accrual.eligibleEpochs,
    gross: accrual.gross.toString(),
    net: accrual.net.toString(),
    retired: accrual.retired.toString(),
  });
  return accrual.net;
}

export function configureBudget(state, { kind, programId, epoch, amount }) {
  if (!programId) throw new TypeError('programId is required');
  if (!Number.isSafeInteger(epoch) || epoch < 0) throw new RangeError('epoch must be a non-negative safe integer');
  const value = BigInt(amount);
  if (value < 0n) throw new RangeError('budget cannot be negative');

  const target = getBudgetStore(state, kind);
  const key = `${epoch}:${programId}`;
  if (target.has(key)) throw new Error('budget already configured for this program and epoch');

  target.set(key, value);
  state.events.push({ type: 'BUDGET_CONFIGURED', kind, epoch, programId, amount: value.toString() });
}

export function mintBudgeted(state, { kind, programId, recipientId, amount, evidenceAccepted, evidenceId }) {
  if (!isEligible(state, recipientId)) throw new Error('recipient is not an eligible identity');
  if (!evidenceId) throw new TypeError('evidenceId is required');
  if (state.usedEvidenceIds.has(evidenceId)) throw new Error('evidence receipt already used');

  const target = getBudgetStore(state, kind);
  const key = `${state.epoch}:${programId}`;
  const remainingBudget = target.get(key) ?? 0n;
  const requested = BigInt(amount);
  const minted = calculateBudgetedIssuance({ requested, remainingBudget, evidenceAccepted });
  if (minted === 0n) return 0n;

  target.set(key, remainingBudget - minted);
  state.usedEvidenceIds.add(evidenceId);
  state.balances.set(recipientId, (state.balances.get(recipientId) ?? 0n) + minted);
  state.totalIssued += minted;
  state.events.push({
    type: 'BUDGETED_ISSUANCE',
    kind,
    epoch: state.epoch,
    programId,
    recipientId,
    amount: minted.toString(),
    evidenceId,
  });
  return minted;
}

/**
 * Ordinary ATC transfers remain ordinary transfers. No exit friction is applied
 * here. A transfer only becomes eligible for circulation issuance if a separate
 * authenticated circulation receipt qualifies it.
 */
export function transferBetween(state, { fromId, toId, amount, transferId = null }) {
  if (!state.identities.has(fromId) || !state.identities.has(toId)) throw new Error('unknown identity');
  if (fromId === toId) throw new Error('self transfers are not permitted');
  if (transferId && state.transfersById.has(transferId)) throw new Error('transferId already used');

  const value = BigInt(amount);
  const result = transfer({
    fromBalance: state.balances.get(fromId) ?? 0n,
    toBalance: state.balances.get(toId) ?? 0n,
    amount: value,
  });
  state.balances.set(fromId, result.fromBalance);
  state.balances.set(toId, result.toBalance);

  const event = { type: 'TRANSFER', epoch: state.epoch, fromId, toId, amount: value.toString(), transferId };
  state.events.push(event);
  if (transferId) {
    state.transfersById.set(transferId, { epoch: state.epoch, fromId, toId, amount: value });
  }
  return event;
}

/**
 * Record a qualified circulation event using a transfer that already occurred.
 * The receipt contains only the minimum authorization needed by this reference
 * model. Production receipt verification belongs at the authenticated evidence
 * boundary and should avoid exposing unnecessary purchase details on-chain.
 */
export function recordQualifiedCirculation(state, {
  transferId,
  circulationReceiptId,
  receiptAccepted,
}) {
  if (!transferId || !circulationReceiptId) throw new TypeError('transferId and circulationReceiptId are required');
  if (!receiptAccepted) return false;
  if (state.usedCirculationReceiptIds.has(circulationReceiptId)) throw new Error('circulation receipt already used');
  if (state.qualifiedTransferIds.has(transferId)) throw new Error('transfer already qualified for circulation');

  const tx = state.transfersById.get(transferId);
  if (!tx) throw new Error('unknown transferId');
  if (tx.epoch !== state.epoch) throw new Error('circulation qualification must occur in the transfer epoch');
  if (tx.fromId === tx.toId) throw new Error('self transfers do not qualify for circulation issuance');
  if (tx.amount <= 0n) throw new Error('zero-value transfers do not qualify for circulation issuance');
  if (!isEligible(state, tx.fromId) || !isEligible(state, tx.toId)) {
    throw new Error('both circulation participants must be eligible identities');
  }

  const lowId = tx.fromId < tx.toId ? tx.fromId : tx.toId;
  const highId = tx.fromId < tx.toId ? tx.toId : tx.fromId;
  const pairs = circulationPairsForEpoch(state, state.epoch);
  const key = circulationPairKey(tx.fromId, tx.toId);
  const pair = pairs.get(key) ?? { lowId, highId, lowToHigh: 0n, highToLow: 0n };

  if (tx.fromId === lowId) pair.lowToHigh += tx.amount;
  else pair.highToLow += tx.amount;

  pairs.set(key, pair);
  state.qualifiedTransferIds.add(transferId);
  state.usedCirculationReceiptIds.add(circulationReceiptId);
  state.events.push({
    type: 'QUALIFIED_CIRCULATION_RECORDED',
    epoch: state.epoch,
    transferId,
    circulationReceiptId,
    fromId: tx.fromId,
    toId: tx.toId,
    amount: tx.amount.toString(),
  });
  return true;
}

export function configureCirculationBudget(state, { epoch, amount }) {
  if (!Number.isSafeInteger(epoch) || epoch < 0) throw new RangeError('epoch must be a non-negative safe integer');
  const value = BigInt(amount);
  if (value < 0n) throw new RangeError('circulation budget cannot be negative');
  if (state.circulationBudgets.has(epoch)) throw new Error('circulation budget already configured for this epoch');
  state.circulationBudgets.set(epoch, value);
  state.events.push({ type: 'CIRCULATION_BUDGET_CONFIGURED', epoch, amount: value.toString() });
}

/**
 * Distribute a fixed circulation pool. Direct round trips are netted by pair.
 * Diminishing returns arise from integer square-root scoring. Distinct pair
 * relationships each contribute separately, rewarding breadth of circulation.
 * Per-identity caps prevent a large spender from consuming the whole pool.
 * Unallocated budget remains unissued.
 */
export function settleCirculationRewards(state) {
  const epoch = state.epoch;
  if (state.circulationRewardsSettledEpochs.has(epoch)) {
    return { epoch, issued: 0n, unissued: 0n, recipients: 0 };
  }

  state.circulationRewardsSettledEpochs.add(epoch);
  const budget = state.circulationBudgets.get(epoch) ?? 0n;
  if (budget === 0n) {
    state.events.push({ type: 'CIRCULATION_REWARDS_SETTLED', epoch, budget: '0', issued: '0', unissued: '0', recipients: 0 });
    return { epoch, issued: 0n, unissued: 0n, recipients: 0 };
  }

  const senderWeightBps = state.config.circulationSenderWeightBps ?? 4_000;
  const receiverWeightBps = state.config.circulationReceiverWeightBps ?? 6_000;
  const cap = configBigInt(state.config, 'circulationRewardCapPerIdentityPerEpoch', budget.toString());
  const pairs = state.circulationPairsByEpoch.get(epoch) ?? new Map();
  const weights = new Map();

  for (const pair of pairs.values()) {
    if (pair.lowToHigh === pair.highToLow) continue;

    const lowIsNetSender = pair.lowToHigh > pair.highToLow;
    const netAmount = lowIsNetSender
      ? pair.lowToHigh - pair.highToLow
      : pair.highToLow - pair.lowToHigh;
    const senderId = lowIsNetSender ? pair.lowId : pair.highId;
    const receiverId = lowIsNetSender ? pair.highId : pair.lowId;

    addWeight(weights, senderId, calculateCirculationPairScore({ netAmount, roleWeightBps: senderWeightBps }));
    addWeight(weights, receiverId, calculateCirculationPairScore({ netAmount, roleWeightBps: receiverWeightBps }));
  }

  const totalWeight = [...weights.values()].reduce((sum, value) => sum + value, 0n);
  if (totalWeight === 0n) {
    state.events.push({ type: 'CIRCULATION_REWARDS_SETTLED', epoch, budget: budget.toString(), issued: '0', unissued: budget.toString(), recipients: 0 });
    return { epoch, issued: 0n, unissued: budget, recipients: 0 };
  }

  let issued = 0n;
  let recipients = 0;
  for (const [personId, weight] of weights.entries()) {
    const reward = calculateCappedProRataReward({ budget, weight, totalWeight, cap });
    if (reward === 0n) continue;
    state.balances.set(personId, (state.balances.get(personId) ?? 0n) + reward);
    state.totalIssued += reward;
    issued += reward;
    recipients += 1;
    state.events.push({
      type: 'CIRCULATION_ISSUANCE',
      epoch,
      personId,
      weight: weight.toString(),
      amount: reward.toString(),
    });
  }

  const unissued = budget - issued;
  state.events.push({
    type: 'CIRCULATION_REWARDS_SETTLED',
    epoch,
    budget: budget.toString(),
    issued: issued.toString(),
    unissued: unissued.toString(),
    recipients,
  });
  return { epoch, issued, unissued, recipients };
}

/**
 * Register evidence accepted by the separately authorized exchange adapter.
 * Production authentication belongs at that boundary; consensus requires the
 * resulting record to be complete, field-bound, unique, and single-use.
 */
export function recordAuthenticatedExternalSettlement(state, {
  settlementId, personId, atcAmount, referenceExternalValue,
  conversionReceiptId, netExternalProceeds, operatorId, authenticationProof,
}) {
  if (!settlementId || !personId || !conversionReceiptId || !operatorId || !authenticationProof) {
    throw new TypeError('complete authenticated settlement evidence is required');
  }
  if (!state.identities.has(personId)) throw new Error('unknown identity');
  if (state.authenticatedExternalSettlements.has(settlementId) || state.usedExternalSettlementIds.has(settlementId)) {
    throw new Error('external settlement identifier already used');
  }
  const amount = BigInt(atcAmount);
  const referenceValue = BigInt(referenceExternalValue);
  const netProceeds = BigInt(netExternalProceeds);
  if (amount <= 0n) throw new RangeError('settled atcAmount must be positive');
  if (referenceValue < 0n || netProceeds < 0n || netProceeds > referenceValue) throw new RangeError('invalid external settlement values');
  const record = { settlementId, personId, atcAmount: amount, referenceExternalValue: referenceValue, conversionReceiptId, netExternalProceeds: netProceeds, operatorId, authenticationProof };
  state.authenticatedExternalSettlements.set(settlementId, record);
  state.events.push({ type: 'EXTERNAL_SETTLEMENT_AUTHENTICATED', epoch: state.epoch, settlementId, personId, atcAmount: amount.toString(), referenceExternalValue: referenceValue.toString(), conversionReceiptId, netExternalProceeds: netProceeds.toString(), operatorId });
  return record;
}

/**
 * Retire ATC only after consuming an authenticated, single-use settlement
 * record bound to this exact person, amount, quote, and conversion receipt.
 */
export function executeCanonicalExit(state, {
  personId, atcAmount, referenceExternalValue, delayEpochs = 0,
  stressFrictionPpm = 0, conversionReceiptId, settlementId,
}) {
  if (state.config.canonicalConversionEnabled !== true) throw new Error('canonical conversion is disabled');
  if (!state.identities.has(personId)) throw new Error('unknown identity');
  if (!conversionReceiptId || !settlementId) throw new TypeError('conversionReceiptId and settlementId are required');
  if (state.usedConversionReceiptIds.has(conversionReceiptId)) throw new Error('conversion receipt already used');
  if (state.usedExternalSettlementIds.has(settlementId)) throw new Error('external settlement already consumed');
  const amount = BigInt(atcAmount);
  const referenceValue = BigInt(referenceExternalValue);
  if (amount <= 0n) throw new RangeError('atcAmount must be positive');
  if (referenceValue < 0n) throw new RangeError('referenceExternalValue cannot be negative');
  const stressMax = state.config.canonicalExitStressSurchargeMaxPpm ?? 0;
  if (!Number.isInteger(stressFrictionPpm) || stressFrictionPpm < 0 || stressFrictionPpm > stressMax) throw new RangeError('stressFrictionPpm exceeds governed maximum');
  const maturityFrictionPpm = calculateMaturityExitFriction({ epoch: state.epoch, startEpoch: state.config.canonicalExitStartEpoch ?? 0, startPpm: state.config.canonicalExitStartPpm, maturePpm: state.config.canonicalExitMaturePpm, rampEpochs: state.config.canonicalExitRampEpochs });
  const delayDiscountPpm = calculateDelayDiscountPpm({ delayEpochs, discountPpmPerEpoch: state.config.canonicalExitDelayDiscountPpmPerEpoch, maxDiscountPpm: state.config.canonicalExitDelayDiscountMaxPpm });
  const quote = calculateCanonicalExitQuote({ referenceValue, maturityFrictionPpm, stressFrictionPpm, delayDiscountPpm, hardCapPpm: state.config.canonicalExitHardCapPpm, minimumFrictionPpm: state.config.canonicalExitMinimumPpm });
  const settlement = state.authenticatedExternalSettlements.get(settlementId);
  if (!settlement) throw new Error('authenticated external settlement record is required');
  if (settlement.personId !== personId || settlement.atcAmount !== amount || settlement.referenceExternalValue !== referenceValue || settlement.conversionReceiptId !== conversionReceiptId || settlement.netExternalProceeds !== quote.netProceeds) throw new Error('external settlement record does not match canonical exit');
  const balance = state.balances.get(personId) ?? 0n;
  if (amount > balance) throw new RangeError('insufficient balance');
  state.balances.set(personId, balance - amount);
  state.totalRetired += amount;
  state.authenticatedExternalSettlements.delete(settlementId);
  state.usedExternalSettlementIds.add(settlementId);
  state.usedConversionReceiptIds.add(conversionReceiptId);
  state.events.push({ type: 'CANONICAL_EXIT', epoch: state.epoch, personId, atcRetired: amount.toString(), settlementId, conversionReceiptId, settlementOperatorId: settlement.operatorId, delayEpochs, referenceExternalValue: quote.referenceValue.toString(), appliedFrictionPpm: quote.appliedFrictionPpm, netExternalProceeds: quote.netProceeds.toString(), reserveRetention: quote.reserveRetention.toString() });
  return quote;
}

export function settleDemurrage(state) {
  const ppm = state.config.demurragePpmPerEpoch;
  let retired = 0n;
  const nextBalances = cloneMap(state.balances);
  for (const [personId, balance] of state.balances.entries()) {
    const next = applyDemurrage(balance, ppm);
    retired += balance - next;
    nextBalances.set(personId, next);
  }
  state.balances = nextBalances;
  state.totalRetired += retired;
  state.events.push({ type: 'DEMURRAGE_SETTLED', epoch: state.epoch, retired: retired.toString() });
  return retired;
}

export function advanceEpoch(state) {
  // Existing liquid balances age first. Circulation rewards are then settled as
  // new end-of-epoch issuance and begin aging during the following epoch.
  settleDemurrage(state);
  settleCirculationRewards(state);
  state.epoch += 1;
  state.events.push({ type: 'EPOCH_ADVANCED', epoch: state.epoch });
}

export function circulatingSupply(state) {
  return [...state.balances.values()].reduce((sum, value) => sum + value, 0n);
}

export function assertSupplyInvariant(state) {
  const circulating = circulatingSupply(state);
  if (circulating !== state.totalIssued - state.totalRetired) {
    throw new Error(`supply invariant violated: circulating=${circulating} issued=${state.totalIssued} retired=${state.totalRetired}`);
  }
  return true;
}
