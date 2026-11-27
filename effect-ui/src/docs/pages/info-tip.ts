import type { Html } from '@effect/ui/html'

import { InfoTip } from '#components'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'
import './info-tip.css'

const tip = (
  h: Html.H<DocsMessage>,
  contextId: string,
  id: string,
  content: string,
  options: Readonly<{ label?: string; size?: 'xsm' | 'sm' | 'md' | 'lg' }> = {},
) =>
  InfoTip(h, {
    key: `${contextId}-${id}`,
    props: {},
    content,
    ...(options.label === undefined ? {} : { label: options.label }),
    ...(options.size === undefined ? {} : { size: options.size }),
  })

const basic: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('info-tip-docs-inline')
    .children(
      h.span.class('info-tip-docs-text').children('Access level'),
      tip(
        h,
        context.idPrefix,
        'tip-access',
        'Editors can change this field; viewers cannot.',
      ),
    )

const sizes: DocsExampleImplementation['view'] = (h, context) =>
  h.div
    .class('info-tip-docs-row')
    .children(
      tip(h, context.idPrefix, 'tip-xsm', 'Extra small tip', { size: 'xsm' }),
      tip(h, context.idPrefix, 'tip-sm', 'Small tip (default)', { size: 'sm' }),
      tip(h, context.idPrefix, 'tip-md', 'Medium tip', { size: 'md' }),
      tip(h, context.idPrefix, 'tip-lg', 'Large tip', { size: 'lg' }),
    )

const customLabel: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('info-tip-docs-inline').children(
    h.span.class('info-tip-docs-text').children('Active sessions'),
    tip(h, context.idPrefix, 'tip-metric', '30-day rolling average.', {
      label: 'About this metric',
    }),
  )

const fieldHelp: DocsExampleImplementation['view'] = (h, context) =>
  h.div.class('info-tip-docs-column').children(
    h.div.class('info-tip-docs-inline').children(
      h.label
        .class('info-tip-docs-label')
        .attrs({ for: `${context.idPrefix}-access-level` })
        .children('Access level'),
      tip(
        h,
        context.idPrefix,
        'tip-field',
        'Editors can change this field; viewers cannot.',
        { label: 'About the access level field' },
      ),
    ),
    h.input
      .class('info-tip-docs-input')
      .attrs({ id: `${context.idPrefix}-access-level`, placeholder: 'Editor' }),
  )

const source = exampleApplicationSource({
  imports: `import { InfoTip } from '@/ui/effect/ui'
import './info-tip.css'`,
  body: `InfoTip(h, {
  key: 'access-tip',
  props: {},
  content: 'Editors can change this field; viewers cannot.',
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { InfoTip } from '@/ui/effect/ui'

InfoTip(h, { key: 'tip', props: {}, content: 'Helpful details' })`,
  examples: [
    { title: 'Basic', view: basic, source },
    { title: 'Sizes', view: sizes, source },
    { title: 'Custom Label', view: customLabel, source },
    { title: 'Field Help', view: fieldHelp, source },
  ],
})
