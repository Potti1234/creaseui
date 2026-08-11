import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import { decodePreset, encodePreset, parsePresetInput } from '../src/demo/create-preset.ts'

describe('shadcn preset compatibility', () => {
  it('decodes current official create presets', () => {
    assert.deepEqual(Option.getOrThrow(decodePreset('b27GcrRo')), {
      menuColor: 'default', menuAccent: 'subtle', radius: 'default',
      font: 'inter', iconLibrary: 'lucide', theme: 'neutral',
      baseColor: 'neutral', style: 'rhea', chartColor: 'neutral',
      fontHeading: 'inherit',
    })
    assert.equal(encodePreset(Option.getOrThrow(decodePreset('b4xFeBLg4O'))), 'b4xFeBLg4O')
  })

  it('accepts codes, CLI flags, and shadcn create URLs', () => {
    const expected = decodePreset('b4xFeBLg4O')
    assert.deepEqual(parsePresetInput('b4xFeBLg4O'), expected)
    assert.deepEqual(parsePresetInput('--preset b4xFeBLg4O'), expected)
    assert.deepEqual(parsePresetInput('https://ui.shadcn.com/create?preset=b4xFeBLg4O'), expected)
    assert.equal(Option.isNone(parsePresetInput('not-a-preset')), true)
  })
})
