import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { describe, it } from 'node:test'
import { Schema as S } from 'effect'

import {
  componentKind,
  GotExampleMessage,
  dedicatedExampleTitles,
  hasDedicatedDefinition,
  init as initCatalog,
  Message as CatalogMessage,
} from '../src/docs/components/catalog.ts'
import { authoredPages } from '../src/docs/components/pages/index.ts'

const registry = JSON.parse(readFileSync('src/ui/registry.json', 'utf8')) as {
  items: ReadonlyArray<{
    name: string
    type: string
    title: string
    description: string
    dependencies?: ReadonlyArray<string>
    registryDependencies?: ReadonlyArray<string>
    files: ReadonlyArray<{ path: string; target: string }>
  }>
}
const rootRegistry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
  include: ReadonlyArray<string>
}
const presetRegistry = JSON.parse(
  readFileSync('registry/presets/registry.json', 'utf8'),
) as {
  items: ReadonlyArray<{
    name: string
    registryDependencies: ReadonlyArray<string>
  }>
}
const componentPage = readFileSync('src/docs/component-page.ts', 'utf8')
const catalog = readFileSync('src/docs/components/catalog.ts', 'utf8')
const roadmap = JSON.parse(readFileSync('docs/component-roadmap.json', 'utf8')) as {
  documentation: { complete: ReadonlyArray<string>; next: ReadonlyArray<string> }
  fidelity: ReadonlyArray<{ component: string; priority: string; gap: string }>
  missing: ReadonlyArray<{ component: string; priority: string; strategy: string }>
}
const compatibility = JSON.parse(readFileSync('compatibility.json', 'utf8')) as {
  effect: string
  foldkit: string
  foldkitUi: string
}
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies: Readonly<Record<string, string>>
}
const docsIndex = JSON.parse(readFileSync('public/docs-index.json', 'utf8')) as {
  componentCount: number
  components: ReadonlyArray<{
    slug: string
    examples: ReadonlyArray<string>
    api: ReadonlyArray<{ name: string; kind: string; signature: string }>
  }>
}

const componentBlock = componentPage.match(/export const COMPONENTS = \[([\s\S]*?)\] as const/)?.[1] ?? ''
const documentedSlugs = Array.from(componentBlock.matchAll(/'([^']+)'/g), match =>
  (match[1] ?? '').toLowerCase().replaceAll(' ', '-'),
).sort()
const registrySlugs = registry.items
  .filter(item => item.type === 'registry:ui')
  .map(item => item.name)
  .sort()

describe('component catalog coverage', () => {
  it('documents every registry UI item and no stale component routes', () => {
    assert.deepEqual(documentedSlugs, registrySlugs)
  })

  it('publishes generated discovery metadata for every registry UI item', () => {
    const generatedCatalog = readFileSync('docs/component-catalog.md', 'utf8')

    for (const item of registry.items) {
      assert.match(generatedCatalog, new RegExp(`Potti1234/creaseui/${item.name}\\x60`))
    }
    assert.match(generatedCatalog, /\| Category \| State \| Additional requirements \|/)
    assert.match(generatedCatalog, /\| Stateful \|/)
    assert.match(generatedCatalog, /\| Stateless \|/)
  })

  it('points every registry item at an existing source file and matching target', () => {
    for (const item of registry.items) {
      assert.ok(item.title.trim(), `${item.name} is missing a title`)
      assert.ok(item.description.trim(), `${item.name} is missing a description`)
      assert.ok(item.files.length > 0, `${item.name} has no files`)

      for (const file of item.files) {
        assert.ok(existsSync(`src/ui/${file.path}`), `${item.name}: missing ${file.path}`)
        assert.equal(
          basename(file.target),
          basename(file.path),
          `${item.name}: registry target does not match its source file`,
        )
      }
    }
  })

  it('does not replace framework versions in consumer applications', () => {
    const frameworkPackages = ['@effect/platform-browser', '@foldkit/ui', 'effect', 'foldkit']
    const pinnedFrameworkDependencies = registry.items.flatMap(item =>
      (item.dependencies ?? []).filter(dependency =>
        frameworkPackages.some(packageName =>
          dependency === packageName || dependency.startsWith(`${packageName}@`),
        ),
      ),
    )

    assert.deepEqual(pinnedFrameworkDependencies, [])
  })

  it('installs the complete theme with every component and the core preset', () => {
    assert.ok(
      registry.items.every(item =>
        item.registryDependencies?.includes('Potti1234/creaseui/crease-theme'),
      ),
    )
    assert.ok(rootRegistry.include.includes('registry/presets/registry.json'))
    const core = presetRegistry.items.find(item => item.name === 'crease-core')
    assert.ok(core?.registryDependencies.includes('Potti1234/creaseui/utils'))
    assert.ok(core?.registryDependencies.includes('Potti1234/creaseui/button'))
  })

  it('publishes complete item list semantics and closed semantic element choices', () => {
    const item = readFileSync('src/ui/item.ts', 'utf8')
    const card = readFileSync('src/ui/card.ts', 'utf8')

    assert.match(item, /h\.Role\('listitem'\)/)
    assert.match(item, /element\?: 'div' \| 'li' \| 'article'/)
    assert.match(card, /element\?: 'div' \| 'section' \| 'article'/)
  })

  it('publishes the framework versions used to validate Crease UI', () => {
    assert.equal(packageJson.dependencies.effect, compatibility.effect)
    assert.match(packageJson.dependencies.foldkit, /0\.148\./)
    assert.match(packageJson.dependencies['@foldkit/ui'] ?? '', /0\.148\./)
    assert.equal(compatibility.foldkit, '0.148.x')
    assert.equal(compatibility.foldkitUi, '0.148.x')
  })

  it('documents reproducible and local-checkout registry installation', () => {
    const registryGuide = readFileSync('docs/registry.md', 'utf8')
    const localInstaller = readFileSync('scripts/install-local-registry.mjs', 'utf8')

    assert.match(registryGuide, /button#v0\.1\.0/)
    assert.match(registryGuide, /registry:install-local/)
    assert.match(localInstaller, /shadcn@latest', 'build'/)
    assert.match(localInstaller, /127\.0\.0\.1/)
  })

  it('contains no documentation placeholder copy', () => {
    assert.doesNotMatch(catalog, /being verified|representative .* composition/i)
  })

  it('documents Foldkit architecture instead of assigning state to every component', () => {
    assert.equal(componentKind('button'), 'helper')
    assert.equal(componentKind('dialog'), 'submodel')
    assert.equal(componentKind('toast'), 'recipe')
    assert.match(componentPage, /How it fits Foldkit/)
  })

  it('keeps authored page examples as complete Foldkit applications', () => {
    assert.ok(Object.keys(authoredPages).length > 0)

    for (const page of Object.values(authoredPages)) {
      assert.equal(page.slug, page.slug.toLowerCase())
      assert.equal(page.kind, page.definition.kind)
      for (const example of page.definition.examples) {
        for (const section of [
          '// MODEL',
          '// MESSAGES',
          '// INIT',
          '// UPDATE',
          '// SUBSCRIPTIONS',
          '// VIEW',
          '// RUNTIME',
        ]) {
          assert.match(example.code, new RegExp(section), `${page.slug}/${example.title}`)
        }
        assert.match(example.code, /Runtime\.makeApplication/, `${page.slug}/${example.title}`)
        assert.doesNotMatch(example.code, /\bviewConfig\b/, `${page.slug}/${example.title}`)
      }
    }
  })

  it('shows concrete Foldkit source instead of prose or markup placeholders', () => {
    for (const [slug, page] of Object.entries(authoredPages)) {
      for (const example of page.definition.examples) {
        assert.doesNotMatch(example.code, /Basic [A-Za-z]+ example/i, `${slug}/${example.title}`)
        assert.doesNotMatch(example.code, /\.\.\.\s*[,})\]]/, `${slug}/${example.title}`)
        assert.doesNotMatch(example.code, /<\/?(?:Direction|div|fieldset|legend)\b/, `${slug}/${example.title}`)
      }
    }
  })

  it('publishes searchable and LLM-readable API metadata', () => {
    assert.equal(docsIndex.componentCount, registrySlugs.length)
    assert.deepEqual(docsIndex.components.map(component => component.slug).sort(), registrySlugs)
    assert.ok(docsIndex.components.every(component => component.examples.length >= 2))
    assert.ok(docsIndex.components.every(component => component.api.length > 0))
    assert.ok(
      docsIndex.components.every(component =>
        component.api.every(entry => entry.name && entry.kind && entry.signature),
      ),
    )
    const llms = readFileSync('public/llms.txt', 'utf8')
    const llmsFull = readFileSync('public/llms-full.txt', 'utf8')
    for (const slug of registrySlugs) {
      assert.match(llms, new RegExp(`/docs/components/${slug}(?:\\s|$)`))
      assert.match(llmsFull, new RegExp(`src/ui/${slug}\\.ts`))
    }
  })

  it('owns every component route in an authored page module', () => {
    assert.deepEqual(Object.keys(authoredPages).sort(), documentedSlugs)
  })

  it('keeps static page previews in route-local models', () => {
    const chart = initCatalog('chart')
    assert.deepEqual(chart.examples, [{ _docsPage: 'chart' }, { _docsPage: 'chart' }])
    assert.ok(!('dialog' in (chart.examples[0] ?? {})))
    for (const page of Object.values(authoredPages)) {
      if (page.previewMode !== 'static') continue
      assert.ok(
        page.definition.examples.every(example => example.staticPreview !== undefined),
        `${page.slug} must author every static preview`,
      )
    }
  })

  it('has a component-specific shadcn-style definition for every shared route', () => {
    assert.deepEqual(
      documentedSlugs.filter(slug => !hasDedicatedDefinition(slug)),
      [],
    )
  })

  it('provides multiple component-specific examples instead of a generic Basic page', () => {
    const shallowPages = documentedSlugs.filter(
      slug => dedicatedExampleTitles(slug).length < 2,
    )
    assert.deepEqual(shallowPages, [])
  })

  it('does not allow definitions to exceed the allocated example state capacity', () => {
    const capacity = Number(catalog.match(/EXAMPLE_STATE_COUNT = (\d+)/)?.[1] ?? 0)
    assert.ok(capacity > 0, 'catalog example state capacity is not declared')

    for (const slug of documentedSlugs) {
      if (slug === 'accordion' || slug === 'calendar') continue
      assert.ok(
        dedicatedExampleTitles(slug).length <= capacity,
        `${slug} exceeds the ${capacity}-state catalog capacity`,
      )
    }
  })

  it('decodes the routed preview envelope at the catalog boundary', () => {
    const message = GotExampleMessage({
      index: 0,
      message: { _tag: 'RoutedDocsPreviewMessage', messageJson: JSON.stringify({ _tag: 'GotDropdownPreviewMessage', message: { _tag: 'Opened' } }) },
    })
    assert.deepEqual(S.decodeUnknownSync(CatalogMessage)(message), message)
  })

  it('tracks documentation and fidelity status explicitly', () => {
    assert.ok(roadmap.documentation.complete.length > 0)
    assert.ok(roadmap.fidelity.every(item => item.component && item.priority && item.gap))
    assert.deepEqual(roadmap.missing, [])
  })
})
