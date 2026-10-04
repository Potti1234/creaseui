/* Ported from Meta Astryx SideNav (packages/core/src/SideNav/SideNav.tsx) — examples and visual spec adapted to Crease UI tokens. */

import { Option, Schema as S } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'

import * as NavMenu from './nav-menu'

export const HEADING_MENU_KEY = 'heading-menu'
export const flyoutKey = (itemId: string): string => `flyout-${itemId}`

export const COLLAPSE_THRESHOLD = 160
export const COLLAPSED_WIDTH = 48
export const DEFAULT_WIDTH = 260
export const DEFAULT_MIN_WIDTH = 180
export const DEFAULT_MAX_WIDTH = 480

export const Model = S.Struct({
  id: S.String,
  isCollapsed: S.Boolean,
  isCollapsible: S.Boolean,
  isResizable: S.Boolean,
  width: S.Number,
  minWidth: S.Number,
  maxWidth: S.Number,
  lastExpandedWidth: S.Number,
  drag: S.Option(S.Struct({ startX: S.Number, startWidth: S.Number })),
  /** itemId -> collapsed state for items with children (children start
      expanded, matching astryx's default). */
  collapsedItemIds: S.Record(S.String, S.Boolean),
  /** NavMenu models keyed 'heading-menu' | `flyout-${itemId}`, created lazily
      on first interaction. */
  menus: S.Record(S.String, NavMenu.Model),
})
export type Model = typeof Model.Type

export const OutMessage = defineMessageUnion({
  SelectedSideNavItem: { id: S.String },
  ChangedSideNavCollapse: { isCollapsed: S.Boolean },
})
export type OutMessage = typeof OutMessage.Type

export const Message = defineMessageUnion({
  ToggledSideNav: {},
  StartedSideNavResize: { x: S.Number },
  DraggedSideNavResize: { x: S.Number, direction: S.Literals(['ltr', 'rtl']) },
  EndedSideNavResize: {},
  /** Keyboard resize on the drag handle (ArrowLeft/Right by `delta` px). */
  NudgedSideNavResize: { delta: S.Number },
  ToggledSideNavItem: { id: S.String, isCollapsed: S.Boolean },
  PressedSideNavItemAction: { id: S.String },
  GotSideNavMenuMessage: { key: S.String, message: NavMenu.Message },
})
export type Message = typeof Message.Type

export type InitConfig = Readonly<{
  id: string
  isCollapsed?: boolean
  isCollapsible?: boolean
  isResizable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
}>

export const init = (config: InitConfig): Model => {
  const width = config.width ?? DEFAULT_WIDTH
  return {
    id: config.id,
    isCollapsed: config.isCollapsed ?? false,
    isCollapsible: config.isCollapsible ?? false,
    isResizable: config.isResizable ?? false,
    width,
    minWidth: config.minWidth ?? DEFAULT_MIN_WIDTH,
    maxWidth: config.maxWidth ?? DEFAULT_MAX_WIDTH,
    lastExpandedWidth: width,
    drag: Option.none(),
    collapsedItemIds: {},
    menus: {},
  }
}

/** astryx's per-surface delays: heading menus open instantly with a click
    guard; collapsed-item flyouts use the standard hover delays. */
const navMenuConfigForKey = (navId: string, key: string): NavMenu.InitConfig =>
  key === HEADING_MENU_KEY
    ? {
        id: `${navId}-${key}`,
        showDelayMs: 0,
        closeDelayMs: 200,
        clickGuardMs: 500,
        ownsFocus: true,
      }
    : {
        id: `${navId}-${key}`,
        showDelayMs: 150,
        closeDelayMs: 200,
        clickGuardMs: 0,
        ownsFocus: true,
      }

export const menuFor = (model: Model, key: string): NavMenu.Model =>
  model.menus[key] ?? NavMenu.init(navMenuConfigForKey(model.id, key))

export const isItemCollapsed = (
  model: Model,
  itemId: string,
  defaultCollapsed: boolean,
): boolean => model.collapsedItemIds[itemId] ?? defaultCollapsed

export const visibleWidth = (model: Model): number =>
  model.isCollapsed ? COLLAPSED_WIDTH : model.width

const clampWidth = (model: Model, width: number): number =>
  Math.min(Math.max(width, model.minWidth), model.maxWidth)

export const update = (
  model: Model,
  message: Message,
): Update.ReturnWithOutMessage<Model, Message, OutMessage> => {
  switch (message._tag) {
    case 'ToggledSideNav':
      return {
        model: {
          ...model,
          isCollapsed: !model.isCollapsed,
          width: model.isCollapsed ? model.lastExpandedWidth : model.width,
          lastExpandedWidth: model.isCollapsed
            ? model.width
            : model.lastExpandedWidth,
          menus: {},
        },
        outMessage: OutMessage.ChangedSideNavCollapse({
          isCollapsed: !model.isCollapsed,
        }),
      }
    case 'StartedSideNavResize':
      return {
        model: {
          ...model,
          drag: Option.some({
            startX: message.x,
            startWidth: model.isCollapsed ? COLLAPSED_WIDTH : model.width,
          }),
        },
      }
    case 'DraggedSideNavResize': {
      const drag = Option.getOrNull(model.drag)
      if (drag === null) {
        return { model }
      }
      const sign = message.direction === 'rtl' ? -1 : 1
      const nextWidth = Math.max(
        drag.startWidth + sign * (message.x - drag.startX),
        0,
      )
      if (model.isCollapsible && nextWidth < COLLAPSE_THRESHOLD) {
        return {
          model: { ...model, isCollapsed: true, menus: {} },
        }
      }
      const clamped = clampWidth(model, nextWidth)
      return {
        model: {
          ...model,
          isCollapsed: false,
          width: clamped,
          lastExpandedWidth: clamped,
        },
      }
    }
    case 'EndedSideNavResize':
      return { model: { ...model, drag: Option.none() } }
    case 'NudgedSideNavResize': {
      const nextWidth = clampWidth(model, visibleWidth(model) + message.delta)
      if (model.isCollapsible && nextWidth < COLLAPSE_THRESHOLD) {
        return { model: { ...model, isCollapsed: true, menus: {} } }
      }
      return {
        model: {
          ...model,
          isCollapsed: false,
          width: nextWidth,
          lastExpandedWidth: nextWidth,
        },
      }
    }
    case 'ToggledSideNavItem':
      return {
        model: {
          ...model,
          collapsedItemIds: {
            ...model.collapsedItemIds,
            [message.id]: message.isCollapsed,
          },
        },
      }
    case 'PressedSideNavItemAction':
      return {
        model,
        outMessage: OutMessage.SelectedSideNavItem({ id: message.id }),
      }
    case 'GotSideNavMenuMessage': {
      const menu = menuFor(model, message.key)
      const result = NavMenu.update(menu, message.message)
      return {
        model: {
          ...model,
          menus: { ...model.menus, [message.key]: result.model },
        },
        commands: Command.mapMessages(result.commands ?? [], next =>
          Message.GotSideNavMenuMessage({
            key: message.key,
            message: next,
          }),
        ),
      }
    }
  }
}
