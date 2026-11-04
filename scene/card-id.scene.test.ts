import { describe, expect, it } from 'vitest'
import { inertHtml } from 'foldkit/html'

import * as StylexCard from '../src/stylex/card'

/* StyleX copy of test/card-id.test.ts (StyleX needs vitest's compile step). */

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

describe('stylex card id', () => {
  it('renders the given id and none by default', () => {
    expect(
      data(StylexCard.card({ id: 'billing', children: [] }, inertHtml))['id'],
    ).toBe('billing')
    expect(
      data(StylexCard.card({ children: [] }, inertHtml))['id'],
    ).toBeUndefined()
  })
})
