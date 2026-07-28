import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import { cn } from '@/lib/utils'

export const Model = S.Struct({
  id: S.String,
  isOpen: S.Boolean,
  isAnimated: S.Boolean,
  activeIndex: S.Number,
  activeSubmenuIndex: S.Number,
  openSubmenuIndex: S.Option(S.Number),
})
export type Model = typeof Model.Type

export const Opened = m('Opened')
export const Closed = m('Closed')
export const ActivatedItem = m('ActivatedItem', { index: S.Number })
export const OpenedSubmenu = m('OpenedSubmenu', { index: S.Number })
export const ActivatedSubmenuItem = m('ActivatedSubmenuItem', { index: S.Number })
export const ClosedSubmenu = m('ClosedSubmenu')
export const SelectedItem = m('SelectedItem', { item: S.String, index: S.Number })
export const Message = S.Union([Opened, Closed, ActivatedItem, OpenedSubmenu, ActivatedSubmenuItem, ClosedSubmenu, SelectedItem])
export type Message = typeof Message.Type

export const Selected = m('Selected', { value: S.String, index: S.Number })
export const OutMessage = S.Union([Selected])
export type OutMessage<Item extends string = string> = Readonly<{ _tag: 'Selected'; value: Item; index: number }>

export const init = (config: Readonly<{ id: string; isAnimated?: boolean; isModal?: boolean }>): Model => ({
  id: config.id,
  isOpen: false,
  isAnimated: config.isAnimated ?? false,
  activeIndex: 0,
  activeSubmenuIndex: 0,
  openSubmenuIndex: Option.none(),
})

type UpdateReturn<Item extends string> = readonly [Model, ReadonlyArray<Command.Command<Message>>, Option.Option<OutMessage<Item>>]

const updateTyped = <Item extends string>(model: Model, message: Message): UpdateReturn<Item> => {
  switch (message._tag) {
    case 'Opened': return [{ ...model, isOpen: true }, [], Option.none()]
    case 'Closed': return [{ ...model, isOpen: false, openSubmenuIndex: Option.none() }, [], Option.none()]
    case 'ActivatedItem': return [{ ...model, activeIndex: Math.max(0, message.index) }, [], Option.none()]
    case 'OpenedSubmenu': return [{ ...model, activeIndex: message.index, activeSubmenuIndex: 0, openSubmenuIndex: Option.some(message.index) }, [], Option.none()]
    case 'ActivatedSubmenuItem': return [{ ...model, activeSubmenuIndex: Math.max(0, message.index) }, [], Option.none()]
    case 'ClosedSubmenu': return [{ ...model, openSubmenuIndex: Option.none() }, [], Option.none()]
    case 'SelectedItem': return [{ ...model, isOpen: false, openSubmenuIndex: Option.none() }, [], Option.some(Selected({ value: message.item, index: message.index }) as OutMessage<Item>)]
  }
}

export const create = <Item extends string = string>() => ({
  update: (model: Model, message: Message): UpdateReturn<Item> => updateTyped<Item>(model, message),
  open: (model: Model): UpdateReturn<Item> => updateTyped<Item>(model, Opened()),
  close: (model: Model): UpdateReturn<Item> => updateTyped<Item>(model, Closed()),
  selectItem: (model: Model, item: Item, index: number): UpdateReturn<Item> => updateTyped<Item>(model, SelectedItem({ item, index })),
})

export const update = create().update
export const open = create().open
export const close = create().close
export const selectItem = create().selectItem

const CONTENT_CLASS = 'absolute z-50 min-w-[8rem] overflow-visible rounded-md border bg-popover p-1 text-popover-foreground shadow-md'
const ITEM_CLASS = "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[active]:bg-accent data-[active]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
const SUBMENU_CLASS = 'absolute top-0 left-full ml-1 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg'

export type DropdownMenuItemConfig = Readonly<{
  label: Html | string
  icon?: Html
  shortcut?: Html | string
  variant?: 'default' | 'destructive'
  kind?: 'item' | 'checkbox' | 'radio'
  isChecked?: boolean
  isInset?: boolean
  isDisabled?: boolean
  group?: string
  submenu?: Readonly<{
    items: ReadonlyArray<string>
    itemToConfig: (item: string) => DropdownMenuItemConfig
  }>
}>

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'
export type DropdownMenuAlign = 'start' | 'center' | 'end'

export type DropdownMenuProps<Item extends string, Msg> = Readonly<{
  model: Model
  toParentMessage: (message: Message) => Msg
  trigger: Html | string
  triggerClass?: string
  items: ReadonlyArray<Item>
  itemToConfig: (item: Item) => DropdownMenuItemConfig
  align?: DropdownMenuAlign
  side?: DropdownMenuSide
  ariaLabel?: string
  openOnContextMenu?: boolean
}>

const positionClass = (side: DropdownMenuSide, align: DropdownMenuAlign): string => {
  const sideClass = { top: 'bottom-full mb-1', right: 'left-full ml-1', bottom: 'top-full mt-1', left: 'right-full mr-1' }[side]
  const alignClass = side === 'top' || side === 'bottom'
    ? { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0' }[align]
    : { start: 'top-0', center: 'top-1/2 -translate-y-1/2', end: 'bottom-0' }[align]
  return `${sideClass} ${alignClass}`
}

const menuKey = <Item extends string>(model: Model, items: ReadonlyArray<Item>, itemToConfig: (item: Item) => DropdownMenuItemConfig, key: string): Message | undefined => {
  const parentIndex = Option.getOrUndefined(model.openSubmenuIndex)
  const parent = parentIndex === undefined ? undefined : items[parentIndex]
  const submenu = parent === undefined ? undefined : itemToConfig(parent).submenu
  if (submenu !== undefined) {
    const children = submenu.items.map((item, index) => ({ item, index, config: submenu.itemToConfig(item) })).filter(entry => entry.config.isDisabled !== true)
    const currentChild = Math.max(0, children.findIndex(entry => entry.index === model.activeSubmenuIndex))
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const delta = key === 'ArrowDown' ? 1 : -1
      return ActivatedSubmenuItem({ index: children[(currentChild + delta + children.length) % Math.max(1, children.length)]?.index ?? 0 })
    }
    if (key === 'Home') return ActivatedSubmenuItem({ index: children[0]?.index ?? 0 })
    if (key === 'End') return ActivatedSubmenuItem({ index: children.at(-1)?.index ?? 0 })
    if (key === 'ArrowLeft') return ClosedSubmenu()
    if (key === 'Enter' || key === ' ') {
      const child = submenu.items[model.activeSubmenuIndex]
      return child === undefined ? undefined : SelectedItem({ item: child, index: model.activeSubmenuIndex })
    }
  }
  const enabled = items.map((item, index) => ({ item, index, config: itemToConfig(item) })).filter(entry => entry.config.isDisabled !== true)
  const current = Math.max(0, enabled.findIndex(entry => entry.index === model.activeIndex))
  if (key === 'Escape') return Closed()
  if (key === 'Home') return ActivatedItem({ index: enabled[0]?.index ?? 0 })
  if (key === 'End') return ActivatedItem({ index: enabled.at(-1)?.index ?? 0 })
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const delta = key === 'ArrowDown' ? 1 : -1
    return ActivatedItem({ index: enabled[(current + delta + enabled.length) % Math.max(1, enabled.length)]?.index ?? 0 })
  }
  const active = items[model.activeIndex]
  if (active === undefined) return undefined
  const config = itemToConfig(active)
  if (key === 'ArrowRight' && config.submenu !== undefined) return OpenedSubmenu({ index: model.activeIndex })
  if (key === 'ArrowLeft') return ClosedSubmenu()
  if ((key === 'Enter' || key === ' ') && config.submenu === undefined && config.isDisabled !== true) return SelectedItem({ item: active, index: model.activeIndex })
  return undefined
}

export const dropdownMenu = <Item extends string, Msg>(props: DropdownMenuProps<Item, Msg>): Html => {
  const h = html<Msg>()
  const keyMessage = (key: string) => {
    const message = menuKey(props.model, props.items, props.itemToConfig, key)
    return message === undefined ? Option.none() : Option.some(props.toParentMessage(message))
  }

  const renderItem = (item: string, index: number, config: DropdownMenuItemConfig, isSubmenu = false): Html => {
    const active = isSubmenu ? props.model.activeSubmenuIndex === index - props.items.length : props.model.activeIndex === index
    const checked = config.isChecked ?? false
    const role = config.kind === 'checkbox' ? 'menuitemcheckbox' : config.kind === 'radio' ? 'menuitemradio' : config.submenu === undefined ? 'menuitem' : 'menuitem'
    return h.div(
      [
        h.Role(role), h.Tabindex(active ? 0 : -1), h.DataAttribute('active', String(active)),
        ...(config.kind === 'checkbox' || config.kind === 'radio' ? [h.AriaChecked(checked)] : []),
        ...(config.isDisabled === true ? [h.AriaDisabled(true), h.DataAttribute('disabled', '')] : []),
        ...(config.submenu === undefined ? [] : [h.AriaHasPopup('menu'), h.AriaExpanded(Option.contains(props.model.openSubmenuIndex, index))]),
        ...(config.isDisabled === true ? [] : [h.OnMouseEnter(props.toParentMessage(isSubmenu ? ActivatedSubmenuItem({ index: index - props.items.length }) : config.submenu === undefined ? ActivatedItem({ index }) : OpenedSubmenu({ index })))]),
        ...(config.isDisabled === true || config.submenu !== undefined ? [] : [h.OnClick(props.toParentMessage(SelectedItem({ item, index })))]),
        h.Class(cn(ITEM_CLASS, config.isInset ? 'pl-8' : undefined, config.variant === 'destructive' ? 'text-destructive data-[active=true]:bg-destructive/10' : undefined)),
      ],
      [
        ...(config.kind === 'checkbox' || config.kind === 'radio' ? [h.span([h.Class('absolute left-2 flex size-3.5 items-center justify-center')], [checked ? (config.kind === 'checkbox' ? Icon.check<Msg>({ class: 'size-4' }) : Icon.circleIcon<Msg>({ class: 'size-2 fill-current' })) : ''])] : []),
        ...(config.icon === undefined ? [] : [config.icon]), h.span([h.Class('flex-1')], [config.label]),
        ...(config.shortcut === undefined ? [] : [h.span([h.Class('ml-auto text-xs tracking-widest text-muted-foreground')], [config.shortcut])]),
        ...(config.submenu === undefined ? [] : [Icon.chevronRight<Msg>({ class: 'ml-auto size-4' })]),
        ...(config.submenu === undefined || !Option.contains(props.model.openSubmenuIndex, index) ? [] : [
          h.div([h.Role('menu'), h.AriaLabel(`${typeof config.label === 'string' ? config.label : 'Submenu'} submenu`), h.Class(SUBMENU_CLASS)], config.submenu.items.map((child, childIndex) => renderItem(child, props.items.length + childIndex, config.submenu?.itemToConfig(child) ?? { label: child }, true))),
        ]),
      ],
    )
  }

  const grouped: Array<Html> = []
  let previousGroup: string | undefined
  props.items.forEach((item, index) => {
    const config = props.itemToConfig(item)
    if (config.group !== previousGroup) {
      if (grouped.length > 0) grouped.push(h.div([h.Role('separator'), h.Class('-mx-1 my-1 h-px bg-border')], []))
      if (config.group !== undefined) grouped.push(h.div([h.Class('px-2 py-1.5 text-sm font-medium')], [config.group]))
      previousGroup = config.group
    }
    grouped.push(renderItem(item, index, config))
  })

  return h.div([h.DataAttribute('slot', 'dropdown-menu'), h.Class('relative inline-flex')], [
    h.button([
      h.Type('button'), h.AriaHasPopup('menu'), h.AriaExpanded(props.model.isOpen), h.OnClick(props.toParentMessage(props.model.isOpen ? Closed() : Opened())),
      ...(props.openOnContextMenu === true ? [h.OnContextMenu(props.toParentMessage(Opened()))] : []),
      h.DataAttribute('slot', 'dropdown-menu-trigger'), ...(props.triggerClass === undefined ? [] : [h.Class(props.triggerClass)]),
      h.OnKeyDownPreventDefault(key => key === 'ArrowDown' || key === 'Enter' || key === ' ' ? Option.some(props.toParentMessage(props.model.isOpen ? (menuKey(props.model, props.items, props.itemToConfig, key) ?? Opened()) : Opened())) : Option.none()),
    ], [props.trigger]),
    ...(props.model.isOpen ? [
      h.button([h.Type('button'), h.AriaLabel('Close menu'), h.OnClick(props.toParentMessage(Closed())), h.Class('fixed inset-0 z-40 cursor-default')], []),
      h.div([h.Role('menu'), h.AriaLabel(props.ariaLabel ?? 'Menu'), h.Tabindex(0), h.OnKeyDownPreventDefault(keyMessage), h.DataAttribute('slot', 'dropdown-menu-content'), h.Class(cn(CONTENT_CLASS, positionClass(props.side ?? 'bottom', props.align ?? 'start')))], grouped),
    ] : []),
  ])
}
