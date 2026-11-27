import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Button, Icon, MobileNav } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const Message = UiSchema.TaggedEnum({
  ChangedNavOpen: { id: Schema.String, open: Schema.Boolean },
})
const sections = {
  main: [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: 'house', selected: true },
        { label: 'Projects', icon: 'folder' },
        { label: 'Analytics', icon: 'chart-bar-stacked' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'General', icon: 'settings' },
        { label: 'Team', icon: 'users' },
      ],
    },
  ],
  settings: [
    {
      title: 'Settings',
      items: [
        { label: 'General', icon: 'settings' },
        { label: 'Team', icon: 'users' },
      ],
    },
  ],
  pages: [
    {
      title: 'Pages',
      items: [{ label: 'Home', selected: true }, { label: 'Settings' }],
    },
  ],
} as const
const MobileNavDemo = Html.component({
  name: 'DocsMobileNavDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ open: Schema.Boolean }),
  message: Message,
}).make({
  init: () => ({ open: false }),
  update: {
    ChangedNavOpen: ($, { open }) => $.evolve({ open }),
  },
  view: (h, model) => {
    const kind = h.props.kind
    const labeled = kind === 'endside' || kind === 'togglelabeled'
    const navSections =
      kind === 'endside'
        ? sections.settings
        : kind === 'toggle' || kind === 'togglebasic'
          ? sections.pages
          : sections.main
    const trigger = Button(h, {
      variant: labeled ? 'outline' : 'ghost',
      size: labeled ? 'default' : 'icon',
    }).children(
      Icon(h, {
        name: kind === 'togglelabeled' ? 'panel-left' : 'menu',
        size: 'sm',
      }) as never,
      labeled
        ? kind === 'togglelabeled'
          ? 'Open navigation'
          : 'Open settings'
        : undefined,
    )
    return h.div.class('flex items-center justify-center').children(
      MobileNav(h, {
        key: `${h.props.idPrefix}-${kind}`,
        side: kind === 'endside' ? 'end' : 'auto',
        props: { open: model.open },
        title:
          kind === 'notitle'
            ? ''
            : kind === 'endside'
              ? 'Settings'
              : 'Navigation',
        trigger,
        content: () =>
          h.div.class('flex flex-col gap-5 p-2').children(
            navSections.map(section =>
              h.div
                .key(section.title)
                .class('grid gap-1')
                .children(
                  h.div
                    .class(
                      'px-2 py-1 text-xs font-medium text-muted-foreground',
                    )
                    .children(section.title),
                  section.items.map(item =>
                    h.a
                      .key(item.label)
                      .class(
                        'selected' in item && item.selected === true
                          ? 'flex items-center gap-2 rounded-md bg-accent px-2 py-2 text-sm font-medium'
                          : 'flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground',
                      )
                      .attrs({ href: '#' })
                      .children(
                        'icon' in item
                          ? (Icon(h, { name: item.icon!, size: 'sm' }) as never)
                          : undefined,
                        item.label,
                      ),
                  ),
                ),
            ),
          ),
        onEmit: {
          RequestedOpen: () => Message.ChangedNavOpen({ id: kind, open: true }),
          RequestedClose: () =>
            Message.ChangedNavOpen({ id: kind, open: false }),
          Settled: () => undefined,
          Snapped: () => undefined,
        },
      } as any) as never,
    )
  },
})
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    MobileNavDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: context.idPrefix },
    }) as never
const source = exampleApplicationSource({
  imports: `import { Button, Icon, MobileNav } from '@/ui/effect/ui'`,
  body: `MobileNav(h, {
  key: 'navigation',
  props: { open: model.open },
  title: 'Navigation',
  trigger: Button(h, { variant: 'ghost', size: 'icon' }).children(Icon(h, { name: 'menu' })),
  content: () => NavigationSections(h),
  onEmit,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { MobileNav } from '@/ui/effect/ui'\n\nMobileNav(h, { key, props: { open }, title, trigger, content, onEmit })`,
  examples: [
    { title: 'Mobile Nav', view: view('showcase'), source },
    { title: 'MobileNav — Basic Drawer', view: view('basic'), source },
    { title: 'MobileNav — End Side Drawer', view: view('endside'), source },
    { title: 'MobileNav — Without Title', view: view('notitle'), source },
    { title: 'Mobile Nav Toggle', view: view('toggle'), source },
    { title: 'MobileNavToggle — Basic', view: view('togglelabeled'), source },
  ],
})
