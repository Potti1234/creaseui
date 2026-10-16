import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { contractFor } from '../scripts/registry-meta.mjs'

type Item = Readonly<{
  name: string
  docs?: string
  categories?: ReadonlyArray<string>
  meta?: Readonly<{
    crease?: Readonly<{
      component: string
      contract: string
      framework: string
      frameworkVersion: string
      publicExports: ReadonlyArray<string>
      renderer: string
      replaces: ReadonlyArray<string>
      stateOwnership: string
    }>
  }>
}>

const renderers = [
  ['tailwind', 'src/ui/registry.json', ''],
  ['stylex', 'src/stylex/registry.json', 'stylex-'],
  ['pleat', 'src/pleat/registry.json', 'pleat-'],
] as const

const itemsOf = (file: string): ReadonlyArray<Item> =>
  JSON.parse(readFileSync(file, 'utf8')).items

const foldkit = JSON.parse(readFileSync('package.json', 'utf8')).dependencies
  .foldkit

describe('registry meta.crease', () => {
  it('matches the contract creaseui-lint init records', () => {
    assert.equal(contractFor('button'), 'control.button')
    assert.equal(contractFor('sidebar'), 'component.sidebar')
  })

  for (const [renderer, file, prefix] of renderers) {
    it(`describes every ${renderer} component with Foldkit facts`, () => {
      const described = itemsOf(file).filter(item => item.meta?.crease)
      assert.ok(described.length > 100, `${described.length} items`)
      for (const item of described) {
        const crease = item.meta!.crease!
        assert.equal(item.name, `${prefix}${crease.component}`)
        assert.equal(crease.renderer, renderer)
        assert.equal(crease.framework, 'foldkit')
        assert.equal(crease.frameworkVersion, foldkit)
        assert.equal(crease.contract, contractFor(crease.component))
        assert.ok(crease.publicExports.length > 0, item.name)
        assert.match(item.docs ?? '', /Foldkit/u, item.name)
      }
    })
  }

  it('gives a component the same metadata in all three renderers', () => {
    const [tailwind, stylex, pleat] = renderers.map(
      ([, file]) =>
        new Map(
          itemsOf(file)
            .filter(item => item.meta?.crease)
            .map(item => [item.meta!.crease!.component, item.meta!.crease!]),
        ),
    )
    const sidebar = [tailwind, stylex, pleat].map(map => map.get('sidebar'))
    for (const crease of sidebar) {
      assert.equal(crease?.contract, 'component.sidebar')
      assert.equal(crease?.stateOwnership, sidebar[0]?.stateOwnership)
      assert.ok(crease?.publicExports.includes('sidebarMenuButton'))
    }
    assert.deepEqual(tailwind.get('button')?.replaces, ['control.button'])
  })
})

describe('crease-theme registry item', () => {
  const theme = (
    JSON.parse(readFileSync('registry/theme/registry.json', 'utf8')) as {
      items: ReadonlyArray<{
        name: string
        cssVars: Record<'theme' | 'light' | 'dark', Record<string, string>>
        css?: Record<string, Record<string, Record<string, string>>>
      }>
    }
  ).items.find(item => item.name === 'crease-theme')
  const roles = [
    ...new Set(
      [
        ...readFileSync('src/theme.css', 'utf8').matchAll(
          /^ {2}--([a-z0-9-]+):/gmu,
        ),
      ]
        .map(match => match[1])
        .filter(
          name => !name.startsWith('stylex-') && !name.startsWith('color-'),
        ),
    ),
  ]

  it('installs every semantic role the shared theme defines', () => {
    assert.ok(theme)
    for (const mode of ['light', 'dark'] as const)
      for (const role of roles.filter(
        role => role !== 'radius' || mode === 'light',
      ))
        assert.ok(role in theme.cssVars[mode], `${mode} is missing --${role}`)
    for (const role of ['success', 'warning'])
      assert.equal(theme.cssVars.theme[`color-${role}`], `var(--${role})`)
  })

  it('ships the document base layer the installed components rely on', () => {
    const base = theme?.css?.['@layer base']
    assert.equal(base?.['*']?.['border-color'], 'var(--color-border)')
    assert.equal(base?.body?.['background-color'], 'var(--color-background)')
    assert.equal(base?.body?.color, 'var(--color-foreground)')
  })
})

describe('crease-theme-css registry item', () => {
  const css = readFileSync('registry/theme/crease-theme.css', 'utf8')
  const defined = new Set(
    [...css.matchAll(/^ {2}--([a-z0-9-]+):/gmu)].map(match => match[1]),
  )

  it('defines every theme role the StyleX and Pleat tokens read', () => {
    for (const tokens of ['src/stylex/tokens.stylex.ts', 'src/pleat/tokens.ts'])
      for (const [, role] of readFileSync(tokens, 'utf8').matchAll(
        /var\(--([a-z0-9-]+)/gu,
      ))
        if (role !== 'drawer-bleed-background')
          assert.ok(defined.has(role), `${tokens} reads undefined --${role}`)
    for (const role of ['font-sans', 'font-mono', 'color-border'])
      assert.ok(defined.has(role), `--${role}`)
    assert.doesNotMatch(css, /@theme|@custom-variant|@apply/u)
  })

  it('is a dependency of every StyleX and Pleat component item', () => {
    for (const file of ['src/stylex/registry.json', 'src/pleat/registry.json'])
      for (const item of (
        JSON.parse(readFileSync(file, 'utf8')) as {
          items: ReadonlyArray<{
            name: string
            type: string
            registryDependencies?: ReadonlyArray<string>
          }>
        }
      ).items.filter(entry => entry.type === 'registry:ui'))
        assert.ok(
          item.registryDependencies?.includes(
            'Potti1234/creaseui/crease-theme-css',
          ),
          `${file} ${item.name}`,
        )
  })
})
