import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('Checkbox renderer contract', () => {
  it('shares the Foldkit primitive adapter without importing the Tailwind skin', () => {
    const tailwind = readFileSync('src/ui/checkbox.ts', 'utf8')
    const stylex = readFileSync('src/stylex/checkbox.ts', 'utf8')
    assert.match(tailwind, /from '@\/lib\/checkbox'/u)
    assert.match(stylex, /from '@\/lib\/checkbox'/u)
    assert.doesNotMatch(stylex, /from ['"]@\/ui\/checkbox['"]/u)
    assert.match(stylex, /renderCheckbox\(/u)
  })
})
