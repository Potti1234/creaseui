import * as Scene from 'foldkit/scene'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { describe, it } from 'vitest'

import * as StyleXProgress from '@/stylex/progress'
import * as TailwindProgress from '@/ui/progress'

/**
 * Behavioral parity suite ported from Base UI's progress tests
 * (base-ui/packages/react/src/progress/root/ProgressRoot.test.tsx plus the
 * indicator/label/track/value part suites, checked at base-ui HEAD).
 *
 * Base UI composes Progress.Root + Label + Value + Track + Indicator;
 * creaseui renders a single progressbar element (styled as the track) with a
 * child `[data-slot="progress-indicator"]`, so part-level cases map onto the
 * root and indicator or are recorded as `it.todo` when the part does not
 * exist.
 *
 * Cases that have no creaseui analogue are recorded as comments here instead
 * of being dropped silently:
 *  - `describeConformance` for every part (React refs, `render=` element
 *    substitution, StrictMode — foldkit fixes the element and has no refs)
 *  - `Progress.Label` "throws when rendered outside <Progress.Root>"
 *    (React context internals; creaseui has no Label part)
 *  - `Progress.Value` render-function `children` cases (render-prop)
 *  - `Progress.Indicator` computed-style assertions are gated `skipIf(isJSDOM)`
 *    upstream; they are ported here as inline-style assertions since creaseui
 *    expresses the fill as `transform: translateX` on a full-width bar
 *    instead of a `width` percentage.
 */

type Model = Readonly<{
  value: number | null
}>

type Message = Readonly<{ _tag: 'SetValue'; value: number | null }>

const initialModel = (value: number | null = 0): Model => ({ value })

const update = (model: Model, message: Message): { model: Model } => {
  switch (message._tag) {
    case 'SetValue':
      return { model: { ...model, value: message.value } }
  }
}

// Only the props shared by both skins; `class`/`layoutStyle` stay out.
type ProgressModule = Readonly<{
  progress: <Msg>(
    props: {
      value: number | null
      max?: number
      ariaLabel?: string
      valueText?: string
      id?: string
      direction?: 'ltr' | 'rtl'
    },
    h: HtmlBuilder<Msg>,
  ) => Html
}>

const progressbar = Scene.role('progressbar')
const indicator = Scene.selector('[data-slot="progress-indicator"]')

const verifyRenderer = (name: string, Progress: ProgressModule) => {
  const view =
    (props: Omit<Parameters<ProgressModule['progress']>[0], 'value'>) =>
    (model: Model, h: HtmlBuilder<Message>) =>
      Progress.progress({ ...props, value: model.value }, h)

  describe(`${name} Progress (Base UI port)`, () => {
    describe('ARIA attributes', () => {
      it('sets the correct aria attributes', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              Progress.progress(
                { value: model.value, ariaLabel: 'Upload progress' },
                h,
              ),
          },
          Scene.given(initialModel(30)),
          Scene.expect(progressbar).toExist(),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '30'),
          Scene.expect(progressbar).toHaveAttr('aria-valuemin', '0'),
          Scene.expect(progressbar).toHaveAttr('aria-valuemax', '100'),
        )
      })

      // Parity: creaseui derives the default aria-valuetext from the
      // percent-formatted value ('indeterminate progress' when indeterminate);
      // the valueText prop plays Base UI's getAriaValueText override role.
      it('emits a formatted aria-valuetext by default for a determinate value', () => {
        const expected = (0.3).toLocaleString(undefined, { style: 'percent' })
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(30)),
          Scene.expect(progressbar).toHaveAttr('aria-valuetext', expected),
        )
      })

      it('emits "indeterminate progress" as aria-valuetext when indeterminate', () => {
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(null)),
          Scene.expect(progressbar).toHaveAttr(
            'aria-valuetext',
            'indeterminate progress',
          ),
        )
      })

      it('labels the progressbar through the ariaLabel prop', () => {
        Scene.scene(
          { update, view: view({ ariaLabel: 'Upload progress' }) },
          Scene.given(initialModel(40)),
          Scene.expect(
            Scene.role('progressbar', { name: 'Upload progress' }),
          ).toExist(),
          Scene.expect(progressbar).toHaveAttr('aria-label', 'Upload progress'),
        )
      })

      it.todo(
        'updates and clears the progress bar label association — creaseui ' +
          'has no Label part; the name comes from the ariaLabel prop',
      )

      it('should update aria-valuenow when value changes', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValue', value: 77 }),
                  ],
                  ['Set to 77'],
                ),
                Progress.progress({ value: model.value }, h),
              ]),
          },
          Scene.given(initialModel(50)),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '50'),
          Scene.click(Scene.text('Set to 77')),
          Scene.expectHandled(),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '77'),
        )
      })
    })

    describe('data attributes', () => {
      // Base UI mirrors data-indeterminate / data-progressing / data-complete
      // onto every composed part. creaseui emits them on the progressbar only,
      // alongside its own data-state hook: 'indeterminate' | 'determinate'.
      it('keeps data-state synchronized through the status cycle', () => {
        Scene.scene(
          {
            update,
            view: (model, h) =>
              h.div([], [
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValue', value: null }),
                  ],
                  ['To indeterminate'],
                ),
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValue', value: 50 }),
                  ],
                  ['To 50'],
                ),
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick({ _tag: 'SetValue', value: 100 }),
                  ],
                  ['To 100'],
                ),
                Progress.progress({ value: model.value }, h),
              ]),
          },
          Scene.given(initialModel(null)),
          Scene.expect(progressbar).toHaveAttr('data-state', 'indeterminate'),
          Scene.expect(progressbar).not.toHaveAttr('aria-valuenow'),
          Scene.click(Scene.text('To 50')),
          Scene.expectHandled(),
          Scene.expect(progressbar).toHaveAttr('data-state', 'determinate'),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '50'),
          Scene.click(Scene.text('To 100')),
          Scene.expectHandled(),
          Scene.expect(progressbar).toHaveAttr('data-state', 'determinate'),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '100'),
          Scene.click(Scene.text('To indeterminate')),
          Scene.expectHandled(),
          Scene.expect(progressbar).toHaveAttr('data-state', 'indeterminate'),
          Scene.expect(progressbar).not.toHaveAttr('aria-valuenow'),
        )
      })

      // Parity: the progressbar carries one Base UI status hook
      // (data-indeterminate | data-progressing | data-complete) alongside
      // creaseui's data-state. The indicator stays unmarked (see below).
      it('reports complete when the value reaches or exceeds max', () => {
        Scene.scene(
          { update, view: view({ max: 40 }) },
          Scene.given(initialModel(45)),
          Scene.expect(progressbar).toHaveAttr('data-complete'),
        )
      })

      // DIVERGENCE (documented): Base UI mirrors the state hooks onto the
      // indicator element; creaseui keeps data-state on the progressbar only —
      // the indicator is styled via the parent's state.
      it('does not mark the indicator with state hooks (known divergence)', () => {
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(null)),
          Scene.expect(indicator).not.toHaveAttr('data-state'),
          Scene.expect(indicator).not.toHaveAttr('data-indeterminate'),
        )
      })
    })

    describe('range', () => {
      it('clamps aria-valuenow and the indicator when the value overshoots max', () => {
        Scene.scene(
          { update, view: view({ max: 40 }) },
          Scene.given(initialModel(50)),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '40'),
          Scene.expect(progressbar).toHaveAttr('aria-valuemax', '40'),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(0%)'),
        )
      })

      it('clamps aria-valuenow and the indicator when the value undershoots the range', () => {
        Scene.scene(
          { update, view: view({ max: 40 }) },
          Scene.given(initialModel(-10)),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '0'),
          Scene.expect(progressbar).toHaveAttr('aria-valuemin', '0'),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(-100%)'),
        )
      })

      it.todo(
        'normalizes the formatted value, aria-valuetext, and indicator ' +
          'within a custom range — creaseui has no min prop',
      )

      it.todo(
        'formats the clamped value when a custom-formatted value is ' +
          'outside the range — no format/getAriaValueText props',
      )

      it.todo(
        'normalizes aria attributes when min equals max — creaseui has ' +
          'no min prop',
      )

      // DIVERGENCE (intentional): Base UI keeps non-finite values
      // indeterminate (no aria-valuenow). creaseui's normalizeProgress pins
      // any non-finite input to determinate 0 — asserted by
      // test/progress.test.ts.
      it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        'reports non-finite value %s as determinate 0 (known divergence)',
        value => {
          Scene.scene(
            { update, view: view({}) },
            Scene.given(initialModel(value)),
            Scene.expect(progressbar).toHaveAttr('data-state', 'determinate'),
            Scene.expect(progressbar).toHaveAttr('aria-valuenow', '0'),
            Scene.expect(indicator).toHaveStyle(
              'transform',
              'translateX(-100%)',
            ),
          )
        },
      )
    })

    describe('prop: getAriaValueText', () => {
      it.todo(
        'receives the formatted and raw values for determinate and ' +
          'indeterminate states — creaseui has no getAriaValueText prop',
      )
    })

    describe('prop: format', () => {
      it.todo(
        'formats the value — creaseui has no format prop or Value part',
      )
      it.todo(
        'reflects format changes without lagging a commit — no format prop',
      )
    })

    describe('prop: locale', () => {
      it.todo(
        'sets the locale when formatting the value — creaseui has no ' +
          'locale prop',
      )
    })

    describe('prop: valueText', () => {
      // creaseui's explicit valueText prop is the analogue of Base UI's
      // automatic getAriaValueText/formatted aria-valuetext.
      it('emits the provided text as aria-valuetext', () => {
        Scene.scene(
          {
            update,
            view: view({ valueText: '64 of 80 files' }),
          },
          Scene.given(initialModel(64)),
          Scene.expect(progressbar).toHaveAttr(
            'aria-valuetext',
            '64 of 80 files',
          ),
        )
      })
    })

    // Base UI gates these behind skipIf(isJSDOM) computed-style assertions on
    // `width`; creaseui fills via translateX on a full-width indicator, so the
    // equivalent is asserted on the inline style.
    describe('indicator internal styles', () => {
      it('determinate', () => {
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(33)),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(-67%)'),
        )
      })

      it('sets zero width when value is 0', () => {
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(0)),
          Scene.expect(progressbar).toHaveAttr('aria-valuenow', '0'),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(-100%)'),
        )
      })

      it('indeterminate', () => {
        Scene.scene(
          { update, view: view({}) },
          Scene.given(initialModel(null)),
          Scene.expect(progressbar).not.toHaveAttr('aria-valuenow'),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(-60%)'),
        )
      })

      it('mirrors the fill direction in rtl', () => {
        Scene.scene(
          { update, view: view({ direction: 'rtl' }) },
          Scene.given(initialModel(30)),
          Scene.expect(progressbar).toHaveAttr('dir', 'rtl'),
          Scene.expect(indicator).toHaveStyle('transform', 'translateX(70%)'),
        )
      })
    })

    describe('Progress.Value', () => {
      it.todo(
        'renders the value when children is not provided — creaseui has ' +
          'no Value part',
      )
      it.todo(
        'renders a formatted value when a format is provided — no Value ' +
          'part or format prop',
      )
    })
  })
}

verifyRenderer('Tailwind', TailwindProgress)
verifyRenderer('StyleX', StyleXProgress)
