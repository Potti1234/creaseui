import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { Option } from 'effect'

// @ts-expect-error no published types for the strict CSS audit internals
import {
  createCssAudit,
  findStylesheets,
} from '../packages/lint/lib/strict/css.js'

import {
  DEFAULT_CONFIG,
  accentForTheme,
  presetManifest,
  contrastRatio,
  decodePreset,
  encodePreset,
  hexToToken,
  parsePresetInput,
  presetInstallCss,
  presetManifest,
  presetRegistryJson,
  presetTokens,
  shufflePreset,
  tokenToHex,
  validTokenValue,
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

  it('materializes a preset code into CSS and a registry record', () => {
    const repo = fileURLToPath(new URL('..', import.meta.url))
    const output = mkdtempSync(path.join(tmpdir(), 'crease-preset-'))
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        'scripts/materialize-create-preset.ts',
        '--preset',
        'c41ST0kztg1aRr803UlnDN6',
        '--output',
        output,
      ],
      { cwd: repo },
    )
    const files = readdirSync(output)
    const item = JSON.parse(
      readFileSync(path.join(output, 'registry-item.json'), 'utf8'),
    )
    const config = Option.getOrThrow(decodePreset('c41ST0kztg1aRr803UlnDN6'))
    assert.equal(
      item.name,
      `crease-preset-${encodePreset(config).toLowerCase()}`,
    )
    const css = item.files.find(file => file.target.endsWith('.css'))
    assert.match(css.content, /--background:/)
    const record = item.files.find(file =>
      file.target.endsWith('crease-preset.json'),
    )
    assert.equal(JSON.parse(record.content).style, 'mira')
    assert.equal(JSON.parse(record.content).hue, 277)
    for (const file of item.files)
      assert.ok(
        files.includes(file.path),
        `${file.path} written to the output directory`,
      )
  })
})

describe('sidebar tokens', () => {
  it('gives the light sidebar a visible accent surface', () => {
    const light = presetTokens(DEFAULT_CONFIG, 'light')
    assert.notEqual(
      light['sidebar-accent'],
      light['sidebar'],
      'hovered/active sidebar links need a distinct surface',
    )
  })

  it('emits every sidebar token in dark that light has', () => {
    const light = presetTokens(DEFAULT_CONFIG, 'light')
    const dark = presetTokens(DEFAULT_CONFIG, 'dark')
    for (const name of Object.keys(light).filter(key =>
      key.startsWith('sidebar'),
    ))
      assert.ok(name in dark, `dark --${name}`)
  })
})

describe('token overrides', () => {
  const overridden: typeof DEFAULT_CONFIG = {
    ...DEFAULT_CONFIG,
    overrides: {
      primary: 'oklch(0.6 0.2 150)',
      'dark:primary': 'oklch(0.7 0.15 150)',
      'bogus-token': 'oklch(0.5 0.1 0)',
    },
  }

  it('round-trips overrides in the preset code suffix', () => {
    const code = encodePreset(overridden)
    assert.match(code, /^c[0-9A-Za-z]+\.[0-9A-Za-z_-]+$/u)
    assert.deepEqual(Option.getOrThrow(decodePreset(code)), {
      ...overridden,
      overrides: {
        primary: 'oklch(0.6 0.2 150)',
        'dark:primary': 'oklch(0.7 0.15 150)',
      },
    })
  })

  it('keeps plain codes suffix-free', () => {
    assert.match(encodePreset(DEFAULT_CONFIG), /^c[0-9A-Za-z]+$/u)
  })

  it('layers overrides over the derived palette per scheme', () => {
    const light = presetTokens(overridden, 'light')
    const dark = presetTokens(overridden, 'dark')
    assert.equal(light['primary'], 'oklch(0.6 0.2 150)')
    assert.equal(dark['primary'], 'oklch(0.7 0.15 150)')
    /* dark declares its own --primary, so a light override doesn't cascade
       there — dark mode needs the dark: prefix. */
    const lightOnly = presetTokens(
      {
        ...overridden,
        overrides: {
          primary: 'oklch(0.6 0.2 150)',
          sidebar: 'oklch(0.4 0.1 90)',
        },
      },
      'dark',
    )
    assert.equal(
      lightOnly['primary'],
      presetTokens(DEFAULT_CONFIG, 'dark')['primary'],
    )
    assert.equal(
      lightOnly['sidebar'],
      presetTokens(DEFAULT_CONFIG, 'dark')['sidebar'],
    )
    /* untouched tokens keep derived values */
    assert.equal(
      light['secondary'],
      presetTokens(DEFAULT_CONFIG, 'light')['secondary'],
    )
  })

  it('emits destructive and chart-5 tokens for both schemes', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const tokens = presetTokens(DEFAULT_CONFIG, scheme)
      for (const name of [
        'destructive',
        'destructive-foreground',
        'chart-3',
        'chart-4',
        'chart-5',
      ]) {
        assert.ok(tokens[name], `${scheme} --${name}`)
      }
    }
    assert.match(presetInstallCss(DEFAULT_CONFIG), /--destructive:/)
  })

  it('converts between oklch literals and hex', () => {
    assert.deepEqual(tokenToHex('oklch(0.985 0 0)'), Option.some('#fafafa'))
    assert.deepEqual(tokenToHex('oklch(0.145 0 0)'), Option.some('#0a0a0a'))
    assert.ok(Option.isNone(tokenToHex('color-mix(in oklch,red 50%,white)')))
    assert.deepEqual(hexToToken('#ffffff'), Option.some('oklch(1 0 0)'))
    assert.ok(Option.isNone(hexToToken('#xyz')))
    /* round trip within tolerance */
    const oklch = Option.getOrThrow(hexToToken('#3b82f6'))
    assert.ok(Math.abs(parseFloat(oklch.split(' ')[2]!) - 262) < 5)
  })

  it('computes WCAG contrast for oklch pairs', () => {
    const ratio = Option.getOrThrow(
      contrastRatio('oklch(0.145 0 0)', 'oklch(0.985 0 0)'),
    )
    assert.ok(ratio > 15)
    assert.ok(
      Option.isNone(
        contrastRatio('color-mix(in oklch,red 50%,white)', 'oklch(0.985 0 0)'),
      ),
    )
  })

  it('gates hand-typed values to complete colors', () => {
    for (const ok of [
      '#fff',
      '#ff0000',
      'oklch(0.63 0.25 29.23)',
      'rgb(255 0 0)',
      'color-mix(in oklch, red 50%, blue)',
      'var(--other)',
    ]) {
      assert.ok(validTokenValue(ok), ok)
    }
    for (const bad of [
      '',
      '#f0',
      '#f0000',
      '#0000',
      '#ff000080',
      'oklch(0.5',
      'red',
      'x y;z{}',
    ]) {
      assert.ok(!validTokenValue(bad), bad)
    }
  })
})

describe('preset CSS policy', () => {
  const project = (
    files: ReadonlyArray<Readonly<{ target: string; content: string }>>,
  ): string => {
    const root = mkdtempSync(path.join(tmpdir(), 'preset-css-'))
    for (const file of files) {
      const target = path.join(root, file.target.replace('@/', 'src/'))
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, file.content)
    }
    return root
  }

  const findings = (root: string, owned: string | undefined) => {
    const run = createCssAudit({
      isOwned: (file: string) => path.relative(root, file) === owned,
      rootDir: root,
      rootsOf: () => undefined,
    })
    for (const file of findStylesheets(root)) run.auditFile(file)
    return run.findings
  }

  it('splits install CSS into policy-clean tokens and theme geometry', () => {
    const config = Option.getOrThrow(decodePreset('c41ST0kztg1aRr803UlnDN6'))
    const manifest = presetManifest(config)
    const targets = manifest.files.map(file => file.target)
    assert.ok(targets.includes('@/styles/crease-preset-tokens.css'))
    assert.ok(targets.includes('@/styles/crease-preset-geometry.css'))
    assert.ok(!targets.includes('@/styles/crease-preset.css'))

    const geometry = manifest.files.find(
      file => file.target === '@/styles/crease-preset-geometry.css',
    )
    assert.ok(geometry)
    assert.match(geometry.content, /:where\(\[data-slot=/)

    const root = project(manifest.files)
    /* tokens.css is custom properties only: clean as plain global CSS. */
    const unregistered = findings(root, undefined)
    assert.deepEqual(
      unregistered.filter(f => f.file.endsWith('tokens.css')),
      [],
    )
    assert.ok(
      unregistered.some(f => f.file.endsWith('geometry.css')),
      'geometry must be registered as theme CSS',
    )
    /* geometry.css registers as owned theme CSS (role: 'theme' extension). */
    assert.deepEqual(
      findings(root, 'src/styles/crease-preset-geometry.css'),
      [],
    )
  })
})
