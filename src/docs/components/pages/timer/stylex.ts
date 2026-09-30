import * as stylex from '@stylexjs/stylex';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import {
  timerFixtures,
  type TimerFixture,
} from '@/docs/components/pages/timer/shared';
import { className } from '@/stylex/style';
import * as Timer from '@/stylex/timer';

const styles = stylex.create({
  page: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  pageTight: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: { alignItems: 'center', display: 'flex', gap: '1.5rem' },
  labelRow: { alignItems: 'center', display: 'flex', gap: '0.75rem' },
  column: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  supporting: {
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    lineHeight: '1.25rem',
  },
  large: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: '1.5rem' },
  body: { color: 'var(--foreground)', fontSize: '0.875rem', lineHeight: '1.25rem' },
});

interface PreviewShape {
  readonly timer: Timer.Model;
  readonly clock: Timer.Model;
}

const supportingLabel = <Msg>(text: string, h: HtmlBuilder<Msg>): Html =>
  h.span([h.Class(className(styles.supporting))], [text]);

const timerView = <Msg>(
  fixture: TimerFixture,
  model: PreviewShape,
  h: HtmlBuilder<Msg>,
): Html => {
  const emphasized = (field: Timer.Model): Html =>
    Timer.timer(
      {
        model: field,
        type: 'body',
        size: 'xl',
        color: 'primary',
        weight: 'semibold',
      },
      h,
    );
  switch (fixture.layout) {
    case 'showcase':
      return h.div([h.Class(className(styles.page))], [
        h.span([h.Class(className(styles.large))], ['Processing']),
        h.div([h.Class(className(styles.row))], [
          h.div([h.Class(className(styles.column))], [
            supportingLabel('Elapsed', h),
            emphasized(model.timer),
          ]),
          h.div([h.Class(className(styles.column))], [
            supportingLabel('Clock', h),
            emphasized(model.clock),
          ]),
        ]),
      ]);
    case 'formats':
      return h.div([h.Class(className(styles.pageTight))], [
        h.div([h.Class(className(styles.labelRow))], [
          supportingLabel('Elapsed', h),
          Timer.timer({ model: model.timer, type: 'body', color: 'primary' }, h),
        ]),
        h.div([h.Class(className(styles.labelRow))], [
          supportingLabel('Clock', h),
          Timer.timer({ model: model.clock, type: 'body', color: 'primary' }, h),
        ]),
      ]);
    case 'inline':
      return h.p([h.Class(className(styles.body))], [
        'Processing for ',
        Timer.timer({ model: model.timer, type: 'inherit', color: 'inherit' }, h),
      ]);
    case 'typography':
      return h.div([h.Class(className(styles.pageTight))], [
        supportingLabel('Default', h),
        Timer.timer({ model: model.timer }, h),
        supportingLabel('Emphasized', h),
        emphasized(model.timer),
      ]);
  }
};

export const timerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  index: number,
  model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const preview = model as PreviewShape;
  const fixture = timerFixtures[index] ?? timerFixtures[0];
  return timerView(fixture, preview, h);
};
