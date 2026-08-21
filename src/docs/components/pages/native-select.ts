import { Schema as S } from 'effect';
import { m } from 'foldkit/message';
import { authoredPage, controlledStringApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';
import * as NativeSelect from '@/ui/native-select';

const source = (name: string, initialValue: string, config: string): string => controlledStringApplication({
  componentName: 'NativeSelect', componentSlug: 'native-select', exampleName: name,
  field: 'fruit', initialValue, messageName: 'SelectedFruit',
  viewBody: `NativeSelect.nativeSelect({
  id: 'fruit',
  value: model.fruit,
  onChange: value => SelectedFruit({ value }),
  ${config}
}, h),`,
});

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
] as const;

const PreviewModel = S.Struct({ _docsPage: S.Literal('native-select'), value: S.String });
type PreviewModel = typeof PreviewModel.Type;
const ChangedPreview = m('ChangedNativeSelectPreview', { value: S.String });
type PreviewMessage = typeof ChangedPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ChangedPreview,
  init: () => ({ _docsPage: 'native-select', value: 'apple' }),
  update: (model, message) => [{ ...model, value: message.value }, []],
  view: (index, model, h) => NativeSelect.nativeSelect({ id: `docs-native-select-${String(index)}`, value: model.value, onChange: value => ChangedPreview({ value }), label: index === 0 ? 'Fruit' : 'Destination', ...(index === 0 ? { description: 'Choose one for the delivery.', options: fruitOptions } : { options: [{ value: 'apple', label: 'Local pickup' }], groups: [{ label: 'Europe', options: [{ value: 'banana', label: 'Berlin' }, { value: 'blueberry', label: 'Paris' }] }] }) }, h),
});

export const nativeSelectPage = authoredPage({
  slug: 'native-select', title: 'Native Select', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Styles the browser-native select while keeping its familiar platform interaction and form behavior.',
    architecture: 'Native Select is a controlled stateless helper. Keep the selected string in the parent Model and replace it with the value emitted by onChange.',
    apiHref: 'https://foldkit.dev/ui/select',
    styling: 'Use the native control when platform behavior and compact forms matter more than custom listbox composition.',
    accessibility: 'Provide label text for visible forms. Foldkit links label and description content to the select and forwards invalid and disabled state.',
    keyboard: [['Arrow keys', 'Moves through the browser-native option list.'], ['Space / Enter', 'Opens the platform picker where supported.']],
    examples: [
      {
        title: 'Labeled fruit', description: 'The selected option is ordinary application state, not state hidden inside the helper.',

        code: source('Labeled fruit', 'apple', `label: 'Fruit',
  description: 'Choose one for the delivery.',
  options: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'blueberry', label: 'Blueberry' },
  ],`),
      },
      {
        title: 'Grouped options', description: 'Use optgroups when category labels help users scan a longer native menu.',

        code: source('Grouped options', 'apple', `label: 'Destination',
  options: [{ value: 'apple', label: 'Local pickup' }],
  groups: [{
    label: 'Europe',
    options: [
      { value: 'banana', label: 'Berlin' },
      { value: 'blueberry', label: 'Paris' },
    ],
  }],`),
      },
    ],
  },
});
