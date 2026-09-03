import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Kbd from '@/stylex/kbd';

const styles = stylex.create({
  instruction: { fontSize: '0.875rem' },
});

export const kbdStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  _model: unknown,
  _onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => exampleIndex === 0
  ? h.p([h.Class(stylex.props(styles.instruction).className ?? '')], [
      'Press ',
      Kbd.kbd({ children: ['Esc'] }, h),
      ' to close.',
    ])
  : Kbd.kbdGroup({
      children: [
        Kbd.kbd({ children: ['⌘'] }, h),
        Kbd.kbd({ children: ['K'] }, h),
      ],
    }, h);
