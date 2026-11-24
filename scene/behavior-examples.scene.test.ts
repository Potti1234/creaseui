import { expect, it } from 'vitest'
import { examplesFor } from '@/docs/behavior-examples'
import { behaviors } from '@/docs/behavior-metadata'

it('gives every documented behavior a live example and Foldkit source in each renderer', () => {
  for (const renderer of ['tailwind', 'stylex', 'pleat'] as const) {
    for (const behavior of behaviors) {
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
