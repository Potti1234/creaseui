import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'
import * as Popover from '@/ui/popover'

type Slot = Readonly<{ class?: string; children: ReadonlyArray<Html | string> }>

export const navigationMenu = <Msg>(props: Slot & Readonly<{ ariaLabel?: string }>): Html => {
  const h = html<Msg>()
  return h.nav(
    [h.DataAttribute('slot', 'navigation-menu'), h.AriaLabel(props.ariaLabel ?? 'Main'), h.Class(cn('relative z-10 flex max-w-max flex-1 items-center justify-center', props.class))],
    [...props.children],
  )
}

export const navigationMenuList = <Msg>(props: Slot): Html => {
  const h = html<Msg>()
  return h.ul([h.DataAttribute('slot', 'navigation-menu-list'), h.Class(cn('group flex flex-1 list-none items-center justify-center gap-1', props.class))], [...props.children])
}

export const navigationMenuItem = <Msg>(props: Slot): Html => {
  const h = html<Msg>()
  return h.li([h.DataAttribute('slot', 'navigation-menu-item'), h.Class(props.class ?? '')], [...props.children])
}

export const navigationMenuLink = <Msg>(props: Slot & Readonly<{ href: string; isActive?: boolean }>): Html => {
  const h = html<Msg>()
  return h.a(
    [h.Href(props.href), h.DataAttribute('slot', 'navigation-menu-link'), ...(props.isActive === true ? [h.AriaCurrent('page'), h.DataAttribute('active', '')] : []), h.Class(cn('group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active]:bg-accent/50', props.class))],
    [...props.children],
  )
}

export type NavigationMenuDisclosureProps<Msg> = Readonly<{
  model: Popover.Model
  toParentMessage: (message: Popover.Message) => Msg
  label: string
  content: Html | string
  class?: string
}>

export const navigationMenuDisclosure = <Msg>(props: NavigationMenuDisclosureProps<Msg>): Html => {
  const h = html<Msg>()
  return Popover.popover({
    model: props.model,
    toParentMessage: props.toParentMessage,
    trigger: h.span([h.Class('flex items-center gap-1')], [props.label, Icon.chevronDown<Msg>({ class: 'relative top-px size-3 transition-transform duration-200' })]),
    triggerClass: cn('group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', props.class),
    content: props.content,
    class: 'w-auto min-w-64 p-2',
    align: 'start',
  })
}
