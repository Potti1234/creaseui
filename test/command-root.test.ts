import { describe, it } from 'node:test'
import * as TailwindCommand from '../src/ui/command'
import * as PleatCommand from '../src/pleat/command'
import { verifyCommandRoot } from './command-rendering'

for (const [renderer, Command] of [
  ['Tailwind', TailwindCommand],
  ['Pleat', PleatCommand],
] as const) {
  describe(`${renderer} Command root`, () => {
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
}
