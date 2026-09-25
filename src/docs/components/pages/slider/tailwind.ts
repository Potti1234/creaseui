import { Option, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import {
  sliderFixtures,
  type SliderFixture,
  type SliderInstance,
} from '@/docs/components/pages/slider/shared';
import * as Slider from '@/ui/slider';

const Got = defineMessageUnion({
  GotSliderMessage: { message: Slider.Message },
  ChangedSliderValues: { id: S.String, values: S.Array(S.Number) },
});
type Got = typeof Got.Type;
const Model = S.Struct({
  _docsPage: S.Literal('slider'),
  slider: Slider.Model,
  value: S.Number,
  values: S.Record(S.String, S.Array(S.Number)),
});
type Model = typeof Model.Type;

const instanceView = (
  instance: SliderInstance,
  model: Model,
  h: HtmlBuilder<Got>,
): Html =>
  Slider.multiSlider(
    {
      values: model.values[instance.id] ?? instance.values,
      min: instance.min,
      max: instance.max,
      step: instance.step,
      onInput: values =>
        Got.ChangedSliderValues({ id: instance.id, values }),
      ...(instance.orientation === 'vertical'
        ? { orientation: 'vertical' as const }
        : {}),
      ...(instance.direction === 'rtl'
        ? { direction: 'rtl' as const }
        : {}),
      class: instance.orientation === 'vertical' ? 'h-40' : 'w-full',
    },
    h,
  );

const multiView = (
  fixture: Extract<SliderFixture, { kind: 'multi' }>,
  model: Model,
  h: HtmlBuilder<Got>,
): Html => {
  const sliders = fixture.instances.map(instance =>
    instanceView(instance, model, h));
  if ('vertical' in fixture && fixture.vertical === true) {
    return h.div(
      [h.Class('flex w-full max-w-xs items-center justify-center gap-6')],
      sliders,
    );
  }
  if ('controlled' in fixture && fixture.controlled === true) {
    return h.div([h.Class('grid w-full max-w-xs gap-3')], [
      h.div([h.Class('flex items-center justify-between gap-2')], [
        h.span([h.Class('text-sm font-medium')], ['Temperature']),
        h.span([h.Class('text-sm text-muted-foreground')], [
          (model.values['temperature'] ?? [0.3, 0.7]).join(', '),
        ]),
      ]),
      ...sliders,
    ]);
  }
  return h.div([h.Class('w-full max-w-xs')], sliders);
};

export const sliderTailwindPreviewProgram = definePreviewProgram<Model, Got>({
  Model,
  Message: Got,
  init: index => {
    const fixture = sliderFixtures[index] ?? sliderFixtures[0];
    return {
      _docsPage: 'slider',
      slider: Slider.init({
        id: `docs-slider-${String(index)}`,
        min: 0,
        max: 100,
        step: 1,
      }),
      value: fixture.kind === 'slider' ? fixture.initialValue : 50,
      values: Object.fromEntries(
        (fixture.kind === 'multi' ? fixture.instances : []).map(instance => [
          instance.id,
          [...instance.values],
        ]),
      ),
    };
  },
  update: (model, message) => {
    switch (message._tag) {
      case 'GotSliderMessage': {
        const next = Slider.update(model.slider, message.message);
        const commands = next.commands ?? [];
        const maybeChange = Option.fromNullishOr(next.outMessage);
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
            Got.GotSliderMessage({ message: next })),
        };
      }
      case 'ChangedSliderValues':
        return {
          model: {
            ...model,
            values: { ...model.values, [message.id]: message.values },
          },
        };
    }
  },
  subscriptions: Subscription.aggregate<Model, Got>()(
    Subscription.lift({
      pointer: Slider.subscriptions.dragPointer,
      escape: Slider.subscriptions.dragEscape,
    })<Model, Got>({
      toChildModel: model => model.slider,
      toParentMessage: message => Got.GotSliderMessage({ message }),
    }),
  ),
  view: (index, model, h) => {
    const fixture = sliderFixtures[index] ?? sliderFixtures[0];
    if (fixture.kind === 'multi') {
      return multiView(fixture, model, h);
    }
    return h.div([h.Class('w-full max-w-xs')], [
      Slider.slider(
        {
          model: model.slider,
          value: model.value,
          toParentMessage: message => Got.GotSliderMessage({ message }),
          ariaLabel: 'Slider',
          ...(fixture.isDisabled ? { isDisabled: true } : {}),
        },
        h,
      ),
    ]);
  },
});
