import { Match as M, Schema as S } from 'effect'
import { type Html, html } from 'foldkit/html'
import { m } from 'foldkit/message'
import { evo } from 'foldkit/struct'

import * as Icon from '@/lib/icon'
import { button } from '@/ui/button'
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import { field, fieldGroup, fieldLabel } from '@/ui/field'
import { input } from '@/ui/input'
import {
  itemContent,
  itemDescription,
  itemMedia,
  itemTitle,
  itemVariants,
} from '@/ui/item'

export const Model = S.Struct({
  email: S.String,
  password: S.String,
})
export type Model = typeof Model.Type

export const UpdatedEmail = m('UpdatedEmail', { value: S.String })
export const UpdatedPassword = m('UpdatedPassword', { value: S.String })
export const Message = S.Union([UpdatedEmail, UpdatedPassword])
export type Message = typeof Message.Type

export const update = (
  model: Model,
  message: Message,
): readonly [Model, readonly []] =>
  M.value(message).pipe(
    M.withReturnType<readonly [Model, readonly []]>(),
    M.tagsExhaustive({
      UpdatedEmail: ({ value }) => [
        evo(model, { email: () => value }),
        [],
      ],
      UpdatedPassword: ({ value }) => [
        evo(model, { password: () => value }),
        [],
      ],
    }),
  )

export const init = (): Model => ({
  email: 'artist@studio.inc',
  password: 'password123',
})

const dangerZone = (): Html => {
  const h = html<Message>()

  // PORT NOTE: src/ui/item.ts does not expose shadcn's asChild behavior,
  // so this local anchor applies the exported Item variant classes directly.
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
        children: [
          Icon.icon('circle-alert', { class: 'text-destructive' }),
        ],
      }),
      itemContent({
        children: [
          itemTitle({ children: ['Danger Zone'] }),
          itemDescription({
            class: 'line-clamp-1',
            children: ['Archive account and remove catalog'],
          }),
        ],
      }),
      Icon.icon('arrow-right', { class: 'size-4' }),
    ],
  )
}

export const view = (model: Model): Html => {
  const h = html<Message>()

  return card<Message>({
    children: [
      cardHeader({
        children: [
          cardTitle({ children: ['Account Access'] }),
          cardDescription({
            children: ['Update your credentials or re-authenticate.'],
          }),
        ],
      }),
      cardContent({
        children: [
          fieldGroup({
            children: [
              field({
                children: [
                  fieldLabel({
                    for: 'account-access-email',
                    children: ['Email Address'],
                  }),
                  input({
                    id: 'account-access-email',
                    type: 'email',
                    value: model.email,
                    onInput: value => UpdatedEmail({ value }),
                  }),
                ],
              }),
              field({
                children: [
                  h.div(
                    [h.Class('flex items-center justify-between')],
                    [
                      fieldLabel({
                        for: 'account-access-password',
                        children: ['Current Password'],
                      }),
                      h.a(
                        [
                          h.Href('#'),
                          h.Class(
                            'text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground',
                          ),
                        ],
                        ['Forgot?'],
                      ),
                    ],
                  ),
                  input({
                    id: 'account-access-password',
                    type: 'password',
                    value: model.password,
                    onInput: value => UpdatedPassword({ value }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      cardFooter({
        class: 'flex-col gap-4',
        children: [
          button({
            class: 'w-full',
            children: [
              Icon.icon('lock-keyhole'),
              'Update Security',
            ],
          }),
          dangerZone(),
        ],
      }),
    ],
  })
}

/*
Stateful? yes.
Submodels wired: none; controlled Input values are local card fields.
PORT NOTEs: Item asChild is represented by a local anchor using itemVariants because the shared Item wrapper renders a div.
*/
