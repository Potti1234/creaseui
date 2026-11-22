import { describe, it } from 'node:test'
import * as TailwindCommand from '../src/ui/command'
import * as PleatCommand from '../src/pleat/command'
import { verifyCommandRoot } from './command-rendering'
import * as TailwindMenu from '../src/ui/dropdown-menu'
import * as PleatMenu from '../src/pleat/dropdown-menu'
import { verifyShortcutHints } from './shortcut-rendering'

for (const [renderer, Command] of [
  ['Tailwind', TailwindCommand],
  ['Pleat', PleatCommand],
] as const) {
  describe(`${renderer} Command root`, () => {
    it('keeps legacy shortcuts accessible and hides hints backed by keys', () => {
      verifyShortcutHints(
        Command,
        renderer === 'Tailwind' ? TailwindMenu : PleatMenu,
      )
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
}
