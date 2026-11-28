import type { Html } from '@effect/ui/html'

import { CircularProgress } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './circular-progress.css'

type Item = Readonly<{
  value?: number | null
  max?: number
  variant?: 'accent' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showValue?: boolean
  customFormat?: boolean
  disabled?: boolean
}>

const render =
  (
    items: ReadonlyArray<Item>,
    row: boolean,
  ): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) =>
    h.div
      .class(
        row ? 'circular-progress-docs-row' : 'circular-progress-docs-single',
      )
      .children(
        items.map((item, index) =>
          CircularProgress(h, {
            key: `${context.idPrefix}-progress-${index}`,
            value: item.value ?? 0,
            ...(item.max === undefined ? {} : { max: item.max }),
            label: item.label ?? 'Progress',
            ...(item.variant === undefined ? {} : { variant: item.variant }),
            ...(item.size === undefined ? {} : { size: item.size }),
            ...(item.showValue === true ? { showValue: true } : {}),
            ...(item.customFormat === true
              ? { formatValue: (value, max) => `${value}/${max}` }
              : {}),
            ...(item.disabled === true ? { disabled: true } : {}),
          }),
        ),
      )

const source = exampleApplicationSource({
  imports: `import { CircularProgress } from '@/ui/effect/ui'
import './circular-progress.css'`,
  body: `CircularProgress(h, {
  key: 'progress',
  value: 60,
  label: 'Progress',
  showValue: true,
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { CircularProgress } from '@/ui/effect/ui'

CircularProgress(h, { key: 'progress', value: 60, label: 'Progress' })`,
  examples: [
    {
      title: 'Circular Progress',
      view: render([{ value: 60 }], false),
      source,
    },
    {
      title: 'Circular Progress — Value Label',
      view: render(
        [
          { value: 75, size: 'lg', showValue: true },
          { value: 3, max: 5, size: 'lg', showValue: true, customFormat: true },
        ],
        true,
      ),
      source,
    },
    {
      title: 'Circular Progress — Variants',
      view: render(
        [
          { value: 60, variant: 'accent' },
          { value: 80, variant: 'success' },
          { value: 50, variant: 'warning' },
          { value: 92, variant: 'error' },
          { value: 35, variant: 'neutral' },
        ],
        true,
      ),
      source,
    },
    {
      title: 'Circular Progress — Sizes',
      view: render(
        [
          { value: 60, size: 'sm' },
          { value: 60, size: 'md' },
          { value: 60, size: 'lg' },
        ],
        true,
      ),
      source,
    },
    {
      title: 'Circular Progress — Indeterminate',
      view: render([{ value: null }], false),
      source,
    },
    {
      title: 'Circular Progress — Disabled',
      view: render(
        [
          { value: 60, disabled: true },
          { value: null, disabled: true },
        ],
        true,
      ),
      source,
    },
    {
      title: 'Circular Progress — Empty And Full',
      view: render(
        [{ value: 0 }, { value: 100, variant: 'success', label: 'Complete' }],
        true,
      ),
      source,
    },
  ],
})
