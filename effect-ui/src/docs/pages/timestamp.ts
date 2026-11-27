import type { Html } from '@effect/ui/html'

import { Timestamp } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './timestamp.css'

type Stamp = Readonly<{
  value: string | number
  format?:
    | 'relative'
    | 'relative_short'
    | 'auto'
    | 'date'
    | 'date_long'
    | 'date_weekday'
    | 'date_time'
    | 'time'
    | 'system_date'
    | 'system_date_time'
    | 'system_time'
    | 'unix_seconds'
  type?: 'code'
  color?: 'primary' | 'secondary' | 'disabled' | 'accent'
  timezone?: boolean
  tooltipEntries?: ReadonlyArray<
    Readonly<{
      timezoneID?: string
      format?:
        | 'full'
        | 'date'
        | 'date_long'
        | 'date_weekday'
        | 'date_time'
        | 'time'
        | 'system_date'
        | 'system_date_time'
        | 'system_time'
        | 'unix_seconds'
      label?: string
    }>
  >
}>
type Section = Readonly<{
  label?: string
  direction: 'horizontal' | 'vertical'
  stamps: ReadonlyArray<Stamp>
}>

const DEMO = '2026-02-19T17:00:00Z'
const ago = (seconds: number) => Date.now() - seconds * 1000

const render =
  (sections: ReadonlyArray<Section>): DocsExampleImplementation['view'] =>
  (h: Html.H<DocsMessage>, context) => {
    let stampIndex = 0
    return h.div.class('timestamp-docs-page').children(
      sections.map(section => {
        const stamps = section.stamps.map(stamp => {
          const index = stampIndex
          stampIndex += 1
          return Timestamp(h, {
            key: `${context.idPrefix}-timestamp-${String(index)}`,
            id: `${context.idPrefix}-timestamp-${String(index)}`,
            props: {
              value: stamp.value,
              ...(stamp.format === undefined ? {} : { format: stamp.format }),
              ...(stamp.timezone === true ? { showTimeZone: true } : {}),
            },
            ...(stamp.type === undefined ? {} : { type: stamp.type }),
            ...(stamp.color === undefined ? {} : { color: stamp.color }),
            ...(stamp.tooltipEntries === undefined
              ? {}
              : { tooltipEntries: stamp.tooltipEntries }),
          })
        })
        const group = h.div
          .class(
            section.direction === 'horizontal'
              ? 'timestamp-docs-horizontal'
              : 'timestamp-docs-vertical',
          )
          .children(stamps)
        return section.label === undefined
          ? group
          : h.div
              .class('timestamp-docs-section')
              .children(
                h.span.class('timestamp-docs-label').children(section.label),
                group,
              )
      }),
    )
  }

const primary = { color: 'primary' as const }
const fixture = (sections: ReadonlyArray<Section>) => sections

const examplesData: ReadonlyArray<readonly [string, ReadonlyArray<Section>]> = [
  [
    'Timestamp',
    fixture([
      {
        direction: 'horizontal',
        stamps: [{ value: '2026-03-25T12:00:00Z', ...primary }],
      },
    ]),
  ],
  [
    'Timestamp — Auto',
    fixture([
      {
        label: 'Recent — renders as relative',
        direction: 'horizontal',
        stamps: [
          { value: ago(300), format: 'auto', ...primary },
          { value: ago(7200), format: 'auto', ...primary },
          { value: ago(86400), format: 'auto', ...primary },
        ],
      },
      {
        label: 'Older than 7 days — renders as date_time',
        direction: 'horizontal',
        stamps: [
          { value: '2025-01-15T09:30:00Z', format: 'auto', ...primary },
          { value: '2024-06-01T14:00:00Z', format: 'auto', ...primary },
        ],
      },
    ]),
  ],
  [
    'Timestamp — Colors',
    fixture([
      {
        label: 'Primary',
        direction: 'vertical',
        stamps: [{ value: DEMO, format: 'date_time', color: 'primary' }],
      },
      {
        label: 'Secondary',
        direction: 'vertical',
        stamps: [{ value: DEMO, format: 'date_time', color: 'secondary' }],
      },
      {
        label: 'Disabled',
        direction: 'vertical',
        stamps: [{ value: DEMO, format: 'date_time', color: 'disabled' }],
      },
      {
        label: 'Accent',
        direction: 'vertical',
        stamps: [{ value: DEMO, format: 'date_time', color: 'accent' }],
      },
    ]),
  ],
  [
    'Timestamp — Formats',
    fixture([
      {
        label: 'User-facing formats',
        direction: 'horizontal',
        stamps: [
          { value: DEMO, format: 'date', ...primary },
          { value: DEMO, format: 'date_long', ...primary },
          { value: DEMO, format: 'date_weekday', ...primary },
          { value: DEMO, format: 'date_time', ...primary },
          { value: DEMO, format: 'time', ...primary },
        ],
      },
      {
        label: 'System formats (logs and dev tools)',
        direction: 'horizontal',
        stamps: [
          { value: DEMO, format: 'system_date', type: 'code', ...primary },
          { value: DEMO, format: 'system_date_time', type: 'code', ...primary },
          { value: DEMO, format: 'system_time', type: 'code', ...primary },
        ],
      },
    ]),
  ],
  [
    'Timestamp — Relative',
    fixture([
      {
        label: 'Relative timestamps (hover for full date)',
        direction: 'vertical',
        stamps: [5, 120, 3600, 86400, 259200, 7776000].map(seconds => ({
          value: ago(seconds),
          format: 'relative' as const,
          ...primary,
        })),
      },
    ]),
  ],
  [
    'Timestamp — Timezone',
    fixture([
      {
        label: 'User-facing with timezone',
        direction: 'horizontal',
        stamps: [
          { value: DEMO, format: 'date_time', timezone: true, ...primary },
          { value: DEMO, format: 'time', timezone: true, ...primary },
        ],
      },
      {
        label:
          'System formats stay machine-readable — never suffixed with a zone',
        direction: 'horizontal',
        stamps: [
          { value: DEMO, format: 'system_date_time', type: 'code', ...primary },
          { value: DEMO, format: 'system_time', type: 'code', ...primary },
        ],
      },
    ]),
  ],
  [
    'Timestamp — Tooltip time zones',
    fixture([
      {
        label: 'Local + UTC — hover to compare',
        direction: 'vertical',
        stamps: [
          {
            value: DEMO,
            format: 'relative',
            ...primary,
            tooltipEntries: [
              { format: 'date_time', label: 'Local' },
              { timezoneID: 'UTC', format: 'date_time', label: 'UTC' },
            ],
          },
        ],
      },
      {
        label: 'Incident origin zone alongside the reader’s',
        direction: 'vertical',
        stamps: [
          {
            value: DEMO,
            format: 'date_time',
            ...primary,
            tooltipEntries: [
              { format: 'date_time', label: 'Local' },
              {
                timezoneID: 'America/Los_Angeles',
                format: 'date_time',
                label: 'Origin',
              },
            ],
          },
        ],
      },
      {
        label: 'Friendly line plus a machine-precise line',
        direction: 'vertical',
        stamps: [
          {
            value: DEMO,
            format: 'date_time',
            ...primary,
            tooltipEntries: [
              { format: 'full' },
              { format: 'system_date_time', label: 'ISO' },
            ],
          },
        ],
      },
    ]),
  ],
]

const source = exampleApplicationSource({
  imports: `import { Timestamp } from '@/ui/effect/ui'
import './timestamp.css'`,
  body: `Timestamp(h, {
  key: 'created-at',
  id: 'created-at',
  props: { value: '2026-02-19T17:00:00Z', format: 'date_time' },
  color: 'primary',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Timestamp } from '@/ui/effect/ui'

Timestamp(h, { key: 'time', id: 'time', props: { value: Date.now() } })`,
  examples: examplesData.map(([title, sections]) => ({
    title,
    view: render(sections),
    source,
  })),
})
