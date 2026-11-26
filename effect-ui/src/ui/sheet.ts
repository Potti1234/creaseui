import type { Html } from '@effect/ui/html'

import { Drawer, drawerClasses, type DrawerOptions } from './drawer'

export const Sheet = <Msg, R = never>(
  h: Html.H<Msg>,
  options: DrawerOptions<NoInfer<Msg>, R>,
  styles: typeof drawerClasses = drawerClasses,
) => {
  const side = options.side ?? 'right'
  return Drawer(
    h,
    {
      closeLabel: side === 'bottom' ? false : 'Close',
      ...options,
      side,
    },
    styles,
    'sheet',
  )
}
