import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('audit findings do not echo possible credential values', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'aetherion-audit-'));
  try {
    for (const dir of ['scripts', 'app', 'bin']) mkdirSync(path.join(tmp, dir));
    writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}\n');
    copyFileSync(path.join(root, 'scripts/security-audit.js'), path.join(tmp, 'scripts/security-audit.js'));
    writeFileSync(path.join(tmp, 'app/secret.js'), 'const api_key = "SYNTHETIC_KEY_1234567890";\n');
    writeFileSync(path.join(tmp, 'bin/npm'), '#!/bin/sh\necho "{}"\n', { mode: 0o755 });
    const result = spawnSync(process.execPath, [path.join(tmp, 'scripts/security-audit.js')], {
      cwd: tmp, encoding: 'utf8', timeout: 15000,
      env: { ...process.env, PATH: path.join(tmp, 'bin') + path.delimiter + (process.env.PATH || '') },
    });
    assert.equal(result.error, undefined, result.error?.message);
    assert.equal(result.status, 0, result.stderr);
    const output = result.stdout + '\n' + result.stderr;
    assert.match(output, /Hardcoded API Keys/);
    assert.match(output, /app[/\\]secret\.js/);
    assert.doesNotMatch(output, /SYNTHETIC_KEY_1234567890/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
