import { Option } from 'effect'
import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui'
import { describe, it } from 'vitest'

import type { RadioGroupOption } from '@/lib/radio-group'
import * as StyleXRadio from '@/stylex/radio-group'
import * as TailwindRadio from '@/ui/radio-group'

/**
 * Behavioral parity suite ported from Base UI's radio tests
 * (base-ui/packages/react/src/radio-group/RadioGroup.test.tsx,
 * radio/root/RadioRoot.test.tsx, radio/indicator/RadioIndicator.test.tsx,
 * checked at base-ui HEAD; the *.spec.tsx files are pure type tests).
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance: React ref/instanceof/render-prop checks.
 *  - `render=`/`nativeButton` element substitution and arbitrary attribute
 *    passthrough (e.g. overriding the root role) — foldkit fixes the element
 *    shape, so "can override the built-in attributes" does not apply.
 *  - Event-object payloads: `eventDetails.cancel()`, keyboard-modifier
 *    reporting, and the click propagation/stopPropagation cases — foldkit
 *    dispatches plain messages, not DOM events.
 *  - The `inputRef` suite (13 cases of ref attach/detach semantics) — React
 *    refs do not exist in foldkit.
 *  - Field/Fieldset/Form integration (~40 cases): `data-focused` lifecycle,
 *    name/disabled inheritance, validation modes, `aria-invalid` and error
 *    `aria-describedby` wiring, native form submission, fieldset-disabled
 *    and portal cases. creaseui's radio group is standalone and these need
 *    a real DOM + form semantics; no e2e coverage exists for them yet.
 *  - `data-touched`/`data-dirty`/`data-filled` field hooks (no analogue).
 *  - Indicator animation lifecycle (keepMounted, data-starting/ending-style,
 *    transition/animationend) — the creaseui indicator is a static span.
 *  - Real focus movement / tab-order assertions — approximated here through
 *    the roving `tabIndex`/`data-active` markers instead of `toHaveFocus`.
 */

type Model = Readonly<{
  value: Option.Option<string>
  options: ReadonlyArray<RadioGroupOption>
  radio: TailwindRadio.Model
}>

type Message = Readonly<
  | { _tag: 'GotRadio'; message: TailwindRadio.Message }
  | { _tag: 'SetValue'; value: Option.Option<string> }
  | { _tag: 'RemoveOption'; value: string }
>

type RadioModule = Readonly<{
  init: typeof TailwindRadio.init
  update: typeof TailwindRadio.update
  radioGroup: <Msg>(
    props: {
      model: TailwindRadio.Model
      toParentMessage: (message: TailwindRadio.Message) => Msg
      selectedValue: Option.Option<string>
      ariaLabel: string
      options: ReadonlyArray<RadioGroupOption>
      name?: string
      isDisabled?: boolean
      isReadOnly?: boolean
      orientation?: 'Horizontal' | 'Vertical'
      direction?: 'ltr' | 'rtl'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

type ExtraGroupProps = Readonly<{
  name?: string
  isDisabled?: boolean
  isReadOnly?: boolean
  orientation?: 'Horizontal' | 'Vertical'
  direction?: 'ltr' | 'rtl'
}>

const defaultOptions: ReadonlyArray<RadioGroupOption> = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', description: 'Second choice.' },
  { value: 'c', label: 'Option C' },
]

const updateFor = (Radio: RadioModule) => (model: Model, message: Message) => {
  switch (message._tag) {
    case 'GotRadio': {
      const result = Radio.update(model.radio, message.message)
      const outMessage = result.outMessage
      return {
        model: {
          ...model,
          radio: result.model,
          value:
            outMessage === undefined
              ? model.value
              : Option.some(outMessage.value),
        },
        commands: Command.mapMessages(result.commands, child => ({
          _tag: 'GotRadio' as const,
          message: child,
        })),
      }
    }
    case 'SetValue':
      return { model: { ...model, value: message.value } }
    case 'RemoveOption':
      return {
        model: {
          ...model,
          options: model.options.filter(
            option => option.value !== message.value,
          ),
        },
      }
  }
}

const groupView =
  (Radio: RadioModule, extra: ExtraGroupProps = {}) =>
  (model: Model, h: HtmlBuilder<Message>): Html =>
    Radio.radioGroup(
      {
        model: model.radio,
        selectedValue: model.value,
        toParentMessage: message => ({ _tag: 'GotRadio', message }),
        ariaLabel: 'Density',
        options: model.options,
        ...extra,
      },
      h,
    )

const initialModel = (
  Radio: RadioModule,
  overrides?: {
    value?: Option.Option<string>
    options?: ReadonlyArray<RadioGroupOption>
  },
): Model => ({
  value: overrides?.value ?? Option.none(),
  options: overrides?.options ?? defaultOptions,
  radio: Radio.init({ id: 'density-group' }),
})

const verifyRenderer = (name: string, Radio: RadioModule) => {
  const update = updateFor(Radio)
  const view = (extra?: ExtraGroupProps) => groupView(Radio, extra)

  const radioByName = (label: string) => Scene.role('radio', { name: label })
  const group = Scene.role('radiogroup', { name: 'Density' })
  const hiddenInput = Scene.selector('input[type="hidden"]')
  const anyInput = Scene.selector('input')
  const labels = Scene.all.selector('label')
  const indicators = Scene.all.selector('[data-slot="radio-group-indicator"]')
  const focusAck = Scene.Command.resolve(
    RadioGroupPrimitive.FocusOption,
    RadioGroupPrimitive.Message.CompletedFocusOption(),
  )

  describe(`${name} RadioGroup (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('renders role=radiogroup with an accessible name and aria-orientation', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(group).toExist(),
          Scene.expect(group).toHaveAccessibleName('Density'),
          Scene.expect(group).toHaveAttr('aria-orientation', 'vertical'),
        )
      })

      it('names each radio from its label and wires label for/id', () => {
        // Base UI associates implicit/explicit <label> elements with each
        // radio's hidden input; creaseui generates the label internally, so
        // the association is asserted structurally.
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option A')).toHaveAccessibleName(
            'Option A',
          ),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-labelledby',
            'density-group-option-0-label',
          ),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'id',
            'density-group-option-0',
          ),
          Scene.expect(Scene.nth(labels, 0)).toHaveAttr(
            'id',
            'density-group-option-0-label',
          ),
          Scene.expect(Scene.nth(labels, 0)).toHaveAttr(
            'htmlFor',
            'density-group-option-0',
          ),
        )
      })

      it('exposes an option description through aria-describedby only when present', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option B')).toHaveAccessibleDescription(
            'Second choice.',
          ),
          Scene.expect(radioByName('Option A')).not.toHaveAttr(
            'aria-describedby',
          ),
        )
      })

      it.todo(
        'prop: id — is forwarded to the root element: creaseui has no root ' +
          'id prop; the model id only prefixes generated option/label ids',
      )

      it.todo(
        'sets aria-labelledby from a sibling label associated with the ' +
          'hidden input — creaseui names items only from their internal label',
      )

      it.todo(
        'prefers aria-label over an associated label — creaseui does not ' +
          'expose per-option aria-label',
      )
    })

    describe('prop: disabled', () => {
      it('uses aria-disabled instead of the HTML disabled attribute on items', () => {
        Scene.scene(
          { update, view: view({ isDisabled: true }) },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-disabled',
            'true',
          ),
          Scene.expect(radioByName('Option A')).toHaveAttr('data-disabled', ''),
          Scene.expect(radioByName('Option A')).toBeDisabled(),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('disabled'),
          // Disabled items emit no interaction handlers, so they cannot
          // select. (Scene.click would throw rather than no-op.)
          Scene.expect(radioByName('Option A')).not.toHaveHandler('OnClick'),
          Scene.expect(radioByName('Option A')).not.toHaveHandler(
            'OnKeyDownPreventDefault',
          ),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })

      // DIVERGENCE: Base UI reflects `disabled` onto the radiogroup root as
      // aria-disabled + data-disabled (and onto each item). creaseui marks
      // only the items — the group element stays unmarked. Severity: medium
      // (assistive tech sees enabled group containing disabled radios).
      it.fails('marks the group root aria-disabled when disabled', () => {
        Scene.scene(
          { update, view: view({ isDisabled: true }) },
          Scene.given(initialModel(Radio)),
          Scene.expect(group).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(group).toHaveAttr('data-disabled', ''),
        )
      })

      it('should not have the aria attribute when `disabled` is not set', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(group).not.toHaveAttr('aria-disabled'),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('aria-disabled'),
        )
      })

      it('should not change its state when clicked (no handlers emitted)', () => {
        // Adapted: the scene DSL throws on clicking a disabled element, so the
        // "does not respond" expectation is asserted via absent handlers.
        Scene.scene(
          { update, view: view() },
          Scene.given(
            initialModel(Radio, {
              options: [
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B', isDisabled: true },
              ],
            }),
          ),
          Scene.expect(radioByName('Option B')).toHaveAttr(
            'aria-disabled',
            'true',
          ),
          Scene.expect(radioByName('Option B')).not.toHaveHandler('OnClick'),
          Scene.expect(radioByName('Option B')).not.toHaveHandler(
            'OnKeyDownPreventDefault',
          ),
          Scene.expect(radioByName('Option B')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })
    })

    describe('prop: readOnly', () => {
      it('should have the `aria-readonly` attribute on the group and mark items', () => {
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initialModel(Radio)),
          Scene.expect(group).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(group).toHaveAttr('data-readonly', ''),
          Scene.expect(radioByName('Option A')).toHaveAttr('data-readonly', ''),
          Scene.expect(radioByName('Option A')).not.toHaveHandler('OnClick'),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })

      it('should not have the aria attribute when `readOnly` is not set', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(group).not.toHaveAttr('aria-readonly'),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('data-readonly'),
        )
      })

      it('moves focus with arrow keys without selecting (readOnly)', () => {
        // foldkit keeps a readOnly group navigable: arrows emit FocusedOption,
        // which moves the roving tabIndex/data-active cursor without
        // committing a selection.
        Scene.scene(
          { update, view: view({ isReadOnly: true }) },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.expect(radioByName('Option A')).toBeChecked(),
          Scene.keydown(radioByName('Option A'), 'ArrowDown'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toHaveAttr('data-active', ''),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '0'),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(radioByName('Option A')).toBeChecked(),
          Scene.expect(radioByName('Option B')).not.toBeChecked(),
          Scene.keydown(radioByName('Option B'), ' '),
          Scene.expectIgnored(),
          Scene.expect(radioByName('Option A')).toBeChecked(),
        )
      })
    })

    describe('interactions', () => {
      it('should call onValueChange when an item is clicked', () => {
        Scene.scene(
          { update, view: view({ name: 'density' }) },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
          Scene.click(radioByName('Option B')),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toHaveAttr(
            'aria-checked',
            'true',
          ),
          Scene.expect(radioByName('Option B')).toBeChecked(),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
          Scene.expect(hiddenInput).toHaveValue('b'),
        )
      })

      it('keeps a checked item selected when clicked again', () => {
        // Native radios cannot be unchecked by re-clicking.
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.click(radioByName('Option A')),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option A')).toBeChecked(),
        )
      })

      it('updates its selection when changed from outside (controlled)', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick({
                        _tag: 'SetValue',
                        value: Option.some('b'),
                      }),
                    ],
                    ['Choose B'],
                  ),
                  groupView(Radio)(model, h),
                ],
              ),
          },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option B')).toHaveAttr(
            'aria-checked',
            'false',
          ),
          Scene.click(Scene.text('Choose B')),
          Scene.expectHandled(),
          Scene.expect(radioByName('Option B')).toBeChecked(),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })

      it('should select an item with Space', () => {
        // DIVERGENCE (intentional): Base UI selects on Space keyup; foldkit
        // selects on Space keydown via OnKeyDownPreventDefault (the DSL has
        // no keyup step). The committed end state is identical.
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.keydown(radioByName('Option A'), ' '),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option A')).toBeChecked(),
        )
      })

      it('should not select an item with Enter', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.keydown(radioByName('Option A'), 'Enter'),
          Scene.expectIgnored(),
          Scene.expect(radioByName('Option A')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })

      it.todo(
        'should update its state if the underlying input is toggled — ' +
          'creaseui renders a single display-only hidden mirror input, not a ' +
          'focusable input[type=radio] per item',
      )
    })

    describe('keyboard navigation', () => {
      it('should automatically select radio upon navigation', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.expect(radioByName('Option A')).toBeChecked(),
          Scene.keydown(radioByName('Option A'), 'ArrowDown'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toBeChecked(),
          Scene.expect(radioByName('Option B')).toHaveAttr('data-active', ''),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '0'),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('skips disabled radios during arrow navigation', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(
            initialModel(Radio, {
              value: Option.some('a'),
              options: [
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B', isDisabled: true },
                { value: 'c', label: 'Option C' },
              ],
            }),
          ),
          Scene.keydown(radioByName('Option A'), 'ArrowDown'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option C')).toBeChecked(),
          Scene.expect(radioByName('Option B')).toHaveAttr(
            'aria-checked',
            'false',
          ),
        )
      })

      it('wraps around at both ends with ArrowDown and ArrowUp', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.keydown(radioByName('Option A'), 'ArrowUp'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option C')).toBeChecked(),
          Scene.keydown(radioByName('Option C'), 'ArrowDown'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option A')).toBeChecked(),
        )
      })

      it('navigates with ArrowRight/ArrowLeft in a Horizontal group', () => {
        Scene.scene(
          { update, view: view({ orientation: 'Horizontal' }) },
          Scene.given(initialModel(Radio, { value: Option.some('b') })),
          Scene.expect(group).toHaveAttr('aria-orientation', 'horizontal'),
          Scene.keydown(radioByName('Option B'), 'ArrowRight'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option C')).toBeChecked(),
          Scene.keydown(radioByName('Option C'), 'ArrowLeft'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toBeChecked(),
        )
      })

      it('selects the first and last enabled radio with Home and End', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('b') })),
          Scene.keydown(radioByName('Option B'), 'End'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option C')).toBeChecked(),
          Scene.keydown(radioByName('Option C'), 'Home'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option A')).toBeChecked(),
        )
      })

      it('moves focus normally when Shift is held during arrow navigation', () => {
        // foldkit's keydown handler ignores modifiers, matching Base UI's
        // behavior for Shift.
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.keydown(radioByName('Option A'), 'ArrowDown', {
            shiftKey: true,
          }),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toBeChecked(),
        )
      })

      // DIVERGENCE: Base UI ignores arrow keys held with Meta/Ctrl/Alt (the
      // browser may steal them for its own shortcuts); foldkit's keydown
      // handler ignores modifiers entirely, so the navigation still selects.
      // Severity: low.
      ;(['metaKey', 'ctrlKey', 'altKey'] as const).forEach(modifier => {
        it.fails(`does not select on arrow keys with ${modifier} held`, () => {
          Scene.scene(
            { update, view: view() },
            Scene.given(initialModel(Radio, { value: Option.some('a') })),
            Scene.keydown(radioByName('Option A'), 'ArrowDown', {
              [modifier]: true,
            }),
            Scene.expectHandled(),
            Scene.expect(radioByName('Option B')).not.toBeChecked(),
          )
        })
      })

      // DIVERGENCE: Base UI treats arrow navigation that lands back on the
      // already-focused radio as a no-op (no selection). foldkit resolves the
      // index back to the sole enabled option and selects it anyway.
      // Severity: low.
      it.fails('does not select when arrow navigation lands on the only enabled radio', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(
            initialModel(Radio, {
              options: [
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B', isDisabled: true },
              ],
            }),
          ),
          Scene.keydown(radioByName('Option A'), 'ArrowDown'),
          Scene.expectHandled(),
          Scene.expect(radioByName('Option A')).not.toBeChecked(),
        )
      })

      // DIVERGENCE: Base UI responds to all four arrow keys regardless of
      // orientation; foldkit gates the axis by the orientation prop, so
      // ArrowRight is a no-op in a Vertical group. Severity: medium.
      it.fails('responds to horizontal arrows in a Vertical group', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.keydown(radioByName('Option A'), 'ArrowRight'),
          Scene.expectIgnored(),
          Scene.expect(radioByName('Option B')).toBeChecked(),
        )
      })

      // DIVERGENCE: Base UI flips left/right under DirectionProvider rtl;
      // foldkit renders dir="rtl" but never maps it onto the key bindings, so
      // ArrowLeft still moves to the previous option. Severity: medium.
      it.fails('flips horizontal arrows in RTL', () => {
        Scene.scene(
          {
            update,
            view: view({ direction: 'rtl', orientation: 'Horizontal' }),
          },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.expect(group).toHaveAttr('dir', 'rtl'),
          Scene.keydown(radioByName('Option A'), 'ArrowLeft'),
          Scene.expectHandled(),
          focusAck,
          // Base UI expectation: ArrowLeft is "next" in RTL.
          Scene.expect(radioByName('Option B')).toBeChecked(),
        )
      })

      it('moves the tab stop to the checked radio when the highlighted radio is removed', () => {
        // Adapted: focus/selection divergence in foldkit requires readOnly —
        // FocusedOption moves the roving cursor while the parent keeps the
        // selection on 'b'.
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  h.button(
                    [
                      h.Type('button'),
                      h.OnClick({ _tag: 'RemoveOption', value: 'c' }),
                    ],
                    ['Remove last'],
                  ),
                  groupView(Radio, { isReadOnly: true })(model, h),
                ],
              ),
          },
          Scene.given(initialModel(Radio, { value: Option.some('b') })),
          Scene.keydown(radioByName('Option B'), 'ArrowDown'),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option C')).toHaveAttr('tabIndex', '0'),
          Scene.expect(radioByName('Option C')).toHaveAttr('data-active', ''),
          Scene.expect(radioByName('Option B')).toBeChecked(),
          Scene.click(Scene.text('Remove last')),
          Scene.expectHandled(),
          Scene.expect(radioByName('Option C')).not.toExist(),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '0'),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('sets tabIndex=0 to the correct element initially', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('b') })),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '0'),
          Scene.expect(radioByName('Option C')).toHaveAttr('tabIndex', '-1'),
        )
      })

      it('gives the first enabled radio the tab stop when nothing is selected', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(
            initialModel(Radio, {
              options: [
                { value: 'a', label: 'Option A', isDisabled: true },
                { value: 'b', label: 'Option B' },
                { value: 'c', label: 'Option C' },
              ],
            }),
          ),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '0'),
        )
      })

      it('yields the tab stop to the first enabled radio when the selected one is disabled', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(
            initialModel(Radio, {
              value: Option.some('b'),
              options: [
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B', isDisabled: true },
                { value: 'c', label: 'Option C' },
              ],
            }),
          ),
          Scene.expect(radioByName('Option B')).toBeChecked(),
          Scene.expect(radioByName('Option B')).toHaveAttr('tabIndex', '-1'),
          Scene.expect(radioByName('Option A')).toHaveAttr('tabIndex', '0'),
        )
      })
    })

    describe('form metadata', () => {
      it('sets the name attribute on the group hidden input with the selected value', () => {
        // DIVERGENCE (documented): Base UI renders a sibling
        // input[type=radio] per item, each with name + its own value, so the
        // browser submits the checked one. creaseui renders a single
        // input[type=hidden] mirror carrying only the selected value.
        Scene.scene(
          { update, view: view({ name: 'density' }) },
          Scene.given(initialModel(Radio, { value: Option.some('b') })),
          Scene.expect(hiddenInput).toHaveAttr('name', 'density'),
          Scene.expect(hiddenInput).toHaveValue('b'),
          Scene.expect(radioByName('Option B')).not.toHaveAttr('name'),
        )
      })

      it('should return null in form data when no radio is selected', () => {
        // creaseui emits no named/value-bearing input without a selection,
        // matching the null FormData outcome of the Base UI case.
        Scene.scene(
          { update, view: view({ name: 'density' }) },
          Scene.given(initialModel(Radio)),
          Scene.expect(hiddenInput).toBeAbsent(),
          Scene.expect(Scene.selector('input[name="density"]')).toBeAbsent(),
        )
      })

      it('omits the hidden input entirely when no name is provided', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.expect(anyInput).toBeAbsent(),
        )
      })

      it.todo(
        'data-required style hook — creaseui radio-group has no required prop',
      )
    })

    describe('style hooks', () => {
      it('marks the checked item data-checked and moves it on selection change', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('data-checked'),
          Scene.click(radioByName('Option A')),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option A')).toHaveAttr('data-checked', ''),
          Scene.expect(radioByName('Option B')).not.toHaveAttr('data-checked'),
          Scene.click(radioByName('Option B')),
          Scene.expectHandled(),
          focusAck,
          Scene.expect(radioByName('Option B')).toHaveAttr('data-checked', ''),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('data-checked'),
        )
      })

      // DIVERGENCE (documented): Base UI emits `data-unchecked` on unchecked
      // items and mirrors every state hook (checked/disabled/readonly) onto
      // the indicator. creaseui emits no `data-unchecked` and keeps state
      // hooks on the item only — the indicator is styled via group-data-*
      // selectors on the item.
      it('does not emit data-unchecked and keeps state hooks off the indicator', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(radioByName('Option A')).not.toHaveAttr(
            'data-unchecked',
          ),
          Scene.expect(Scene.nth(indicators, 0)).not.toHaveAttr(
            'data-unchecked',
          ),
          Scene.expect(Scene.nth(indicators, 0)).not.toHaveAttr('data-checked'),
          Scene.expect(Scene.nth(indicators, 0)).not.toHaveAttr(
            'data-disabled',
          ),
          Scene.expect(Scene.nth(indicators, 0)).not.toHaveAttr(
            'data-readonly',
          ),
        )
      })

      // DIVERGENCE (documented): Base UI unmounts Radio.Indicator when the
      // item is unchecked unless keepMounted; creaseui always mounts the
      // indicator span and hides it via CSS (group-data-checked).
      it('keeps the indicator element mounted for unchecked items', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio)),
          Scene.expect(Scene.nth(indicators, 0)).toExist(),
          Scene.expect(Scene.nth(indicators, 0)).toBeEmpty(),
        )
      })
    })

    describe('root element', () => {
      it('does not forward `value` prop', () => {
        Scene.scene(
          { update, view: view() },
          Scene.given(initialModel(Radio, { value: Option.some('a') })),
          Scene.expect(group).not.toHaveAttr('value'),
          Scene.expect(radioByName('Option A')).not.toHaveAttr('value'),
        )
      })
    })

    describe('prop: value', () => {
      it.todo(
        'allows `null` value — creaseui option values are strings; ' +
          'no-selection is Option.none() instead',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindRadio)
verifyRenderer('StyleX', StyleXRadio)
