import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Icon, Sidebar } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedSidebar: { open: Schema.Boolean },
})
const SidebarDemo = Html.component({
  name: 'DocsSidebarDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: Message,
}).make({
  init: () => ({ open: true }),
  update: { ChangedSidebar: ($, { open }) => $.evolve({ open }) },
  view: (h, model) => {
    const kind = h.props.kind
    const navigation = (sidebar: any) =>
      sidebar.content({
        children: [
          sidebar.group({
            children: [
              sidebar.groupLabel({ children: ['Workspace'] }),
              sidebar.menu({
                children: [
                  ['Dashboard', 'house', true],
                  ['Projects', 'folder', false],
                  ['Analytics', 'chart-bar-stacked', false],
                  ['Settings', 'settings', false],
                ].map(([label, icon, active]: any) =>
                  sidebar.item({
                    key: label,
                    children: [
                      sidebar.link({
                        label,
                        href: '#',
                        active,
                        icon: Icon(h, { name: icon, size: 'sm' }),
                      }),
                    ],
                  }),
                ),
              }),
              kind === 'nested'
                ? sidebar.item({
                    key: 'nested',
                    children: [
                      sidebar.subMenu({
                        children: ['Overview', 'Members'].map(label =>
                          sidebar.item({
                            key: label,
                            children: [
                              sidebar.link({ label, href: '#', size: 'sm' }),
                            ],
                          }),
                        ),
                      }),
                    ],
                  })
                : undefined,
              kind === 'loading'
                ? [
                    sidebar.skeleton('82%'),
                    sidebar.skeleton('64%'),
                    sidebar.skeleton('74%'),
                  ]
                : undefined,
            ],
          }),
        ],
      })
    return Sidebar(h, {
      key: `${h.props.idPrefix}-${kind}`,
      label: 'Workspace navigation',
      variant:
        kind === 'floating'
          ? 'floating'
          : kind === 'inset'
            ? 'inset'
            : 'sidebar',
      collapsible:
        kind === 'offcanvas'
          ? 'offcanvas'
          : kind === 'primitives'
            ? 'none'
            : 'icon',
      width: kind === 'right' ? '20rem' : '16rem',
      rail: kind === 'offcanvas',
      props: {
        id: `${h.props.idPrefix}-${kind}`,
        open: model.open,
        side: kind === 'right' ? 'right' : 'left',
      },
      navigation,
      children: h.div
        .class(
          'grid min-h-72 flex-1 place-items-center rounded-md border border-dashed text-sm text-muted-foreground',
        )
        .children('Main content'),
      onEmit: {
        Changed: ({ open }: any) => Message.ChangedSidebar({ open }),
        MobileChanged: ({ open }: any) => Message.ChangedSidebar({ open }),
      },
    } as any)
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    SidebarDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Icon, Sidebar } from '@/ui/effect/ui'`,
  body: `Sidebar(h, {
  props: { id: 'workspace', open: model.open },
  navigation: sidebar => sidebar.content({
    children: [sidebar.menu({ children: [sidebar.item({ children: [sidebar.link({ label: 'Dashboard', href: '/' })] })] })],
  }),
  children: MainContent(h),
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Sidebar } from '@/ui/effect/ui'\n\nSidebar(h, { props: { id, open }, navigation, children, onEmit })`,
  examples: [
    { title: 'Application shell', view: view('application'), source },
    { title: 'Floating sidebar', view: view('floating'), source },
    { title: 'Inset sidebar', view: view('inset'), source },
    { title: 'Off-canvas collapse', view: view('offcanvas'), source },
    { title: 'Menu primitives', view: view('primitives'), source },
    { title: 'Nested navigation', view: view('nested'), source },
    { title: 'Loading navigation', view: view('loading'), source },
    { title: 'Right side and custom width', view: view('right'), source },
  ],
})
