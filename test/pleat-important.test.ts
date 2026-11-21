import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Style, When } from '@pleat/core'

describe('Pleat inline positioning overrides', () => {
  it('emits important declarations only inside the mobile condition', () => {
    const mobile = Style.empty.pipe(
      Style.when(When.maxWidth('639px'), {
        position: 'fixed !important',
        top: 'auto !important',
        left: '0.75rem !important',
      }),
    )
    for (const atom of mobile.atoms) {
      assert.match(atom.rule, /@media\s*\(max-width:\s*639px\)/u)
      assert.match(atom.rule, /!important/u)
    }
    assert.deepEqual(Style.resolve(mobile), {})
  })

  it('still rejects invalid or injected declarations', () => {
    for (const left of [
      '12px; top: 0 !important',
      '12px !important; top: 0',
      '12px !important !important',
      '12px !invalid',
      '12px /* comment */ !important',
      'calc(12px !important',
      '!important',
    ]) {
      assert.throws(() => Style.make({ left }), /not a value Pleat can write/u)
    }
  })
})
