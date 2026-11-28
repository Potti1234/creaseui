import type { Component } from '@effect/ui'
import { Drawer } from '@effect/ui-kit'

export { Drawer as DrawerBehavior }
export type {
  DrawerEvents,
  DrawerProps,
  DrawerSwipeDirection,
} from '@effect/ui-kit'
export type DrawerParts = Component.Headless.Parts<typeof Drawer>
