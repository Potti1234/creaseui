import { Schema } from 'effect'
import type { Update } from 'foldkit'
import type { Attribute, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

export const Model = Schema.Struct({
  isOpen: Schema.Boolean,
  isExiting: Schema.Boolean,
  exitVersion: Schema.Int,
})
export type Model = typeof Model.Type

export const OpenReason = Schema.Literals([
  'trigger-press',
  'context-menu',
  'hover',
  'focus',
  'programmatic',
])
export const CloseReason = Schema.Literals([
  'trigger-press',
  'close-press',
  'selection',
  'programmatic',
])
export const DismissReason = Schema.Literals([
  'escape-key',
  'outside-press',
  'focus-out',
])
export type DismissReason = typeof DismissReason.Type

export const Message = defineMessageUnion({
  RequestedOpen: { reason: OpenReason },
  RequestedClose: { reason: CloseReason },
  RequestedDismissal: { reason: DismissReason },
  CompletedExit: { version: Schema.Int },
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  Opened: { reason: OpenReason },
  Closed: { reason: Schema.Union([CloseReason, DismissReason]) },
  PreventedDismissal: { reason: DismissReason },
})
export type OutMessage = typeof OutMessage.Type

export type Options = Readonly<{
  disabled?: boolean
  dismissible?: boolean
  waitForExit?: boolean
}>

export const init = (
  config: Readonly<{ defaultOpen?: boolean }> = {},
): Model => ({
  isOpen: config.defaultOpen ?? false,
  isExiting: false,
  exitVersion: 0,
})

export const isMounted = (model: Model): boolean =>
  model.isOpen || model.isExiting

type UpdateReturn = Update.ReturnWithOutMessage<Model, Message, OutMessage>

export const update = (
  model: Model,
  message: Message,
  options: Options = {},
): UpdateReturn => {
  const close = (
    reason: Extract<OutMessage, { _tag: 'Closed' }>['reason'],
  ): UpdateReturn => {
    if (!model.isOpen) return { model }
    const isExiting = options.waitForExit ?? false
    return {
      model: {
        isOpen: false,
        isExiting,
        exitVersion: model.exitVersion + (isExiting ? 1 : 0),
      },
      outMessage: OutMessage.Closed({ reason }),
    }
  }

  return Message.match<UpdateReturn>(message, {
    RequestedOpen: ({ reason }) =>
      model.isOpen || options.disabled === true
        ? { model }
        : {
            model: { ...model, isOpen: true, isExiting: false },
            outMessage: OutMessage.Opened({ reason }),
          },
    RequestedClose: ({ reason }) => close(reason),
    RequestedDismissal: ({ reason }) =>
      model.isOpen && options.dismissible === false
        ? { model, outMessage: OutMessage.PreventedDismissal({ reason }) }
        : close(reason),
    CompletedExit: ({ version }) =>
      model.isExiting && version === model.exitVersion
        ? { model: { ...model, isExiting: false } }
        : { model },
  })
}

export type ContentLabels = Readonly<{
  titleId?: string
  descriptionId?: string
}>

export const contentLabelAttributes = <Msg>(
  labels: ContentLabels,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [
  ...(labels.titleId === undefined ? [] : [h.AriaLabelledBy(labels.titleId)]),
  ...(labels.descriptionId === undefined
    ? []
    : [h.AriaDescribedBy(labels.descriptionId)]),
]

export const labelPartAttributes = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [h.Id(id)]

export const arrowAttributes = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [h.Id(id), h.AriaHidden(true)]

export const backdropAttributes = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [h.Id(id), h.AriaHidden(true)]

export const viewportAttributes = <Msg>(
  id: string,
  h: HtmlBuilder<Msg>,
): Attribute<Msg>[] => [h.Id(id)]
