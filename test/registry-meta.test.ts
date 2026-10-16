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
})
