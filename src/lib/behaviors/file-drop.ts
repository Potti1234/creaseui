import { Schema as S } from 'effect'
import type { Update } from 'foldkit'
import * as File from 'foldkit/file'
import { childAttributes, type ChildAttribute, type Html } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { defineView } from 'foldkit/submodel'

export const Model = S.Struct({ id: S.String, isDragOver: S.Boolean })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  EnteredDragZone: {},
  LeftDragZone: {},
  DroppedFiles: { files: S.NonEmptyArray(File.File) },
  DroppedNonFiles: {},
})
export type Message = typeof Message.Type

export const OutMessage = defineMessageUnion({
  ReceivedFiles: { files: S.NonEmptyArray(File.File) },
  RejectedNonFiles: {},
})
export type OutMessage = typeof OutMessage.Type

export const init = ({ id }: Readonly<{ id: string }>): Model => ({
  id,
  isDragOver: false,
})

export const update = (
  model: Model,
  message: Message,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> =>
  Message.match(message, {
    EnteredDragZone: () => ({ model: { ...model, isDragOver: true } }),
    LeftDragZone: () => ({ model: { ...model, isDragOver: false } }),
    DroppedFiles: ({ files }) => ({
      model: { ...model, isDragOver: false },
      outMessage: OutMessage.ReceivedFiles({ files }),
    }),
    DroppedNonFiles: () => ({
      model: { ...model, isDragOver: false },
      outMessage: OutMessage.RejectedNonFiles(),
    }),
  })

export type FileDropAttributes = Readonly<{
  root: ReadonlyArray<ChildAttribute>
  input: ReadonlyArray<ChildAttribute>
}>

type ViewInputs = Readonly<{
  toView: (attributes: FileDropAttributes) => Html
  accept?: ReadonlyArray<string>
  multiple?: boolean
  isDisabled?: boolean
}>

const dropped = ([first, ...rest]: ReadonlyArray<File>): Message =>
  first === undefined
    ? Message.DroppedNonFiles()
    : Message.DroppedFiles({ files: [first, ...rest] })

export const view = defineView<Model, Message, ViewInputs>((model, props, h) =>
  props.toView({
    root: childAttributes([
      ...(model.isDragOver ? [h.DataAttribute('drag-over', '')] : []),
      ...(props.isDisabled
        ? [h.DataAttribute('disabled', '')]
        : [
            h.OnDragEnter(Message.EnteredDragZone()),
            h.OnDragLeave(Message.LeftDragZone()),
            h.AllowDrop(),
            h.OnDropFiles(dropped),
          ]),
    ]),
    input: childAttributes([
      h.Id(model.id),
      h.Type('file'),
      h.Class('sr-only'),
      ...(props.multiple ? [h.Multiple(true)] : []),
      ...(props.accept?.length ? [h.Accept(props.accept.join(','))] : []),
      ...(props.isDisabled ? [h.Disabled(true)] : [h.OnFileChange(dropped)]),
    ]),
  }),
)
