import * as stylex from '@stylexjs/stylex';
import type { HtmlBuilder } from 'foldkit/html';

import type { StyleXExamplePreviewProvider } from '@/docs/components/page-definition';
import * as Button from '@/stylex/button';
import * as ButtonGroup from '@/stylex/button-group';
import * as Spinner from '@/stylex/spinner';

const styles = stylex.create({
  row: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    justifyContent: 'center',
  },
});

export const buttonStyleXPreview: StyleXExamplePreviewProvider = <Msg>(
  exampleIndex: number,
  model: unknown,
  onMessageJson: (messageJson: string) => Msg,
  h: HtmlBuilder<Msg>,
) => {
  const interaction = onMessageJson(JSON.stringify({
    _tag: 'InteractedWithDocsPreview',
  }));
  const interactionCount = (model as { interactionCount: number }).interactionCount;
  switch (exampleIndex) {
    case 0:
      return Button.button({
        onClick: interaction,
        children: [`Clicked ${interactionCount} times`],
      }, h);
    case 1:
      return h.div([h.Class(stylex.props(styles.row).className ?? '')], [
        Button.button({ onClick: interaction, children: ['Primary'] }, h),
        Button.button({ variant: 'secondary', onClick: interaction, children: ['Secondary'] }, h),
        Button.button({ variant: 'outline', onClick: interaction, children: ['Outline'] }, h),
        Button.button({ variant: 'ghost', onClick: interaction, children: ['Ghost'] }, h),
        Button.button({ variant: 'destructive', onClick: interaction, children: ['Delete'] }, h),
      ]);
    case 2:
      return h.div([h.Class(stylex.props(styles.row).className ?? '')], [
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
};
