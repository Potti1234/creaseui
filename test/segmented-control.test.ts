import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('Segmented Control renderer contract', () => {
  it('binds one string-valued RadioGroup bundle in the shared module', () => {
    const shared = readFileSync('src/lib/segmented-control.ts', 'utf8');
    assert.match(shared, /RadioGroupPrimitive\.create<Value>\(\)/u);
    assert.match(shared, /create<string>\(\)/u);
  });
});
