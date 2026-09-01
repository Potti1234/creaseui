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
    transitionDuration: interactionTokens.motionModerate,
    zIndex: 50,
  },
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

﻿import { Option, Schema as S } from 'effect';
import { Command } from 'foldkit';
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';
import { m } from 'foldkit/message';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

export const Model = S.Struct({
  dialog: DialogPrimitive.Model,
  dragStart: S.Option(S.Number),
  dragOffset: S.Number,
});
export type Model = typeof Model.Type;
export const GotDialogMessage = m('GotDialogMessage', {
  message: DialogPrimitive.Message,
});
export const StartedDrag = m('StartedDrag', { position: S.Number });
export const Dragged = m('Dragged', { offset: S.Number });
export const EndedDrag = m('EndedDrag');
export const Message = S.Union([
  GotDialogMessage,
  StartedDrag,
  Dragged,
  EndedDrag,
]);
export type Message = typeof Message.Type;
export const OutMessage = DialogPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = (config: DialogPrimitive.InitConfig): Model => ({
  dialog: DialogPrimitive.init(config),
  dragStart: Option.none(),
  dragOffset: 0,
});
type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
  Option.Option<OutMessage>,
];

const mapDialogResult = (
  model: Model,
  result: ReturnType<typeof DialogPrimitive.update>,
): UpdateReturn => {
  const [dialog, commands, out] = result;
  return [
    { ...model, dialog },
    Command.mapMessages(commands, (message) => GotDialogMessage({ message })),
    out,
  ];
};

export const update = (model: Model, message: Message): UpdateReturn => {
  switch (message._tag) {
    case 'GotDialogMessage':
      return mapDialogResult(
        model,
        DialogPrimitive.update(model.dialog, message.message),
      );
    case 'StartedDrag':
      return [
        { ...model, dragStart: Option.some(message.position), dragOffset: 0 },
        [],
        Option.none(),
      ];
    case 'Dragged':
      return [
        { ...model, dragOffset: Math.max(0, message.offset) },
        [],
        Option.none(),
      ];
    case 'EndedDrag':
      return model.dragOffset >= 120
        ? mapDialogResult(
            { ...model, dragStart: Option.none(), dragOffset: 0 },
            DialogPrimitive.close(model.dialog),
          )
        : [
            { ...model, dragStart: Option.none(), dragOffset: 0 },
            [],
            Option.none(),
          ];
  }
};

export const open = (model: Model): UpdateReturn =>
  mapDialogResult(model, DialogPrimitive.open(model.dialog));
export const close = (model: Model): UpdateReturn =>
  mapDialogResult(model, DialogPrimitive.close(model.dialog));

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
      h.OnPointerDown((_type, button, x, y) =>
        button === 0
          ? Option.some(
              props.toParentMessage(
                StartedDrag({ position: axisPosition(direction, x, y) }),
              ),
            )
          : Option.none(),
      ),
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
                }),
              ),
            ),
      ),
      h.OnPointerUp(() =>
        start === undefined
          ? Option.none()
          : Option.some(props.toParentMessage(EndedDrag())),
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
                            props.layoutStyle,
                          ),
                        ),
                      ],
                      [
                        hd.div(
                          [
                            hd.DataAttribute('slot', 'drawer-handle'),
                            hd.AriaHidden(true),
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

