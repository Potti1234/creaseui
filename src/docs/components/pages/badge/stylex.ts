import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { badgeVariants } from '@/docs/components/pages/badge/shared';
import * as Badge from '@/stylex/badge';

const styles = stylex.create({
  row: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
});

export const badgeStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? h.div([h.Class(stylex.props(styles.row).className ?? '')], badgeVariants.map(item =>
      Badge.badge({
        variant: item.variant,
        children: [item.label],
      }, h),
    ))
  : Badge.badge({
      variant: 'secondary',
      children: ['Ready to publish'],
    }, h);
