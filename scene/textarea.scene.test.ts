import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder, TextareaAttribute } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXTextarea from '@/stylex/textarea'
import * as TailwindTextarea from '@/ui/textarea'

type Model = Readonly<{ value: string }>
type Message = Readonly<{ readonly _tag: 'ChangedTextarea'; value: string }>

const ChangedTextarea = (value: string): Message => ({
  _tag: 'ChangedTextarea',
  value,
})
const update = (_model: Model, message: Message) => ({
  model: { value: message.value },
})

type TextareaModule = Readonly<{
  textarea: <Msg>(
    props: {
      id: string
      value: string
      onInput?: (value: string) => Msg
      label?: Html | string
      description?: Html | string
      describedBy?: string
      name?: string
      form?: string
      rows?: number
      wrap?: 'hard'
      resize?: 'none' | 'vertical'
      isReadOnly?: boolean
      isInvalid?: boolean
      attributes?: ReadonlyArray<TextareaAttribute<Msg>>
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const verifyRenderer = (name: string, Textarea: TextareaModule) => {
  describe(`${name} Textarea scene`, () => {
    it('reflects multiline input into the parent and links descriptions', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Textarea.textarea(
              {
                id: 'release-notes',
                value: model.value,
                onInput: ChangedTextarea,
                label: 'Release notes',
                description: 'Summarize the release.',
                describedBy: 'format-note',
                name: 'notes',
                form: 'release-form',
                rows: 5,
                wrap: 'hard',
                resize: 'vertical',
                isInvalid: true,
              },
              h,
            ),
        },
        Scene.given({ value: '' }),
        Scene.expect(Scene.label('Release notes')).toHaveAttr(
          'aria-describedby',
          'release-notes-description format-note',
        ),
        Scene.expect(Scene.label('Release notes')).toHaveAttr('rows', '5'),
        Scene.type(Scene.label('Release notes'), 'First line\nSecond line'),
        Scene.expectHandled(),
        Scene.expect(Scene.label('Release notes')).toHaveValue(
          'First line\nSecond line',
        ),
      )
    })

    it('preserves read-only state without a dangling description id', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Textarea.textarea(
              {
                id: 'generated-summary',
                value: model.value,
                label: 'Generated summary',
                isReadOnly: true,
                resize: 'none',
              },
              h,
            ),
        },
        Scene.given({ value: 'Generated output' }),
        Scene.expect(Scene.label('Generated summary')).toHaveAttr(
          'data-readonly',
        ),
        Scene.expect(Scene.label('Generated summary')).toHaveAttr(
          'data-resize',
          'none',
        ),
        Scene.expect(Scene.label('Generated summary')).not.toHaveAttr(
          'aria-describedby',
        ),
      )
    })

    it('spreads app attributes onto the control element', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Textarea.textarea(
              {
                id: 'inline-textarea',
                value: model.value,
                label: 'Notes',
                attributes: [
                  h.DataAttribute('field', 'textarea'),
                  h.OnBlur(ChangedTextarea('saved on blur')),
                ],
              },
              h,
            ),
        },
        Scene.given({ value: 'draft' }),
        Scene.expect(Scene.label('Notes')).toHaveAttr('data-field', 'textarea'),
        Scene.blur(Scene.label('Notes')),
        Scene.expectHandled(),
        Scene.expect(Scene.label('Notes')).toHaveValue('saved on blur'),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindTextarea)
verifyRenderer('StyleX', StyleXTextarea)
