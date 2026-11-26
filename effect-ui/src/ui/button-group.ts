import type { Html } from '@effect/ui/html'
import {
  ButtonGroupBehavior,
  type ButtonGroupProps,
} from '../behaviors/button-group'
import './button-group.css'

const tailwind = {
  root: 'flex w-fit min-w-0 items-stretch data-[orientation=vertical]:flex-col has-[>[data-slot=button-group]]:gap-2',
  separator:
    'relative shrink-0 self-stretch bg-input data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
  text: 'flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium',
}
export const ButtonGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: ButtonGroupProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => ButtonGroupBehavior(h, options, styles)
