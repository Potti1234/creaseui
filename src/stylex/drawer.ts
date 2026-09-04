const styles = stylex.create({
  bottom: { borderTopWidth: 1, bottom: 0, left: 0, maxHeight: '80vh', right: 0, transform: { default: 'none', ':is([data-closed])': 'translateY(100%)' } },
  content: {
    backgroundColor: tokens.background,
    borderColor: tokens.border,
    borderRadius: tokens.radius,
    borderStyle: 'solid',
    color: tokens.foreground,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    transitionDuration: { default: interactionTokens.motionModerate, '@media (prefers-reduced-motion: reduce)': interactionTokens.motionNone },
    transitionProperty: { default: 'transform', '@media (prefers-reduced-motion: reduce)': 'none' },
    zIndex: 50,
  },
  dragging: { transitionProperty: 'none' },
  handleHorizontal: { height: '0.5rem', marginBlock: '1rem', marginInline: 'auto', width: '6.25rem' },
  handleVertical: { height: '6.25rem', marginBlock: 'auto', width: '0.5rem' },
  left: { borderRightWidth: 1, bottom: 0, left: 0, maxWidth: '24rem', top: 0, transform: { default: 'none', ':is([data-closed])': 'translateX(-100%)' }, width: '75%' },
  right: { borderLeftWidth: 1, bottom: 0, maxWidth: '24rem', right: 0, top: 0, transform: { default: 'none', ':is([data-closed])': 'translateX(100%)' }, width: '75%' },
  top: { borderBottomWidth: 1, left: 0, maxHeight: '80vh', right: 0, top: 0, transform: { default: 'none', ':is([data-closed])': 'translateY(-100%)' } },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

import { Option } from 'effect';
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as DrawerBehavior from '@/lib/drawer'
import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export const Model = DrawerBehavior.Model;
export type Model = typeof Model.Type;
export const GotDialogMessage = DrawerBehavior.GotDialogMessage;
export const StartedDrag = DrawerBehavior.StartedDrag;
export const Dragged = DrawerBehavior.Dragged;
export const EndedDrag = DrawerBehavior.EndedDrag;
export const CancelledDrag = DrawerBehavior.CancelledDrag;
export const Message = DrawerBehavior.Message;
export type Message = typeof Message.Type;
export const OutMessage = DrawerBehavior.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = DrawerBehavior.init;
export const update = DrawerBehavior.update;
export const open = DrawerBehavior.open;
export const close = DrawerBehavior.close;

const OVERLAY_CLASS = overlayStyles.overlay
const HEADER_CLASS = overlayStyles.header
const FOOTER_CLASS = overlayStyles.footer

export type DrawerDirection = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>;
}>;
export type DrawerProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  title: string;
  description?: string;
  content?: (slots: DrawerSlots) => ReadonlyArray<Html>;
  footer?: (slots: DrawerSlots) => ReadonlyArray<Html>;
  direction?: DrawerDirection;
  layoutStyle?: ComponentLayoutStyle;
}>;

const axisPosition = (
  direction: DrawerDirection,
  x: number,
  y: number,
): number => (direction === 'left' || direction === 'right' ? x : y);
const offsetFrom = (
  direction: DrawerDirection,
  start: number,
  current: number,
): number =>
  direction === 'top' || direction === 'left'
    ? start - current
    : current - start;
const dragTransform = (direction: DrawerDirection, offset: number): string => {
  const value = `${offset}px`;
  return direction === 'bottom'
    ? `translateY(${value})`
    : direction === 'top'
      ? `translateY(-${value})`
      : direction === 'right'
        ? `translateX(${value})`
        : `translateX(-${value})`;
};

export const drawer = <Msg>(
  props: DrawerProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const direction = props.direction ?? 'bottom';
  const start = Option.getOrUndefined(props.model.dragStart);

  return h.div(
    [
      h.DataAttribute('slot', 'drawer-root'),
      h.OnPointerMove((x, y) =>
        start === undefined
          ? Option.none()
          : Option.some(
              props.toParentMessage(
                Dragged({
                  offset: offsetFrom(
                    direction,
                    start,
                    axisPosition(direction, x, y),
                  ),
                  timeStamp: performance.now(),
                }),
              ),
            ),
      ),
      h.OnPointerUp(() =>
        start === undefined
          ? Option.none()
          : Option.some(props.toParentMessage(EndedDrag())),
      ),
      h.OnPointerLeave(() =>
        start === undefined
          ? Option.none()
          : Option.some(props.toParentMessage(CancelledDrag())),
      ),
    ],
    [
      h.submodel({
        slotId: props.model.dialog.id,
        model: props.model.dialog,
        view: DialogPrimitive.view,
        viewInputs: {
          toView: ({
            dialog: dialogAttributes,
            backdrop,
            panel,
            closeButton,
            isVisible,
          }: DialogPrimitive.RenderInfo) => {
            const hd = h;
            const slots: DrawerSlots = { closeButton };
            return hd.dialog(
              [
                ...dialogAttributes,
                hd.DataAttribute('slot', 'drawer'),
                hd.Class(className(overlayStyles.dialog)),
              ],
              isVisible
                ? [
                    hd.div(
                      [
                        ...backdrop,
                        hd.DataAttribute('slot', 'drawer-overlay'),
                        hd.Class(className(OVERLAY_CLASS)),
                      ],
                      [],
                    ),
                    hd.div(
                      [
                        ...panel,
                        hd.DataAttribute('slot', 'drawer-content'),
                        hd.DataAttribute('vaul-drawer-direction', direction),
                        hd.Style({
                          transform: dragTransform(
                            direction,
                            props.model.dragOffset,
                          ),
                        }),
                        hd.Class(
                          className(
                            styles.content,
                            styles[direction],
                            props.model.dragOffset > 0 ? styles.dragging : undefined,
                            props.layoutStyle,
                          ),
                        ),
                      ],
                      [
                        hd.div(
                          [
                            hd.DataAttribute('slot', 'drawer-handle'),
                            hd.DataAttribute('drag-phase', props.model.dragPhase),
                            hd.AriaHidden(true),
                            hd.OnPointerDown((_type, button, x, y, timeStamp) =>
                              button === 0
                                ? Option.some(props.toParentMessage(StartedDrag({ position: axisPosition(direction, x, y), timeStamp })))
                                : Option.none(),
                            ),
                            hd.Class(
                              cn(
                                overlayStyles.media,
                                direction === 'top' || direction === 'bottom'
                                  ? styles.handleHorizontal
                                  : styles.handleVertical,
                              ),
                            ),
                          ],
                          [],
                        ),
                        hd.div(
                          [
                            hd.DataAttribute('slot', 'drawer-header'),
                            hd.Class(className(HEADER_CLASS)),
                          ],
                          [
                            hd.h2(
                              [
                                hd.Id(
                                  DialogPrimitive.titleId(props.model.dialog),
                                ),
                                hd.DataAttribute('slot', 'drawer-title'),
                                hd.Class(className(overlayStyles.title)),
                              ],
                              [props.title],
                            ),
                            ...(props.description === undefined
                              ? []
                              : [
                                  hd.p(
                                    [
                                      hd.Id(
                                        DialogPrimitive.descriptionId(
                                          props.model.dialog,
                                        ),
                                      ),
                                      hd.DataAttribute(
                                        'slot',
                                        'drawer-description',
                                      ),
                                      hd.Class(className(overlayStyles.description)),
                                    ],
                                    [props.description],
                                  ),
                                ]),
                          ],
                        ),
                        ...(props.content?.(slots) ?? []),
                        ...(props.footer === undefined
                          ? []
                          : [
                              hd.div(
                                [
                                  hd.DataAttribute('slot', 'drawer-footer'),
                                  hd.Class(className(FOOTER_CLASS)),
                                ],
                                [...props.footer(slots)],
                              ),
                            ]),
                      ],
                    ),
                  ]
                : [],
            );
          },
        },
        toParentMessage: (message) =>
          props.toParentMessage(GotDialogMessage({ message })),
      }),
    ],
  );
};

