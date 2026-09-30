import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXSwitch from '@/stylex/switch'
import * as TailwindSwitch from '@/ui/switch'

/**
 * Behavioral parity suite ported from Base UI's switch tests
 * (base-ui/packages/react/src/switch/root/SwitchRoot.test.tsx and
 * switch/thumb/SwitchThumb.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - React-implementation internals: describeConformance, ref callbacks,
 *    StrictMode, `inputRef`
 *  - `render=` / `nativeButton` element-substitution cases (foldkit fixes
 *    the rendered elements)
 *  - `onCheckedChange` eventDetails payloads — cancellation and keyboard
 *    modifier reporting (foldkit dispatches plain messages, not DOM events)
 *  - `onClick` prop and DOM event propagation/stopPropagation to ancestors
 *  - Hidden-input toggling: Base UI's hidden input is a real
 *    `type=checkbox` that can be clicked; creaseui renders a `type=hidden`
 *    mirror, so "input click toggles" and "canceled input click" are N/A
 *  - Attribute passthrough: `aria-label`, overriding built-in attributes
 *    via props — creaseui's prop list is fixed
 *  - Form/Field integration: native form submission and FormData, HTML
 *    validation, `form`, `uncheckedValue`, Field.Root context state
 *    (data-touched/-dirty/-filled/-focused), validationMode, and
 *    Field.Label/Field.Description association — creaseui's switch has no
 *    Field/Form machinery
 *  - Switch.Thumb as a standalone part: creaseui renders the thumb
 *    internally (`data-slot="switch-thumb"`), so the "throws when rendered
 *    outside Switch.Root" case is N/A
 *  - Enter/Space activation: foldkit toggles on Space `keyup` and relies
 *    on the native button's Enter→click synthesis; the scene DSL emits
 *    only keydown — verify in e2e.
 */

type Model = Readonly<{
  checked: boolean
}>

type Message = Readonly<
  | { _tag: 'Toggled'; checked: boolean }
  | { _tag: 'SetChecked'; checked: boolean }
>

const initialModel = (checked = false): Model => ({
  checked,
})

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Toggled':
      return { model: { ...model, checked: message.checked } }
    case 'SetChecked':
      return { model: { ...model, checked: message.checked } }
  }
}

type SwitchModule = Readonly<{
  switchControl: <Msg>(props: {
    id: string
    isChecked: boolean
    onToggle: (checked: boolean) => Msg
    label?: Html | string
    description?: Html | string
    isDisabled?: boolean
    isReadOnly?: boolean
    isInvalid?: boolean
    name?: string
    value?: string
  }, h: HtmlBuilder<Msg>) => Html
}>

const switchControl = Scene.role('switch', { name: 'Airplane mode' })
const switchControlUnnamed = Scene.role('switch')
const switchThumb = Scene.selector('[data-slot="switch-thumb"]')
const switchLabel = Scene.selector('#airplane-label')
const hiddenInput = Scene.selector('input[type="hidden"]')

const verifyRenderer = (name: string, Switch: SwitchModule) => {
  describe(`${name} Switch (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('sets role=switch and reflects checked state via aria-checked', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
          Scene.expect(switchControl).not.toBeChecked(),
        )
      })

      it('exposes an accessible description through aria-describedby', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  description: 'Disable all wireless connections.',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAccessibleDescription(
            'Disable all wireless connections.',
          ),
        )
      })

      it('points aria-labelledby at the label linked via htmlFor', () => {
        // Base UI derives aria-labelledby from an external <label htmlFor>
        // associated with the hidden input. creaseui renders its own label
        // element (id `<id>-label`, for `<id>-control`) and points the
        // switch's aria-labelledby at it.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr(
            'aria-labelledby',
            'airplane-label',
          ),
          Scene.expect(switchLabel).toHaveAttr('htmlFor', 'airplane-control'),
          Scene.expect(switchControl).toHaveAccessibleName('Airplane mode'),
        )
      })

      // DIVERGENCE (documented): Base UI derives the accessible name from an
      // associated label or aria-label. creaseui always emits
      // aria-labelledby="<id>-label" even when no label prop is passed, so a
      // labelless control points at an element that does not exist and has no
      // accessible name.
      it('leaves a dangling aria-labelledby when no label is rendered', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControlUnnamed).toHaveAttr(
            'aria-labelledby',
            'airplane-label',
          ),
          Scene.expect(switchLabel).toBeAbsent(),
        )
      })
    })

    describe('interactions', () => {
      it('changes its state when clicked and mirrors it into the hidden input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  name: 'airplane',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
          // With no `value` prop the mirror emits no `value` attribute
          // while unchecked and the default 'on' while checked, matching
          // Base UI's native checkbox behavior.
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
          Scene.click(switchControl),
          Scene.expectHandled(),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'true'),
          Scene.expect(hiddenInput).toHaveValue('on'),
          Scene.click(switchControl),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
        )
      })

      it('updates its state when changed from outside (controlled)', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetChecked', checked: !model.checked }),
                  ],
                  ['Toggle'],
                ),
                Switch.switchControl(
                  {
                    id: 'airplane',
                    isChecked: model.checked,
                    onToggle: checked => ({ _tag: 'Toggled', checked }),
                    label: 'Airplane mode',
                  },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
          Scene.click(Scene.text('Toggle')),
          Scene.expectHandled(),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'true'),
          Scene.click(Scene.text('Toggle')),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('dispatches onToggle once per click with the next checked state', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.click(switchControl),
          Scene.expectHandled(),
          // The dispatched payload mirrors the checked value Base UI passes
          // to onCheckedChange.
          Scene.expect(switchControl).toBeChecked(),
        )
      })

      it.todo(
        'can be activated with Space key (foldkit toggles on keyup; ' +
          'the scene DSL only emits keydown — verify in e2e)',
      )

      it.todo(
        'can be activated with Enter key (activation relies on the ' +
          'native button Enter→click synthesis the DSL does not emulate ' +
          '— verify in e2e)',
      )

      it('toggles when its associated label is clicked', () => {
        // Covers Base UI's wrapping-label and htmlFor-linked-label cases:
        // creaseui's label prop renders a label element linked to the
        // control that carries the toggle handler itself.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.click(switchLabel),
          Scene.expectHandled(),
          Scene.expect(switchControl).toBeChecked(),
        )
      })
    })

    describe('prop: disabled', () => {
      it('uses aria-disabled instead of the HTML disabled attribute and stays focusable', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).not.toHaveAttr('disabled'),
          Scene.expect(switchControl).toHaveAttr('aria-disabled', 'true'),
          // aria-disabled reads as disabled to assistive tech, matching Base UI.
          Scene.expect(switchControl).toBeDisabled(),
          Scene.expect(switchControl).toHaveAttr('tabIndex', '0'),
          Scene.expect(switchControl).toHaveAttr('data-disabled', ''),
          // No click/key handlers are emitted, so the control cannot toggle.
          Scene.expect(switchControl).not.toHaveHandler('click'),
          Scene.expect(switchControl).not.toHaveHandler('keyup'),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('does not emit disabled attributes when disabled is not set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).not.toHaveAttr('disabled'),
          Scene.expect(switchControl).not.toHaveAttr('aria-disabled'),
          Scene.expect(switchControl).not.toHaveAttr('data-disabled'),
          Scene.expect(switchControl).toHaveHandler('click'),
        )
      })
    })

    describe('prop: readOnly', () => {
      it('exposes aria-readonly and does not toggle from control or label', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  isReadOnly: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(switchControl).toHaveAttr('data-readonly', ''),
          // Neither control nor label carry interaction handlers.
          Scene.expect(switchControl).not.toHaveHandler('click'),
          Scene.expect(switchControl).not.toHaveHandler('keyup'),
          Scene.expect(switchLabel).not.toHaveHandler('click'),
          Scene.expect(switchControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('does not emit the attribute when readOnly is not set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).not.toHaveAttr('aria-readonly'),
          Scene.expect(switchControl).not.toHaveAttr('data-readonly'),
        )
      })
    })

    describe('prop: required', () => {
      it.todo(
        'exposes aria-required and data-required when required ' +
          '(creaseui has no required prop)',
      )

      it('does not emit the attribute when required is not set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).not.toHaveAttr('aria-required'),
          Scene.expect(switchControl).not.toHaveAttr('data-required'),
        )
      })
    })

    describe('form metadata', () => {
      it('sets the name attribute only on the hidden input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  name: 'airplane',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(hiddenInput).toHaveAttr('name', 'airplane'),
          Scene.expect(switchControl).not.toHaveAttr('name'),
        )
      })

      // DIVERGENCE (documented): Base UI always renders the hidden checkbox
      // input; creaseui only emits a `type=hidden` mirror when `name` is
      // provided.
      it('omits the hidden input entirely when no name is provided', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(hiddenInput).toBeAbsent(),
        )
      })

      it('emits the value on the hidden input while checked, never on the switch', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  name: 'airplane',
                  value: 'yes',
                },
                h,
              ),
          },
          Scene.given(initialModel(true)),
          Scene.expect(hiddenInput).toHaveValue('yes'),
          Scene.expect(switchControl).not.toHaveAttr('value'),
        )
      })

      // Base UI emits no `value` attribute on the hidden input unless a
      // value prop is given (the browser default 'on' applies). creaseui's
      // mirror likewise omits `value` while unchecked with no prop.
      it('does not emit a value attribute by default', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  name: 'airplane',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(hiddenInput).not.toHaveAttr('value'),
        )
      })
    })

    describe('style hooks', () => {
      it('marks the control data-checked only while checked', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).not.toHaveAttr('data-checked'),
          Scene.click(switchControl),
          Scene.expectHandled(),
          Scene.expect(switchControl).toHaveAttr('data-checked', ''),
        )
      })

      // Base UI mirrors every state hook (data-checked, data-disabled,
      // data-readonly, data-required) onto the thumb. creaseui mirrors the
      // hooks it supports — data-required stays N/A (no required prop).
      it('mirrors the state hooks onto the thumb', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                  isDisabled: true,
                  isReadOnly: true,
                },
                h,
              ),
          },
          Scene.given(initialModel(true)),
          Scene.expect(switchControl).toHaveAttr('data-checked', ''),
          Scene.expect(switchControl).toHaveAttr('data-disabled', ''),
          Scene.expect(switchControl).toHaveAttr('data-readonly', ''),
          Scene.expect(switchThumb).toHaveAttr('data-checked', ''),
          Scene.expect(switchThumb).toHaveAttr('data-disabled', ''),
          Scene.expect(switchThumb).toHaveAttr('data-readonly', ''),
        )
      })

      it('marks the control and thumb data-unchecked while off', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Switch.switchControl(
                {
                  id: 'airplane',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Airplane mode',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(switchControl).toHaveAttr('data-unchecked', ''),
          Scene.expect(switchThumb).toHaveAttr('data-unchecked', ''),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindSwitch)
verifyRenderer('StyleX', StyleXSwitch)
