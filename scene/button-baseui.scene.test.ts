import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXButton from '@/stylex/button'
import * as TailwindButton from '@/ui/button'

/**
 * Behavioral parity suite ported from Base UI's button tests
 * (base-ui/packages/react/src/button/Button.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - `describeConformance` (propsSpread, refForwarding, renderProp, className):
 *    React internals; foldkit has no refs, prop spreading, or element
 *    substitution — a creaseui button is always a real `<button>`.
 *  - All `nativeButton={false}` + `render=` cases (custom element/link
 *    semantics, custom-element disabled, custom-element
 *    focusableWhenDisabled): creaseui has no render-prop API; the only
 *    non-button variant is `buttonLink`, a plain anchor.
 *  - 'keyboard activation clicks carry modifier key state': foldkit
 *    dispatches plain messages, not DOM event objects, so modifier payloads
 *    do not exist.
 *  - Real focus movement (Tab), page scrolling, and Space/Enter activation:
 *    the scene DSL emits keydown only and performs no DOM dispatch, so the
 *    browser-native activation of `<button>` is e2e-only (no dedicated
 *    button spec exists in e2e/ yet).
 */

type Model = Readonly<{
  clicks: number
}>

type Message = Readonly<{ _tag: 'Clicked' }>

const Clicked: Message = { _tag: 'Clicked' }

const update = (model: Model, _message: Message): { model: Model } => ({
  model: { clicks: model.clicks + 1 },
})

type ButtonModule = Readonly<{
  button: <Msg>(
    props: {
      children: ReadonlyArray<Html | string>
      onClick?: Msg
      isDisabled?: boolean
      type?: 'button' | 'submit' | 'reset'
      ariaLabel?: string
      name?: string
      value?: string
      form?: string
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  buttonLink: <Msg>(
    props: {
      children: ReadonlyArray<Html | string>
      href: string
      ariaLabel?: string
      target?: '_blank' | '_self'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const saveButton = Scene.role('button', { name: 'Save' })

const verifyRenderer = (name: string, Button: ButtonModule) => {
  describe(`${name} Button (Base UI port)`, () => {
    describe('prop: nativeButton', () => {
      // Base UI verifies role/tabindex/keyboard-click dispatch on custom
      // elements via render=. creaseui always renders a native <button>, so
      // the semantics half ports directly to the default element.
      it('applies button semantics (role, type, tabindex) and dispatches clicks', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Button.button({ children: ['Save'], onClick: Clicked }, h),
          },
          Scene.given({ clicks: 0 }),
          Scene.expect(saveButton).toExist(),
          Scene.expect(saveButton).toHaveAttr('type', 'button'),
          Scene.expect(saveButton).toHaveAttr('tabIndex', '0'),
          Scene.expect(saveButton).toHaveAttr('data-slot', 'button'),
          Scene.click(saveButton),
          Scene.expectHandled(),
        )
      })

      it.todo(
        'custom element: dispatches real clicks from keyboard activation ' +
          '(browser-native Enter/Space on <button>; the scene DSL emits ' +
          'keydown only — verify in e2e)',
      )

      // DIVERGENCE: Base UI keeps role="button" + tabindex="0" on custom
      // elements such as render={<a href>}, so the link is still
      // getByRole('button'). creaseui's buttonLink renders a plain anchor
      // with the implicit link role and no button semantics.
      it.fails(
        'custom link element is exposed as a button (role=button on <a>)',
        () => {
          Scene.scene(
            {
              update,
              view: (_model, h) =>
                Button.buttonLink({ children: ['Go'], href: '#target' }, h),
            },
            Scene.given({ clicks: 0 }),
            Scene.expect(Scene.role('link', { name: 'Go' })).toExist(),
            Scene.expect(Scene.role('link', { name: 'Go' })).toHaveAttr(
              'data-slot',
              'button',
            ),
            Scene.expect(Scene.role('button', { name: 'Go' })).toExist(),
          )
        },
      )

      it.todo(
        'custom link element: Space activates the link without scrolling the ' +
          'page (creaseui buttonLink has no keyboard wiring; scroll and focus ' +
          'behavior are e2e-only)',
      )
    })

    describe('prop: disabled', () => {
      it('uses the disabled attribute and drops all activation handlers', () => {
        Scene.scene(
          {
            update,
            view: (_model, h) =>
              Button.button(
                { children: ['Save'], onClick: Clicked, isDisabled: true },
                h,
              ),
          },
          Scene.given({ clicks: 0 }),
          Scene.expect(saveButton).toExist(),
          Scene.expect(saveButton).toHaveAttr('disabled'),
          Scene.expect(saveButton).toHaveAttr('data-disabled', ''),
          Scene.expect(saveButton).toBeDisabled(),
          // No click or key handlers are emitted, so the button cannot be
          // activated by click, Space, or Enter.
          Scene.expect(saveButton).not.toHaveHandler('OnClick'),
          Scene.expect(saveButton).not.toHaveHandler('OnKeyDown'),
          Scene.expect(saveButton).not.toHaveHandler('OnKeyUpPreventDefault'),
        )
      })

      // DIVERGENCE: Base UI emits only `disabled` + `data-disabled` on a
      // native button — no aria-disabled and no tabindex (the element leaves
      // the tab order). creaseui also emits aria-disabled="true" and keeps
      // the foldkit primitive's unconditional tabindex="0".
      it.fails(
        'does not add aria-disabled or tabindex to a natively disabled button',
        () => {
          Scene.scene(
            {
              update,
              view: (_model, h) =>
                Button.button(
                  { children: ['Save'], onClick: Clicked, isDisabled: true },
                  h,
                ),
            },
            Scene.given({ clicks: 0 }),
            Scene.expect(saveButton).not.toHaveAttr('aria-disabled'),
            Scene.expect(saveButton).not.toHaveAttr('tabIndex'),
          )
        },
      )

      it.todo(
        'is removed from the tab order when disabled ' +
          '(native disabled is reflected as tabindex=-1/tab-order removal; ' +
          'real focus is e2e-only)',
      )
    })

    describe('prop: focusableWhenDisabled', () => {
      it.todo(
        'native button: prevents interactions but remains focusable ' +
          '(creaseui has no focusableWhenDisabled prop)',
      )

      it.todo(
        'native button: allows hover handlers while blocking activation ' +
          '(creaseui has no focusableWhenDisabled prop; hover timing is ' +
          'e2e-only)',
      )

      it.todo(
        'keeps focus and suppresses interactions after becoming disabled ' +
          '(creaseui has no focusableWhenDisabled prop; focus retention is ' +
          'e2e-only)',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindButton)
verifyRenderer('StyleX', StyleXButton)
