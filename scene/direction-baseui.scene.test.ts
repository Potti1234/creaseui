import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXDirection from '@/stylex/direction'
import * as TailwindDirection from '@/ui/direction'

/**
 * Behavioral parity suite ported from Base UI's direction-provider tests
 * (base-ui/packages/react/src/direction-provider/DirectionProvider.test.tsx,
 * checked at base-ui HEAD).
 *
 * Base UI's DirectionProvider is a React context whose `useDirection` hook
 * hands descendants the configured `ltr | rtl` value. creaseui models the
 * same contract differently: `direction()` renders a `div dir="…"` wrapper
 * and relies on the HTML `dir` attribute — which inherits to descendants —
 * instead of a context.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - DirectionProvider.spec.tsx is a type-level spec (expectType /
 *    @ts-expect-error) with no runtime behavior to port.
 *  - 'defaults useDirection to ltr outside a provider': there is no
 *    direction context or hook in creaseui — direction is a required prop
 *    on the wrapper, so "outside a provider" does not exist (it.todo).
 */

type Direction = 'ltr' | 'rtl'

type Model = Readonly<{
  direction: Direction
}>

type Message = Readonly<{ _tag: 'SetDirection'; direction: Direction }>

const initialModel = (direction: Direction = 'rtl'): Model => ({ direction })

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'SetDirection':
      return { model: { ...model, direction: message.direction } }
  }
}

type DirectionModule = Readonly<{
  direction: <Msg>(
    props: Readonly<{
      direction: Direction
      children: ReadonlyArray<Html | string>
    }>,
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const wrapper = Scene.selector('[dir]')
const probe = Scene.within(wrapper, Scene.text('Direction probe'))

const verifyRenderer = (name: string, Direction: DirectionModule) => {
  describe(`${name} Direction (Base UI port)`, () => {
    describe('prop: direction', () => {
      it('provides the configured direction to descendants', () => {
        // Base UI asserts useDirection() reads 'rtl' under the provider and
        // flips to 'ltr' after setProps. The creaseui equivalent: the wrapper
        // carries dir= and follows a model-driven prop change.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetDirection', direction: 'ltr' }),
                  ],
                  ['Switch to LTR'],
                ),
                Direction.direction(
                  { direction: model.direction, children: ['Direction probe'] },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel('rtl')),
          Scene.expect(wrapper).toHaveAttr('dir', 'rtl'),
          Scene.expect(probe).toExist(),
          Scene.click(Scene.text('Switch to LTR')),
          Scene.expectHandled(),
          Scene.expect(wrapper).toHaveAttr('dir', 'ltr'),
          Scene.expect(probe).toExist(),
        )
      })

      it.todo(
        'defaults useDirection to ltr outside a provider — creaseui has no ' +
          'direction context/hook; direction is a required prop on the ' +
          'wrapper, so there is no "outside a provider" to default',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindDirection)
verifyRenderer('StyleX', StyleXDirection)
