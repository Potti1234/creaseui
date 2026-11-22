import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import * as Toolbar from '../src/lib/toolbar.ts'

describe('toolbar focus mount contract', () => {
  const lib = readFileSync('src/lib/toolbar.ts', 'utf8')

  it('discovers opaque toolbar items and delegates navigation to RovingFocus', () => {
    assert.match(lib, /Mount\.defineStream\('FocusToolbarItems'/u)
    assert.match(lib, /TOOLBAR_ITEM_SELECTOR = 'button, input, \[tabindex\]'/u)
    assert.match(
      lib,
      /import \{ navigate \} from '@\/lib\/behaviors\/roving-focus'/u,
    )
    assert.match(lib, /shouldDeferToCaret/u)
    assert.match(lib, /isRtlElement/u)
  })

  it('passes disabled-state policy and defers to native text editing', () => {
    assert.match(lib, /aria-disabled/u)
    assert.match(lib, /isContentEditable/u)
    assert.match(lib, /selectionStart/u)
    assert.match(lib, /isDisabled: isItemDisabled/u)
  })

  it('emits CompletedFocusToolbarItems once and has orientation-typed args', () => {
    assert.match(lib, /CompletedFocusToolbarItems/u)
    assert.match(lib, /orientation: S\.Literals/u)
    assert.equal(Toolbar.TOOLBAR_EDGE_COMP_ATTR, 'data-crease-edge-comp')
  })
})
