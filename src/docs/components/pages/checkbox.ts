import { Schema as S } from 'effect';
import { m } from 'foldkit/message';

import * as Checkbox from '@/ui/checkbox';
import { authoredPage, controlledBooleanApplication, definePreviewProgram } from '@/docs/components/pages/authored-page';

const PreviewModel = S.Struct({ _docsPage: S.Literal('checkbox'), isChecked: S.Boolean });
type PreviewModel = typeof PreviewModel.Type;
const ToggledPreview = m('ToggledCheckboxPreview', { isChecked: S.Boolean });
type PreviewMessage = typeof ToggledPreview.Type;
const previewProgram = definePreviewProgram<PreviewModel, PreviewMessage>({
  Model: PreviewModel, Message: ToggledPreview,
  init: index => ({ _docsPage: 'checkbox', isChecked: index === 2 }),
  update: (model, message) => [{ ...model, isChecked: message.isChecked }, []],
  view: (index, model, h) => Checkbox.checkbox({ id: `docs-checkbox-${String(index)}`, isChecked: index === 2 ? true : model.isChecked, onToggle: isChecked => ToggledPreview({ isChecked }), label: index === 0 ? 'Accept terms' : index === 1 ? 'Select all components' : 'Managed by organization', ...(index === 0 ? { description: 'Required before creating the account.' } : {}), ...(index === 1 ? { isIndeterminate: true } : {}), ...(index === 2 ? { isDisabled: true } : {}) }, h),
});

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
  previewProgram,
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

        code: source('Terms', false, `description: 'Required before creating the account.',`),
      },
      {
        title: 'Indeterminate', description: 'Use indeterminate for a parent choice whose children contain mixed values.',

        code: source('Indeterminate', false, `isIndeterminate: true,`),
      },
      {
        title: 'Disabled', description: 'Disabled state remains visible and labeled but cannot dispatch a toggle Message.',

        code: source('Disabled', true, `isDisabled: true,`),
      },
    ],
  },
});
