import { type Html, type HtmlBuilder } from 'foldkit/html';

import { Tooltip as TooltipPrimitive } from '@foldkit/ui';

import { cn } from '@/lib/utils';

/* Ported from shadcn/ui tooltip.tsx on top of foldkit Tooltip.

   Foldkit's floating anchor may flip a panel to avoid collisions. The arrow is
   styled from the anchor's runtime data-placement, so it follows that flip. */

export const Model = TooltipPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = TooltipPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = TooltipPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = TooltipPrimitive.init;
export const update = TooltipPrimitive.update;
export const reflectShowDelay = TooltipPrimitive.reflectShowDelay;

const CONTENT_CLASS =
  'relative z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

type Placement = NonNullable<TooltipPrimitive.AnchorConfig['placement']>;

const PLACEMENTS: Readonly<
  Record<TooltipSide, Readonly<Record<TooltipAlign, Placement>>>
> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
};

const ARROW_CLASS =
  'absolute size-2.5 rotate-45 rounded-[2px] bg-primary ' +
  'group-data-[placement^=top]:left-1/2 group-data-[placement^=top]:bottom-0 group-data-[placement^=top]:-translate-x-1/2 group-data-[placement^=top]:translate-y-1/2 ' +
  'group-data-[placement^=bottom]:left-1/2 group-data-[placement^=bottom]:top-0 group-data-[placement^=bottom]:-translate-x-1/2 group-data-[placement^=bottom]:-translate-y-1/2 ' +
  'group-data-[placement^=left]:top-1/2 group-data-[placement^=left]:right-0 group-data-[placement^=left]:translate-x-1/2 group-data-[placement^=left]:-translate-y-1/2 ' +
  'group-data-[placement^=right]:top-1/2 group-data-[placement^=right]:left-0 group-data-[placement^=right]:-translate-x-1/2 group-data-[placement^=right]:-translate-y-1/2';

export type TooltipProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  content: Html | string;
  align?: TooltipAlign;
  side?: TooltipSide;
  isDisabled?: boolean;
  ariaLabel?: string;
  triggerClass?: string;
  class?: string;
  showArrow?: boolean;
  gap?: number;
  offset?: number;
  portal?: boolean;
}>;

export const tooltip = <Msg>(
  props: TooltipProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const side = props.side ?? 'top';
  const placement = PLACEMENTS[side][props.align ?? 'center'];

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: TooltipPrimitive.view,
    viewInputs: {
      anchor: {
        placement,
        gap: props.gap ?? 4,
        ...(props.offset === undefined ? {} : { offset: props.offset }),
        ...(props.portal === undefined ? {} : { portal: props.portal }),
      },
      ...(props.isDisabled === undefined
        ? {}
        : { isDisabled: props.isDisabled }),
      ...(props.ariaLabel === undefined ? {} : { ariaLabel: props.ariaLabel }),
      toView: ({ trigger, panel, isVisible }) => {
        const ht = h;

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
                      ht.Class(cn(CONTENT_CLASS, 'group', props.class)),
                    ],
                    [
                      props.content,
                      ...(props.showArrow === false
                        ? []
                        : [
                            ht.span(
                              [
                                ht.AriaHidden(true),
                                ht.DataAttribute('slot', 'tooltip-arrow'),
                                ht.Class(ARROW_CLASS),
                              ],
                              [],
                            ),
                          ]),
                    ],
                  ),
                ]
              : []),
          ],
        );
      },
    },
    toParentMessage: props.toParentMessage,
  });
};

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
