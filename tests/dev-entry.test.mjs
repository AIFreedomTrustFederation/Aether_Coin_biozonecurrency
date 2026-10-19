import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

// The previous script pointed at combined-server.js, which does not exist.
test('dev uses a declared, local-only Vite frontend entry', () => {
  assert.equal(packageJson.scripts.dev, 'vite --host 127.0.0.1');
  assert.ok(packageJson.devDependencies?.vite, 'Vite must be a direct dev dependency');
});

test('Vite is configured to serve the client directory', () => {
  const config = readFileSync(path.join(repoRoot, 'vite.config.ts'), 'utf8');
  assert.match(config, /root:\s*path\.resolve\(__dirname,\s*["']client["']\)/);
});

test('npm run dev dispatches the local Vite command without starting a backend', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'aether-dev-check-'));
  try {
    const bin = path.join(tmp, 'node_modules', '.bin');
    mkdirSync(bin, { recursive: true });
    writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ private: true, scripts: { dev: packageJson.scripts.dev } }));
    const shim = path.join(bin, 'vite');
    writeFileSync(shim, '#!/bin/sh\nprintf "VITE_ARGS:%s\\n" "$*"\n', { mode: 0o755 });
    const result = spawnSync('npm', ['run', 'dev'], { cwd: tmp, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /VITE_ARGS:--host 127\.0\.0\.1/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
