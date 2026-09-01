import { Option, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import { m } from 'foldkit/message';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Slider from '@/ui/slider';

const GotSliderPreviewMessage = m('GotSliderPreviewMessage', { message: Slider.Message });
const ChangedRangePreview = m('ChangedRangeSliderPreview', { lower: S.Number, upper: S.Number });
const SliderPreviewMessage = S.Union([GotSliderPreviewMessage, ChangedRangePreview]);
type SliderPreviewMessage = typeof SliderPreviewMessage.Type;
const SliderPreviewModel = S.Struct({ _docsPage: S.Literal('slider'), slider: Slider.Model, value: S.Number, range: S.Tuple([S.Number, S.Number]) });
type SliderPreviewModel = typeof SliderPreviewModel.Type;
const previewProgram = definePreviewProgram<SliderPreviewModel, SliderPreviewMessage>({
  Model: SliderPreviewModel, Message: SliderPreviewMessage,
  init: index => ({ _docsPage: 'slider', slider: Slider.init({ id: `docs-slider-${String(index)}`, min: 0, max: 100, step: index === 1 ? 5 : 1 }), value: index === 0 ? 50 : 65, range: [25, 75] }),
  update: (model, message) => {
    if (message._tag === 'ChangedRangeSliderPreview') {
      return [{ ...model, range: [message.lower, message.upper] }, []];
    }
    const [slider, commands, maybeChange] = Slider.update(model.slider, message.message);
    return [{ ...model, slider, value: Option.match(maybeChange, { onNone: () => model.value, onSome: change => change.value }) }, Command.mapMessages(commands, next => GotSliderPreviewMessage({ message: next }))];
  },
  subscriptions: Subscription.lift({ pointer: Slider.subscriptions.dragPointer, escape: Slider.subscriptions.dragEscape })<SliderPreviewModel, SliderPreviewMessage>({
    toChildModel: model => model.slider,
    toParentMessage: message => GotSliderPreviewMessage({ message }),
  }),
  view: (index, model, h) => index === 0
    ? h.div([h.Class('w-full max-w-sm')], [Slider.slider({ model: model.slider, value: model.value, toParentMessage: message => GotSliderPreviewMessage({ message }), label: 'Volume', formatValue: value => `${Math.round(value)} percent`, name: 'volume' }, h), h.p([h.Class('mt-3 text-sm text-muted-foreground')], [`Current value: ${Math.round(model.value)}`])])
    : index === 1
      ? Slider.slider({ model: model.slider, value: model.value, toParentMessage: message => GotSliderPreviewMessage({ message }), label: 'Managed volume', isReadOnly: true, class: 'max-w-sm' }, h)
      : h.div([h.Class(index === 3 ? 'h-48' : 'w-full max-w-sm')], [Slider.rangeSlider({ values: model.range, min: index === 4 ? 100 : 0, max: index === 4 ? 0 : 100, step: index === 4 ? 0 : 1, onInput: ([lower, upper]) => ChangedRangePreview({ lower, upper }), orientation: index === 3 ? 'vertical' : 'horizontal', ...(index === 2 ? { direction: 'rtl' as const } : {}), ariaLabels: ['Minimum price', 'Maximum price'], formatValue: value => `$${String(value)}`, name: 'price' }, h)]),
});

const source = (name: string, initialValue: number, readOnly: boolean): string => foldkitApplication({
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
      ${readOnly ? 'isReadOnly: true,' : ''}
      class: 'max-w-sm',
    }, h),
    h.p([h.Class('mt-3 text-sm text-muted-foreground')], [
      \`Current value: \${Math.round(model.volume)}\`,
    ]),
  ]),
})`,
});

const rangeSource = (name: string, extra: string): string => foldkitApplication({
  title: `Slider — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Slider from '@/ui/slider'`,
  model: `export const Model = S.Struct({ values: S.Tuple([S.Number, S.Number]) })
export type Model = typeof Model.Type`,
  messages: `export const ChangedRange = m('ChangedRange${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { lower: S.Number, upper: S.Number })
export const Message = S.Union([ChangedRange])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { values: [25, 75] },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { ...model, values: [message.lower, message.upper] },
  [],
]`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Slider — ${name}',
  body: h.main([h.Class('mx-auto max-w-md p-8')], [
    Slider.rangeSlider({
      values: model.values,
      min: ${name === 'Normalized bounds' ? '100' : '0'},
      max: ${name === 'Normalized bounds' ? '0' : '100'},
      step: ${name === 'Normalized bounds' ? '0' : '5'},
      onInput: ([lower, upper]) => ChangedRange({ lower, upper }),
      ariaLabels: ['Minimum price', 'Maximum price'],
      formatValue: value => '$' + String(value),
      name: 'price',
      ${extra}
    }, h),
  ]),
})`,
});

export const sliderPage = authoredPage({
  slug: 'slider', title: 'Slider', kind: 'submodel',
  previewProgram,
  definition: {
    kind: 'submodel', description: 'Selects a numeric value from a bounded range through pointer and keyboard interaction.',
    architecture: 'Slider keeps drag/focus mechanics in a child Model and reports value changes as OutMessages. The parent delegates Messages, maps Commands, stores the emitted value, and lifts pointer/Escape subscriptions.',
    apiHref: 'https://foldkit.dev/ui/slider',
    styling: 'Show a visible label or value when precision matters. The range recipe supports horizontal and vertical tracks without layout animation.',
    accessibility: 'Each thumb exposes slider semantics, normalized bounds, current value, and an accessible name. formatValue supplies meaningful aria-valuetext; named controls participate in form submission.',
    keyboard: [['Arrow keys', 'Changes the value by one step.'], ['Home / End', 'Moves to the minimum or maximum.'], ['Escape', 'Cancels an active pointer drag through the lifted subscription.']],
    examples: [
      {
        title: 'Controlled volume', description: 'The child reports changes while the parent remains the source of truth for the numeric value.',

        code: source('Controlled volume', 50, false),
      },
      {
        title: 'Read-only value', description: 'Read-only state remains discoverable by keyboard while removing mutation handlers.',

        code: source('Read-only value', 65, true),
      },
      {
        title: 'RTL price range', description: 'Two native range inputs retain mouse, touch, keyboard, and form behavior while the parent owns the ordered pair.',
        code: rangeSource('RTL price range', "direction: 'rtl',"),
      },
      {
        title: 'Vertical range', description: 'Vertical writing mode changes geometry without animating layout properties.',
        code: rangeSource('Vertical range', "orientation: 'vertical',"),
      },
      {
        title: 'Normalized bounds', description: 'Reversed bounds, crossed values, and invalid steps normalize deterministically before rendering.',
        code: rangeSource('Normalized bounds', ''),
      },
    ],
  },
});
