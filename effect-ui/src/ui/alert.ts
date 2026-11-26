import type { Html } from '@effect/ui/html'

import { AlertBehavior, type AlertProps } from '../behaviors/alert'

const tailwind = {
  root: 'relative grid w-full grid-cols-[1fr] items-start gap-x-3 gap-y-0.5 rounded-lg border bg-card px-4 py-3 text-sm text-primary data-icon:grid-cols-[1rem_1fr] data-[severity=success]:text-success data-[severity=warning]:text-warning data-[severity=error]:text-destructive',
  icon: 'col-start-1 row-span-2 [&>svg]:size-4',
  title: 'col-start-[-2] min-h-4 font-medium tracking-tight',
  description:
    'col-start-[-2] grid justify-items-start gap-1 text-muted-foreground [&_p]:leading-relaxed',
}

export const Alert = <Msg, R = never>(
  h: Html.H<Msg>,
  options: AlertProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => AlertBehavior(h, options, styles)
