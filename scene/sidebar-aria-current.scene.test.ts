import { describe, expect, it } from 'vitest'
import { inertHtml } from 'foldkit/html'

import * as StylexSidebar from '../src/stylex/sidebar'

/* StyleX copy of test/sidebar-aria-current.test.ts. */

type Msg = { readonly _tag: 'Selected' }
const Msg: Msg = { _tag: 'Selected' }

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

describe('stylex sidebar aria-current', () => {
  it('marks active links, not active buttons', () => {
    const link = StylexSidebar.sidebarMenuButton(
      { children: ['Inbox'], href: '/inbox', isActive: true },
      inertHtml,
    )
    const button = StylexSidebar.sidebarMenuButton(
      { children: ['Inbox'], onClick: Msg, isActive: true },
      inertHtml,
    )
    expect(data(link)['aria-current']).toBe('page')
    expect(data(button)['aria-current']).toBeUndefined()
  })
})
