import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
const script = path.resolve('scripts/deploy-wallet-frontend.sh');
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.stdin.end();
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, output }));
  });
}
test('deployment requires trusted host configuration and rolls back on failed application verification', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'aether-deploy-'));
  t.after(() => rm(dir, { recursive: true }));
  await mkdir(path.join(dir, 'bin'));
  await writeFile(path.join(dir, 'aetherion-deploy.tar.gz'), 'fixture');
  const key = path.join(dir, 'key');
  assert.equal((await run('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-f', key])).code, 0);
  const pub = await readFile(key + '.pub', 'utf8');
  for (const name of ['ssh', 'scp']) {
    await writeFile(path.join(dir, 'bin', name), `#!/bin/bash\nprintf '%s\\n' "$0 $*" >> "$DEPLOY_TEST_LOG"\ncat >> "$DEPLOY_TEST_LOG"\n`, { mode: 0o755 });
  }
  await writeFile(path.join(dir, 'bin', 'node'), '#!/bin/bash\nexit "${VERIFY_EXIT:-0}"\n', { mode: 0o755 });
  const env = { ...process.env, PATH: path.join(dir, 'bin') + ':' + process.env.PATH,
    DEPLOY_HOST: 'wallet.example.test', DEPLOY_USER: 'deployer', DEPLOY_PORT: '22',
    DEPLOY_KNOWN_HOSTS: 'wallet.example.test ' + pub, DEPLOY_HTTPS_ORIGIN: 'https://wallet.example.test',
    DEPLOY_TEST_LOG: path.join(dir, 'calls'), GITHUB_SHA: 'abc123', GITHUB_RUN_ID: '1' };
  for (const invalid of [{ DEPLOY_KNOWN_HOSTS: '' }, { DEPLOY_KNOWN_HOSTS: 'other.example.test ' + pub }, { DEPLOY_HOST: 'host;echo injected' }, { DEPLOY_HTTPS_ORIGIN: 'http://wallet.example.test' }]) {
    assert.notEqual((await run('bash', [script], { cwd: dir, env: { ...env, ...invalid } })).code, 0);
  }
  assert.equal((await run('bash', [script], { cwd: dir, env })).code, 0);
  let calls = await readFile(env.DEPLOY_TEST_LOG, 'utf8');
  assert.match(calls, /StrictHostKeyChecking=yes/);
  assert.match(calls, /UserKnownHostsFile=/);
  assert.match(calls, /npm ci --omit=dev --ignore-scripts/);
  assert.doesNotMatch(calls, /ssh-keyscan|rm -rf/);
  await writeFile(env.DEPLOY_TEST_LOG, '');
  assert.notEqual((await run('bash', [script], { cwd: dir, env: { ...env, VERIFY_EXIT: '1' } })).code, 0);
  calls = await readFile(env.DEPLOY_TEST_LOG, 'utf8');
  assert.match(calls, /previous=\$\(cat/);
  assert.match(calls, /systemctl stop aetherion/);
});

test('HTTP verifier checks release identity, assets and API failures rather than accepting a redirect', async t => {
  let broken = false;
  const server = createServer((req, res) => {
    if (req.url === '/release.json') { res.setHeader('Content-Type', 'application/json'); return res.end('{"sha":"tested-head"}'); }
    if (req.url === '/health') { res.setHeader('Content-Type', 'application/json'); return res.end('{"scope":"frontend-only","api":"unavailable","status":"available"}'); }
    if (req.url.includes('/api/')) { res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end('{"scope":"frontend-only"}'); }
    if (req.url.includes('missing.js')) { res.writeHead(404); return res.end(); }
    if (req.url === '/assets/app.js' || req.url === '/assets/app.css') {
      res.setHeader('Content-Type', broken ? 'text/html' : req.url.endsWith('.js') ? 'application/javascript' : 'text/css'); return res.end('fixture');
    }
    res.setHeader('Content-Type', 'text/html'); res.end('<script src="/assets/app.js"></script><link href="/assets/app.css">');
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const invoke = sha => run(process.execPath, ['scripts/verify-wallet-http.mjs', origin], { env: { ...process.env, GITHUB_SHA: sha } });
  assert.equal((await invoke('tested-head')).code, 0);
  assert.notEqual((await invoke('wrong-head')).code, 0);
  broken = true;
  assert.notEqual((await invoke('tested-head')).code, 0);
});
