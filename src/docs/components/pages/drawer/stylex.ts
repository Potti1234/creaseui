import type { HtmlBuilder } from 'foldkit/html';

import * as stylex from '@stylexjs/stylex';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { drawerFixtures } from '@/docs/components/pages/drawer/shared';
import * as Button from '@/stylex/button';
import * as Drawer from '@/stylex/drawer';

const styles = stylex.create({
  content: { paddingInline: '1rem', paddingBottom: '1.5rem', textAlign: 'center' },
  value: {
    fontSize: '3rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  action: {
    backgroundColor: 'var(--primary)',
    borderRadius: '0.375rem',
    color: 'var(--primary-foreground)',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
  cancel: {
    borderColor: 'var(--border)',
    borderRadius: '0.375rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: '0.5rem',
    paddingInline: '1rem',
    fontSize: '0.875rem',
  },
});

export const drawerStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const fixture = drawerFixtures[exampleIndex] ?? drawerFixtures[0];
  const drawerModel = (model as { drawer: Drawer.Model }).drawer;
  return h.div([], [
    Button.button({
      variant: 'outline',
      onClick: onMessageJson(JSON.stringify({ _tag: 'OpenedDrawerPreview' })),
      children: [`Open ${fixture.direction} drawer`],
    }, h),
    Drawer.drawer({
      model: drawerModel,
      toParentMessage: message => onMessageJson(JSON.stringify({
        _tag: 'GotDrawerPreviewMessage',
        message,
      })),
      direction: fixture.direction,
      title: 'Move goal',
      description: 'Set your daily activity goal.',
      content: () => [
        h.div([h.Class(stylex.props(styles.content).className ?? '')], [
          h.p([h.Class(stylex.props(styles.value).className ?? '')], ['350']),
          h.p([h.Class(stylex.props(styles.label).className ?? '')], ['Calories per day']),
        ]),
      ],
      footer: slots => [
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(stylex.props(styles.action).className ?? ''),
        ], ['Save goal']),
        h.button([
          ...slots.closeButton,
          h.Type('button'),
          h.Class(stylex.props(styles.cancel).className ?? ''),
        ], ['Cancel']),
      ],
    }, h),
  ]);
};
