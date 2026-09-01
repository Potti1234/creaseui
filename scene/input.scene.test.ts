import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXInput from '@/stylex/input'
import * as TailwindInput from '@/ui/input'

type Model = Readonly<{ value: string }>
type Message = Readonly<{ readonly _tag: 'ChangedInput'; value: string }>

const ChangedInput = (value: string): Message => ({ _tag: 'ChangedInput', value })
const update = (_model: Model, message: Message) => [
  { value: message.value },
  [],
] as const

type InputModule = Readonly<{
  input: <Msg>(
    props: {
      id: string
      value: string
      onInput?: (value: string) => Msg
      label?: Html | string
      description?: Html | string
      describedBy?: string
      name?: string
      form?: string
      autocomplete?: string
      inputMode?: 'email'
      isReadOnly?: boolean
      isInvalid?: boolean
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const verifyRenderer = (name: string, Input: InputModule) => {
  describe(`${name} Input scene`, () => {
    it('types into the parent-owned value and renders linked field semantics', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Input.input(
              {
                id: 'account-email',
                value: model.value,
                onInput: ChangedInput,
                label: 'Email',
                description: 'Used for account notices.',
                describedBy: 'privacy-note',
                name: 'email',
                form: 'profile',
                autocomplete: 'email',
                inputMode: 'email',
                isInvalid: true,
              },
              h,
            ),
        },
        Scene.given({ value: '' }),
        Scene.expect(Scene.label('Email')).toHaveAttr('data-slot', 'input'),
        Scene.expect(Scene.label('Email')).toHaveAttr(
          'aria-describedby',
          'account-email-description privacy-note',
        ),
        Scene.expect(Scene.label('Email')).toHaveAccessibleDescription(
          'Used for account notices.',
        ),
        Scene.type(Scene.label('Email'), 'person@example.com'),
        Scene.expectHandled(),
        Scene.expect(Scene.label('Email')).toHaveValue('person@example.com'),
      )
    })

    it('does not emit a dangling description id and preserves read-only state', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Input.input(
              {
                id: 'workspace',
                value: model.value,
                label: 'Workspace',
                isReadOnly: true,
              },
              h,
            ),
        },
        Scene.given({ value: 'crease-ui' }),
        Scene.expect(Scene.label('Workspace')).not.toHaveAttr('aria-describedby'),
        Scene.expect(Scene.label('Workspace')).toHaveAttr('data-readonly'),
        Scene.expect(Scene.selector('[data-slot="input-description"]')).toBeAbsent(),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindInput)
verifyRenderer('StyleX', StyleXInput)
