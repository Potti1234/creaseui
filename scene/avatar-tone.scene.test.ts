import { describe, expect, it } from 'vitest'
import { inertHtml } from 'foldkit/html'

import * as UiAvatar from '../src/ui/avatar'
import * as StylexAvatar from '../src/stylex/avatar'

/* Same assertions as test/avatar-tone.test.ts for the renderers node
   --test can execute, plus StyleX (compiled by vitest). Pleat needs a
   real stylesheet and stays in the node test. */

const classes = (html: unknown): ReadonlyArray<string> =>
  Object.keys(
    (html as { data?: { class?: Record<string, boolean> } })?.data?.class ?? {},
  )

describe('avatarFallback tone', () => {
  it('tailwind: accent applies the primary tint classes', () => {
    const cls = classes(
      UiAvatar.avatarFallback({ children: ['AM'], tone: 'accent' }, inertHtml),
    )
    for (const expected of ['bg-primary/15', 'font-medium', 'text-primary'])
      expect(cls).toContain(expected)
    expect(
      classes(UiAvatar.avatarFallback({ children: ['AM'] }, inertHtml)),
    ).toContain('bg-muted')
  })

  it('stylex: accent produces a different class set than muted', () => {
    const accent = classes(
      StylexAvatar.avatarFallback(
        { children: ['AM'], tone: 'accent' },
        inertHtml,
      ),
    )
    const muted = classes(
      StylexAvatar.avatarFallback({ children: ['AM'] }, inertHtml),
    )
    expect(accent).not.toEqual(muted)
    const accentCount = classes(
      StylexAvatar.avatarGroupCount(
        { children: ['+3'], tone: 'accent' },
        inertHtml,
      ),
    )
    const mutedCount = classes(
      StylexAvatar.avatarGroupCount({ children: ['+3'] }, inertHtml),
    )
    expect(accentCount).not.toEqual(mutedCount)
  })
})
