const PPM = 1_000_000n;
const PPM_NUMBER = 1_000_000;

export function assertNonNegative(value, name = 'value') {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new TypeError(`${name} must be a non-negative bigint`);
  }
}

function assertEpoch(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
  }
}

function assertPpm(value, name, { allowOne = false } = {}) {
  const upper = allowOne ? PPM_NUMBER : PPM_NUMBER - 1;
  if (!Number.isInteger(value) || value < 0 || value > upper) {
    throw new RangeError(`${name} must be an integer in [0, ${upper}]`);
  }
}

function assertBps(value, name) {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new RangeError(`${name} must be an integer in [0, 10000]`);
  }
}

export function integerSqrt(value) {
  assertNonNegative(value, 'value');
  if (value < 2n) return value;

  let x0 = value;
  let x1 = (x0 + 1n) >> 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x1 + value / x1) >> 1n;
  }
  return x0;
}

export function applyDemurrage(balance, ppmPerEpoch) {
  assertNonNegative(balance, 'balance');
  assertPpm(ppmPerEpoch, 'ppmPerEpoch');
  const retained = PPM - BigInt(ppmPerEpoch);
  return (balance * retained) / PPM;
}

export function calculateUniversalIssuance({
  eligible,
  alreadyClaimed,
  amountPerEpoch,
}) {
  assertNonNegative(amountPerEpoch, 'amountPerEpoch');
  if (!eligible || alreadyClaimed) return 0n;
  return amountPerEpoch;
}

/**
 * Settle baseline issuance that accrued across one or more historical epochs.
 * Each eligible epoch creates exactly one entitlement. Offline access never
 * destroys an earned entitlement, while historical demurrage prevents delayed
 * settlement from becoming a privileged savings strategy.
 */
export function calculateAccruedUniversalIssuance({
  fromEpoch,
  throughEpoch,
  amountPerEpoch,
  demurragePpmPerEpoch,
  eligibleAtEpoch,
}) {
  assertEpoch(fromEpoch, 'fromEpoch');
  assertEpoch(throughEpoch, 'throughEpoch');
  assertNonNegative(amountPerEpoch, 'amountPerEpoch');
  if (typeof eligibleAtEpoch !== 'function') {
    throw new TypeError('eligibleAtEpoch must be a function');
  }
  assertPpm(demurragePpmPerEpoch, 'demurragePpmPerEpoch');
  if (fromEpoch > throughEpoch) {
    return { gross: 0n, net: 0n, retired: 0n, eligibleEpochs: 0 };
  }

  let gross = 0n;
  let net = 0n;
  let eligibleEpochs = 0;

  for (let epoch = fromEpoch; epoch <= throughEpoch; epoch += 1) {
    if (eligibleAtEpoch(epoch)) {
      gross += amountPerEpoch;
      net += amountPerEpoch;
      eligibleEpochs += 1;
    }

    if (epoch < throughEpoch) {
      net = applyDemurrage(net, demurragePpmPerEpoch);
    }
  }

  return {
    gross,
    net,
    retired: gross - net,
    eligibleEpochs,
  };
}

export function calculateBudgetedIssuance({
  requested,
  remainingBudget,
  evidenceAccepted,
}) {
  assertNonNegative(requested, 'requested');
  assertNonNegative(remainingBudget, 'remainingBudget');
  if (!evidenceAccepted) return 0n;
  if (requested > remainingBudget) {
    throw new RangeError('requested issuance exceeds governed epoch budget');
  }
  return requested;
}

/**
 * Circulation reward weight uses integer square root, creating diminishing
 * returns with transaction value. Splitting the same net flow across genuinely
 * independent counterparties can increase weight, so economic breadth matters,
 * while raw transaction count alone never creates reward.
 */
export function calculateCirculationPairScore({ netAmount, roleWeightBps }) {
  assertNonNegative(netAmount, 'netAmount');
  assertBps(roleWeightBps, 'roleWeightBps');
  if (netAmount === 0n || roleWeightBps === 0) return 0n;
  return integerSqrt(netAmount) * BigInt(roleWeightBps);
}

export function calculateCappedProRataReward({ budget, weight, totalWeight, cap }) {
  assertNonNegative(budget, 'budget');
  assertNonNegative(weight, 'weight');
  assertNonNegative(totalWeight, 'totalWeight');
  assertNonNegative(cap, 'cap');
  if (budget === 0n || weight === 0n || totalWeight === 0n) return 0n;
  const raw = (budget * weight) / totalWeight;
  return raw > cap ? cap : raw;
}

/**
 * Canonical outbound conversion friction may mature gradually with network age.
 * This function changes the official conversion spread, never the market or
 * reference price itself.
 */
export function calculateMaturityExitFriction({
  epoch,
  startEpoch = 0,
  startPpm,
  maturePpm,
  rampEpochs,
}) {
  assertEpoch(epoch, 'epoch');
  assertEpoch(startEpoch, 'startEpoch');
  assertEpoch(rampEpochs, 'rampEpochs');
  assertPpm(startPpm, 'startPpm');
  assertPpm(maturePpm, 'maturePpm');
  if (maturePpm < startPpm) throw new RangeError('maturePpm must be >= startPpm');
  if (epoch <= startEpoch || rampEpochs === 0) return rampEpochs === 0 ? maturePpm : startPpm;

  const elapsed = Math.min(epoch - startEpoch, rampEpochs);
  const span = maturePpm - startPpm;
  return startPpm + Math.floor((span * elapsed) / rampEpochs);
}

export function calculateDelayDiscountPpm({
  delayEpochs,
  discountPpmPerEpoch,
  maxDiscountPpm,
}) {
  assertEpoch(delayEpochs, 'delayEpochs');
  assertPpm(discountPpmPerEpoch, 'discountPpmPerEpoch', { allowOne: true });
  assertPpm(maxDiscountPpm, 'maxDiscountPpm', { allowOne: true });
  return Math.min(maxDiscountPpm, delayEpochs * discountPpmPerEpoch);
}

/**
 * Quote canonical ATC -> external-asset redemption. `referenceValue` is the
 * external smallest-unit value of the surrendered ATC before conversion
 * friction. The reference value remains intact in the return object; only net
 * proceeds change. This distinction prevents an exit spread from being falsely
 * represented as the market value of ATC.
 */
export function calculateCanonicalExitQuote({
  referenceValue,
  maturityFrictionPpm,
  stressFrictionPpm = 0,
  delayDiscountPpm = 0,
  hardCapPpm,
  minimumFrictionPpm = 0,
}) {
  assertNonNegative(referenceValue, 'referenceValue');
  assertPpm(maturityFrictionPpm, 'maturityFrictionPpm');
  assertPpm(stressFrictionPpm, 'stressFrictionPpm');
  assertPpm(delayDiscountPpm, 'delayDiscountPpm', { allowOne: true });
  assertPpm(hardCapPpm, 'hardCapPpm');
  assertPpm(minimumFrictionPpm, 'minimumFrictionPpm');
  if (minimumFrictionPpm > hardCapPpm) throw new RangeError('minimumFrictionPpm exceeds hardCapPpm');

  const grossFriction = maturityFrictionPpm + stressFrictionPpm;
  const discounted = Math.max(minimumFrictionPpm, grossFriction - delayDiscountPpm);
  const appliedFrictionPpm = Math.min(hardCapPpm, discounted);
  const netProceeds = (referenceValue * (PPM - BigInt(appliedFrictionPpm))) / PPM;

  return {
    referenceValue,
    appliedFrictionPpm,
    netProceeds,
    reserveRetention: referenceValue - netProceeds,
  };
}

export function humanGovernanceWeight({ verified, suspended = false }) {
  return verified && !suspended ? 1n : 0n;
}

export function validatorVotingPower({ authorized, active = true }) {
  return authorized && active ? 1n : 0n;
}

export function transfer({ fromBalance, toBalance, amount }) {
  assertNonNegative(fromBalance, 'fromBalance');
  assertNonNegative(toBalance, 'toBalance');
  assertNonNegative(amount, 'amount');
  if (amount > fromBalance) throw new RangeError('insufficient balance');
  return {
    fromBalance: fromBalance - amount,
    toBalance: toBalance + amount,
  };
}

export function passiveEquilibriumApprox({ issuancePerEpoch, demurragePpmPerEpoch }) {
  assertNonNegative(issuancePerEpoch, 'issuancePerEpoch');
  if (!Number.isInteger(demurragePpmPerEpoch) || demurragePpmPerEpoch <= 0) {
    return null;
  }
  return (issuancePerEpoch * PPM) / BigInt(demurragePpmPerEpoch);
}

export const BIOZOE_INVARIANTS = Object.freeze({
  terminalSupplyCap: null,
  premine: 0n,
  founderAllocation: 0n,
  investorAllocation: 0n,
  tokenWeightedGovernance: false,
  tokenWeightedConsensus: false,
  balanceConfersValidatorPower: false,
  earlyBalanceConfersExtraBaselineIssuance: false,
  connectivityRequiredToPreserveBaselineEntitlement: false,
  rawTransactionCountCreatesCirculationIssuance: false,
  circulationIssuanceHasEpochBudget: true,
  ordinaryTransferHasExitFriction: false,
  canonicalExitRequiresHardFrictionCap: true,
  canonicalExitRewritesReferencePrice: false,
  guaranteedAppreciation: false,
});
