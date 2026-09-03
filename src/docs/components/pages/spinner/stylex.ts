import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Spinner from '@/stylex/spinner';

const styles = stylex.create({
  status: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    gap: '0.5rem',
  },
});

export const spinnerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? Spinner.spinner({ label: 'Loading content', size: 'md', tone: 'primary' }, h)
  : h.div([
      h.Role('status'),
      h.Class(stylex.props(styles.status).className ?? ''),
    ], [
      Spinner.spinner({ isDecorative: true, size: 'sm', tone: 'muted' }, h),
      'Saving changes',
    ]);
