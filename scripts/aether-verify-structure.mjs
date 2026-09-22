#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
let failures = 0;

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function ok(message) {
  console.log(`GREEN ${message}`);
}

function warn(message) {
  console.warn(`AMBER ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`RED ${message}`);
}

function checkFile(relativePath) {
  if (exists(relativePath)) ok(`${relativePath} present`);
  else fail(`${relativePath} missing`);
}

function checkDirectory(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) ok(`${relativePath} directory present`);
  else fail(`${relativePath} directory missing`);
}

function checkPackageScripts(packageJson) {
  const requiredScripts = [
    'test',
    'lint',
    'qa:local',
    'verify:structure',
    'protocol:test',
    'protocol:verify',
    'protocol:simulate',
    'build',
    'check',
    'security:audit',
    'security:deps',
    'security:api-keys',
  ];

  const scripts = packageJson.scripts || {};
  for (const script of requiredScripts) {
    if (scripts[script]) ok(`package script present: ${script}`);
    else fail(`package script missing: ${script}`);
  }
}

function checkPackageLock(packageJson) {
  if (!exists('package-lock.json')) {
    warn('package-lock.json is absent; dependency-free protocol QA can run, but application dependency reproduction requires regenerating and reviewing a lockfile');
    return;
  }

  try {
    const lock = readJson('package-lock.json');
    const rootPackage = lock.packages?.[''] || {};
    if (rootPackage.name === packageJson.name) ok('package-lock root name matches package.json');
    else fail(`package-lock root name mismatch: ${rootPackage.name || 'missing'} != ${packageJson.name}`);
  } catch (error) {
    fail(`package-lock.json is invalid JSON: ${error.message}`);
  }
}

function checkHookIsEsm() {
  const hookPath = 'scripts/pre-commit-hook.js';
  if (!exists(hookPath)) {
    fail(`${hookPath} missing`);
    return;
  }

  const hook = readText(hookPath);
  if (/require\(/.test(hook)) fail(`${hookPath} must not use CommonJS require under type: module`);
  else ok(`${hookPath} is ESM-compatible`);
}

function main() {
  console.log('AETHERION BIOZOECURRENCY STRUCTURE CHECK');

  const requiredFiles = [
    'README.md',
    'AGENTS.md',
    'WHITEPAPER.md',
    'FLIGHTPAPER.md',
    'PHILOSOPHY.md',
    'MONETARY-CONSTITUTION.md',
    'HUMAN-RIGHTS-AND-SAFEGUARDS.md',
    'COMPUTER-DESIGN.md',
    'GENESIS.md',
    'SECURITY.md',
    'API-SECURITY-GUIDELINES.md',
    'STRUCTURE.md',
    'QUANTUM-SECURITY.md',
    'package.json',
    '.env.example',
    'docs/status.md',
    'docs/validation.md',
    'docs/security-and-privacy.md',
    'docs/aetherion-threat-model.md',
    'docs/consensus-and-governance.md',
    'docs/external-anchoring.md',
    'docs/circulation-and-exchange.md',
    'docs/regulatory-launch-gate.md',
    'scripts/aether-verify-structure.mjs',
    'scripts/verify-biozoe-protocol.mjs',
    'scripts/security-audit.js',
    'scripts/pre-commit-hook.js',
    'protocol/README.md',
    'protocol/genesis.seed.json',
    'protocol/protocol.manifest.json',
    'protocol/reference/biozoe-policy.mjs',
    'protocol/reference/biozoe-policy.test.mjs',
    'protocol/reference/aetherion-state-machine.mjs',
    'protocol/reference/aetherion-state-machine.test.mjs',
    'protocol/reference/circulation-exchange.test.mjs',
    'protocol/simulation/biozoe-sim.mjs',
    'apps/dynastylink-local/README.md',
    'apps/dynastylink-local/docs/security/privacy-security-checklist.md',
    'apps/dynastylink-local/docs/architecture/no-external-api-architecture.md',
    'apps/dynastylink-local/docs/compliance/legal-disclaimer.md',
    'quantum-validator/package.json',
    'api-gateway/package.json',
  ];

  for (const file of requiredFiles) checkFile(file);

  const requiredDirectories = ['client', 'server', 'shared', 'scripts', 'docs', 'protocol', 'protocol/reference', 'protocol/simulation', 'apps/dynastylink-local'];
  for (const directory of requiredDirectories) checkDirectory(directory);

  let packageJson;
  try {
    packageJson = readJson('package.json');
    ok('package.json parses as JSON');
  } catch (error) {
    fail(`package.json is invalid JSON: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (packageJson.type === 'module') ok('package.json uses type: module');
  else fail('package.json should declare type: module for current scripts');

  checkPackageScripts(packageJson);
  checkPackageLock(packageJson);
  checkHookIsEsm();

  if (failures > 0) {
    console.error(`RED Structure check failed with ${failures} issue(s).`);
    process.exitCode = 1;
    return;
  }

  ok('Aetherion structure check passed.');
}

main();
