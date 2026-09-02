import type { Html, HtmlBuilder } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'
import { Activated, Dismissed, Paused, Resumed, type Entry, type Message, type Model, type Variant } from '@/lib/toast'

export * from '@/lib/toast'

const variantIcon = <Msg>(variant: Variant, h: HtmlBuilder<Msg>): Html => {
  const config = { class: 'mt-0.5 size-4 shrink-0' }
  switch (variant) {
    case 'Success': return Icon.circleCheck<Msg>(config, h)
    case 'Error': return Icon.octagonX<Msg>(config, h)
    case 'Warning': return Icon.triangleAlert<Msg>(config, h)
    case 'Info': return Icon.info<Msg>(config, h)
  }
}

export type SonnerProps<Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  ariaLabel?: string
  pausePolicy?: 'none' | 'pointer'
  class?: string
  entryClass?: string
}>

const entryView = <Msg>(entry: Entry, props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.article(
  [
    h.Key(entry.id),
    h.Role(entry.variant === 'Error' ? 'alert' : 'status'),
    h.DataAttribute('slot', 'sonner-toast'),
    h.DataAttribute('variant', entry.variant.toLowerCase()),
    h.DataAttribute('paused', String(entry.isPaused)),
    ...(props.pausePolicy === 'none' || entry.sticky ? [] : [
      h.OnMouseEnter(props.toParentMessage(Paused({ id: entry.id }))),
      h.OnMouseLeave(props.toParentMessage(Resumed({ id: entry.id }))),
    ]),
    h.Class(cn('group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-popover p-4 pr-8 text-popover-foreground shadow-lg transition-[opacity,transform] duration-200 motion-reduce:transition-none', props.entryClass)),
  ],
  [
    variantIcon(entry.variant, h),
    h.div([h.Class('grid flex-1 gap-1')], [
      h.div([h.Class('text-sm font-semibold')], [entry.payload.title]),
      ...(entry.payload.description === undefined ? [] : [h.div([h.Class('text-sm text-muted-foreground')], [entry.payload.description])]),
    ]),
    ...(entry.payload.actionLabel === undefined ? [] : [h.button([
      h.Type('button'),
      h.OnClick(props.toParentMessage(Activated({ id: entry.id }))),
      h.Class('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring'),
    ], [entry.payload.actionLabel])]),
    h.button([
      h.Type('button'), h.AriaLabel('Dismiss notification'),
      h.OnClick(props.toParentMessage(Dismissed({ id: entry.id }))),
      h.Class('absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity motion-reduce:transition-none hover:text-foreground focus:opacity-100 group-hover:opacity-100'),
    ], [Icon.x<Msg>({ class: 'size-4' }, h)]),
  ],
)

export const sonner = <Msg>(props: SonnerProps<Msg>, h: HtmlBuilder<Msg>): Html => h.section(
  [
    h.AriaLabel(props.ariaLabel ?? 'Notifications'), h.AriaLive('polite'),
    h.DataAttribute('slot', 'sonner'),
    h.Class(cn('pointer-events-none fixed right-0 bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:w-auto sm:max-w-[420px] sm:flex-col', props.class)),
  ],
  props.model.entries.map(entry => entryView(entry, props, h)),
)
