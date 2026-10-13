import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Style } from '@pleat/core'
import { type ComponentLayoutStyle, layoutStyle } from '../src/pleat/contracts'

describe('pleat layout contract', () => {
  it('rejects non-layout properties at the type boundary', () => {
    const good = layoutStyle({ margin: 8, width: 'fit-content' })
    assert.equal(Style.isStyle(good), true)

    // @ts-expect-error raw Style.make is not proven layout-only
    const _unbranded: ComponentLayoutStyle = Style.make({ margin: 8 })

    assert.throws(
      () =>
        layoutStyle({
          // @ts-expect-error appearance properties are not layout properties
          backgroundColor: 'red',
          // @ts-expect-error padding restyles the component internals
          padding: '97px',
        }),
      /parent-layout properties/u,
    )
  })

  it('rejects non-layout properties for untyped callers', () => {
    assert.throws(
      () =>
        layoutStyle({
          backgroundColor: 'red',
        } as Parameters<typeof layoutStyle>[0]),
      /parent-layout properties/u,
    )
  })
})
