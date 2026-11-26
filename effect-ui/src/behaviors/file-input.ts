import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'
import { FileDrop, type FileDropRejectReason } from '@effect/ui-kit'

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
  return { accepted: accepted.slice(0, capacity), errors }
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
  return FileDrop(h, {
    props: { ...props, disabled: busy || props?.disabled },
    key,
    onEmit: {
      Picked: ({ files }) =>
        onFiles?.(validateFileLimits(files, { maxSize, maxFiles })),
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
