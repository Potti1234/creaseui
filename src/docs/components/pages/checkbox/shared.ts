import type { DocsExample } from '@/docs/components/page-definition';
import { controlledBooleanApplication } from '@/docs/components/pages/authored-page';

export const checkboxInitialValues = [false, false, true, true] as const;
export const checkboxLabels = [
  'Accept terms',
  'Select all components',
  'Managed by organization',
  'Account verified',
] as const;

const metadata = [
  {
    title: 'Terms',
    description: 'Model the checked value explicitly and update it from the toggle fact.',
    config: `description: 'Required before creating the account.',`,
  },
  {
    title: 'Indeterminate',
    description: 'Use indeterminate for a parent choice whose children contain mixed values.',
    config: `isIndeterminate: true,`,
  },
  {
    title: 'Disabled',
    description: 'Disabled state remains visible and labeled but cannot dispatch a toggle Message.',
    config: `isDisabled: true,`,
  },
  {
    title: 'Read only',
    description: 'Use read-only when the state remains relevant information but cannot be changed here.',
    config: `isReadOnly: true,
  description: 'This status is supplied by your identity provider.',`,
  },
] as const;

export const checkboxExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  code: controlledBooleanApplication({
    componentName: 'Checkbox',
    componentSlug: 'checkbox',
    renderer,
    exampleName: item.title,
    field: 'isAccepted',
    initialValue: checkboxInitialValues[index] ?? false,
    messageName: 'ToggledAcceptance',
    messageField: 'isChecked',
    viewBody: `Checkbox.checkbox({
  id: 'accept',
  isChecked: model.isAccepted,
  onToggle: isChecked => ToggledAcceptance({ isChecked }),
  label: 'Accept terms',
  name: 'terms',
  value: 'accepted',
  ${item.config}
}, h),`,
  }),
}));
