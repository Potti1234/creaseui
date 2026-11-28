import type { View } from '@effect/ui'
import type { Html } from '@effect/ui/html'

import { Badge, Icon, TreeList } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Item = {
  readonly id: string
  readonly label: string
  readonly startIcon?: string
  readonly endIcon?: string
  readonly endBadge?: string
  readonly href?: string
  readonly onSelect?: boolean
  readonly selected?: boolean
  readonly expanded?: boolean
  readonly children?: readonly Item[]
}
const showcase: readonly Item[] = [
  {
    id: 'src',
    label: 'src',
    expanded: true,
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.ts', onSelect: true },
          { id: 'card', label: 'Card.ts', onSelect: true },
          { id: 'list', label: 'List.ts', onSelect: true },
        ],
      },
      { id: 'app', label: 'App.ts', onSelect: true },
      { id: 'index', label: 'index.ts', onSelect: true },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon', label: 'favicon.ico', onSelect: true },
      { id: 'index-html', label: 'index.html', onSelect: true },
    ],
  },
  { id: 'pkg', label: 'package.json', onSelect: true },
  { id: 'readme', label: 'README.md', onSelect: true },
  { id: 'ecole', label: 'École notes.md', onSelect: true },
  { id: 'llama', label: 'Llama.md', onSelect: true },
]
const fixtures: Record<string, readonly Item[]> = {
  basic: showcase,
  icons: [
    {
      id: 'src',
      label: 'src',
      expanded: true,
      startIcon: 'folder',
      children: [
        { id: 'app', label: 'App.ts', onSelect: true, startIcon: 'file' },
        { id: 'index', label: 'index.ts', onSelect: true, startIcon: 'file' },
      ],
    },
    { id: 'pkg', label: 'package.json', onSelect: true, startIcon: 'file' },
  ],
  settings: [
    {
      id: 'settings',
      label: 'Settings',
      expanded: true,
      startIcon: 'settings',
      children: [
        { id: 'general', label: 'General', onSelect: true },
        { id: 'advanced', label: 'Advanced', onSelect: true },
      ],
    },
    { id: 'docs', label: 'Documentation', href: '#', endIcon: 'chevron-right' },
  ],
  mailbox: [
    {
      id: 'inbox',
      label: 'Inbox',
      expanded: true,
      endBadge: '3',
      children: [
        { id: 'unread', label: 'Unread', onSelect: true, endBadge: '3' },
        { id: 'starred', label: 'Starred', onSelect: true },
      ],
    },
    { id: 'sent', label: 'Sent', onSelect: true },
    { id: 'drafts', label: 'Drafts', onSelect: true, endBadge: '1' },
  ],
  navigation: [
    {
      id: 'nav',
      label: 'Navigation',
      expanded: true,
      children: [
        { id: 'home', label: 'Home', onSelect: true },
        { id: 'about', label: 'About', onSelect: true, selected: true },
        { id: 'contact', label: 'Contact', onSelect: true },
      ],
    },
  ],
  variants: [
    {
      id: 'src',
      label: 'src',
      expanded: true,
      children: [
        {
          id: 'components',
          label: 'components',
          expanded: true,
          children: [
            { id: 'button', label: 'Button.ts', onSelect: true },
            { id: 'card', label: 'Card.ts', onSelect: true },
          ],
        },
        { id: 'app', label: 'App.ts', onSelect: true },
      ],
    },
    { id: 'readme', label: 'README.md', onSelect: true },
  ],
}

const decorate = (
  h: Html.H<DocsMessage>,
  items: readonly Item[],
): readonly View.Input<DocsMessage>[] =>
  items.map(item => ({
    id: item.id,
    label: item.label,
    ...(item.href === undefined ? {} : { href: item.href }),
    ...(item.onSelect === true ? { onSelect: true } : {}),
    ...(item.selected === true ? { isSelected: true } : {}),
    ...(item.expanded === true ? { isExpanded: true } : {}),
    ...(item.startIcon === undefined
      ? {}
      : {
          startContent: Icon(h, {
            name: item.startIcon as never,
            size: 'sm',
          }),
        }),
    ...(item.endIcon !== undefined
      ? {
          endContent: Icon(h, { name: item.endIcon as never, size: 'sm' }),
        }
      : item.endBadge !== undefined
        ? { endContent: Badge(h, {}).children(item.endBadge) }
        : {}),
    ...(item.children === undefined
      ? {}
      : { children: decorate(h, item.children) as never }),
  })) as never

const tree = (
  h: Html.H<DocsMessage>,
  key: string,
  items: readonly Item[],
  ariaLabel: string,
  variant: 'lineGuides' | 'noGuides' = 'lineGuides',
  reorderable = false,
) =>
  TreeList(h, {
    key,
    ariaLabel,
    variant,
    props: {
      id: key,
      items: decorate(h, items) as never,
      ...(reorderable ? { reorderable: true } : {}),
    },
    onEmit: {
      Selected: () => undefined,
      Expanded: () => undefined,
      Reordered: () => undefined,
    },
  }) as never

const basic: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('w-full max-w-xl')
    .children(
      tree(
        h,
        `${context.idPrefix}-tree`,
        fixtures.basic ?? [],
        'Project files',
        'lineGuides',
        true,
      ),
    )
const simple =
  (kind: string, aria: string): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div
      .class('w-full max-w-xl')
      .children(tree(h, `${context.idPrefix}-tree`, fixtures[kind] ?? [], aria))
const variants: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('flex items-start gap-6').children(
    (
      [
        ['lineGuides', 'lineGuides (default)'],
        ['noGuides', 'noGuides'],
      ] as const
    ).map(([variant, caption], index) =>
      h.div
        .class('flex flex-col gap-2')
        .children(
          h.div
            .class('text-xs font-semibold text-muted-foreground')
            .children(caption),
          tree(
            h,
            `${context.idPrefix}-${variant}-${String(index)}`,
            fixtures.variants ?? [],
            caption,
            variant,
          ),
        ),
    ),
  )

const source = exampleApplicationSource({
  imports: `import { TreeList } from '@/ui/effect/ui'`,
  body: `TreeList(h, {
  key: 'project-files',
  ariaLabel: 'Project files',
  variant: 'lineGuides',
  props: { id: 'project-files', items, reorderable: true },
  onEmit,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { TreeList } from '@/ui/effect/ui'\n\nTreeList(h, { key, ariaLabel, props: { id, items }, onEmit })`,
  examples: [
    { title: 'Tree List', view: basic, source },
    {
      title: 'TreeList — File Tree With Icons',
      view: simple('icons', 'Project files'),
      source,
    },
    {
      title: 'TreeList — Interactive Settings',
      view: simple('settings', 'Settings'),
      source,
    },
    {
      title: 'TreeList — Mailbox Tree',
      view: simple('mailbox', 'Mailboxes'),
      source,
    },
    {
      title: 'TreeList — Navigation Tree',
      view: simple('navigation', 'Navigation'),
      source,
    },
    { title: 'Tree List — Variants', view: variants, source },
  ],
})
