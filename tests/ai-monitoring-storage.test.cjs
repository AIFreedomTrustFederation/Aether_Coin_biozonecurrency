'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

// Exercise the real storage class without loading the database dependency.
const source = fs.readFileSync(path.resolve(__dirname, '../server/fixed-storage.ts'), 'utf8');
const classStart = source.indexOf('class StorageWrapper');
assert.ok(classStart >= 0, 'storage class must exist');
const classEnd = source.indexOf('// Create and export the storage wrapper instance', classStart);
const fallbackEnd = source.lastIndexOf('export const storage');
const implementation = source.slice(classStart, classEnd >= 0 ? classEnd : fallbackEnd);
const executable = stripTypeScriptTypes(implementation, { mode: 'strip' });
const sandbox = { console: { log() {}, error() {} }, Date, Math };
vm.runInNewContext(executable + '\nthis.storage = new StorageWrapper();', sandbox, {
  filename: 'fixed-storage.stripped.js',
});
const storage = sandbox.storage;

test('monitoring list does not fabricate threat events', async () => {
  await assert.rejects(storage.getAiMonitoringLogs(1, 10), /not implemented/i);
});

test('monitoring writes cannot report an unpersisted success', async () => {
  await assert.rejects(
    storage.createAiMonitoringLog({ userId: 1, action: 'threat_detected' }),
    /not implemented/i,
  );
});

test('monitoring lookup does not fabricate an event by ID', async () => {
  await assert.rejects(storage.getAiMonitoringLogById(123), /not implemented/i);
});
