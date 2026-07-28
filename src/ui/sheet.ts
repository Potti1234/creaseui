import { type ChildAttribute, type Html, html } from 'foldkit/html'

import { Dialog as DialogPrimitive } from '@foldkit/ui'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

/* Ported from shadcn/ui sheet.tsx on top of the foldkit Dialog submodel.
   The fullscreen native <dialog> is the flex positioning context, so each
   side aligns the panel to an edge without fixed panel positioning. Radix
   slide keyframes are foldkit data-closed CSS transitions. */

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

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

const DIALOG_CLASS: Readonly<Record<SheetSide, string>> = {
  top: 'bg-transparent p-0 open:flex flex-col items-stretch justify-start',
  right: 'bg-transparent p-0 open:flex flex-row items-stretch justify-end',
  bottom: 'bg-transparent p-0 open:flex flex-col items-stretch justify-end',
  left: 'bg-transparent p-0 open:flex flex-row items-stretch justify-start',
}

const OVERLAY_CLASS =
  'fixed inset-0 z-50 bg-black/50 transition duration-200 ease-out data-[closed]:opacity-0'

const CONTENT_CLASS =
  'relative z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out duration-500 data-[closed]:duration-300'

const SIDE_CLASS: Readonly<Record<SheetSide, string>> = {
  right:
    'h-full w-3/4 border-l data-[closed]:translate-x-full sm:max-w-sm',
  left: 'h-full w-3/4 border-r data-[closed]:-translate-x-full sm:max-w-sm',
  top: 'h-auto w-full border-b data-[closed]:-translate-y-full',
  bottom: 'h-auto w-full border-t data-[closed]:translate-y-full',
}

const HEADER_CLASS = 'flex flex-col gap-1.5 p-4'
const FOOTER_CLASS = 'mt-auto flex flex-col gap-2 p-4'
const TITLE_CLASS = 'font-semibold text-foreground'
const DESCRIPTION_CLASS = 'text-sm text-muted-foreground'

const CLOSE_CLASS =
  'absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[open]:bg-secondary'

export type SheetSlots = Readonly<{
  closeButton: ReadonlyArray<ChildAttribute>
}>

export type SheetProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  title: string
  description?: string
  content?: (slots: SheetSlots) => ReadonlyArray<Html>
  footer?: (slots: SheetSlots) => ReadonlyArray<Html>
  side?: SheetSide
  showCloseButton?: boolean
  class?: string
}>

export const sheet = <Msg>(props: SheetProps<Msg>): Html => {
  const h = html<Msg>()
  const side = props.side ?? 'right'

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
        const slots: SheetSlots = { closeButton }

        return hd.dialog(
          [
            ...dialogAttributes,
            hd.DataAttribute('slot', 'sheet'),
            hd.Class(DIALOG_CLASS[side]),
          ],
          isVisible
            ? [
                hd.div(
                  [
                    ...backdrop,
                    hd.DataAttribute('slot', 'sheet-overlay'),
                    hd.Class(OVERLAY_CLASS),
                  ],
                  [],
                ),
                hd.div(
                  [
                    ...panel,
                    hd.DataAttribute('slot', 'sheet-content'),
                    hd.Class(cn(CONTENT_CLASS, SIDE_CLASS[side], props.class)),
                  ],
                  [
                    hd.div(
                      [
                        hd.DataAttribute('slot', 'sheet-header'),
                        hd.Class(HEADER_CLASS),
                      ],
                      [
                        hd.h2(
                          [
                            hd.Id(DialogPrimitive.titleId(props.model)),
                            hd.DataAttribute('slot', 'sheet-title'),
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
                                    'sheet-description',
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
                              hd.DataAttribute('slot', 'sheet-footer'),
                              hd.Class(FOOTER_CLASS),
                            ],
                            [...props.footer(slots)],
                          ),
                        ]),
                    ...((props.showCloseButton ?? true)
                      ? [
                          hd.button(
                            [
                              ...closeButton,
                              hd.Type('button'),
                              hd.DataAttribute('slot', 'sheet-close'),
                              hd.AriaLabel('Close'),
                              hd.Class(CLOSE_CLASS),
                            ],
                            [Icon.x<Message>({ class: 'size-4' })],
                          ),
                        ]
                      : []),
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
const model = init({ id: 'settings-sheet', isAnimated: true })
const [nextModel, commands] = update(model, message)
sheet({
  model,
  toParentMessage: message => GotSheetMessage({ message }),
  title: 'Settings',
  description: 'Update your preferences.',
  side: 'right',
})
*/
