import * as Input from '@/ui/input';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledTextApplication, textPreviewProgram } from '@/docs/components/pages/authored-page';

const previewProgram = textPreviewProgram('input', ['', 'Crease UI', 'crease-ui'], (index, value, onInput, h) => Input.input({ id: `docs-input-${String(index)}`, value, onInput, class: 'max-w-sm', label: index === 0 ? 'Email' : index === 1 ? 'Project slug' : 'Workspace', ...(index === 0 ? { type: 'email' as const, description: 'We will only use this for account notices.', placeholder: 'you@example.com' } : {}), ...(index === 1 ? { description: 'Use lowercase letters and hyphens.', isInvalid: true } : {}), ...(index === 2 ? { isDisabled: true } : {}) }, h));

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
    architecture: 'Input is a stateless controlled helper. Store its value in the application Model and return a fact-like Message from onInput.',
    apiHref: 'https://foldkit.dev/ui/input',
    styling: 'Use type for native input behavior and class for layout width. Label and description are rendered and linked by the helper.',
    accessibility: 'Provide a visible label. isInvalid connects semantic invalid state to the same focus treatment used by the design system.',
    examples: [
      {
        title: 'Email', description: 'Update the parent Model for every input event while retaining native email behavior.',
        preview: (model, h) => Input.input({ id: 'docs-input-email', type: 'email', label: 'Email', description: 'We will only use this for account notices.', value: model.input, onInput: (value) => State.ChangedText({ target: 'input', value }), placeholder: 'you@example.com', class: 'max-w-sm' }, h),
        code: source('Email', '', `type: 'email',
  label: 'Email',
  description: 'We will only use this for account notices.',
  placeholder: 'you@example.com',`),
      },
      {
        title: 'Invalid', description: 'Keep invalid state in the Model and explain the correction next to the control.',
        preview: (model, h) => Input.input({ id: 'docs-input-invalid', label: 'Project slug', description: 'Use lowercase letters and hyphens.', value: model.input, onInput: (value) => State.ChangedText({ target: 'input', value }), isInvalid: true, class: 'max-w-sm' }, h),
        code: source('Invalid', 'Crease UI', `label: 'Project slug',
  description: 'Use lowercase letters and hyphens.',
  isInvalid: true,`),
      },
      {
        title: 'Disabled', description: 'Disabled inputs remain controlled and preserve their value.',
        preview: (_model, h) => Input.input({ id: 'docs-input-disabled', label: 'Workspace', value: 'crease-ui', onInput: (value) => State.ChangedText({ target: 'input', value }), isDisabled: true, class: 'max-w-sm' }, h),
        code: source('Disabled', 'crease-ui', `label: 'Workspace',
  isDisabled: true,`),
      },
    ],
  },
});
