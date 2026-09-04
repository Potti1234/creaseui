import { Schema as S } from 'effect';
import { Command } from 'foldkit';
import { m } from 'foldkit/message';

import { definePreviewProgram } from '@/docs/components/pages/authored-page';
import { tooltipFixtures } from '@/docs/components/pages/tooltip/shared';
import * as Tooltip from '@/ui/tooltip';

const GotTooltipPreviewMessage = m('GotTooltipPreviewMessage', { message: Tooltip.Message });
type GotTooltipPreviewMessage = typeof GotTooltipPreviewMessage.Type;
const TooltipPreviewModel = S.Struct({ _docsPage: S.Literal('tooltip'), tooltip: Tooltip.Model });
type TooltipPreviewModel = typeof TooltipPreviewModel.Type;

export const tooltipTailwindPreviewProgram = definePreviewProgram<TooltipPreviewModel, GotTooltipPreviewMessage>({
  Model: TooltipPreviewModel,
  Message: GotTooltipPreviewMessage,
  init: index => ({ _docsPage: 'tooltip', tooltip: Tooltip.init({ id: `docs-tooltip-${String(index)}`, showDelay: 400, closeDelay: 100 }) }),
  update: (model, message) => {
    const [tooltip, commands] = Tooltip.update(model.tooltip, message.message);
    return [{ ...model, tooltip }, Command.mapMessages(commands, next => GotTooltipPreviewMessage({ message: next }))];
  },
  view: (index, model, h) => {
    const fixture = tooltipFixtures[index] ?? tooltipFixtures[0];
    return Tooltip.tooltip({
      model: model.tooltip,
      toParentMessage: message => GotTooltipPreviewMessage({ message }),
      trigger: 'Add',
      triggerClass: 'rounded-md border px-3 py-2 text-sm',
      ariaLabel: fixture.ariaLabel,
      content: 'Add to library',
      side: fixture.side,
      showArrow: fixture.showArrow,
      isDisabled: fixture.isDisabled,
    }, h);
  },
});
