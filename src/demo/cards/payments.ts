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
import { buttonVariants } from '@/ui/button'
import { card, cardContent, cardHeader } from '@/ui/card'
import * as DropdownMenu from '@/ui/dropdown-menu'
import {
  itemContent,
  itemDescription,
  itemGroup,
  itemMedia,
  itemTitle,
  itemVariants,
} from '@/ui/item'

type MenuItem = 'profile' | 'statements' | 'documents'

const menuItems: ReadonlyArray<MenuItem> = [
  'profile',
  'statements',
  'documents',
]

const paymentItems = [
  {
    icon: 'gauge',
    title: 'Change transfer limit',
    description: 'Adjust how much you can send from your balance.',
  },
  {
    icon: 'calendar',
    title: 'Scheduled transfers',
    description: 'Set up a transfer to send at a later date.',
  },
  {
    icon: 'repeat',
    title: 'Direct Debits',
    description: 'Set up and manage regular payments.',
  },
  {
    icon: 'refresh-cw',
    title: 'Recurring card payments',
    description: 'Manage your repeated card transactions.',
  },
] as const

export const Model = S.Struct({
  menu: DropdownMenu.Model,
})
export type Model = typeof Model.Type

export const GotMenuMessage = m('GotMenuMessage', {
  message: DropdownMenu.Message,
})
export const Message = S.Union([GotMenuMessage])
export type Message = typeof Message.Type

type UpdateReturn = readonly [
  Model,
  ReadonlyArray<Command.Command<Message>>,
]

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotMenuMessage: ({ message: childMessage }) => {
        const [menu, commands] = DropdownMenu.update(
          model.menu,
          childMessage,
        )
        return [
          evo(model, { menu: () => menu }),
          Command.mapMessages(commands, next =>
            GotMenuMessage({ message: next }),
          ),
        ]
      },
    }),
  )

export const init = (): Model => ({
  menu: DropdownMenu.init({
    id: 'payments-account-options',
    isAnimated: true,
  }),
})

const paymentLink = (
  icon: string,
  title: string,
  description: string,
): Html => {
  const h = html<Message>()

  // PORT NOTE: src/ui/item.ts does not expose shadcn's asChild behavior,
  // so the link applies the exported Item variant classes directly.
  return h.a(
    [
      h.Href('#'),
      h.DataAttribute('slot', 'item'),
      h.DataAttribute('variant', 'muted'),
      h.DataAttribute('size', 'default'),
      h.Class(itemVariants({ variant: 'muted' })),
    ],
    [
      itemMedia({
        variant: 'icon',
        children: [Icon.icon(icon)],
      }),
      itemContent({
        children: [
          itemTitle({ children: [title] }),
          itemDescription({ children: [description] }),
        ],
      }),
      Icon.icon('chevron-right', {
        class: 'size-4 shrink-0 text-muted-foreground',
      }),
    ],
  )
}

export const view = (model: Model): Html => {
  const h = html<Message>()
  const menuTrigger = h.span(
    [h.Class('contents')],
    [
      Icon.moreHorizontal(),
      h.span([h.Class('sr-only')], ['Account options']),
    ],
  )

  return card<Message>({
    children: [
      cardHeader({
        class: 'flex flex-col gap-3',
        children: [
          breadcrumb({
            children: [
              breadcrumbList({
                children: [
                  breadcrumbItem({
                    children: [
                      breadcrumbLink({
                        href: '#',
                        children: ['Home'],
                      }),
                    ],
                  }),
                  breadcrumbSeparator(),
                  breadcrumbItem({
                    children: [
                      DropdownMenu.dropdownMenu<MenuItem, Message>({
                        model: model.menu,
                        toParentMessage: message =>
                          GotMenuMessage({ message }),
                        trigger: menuTrigger,
                        triggerClass: `${buttonVariants({
                          variant: 'ghost',
                          size: 'icon',
                        })} size-8`,
                        items: menuItems,
                        itemToConfig: item => ({
                          label:
                            item === 'profile'
                              ? 'Profile'
                              : item === 'statements'
                                ? 'Statements'
                                : 'Documents',
                          group: '',
                        }),
                        align: 'start',
                        ariaLabel: 'Account options',
                      }),
                    ],
                  }),
                  breadcrumbSeparator(),
                  breadcrumbItem({
                    children: [
                      breadcrumbPage({ children: ['Payments'] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      cardContent({
        children: [
          itemGroup({
            class: 'w-full',
            children: paymentItems.map(payment =>
              paymentLink(
                payment.icon,
                payment.title,
                payment.description,
              ),
            ),
          }),
        ],
      }),
    ],
  })
}

/*
Stateful? yes.
Submodels wired: DropdownMenu (breadcrumb account options).
PORT NOTEs: Item asChild links are local anchors using itemVariants because the shared Item wrapper renders a div.
*/
