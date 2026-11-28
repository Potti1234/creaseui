import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Html, HtmlServer } from '@effect/ui/html'
import { Effect, Schema } from 'effect'

import { Field } from '../src/ui/field'
import { Fieldset } from '../src/ui/fieldset'
import { Input } from '../src/ui/input'

const Fixture = Html.component({
  name: 'FieldFixture',
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: $ => $.model,
  view: h =>
    h.form(
      Field(h, {
        props: { id: 'nickname', invalid: true },
        label: 'Nickname',
        description: 'Visible on your profile.',
        error: 'Enter a nickname.',
        control: field =>
          Input(h, {
            id: 'nickname',
            element: field.control(h.input),
            props: { value: '' },
          }),
      }),
      Fieldset(h, {
        id: 'locked-details',
        props: { disabled: true },
        legend: 'Locked details',
        content: Field(h, {
          props: { id: 'locked-input', invalid: true },
          label: 'Locked field',
          error: 'This error is hidden.',
          control: field =>
            Input(h, {
              id: 'locked-input',
              element: field.control(h.input),
              props: { value: '' },
            }),
        }),
      }),
    ),
})

test('Field connects the label and help and inherits disabled state from Fieldset', async () => {
  const { html } = await Effect.runPromise(HtmlServer.renderToHtml(Fixture, {}))
  assert.match(html, /<label[^>]*for="nickname"[^>]*>Nickname<\/label>/)
  const input =
    /<input(?=[^>]*id="nickname")(?=[^>]*aria-invalid="true")[^>]*aria-describedby="([^"]+)"[^>]*>/.exec(
      html,
    )
  assert.ok(input)
  const describedBy = input[1]?.split(' ') ?? []
  assert.equal(describedBy.length, 2)
  for (const id of describedBy) assert.ok(html.includes(` id="${id}"`))
  assert.match(
    html,
    /<input(?=[^>]*id="locked-input")(?=[^>]*\sdisabled(?:\s|>))[^>]*>/,
  )
  assert.doesNotMatch(html, /This error is hidden/)
})
