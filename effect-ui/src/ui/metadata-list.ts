import type { Html } from '@effect/ui/html'
import {
  MetadataListBehavior,
  type MetadataListProps,
} from '../behaviors/metadata-list'

const tailwind = {
  root: 'flex flex-col',
  title: 'mb-3',
  list: 'm-0 grid grid-cols-1 items-baseline gap-x-4 gap-y-2 p-0 data-[layout=horizontal]:flex data-[layout=horizontal]:flex-wrap data-[layout=horizontal]:gap-4 data-[layout=grid-multi]:grid-cols-[repeat(auto-fill,minmax(min(17.5rem,100%),1fr))]',
  item: 'contents data-stacked:flex data-stacked:min-w-0 data-stacked:flex-col data-stacked:gap-0.5',
  term: 'm-0 flex items-center gap-2 text-sm font-medium text-muted-foreground',
  definition: 'm-0 min-w-0 wrap-break-word text-sm',
  icon: 'inline-flex shrink-0 items-center',
  toggle:
    'cursor-pointer self-start rounded-sm border-0 bg-transparent px-0 py-2 text-start text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring',
}
export const MetadataList = <Msg, R = never>(
  h: Html.H<Msg>,
  options: MetadataListProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => MetadataListBehavior(h, options, styles)
