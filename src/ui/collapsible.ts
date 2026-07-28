import { type Html, html } from 'foldkit/html'

import { Disclosure as DisclosurePrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

/* shadcn/ui Collapsible is a thin composition over foldkit Disclosure.
   animatePanel keeps the content mounted and smoothly transitions its height. */

export const Model = DisclosurePrimitive.Model
export type Model = typeof Model.Type
export const Message = DisclosurePrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = DisclosurePrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = DisclosurePrimitive.init
export const update = DisclosurePrimitive.update
export const toggle = DisclosurePrimitive.toggle
export const close = DisclosurePrimitive.close
export const reflectOpenState = DisclosurePrimitive.reflectOpenState

export type CollapsibleProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  trigger: Html | string
  content: Html | string
  isDisabled?: boolean
  ariaLabel?: string
  class?: string
  triggerClass?: string
  contentClass?: string
}>

export const collapsible = <Msg>(props: CollapsibleProps<Msg>): Html => {
  const h = html<Msg>()

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: DisclosurePrimitive.view,
    viewInputs: {
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
      toView: ({ button, panel, animatePanel }) => {
        const hc = html<Message>()

        return hc.div(
          [
            hc.DataAttribute('slot', 'collapsible'),
            ...(props.class === undefined
              ? []
              : [hc.Class(cn(props.class))]),
          ],
          [
            hc.button(
              [
                ...button,
                hc.Type('button'),
                hc.DataAttribute('slot', 'collapsible-trigger'),
                ...(props.triggerClass === undefined
                  ? []
                  : [hc.Class(cn(props.triggerClass))]),
              ],
              [props.trigger],
            ),
            animatePanel(
              hc.div(
                [
                  ...panel,
                  hc.DataAttribute('slot', 'collapsible-content'),
                  ...(props.contentClass === undefined
                    ? []
                    : [hc.Class(cn(props.contentClass))]),
                ],
                [props.content],
              ),
            ),
          ],
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Minimal wiring:
const model = init({ id: 'details', isOpen: false })
const [nextModel, commands, maybeToggle] = update(model, message)
collapsible({
  model,
  toParentMessage: message => GotCollapsibleMessage({ message }),
  trigger: 'Show details',
  content: detailsView,
})
*/
