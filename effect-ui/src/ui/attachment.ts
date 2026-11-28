import type { Html } from '@effect/ui/html'
import {
  AttachmentBehavior,
  AttachmentGroupBehavior,
  type AttachmentProps,
} from '../behaviors/attachment'

const tailwind = {
  root: 'relative flex w-fit max-w-full min-w-0 shrink-0 snap-start flex-wrap items-center gap-2 rounded-xl border bg-card p-2 text-sm text-card-foreground focus-within:ring-1 focus-within:ring-ring/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed data-[orientation=vertical]:w-30 data-[orientation=vertical]:flex-col data-[size=sm]:p-1.5 data-[size=sm]:text-xs data-[size=xs]:gap-1.5 data-[size=xs]:rounded-lg data-[size=xs]:p-1 data-[size=xs]:text-xs',
  group:
    'flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain py-1',
  media:
    'relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted data-[orientation=vertical]:w-full data-[size=sm]:w-8 data-[size=xs]:w-7 data-[state=error]:text-destructive data-[variant=image]:not-data-[state=done]:opacity-60 [&>img]:size-full [&>img]:object-cover',
  content:
    'min-w-0 max-w-full flex-1 leading-tight data-[orientation=vertical]:w-full data-[orientation=vertical]:px-1',
  actions:
    'relative z-20 flex shrink-0 items-center data-[orientation=vertical]:absolute data-[orientation=vertical]:end-3 data-[orientation=vertical]:top-3 data-[orientation=vertical]:gap-1',
  action:
    'grid size-6 place-items-center rounded-md border-0 bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
  title: 'block min-w-0 max-w-full truncate font-medium',
  description:
    'mt-0.5 block min-w-0 max-w-full truncate text-xs text-muted-foreground data-[state=error]:text-destructive',
  trigger:
    'absolute inset-0 z-10 rounded-[inherit] border-0 bg-transparent outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50',
}
export const Attachment = <Msg, R = never>(
  h: Html.H<Msg>,
  options: AttachmentProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => AttachmentBehavior(h, options, styles)
export const AttachmentGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof AttachmentGroupBehavior<Msg, R>>[1],
  styles: typeof tailwind = tailwind,
) => AttachmentGroupBehavior(h, options, styles)
