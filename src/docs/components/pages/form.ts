import { Schema as S } from 'effect';
import type { HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';
import * as State from '@/docs/components/catalog-state';
import { authoredPage, definePreviewProgram, foldkitApplication } from '@/docs/components/pages/authored-page';
import * as Button from '@/ui/button';
import * as Form from '@/ui/form';
import * as Input from '@/ui/input';

const source = (name: string, showErrorInitially: boolean): string => foldkitApplication({
  title: `Form — ${name}`,
  imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Button from '@/ui/button'
import * as Form from '@/ui/form'
import * as Input from '@/ui/input'`,
  model: `export const Model = S.Struct({
  email: S.String,
  hasSubmitted: S.Boolean,
})
export type Model = typeof Model.Type`,
  messages: `export const ChangedEmail = m('ChangedEmail${name.replaceAll(/[^a-zA-Z0-9]/g, '')}', { value: S.String })
export const Submitted = m('Submitted${name.replaceAll(/[^a-zA-Z0-9]/g, '')}')
export const Message = S.Union([ChangedEmail, Submitted])
export type Message = typeof Message.Type`,
  init: `export const init = (): readonly [Model, ReadonlyArray<Command.Command<Message>>] => [
  { email: '', hasSubmitted: ${String(showErrorInitially)} },
  [],
]`,
  update: `export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<Command.Command<Message>>] => {
  switch (message._tag) {
    case 'ChangedEmail${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, email: message.value }, []]
    case 'Submitted${name.replaceAll(/[^a-zA-Z0-9]/g, '')}':
      return [{ ...model, hasSubmitted: true }, []]
  }
}`,
  view: `export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const ids = Form.formControlIds('email')
  const isInvalid = model.hasSubmitted && !model.email.includes('@')

  return {
    title: 'Form — ${name}',
    body: h.main([h.Class('mx-auto max-w-md p-8')], [
      Form.form({
        ariaLabel: 'Newsletter signup',
        onSubmit: Submitted(),
        children: [
          Form.formItem({ id: 'email', isInvalid, children: [
            Form.formLabel({ for: 'email', children: ['Email'] }, h),
            Input.input({
              id: 'email', type: 'email', value: model.email,
              onInput: value => ChangedEmail({ value }),
              isInvalid, describedBy: ids.describedBy,
            }, h),
            Form.formDescription({ id: ids.descriptionId, children: ['We only send product updates.'] }, h),
            Form.formMessage({
              id: ids.messageId,
              ...(isInvalid ? { message: 'Enter a valid email address.' } : {}),
            }, h),
          ] }, h),
          Button.button({ type: 'submit', children: ['Subscribe'] }, h),
        ],
      }, h),
    ]),
  }
}`,
});

const ChangedFormEmail = m('ChangedFormEmailPreview', { value: S.String });
const SubmittedForm = m('SubmittedFormPreview');
const FormPreviewMessage = S.Union([ChangedFormEmail, SubmittedForm]);
type FormPreviewMessage = typeof FormPreviewMessage.Type;
const FormPreviewModel = S.Struct({ _docsPage: S.Literal('form'), email: S.String, hasSubmitted: S.Boolean });
type FormPreviewModel = typeof FormPreviewModel.Type;

const previewProgram = definePreviewProgram<FormPreviewModel, FormPreviewMessage>({
  Model: FormPreviewModel,
  Message: FormPreviewMessage,
  init: index => ({ _docsPage: 'form', email: '', hasSubmitted: index === 1 }),
  update: (model, message) => message._tag === 'ChangedFormEmailPreview'
    ? [{ ...model, email: message.value }, []]
    : [{ ...model, hasSubmitted: true }, []],
  view: (_index, model, h) => {
  const showError = model.hasSubmitted && !model.email.includes('@');
  const ids = Form.formControlIds(showError ? 'docs-form-error' : 'docs-form-email');
  const id = showError ? 'docs-form-error' : 'docs-form-email';
  return Form.form({ class: 'w-full max-w-sm', ariaLabel: 'Newsletter signup', onSubmit: SubmittedForm(), children: [Form.formItem({ id, isInvalid: showError, children: [Form.formLabel({ for: id, children: ['Email'] }, h), Input.input({ id, type: 'email', value: model.email, onInput: value => ChangedFormEmail({ value }), isInvalid: showError, describedBy: ids.describedBy }, h), Form.formDescription({ id: ids.descriptionId, children: ['We only send product updates.'] }, h), Form.formMessage({ id: ids.messageId, ...(showError ? { message: 'Enter a valid email address.' } : {}) }, h)] }, h), Button.button({ type: 'submit', children: ['Subscribe'] }, h)] }, h);
  },
});

const preview = (model: State.Model, showError: boolean, h: HtmlBuilder<State.Message>) => {
  const ids = Form.formControlIds(showError ? 'docs-form-error' : 'docs-form-email');
  const id = showError ? 'docs-form-error' : 'docs-form-email';
  return Form.form({ class: 'w-full max-w-sm', ariaLabel: 'Newsletter signup', onSubmit: State.ClickedPreviewAction(), children: [Form.formItem({ id, isInvalid: showError, children: [Form.formLabel({ for: id, children: ['Email'] }, h), Input.input({ id, type: 'email', value: model.formEmail, onInput: value => State.ChangedText({ target: 'formEmail', value }), isInvalid: showError, describedBy: ids.describedBy }, h), Form.formDescription({ id: ids.descriptionId, children: ['We only send product updates.'] }, h), Form.formMessage({ id: ids.messageId, ...(showError ? { message: 'Enter a valid email address.' } : {}) }, h)] }, h), Button.button({ type: 'submit', children: ['Subscribe'] }, h)] }, h);
};

export const formPage = authoredPage({
  slug: 'form', title: 'Form', kind: 'recipe',
  previewProgram,
  definition: {
    kind: 'recipe', description: 'Coordinates semantic submission, controlled values, descriptions, and validation messages without introducing hidden form state.',
    architecture: 'Form is a stateless recipe. Values, touched/submitted flags, validation, async status, and commands all belong to the parent Foldkit Model and update function.',
    apiHref: 'https://foldkit.dev/core/forms',
    composition: 'Form\n└── FormItem\n    ├── FormLabel\n    ├── controlled input\n    ├── FormDescription\n    └── FormMessage',
    styling: 'Keep errors next to their fields and reserve disabled controls for truly unavailable actions, not as the only indication of pending work.',
    accessibility: 'Use formControlIds to connect description and message content. Submission is a typed Message from the native form event, so keyboard and assistive-technology submission work normally.',
    keyboard: [['Enter', 'Submits the form from a compatible control.'], ['Tab', 'Moves through controls and the submit action in document order.']],
    examples: [
      { title: 'Newsletter signup', description: 'Input and submit events become separate typed Messages in the parent application.', preview: (model, h) => preview(model, false, h), code: source('Newsletter signup', false) },
      { title: 'Validation feedback', description: 'Derive invalid state after submission and connect the error to the input with stable IDs.', preview: (model, h) => preview(model, true, h), code: source('Validation feedback', true) },
    ],
  },
});
