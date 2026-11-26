import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { Effect, Schema } from 'effect'

import { Select } from '../src/ui/select'

test('an initially open Select renders selected and disabled options in labelled groups', async () => {
  const Fixture = Html.component({
    name: 'GroupedSelectFixture',
    model: Schema.Null,
    message: Schema.Never,
  }).make({
    init: () => null,
    update: $ => $.model,
    view: h =>
      Select(h, {
        label: 'Theme',
        props: {
          defaultOpen: true,
          items: [
            { value: 'light', label: 'Light' },
            { value: 'dim', label: 'Dim', disabled: true },
            { value: 'system', label: 'System' },
          ],
          value: 'light',
        },
        groupForItem: item => (item.value === 'system' ? 'System' : 'Themes'),
      }),
  })

  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Fixture, {}))
  assert.match(html, /role="combobox"[^>]*aria-expanded="true"/)
  assert.match(html, /role="listbox"/)
  assert.equal(html.match(/role="group"/g)?.length, 2)
  assert.match(html, /aria-selected="true"[^>]*><div[^>]*>Light<\/div>/)
  assert.match(html, /aria-disabled="true"[^>]*><div[^>]*>Dim<\/div>/)
})
