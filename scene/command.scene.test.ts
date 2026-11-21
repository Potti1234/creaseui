import { describe, it } from 'vitest'
import * as Command from '@/stylex/command'
import { verifyCommandRoot } from '../test/command-rendering'
import * as Menu from '@/stylex/dropdown-menu'
import { verifyShortcutHints } from '../test/shortcut-rendering'

describe('StyleX Command root', () => {
  it('keeps legacy shortcuts accessible and hides hints backed by keys', () => {
    verifyShortcutHints(Command, Menu)
  })
  for (const [query, status, announcement] of [
    ['', 'ready', ''],
    ['a', 'ready', '1 result'],
    ['missing', 'ready', 'No results'],
    ['a', 'loading', 'Loading'],
  ] as const) {
    it(`preserves the existing root hierarchy for ${status} query "${query}"`, () => {
      verifyCommandRoot(Command, query, status, announcement)
    })
  }
})
