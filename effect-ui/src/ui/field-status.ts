import type { Html } from '@effect/ui/html'
import {
  FieldStatusBehavior,
  type FieldStatusProps,
} from '../behaviors/field-status'

const tailwind = {
  root: 'flex items-start gap-1 px-2 pb-2 text-xs data-[variant=attached]:pointer-events-none data-[variant=attached]:-mt-1.5 data-[variant=attached]:rounded-b-md data-[variant=attached]:pt-3.5 data-[variant=detached]:mt-1 data-[variant=detached]:rounded-md data-[variant=detached]:pt-2 data-[type=warning]:bg-warning/20 data-[type=warning]:text-warning data-[type=error]:bg-destructive/20 data-[type=error]:text-destructive data-[type=success]:bg-success/20 data-[type=success]:text-success',
  icon: 'inline-flex h-4 shrink-0 items-center',
}

export const FieldStatus = <Msg, R = never>(
  h: Html.H<Msg>,
  options: FieldStatusProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => FieldStatusBehavior(h, options, styles)
