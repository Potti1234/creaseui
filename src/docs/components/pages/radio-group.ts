import { Option, Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledStringApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as RadioGroup from '@/ui/radio-group';

const source = (name: string, config: string): string => controlledStringApplication({
  componentName: 'RadioGroup', componentSlug: 'radio-group', exampleName: name,
  field: 'density', initialValue: 'comfortable', messageName: 'SelectedDensity',
  componentImports: `import { Option } from 'effect'`,
  viewBody: `RadioGroup.radioGroup({
  id: 'density',
  selectedValue: Option.some(model.density),
  onSelect: value => SelectedDensity({ value }),
  ariaLabel: 'Interface density',
  ${config}
}, h),`,
});

const options = [
  { value: 'default', label: 'Default', description: 'Balanced spacing for most interfaces.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More space around every control.' },
  { value: 'compact', label: 'Compact', description: 'Fit more information on screen.' },
] as const;

const PreviewModel = S.Struct({ _docsPage: S.Literal('radio-group'), value: S.String });
type PreviewModel = typeof PreviewModel.Type;
const ChangedPreview = m('ChangedRadioGroupPreview', { value: S.String });
type PreviewMessage = typeof ChangedPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ChangedPreview,
  init: () => ({ _docsPage: 'radio-group', value: 'comfortable' }),
  update: (model, message) => [{ ...model, value: message.value }, []],
  view: (index, model, h) => RadioGroup.radioGroup({ id: `docs-radio-${String(index)}`, selectedValue: Option.some(model.value), onSelect: value => ChangedPreview({ value }), ariaLabel: 'Interface density', ...(index === 1 ? { isDisabled: true, options: options.map(({ value, label }) => ({ value, label })) } : { options }) }, h),
});

export const radioGroupPage = authoredPage({
  slug: 'radio-group', title: 'Radio Group', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Chooses exactly one value from a visible set of mutually exclusive options.',
    architecture: 'Radio Group is a controlled helper. The parent owns the selected Option<string>; onSelect reports a value that the parent stores through its update function.',
    apiHref: 'https://foldkit.dev/ui/radio-group',
    styling: 'Keep the full choice set visible. Descriptions are useful when labels alone do not explain the consequence of each choice.',
    accessibility: 'ariaLabel names the group, each option has a linked label, and an optional name emits the hidden input needed for native form submission.',
    keyboard: [['Arrow keys', 'Moves selection and focus within the group.'], ['Space', 'Selects the focused option.']],
    examples: [
      {
        title: 'Density', description: 'Descriptions turn short option labels into an informed single-choice decision.',
        preview: (model, h) => RadioGroup.radioGroup({ id: 'docs-radio-density', selectedValue: Option.some(model.selectedRadioValue), onSelect: (value) => State.SelectedRadioValue({ value }), ariaLabel: 'Interface density', options }, h),
        code: source('Density', `options: [
    { value: 'default', label: 'Default', description: 'Balanced spacing for most interfaces.' },
    { value: 'comfortable', label: 'Comfortable', description: 'More space around every control.' },
    { value: 'compact', label: 'Compact', description: 'Fit more information on screen.' },
  ],`),
      },
      {
        title: 'Disabled group', description: 'Disable the group when the entire decision is unavailable, while preserving its context.',
        preview: (model, h) => RadioGroup.radioGroup({ id: 'docs-radio-disabled', selectedValue: Option.some(model.selectedRadioValue), onSelect: (value) => State.SelectedRadioValue({ value }), ariaLabel: 'Interface density', isDisabled: true, options: options.map(({ value, label }) => ({ value, label })) }, h),
        code: source('Disabled group', `isDisabled: true,
  options: [
    { value: 'default', label: 'Default' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ],`),
      },
    ],
  },
});
