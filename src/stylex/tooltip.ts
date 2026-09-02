import type { Html, HtmlBuilder } from 'foldkit/html';

import { Tooltip as TooltipPrimitive } from '@foldkit/ui';
import { Option } from 'effect';
import * as Mount from 'foldkit/mount';

import * as TooltipBehavior from '@/lib/tooltip'
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { themedAnchor } from './overlay-boundary'
import { className } from './style'

const styles = stylex.create({
  content: { overflowY: 'visible' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* Ported from shadcn/ui tooltip.tsx on top of foldkit Tooltip.

   Foldkit's floating anchor may flip a panel to avoid collisions. The arrow is
   styled from the anchor's runtime data-placement, so it follows that flip. */

export const Model = TooltipBehavior.Model;
export type Model = typeof Model.Type;
export const Message = TooltipBehavior.Message;
export type Message = typeof Message.Type;
export const OutMessage = TooltipBehavior.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = TooltipBehavior.init;
export const update = TooltipBehavior.update;
export const reflectShowDelay = TooltipBehavior.reflectShowDelay;
export const reflectCloseDelay = TooltipBehavior.reflectCloseDelay;

const CONTENT_CLASS = styles.content

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

const ARROW_CLASS = overlayStyles.arrow

export type TooltipProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  content: Html | string;
  align?: TooltipAlign;
  side?: TooltipSide;
  isDisabled?: boolean;
  ariaLabel?: string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  layoutStyle?: ComponentLayoutStyle;
  showArrow?: boolean;
  gap?: number;
  offset?: number;
  /** Only the theme-safe inline mode is supported by the StyleX boundary. */
  portal?: false;
}>;

export const tooltip = <Msg>(
  props: TooltipProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const side = props.side ?? 'top';
  const placement = PLACEMENTS[side][props.align ?? 'center'];

  const triggerId = `${props.model.id}-trigger`;
  const panelId = `${props.model.id}-panel`;
  const disabled = props.isDisabled ?? false;
  const send = props.toParentMessage;
  const anchor = themedAnchor({
        placement,
        gap: props.gap ?? 4,
        ...(props.offset === undefined ? {} : { offset: props.offset }),
      });
  return h.div(
          [h.DataAttribute('slot', 'tooltip')],
          [
            h.button(
              [
                h.Id(triggerId), h.Type('button'), h.AriaDescribedBy(panelId), h.Disabled(disabled),
                ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
                ...(disabled ? [] : [h.OnMouseEnter(send(TooltipBehavior.EnteredTrigger())), h.OnMouseLeave(send(TooltipBehavior.LeftTrigger())), h.OnFocus(send(TooltipBehavior.FocusedTrigger())), h.OnBlur(send(TooltipBehavior.BlurredTrigger())), h.OnPointerDown(() => Option.some(send(TooltipBehavior.PressedPointerOnTrigger()))), h.OnKeyDownPreventDefault(key => key === 'Escape' && props.model.isOpen ? Option.some(send(TooltipBehavior.PressedEscape())) : Option.none())]),
                h.DataAttribute('slot', 'tooltip-trigger'),
                ...(props.triggerLayoutStyle === undefined
                  ? []
                  : [h.Class(cn(props.triggerLayoutStyle))]),
              ],
              [props.trigger],
            ),
            ...(props.model.isOpen
              ? [
                  h.div(
                    [
                      h.Id(panelId), h.Role('tooltip'), h.Style({ position: 'absolute', margin: '0', visibility: 'hidden', pointerEvents: 'none' }),
                      h.OnMount(Mount.mapMessage(TooltipPrimitive.AnchorTooltip({ buttonId: triggerId, anchor }), () => send(TooltipBehavior.CompletedAnchor()))),
                      h.DataAttribute('open', ''), h.DataAttribute('slot', 'tooltip-content'),
                      h.Class(cn(overlayStyles.tooltip, CONTENT_CLASS, props.layoutStyle)),
                    ],
                    [
                      props.content,
                      ...(props.showArrow === false
                        ? []
                        : [
                            h.span(
                              [
                                h.AriaHidden(true), h.DataAttribute('slot', 'tooltip-arrow'), h.Class(className(ARROW_CLASS)),
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
