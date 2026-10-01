import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'
import { ActivatedToastAction, type Entry, type Message, type Model, type Position, type Variant, Message as ToastMessages } from '@/lib/toast'
import { buttonVariants } from '@/ui/button'

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

/** Mirrors the upstream Toast view's animation attributes so the entry
 *  participates in the primitive's enter/leave lifecycle. */
const animationAttributes = <Msg>(entry: Entry, h: HtmlBuilder<Msg>): ReadonlyArray<Attribute<Msg>> => {
  switch (entry.animation.transitionState) {
    case 'EnterStart': return [
      h.DataAttribute('closed', ''), h.DataAttribute('enter', ''), h.DataAttribute('transition', ''),
    ]
    case 'EnterAnimating': return [h.DataAttribute('enter', ''), h.DataAttribute('transition', '')]
    case 'LeaveStart': return [h.DataAttribute('leave', ''), h.DataAttribute('transition', '')]
    case 'LeaveAnimating': return [
      h.DataAttribute('closed', ''), h.DataAttribute('leave', ''), h.DataAttribute('transition', ''),
    ]
    default: return []
  }
}

/** `data-closed` phases (enter start, leave end) fade the entry via the
 *  existing opacity/transform transition. */
const isVisuallyClosed = (entry: Entry): boolean =>
  entry.animation.transitionState === 'EnterStart' || entry.animation.transitionState === 'LeaveAnimating'

const entryView = <Msg>(entry: Entry, props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.article(
  [
    h.Key(entry.id), h.Id(entry.id),
    h.Role(entry.payload.variant === 'Error' ? 'alert' : 'status'),
    h.DataAttribute('slot', 'sonner-toast'),
    h.DataAttribute('variant', entry.payload.variant.toLowerCase()),
    h.DataAttribute('paused', String(entry.isHovered)),
    ...(props.pausePolicy === 'none' || Option.isNone(entry.maybeDuration) ? [] : [
      h.OnMouseEnter(props.toParentMessage(ToastMessages.HoveredEntry({ entryId: entry.id }))),
      h.OnMouseLeave(props.toParentMessage(ToastMessages.LeftEntry({ entryId: entry.id }))),
    ]),
    ...animationAttributes(entry, h),
    h.Class(cn('group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 pr-8 text-popover-foreground shadow-lg transition-[opacity,transform] duration-200 motion-reduce:transition-none', isVisuallyClosed(entry) && 'opacity-0', props.entryClass)),
  ],
  [
    ...(variantIcon(entry.payload.variant, h) === undefined ? [] : [variantIcon(entry.payload.variant, h)!]),
    h.div([h.Class('grid flex-1 gap-1')], [
      h.div([h.Class('text-sm font-semibold')], [entry.payload.title]),
      ...(entry.payload.description === undefined ? [] : [h.div([h.Class('text-sm text-muted-foreground')], [entry.payload.description])]),
    ]),
    ...(entry.payload.actionLabel === undefined ? [] : [h.button([
      h.Type('button'),
      h.OnClick(props.toParentMessage(ActivatedToastAction({ id: entry.id }))),
      h.Class(cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 bg-transparent hover:bg-secondary')),
    ], [entry.payload.actionLabel])]),
    h.button([
      h.Type('button'), h.AriaLabel('Dismiss notification'),
      h.OnClick(props.toParentMessage(ToastMessages.Dismissed({ entryId: entry.id }))),
      h.Class(cn(buttonVariants({ variant: 'ghost', size: 'icon-xs' }), 'absolute top-2 right-2 p-1 text-foreground/50 opacity-0 transition-opacity motion-reduce:transition-none hover:text-foreground focus:opacity-100 group-hover:opacity-100')),
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
