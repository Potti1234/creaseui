import { describe, expect, it } from 'vitest'
import { inertHtml } from 'foldkit/html'

import * as UiSidebar from '../src/ui/sidebar'
import * as StylexSidebar from '../src/stylex/sidebar'

/* sidebarMenuSubButton must render a <button type="button"> when it
   navigates by Message (no href) — an <a> without href is unreachable
   by keyboard — and an <a> when an href is given. StyleX needs vitest's
   compile step to execute; Pleat needs a real stylesheet, so Pleat's
   copy of this test runs under node --test in
   test/sidebar-sub-button.test.ts instead. */

type Msg = { readonly _tag: 'SelectedSub' }
const Msg: Msg = { _tag: 'SelectedSub' }

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

const sel = (html: unknown): string => (html as { sel?: string })?.sel ?? ''

describe('sidebarMenuSubButton', () => {
  for (const [name, mod] of [
    ['tailwind', UiSidebar],
    ['stylex', StylexSidebar],
  ] as const) {
    it(`${name}: renders a button when no href is given`, () => {
      const html = mod.sidebarMenuSubButton(
        { children: ['Issues'], onClick: Msg },
        inertHtml,
      )
      expect(sel(html)).toBe('button')
      expect(data(html)['type']).toBe('button')
      expect(data(html)['href']).toBeUndefined()
    })

    it(`${name}: renders an anchor when an href is given`, () => {
      const html = mod.sidebarMenuSubButton(
        { children: ['Docs'], href: '#docs' },
        inertHtml,
      )
      expect(sel(html)).toBe('a')
      expect(data(html)['href']).toBe('#docs')
    })
  }
})
