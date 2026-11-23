import type { Html, HtmlBuilder } from 'foldkit/html'

import * as DisclosureBehavior from '@/lib/disclosure'

import { cn } from '@/lib/utils'

export type CollapsibleProps<Msg> = Readonly<{
  id: string
  isOpen: boolean
  onToggle: (isOpen: boolean) => Msg
  trigger: Html | string
  content: Html | string
  isDisabled?: boolean
  ariaLabel?: string
  class?: string
  triggerClass?: string
  contentClass?: string
}>

export const collapsible = <Msg>(
  props: CollapsibleProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  return DisclosureBehavior.view(
    {
      id: props.id,
      isOpen: props.isOpen,
      onToggle: props.onToggle,
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      toView: ({ button, panel, animatePanel }) => {
        return h.div(
          [
            h.DataAttribute('slot', 'collapsible'),
            ...(props.class === undefined ? [] : [h.Class(cn(props.class))]),
          ],
          [
            h.button(
              [
                ...button,
                h.Type('button'),
                h.DataAttribute('slot', 'collapsible-trigger'),
                ...(props.triggerClass === undefined
                  ? []
                  : [h.Class(cn(props.triggerClass))]),
              ],
              [props.trigger],
            ),
            animatePanel(
              h.div(
                [
                  ...panel,
                  h.DataAttribute('slot', 'collapsible-content'),
                  ...(props.contentClass === undefined
                    ? []
                    : [h.Class(cn(props.contentClass))]),
                ],
                [props.content],
              ),
            ),
          ],
        )
      },
    },
    h,
  )
}

/*
Minimal wiring:
const model = init({ id: 'details' })
const nextModelOp__ = update(model, message);
    const nextModel = nextModelOp__.model;
    const commands = nextModelOp__.commands ?? [];
    const maybeToggle = Option.fromNullishOr(nextModelOp__.outMessage);
collapsible({
  model,
  toParentMessage: message => GotCollapsibleMessage({ message }),
  trigger: 'Show details',
  content: detailsView,
})
*/
