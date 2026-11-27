import type { Html } from '@effect/ui/html'

import { ResizableGroup } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './resizable.css'

const panel = <Msg>(h: Html.H<Msg>, label: string) =>
  h.div
    .class('resizable-docs-panel')
    .children(h.span.class('resizable-docs-label').children(label))

const single =
  (
    orientation: 'horizontal' | 'vertical',
    first: string,
    second: string,
    label: string,
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    ResizableGroup(h, {
      key: `${context.idPrefix}-${orientation}`,
      id: `${context.idPrefix}-${orientation}`,
      orientation,
      withHandle: true,
      label,
      props: { defaultSizes: [25, 75] },
      panels: [
        { key: 'first', label: first, content: panel(h, first) },
        { key: 'second', label: second, content: panel(h, second) },
      ],
      className: `resizable-docs-group ${orientation === 'vertical' ? 'resizable-docs-group-tall' : ''}`,
    })

const nested =
  (
    rtl: boolean,
    first: string,
    second: string,
    third: string,
  ): DocsExampleImplementation['view'] =>
  (h, context) =>
    h.div
      .attrs({ dir: rtl ? 'rtl' : undefined })
      .class('w-full flex justify-center')
      .children(
        ResizableGroup(h, {
          key: `${context.idPrefix}-nested-outer`,
          id: `${context.idPrefix}-nested-outer`,
          withHandle: true,
          label: 'Resize nested panels',
          direction: rtl ? 'rtl' : 'ltr',
          panels: [
            { key: 'first', label: first, content: panel(h, first) },
            {
              key: 'nested',
              label: 'Nested panels',
              content: ResizableGroup(h, {
                key: `${context.idPrefix}-nested-inner`,
                id: `${context.idPrefix}-nested-inner`,
                orientation: 'vertical',
                withHandle: true,
                direction: rtl ? 'rtl' : 'ltr',
                label: 'Resize vertical panels',
                panels: [
                  { key: 'second', label: second, content: panel(h, second) },
                  { key: 'third', label: third, content: panel(h, third) },
                ],
              }),
            },
          ],
          className: 'resizable-docs-group',
        }),
      )

const source = exampleApplicationSource({
  imports: `import { ResizableGroup } from '@/ui/effect/ui'
import './resizable.css'`,
  body: `ResizableGroup(h, {
  key: 'panels',
  id: 'panels',
  panels: [
    { key: 'one', content: 'One' },
    { key: 'two', content: 'Two' },
  ],
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { ResizableGroup } from '@/ui/effect/ui'

ResizableGroup(h, { key: 'panels', id: 'panels', panels })`,
  examples: [
    { title: 'Basic', view: nested(false, 'One', 'Two', 'Three'), source },
    {
      title: 'Vertical',
      view: single(
        'vertical',
        'Header',
        'Content',
        'Resize header and content',
      ),
      source,
    },
    {
      title: 'Handle',
      view: single(
        'horizontal',
        'Sidebar',
        'Content',
        'Resize sidebar and content',
      ),
      source,
    },
    { title: 'RTL', view: nested(true, 'واحد', 'اثنان', 'ثلاثة'), source },
  ],
})
