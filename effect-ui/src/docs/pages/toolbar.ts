import { Html } from '@effect/ui/html'

import { Button, Icon, Input, Toolbar } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

const values = ['back', 'forward', 'reload', 'share']
const shell = (width: number, child: unknown) => child
const toolbar = (
  h: Html.H<DocsMessage>,
  key: string,
  kind: string,
  size: 'sm' | 'md' | 'lg' = 'md',
) =>
  Toolbar(h, {
    key,
    label: `${kind} toolbar`,
    props: { items: values.map(value => ({ value })) },
    size,
    variant:
      kind === 'bulk'
        ? 'muted'
        : kind === 'card' || kind === 'filter'
          ? 'surface'
          : 'transparent',
    dividers: kind === 'three' ? ['bottom'] : [],
    startContent: bar => {
      const button = (
        value: string,
        child: unknown,
        variant: 'ghost' | 'outline' | 'default' = 'ghost',
      ) =>
        Button(h, {
          element: bar.button({ value, element: h.button }),
          variant,
          size: size === 'lg' ? 'default' : 'sm',
        }).children(child as never)
      if (kind === 'card')
        return h.span
          .class('text-sm font-semibold')
          .children('Project activity')
      if (kind === 'tabs')
        return h.div
          .class('flex items-center gap-1')
          .children(
            ['Overview', 'Runs', 'Settings'].map((label, index) =>
              h.button
                .class(
                  index === 0
                    ? 'rounded-md bg-background px-3 py-1.5 text-sm font-medium shadow-xs'
                    : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground',
                )
                .children(label),
            ),
          )
      if (kind === 'bulk')
        return h.span.class('px-1 text-sm font-medium').children('3 selected')
      if (kind === 'filter')
        return Input(h, {
          id: `${key}-search`,
          element: h.input
            .class('h-8 w-48 rounded-md border bg-background px-3 text-sm')
            .attr('placeholder', 'Search jobs…'),
          props: { value: '' },
          onUpdate: () => undefined,
        })
      return [
        button('back', Icon(h, { name: 'arrow-left', size: 'sm' })),
        button('forward', Icon(h, { name: 'arrow-right', size: 'sm' })),
        button('reload', Icon(h, { name: 'rotate-cw', size: 'sm' })),
      ]
    },
    ...(kind === 'three'
      ? {
          centerContent: () =>
            h.span.class('text-sm font-medium').children('Document'),
        }
      : {}),
    endContent: bar => {
      const action = (
        label: string,
        variant: 'outline' | 'default' | 'ghost' = 'outline',
      ) =>
        Button(h, {
          element: bar.button({ value: 'share', element: h.button }),
          variant,
          size: size === 'lg' ? 'default' : 'sm',
        }).children(label)
      if (kind === 'card')
        return [
          Button(h, {
            element: bar.button({ value: 'back', element: h.button }),
            variant: 'ghost',
            size: 'icon-sm',
          }).children(Icon(h, { name: 'ellipsis', size: 'sm' })),
          Button(h, {
            element: bar.button({ value: 'forward', element: h.button }),
            variant: 'ghost',
            size: 'icon-sm',
          }).children(Icon(h, { name: 'share', size: 'sm' })),
        ]
      if (kind === 'tabs') return action('New run', 'default')
      if (kind === 'bulk')
        return [
          Button(h, {
            element: bar.button({ value: 'back', element: h.button }),
            variant: 'outline',
            size: 'sm',
          }).children('Archive'),
          Button(h, {
            element: bar.button({ value: 'forward', element: h.button }),
            variant: 'ghost',
            size: 'sm',
          }).children('Delete'),
        ]
      if (kind === 'filter')
        return h.div
          .class('flex items-center gap-2 text-sm text-muted-foreground')
          .children(
            h.span.children('5 results'),
            Button(h, {
              element: bar.button({ value: 'share', element: h.button }),
              variant: 'ghost',
              size: 'sm',
            }).children('Clear all'),
          )
      return action(kind === 'three' ? 'Share' : 'Action', 'default')
    },
  })
const fixture = (h: Html.H<DocsMessage>, key: string, kind: string) => {
  if (kind === 'sizes')
    return h.div
      .class('grid w-full max-w-lg gap-4')
      .children(
        (['sm', 'md', 'lg'] as const).map(size =>
          toolbar(h, `${key}-${size}`, 'basic', size),
        ),
      )
  const width =
    { three: 600, card: 500, tabs: 600, bulk: 640, filter: 760 }[kind] ?? 600
  const body = toolbar(h, key, kind)
  if (kind === 'filter')
    return h.div
      .class('w-full max-w-190 overflow-hidden rounded-lg border')
      .children(
        body,
        h.div
          .class('grid grid-cols-4 gap-2 border-t p-3 text-sm')
          .children(
            ['SJ-2136', 'VAV zones not cooling', 'In progress', 'High'].map(
              text => h.span.children(text),
            ),
          ),
      )
  return h.div
    .class('w-full')
    .style({ maxWidth: `${width}px` })
    .children(body)
}
const view =
  (kind: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    fixture(h, `${context.idPrefix}-${kind}`, kind) as never
const source = exampleApplicationSource({
  imports: `import { Button, Toolbar } from '@/ui/effect/ui'`,
  body: `Toolbar(h, {
  label: 'Document actions',
  props: { items },
  startContent: toolbar => [Button(h, { element: toolbar.button({ value: 'back', element: h.button }) })],
  endContent: toolbar => shareButton,
})`,
})
export const componentDocs = defineComponentDocs({
  usage: `import { Toolbar } from '@/ui/effect/ui'\n\nToolbar(h, { label, props: { items }, startContent, endContent })`,
  examples: [
    { title: 'Toolbar — Three Slot', view: view('three'), source },
    { title: 'Toolbar — Card Header', view: view('card'), source },
    { title: 'Toolbar — Sizes', view: view('sizes'), source },
    { title: 'Toolbar — Tab Navigation', view: view('tabs'), source },
    { title: 'Toolbar — Bulk Actions', view: view('bulk'), source },
    { title: 'Toolbar — Table Filter', view: view('filter'), source },
  ],
})
