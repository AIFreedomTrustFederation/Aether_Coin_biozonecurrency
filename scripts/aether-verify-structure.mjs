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
    fail('package-lock.json missing');
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
  console.log('AETHER COIN BIOZOECURRENCY STRUCTURE CHECK');

  const requiredFiles = [
    'README.md',
    'AGENTS.md',
    'SECURITY.md',
    'API-SECURITY-GUIDELINES.md',
    'STRUCTURE.md',
    'QUANTUM-SECURITY.md',
    'package.json',
    'package-lock.json',
    '.env.example',
    'docs/status.md',
    'docs/validation.md',
    'docs/security-and-privacy.md',
    'scripts/security-audit.js',
    'scripts/pre-commit-hook.js',
    'apps/dynastylink-local/README.md',
    'apps/dynastylink-local/docs/security/privacy-security-checklist.md',
    'apps/dynastylink-local/docs/architecture/no-external-api-architecture.md',
    'apps/dynastylink-local/docs/compliance/legal-disclaimer.md',
    'quantum-validator/package.json',
    'api-gateway/package.json',
  ];

  for (const file of requiredFiles) checkFile(file);

  const requiredDirectories = ['client', 'server', 'shared', 'scripts', 'docs', 'apps/dynastylink-local'];
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

  ok('Aether structure check passed.');
}

main();
