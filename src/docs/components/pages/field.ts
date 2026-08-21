import type { HtmlBuilder } from 'foldkit/html';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, controlledStringApplication, textPreviewProgram } from '@/docs/components/pages/authored-page';
import * as Field from '@/ui/field';
import * as Input from '@/ui/input';

const source = (name: string, viewBody: string, initialValue = ''): string => controlledStringApplication({
  componentName: 'Field', componentSlug: 'field', exampleName: name,
  field: 'name', initialValue, messageName: 'ChangedName',
  componentImports: `import * as Input from '@/ui/input'`, viewBody,
});

const previewProgram = textPreviewProgram('field', ['', '', ''], (index, value, onInput, h) => {
  const input = (id: string) => Input.input({ id, value, onInput, placeholder: 'Ada Lovelace' }, h);
  if (index === 0) return Field.field({ class: 'max-w-sm', children: [Field.fieldLabel({ for: 'docs-field-name', children: ['Display name'] }, h), input('docs-field-name'), Field.fieldDescription({ children: ['Shown on your public profile.'] }, h)] }, h);
  if (index === 1) return Field.field({ class: 'max-w-sm', isInvalid: true, children: [Field.fieldLabel({ for: 'docs-field-error', children: ['Display name'] }, h), Input.input({ id: 'docs-field-error', value, onInput, isInvalid: true }, h), Field.fieldError({ children: ['Display name is required.'] }, h)] }, h);
  return Field.fieldGroup({ class: 'max-w-sm', children: [Field.field({ children: [Field.fieldLabel({ for: 'docs-field-first', children: ['First name'] }, h), input('docs-field-first')] }, h), Field.field({ children: [Field.fieldLabel({ for: 'docs-field-last', children: ['Last name'] }, h), input('docs-field-last')] }, h)] }, h);
});

const input = (id: string, model: State.Model, h: HtmlBuilder<State.Message>) => Input.input({
  id, value: model.fieldName, onInput: value => State.ChangedText({ target: 'fieldName', value }), placeholder: 'Ada Lovelace',
}, h);

export const fieldPage = authoredPage({
  slug: 'field', title: 'Field', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Composes a label, control, description, and validation feedback into a consistent accessible field.',
    architecture: 'Field is a stateless layout recipe. The control still emits its own parent Message, while validity and disabled state are derived from the parent Model.',
    apiHref: 'https://foldkit.dev/ui/input',
    composition: 'FieldGroup\n└── Field\n    ├── FieldLabel / FieldTitle\n    ├── control\n    ├── FieldDescription\n    └── FieldError',
    styling: 'Use vertical fields for most forms, horizontal fields for compact binary choices, and responsive orientation only inside a FieldGroup container.',
    accessibility: 'Match FieldLabel.for to the control id. Connect descriptions and errors through the control API or explicit aria-describedby IDs, and set invalid state on both field and control.',
    examples: [
      {
        title: 'Anatomy', description: 'Keep the label, controlled input, and supporting text together without moving input state into Field.',
        preview: (model, h) => Field.field({ class: 'max-w-sm', children: [Field.fieldLabel({ for: 'docs-field-name', children: ['Display name'] }, h), input('docs-field-name', model, h), Field.fieldDescription({ children: ['Shown on your public profile.'] }, h)] }, h),
        code: source('Anatomy', `Field.field({
  class: 'max-w-sm',
  children: [
    Field.fieldLabel({ for: 'display-name', children: ['Display name'] }, h),
    Input.input({
      id: 'display-name',
      value: model.name,
      onInput: value => ChangedName({ value }),
      placeholder: 'Ada Lovelace',
    }, h),
    Field.fieldDescription({ children: ['Shown on your public profile.'] }, h),
  ],
}, h),`),
      },
      {
        title: 'Validation error', description: 'Render an alert only when the parent validation result says the field is invalid.',
        preview: (model, h) => Field.field({ class: 'max-w-sm', isInvalid: true, children: [Field.fieldLabel({ for: 'docs-field-error', children: ['Display name'] }, h), Input.input({ id: 'docs-field-error', value: model.fieldName, onInput: (value) => State.ChangedText({ target: 'fieldName', value }), isInvalid: true }, h), Field.fieldError({ children: ['Display name is required.'] }, h)] }, h),
        code: source('Validation error', `Field.field({
  class: 'max-w-sm',
  isInvalid: true,
  children: [
    Field.fieldLabel({ for: 'display-name', children: ['Display name'] }, h),
    Input.input({
      id: 'display-name', value: model.name,
      onInput: value => ChangedName({ value }), isInvalid: true,
    }, h),
    Field.fieldError({ children: ['Display name is required.'] }, h),
  ],
}, h),`),
      },
      {
        title: 'Field group', description: 'Group related fields under one spacing contract while each input keeps a unique id.',
        preview: (model, h) => Field.fieldGroup({ class: 'max-w-sm', children: [Field.field({ children: [Field.fieldLabel({ for: 'docs-field-first', children: ['First name'] }, h), input('docs-field-first', model, h)] }, h), Field.field({ children: [Field.fieldLabel({ for: 'docs-field-last', children: ['Last name'] }, h), input('docs-field-last', model, h)] }, h)] }, h),
        code: source('Field group', `Field.fieldGroup({
  class: 'max-w-sm',
  children: [
    Field.field({ children: [
      Field.fieldLabel({ for: 'first-name', children: ['First name'] }, h),
      Input.input({ id: 'first-name', value: model.name, onInput: value => ChangedName({ value }) }, h),
    ] }, h),
    Field.field({ children: [
      Field.fieldLabel({ for: 'last-name', children: ['Last name'] }, h),
      Input.input({ id: 'last-name', value: model.name, onInput: value => ChangedName({ value }) }, h),
    ] }, h),
  ],
}, h),`),
      },
    ],
  },
});
