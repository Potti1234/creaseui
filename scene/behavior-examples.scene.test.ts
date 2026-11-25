import { expect, it } from 'vitest'
import { examplesFor } from '@/docs/behavior-examples'
import {
  behaviors,
  coreBehaviors,
  compositionsFor,
} from '@/docs/behavior-metadata'
import { authoredPages } from '@/docs/components/pages'

it('gives every documented behavior a live example and Foldkit source in each renderer', () => {
  for (const renderer of ['tailwind', 'stylex', 'pleat'] as const) {
    for (const behavior of coreBehaviors) {
      const examples = examplesFor(behavior, renderer)
      expect(examples.length, `${renderer}: ${behavior.slug}`).toBeGreaterThan(
        0,
      )
      for (const example of examples) {
        expect(example.preview, behavior.slug).toMatch(/^\/src\/docs\//)
        expect(example.code, behavior.slug).toBeTruthy()
      }
    }
  }
})

it('moves component-specific entries to the pages with their component examples', () => {
  expect(coreBehaviors.map(entry => entry.slug)).not.toContain('field')
  expect(
    compositionsFor('field').find(entry => entry.slug === 'field')?.docs,
  ).toBe('/docs/components/field#implementation-field')
  for (const entry of behaviors.filter(
    behavior => behavior.kind === 'composition',
  )) {
    expect(entry.owner).toBeDefined()
    expect(
      authoredPages[entry.owner ?? '']?.definition.examples.length,
      entry.slug,
    ).toBeGreaterThan(0)
  }
})

it('picks behavior-specific previews when a component has several examples', () => {
  const expected = new Map([
    ['input-history', 'Chat History'],
    ['lasso', 'Lasso Selection'],
    ['spatial-focus', 'Spatial Focus'],
    ['scroll-picker', 'Hour and Minute Picker'],
    ['transfer', 'Schedule field checks'],
  ])
  for (const entry of behaviors) {
    const title = expected.get(entry.slug)
    if (title === undefined) continue
    expect(examplesFor(entry, 'tailwind')[0]?.title).toContain(title)
  }
})
