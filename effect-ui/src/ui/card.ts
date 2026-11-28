import type { Html } from '@effect/ui/html'

import { CardBehavior, type CardProps } from '../behaviors/card'

const tailwind = {
  root: 'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl border bg-card py-(--card-spacing) text-sm text-card-foreground shadow-sm [--card-spacing:1.5rem] data-[size=sm]:[--card-spacing:1rem] data-[density=flush]:pt-0 has-[>img:first-child]:pt-0',
  header:
    '@container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
  title:
    'm-0 text-base leading-normal font-medium group-data-[size=sm]/card:text-sm',
  description: 'text-sm text-muted-foreground',
  action: 'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
  content: 'flex flex-col gap-3 px-(--card-spacing)',
  footer: 'flex items-center px-(--card-spacing)',
}

export const Card = <Msg, R = never>(
  h: Html.H<Msg>,
  options: CardProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => CardBehavior(h, options, styles)
