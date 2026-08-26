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
  'COMPUTER-DESIGN.md',
  'GENESIS.md',
  'protocol/genesis.seed.json',
  'protocol/reference/biozoe-policy.mjs',
  'protocol/reference/biozoe-policy.test.mjs',
  'protocol/reference/aetherion-state-machine.mjs',
  'protocol/reference/aetherion-state-machine.test.mjs',
];

console.log('AETHERION BIOZOE CONSTITUTION CHECK');

for (const file of requiredDocs) {
  expect(fs.existsSync(path.join(root, file)), `${file} present`);
}

let seed;
try {
  seed = json('protocol/genesis.seed.json');
  ok('genesis seed parses as JSON');
} catch (error) {
  fail(`genesis seed invalid: ${error.message}`);
}

if (seed) {
  expect(seed.genesis?.premine === '0', 'genesis premine is zero');
  expect(seed.genesis?.founder_allocation === '0', 'founder allocation is zero');
  expect(seed.genesis?.investor_allocation === '0', 'investor allocation is zero');
  expect(seed.genesis?.team_allocation === '0', 'team allocation is zero');
  expect(seed.genesis?.treasury_allocation === '0', 'genesis treasury allocation is zero');
  expect(Array.isArray(seed.genesis?.initial_balances) && seed.genesis.initial_balances.length === 0, 'genesis contains no initial balances');
  expect(seed.network?.native_asset?.terminal_supply_cap === null, 'native asset has no terminal supply cap');
  expect(seed.monetary_policy?.terminal_supply_cap === null, 'monetary policy has no terminal supply cap');
  expect(seed.governance?.token_weighted === false, 'governance is not token weighted');
  expect(seed.governance?.balance_confers_governance_power === false, 'balance confers no governance power');
  expect(seed.governance?.balance_confers_validator_power === false, 'balance confers no validator power');
  expect(seed.consensus?.token_weighted === false, 'consensus is not token weighted');
  expect(seed.consensus?.validator_voting_power_model === 'equal-unit-per-authorized-validator', 'validator voting power is equal-unit authorization based');
  expect(seed.resource_control?.economic_asset_is_not_spam_budget === true, 'ATC is separated from anti-spam resource accounting');
  expect(seed.resource_control?.nontransferable_compute_credits?.tradable === false, 'Pulse is non-transferable');
  expect(seed.claims?.sacred_or_spiritual_language_is_consensus_input === false, 'spiritual language is not consensus input');
  expect(seed.claims?.random_or_symbolic_metrics_are_economic_or_security_evidence === false, 'symbolic/random metrics are not economic or security evidence');
  expect(seed.claims?.mainnet_is_live === false, 'seed does not falsely claim mainnet is live');
}

for (const relativePath of [
  'protocol/reference/biozoe-policy.mjs',
  'protocol/reference/aetherion-state-machine.mjs',
]) {
  if (!fs.existsSync(path.join(root, relativePath))) continue;
  const content = read(relativePath);
  expect(!content.includes('Math.random'), `${relativePath} contains no Math.random consensus input`);
  expect(!content.includes('Number('), `${relativePath} does not coerce monetary balances through Number()`);
}

const constitution = fs.existsSync(path.join(root, 'MONETARY-CONSTITUTION.md')) ? read('MONETARY-CONSTITUTION.md') : '';
expect(constitution.includes('No premine'), 'monetary constitution protects no-premine rule');
expect(constitution.includes('No terminal supply cap'), 'monetary constitution protects unbounded issuance possibility');
expect(constitution.includes('No token-weighted constitutional power'), 'monetary constitution rejects wealth-purchased constitutional power');

if (failures > 0) {
  console.error(`RED Biozoe protocol verification failed with ${failures} issue(s).`);
  process.exitCode = 1;
} else {
  ok('Biozoe constitutional verification passed.');
}
