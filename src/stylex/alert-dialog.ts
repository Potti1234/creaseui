import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { Dialog as DialogPrimitive } from '@foldkit/ui';

import * as stylex from '@stylexjs/stylex'
import type { StaticStyles } from '@stylexjs/stylex'
import { overlayStyles } from './overlay-tokens.stylex'
import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'

const styles = stylex.create({
  action: {
    borderColor: tokens.transparent,
    borderRadius: tokens.controlRadius,
    paddingInline: '0.75rem',
    alignItems: 'center',
    backgroundColor: tokens.primary,
    color: tokens.primaryForeground,
    display: 'inline-flex',
    justifyContent: 'center',
    height: '2rem',
  },
  cancel: {
    borderColor: tokens.border,
    borderRadius: tokens.controlRadius,
    paddingInline: '0.75rem',
    alignItems: 'center',
    backgroundColor: tokens.background,
    color: tokens.foreground,
    display: 'inline-flex',
    justifyContent: 'center',
    height: '2rem',
  },
  content: { padding: '1.5rem', gap: '1rem', display: 'grid', maxWidth: '32rem', },
})

const isStaticStyle = (value: unknown): value is StaticStyles =>
  typeof value === 'object' && value !== null
const cn = (...values: ReadonlyArray<unknown>): string =>
  className(...values.filter(isStaticStyle))

/* Ported from shadcn/ui alert-dialog.tsx on top of the foldkit Dialog
   submodel. Positioning and animations use the native fullscreen <dialog>
   wrapper and foldkit's data-closed transition phase. Unlike a regular dialog,
   the overlay intentionally omits the primitive backdrop click handler so an
   alert dialog can only be dismissed by an explicit action or Escape. */

export const Model = DialogPrimitive.Model;
export type Model = typeof Model.Type;
export const Message = DialogPrimitive.Message;
export type Message = typeof Message.Type;
export const OutMessage = DialogPrimitive.OutMessage;
export type OutMessage = typeof OutMessage.Type;

export const init = DialogPrimitive.init;
export const update = DialogPrimitive.update;
export const open = DialogPrimitive.open;
export const close = DialogPrimitive.close;

const DIALOG_CLASS = overlayStyles.dialog

const OVERLAY_CLASS = overlayStyles.overlay

const CONTENT_CLASS = styles.content

const HEADER_CLASS = overlayStyles.header

const FOOTER_CLASS = overlayStyles.footer

const TITLE_CLASS = overlayStyles.title

const DESCRIPTION_CLASS = overlayStyles.description

const MEDIA_CLASS = overlayStyles.media

export type AlertDialogSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>;
}>;

export type AlertDialogProps<Msg> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => Msg;
  title: string;
  description?: string;
  media?: ReadonlyArray<Html | string>;
  actionLabel: string;
  onAction?: Msg;
  cancelLabel?: string;
  size?: 'default' | 'sm';
  actionLayoutStyle?: ComponentLayoutStyle;
  cancelLayoutStyle?: ComponentLayoutStyle;
  layoutStyle?: ComponentLayoutStyle;
}>;

export const alertDialog = <Msg>(
  props: AlertDialogProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => {
  const size = props.size ?? 'default';

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: DialogPrimitive.view,
    viewInputs: {
      toView: ({
        dialog: dialogAttributes,
        panel,
        closeButton,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = h;
        const transitionState = props.model.animation.transitionState;
        const overlayAnimationAttributes =
          transitionState === 'EnterStart'
            ? [
                hd.DataAttribute('closed', ''),
                hd.DataAttribute('enter', ''),
                hd.DataAttribute('transition', ''),
              ]
            : transitionState === 'EnterAnimating'
              ? [
                  hd.DataAttribute('enter', ''),
                  hd.DataAttribute('transition', ''),
                ]
              : transitionState === 'LeaveStart'
                ? [
                    hd.DataAttribute('leave', ''),
                    hd.DataAttribute('transition', ''),
                  ]
                : transitionState === 'LeaveAnimating'
                  ? [
                      hd.DataAttribute('closed', ''),
                      hd.DataAttribute('leave', ''),
                      hd.DataAttribute('transition', ''),
                    ]
                  : [];

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'alert-dialog'),
            hd.Class(className(DIALOG_CLASS)),
          ],
          isVisible
            ? [
                hd.div(
                  [
                    hd.Style({ minHeight: '100vh' }),
                    ...overlayAnimationAttributes,
                    hd.DataAttribute('slot', 'alert-dialog-overlay'),
                    hd.Class(className(OVERLAY_CLASS)),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    hd.Role('alertdialog'),
                    hd.DataAttribute('slot', 'alert-dialog-content'),
                    hd.DataAttribute('size', size),
                    hd.Class(cn(overlayStyles.panel, CONTENT_CLASS, props.layoutStyle)),
                  ],
                  [
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'alert-dialog-header'),
                        hd.Class(className(HEADER_CLASS)),
                      ],
                      [
                        ...(props.media === undefined
                          ? []
                          : [
                              hd.div(
                                [
                                  hd.DataAttribute(
                                    'slot',
                                    'alert-dialog-media',
                                  ),
                                  hd.Class(className(MEDIA_CLASS)),
                                ],
                                [...props.media],
                              ),
                            ]),
                        hd.h2(
                          [
                            hd.Id(DialogPrimitive.titleId(props.model)),
                            hd.DataAttribute('slot', 'alert-dialog-title'),
                            hd.Class(className(TITLE_CLASS)),
                          ],
                          [props.title],
                        ),
                        ...(props.description === undefined
                          ? []
                          : [
                              hd.p(
                                [
                                  hd.Id(
                                    DialogPrimitive.descriptionId(props.model),
                                  ),
                                  hd.DataAttribute(
                                    'slot',
                                    'alert-dialog-description',
                                  ),
                                  hd.Class(className(DESCRIPTION_CLASS)),
                                ],
                                [props.description],
                              ),
                            ]),
                      ],
                    ),
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'alert-dialog-footer'),
                        hd.Class(className(FOOTER_CLASS)),
                      ],
                      [
                        hd.button(
                          [
                            ...closeButton,
                            hd.Type('button'),
                            hd.DataAttribute('slot', 'alert-dialog-cancel'),
                            hd.Class(
                              cn(
                                styles.cancel,
                                props.cancelLayoutStyle,
                              ),
                            ),
                          ],
                          [props.cancelLabel ?? 'Cancel'],
                        ),
                        hd.button(
                          [
                            ...(props.onAction === undefined
                              ? closeButton
                              : [hd.OnClick(props.onAction)]),
                            hd.Type('button'),
                            hd.DataAttribute('slot', 'alert-dialog-action'),
                            hd.Class(
                              cn(
                                styles.action,
                                props.actionLayoutStyle,
                              ),
                            ),
                          ],
                          [props.actionLabel],
                        ),
                      ],
                    ),
                  ],
                ),
              ]
            : [],
        );
      },
    },
    toParentMessage: props.toParentMessage,
  });
};

/*
Minimal wiring:
const model = init({ id: 'delete-alert', isAnimated: true })
const [nextModel, commands] = update(model, message)
alertDialog({
  model,
  toParentMessage: message => GotAlertDialogMessage({ message }),
  title: 'Are you absolutely sure?',
  description: 'This action cannot be undone.',
  actionLabel: 'Continue',
})
*/

