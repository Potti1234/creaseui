export { Menubar as MenubarBehavior, MenubarProps } from '@effect/ui-kit'

export const nextOpenMenu = (
  current: string | null,
  menu: string,
  open: boolean,
): string | null => (open ? menu : current === menu ? null : current)
