import { type Html, html } from 'foldkit/html'

import { Slider as SliderPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

export const Model = SliderPrimitive.Model
export type Model = typeof Model.Type
export const Message = SliderPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = SliderPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = SliderPrimitive.init
export const update = SliderPrimitive.update
export const reflectRange = SliderPrimitive.reflectRange
export const reflectValue = SliderPrimitive.reflectValue
export const subscriptions = SliderPrimitive.subscriptions
export const subscriptionsForRoot = SliderPrimitive.subscriptionsForRoot
export const fractionOfValue = SliderPrimitive.fractionOfValue

const ROOT_CLASS =
  'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col'

/* The foldkit Slider primitive is horizontal-only and sets data-orientation on
   the ROOT part, not on track/range as Radix does — so shadcn's
   data-[orientation=horizontal]: variants never match there. Horizontal styles
   are applied directly instead. */
const TRACK_CLASS =
  'relative grow overflow-hidden rounded-full bg-muted h-1.5 w-full'

const FILLED_TRACK_CLASS = 'absolute bg-primary h-full'

const THUMB_CLASS =
  'block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden aria-disabled:pointer-events-none aria-disabled:opacity-50'

const LABEL_CLASS = 'text-sm leading-none font-medium select-none'

export type SliderProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  label?: string
  ariaLabel?: string
  formatValue?: (value: number) => string
  isDisabled?: boolean
  name?: string
  class?: string
}>

export type RangeSliderProps<Msg> = Readonly<{
  values: readonly [number, number]
  min: number
  max: number
  step?: number
  onInput: (values: readonly [number, number]) => Msg
  orientation?: 'horizontal' | 'vertical'
  ariaLabels?: readonly [string, string]
  isDisabled?: boolean
  name?: string
  class?: string
}>

/** A controlled two-thumb slider. Native range inputs retain keyboard and
 * form semantics while the parent remains the sole owner of state. */
export const rangeSlider = <Msg>(props: RangeSliderProps<Msg>): Html => {
  const h = html<Msg>()
  const lower = Math.max(props.min, Math.min(props.values[0], props.values[1], props.max))
  const upper = Math.min(props.max, Math.max(props.values[0], props.values[1], props.min))
  const span = Math.max(props.max - props.min, 1)
  const start = ((lower - props.min) / span) * 100
  const end = ((upper - props.min) / span) * 100
  const orientation = props.orientation ?? 'horizontal'
  const input = (index: 0 | 1, value: number): Html => h.input([
    h.Type('range'), h.Min(String(props.min)), h.Max(String(props.max)), h.Step(String(props.step ?? 1)), h.Value(String(value)),
    h.AriaLabel(props.ariaLabels?.[index] ?? (index === 0 ? 'Minimum value' : 'Maximum value')),
    h.Disabled(props.isDisabled ?? false),
    ...(props.name === undefined ? [] : [h.Name(`${props.name}[${String(index)}]`)]),
    h.OnInput(next => {
      const number = Number(next)
      return props.onInput(index === 0 ? [Math.min(number, upper), upper] : [lower, Math.max(number, lower)])
    }),
    h.Class(cn('absolute m-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white', orientation === 'horizontal' ? 'inset-x-0 top-1/2 h-4 w-full -translate-y-1/2' : 'inset-y-0 left-1/2 h-full w-4 -translate-x-1/2 [writing-mode:vertical-lr] [direction:rtl]')),
  ])
  return h.div([
    h.DataAttribute('slot', 'slider'), h.DataAttribute('orientation', orientation),
    h.Class(cn('relative touch-none select-none data-[disabled]:opacity-50', orientation === 'horizontal' ? 'h-5 w-full' : 'h-44 w-5', props.class)),
  ], [
    h.div([h.DataAttribute('slot', 'slider-track'), h.Class(cn('absolute rounded-full bg-muted', orientation === 'horizontal' ? 'inset-x-0 top-1/2 h-1.5 -translate-y-1/2' : 'inset-y-0 left-1/2 w-1.5 -translate-x-1/2'))], [
      h.div([h.DataAttribute('slot', 'slider-range'), h.Class('absolute rounded-full bg-primary'), h.Style(orientation === 'horizontal' ? { left: `${start}%`, right: `${100 - end}%`, insetBlock: '0' } : { bottom: `${start}%`, top: `${100 - end}%`, insetInline: '0' })], []),
    ]), input(0, lower), input(1, upper),
  ])
}

export const slider = <Msg>(props: SliderProps<Msg>): Html => {
  const h = html<Msg>()

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: SliderPrimitive.view,
    viewInputs: {
      isDisabled: props.isDisabled ?? false,
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
      ...(props.formatValue === undefined
        ? {}
        : { formatValue: props.formatValue }),
      ...(props.name === undefined ? {} : { name: props.name }),
      toView: ({ root, track, filledTrack, thumb, label, hiddenInput }) => {
        const hs = html<Message>()
        const control = hs.div(
          [
            ...root,
            hs.DataAttribute('slot', 'slider'),
            hs.Class(cn(ROOT_CLASS, props.class)),
          ],
          [
            hs.div(
              [
                ...track,
                hs.DataAttribute('slot', 'slider-track'),
                hs.Class(TRACK_CLASS),
              ],
              [
                hs.div(
                  [
                    ...filledTrack,
                    hs.DataAttribute('slot', 'slider-range'),
                    hs.Class(FILLED_TRACK_CLASS),
                  ],
                  [],
                ),
              ],
            ),
            hs.span(
              [
                ...thumb,
                hs.DataAttribute('slot', 'slider-thumb'),
                hs.Class(THUMB_CLASS),
              ],
              [],
            ),
            ...(props.name === undefined ? [] : [hs.input([...hiddenInput])]),
          ],
        )

        return props.label === undefined
          ? control
          : hs.div(
              [hs.Class('grid gap-2')],
              [
                hs.label([...label, hs.Class(LABEL_CLASS)], [props.label]),
                control,
              ],
            )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Model: { volume: Slider.init({ id: 'volume', min: 0, max: 100, step: 1, initialValue: 50 }) }
Update: Slider.update(model.volume, message)
Subscriptions: Slider.subscriptions
View: Slider.slider({ model: model.volume, toParentMessage: GotSliderMessage, ariaLabel: 'Volume' })
*/
