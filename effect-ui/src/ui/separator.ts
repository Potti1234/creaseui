import type { Html } from '@effect/ui/html'

import { SeparatorBehavior, type SeparatorProps } from '../behaviors/separator'

const tailwind = {
  line: 'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
}

export const Separator = <Msg>(
  h: Html.H<Msg>,
  {
    orientation,
    decorative = true,
    className,
  }: SeparatorProps & {
    readonly decorative?: boolean
    readonly className?: string
  } = {},
  styles: typeof tailwind = tailwind,
) =>
  SeparatorBehavior(h, {
    props: { orientation },
    element: h.div.class(styles.line, className).attrs({
      role: decorative ? 'none' : undefined,
      'data-slot': 'separator',
    }),
  })
