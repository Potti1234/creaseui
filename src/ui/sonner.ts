import { type Duration, Schema as S } from 'effect'
import { type Html, html } from 'foldkit/html'

import { Toast as ToastPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

/* shadcn/Sonner styling on top of foldkit's schema-bound Toast primitive.

   Toast owns the forced inline viewport position, entry pointer-events, and
   animation phase attributes. Styling is supplied only through
   containerClassName/entryClassName and entryToView so those inline styles
   remain intact. */

export const ToastPayload = S.Struct({
  title: S.String,
  description: S.optional(S.String),
  actionLabel: S.optional(S.String),
})
export type ToastPayload = typeof ToastPayload.Type

const Toast = ToastPrimitive.make(ToastPayload)

export const Entry = Toast.Entry
export type Entry = typeof Entry.Type
export const Model = Toast.Model
export type Model = typeof Model.Type
export const Message = Toast.Message
export type Message = typeof Message.Type
export const OutMessage = Toast.OutMessage
export type OutMessage = typeof OutMessage.Type

export const Added = Toast.Added
export const DismissedToast = Toast.DismissedToast
export const init = Toast.init
export const update = Toast.update
export const show = Toast.show
export const dismiss = Toast.dismiss
export const dismissAll = Toast.dismissAll

const CONTAINER_CLASS =
  'pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:w-auto sm:max-w-[420px] sm:flex-col'

const ENTRY_CLASS =
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 pr-8 text-popover-foreground shadow-lg transition duration-200 ease-out data-[closed]:translate-x-full data-[closed]:opacity-0'

const TITLE_CLASS = 'text-sm font-semibold'

const DESCRIPTION_CLASS = 'text-sm text-muted-foreground'

const ACTION_CLASS =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

const CLOSE_CLASS =
  'absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100'

export type ToastInput = Readonly<{
  title: string
  description?: string
  actionLabel?: string
  duration?: Duration.Input
  sticky?: boolean
}>

const toastInput = (
  variant: ToastPrimitive.Variant,
  input: ToastInput,
): ToastPrimitive.ShowInput<ToastPayload> => ({
  payload: {
    title: input.title,
    ...(input.description === undefined
      ? {}
      : { description: input.description }),
    ...(input.actionLabel === undefined
      ? {}
      : { actionLabel: input.actionLabel }),
  },
  variant,
  ...(input.duration === undefined ? {} : { duration: input.duration }),
  ...(input.sticky === undefined ? {} : { sticky: input.sticky }),
})

export const success = (
  input: ToastInput,
): ToastPrimitive.ShowInput<ToastPayload> => toastInput('Success', input)

export const error = (
  input: ToastInput,
): ToastPrimitive.ShowInput<ToastPayload> => toastInput('Error', input)

export const info = (
  input: ToastInput,
): ToastPrimitive.ShowInput<ToastPayload> => toastInput('Info', input)

export const warning = (
  input: ToastInput,
): ToastPrimitive.ShowInput<ToastPayload> => toastInput('Warning', input)

const variantIcon = (variant: ToastPrimitive.Variant): Html => {
  const config = { class: 'mt-0.5 size-4 shrink-0' }

  switch (variant) {
    case 'Success':
      return Icon.circleCheck<Message>(config)
    case 'Error':
      return Icon.octagonX<Message>(config)
    case 'Warning':
      return Icon.triangleAlert<Message>(config)
    case 'Info':
      return Icon.info<Message>(config)
  }
}

export type SonnerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel?: string
  class?: string
  entryClass?: string
}>

export const sonner = <Msg>(props: SonnerProps<Msg>): Html => {
  const h = html<Msg>()

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: Toast.view,
    viewInputs: {
      position: 'BottomRight',
      containerClassName: cn(CONTAINER_CLASS, props.class),
      entryClassName: cn(ENTRY_CLASS, props.entryClass),
      entryToView: (entry, handlers) => {
        const ht = html<Message>()

        return ht.div(
          [ht.Class('flex w-full items-start gap-3')],
          [
            variantIcon(entry.variant),
            ht.div(
              [ht.Class('grid flex-1 gap-1')],
              [
                ht.div([ht.Class(TITLE_CLASS)], [entry.payload.title]),
                ...(entry.payload.description === undefined
                  ? []
                  : [
                      ht.div(
                        [ht.Class(DESCRIPTION_CLASS)],
                        [entry.payload.description],
                      ),
                    ]),
              ],
            ),
            ...(entry.payload.actionLabel === undefined
              ? []
              : [
                  ht.button(
                    [
                      ...handlers.dismiss,
                      ht.Type('button'),
                      ht.Class(ACTION_CLASS),
                    ],
                    [entry.payload.actionLabel],
                  ),
                ]),
            ht.button(
              [
                ...handlers.dismiss,
                ht.Type('button'),
                ht.AriaLabel('Dismiss notification'),
                ht.Class(CLOSE_CLASS),
              ],
              [Icon.x<Message>({ class: 'size-4' })],
            ),
          ],
        )
      },
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
    },
    toParentMessage: props.toParentMessage,
  })
}

/* PORT NOTE: foldkit Toast's entry renderer can dispatch only Toast.Message.
   The optional action button therefore dismisses the toast; consumers can
   react to the resulting DismissedToast OutMessage and inspect its payload.

   Minimal wiring:

   // Model: { toast: Sonner.Model }
   // Message: GotToastMessage({ message: Sonner.Message })
   // Init: toast: Sonner.init({ id: 'notifications' })
   // Update:
   // const [toast, commands] = Sonner.update(model.toast, message)
   // const [toast, commands] = Sonner.show(
   //   model.toast,
   //   Sonner.success({ title: 'Saved', description: 'Changes published.' }),
   // )
   // View:
   // sonner({
   //   model: model.toast,
   //   toParentMessage: message => GotToastMessage({ message }),
   // })
*/
