import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

import { Accordion } from '../src/ui/accordion'

const Fixture = Html.component({
  name: 'AccordionFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    Accordion(h, {
      props: { defaultValue: ['delivery'], hiddenUntilFound: true },
      items: [
        {
          value: 'delivery',
          trigger: 'Delivery',
          content: 'Three to five days.',
        },
        { value: 'returns', trigger: 'Returns', content: 'Within 30 days.' },
      ],
    }),
})

test('Accordion items share local value and keep closed content searchable', () =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const { html } = yield* HtmlServer.renderToHtml(Fixture, {})
        assert.match(html, /hidden="until-found"/)
        assert.match(html, /Within 30 days\./)

        const play = yield* HtmlPlay.make(Fixture, {})
        const delivery = HtmlLocator.role('button', { name: 'Delivery' })
        const returns = HtmlLocator.role('button', { name: 'Returns' })
        yield* play.expect(delivery).toHaveAttribute('aria-expanded', 'true')
        yield* play.click(returns)
        yield* play.expect(delivery).toHaveAttribute('aria-expanded', 'false')
        yield* play.expect(returns).toHaveAttribute('aria-expanded', 'true')
      }),
    ).pipe(Effect.provide(TestHost.layer())),
  ))
