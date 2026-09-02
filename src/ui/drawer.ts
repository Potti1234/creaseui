import { Option } from 'effect';
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as DrawerBehavior from '@/lib/drawer';
import { cn } from '@/lib/utils';

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

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 transition duration-200 ease-out data-[closed]:opacity-0 motion-reduce:transition-none';
const HEADER_CLASS =
  'flex flex-col gap-0.5 p-4 text-center md:gap-1.5 md:text-left';
const FOOTER_CLASS = 'mt-auto flex flex-col gap-2 p-4';

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
  class?: string;
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
const contentClass = (direction: DrawerDirection): string =>
  cn(
    'group/drawer-content fixed z-50 flex flex-col border bg-background transition-[transform] duration-200 ease-out motion-reduce:transition-none',
    direction === 'bottom' &&
      'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
    direction === 'top' &&
      'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
    direction === 'left' &&
      'inset-y-0 left-0 mr-24 w-3/4 max-w-sm rounded-r-lg border-r',
    direction === 'right' &&
      'inset-y-0 right-0 ml-24 w-3/4 max-w-sm rounded-l-lg border-l',
  );
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
                hd.Class('bg-transparent p-0'),
              ],
              isVisible
                ? [
                    hd.div(
                      [
                        ...backdrop,
                        hd.DataAttribute('slot', 'drawer-overlay'),
                        hd.Class(OVERLAY_CLASS),
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
                          cn(
                            contentClass(direction),
                            props.model.dragOffset > 0
                              ? 'transition-none'
                              : undefined,
                            props.class,
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
                                'shrink-0 touch-none rounded-full bg-muted',
                                direction === 'top' || direction === 'bottom'
                                  ? 'mx-auto my-4 h-2 w-[100px]'
                                  : 'my-auto h-[100px] w-2',
                                direction === 'left'
                                  ? 'order-last ml-auto mr-2'
                                  : direction === 'right'
                                    ? 'mr-auto ml-2'
                                    : undefined,
                              ),
                            ),
                          ],
                          [],
                        ),
                        hd.div(
                          [
                            hd.DataAttribute('slot', 'drawer-header'),
                            hd.Class(HEADER_CLASS),
                          ],
                          [
                            hd.h2(
                              [
                                hd.Id(
                                  DialogPrimitive.titleId(props.model.dialog),
                                ),
                                hd.DataAttribute('slot', 'drawer-title'),
                                hd.Class('font-semibold text-foreground'),
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
                                      hd.Class('text-sm text-muted-foreground'),
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
                                  hd.Class(FOOTER_CLASS),
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
