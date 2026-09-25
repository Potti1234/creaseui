import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';

export type SliderInstance = Readonly<{
  id: string;
  values: ReadonlyArray<number>;
  min: number;
  max: number;
  step: number;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'ltr' | 'rtl';
}>;

export const sliderFixtures = [
  { title: 'Basic', kind: 'slider', initialValue: 75, isDisabled: false },
  {
    title: 'Range',
    kind: 'multi',
    instances: [
      { id: 'range', values: [25, 50], min: 0, max: 100, step: 5 },
    ],
  },
  {
    title: 'Multiple Thumbs',
    kind: 'multi',
    instances: [
      { id: 'multi', values: [10, 20, 70], min: 0, max: 100, step: 10 },
    ],
  },
  {
    title: 'Vertical',
    kind: 'multi',
    vertical: true,
    instances: [
      { id: 'v1', values: [50], min: 0, max: 100, step: 1, orientation: 'vertical' },
      { id: 'v2', values: [25], min: 0, max: 100, step: 1, orientation: 'vertical' },
    ],
  },
  {
    title: 'Controlled',
    kind: 'multi',
    controlled: true,
    instances: [
      { id: 'temperature', values: [0.3, 0.7], min: 0, max: 1, step: 0.1 },
    ],
  },
  { title: 'Disabled', kind: 'slider', initialValue: 50, isDisabled: true },
  {
    title: 'RTL',
    kind: 'multi',
    instances: [
      { id: 'rtl', values: [75], min: 0, max: 100, step: 1, direction: 'rtl' },
    ],
  },
] as const;

export type SliderFixture = (typeof sliderFixtures)[number];

const STYLES_BLOCK = `
const styles = stylex.create({
  slider: { maxWidth: '24rem', width: '100%' },
  verticalWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' },
  controlledWrap: { display: 'grid', gap: '0.75rem', maxWidth: '24rem', width: '100%' },
  controlledRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' },
  controlledValue: { color: 'var(--muted-foreground)', fontSize: '0.875rem' },
})
`;

const sliderSource = (
  fixture: { title: string; initialValue: number; isDisabled: boolean },
  renderer: 'tailwind' | 'stylex',
): string => {
  const isStyleX = renderer === 'stylex';
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  return foldkitApplication({
    title: `Slider — ${fixture.title}`,
    imports: `import { Option, Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? `
import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'
` : ''}
import * as Slider from '@/${isStyleX ? 'stylex' : 'ui'}/slider'${isStyleX ? STYLES_BLOCK : ''}`,
    model: `export const Model = S.Struct({
  slider: Slider.Model,
  value: S.Number,
})
export type Model = typeof Model.Type`,
    messages: `export const GotSliderMessage = taggedStruct('GotSliderMessage${tag}', {
  message: Slider.Message,
})
export const Message = S.Union([GotSliderMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    slider: Slider.init({ id: 'slider', min: 0, max: 100, step: 1 }),
    value: ${String(fixture.initialValue)},
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'GotSliderMessage${tag}': {
      const next = Slider.update(model.slider, message.message)
      const commands = next.commands ?? []
      const maybeChange = Option.fromNullishOr(next.outMessage)
      return {
        model: {
          ...model,
          slider: next.model,
          value: Option.match(maybeChange, {
            onNone: () => model.value,
            onSome: change => change.value,
          }),
        },
        commands: Command.mapMessages(commands, next =>
          GotSliderMessage({ message: next })),
      }
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
  title: 'Slider — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    h.div([h.Class(${isStyleX ? 'className(styles.slider)' : "'w-full max-w-xs'"})], [
      Slider.slider({
        model: model.slider,
        value: model.value,
        toParentMessage: message => GotSliderMessage({ message }),
        ariaLabel: 'Slider',
        ${fixture.isDisabled ? 'isDisabled: true,' : ''}
      }, h),
    ]),
  ]),
})`,
  });
};

const multiSource = (
  fixture: {
    title: string;
    instances: ReadonlyArray<SliderInstance>;
    vertical?: boolean;
    controlled?: boolean;
  },
  renderer: 'tailwind' | 'stylex',
): string => {
  const isStyleX = renderer === 'stylex';
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  const sliderEmit = (instance: SliderInstance): string => `Slider.multiSlider({
        values: model.values['${instance.id}'] ?? [${instance.values.join(', ')}],
        min: ${String(instance.min)},
        max: ${String(instance.max)},
        step: ${String(instance.step)},
        onInput: values => ChangedSliderValues({ id: '${instance.id}', values }),${instance.orientation === 'vertical' ? `
        orientation: 'vertical',` : ''}${instance.direction === 'rtl' ? `
        direction: 'rtl',` : ''}${isStyleX ? '' : `
        class: '${instance.orientation === 'vertical' ? 'h-40' : 'w-full'}',`}
      }, h)`;
  const wrapEmit = (inner: string): string =>
    fixture.vertical === true
      ? `h.div([h.Class(${isStyleX ? 'className(styles.verticalWrap)' : "'flex w-full max-w-xs items-center justify-center gap-6'"})], [
      ${inner},
    ])`
      : fixture.controlled === true
        ? `h.div([h.Class(${isStyleX ? 'className(styles.controlledWrap)' : "'grid w-full max-w-xs gap-3'"})], [
      h.div([h.Class(${isStyleX ? 'className(styles.controlledRow)' : "'flex items-center justify-between gap-2'"})], [
        h.span([h.Class(${isStyleX ? 'className(styles.controlledValue)' : "'text-sm font-medium'"})], ['Temperature']),
        h.span([h.Class(${isStyleX ? 'className(styles.controlledValue)' : "'text-sm text-muted-foreground'"})], [
          (model.values['temperature'] ?? [0.3, 0.7]).join(', '),
        ]),
      ]),
      ${inner},
    ])`
        : `h.div([h.Class(${isStyleX ? 'className(styles.slider)' : "'w-full max-w-xs'"})], [
      ${inner},
    ])`;
  return foldkitApplication({
    title: `Slider — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? `
import * as stylex from '@stylexjs/stylex'
import { className } from '@/stylex/style'
` : ''}
import * as Slider from '@/${isStyleX ? 'stylex' : 'ui'}/slider'${isStyleX ? STYLES_BLOCK : ''}`,
    model: `export const Model = S.Struct({
  values: S.Record(S.String, S.Array(S.Number)),
})
export type Model = typeof Model.Type`,
    messages: `export const ChangedSliderValues = taggedStruct('ChangedSliderValues${tag}', {
  id: S.String,
  values: S.Array(S.Number),
})
export const Message = S.Union([ChangedSliderValues])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({
  model: {
    values: {
${fixture.instances.map(i => `      '${i.id}': [${i.values.join(', ')}],`).join('\n')}
    },
  },
})`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ChangedSliderValues${tag}':
      return {
        model: {
          ...model,
          values: { ...model.values, [message.id]: message.values },
        },
      }
  }
}`,
    view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Slider — ${fixture.title}',
  body: h.main([h.Class('flex min-h-screen items-center justify-center p-8')], [
    ${wrapEmit(fixture.instances.map(i => `      ${sliderEmit(i)}`).join(',\n'))},
  ]),
})`,
  });
};

export const sliderExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> =>
  sliderFixtures.map(fixture => ({
    title: fixture.title,
    code:
      fixture.kind === 'slider'
        ? sliderSource(fixture, renderer)
        : multiSource(fixture, renderer),
  }));
