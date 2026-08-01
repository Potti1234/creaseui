import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { describe, it } from 'node:test'

import { hasRealPreview } from '../src/docs/components/real-previews.ts'
import {
  dedicatedExampleTitles,
  hasDedicatedDefinition,
} from '../src/docs/components/catalog.ts'
import { definitions as earlyDefinitions } from '../src/docs/components/definitions/a-to-command.ts'
import { definitions as middleDefinitions } from '../src/docs/components/definitions/context-to-pagination.ts'
import { definitions as lateDefinitions } from '../src/docs/components/definitions/popover-to-typography.ts'

const registry = JSON.parse(readFileSync('src/ui/registry.json', 'utf8')) as {
  items: ReadonlyArray<{
    name: string
    type: string
    title: string
    description: string
    files: ReadonlyArray<{ path: string; target: string }>
  }>
}
const componentPage = readFileSync('src/docs/component-page.ts', 'utf8')
const catalog = readFileSync('src/docs/components/catalog.ts', 'utf8')
const roadmap = JSON.parse(readFileSync('docs/component-roadmap.json', 'utf8')) as {
  documentation: { complete: ReadonlyArray<string>; next: ReadonlyArray<string> }
  fidelity: ReadonlyArray<{ component: string; priority: string; gap: string }>
  missing: ReadonlyArray<{ component: string; priority: string; strategy: string }>
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

  it('contains no documentation placeholder copy', () => {
    assert.doesNotMatch(catalog, /being verified|representative .* composition/i)
  })

  it('shows concrete Foldkit source instead of prose or markup placeholders', () => {
    const definitions = { ...earlyDefinitions, ...middleDefinitions, ...lateDefinitions }
    for (const [slug, definition] of Object.entries(definitions)) {
      for (const example of definition.examples) {
        assert.doesNotMatch(example.code, /Basic [A-Za-z]+ example/i, `${slug}/${example.title}`)
        assert.doesNotMatch(example.code, /\.\.\.\s*[,})\]]/, `${slug}/${example.title}`)
        assert.doesNotMatch(example.code, /<\/?(?:Direction|div|fieldset|legend)\b/, `${slug}/${example.title}`)
      }
    }
  })

  it('renders a real Crease UI component for every shared catalog page', () => {
    const dedicatedStatefulPages = new Set(['accordion', 'calendar'])
    assert.deepEqual(
      documentedSlugs.filter(
        slug => !dedicatedStatefulPages.has(slug) && !hasRealPreview(slug),
      ),
      [],
    )
  })

  it('has a component-specific shadcn-style definition for every shared route', () => {
    const standalonePages = new Set(['accordion', 'calendar'])
    assert.deepEqual(
      documentedSlugs.filter(
        slug => !standalonePages.has(slug) && !hasDedicatedDefinition(slug),
      ),
      [],
    )
  })

  it('provides multiple component-specific examples instead of a generic Basic page', () => {
    const standalonePages = new Set(['accordion', 'calendar'])
    const shallowPages = documentedSlugs.filter(
      slug =>
        !standalonePages.has(slug) && dedicatedExampleTitles(slug).length < 2,
    )
    assert.deepEqual(shallowPages, [])
  })

  it('keeps standalone component pages in the coverage contract', () => {
    const accordion = readFileSync('src/docs/components/accordion.ts', 'utf8')
    const calendar = readFileSync('src/docs/components/calendar.ts', 'utf8')

    assert.match(accordion, /componentPage<Message>/)
    assert.match(calendar, /componentPage<Message>/)
    assert.match(accordion, /examples:/)
    assert.match(calendar, /examples:/)
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

  it('tracks documentation and fidelity status explicitly', () => {
    assert.ok(roadmap.documentation.complete.length > 0)
    assert.ok(roadmap.fidelity.every(item => item.component && item.priority && item.gap))
    assert.deepEqual(roadmap.missing, [])
  })
})
