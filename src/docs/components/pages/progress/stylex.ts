import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Progress from '@/stylex/progress';

const styles = stylex.create({
  wide: { maxWidth: '28rem' },
  narrow: { width: '6rem' },
});

export const progressStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? Progress.progress({
      value: 64,
      max: 80,
      ariaLabel: 'Upload progress',
      valueText: '64 of 80 files',
      layoutStyle: styles.wide,
    }, h)
  : exampleIndex === 1
    ? Progress.progress({
        value: null,
        ariaLabel: 'Loading report',
        valueText: 'Loading',
        layoutStyle: styles.wide,
      }, h)
    : Progress.progress({
        value: 3,
        max: 4,
        ariaLabel: 'Setup progress',
        valueText: '3 of 4 steps',
        layoutStyle: styles.narrow,
      }, h);
