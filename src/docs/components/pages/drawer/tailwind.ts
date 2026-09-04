import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { drawerFixtures } from '@/docs/components/pages/drawer/shared';
import * as Button from '@/ui/button';
import * as Drawer from '@/ui/drawer';

const OpenedDrawerPreview = m('OpenedDrawerPreview');
const GotDrawerPreviewMessage = m('GotDrawerPreviewMessage', { message: Drawer.Message });
const DrawerPreviewMessage = S.Union([OpenedDrawerPreview, GotDrawerPreviewMessage]);
type DrawerPreviewMessage = typeof DrawerPreviewMessage.Type;
const DrawerPreviewModel = S.Struct({ _docsPage: S.Literal('drawer'), drawer: Drawer.Model });
type DrawerPreviewModel = typeof DrawerPreviewModel.Type;

export const drawerTailwindPreviewProgram = definePreviewProgram<DrawerPreviewModel, DrawerPreviewMessage>({
  Model: DrawerPreviewModel,
  Message: DrawerPreviewMessage,
  init: index => ({
    _docsPage: 'drawer',
    drawer: Drawer.init({ id: `docs-drawer-${String(index)}`, isAnimated: true }),
  }),
  update: (model, message) => {
    const [drawer, commands] = message._tag === 'OpenedDrawerPreview'
      ? Drawer.open(model.drawer)
      : Drawer.update(model.drawer, message.message);
    return [{ ...model, drawer }, Command.mapMessages(commands, next => GotDrawerPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = drawerFixtures[index] ?? drawerFixtures[0];
    return h.div([], [
      Button.button({
        variant: 'outline',
        onClick: OpenedDrawerPreview(),
        children: [`Open ${fixture.direction} drawer`],
      }, h),
      Drawer.drawer({
        model: model.drawer,
        toParentMessage: message => GotDrawerPreviewMessage({ message }),
        direction: fixture.direction,
        title: 'Move goal',
        description: 'Set your daily activity goal.',
        content: () => [
          h.div([h.Class('px-4 pb-6 text-center')], [
            h.p([h.Class('text-5xl font-bold tabular-nums')], ['350']),
            h.p([h.Class('text-sm text-muted-foreground')], ['Calories per day']),
          ]),
        ],
        footer: slots => [
          h.button([
            ...slots.closeButton,
            h.Type('button'),
            h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
          ], ['Save goal']),
          h.button([
            ...slots.closeButton,
            h.Type('button'),
            h.Class('rounded-md border px-4 py-2 text-sm'),
          ], ['Cancel']),
        ],
      }, h),
    ]);
  },
});
