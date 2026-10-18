import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const sourceScript = fileURLToPath(new URL('../scripts/security-audit.js', import.meta.url));
function runAudit({ stdout, code = 0 }) {
  const dir = mkdtempSync(join(tmpdir(), 'aether-deps-'));
  try {
    mkdirSync(join(dir, 'scripts'));
    mkdirSync(join(dir, 'bin'));
    writeFileSync(join(dir, 'package.json'), '{"type":"module"}\n');
    copyFileSync(sourceScript, join(dir, 'scripts/security-audit.js'));
    writeFileSync(join(dir, 'bin/npm'), '#!/bin/sh\ncat <<\'AUDIT_JSON\'\n' + stdout + '\nAUDIT_JSON\nexit ' + code + '\n', { mode: 0o755 });
    return spawnSync(process.execPath, [join(dir, 'scripts/security-audit.js')], {
      encoding: 'utf8',
      env: { ...process.env, PATH: join(dir, 'bin') + ':' + process.env.PATH },
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('reports vulnerabilities when npm audit exits 1', () => {
  const result = runAudit({
    code: 1,
    stdout: JSON.stringify({
      metadata: { vulnerabilities: { total: 1, high: 1 } },
      vulnerabilities: { 'fixture-dependency': { severity: 'high', via: [{ title: 'Fixture advisory', url: 'https://example.invalid/advisory' }] } },
    }),
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Found 1 vulnerable dependency package/);
  assert.match(result.stdout, /fixture-dependency: high severity/);
  assert.match(result.stdout, /Fixture advisory/);
});

test('reports a clean dependency audit accurately', () => {
  const result = runAudit({ stdout: JSON.stringify({ metadata: { vulnerabilities: { total: 0 } }, vulnerabilities: {} }) });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No vulnerabilities found in dependencies/);
});

test('does not report malformed audit JSON as clean', () => {
  const result = runAudit({ stdout: 'invalid-json', code: 1 });
  assert.match(result.stderr, /invalid JSON/);
  assert.doesNotMatch(result.stdout, /No vulnerabilities found in dependencies/);
});

test('does not report a failed npm audit as clean', () => {
  const result = runAudit({ stdout: 'unavailable', code: 2 });
  assert.match(result.stderr, /could not complete/);
  assert.doesNotMatch(result.stdout, /No vulnerabilities found in dependencies/);
});
