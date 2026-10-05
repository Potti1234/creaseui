import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StylexInputOtp from '@/stylex/input-otp'
import * as TailwindInputOtp from '@/ui/input-otp'

/**
 * Behavioral parity suite ported from Base UI's otp-field tests
 * (base-ui/packages/react/src/otp-field/root/OTPFieldRoot.test.tsx,
 * otp-field/input/OTPFieldInput.test.tsx and
 * otp-field/input/OTPFieldInput.android.test.tsx, checked at base-ui HEAD).
 *
 * Base UI's OTPField renders one focusable <input> per slot. creaseui follows
 * the shadcn/input-otp design instead: a SINGLE invisible <input> holds the
 * whole value and overlays `length` decorative slot divs in an aria-hidden
 * group. Anything Base UI tests about per-slot focus movement, per-slot
 * selection, or per-slot key editing is native input behavior in creaseui —
 * those cases are it.todo'd below with the reason.
 *
 * Cases that have no creaseui analogue are recorded here instead of being
 * dropped silently:
 *  - describeConformance / OTPFieldRoot.react17.test.tsx: React internals
 *    (ref callbacks, element substitution via `render`, React 17, StrictMode)
 *  - Event payloads: `eventDetails.cancel()`, `REASONS.*` reason arguments,
 *    composed handler preventDefault (foldkit dispatches plain messages)
 *  - Dev-mode console warnings: length/input-count mismatch, non-positive
 *    length, first-slot aria-label, unreadable clipboard (creaseui generates
 *    slots from `length`, so a slot-count mismatch cannot occur)
 *  - Hidden validation input: focus redirect, password-manager autofill
 *    (creaseui carries name/required/pattern on the visible input itself)
 *  - SSR markup: unique per-slot ids, hidden-input minlength/maxlength
 *  - Real focus/timing: tabbing out, focus redirect to the first empty slot,
 *    stale/async controlled-change ordering (no timers in the DSL)
 *  - Real form behavior: checkValidity, requestSubmit, FormData — partially
 *    covered by the attribute-level tests below and e2e/site.spec.ts
 *  - Android IME variant (platform mock)
 *  - Existing e2e coverage for the same component: e2e/site.spec.ts
 *    ("input-otp sections match upstream variants in both renderers")
 */

type Model = Readonly<{
  value: string
}>

type Message = Readonly<
  { _tag: 'ChangedOtp'; value: string } | { _tag: 'SetValue'; value: string }
>

const ChangedOtp = (value: string): Message => ({ _tag: 'ChangedOtp', value })

const initialModel = (value = ''): Model => ({ value })

const update = (_model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'ChangedOtp':
    case 'SetValue':
      return { model: { value: message.value } }
  }
}

type InputOtpModule = Readonly<{
  inputOtp: <Msg>(
    props: {
      id: string
      value: string
      onInput: (value: string) => Msg
      length?: number
      name?: string
      ariaLabel?: string
      isDisabled?: boolean
      isInvalid?: boolean
      isRequired?: boolean
      pattern?: RegExp
      inputMode?:
        | 'numeric'
        | 'text'
        | 'tel'
        | 'decimal'
        | 'email'
        | 'url'
        | 'search'
      separator?: (index: number) => Html
    },
    h: HtmlBuilder<Msg>,
  ) => Html
  inputOtpSeparator: <Msg>(h: HtmlBuilder<Msg>) => Html
}>

const otpInput = Scene.role('textbox')
const otpRoot = Scene.selector('[data-slot="input-otp"]')
const otpGroup = Scene.selector('[data-slot="input-otp-group"]')
const allSlots = Scene.all.selector('[data-slot="input-otp-slot"]')
const allCaretBars = Scene.all.selector('[data-slot="input-otp-slot"] div div')
const allTextboxes = Scene.all.role('textbox')
const slot = (index: number) => Scene.nth(allSlots, index)

const verifyRenderer = (name: string, InputOtp: InputOtpModule) => {
  describe(`${name} InputOtp (Base UI port)`, () => {
    describe('rendering', () => {
      // DIVERGENCE (intentional): Base UI renders one textbox per slot.
      // creaseui renders a single textbox plus `length` decorative slot divs
      // inside an aria-hidden group — the shadcn/input-otp design.
      it('renders a single textbox over per-slot visuals', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expectAll(allTextboxes).toHaveCount(1),
          Scene.expectAll(allSlots).toHaveCount(6),
          Scene.expect(otpGroup).toHaveAttr('aria-hidden', 'true'),
        )
      })
    })

    describe('value handling', () => {
      it('splits the value across slots, dropping characters the pattern rejects', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('12a34b56')),
          Scene.expect(otpInput).toHaveValue('123456'),
          Scene.expect(slot(0)).toHaveText('1'),
          Scene.expect(slot(1)).toHaveText('2'),
          Scene.expect(slot(2)).toHaveText('3'),
          Scene.expect(slot(3)).toHaveText('4'),
          Scene.expect(slot(4)).toHaveText('5'),
          Scene.expect(slot(5)).toHaveText('6'),
        )
      })

      it('clamps an overlong value to the rendered slot count', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  name: 'otp',
                },
                h,
              ),
          },
          Scene.given(initialModel('12a34b56c7')),
          Scene.expectAll(allSlots).toHaveCount(6),
          Scene.expect(otpInput).toHaveValue('123456'),
          // foldkit stores the numeric maxlength as the `maxLength` DOM prop.
          Scene.expect(otpInput).toHaveAttr('maxLength', '6'),
          Scene.expect(slot(5)).toHaveText('6'),
        )
      })

      it('renders one slot per character of length', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  length: 3,
                },
                h,
              ),
          },
          Scene.given(initialModel('123')),
          Scene.expectAll(allSlots).toHaveCount(3),
          Scene.expect(slot(0)).toHaveText('1'),
          Scene.expect(slot(2)).toHaveText('3'),
        )
      })

      it('supports grouped layouts without affecting slot counting', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  separator: index =>
                    index === 2
                      ? InputOtp.inputOtpSeparator(h)
                      : h.span([], []),
                },
                h,
              ),
          },
          Scene.given(initialModel('123456')),
          Scene.expectAll(allSlots).toHaveCount(6),
          Scene.expect(Scene.role('separator')).toExist(),
          Scene.expect(
            Scene.selector('[data-slot="input-otp-separator"]'),
          ).toHaveText('·'),
          Scene.expect(slot(0)).toHaveText('1'),
          Scene.expect(slot(5)).toHaveText('6'),
        )
      })

      it('updates the rendered value in controlled mode', () => {
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
                      h.OnClick({ _tag: 'SetValue', value: '654321' }),
                    ],
                    ['Apply value'],
                  ),
                  InputOtp.inputOtp(
                    { id: 'otp', value: model.value, onInput: ChangedOtp },
                    h,
                  ),
                ],
              ),
          },
          Scene.given(initialModel('123456')),
          Scene.expect(otpInput).toHaveValue('123456'),
          Scene.click(Scene.text('Apply value')),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('654321'),
          Scene.expect(slot(0)).toHaveText('6'),
        )
      })
    })

    describe('prop: validationType (creaseui: pattern)', () => {
      it('supports alphabetic values when the pattern accepts letters', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  pattern: /[a-zA-Z]/,
                },
                h,
              ),
          },
          Scene.given(initialModel('1a2b3Cd4')),
          Scene.expect(otpInput).toHaveValue('abCd'),
          Scene.expect(slot(0)).toHaveText('a'),
          Scene.expect(slot(3)).toHaveText('d'),
          Scene.expect(slot(4)).toHaveText(''),
        )
      })

      it('keeps only pattern-matching characters when typing', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  pattern: /[a-zA-Z]/,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, '1a2b3C'),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('abC'),
        )
      })

      it('supports alphanumeric values when the pattern allows them', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  pattern: /[a-zA-Z0-9]/,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, 'A1-B2c3'),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('A1B2c3'),
        )
      })

      // DIVERGENCE (intentional): Base UI stamps a single-character
      // `pattern="[a-zA-Z0-9]{1}"` on every per-slot input. creaseui emits the
      // raw pattern source on its single input, which the browser applies to
      // the whole value.
      it('exposes the validation pattern on the single input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  pattern: /[a-zA-Z0-9]/,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpInput).toHaveAttr('pattern', '[a-zA-Z0-9]'),
        )
      })

      it('accepts any character when the pattern is a catch-all', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  pattern: /[\s\S]/,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, 'a-b C!'),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('a-b C!'),
        )
      })
    })

    describe('prop: inputMode', () => {
      it('defaults inputmode to numeric and honors the inputMode override', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  InputOtp.inputOtp(
                    {
                      id: 'otp-default',
                      value: model.value,
                      onInput: ChangedOtp,
                    },
                    h,
                  ),
                  InputOtp.inputOtp(
                    {
                      id: 'otp-text',
                      value: model.value,
                      onInput: ChangedOtp,
                      inputMode: 'text',
                    },
                    h,
                  ),
                ],
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(
            Scene.role('textbox', { name: 'One-time password' }),
          ).toHaveAttr('inputmode', 'numeric'),
          // Two inputs share the default aria-label; locate the override by id.
          Scene.expect(Scene.selector('#otp-text')).toHaveAttr(
            'inputmode',
            'text',
          ),
        )
      })
    })

    describe('prop: normalizeValue', () => {
      it.todo(
        'supports custom normalization via normalizeValue ' +
          '(creaseui has no normalizeValue prop — filtering is pattern-only)',
      )
    })

    describe('prop: onValueChange', () => {
      it('emits the typed value through onInput', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, '1'),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('1'),
          Scene.expect(slot(0)).toHaveText('1'),
        )
      })

      it('emits the cleared value through onInput', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('1')),
          Scene.type(otpInput, ''),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue(''),
          Scene.expect(slot(0)).toHaveText(''),
        )
      })
    })

    describe('prop: onValueInvalid', () => {
      it.todo(
        'fires when input normalization removes characters ' +
          '(creaseui has no invalid callback — pattern filters silently)',
      )
    })

    describe('prop: onValueComplete', () => {
      it.todo(
        'fires when the OTP becomes complete ' +
          '(creaseui emits no completion message — derive from value.length in update)',
      )
    })

    describe('Field', () => {
      it.todo(
        'associates Field.Label and Field.Description ' +
          '(creaseui input-otp is not Field-aware — label via ariaLabel prop)',
      )
    })

    describe('accessibility', () => {
      // DIVERGENCE (intentional): Base UI labels a group via Field.Label or a
      // native <label for> on the first slot and forwards root aria-labelledby
      // to the group. creaseui exposes a single aria-label on the input
      // (default "One-time password"); the slot group is aria-hidden.
      it('exposes an accessible name via aria-label', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div(
                [],
                [
                  InputOtp.inputOtp(
                    { id: 'otp-a', value: model.value, onInput: ChangedOtp },
                    h,
                  ),
                  InputOtp.inputOtp(
                    {
                      id: 'otp-b',
                      value: model.value,
                      onInput: ChangedOtp,
                      ariaLabel: 'Verification code',
                    },
                    h,
                  ),
                ],
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(
            Scene.role('textbox', { name: 'One-time password' }),
          ).toExist(),
          Scene.expect(
            Scene.role('textbox', { name: 'Verification code' }),
          ).toHaveAccessibleName('Verification code'),
        )
      })

      it.todo(
        'forwards root aria-describedby/aria-labelledby to the group ' +
          '(creaseui has no such props and marks the slot group aria-hidden)',
      )

      it('marks the input aria-invalid when isInvalid is set', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  isInvalid: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpInput).toHaveAttr('aria-invalid', 'true'),
        )
      })

      // DIVERGENCE (intentional): Base UI applies autocomplete="one-time-code"
      // to the first slot and "off" to the rest. creaseui has exactly one
      // input, which always carries autocomplete="one-time-code".
      it('applies autocomplete="one-time-code" to the single input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpInput).toHaveAttr('autocomplete', 'one-time-code'),
          Scene.expectAll(allTextboxes).toHaveCount(1),
        )
      })

      it.todo(
        'allows overriding the autocomplete attribute ' +
          '(creaseui hardcodes autocomplete="one-time-code")',
      )
    })

    describe('prop: disabled', () => {
      it('disables the single input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpInput).toBeDisabled(),
          Scene.expect(otpInput).toHaveAttr('disabled', 'true'),
        )
      })

      // DIVERGENCE: Base UI drops the change entirely while disabled.
      // creaseui keeps OnInput wired on the disabled input, so a synthetic
      // input event still dispatches — in a real browser `disabled` already
      // prevents input events, so the gap is only observable at vnode level
      // (severity: low).
      it.fails('prevents value changes while disabled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, '1'),
          Scene.expectIgnored(),
          Scene.expect(otpInput).toHaveValue(''),
        )
      })

      // DIVERGENCE: Base UI marks the group `data-disabled` for styling hooks.
      // creaseui emits no data-disabled hook (Tailwind styles via
      // peer-disabled:* classes on the input instead).
      it.fails('marks the group data-disabled while disabled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  isDisabled: true,
                },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpRoot).toHaveAttr('data-disabled', ''),
        )
      })
    })

    describe('prop: readOnly', () => {
      it.todo(
        'marks every slot readonly and prevents value changes ' +
          '(creaseui input-otp has no isReadOnly prop)',
      )
    })

    describe('prop: mask', () => {
      it.todo(
        'renders password slot inputs when mask is set ' +
          '(creaseui has no mask prop — the single input is always type=text)',
      )
    })

    describe('interactions', () => {
      it('fills consecutive slots when typing multiple characters', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.type(otpInput, '123456'),
          Scene.expectHandled(),
          Scene.expect(otpInput).toHaveValue('123456'),
          Scene.expect(slot(0)).toHaveText('1'),
          Scene.expect(slot(5)).toHaveText('6'),
        )
      })

      it.todo(
        'replaces consecutive slots when typing into a later slot ' +
          '(creaseui uses one input — mid-string edits are native caret behavior)',
      )

      it.todo(
        'fills consecutive slots when pasting a code ' +
          '(the scene DSL has no paste step — typing covers the same normalization; e2e covers fill)',
      )

      it.todo(
        'moves focus between slots with arrows, Home and End ' +
          '(single input — the caret moves natively inside the value; no per-slot focus)',
      )

      it.todo(
        'moves focus to the next slot after typing ' +
          '(single input — the caret advances natively inside the value)',
      )

      it.todo(
        'deletes characters and moves focus with Backspace/Delete ' +
          '(single input — editing is native input behavior)',
      )

      it.todo(
        'commits an IME composition once on compositionend ' +
          '(foldkit wires no composition handlers — the native input event covers it)',
      )

      // DIVERGENCE (intentional): Base UI wires keydown handlers on each slot
      // for navigation and deletion. creaseui wires none — every key falls
      // through to the input's native behavior (and the selection mirror below).
      it('wires no key handlers — keyboard editing is native', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpInput).not.toHaveHandler('keydown'),
          Scene.expect(otpInput).not.toHaveHandler('beforeinput'),
        )
      })

      // DIVERGENCE (intentional): Base UI implements per-slot selection on
      // mousedown. creaseui keeps selection native on the single input and
      // mirrors it onto the slots with inline handlers: onmouseup snaps a
      // click onto the slot's character so mistyped digits can be fixed,
      // onselect/onkeyup/onfocus mirror the caret/selection into
      // data-active, and onblur clears it.
      it('mirrors the real selection onto the slots via inline handlers', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('12')),
          Scene.expect(otpInput).toHaveAttr('onselect'),
          Scene.expect(otpInput).toHaveAttr('onkeyup'),
          Scene.expect(otpInput).toHaveAttr('onfocus'),
          Scene.expect(otpInput).toHaveAttr('onblur'),
          Scene.expect(otpInput).toHaveAttr('onmouseup'),
        )
      })
    })

    describe('form integration', () => {
      it('exposes required and aria-required for constraint validation', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  isRequired: true,
                },
                h,
              ),
          },
          Scene.given(initialModel('123')),
          Scene.expect(otpInput).toHaveAttr('required', 'true'),
          Scene.expect(otpInput).toHaveAttr('aria-required', 'true'),
          // checkValidity/submission blocking is real-DOM behavior; covered by e2e.
        )
      })

      // DIVERGENCE (intentional): Base UI renders a separate hidden validation
      // input carrying name/minlength/maxlength/pattern. creaseui carries the
      // name and constraints on the single visible input.
      it('carries name and constraints on the visible input instead of a hidden input', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                {
                  id: 'otp',
                  value: model.value,
                  onInput: ChangedOtp,
                  name: 'otp',
                },
                h,
              ),
          },
          Scene.given(initialModel('123456')),
          Scene.expect(Scene.selector('input[name="otp"]')).toHaveValue(
            '123456',
          ),
          Scene.expect(Scene.selector('input[name="otp"]')).toHaveAttr(
            'maxLength',
            '6',
          ),
          Scene.expect(Scene.selector('input[name="otp"]')).toHaveAttr(
            'pattern',
            '[0-9]',
          ),
          Scene.expectAll(allTextboxes).toHaveCount(1),
        )
      })

      it.todo(
        'auto-submits the owning form on completion ' +
          '(creaseui has no autoSubmit prop)',
      )

      it.todo(
        'submits an associated external form via the form prop ' +
          '(creaseui has no form prop)',
      )
    })

    describe('state attributes', () => {
      // DIVERGENCE: Base UI sets data-complete on the root and every slot
      // input once all slots are filled. creaseui emits no data-complete hook.
      it.fails('sets data-complete on the root when all slots are filled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('123456')),
          Scene.expect(otpRoot).toHaveAttr('data-complete', ''),
        )
      })

      // DIVERGENCE: Base UI mirrors data-complete onto each slot input.
      // creaseui slots carry no model-rendered state hook.
      it.fails('marks each slot data-complete when all slots are filled', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('123456')),
          Scene.expect(slot(0)).toHaveAttr('data-complete', ''),
        )
      })

      // DIVERGENCE: Base UI tracks data-filled/data-focused on the root.
      // creaseui wires no focus/blur handlers and emits neither hook.
      it.fails('tracks data-filled and data-focused on the root', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expect(otpRoot).not.toHaveAttr('data-focused'),
          Scene.type(otpInput, '1'),
          Scene.expectHandled(),
          Scene.expect(otpRoot).toHaveAttr('data-filled', ''),
        )
      })

      // DIVERGENCE (intentional): creaseui's slot-level state hook is
      // data-active, but it is owned by the input's inline selection
      // handlers ('caret' on the cell holding the caret, 'selected' inside
      // a range) — the model never renders it, so re-renders cannot desync
      // it from the real selection.
      it('renders no data-active — the inline handlers own it', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel('12')),
          Scene.expect(slot(0)).not.toHaveAttr('data-active'),
          Scene.expect(slot(2)).not.toHaveAttr('data-active'),
          Scene.type(otpInput, '123456'),
          Scene.expectHandled(),
          Scene.expect(slot(5)).not.toHaveAttr('data-active'),
        )
      })

      // The fake caret renders in every slot (hidden); the inline handlers
      // flip the caret cell's wrap to flex — never model-rendered either.
      it('renders a hidden caret wrap in every slot', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              InputOtp.inputOtp(
                { id: 'otp', value: model.value, onInput: ChangedOtp },
                h,
              ),
          },
          Scene.given(initialModel()),
          Scene.expectAll(allCaretBars).toHaveCount(6),
        )
      })
    })
  })
}

verifyRenderer('Tailwind', TailwindInputOtp)
verifyRenderer('StyleX', StylexInputOtp)
