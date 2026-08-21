
import { authoredPage, interactionPreviewProgram, statelessComponentApplication } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';

const source = (name: string, orientation: 'horizontal' | 'vertical'): string => statelessComponentApplication({
  componentName: 'ButtonGroup', componentSlug: 'button-group', exampleName: name,
  componentImports: `import * as Button from '@/ui/button'`,
  viewBody: `ButtonGroup.buttonGroup({
  orientation: '${orientation}',
  children: [
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Previous'] }, h),
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Current'] }, h),
    Button.button({ variant: 'outline', onClick: ClickedExample(), children: ['Next'] }, h),
  ],
}, h),`,
});

const previewProgram = interactionPreviewProgram('button-group', (index, interaction, h) => ButtonGroup.buttonGroup({ orientation: index === 1 ? 'vertical' : 'horizontal', children: [Button.button({ variant: 'outline', onClick: interaction, children: ['Previous'] }, h), Button.button({ variant: 'outline', onClick: interaction, children: ['Current'] }, h), Button.button({ variant: 'outline', onClick: interaction, children: ['Next'] }, h)] }, h));

export const buttonGroupPage = authoredPage({
  slug: 'button-group', title: 'Button Group', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Visually joins related actions while preserving each button as an independent Foldkit message source.',
    architecture: 'Button Group owns no state. Each child button emits its own typed parent Message; the group contributes layout and an accessible group boundary.',
    apiHref: 'https://foldkit.dev/ui/button',
    composition: 'ButtonGroup\n├── Button / Input / Select\n├── ButtonGroupSeparator\n└── ButtonGroupText',
    styling: 'Group actions only when they form one compact task. Keep destructive or unrelated actions visually separate.',
    accessibility: 'The wrapper exposes role=group and every child retains native button semantics. Button labels must remain unambiguous when read without visual position.',
    examples: [
      {
        title: 'Pagination actions', description: 'Adjacent actions share a boundary but continue to dispatch normal button messages.',

        code: source('Pagination actions', 'horizontal'),
      },
      {
        title: 'Vertical tools', description: 'Use vertical orientation for a narrow toolbar without changing the children.',

        code: source('Vertical tools', 'vertical'),
      },
    ],
  },
});
