import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { aspectRatioFixtures } from '@/docs/components/pages/aspect-ratio/shared';
import * as AspectRatio from '@/stylex/aspect-ratio';

const styles = stylex.create({
  video: { maxWidth: '32rem', width: '100%' },
  square: { width: '12rem' },
  content: {
    alignItems: 'center',
    backgroundColor: 'var(--muted)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--muted-foreground)',
    display: 'flex',
    fontSize: '0.875rem',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
});

export const aspectRatioStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const item = aspectRatioFixtures[exampleIndex] ?? aspectRatioFixtures[0];
  return AspectRatio.aspectRatio({
    ratio: item.ratio,
    layoutStyle: exampleIndex === 0 ? styles.video : styles.square,
    children: [
      h.div([h.Class(stylex.props(styles.content).className ?? '')], [item.label]),
    ],
  }, h);
};
