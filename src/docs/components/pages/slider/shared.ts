import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

const sliderSource = (
  name: string,
  initialValue: number,
  readOnly: boolean,
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Slider — ${name}`,
  imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Slider from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/slider'${
    renderer === 'stylex'
      ? `
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ slider: { maxWidth: '24rem' } })`
      : ''
  }`,
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
      ${renderer === 'tailwind' ? "class: 'max-w-sm'," : 'layoutStyle: styles.slider,'}
    }, h),
    h.p([h.Class('mt-3 text-sm text-muted-foreground')], [
      \`Current value: \${Math.round(model.volume)}\`,
    ]),
  ]),
})`,
});

const rangeSource = (
  name: string,
  extra: string,
  renderer: 'tailwind' | 'stylex',
): string => foldkitApplication({
  title: `Slider — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Slider from '@/${renderer === 'stylex' ? 'stylex' : 'ui'}/slider'`,
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

const metadata = [
  {
    title: 'Controlled volume',
    description: 'The child reports changes while the parent remains the source of truth for the numeric value.',
    source: (renderer: 'tailwind' | 'stylex') =>
      sliderSource('Controlled volume', 50, false, renderer),
  },
  {
    title: 'Read-only value',
    description: 'Read-only state remains discoverable by keyboard while removing mutation handlers.',
    source: (renderer: 'tailwind' | 'stylex') =>
      sliderSource('Read-only value', 65, true, renderer),
  },
  {
    title: 'RTL price range',
    description: 'Two native range inputs retain mouse, touch, keyboard, and form behavior while the parent owns the ordered pair.',
    source: (renderer: 'tailwind' | 'stylex') =>
      rangeSource('RTL price range', "direction: 'rtl',", renderer),
  },
  {
    title: 'Vertical range',
    description: 'Vertical writing mode changes geometry without animating layout properties.',
    source: (renderer: 'tailwind' | 'stylex') =>
      rangeSource('Vertical range', "orientation: 'vertical',", renderer),
  },
  {
    title: 'Normalized bounds',
    description: 'Reversed bounds, crossed values, and invalid steps normalize deterministically before rendering.',
    source: (renderer: 'tailwind' | 'stylex') =>
      rangeSource('Normalized bounds', '', renderer),
  },
] as const;

export const sliderExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map(item => ({
  title: item.title,
  description: item.description,
  code: item.source(renderer),
}));
