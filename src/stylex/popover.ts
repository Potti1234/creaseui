import type { Html, HtmlBuilder } from 'foldkit/html';

import { Popover as PopoverPrimitive } from '@foldkit/ui';

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { themedAnchor } from './overlay-boundary'
import { className } from './style'

const styles = stylex.create({
  content: { padding: '1rem', width: '18rem' },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* Ported from shadcn/ui popover.tsx on top of the foldkit Popover submodel.
   Radix keyframe animations are finite transitions driven by foldkit's
   data-closed phase. Pass isAnimated: true to init. */

export const Model = PopoverPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = PopoverPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = PopoverPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = PopoverPrimitive.init;
export const update = PopoverPrimitive.update;
export const open = PopoverPrimitive.open;
export const close = PopoverPrimitive.close;

const CONTENT_CLASS = styles.content

const BACKDROP_CLASS = overlayStyles.backdrop

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

type Placement = NonNullable<PopoverPrimitive.AnchorConfig['placement']>;

const PLACEMENTS: Readonly<
  Record<PopoverSide, Readonly<Record<PopoverAlign, Placement>>>
> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
};

export type PopoverProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  trigger: Html | string;
  triggerLayoutStyle?: ComponentLayoutStyle;
  content: Html | string;
  align?: PopoverAlign;
  side?: PopoverSide;
  layoutStyle?: ComponentLayoutStyle;
}>;

export const popover = <Msg>(
  props: PopoverProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const placement = PLACEMENTS[props.side ?? 'bottom'][props.align ?? 'center'];

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: PopoverPrimitive.view,
    viewInputs: {
      anchor: themedAnchor({ placement, gap: 4 }),
      toView: ({ button, panel, backdrop, isVisible }) => {
        const hp = h;

        return hp.div(
          [hp.DataAttribute('slot', 'popover')],
          [
            hp.button(
              [
                ...button,
                hp.DataAttribute('slot', 'popover-trigger'),
                ...(props.triggerLayoutStyle === undefined
                  ? []
                  : [hp.Class(cn(props.triggerLayoutStyle))]),
              ],
              [props.trigger],
            ),
            ...(isVisible
              ? [
                  hp.div([...backdrop, hp.DataAttribute('slot', 'popover-backdrop'), hp.Class(className(BACKDROP_CLASS))], []),
                  hp.div(
                    [
                      ...panel,
                      hp.DataAttribute('slot', 'popover-content'),
                      hp.Class(cn(overlayStyles.panel, CONTENT_CLASS, props.layoutStyle)),
                    ],
                    [props.content],
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
const model = init({ id: 'profile-popover', isAnimated: true })
const [nextModel, commands, maybeVisibility] = update(model, message)
popover({
  model,
  toParentMessage: message => GotPopoverMessage({ message }),
  trigger: 'Open profile',
  content: profileView,
  align: 'center',
  side: 'bottom',
})
*/
