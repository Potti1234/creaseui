import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXCheckbox from '@/stylex/checkbox'
import * as TailwindCheckbox from '@/ui/checkbox'

/**
 * Behavioral parity suite ported from Base UI's checkbox tests
 * (base-ui/packages/react/src/checkbox/root/CheckboxRoot.test.tsx and
 * checkbox/indicator/CheckboxIndicator.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded as comments at the
 * bottom of this file instead of being dropped silently:
 *  - React-implementation internals (ref callbacks, StrictMode, React 17)
 *  - `onCheckedChange` cancellation + event-modifier payloads (foldkit
 *    components dispatch messages, not DOM event objects)
 *  - Native hidden-input toggling / form validation (creaseui renders a
 *    `type=hidden` mirror input, not a focusable checkbox input)
 *  - Space activation: foldkit toggles on `keyup` which the scene DSL
 *    cannot emit — covered by e2e instead.
 */

type Model = Readonly<{
  checked: boolean
  lastToggle: boolean | 'none'
}>

type Message = Readonly<
  | { _tag: 'Toggled'; checked: boolean }
  | { _tag: 'SetChecked'; checked: boolean }
>

const initialModel = (checked = false): Model => ({
  checked,
  lastToggle: 'none',
})

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'Toggled':
      return { model: { ...model, checked: message.checked, lastToggle: message.checked } }
    case 'SetChecked':
      return { model: { ...model, checked: message.checked } }
  }
}

type CheckboxModule = Readonly<{
  checkbox: <Msg>(props: {
    id: string
    isChecked: boolean
    onToggle: (checked: boolean) => Msg
    label?: Html | string
    description?: Html | string
    isDisabled?: boolean
    isReadOnly?: boolean
    isInvalid?: boolean
    isIndeterminate?: boolean
    name?: string
    value?: string
    class?: string
  }, h: HtmlBuilder<Msg>) => Html
}>

const checkboxControl = Scene.role('checkbox', { name: 'Accept terms' })
const checkboxControlUnnamed = Scene.role('checkbox')
const hiddenInput = Scene.selector('input[type="hidden"]')

const verifyRenderer = (name: string, Checkbox: CheckboxModule) => {
  describe(`${name} Checkbox (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('sets role=checkbox and reflects checked state via aria-checked', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
          Scene.expect(checkboxControl).not.toBeChecked(),
        )
      })

      it('exposes an accessible description through aria-describedby', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                  description: 'Required to continue.',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAccessibleDescription(
            'Required to continue.',
          ),
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
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControlUnnamed).toHaveAttr(
            'aria-labelledby',
            'terms-label',
          ),
          Scene.expect(Scene.selector('#terms-label')).toBeAbsent(),
        )
      })
    })

    describe('interactions', () => {
      it('changes its state when clicked and mirrors it into the hidden input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                  name: 'terms',
                  value: 'accepted',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
          Scene.expect(hiddenInput).toHaveValue(''),
          Scene.click(checkboxControl),
          Scene.expectHandled(),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'true'),
          Scene.expect(hiddenInput).toHaveValue('accepted'),
          Scene.click(checkboxControl),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
          Scene.expect(hiddenInput).toHaveValue(''),
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
                Checkbox.checkbox(
                  {
                    id: 'terms',
                    isChecked: model.checked,
                    onToggle: checked => ({ _tag: 'Toggled', checked }),
                    label: 'Accept terms',
                  },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
          Scene.click(Scene.text('Toggle')),
          Scene.expectHandled(),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'true'),
          Scene.click(Scene.text('Toggle')),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('dispatches onToggle once per click with the next checked state', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.click(checkboxControl),
          Scene.expectHandled(),
          // lastToggle mirrors the payload Base UI passes to onCheckedChange.
          Scene.expect(checkboxControl).toBeChecked(),
        )
      })

      it.todo(
        'can be activated with Space key (foldkit toggles on keyup; ' +
          'the scene DSL only emits keydown — verify in e2e)',
      )

      it('does not activate with Enter key', () => {
        // foldkit only wires Space (keyup) activation; no keydown handler
        // exists on the control, so Enter can never toggle it.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).not.toHaveHandler('OnKeyDown'),
          Scene.expect(checkboxControl).not.toHaveHandler('OnKeyDownPreventDefault'),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('toggles when its label is clicked', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.click(Scene.selector('#terms-label')),
          Scene.expectHandled(),
          Scene.expect(checkboxControl).toBeChecked(),
        )
      })
    })

    describe('prop: disabled', () => {
      it('uses aria-disabled instead of the HTML disabled attribute and stays focusable', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAttr('aria-disabled', 'true'),
          // aria-disabled reads as disabled to assistive tech, matching Base UI.
          Scene.expect(checkboxControl).toBeDisabled(),
          Scene.expect(checkboxControl).toHaveAttr('tabIndex', '0'),
          Scene.expect(checkboxControl).toHaveAttr('data-disabled', ''),
          // No click/key handlers are emitted, so the control cannot toggle.
          Scene.expect(checkboxControl).not.toHaveHandler('OnClick'),
          Scene.expect(checkboxControl).not.toHaveHandler('OnKeyUpPreventDefault'),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
        )
      })
    })

    describe('prop: readOnly', () => {
      it('exposes aria-readonly and does not toggle from control or label', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                  isReadOnly: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(checkboxControl).toHaveAttr('data-readonly', ''),
          // Neither control nor label carry interaction handlers.
          Scene.expect(checkboxControl).not.toHaveHandler('OnClick'),
          Scene.expect(checkboxControl).not.toHaveHandler('OnKeyUpPreventDefault'),
          Scene.expect(Scene.selector('#terms-label')).not.toHaveHandler('OnClick'),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'false'),
        )
      })

      it('does not emit the attribute when readOnly is not set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).not.toHaveAttr('aria-readonly'),
          Scene.expect(checkboxControl).not.toHaveAttr('data-readonly'),
        )
      })
    })

    describe('prop: indeterminate', () => {
      const indeterminateView = (Checkbox: CheckboxModule) => (model: Model, h: HtmlBuilder<Message>) =>
        Checkbox.checkbox(
          {
            id: 'selection',
            isChecked: model.checked,
            onToggle: checked => ({ _tag: 'Toggled', checked }),
            label: 'Accept terms',
            isIndeterminate: true,
          },
          h,
        )

      it('sets aria-checked to "mixed" and marks the control data-indeterminate', () => {
        Scene.scene(
          { update, view: indeterminateView(Checkbox) },
          Scene.given(initialModel()),
          Scene.expect(
            Scene.role('checkbox', { name: 'Accept terms', checked: 'mixed' }),
          ).toExist(),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'mixed'),
          Scene.expect(checkboxControl).toHaveAttr('data-indeterminate', ''),
        )
      })

      it('stays mixed when clicked while the indeterminate flag remains', () => {
        Scene.scene(
          { update, view: indeterminateView(Checkbox) },
          Scene.given(initialModel()),
          Scene.click(checkboxControl),
          Scene.expectHandled(),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'mixed'),
        )
      })

      it('is not overridden by the checked prop', () => {
        Scene.scene(
          { update, view: indeterminateView(Checkbox) },
          Scene.given(initialModel(true)),
          Scene.expect(checkboxControl).toHaveAttr('aria-checked', 'mixed'),
        )
      })
    })

    describe('form metadata', () => {
      it('sets the name attribute only on the hidden input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                  name: 'terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(hiddenInput).toHaveAttr('name', 'terms'),
          Scene.expect(checkboxControl).not.toHaveAttr('name'),
        )
      })

      it('omits the hidden input entirely when no name is provided', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(hiddenInput).toBeAbsent(),
        )
      })
    })

    describe('style hooks', () => {
      it('marks the control data-checked only while checked', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(checkboxControl).not.toHaveAttr('data-checked'),
          Scene.click(checkboxControl),
          Scene.expectHandled(),
          Scene.expect(checkboxControl).toHaveAttr('data-checked', ''),
        )
      })

      // DIVERGENCE (documented): Base UI also emits `data-unchecked` on the
      // unchecked control and mirrors all state hooks onto the indicator.
      // creaseui emits no `data-unchecked` and keeps state hooks on the
      // control only — the indicator is styled via `group-data-*` selectors.
      it('does not mark the indicator with state hooks (known divergence)', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Checkbox.checkbox(
                {
                  id: 'terms',
                  isChecked: model.checked,
                  onToggle: checked => ({ _tag: 'Toggled', checked }),
                  label: 'Accept terms',
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(
            Scene.selector('[data-slot="checkbox-indicator"]'),
          ).not.toHaveAttr('data-unchecked'),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindCheckbox)
verifyRenderer('StyleX', StyleXCheckbox)
