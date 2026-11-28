import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

type Slot<Msg, R> = {
  readonly children?: View.Children<Msg, R>
  readonly className?: string
}
type Classes = Partial<
  Record<
    | 'root'
    | 'group'
    | 'avatar'
    | 'content'
    | 'header'
    | 'author'
    | 'footer'
    | 'metadata'
    | 'actions',
    string
  >
>

const parts = <Msg>(
  h: Html.H<Msg>,
  styles: Classes,
  align: 'start' | 'end',
) => {
  const part =
    (name: Exclude<keyof Classes, 'root' | 'group'>) =>
    <R = never>({ children, className }: Slot<NoInfer<Msg>, R>) =>
      h.div
        .class(styles[name], className)
        .attrs({ 'data-slot': `message-${name}`, 'data-align': align })
        .children(children)
  return {
    avatar: part('avatar'),
    content: part('content'),
    header: part('header'),
    author: part('author'),
    footer: part('footer'),
    metadata: part('metadata'),
    actions: part('actions'),
  }
}

export type MessageProps<Msg, R = never> = Omit<Slot<Msg, R>, 'children'> & {
  readonly key?: string
  readonly align?: 'start' | 'end'
  readonly label?: string
  readonly announcement?: 'none' | 'status'
  readonly children?:
    | View.Children<Msg, R>
    | ((message: ReturnType<typeof parts<Msg>>) => View.Children<Msg, R>)
}

export const MessageBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    key,
    align = 'start',
    label,
    announcement,
    children,
    className,
  }: MessageProps<NoInfer<Msg>, R>,
  styles: Classes = {},
) =>
  (key === undefined ? h.div : h.div.key(key))
    .class(styles.root, className)
    .attrs({
      'data-slot': 'message',
      'data-align': align,
      'aria-label': label,
      role: announcement === 'status' ? 'status' : undefined,
    })
    .children(
      typeof children === 'function'
        ? children(parts(h, styles, align))
        : children,
    )

export const MessageGroupBehavior = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    label,
    live,
    children,
    className,
  }: Slot<NoInfer<Msg>, R> & {
    readonly label?: string
    readonly live?: 'off' | 'polite'
  },
  styles: Classes = {},
) =>
  h.div
    .class(styles.group, className)
    .attrs({
      'data-slot': 'message-group',
      'aria-label': label,
      role: live === 'polite' ? 'log' : undefined,
      'aria-live': live,
    })
    .children(children)
