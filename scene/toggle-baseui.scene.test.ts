import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXToggle from '@/stylex/toggle'
import * as TailwindToggle from '@/ui/toggle'

/**
 * Behavioral parity suite ported from Base UI's toggle tests
 * (base-ui/packages/react/src/toggle/Toggle.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - `describeConformance(<Toggle />)`: React internals (ref instanceof
 *    HTMLButtonElement, `testComponentPropWith: 'button'`, nativeButton
 *    conformance) — no foldkit analogue.
 *  - `prop: onPressedChange` → 'does not change the pressed state when the
 *    event is canceled' and 'canceling in a grouped Toggle prevents the
 *    group value from changing': Base UI's `eventDetails.cancel()` veto has
 *    no foldkit analogue — components dispatch plain messages, not
 *    cancelable DOM event objects.
 *  - `prop: render` → 'should pass composite props': element substitution
 *    via `render=` — foldkit fixes the rendered element.
 */

type Model = Readonly<{
  pressed: boolean
  toggleCount: number
}>

type Message = Readonly<
  | { _tag: 'Toggled' }
  | { _tag: 'SetPressed'; pressed: boolean }
>

const initialModel = (pressed = false): Model => ({
  pressed,
  toggleCount: 0,
})

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Toggled':
      return {
        model: {
          ...model,
          pressed: !model.pressed,
          toggleCount: model.toggleCount + 1,
        },
      }
    case 'SetPressed':
      return { model: { ...model, pressed: message.pressed } }
  }
}

type ToggleModule = Readonly<{
  toggle: <Msg>(
    props: {
      isPressed: boolean
      onToggle: Msg
      variant?: 'default' | 'outline' | null
      size?: 'default' | 'sm' | 'lg' | null
      children: ReadonlyArray<Html | string>
      isDisabled?: boolean
      id?: string
      ariaLabel?: string
      describedBy?: string
      direction?: 'ltr' | 'rtl'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const toggleButton = Scene.role('button', { name: 'Toggle me' })

const verifyRenderer = (name: string, Toggle: ToggleModule) => {
  const simpleView = (model: Model, h: HtmlBuilder<Message>): Html =>
    Toggle.toggle(
      {
        isPressed: model.pressed,
        onToggle: { _tag: 'Toggled' },
        children: ['Toggle me'],
      },
      h,
    )

  describe(`${name} Toggle (Base UI port)`, () => {
    describe('pressed state', () => {
      it('controlled', () => {
        // An external control drives `pressed`; the toggle only reflects it.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({
                      _tag: 'SetPressed',
                      pressed: !model.pressed,
                    }),
                  ],
                  ['Driver'],
                ),
                simpleView(model, h),
              ]),
          },
          Scene.given(initialModel()),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'false'),
          Scene.click(Scene.text('Driver')),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'true'),
          Scene.click(Scene.text('Driver')),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'false'),
        )
      })

      it('uncontrolled', () => {
        // Foldkit is always model-driven: "uncontrolled" Base UI state maps
        // to the app's own update flipping the model on Toggled.
        Scene.scene(
          { update, view: simpleView },
          Scene.given(initialModel()),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'false'),
          Scene.click(toggleButton),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'true'),
          Scene.click(toggleButton),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'false'),
        )
      })
    })

    describe('prop: onPressedChange', () => {
      it('is called when the pressed state changes', () => {
        // creaseui's `onToggle` is a plain message (no `(pressed, details)`
        // payload); each click dispatches exactly one message, mirrored in
        // the rendered counter.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                simpleView(model, h),
                h.div([], [`Toggled ${model.toggleCount} times`]),
              ]),
          },
          Scene.given(initialModel()),
          Scene.click(toggleButton),
          Scene.expectHandled(),
          Scene.expect(Scene.text('Toggled 1 times')).toExist(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'true'),
        )
      })
    })

    describe('prop: disabled', () => {
      it('disables the component', () => {
        // foldkit disables via aria-disabled + data-disabled and removes the
        // click handler while keeping the control focusable (tabIndex=0).
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Toggle.toggle(
                {
                  isPressed: model.pressed,
                  onToggle: { _tag: 'Toggled' },
                  children: ['Toggle me'],
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(toggleButton).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(toggleButton).toBeDisabled(),
          Scene.expect(toggleButton).toHaveAttr('data-disabled', ''),
          Scene.expect(toggleButton).toHaveAttr('tabIndex', '0'),
          // No click handler is emitted, so the toggle cannot be activated.
          Scene.expect(toggleButton).not.toHaveHandler('click'),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'false'),
        )
      })

      // The foldkit Button primitive emits `aria-disabled` + `data-disabled` +
      // `tabIndex=0`; creaseui layers the native `disabled` attribute on top
      // (same pattern as src/lib/button.ts), matching Base UI's native-button
      // disabled rendering. `aria-disabled` remains as harmless redundancy.
      it(
        'uses the native disabled attribute (Base UI expects `disabled`; ' +
          'creaseui also emits `aria-disabled` from the Button primitive)',
        () => {
          Scene.scene(
            {
              update,
              view: (model, h) =>
                Toggle.toggle(
                  {
                    isPressed: model.pressed,
                    onToggle: { _tag: 'Toggled' },
                    children: ['Toggle me'],
                    isDisabled: true,
                  },
                  h,
                ),
            },
            Scene.given(initialModel()),
            Scene.expect(toggleButton).toHaveAttr('disabled'),
          )
        },
      )
    })

    describe('ARIA attributes', () => {
      it('renders a button with data-slot="toggle" and reflects ariaLabel', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Toggle.toggle(
                {
                  isPressed: model.pressed,
                  onToggle: { _tag: 'Toggled' },
                  children: ['Toggle me'],
                  ariaLabel: 'Toggle bold',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(Scene.role('button', { name: 'Toggle bold' })).toExist(),
          Scene.expect(Scene.role('button', { name: 'Toggle bold' })).toHaveAttr(
            'data-slot',
            'toggle',
          ),
          Scene.expect(Scene.role('button', { name: 'Toggle bold' })).toHaveAttr(
            'type',
            'button',
          ),
        )
      })
    })

    describe('style hooks', () => {
      // DIVERGENCE (documented): Base UI emits `data-pressed` on the pressed
      // toggle as a styling hook. creaseui emits no `data-pressed`; both
      // renderers style off `aria-pressed` (`aria-[pressed=true]` Tailwind
      // variant / pressed stylex object).
      it('does not mark the control data-pressed (styles read aria-pressed)', () => {
        Scene.scene(
          { update, view: simpleView },
          Scene.given(initialModel()),
          Scene.expect(toggleButton).not.toHaveAttr('data-pressed'),
          Scene.click(toggleButton),
          Scene.expectHandled(),
          Scene.expect(toggleButton).toHaveAttr('aria-pressed', 'true'),
          Scene.expect(toggleButton).not.toHaveAttr('data-pressed'),
        )
      })
    })

    describe('interactions', () => {
      it.todo(
        'can be activated with Space/Enter (native button activation is ' +
          'browser behavior; foldkit emits no key handlers — verify in e2e)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindToggle)
verifyRenderer('StyleX', StyleXToggle)
