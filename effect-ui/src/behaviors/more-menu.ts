import type { View } from '@effect/ui'
import type { MenuItem } from '@effect/ui-kit'

export { DropdownMenuBehavior as MoreMenuBehavior } from './dropdown-menu'

export type MoreMenuAction<Msg, R = never> = {
  readonly type?: 'action'
  readonly value: string
  readonly label: string
  readonly icon?: View.Input<Msg, R>
  readonly variant?: 'default' | 'destructive'
  readonly disabled?: boolean
}
export type MoreMenuOption<Msg, R = never> =
  | MoreMenuAction<Msg, R>
  | { readonly type: 'divider' }
  | {
      readonly type: 'section'
      readonly title: string
      readonly items: readonly MoreMenuAction<Msg, R>[]
    }

export const flattenMoreMenu = <Msg, R = never>(
  items: readonly MoreMenuOption<Msg, R>[],
) => {
  const flat: {
    readonly item: MenuItem
    readonly config: {
      readonly icon?: View.Input<Msg, R>
      readonly tone?: 'default' | 'destructive'
      readonly group?: string
      readonly separatorBefore: boolean
    }
  }[] = []
  let separatorBefore = false
  const action = (option: MoreMenuAction<Msg, R>, group?: string) => {
    flat.push({
      item: {
        value: option.value,
        label: option.label,
        disabled: option.disabled === true,
      },
      config: {
        ...(option.icon === undefined ? {} : { icon: option.icon }),
        ...(option.variant === undefined ? {} : { tone: option.variant }),
        ...(group === undefined ? {} : { group }),
        separatorBefore,
      },
    })
    separatorBefore = false
  }
  for (const item of items) {
    if (item.type === 'divider') separatorBefore = true
    else if (item.type === 'section')
      item.items.forEach(option => action(option, item.title))
    else action(item)
  }
  return flat
}
