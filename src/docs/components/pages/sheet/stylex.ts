import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { sheetFixtures } from '@/docs/components/pages/sheet/shared';
import * as Button from '@/stylex/button';
import * as Sheet from '@/stylex/sheet';

const styles = stylex.create({
  content: { paddingInline: '1rem', fontSize: '0.875rem', lineHeight: '1.25rem' },
  cancel: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
  save: {
    backgroundColor: 'var(--primary)',
    borderRadius: '0.375rem',
    color: 'var(--primary-foreground)',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
});

export const sheetStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = sheetFixtures[exampleIndex] ?? sheetFixtures[0];
  const sheetModel = (model as { sheet: Sheet.Model }).sheet;
  return h.div([], [
    Button.button({
      variant: 'outline',
      onClick: onMessageJson(JSON.stringify({ _tag: 'OpenedSheetPreview' })),
      children: [`Open ${fixture.side} sheet`],
    }, h),
    Sheet.sheet({
      model: sheetModel,
      toParentMessage: message => onMessageJson(JSON.stringify({
        _tag: 'GotSheetPreviewMessage',
        message,
      })),
      side: fixture.side,
      title: fixture.panelTitle,
      description: 'Update the settings, then save or cancel.',
      content: () => [
        h.div([h.Class(stylex.props(styles.content).className ?? '')], [
          'Sheet content remains ordinary Foldkit Html.',
        ]),
      ],
      footer: slots => [
        h.button([
          ...slots.closeButton,
          ...slots.initialFocusAttributes(),
          h.Type('button'),
          h.Class(stylex.props(styles.cancel).className ?? ''),
        ], ['Cancel']),
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(stylex.props(styles.save).className ?? ''),
        ], ['Save']),
      ],
    }, h),
  ]);
};
