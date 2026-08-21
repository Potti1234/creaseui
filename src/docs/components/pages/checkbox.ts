import * as Checkbox from '@/ui/checkbox';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledBooleanApplication } from '@/docs/components/pages/authored-page';

const source = (name: string, initialValue: boolean, config: string): string => controlledBooleanApplication({
  componentName: 'Checkbox', componentSlug: 'checkbox', exampleName: name, field: 'isAccepted', initialValue,
  messageName: 'ToggledAcceptance', messageField: 'isChecked',
  viewBody: `Checkbox.checkbox({
  id: 'accept',
  isChecked: model.isAccepted,
  onToggle: isChecked => ToggledAcceptance({ isChecked }),
  label: 'Accept terms',
  ${config}
}, h),`,
});

export const checkboxPage = authoredPage({
  slug: 'checkbox', title: 'Checkbox', kind: 'helper',
  definition: {
    kind: 'helper', description: 'Controls an independent boolean choice with linked labeling and optional form submission.',
    architecture: 'Checkbox is a stateless controlled helper. Store the boolean in the parent Model and return a typed Message from onToggle.',
    apiHref: 'https://foldkit.dev/ui/checkbox',
    styling: 'The indicator and focus state are supplied by the helper. Use description for consequences or additional context.',
    accessibility: 'The label activates the control and checked, indeterminate, disabled, and invalid states are exposed through Foldkit’s attribute bundle.',
    keyboard: [['Space', 'Toggles the focused checkbox.']],
    examples: [
      {
        title: 'Terms', description: 'Model the checked value explicitly and update it from the toggle fact.',
        preview: (model, h) => Checkbox.checkbox({ id: 'docs-checkbox-terms', isChecked: model.isCheckboxChecked, onToggle: (isChecked) => State.ToggledCheckbox({ isChecked }), label: 'Accept terms', description: 'Required before creating the account.' }, h),
        code: source('Terms', false, `description: 'Required before creating the account.',`),
      },
      {
        title: 'Indeterminate', description: 'Use indeterminate for a parent choice whose children contain mixed values.',
        preview: (model, h) => Checkbox.checkbox({ id: 'docs-checkbox-mixed', isChecked: model.isCheckboxChecked, onToggle: (isChecked) => State.ToggledCheckbox({ isChecked }), isIndeterminate: true, label: 'Select all components' }, h),
        code: source('Indeterminate', false, `isIndeterminate: true,`),
      },
      {
        title: 'Disabled', description: 'Disabled state remains visible and labeled but cannot dispatch a toggle Message.',
        preview: (_model, h) => Checkbox.checkbox({ id: 'docs-checkbox-disabled', isChecked: true, onToggle: (isChecked) => State.ToggledCheckbox({ isChecked }), isDisabled: true, label: 'Managed by organization' }, h),
        code: source('Disabled', true, `isDisabled: true,`),
      },
    ],
  },
});
