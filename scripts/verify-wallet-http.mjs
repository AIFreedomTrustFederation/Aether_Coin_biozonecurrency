#!/usr/bin/env node
import assert from 'node:assert/strict';
const origin = new URL(process.argv[2]);
if (origin.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(origin.hostname)) throw new Error('Remote verification requires HTTPS');
async function get(route) {
  const response = await fetch(new URL(route, origin), { redirect: 'error', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, route);
  return response;
}
if (process.env.GITHUB_SHA) {
  const release = await (await get('/release.json')).json();
  assert.equal(release.sha, process.env.GITHUB_SHA, 'Served release does not match requested commit');
}
const health = await (await get('/health')).json();
assert.equal(health.scope, 'frontend-only');
assert.equal(health.api, 'unavailable');
assert.equal(health.status, 'available');
for (const route of ['/wallet', '/dapp']) {
  const response = await get(route);
  assert.match(response.headers.get('content-type'), /html/);
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map(m => m[1]);
  assert.ok(assets.some(a => a.endsWith('.js')), 'Missing JS entry');
  assert.ok(assets.some(a => a.endsWith('.css')), 'Missing CSS entry');
  for (const asset of assets) {
    const result = await get(asset);
    assert.match(result.headers.get('content-type'), asset.endsWith('.js') ? /javascript/ : /css/);
    assert.ok((await result.text()).length > 0);
  }
}
for (const route of ['/assets/missing.js', '/wallet/assets/missing.js']) {
  assert.equal((await fetch(new URL(route, origin), { signal: AbortSignal.timeout(15000) })).status, 404);
}
for (const route of ['/api/payments', '/wallet/api/payments', '/dapp/api/payments']) {
  const response = await fetch(new URL(route, origin), { method: 'POST', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).scope, 'frontend-only');
}
console.log('PASS frontend HTML, JS, CSS, health, missing assets and unavailable APIs');
