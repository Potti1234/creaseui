import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('Switch renderer contract', () => {
  it('shares one Foldkit primitive adapter across skins', () => {
    const tailwind = readFileSync('src/ui/switch.ts', 'utf8')
    const stylex = readFileSync('src/stylex/switch.ts', 'utf8')
    assert.match(tailwind, /from '@\/lib\/switch'/u)
    assert.match(stylex, /from '@\/lib\/switch'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/switch['"]/u)
    assert.match(stylex, /renderSwitch\(/u)
  })
})
