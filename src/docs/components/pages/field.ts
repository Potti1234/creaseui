
import { authoredPage, controlledStringApplication, foldkitApplication, textPreviewProgram } from '@/docs/components/pages/authored-page';
import * as Field from '@/ui/field';
import * as Input from '@/ui/input';

const source = (name: string, viewBody: string, initialValue = ''): string => controlledStringApplication({
  componentName: 'Field', componentSlug: 'field', exampleName: name,
  field: 'name', initialValue, messageName: 'ChangedName',
  componentImports: `import * as Input from '@/ui/input'`, viewBody,
});

const previewProgram = textPreviewProgram('field', ['', '', 'ad', ''], (index, value, onInput, h) => {
  const control = (id: string, label: string, description?: string, error?: string) => Field.controlField({ id, label, ...(description === undefined ? {} : { description }), ...(error === undefined ? {} : { error }), class: 'max-w-sm', toControl: (parts, controlH) => Input.input({ id: parts.controlId, value, onInput, placeholder: 'Ada Lovelace', ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }), isInvalid: parts.isInvalid, isDisabled: parts.isDisabled }, controlH) }, h);
  if (index === 0) return control('docs-field-name', 'Display name', 'Shown on your public profile.');
  if (index === 1) return control('docs-field-error', 'Display name', undefined, 'Display name is required.');
  if (index === 2) return control('docs-field-username', 'Username', 'Availability is checked after each edit.', value.length < 3 ? 'Use at least three characters.' : undefined);
  return Field.fieldGroup({ class: 'max-w-sm', children: [control('docs-field-first', 'First name'), control('docs-field-last', 'Last name')] }, h);
});

const asyncValidationSource = foldkitApplication({
  title: 'Field — Async validation',
  imports: `import { Effect, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Field from '@/ui/field'
import * as Input from '@/ui/input'`,
  model: `export const Model = S.Struct({
  username: S.String,
  validationVersion: S.Number,
  error: S.NullOr(S.String),
})
export type Model = typeof Model.Type`,
  messages: `export const ChangedUsername = m('ChangedUsername', { value: S.String })
export const CompletedUsernameValidation = m('CompletedUsernameValidation', {
  version: S.Number,
  error: S.NullOr(S.String),
})
export const Message = S.Union([ChangedUsername, CompletedUsernameValidation])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { username: '', validationVersion: 0, error: null },
  [],
]`,
  update: `const ValidateUsername = Command.define('ValidateUsername', {
  args: { username: S.String, version: S.Number },
  messages: [CompletedUsernameValidation],
  execute: ({ username, version }) => Effect.sleep('250 millis').pipe(
    Effect.as(CompletedUsernameValidation({
      version,
      error: username.length < 3 ? 'Use at least three characters.' : null,
    })),
  ),
})

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedUsername': {
      const validationVersion = model.validationVersion + 1
      return [
        { ...model, username: message.value, validationVersion, error: null },
        [ValidateUsername({ username: message.value, version: validationVersion })],
      ]
    }
    case 'CompletedUsernameValidation':
      return message.version === model.validationVersion
        ? [{ ...model, error: message.error }, []]
        : [model, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Field — Async validation',
  body: Field.controlField({
    id: 'username',
    label: 'Username',
    description: 'Availability is checked after each edit.',
    ...(model.error === null ? {} : { error: model.error }),
    toControl: (parts, controlH) => Input.input({
      id: parts.controlId,
      value: model.username,
      onInput: value => ChangedUsername({ value }),
      ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
      isInvalid: parts.isInvalid,
      isDisabled: parts.isDisabled,
    }, controlH),
  }, h),
})`,
});

export const fieldPage = authoredPage({
  slug: 'field', title: 'Field', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Composes a label, control, description, and validation feedback into a consistent accessible field.',
    architecture: 'Field is a stateless feature composition helper with no submitted value or child Model. controlField derives deterministic control, label, description, and error IDs from one stable id, guarantees their structure, and passes typed parts to the parent-rendered control. Validation values and Commands remain parent-owned.',
    apiHref: 'https://foldkit.dev/ui/input',
    composition: 'FieldGroup\n└── Field\n    ├── FieldLabel / FieldTitle\n    ├── control\n    ├── FieldDescription\n    └── FieldError',
    styling: 'Use vertical fields for most forms, horizontal fields for compact binary choices, and responsive orientation only inside a FieldGroup container.',
    accessibility: 'Prefer controlField so label, description, and alert IDs cannot drift. Forward its typed controlId, describedBy, invalid, and disabled values to the control. Low-level parts remain available for unusual compositions but require manual linkage.',
    examples: [
      {
        title: 'Anatomy', description: 'Keep the label, controlled input, and supporting text together without moving input state into Field.',

        code: source('Anatomy', `Field.controlField({
  id: 'display-name',
  label: 'Display name',
  description: 'Shown on your public profile.',
  class: 'max-w-sm',
  toControl: (parts, controlH) => Input.input({
      id: parts.controlId,
      value: model.name,
      onInput: value => ChangedName({ value }),
      placeholder: 'Ada Lovelace',
      ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
      isInvalid: parts.isInvalid,
      isDisabled: parts.isDisabled,
    }, controlH),
}, h),`),
      },
      {
        title: 'Validation error', description: 'Render an alert only when the parent validation result says the field is invalid.',

        code: source('Validation error', `Field.controlField({
  id: 'display-name',
  label: 'Display name',
  error: 'Display name is required.',
  class: 'max-w-sm',
  toControl: (parts, controlH) => Input.input({
    id: parts.controlId, value: model.name,
    onInput: value => ChangedName({ value }),
    ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
    isInvalid: parts.isInvalid,
    isDisabled: parts.isDisabled,
  }, controlH),
}, h),`),
      },
      {
        title: 'Async validation', description: 'Version each validation Command and ignore stale responses so slower results cannot overwrite the latest parent-owned value.',
        code: asyncValidationSource,
      },
      {
        title: 'Field group', description: 'Group related fields under one spacing contract while each input keeps a unique id.',

        code: source('Field group', `Field.fieldGroup({
  class: 'max-w-sm',
  children: [
    Field.controlField({
      id: 'first-name', label: 'First name',
      toControl: (parts, controlH) => Input.input({
        id: parts.controlId, value: model.name,
        onInput: value => ChangedName({ value }),
      }, controlH),
    }, h),
    Field.controlField({
      id: 'last-name', label: 'Last name',
      toControl: (parts, controlH) => Input.input({
        id: parts.controlId, value: model.name,
        onInput: value => ChangedName({ value }),
      }, controlH),
    }, h),
  ],
}, h),`),
      },
    ],
  },
});
