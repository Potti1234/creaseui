import { type Html, html } from 'foldkit/html'

import { Tooltip as TooltipPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

/* Ported from shadcn/ui tooltip.tsx on top of foldkit Tooltip.

   PORT NOTE: foldkit Tooltip exposes no arrow positioning part or transition
   lifecycle. The arrow is approximated with a side-aware rotated square, and
   the panel is removed immediately when hidden rather than leave-animated. */

export const Model = TooltipPrimitive.Model
export type Model = typeof Model.Type
export const Message = TooltipPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = TooltipPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = TooltipPrimitive.init
export const update = TooltipPrimitive.update
export const reflectShowDelay = TooltipPrimitive.reflectShowDelay

const CONTENT_CLASS =
  'relative z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipAlign = 'start' | 'center' | 'end'

type Placement = NonNullable<TooltipPrimitive.AnchorConfig['placement']>

const PLACEMENTS: Readonly<
  Record<TooltipSide, Readonly<Record<TooltipAlign, Placement>>>
> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
}

const ARROW_CLASS: Readonly<Record<TooltipSide, string>> = {
  top: 'absolute left-1/2 bottom-0 size-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 rounded-[2px] bg-primary',
  right:
    'absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-primary',
  bottom:
    'absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-primary',
  left: 'absolute top-1/2 right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-primary',
}

export type TooltipProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  trigger: Html | string
  content: Html | string
  align?: TooltipAlign
  side?: TooltipSide
  isDisabled?: boolean
  ariaLabel?: string
  triggerClass?: string
  class?: string
}>

export const tooltip = <Msg>(props: TooltipProps<Msg>): Html => {
  const h = html<Msg>()
  const side = props.side ?? 'top'
  const placement = PLACEMENTS[side][props.align ?? 'center']

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: TooltipPrimitive.view,
    viewInputs: {
      anchor: { placement, gap: 4 },
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
      toView: ({ trigger, panel, isVisible }) => {
        const ht = html<Message>()

        return ht.div(
          [ht.DataAttribute('slot', 'tooltip')],
          [
            ht.button(
              [
                ...trigger,
                ht.DataAttribute('slot', 'tooltip-trigger'),
                ...(props.triggerClass === undefined
                  ? []
                  : [ht.Class(cn(props.triggerClass))]),
              ],
              [props.trigger],
            ),
            ...(isVisible
              ? [
                  ht.div(
                    [
                      ...panel,
                      ht.DataAttribute('slot', 'tooltip-content'),
                      ht.Class(cn(CONTENT_CLASS, props.class)),
                    ],
                    [
                      props.content,
                      ht.span(
                        [
                          ht.AriaHidden(true),
                          ht.Class(ARROW_CLASS[side]),
                        ],
                        [],
                      ),
                    ],
                  ),
                ]
              : []),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Minimal wiring:
const model = init({ id: 'save-tooltip', showDelay: 0 })
const [nextModel, commands, maybeVisibility] = update(model, message)
tooltip({
  model,
  toParentMessage: message => GotTooltipMessage({ message }),
  trigger: saveIcon,
  content: 'Save changes',
})
*/
