import { type VariantProps, cva } from 'class-variance-authority'
import { type Html, html } from 'foldkit/html'

import { cn } from '@/lib/utils'

export const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  { variants: { variant: { default: '', separator: 'before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border', border: 'border-b border-border pb-2' } }, defaultVariants: { variant: 'default' } },
)

type ChildrenProps = Readonly<{ children: ReadonlyArray<Html | string>; class?: string }>

export const marker = <Msg>(props: ChildrenProps & Readonly<{ variant?: VariantProps<typeof markerVariants>['variant'] }>): Html => {
  const h = html<Msg>()
  const variant = props.variant ?? 'default'
  return h.div([h.DataAttribute('slot', 'marker'), h.DataAttribute('variant', variant ?? 'default'), h.Class(cn(markerVariants({ variant }), props.class))], [...props.children])
}

export const markerIcon = <Msg>(props: ChildrenProps): Html => {
  const h = html<Msg>()
  return h.span([h.DataAttribute('slot', 'marker-icon'), h.AriaHidden(true), h.Class(cn("size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class))], [...props.children])
}

export const markerContent = <Msg>(props: ChildrenProps): Html => {
  const h = html<Msg>()
  return h.span([h.DataAttribute('slot', 'marker-content'), h.Class(cn('min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center', props.class))], [...props.children])
}
