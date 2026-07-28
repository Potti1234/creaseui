import { childAttributes, type Html, html } from 'foldkit/html'
import { Option } from 'effect'

import { Menu as MenuPrimitive } from '@foldkit/ui'

import { cn } from '@/lib/utils'

/* Ported from shadcn/ui dropdown-menu.tsx on top of foldkit's config-driven
   Menu submodel.

   Class strings are shadcn's, with three adaptations:
   - Radix focus state is driven by foldkit's data-active attribute.
   - Radix keyframe animations become finite transitions driven by foldkit's
     data-closed transition phase. Pass isAnimated: true to init.
   - The panel's Radix positioning variables are omitted because foldkit's
     anchor primitive supplies equivalent inline positioning and max-height.

   PORT NOTE: foldkit Menu does not expose per-item attributes. The inset and
   destructive styles are therefore resolved directly into each item's one
   class string, and data-slot/data-inset/data-variant cannot be placed on the
   primitive's outer menuitem element. Group headings expose only content and
   class, so the dropdown-menu-label slot is carried by their inner span. */

export const Model = MenuPrimitive.Model
export type Model = typeof Model.Type
export const Message = MenuPrimitive.Message
export type Message = typeof Message.Type
export const OutMessage = MenuPrimitive.OutMessage
export type OutMessage<Item extends string = string> =
  MenuPrimitive.OutMessage<Item>

export const init = MenuPrimitive.init
export const create = MenuPrimitive.create
export const update = MenuPrimitive.create().update
export const open = MenuPrimitive.create().open
export const close = MenuPrimitive.create().close
export const selectItem = MenuPrimitive.create().selectItem

const CONTENT_CLASS =
  'z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95'

const ITEM_CLASS =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[active]:bg-accent data-[active]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"

const DESTRUCTIVE_ITEM_CLASS =
  'text-destructive data-[active]:bg-destructive/10 data-[active]:text-destructive dark:data-[active]:bg-destructive/20 *:[svg]:text-destructive!'

const LABEL_CLASS = 'px-2 py-1.5 text-sm font-medium'

const SEPARATOR_CLASS = '-mx-1 my-1 h-px bg-border'

const SHORTCUT_CLASS =
  'ml-auto text-xs tracking-widest text-muted-foreground'

const BACKDROP_CLASS = 'fixed inset-0 z-40'

const OPENED_FROM_POINTER: Message = {
  _tag: 'Opened',
  maybeActiveItemIndex: Option.none(),
}

export type DropdownMenuItemConfig = Readonly<{
  label: Html | string
  icon?: Html
  shortcut?: Html | string
  variant?: 'default' | 'destructive'
  isInset?: boolean
  group?: string
}>

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left'
export type DropdownMenuAlign = 'start' | 'center' | 'end'

type Placement = NonNullable<MenuPrimitive.AnchorConfig['placement']>

const PLACEMENTS: Readonly<
  Record<
    DropdownMenuSide,
    Readonly<Record<DropdownMenuAlign, Placement>>
  >
> = {
  top: { start: 'top-start', center: 'top', end: 'top-end' },
  right: { start: 'right-start', center: 'right', end: 'right-end' },
  bottom: { start: 'bottom-start', center: 'bottom', end: 'bottom-end' },
  left: { start: 'left-start', center: 'left', end: 'left-end' },
}

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

const contentHtml = <Msg>(content: Html | string): Html => {
  const h = html<Msg>()

  return typeof content === 'string' ? h.span([], [content]) : content
}

const itemContent = <Msg>(config: DropdownMenuItemConfig): Html => {
  const h = html<Msg>()

  return h.span(
    [h.Class('contents')],
    [
      ...(config.icon === undefined ? [] : [config.icon]),
      config.label,
      ...(config.shortcut === undefined
        ? []
        : [
            h.span(
              [
                h.DataAttribute('slot', 'dropdown-menu-shortcut'),
                h.Class(SHORTCUT_CLASS),
              ],
              [config.shortcut],
            ),
          ]),
    ],
  )
}

export const dropdownMenu = <Item extends string, Msg>(
  props: DropdownMenuProps<Item, Msg>,
): Html => {
  const h = html<Msg>()
  const hm = html<Message>()
  const menu = MenuPrimitive.create<Item>()
  const hasGroups = props.items.some(
    item => props.itemToConfig(item).group !== undefined,
  )
  const placement =
    PLACEMENTS[props.side ?? 'bottom'][props.align ?? 'start']

  return h.submodel({
    slotId: props.model.id,
    model: props.model,
    view: menu.view,
    viewInputs: {
      items: props.items,
      itemToConfig: item => {
        const config = props.itemToConfig(item)

        return {
          className: cn(
            ITEM_CLASS,
            config.isInset ? 'pl-8' : undefined,
            config.variant === 'destructive'
              ? DESTRUCTIVE_ITEM_CLASS
              : undefined,
          ),
          content: itemContent<Message>(config),
        }
      },
      itemToSearchText: item => {
        const label = props.itemToConfig(item).label
        return typeof label === 'string' ? label : item
      },
      buttonContent: contentHtml<Message>(props.trigger),
      ...(props.triggerClass === undefined
        ? {}
        : { buttonClassName: props.triggerClass }),
      buttonAttributes: childAttributes([
        hm.DataAttribute('slot', 'dropdown-menu-trigger'),
        ...(props.openOnContextMenu === true
          ? [
              hm.OnContextMenu(OPENED_FROM_POINTER),
            ]
          : []),
      ]),
      itemsClassName: CONTENT_CLASS,
      itemsAttributes: childAttributes([
        hm.DataAttribute('slot', 'dropdown-menu-content'),
      ]),
      backdropClassName: BACKDROP_CLASS,
      ...(hasGroups
        ? {
            itemGroupKey: (item: Item): string =>
              props.itemToConfig(item).group ?? '',
            groupToHeading: (group: string) =>
              group === ''
                ? undefined
                : {
                    content: hm.span(
                      [hm.DataAttribute('slot', 'dropdown-menu-label')],
                      [group],
                    ),
                    className: LABEL_CLASS,
                  },
            groupAttributes: childAttributes([
              hm.DataAttribute('slot', 'dropdown-menu-group'),
            ]),
            separatorClassName: SEPARATOR_CLASS,
            separatorAttributes: childAttributes([
              hm.DataAttribute('slot', 'dropdown-menu-separator'),
            ]),
          }
        : {}),
      anchor: { placement, gap: 4 },
      attributes: childAttributes([
        hm.DataAttribute('slot', 'dropdown-menu'),
      ]),
      ...(props.ariaLabel === undefined
        ? {}
        : { ariaLabel: props.ariaLabel }),
    },
    toParentMessage: props.toParentMessage,
  })
}

/* PORT NOTE: Submenus, checkbox items, and radio items are not exposed because
   the installed foldkit Menu primitive has no equivalent behavior.

   Minimal wiring:

   type Action = 'profile' | 'delete'
   const ActionMenu = create<Action>()

   // Model: { menu: Model }
   // Message: GotMenuMessage({ message: Message })
   // Init: menu: init({ id: 'account-menu', isAnimated: true })
   //
   // Update:
   // const [menu, commands, maybeOutMessage] =
   //   ActionMenu.update(model.menu, message)
   // Option contains Selected { value: Action, index: number }; selection has
   // already closed the menu.
   //
   // View:
   // dropdownMenu<Action, AppMessage>({
   //   model: model.menu,
   //   toParentMessage: message => GotMenuMessage({ message }),
   //   trigger: 'Open',
   //   items: ['profile', 'delete'],
   //   itemToConfig: item =>
   //     item === 'delete'
   //       ? { label: 'Delete', shortcut: '⌘⌫', variant: 'destructive' }
   //       : { label: 'Profile', shortcut: '⇧⌘P' },
   // })
*/
