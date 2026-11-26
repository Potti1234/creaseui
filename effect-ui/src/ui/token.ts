import type { Html } from '@effect/ui/html'
import { TokenBehavior, type TokenProps } from '../behaviors/token'

const tailwind = {
  root: 'inline-flex max-w-full items-center gap-1 rounded-[4px] px-2 py-0 text-xs leading-5 font-medium whitespace-nowrap data-disabled:opacity-50',
  action:
    'inline-flex min-w-0 flex-1 items-center gap-1 text-inherit no-underline outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring [&:is(a,button)]:cursor-pointer [&:is(a,button):hover]:brightness-90',
  label: 'min-w-0 truncate',
  remove:
    'relative -me-1 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-ring',
}
export const Token = <Msg, R = never>(
  h: Html.H<Msg>,
  options: TokenProps<NoInfer<Msg>, R>,
  styles: typeof tailwind = tailwind,
) => TokenBehavior(h, options, styles)
