import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import type { FileDrop, FileDropRejectReason } from '@effect/ui-kit'
import { FileInputFormBehavior, limitSelectedFiles } from './file-input-form'

export { formatFileSize } from './file-input-form'

export const validateFileLimits = (
  files: readonly File[],
  {
    maxSize,
    maxFiles,
  }: {
    readonly maxSize?: number | undefined
    readonly maxFiles?: number | undefined
  },
) => {
  const selection = limitSelectedFiles(files, { maxSize, maxFiles })
  return { accepted: selection.files, errors: selection.errors }
}

type Classes = Partial<
  Record<
    | 'root'
    | 'label'
    | 'hiddenLabel'
    | 'description'
    | 'zone'
    | 'trigger'
    | 'hint'
    | 'names'
    | 'status',
    string
  >
>
type Options<Msg> = Parameters<typeof FileDrop<Msg>>[1]

export type FileInputProps<Msg, R = never> = Pick<
  Options<Msg>,
  'props' | 'key'
> & {
  readonly id: string
  readonly name?: string
  readonly form?: string
  readonly label: View.Input<Msg, R>
  readonly files?: readonly { readonly name: string; readonly size?: number }[]
  readonly mode?: 'dropzone' | 'input'
  readonly labelHidden?: boolean
  readonly description?: View.Input<Msg, R>
  readonly required?: boolean
  readonly optional?: boolean
  readonly busy?: boolean
  readonly placeholder?: string
  readonly dropHint?: string
  readonly status?: {
    readonly type: 'error' | 'success' | 'warning'
    readonly message: View.Input<Msg, R>
  }
  readonly maxSize?: number
  readonly maxFiles?: number
  readonly className?: string
  readonly onFiles?: (selection: {
    readonly accepted: readonly File[]
    readonly errors: readonly string[]
  }) => Msg | undefined
  readonly onRejected?: (selection: {
    readonly files: readonly File[]
    readonly reason: FileDropRejectReason
  }) => Msg | undefined
}

export const FileInputBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    id,
    name,
    form,
    label,
    props,
    mode = 'input',
    labelHidden,
    description,
    files = [],
    required,
    optional,
    busy,
    placeholder = 'Choose files',
    dropHint = 'Or drag and drop files here',
    status,
    maxSize,
    maxFiles,
    className,
    onFiles,
    onRejected,
    key = id,
  }: FileInputProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) => {
  const labelId = `${id}-label`
  const descriptionId =
    description === undefined ? undefined : `${id}-description`
  const hintId = mode === 'input' ? undefined : `${id}-hint`
  const statusId = status === undefined ? undefined : `${id}-status`
  const namesId = files.length === 0 ? undefined : `${id}-names`
  const inputId = name === undefined ? undefined : `${id}-form-files`
  const disabled = busy || props?.disabled
  return FileInputFormBehavior(h, {
    props: { ...props, disabled, inputId, maxSize, maxFiles },
    key,
    onEmit: {
      Accepted: ({ files, errors }) => onFiles?.({ accepted: files, errors }),
      Rejected: ({ files, reason }) => onRejected?.({ files, reason }),
    },
    view: drop =>
      h.div
        .class(styles.root, className)
        .attrs({
          'data-slot': 'file-input',
          'data-mode': mode,
          'aria-busy': busy ? 'true' : undefined,
        })
        .children(
          inputId === undefined
            ? undefined
            : h.input.attrs({
                id: inputId,
                name,
                form,
                type: 'file',
                hidden: '',
                multiple: props?.multiple ? '' : undefined,
                disabled: disabled ? '' : undefined,
              }),
          h.label
            .class(labelHidden ? styles.hiddenLabel : styles.label)
            .attrs({ id: labelId, for: id })
            .children(
              label,
              optional ? ' (optional)' : required ? ' (required)' : undefined,
            ),
          description === undefined
            ? undefined
            : h.div
                .class(styles.description)
                .attr('id', descriptionId)
                .children(description),
          drop
            .root(
              h.div
                .class(styles.zone)
                .attrs({ 'data-slot': 'file-input-zone', 'data-mode': mode }),
            )
            .children(
              drop
                .trigger(
                  h.button.class(styles.trigger).attrs({
                    id,
                    'data-slot': 'file-input-trigger',
                    'aria-labelledby': `${labelId} ${id}-text`,
                    'aria-describedby':
                      [descriptionId, hintId, statusId, namesId]
                        .filter(Boolean)
                        .join(' ') || undefined,
                    'aria-invalid':
                      status?.type === 'error' ? 'true' : undefined,
                  }),
                )
                .children(
                  h.span.attr('id', `${id}-text`).children(placeholder),
                ),
              hintId === undefined
                ? undefined
                : h.div
                    .class(styles.hint)
                    .attr('id', hintId)
                    .children(dropHint),
              namesId === undefined
                ? undefined
                : h.div
                    .class(styles.names)
                    .attr('id', namesId)
                    .children(files.map(file => file.name).join(', ')),
            ),
          status === undefined
            ? undefined
            : h.div
                .class(styles.status)
                .attrs({
                  id: statusId,
                  'data-type': status.type,
                  'data-slot': 'file-input-status',
                  role: status.type === 'error' ? 'alert' : 'status',
                })
                .children(status.message),
        ),
  })
}
