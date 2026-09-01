import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXButton from '@/stylex/button'
import * as TailwindButton from '@/ui/button'

type Model = Readonly<{ clicks: number }>
type Message = Readonly<{ readonly _tag: 'Clicked' }>

const Clicked: Message = { _tag: 'Clicked' }
const update = (model: Model, _message: Message) => [
  { clicks: model.clicks + 1 },
  [],
] as const

type ButtonModule = Readonly<{
  button: <Msg>(
    props: {
      children: ReadonlyArray<Html | string>
      onClick?: Msg
      isLoading?: boolean
      loadingContent?: ReadonlyArray<Html | string>
      name?: string
      value?: string
      form?: string
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const verifyRenderer = (name: string, Button: ButtonModule) => {
  describe(`${name} Button scene`, () => {
    it('renders shared slots and dispatches the parent Message', () => {
      Scene.scene(
        {
          update,
          view: (model, h) =>
            Button.button(
              {
                children: [`Saved ${model.clicks}`],
                onClick: Clicked,
                name: 'intent',
                value: 'save',
                form: 'profile',
              },
              h,
            ),
        },
        Scene.given({ clicks: 0 }),
        Scene.expect(Scene.role('button', { name: 'Saved 0' })).toHaveAttr(
          'data-slot',
          'button',
        ),
        Scene.expect(Scene.selector('[data-slot="button-content"]')).toExist(),
        Scene.click(Scene.role('button', { name: 'Saved 0' })),
        Scene.expectHandled(),
        Scene.expect(Scene.role('button', { name: 'Saved 1' })).toExist(),
      )
    })

    it('uses native disabled semantics and keeps its loading name stable', () => {
      Scene.scene(
        {
          update,
          view: (_model, h) =>
            Button.button(
              {
                children: ['Save changes'],
                isLoading: true,
                loadingContent: ['Working'],
              },
              h,
            ),
        },
        Scene.given({ clicks: 0 }),
        Scene.expect(
          Scene.role('button', { name: 'Save changes', disabled: true }),
        ).toBeDisabled(),
        Scene.expect(Scene.role('button', { name: 'Save changes' })).toHaveAttr(
          'disabled',
        ),
        Scene.expect(Scene.selector('[data-slot="button-loading"]')).toHaveAttr(
          'aria-hidden',
          'true',
        ),
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindButton)
verifyRenderer('StyleX', StyleXButton)
