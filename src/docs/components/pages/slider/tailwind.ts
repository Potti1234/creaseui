import { Option, Schema as S } from 'effect';
import { Command, Subscription } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as Slider from '@/ui/slider';

const GotSliderPreviewMessage = m('GotSliderPreviewMessage', {
  message: Slider.Message,
});
const ChangedRangePreview = m('ChangedRangeSliderPreview', {
  lower: S.Number,
  upper: S.Number,
});
const SliderPreviewMessage = S.Union([
  GotSliderPreviewMessage,
  ChangedRangePreview,
]);
type SliderPreviewMessage = typeof SliderPreviewMessage.Type;
const SliderPreviewModel = S.Struct({
  _docsPage: S.Literal('slider'),
  slider: Slider.Model,
  value: S.Number,
  range: S.Tuple([S.Number, S.Number]),
});
type SliderPreviewModel = typeof SliderPreviewModel.Type;

export const sliderTailwindPreviewProgram = definePreviewProgram<
  SliderPreviewModel,
  SliderPreviewMessage
>({
  Model: SliderPreviewModel,
  Message: SliderPreviewMessage,
  init: index => ({
    _docsPage: 'slider',
    slider: Slider.init({
      id: `docs-slider-${String(index)}`,
      min: 0,
      max: 100,
      step: index === 1 ? 5 : 1,
    }),
    value: index === 0 ? 50 : 65,
    range: [25, 75],
  }),
  update: (model, message) => {
    if (message._tag === 'ChangedRangeSliderPreview') {
      return [{ ...model, range: [message.lower, message.upper] }, []];
    }
    const [slider, commands, maybeChange] =
      Slider.update(model.slider, message.message);
    return [
      {
        ...model,
        slider,
        value: Option.match(maybeChange, {
          onNone: () => model.value,
          onSome: change => change.value,
        }),
      },
      Command.mapMessages(
        commands,
        next => GotSliderPreviewMessage({ message: next }),
      ),
    ];
  },
  subscriptions: Subscription.lift({
    pointer: Slider.subscriptions.dragPointer,
    escape: Slider.subscriptions.dragEscape,
  })<SliderPreviewModel, SliderPreviewMessage>({
    toChildModel: model => model.slider,
    toParentMessage: message => GotSliderPreviewMessage({ message }),
  }),
  view: (index, model, h) => index === 0
    ? h.div([h.Class('w-full max-w-sm')], [
        Slider.slider({
          model: model.slider,
          value: model.value,
          toParentMessage: message => GotSliderPreviewMessage({ message }),
          label: 'Volume',
          formatValue: value => `${Math.round(value)} percent`,
          name: 'volume',
        }, h),
        h.p([h.Class('mt-3 text-sm text-muted-foreground')], [
          `Current value: ${Math.round(model.value)}`,
        ]),
      ])
    : index === 1
      ? Slider.slider({
          model: model.slider,
          value: model.value,
          toParentMessage: message => GotSliderPreviewMessage({ message }),
          label: 'Managed volume',
          isReadOnly: true,
          class: 'max-w-sm',
        }, h)
      : h.div([h.Class(index === 3 ? 'h-48' : 'w-full max-w-sm')], [
          Slider.rangeSlider({
            values: model.range,
            min: index === 4 ? 100 : 0,
            max: index === 4 ? 0 : 100,
            step: index === 4 ? 0 : 1,
            onInput: ([lower, upper]) =>
              ChangedRangePreview({ lower, upper }),
            orientation: index === 3 ? 'vertical' : 'horizontal',
            ...(index === 2 ? { direction: 'rtl' as const } : {}),
            ariaLabels: ['Minimum price', 'Maximum price'],
            formatValue: value => `$${String(value)}`,
            name: 'price',
          }, h),
        ]),
});
