import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledStringApplication } from '@/docs/components/pages/authored-page';
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

export const nativeSelectPage = authoredPage({
  slug: 'native-select', title: 'Native Select', kind: 'helper',
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
        preview: (model, h) => NativeSelect.nativeSelect({ id: 'docs-native-select-fruit', value: model.nativeSelect, onChange: (value) => State.ChangedNativeSelect({ value }), label: 'Fruit', description: 'Choose one for the delivery.', options: fruitOptions }, h),
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
        preview: (model, h) => NativeSelect.nativeSelect({ id: 'docs-native-select-grouped', value: model.nativeSelect, onChange: (value) => State.ChangedNativeSelect({ value }), label: 'Destination', options: [{ value: 'apple', label: 'Local pickup' }], groups: [{ label: 'Europe', options: [{ value: 'banana', label: 'Berlin' }, { value: 'blueberry', label: 'Paris' }] }] }, h),
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
