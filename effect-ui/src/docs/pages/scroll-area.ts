import type { Html } from '@effect/ui/html'

import { ScrollArea, Separator } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './scroll-area.css'

const tags = Array.from(
  { length: 50 },
  (_, index) => `v1.2.0-beta.${String(50 - index)}`,
)
const items = Array.from(
  { length: 8 },
  (_, index) => `Component ${String(index + 1)}`,
)

const tagsView =
  (rtl: boolean, heading: string): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    ScrollArea(h, {
      key: `${context.idPrefix}-scroll-tags`,
      props: {},
      orientation: 'vertical',
      ariaLabel: 'Version tags',
      direction: rtl ? 'rtl' : 'ltr',
      className: 'scroll-area-docs-tags',
      children: [
        h.div.class('scroll-area-docs-tags-content').children(
          h.h4.class('scroll-area-docs-heading').children(heading),
          tags.map(tag =>
            h.div.children(
              h.div.class('scroll-area-docs-tag').children(tag),
              Separator(h, { className: 'my-2' }),
            ),
          ),
        ),
      ],
    })

const horizontal: DocsExampleImplementation['view'] = (h, context) =>
  ScrollArea(h, {
    key: `${context.idPrefix}-scroll-horizontal`,
    props: {},
    orientation: 'horizontal',
    ariaLabel: 'Component versions',
    className: 'scroll-area-docs-horizontal',
    children: [
      h.div
        .class('scroll-area-docs-horizontal-content')
        .children(
          items.map(item =>
            h.span.class('scroll-area-docs-pill').children(item),
          ),
        ),
    ],
  })

const source = exampleApplicationSource({
  imports: `import { ScrollArea, Separator } from '@/ui/effect/ui'
import './scroll-area.css'`,
  body: `ScrollArea(h, {
  key: 'tags',
  props: {},
  orientation: 'vertical',
  ariaLabel: 'Version tags',
  children: [],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ScrollArea } from '@/ui/effect/ui'

ScrollArea(h, { key: 'area', props: {}, children: [] })`,
  examples: [
    { title: 'Basic', view: tagsView(false, 'Tags'), source },
    { title: 'Horizontal', view: horizontal, source },
    { title: 'RTL', view: tagsView(true, 'العلامات'), source },
  ],
})
