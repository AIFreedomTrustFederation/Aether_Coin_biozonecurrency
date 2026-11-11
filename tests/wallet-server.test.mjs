import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createWalletApp } from '../server-redirect.js';

test('production frontend serves Vite assets, SPA aliases and honest API failures', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'aetherion-ui-'));
  await mkdir(path.join(dir, 'assets'));
  await writeFile(path.join(dir, 'index.html'), '<html><script src="/assets/app.js"></script></html>');
  await writeFile(path.join(dir, 'assets/app.js'), 'console.log("wallet")');
  const { app, close } = await createWalletApp({ publicDir: dir });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await close(); await rm(dir, { recursive: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const redirect = await fetch(base, { redirect: 'manual' });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('location'), '/dapp');
  for (const route of ['/dapp', '/wallet', '/wallet/history', '/dapp/history']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /assets\/app.js/);
  }
  for (const route of ['/assets/app.js', '/wallet/assets/app.js', '/dapp/assets/app.js']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), /javascript/);
    assert.match(await response.text(), /console.log/);
  }
  for (const route of ['/assets/missing.js', '/wallet/assets/missing.js', '/dapp/missing.css']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
  for (const prefix of ['/api', '/wallet/api', '/dapp/api']) {
    for (const method of ['GET', 'POST']) {
      const response = await fetch(base + prefix + '/payments', { method });
      assert.equal(response.status, 503);
      assert.equal((await response.json()).scope, 'frontend-only');
    }
  }
  assert.deepEqual(await (await fetch(base + '/health')).json(), { status: 'available', scope: 'frontend-only', api: 'unavailable' });
  await rm(path.join(dir, 'index.html'));
  assert.equal((await fetch(base + '/wallet')).status, 503);
  assert.equal((await fetch(base + '/health')).status, 503);
});

test('development entry serves the Vite wallet shell without starting legacy APIs', async (t) => {
  const { app, close } = await createWalletApp({ development: true });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base + '/wallet');
  assert.equal(response.status, 200);
  assert.match(await response.text(), /@vite\/client/);
  assert.equal((await fetch(base + '/src/main.tsx')).status, 200);
  assert.equal((await fetch(base + '/api/payments', { method: 'POST' })).status, 503);
});

test('built wallet HTML references fetchable JavaScript and CSS', { skip: !process.env.WALLET_BUILD_SMOKE }, async (t) => {
  const { app, close } = await createWalletApp();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['/wallet', '/dapp']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map(match => match[1]);
    assert.ok(assets.some(asset => asset.endsWith('.js')));
    assert.ok(assets.some(asset => asset.endsWith('.css')));
    for (const asset of assets) {
      const result = await fetch(base + asset);
      assert.equal(result.status, 200, asset);
      assert.match(result.headers.get('content-type'), asset.endsWith('.js') ? /javascript/ : /css/);
    }
  }
});
