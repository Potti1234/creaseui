import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Breadcrumb, DropdownMenu, Icon } from '#components'
import { defineComponentDocs, type DocsExampleImplementation } from '../types'
import { exampleApplicationSource } from './source'
import './breadcrumb.css'

type Item =
  | { readonly kind: 'link'; readonly label: string; readonly href: string }
  | { readonly kind: 'page'; readonly label: string }
  | { readonly kind: 'ellipsis' }
  | { readonly kind: 'dropdown'; readonly label: string }
  | { readonly kind: 'ellipsisMenu' }

const enMenu = ['Documentation', 'Themes', 'GitHub']
const arMenu = ['التوثيق', 'السمات', 'جيت هاب']

const simple =
  (
    items: ReadonlyArray<Extract<Item, { kind: 'link' | 'page' | 'ellipsis' }>>,
    separator?: 'dot',
    rtl = false,
  ): DocsExampleImplementation['view'] =>
  h =>
    Breadcrumb(h, {
      items,
      ...(separator === 'dot' ? { separator: Icon(h, { name: 'dot' }) } : {}),
      ...(rtl ? { direction: 'rtl' as const } : {}),
    })

const separatorView =
  (rtl = false) =>
  <Msg>(h: Html.H<Msg>) =>
    h.span.class('breadcrumb-docs-separator').children(rtl ? '‹' : '›')

const MenuMessage = UiSchema.TaggedEnum({
  RequestedOpen: {},
  RequestedClose: {},
  PickedMenuItem: { value: Schema.String },
})
const MenuDemo = Html.component({
  name: 'DocsBreadcrumbMenuDemo',
  props: Schema.Struct({
    ellipsis: Schema.Boolean,
    rtl: Schema.Boolean,
    labels: Schema.Array(Schema.String),
  }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: MenuMessage,
}).make({
  init: () => ({ open: false }),
  update: {
    RequestedOpen: $ => $.evolve({ open: true }),
    RequestedClose: $ => $.evolve({ open: false }),
    PickedMenuItem: $ => $.evolve({ open: false }),
  },
  view: (h, model) =>
    DropdownMenu(h, {
      key: 'menu',
      label: 'Breadcrumb destinations',
      direction: h.props.rtl ? 'rtl' : 'ltr',
      trigger: h.props.ellipsis
        ? h.button
            .class('breadcrumb-docs-ellipsis-trigger')
            .attrs({
              type: 'button',
              'aria-label': 'More levels',
            })
            .children(Icon(h, { name: 'ellipsis', size: 'sm' }))
        : h.button
            .class('breadcrumb-docs-menu-trigger')
            .attrs({ type: 'button' })
            .children(
              h.props.labels[0] ?? '',
              Icon(h, { name: 'chevron-down', size: 'xs' }),
            ),
      props: {
        open: model.open,
        items: (h.props.rtl ? arMenu : enMenu).map(label => ({
          value: label,
          label,
        })),
      },
      onEmit: {
        RequestedOpen: () => MenuMessage.RequestedOpen(),
        RequestedClose: () => MenuMessage.RequestedClose(),
        Picked: ({ value }) => MenuMessage.PickedMenuItem({ value }),
        Highlighted: () => undefined,
        RequestedQuery: () => undefined,
        Settled: () => undefined,
      },
    }),
})

const manual =
  (
    items: ReadonlyArray<Item>,
    contextKey: string,
    dot = false,
    rtl = false,
  ): DocsExampleImplementation['view'] =>
  h =>
    h.nav
      .attrs({ 'aria-label': 'Breadcrumb', dir: rtl ? 'rtl' : undefined })
      .children(
        h.ol.class('breadcrumb-docs-list').children(
          items.flatMap((item, index) => [
            index === 0
              ? undefined
              : h.li
                  .attrs({ role: 'presentation', 'aria-hidden': 'true' })
                  .children(
                    dot ? Icon(h, { name: 'dot' }) : separatorView(rtl)(h),
                  ),
            h.li.class('breadcrumb-docs-item').children(
              item.kind === 'link'
                ? h.a
                    .class('breadcrumb-docs-link')
                    .attr('href', item.href)
                    .children(item.label)
                : item.kind === 'page'
                  ? h.span
                      .class('breadcrumb-docs-page')
                      .attr('aria-current', 'page')
                      .children(item.label)
                  : item.kind === 'ellipsis'
                    ? h.span
                        .attrs({ role: 'img', 'aria-label': 'More levels' })
                        .children('…')
                    : MenuDemo(h, {
                        key: `${contextKey}-menu-${index}`,
                        props: {
                          ellipsis: item.kind === 'ellipsisMenu',
                          rtl,
                          labels: item.kind === 'dropdown' ? [item.label] : [],
                        },
                      }),
            ),
          ]),
        ),
      )

const source = exampleApplicationSource({
  imports: `import { Breadcrumb } from '@/ui/effect/ui'
import './breadcrumb.css'`,
  body: `Breadcrumb(h, {
  items: [
    { kind: 'link', label: 'Home', href: '/' },
    { kind: 'page', label: 'Breadcrumb' },
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Breadcrumb } from '@/ui/effect/ui'

Breadcrumb(h, {
  items: [
    { kind: 'link', label: 'Home', href: '/' },
    { kind: 'page', label: 'Breadcrumb' },
  ],
})`,
  examples: [
    {
      title: 'Demo',
      view: (h, context) =>
        manual(
          [
            { kind: 'link', label: 'Home', href: '#' },
            { kind: 'ellipsisMenu' },
            { kind: 'link', label: 'Components', href: '#' },
            { kind: 'page', label: 'Breadcrumb' },
          ],
          context.idPrefix,
        )(h, context),
      source,
    },
    {
      title: 'Basic',
      view: simple([
        { kind: 'link', label: 'Home', href: '#' },
        { kind: 'link', label: 'Components', href: '#' },
        { kind: 'page', label: 'Breadcrumb' },
      ]),
      source,
    },
    {
      title: 'Custom separator',
      view: simple(
        [
          { kind: 'link', label: 'Home', href: '/' },
          { kind: 'link', label: 'Components', href: '/components' },
          { kind: 'page', label: 'Breadcrumb' },
        ],
        'dot',
      ),
      source,
    },
    {
      title: 'Dropdown',
      view: (h, context) =>
        manual(
          [
            { kind: 'link', label: 'Home', href: '/' },
            { kind: 'dropdown', label: 'Components' },
            { kind: 'page', label: 'Breadcrumb' },
          ],
          context.idPrefix,
          true,
        )(h, context),
      source,
    },
    {
      title: 'Collapsed',
      view: simple([
        { kind: 'link', label: 'Home', href: '/' },
        { kind: 'ellipsis' },
        { kind: 'link', label: 'Components', href: '/docs/components' },
        { kind: 'page', label: 'Breadcrumb' },
      ]),
      source,
    },
    {
      title: 'Link component',
      view: simple([
        { kind: 'link', label: 'Home', href: '/' },
        { kind: 'link', label: 'Components', href: '/components' },
        { kind: 'page', label: 'Breadcrumb' },
      ]),
      source,
    },
    {
      title: 'RTL',
      view: (h, context) =>
        manual(
          [
            { kind: 'link', label: 'الرئيسية', href: '/' },
            { kind: 'dropdown', label: 'المكونات' },
            { kind: 'page', label: 'مسار التنقل' },
          ],
          context.idPrefix,
          true,
          true,
        )(h, context),
      source,
    },
  ],
})
