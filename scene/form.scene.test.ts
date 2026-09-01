import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXButton from '@/stylex/button'
import * as StyleXForm from '@/stylex/form'
import * as StyleXInput from '@/stylex/input'
import * as TailwindButton from '@/ui/button'
import * as TailwindForm from '@/ui/form'
import * as TailwindInput from '@/ui/input'

type Model = Readonly<{ email: string; submitted: boolean }>
type Message =
  | Readonly<{ _tag: 'ChangedEmail'; value: string }>
  | Readonly<{ _tag: 'Submitted' }>

const update = (model: Model, message: Message) =>
  message._tag === 'ChangedEmail'
    ? [{ ...model, email: message.value }, []] as const
    : [{ ...model, submitted: true }, []] as const

type FormModule = Readonly<{
  form: <Msg>(props: { ariaLabel: string; onSubmit: Msg; children: ReadonlyArray<Html | string> }, h: HtmlBuilder<Msg>) => Html
  errorSummary: <Msg>(props: { id: string; title: string; errors: ReadonlyArray<{ controlId: string; message: string }>; isAutofocus?: boolean }, h: HtmlBuilder<Msg>) => Html
}>
type InputModule = Readonly<{
  input: <Msg>(props: { id: string; name: string; autocomplete: string; type: string; value: string; onInput: (value: string) => Msg }, h: HtmlBuilder<Msg>) => Html
}>
type ButtonModule = Readonly<{
  button: <Msg>(props: { type: 'submit'; children: ReadonlyArray<string> }, h: HtmlBuilder<Msg>) => Html
}>

const verifyRenderer = (name: string, Form: FormModule, Input: InputModule, Button: ButtonModule) => {
  describe(`${name} Form scene`, () => {
    it('uses native controls and reveals a linked focus target after submission', () => {
      Scene.scene(
        {
          update,
          view: (model, h) => Form.form({
            ariaLabel: 'Account sign in',
            onSubmit: { _tag: 'Submitted' },
            children: [
              ...(model.submitted ? [Form.errorSummary({ id: 'sign-in-errors', title: 'Fix the following error', errors: [{ controlId: 'sign-in-email', message: 'Enter your email.' }], isAutofocus: true }, h)] : []),
              Input.input({ id: 'sign-in-email', name: 'email', autocomplete: 'email', type: 'email', value: model.email, onInput: value => ({ _tag: 'ChangedEmail', value }) }, h),
              Button.button({ type: 'submit', children: ['Sign in'] }, h),
            ],
          }, h),
        },
        Scene.given({ email: '', submitted: false }),
        Scene.expect(Scene.role('form', { name: 'Account sign in' })).toExist(),
        Scene.submit(Scene.role('form', { name: 'Account sign in' })),
        Scene.expectHandled(),
        Scene.expect(Scene.role('alert')).toHaveId('sign-in-errors'),
        Scene.expect(Scene.text('Enter your email.')).toHaveAttr('href', '#sign-in-email'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindForm, TailwindInput, TailwindButton)
verifyRenderer('StyleX', StyleXForm, StyleXInput, StyleXButton)
