import type { Html, HtmlBuilder } from 'foldkit/html';

import { Tooltip as TooltipPrimitive } from '@foldkit/ui';

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

export const Model = TooltipPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = TooltipPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = TooltipPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = TooltipPrimitive.init;
export const update = TooltipPrimitive.update;
export const reflectShowDelay = TooltipPrimitive.reflectShowDelay;

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

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: TooltipPrimitive.view,
    viewInputs: {
      anchor: themedAnchor({
        placement,
        gap: props.gap ?? 4,
        ...(props.offset === undefined ? {} : { offset: props.offset }),
      }),
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
                ...(props.triggerLayoutStyle === undefined
                  ? []
                  : [ht.Class(cn(props.triggerLayoutStyle))]),
              ],
              [props.trigger],
            ),
            ...(isVisible
              ? [
                  ht.div(
                    [
                      ...panel,
                      ht.DataAttribute('slot', 'tooltip-content'),
                      ht.Class(cn(overlayStyles.tooltip, CONTENT_CLASS, props.layoutStyle)),
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
                                ht.Class(className(ARROW_CLASS)),
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

