import { Command, UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import {
  FileDrop,
  FileDropEvents,
  FileDropProps,
  FileDropRejectReason,
} from '@effect/ui-kit'
import { Effect, Schema } from 'effect'

const FileArray = Schema.Array(
  Schema.declare(
    (value): value is File =>
      typeof File === 'function' && value instanceof File,
  ),
)
const Result = { files: FileArray, errors: Schema.Array(Schema.String) }
const Message = Schema.Union([
  FileDropEvents,
  UiSchema.TaggedEnum({ CopiedToForm: Result }),
])
const Events = UiSchema.TaggedEnum({
  Accepted: Result,
  Rejected: { files: FileArray, reason: FileDropRejectReason },
})

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const limitSelectedFiles = (
  files: readonly File[],
  {
    maxSize,
    maxFiles,
  }: {
    readonly maxSize?: number | undefined
    readonly maxFiles?: number | undefined
  },
) => {
  const errors: string[] = []
  const accepted = files.filter(file => {
    if (maxSize === undefined || file.size <= maxSize) return true
    errors.push(
      `"${file.name}" exceeds the ${formatFileSize(maxSize)} size limit`,
    )
    return false
  })
  const capacity =
    maxFiles === undefined ? accepted.length : Math.max(0, Math.trunc(maxFiles))
  if (accepted.length > capacity)
    errors.push(`You can upload up to ${capacity} files`)
  return { files: accepted.slice(0, capacity), errors }
}

const Copy = Command.make(
  'CopyCreaseFilesToNativeForm',
  { args: { id: Schema.String, ...Result }, mode: 'switch' },
  ({ id, files, errors }) =>
    Effect.sync(() => {
      const input = document.getElementById(id)
      if (!(input instanceof HTMLInputElement) || input.disabled)
        return { _tag: 'CopiedToForm' as const, files, errors }
      const transfer = new DataTransfer()
      for (const file of files) transfer.items.add(file)
      input.files = transfer.files
      return { _tag: 'CopiedToForm' as const, files, errors }
    }),
)

/** Keeps browser File objects out of the model and synchronizes the native multipart input before emitting. */
export const FileInputFormBehavior = Html.component({
  name: 'CreaseFileInputForm',
  props: Schema.Struct({
    ...FileDropProps.fields,
    inputId: Schema.optional(Schema.String),
    maxSize: Schema.optional(Schema.Number),
    maxFiles: Schema.optional(Schema.Number),
  }),
  model: Schema.Null,
  message: Message,
  events: Events,
}).make({
  init: () => null,
  update: {
    Picked: ($, { files }) => {
      const result = limitSelectedFiles(files, $.props)
      if ($.props.inputId === undefined) return $.emit(Events.Accepted(result))
      return $.run(Copy.make({ id: $.props.inputId, ...result }))
    },
    Rejected: ($, event) => $.emit(event),
    CopiedToForm: ($, { files, errors }) =>
      $.emit(Events.Accepted({ files, errors })),
  },
  parts: p => {
    const {
      inputId: _inputId,
      maxSize: _maxSize,
      maxFiles: _maxFiles,
      ...props
    } = p.props
    return p.child(FileDrop, {
      props,
      onEmit: { Picked: event => event, Rejected: event => event },
      parts: drop => drop,
    })
  },
})
