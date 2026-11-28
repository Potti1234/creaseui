import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { Locator, TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

import { Collapsible } from '../src/ui/collapsible'

const Fixture = Html.component({
  name: 'CollapsibleFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    Collapsible(h, {
      id: 'details',
      props: { keepMounted: 'css' },
      trigger: h.button.children('Details'),
      content: 'Content stays mounted.',
    }),
})

test('Collapsible keeps CSS-hidden content mounted and links the opened panel', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const { html } = yield* HtmlServer.renderToHtml(Fixture, {})
        assert.match(html, /data-css-hidden/)
        assert.match(html, /Content stays mounted\./)

        const play = yield* HtmlPlay.make(Fixture, {})
        const trigger = HtmlLocator.role('button', { name: 'Details' })
        const panel = Locator.attr('id', 'details')
        yield* play.expect(panel).toHaveAttribute('data-css-hidden')
        yield* play.click(trigger)
        yield* play.expect(trigger).toHaveAttribute('aria-controls', 'details')
        yield* play.expect(trigger).toHaveAttribute('aria-expanded', 'true')
        yield* play.expect(panel).toHaveAttribute('data-css-hidden', false)
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))
