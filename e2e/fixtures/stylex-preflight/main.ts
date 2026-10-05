import { Option, Schema as S } from 'effect'
import { Runtime, Command as FoldkitCommand } from 'foldkit'
import type { HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import * as Icon from '@/lib/icon'
import * as Breadcrumb from '@/stylex/breadcrumb'
import { button, buttonLink } from '@/stylex/button'
import * as Card from '@/stylex/card'
import * as Command from '@/stylex/command'
import * as Dialog from '@/stylex/dialog'
import * as Dropdown from '@/stylex/dropdown-menu'
import * as Empty from '@/stylex/empty'
import { heading } from '@/stylex/heading'
import { input } from '@/stylex/input'
import { kbd } from '@/stylex/kbd'
import { separator } from '@/stylex/separator'
import * as Sidebar from '@/stylex/sidebar'
import { stack } from '@/stylex/stack'
import { text } from '@/stylex/text'
import themeSource from '@/theme.css?raw'

// Reuse only the theme variables. No Tailwind, preflight, or app selectors.
const theme = document.createElement('style')
theme.textContent = [
  ...themeSource.matchAll(/(?:^|\n)(:root|\.dark)\s*\{[^}]+\}/gu),
]
  .map(match => match[0])
  .join('\n')
document.head.append(theme)

const Model = S.Struct({
  collapsed: S.Boolean,
  dialog: Dialog.Model,
  command: Command.Model,
  dropdown: Dropdown.Model,
})
type Model = typeof Model.Type
const Message = defineMessageUnion({
  ToggledSidebar: {},
  ClickedOpenDialog: {},
  GotDialog: { message: Dialog.Message },
  GotCommand: { message: Command.Message },
  GotDropdown: { message: Dropdown.Message },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) => {
  switch (message._tag) {
    case 'ToggledSidebar':
      return { model: { ...model, collapsed: !model.collapsed } }
    case 'ClickedOpenDialog': {
      const result = Dialog.open(model.dialog)
      return {
        model: { ...model, dialog: result.model },
        commands: FoldkitCommand.mapMessages(result.commands ?? [], message =>
          Message.GotDialog({ message }),
        ),
      }
    }
    case 'GotDialog': {
      const result = Dialog.update(model.dialog, message.message)
      return {
        model: { ...model, dialog: result.model },
        commands: FoldkitCommand.mapMessages(result.commands ?? [], message =>
          Message.GotDialog({ message }),
        ),
      }
    }
    case 'GotCommand': {
      const result = Command.update(model.command, message.message)
      return {
        model: { ...model, command: result.model },
        commands: FoldkitCommand.mapMessages(result.commands ?? [], message =>
          Message.GotCommand({ message }),
        ),
      }
    }
    case 'GotDropdown': {
      const result = Dropdown.update(model.dropdown, message.message)
      return {
        model: { ...model, dropdown: result.model },
        commands: FoldkitCommand.mapMessages(result.commands ?? [], message =>
          Message.GotDropdown({ message }),
        ),
      }
    }
  }
}

const view = (model: Model, h: HtmlBuilder<Message>) => {
  const state = model.collapsed ? 'collapsed' : 'expanded'
  return Sidebar.sidebarProvider(
    {
      state,
      children: [
        Sidebar.sidebar(
          {
            state,
            collapsible: 'icon',
            isMobileOpen: true,
            children: [
              Sidebar.sidebarGroup(
                {
                  children: [
                    Sidebar.sidebarGroupLabel({ children: ['Workspace'] }, h),
                    Sidebar.sidebarMenu(
                      {
                        children: (['default', 'sm', 'lg'] as const).map(
                          (size, index) =>
                            Sidebar.sidebarMenuItem(
                              {
                                children: [
                                  Sidebar.sidebarMenuButton(
                                    {
                                      size,
                                      href: '#home',
                                      isActive: index === 0,
                                      children: [
                                        Icon.house({}, h),
                                        Sidebar.sidebarMenuLabel(
                                          { children: [`Home ${size}`] },
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
                        ),
                      },
                      h,
                    ),
                    Sidebar.sidebarMenuSub(
                      {
                        children: [
                          Sidebar.sidebarMenuSubItem(
                            {
                              children: [
                                Sidebar.sidebarMenuSubButton(
                                  {
                                    href: '#settings',
                                    isActive: true,
                                    children: ['Settings'],
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
                    Sidebar.sidebarInput(
                      {
                        ariaLabel: 'Search workspace',
                        placeholder: 'Search workspace',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Sidebar.sidebarRail({ onClick: Message.ToggledSidebar() }, h),
            ],
          },
          h,
        ),
        Sidebar.sidebarInset(
          {
            children: [
              h.div(
                [h.Id('content')],
                [
                  Sidebar.sidebarTrigger(
                    { onClick: Message.ToggledSidebar() },
                    h,
                  ),
                  Breadcrumb.breadcrumb(
                    {
                      children: [
                        Breadcrumb.breadcrumbList(
                          {
                            children: [
                              Breadcrumb.breadcrumbItem(
                                {
                                  children: [
                                    Breadcrumb.breadcrumbLink(
                                      { href: '#home', children: ['Home'] },
                                      h,
                                    ),
                                  ],
                                },
                                h,
                              ),
                              Breadcrumb.breadcrumbSeparator({}, h),
                              Breadcrumb.breadcrumbItem(
                                {
                                  children: [
                                    Breadcrumb.breadcrumbPage(
                                      { children: ['Settings'] },
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
                  h.div(
                    [h.Id('buttons')],
                    [
                      ...(['default', 'ghost', 'outline', 'link'] as const).map(
                        variant =>
                          button(
                            {
                              variant,
                              leadingIcon: Icon.plus({}, h),
                              children: [variant],
                            },
                            h,
                          ),
                      ),
                      buttonLink({ href: '#link', children: ['Link'] }, h),
                    ],
                  ),
                  input(
                    {
                      id: 'name',
                      label: 'Name',
                      value: 'Ada',
                      description: 'Your display name',
                    },
                    h,
                  ),
                  Card.card(
                    {
                      children: [
                        Card.cardHeader(
                          {
                            children: [
                              Card.cardTitle(
                                { element: 'h2', children: ['Profile'] },
                                h,
                              ),
                            ],
                          },
                          h,
                        ),
                        Card.cardContent({ children: ['Account details'] }, h),
                      ],
                    },
                    h,
                  ),
                  ...([1, 2, 3, 4, 5, 6] as const).map(level =>
                    heading({ level, children: [`Heading ${level}`] }, h),
                  ),
                  text(
                    {
                      as: 'p',
                      children: ['Paragraph without browser margins.'],
                    },
                    h,
                  ),
                  text({ as: 'h2', children: ['Text as a heading'] }, h),
                  Empty.empty(
                    {
                      children: [
                        Empty.emptyTitle({ children: ['Nothing here yet'] }, h),
                        Empty.emptyDescription(
                          { children: ['Add an item to start.'] },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                  stack(
                    {
                      as: 'ul',
                      ariaLabel: 'Items',
                      padding: 2,
                      children: [h.li([], ['First item'])],
                    },
                    h,
                  ),
                  stack(
                    {
                      direction: 'horizontal',
                      hAlign: 'stretch',
                      vAlign: 'between',
                      children: ['Unsupported axis alignment'],
                    },
                    h,
                  ),
                  kbd({ children: ['Ctrl'] }, h),
                  separator({}, h),
                  Dropdown.dropdownMenu(
                    {
                      model: model.dropdown,
                      toParentMessage: message =>
                        Message.GotDropdown({ message }),
                      trigger: 'Open menu',
                      items: ['Profile', 'Settings'],
                      itemToConfig: item => ({ label: item }),
                    },
                    h,
                  ),
                  button(
                    {
                      onClick: Message.ClickedOpenDialog(),
                      children: ['Open command dialog'],
                    },
                    h,
                  ),
                  Dialog.dialog(
                    {
                      model: model.dialog,
                      toParentMessage: message =>
                        Message.GotDialog({ message }),
                      title: 'Commands',
                      description: 'Choose an action.',
                      content: () => [
                        Command.command(
                          {
                            model: model.command,
                            toParentMessage: message =>
                              Message.GotCommand({ message }),
                            maybeSelectedValue: Option.none(),
                            restingInputValue: '',
                            items: ['Profile', 'Settings'],
                            itemToConfig: item => ({ content: item }),
                            ariaLabel: 'Find a command',
                          },
                          h,
                        ),
                      ],
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
    },
    h,
  )
}

Runtime.run(
  Runtime.makeElement({
    Model,
    init: () => ({
      model: {
        collapsed: false,
        dialog: Dialog.init({ id: 'dialog' }),
        command: Command.init({ id: 'command' }),
        dropdown: Dropdown.init({ id: 'dropdown' }),
      },
    }),
    update,
    view,
    container: document.getElementById('root'),
    devTools: false,
  }),
)
