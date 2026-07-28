import { type Html, html } from 'foldkit/html'

import * as Icon from '@/lib/icon'
import { buttonVariants, type ButtonVariants } from '@/ui/button'
import { cn } from '@/lib/utils'

type SlotProps = Readonly<{
  children: ReadonlyArray<Html | string>
  class?: string
}>

export const pagination = <Msg>(props: SlotProps): Html => {
  const h = html<Msg>()

  return h.nav(
    [
      h.Role('navigation'),
      h.AriaLabel('pagination'),
      h.DataAttribute('slot', 'pagination'),
      h.Class(cn('mx-auto flex w-full justify-center', props.class)),
    ],
    [...props.children],
  )
}

export const paginationContent = <Msg>(props: SlotProps): Html => {
  const h = html<Msg>()

  return h.ul(
    [
      h.DataAttribute('slot', 'pagination-content'),
      h.Class(cn('flex flex-row items-center gap-1', props.class)),
    ],
    [...props.children],
  )
}

export const paginationItem = <Msg>(props: SlotProps): Html => {
  const h = html<Msg>()

  return h.li(
    [
      h.DataAttribute('slot', 'pagination-item'),
      h.Class(cn(props.class)),
    ],
    [...props.children],
  )
}

export type PaginationLinkProps = Readonly<{
  href: string
  children: ReadonlyArray<Html | string>
  isActive?: boolean
  size?: ButtonVariants['size']
  ariaLabel?: string
  class?: string
}>

export const paginationLink = <Msg>(props: PaginationLinkProps): Html => {
  const h = html<Msg>()
  const isActive = props.isActive ?? false

  return h.a(
    [
      h.Href(props.href),
      ...(isActive ? [h.AriaCurrent('page')] : []),
      ...(props.ariaLabel === undefined ? [] : [h.AriaLabel(props.ariaLabel)]),
      h.DataAttribute('slot', 'pagination-link'),
      ...(isActive ? [h.DataAttribute('active', 'true')] : []),
      h.Class(
        cn(
          buttonVariants({
            variant: isActive ? 'outline' : 'ghost',
            size: props.size ?? 'icon',
          }),
          props.class,
        ),
      ),
    ],
    [...props.children],
  )
}

export type PaginationDirectionProps = Readonly<{
  href: string
  class?: string
}>

export const paginationPrevious = <Msg>(
  props: PaginationDirectionProps,
): Html => {
  const h = html<Msg>()

  return paginationLink<Msg>({
    href: props.href,
    ariaLabel: 'Go to previous page',
    size: 'default',
    class: cn('gap-1 px-2.5 sm:pl-2.5', props.class),
    children: [
      Icon.chevronLeft<Msg>(),
      h.span([h.Class('hidden sm:block')], ['Previous']),
    ],
  })
}

export const paginationNext = <Msg>(
  props: PaginationDirectionProps,
): Html => {
  const h = html<Msg>()

  return paginationLink<Msg>({
    href: props.href,
    ariaLabel: 'Go to next page',
    size: 'default',
    class: cn('gap-1 px-2.5 sm:pr-2.5', props.class),
    children: [
      h.span([h.Class('hidden sm:block')], ['Next']),
      Icon.chevronRight<Msg>(),
    ],
  })
}

export type PaginationEllipsisProps = Readonly<{
  class?: string
}>

export const paginationEllipsis = <Msg>(
  props: PaginationEllipsisProps = {},
): Html => {
  const h = html<Msg>()

  return h.span(
    [
      h.AriaHidden(true),
      h.DataAttribute('slot', 'pagination-ellipsis'),
      h.Class(
        cn('flex size-9 items-center justify-center', props.class),
      ),
    ],
    [
      Icon.moreHorizontal<Msg>({ class: 'size-4' }),
      h.span([h.Class('sr-only')], ['More pages']),
    ],
  )
}
