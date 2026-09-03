import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Button from '@/stylex/button';
import * as ButtonGroup from '@/stylex/button-group';

export const buttonGroupStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const interaction = onMessageJson(JSON.stringify({
    _tag: 'InteractedWithDocsPreview',
  }));
  const interactionCount = (model as { interactionCount: number }).interactionCount;
  return ButtonGroup.buttonGroup({
    orientation: exampleIndex === 1 ? 'vertical' : 'horizontal',
    children: [
      Button.button({ variant: 'outline', onClick: interaction, children: ['Previous'] }, h),
      Button.button({
        variant: 'outline',
        onClick: interaction,
        children: [`Current (${interactionCount})`],
      }, h),
      Button.button({ variant: 'outline', onClick: interaction, children: ['Next'] }, h),
    ],
  }, h);
};
