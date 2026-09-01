import { Schema as S } from 'effect'
import { m } from 'foldkit/message'

import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page'
import * as Button from '@/ui/button'
import * as Field from '@/ui/field'
import * as Form from '@/ui/form'
import * as Input from '@/ui/input'

const imports = `import { Effect, Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Field from '@/ui/field'
import * as Form from '@/ui/form'
import * as Input from '@/ui/input'`

const newsletterSource = foldkitApplication({
  title: 'Form — Newsletter signup', imports,
  model: `export const Model = S.Struct({ email: S.String })
export type Model = typeof Model.Type`,
  messages: `export const ChangedEmail = m('ChangedNewsletterEmail', { value: S.String })
export const Submitted = m('SubmittedNewsletter')
export const Message = S.Union([ChangedEmail, Submitted])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { email: '' },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedNewsletterEmail': return [{ ...model, email: message.value }, []]
    case 'SubmittedNewsletter': return [model, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Newsletter signup',
  body: Form.form({ ariaLabel: 'Newsletter signup', onSubmit: Submitted(), children: [
    Field.controlField({
      id: 'newsletter-email', label: 'Email', description: 'We only send product updates.',
      toControl: (parts, controlH) => Input.input({
        id: parts.controlId, name: 'email', type: 'email', autocomplete: 'email',
        value: model.email, onInput: value => ChangedEmail({ value }),
        ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
      }, controlH),
    }, h),
    Button.button({ type: 'submit', children: ['Subscribe'] }, h),
  ] }, h),
})`,
})

const errorSummarySource = foldkitApplication({
  title: 'Form — Error summary', imports,
  model: `export const Model = S.Struct({ email: S.String, hasSubmitted: S.Boolean })
export type Model = typeof Model.Type`,
  messages: `export const ChangedEmail = m('ChangedSignInEmail', { value: S.String })
export const Submitted = m('SubmittedSignIn')
export const Message = S.Union([ChangedEmail, Submitted])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { email: '', hasSubmitted: false },
  [],
]`,
  update: `export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedSignInEmail': return [{ ...model, email: message.value }, []]
    case 'SubmittedSignIn': return [{ ...model, hasSubmitted: true }, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const error = model.hasSubmitted && !model.email.includes('@') ? 'Enter a valid email address.' : undefined
  return { title: 'Account sign in', body: Form.form({ ariaLabel: 'Account sign in', onSubmit: Submitted(), children: [
    ...(error === undefined ? [] : [Form.errorSummary({
      id: 'sign-in-errors', title: 'Fix the following error',
      errors: [{ controlId: 'sign-in-email', message: error }], isAutofocus: true,
    }, h)]),
    Field.controlField({
      id: 'sign-in-email', label: 'Email', ...(error === undefined ? {} : { error }),
      toControl: (parts, controlH) => Input.input({
        id: parts.controlId, name: 'email', type: 'email', autocomplete: 'email',
        value: model.email, onInput: value => ChangedEmail({ value }),
        ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }),
        isInvalid: parts.isInvalid,
      }, controlH),
    }, h),
    Button.button({ type: 'submit', children: ['Sign in'] }, h),
  ] }, h) }
}`,
})

const asyncValidationSource = foldkitApplication({
  title: 'Form — Async validation', imports,
  model: `export const Model = S.Struct({ username: S.String, validationVersion: S.Number, error: S.NullOr(S.String) })
export type Model = typeof Model.Type`,
  messages: `export const ChangedUsername = m('ChangedFormUsername', { value: S.String })
export const CompletedValidation = m('CompletedFormValidation', { version: S.Number, error: S.NullOr(S.String) })
export const Message = S.Union([ChangedUsername, CompletedValidation])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { username: '', validationVersion: 0, error: null },
  [],
]`,
  update: `const ValidateUsername = Command.define('ValidateFormUsername', {
  args: { username: S.String, version: S.Number }, messages: [CompletedValidation],
  execute: ({ username, version }) => Effect.sleep('250 millis').pipe(
    Effect.as(CompletedValidation({ version, error: username.length < 3 ? 'Use at least three characters.' : null })),
  ),
})
export const update = (model: Model, message: Message): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedFormUsername': {
      const validationVersion = model.validationVersion + 1
      return [{ ...model, username: message.value, validationVersion, error: null }, [ValidateUsername({ username: message.value, version: validationVersion })]]
    }
    case 'CompletedFormValidation':
      return message.version === model.validationVersion ? [{ ...model, error: message.error }, []] : [model, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Create account',
  body: Form.form({ ariaLabel: 'Create account', children: [Field.controlField({
    id: 'account-username', label: 'Username', ...(model.error === null ? {} : { error: model.error }),
    toControl: (parts, controlH) => Input.input({
      id: parts.controlId, name: 'username', autocomplete: 'username', value: model.username,
      onInput: value => ChangedUsername({ value }),
      ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }), isInvalid: parts.isInvalid,
    }, controlH),
  }, h)] }, h),
})`,
})

const ChangedEmail = m('ChangedFormEmailPreview', { value: S.String })
const ChangedPassword = m('ChangedFormPasswordPreview', { value: S.String })
const Submitted = m('SubmittedFormPreview')
const FormPreviewMessage = S.Union([ChangedEmail, ChangedPassword, Submitted])
type FormPreviewMessage = typeof FormPreviewMessage.Type
const FormPreviewModel = S.Struct({ _docsPage: S.Literal('form'), email: S.String, password: S.String, hasSubmitted: S.Boolean })
type FormPreviewModel = typeof FormPreviewModel.Type

const previewProgram = definePreviewProgram<FormPreviewModel, FormPreviewMessage>({
  Model: FormPreviewModel, Message: FormPreviewMessage,
  init: () => ({ _docsPage: 'form', email: '', password: '', hasSubmitted: false }),
  update: (model, message) => {
    switch (message._tag) {
      case 'ChangedFormEmailPreview': return [{ ...model, email: message.value }, []]
      case 'ChangedFormPasswordPreview': return [{ ...model, password: message.value }, []]
      case 'SubmittedFormPreview': return [{ ...model, hasSubmitted: true }, []]
    }
  },
  view: (index, model, h) => {
    const invalidEmail = model.hasSubmitted && !model.email.includes('@')
    const id = index === 2 ? 'docs-form-username' : index === 1 ? 'docs-form-sign-in-email' : 'docs-form-email'
    const error = index === 2 ? (model.email.length < 3 ? 'Use at least three characters.' : undefined) : (invalidEmail ? 'Enter a valid email address.' : undefined)
    return Form.form({ class: 'w-full max-w-sm', ariaLabel: index === 1 ? 'Account sign in' : index === 2 ? 'Create account' : 'Newsletter signup', ...(index === 2 ? {} : { onSubmit: Submitted() }), children: [
      ...(index === 1 && error !== undefined ? [Form.errorSummary({ id: 'docs-form-errors', title: 'Fix the following error', errors: [{ controlId: id, message: error }], isAutofocus: true }, h)] : []),
      Field.controlField({ id, label: index === 2 ? 'Username' : 'Email', ...(index === 0 ? { description: 'We only send product updates.' } : {}), ...(error === undefined ? {} : { error }), toControl: (parts, controlH) => Input.input({ id: parts.controlId, name: index === 2 ? 'username' : 'email', type: index === 2 ? 'text' : 'email', autocomplete: index === 2 ? 'username' : 'email', value: model.email, onInput: value => ChangedEmail({ value }), ...(parts.describedBy === undefined ? {} : { describedBy: parts.describedBy }), isInvalid: parts.isInvalid }, controlH) }, h),
      ...(index === 1 ? [Field.controlField({ id: 'docs-form-password', label: 'Password', toControl: (parts, controlH) => Input.input({ id: parts.controlId, name: 'password', type: 'password', autocomplete: 'current-password', value: model.password, onInput: value => ChangedPassword({ value }) }, controlH) }, h)] : []),
      ...(index === 2 ? [] : [Button.button({ type: 'submit', children: [index === 1 ? 'Sign in' : 'Subscribe'] }, h)]),
    ] }, h)
  },
})

export const formPage = authoredPage({
  slug: 'form', title: 'Form', kind: 'recipe', previewProgram,
  definition: {
    kind: 'recipe', description: 'Coordinates native submission, controlled fields, validation, and explicit effects without introducing hidden form state.',
    architecture: 'Form is a stateless feature recipe. Field values, touched/submitted flags, validation versions, pending status, and Commands belong to the parent Foldkit Model and update function. The recipe only supplies semantic form and error-summary structure.',
    apiHref: 'https://foldkit.dev/core/forms',
    composition: 'Form\n├── ErrorSummary (when invalid)\n├── Field.controlField\n│   └── controlled native input\n└── native submit Button',
    styling: 'Keep errors next to their fields, place the summary before invalid fields, and reserve disabled controls for truly unavailable actions rather than using disabled state as the only pending indication.',
    accessibility: 'Use Field.controlField for deterministic linkage. On failed submission, insert a focusable ErrorSummary whose links target invalid controls. Preserve native names, types, and autocomplete tokens so browser validation, autofill, and password managers can recognize the form.',
    keyboard: [['Enter', 'Submits from a compatible native control.'], ['Tab', 'Moves through controls and the submit action in document order.']],
    examples: [
      { title: 'Newsletter signup', description: 'A named native email input remains controlled while retaining browser autofill and submission semantics.', code: newsletterSource },
      { title: 'Error summary', description: 'After failed submission, focus a summary whose links move directly to each invalid control.', code: errorSummarySource },
      { title: 'Async validation', description: 'Version validation Commands and ignore stale completions while keeping the current value in the parent Model.', code: asyncValidationSource },
    ],
  },
})
