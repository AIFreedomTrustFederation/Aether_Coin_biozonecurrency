import {
  applyDemurrage,
  calculateAccruedUniversalIssuance,
  calculateBudgetedIssuance,
  transfer,
} from './biozoe-policy.mjs';

function cloneMap(map) {
  return new Map(map.entries());
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
  identity.eligibilityIntervals.push({ start: startEpoch, end: null });
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
 * Suspending/inactivating closes eligibility at the previous epoch. Restoring
 * opens a new eligibility interval at the current epoch. Previously accrued
 * entitlements remain claimable after eligibility is restored.
 */
export function setIdentityStatus(state, { personId, active, suspended }) {
  const identity = state.identities.get(personId);
  if (!identity) throw new Error('unknown identity');

  const wasEligibleNow = currentIdentityEligible(identity, state.epoch);
  const nextActive = active ?? identity.active;
  const nextSuspended = suspended ?? identity.suspended;
  const willBeEligibleNow = Boolean(nextActive && !nextSuspended);

  if (wasEligibleNow && !willBeEligibleNow) {
    closeOpenEligibilityInterval(identity, state.epoch - 1);
  } else if (!wasEligibleNow && willBeEligibleNow) {
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
 * Offline access never destroys an earned entitlement. Historical entitlements
 * are demurred exactly as if claimed when earned, preventing late-claim
 * arbitrage while preserving equal treatment for people with intermittent
 * connectivity.
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
  const value = BigInt(amount);
  if (value < 0n) throw new RangeError('budget cannot be negative');
  const target = kind === 'contribution' ? state.contributionBudgets : kind === 'regenerative' ? state.regenerativeBudgets : null;
  if (!target) throw new Error('unsupported budget kind');
  target.set(`${epoch}:${programId}`, value);
  state.events.push({ type: 'BUDGET_CONFIGURED', kind, epoch, programId, amount: value.toString() });
}

export function mintBudgeted(state, { kind, programId, recipientId, amount, evidenceAccepted, evidenceId }) {
  if (!isEligible(state, recipientId)) throw new Error('recipient is not an eligible identity');
  if (!evidenceId) throw new TypeError('evidenceId is required');
  const target = kind === 'contribution' ? state.contributionBudgets : kind === 'regenerative' ? state.regenerativeBudgets : null;
  if (!target) throw new Error('unsupported budget kind');
  const key = `${state.epoch}:${programId}`;
  const remainingBudget = target.get(key) ?? 0n;
  const requested = BigInt(amount);
  const minted = calculateBudgetedIssuance({ requested, remainingBudget, evidenceAccepted });
  if (minted === 0n) return 0n;
  target.set(key, remainingBudget - minted);
  state.balances.set(recipientId, (state.balances.get(recipientId) ?? 0n) + minted);
  state.totalIssued += minted;
  state.events.push({ type: 'BUDGETED_ISSUANCE', kind, epoch: state.epoch, programId, recipientId, amount: minted.toString(), evidenceId });
  return minted;
}

export function transferBetween(state, { fromId, toId, amount }) {
  if (!state.identities.has(fromId) || !state.identities.has(toId)) throw new Error('unknown identity');
  const result = transfer({
    fromBalance: state.balances.get(fromId) ?? 0n,
    toBalance: state.balances.get(toId) ?? 0n,
    amount: BigInt(amount),
  });
  state.balances.set(fromId, result.fromBalance);
  state.balances.set(toId, result.toBalance);
  state.events.push({ type: 'TRANSFER', epoch: state.epoch, fromId, toId, amount: BigInt(amount).toString() });
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
  settleDemurrage(state);
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
