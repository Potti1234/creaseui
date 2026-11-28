import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { ChatReasoningBehavior } from '../behaviors/chat-reasoning'
import { IconBehavior } from '../behaviors/icon'

type Options<Msg> = Parameters<typeof ChatReasoningBehavior<Msg>>[1]
export type ChatReasoningProps<Msg, R = never> = Omit<
  Options<Msg>,
  'view' | 'fallback'
> & {
  readonly children: View.Children<Msg, R>
  readonly label?: string
  readonly duration?: string
  readonly streaming?: boolean
  readonly preview?: string
  readonly className?: string
}
const tailwind = {
  root: 'mt-2 flex min-w-0 flex-col',
  trigger:
    'flex min-h-6 min-w-0 cursor-pointer items-center gap-1.5 rounded-sm border-0 bg-transparent py-0.5 text-start text-xs text-muted-foreground outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50',
  label:
    'shrink-0 font-medium whitespace-nowrap data-streaming:animate-pulse motion-reduce:animate-none',
  duration: 'shrink-0 whitespace-nowrap tabular-nums',
  preview: 'min-w-0 truncate',
  panel:
    'mt-1.5 border-s-2 border-border ps-3 text-sm text-muted-foreground hidden:hidden',
}
const thinkingIcon = <Msg>(h: Html.H<Msg>) =>
  h
    .el('svg')
    .attrs({
      width: '14',
      height: '14',
      viewBox: '0 0 14 14',
      fill: 'none',
      'aria-hidden': 'true',
    })
    .children(
      h
        .el('circle')
        .attrs({
          cx: '7',
          cy: '7',
          r: '5.5',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-dasharray': '3 2',
        }),
      h
        .el('circle')
        .attrs({ cx: '5.5', cy: '7', r: '0.75', fill: 'currentColor' }),
      h
        .el('circle')
        .attrs({ cx: '8.5', cy: '7', r: '0.75', fill: 'currentColor' }),
    )
export const ChatReasoning = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    children,
    label = 'Thinking',
    duration,
    streaming,
    preview,
    className,
    ...options
  }: ChatReasoningProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => {
  const collapsed =
    preview ??
    (children.length === 1 && typeof children[0] === 'string'
      ? children[0]
      : undefined)
  return ChatReasoningBehavior(h, {
    ...options,
    view: disclosure =>
      disclosure
        .root(
          h.div.class(styles.root, className).attrs({
            'data-slot': 'chat-reasoning',
            'data-streaming': streaming ? '' : undefined,
          }),
        )
        .children(
          disclosure
            .trigger(
              h.button
                .class(styles.trigger)
                .attr('data-slot', 'chat-reasoning-trigger'),
            )
            .children(
              thinkingIcon(h),
              h.span
                .class(styles.label)
                .attr('data-streaming', streaming ? '' : undefined)
                .children(label),
              duration === undefined
                ? undefined
                : h.span.class(styles.duration).children(duration),
              disclosure.open || collapsed === undefined
                ? undefined
                : h.span.class(styles.preview).children(collapsed),
              IconBehavior(h, {
                name: disclosure.open ? 'chevron-up' : 'chevron-down',
                size: '2xs',
              }),
            ),
          disclosure
            .panel(
              h.div
                .class(styles.panel)
                .attr('data-slot', 'chat-reasoning-content'),
            )
            ?.children(children),
        ),
  })
}
