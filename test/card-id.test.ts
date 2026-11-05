import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { inertHtml } from 'foldkit/html'

import * as UiCard from '../src/ui/card'
import * as PleatCard from '../src/pleat/card'

/* card forwards `id` to its root element. StyleX cannot execute uncompiled
   under node --test; its copy runs in scene/card-id.scene.test.ts. */

const data = (html: unknown): Record<string, string> => {
  const d = (html as { data?: { attrs?: object; props?: object } })?.data
  return { ...(d?.attrs ?? {}), ...(d?.props ?? {}) } as Record<string, string>
}

describe('card id', () => {
  for (const [name, mod] of [
    ['tailwind', UiCard],
    ['pleat', PleatCard],
  ] as const) {
    it(`${name}: renders the given id and none by default`, () => {
      assert.equal(
        data(mod.card({ id: 'billing', children: [] }, inertHtml))['id'],
        'billing',
      )
      assert.equal(data(mod.card({ children: [] }, inertHtml))['id'], undefined)
    })
  }
})
