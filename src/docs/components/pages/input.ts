import * as Input from '@/ui/input';
import { authoredPage, controlledTextApplication, textPreviewProgram } from '@/docs/components/pages/authored-page';

const previewProgram = textPreviewProgram('input', ['', 'Crease UI', 'crease-ui', 'person@example.com'], (index, value, onInput, h) => Input.input({ id: `docs-input-${String(index)}`, value, onInput, class: 'max-w-sm', label: index === 0 ? 'Email' : index === 1 ? 'Project slug' : index === 2 ? 'Workspace' : 'Account email', ...(index === 0 ? { type: 'email' as const, autocomplete: 'email', inputMode: 'email' as const, description: 'We will only use this for account notices.', placeholder: 'you@example.com' } : {}), ...(index === 1 ? { description: 'Use lowercase letters and hyphens.', isInvalid: true } : {}), ...(index === 2 ? { isDisabled: true } : {}), ...(index === 3 ? { name: 'email', form: 'profile', autocomplete: 'email', inputMode: 'email' as const, isReadOnly: true } : {}) }, h));

const source = (name: string, initialValue: string, config: string): string => controlledTextApplication({
  componentName: 'Input', componentSlug: 'input', exampleName: name, field: 'email', initialValue,
  viewBody: `Input.input({
  id: 'email',
  value: model.email,
  onInput: value => ChangedInput({ value }),
  ${config}
}, h),`,
});

export const inputPage = authoredPage({
  slug: 'input', title: 'Input', kind: 'helper',
  previewProgram,
  definition: {
    kind: 'helper', description: 'Captures a single line of controlled text with linked labeling, description, and validation state.',
    architecture: 'Input is a stateless controlled helper with no child Model. The parent owns the string value, validation, and submission policy; labels, descriptions, native attributes, and layout are per-render inputs. Both skins share one semantic renderer and reflect every parent value directly.',
    apiHref: 'https://foldkit.dev/ui/input',
    styling: 'Use type for native input behavior and class for layout width. Label and description are rendered and linked by the helper.',
    accessibility: 'Provide a visible label. Description IDs are deterministic and emitted only when their element exists; describedBy can add external help or error IDs. Disabled, read-only, invalid, autocomplete, input-mode, form, and naming attributes remain native.',
    examples: [
      {
        title: 'Email', description: 'Update the parent Model for every input event while retaining native email behavior.',

        code: source('Email', '', `type: 'email',
  label: 'Email',
  description: 'We will only use this for account notices.',
  placeholder: 'you@example.com',`),
      },
      {
        title: 'Invalid', description: 'Keep invalid state in the Model and explain the correction next to the control.',

        code: source('Invalid', 'Crease UI', `label: 'Project slug',
  description: 'Use lowercase letters and hyphens.',
  isInvalid: true,`),
      },
      {
        title: 'Disabled', description: 'Disabled inputs remain controlled and preserve their value.',

        code: source('Disabled', 'crease-ui', `label: 'Workspace',
  isDisabled: true,`),
      },
      {
        title: 'Native form attributes', description: 'Keep autofill, mobile keyboard selection, read-only state, and form association explicit at the call site.',

        code: source('Native form attributes', 'person@example.com', `label: 'Account email',
  name: 'email',
  form: 'profile',
  autocomplete: 'email',
  inputMode: 'email',
  isReadOnly: true,`),
      },
    ],
  },
});
