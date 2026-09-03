import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Skeleton from '@/stylex/skeleton';

const styles = stylex.create({
  profile: { alignItems: 'center', display: 'flex', gap: '1rem' },
  lines: { display: 'grid', gap: '0.5rem' },
  wideLine: { width: '12rem' },
  card: { display: 'grid', gap: '0.75rem', maxWidth: '24rem', width: '100%' },
  media: { aspectRatio: 16 / 9, width: '100%' },
  title: { height: '1rem', width: '75%' },
  copy: { height: '1rem', width: '50%' },
});

export const skeletonStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? h.div([
      h.Role('status'),
      h.AriaBusy(true),
      h.AriaLabel('Loading profile'),
      h.Class(stylex.props(styles.profile).className ?? ''),
    ], [
      Skeleton.skeleton({ shape: 'circle', size: 'lg' }, h),
      h.div([h.Class(stylex.props(styles.lines).className ?? '')], [
        Skeleton.skeleton({ shape: 'text', size: 'md', layoutStyle: styles.wideLine }, h),
        Skeleton.skeleton({ shape: 'text', size: 'md' }, h),
      ]),
    ])
  : h.div([h.Class(stylex.props(styles.card).className ?? '')], [
      Skeleton.skeleton({ layoutStyle: styles.media }, h),
      Skeleton.skeleton({ layoutStyle: styles.title }, h),
      Skeleton.skeleton({ layoutStyle: styles.copy }, h),
    ]);
