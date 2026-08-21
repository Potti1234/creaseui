import { authoredPage, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as State from '@/docs/components/catalog-state';
import * as Slider from '@/ui/slider';

const source = (name: string, initialValue: number, disabled: boolean): string => foldkitApplication({
  title: `Slider — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Slider from '@/ui/slider'`,
  model: `export const Model = S.Struct({
  slider: Slider.Model,
  volume: S.Number,
})
export type Model = typeof Model.Type`,
  messages: `export const GotSliderMessage = m('GotSliderMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { message: Slider.Message })
export const Message = S.Union([GotSliderMessage])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  {
    slider: Slider.init({ id: 'volume', min: 0, max: 100, step: 1 }),
    volume: ${String(initialValue)},
  },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'GotSliderMessage${name.replaceAll(/[^a-zA-Z0-9]/g, '')}': {
      const [slider, commands, maybeChange] = Slider.update(model.slider, message.message)
      return [
        {
          ...model,
          slider,
          volume: Option.match(maybeChange, {
            onNone: () => model.volume,
            onSome: change => change.value,
          }),
        },
        Command.mapMessages(commands, next => GotSliderMessage({ message: next })),
      ]
    }
  }
}`,
  subscriptions: `export const subscriptions = Subscription.aggregate<Model, Message>()(
  Subscription.lift({
    pointer: Slider.subscriptions.dragPointer,
    escape: Slider.subscriptions.dragEscape,
  })<Model, Message>({
    toChildModel: model => model.slider,
    toParentMessage: message => GotSliderMessage({ message }),
  }),
)`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Slider — ${name}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
    Slider.slider({
      model: model.slider,
      value: model.volume,
      toParentMessage: message => GotSliderMessage({ message }),
      label: 'Volume',
      formatValue: value => \`\${Math.round(value)} percent\`,
      ${disabled ? 'isDisabled: true,' : ''}
      class: 'max-w-sm',
    }, h),
    h.p([h.Class('mt-3 text-sm text-muted-foreground')], [
      \`Current value: \${Math.round(model.volume)}\`,
    ]),
  ]),
})`,
});

export const sliderPage = authoredPage({
  slug: 'slider', title: 'Slider', kind: 'submodel',
  definition: {
    kind: 'submodel', description: 'Selects a numeric value from a bounded range through pointer and keyboard interaction.',
    architecture: 'Slider keeps drag/focus mechanics in a child Model and reports value changes as OutMessages. The parent delegates Messages, maps Commands, stores the emitted value, and lifts pointer/Escape subscriptions.',
    apiHref: 'https://foldkit.dev/ui/slider',
    styling: 'Show a visible label or value when precision matters. Use rangeSlider only when the domain genuinely needs a lower and upper bound.',
    accessibility: 'The thumb exposes native slider semantics, bounds, current value, disabled state, and an accessible label. formatValue makes the numeric value meaningful to assistive technology.',
    keyboard: [['Arrow keys', 'Changes the value by one step.'], ['Home / End', 'Moves to the minimum or maximum.'], ['Escape', 'Cancels an active pointer drag through the lifted subscription.']],
    examples: [
      {
        title: 'Controlled volume', description: 'The child reports changes while the parent remains the source of truth for the numeric value.',
        preview: (model, h) => h.div([h.Class('w-full max-w-sm')], [Slider.slider({ model: model.slider, value: model.sliderValue, toParentMessage: (message) => State.GotSliderMessage({ message }), label: 'Volume', formatValue: (value) => `${Math.round(value)} percent` }, h), h.p([h.Class('mt-3 text-sm text-muted-foreground')], [`Current value: ${Math.round(model.sliderValue)}`])]),
        code: source('Controlled volume', 50, false),
      },
      {
        title: 'Disabled value', description: 'Disabled state preserves the current value and semantics without installing an alternate update path.',
        preview: (_model, h) => Slider.slider({ model: Slider.init({ id: 'docs-slider-disabled', min: 0, max: 100, step: 1 }), value: 65, toParentMessage: (message) => State.GotSliderMessage({ message }), label: 'Managed volume', isDisabled: true, class: 'max-w-sm' }, h),
        code: source('Disabled value', 65, true),
      },
    ],
  },
});
