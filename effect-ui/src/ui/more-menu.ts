import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { IconBehavior } from '../behaviors/icon'
import { flattenMoreMenu, type MoreMenuOption } from '../behaviors/more-menu'
import { Button, type ButtonVariant } from './button'
import { DropdownMenu } from './dropdown-menu'

type Options<Msg> = Extract<
  Parameters<typeof DropdownMenu<Msg>>[1],
  { readonly trigger: object }
>
export type MoreMenuProps<Msg, R = never> = Omit<
  Options<Msg>,
  'trigger' | 'props' | 'decorateItem' | 'parentMenu' | 'submenuTrigger'
> & {
  readonly props: Omit<Options<Msg>['props'], 'items'>
  readonly items: readonly MoreMenuOption<Msg, R>[]
  readonly icon?: View.Input<Msg, R>
  readonly size?: 'sm' | 'md' | 'lg'
  readonly variant?: ButtonVariant
  readonly triggerClassName?: string
}

const sizes = { sm: 'icon-sm', md: 'icon-sm', lg: 'icon' } as const
export const MoreMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  {
    items,
    label = 'More options',
    size = 'md',
    icon,
    variant = 'ghost',
    triggerClassName,
    props,
    ...options
  }: MoreMenuProps<NoInfer<Msg>, R>,
  renderButton: typeof Button = Button,
  renderMenu: typeof DropdownMenu = DropdownMenu,
) => {
  const mapped = flattenMoreMenu(items)
  const appearance = new Map(
    mapped.map(entry => [entry.item.value, entry.config]),
  )
  const trigger = renderButton(h, {
    element: h.button
      .class(triggerClassName)
      .attrs({ 'aria-label': label, 'data-slot': 'more-menu-trigger' }),
    variant,
    size: sizes[size],
    disabled: props.disabled === true,
  }).children(icon ?? IconBehavior(h, { name: 'ellipsis', size: 'sm' }))
  return renderMenu(h, {
    ...options,
    trigger,
    label,
    props: {
      side: 'bottom',
      align: 'start',
      ...props,
      items: mapped.map(entry => entry.item),
    },
    decorateItem: item => appearance.get(item.value) ?? {},
  })
}
