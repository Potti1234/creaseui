import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Option } from 'effect'

import {
  DEFAULT_CONFIG,
  accentForTheme,
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
    const decoded = Option.getOrThrow(decodePreset('b27GcrRo'))
    assert.equal(decoded.style, 'rhea')
    assert.equal(decoded.base, 'neutral')
    assert.equal(decoded.radius, 1)
    assert.equal(decoded.font, 'inter')
    assert.equal(decoded.fontHeading, 'inherit')
    assert.equal(decoded.iconLibrary, 'lucide')
    assert.equal(decoded.menuAccent, 'subtle')
    assert.equal(decoded.menuColor, 'default')
    assert.equal(decoded.chartColor, 'neutral')

    const reDecoded = Option.getOrThrow(
      decodePreset(encodePreset(Option.getOrThrow(decodePreset('b4xFeBLg4O')))),
    )
    assert.deepEqual(
      reDecoded,
      Option.getOrThrow(decodePreset(encodePreset(reDecoded))),
    )
  })

  it('round-trips a default config through the v3 code', () => {
    const code = encodePreset(DEFAULT_CONFIG)
    assert.match(code, /^c[0-9A-Za-z]+$/)
    assert.deepEqual(Option.getOrThrow(decodePreset(code)), DEFAULT_CONFIG)
  })

  it('accepts codes, CLI flags, and shadcn create URLs', () => {
    const expected = decodePreset('b4xFeBLg4O')
    assert.deepEqual(parsePresetInput('b4xFeBLg4O'), expected)
    assert.deepEqual(parsePresetInput('--preset b4xFeBLg4O'), expected)
    assert.deepEqual(
      parsePresetInput('https://ui.shadcn.com/create?preset=b4xFeBLg4O'),
      expected,
    )
    assert.equal(Option.isNone(parsePresetInput('not-a-preset')), true)
  })

  it('materializes every design-system choice into installable output', () => {
    const css = presetInstallCss({
      ...DEFAULT_CONFIG,
      style: 'nova',
      base: 'stone',
      ...accentForTheme('blue'),
      chartColor: 'rose',
      font: 'lora',
      fontHeading: 'playfair-display',
      radius: 1.4,
      controlShape: 'pill',
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
    for (const iconLibrary of [
      'lucide',
      'hugeicons',
      'tabler',
      'phosphor',
      'remixicon',
    ]) {
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
    const shuffled = shufflePreset()
    assert.notDeepEqual(shuffled, DEFAULT_CONFIG)
    assert.deepEqual(
      Option.getOrThrow(decodePreset(encodePreset(shuffled))),
      shuffled,
    )
    assert.notDeepEqual(shufflePreset(), shuffled)
  })
})
