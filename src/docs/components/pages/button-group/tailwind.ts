import { interactionPreviewProgram } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';

export const buttonGroupTailwindPreviewProgram = interactionPreviewProgram(
  'button-group',
  (index, interaction, h, interactionCount) => ButtonGroup.buttonGroup({
    orientation: index === 1 ? 'vertical' : 'horizontal',
    children: [
      Button.button({ variant: 'outline', onClick: interaction, children: ['Previous'] }, h),
      Button.button({
        variant: 'outline',
        onClick: interaction,
        children: [`Current (${interactionCount})`],
      }, h),
      Button.button({ variant: 'outline', onClick: interaction, children: ['Next'] }, h),
    ],
  }, h),
);
