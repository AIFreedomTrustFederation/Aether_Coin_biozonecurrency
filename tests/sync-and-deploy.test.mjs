import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('scripts/sync-and-deploy.sh');

function executable(file, body) {
  fs.writeFileSync(file, body, { mode: 0o755 });
}

function runFixture({ rsyncFails = false, copyFails = false, deployExit = 0, deploy = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aether-sync-gate-'));
  try {
    const source = path.join(dir, 'source');
    const target = path.join(dir, 'target');
    const bin = path.join(dir, 'bin');
    const marker = path.join(dir, 'deployment-called');
    for (const folder of [path.join(source, 'client'), path.join(target, 'client'), bin]) {
      fs.mkdirSync(folder, { recursive: true });
    }
    fs.writeFileSync(path.join(source, 'client', 'entry.txt'), 'new content\n');
    fs.writeFileSync(path.join(target, 'client', 'entry.txt'), 'old content\n');
    fs.writeFileSync(path.join(source, 'tsconfig.json'), '{"compilerOptions":{}}\n');
    executable(path.join(target, 'deploy-to-cpanel.sh'),
      '#!/bin/sh\nprintf "called\\n" > "$DEPLOY_MARKER"\nexit "$DEPLOY_EXIT"\n');
    executable(path.join(bin, 'rsync'),
      '#!/bin/sh\nif [ "$RSYNC_FAIL" = 1 ]; then exit 29; fi\nexec /bin/cp -a "$3." "$4"\n');
    executable(path.join(bin, 'cp'),
      '#!/bin/sh\ncase "$1" in */tsconfig.json) if [ "$COPY_FAIL" = 1 ]; then exit 19; fi ;; esac\nexec /bin/cp "$@"\n');

    const env = {
      ...process.env,
      SOURCE_REPO: source,
      TARGET_REPO: target,
      LOG_FILE: path.join(dir, 'sync.log'),
      DEPLOY_MARKER: marker,
      DEPLOY_EXIT: String(deployExit),
      RSYNC_FAIL: rsyncFails ? '1' : '0',
      COPY_FAIL: copyFails ? '1' : '0',
      PATH: bin + path.delimiter + process.env.PATH,
    };
    const result = spawnSync('bash', [script, ...(deploy ? ['--deploy'] : [])], {
      env, encoding: 'utf8', timeout: 15000,
    });
    return {
      ...result,
      deployed: fs.existsSync(marker),
      targetEntry: fs.readFileSync(path.join(target, 'client', 'entry.txt'), 'utf8'),
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('successful synchronization and requested deployment report success', () => {
  const result = runFixture();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.deployed, true);
  assert.equal(result.targetEntry, 'new content\n');
});

test('failed rsync stops before deployment and returns failure', () => {
  const result = runFixture({ rsyncFails: true });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.deployed, false, 'must not deploy an incompletely synchronized tree');
});

test('failed file copy stops before deployment and returns failure', () => {
  const result = runFixture({ copyFails: true });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.deployed, false, 'must not deploy after a failed file copy');
});

test('failed deployment propagates a nonzero status', () => {
  const result = runFixture({ deployExit: 37 });
  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.deployed, true);
  assert.doesNotMatch(result.stdout, /=== cPanel Deployment Completed ===/);
});

test('sync-only invocation never launches deployment', () => {
  const result = runFixture({ deploy: false });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.deployed, false);
});
