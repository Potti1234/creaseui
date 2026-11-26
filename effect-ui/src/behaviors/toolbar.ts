import type { Component } from '@effect/ui'
import { Toolbar } from '@effect/ui-kit'

export { Toolbar as ToolbarBehavior }
export type { ToolbarProps, ToolbarItem, ToolbarGroup } from '@effect/ui-kit'
export type ToolbarParts = Component.Headless.Parts<typeof Toolbar>
