import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { inertHtml } from 'foldkit/html'

import * as UiSidebar from '../src/ui/sidebar'
import * as PleatSidebar from '../src/pleat/sidebar'

/* sidebarMenuSubButton renders <button type="button"> without an href and
   <a> with one, so Message-navigating sub-items are keyboard reachable.
   (StyleX cannot execute uncompiled under node --test; the same assertions
   run for it in scene/sidebar-sub-button.scene.test.ts under vitest.) */

type Msg = { readonly _tag: 'SelectedSub' }
const Msg: Msg = { _tag: 'SelectedSub' }

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

const sel = (html: unknown): string => (html as { sel?: string })?.sel ?? ''

describe('sidebarMenuSubButton tag by href presence', () => {
  for (const [name, mod] of [
    ['tailwind', UiSidebar],
    ['pleat', PleatSidebar],
  ] as const) {
    it(`${name}: button without href, anchor with href`, () => {
      const asButton = mod.sidebarMenuSubButton(
        { children: ['Issues'], onClick: Msg },
        inertHtml,
      )
      assert.equal(sel(asButton), 'button')
      assert.equal(data(asButton)['type'], 'button')
      assert.equal(data(asButton)['href'], undefined)

      const asLink = mod.sidebarMenuSubButton(
        { children: ['Docs'], href: '#docs' },
        inertHtml,
      )
      assert.equal(sel(asLink), 'a')
      assert.equal(data(asLink)['href'], '#docs')
    })
  }
})
