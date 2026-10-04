/* Ported from Meta Astryx SideNav (packages/core/src/SideNav/) — examples and visual spec adapted to Crease UI tokens. */

import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineView } from 'foldkit/submodel'
import { Option } from 'effect'

import * as Icon from '@/lib/icon'
import * as NavMenu from '@/lib/nav-menu'
import * as SideNavLib from '@/lib/side-nav'
import { cn } from '@/lib/utils'

export {
  Message,
  Model,
  OutMessage,
  HEADING_MENU_KEY,
  flyoutKey,
  init,
  isItemCollapsed,
  menuFor,
  update,
  visibleWidth,
} from '@/lib/side-nav'
export type { InitConfig } from '@/lib/side-nav'

// ---------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------

export type SideNavItemData = Readonly<{
  id: string
  label: string
  icon?: string
  /** Icon shown instead of `icon` while the item is selected (astryx selectedIcon). */
  selectedIcon?: string
  isSelected?: boolean
  isDisabled?: boolean
  href?: string
  /** Invoked for items without href — emits SelectedSideNavItem. */
  onSelect?: boolean
  endContent?: Html
  actions?: Html
  /** Nested items. Presence makes the item collapsible. */
  children?: ReadonlyArray<SideNavItemData>
  defaultCollapsed?: boolean
  /** When false, a parent row with a primary action collapses its children
      directly instead of rendering a split expand toggle (astryx
      hasIndependentToggle). Defaults to true. */
  independentToggle?: boolean
}>

export type SideNavMenuItemData = Readonly<{
  label: string
  href?: string
  onSelect?: boolean
  icon?: string
  isDisabled?: boolean
}>

export type SideNavHeadingData = Readonly<{
  heading: string
  icon?: Html
  headingHref?: string
  superheading?: string
  superheadingHref?: string
  subheading?: string
  subheadingHref?: string
  headerEndContent?: Html
  menu?: ReadonlyArray<SideNavMenuItemData>
}>

export type SideNavSectionData = Readonly<{
  title?: string
  subtitle?: string
  isHeaderHidden?: boolean
  endContent?: Html
  items: ReadonlyArray<SideNavItemData>
}>

export type ViewInputs = Readonly<{
  /** Bare top-level items (astryx SideNav children outside a Section). */
  items?: ReadonlyArray<SideNavItemData>
  sections?: ReadonlyArray<SideNavSectionData>
  heading?: SideNavHeadingData
  topContent?: Html
  footer?: Html
  /** Small icon cluster beside the collapse button (astryx footerIcons). */
  footerIcons?: Html
  /** Show the collapse affordance; requires the model to be collapsible. */
  hasCollapseButton?: boolean
  /** Render the collapse control inside the footer icon row — the astryx
      footerIcons={<SideNavCollapseButton/>} slot. */
  footerCollapseButton?: boolean
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
  direction?: 'ltr' | 'rtl'
  class?: string
}>

// ---------------------------------------------------------------------------
// Classes (astryx navItemStyles: px-2 gap-2 radius-element, overlay-hover)
// ---------------------------------------------------------------------------

const NAV_CLASS =
  'relative box-border flex h-full shrink-0 flex-col overflow-clip bg-muted/50 text-foreground outline-none transition-[width] duration-300 ease-out'

const ITEM_BASE =
  'group/sidenav-item relative box-border flex w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm text-foreground outline-none transition-colors duration-150 select-none'

const ITEM_INTERACTIVE =
  'hover:bg-accent focus-visible:bg-accent data-[selected]:bg-accent data-[selected]:font-medium data-[selected]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground/50 data-[selected]:hover:bg-accent'

const ITEM_ICON = 'size-4 shrink-0 text-muted-foreground'

const CHEVRON_CLASS =
  'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 rtl:-scale-x-100'

const EXPAND_TOGGLE_CLASS =
  'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50'

const COLLAPSED_FLYOUT_CLASS =
  'z-50 box-border flex max-h-[min(70vh,480px)] min-w-44 max-w-64 flex-col gap-0.5 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none'

const FLYOUT_HEADER_CLASS =
  'px-2 pt-1.5 pb-1 text-xs font-semibold text-muted-foreground'

const FLYOUT_ITEM_CLASS =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors duration-150 hover:bg-accent focus-visible:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

const SIZE_CLASS: Record<string, string> = {
  sm: 'h-7 text-sm',
  md: 'h-8 text-sm',
  lg: 'h-9 text-sm',
}

const SECTION_TITLE_CLASS =
  'truncate text-xs leading-4 font-semibold text-muted-foreground'
const SECTION_SUBTITLE_CLASS =
  'truncate text-xs leading-4 text-muted-foreground'

const scrollableClass = (collapsed: boolean): string =>
  cn(
    'box-border flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-1',
    collapsed && 'items-center px-0',
  )

const railItemClass = (size: 'sm' | 'md' | 'lg'): string =>
  cn(
    ITEM_BASE,
    ITEM_INTERACTIVE,
    'size-8 shrink-0 justify-center gap-0 px-0',
    size === 'lg' && 'size-9',
  )

// ---------------------------------------------------------------------------
// Anchor positioning (same CSS anchor contract as dropdown-menu)
// ---------------------------------------------------------------------------

type AnchorSide = 'top' | 'bottom' | 'start' | 'end'

const anchorPositionStyle = (
  anchorId: string,
  side: AnchorSide,
  options: Readonly<{ coverTrigger?: boolean; gap?: string }> = {},
): Record<string, string> => {
  const gap = options.gap ?? '0.25rem'
  const cover = options.coverTrigger === true
  const horizontal = side === 'start' || side === 'end'
  const sideInset =
    side === 'end'
      ? { left: cover ? 'anchor(left)' : `calc(anchor(right) + ${gap})` }
      : side === 'start'
        ? { right: cover ? 'anchor(right)' : `calc(anchor(left) + ${gap})` }
        : side === 'bottom'
          ? { top: cover ? 'anchor(top)' : `calc(anchor(bottom) + ${gap})` }
          : { bottom: cover ? 'anchor(bottom)' : `calc(anchor(top) + ${gap})` }
  const alignInset = horizontal
    ? { top: cover ? 'anchor(top)' : `calc(anchor(top) - ${gap})` }
    : {
        left: cover
          ? 'anchor(left)'
          : `min(anchor(left), calc(anchor(right) - 100%))`,
      }
  return {
    position: 'fixed',
    positionAnchor: anchorId,
    ...sideInset,
    ...alignInset,
    positionTry: horizontal ? 'flip-block' : 'flip-inline',
    maxHeight: 'calc(100vh - 8px)',
    overflowY: 'auto',
    ...(cover ? {} : { width: 'max-content' }),
  }
}

// ---------------------------------------------------------------------------
// View helpers
// ---------------------------------------------------------------------------

const sectionHeadingDomId = (navId: string, index: number): string =>
  `${navId}-section-${index}-heading`

const itemDomId = (navId: string, itemId: string): string =>
  `${navId}-item-${itemId}`

const itemChildrenDomId = (navId: string, itemId: string): string =>
  `${navId}-item-${itemId}-children`

const iconFor = (item: SideNavItemData): string | undefined =>
  item.isSelected === true && item.selectedIcon !== undefined
    ? item.selectedIcon
    : item.icon

const itemIsActionable = (item: SideNavItemData): boolean =>
  item.href !== undefined || item.onSelect === true

/** astryx: items without icons render nothing in the collapsed rail. */
const itemVisibleInRail = (item: SideNavItemData): boolean =>
  iconFor(item) !== undefined

const renderMenuItems = <Msg>(
  items: ReadonlyArray<SideNavMenuItemData>,
  emitMenu: (message: NavMenu.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] =>
  items.map(item => {
    const disabled = item.isDisabled === true
    const attrs = [
      h.Class(FLYOUT_ITEM_CLASS),
      ...(disabled ? [h.DataAttribute('disabled', 'true')] : []),
      ...(!disabled && item.href === undefined && item.onSelect !== true
        ? [h.Role('menuitem'), h.Tabindex(-1)]
        : []),
      ...(item.href === undefined && item.onSelect === true && !disabled
        ? [
            h.Role('menuitem'),
            h.Tabindex(-1),
            h.OnClick(emitMenu(NavMenu.Message.SelectedNavMenuItem())),
          ]
        : []),
    ]
    const children = [
      ...(item.icon === undefined
        ? []
        : [Icon.icon(item.icon, { class: ITEM_ICON }, h)]),
      h.span([h.Class('truncate')], [item.label]),
    ]
    return item.href === undefined || disabled
      ? h.button(
          [
            h.Type('button'),
            ...(item.href !== undefined && disabled
              ? [h.Role('menuitem'), h.Tabindex(-1), h.AriaDisabled(true)]
              : []),
            ...attrs,
          ],
          children,
        )
      : h.a([h.Href(item.href), h.Role('menuitem'), ...attrs], children)
  })

const renderFlyoutItems = <Msg>(
  items: ReadonlyArray<SideNavItemData>,
  emitMenu: (message: NavMenu.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] =>
  items.map(item => {
    const disabled = item.isDisabled === true
    const attrs = [
      h.Class(FLYOUT_ITEM_CLASS),
      ...(disabled
        ? [h.DataAttribute('disabled', 'true'), h.AriaDisabled(true)]
        : []),
      ...(item.onSelect === true && !disabled
        ? [h.OnClick(emitMenu(NavMenu.Message.SelectedNavMenuItem()))]
        : []),
    ]
    const children = [
      h.span([h.Class('truncate')], [item.label]),
      ...(item.endContent === undefined ? [] : [item.endContent]),
    ]
    return item.href === undefined
      ? h.button([h.Type('button'), ...attrs], children)
      : h.a([h.Href(item.href), ...attrs], children)
  })

const flyoutPanel = <Msg>(
  model: SideNavLib.Model,
  key: string,
  anchorId: string,
  options: Readonly<{
    side: AnchorSide
    coverTrigger?: boolean
    headerLabel?: string
    role?: 'menu' | 'listbox'
    items: Html[]
  }>,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html[] => {
  const menu = SideNavLib.menuFor(model, key)
  if (!NavMenu.isOpen(menu)) {
    return []
  }
  const emitMenu = (message: NavMenu.Message): Msg =>
    emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }))
  const panelId = NavMenu.panelDomId(`${model.id}-${key}`)
  return [
    h.div(
      [
        h.Id(panelId),
        h.Class(COLLAPSED_FLYOUT_CLASS),
        h.Role(options.role ?? 'menu'),
        h.Style(anchorPositionStyle(anchorId, options.side, options)),
        h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuPanel())),
        h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuPanel())),
        h.OnKeyDownPreventDefault(key =>
          key === 'Escape'
            ? Option.some(emitMenu(NavMenu.Message.PressedEscapeNavMenu()))
            : Option.none(),
        ),
      ],
      [
        ...(options.headerLabel === undefined
          ? []
          : [h.div([h.Class(FLYOUT_HEADER_CLASS)], [options.headerLabel])]),
        ...options.items,
      ],
    ),
  ]
}

// ---------------------------------------------------------------------------
// Item rendering
// ---------------------------------------------------------------------------

const renderItem = <Msg>(
  model: SideNavLib.Model,
  item: SideNavItemData,
  level: number,
  size: 'sm' | 'md' | 'lg',
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
  direction: 'ltr' | 'rtl',
): Html => {
  const collapsed = model.isCollapsed
  const hasChildren = item.children !== undefined && item.children.length > 0
  const isSelected = item.isSelected === true
  const isDisabled = item.isDisabled === true
  const icon = iconFor(item)
  const childrenCollapsed = SideNavLib.isItemCollapsed(
    model,
    item.id,
    item.defaultCollapsed ?? false,
  )

  // Collapsed rail: icon-only rows, flyout for parents, tooltip text via title.
  if (collapsed) {
    if (!itemVisibleInRail(item)) {
      return h.div([], [])
    }
    const key = SideNavLib.flyoutKey(item.id)
    const menu = SideNavLib.menuFor(model, key)
    const anchorId = `--${model.id}-${item.id}-anchor`
    const emitMenu = (message: NavMenu.Message): Msg =>
      emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }))
    const triggerAttrs = [
      h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
      h.Class(railItemClass(size)),
      h.Style({ anchorName: anchorId } as Record<string, string>),
      h.AriaLabel(item.label),
      h.DataAttribute('selected', isSelected ? 'true' : 'false'),
      ...(isDisabled
        ? [h.DataAttribute('disabled', 'true'), h.AriaDisabled(true)]
        : []),
      ...(hasChildren
        ? [
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.AriaControls(NavMenu.panelDomId(`${model.id}-${key}`)),
            h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuTrigger())),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_type, button, _sx, _sy, timeStamp) =>
              button === 0 && !isDisabled
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(key =>
              (key === 'Enter' || key === ' ') && !isDisabled
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : [
            ...(item.href !== undefined || item.onSelect === true
              ? [
                  ...(item.onSelect === true && item.href === undefined
                    ? [
                        h.OnClick(
                          emit(
                            SideNavLib.Message.PressedSideNavItemAction({
                              id: item.id,
                            }),
                          ),
                        ),
                      ]
                    : []),
                ]
              : []),
          ]),
    ]
    const iconEl = Icon.icon(icon ?? 'file', { class: ITEM_ICON }, h)
    const trigger =
      !hasChildren && item.href !== undefined && !isDisabled
        ? h.a([h.Href(item.href), ...triggerAttrs], [iconEl])
        : h.button([h.Type('button'), ...triggerAttrs], [iconEl])
    return h.div(
      [h.Class('relative flex flex-col items-center')],
      [
        trigger,
        ...(hasChildren
          ? flyoutPanel(
              model,
              key,
              anchorId,
              {
                side: 'end',
                headerLabel: item.label,
                items: renderFlyoutItems(item.children ?? [], emitMenu, h),
              },
              emit,
              h,
            )
          : []),
      ],
    )
  }

  // Expanded mode.
  const isActionable = itemIsActionable(item)
  const independentToggle =
    hasChildren && isActionable && (item.independentToggle ?? true)
  const childrenId = itemChildrenDomId(model.id, item.id)

  const primaryAttrs = [
    h.Class(cn(ITEM_BASE, ITEM_INTERACTIVE, SIZE_CLASS[size])),
    h.DataAttribute('selected', isSelected ? 'true' : 'false'),
    ...(isDisabled
      ? [h.DataAttribute('disabled', 'true'), h.AriaDisabled(true)]
      : []),
    ...(isSelected ? [h.AriaCurrent('page')] : []),
    ...(hasChildren && !independentToggle
      ? [h.AriaExpanded(!childrenCollapsed), h.AriaControls(childrenId)]
      : []),
  ]
  const onPrimaryPress: Option.Option<Msg> =
    hasChildren && !isActionable
      ? Option.some(
          emit(
            SideNavLib.Message.ToggledSideNavItem({
              id: item.id,
              isCollapsed: !childrenCollapsed,
            }),
          ),
        )
      : hasChildren && !independentToggle
        ? Option.some(
            emit(
              SideNavLib.Message.ToggledSideNavItem({
                id: item.id,
                isCollapsed: !childrenCollapsed,
              }),
            ),
          )
        : item.onSelect === true && item.href === undefined
          ? Option.some(
              emit(
                SideNavLib.Message.PressedSideNavItemAction({ id: item.id }),
              ),
            )
          : Option.none()

  const label = h.span([h.Class('min-w-0 flex-1 truncate')], [item.label])
  const primaryChildren = [
    ...(icon === undefined ? [] : [Icon.icon(icon, { class: ITEM_ICON }, h)]),
    label,
    ...(item.endContent === undefined ? [] : [item.endContent]),
  ]
  const primary =
    item.href !== undefined && !isDisabled
      ? h.a(
          [
            h.Href(item.href),
            ...primaryAttrs,
            ...Option.match(onPrimaryPress, {
              onNone: () => [],
              onSome: msg => [h.OnClick(msg)],
            }),
          ],
          primaryChildren,
        )
      : h.button(
          [
            h.Type('button'),
            ...primaryAttrs,
            ...(isDisabled ? [h.Disabled(true)] : []),
            ...Option.match(onPrimaryPress, {
              onNone: () => [],
              onSome: msg => [h.OnClick(msg)],
            }),
          ],
          primaryChildren,
        )

  const chevron = Icon.icon('chevron-right', { class: CHEVRON_CLASS }, h)
  const expandToggle =
    independentToggle && !isDisabled
      ? h.button(
          [
            h.Type('button'),
            h.Class(EXPAND_TOGGLE_CLASS),
            h.AriaLabel(`Toggle ${item.label}`),
            h.AriaExpanded(!childrenCollapsed),
            h.AriaControls(childrenId),
            h.OnClick(
              emit(
                SideNavLib.Message.ToggledSideNavItem({
                  id: item.id,
                  isCollapsed: !childrenCollapsed,
                }),
              ),
            ),
          ],
          [chevron],
        )
      : undefined

  const row =
    independentToggle || item.actions !== undefined
      ? h.div(
          [
            h.Class(
              'group/sidenav-row flex w-full items-center gap-1 rounded-md',
            ),
          ],
          [
            h.div([h.Class('min-w-0 flex-1')], [primary]),
            ...(expandToggle === undefined ? [] : [expandToggle]),
            ...(item.actions === undefined ? [] : [item.actions]),
          ],
        )
      : primary

  const indentPx = 8 + level * 24
  const childrenRegion =
    hasChildren && !childrenCollapsed
      ? h.div(
          [h.Id(childrenId), h.Class('flex flex-col gap-0.5'), h.Role('group')],
          (item.children ?? []).map(child =>
            renderItem(model, child, level + 1, size, emit, h, direction),
          ),
        )
      : hasChildren
        ? h.div([h.Id(childrenId), h.Class('hidden')], [])
        : undefined

  return h.div(
    [
      h.Id(itemDomId(model.id, item.id)),
      h.Class('box-border flex w-full flex-col'),
    ],
    [
      h.div(
        [
          h.Class('w-full'),
          h.Style(
            level > 0
              ? ({ paddingInlineStart: `${indentPx}px` } as Record<
                  string,
                  string
                >)
              : {},
          ),
        ],
        [row],
      ),
      ...(childrenRegion === undefined ? [] : [childrenRegion]),
    ],
  )
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

const renderHeading = <Msg>(
  model: SideNavLib.Model,
  heading: SideNavHeadingData,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const collapsed = model.isCollapsed
  const hasMenu = heading.menu !== undefined && heading.menu.length > 0
  const key = SideNavLib.HEADING_MENU_KEY
  const menu = SideNavLib.menuFor(model, key)
  const anchorId = `--${model.id}-heading-anchor`
  const emitMenu = (message: NavMenu.Message): Msg =>
    emit(SideNavLib.Message.GotSideNavMenuMessage({ key, message }))

  const iconEl =
    heading.icon === undefined
      ? undefined
      : h.span(
          [
            h.Class(
              'flex size-6 shrink-0 items-center justify-center [&_svg]:size-5',
            ),
          ],
          [heading.icon],
        )

  const headingText = h.span(
    [h.Class('truncate text-[17px] leading-6 font-semibold text-foreground')],
    [heading.heading],
  )

  if (collapsed) {
    // Rail mode: icon only; menu (if any) still works on hover/click; label
    // carried by aria-label (astryx renders a Tooltip).
    const triggerChildren = [
      ...(iconEl === undefined
        ? [
            h.span(
              [h.Class('text-[17px] font-semibold')],
              [heading.heading.slice(0, 1)],
            ),
          ]
        : [iconEl]),
    ]
    const triggerAttrs = [
      h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
      h.Class(
        cn(
          'flex size-8 cursor-pointer items-center justify-center rounded-md outline-none transition-colors duration-150 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
        ),
      ),
      h.AriaLabel(heading.heading),
      ...(hasMenu
        ? [
            h.Style({ anchorName: anchorId } as Record<string, string>),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuTrigger())),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : []),
    ]
    const trigger =
      !hasMenu && heading.headingHref !== undefined
        ? h.a([h.Href(heading.headingHref), ...triggerAttrs], triggerChildren)
        : h.button([h.Type('button'), ...triggerAttrs], triggerChildren)
    return h.div(
      [h.Class('flex min-h-8 items-center justify-center py-1')],
      [
        trigger,
        ...(hasMenu
          ? flyoutPanel(
              model,
              key,
              anchorId,
              {
                side: 'end',
                items: renderMenuItems(heading.menu ?? [], emitMenu, h),
              },
              emit,
              h,
            )
          : []),
      ],
    )
  }

  // Expanded header: [icon] + text column (+ optional menu trigger).
  const textColumn = h.div(
    [h.Class('flex min-w-0 flex-1 flex-col')],
    [
      ...(heading.superheading === undefined
        ? []
        : [
            heading.superheadingHref === undefined
              ? h.span(
                  [h.Class('truncate text-xs leading-4 text-muted-foreground')],
                  [heading.superheading],
                )
              : h.a(
                  [
                    h.Href(heading.superheadingHref),
                    h.Class(
                      'truncate text-xs leading-4 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm',
                    ),
                  ],
                  [heading.superheading],
                ),
          ]),
      heading.headingHref === undefined
        ? headingText
        : h.a(
            [
              h.Href(heading.headingHref),
              h.Class(
                'truncate rounded-sm text-[17px] leading-6 font-semibold text-foreground outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50',
              ),
            ],
            [heading.heading],
          ),
      ...(heading.subheading === undefined
        ? []
        : [
            heading.subheadingHref === undefined
              ? h.span(
                  [h.Class('truncate text-xs leading-4 text-muted-foreground')],
                  [heading.subheading],
                )
              : h.a(
                  [
                    h.Href(heading.subheadingHref),
                    h.Class(
                      'truncate text-xs leading-4 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm',
                    ),
                  ],
                  [heading.subheading],
                ),
          ]),
    ],
  )

  const chevronButton =
    hasMenu && heading.headingHref !== undefined
      ? h.button(
          [
            h.Type('button'),
            h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
            h.Class(EXPAND_TOGGLE_CLASS),
            h.AriaLabel('More options'),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.Style({ anchorName: anchorId } as Record<string, string>),
            h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuTrigger())),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ],
          [
            h.span(
              [
                h.Class(
                  NavMenu.isOpen(menu)
                    ? 'flex rotate-180 transition-transform duration-150'
                    : 'flex transition-transform duration-150',
                ),
              ],
              [Icon.icon('chevron-down', { class: 'size-4' }, h)],
            ),
          ],
        )
      : undefined

  // No links anywhere: the whole header is the trigger (astryx's automatic
  // trigger boundary).
  const wholeHeaderTrigger = hasMenu && chevronButton === undefined

  const headerRow = h.div(
    [
      h.Class(
        cn(
          'flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left outline-none',
          wholeHeaderTrigger &&
            'cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
        ),
      ),
      ...(wholeHeaderTrigger
        ? [
            h.Id(NavMenu.triggerDomId(`${model.id}-${key}`)),
            h.Role('button'),
            h.Tabindex(0),
            h.AriaHasPopup('menu'),
            h.AriaExpanded(NavMenu.isOpen(menu)),
            h.Style({ anchorName: anchorId } as Record<string, string>),
            h.OnMouseEnter(emitMenu(NavMenu.Message.EnteredNavMenuTrigger())),
            h.OnMouseLeave(emitMenu(NavMenu.Message.LeftNavMenuTrigger())),
            h.OnPointerDown((_t, button, _x, _y, timeStamp) =>
              button === 0
                ? Option.some(
                    emitMenu(
                      NavMenu.Message.PressedNavMenuTrigger({
                        atMs: timeStamp,
                      }),
                    ),
                  )
                : Option.none(),
            ),
            h.OnKeyDownPreventDefault(k =>
              k === 'Enter' || k === ' '
                ? Option.some(
                    emitMenu(NavMenu.Message.ActivatedNavMenuTrigger()),
                  )
                : Option.none(),
            ),
          ]
        : []),
    ],
    [
      ...(iconEl === undefined ? [] : [iconEl]),
      textColumn,
      ...(chevronButton === undefined ? [] : [chevronButton]),
      ...(heading.headerEndContent === undefined
        ? []
        : [heading.headerEndContent]),
    ],
  )

  return h.div(
    [h.Class('flex flex-col gap-1 px-0 py-1')],
    [
      headerRow,
      ...(hasMenu
        ? flyoutPanel(
            model,
            key,
            anchorId,
            {
              side: 'bottom',
              coverTrigger: true,
              items: renderMenuItems(heading.menu ?? [], emitMenu, h),
            },
            emit,
            h,
          )
        : []),
    ],
  )
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const renderSection = <Msg>(
  model: SideNavLib.Model,
  section: SideNavSectionData,
  index: number,
  size: 'sm' | 'md' | 'lg',
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
  direction: 'ltr' | 'rtl',
): Html => {
  const collapsed = model.isCollapsed
  const headingId = sectionHeadingDomId(model.id, index)
  const header =
    section.title === undefined
      ? undefined
      : h.div(
          [
            h.Id(headingId),
            h.Class(
              collapsed || section.isHeaderHidden === true
                ? 'sr-only'
                : 'flex min-h-6 items-center justify-between gap-2 px-2 pt-3 pb-1',
            ),
          ],
          [
            h.div(
              [h.Class('flex min-w-0 flex-col')],
              [
                h.span([h.Class(SECTION_TITLE_CLASS)], [section.title]),
                ...(section.subtitle === undefined
                  ? []
                  : [
                      h.span(
                        [h.Class(SECTION_SUBTITLE_CLASS)],
                        [section.subtitle],
                      ),
                    ]),
              ],
            ),
            ...(section.endContent === undefined ? [] : [section.endContent]),
          ],
        )
  return h.div(
    [
      h.Class('flex w-full flex-col'),
      h.Role('group'),
      ...(section.title === undefined ? [] : [h.AriaLabelledBy(headingId)]),
    ],
    [
      ...(header === undefined ? [] : [header]),
      h.div(
        [
          h.Class(
            cn('flex w-full flex-col gap-0.5', collapsed && 'items-center'),
          ),
        ],
        section.items.map(item =>
          renderItem(model, item, 0, size, emit, h, direction),
        ),
      ),
    ],
  )
}

// ---------------------------------------------------------------------------
// Collapse button + resize handle
// ---------------------------------------------------------------------------

const collapseButton = <Msg>(
  model: SideNavLib.Model,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html =>
  h.button(
    [
      h.Type('button'),
      h.Class(
        'inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
      ),
      h.AriaLabel(
        model.isCollapsed ? 'Expand navigation' : 'Collapse navigation',
      ),
      h.AriaExpanded(!model.isCollapsed),
      h.OnClick(emit(SideNavLib.Message.ToggledSideNav())),
    ],
    [
      h.span(
        [
          h.Class(
            cn(
              'flex transition-transform duration-150',
              model.isCollapsed && 'rotate-180',
            ),
          ),
          h.Dir('ltr'),
        ],
        [Icon.icon('chevron-left', { class: 'size-4' }, h)],
      ),
    ],
  )

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

const render = <Msg>(
  model: SideNavLib.Model,
  viewInputs: ViewInputs,
  emit: (message: SideNavLib.Message) => Msg,
  h: HtmlBuilder<Msg>,
): Html => {
  const collapsed = model.isCollapsed
  const direction = viewInputs.direction ?? 'ltr'
  const size = viewInputs.size ?? 'md'
  const hasCollapseButton =
    viewInputs.hasCollapseButton !== false && model.isCollapsible
  const footerCollapseButton =
    viewInputs.footerCollapseButton === true && model.isCollapsible
  const hasFooterRow =
    hasCollapseButton ||
    footerCollapseButton ||
    viewInputs.footerIcons !== undefined

  const stickyTop =
    viewInputs.heading === undefined && viewInputs.topContent === undefined
      ? undefined
      : h.div(
          [
            h.Class(
              cn(
                'flex shrink-0 flex-col gap-1 px-2 pt-3 pb-1',
                collapsed && 'items-center px-0',
              ),
            ),
          ],
          [
            ...(viewInputs.heading === undefined
              ? []
              : [renderHeading(model, viewInputs.heading, emit, h)]),
            ...(viewInputs.topContent === undefined
              ? []
              : [viewInputs.topContent]),
          ],
        )

  const scrollable = h.div(
    [h.Class(scrollableClass(collapsed))],
    [
      ...(viewInputs.sections ?? []).map((section, index) =>
        renderSection(model, section, index, size, emit, h, direction),
      ),
      ...(viewInputs.items === undefined
        ? []
        : [
            h.div(
              [
                h.Class(
                  cn(
                    'flex w-full flex-col gap-0.5',
                    collapsed && 'items-center',
                  ),
                ),
              ],
              viewInputs.items.map(item =>
                renderItem(model, item, 0, size, emit, h, direction),
              ),
            ),
          ]),
    ],
  )

  const stickyBottom =
    viewInputs.footer === undefined && !hasFooterRow
      ? undefined
      : h.div(
          [
            h.Class(
              cn(
                'flex shrink-0 flex-col gap-1 border-t border-border px-2 py-2',
                collapsed && 'items-center px-0',
              ),
            ),
          ],
          [
            ...(viewInputs.footer === undefined ? [] : [viewInputs.footer]),
            ...(hasFooterRow
              ? [
                  h.div(
                    [
                      h.Class(
                        cn(
                          'flex items-center gap-1',
                          collapsed
                            ? 'flex-col-reverse'
                            : 'flex-row justify-between',
                        ),
                      ),
                    ],
                    [
                      ...(hasCollapseButton
                        ? [collapseButton(model, emit, h)]
                        : []),
                      ...(viewInputs.footerIcons === undefined
                        ? []
                        : [viewInputs.footerIcons]),
                      ...(footerCollapseButton
                        ? [collapseButton(model, emit, h)]
                        : []),
                    ],
                  ),
                ]
              : []),
          ],
        )

  const resizeHandle = !model.isResizable
    ? undefined
    : h.div(
        [
          h.Class(
            cn(
              'absolute inset-y-0 z-10 w-1.5 cursor-col-resize touch-none outline-none transition-colors hover:bg-primary/20 focus-visible:bg-primary/30',
              direction === 'rtl' ? 'left-0' : 'right-0',
            ),
          ),
          h.Role('separator'),
          h.AriaOrientation('vertical'),
          h.AriaValuenow(SideNavLib.visibleWidth(model)),
          h.AriaValuemin(model.minWidth),
          h.AriaValuemax(model.maxWidth),
          h.OnPointerDown((pointerType, button, _sx, screenX) =>
            button === 0 || pointerType !== 'mouse'
              ? Option.some(
                  emit(SideNavLib.Message.StartedSideNavResize({ x: screenX })),
                )
              : Option.none(),
          ),
          h.OnPointerMove(screenX =>
            Option.isSome(model.drag)
              ? Option.some(
                  emit(
                    SideNavLib.Message.DraggedSideNavResize({
                      x: screenX,
                      direction,
                    }),
                  ),
                )
              : Option.none(),
          ),
          h.OnPointerUp(() =>
            Option.some(emit(SideNavLib.Message.EndedSideNavResize())),
          ),
          h.OnKeyDownPreventDefault(key => {
            const step = 16
            const delta =
              key === 'ArrowRight'
                ? direction === 'rtl'
                  ? -step
                  : step
                : key === 'ArrowLeft'
                  ? direction === 'rtl'
                    ? step
                    : -step
                  : 0
            return delta === 0
              ? Option.none()
              : Option.some(
                  emit(SideNavLib.Message.NudgedSideNavResize({ delta })),
                )
          }),
        ],
        [],
      )

  return h.nav(
    [
      h.Class(cn(NAV_CLASS, viewInputs.class)),
      h.AriaLabel(viewInputs.ariaLabel ?? 'Primary'),
      h.Dir(direction),
      h.Style(
        model.isResizable && !collapsed
          ? ({ width: `${model.width}px` } as Record<string, string>)
          : {},
      ),
      h.DataAttribute('collapsed', collapsed ? 'true' : 'false'),
      h.DataAttribute('slot', 'side-nav'),
    ],
    [
      ...(stickyTop === undefined ? [] : [stickyTop]),
      scrollable,
      ...(stickyBottom === undefined ? [] : [stickyBottom]),
      ...(resizeHandle === undefined ? [] : [resizeHandle]),
    ],
  )
}

/** Canonical stateful view. Embed with `h.submodel`. */
export const view = defineView<
  SideNavLib.Model,
  SideNavLib.Message,
  ViewInputs
>((model, viewInputs, h) => render(model, viewInputs, message => message, h))

/**
 * Compatibility helper for existing consumers. New code should use
 * `h.submodel({ model, view, viewInputs, toParentMessage, slotId })`.
 */
export type SideNavProps<Msg> = ViewInputs &
  Readonly<{
    model: SideNavLib.Model
    toParentMessage: (message: SideNavLib.Message) => Msg
  }>

export const sideNav = <Msg>(
  props: SideNavProps<Msg>,
  h: HtmlBuilder<Msg>,
): Html => render(props.model, props, props.toParentMessage, h)
