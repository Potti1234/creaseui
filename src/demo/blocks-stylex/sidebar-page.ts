import { Match as M, Option, Schema as S } from 'effect'
import type { Update } from 'foldkit'
import { Command } from 'foldkit'
import * as CalendarDate from 'foldkit/calendar'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { data as docs } from '@/demo/blocks/sidebar-01'
import { data as app } from '@/demo/blocks/sidebar-07'
import { data as mail } from '@/demo/blocks/sidebar-09'
import { data as workspace } from '@/demo/blocks/sidebar-10'
import { data as files } from '@/demo/blocks/sidebar-11'
import { data as settings } from '@/demo/blocks/sidebar-13'
import { badge } from '@/stylex/badge'
import { checkbox } from '@/stylex/checkbox'
import { button } from '@/stylex/button'
import * as Calendar from '@/stylex/calendar'
import * as Dialog from '@/stylex/dialog'
import * as Popover from '@/stylex/popover'
import { collapsible } from '@/stylex/collapsible'
import { box, inline, stack, text } from '@/stylex/composition'
import { icon } from '@/stylex/composition/icon'
import {
  settingsLayout,
  blockCenter,
  blockHeader,
  blockLabel,
  blockPage,
  blockSkeleton,
  mailItem,
} from '@/stylex/composition/sidebar-block'
import * as Sidebar from '@/stylex/sidebar'
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from '@/stylex/breadcrumb'
import { separator } from '@/stylex/separator'
import * as stylex from '@stylexjs/stylex'
import * as BaseIcon from '@/lib/icon'
import { className } from '@/stylex/style'
import { complexTokens } from '../../stylex/complex-tokens.stylex'
import { tokens } from '../../stylex/tokens.stylex'
import * as Switch from '@/stylex/switch'
import * as DropdownMenu from '@/stylex/dropdown-menu'

/* Mirrors TW searchForm: form > sidebar-group(py-0) > group-content(relative)
   > sr-only label + sidebarInput(pl-8) + absolutely positioned search icon. */
const searchStyles = stylex.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: 0,
    width: '100%',
    paddingInline: '.5rem',
  },
  box: { position: 'relative', width: '100%' },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  input: { paddingInlineStart: '2rem' },
  icon: {
    position: 'absolute',
    left: '.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.5,
    pointerEvents: 'none',
    userSelect: 'none',
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
  },
  /* TW trigger '-ml-1' / '-mr-1 ml-auto rotate-180' + separator 'mr-2 h-4'. */
  trigger: { marginInlineStart: '-.25rem' },
  rightTrigger: { marginInlineStart: 'auto', marginInlineEnd: '-.25rem' },
  triggerIcon: { transform: 'rotate(180deg)' },
  headerSeparator: { height: '1rem', marginInlineEnd: '.5rem' },
  /* TW collapsible chevrons: 'ml-auto size-4 shrink-0 transition-transform
     rotate-90' (trailing) and 'size-4 shrink-0' (leading, file tree). */
  chevron: {
    marginInlineStart: 'auto',
    flexShrink: 0,
    width: '1rem',
    height: '1rem',
    transitionProperty: 'transform',
    transitionDuration: '.2s',
  },
  chevronLead: {
    flexShrink: 0,
    width: '1rem',
    height: '1rem',
    transitionProperty: 'transform',
    transitionDuration: '.2s',
  },
  chevronOpen: { transform: 'rotate(90deg)' },
  /* TW trigger wrapper 'contents' — StyleX needs an explicit display:contents. */
  contents: { display: 'contents' },
  endIcon: {
    marginInlineStart: 'auto',
    flexShrink: 0,
    width: '1rem',
    height: '1rem',
  },
  /* TW sidebar-06 dropdown trigger: sidebarMenuButtonVariants inside a
     shrink-wrap parent (content width); data-[open] keeps accent. */
  menuTrigger: {
    padding: '0.5rem',
    alignItems: 'center',
    display: 'inline-flex',
    textAlign: 'left',
    height: '2rem',
    width: 'fit-content',
    gap: '0.5rem',
    borderRadius: '.375rem',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': complexTokens.sidebarAccent,
    },
    color: {
      default: complexTokens.sidebarForeground,
      ':hover': complexTokens.sidebarAccentForeground,
    },
  },
  fullWidth: { width: '100%' },
  /* TW-09 nested sidebars: flex-row wrapper inside the 350px icon sidebar —
     rail 'w-[calc(var(--sidebar-width-icon)+1px)] border-r' + 'flex-1' mail. */
  mailRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  mailRail: {
    width: 'calc(var(--sidebar-width-icon) + 1px)',
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: tokens.border,
    backgroundColor: complexTokens.sidebar,
    color: complexTokens.sidebarForeground,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  mailColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    minWidth: 0,
    backgroundColor: complexTokens.sidebar,
    color: complexTokens.sidebarForeground,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  },
  /* TW-09 mail header 'gap-3.5 border-b p-4'. */
  mailHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.875rem',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
    padding: '1rem',
  },
  mailTitleRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mailTitle: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontWeight: 500,
    color: tokens.foreground,
  },
  mailSwitchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    fontSize: '.875rem',
    lineHeight: '1.25rem',
  },
  /* TW-09 mail rows are 'text-sm leading-tight' (14px / 17.5px). */
  mailNameRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '.5rem',
    fontSize: '.875rem',
    lineHeight: 1.25,
  },
  mailDate: {
    marginInlineStart: 'auto',
    fontSize: '.75rem',
    lineHeight: '1rem',
  },
  mailSubject: {
    fontWeight: 500,
    fontSize: '.875rem',
    lineHeight: 1.25,
  },
  /* TW-09 'line-clamp-2 w-[260px] text-xs whitespace-break-spaces'. */
  mailTeaser: {
    fontSize: '.75rem',
    lineHeight: '1rem',
    width: '260px',
    whiteSpace: 'pre-wrap',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  /* TW-09 group 'px-0' — keeps block padding from base p-2. */
  mailGroup: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    paddingBlock: '.5rem',
  },
  /* TW-09 inset header 'sticky top-0 flex shrink-0 items-center gap-2
     border-b bg-background p-4' — padding-sized, not h-16. */
  mailInsetHeader: {
    gap: '.5rem',
    padding: '1rem',
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.border,
    backgroundColor: tokens.background,
    position: 'sticky',
    top: 0,
  },
  menuTriggerOpen: {
    padding: '0.5rem',
    alignItems: 'center',
    display: 'inline-flex',
    textAlign: 'left',
    height: '2rem',
    width: 'fit-content',
    gap: '0.5rem',
    borderRadius: '.375rem',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outlineStyle: 'none',
    cursor: 'pointer',
    backgroundColor: {
      default: complexTokens.sidebarAccent,
      ':hover': complexTokens.sidebarAccent,
    },
    color: complexTokens.sidebarAccentForeground,
  },
})

export const Model = S.Struct({
  isOpen: S.Boolean,
  isMobileOpen: S.Boolean,
  active: S.String,
  query: S.String,
  unreadOnly: S.Boolean,
  expanded: S.Record(S.String, S.Boolean),
  calendar: Calendar.Model,
  selectedDate: S.Option(CalendarDate.CalendarDate),
  dialog: Dialog.Model,
  popover: Popover.Model,
  submenus: S.Array(DropdownMenu.Model),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ToggledStyleXSidebar: {},
  ToggledStyleXMobileSidebar: {},
  SelectedStyleXSidebarItem: { label: S.String },
  ChangedStyleXSidebarSearch: {
    value: S.String,
  },
  ToggledStyleXSidebarUnread: {
    isChecked: S.Boolean,
  },
  ChangedStyleXSidebarGroup: {
    id: S.String,
    isOpen: S.Boolean,
  },
  GotStyleXSidebarCalendar: {
    message: Calendar.Message,
  },
  GotStyleXSidebarDialog: {
    message: Dialog.Message,
  },
  OpenedStyleXSidebarDialog: {},
  GotStyleXSidebarPopover: {
    message: Popover.Message,
  },
  GotStyleXSidebarSubmenu: {
    index: S.Number,
    message: DropdownMenu.Message,
  },
})
export type Message = typeof Message.Type
export const init = (): Model => ({
  isOpen: true,
  isMobileOpen: false,
  active: 'Data Fetching',
  query: '',
  unreadOnly: false,
  expanded: {
    Playground: true,
    'Build Your Application': true,
    src: true,
    'src/ui': true,
  },
  calendar: Calendar.init({
    id: 'stylex-sidebar-calendar',
    today: { year: 2024, month: 10, day: 15 },
  }),
  selectedDate: Option.none(),
  dialog: Dialog.init({
    id: 'stylex-sidebar-settings',
    isAnimated: true,
  }),
  submenus: docs.navMain.map((_, index) =>
    DropdownMenu.init({ id: 'stylex-submenu-' + index }),
  ),
  popover: Popover.init({ id: 'stylex-sidebar-popover' }),
})
type UpdateReturn = Update.Return<Model, Message>
export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledStyleXSidebar: () => ({
        model: { ...model, isOpen: !model.isOpen },
      }),
      ToggledStyleXMobileSidebar: () => ({
        model: { ...model, isMobileOpen: !model.isMobileOpen },
      }),
      SelectedStyleXSidebarItem: ({ label }) => ({
        model: { ...model, active: label },
      }),
      ChangedStyleXSidebarSearch: ({ value }) => ({
        model: { ...model, query: value },
      }),
      ToggledStyleXSidebarUnread: ({ isChecked }) => ({
        model: { ...model, unreadOnly: isChecked },
      }),
      ChangedStyleXSidebarGroup: ({ id, isOpen }) => ({
        model: { ...model, expanded: { ...model.expanded, [id]: isOpen } },
      }),
      GotStyleXSidebarCalendar: ({ message: child }) => {
        const {
          model: calendar,
          commands: calendarCommands__,
          outMessage: calendarOut__,
        } = Calendar.update(model.calendar, child)
        const commands = calendarCommands__ ?? []
        const selection = Option.fromNullishOr(calendarOut__)
        return {
          model: {
            ...model,
            calendar,
            selectedDate: Option.match(selection, {
              onNone: () => model.selectedDate,
              onSome: s =>
                s._tag === 'SelectedDate'
                  ? Option.some(s.date)
                  : model.selectedDate,
            }),
          },
          commands: Command.mapMessages(commands, message =>
            Message['GotStyleXSidebarCalendar']({ message }),
          ),
        }
      },
      GotStyleXSidebarDialog: ({ message: child }) => {
        const { model: dialog, commands: dialogCommands__ } = Dialog.update(
          model.dialog,
          child,
        )
        const commands = dialogCommands__ ?? []
        return {
          model: { ...model, dialog },
          commands: Command.mapMessages(commands, message =>
            Message['GotStyleXSidebarDialog']({ message }),
          ),
        }
      },
      OpenedStyleXSidebarDialog: () => {
        const { model: dialog, commands: dialogCommands__ } = Dialog.open(
          model.dialog,
        )
        const commands = dialogCommands__ ?? []
        return {
          model: { ...model, dialog },
          commands: Command.mapMessages(commands, message =>
            Message['GotStyleXSidebarDialog']({ message }),
          ),
        }
      },
      GotStyleXSidebarSubmenu: ({ index, message: child }) => {
        const current = model.submenus[index]
        if (current === undefined) return { model: model }
        const { model: submenu, commands: submenuCommands__ } =
          DropdownMenu.update(current, child)
        const commands = submenuCommands__ ?? []
        return {
          model: {
            ...model,
            submenus: model.submenus.map((p, i) => (i === index ? submenu : p)),
          },
          commands: Command.mapMessages(commands, message =>
            Message['GotStyleXSidebarSubmenu']({ index, message }),
          ),
        }
      },
      GotStyleXSidebarPopover: ({ message: child }) => {
        const { model: popover, commands: popoverCommands__ } = Popover.update(
          model.popover,
          child,
        )
        const commands = popoverCommands__ ?? []
        return {
          model: { ...model, popover },
          commands: Command.mapMessages(commands, message =>
            Message['GotStyleXSidebarPopover']({ message }),
          ),
        }
      },
    }),
  )

const item = (
  label: string,
  model: Model,
  h: HtmlBuilder<Message>,
  name?: string,
  collapsed = false,
): Html =>
  Sidebar.sidebarMenuItem(
    {
      children: [
        Sidebar.sidebarMenuButton(
          {
            children: [
              ...(name === undefined ? [] : [icon({ name }, h)]),
              ...(collapsed ? [] : [blockLabel(label, h)]),
            ],
            tooltip: label,
            isActive: model.active === label,
            onClick: Message['SelectedStyleXSidebarItem']({ label }),
          },
          h,
        ),
      ],
    },
    h,
  )
const subItems = (
  labels: ReadonlyArray<string>,
  model: Model,
  h: HtmlBuilder<Message>,
  flat = false,
): Html =>
  Sidebar.sidebarMenuSub(
    {
      ...(flat ? { variant: 'flat' as const } : {}),
      children: labels
        .filter(label =>
          label.toLowerCase().includes(model.query.toLowerCase()),
        )
        .map(label =>
          Sidebar.sidebarMenuSubItem(
            {
              children: [
                Sidebar.sidebarMenuSubButton(
                  {
                    children: [label],
                    href: '#',
                    isActive: model.active === label,
                    onClick: Message['SelectedStyleXSidebarItem']({ label }),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        ),
    },
    h,
  )
/* TW sidebar-02 collapsible content: plain menu items, no sub indent. */
const docItems = (
  labels: ReadonlyArray<string>,
  model: Model,
  h: HtmlBuilder<Message>,
): Html =>
  Sidebar.sidebarMenu(
    {
      children: labels
        .filter(label =>
          label.toLowerCase().includes(model.query.toLowerCase()),
        )
        .map(label => item(label, model, h)),
    },
    h,
  )
const group = (
  title: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  Sidebar.sidebarGroup(
    {
      children: [
        Sidebar.sidebarGroupLabel({ children: [title] }, h),
        Sidebar.sidebarMenu({ children }, h),
      ],
    },
    h,
  )
type ExpandableShape = 'menu' | 'chevronLead' | 'plusMinus' | 'label'
const expandable = (
  id: string,
  label: string,
  content: Html,
  model: Model,
  h: HtmlBuilder<Message>,
  initiallyOpen = false,
  name?: string,
  shape: ExpandableShape = 'menu',
): Html => {
  const isOpen = model.expanded[id] ?? initiallyOpen
  const trailing =
    shape === 'plusMinus'
      ? [
          BaseIcon.icon(
            isOpen ? 'minus' : 'plus',
            {
              class: className(searchStyles.endIcon),
            },
            h,
          ),
        ]
      : shape === 'chevronLead'
        ? []
        : [
            BaseIcon.icon(
              'chevron-right',
              {
                class: className(
                  searchStyles.chevron,
                  isOpen && searchStyles.chevronOpen,
                ),
              },
              h,
            ),
          ]
  const leading =
    shape === 'chevronLead'
      ? [
          BaseIcon.icon(
            'chevron-right',
            {
              class: className(
                searchStyles.chevronLead,
                isOpen && searchStyles.chevronOpen,
              ),
            },
            h,
          ),
        ]
      : []
  const disclosure = collapsible(
    {
      variant: shape === 'label' ? 'sidebarLabel' : 'sidebar',
      id: 'stylex-group-' + id.replaceAll(/[^a-z0-9]/gi, '-'),
      isOpen,
      onToggle: next =>
        Message['ChangedStyleXSidebarGroup']({ id, isOpen: next }),
      trigger: h.span(
        [h.Class(className(searchStyles.contents))],
        [
          ...leading,
          ...(name === undefined ? [] : [icon({ name }, h)]),
          blockLabel(label, h),
          ...trailing,
        ],
      ),
      content,
    },
    h,
  )
  /* TW nests menu-button collapsibles inside sidebarMenuItem; the
     group-label variant (sidebar-02) is wrapped in its own sidebarGroup. */
  return shape === 'label'
    ? Sidebar.sidebarGroup({ children: [disclosure] }, h)
    : Sidebar.sidebarMenuItem({ children: [disclosure] }, h)
}
const user = (h: HtmlBuilder<Message>, collapsed: boolean): Html =>
  Sidebar.sidebarFooter(
    {
      children: [
        Sidebar.sidebarMenu(
          {
            children: [
              Sidebar.sidebarMenuItem(
                {
                  children: [
                    Sidebar.sidebarMenuButton(
                      {
                        children: [
                          badge({ children: ['CU'], variant: 'secondary' }, h),
                          ...(collapsed
                            ? []
                            : [
                                stack(
                                  {
                                    gap: 'none',
                                    children: [
                                      text(
                                        {
                                          children: ['CreaseUI'],
                                          variant: 'label',
                                        },
                                        h,
                                      ),
                                      text(
                                        {
                                          children: ['m@example.com'],
                                          variant: 'caption',
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                              ]),
                        ],
                        tooltip: 'CreaseUI account',
                        size: 'lg',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
const brand = (
  label: string,
  detail: string,
  h: HtmlBuilder<Message>,
  collapsed: boolean,
  extraChildren: ReadonlyArray<Html> = [],
  iconName = 'gallery-vertical-end',
): Html =>
  Sidebar.sidebarHeader(
    {
      children: [
        Sidebar.sidebarMenu(
          {
            children: [
              Sidebar.sidebarMenuItem(
                {
                  children: [
                    Sidebar.sidebarMenuButton(
                      {
                        children: [
                          collapsed
                            ? icon({ name: iconName }, h)
                            : badge(
                                {
                                  children: [icon({ name: iconName }, h)],
                                },
                                h,
                              ),
                          ...(collapsed
                            ? []
                            : [
                                stack(
                                  {
                                    gap: 'none',
                                    children: [
                                      text(
                                        { children: [label], variant: 'label' },
                                        h,
                                      ),
                                      text(
                                        {
                                          children: [detail],
                                          variant: 'caption',
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                              ]),
                        ],
                        size: 'lg',
                        tooltip: label,
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        ...extraChildren,
      ],
    },
    h,
  )
const searchForm = (id: string, model: Model, h: HtmlBuilder<Message>): Html =>
  h.form(
    [],
    [
      h.div(
        [
          h.DataAttribute('slot', 'sidebar-group'),
          h.DataAttribute('sidebar', 'group'),
          h.Class(className(searchStyles.group)),
        ],
        [
          h.div(
            [
              h.DataAttribute('slot', 'sidebar-group-content'),
              h.DataAttribute('sidebar', 'group-content'),
              h.Class(className(searchStyles.box)),
            ],
            [
              h.label(
                [
                  h.For(`sidebar-${id}-search`),
                  h.Class(className(searchStyles.srOnly)),
                ],
                ['Search'],
              ),
              Sidebar.sidebarInput(
                {
                  id: `sidebar-${id}-search`,
                  value: model.query,
                  onInput: value =>
                    Message['ChangedStyleXSidebarSearch']({ value }),
                  placeholder: 'Search the docs...',
                  inputStyle: searchStyles.input,
                },
                h,
              ),
              BaseIcon.icon(
                'search',
                { class: className(searchStyles.icon) },
                h,
              ),
            ],
          ),
        ],
      ),
    ],
  )

const documentation = (
  id: string,
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  ...(id === '14'
    ? []
    : [
        brand(
          'Documentation',
          id === '01' || id === '02' ? 'v1.0.1' : 'v1.0.0',
          h,
          false,
          ['01', '02', '05'].includes(id) ? [searchForm(id, model, h)] : [],
        ),
      ]),
  Sidebar.sidebarContent(
    {
      children:
        id === '03' || id === '04' || id === '14'
          ? [
              /* TW-03/04/14: always-open groups — menuItem = [font-medium
                 menuButton title, sidebarMenuSub items]; 04 uses gap-2
                 menu + flattened sub; 14 adds a 'Table of Contents' label. */
              Sidebar.sidebarGroup(
                {
                  children: [
                    ...(id === '14'
                      ? [
                          Sidebar.sidebarGroupLabel(
                            { children: ['Table of Contents'] },
                            h,
                          ),
                        ]
                      : []),
                    Sidebar.sidebarMenu(
                      {
                        ...(id === '04' ? { variant: 'loose' as const } : {}),
                        children: docs.navMain.map(g =>
                          Sidebar.sidebarMenuItem(
                            {
                              children: [
                                Sidebar.sidebarMenuButton(
                                  {
                                    children: [g.title],
                                    href: '#',
                                    weight: 'medium',
                                  },
                                  h,
                                ),
                                subItems(
                                  g.items.map(i => i.title),
                                  model,
                                  h,
                                  id === '04',
                                ),
                              ],
                            },
                            h,
                          ),
                        ),
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ]
          : docs.navMain.map((g, index) => {
              const labels = g.items.map(i => i.title)
              if (id === '02' || id === '05')
                return expandable(
                  g.title,
                  g.title,
                  id === '02'
                    ? docItems(labels, model, h)
                    : subItems(labels, model, h),
                  model,
                  h,
                  id === '02',
                  undefined,
                  id === '02' ? 'label' : 'plusMinus',
                )
              if (id === '06') {
                const submenu = model.submenus[index]
                return submenu === undefined
                  ? h.empty
                  : Sidebar.sidebarMenuItem(
                      {
                        children: [
                          DropdownMenu.dropdownMenu<string, Message>(
                            {
                              model: submenu,
                              toParentMessage: message =>
                                Message['GotStyleXSidebarSubmenu']({
                                  index,
                                  message,
                                }),
                              trigger: h.span(
                                [h.Class(className(searchStyles.contents))],
                                [
                                  g.title,
                                  BaseIcon.icon(
                                    'ellipsis',
                                    {
                                      class: className(searchStyles.chevron),
                                    },
                                    h,
                                  ),
                                ],
                              ),
                              triggerStyle: submenu.isOpen
                                ? searchStyles.menuTriggerOpen
                                : searchStyles.menuTrigger,
                              items: labels,
                              itemToConfig: title => ({ label: title }),
                              side: 'right',
                              align: 'start',
                              ariaLabel: g.title + ' submenu',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    )
              }
              if (id === '01')
                return group(
                  g.title,
                  labels
                    .filter(l =>
                      l.toLowerCase().includes(model.query.toLowerCase()),
                    )
                    .map(l => item(l, model, h)),
                  h,
                )
              return group(g.title, [subItems(labels, model, h)], h)
            }),
    },
    h,
  ),
  ...(id === '06'
    ? [
        Sidebar.sidebarFooter(
          {
            children: [
              box(
                {
                  surface: 'card',
                  radius: 'lg',
                  padding: 'md',
                  children: [
                    stack(
                      {
                        gap: 'sm',
                        children: [
                          text(
                            {
                              children: ['Subscribe to our newsletter'],
                              variant: 'label',
                            },
                            h,
                          ),
                          text(
                            {
                              children: [
                                'Opt-in to receive updates and news about the sidebar.',
                              ],
                              tone: 'secondary',
                            },
                            h,
                          ),
                          Sidebar.sidebarInput(
                            {
                              id: 'newsletter-email',
                              type: 'email',
                              value: model.query,
                              onInput: value =>
                                Message['ChangedStyleXSidebarSearch']({
                                  value,
                                }),
                              placeholder: 'Email',
                            },
                            h,
                          ),
                          button(
                            {
                              children: ['Subscribe'],
                              size: 'sm',
                              layoutStyle: searchStyles.fullWidth,
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ]
    : []),
]
const application = (
  id: string,
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const collapsed = !model.isOpen && !model.isMobileOpen
  return [
    brand('Acme Inc', 'Enterprise', h, collapsed),
    Sidebar.sidebarContent(
      {
        children: [
          ...(collapsed
            ? []
            : [Sidebar.sidebarGroupLabel({ children: ['Platform'] }, h)]),
          ...app.navMain.map(g =>
            collapsed
              ? item(g.title, model, h, g.icon, true)
              : expandable(
                  g.title,
                  g.title,
                  subItems(
                    g.items.map(i => i.title),
                    model,
                    h,
                  ),
                  model,
                  h,
                  false,
                  g.icon,
                ),
          ),
          ...(collapsed
            ? []
            : [
                group(
                  'Projects',
                  app.projects.map(p => item(p.name, model, h, p.icon)),
                  h,
                ),
              ]),
          ...(['08', '16'].includes(id)
            ? [
                group(
                  '',
                  [
                    item('Support', model, h, 'life-buoy', collapsed),
                    item('Feedback', model, h, 'send', collapsed),
                  ],
                  h,
                ),
              ]
            : []),
        ],
      },
      h,
    ),
    user(h, collapsed),
  ]
}
const workspaceNav = (
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  brand('Acme Inc', 'Workspace', h, false),
  group(
    '',
    workspace.navMain.map(i =>
      item(i.title, model, h, i.icon === 'home' ? 'house' : i.icon),
    ),
    h,
  ),
  Sidebar.sidebarContent(
    {
      children: [
        group(
          'Favorites',
          workspace.favorites.map(f => item(f.emoji + ' ' + f.name, model, h)),
          h,
        ),
        group(
          'Workspaces',
          workspace.workspaces.map(w =>
            expandable(
              w.name,
              w.emoji + ' ' + w.name,
              subItems(
                w.pages.map(p => p.emoji + ' ' + p.name),
                model,
                h,
              ),
              model,
              h,
            ),
          ),
          h,
        ),
        group(
          '',
          workspace.navSecondary.map(i => item(i.title, model, h, i.icon)),
          h,
        ),
      ],
    },
    h,
  ),
]
type TreeItem = string | ReadonlyArray<TreeItem>
const tree = (
  entries: ReadonlyArray<TreeItem>,
  model: Model,
  h: HtmlBuilder<Message>,
  parent = '',
): Html =>
  Sidebar.sidebarMenu(
    {
      children: entries.map(entry => {
        if (typeof entry === 'string') return item(entry, model, h, 'file')
        const [name, ...children] = entry
        if (typeof name !== 'string') return h.empty
        const path = parent ? parent + '/' + name : name
        return expandable(
          path,
          name,
          Sidebar.sidebarMenuSub(
            { children: [tree(children, model, h, path)] },
            h,
          ),
          model,
          h,
          false,
          'folder',
          'chevronLead',
        )
      }),
    },
    h,
  )
const calendarNav = (
  model: Model,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  user(h, false),
  Sidebar.sidebarContent(
    {
      children: [
        Calendar.calendar(
          {
            model: model.calendar,
            maybeSelectedDate: model.selectedDate,
            toParentMessage: message =>
              Message['GotStyleXSidebarCalendar']({ message }),
          },
          h,
        ),
        group(
          'My Calendars',
          ['Personal', 'Work', 'Family'].map(label =>
            Sidebar.sidebarMenuItem(
              {
                children: [
                  checkbox(
                    {
                      id: 'calendar-' + label,
                      label,
                      isChecked:
                        model.expanded['calendar-' + label] ??
                        label !== 'Family',
                      onToggle: isOpen =>
                        Message['ChangedStyleXSidebarGroup']({
                          id: 'calendar-' + label,
                          isOpen,
                        }),
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
          ),
          h,
        ),
        group('Favorites', [], h),
        group('Other', [], h),
      ],
    },
    h,
  ),
  Sidebar.sidebarFooter(
    {
      children: [
        button(
          {
            children: ['New Calendar'],
            leadingIcon: icon({ name: 'plus' }, h),
            variant: 'ghost',
          },
          h,
        ),
      ],
    },
    h,
  ),
]
const trigger = (h: HtmlBuilder<Message>): Html =>
  Sidebar.sidebarTrigger(
    {
      onClick: Message['ToggledStyleXSidebar'](),
      onMobileClick: Message['ToggledStyleXMobileSidebar'](),
      layoutStyle: searchStyles.trigger,
    },
    h,
  )
/* sidebar-14 puts its trigger on the right (sidebar is on the right):
   TW '-mr-1 ml-auto rotate-180'. */
const rightTrigger = (h: HtmlBuilder<Message>): Html =>
  Sidebar.sidebarTrigger(
    {
      onClick: Message['ToggledStyleXSidebar'](),
      onMobileClick: Message['ToggledStyleXMobileSidebar'](),
      layoutStyle: searchStyles.rightTrigger,
      iconStyle: searchStyles.triggerIcon,
    },
    h,
  )
/* TW header: separator(vertical, 'mr-2 h-4') between trigger and breadcrumb. */
const headerSeparator = (h: HtmlBuilder<Message>): Html =>
  separator(
    {
      orientation: 'vertical',
      layoutStyle: searchStyles.headerSeparator,
    },
    h,
  )
const crumb = (
  label: string,
  isPage: boolean,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> =>
  isPage
    ? [
        breadcrumbItem(
          {
            children: [breadcrumbPage({ children: [label] }, h)],
          },
          h,
        ),
      ]
    : [
        breadcrumbItem(
          {
            children: [breadcrumbLink({ href: '#', children: [label] }, h)],
          },
          h,
        ),
        breadcrumbSeparator({}, h),
      ]
/* Per-variant breadcrumb trails, mirroring each Tailwind preview header. */
const crumbTrail = (
  id: string,
  active: string,
  h: HtmlBuilder<Message>,
): Html => {
  const trail: ReadonlyArray<string> =
    id === '09'
      ? ['All Inboxes', 'Inbox']
      : id === '11'
        ? ['src', 'ui', 'button.ts']
        : id === '12'
          ? ['October 2024']
          : id === '10' || id === '15'
            ? ['Project Management & Task Tracking']
            : ['Build Your Application', active]
  return breadcrumb(
    {
      children: [
        breadcrumbList(
          {
            children: trail.flatMap((label, index) =>
              crumb(label, index === trail.length - 1, h),
            ),
          },
          h,
        ),
      ],
    },
    h,
  )
}
const settingsContent = (model: Model, h: HtmlBuilder<Message>): Html =>
  settingsLayout(
    Sidebar.sidebar(
      {
        collapsible: 'none',
        children: [
          Sidebar.sidebarContent(
            {
              children: [
                group(
                  '',
                  settings.nav.map(i => item(i.name, model, h, i.icon)),
                  h,
                ),
              ],
            },
            h,
          ),
        ],
      },
      h,
    ),
    [
      blockHeader(
        [
          text({ children: ['Settings'], tone: 'secondary' }, h),
          text(
            {
              children: [
                model.active === 'Data Fetching'
                  ? 'Messages & media'
                  : model.active,
              ],
            },
            h,
          ),
        ],
        false,
        h,
      ),
      blockSkeleton('document', h),
    ],
    h,
  )

export const view = (
  model: Model,
  id: string,
  h: HtmlBuilder<Message>,
): Html => {
  if (id === '13')
    return blockCenter(
      [
        button(
          {
            children: ['Open Dialog'],
            onClick: Message['OpenedStyleXSidebarDialog'](),
          },
          h,
        ),
        Dialog.dialog(
          {
            size: 'settings',
            model: model.dialog,
            toParentMessage: message =>
              Message['GotStyleXSidebarDialog']({ message }),
            title: 'Settings',
            description: 'Customize your settings here.',
            content: () => [settingsContent(model, h)],
          },
          h,
        ),
      ],
      h,
      Message['OpenedStyleXSidebarDialog'](),
    )
  const state = model.isOpen ? 'expanded' : 'collapsed'
  const isApp = ['07', '08', '16'].includes(id)
  const title =
    id === '09'
      ? 'Inbox'
      : id === '11'
        ? 'button.ts'
        : id === '12'
          ? 'October 2024'
          : id === '10' || id === '15'
            ? 'Project Management & Task Tracking'
            : model.active
  const navigation =
    id === '09'
      ? [
          /* TW-09: one icon sidebar whose inner is flex-row containing a
             49px icon rail (collapsible none) + flex-1 mail list sidebar. */
          h.div(
            [h.Class(className(searchStyles.mailRow))],
            [
              h.div(
                [
                  h.DataAttribute('slot', 'sidebar'),
                  h.Class(className(searchStyles.mailRail)),
                ],
                [
                  brand(
                    'Acme Inc',
                    'Enterprise',
                    h,
                    !model.isMobileOpen,
                    [],
                    'command',
                  ),
                  Sidebar.sidebarContent(
                    {
                      children: [
                        Sidebar.sidebarMenu(
                          {
                            children: mail.navMain.map(i =>
                              item(
                                i.title,
                                model,
                                h,
                                i.icon,
                                !model.isMobileOpen,
                              ),
                            ),
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  user(h, !model.isMobileOpen),
                ],
              ),
              h.div(
                [
                  h.DataAttribute('slot', 'sidebar'),
                  h.Class(className(searchStyles.mailColumn)),
                ],
                [
                  h.div(
                    [h.Class(className(searchStyles.mailHead))],
                    [
                      h.div(
                        [h.Class(className(searchStyles.mailTitleRow))],
                        [
                          h.div(
                            [h.Class(className(searchStyles.mailTitle))],
                            ['Inbox'],
                          ),
                          h.div(
                            [h.Class(className(searchStyles.mailSwitchRow))],
                            [
                              h.span([], ['Unreads']),
                              Switch.switchControl(
                                {
                                  id: 'stylex-sidebar-09-unreads',
                                  isChecked: model.unreadOnly,
                                  onToggle: isChecked =>
                                    Message['ToggledStyleXSidebarUnread']({
                                      isChecked,
                                    }),
                                },
                                h,
                              ),
                            ],
                          ),
                        ],
                      ),
                      Sidebar.sidebarInput(
                        {
                          id: 'stylex-sidebar-09-mail-search',
                          value: model.query,
                          onInput: value =>
                            Message['ChangedStyleXSidebarSearch']({
                              value,
                            }),
                          placeholder: 'Type to search...',
                        },
                        h,
                      ),
                    ],
                  ),
                  Sidebar.sidebarContent(
                    {
                      children: [
                        h.div(
                          [
                            h.DataAttribute('slot', 'sidebar-group'),
                            h.Class(className(searchStyles.mailGroup)),
                          ],
                          [
                            Sidebar.sidebarGroupContent(
                              {
                                children: mail.mails
                                  .filter(m =>
                                    (m.name + ' ' + m.subject)
                                      .toLowerCase()
                                      .includes(model.query.toLowerCase()),
                                  )
                                  .map(m =>
                                    mailItem(
                                      [
                                        h.div(
                                          [
                                            h.Class(
                                              className(
                                                searchStyles.mailNameRow,
                                              ),
                                            ),
                                          ],
                                          [
                                            h.span([], [m.name]),
                                            h.span(
                                              [
                                                h.Class(
                                                  className(
                                                    searchStyles.mailDate,
                                                  ),
                                                ),
                                              ],
                                              [m.date],
                                            ),
                                          ],
                                        ),
                                        h.span(
                                          [
                                            h.Class(
                                              className(
                                                searchStyles.mailSubject,
                                              ),
                                            ),
                                          ],
                                          [m.subject],
                                        ),
                                        h.span(
                                          [
                                            h.Class(
                                              className(
                                                searchStyles.mailTeaser,
                                              ),
                                            ),
                                          ],
                                          [m.teaser],
                                        ),
                                      ],
                                      Message['SelectedStyleXSidebarItem']({
                                        label: m.subject,
                                      }),
                                      h,
                                    ),
                                  ),
                              },
                              h,
                            ),
                          ],
                        ),
                      ],
                    },
                    h,
                  ),
                ],
              ),
            ],
          ),
        ]
      : id === '11'
        ? [
            Sidebar.sidebarContent(
              {
                children: [
                  group(
                    'Changes',
                    files.changes.map(c =>
                      Sidebar.sidebarMenuItem(
                        {
                          children: [
                            Sidebar.sidebarMenuButton(
                              {
                                children: [icon({ name: 'file' }, h), c.file],
                              },
                              h,
                            ),
                            Sidebar.sidebarMenuBadge(
                              { children: [c.state] },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                    ),
                    h,
                  ),
                  group('Files', [tree(files.tree, model, h)], h),
                ],
              },
              h,
            ),
          ]
        : id === '12'
          ? calendarNav(model, h)
          : id === '10' || id === '15'
            ? workspaceNav(model, h)
            : isApp
              ? application(id, model, h)
              : documentation(id, model, h)
  const nav = Sidebar.sidebar(
    {
      state,
      belowHeader: id === '16',
      side: id === '14' ? 'right' : 'left',
      variant: id === '04' ? 'floating' : id === '08' ? 'inset' : 'sidebar',
      collapsible: isApp || id === '09' ? 'icon' : 'offcanvas',
      isMobileOpen: model.isMobileOpen,
      onMobileDismiss: Message['ToggledStyleXMobileSidebar'](),
      children: navigation,
    },
    h,
  )
  const main = Sidebar.sidebarInset(
    {
      variant: id === '08' ? 'inset' : 'sidebar',
      state,
      children: [
        ...(id === '16'
          ? []
          : id === '09'
            ? [
                h.header(
                  [h.Class(className(searchStyles.mailInsetHeader))],
                  [trigger(h), headerSeparator(h), crumbTrail(id, title, h)],
                ),
              ]
            : [
                blockHeader(
                  [
                    ...(id === '14' ? [] : [trigger(h), headerSeparator(h)]),
                    crumbTrail(id, title, h),
                    ...(id === '14' ? [rightTrigger(h)] : []),
                    ...(id === '10'
                      ? [
                          Popover.popover(
                            {
                              model: model.popover,
                              toParentMessage: message =>
                                Message['GotStyleXSidebarPopover']({ message }),
                              trigger: icon(
                                { ariaLabel: 'Page actions', name: 'ellipsis' },
                                h,
                              ),
                              content: Sidebar.sidebar(
                                {
                                  collapsible: 'none',
                                  children: documentation('03', model, h),
                                },
                                h,
                              ),
                              align: 'end',
                            },
                            h,
                          ),
                        ]
                      : []),
                  ],
                  false,
                  h,
                ),
              ]),
        blockSkeleton(
          id === '02' || id === '09'
            ? 'rows'
            : id === '12'
              ? 'calendar'
              : id === '10' || id === '15'
                ? 'document'
                : 'cards',
          h,
        ),
      ],
    },
    h,
  )
  const right =
    id === '15'
      ? [
          Sidebar.sidebar(
            {
              side: 'right',
              collapsible: 'offcanvas',
              children: calendarNav(model, h),
            },
            h,
          ),
        ]
      : []
  return blockPage(
    [
      ...(id === '16'
        ? [
            blockHeader(
              [
                trigger(h),
                text(
                  {
                    children: ['Build Your Application › Data Fetching'],
                    variant: 'label',
                  },
                  h,
                ),
              ],
              true,
              h,
            ),
          ]
        : []),
      Sidebar.sidebarProvider(
        {
          state,
          belowHeader: id === '16',
          ...(id === '09' ? { width: '350px' } : {}),
          ...(id === '04' ? { width: '19rem' } : {}),
          children: id === '14' ? [main, nav] : [nav, main, ...right],
        },
        h,
      ),
    ],
    h,
  )
}
