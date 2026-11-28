import type { Html } from '@effect/ui/html'

import { Timer } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './timer.css'

const timer = (
  h: Html.H<DocsMessage>,
  key: string,
  start: number,
  format?: 'elapsed' | 'clock',
  emphasized = false,
  inherit = false,
) =>
  Timer(h, {
    key,
    props: { start, ...(format === undefined ? {} : { format }) },
    ...(inherit
      ? { type: 'inherit' as const, color: 'inherit' as const }
      : emphasized
        ? {
            type: 'body' as const,
            size: 'xl' as const,
            color: 'primary' as const,
            weight: 'semibold' as const,
          }
        : { type: 'body' as const, color: 'primary' as const }),
  })

const supporting = <Msg>(h: Html.H<Msg>, text: string) =>
  h.span.class('timer-docs-supporting').children(text)

const showcase: DocsExampleImplementation['view'] = (h, context) => {
  const start = Date.now() - 3_753_000
  return h.div
    .class('timer-docs-page')
    .children(
      h.span.class('timer-docs-large').children('Processing'),
      h.div
        .class('timer-docs-row')
        .children(
          h.div
            .class('timer-docs-column')
            .children(
              supporting(h, 'Elapsed'),
              timer(h, `${context.idPrefix}-elapsed`, start, 'elapsed', true),
            ),
          h.div
            .class('timer-docs-column')
            .children(
              supporting(h, 'Clock'),
              timer(h, `${context.idPrefix}-clock`, start, 'clock', true),
            ),
        ),
    )
}

const formats: DocsExampleImplementation['view'] = (h, context) => {
  const start = Date.now() - 3_753_000
  return h.div
    .class('timer-docs-page')
    .children(
      h.div
        .class('timer-docs-label-row')
        .children(
          supporting(h, 'Elapsed'),
          timer(h, `${context.idPrefix}-elapsed`, start),
        ),
      h.div
        .class('timer-docs-label-row')
        .children(
          supporting(h, 'Clock'),
          timer(h, `${context.idPrefix}-clock`, start, 'clock'),
        ),
    )
}

const inline: DocsExampleImplementation['view'] = (h, context) =>
  h.p
    .class('timer-docs-body')
    .children(
      'Processing for ',
      timer(h, `${context.idPrefix}-timer`, Date.now(), undefined, false, true),
    )

const typography: DocsExampleImplementation['view'] = (h, context) => {
  const start = Date.now() - 128_000
  return h.div
    .class('timer-docs-page')
    .children(
      supporting(h, 'Default'),
      Timer(h, { key: `${context.idPrefix}-default`, props: { start } }),
      supporting(h, 'Emphasized'),
      timer(h, `${context.idPrefix}-emphasized`, start, undefined, true),
    )
}

const source = exampleApplicationSource({
  imports: `import { Timer } from '@/ui/effect/ui'
import './timer.css'`,
  body: `Timer(h, {
  key: 'processing',
  props: { start: Date.now(), format: 'elapsed' },
})`,
})

const examples: ReadonlyArray<
  readonly [string, DocsExampleImplementation['view']]
> = [
  ['Timer', showcase],
  ['Timer — Formats', formats],
  ['Timer — Inline', inline],
  ['Timer — Typography', typography],
]

export const componentDocs = defineComponentDocs({
  usage: `import { Timer } from '@/ui/effect/ui'

Timer(h, { key: 'timer', props: { start: Date.now() } })`,
  examples: examples.map(([title, view]) => ({ title, view, source })),
})
