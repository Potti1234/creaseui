import type { View } from '@effect/ui'

export { NavigationMenuBehavior as TopNavBehavior } from './navigation-menu'

export type TopNavAction<Msg, R = never> = {
  readonly key: string
  readonly label: string
  readonly description?: string
  readonly icon?: View.Input<Msg, R>
  readonly disabled?: boolean
  readonly href?: string
  readonly onSelect?: Msg
}

export type TopNavFeatured<Msg, R = never> = {
  readonly title: string
  readonly description?: string
  readonly image?: string
  readonly imageAlt?: string
  readonly href?: string
  readonly linkLabel?: string
  readonly content?: View.Input<Msg, R>
}

export type TopNavEntry<Msg, R = never> =
  | (TopNavAction<Msg, R> & {
      readonly kind?: 'item'
      readonly active?: boolean
      readonly iconOnly?: boolean
    })
  | {
      readonly kind: 'menu' | 'mega-menu'
      readonly key: string
      readonly label: string
      readonly items: readonly TopNavAction<Msg, R>[]
      readonly featured?: TopNavFeatured<Msg, R>
      readonly disabled?: boolean
    }

export const nextTopNavMenu = (
  active: string | null,
  key: string,
  open: boolean,
) => (open ? key : active === key ? null : active)
