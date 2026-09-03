import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Typography from '@/stylex/typography';

const styles = stylex.create({
  article: { maxWidth: '42rem', width: '100%' },
});

export const typographyStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? h.article([h.Class(stylex.props(styles.article).className ?? '')], [
      Typography.typographyH2({ children: ['Foldkit architecture'] }, h),
      Typography.typographyLead({
        children: ['Model behavior explicitly and keep views pure.'],
      }, h),
      Typography.typographyP({
        children: ['Messages describe facts. The update function owns state transitions and commands describe effects.'],
      }, h),
    ])
  : exampleIndex === 1
    ? Typography.typographyP({ children: [
        'Render stateful children with ',
        Typography.typographyInlineCode({ children: ['h.submodel'] }, h),
        '.',
      ] }, h)
    : Typography.typographyBlockquote({
        children: ['The architecture is solved; model the behavior.'],
      }, h);
