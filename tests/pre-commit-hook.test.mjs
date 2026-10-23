import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const hook = path.resolve('scripts/pre-commit-hook.js');
const syntheticKey = 'sk-' + 'SYNTHETIC'.repeat(4);

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}
function scan(cwd, ...args) {
  return spawnSync(process.execPath, [hook, ...args], { cwd, encoding: 'utf8' });
}
function fixture(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aift-index-scan-'));
  try {
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.email', 'test@example.invalid');
    git(dir, 'config', 'user.name', 'Fixture');
    fs.writeFileSync(path.join(dir, 'sample.js'), 'export const ok = true;\n');
    git(dir, 'add', 'sample.js');
    git(dir, 'commit', '-qm', 'safe baseline');
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('default pre-commit mode still accepts a clean index', () => fixture(dir => {
  assert.equal(scan(dir).status, 0);
}));

test('tracked QA mode detects a committed synthetic key even when staging is empty', () => fixture(dir => {
  fs.writeFileSync(path.join(dir, 'sample.js'), `const token = '${syntheticKey}';\n`);
  git(dir, 'add', 'sample.js');
  git(dir, 'commit', '-qm', 'synthetic test fixture');
  assert.equal(scan(dir).status, 0, 'staged mode has no staged files');
  const result = scan(dir, '--tracked');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /sample\.js:1/);
  assert.doesNotMatch(result.stderr, /SYNTHETIC/);
}));

test('both modes reject a newly staged synthetic key', () => fixture(dir => {
  fs.writeFileSync(path.join(dir, 'sample.js'), `const token = '${syntheticKey}';\n`);
  git(dir, 'add', 'sample.js');
  assert.equal(scan(dir).status, 1);
  assert.equal(scan(dir, '--tracked').status, 1);
}));

test('tracked mode ignores untracked working-tree files', () => fixture(dir => {
  fs.writeFileSync(path.join(dir, 'untracked.js'), `const token = '${syntheticKey}';\n`);
  assert.equal(scan(dir, '--tracked').status, 0);
}));

test('unknown scanner options fail closed', () => fixture(dir => {
  const result = scan(dir, '--unknown');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage:/);
}));

test('tracked QA mode skips Git submodule pointers, which have no file blob', () => fixture(dir => {
  const head = git(dir, 'rev-parse', 'HEAD').trim();
  git(dir, 'update-index', '--add', '--cacheinfo', `160000,${head},nested-submodule`);
  const result = scan(dir, '--tracked');
  assert.equal(result.status, 0, result.stderr);
}));

test('tracked QA mode avoids generic long-identifier false positives', () => fixture(dir => {
  fs.writeFileSync(path.join(dir, 'sample.js'), 'const identifier = "' + 'a'.repeat(40) + '";\\n');
  git(dir, 'add', 'sample.js');
  assert.equal(scan(dir).status, 1, 'staged scanner retains broader patterns');
  assert.equal(scan(dir, '--tracked').status, 0, 'tracked scanner uses high-confidence patterns');
}));
