import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { Button, Collapsible, Icon } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './collapsible.css'

const trigger = <Msg>(h: Html.H<Msg>, label: string) =>
  Button(h, {
    variant: 'ghost',
    size: 'sm',
    className: 'collapsible-docs-trigger',
  }).children(label, Icon(h, { name: 'chevron-down', size: 'sm' }))

const collapsible = (
  h: Html.H<DocsMessage>,
  contextId: string,
  id: string,
  label: string,
  content: Parameters<typeof Collapsible<DocsMessage>>[1]['content'],
  defaultOpen = false,
) =>
  Collapsible<DocsMessage>(h, {
    key: `${contextId}-${id}`,
    id: `${contextId}-${id}`,
    props: { ...(defaultOpen ? { defaultOpen: true } : {}) },
    trigger: trigger(h, label),
    content,
  })

const basic: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('collapsible-docs-card')
    .children(
      collapsible(
        h,
        context.idPrefix,
        'product-details',
        'Product details',
        h.div
          .class('collapsible-docs-copy')
          .children(
            'This panel can be expanded or collapsed to reveal additional content.',
            Button(h, { size: 'sm' }).children('Learn More'),
          ),
      ),
    )

const radiusInput = <Msg>(h: Html.H<Msg>, label: string) =>
  h.input
    .class('collapsible-docs-input')
    .attrs({ value: '0', 'aria-label': label })

const settings: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('collapsible-docs-card', 'collapsible-docs-card-small')
    .children(
      h.h3.class('collapsible-docs-title').children('Radius'),
      h.p
        .class('collapsible-docs-muted')
        .children('Set the corner radius of the element.'),
      h.div
        .class('collapsible-docs-grid')
        .children(radiusInput(h, 'top radius'), radiusInput(h, 'right radius')),
      collapsible(
        h,
        context.idPrefix,
        'radius-panel',
        'More radii',
        h.div
          .class('collapsible-docs-grid')
          .children(
            radiusInput(h, 'bottom radius'),
            radiusInput(h, 'left radius'),
          ),
      ),
    )

type Node = Readonly<{ name: string; items?: ReadonlyArray<Node> }>
const treeData: ReadonlyArray<Node> = [
  {
    name: 'components',
    items: [
      {
        name: 'ui',
        items: [
          { name: 'button.ts' },
          { name: 'card.ts' },
          { name: 'dialog.ts' },
          { name: 'input.ts' },
          { name: 'select.ts' },
          { name: 'table.ts' },
        ],
      },
      { name: 'login-form.ts' },
      { name: 'register-form.ts' },
    ],
  },
  {
    name: 'lib',
    items: [{ name: 'utils.ts' }, { name: 'cn.ts' }, { name: 'api.ts' }],
  },
  {
    name: 'hooks',
    items: [
      { name: 'use-media-query.ts' },
      { name: 'use-debounce.ts' },
      { name: 'use-local-storage.ts' },
    ],
  },
  { name: 'types', items: [{ name: 'index.d.ts' }, { name: 'api.d.ts' }] },
  { name: 'public', items: [{ name: 'favicon.ico' }, { name: 'logo.svg' }] },
]

const treeNode = (
  h: Html.H<DocsMessage>,
  contextId: string,
  node: Node,
  path: string,
): View.Input<DocsMessage> =>
  node.items === undefined
    ? h.span.class('collapsible-docs-file').children(node.name)
    : Collapsible<DocsMessage>(h, {
        key: `${contextId}-${path}`,
        id: `${contextId}-${path}`,
        props: path === 'components' ? { defaultOpen: true } : {},
        trigger: Button(h, { variant: 'ghost', size: 'sm' }).children(
          Icon(h, {
            name: path === 'components' ? 'chevron-down' : 'chevron-right',
            size: 'xs',
          }),
          node.name,
        ),
        content: h.div
          .class('collapsible-docs-tree-children')
          .children(
            node.items.map(item =>
              treeNode(h, contextId, item, `${path}/${item.name}`),
            ) as never,
          ) as unknown as View.Input<DocsMessage>,
      })

const tree: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('collapsible-docs-tree')
    .children(
      treeData.map(node =>
        treeNode(h, context.idPrefix, node, node.name),
      ) as never,
    )

const rtl: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('collapsible-docs-rtl').children(
    h.div.class('collapsible-docs-order').children(
      h.h4.class('collapsible-docs-title').children('الطلب #4189'),
      Collapsible<DocsMessage>(h, {
        key: `${context.idPrefix}-order`,
        id: `${context.idPrefix}-order`,
        props: {},
        trigger: Button(h, { variant: 'ghost', size: 'icon' }).children(
          Icon(h, { name: 'chevrons-up-down', size: 'sm' }),
        ),
        content: h.div
          .class('grid gap-2')
          .children(
            h.div
              .class('collapsible-docs-box')
              .children(
                h.p.class('font-medium').children('عنوان الشحن'),
                h.p
                  .class('collapsible-docs-muted')
                  .children('شارع السوق 100، سان فرانسيسكو'),
              ),
            h.div
              .class('collapsible-docs-box')
              .children(
                h.p.class('font-medium').children('العناصر'),
                h.p
                  .class('collapsible-docs-muted')
                  .children('سماعات الاستوديو ×2'),
              ),
          ),
      }),
    ),
    h.div
      .class('collapsible-docs-box', 'collapsible-docs-between')
      .children(
        h.span.class('collapsible-docs-muted').children('الحالة'),
        h.span.class('font-medium').children('تم الشحن'),
      ),
  )

const disabled: DocsExampleImplementation['view'] = (h, context) =>
  Collapsible<DocsMessage>(h, {
    key: `${context.idPrefix}-disabled`,
    id: `${context.idPrefix}-disabled`,
    props: { disabled: true },
    trigger: Button(h, { variant: 'outline', disabled: true }).children(
      'Unavailable details',
    ),
    content: h.p
      .class('collapsible-docs-muted')
      .children('Foldkit keeps disclosure state in the application Model.'),
  })

const motion: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('collapsible-docs-card')
    .children(
      collapsible(
        h,
        context.idPrefix,
        'motion-panel',
        'Motion presence',
        h.p
          .class('collapsible-docs-muted')
          .children(
            'This panel stays mounted while its exit motion completes.',
          ),
      ),
    )

const source = exampleApplicationSource({
  imports: `import { Button, Collapsible, Icon } from '@/ui/effect/ui'
import './collapsible.css'`,
  body: `Collapsible<DocsMessage>(h, {
  key: 'details',
  props: {},
  trigger: Button(h, { variant: 'ghost' }).children('Product details'),
  content: 'Additional content',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Collapsible } from '@/ui/effect/ui'

Collapsible<DocsMessage>(h, { key: 'details', props: {}, trigger, content })`,
  examples: [
    { title: 'Demo', view: basic, source },
    { title: 'Basic', view: basic, source },
    { title: 'Settings Panel', view: settings, source },
    { title: 'File Tree', view: tree, source },
    { title: 'RTL', view: rtl, source },
    { title: 'Disabled', view: disabled, source },
    { title: 'Motion presence', view: motion, source },
  ],
})
