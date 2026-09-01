import { Schema as S } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { m } from 'foldkit/message'

import * as TailwindBadge from '@/ui/badge'
import * as TailwindButton from '@/ui/button'
import * as TailwindCard from '@/ui/card'
import * as TailwindInput from '@/ui/input'
import * as StyleXBadge from '@/stylex/badge'
import * as StyleXButton from '@/stylex/button'
import * as StyleXCard from '@/stylex/card'
import * as StyleXInput from '@/stylex/input'
import { stylexCatalog } from '@/demo/stylex-catalog'

export const Model = S.Struct({ input: S.String, query: S.String })
export type Model = typeof Model.Type

export const ChangedInput = m('ChangedStyleXComparisonInput', { value: S.String })
export const ChangedCatalogQuery = m('ChangedStyleXCatalogQuery', { value: S.String })
export const CatalogNoop = m('StyleXCatalogNoop')
export const Message = S.Union([ChangedInput, ChangedCatalogQuery, CatalogNoop])
export type Message = typeof Message.Type

export const init = (): Model => ({ input: '', query: '' })

export const update = (model: Model, message: Message): readonly [Model, []] => {
  switch (message._tag) {
    case 'ChangedStyleXComparisonInput': return [{ ...model, input: message.value }, []]
    case 'ChangedStyleXCatalogQuery': return [{ ...model, query: message.value }, []]
    case 'StyleXCatalogNoop': return [model, []]
  }
}

const tailwindCode = `export const buttonVariants = cva(
  'inline-flex items-center justify-center ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground ...',
        outline: 'border bg-background hover:bg-accent ...',
      },
    },
  },
)`

const stylexCode = `const variants = stylex.create({
  default: {
    backgroundColor: {
      default: tokens.primary,
      ':hover': colorMix(tokens.primary, 90),
    },
    color: tokens.primaryForeground,
  },
  outline: {
    backgroundColor: { default: tokens.background, ':hover': tokens.accent },
    borderColor: tokens.border,
    borderWidth: 1,
  },
})`

const panelHeading = <Msg>(
  title: string,
  detail: string,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class('flex items-start justify-between gap-4 border-b px-5 py-4')],
    [
      h.div([h.Class('grid gap-1')], [
        h.h2([h.Class('text-sm font-semibold')], [title]),
        h.p([h.Class('text-xs text-muted-foreground')], [detail]),
      ]),
      TailwindBadge.badge({ variant: 'outline', children: ['same API'] }, h),
    ],
  )

const tailwindPanel = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.section(
    [h.Class('overflow-hidden rounded-xl border bg-background')],
    [
      panelHeading('Tailwind + CVA', 'Current crease/ui implementation', h),
      h.div([h.Class('grid gap-8 p-5')], [
        h.div([h.Class('flex flex-wrap gap-2')], [
          TailwindButton.button({ children: ['Save changes'] }, h),
          TailwindButton.button({ variant: 'outline', children: ['Cancel'] }, h),
          TailwindButton.button({ variant: 'secondary', children: ['Later'] }, h),
          TailwindButton.button({ variant: 'destructive', children: ['Delete'] }, h),
        ]),
        h.div([h.Class('flex flex-wrap gap-2')], [
          TailwindBadge.badge({ children: ['Default'] }, h),
          TailwindBadge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
          TailwindBadge.badge({ variant: 'outline', children: ['Outline'] }, h),
        ]),
        TailwindInput.input(
          {
            id: 'tailwind-email',
            label: 'Email',
            description: 'The Foldkit model owns this shared value.',
            placeholder: 'agent@example.com',
            value: model.input,
            onInput: value => ChangedInput({ value }),
          },
          h,
        ),
        TailwindCard.card(
          {
            children: [
              TailwindCard.cardHeader(
                {
                  children: [
                    TailwindCard.cardTitle({ children: ['Agent constraints'] }, h),
                    TailwindCard.cardDescription(
                      { children: ['Utility classes remain flexible at every call site.'] },
                      h,
                    ),
                  ],
                },
                h,
              ),
              TailwindCard.cardContent(
                { children: ['Composition is concise, but conventions need separate enforcement.'] },
                h,
              ),
            ],
          },
          h,
        ),
      ]),
    ],
  )

const stylexPanel = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.section(
    [h.Class('overflow-hidden rounded-xl border bg-background')],
    [
      panelHeading('StyleX', 'Typed, extracted, named style objects', h),
      h.div([h.Class('grid gap-8 p-5')], [
        h.div([h.Class('flex flex-wrap gap-2')], [
          StyleXButton.button({ children: ['Save changes'] }, h),
          StyleXButton.button({ variant: 'outline', children: ['Cancel'] }, h),
          StyleXButton.button({ variant: 'secondary', children: ['Later'] }, h),
          StyleXButton.button({ variant: 'destructive', children: ['Delete'] }, h),
          StyleXButton.button({ isDisabled: true, children: ['Disabled'] }, h),
        ]),
        h.div([h.Class('flex flex-wrap gap-2')], [
          StyleXBadge.badge({ children: ['Default'] }, h),
          StyleXBadge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
          StyleXBadge.badge({ variant: 'outline', children: ['Outline'] }, h),
        ]),
        StyleXInput.input(
          {
            id: 'stylex-email',
            label: 'Email',
            description: 'The Foldkit model owns this shared value.',
            placeholder: 'agent@example.com',
            value: model.input,
            onInput: value => ChangedInput({ value }),
          },
          h,
        ),
        StyleXCard.card(
          {
            children: [
              StyleXCard.cardHeader(
                {
                  children: [
                    StyleXCard.cardTitle({ children: ['Agent constraints'] }, h),
                    StyleXCard.cardDescription(
                      { children: ['Style props can be restricted at the TypeScript boundary.'] },
                      h,
                    ),
                  ],
                },
                h,
              ),
              StyleXCard.cardContent(
                { children: ['Named variants and typed tokens narrow the valid implementation space.'] },
                h,
              ),
            ],
          },
          h,
        ),
      ]),
    ],
  )

const codePanel = <Msg>(title: string, code: string, h: HtmlBuilder<Msg>): Html =>
  h.section([h.Class('min-w-0 overflow-hidden rounded-xl border bg-card')], [
    h.div([h.Class('border-b px-4 py-3 text-xs font-medium')], [title]),
    h.pre(
      [
        h.Tabindex(0),
        h.AriaLabel(`${title} code`),
        h.Class('overflow-x-auto p-4 text-xs leading-5 text-muted-foreground'),
      ],
      [h.code([], [code])],
    ),
  ])

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.main([h.Class('mx-auto w-full max-w-[1180px] px-4 py-12 md:px-8 md:py-16')], [
    h.div([h.Class('mb-10 max-w-3xl')], [
      h.div([h.Class('mb-4 flex items-center gap-2')], [
        TailwindBadge.badge({ children: ['Full catalog'] }, h),
        h.span([h.Class('text-xs text-muted-foreground')], ['65 StyleX components']),
      ]),
      h.h1([h.Class('text-3xl font-semibold tracking-tight md:text-4xl')], [
        'Same Foldkit architecture. Tighter styling grammar.',
      ]),
      h.p([h.Class('mt-4 max-w-[70ch] text-base leading-7 text-muted-foreground')], [
        'Both columns use the same semantic tokens and Foldkit primitives. Type in either input to verify that state still flows through one explicit model and update.',
      ]),
    ]),
    h.div([h.Class('grid gap-5 lg:grid-cols-2')], [
      tailwindPanel(model, h),
      stylexPanel(model, h),
    ]),
    h.div([h.Class('mt-10')], [
      h.h2([h.Class('text-xl font-semibold')], ['Authoring comparison']),
      h.p([h.Class('mt-2 text-sm text-muted-foreground')], [
        'The difference is mostly where constraints live: string conventions versus typed objects and compiler rules.',
      ]),
      h.div([h.Class('mt-5 grid gap-5 lg:grid-cols-2')], [
        codePanel('Tailwind + CVA', tailwindCode, h),
        codePanel('StyleX', stylexCode, h),
      ]),
    ]),
    stylexCatalog(
      model.query,
      value => ChangedCatalogQuery({ value }),
      CatalogNoop(),
      h,
    ),
  ])
