import { type ChildAttribute, type Html, html } from 'foldkit/html'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

/* Ported from shadcn/ui drawer.tsx on top of the foldkit Dialog submodel.
   This port supports the bottom direction only and uses the fullscreen native
   <dialog> as its edge-alignment context.

   PORT NOTE: vaul's pointer-driven drag-to-dismiss behavior is not available
   from the foldkit Dialog primitive, so the handle is visual only. */

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

const DIALOG_CLASS =
  'bg-transparent p-0 open:flex flex-col items-stretch justify-end'

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 transition duration-200 ease-out data-[closed]:opacity-0'

const CONTENT_CLASS =
  'group/drawer-content relative z-50 mt-24 flex h-auto max-h-[80vh] flex-col rounded-t-lg border-t bg-background transition duration-200 ease-out data-[closed]:translate-y-full'

const HANDLE_CLASS =
  'mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full bg-muted'

const HEADER_CLASS =
  'flex flex-col gap-0.5 p-4 text-center md:gap-1.5 md:text-left'

const FOOTER_CLASS = 'mt-auto flex flex-col gap-2 p-4'
const TITLE_CLASS = 'font-semibold text-foreground'
const DESCRIPTION_CLASS = 'text-sm text-muted-foreground'

export type DrawerSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>
}>

export type DrawerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  title: string
  description?: string
  content?: (slots: DrawerSlots) => ReadonlyArray<Html>
  footer?: (slots: DrawerSlots) => ReadonlyArray<Html>
  direction?: 'bottom'
  class?: string
}>

export const drawer = <Msg>(props: DrawerProps<Msg>): Html => {
  const h = html<Msg>()
  const direction = props.direction ?? 'bottom'

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: DialogPrimitive.view,
    viewInputs: {
      toView: ({
        dialog: dialogAttributes,
        backdrop,
        panel,
        closeButton,
        isVisible,
      }: DialogPrimitive.RenderInfo) => {
        const hd = html<Message>()
        const slots: DrawerSlots = { closeButton }

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'drawer'),
            hd.Class(DIALOG_CLASS),
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
                    hd.Class(cn(CONTENT_CLASS, props.class)),
                  ],
                  [
                    hd.span([hd.Class(HANDLE_CLASS)], []),
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'drawer-header'),
                        hd.Class(HEADER_CLASS),
                      ],
                      [
                        hd.h2(
                          [
                            hd.Id(DialogPrimitive.titleId(props.model)),
                            hd.DataAttribute('slot', 'drawer-title'),
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
                                    'drawer-description',
                                  ),
                                  hd.Class(DESCRIPTION_CLASS),
                                ],
                                [props.description],
                              ),
                            ]),
                      ],
                    ),
                    ...(props.content === undefined ? [] : props.content(slots)),
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
        )
      },
    },
    toParentMessage: props.toParentMessage,
  })
}

/*
Minimal wiring:
const model = init({ id: 'filters-drawer', isAnimated: true })
const [nextModel, commands] = update(model, message)
drawer({
  model,
  toParentMessage: message => GotDrawerMessage({ message }),
  title: 'Filters',
  description: 'Narrow the visible results.',
  direction: 'bottom',
})
*/
