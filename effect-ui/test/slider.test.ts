import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { Effect, Schema } from 'effect'

import { Slider } from '../src/ui/slider'

const Fixture = Html.component({
  name: 'SliderFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.form(
      Slider(h, {
        key: 'limit',
        props: { value: 72, step: 5 },
        label: 'Limit',
        name: 'limit',
        readOnly: true,
      }),
      Slider(h, {
        key: 'range',
        props: { value: [20, 70] },
        thumbLabels: ['Minimum', 'Maximum'],
        name: 'range',
      }),
    ),
})

test('read-only Slider exposes the normalized value once and keeps a form value', async () => {
  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Fixture, {}))
  assert.match(
    html,
    /role="slider"[^>]*tabindex="0"[^>]*aria-readonly="true"[^>]*aria-valuenow="70"/,
  )
  assert.match(
    html,
    /<input(?=[^>]*aria-hidden="true")(?=[^>]*type="range")(?=[^>]*\bdisabled)[^>]*>/,
  )
  assert.match(html, /<input type="hidden" name="limit" value="70"/)
  assert.equal(
    [
      ...html.matchAll(
        /<input(?=[^>]*name="range")(?=[^>]*type="range")[^>]*>/g,
      ),
    ].length,
    2,
  )
})
