import type { DocsExample } from '@/docs/components/page-definition';
import { controlledStringApplication } from '@/docs/components/pages/authored-page';

export const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
] as const;

const metadata = [
  {
    title: 'Labeled fruit',
    description: 'The selected option is ordinary application state, not state hidden inside the helper.',
    config: `label: 'Fruit',
  description: 'Choose one for the delivery.',
  options: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'blueberry', label: 'Blueberry' },
  ],`,
  },
  {
    title: 'Grouped options',
    description: 'Use optgroups when category labels help users scan a longer native menu.',
    config: `label: 'Destination',
  options: [{ value: 'apple', label: 'Local pickup' }],
  groups: [{
    label: 'Europe',
    options: [
      { value: 'banana', label: 'Berlin' },
      { value: 'blueberry', label: 'Paris' },
    ],
  }],`,
  },
] as const;

export const nativeSelectExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map(item => ({
  title: item.title,
  description: item.description,
  code: controlledStringApplication({
    componentName: 'NativeSelect',
    componentSlug: 'native-select',
    renderer,
    exampleName: item.title,
    field: 'fruit',
    initialValue: 'apple',
    messageName: 'SelectedFruit',
    viewBody: `NativeSelect.nativeSelect({
  id: 'fruit',
  value: model.fruit,
  onChange: value => SelectedFruit({ value }),
  ${item.config}
}, h),`,
  }),
}));
