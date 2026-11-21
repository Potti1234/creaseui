import { describe, it } from 'vitest'
import * as Command from '@/stylex/command'
import { verifyCommandRoot } from '../test/command-rendering'

describe('StyleX Command root', () => {
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
