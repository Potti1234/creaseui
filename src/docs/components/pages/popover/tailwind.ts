import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { popoverFixtures } from '@/docs/components/pages/popover/shared';
import * as Popover from '@/ui/popover';

const content = <Msg>(h: HtmlBuilder<Msg>) => h.div([h.Class('grid gap-2')], [
  h.h4([h.Class('font-medium')], ['Dimensions']),
  h.p([h.Class('text-sm text-muted-foreground')], ['Set the dimensions for the layer.']),
  h.input([h.Type('number'), h.AriaLabel('Width'), h.Class('rounded-md border px-3 py-2')]),
]);

const GotPopoverPreviewMessage = defineMessageUnion({
  GotPopoverPreviewMessage: { message: Popover.Message },
});
type GotPopoverPreviewMessage = typeof GotPopoverPreviewMessage.Type;
const PopoverPreviewModel = S.Struct({ _docsPage: S.Literal('popover'), popover: Popover.Model });
type PopoverPreviewModel = typeof PopoverPreviewModel.Type;

export const popoverTailwindPreviewProgram = definePreviewProgram<PopoverPreviewModel, GotPopoverPreviewMessage>({
  Model: PopoverPreviewModel,
  Message: GotPopoverPreviewMessage,
  init: index => ({
    _docsPage: 'popover',
    popover: Popover.init({
      id: `docs-popover-${String(index)}`,
      isAnimated: true,
      contentFocus: true,
    }),
  }),
  update: (model, message) => {
    const { model: popover, commands: popoverCommands__ } = Popover.update(model.popover, message.message)
    const commands = popoverCommands__ ?? []
    return { model: { ...model, popover }, commands: Command.mapMessages(commands, next => GotPopoverPreviewMessage.GotPopoverPreviewMessage({ message: next })) };
  },
  view: (index, model, h) => {
    const fixture = popoverFixtures[index] ?? popoverFixtures[0];
    return Popover.popover({
      model: model.popover,
      toParentMessage: message => GotPopoverPreviewMessage.GotPopoverPreviewMessage({ message }),
      trigger: 'Open dimensions',
      triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
      side: fixture.side,
      align: fixture.align,
      focusSelector: 'input',
      content: content(h),
    }, h);
  },
});
