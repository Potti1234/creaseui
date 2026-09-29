import { Command } from 'foldkit'
import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXSlider from '@/stylex/slider'
import * as TailwindSlider from '@/ui/slider'

/**
 * Behavioral parity suite ported from Base UI's slider tests
 * (base-ui/packages/react/src/slider/{root,thumb,control,indicator,label,
 * track,value}/*.test.tsx, checked at base-ui HEAD).
 *
 * Cases that have no creaseui analogue are recorded as comments here instead
 * of being dropped silently:
 *  - React-implementation internals: refs, inputRef, children/render props,
 *    StrictMode, conformance harness, `useRender` plumbing.
 *  - SSR hydration ordering (`does not link Slider.Label before hydration`).
 *  - Pointer/touch drag geometry: pointer→value math resolves the track via
 *    getBoundingClientRect, pointer capture, grabbed offsets, thumb
 *    alignment/collision modes (none|push|swap) and stacking order — all
 *    layout- and timing-dependent, e2e-only.
 *  - Event-object payloads: event.target name/value, onValueChange change
 *    reasons (inputChange/trackPress/keyboard), cancel semantics — foldkit
 *    components dispatch plain messages, not DOM event objects.
 *  - Real focus behavior: label-click focuses thumb, focus-on-drag,
 *    focus/blur event ordering, focus-visible restoration.
 *  - Field/Form integration: data-touched/dirty/focused hooks, validate
 *    modes, FormData submission, external `form` attribute — creaseui emits
 *    a hidden mirror input / named range inputs instead.
 *  - RTL keyboard direction reversal and vertical single-slider orientation
 *    — the foldkit thumb primitive is horizontal-only.
 *  - Base UI props creaseui does not expose: largeStep, minStepsBetweenValues,
 *    per-thumb `disabled`/`tabIndex`, per-thumb aria-* passthrough props,
 *    `locale` (callers close over it in `formatValue`), `getAriaLabel`,
 *    `thumbCollisionBehavior`, `Slider.Value`/`Slider.Indicator` parts.
 *    Expressible gaps are pinned below with it.fails / it.todo.
 *
 * Range and multi sliders are controlled native `<input type="range">` per
 * thumb; arrow-key stepping on them is native browser behavior and is only
 * covered for the single-thumb foldkit primitive.
 */

type Model = Readonly<{
  slider: TailwindSlider.Model
  value: number
  values: readonly [number, number]
  multiValues: readonly number[]
}>

type Message = Readonly<
  | { _tag: 'GotSliderMessage'; message: TailwindSlider.Message }
  | { _tag: 'SetValue'; value: number }
  | { _tag: 'SetRangeValues'; values: readonly [number, number] }
  | { _tag: 'SetMultiValues'; values: readonly number[] }
>

const initialModel = (
  sliderId: string,
  opts?: Readonly<{
    value?: number
    values?: readonly [number, number]
    multiValues?: readonly number[]
    min?: number
    max?: number
    step?: number
  }>,
): Model => ({
  slider: TailwindSlider.init({
    id: sliderId,
    min: opts?.min ?? 0,
    max: opts?.max ?? 100,
    step: opts?.step ?? 1,
  }),
  value: opts?.value ?? 50,
  values: opts?.values ?? [25, 75],
  multiValues: opts?.multiValues ?? [],
})

type SliderModule = Readonly<{
  init: typeof TailwindSlider.init
  update: typeof TailwindSlider.update
  slider: <Msg>(props: {
    model: TailwindSlider.Model
    value: number
    toParentMessage: (message: TailwindSlider.Message) => Msg
    label?: string
    ariaLabel?: string
    formatValue?: (value: number) => string
    isDisabled?: boolean
    isReadOnly?: boolean
    name?: string
  }, h: HtmlBuilder<Msg>) => Html
  rangeSlider: <Msg>(props: {
    values: readonly [number, number]
    min: number
    max: number
    step?: number
    onInput: (values: readonly [number, number]) => Msg
    orientation?: 'horizontal' | 'vertical'
    direction?: 'ltr' | 'rtl'
    ariaLabels?: readonly [string, string]
    formatValue?: (value: number, index: 0 | 1) => string
    isDisabled?: boolean
    isReadOnly?: boolean
    name?: string
  }, h: HtmlBuilder<Msg>) => Html
  multiSlider: <Msg>(props: {
    values: readonly number[]
    min: number
    max: number
    step?: number
    onInput: (values: readonly number[]) => Msg
    orientation?: 'horizontal' | 'vertical'
    direction?: 'ltr' | 'rtl'
    ariaLabels?: readonly string[]
    isDisabled?: boolean
    isReadOnly?: boolean
    name?: string
  }, h: HtmlBuilder<Msg>) => Html
}>

const rootEl = Scene.selector('[data-slot="slider"]')
const trackEl = Scene.selector('[data-slot="slider-track"]')
const rangeEl = Scene.selector('[data-slot="slider-range"]')
const allRanges = Scene.all.selector('[data-slot="slider-range"]')
const thumbEl = Scene.selector('[data-slot="slider-thumb"]')
const hiddenInput = Scene.selector('input[type="hidden"]')
const lowerInput = Scene.role('slider', { name: 'Minimum value' })
const upperInput = Scene.role('slider', { name: 'Maximum value' })
const allThumbs = Scene.all.role('slider')

const verifyRenderer = (name: string, Slider: SliderModule) => {
  const id = `${name}-slider`
  const labelEl = Scene.selector(`#${id}-label`)
  const labelledThumb = Scene.role('slider', { name: 'Volume' })

  const update = (model: Model, message: Message) => {
    switch (message._tag) {
      case 'GotSliderMessage': {
        const result = Slider.update(model.slider, message.message)
        return {
          model: {
            ...model,
            slider: result.model,
            value: result.outMessage === undefined ? model.value : result.outMessage.value,
          },
          commands: Command.mapMessages(
            result.commands,
            child => ({ _tag: 'GotSliderMessage' as const, message: child }),
          ),
        }
      }
      case 'SetValue':
        return { model: { ...model, value: message.value }, commands: [] }
      case 'SetRangeValues':
        return { model: { ...model, values: message.values }, commands: [] }
      case 'SetMultiValues':
        return { model: { ...model, multiValues: message.values }, commands: [] }
    }
  }

  const sliderView = (
    overrides?: Readonly<{
      label?: string
      ariaLabel?: string
      formatValue?: (value: number) => string
      isDisabled?: boolean
      isReadOnly?: boolean
      name?: string
    }>,
  ) =>
    (model: Model, h: HtmlBuilder<Message>): Html =>
      Slider.slider(
        {
          model: model.slider,
          value: model.value,
          toParentMessage: message => ({ _tag: 'GotSliderMessage', message }),
          ...overrides,
        },
        h,
      )

  const rangeView = (
    props: Readonly<{
      min: number
      max: number
      step?: number
      orientation?: 'horizontal' | 'vertical'
      direction?: 'ltr' | 'rtl'
      ariaLabels?: readonly [string, string]
      formatValue?: (value: number, index: 0 | 1) => string
      isDisabled?: boolean
      isReadOnly?: boolean
      name?: string
    }>,
  ) =>
    (model: Model, h: HtmlBuilder<Message>): Html =>
      Slider.rangeSlider(
        {
          values: model.values,
          onInput: values => ({ _tag: 'SetRangeValues', values }),
          ...props,
        },
        h,
      )

  const multiView = (
    props: Readonly<{
      min: number
      max: number
      step?: number
      ariaLabels?: readonly string[]
    }>,
  ) =>
    (model: Model, h: HtmlBuilder<Message>): Html =>
      Slider.multiSlider(
        {
          values: model.multiValues,
          onInput: values => ({ _tag: 'SetMultiValues', values }),
          ...props,
        },
        h,
      )

  describe(`${name} Slider (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('has the correct aria attributes', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(labelledThumb).toExist(),
          Scene.expect(thumbEl).toHaveAttr('aria-orientation', 'horizontal'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuemin', '0'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuemax', '100'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(thumbEl).toHaveAttr('tabIndex', '0'),
          Scene.expect(rootEl).toExist(),
          Scene.expect(trackEl).toExist(),
          Scene.expect(rangeEl).toExist(),
        )
      })

      it('should update aria-valuenow', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '51'),
        )
      })

      it('gives the thumb an accessible name from the label prop', () => {
        Scene.scene(
          { update, view: sliderView({ label: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(labelEl).toHaveText('Volume'),
          Scene.expect(thumbEl).toHaveAttr('aria-labelledby', `${id}-label`),
          Scene.expect(thumbEl).toHaveAccessibleName('Volume'),
        )
      })

      // DIVERGENCE (documented): Base UI drops the fallback aria-labelledby
      // when no label is rendered. creaseui always emits
      // aria-labelledby="<id>-label", so a labelless thumb points at an
      // element that does not exist.
      it('leaves a dangling aria-labelledby when no label is rendered', () => {
        Scene.scene(
          { update, view: sliderView() },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).toHaveAttr('aria-labelledby', `${id}-label`),
          Scene.expect(labelEl).toBeAbsent(),
        )
      })

      it('does not set aria-labelledby when ariaLabel is provided', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).toHaveAttr('aria-label', 'Volume'),
          Scene.expect(thumbEl).not.toHaveAttr('aria-labelledby'),
        )
      })

      // DIVERGENCE: Base UI emits a default aria-valuetext on range thumbs
      // ("44 start range" / "50 end range"). creaseui only emits
      // aria-valuetext when `formatValue` is provided.
      it.fails('should set default aria-valuetext on range slider thumbs', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [44, 50] })),
          Scene.expect(lowerInput).toHaveAttr('aria-valuetext', '44 start range'),
          Scene.expect(upperInput).toHaveAttr('aria-valuetext', '50 end range'),
        )
      })

      // DIVERGENCE: Base UI sets aria-valuenow on each thumb's input.
      // creaseui range thumbs are native range inputs that expose `value`
      // implicitly; no explicit aria-valuenow is emitted.
      it.fails('exposes aria-valuenow on range slider thumbs', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [44, 50] })),
          Scene.expect(lowerInput).toHaveAttr('aria-valuenow', '44'),
          Scene.expect(upperInput).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it('should not set aria-valuetext when formatValue is not provided', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).not.toHaveAttr('aria-valuetext'),
        )
      })
    })

    describe('prop: format', () => {
      it('formats the value', () => {
        Scene.scene(
          {
            update,
            view: sliderView({
              ariaLabel: 'Volume',
              formatValue: value => `${String(value)}%`,
            }),
          },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).toHaveAttr('aria-valuetext', '50%'),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuetext', '51%'),
        )
      })

      it('formats range values', () => {
        Scene.scene(
          {
            update,
            view: rangeView({
              min: 0,
              max: 100,
              formatValue: (value, index) =>
                `${String(value)} ${index === 0 ? 'start' : 'end'} range`,
            }),
          },
          Scene.given(initialModel(id, { values: [44, 50] })),
          Scene.expect(lowerInput).toHaveAttr('aria-valuetext', '44 start range'),
          Scene.expect(upperInput).toHaveAttr('aria-valuetext', '50 end range'),
        )
      })
    })

    describe('prop: orientation', () => {
      it('sets the data-orientation attribute', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100, orientation: 'vertical' }) },
          Scene.given(initialModel(id)),
          Scene.expect(rootEl).toHaveAttr('data-orientation', 'vertical'),
          Scene.expect(rootEl).toHaveAttr('data-slot', 'slider'),
        )
      })

      // DIVERGENCE: Base UI sets aria-orientation="vertical" on each thumb
      // input. creaseui's range thumbs carry no aria-orientation (the single
      // slider's thumb always reports "horizontal").
      it.fails('sets the aria-orientation attribute on range thumbs', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100, orientation: 'vertical' }) },
          Scene.given(initialModel(id)),
          Scene.expect(lowerInput).toHaveAttr('aria-orientation', 'vertical'),
        )
      })

      it.todo(
        'supports a vertical single-thumb slider — the foldkit thumb ' +
          'primitive is horizontal-only; creaseui has no orientation prop on `slider`',
      )
    })

    describe('prop: disabled', () => {
      it('should render data-disabled on all subcomponents and remove interactions', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume', isDisabled: true }) },
          Scene.given(initialModel(id)),
          Scene.expect(rootEl).toHaveAttr('data-disabled', ''),
          Scene.expect(trackEl).toHaveAttr('data-disabled', ''),
          Scene.expect(rangeEl).toHaveAttr('data-disabled', ''),
          Scene.expect(thumbEl).toHaveAttr('data-disabled', ''),
          Scene.expect(thumbEl).toHaveAttr('aria-disabled', 'true'),
          Scene.expect(thumbEl).toBeDisabled(),
          // aria-disabled keeps the thumb in the tab order, matching Base UI.
          Scene.expect(thumbEl).toHaveAttr('tabIndex', '0'),
          Scene.expect(thumbEl).not.toHaveHandler('pointerdown'),
          Scene.expect(thumbEl).not.toHaveHandler('keydown'),
          Scene.expect(trackEl).not.toHaveHandler('pointerdown'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it('does not drag a thumb disabled via the `disabled` prop', () => {
        Scene.scene(
          {
            update,
            view: rangeView({ min: 0, max: 100, isDisabled: true }),
          },
          Scene.given(initialModel(id)),
          Scene.expect(rootEl).toHaveAttr('data-disabled', ''),
          Scene.expect(lowerInput).toBeDisabled(),
          Scene.expect(upperInput).toBeDisabled(),
          Scene.expect(lowerInput).toHaveAttr('disabled', 'true'),
          Scene.expect(upperInput).toHaveAttr('disabled', 'true'),
        )
      })

      it.todo(
        'disables a single thumb independently — creaseui only supports a ' +
          'whole-slider isDisabled flag',
      )
    })

    describe('prop: readOnly', () => {
      it('keeps a11y attributes but removes interaction handlers', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume', isReadOnly: true }) },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).toHaveAttr('aria-readonly', 'true'),
          Scene.expect(rootEl).toHaveAttr('data-readonly', ''),
          Scene.expect(thumbEl).not.toHaveHandler('pointerdown'),
          Scene.expect(thumbEl).not.toHaveHandler('keydown'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it('ignores range input edits while read-only', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100, isReadOnly: true }) },
          Scene.given(initialModel(id, { values: [25, 75] })),
          Scene.expect(lowerInput).toHaveAttr('aria-readonly', 'true'),
          Scene.type(lowerInput, '90'),
          Scene.expectHandled(),
          Scene.expect(lowerInput).toHaveValue('25'),
          Scene.expect(upperInput).toHaveValue('75'),
        )
      })
    })

    describe('prop: step', () => {
      it('supports non-integer values', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { step: 0.1 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50.1'),
          Scene.keydown(thumbEl, 'ArrowUp'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50.2'),
        )
      })

      // DIVERGENCE: Base UI supports e-notation steps like 1e-8. The
      // foldkit primitive's stepDecimals does not parse exponent notation
      // ('1e-8' has no '.'), so snapAndClamp rounds every tiny-step value
      // to 0 — arrow keys can never move a tiny-step slider.
      it.fails('supports tiny step values without rounding error', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 0, step: 1e-8 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '1e-8'),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '2e-8'),
        )
      })

      it('rounds fractional values to the configured step', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 0.2, step: 0.1 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '0.3'),
        )
      })

      it('keypresses should correct invalid values', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 5.4698 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '6'),
        )
      })
    })

    describe('prop: max', () => {
      it('sets the max attribute on the range inputs', () => {
        Scene.scene(
          { update, view: rangeView({ min: 20, max: 40, step: 2 }) },
          Scene.given(initialModel(id, { values: [24, 36] })),
          Scene.expect(lowerInput).toHaveAttr('min', '20'),
          Scene.expect(lowerInput).toHaveAttr('max', '40'),
          Scene.expect(lowerInput).toHaveAttr('step', '2'),
          Scene.expect(lowerInput).toHaveValue('24'),
          Scene.expect(upperInput).toHaveValue('36'),
        )
      })

      it('should not go more than the max', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 100 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '100'),
        )
      })
    })

    describe('prop: min', () => {
      it('should use min as the step origin', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 22, min: 20, max: 40, step: 10 })),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '30'),
          Scene.keydown(thumbEl, 'ArrowLeft'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '20'),
        )
      })

      it('should not go less than the min', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 0 })),
          Scene.keydown(thumbEl, 'ArrowLeft'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '0'),
        )
      })

      it('clamps range values that fall outside the min and max bounds', () => {
        Scene.scene(
          { update, view: rangeView({ min: 20, max: 40 }) },
          Scene.given(initialModel(id, { values: [25, 35] })),
          Scene.type(lowerInput, '10'),
          Scene.expectHandled(),
          Scene.expect(lowerInput).toHaveValue('20'),
          Scene.type(upperInput, '50'),
          Scene.expect(upperInput).toHaveValue('40'),
        )
      })

      // DIVERGENCE (intentional): Base UI logs a dev warning when max <= min.
      // creaseui's range slider silently normalizes the bounds via
      // normalizeRange (min/max are swapped).
      it('normalizes reversed min/max bounds on the range slider', () => {
        Scene.scene(
          { update, view: rangeView({ min: 40, max: 20 }) },
          Scene.given(initialModel(id, { values: [25, 35] })),
          Scene.expect(lowerInput).toHaveAttr('min', '20'),
          Scene.expect(lowerInput).toHaveAttr('max', '40'),
          Scene.expect(lowerInput).toHaveValue('25'),
        )
      })

      it.todo(
        'warns when max is not greater than min — creaseui normalizes ' +
          'reversed bounds instead of warning',
      )
    })

    describe('prop: minStepsBetweenValues', () => {
      it.todo(
        'should enforce a minimum difference between range slider values — ' +
          'creaseui has no minStepsBetweenValues prop (thumbs may touch but not cross)',
      )
    })

    describe('prop: onValueCommitted', () => {
      it.todo(
        'commits the value once when the interaction ends — creaseui emits ' +
          'ChangedValue on every change and has no commit callback',
      )
    })

    describe('events', () => {
      it('should apply data-dragging for dragging modality', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl),
          Scene.expectHandled(),
          Scene.expect(rootEl).toHaveAttr('data-dragging', ''),
          Scene.expect(thumbEl).toHaveAttr('data-dragging', ''),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.ReleasedDragPointer(),
          }),
          Scene.expect(rootEl).not.toHaveAttr('data-dragging'),
        )
      })

      it('does not apply data-dragging for click modality', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(rootEl).not.toHaveAttr('data-dragging'),
          Scene.expect(thumbEl).not.toHaveAttr('data-dragging'),
        )
      })

      it.todo(
        'should focus the slider when dragging — no real focus in the ' +
          'scene DSL; verify in e2e',
      )
    })

    describe('prop: onValueChange', () => {
      it('is not called when clicking on the thumb', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl),
          Scene.expectHandled(),
          // The press only enters the drag state; the value is unchanged.
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(thumbEl).toHaveAttr('data-dragging', ''),
        )
      })

      it('should not react to right clicks', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl, { button: 2 }),
          Scene.expectIgnored(),
          Scene.pointerDown(trackEl, { button: 2 }),
          Scene.expectIgnored(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(thumbEl).not.toHaveAttr('data-dragging'),
        )
      })

      it('updates the value while dragging', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl),
          Scene.expectHandled(),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.MovedDragPointer({ value: 75 }),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '75'),
          Scene.expect(rootEl).toHaveAttr('data-dragging', ''),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.ReleasedDragPointer(),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '75'),
          Scene.expect(rootEl).not.toHaveAttr('data-dragging'),
        )
      })

      it('ignores drag moves when no drag is active', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.MovedDragPointer({ value: 75 }),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it('restores the pre-drag value when the drag is cancelled', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl),
          Scene.expectHandled(),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.MovedDragPointer({ value: 80 }),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '80'),
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.CancelledDrag(),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(rootEl).not.toHaveAttr('data-dragging'),
        )
      })

      // The track's pointerdown resolves clientX → value through
      // getBoundingClientRect; with no mounted DOM the lookup returns no
      // message, so a track press is inert at the vnode level.
      it('cannot resolve a value when pressing the track without layout', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(trackEl),
          Scene.expectIgnored(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(rootEl).not.toHaveAttr('data-dragging'),
        )
      })

      it('ignores a second pointer press while a drag is active', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.pointerDown(thumbEl),
          Scene.expectHandled(),
          // A thumb pointerdown also reaches the track handler in the real
          // DOM (bubbling); the primitive short-circuits it while Dragging.
          Scene.Subscription.emit({
            _tag: 'GotSliderMessage',
            message: TailwindSlider.Message.PressedPointer({
              value: 70,
              originValue: 50,
            }),
          }),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it.todo(
        'moves the value when pressing the track — pointer→value math ' +
          'requires layout; verify in e2e',
      )
    })

    describe('keyboard interactions', () => {
      it('moves the slider in the correct direction on arrow presses', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '51'),
          Scene.keydown(thumbEl, 'ArrowUp'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '52'),
          Scene.keydown(thumbEl, 'ArrowLeft'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '51'),
          Scene.keydown(thumbEl, 'ArrowDown'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it('key: End sets value to max in a single value slider', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.keydown(thumbEl, 'End'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '100'),
        )
      })

      it('key: Home sets value to min in a single value slider', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.keydown(thumbEl, 'Home'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '0'),
        )
      })

      it('key: PageUp increments the value by the page step', () => {
        // Base UI's default largeStep is 10; foldkit's page step is step*10,
        // identical for step=1.
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 20 })),
          Scene.keydown(thumbEl, 'PageUp'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '30'),
          Scene.keydown(thumbEl, 'PageDown'),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '20'),
        )
      })

      it('key: PageUp does not exceed max', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 95 })),
          Scene.keydown(thumbEl, 'PageUp'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '100'),
        )
      })

      // DIVERGENCE: Base UI multiplies the move by largeStep when Shift is
      // held. foldkit ignores modifiers — Shift+ArrowRight moves one step.
      it.fails('key: ArrowRight increments the value by largeStep when Shift is pressed', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 20 })),
          Scene.keydown(thumbEl, 'ArrowRight', { shiftKey: true }),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '30'),
        )
      })

      // DIVERGENCE: Base UI steps PageUp by a configurable largeStep (5 here,
      // so 20 → 25). foldkit has no largeStep prop — PageUp always moves
      // step*10 (20 → 40 on a step-2 grid).
      it.fails('key: PageUp preserves largeStep increments when step uses a different grid', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 20, step: 2 })),
          Scene.keydown(thumbEl, 'PageUp'),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '25'),
        )
      })

      it('ignores keys with no slider mapping', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.keydown(thumbEl, 'a'),
          Scene.expectIgnored(),
          Scene.keydown(thumbEl, 'Enter'),
          Scene.expectIgnored(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
        )
      })

      it.todo(
        'reverses arrow direction in RTL — the foldkit thumb primitive ' +
          'does not support direction',
      )

      it.todo(
        'steps range slider thumbs via the keyboard — creaseui range thumbs ' +
          'are native range inputs whose keys are handled by the browser; ' +
          'verify in e2e',
      )
    })

    describe('controlled value', () => {
      it('positions the thumb when the controlled value changes externally', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValue', value: 70 }),
                  ],
                  ['Set to 70'],
                ),
                Slider.slider(
                  {
                    model: model.slider,
                    value: model.value,
                    toParentMessage: message => ({ _tag: 'GotSliderMessage', message }),
                    ariaLabel: 'Volume',
                  },
                  h,
                ),
              ]),
          },
          Scene.given(initialModel(id)),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '50'),
          Scene.expect(thumbEl).toHaveStyle('left', '50%'),
          Scene.click(Scene.text('Set to 70')),
          Scene.expectHandled(),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '70'),
          Scene.expect(thumbEl).toHaveStyle('left', '70%'),
          Scene.expect(rangeEl).toHaveStyle('width', '70%'),
        )
      })

      // DIVERGENCE: Base UI clamps a controlled value into [min, max].
      // creaseui renders the value verbatim — the parent must snapAndClamp
      // the value it owns (per the init contract).
      it.fails('clamps an out-of-range controlled value', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id, { value: 150 })),
          Scene.expect(thumbEl).toHaveAttr('aria-valuenow', '100'),
        )
      })
    })

    describe('name / form metadata', () => {
      it('should include the slider value via a hidden input when name is set', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume', name: 'volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(hiddenInput).toHaveAttr('name', 'volume'),
          Scene.expect(hiddenInput).toHaveValue('50'),
          Scene.keydown(thumbEl, 'ArrowRight'),
          Scene.expectHandled(),
          Scene.expect(hiddenInput).toHaveValue('51'),
        )
      })

      it('omits the hidden input when no name is provided', () => {
        Scene.scene(
          { update, view: sliderView({ ariaLabel: 'Volume' }) },
          Scene.given(initialModel(id)),
          Scene.expect(hiddenInput).toBeAbsent(),
        )
      })

      // DIVERGENCE (intentional): Base UI gives every range thumb the same
      // `name` so FormData.getAll('slider') collects the array. creaseui
      // emits indexed names (slider[0], slider[1]).
      it('names range inputs with indexed names', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100, name: 'slider' }) },
          Scene.given(initialModel(id)),
          Scene.expect(lowerInput).toHaveAttr('name', 'slider[0]'),
          Scene.expect(upperInput).toHaveAttr('name', 'slider[1]'),
        )
      })

      it.todo(
        'submits to an external form when `form` is provided — creaseui has ' +
          'no form attribute prop',
      )
    })

    describe('range slider thumbs', () => {
      it('renders two thumbs with accessible names and current values', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [25, 75] })),
          Scene.expect(lowerInput).toHaveAttr('type', 'range'),
          Scene.expect(lowerInput).toHaveAttr('aria-label', 'Minimum value'),
          Scene.expect(lowerInput).toHaveValue('25'),
          Scene.expect(upperInput).toHaveAttr('aria-label', 'Maximum value'),
          Scene.expect(upperInput).toHaveValue('75'),
        )
      })

      it('labels each thumb with the ariaLabels prop', () => {
        Scene.scene(
          {
            update,
            view: rangeView({
              min: 0,
              max: 100,
              ariaLabels: ['Low price', 'High price'],
            }),
          },
          Scene.given(initialModel(id)),
          Scene.expect(Scene.role('slider', { name: 'Low price' })).toExist(),
          Scene.expect(Scene.role('slider', { name: 'High price' })).toExist(),
        )
      })

      it('fills the track between the two thumbs', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [25, 75] })),
          Scene.expect(rangeEl).toHaveStyle('left', '25%'),
          Scene.expect(rangeEl).toHaveStyle('right', '25%'),
          Scene.type(lowerInput, '60'),
          Scene.expectHandled(),
          Scene.expect(rangeEl).toHaveStyle('left', '60%'),
        )
      })

      it('clamps the lower thumb at the upper thumb', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [20, 80] })),
          Scene.type(lowerInput, '90'),
          Scene.expectHandled(),
          Scene.expect(lowerInput).toHaveValue('80'),
        )
      })

      it('clamps the upper thumb at the lower thumb', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { values: [20, 80] })),
          Scene.type(upperInput, '10'),
          Scene.expectHandled(),
          Scene.expect(upperInput).toHaveValue('20'),
        )
      })

      // DIVERGENCE: Base UI marks each thumb div with data-index.
      // creaseui range thumbs are bare inputs with no index attribute.
      it.fails('sets the thumb index data attribute', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id)),
          Scene.expect(lowerInput).toHaveAttr('data-index', '0'),
          Scene.expect(upperInput).toHaveAttr('data-index', '1'),
        )
      })

      it('labels every thumb of a multi-thumb slider', () => {
        Scene.scene(
          { update, view: multiView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { multiValues: [20, 50, 80] })),
          Scene.expectAll(allThumbs).toHaveCount(3),
          Scene.expect(Scene.role('slider', { name: 'Value 1' })).toExist(),
          Scene.expect(Scene.role('slider', { name: 'Value 2' })).toExist(),
          Scene.expect(Scene.role('slider', { name: 'Value 3' })).toExist(),
          Scene.expectAll(allRanges).toHaveCount(2),
        )
      })

      it('clamps a middle thumb between its neighbors', () => {
        Scene.scene(
          { update, view: multiView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { multiValues: [20, 50, 80] })),
          Scene.type(Scene.role('slider', { name: 'Value 2' }), '90'),
          Scene.expectHandled(),
          Scene.expect(Scene.role('slider', { name: 'Value 2' })).toHaveValue('80'),
          Scene.type(Scene.role('slider', { name: 'Value 2' }), '5'),
          Scene.expect(Scene.role('slider', { name: 'Value 2' })).toHaveValue('20'),
        )
      })

      it('fills a single-thumb multi slider from the minimum', () => {
        Scene.scene(
          { update, view: multiView({ min: 0, max: 100 }) },
          Scene.given(initialModel(id, { multiValues: [30] })),
          Scene.expectAll(allThumbs).toHaveCount(1),
          Scene.expect(Scene.role('slider', { name: 'Value 1' })).toHaveValue('30'),
          Scene.expect(rangeEl).toHaveStyle('left', '0%'),
          Scene.expect(rangeEl).toHaveStyle('right', '70%'),
        )
      })

      it('handles non-integer change events on a thumb', () => {
        Scene.scene(
          { update, view: rangeView({ min: 0, max: 100, step: 0.00000001 }) },
          Scene.given(initialModel(id, { values: [44, 55] })),
          Scene.type(lowerInput, '51.1'),
          Scene.expectHandled(),
          Scene.expect(lowerInput).toHaveValue('51.1'),
          Scene.expect(lowerInput).toHaveAttr('step', '1e-8'),
        )
      })
    })

    describe('Slider.Label', () => {
      it.todo(
        'Slider.Label focuses the thumb on click — the scene DSL has no ' +
          'real focus and creaseui labels emit no click handler; verify in e2e',
      )
    })

    describe('Slider.Value', () => {
      it.todo(
        'renders the current value — creaseui has no Slider.Value output part',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindSlider)
verifyRenderer('StyleX', StyleXSlider)
