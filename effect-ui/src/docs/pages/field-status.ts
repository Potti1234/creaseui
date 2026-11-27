import type { Html } from '@effect/ui/html'

import { FieldStatus } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './field-status.css'

type Item = Readonly<{
  type: 'error' | 'warning' | 'success'
  message: string
}>

const render =
  (items: ReadonlyArray<Item>): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>) =>
    h.div.class('field-status-docs-stack').children(
      items.map(item =>
        FieldStatus(h, {
          type: item.type,
          message: item.message,
          variant: 'detached',
        }),
      ),
    )

const source = exampleApplicationSource({
  imports: `import { FieldStatus } from '@/ui/effect/ui'
import './field-status.css'`,
  body: `FieldStatus(h, {
  type: 'error',
  message: 'This field is required',
  variant: 'detached',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { FieldStatus } from '@/ui/effect/ui'

FieldStatus(h, { type: 'error', message: 'This field is required' })`,
  examples: [
    {
      title: 'FieldStatus — Basic',
      view: render([
        { type: 'error', message: 'This field is required' },
        { type: 'success', message: 'Your changes have been saved' },
      ]),
      source,
    },
    {
      title: 'FieldStatus',
      view: render([
        { type: 'error', message: 'This field is required' },
        {
          type: 'warning',
          message: 'This username is already taken by another team',
        },
        { type: 'success', message: 'Your changes have been saved' },
      ]),
      source,
    },
  ],
})
