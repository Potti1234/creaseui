import type { Html } from '@effect/ui/html'

import { LinkBehavior, type LinkProps } from '../behaviors/link'
import { Tooltip } from './tooltip'

const tailwind = {
  root: 'inline-flex items-center gap-0.5 border-0 bg-transparent p-0 text-start [font:inherit] text-inherit no-underline outline-none transition-colors enabled:cursor-pointer data-underline:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 [@media(hover:hover)]:hover:underline',
  newTabLabel: 'sr-only',
}

export const Link = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    tooltip,
    ...options
  }: LinkProps<NoInfer<Msg>, R> & {
    readonly tooltip?: Omit<Parameters<typeof Tooltip<Msg, R>>[1], 'trigger'>
  },
  styles: typeof tailwind = tailwind,
  renderTooltip: typeof Tooltip = Tooltip,
) => {
  const trigger = LinkBehavior(h, options, styles)
  return tooltip === undefined || options.disabled
    ? trigger
    : renderTooltip(h, { ...tooltip, trigger })
}
