import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  sliderFixtures,
  type SliderFixture,
  type SliderInstance,
} from '@/docs/components/pages/slider/shared';
import * as Slider from '@/stylex/slider';
import { className } from '@/stylex/style';

const styles = stylex.create({
  slider: { maxWidth: '24rem', width: '100%' },
  verticalWrap: {
    gap: '1.5rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '24rem',
    width: '100%',
  },
  controlledWrap: {
    gap: '0.75rem',
    display: 'grid',
    maxWidth: '24rem',
    width: '100%',
  },
  controlledRow: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: { fontSize: '0.875rem', fontWeight: 500 },
  controlledValue: { color: 'var(--muted-foreground)', fontSize: '0.875rem' },
  verticalSlider: { height: '10rem' },
});

interface PreviewShape {
  readonly slider: Slider.Model;
  readonly value: number;
  readonly values: Readonly<Record<string, ReadonlyArray<number>>>;
}

const instanceView = <Msg>(
  instance: SliderInstance,
  model: PreviewShape,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  Slider.multiSlider(
    {
      values: model.values[instance.id] ?? instance.values,
      min: instance.min,
      max: instance.max,
      step: instance.step,
      onInput: values =>
        onMessageJson(
          JSON.stringify({
            _tag: 'ChangedSliderValues',
            id: instance.id,
            values,
          }),
        ),
      ...(instance.orientation === 'vertical'
        ? { orientation: 'vertical' as const }
        : {}),
      ...(instance.direction === 'rtl'
        ? { direction: 'rtl' as const }
        : {}),
      ...(instance.orientation === 'vertical'
        ? { layoutStyle: styles.verticalSlider }
        : {}),
    },
    h,
  );

const multiView = <Msg>(
  fixture: Extract<SliderFixture, { kind: 'multi' }>,
  model: PreviewShape,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const sliders = fixture.instances.map(instance =>
    instanceView(instance, model, onMessageJson, h));
  if ('vertical' in fixture && fixture.vertical === true) {
    return h.div([h.Class(className(styles.verticalWrap))], sliders);
  }
  if ('controlled' in fixture && fixture.controlled === true) {
    return h.div([h.Class(className(styles.controlledWrap))], [
      h.div([h.Class(className(styles.controlledRow))], [
        h.span([h.Class(className(styles.label))], ['Temperature']),
        h.span([h.Class(className(styles.controlledValue))], [
          (model.values['temperature'] ?? [0.3, 0.7]).join(', '),
        ]),
      ]),
      ...sliders,
    ]);
  }
  return h.div([h.Class(className(styles.slider))], sliders);
};

export const sliderStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape;
  const fixture = sliderFixtures[index] ?? sliderFixtures[0];
  if (fixture.kind === 'multi') {
    return multiView(fixture, preview, onMessageJson, h);
  }
  return h.div([h.Class(className(styles.slider))], [
    Slider.slider(
      {
        model: preview.slider,
        value: preview.value,
        toParentMessage: message =>
          onMessageJson(
            JSON.stringify({ _tag: 'GotSliderMessage', message }),
          ),
        ariaLabel: 'Slider',
        ...(fixture.isDisabled ? { isDisabled: true } : {}),
      },
      h,
    ),
  ]);
};
