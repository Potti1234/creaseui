import type { Html } from '@effect/ui/html'

import { ThumbnailBehavior, type ThumbnailProps } from '../behaviors/thumbnail'
import './thumbnail.css'

const tailwind = {
  root: 'group/thumbnail relative isolate inline-flex w-16 shrink-0 flex-col data-disabled:opacity-50',
  media:
    'relative aspect-square w-full min-w-0 overflow-hidden rounded-md border border-input bg-muted',
  img: 'block size-full object-cover',
  open: 'block size-full cursor-pointer rounded-[inherit] border-0 bg-transparent p-0 text-start outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
  remove:
    'absolute end-1 top-1 z-10 inline-grid size-5 cursor-pointer place-items-center rounded-sm border-0 bg-black/40 text-white hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  overlay:
    'absolute inset-0 grid place-items-center rounded-[inherit] bg-black/40 text-white',
  placeholder: 'grid size-full place-items-center text-muted-foreground',
  spinner: 'inline-flex',
}

export const Thumbnail = <Msg>(
  h: Html.H<Msg>,
  options: ThumbnailProps<NoInfer<Msg>>,
  styles: typeof tailwind = tailwind,
) => ThumbnailBehavior(h, options, styles)
