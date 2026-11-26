import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { HtmlLocator, HtmlPlay } from '@effect/ui/html/testing'
import { TestHost } from '@effect/ui/testing'
import { Effect, Schema } from 'effect'

const ChildMessage = UiSchema.TaggedEnum({ ChildPressed: {} })
const mode = process.argv[2]
const kit =
  mode === '--forward' || mode === '--direct'
    ? undefined
    : await import('@effect/ui-kit')
const Child = Html.component({
  name: 'Child',
  message: ChildMessage,
  model: Schema.Boolean,
}).make({
  init: () => false,
  update: { ChildPressed: () => true },
  parts: (p, pressed) => ({
    pressed,
    trigger: p.part('button', button => {
      const pressed = ChildMessage.ChildPressed()
      if (kit) return kit.Button({ button }, { onPress: pressed })
      if (mode === '--forward')
        return button.forward(node => node.on('click', pressed))
      return button.on('click', pressed)
    }),
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
