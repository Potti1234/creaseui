import type { Html } from '@effect/ui/html'
import {
  MessageBehavior,
  MessageGroupBehavior,
  type MessageProps,
} from '../behaviors/message'

const tailwind = {
  root: 'group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse',
  group: 'flex min-w-0 flex-col gap-2',
  avatar:
    'flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-[[data-slot=message-footer]]/message:-translate-y-8',
  content:
    'flex w-full min-w-0 flex-col gap-2.5 wrap-break-word data-[align=end]:items-end',
  header:
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-[[data-variant=ghost]]/message:px-0',
  author:
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground',
  footer:
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground data-[align=end]:justify-end group-has-[[data-variant=ghost]]/message:px-0',
  metadata:
    'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground',
  actions: 'flex max-w-full min-w-0 items-center gap-2 px-3 text-xs',
}

export const Message = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MessageProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => MessageBehavior(h, options, styles)
export const MessageGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof MessageGroupBehavior<Msg, R>>[1],
  styles: typeof tailwind = tailwind,
) => MessageGroupBehavior(h, options, styles)
