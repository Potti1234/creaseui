import { type ChildAttribute, type Html, html } from 'foldkit/html'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/ui/button'

/* Ported from shadcn/ui alert-dialog.tsx on top of the foldkit Dialog
   submodel. Positioning and animations use the native fullscreen <dialog>
   wrapper and foldkit's data-closed transition phase. Unlike a regular dialog,
   the overlay intentionally omits the primitive backdrop click handler so an
   alert dialog can only be dismissed by an explicit action or Escape. */

export const Model = DialogPrimitive.Model
export type Model = typeof Model.Type
export const Message = DialogPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = DialogPrimitive.OutMessage
export type OutMessage = typeof OutMessage.Type

export const init = DialogPrimitive.init
export const update = DialogPrimitive.update
export const open = DialogPrimitive.open
export const close = DialogPrimitive.close

const DIALOG_CLASS = 'bg-transparent p-0 open:flex items-center justify-center'

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 transition duration-200 ease-out data-[closed]:opacity-0'

const CONTENT_CLASS =
  'group/alert-dialog-content relative z-50 grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border bg-background p-6 shadow-lg transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95 data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg'

const HEADER_CLASS =
  'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]'

const FOOTER_CLASS =
  'flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end'

const TITLE_CLASS =
  'text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2'

const DESCRIPTION_CLASS = 'text-sm text-muted-foreground'

const MEDIA_CLASS =
  "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8"

export type AlertDialogSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>
}>

export type AlertDialogProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  title: string
  description?: string
  media?: ReadonlyArray<Html | string>
  actionLabel: string
  cancelLabel?: string
  size?: 'default' | 'sm'
  actionClass?: string
  cancelClass?: string
  class?: string
}>

export const alertDialog = <Msg>(props: AlertDialogProps<Msg>): Html => {
  const h = html<Msg>()
  const size = props.size ?? 'default'

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
        const hd = html<Message>()
        const transitionState = props.model.animation.transitionState
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
                  : []

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'alert-dialog'),
            hd.Class(DIALOG_CLASS),
          ],
          isVisible
            ? [
                hd.div(
                  [
                    hd.Style({ minHeight: '100vh' }),
                    ...overlayAnimationAttributes,
                    hd.DataAttribute('slot', 'alert-dialog-overlay'),
                    hd.Class(OVERLAY_CLASS),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    hd.Role('alertdialog'),
                    hd.DataAttribute('slot', 'alert-dialog-content'),
                    hd.DataAttribute('size', size),
                    hd.Class(cn(CONTENT_CLASS, props.class)),
                  ],
                  [
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'alert-dialog-header'),
                        hd.Class(HEADER_CLASS),
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
                                  hd.Class(MEDIA_CLASS),
                                ],
                                [...props.media],
                              ),
                            ]),
                        hd.h2(
                          [
                            hd.Id(DialogPrimitive.titleId(props.model)),
                            hd.DataAttribute('slot', 'alert-dialog-title'),
                            hd.Class(TITLE_CLASS),
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
                                  hd.Class(DESCRIPTION_CLASS),
                                ],
                                [props.description],
                              ),
                            ]),
                      ],
                    ),
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'alert-dialog-footer'),
                        hd.Class(FOOTER_CLASS),
                      ],
                      [
                        hd.button(
                          [
                            ...closeButton,
                            hd.Type('button'),
                            hd.DataAttribute('slot', 'alert-dialog-cancel'),
                            hd.Class(
                              cn(
                                buttonVariants({
                                  variant: 'outline',
                                  size: 'default',
                                }),
                                props.cancelClass,
                              ),
                            ),
                          ],
                          [props.cancelLabel ?? 'Cancel'],
                        ),
                        hd.button(
                          [
                            ...closeButton,
                            hd.Type('button'),
                            hd.DataAttribute('slot', 'alert-dialog-action'),
                            hd.Class(
                              cn(
                                buttonVariants({
                                  variant: 'default',
                                  size: 'default',
                                }),
                                props.actionClass,
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
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

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
