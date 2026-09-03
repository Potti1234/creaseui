import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Slider from '@/stylex/slider';

const styles = stylex.create({
  wide: { maxWidth: '24rem', width: '100%' },
  vertical: { height: '12rem' },
  caption: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    marginTop: '0.75rem',
  },
});

type PreviewModel = Readonly<{
  slider: Slider.Model;
  value: number;
  range: readonly [number, number];
}>;

export const sliderStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const previewModel = model as PreviewModel;
  if (exampleIndex === 0) {
    return h.div([h.Class(stylex.props(styles.wide).className ?? '')], [
      Slider.slider({
        model: previewModel.slider,
        value: previewModel.value,
        toParentMessage: message => onMessageJson(JSON.stringify({
          _tag: 'GotSliderPreviewMessage',
          message,
        })),
        label: 'Volume',
        formatValue: value => `${Math.round(value)} percent`,
        name: 'volume',
      }, h),
      h.p([h.Class(stylex.props(styles.caption).className ?? '')], [
        `Current value: ${Math.round(previewModel.value)}`,
      ]),
    ]);
  }
  if (exampleIndex === 1) {
    return Slider.slider({
      model: previewModel.slider,
      value: previewModel.value,
      toParentMessage: message => onMessageJson(JSON.stringify({
        _tag: 'GotSliderPreviewMessage',
        message,
      })),
      label: 'Managed volume',
      isReadOnly: true,
      layoutStyle: styles.wide,
    }, h);
  }
  return h.div(
    [h.Class(stylex.props(
      exampleIndex === 3 ? styles.vertical : styles.wide,
    ).className ?? '')],
    [
      Slider.rangeSlider({
        values: previewModel.range,
        min: exampleIndex === 4 ? 100 : 0,
        max: exampleIndex === 4 ? 0 : 100,
        step: exampleIndex === 4 ? 0 : 1,
        onInput: ([lower, upper]) => onMessageJson(JSON.stringify({
          _tag: 'ChangedRangeSliderPreview',
          lower,
          upper,
        })),
        orientation: exampleIndex === 3 ? 'vertical' : 'horizontal',
        ...(exampleIndex === 2 ? { direction: 'rtl' as const } : {}),
        ariaLabels: ['Minimum price', 'Maximum price'],
        formatValue: value => `$${String(value)}`,
        name: 'price',
      }, h),
    ],
  );
};
