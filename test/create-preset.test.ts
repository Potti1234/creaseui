import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import {
  DEFAULT_CONFIG,
  decodePreset,
  encodePreset,
  parsePresetInput,
  presetInstallCss,
  presetManifest,
  presetRegistryJson,
  shufflePreset,
} from '../src/demo/create-preset.ts'

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

  it('materializes every design-system choice into installable output', () => {
    const css = presetInstallCss({
      ...DEFAULT_CONFIG,
      style: 'maia',
      baseColor: 'stone',
      theme: 'blue',
      chartColor: 'rose',
      font: 'lora',
      fontHeading: 'playfair-display',
      radius: 'large',
      menuAccent: 'bold',
      menuColor: 'inverted-translucent',
    })
    assert.match(css, /fonts\.googleapis\.com/)
    assert.match(css, /--chart-5:/)
    assert.match(css, /--radius:0\.875rem/)
    assert.match(css, /82%,transparent/)
    assert.match(css, /border-radius:9999px/)
    assert.match(css, /Playfair Display/)
    assert.doesNotMatch(css, /create-board-theme/)
  })

  it('selects a real icon registry adapter', () => {
    for (const iconLibrary of ['lucide', 'hugeicons', 'tabler', 'phosphor', 'remixicon']) {
      const manifest = presetManifest({ ...DEFAULT_CONFIG, iconLibrary })
      assert.ok(
        manifest.registryDependencies.includes(
          `Potti1234/creaseui/icons-${iconLibrary}`,
        ),
      )
      assert.match(
        presetRegistryJson({ ...DEFAULT_CONFIG, iconLibrary }),
        new RegExp(`icons-${iconLibrary}`),
      )
    }
  })

  it('shuffles to a different, still round-trippable preset', () => {
    const shuffled = shufflePreset(DEFAULT_CONFIG)
    assert.notDeepEqual(shuffled, DEFAULT_CONFIG)
    assert.deepEqual(
      Option.getOrThrow(decodePreset(encodePreset(shuffled))),
      shuffled,
    )
    assert.notDeepEqual(shufflePreset(shuffled), shuffled)
  })
})
