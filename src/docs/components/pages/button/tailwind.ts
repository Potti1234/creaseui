import { interactionPreviewProgram } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';
import * as Spinner from '@/ui/spinner';

export const buttonTailwindPreviewProgram = interactionPreviewProgram(
  'button',
  (index, interaction, h, interactionCount) => {
    switch (index) {
      case 0:
        return Button.button({
          onClick: interaction,
          children: [`Clicked ${interactionCount} times`],
        }, h);
      case 1:
        return h.div([h.Class('flex flex-wrap items-center justify-center gap-3')], [
          Button.button({ onClick: interaction, children: ['Primary'] }, h),
          Button.button({ variant: 'secondary', onClick: interaction, children: ['Secondary'] }, h),
          Button.button({ variant: 'outline', onClick: interaction, children: ['Outline'] }, h),
          Button.button({ variant: 'ghost', onClick: interaction, children: ['Ghost'] }, h),
          Button.button({ variant: 'destructive', onClick: interaction, children: ['Delete'] }, h),
        ]);
      case 2:
        return h.div([h.Class('flex flex-wrap items-center justify-center gap-3')], [
          Button.button({ size: 'sm', onClick: interaction, children: ['Small'] }, h),
          Button.button({ onClick: interaction, children: ['Default'] }, h),
          Button.button({ size: 'lg', onClick: interaction, children: ['Large'] }, h),
          Button.button({ size: 'icon', onClick: interaction, children: ['+'] }, h),
        ]);
      case 3:
        return Button.button({
          isLoading: true,
          loadingContent: [Spinner.spinner({ isDecorative: true, size: 'md' }, h)],
          children: ['Save changes'],
        }, h);
      case 4:
        return ButtonGroup.buttonGroup({ children: [
          Button.button({ variant: 'outline', onClick: interaction, children: ['Back'] }, h),
          Button.button({ variant: 'outline', onClick: interaction, children: ['Next'] }, h),
        ] }, h);
      case 5:
        return Button.buttonLink({
          href: 'https://foldkit.dev',
          target: '_blank',
          children: ['Foldkit docs ↗'],
        }, h);
      default:
        return h.div([h.Dir('rtl')], [
          Button.button({ onClick: interaction, children: ['التالي', '←'] }, h),
        ]);
    }
  },
);
