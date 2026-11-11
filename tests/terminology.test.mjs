import test from 'node:test';
import assert from 'node:assert/strict';
import { scrubAllowedPhrases } from '../scripts/verify-biozoecurrency-terminology.mjs';
const legacy = ['bio', 'zone'].join('');
test('exact repository identifier is permitted but nearby and extended misuse is rejected', () => {
  const repo = `${legacy}-harmony-boost`;
  assert.equal(scrubAllowedPhrases(`https://github.com/AIFreedomTrustFederation/${repo}` ).includes(legacy), false);
  for (const input of [`${repo} ${legacy}`, `${repo}-copy`, `prefix-${repo}`]) {
    assert.equal(scrubAllowedPhrases(input).includes(legacy), true, input);
  }
  assert.equal(scrubAllowedPhrases('Biozoe protocol'), 'Biozoe protocol');
});
