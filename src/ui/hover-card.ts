import { type Html, html } from 'foldkit/html'

import { Tooltip as TooltipPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

/* Ported from shadcn/ui hover-card.tsx using foldkit Tooltip for hover state.

   PORT NOTE: This Tooltip-backed approximation does not provide Radix
   HoverCard's exact focus-open parity or interactive panel behavior. The
   primitive makes the panel non-interactive and renders a button trigger. */

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
  'z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden'

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left'
export type HoverCardAlign = 'start' | 'center' | 'end'

type Placement = NonNullable<TooltipPrimitive.AnchorConfig['placement']>

const PLACEMENTS: Readonly<
  Record<HoverCardSide, Readonly<Record<HoverCardAlign, Placement>>>
> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
}

export type HoverCardProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  trigger: Html | string
  content: Html | string
  align?: HoverCardAlign
  side?: HoverCardSide
  isDisabled?: boolean
  ariaLabel?: string
  triggerClass?: string
  class?: string
}>

export const hoverCard = <Msg>(props: HoverCardProps<Msg>): Html => {
  const h = html<Msg>()
  const placement =
    PLACEMENTS[props.side ?? 'bottom'][props.align ?? 'center']

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
        const hh = html<Message>()

        return hh.div(
          [hh.DataAttribute('slot', 'hover-card')],
          [
            hh.button(
              [
                ...trigger,
                hh.DataAttribute('slot', 'hover-card-trigger'),
                ...(props.triggerClass === undefined
                  ? []
                  : [hh.Class(cn(props.triggerClass))]),
              ],
              [props.trigger],
            ),
            ...(isVisible
              ? [
                  hh.div(
                    [
                      ...panel,
                      hh.DataAttribute('slot', 'hover-card-content'),
                      hh.Class(cn(CONTENT_CLASS, props.class)),
                    ],
                    [props.content],
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
const model = init({ id: 'user-hover-card', showDelay: 700 })
const [nextModel, commands, maybeVisibility] = update(model, message)
hoverCard({
  model,
  toParentMessage: message => GotHoverCardMessage({ message }),
  trigger: '@shadcn',
  content: profileCard,
})
*/
