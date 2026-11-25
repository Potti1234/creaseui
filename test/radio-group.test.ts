import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { toOrientationKey } from '../src/lib/behaviors/radio-group.ts'

describe('Radio Group renderer contract', () => {
  it('binds one string-valued behavior bundle in the shared module', () => {
    const shared = readFileSync('src/lib/radio-group.ts', 'utf8')
    assert.match(shared, /RadioGroupBehavior\.create<string>\(\)/u)
    assert.match(shared, /isOptionDisabled/u)
    const behavior = readFileSync('src/lib/behaviors/radio-group.ts', 'utf8')
    assert.doesNotMatch(shared, /@foldkit\/ui/u)
    assert.doesNotMatch(behavior, /@foldkit\/ui/u)
  })
})

describe('RadioGroup behavior arrow keys', () => {
  it('maps both arrow axes onto a vertical group', () => {
    const toKey = toOrientationKey('Vertical', 'ltr')
    assert.equal(toKey('ArrowRight'), 'ArrowDown')
    assert.equal(toKey('ArrowLeft'), 'ArrowUp')
    assert.equal(toKey('ArrowDown'), 'ArrowDown')
    assert.equal(toKey('Home'), 'Home')
  })

  it('maps both arrow axes onto a horizontal group', () => {
    const toKey = toOrientationKey('Horizontal', 'ltr')
    assert.equal(toKey('ArrowDown'), 'ArrowRight')
    assert.equal(toKey('ArrowUp'), 'ArrowLeft')
    assert.equal(toKey('End'), 'End')
  })

  it('reverses inline arrows in right-to-left groups', () => {
    const horizontal = toOrientationKey('Horizontal', 'rtl')
    assert.equal(horizontal('ArrowLeft'), 'ArrowRight')
    assert.equal(horizontal('ArrowRight'), 'ArrowLeft')
    assert.equal(toOrientationKey('Vertical', 'rtl')('ArrowLeft'), 'ArrowDown')
  })
})
