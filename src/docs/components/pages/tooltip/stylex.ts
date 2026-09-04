import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import { tooltipFixtures } from '@/docs/components/pages/tooltip/shared';
import * as Tooltip from '@/stylex/tooltip';

export const tooltipStyleXPreview: StyleXExamplePreviewProvider = <Msg>(exampleIndex: number, model: unknown, onMessageJson: (messageJson: string) => Msg, h: HtmlBuilder<Msg>) => {
  const fixture = tooltipFixtures[exampleIndex] ?? tooltipFixtures[0];
  const tooltipModel = (model as { tooltip: Tooltip.Model }).tooltip;
  return Tooltip.tooltip({
    model: tooltipModel,
    toParentMessage: message => onMessageJson(JSON.stringify({ _tag: 'GotTooltipPreviewMessage', message })),
    trigger: 'Add',
    ariaLabel: fixture.ariaLabel,
    content: 'Add to library',
    side: fixture.side,
    showArrow: fixture.showArrow,
    isDisabled: fixture.isDisabled,
  }, h);
};
