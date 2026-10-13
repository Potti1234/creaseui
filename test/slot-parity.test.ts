import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/* Presets, rendered audits and consumer CSS address parts through
   `data-slot`, so every renderer must expose the Tailwind reference slots. */
const SLOT = /DataAttribute\(\s*'slot',\s*'([a-z0-9-]+)'/g

const slotsByFile = (directory: string): ReadonlyMap<string, Set<string>> =>
  new Map(
    readdirSync(directory)
      .filter(file => file.endsWith('.ts'))
      .map(file => [
        file,
        new Set(
          [...readFileSync(join(directory, file), 'utf8').matchAll(SLOT)].map(
            ([, slot]) => slot!,
          ),
        ),
      ]),
  )

const shared = new Set(
  [...slotsByFile('src/lib').values()].flatMap(slots => [...slots]),
)
const reference = slotsByFile('src/ui')

describe('renderer slot parity', () => {
  for (const renderer of ['stylex', 'pleat'] as const) {
    it(`${renderer} exposes every Tailwind data-slot`, () => {
      const implemented = slotsByFile(`src/${renderer}`)
      const missing = [...reference].flatMap(([file, slots]) => {
        const own = implemented.get(file)
        return own === undefined
          ? []
          : [...slots]
              .filter(slot => !own.has(slot) && !shared.has(slot))
              .map(slot => `${file}: ${slot}`)
      })
      assert.deepEqual(missing, [])
    })
  }
})
