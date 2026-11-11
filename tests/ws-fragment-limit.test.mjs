import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';

const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
const consumers = Object.entries(lock.packages).filter(([path, entry]) =>
  path.endsWith('/@ethersproject/providers') ||
  (path.endsWith('/viem') && entry.version === '2.23.2')
);
assert.ok(consumers.length > 0, 'Expected WebSocket consumers in lockfile');

for (const [path] of consumers) {
  test(`${path} resolves a WebSocket receiver that limits fragmentation`, async () => {
    const require = createRequire(resolve(path, 'package.json'));
    const { Receiver } = require('ws');

    const normal = new Receiver({ maxFragments: 2 });
    const message = once(normal, 'message');
    normal.end(Buffer.from([0x01, 1, 0x61, 0x80, 1, 0x62]));
    assert.equal((await message)[0].toString(), 'ab');

    const oversized = new Receiver({ maxFragments: 2 });
    const error = once(oversized, 'error');
    oversized.end(Buffer.from([0x01, 1, 0x61, 0x00, 1, 0x62, 0x80, 1, 0x63]));
    assert.equal((await error)[0].code, 'WS_ERR_TOO_MANY_BUFFERED_PARTS');
  });
}
