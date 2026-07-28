import { Match as M, Schema as S } from 'effect'
import { Command } from 'foldkit'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import {
  breadcrumb,
  breadcrumbItem,
  breadcrumbLink,
  breadcrumbList,
  breadcrumbPage,
  breadcrumbSeparator,
} from '@/ui/breadcrumb'
import { button } from '@/ui/button'
import * as Dialog from '@/ui/dialog'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupContent,
  sidebarMenu,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
} from '@/ui/sidebar'

const data = {
  nav: [
    { name: 'Notifications', icon: 'bell' },
    { name: 'Navigation', icon: 'menu' },
    { name: 'Home', icon: 'house' },
    { name: 'Appearance', icon: 'paintbrush' },
    { name: 'Messages & media', icon: 'message-circle' },
    { name: 'Language & region', icon: 'globe' },
    { name: 'Accessibility', icon: 'keyboard' },
    { name: 'Mark as read', icon: 'check' },
    { name: 'Audio & video', icon: 'video' },
    { name: 'Connected accounts', icon: 'link' },
    { name: 'Privacy & visibility', icon: 'lock' },
    { name: 'Advanced', icon: 'settings' },
  ],
}

export const Model = S.Struct({
  isSidebarOpen: S.Boolean,
  dialog: Dialog.Model,
})
export type Model = typeof Model.Type

export const ToggledSidebar = m('ToggledSidebar')
export const OpenedSettings = m('OpenedSettings')
export const GotDialogMessage = m('GotDialogMessage', {
  message: Dialog.Message,
})
export const Message = S.Union([
  ToggledSidebar,
  OpenedSettings,
  GotDialogMessage,
])
export type Message = typeof Message.Type

export const init = (): Model => ({
  isSidebarOpen: true,
  dialog: Dialog.init({
    id: 'sidebar-13-settings-dialog',
    isOpen: true,
    isAnimated: true,
  }),
})

type UpdateReturn = readonly [Model, ReadonlyArray<Command.Command<Message>>]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      ToggledSidebar: () => [
        evo(model, { isSidebarOpen: current => !current }),
        [],
      ],
      OpenedSettings: () => {
        const [dialog, commands] = Dialog.open(model.dialog)
        return [
          evo(model, { dialog: () => dialog }),
          Command.mapMessages(commands, next =>
            GotDialogMessage({ message: next }),
          ),
        ]
      },
      GotDialogMessage: ({ message: childMessage }) => {
        const [dialog, commands] = Dialog.update(model.dialog, childMessage)
        return [
          evo(model, { dialog: () => dialog }),
          Command.mapMessages(commands, next =>
            GotDialogMessage({ message: next }),
          ),
        ]
      },
    }),
  )

const settingsSidebar = (): Html =>
  sidebar<Dialog.Message>({
    state: 'expanded',
    collapsible: 'none',
    class: 'hidden md:flex',
    children: [
      sidebarContent({
        children: [
          sidebarGroup({
            children: [
              sidebarGroupContent({
                children: [
                  sidebarMenu({
                    children: data.nav.map(item =>
                      sidebarMenuItem({
                        children: [
                          sidebarMenuButton({
                            href: '#',
                            isActive: item.name === 'Messages & media',
                            children: [
                              Icon.icon<Dialog.Message>(item.icon),
                              item.name,
                            ],
                          }),
                        ],
                      }),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

const settingsMain = (): Html => {
  const h = html<Dialog.Message>()
  return h.main(
    [h.Class('flex h-[480px] flex-1 flex-col overflow-hidden')],
    [
      h.header(
        [
          h.Class(
            'flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
          ),
        ],
        [
          h.div(
            [h.Class('flex items-center gap-2 px-4')],
            [
              breadcrumb({
                children: [
                  breadcrumbList({
                    children: [
                      breadcrumbItem({
                        class: 'hidden md:block',
                        children: [
                          breadcrumbLink({
                            href: '#',
                            children: ['Settings'],
                          }),
                        ],
                      }),
                      breadcrumbSeparator({ class: 'hidden md:block' }),
                      breadcrumbItem({
                        children: [
                          breadcrumbPage({
                            children: ['Messages & media'],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            'flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0',
          ),
        ],
        Array.from({ length: 10 }, () =>
          h.div(
            [h.Class('aspect-video max-w-3xl rounded-xl bg-muted/50')],
            [],
          ),
        ),
      ),
    ],
  )
}

const settingsDialog = (model: Dialog.Model): Html =>
  Dialog.dialog<Message>({
    model,
    toParentMessage: message => GotDialogMessage({ message }),
    title: 'Settings',
    description: 'Customize your settings here.',
    showCloseButton: true,
    class:
      'overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]',
    content: () => [
      sidebarProvider<Dialog.Message>({
        state: 'expanded',
        class: 'items-start min-h-0',
        children: [settingsSidebar(), settingsMain()],
      }),
    ],
  })

export const view = (model: Model): Html => {
  const h = html<Message>()
  return h.div(
    [h.Class('flex h-svh items-center justify-center')],
    [
      button({
        size: 'sm',
        onClick: OpenedSettings(),
        children: ['Open Dialog'],
      }),
      settingsDialog(model.dialog),
    ],
  )
}

// PORT NOTE: The dialog wrapper supplies the native dialog framing and
// accessible title/description. Unlike the source's visually hidden heading,
// the installed wrapper renders that heading visibly before the two-pane
// content; it does not expose title attributes. The settings sidebar and
// independently scrolling settings pane otherwise preserve the source.
