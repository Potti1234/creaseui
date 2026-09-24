import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Separator from '@/stylex/separator';

const styles = stylex.create({
  horizontal: { gap: '1rem', display: 'grid', maxWidth: '28rem', width: '100%', },
  vertical: { gap: '1rem', alignItems: 'center', display: 'flex', height: '1.25rem', },
});

export const separatorStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? h.div([h.Class(stylex.props(styles.horizontal).className ?? '')], [
      'Account',
      Separator.separator({}, h),
      'Preferences',
    ])
  : h.div([h.Class(stylex.props(styles.vertical).className ?? '')], [
      'Docs',
      Separator.separator({ orientation: 'vertical', decorative: false }, h),
      'API',
    ]);
