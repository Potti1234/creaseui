import type { Html } from '@effect/ui/html'

import { InfoTipBehavior, type InfoTipProps } from '../behaviors/info-tip'

const tailwind = {
  root: 'inline-flex shrink-0 items-center align-middle',
  trigger:
    'inline-grid cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0.5 text-muted-foreground data-[size=xsm]:text-xs data-[size=sm]:text-[14px] data-[size=md]:text-base data-[size=lg]:text-lg hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
  panel:
    'relative max-w-[min(18rem,calc(100vw-1rem))] rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground data-ending-style:invisible',
  arrow:
    'size-2 rotate-45 rounded-xs bg-primary data-[side=top]:-bottom-1 data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1',
}
export const InfoTip = <Msg, R = never>(
  h: Html.H<Msg>,
  options: InfoTipProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => InfoTipBehavior(h, options, styles)
