import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('Carousel lifecycle ownership', () => {
  const behavior = readFileSync('src/lib/carousel.ts', 'utf8')

  it('keeps Embla exclusively in the shared mounted resource', () => {
    assert.match(behavior, /EmblaCarousel\(/u)
    assert.match(behavior, /Effect\.acquireRelease/u)
    for (const skin of ['src/ui/carousel.ts', 'src/stylex/carousel.ts']) {
      const source = readFileSync(skin, 'utf8')
      assert.match(source, /CarouselBehavior\.mountCarousel/u)
      assert.doesNotMatch(source, /EmblaCarousel\(/u)
      assert.doesNotMatch(source, /Effect\.acquireRelease/u)
    }
  })

  it('removes listeners and destroys Embla during cleanup', () => {
    assert.match(behavior, /removeEventListener\('click'/u)
    assert.match(behavior, /removeEventListener\('keydown'/u)
    assert.match(behavior, /api\.off\('select'/u)
    assert.match(behavior, /api\.destroy\(\)/u)
  })

  it('disables animation and plugins, including autoplay, for reduced motion', () => {
    assert.match(behavior, /prefers-reduced-motion: reduce/u)
    assert.match(behavior, /duration: 0/u)
    assert.match(behavior, /reducedMotion \? \[\] : \[\.\.\.props\.plugins\]/u)
  })

  it('keeps only observed selection in the serializable child model', () => {
    assert.match(behavior, /WentTo/u)
    assert.doesNotMatch(behavior, /export const (Previous|Next)/u)
    assert.doesNotThrow(() => JSON.stringify({ ...({ id: 'gallery', index: 1, count: 3 }) }))
  })
})
