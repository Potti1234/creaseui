import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXField from '@/stylex/field'
import * as StyleXInput from '@/stylex/input'
import * as TailwindField from '@/ui/field'
import * as TailwindInput from '@/ui/input'

type Model = Readonly<{ value: string }>
type Message = Readonly<{ readonly _tag: 'ChangedName'; value: string }>

const ChangedName = (value: string): Message => ({ _tag: 'ChangedName', value })
const update = (_model: Model, message: Message) => [
  { value: message.value },
  [],
] as const

type Parts = Readonly<{
  controlId: string
  describedBy?: string
  isInvalid: boolean
  isDisabled: boolean
}>

type FieldModule = Readonly<{
  controlField: <Msg>(
    props: {
      id: string
      label: Html | string
      description?: Html | string
      errors?: ReadonlyArray<Readonly<{ message?: string }> | undefined>
      isRequired?: boolean
      toControl: (parts: Parts, h: HtmlBuilder<Msg>) => Html
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type InputModule = Readonly<{
  input: <Msg>(
    props: {
      id: string
      value: string
      onInput: (value: string) => Msg
      describedBy?: string
      isInvalid?: boolean
      isDisabled?: boolean
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const verifyRenderer = (
  name: string,
  Field: FieldModule,
  Input: InputModule,
) => {
  describe(`${name} Field scene`, () => {
    it('guarantees deterministic linked parts around a controlled input', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Field.controlField(
              {
                id: 'profile-name',
                label: 'Display name',
                description: 'Shown on your public profile.',
                errors: [
                  { message: 'Display name is required.' },
                  { message: 'Display name is required.' },
                ],
                isRequired: true,
                toControl: (parts, controlH) =>
                  Input.input(
                    {
                      id: parts.controlId,
                      value: model.value,
                      onInput: ChangedName,
                      ...(parts.describedBy === undefined
                        ? {}
                        : { describedBy: parts.describedBy }),
                      isInvalid: parts.isInvalid,
                      isDisabled: parts.isDisabled,
                    },
                    controlH,
                  ),
              },
              h,
            ),
        },
        Scene.given({ value: '' }),
        Scene.expect(Scene.label('Display name')).toHaveId('profile-name'),
        Scene.expect(Scene.label('Display name')).toHaveAttr(
          'aria-describedby',
          'profile-name-description profile-name-error',
        ),
        Scene.expect(Scene.label('Display name')).toHaveAccessibleDescription(
          /Shown on your public profile.*Display name is required/u,
        ),
        Scene.expect(Scene.role('alert')).toHaveId('profile-name-error'),
        Scene.expect(Scene.role('alert')).toHaveText('Display name is required.'),
        Scene.type(Scene.label('Display name'), 'Ada Lovelace'),
        Scene.expectHandled(),
        Scene.expect(Scene.label('Display name')).toHaveValue('Ada Lovelace'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindField, TailwindInput)
verifyRenderer('StyleX', StyleXField, StyleXInput)
