import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Label from '@/stylex/label';

const styles = stylex.create({
  field: { display: 'grid', gap: '0.5rem', maxWidth: '24rem', width: '100%' },
  input: {
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '2.25rem',
    paddingInline: '0.75rem',
  },
  supporting: { color: 'var(--muted-foreground)', fontSize: '0.75rem' },
});

export const labelStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => h.div(
  [h.Class(stylex.props(styles.field).className ?? '')],
  exampleIndex === 0
    ? [
        Label.label({ for: 'docs-email', children: ['Email address'] }, h),
        h.input([
          h.Id('docs-email'),
          h.Type('email'),
          h.Class(stylex.props(styles.input).className ?? ''),
        ]),
      ]
    : [
        Label.label({ for: 'docs-project', children: ['Project name'] }, h),
        h.input([
          h.Id('docs-project'),
          h.Class(stylex.props(styles.input).className ?? ''),
        ]),
        h.p([
          h.Class(stylex.props(styles.supporting).className ?? ''),
        ], ['Use 3–32 characters.']),
      ],
);
