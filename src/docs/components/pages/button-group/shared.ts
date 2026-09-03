import type { DocsExample } from '@/docs/components/page-definition';
import { statelessComponentApplication } from '@/docs/components/pages/authored-page';

const source = (
  name: string,
  orientation: 'horizontal' | 'vertical',
  renderer: 'tailwind' | 'stylex',
): string => statelessComponentApplication({
  componentName: 'ButtonGroup',
  componentSlug: 'button-group',
  renderer,
  exampleName: name,
  componentImports: `import * as Button from '@/${renderer === 'tailwind' ? 'ui' : 'stylex'}/button'`,
  viewBody: `ButtonGroup.buttonGroup({
  orientation: '${orientation}',
  children: [
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Previous'] }, h),
    Button.button({
      variant: 'outline',
      onClick: ClickedExample(),
      children: [\`Current (\${model.clickCount})\`],
    }, h),
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Next'] }, h),
  ],
}, h),`,
});

export const buttonGroupExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => [
  {
    title: 'Pagination actions',
    description: 'Adjacent actions share a boundary but continue to dispatch normal button messages.',
    code: source('Pagination actions', 'horizontal', renderer),
  },
  {
    title: 'Vertical tools',
    description: 'Use vertical orientation for a narrow toolbar without changing the children.',
    code: source('Vertical tools', 'vertical', renderer),
  },
];
