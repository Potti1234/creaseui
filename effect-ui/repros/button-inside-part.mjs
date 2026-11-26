import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { TestHost } from '@effect/ui/testing'
import { Button } from '@effect/ui-kit'
import { Effect, Schema } from 'effect'

const ChildMessage = UiSchema.TaggedEnum({ ChildPressed: {} })
const directHandler = process.argv.includes('--direct')
const Child = Html.component({
  name: 'Child',
  message: ChildMessage,
  model: Schema.Boolean,
}).make({
  init: () => false,
  update: { ChildPressed: () => true },
  parts: (p, pressed) => ({
    pressed,
    trigger: p.part('button', button =>
      directHandler
        ? button.on('click', ChildMessage.ChildPressed())
        : Button({ button }, { onPress: ChildMessage.ChildPressed() }),
    ),
  }),
})

const ParentMessage = UiSchema.TaggedEnum({ Unrelated: {} })
const Parent = Html.component({
  name: 'Parent',
  message: ParentMessage,
  model: Schema.Boolean,
}).make({
  init: () => false,
  update: { Unrelated: $ => $.model },
  view: h =>
    Child(h, {
      view: child =>
        h.div(
          child.trigger(h.button).children('Press'),
          h.output(child.pressed ? 'Pressed' : 'Waiting'),
        ),
    }),
})

await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const play = yield* HtmlPlay.make(Parent, {})
      yield* play.click(HtmlLocator.role('button', { name: 'Press' }))
      yield* play.expect(HtmlLocator.role('status')).toHaveText('Pressed')
    }),
  ).pipe(Effect.provide(TestHost.layer())),
)
console.log('Child rendered Pressed')
