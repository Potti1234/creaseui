import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, ErrorSummary, Field, Form, Input } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedEmail: { value: Schema.String },
  ChangedUsername: { value: Schema.String },
  SubmittedForm: {},
})
const FormDemo = Html.component({
  name: 'DocsFormDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({
    email: Schema.String,
    username: Schema.String,
    hasSubmitted: Schema.Boolean,
  }),
  message: Message,
}).make({
  init: () => ({ email: '', username: '', hasSubmitted: false }),
  update: {
    ChangedEmail: ($, { value }) => $.evolve({ email: value }),
    ChangedUsername: ($, { value }) => $.evolve({ username: value }),
    SubmittedForm: $ => $.evolve({ hasSubmitted: true }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const prefix = h.props.idPrefix
    const id =
      kind === 'newsletter'
        ? `${prefix}-newsletter-email`
        : kind === 'errorSummary'
          ? `${prefix}-sign-in-email`
          : `${prefix}-account-username`
    const input = (
      value: string,
      onUpdate: (value: string) => unknown,
      invalid = false,
    ) =>
      Input(h, {
        id,
        invalid,
        element: h.input.attrs({
          name: kind === 'async' ? 'username' : 'email',
          type: kind === 'async' ? undefined : 'email',
          autocomplete: kind === 'async' ? 'username' : 'email',
        }),
        props: { value },
        onUpdate: ({ value: next }) => onUpdate(next) as never,
      })
    const form = (children: unknown[]) =>
      Form(h, {
        element: h.form.attrs({
          'aria-label':
            kind === 'newsletter'
              ? 'Newsletter signup'
              : kind === 'errorSummary'
                ? 'Account sign in'
                : 'Create account',
        }),
        onSubmit: () => Message.SubmittedForm(),
        children: children as never,
      })
    if (kind === 'newsletter')
      return h.div.class('w-full max-w-sm').children(
        form([
          Field(h, {
            props: { id },
            label: 'Email',
            description: 'We only send product updates.',
            control: () =>
              input(model.email, value => Message.ChangedEmail({ value })),
          }) as never,
          Button(h, { type: 'submit' }).children('Subscribe'),
        ]) as never,
      )
    if (kind === 'errorSummary') {
      const error =
        model.hasSubmitted && !model.email.includes('@')
          ? 'Enter a valid email address.'
          : undefined
      return h.div.class('w-full max-w-sm').children(
        form([
          error === undefined
            ? undefined
            : ErrorSummary(h, {
                id: `${prefix}-sign-in-errors`,
                title: 'Fix the following error',
                errors: [{ controlId: id, message: error }],
                focusOnMount: true,
              }),
          Field(h, {
            props: { id },
            label: 'Email',
            error,
            control: () =>
              input(
                model.email,
                value => Message.ChangedEmail({ value }),
                error !== undefined,
              ),
          }) as never,
          Button(h, { type: 'submit' }).children('Sign in'),
        ]) as never,
      )
    }
    const error =
      model.username.length > 0 && model.username.length < 3
        ? 'Use at least three characters.'
        : undefined
    return h.div.class('w-full max-w-sm').children(
      form([
        Field(h, {
          props: { id },
          label: 'Username',
          error,
          control: () =>
            input(
              model.username,
              value => Message.ChangedUsername({ value }),
              error !== undefined,
            ),
        }) as never,
      ]) as never,
    )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    FormDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, ErrorSummary, Field, Form, Input } from '@/ui/effect/ui'`,
  body: `Form(h, {
  element: h.form.attrs({ 'aria-label': 'Newsletter signup' }),
  onSubmit: () => SubmittedNewsletter(),
  children: [
    Field(h, {
      props: { id: 'newsletter-email' },
      label: 'Email',
      description: 'We only send product updates.',
      control: () => Input(h, { id: 'newsletter-email', props: { value }, onUpdate }),
    }),
    Button(h, { type: 'submit' }).children('Subscribe'),
  ],
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Form } from '@/ui/effect/ui'\n\nForm(h, { onSubmit, children })`,
  examples: [
    { title: 'Newsletter signup', view: view('newsletter'), source },
    { title: 'Error summary', view: view('errorSummary'), source },
    { title: 'Async validation', view: view('async'), source },
  ],
})
