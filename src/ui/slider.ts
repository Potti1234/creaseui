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
