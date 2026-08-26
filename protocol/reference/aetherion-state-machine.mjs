import {
  applyDemurrage,
  calculateBudgetedIssuance,
  calculateUniversalIssuance,
  transfer,
} from './biozoe-policy.mjs';

function cloneMap(map) {
  return new Map(map.entries());
}

export function createState({ epoch = 0, config }) {
  if (!config) throw new TypeError('config is required');
  return {
    epoch,
    config,
    identities: new Map(),
    balances: new Map(),
    claimedUniversalEpoch: new Map(),
    contributionBudgets: new Map(),
    regenerativeBudgets: new Map(),
    totalIssued: 0n,
    totalRetired: 0n,
    events: [],
  };
}

export function registerIdentity(state, { personId, attestationId, eligibleFromEpoch = state.epoch }) {
  if (!personId || !attestationId) throw new TypeError('personId and attestationId are required');
  if (state.identities.has(personId)) throw new Error('identity already registered');
  state.identities.set(personId, {
    personId,
    attestationId,
    eligibleFromEpoch,
    active: true,
    suspended: false,
  });
  if (!state.balances.has(personId)) state.balances.set(personId, 0n);
  state.events.push({ type: 'IDENTITY_REGISTERED', epoch: state.epoch, personId, attestationId });
}

export function setIdentityStatus(state, { personId, active, suspended }) {
  const identity = state.identities.get(personId);
  if (!identity) throw new Error('unknown identity');
  identity.active = active ?? identity.active;
  identity.suspended = suspended ?? identity.suspended;
  state.events.push({ type: 'IDENTITY_STATUS_CHANGED', epoch: state.epoch, personId, active: identity.active, suspended: identity.suspended });
}

export function isEligible(state, personId) {
  const identity = state.identities.get(personId);
  return Boolean(identity && identity.active && !identity.suspended && state.epoch >= identity.eligibleFromEpoch);
}

export function claimUniversal(state, personId) {
  const lastClaimed = state.claimedUniversalEpoch.get(personId);
  const amount = calculateUniversalIssuance({
    eligible: isEligible(state, personId),
    alreadyClaimed: lastClaimed === state.epoch,
    amountPerEpoch: BigInt(state.config.universalIssuancePerEpoch),
  });
  if (amount === 0n) return 0n;
  const current = state.balances.get(personId) ?? 0n;
  state.balances.set(personId, current + amount);
  state.claimedUniversalEpoch.set(personId, state.epoch);
  state.totalIssued += amount;
  state.events.push({ type: 'UNIVERSAL_ISSUANCE', epoch: state.epoch, personId, amount: amount.toString() });
  return amount;
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
