import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { inertHtml } from 'foldkit/html'

import * as UiSidebar from '../src/ui/sidebar'
import * as PleatSidebar from '../src/pleat/sidebar'

/* An active sidebar link is the current page; an active button is not a
   link. StyleX cannot execute uncompiled under node --test; its copy runs in
   scene/sidebar-aria-current.scene.test.ts. */

type Msg = { readonly _tag: 'Selected' }
const Msg: Msg = { _tag: 'Selected' }

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

describe('sidebar aria-current', () => {
  for (const [name, mod] of [
    ['tailwind', UiSidebar],
    ['pleat', PleatSidebar],
  ] as const) {
    it(`${name}: active menu and sub links carry aria-current="page"`, () => {
      const active = mod.sidebarMenuButton(
        { children: ['Inbox'], href: '/inbox', isActive: true },
        inertHtml,
      )
      const inactive = mod.sidebarMenuButton(
        { children: ['Inbox'], href: '/inbox' },
        inertHtml,
      )
      const activeSub = mod.sidebarMenuSubButton(
        { children: ['Docs'], href: '#docs', isActive: true },
        inertHtml,
      )
      assert.equal(data(active)['aria-current'], 'page')
      assert.equal(data(inactive)['aria-current'], undefined)
      assert.equal(data(activeSub)['aria-current'], 'page')
    })

    it(`${name}: an active button is not marked as a page`, () => {
      const button = mod.sidebarMenuButton(
        { children: ['Inbox'], onClick: Msg, isActive: true },
        inertHtml,
      )
      const subButton = mod.sidebarMenuSubButton(
        { children: ['Issues'], onClick: Msg, isActive: true },
        inertHtml,
      )
      assert.equal(data(button)['aria-current'], undefined)
      assert.equal(data(subButton)['aria-current'], undefined)
    })
  }
})
