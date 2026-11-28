import type { Html } from '@effect/ui/html'
import { IndicatorBehavior, type IndicatorProps } from '../behaviors/indicator'

const tailwind = {
  root: 'inline-grid size-4 shrink-0 place-items-center rounded border border-input text-primary data-[size=sm]:size-3.5 data-[kind=radio]:rounded-full data-[kind=check]:border-transparent data-[kind=check]:bg-transparent data-[kind=check]:text-primary not-data-[kind=check]:not-data-[checked=unchecked]:border-primary not-data-[kind=check]:not-data-[checked=unchecked]:bg-primary not-data-[kind=check]:not-data-[checked=unchecked]:text-primary-foreground data-disabled:opacity-50',
  dot: 'size-2 rounded-full bg-current data-[size=sm]:size-1.5',
}

export const Indicator = <Msg, R = never>(
  h: Html.H<Msg>,
  options: IndicatorProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => IndicatorBehavior(h, options, styles)
