import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('../../client/src/core/blockchain/BlockchainService.ts', import.meta.url)),
  'utf8',
);

function handler(name) {
  const start = source.indexOf(`  private ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const nextMethod = source.indexOf('\n  private ', start + 10);
  const nextPublic = source.indexOf('\n  public ', start + 10);
  const candidates = [nextMethod, nextPublic].filter((index) => index > start);
  const end = Math.min(...candidates);
  return source.slice(start, end);
}

const cases = [
  ['handleAccountsChanged', 'externalWalletAccountsChanged'],
  ['handleChainChanged', 'externalWalletChainChanged'],
  ['handleConnect', 'externalWalletProviderConnected'],
  ['handleDisconnect', 'walletDisconnected'],
];

for (const [method, eventName] of cases) {
  test(`${method} notifies EventEmitter and registered listeners with the same event`, () => {
    const body = handler(method);
    assert.match(body, new RegExp(`this\\.emit\\(['"]${eventName}['"], event\\)`));
    assert.match(body, new RegExp(`this\\.notifyListeners\\(['"]${eventName}['"], event\\)`));
  });
}

test('provider disconnection clears both wallet address and status before notification', () => {
  const body = handler('handleDisconnect');
  const clearAddress = body.indexOf('this.walletAddress = null');
  const clearStatus = body.indexOf('this.walletStatus = WalletConnectionStatus.DISCONNECTED');
  const emit = body.indexOf("this.emit('walletDisconnected', event)");
  assert(clearAddress >= 0 && clearStatus >= 0 && emit > clearAddress && emit > clearStatus);
});
