import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';
import * as Mount from 'foldkit/mount';
import { Tooltip as TooltipPrimitive } from '@foldkit/ui';

import * as HoverCardBehavior from '@/lib/hover-card';
import { cn } from '@/lib/utils';

export const Model = HoverCardBehavior.Model;
export type Model = typeof Model.Type;

export const Entered = HoverCardBehavior.Entered;
export const Left = HoverCardBehavior.Left;
export const Focused = HoverCardBehavior.Focused;
export const Blurred = HoverCardBehavior.Blurred;
export const PressedEscape = HoverCardBehavior.PressedEscape;
export const PressedPointer = HoverCardBehavior.PressedPointer;
export const CompletedAnchor = HoverCardBehavior.CompletedAnchor;
export const CompletedWaitBeforeShowingHoverCard = HoverCardBehavior.CompletedWaitBeforeShowingHoverCard;
export const CompletedWaitBeforeClosingHoverCard = HoverCardBehavior.CompletedWaitBeforeClosingHoverCard;
export const Message = HoverCardBehavior.Message;
export type Message = typeof Message.Type;

export type InitConfig = HoverCardBehavior.InitConfig;
export const init = HoverCardBehavior.init;
export const update = HoverCardBehavior.update;
export const reflectShowDelay = HoverCardBehavior.reflectShowDelay;
export const reflectCloseDelay = HoverCardBehavior.reflectCloseDelay;

const CONTENT_CLASS =
  'absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden transition duration-150 data-[closed]:pointer-events-none data-[closed]:scale-95 data-[closed]:opacity-0';

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';
export type HoverCardAlign = 'start' | 'center' | 'end';

type Placement = NonNullable<TooltipPrimitive.AnchorConfig['placement']>;
const PLACEMENTS: Readonly<Record<HoverCardSide, Readonly<Record<HoverCardAlign, Placement>>>> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
};

export type HoverCardProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  content: Html | string;
  align?: HoverCardAlign;
  side?: HoverCardSide;
  isDisabled?: boolean;
  ariaLabel?: string;
  triggerClass?: string;
  class?: string;
}>;

export const hoverCard = <Msg>(
  props: HoverCardProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const panelId = `${props.model.id}-content`;
  const triggerId = `${props.model.id}-trigger`;
  const disabled = props.isDisabled ?? false;
  const enter = props.toParentMessage(Entered());
  const leave = props.toParentMessage(Left());

  return h.div(
    [
      h.DataAttribute('slot', 'hover-card'),
      h.OnMouseEnter(enter),
      h.OnMouseLeave(leave),
      h.Class('relative inline-flex'),
    ],
    [
      h.button(
        [
          h.Type('button'),
          h.Id(triggerId),
          h.Disabled(disabled),
          h.AriaExpanded(props.model.isOpen),
          h.AriaControls(panelId),
          h.OnFocus(props.toParentMessage(Focused())),
          h.OnBlur(props.toParentMessage(Blurred())),
          h.OnPointerDown(pointerType => Option.some(props.toParentMessage(PressedPointer({ pointerType })))),
          h.OnKeyDownPreventDefault(key => key === 'Escape' && props.model.isOpen ? Option.some(props.toParentMessage(PressedEscape())) : Option.none()),
          ...(props.ariaLabel === undefined
            ? []
            : [h.AriaLabel(props.ariaLabel)]),
          h.DataAttribute('slot', 'hover-card-trigger'),
          h.Class(cn(props.triggerClass)),
        ],
        [props.trigger],
      ),
      ...(props.model.isOpen ? [h.div(
        [
          h.Id(panelId),
          h.DataAttribute('slot', 'hover-card-content'),
          h.OnMount(Mount.mapMessage(TooltipPrimitive.AnchorTooltip({ buttonId: triggerId, anchor: { placement: PLACEMENTS[props.side ?? 'bottom'][props.align ?? 'center'], gap: 8, portal: false } }), () => props.toParentMessage(CompletedAnchor()))),
          h.Class(
            cn(
              CONTENT_CLASS,
              props.class,
            ),
          ),
        ],
        [props.content],
      )] : []),
    ],
  );
};
