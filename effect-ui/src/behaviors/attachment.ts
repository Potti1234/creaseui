import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

export type AttachmentState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'error'
  | 'done'
type Slot<Msg, R> = {
  readonly className?: string
  readonly children?: View.Children<Msg, R>
}
type Classes = Partial<
  Record<
    | 'root'
    | 'group'
    | 'media'
    | 'content'
    | 'actions'
    | 'action'
    | 'title'
    | 'description'
    | 'trigger',
    string
  >
>
type Appearance = {
  readonly state?: AttachmentState
  readonly size?: 'default' | 'sm' | 'xs'
  readonly orientation?: 'horizontal' | 'vertical'
}

const parts = <Msg>(
  h: Html.H<Msg>,
  styles: Classes,
  { state, size, orientation }: Appearance,
) => {
  const attrs = {
    'data-state': state,
    'data-size': size,
    'data-orientation': orientation,
  }
  const div =
    (name: 'content' | 'actions') =>
    <R = never>({ className, children }: Slot<NoInfer<Msg>, R>) =>
      h.div
        .class(styles[name], className)
        .attrs({ ...attrs, 'data-slot': `attachment-${name}` })
        .children(children)
  const text =
    (name: 'title' | 'description') =>
    <R = never>({ className, children }: Slot<NoInfer<Msg>, R>) =>
      h.span
        .class(styles[name], className)
        .attrs({ ...attrs, 'data-slot': `attachment-${name}` })
        .children(children)
  const button =
    (name: 'action' | 'trigger') =>
    <R = never>({
      className,
      children,
      label,
      onClick,
    }: Slot<NoInfer<Msg>, R> & {
      readonly label: string
      readonly onClick: NoInfer<Msg>
    }) =>
      h.button
        .class(styles[name], className)
        .attrs({
          ...attrs,
          'data-slot': `attachment-${name}`,
          'aria-label': label,
          type: 'button',
        })
        .on('click', onClick)
        .children(children)
  return {
    media: <R = never>({
      className,
      children,
      variant = 'icon',
    }: Slot<NoInfer<Msg>, R> & { readonly variant?: 'icon' | 'image' }) =>
      h.div
        .class(styles.media, className)
        .attrs({
          ...attrs,
          'data-slot': 'attachment-media',
          'data-variant': variant,
        })
        .children(children),
    content: div('content'),
    actions: div('actions'),
    action: button('action'),
    title: text('title'),
    description: text('description'),
    trigger: button('trigger'),
  }
}

export type AttachmentProps<Msg, R = never> = Appearance &
  Omit<Slot<Msg, R>, 'children'> & {
    readonly key?: string
    readonly children:
      | View.Children<Msg, R>
      | ((attachment: ReturnType<typeof parts<Msg>>) => View.Children<Msg, R>)
  }

export const AttachmentBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    children,
    className,
    state = 'done',
    orientation = 'horizontal',
    size = 'default',
  }: AttachmentProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  (key === undefined ? h.div : h.div.key(key))
    .class(styles.root, className)
    .attrs({
      'data-slot': 'attachment',
      'data-state': state,
      'data-orientation': orientation,
      'data-size': size,
      'aria-busy':
        state === 'uploading' || state === 'processing' ? 'true' : undefined,
    })
    .children(
      typeof children === 'function'
        ? children(parts(h, styles, { state, size, orientation }))
        : children,
    )

export const AttachmentGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    className,
    label,
  }: Slot<NoInfer<Msg>, R> & { readonly label?: string },
  styles: Classes = {},
) =>
  h.div
    .class(styles.group, className)
    .attrs({
      'data-slot': 'attachment-group',
      role: label === undefined ? undefined : 'group',
      'aria-label': label,
    })
    .children(children)
