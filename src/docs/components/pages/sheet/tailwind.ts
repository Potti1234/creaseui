import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { sheetFixtures } from '@/docs/components/pages/sheet/shared';
import * as Button from '@/ui/button';
import * as Sheet from '@/ui/sheet';

const OpenedSheetPreview = m('OpenedSheetPreview');
const GotSheetPreviewMessage = m('GotSheetPreviewMessage', { message: Sheet.Message });
const SheetPreviewMessage = S.Union([OpenedSheetPreview, GotSheetPreviewMessage]);
type SheetPreviewMessage = typeof SheetPreviewMessage.Type;
const SheetPreviewModel = S.Struct({ _docsPage: S.Literal('sheet'), sheet: Sheet.Model });
type SheetPreviewModel = typeof SheetPreviewModel.Type;

export const sheetTailwindPreviewProgram = definePreviewProgram<SheetPreviewModel, SheetPreviewMessage>({
  Model: SheetPreviewModel,
  Message: SheetPreviewMessage,
  init: index => ({
    _docsPage: 'sheet',
    sheet: Sheet.init({ id: `docs-sheet-${String(index)}`, isAnimated: true }),
  }),
  update: (model, message) => {
    const [sheet, commands] = message._tag === 'OpenedSheetPreview'
      ? Sheet.open(model.sheet)
      : Sheet.update(model.sheet, message.message);
    return [{ ...model, sheet }, Command.mapMessages(commands, next => GotSheetPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = sheetFixtures[index] ?? sheetFixtures[0];
    return h.div([], [
      Button.button({
        variant: 'outline',
        onClick: OpenedSheetPreview(),
        children: [`Open ${fixture.side} sheet`],
      }, h),
      Sheet.sheet({
        model: model.sheet,
        toParentMessage: message => GotSheetPreviewMessage({ message }),
        side: fixture.side,
        title: fixture.panelTitle,
        description: 'Update the settings, then save or cancel.',
        content: () => [
          h.div([h.Class('px-4 text-sm')], ['Sheet content remains ordinary Foldkit Html.']),
        ],
        footer: slots => [
          h.button([
            ...slots.closeButton,
            ...slots.initialFocusAttributes(),
            h.Type('button'),
            h.Class('rounded-md border px-4 py-2 text-sm'),
          ], ['Cancel']),
          h.button([
            ...slots.closeButton,
            h.Type('button'),
            h.Class('rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground'),
          ], ['Save']),
        ],
      }, h),
    ]);
  },
});
