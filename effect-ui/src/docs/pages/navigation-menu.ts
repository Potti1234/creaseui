import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { NavigationMenu } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type Layout = 'inline' | 'scroll' | 'responsive'
const labelsFor = (rtl: boolean) =>
  rtl
    ? [
        'Home',
        'Products',
        'Solutions',
        'Customers',
        'Resources',
        'Company',
        'Docs',
      ]
    : ['Home', 'Components', 'Docs']

const navigation = (
  h: Html.H<any>,
  key: string,
  activeRoute: string,
  layout: Layout,
  direction: 'ltr' | 'rtl',
  labels: readonly string[],
) =>
  NavigationMenu(h, {
    key,
    label: 'Primary',
    layout,
    direction,
    entries: labels.map(label => ({
      key: label,
      label,
      href: '#',
      active: activeRoute === label.toLowerCase(),
    })),
  })

const Message = UiSchema.TaggedEnum({
  ChangedRoute: { route: Schema.Literals(['home', 'docs']) },
})
const SemanticDemo = Html.component({
  name: 'DocsNavigationMenuSemanticDemo',
  props: Schema.Struct({ idPrefix: Schema.String }),
  model: Schema.Struct({ route: Schema.Literals(['home', 'docs']) }),
  message: Message,
}).make({
  init: () => ({ route: 'home' }),
  update: {
    ChangedRoute: ($, { route }) => $.evolve({ route }),
  },
  view: (h, model) =>
    h.div.class('grid gap-3').children(
      navigation(
        h,
        `${h.props.idPrefix}-semantic`,
        model.route,
        'inline',
        'ltr',
        ['Home', 'Components', 'Docs'],
      ),
      h.button
        .class('w-fit rounded border px-3 py-1 text-sm')
        .attr('type', 'button')
        .on(
          'click',
          Message.ChangedRoute({
            route: model.route === 'home' ? 'docs' : 'home',
          }),
        )
        .children('Reflect external route'),
    ),
})

const disclosureContent = (h: Html.H<any>) =>
  h.ul
    .class('grid gap-1')
    .children(
      ['Analytics', 'Reports'].map(label =>
        h.li
          .key(label)
          .children(
            h.a
              .class('block rounded p-2 hover:bg-accent')
              .attr('href', '#')
              .children(label),
          ),
      ),
    )

const view =
  (
    kind: 'semantic' | 'disclosure' | 'responsive' | 'rtl',
  ): DocsExampleImplementation['view'] =>
  (h, context) => {
    const key = `${context.idPrefix}-${kind}`
    if (kind === 'semantic')
      return SemanticDemo(h, {
        key,
        props: { idPrefix: key },
      }) as never
    if (kind === 'disclosure')
      return NavigationMenu(h, {
        key,
        label: 'Primary',
        entries: [
          { key: 'home', label: 'Home', href: '#', active: true },
          {
            key: 'products',
            label: 'Products',
            children: disclosureContent(h),
          },
        ],
      }) as never
    const rtl = kind === 'rtl'
    return navigation(
      h,
      key,
      'home',
      rtl ? 'scroll' : 'responsive',
      rtl ? 'rtl' : 'ltr',
      labelsFor(rtl),
    ) as never
  }

const source = exampleApplicationSource({
  imports: `import { NavigationMenu } from '@/ui/effect/ui'`,
  body: `NavigationMenu(h, {
  key: 'primary',
  label: 'Primary',
  entries: [
    { key: 'home', label: 'Home', href: '/', active: true },
    { key: 'components', label: 'Components', href: '/components' },
    { key: 'docs', label: 'Docs', href: '/docs' },
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { NavigationMenu } from '@/ui/effect/ui'\n\nNavigationMenu(h, { key, label, entries })`,
  examples: [
    { title: 'Semantic links', view: view('semantic'), source },
    { title: 'Popover disclosure', view: view('disclosure'), source },
    { title: 'Responsive fallback', view: view('responsive'), source },
    { title: 'RTL', view: view('rtl'), source },
  ],
})
