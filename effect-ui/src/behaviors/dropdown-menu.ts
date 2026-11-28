import type { Component } from '@effect/ui'
import { Menu } from '@effect/ui-kit'

export { Menu as DropdownMenuBehavior }
export type { MenuEvents, MenuItem, MenuProps } from '@effect/ui-kit'
export type MenuParts = Component.Headless.Parts<typeof Menu>
