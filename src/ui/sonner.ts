import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'
import { type Entry, type Message, type Model, type Position, type Variant, Message as ToastMessages } from '@/lib/toast'

export * from '@/lib/toast'

const variantIcon = <Msg>(variant: Variant, h: HtmlBuilder<Msg>): Html | undefined => {
  const config = { class: 'mt-0.5 size-4 shrink-0' }
  switch (variant) {
    case 'Default': return undefined
    case 'Success': return Icon.circleCheck<Msg>(config, h)
    case 'Error': return Icon.octagonX<Msg>(config, h)
    case 'Warning': return Icon.triangleAlert<Msg>(config, h)
    case 'Info': return Icon.info<Msg>(config, h)
  }
}

const POSITION_ORDER: ReadonlyArray<Position> = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

const positionClass = (position: Position): string => {
  const base = 'pointer-events-none fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:w-auto sm:max-w-[420px]'
  switch (position) {
    case 'top-left': return cn(base, 'left-0 top-0')
    case 'top-center': return cn(base, 'left-1/2 top-0 -translate-x-1/2')
    case 'top-right': return cn(base, 'right-0 top-0')
    case 'bottom-left': return cn(base, 'bottom-0 left-0 flex-col-reverse sm:flex-col')
    case 'bottom-center': return cn(base, 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse sm:flex-col')
    case 'bottom-right': return cn(base, 'bottom-0 right-0 flex-col-reverse sm:flex-col')
  }
}

export type SonnerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel?: string
  pausePolicy?: 'none' | 'pointer'
  class?: string
  entryClass?: string
  position?: Position
}>

const entryView = <Msg>(entry: Entry, props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.article(
  [
    h.Key(entry.id),
    h.Role(entry.variant === 'Error' ? 'alert' : 'status'),
    h.DataAttribute('slot', 'sonner-toast'),
    h.DataAttribute('variant', entry.variant.toLowerCase()),
    h.DataAttribute('paused', String(entry.isPaused)),
    ...(props.pausePolicy === 'none' || entry.sticky ? [] : [
      h.OnMouseEnter(props.toParentMessage(ToastMessages.PausedToast({ id: entry.id }))),
      h.OnMouseLeave(props.toParentMessage(ToastMessages.ResumedToast({ id: entry.id }))),
    ]),
    h.Class(cn('group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 pr-8 text-popover-foreground shadow-lg transition-[opacity,transform] duration-200 motion-reduce:transition-none', props.entryClass)),
  ],
  [
    ...(variantIcon(entry.variant, h) === undefined ? [] : [variantIcon(entry.variant, h)!]),
    h.div([h.Class('grid flex-1 gap-1')], [
      h.div([h.Class('text-sm font-semibold')], [entry.payload.title]),
      ...(entry.payload.description === undefined ? [] : [h.div([h.Class('text-sm text-muted-foreground')], [entry.payload.description])]),
    ]),
    ...(entry.payload.actionLabel === undefined ? [] : [h.button([
      h.Type('button'),
      h.OnClick(props.toParentMessage(ToastMessages.ActivatedToastAction({ id: entry.id }))),
      h.Class('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring'),
    ], [entry.payload.actionLabel])]),
    h.button([
      h.Type('button'), h.AriaLabel('Dismiss notification'),
      h.OnClick(props.toParentMessage(ToastMessages.Dismissed({ id: entry.id }))),
      h.Class('absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity motion-reduce:transition-none hover:text-foreground focus:opacity-100 group-hover:opacity-100'),
    ], [Icon.x<Msg>({ class: 'size-4' }, h)]),
  ],
)

export const sonner = <Msg>(props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => {
  const fallback = props.position ?? 'bottom-right'
  const entryPosition = (entry: Entry): Position => entry.payload.position ?? fallback
  const positions = POSITION_ORDER.filter(position =>
    props.model.entries.some(entry => entryPosition(entry) === position))
  return h.div(
    [h.DataAttribute('slot', 'sonner-root')],
    (positions.length === 0 ? [fallback] : positions).map(position =>
      h.section(
        [
          h.AriaLabel(props.ariaLabel ?? 'Notifications'), h.AriaLive('polite'),
          h.DataAttribute('slot', 'sonner'),
          h.DataAttribute('position', position),
          h.Class(cn(positionClass(position), props.class)),
        ],
        props.model.entries
          .filter(entry => entryPosition(entry) === position)
          .map(entry => entryView(entry, props, h)),
      )),
  )
}
