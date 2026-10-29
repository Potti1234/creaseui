import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { inertHtml } from 'foldkit/html'

import * as UiAvatar from '../src/ui/avatar'
import * as PleatAvatar from '../src/pleat/avatar'

/* avatarFallback and avatarGroupCount take a `tone` prop: 'muted'
   (default, unchanged bg-muted) or 'accent' (primary-tinted, for surfaces
   that equal --muted, like the preset sidebar). Pleat's generated class
   names are opaque, so its assertions compare class sets across tones.
   (StyleX cannot execute uncompiled under node --test; its copy of this
   test runs in scene/avatar-tone.scene.test.ts under vitest.) */

const classes = (html: unknown): ReadonlyArray<string> =>
  Object.keys(
    (html as { data?: { class?: Record<string, boolean> } })?.data?.class ?? {},
  )

describe('avatarFallback tone', () => {
  it('tailwind: accent applies the primary tint classes', () => {
    const html = UiAvatar.avatarFallback(
      { children: ['AM'], tone: 'accent' },
      inertHtml,
    )
    const cls = classes(html)
    for (const expected of ['bg-primary/15', 'font-medium', 'text-primary'])
      assert.ok(cls.includes(expected), `missing ${expected}`)
  })

  it('tailwind: muted (default) keeps the muted classes', () => {
    for (const props of [
      { children: ['AM'] },
      { children: ['AM'], tone: 'muted' as const },
    ]) {
      const cls = classes(UiAvatar.avatarFallback(props, inertHtml))
      assert.ok(cls.includes('bg-muted'))
      assert.ok(!cls.includes('bg-primary/15'))
      assert.ok(!cls.includes('text-primary'))
    }
  })

  it('tailwind: avatarGroupCount takes the same tone', () => {
    const accent = classes(
      UiAvatar.avatarGroupCount(
        { children: ['+3'], tone: 'accent' },
        inertHtml,
      ),
    )
    assert.ok(accent.includes('bg-primary/15'))
    const muted = classes(
      UiAvatar.avatarGroupCount({ children: ['+3'] }, inertHtml),
    )
    assert.ok(muted.includes('bg-muted'))
    assert.ok(!muted.includes('bg-primary/15'))
  })

  it('pleat: accent produces a different class set than muted', () => {
    const accent = classes(
      PleatAvatar.avatarFallback(
        { children: ['AM'], tone: 'accent' },
        inertHtml,
      ),
    )
    const muted = classes(
      PleatAvatar.avatarFallback({ children: ['AM'] }, inertHtml),
    )
    assert.notDeepEqual(accent, muted)
    const accentCount = classes(
      PleatAvatar.avatarGroupCount(
        { children: ['+3'], tone: 'accent' },
        inertHtml,
      ),
    )
    const mutedCount = classes(
      PleatAvatar.avatarGroupCount({ children: ['+3'] }, inertHtml),
    )
    assert.notDeepEqual(accentCount, mutedCount)
  })
})
