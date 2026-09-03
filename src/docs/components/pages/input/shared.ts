import type { DocsExample } from '@/docs/components/page-definition';
import { controlledTextApplication } from '@/docs/components/pages/authored-page';

export const inputInitialValues = [
  '',
  'Crease UI',
  'crease-ui',
  'person@example.com',
] as const;

const metadata = [
  {
    title: 'Email',
    description: 'Update the parent Model for every input event while retaining native email behavior.',
    label: 'Email',
    config: `type: 'email',
  label: 'Email',
  description: 'We will only use this for account notices.',
  placeholder: 'you@example.com',`,
  },
  {
    title: 'Invalid',
    description: 'Keep invalid state in the Model and explain the correction next to the control.',
    label: 'Project slug',
    config: `label: 'Project slug',
  description: 'Use lowercase letters and hyphens.',
  isInvalid: true,`,
  },
  {
    title: 'Disabled',
    description: 'Disabled inputs remain controlled and preserve their value.',
    label: 'Workspace',
    config: `label: 'Workspace',
  isDisabled: true,`,
  },
  {
    title: 'Native form attributes',
    description: 'Keep autofill, mobile keyboard selection, read-only state, and form association explicit at the call site.',
    label: 'Account email',
    config: `label: 'Account email',
  name: 'email',
  form: 'profile',
  autocomplete: 'email',
  inputMode: 'email',
  isReadOnly: true,`,
  },
] as const;

export const inputLabel = (index: number): string =>
  (metadata[index] ?? metadata[0]).label;

export const inputExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => metadata.map((item, index) => ({
  title: item.title,
  description: item.description,
  code: controlledTextApplication({
    componentName: 'Input',
    componentSlug: 'input',
    renderer,
    exampleName: item.title,
    field: 'email',
    initialValue: inputInitialValues[index] ?? '',
    ...(renderer === 'stylex'
      ? {
          componentImports: `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({ input: { maxWidth: '24rem' } })`,
        }
      : {}),
    viewBody: `Input.input({
  id: 'email',
  value: model.email,
  onInput: value => ChangedInput({ value }),
  ${item.config}
  ${renderer === 'tailwind' ? "class: 'max-w-sm'," : 'layoutStyle: styles.input,'}
}, h),`,
  }),
}));
