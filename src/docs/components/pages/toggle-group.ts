import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledStringApplication } from '@/docs/components/pages/authored-page';
import * as ToggleGroup from '@/ui/toggle-group';

const source = (name: string, config: string): string => controlledStringApplication({
  componentName: 'ToggleGroup', componentSlug: 'toggle-group', exampleName: name,
  field: 'alignment', initialValue: 'center', messageName: 'ChangedAlignment',
  viewBody: `ToggleGroup.toggleGroup({
  value: model.alignment,
  onToggle: value => ChangedAlignment({ value }),
  items: [
    { value: 'left', children: ['Left'] },
    { value: 'center', children: ['Center'] },
    { value: 'right', children: ['Right'] },
  ],
  ${config}
}, h),`,
});

const items = [
  { value: 'left', children: ['Left'] },
  { value: 'center', children: ['Center'] },
  { value: 'right', children: ['Right'] },
] as const;

export const toggleGroupPage = authoredPage({
  slug: 'toggle-group', title: 'Toggle Group', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Groups related pressed buttons into a compact single- or multi-selection control.',
    architecture: 'Toggle Group is stateless. Pass value for one selected item or values for multiple items, then interpret onToggle in the parent update function.',
    apiHref: 'https://foldkit.dev/ui/button',
    styling: 'Use short labels or familiar icons and keep item dimensions consistent. The outline variant makes group boundaries more explicit.',
    accessibility: 'Every item is a real button with aria-pressed. Text labels should name the action; icon-only children need an accessible label supplied by composition.',
    keyboard: [['Tab', 'Moves focus into and out of the button group.'], ['Space / Enter', 'Toggles the focused button.']],
    examples: [
      {
        title: 'Alignment', description: 'For exclusive selection, store one value and replace it with the emitted item value.',
        preview: (model, h) => ToggleGroup.toggleGroup({ value: model.toggleGroupValue, onToggle: (value) => State.ChangedToggleGroup({ value }), items }, h),
        code: source('Alignment', ''),
      },
      {
        title: 'Outline', description: 'The outline variant gives a segmented-control treatment without changing the state contract.',
        preview: (model, h) => ToggleGroup.toggleGroup({ value: model.toggleGroupValue, onToggle: (value) => State.ChangedToggleGroup({ value }), variant: 'outline', items }, h),
        code: source('Outline', `variant: 'outline',`),
      },
    ],
  },
});
