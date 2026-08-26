#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`RED ${message}`);
}

function ok(message) {
  console.log(`GREEN ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

function expect(condition, message) {
  if (condition) ok(message);
  else fail(message);
}

const requiredDocs = [
  'WHITEPAPER.md',
  'FLIGHTPAPER.md',
  'PHILOSOPHY.md',
  'MONETARY-CONSTITUTION.md',
  'HUMAN-RIGHTS-AND-SAFEGUARDS.md',
  'COMPUTER-DESIGN.md',
  'GENESIS.md',
  'protocol/README.md',
  'protocol/genesis.seed.json',
  'protocol/protocol.manifest.json',
  'protocol/reference/biozoe-policy.mjs',
  'protocol/reference/biozoe-policy.test.mjs',
  'protocol/reference/aetherion-state-machine.mjs',
  'protocol/reference/aetherion-state-machine.test.mjs',
  'protocol/simulation/biozoe-sim.mjs',
  'docs/aetherion-threat-model.md',
  'docs/consensus-and-governance.md',
  'docs/external-anchoring.md',
];

console.log('AETHERION BIOZOE CONSTITUTION CHECK');

for (const file of requiredDocs) {
  expect(fs.existsSync(path.join(root, file)), `${file} present`);
}

let seed;
let manifest;
try {
  seed = json('protocol/genesis.seed.json');
  ok('genesis seed parses as JSON');
} catch (error) {
  fail(`genesis seed invalid: ${error.message}`);
}

try {
  manifest = json('protocol/protocol.manifest.json');
  ok('protocol manifest parses as JSON');
} catch (error) {
  fail(`protocol manifest invalid: ${error.message}`);
}

if (seed) {
  expect(seed.network?.chain_id === 'aetherion-1', 'canonical design chain id is aetherion-1');
  expect(seed.genesis?.premine === '0', 'genesis premine is zero');
  expect(seed.genesis?.founder_allocation === '0', 'founder allocation is zero');
  expect(seed.genesis?.investor_allocation === '0', 'investor allocation is zero');
  expect(seed.genesis?.team_allocation === '0', 'team allocation is zero');
  expect(seed.genesis?.treasury_allocation === '0', 'genesis treasury allocation is zero');
  expect(Array.isArray(seed.genesis?.initial_balances) && seed.genesis.initial_balances.length === 0, 'genesis contains no initial balances');
  expect(seed.network?.native_asset?.terminal_supply_cap === null, 'native asset has no terminal supply cap');
  expect(seed.monetary_policy?.terminal_supply_cap === null, 'monetary policy has no terminal supply cap');
  expect(seed.monetary_policy?.universal_entitlement_accrues_without_connectivity === true, 'offline eligible epochs retain universal entitlement');
  expect(seed.monetary_policy?.delayed_entitlement_uses_historical_demurrage === true, 'delayed universal entitlement uses historical demurrage');
  expect(seed.monetary_policy?.budgeted_evidence_replay_allowed === false, 'budgeted evidence replay is forbidden');
  expect(seed.monetary_policy?.spent_budget_reset_allowed === false, 'spent budget reset is forbidden');
  expect(seed.identity?.suspension_erases_previously_earned_entitlements === false, 'suspension does not erase prior earned entitlements');
  expect(seed.governance?.token_weighted === false, 'governance is not token weighted');
  expect(seed.governance?.balance_confers_governance_power === false, 'balance confers no governance power');
  expect(seed.governance?.balance_confers_validator_power === false, 'balance confers no validator power');
  expect(seed.consensus?.token_weighted === false, 'consensus is not token weighted');
  expect(seed.consensus?.validator_voting_power_model === 'equal-unit-per-authorized-validator', 'validator voting power is equal-unit authorization based');
  expect(seed.resource_control?.economic_asset_is_not_spam_budget === true, 'ATC is separated from anti-spam resource accounting');
  expect(seed.resource_control?.nontransferable_compute_credits?.tradable === false, 'Pulse is non-transferable');
  expect(seed.resource_control?.nontransferable_compute_credits?.governance_power === false, 'Pulse confers no governance power');
  expect(seed.anchoring?.bitcoin_required_for_liveness === false, 'Bitcoin is not required for Aetherion liveness');
  expect(seed.claims?.sacred_or_spiritual_language_is_consensus_input === false, 'spiritual language is not consensus input');
  expect(seed.claims?.random_or_symbolic_metrics_are_economic_or_security_evidence === false, 'symbolic/random metrics are not economic or security evidence');
  expect(seed.claims?.mainnet_is_live === false, 'seed does not falsely claim mainnet is live');
  expect(seed.claims?.cryptography_is_audited === false, 'seed does not falsely claim audited cryptography');
}

if (seed && manifest) {
  const invariants = new Set(manifest.protected_invariants ?? []);
  expect(manifest.native_asset?.symbol === seed.network?.native_asset?.symbol, 'manifest and seed agree on ATC symbol');
  expect(manifest.native_asset?.base_denom === seed.network?.native_asset?.base_denom, 'manifest and seed agree on base denomination');
  expect(manifest.native_asset?.display_exponent === seed.network?.native_asset?.display_exponent, 'manifest and seed agree on display exponent');
  expect(manifest.native_asset?.terminal_supply_cap === null, 'manifest preserves no-terminal-cap invariant');
  expect(invariants.has('OFFLINE_ELIGIBLE_EPOCHS_RETAIN_BASELINE_ENTITLEMENT'), 'manifest protects offline baseline accrual');
  expect(invariants.has('DELAYED_ENTITLEMENT_USES_HISTORICAL_DEMURRAGE'), 'manifest protects equal demurrage treatment of delayed settlement');
  expect(invariants.has('NO_EVIDENCE_REPLAY_MINT'), 'manifest forbids evidence replay minting');
  expect(invariants.has('NO_SPENT_BUDGET_RESET_MINT'), 'manifest forbids silent budget reset minting');
  expect(manifest.consensus_target?.wealth_weighted === false, 'manifest rejects wealth-weighted consensus');
  expect(manifest.resource_accounting?.transferable === false, 'manifest keeps Pulse non-transferable');
  expect(manifest.external_anchor?.required_for_liveness === false, 'manifest keeps external anchor optional');
}

for (const relativePath of [
  'protocol/reference/biozoe-policy.mjs',
  'protocol/reference/aetherion-state-machine.mjs',
]) {
  if (!fs.existsSync(path.join(root, relativePath))) continue;
  const content = read(relativePath);
  expect(!content.includes('Math.random'), `${relativePath} contains no Math.random consensus input`);
  expect(!content.includes('Number('), `${relativePath} does not coerce monetary balances through Number()`);
  expect(!content.includes('Date.now'), `${relativePath} contains no local wall-clock consensus input`);
}

const stateMachine = fs.existsSync(path.join(root, 'protocol/reference/aetherion-state-machine.mjs'))
  ? read('protocol/reference/aetherion-state-machine.mjs')
  : '';
expect(stateMachine.includes('usedEvidenceIds'), 'reference state machine tracks used evidence receipts');
expect(stateMachine.includes('stewardshipBudgets'), 'reference state machine implements stewardship budgets');
expect(stateMachine.includes('claimedUniversalThroughEpoch'), 'reference state machine settles accrued universal rights');

const constitution = fs.existsSync(path.join(root, 'MONETARY-CONSTITUTION.md')) ? read('MONETARY-CONSTITUTION.md') : '';
expect(constitution.includes('No premine'), 'monetary constitution protects no-premine rule');
expect(constitution.includes('No terminal supply cap'), 'monetary constitution protects unbounded issuance possibility');
expect(constitution.includes('No token-weighted constitutional power'), 'monetary constitution rejects wealth-purchased constitutional power');
expect(constitution.includes('Human worth is not a score'), 'monetary constitution separates dignity from contribution scoring');
expect(constitution.includes('device ownership, or network connectivity'), 'monetary constitution protects baseline rights from connectivity inequality');

const rights = fs.existsSync(path.join(root, 'HUMAN-RIGHTS-AND-SAFEGUARDS.md')) ? read('HUMAN-RIGHTS-AND-SAFEGUARDS.md') : '';
expect(rights.includes('No universal social-credit score'), 'rights layer rejects universal social-credit scoring');
expect(rights.includes('No forced biometrics'), 'rights layer rejects forced biometrics');
expect(rights.includes('Right to intermittent connectivity'), 'rights layer protects intermittent connectivity');
expect(rights.includes('Freedom of conscience'), 'rights layer protects freedom of conscience');
expect(rights.includes('AI cannot own consent'), 'rights layer prevents AI from owning human consent');

if (failures > 0) {
  console.error(`RED Biozoe protocol verification failed with ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  ok('Biozoe constitutional verification passed.');
}
